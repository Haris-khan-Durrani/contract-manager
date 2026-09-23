/**
 * templates.js — Contract Templates API
 *
 * All routes require GHL auth + RBAC (ADMIN or SUPER_ADMIN for write operations).
 */
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { ghlAuthMiddleware } = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission } = require('../middleware/rbac');

router.use(ghlAuthMiddleware, loadAppUser);

async function ensureLocationStarterTemplates(locationId, userId = 'user_admin_001') {
  try {
    // 1. Ensure intake form exists for this location
    let [forms] = await db.execute(
      'SELECT id FROM contract_forms WHERE location_id = ? LIMIT 1',
      [locationId]
    );

    let formId = forms[0]?.id;
    if (!formId) {
      const sampleFormSchema = {
        fields: [
          {
            id: 'field_client_name',
            key: 'client_name',
            label: 'Client Full Name / اسم العميل',
            type: 'text',
            source: 'GHL_CONTACT',
            ghlFieldId: 'contact.name',
            contractVariable: 'client_name',
            required: true,
            placeholder: 'e.g. John Doe / محمد علي',
          },
          {
            id: 'field_client_email',
            key: 'client_email',
            label: 'Client Email / البريد الإلكتروني',
            type: 'text',
            source: 'GHL_CONTACT',
            ghlFieldId: 'contact.email',
            contractVariable: 'client_email',
            required: true,
            placeholder: 'e.g. client@example.com',
          },
          {
            id: 'field_company_name',
            key: 'company_name',
            label: 'Company Name / اسم الشركة',
            type: 'text',
            source: 'GHL_CONTACT',
            ghlFieldId: 'contact.companyName',
            contractVariable: 'company_name',
            required: false,
            placeholder: 'e.g. Acme Corporation',
          },
          {
            id: 'field_contract_value',
            key: 'contract_value',
            label: 'Contract Total Value ($) / قيمة العقد',
            type: 'currency',
            source: 'USER_INPUT',
            ghlFieldId: '',
            contractVariable: 'contract_value',
            required: true,
            placeholder: '5000',
          },
          {
            id: 'field_payment_terms',
            key: 'payment_terms',
            label: 'Payment Schedule / شروط الدفع',
            type: 'dropdown',
            source: 'USER_INPUT',
            ghlFieldId: '',
            contractVariable: 'payment_terms',
            required: true,
            options: [
              { label: '100% Upfront Upon Signing / دفع كامل مقدماً', value: '100% Upfront' },
              { label: '50% Deposit / 50% On Delivery / 50% دفعة أولى و50% عند التسليم', value: '50/50 Milestone' },
              { label: 'Monthly Retainer Net 15 / اشتراك شهري', value: 'Monthly Retainer' },
            ],
          },
        ],
      };

      const [formResult] = await db.execute(
        `INSERT INTO contract_forms (location_id, name, description, schema_json, created_by)
         VALUES (?, 'Standard Client Intake Form', 'Default client onboarding fields with HighLevel contact mapping.', ?, ?)`,
        [locationId, JSON.stringify(sampleFormSchema), userId]
      );
      formId = formResult.insertId;
    }

    // 2. Create Master Services Agreement template
    const sampleDocSchema = {
      title: 'Master Services Agreement / اتفاقية تقديم الخدمات الرئيسية',
      blocks: [
        {
          id: 'block_1',
          type: 'clause',
          bilingual: true,
          titleEn: '1. Parties & Engagement',
          titleAr: '١. الأطراف والتعاقد',
          contentEn: 'This Agreement is entered into between the Service Provider and {{client_name}} ("Client"), representing {{company_name}}. The Client engages Provider for dedicated services.',
          contentAr: 'تم إبرام هذه الاتفاقية بين مزود الخدمة و {{client_name}} ("العميل")، ممثلاً عن {{company_name}}. يوافق العميل على تفويض مزود الخدمة لتقديم الخدمات المتفق عليها.',
        },
        {
          id: 'block_2',
          type: 'clause',
          bilingual: true,
          titleEn: '2. Commercial Terms & Compensation',
          titleAr: '٢. الشروط التجارية والمقابل المالي',
          contentEn: 'The total compensation for the agreed services shall be {{contract_value}}, payable under the following schedule: {{payment_terms}}.',
          contentAr: 'يكون المقابل المالي الإجمالي للخدمات المتفق عليها بمبلغ {{contract_value}}، ويسدد وفقاً لجدول الدفع التالي: {{payment_terms}}.',
        },
        {
          id: 'block_3',
          type: 'clause',
          bilingual: true,
          titleEn: '3. Intellectual Property & Confidentiality',
          titleAr: '٣. الملكية الفكرية والسرية',
          contentEn: 'All work product produced specifically for Client shall be owned by Client upon receipt of full payment. Both parties agree to protect confidential information with standard commercial care.',
          contentAr: 'تؤول ملكية كافة مخرجات العمل المنجزة خصيصاً للعميل إلى العميل فور استلام كامل المستحقات. يتعهد الطرفان بحماية المعلومات السرية وفقاً للمعايير التجارية المعمول بها.',
        },
        {
          id: 'block_4',
          type: 'signature',
          label: 'Authorized Signatures / التوقيعات المعتمدة',
        },
      ],
    };

    const [tResult] = await db.execute(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, 'Bilingual Master Services Agreement (English & Arabic)', 'Master Services Agreement', 1, 1, 7, ?, '[]', '{"enabled": false}', '[]')`,
      [locationId, formId, JSON.stringify(sampleDocSchema)]
    );

    const templateId = tResult.insertId;

    await db.execute(
      `INSERT INTO contract_template_versions
         (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
       VALUES (?, 1, ?, '[]', 'Initial bilingual starter template', ?)`,
      [templateId, JSON.stringify(sampleDocSchema), userId]
    );
  } catch (err) {
    console.warn('[Templates] Could not auto-provision starter template:', err.message);
  }
}

// ─── GET /api/templates — List templates for location ────────────────────────
router.get('/', async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    let [templates] = await db.execute(
      `SELECT ct.id, ct.name, ct.contract_type, ct.current_version, ct.is_active,
              ct.validity_days, ct.created_at, ct.updated_at, ct.form_id,
              cf.name AS form_name
       FROM contract_templates ct
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ct.location_id = ? 
          OR ct.location_id = 'loc_default_001' 
          OR ct.location_id = 'GLOBAL'
          OR LOWER(ct.location_id) = LOWER(?)
       ORDER BY ct.id DESC`,
      [locationId, locationId]
    );

    // If new location has no templates, auto-provision starter template
    if (!templates || templates.length === 0) {
      await ensureLocationStarterTemplates(locationId, userId);
      [templates] = await db.execute(
        `SELECT ct.id, ct.name, ct.contract_type, ct.current_version, ct.is_active,
                ct.validity_days, ct.created_at, ct.updated_at, ct.form_id,
                cf.name AS form_name
         FROM contract_templates ct
         LEFT JOIN contract_forms cf ON cf.id = ct.form_id
         WHERE ct.location_id = ? 
            OR ct.location_id = 'loc_default_001' 
            OR ct.location_id = 'GLOBAL'
            OR LOWER(ct.location_id) = LOWER(?)
         ORDER BY ct.id DESC`,
        [locationId, locationId]
      );
    }

    // Deduplicate by template name
    const seen = new Set();
    const uniqueTemplates = (templates || []).filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });

    res.json({ templates: uniqueTemplates });
  } catch (err) {
    console.error('[Templates] List error:', err.message);
    res.status(500).json({ error: 'Failed to list templates.' });
  }
});

// ─── GET /api/templates/:id — Get full template definition ───────────────────
router.get('/:id', async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const [rows] = await db.execute(
      `SELECT ct.*, cf.name AS form_name, cf.schema_json AS form_schema
       FROM contract_templates ct
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ct.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Template not found.' });
    res.json({ template: rows[0] });
  } catch (err) {
    console.error('[Templates] Get error:', err.message);
    res.status(500).json({ error: 'Failed to get template.' });
  }
});

// ─── POST /api/templates — Create new template ───────────────────────────────
router.post('/', requirePermission('template:create'), async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const {
      name,
      contractType = 'Standard Agreement',
      validityDays = 7,
      formId = null,
      documentSchema = { blocks: [] },
      conditionalRules = [],
      creationRules = {},
      signingParties = [
        { role: 'CLIENT', label: 'Primary Client', required: true },
      ],
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required.' });
    }

    const [result] = await db.execute(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, ?, ?, 1, TRUE, ?, ?, ?, ?, ?)`,
      [
        locationId,
        formId || null,
        name.trim(),
        contractType,
        validityDays,
        JSON.stringify(documentSchema),
        JSON.stringify(conditionalRules),
        JSON.stringify(creationRules),
        JSON.stringify(signingParties),
      ]
    );

    const templateId = result.insertId;

    // Record version 1
    await db.execute(
      `INSERT INTO contract_template_versions
         (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
       VALUES (?, 1, ?, ?, 'Initial template creation', ?)`,
      [templateId, JSON.stringify(documentSchema), JSON.stringify(signingParties), userId]
    );

    res.status(201).json({ templateId, message: 'Template created successfully.' });
  } catch (err) {
    console.error('[Templates] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

// ─── POST /api/templates/import-html — Import template from raw HTML & CSS ─────
router.post('/import-html', requirePermission('template:create'), async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const {
      name,
      contractType = 'Legal Services Agreement',
      validityDays = 7,
      formId = null,
      html,
      css = '',
      logoUrl,
    } = req.body;

    if (!html || !html.trim()) {
      return res.status(400).json({ error: 'HTML content is required.' });
    }

    const htmlTemplateService = require('../services/htmlTemplateService');
    const meta = htmlTemplateService.extractTemplateMetadata(html);
    const { html: normHtml, css: normCss } = htmlTemplateService.normalizeTemplateAssets(html, css, logoUrl);

    const templateName = (name && name.trim()) || meta.title || 'Imported HTML/CSS Template';
    const docSchema = {
      type: 'HTML',
      title: templateName,
      templateCode: meta.templateCode,
      rawHtml: normHtml,
      customCss: normCss,
      pageCount: meta.pageCount,
      detectedVariables: meta.detectedVariables,
      dataFields: meta.dataFields,
      blocks: [],
    };

    const signingParties = [
      { role: 'CLIENT', label: 'Primary Applicant / Client', required: true },
    ];

    const [result] = await db.execute(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, ?, ?, 1, TRUE, ?, ?, '[]', '{}', ?)`,
      [
        locationId,
        formId || null,
        templateName,
        contractType,
        validityDays,
        JSON.stringify(docSchema),
        JSON.stringify(signingParties),
      ]
    );

    const templateId = result.insertId;

    await db.execute(
      `INSERT INTO contract_template_versions
         (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
       VALUES (?, 1, ?, ?, 'Imported from HTML/CSS', ?)`,
      [templateId, JSON.stringify(docSchema), JSON.stringify(signingParties), userId]
    );

    res.status(201).json({
      templateId,
      name: templateName,
      meta,
      message: 'HTML/CSS Template imported and created successfully.',
    });
  } catch (err) {
    console.error('[Templates] Import error:', err.message);
    res.status(500).json({ error: 'Failed to import template: ' + err.message });
  }
});

// ─── PUT /api/templates/:id — Update template ────────────────────────────────
router.put('/:id', requirePermission('template:edit'), async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const templateId = req.params.id;
    const {
      name,
      contractType,
      validityDays,
      formId,
      isActive,
      documentSchema,
      conditionalRules,
      creationRules,
      signingParties,
      incrementVersion = false,
      changeSummary = 'Updated template configuration',
    } = req.body;

    const [existing] = await db.execute(
      `SELECT id, current_version, location_id FROM contract_templates 
       WHERE id = ? AND (location_id = ? OR location_id = 'loc_default_001' OR location_id = 'GLOBAL' OR LOWER(location_id) = LOWER(?))`,
      [templateId, locationId, locationId]
    );
    if (!existing.length) return res.status(404).json({ error: 'Template not found.' });

    let newVersion = existing[0].current_version;
    if (incrementVersion) {
      newVersion += 1;
    }

    await db.execute(
      `UPDATE contract_templates
       SET name = COALESCE(?, name),
           contract_type = COALESCE(?, contract_type),
           validity_days = COALESCE(?, validity_days),
           form_id = ?,
           is_active = COALESCE(?, is_active),
           current_version = ?,
           document_schema_json = COALESCE(?, document_schema_json),
           conditional_rules_json = COALESCE(?, conditional_rules_json),
           creation_rules_json = COALESCE(?, creation_rules_json),
           signing_parties_json = COALESCE(?, signing_parties_json),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        contractType || null,
        validityDays || null,
        formId !== undefined ? formId : null,
        isActive !== undefined ? isActive : null,
        newVersion,
        documentSchema ? JSON.stringify(documentSchema) : null,
        conditionalRules ? JSON.stringify(conditionalRules) : null,
        creationRules ? JSON.stringify(creationRules) : null,
        signingParties ? JSON.stringify(signingParties) : null,
        templateId,
      ]
    );

    if (incrementVersion && documentSchema) {
      await db.execute(
        `INSERT INTO contract_template_versions
           (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          templateId,
          newVersion,
          JSON.stringify(documentSchema),
          signingParties ? JSON.stringify(signingParties) : null,
          changeSummary,
          userId,
        ]
      );
    }

    res.json({ success: true, version: newVersion });
  } catch (err) {
    console.error('[Templates] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update template: ' + err.message });
  }
});

// ─── GET /api/templates/:id/versions — Get version history ────────────────────
router.get('/:id/versions', async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const [versions] = await db.execute(
      `SELECT ctv.id, ctv.version_number, ctv.change_summary, ctv.created_by, ctv.created_at
       FROM contract_template_versions ctv
       JOIN contract_templates ct ON ct.id = ctv.template_id
       WHERE ctv.template_id = ? 
         AND (ct.location_id = ? OR ct.location_id = 'loc_default_001' OR ct.location_id = 'GLOBAL' OR LOWER(ct.location_id) = LOWER(?))
       ORDER BY ctv.version_number DESC`,
      [req.params.id, locationId, locationId]
    );

    res.json({ versions });
  } catch (err) {
    console.error('[Templates] Versions error:', err.message);
    res.status(500).json({ error: 'Failed to get template versions.' });
  }
});

// ─── POST /api/templates/:id/duplicate — Duplicate template ───────────────────
router.post('/:id/duplicate', requirePermission('template:create'), async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const [rows] = await db.execute(
      `SELECT * FROM contract_templates 
       WHERE id = ? 
         AND (location_id = ? OR location_id = 'loc_default_001' OR location_id = 'GLOBAL' OR LOWER(location_id) = LOWER(?))`,
      [req.params.id, locationId, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Template not found.' });

    const source = rows[0];
    const newName = `${source.name} (Copy)`;

    const [result] = await db.execute(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, ?, ?, 1, TRUE, ?, ?, ?, ?, ?)`,
      [
        locationId,
        source.form_id,
        newName,
        source.contract_type,
        source.validity_days,
        JSON.stringify(source.document_schema_json),
        JSON.stringify(source.conditional_rules_json),
        JSON.stringify(source.creation_rules_json),
        JSON.stringify(source.signing_parties_json),
      ]
    );

    res.status(201).json({ templateId: result.insertId, name: newName });
  } catch (err) {
    console.error('[Templates] Duplicate error:', err.message);
    res.status(500).json({ error: 'Failed to duplicate template.' });
  }
});

// ─── DELETE /api/templates/:id — Delete template ─────────────────────────────
router.delete('/:id', requirePermission('template:delete'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const [existing] = await db.execute(
      `SELECT id FROM contract_templates 
       WHERE id = ? 
         AND (location_id = ? OR location_id = 'loc_default_001' OR location_id = 'GLOBAL' OR LOWER(location_id) = LOWER(?))`,
      [req.params.id, locationId, locationId]
    );
    if (!existing.length) return res.status(404).json({ error: 'Template not found.' });

    await db.execute('DELETE FROM contract_template_versions WHERE template_id = ?', [req.params.id]);
    await db.execute('DELETE FROM contract_templates WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Template deleted successfully.' });
  } catch (err) {
    console.error('[Templates] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

module.exports = router;
