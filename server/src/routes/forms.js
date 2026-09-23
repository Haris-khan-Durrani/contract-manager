/**
 * forms.js — Contract Forms & Submissions API (Stage 2 Standalone Form Builder)
 *
 * Manages reusable form definitions (Normal & Team forms), sections,
 * field types, repeating person groups, advanced condition rules,
 * and independent form submission storage.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { ghlAuthMiddleware } = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission } = require('../middleware/rbac');

router.use(ghlAuthMiddleware, loadAppUser);

// ─── GET /api/forms — List all forms for location ─────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const [forms] = await db.execute(
      `SELECT cf.id, cf.name, cf.description, cf.form_mode, cf.settings_json, cf.schema_json, cf.created_by, cf.created_at, cf.updated_at,
              COUNT(DISTINCT ct.id) AS template_usage_count
       FROM contract_forms cf
       LEFT JOIN contract_templates ct ON ct.form_id = cf.id
       WHERE (cf.location_id = ?
          OR cf.location_id = 'loc_default_001'
          OR cf.location_id = 'GLOBAL'
          OR LOWER(cf.location_id) = LOWER(?))
       GROUP BY cf.id, cf.name, cf.description, cf.form_mode, cf.settings_json, cf.schema_json, cf.created_by, cf.created_at, cf.updated_at
       ORDER BY cf.id DESC`,
      [locationId, locationId]
    );

    // Deduplicate by name
    const seen = new Set();
    const modeFilter = (req.query.mode || '').toUpperCase();
    const uniqueForms = (forms || []).filter(f => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      const fm = (f.form_mode || 'NORMAL').toUpperCase();
      if (modeFilter && fm !== modeFilter) return false;
      return true;
    });

    // Get submission counts
    const formattedForms = await Promise.all(uniqueForms.map(async f => {
      let fieldCount = 0;
      let formType = 'NORMAL';
      try {
        const schema = typeof f.schema_json === 'string' ? JSON.parse(f.schema_json) : f.schema_json;
        // Prefer DB form_mode column, fall back to schema
        formType = (f.form_mode || schema?.formType || (schema?.type === 'team' ? 'TEAM' : 'NORMAL')).toUpperCase();
        fieldCount = Array.isArray(schema?.fields) ? schema.fields.length : 0;
        if (schema?.sections && Array.isArray(schema.sections)) {
          fieldCount = schema.sections.reduce((acc, sec) => acc + (sec.fields?.length || 0), 0);
        }
      } catch (e) {}

      // Parse settings_json
      let settings = {};
      try {
        settings = f.settings_json ? (typeof f.settings_json === 'string' ? JSON.parse(f.settings_json) : f.settings_json) : {};
      } catch (e) {}

      let subCount = 0;
      try {
        const [subRows] = await db.execute(
          'SELECT COUNT(*) as cnt FROM contract_form_submissions WHERE form_id = ?',
          [f.id]
        );
        subCount = subRows[0]?.cnt || 0;
      } catch (e) {}

      return {
        id: f.id,
        name: f.name,
        description: f.description,
        form_type: formType,
        form_mode: formType,
        settings,
        created_by: f.created_by,
        created_at: f.created_at,
        updated_at: f.updated_at,
        field_count: fieldCount,
        submissions_count: subCount,
        template_usage_count: f.template_usage_count || 0,
      };
    }));

    res.json({ forms: formattedForms });
  } catch (err) {
    console.error('[Forms] List error:', err.message);
    res.status(500).json({ error: 'Failed to list forms.' });
  }
});

// ─── GET /api/forms/:id — Get form schema ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM contract_forms WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Form not found.' });
    res.json({ form: rows[0] });
  } catch (err) {
    console.error('[Forms] Get error:', err.message);
    res.status(500).json({ error: 'Failed to get form.' });
  }
});

// ─── POST /api/forms — Create new form ────────────────────────────────────────
router.post('/', requirePermission('form:create'), async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const {
      name,
      description = '',
      formType = 'NORMAL',
      form_mode,
      settings_json,
      schema = { formType: 'NORMAL', sections: [], fields: [] },
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Form name is required.' });
    }

    const resolvedMode = (form_mode || formType || 'NORMAL').toUpperCase();
    const normalizedSchema = { ...schema, formType: resolvedMode };
    const settingsStr = settings_json ? JSON.stringify(settings_json) : null;

    const [result] = await db.execute(
      `INSERT INTO contract_forms (location_id, name, description, form_mode, settings_json, schema_json, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [locationId, name.trim(), description.trim(), resolvedMode, settingsStr, JSON.stringify(normalizedSchema), userId]
    );

    res.status(201).json({ formId: result.insertId, message: 'Form created successfully.' });
  } catch (err) {
    console.error('[Forms] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create form.' });
  }
});

// ─── PUT /api/forms/:id — Update form schema ──────────────────────────────────
router.put('/:id', requirePermission('form:edit'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const { name, description, schema, form_mode, settings_json } = req.body;

    const [existing] = await db.execute(
      'SELECT id FROM contract_forms WHERE id = ?',
      [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Form not found.' });

    // If schema provided, ensure formType in schema matches form_mode
    let schemaStr = schema ? JSON.stringify({ ...schema, formType: (form_mode || schema.formType || 'NORMAL').toUpperCase() }) : null;
    const settingsStr = settings_json ? JSON.stringify(settings_json) : null;
    const resolvedMode = form_mode ? form_mode.toUpperCase() : null;

    await db.execute(
      `UPDATE contract_forms
       SET name        = COALESCE(?, name),
           description = COALESCE(?, description),
           form_mode   = COALESCE(?, form_mode),
           settings_json = COALESCE(?, settings_json),
           schema_json = COALESCE(?, schema_json),
           updated_at  = NOW()
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        resolvedMode,
        settingsStr,
        schemaStr,
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Forms] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update form.' });
  }
});

// ─── POST /api/forms/:id/submit — Submit form response ────────────────────────
router.post('/:id/submit', async (req, res) => {
  try {
    const { locationId, userId } = req.ghlUser;
    const formId = req.params.id;
    const { data = {}, submittedBy = '' } = req.body;

    const [result] = await db.execute(
      `INSERT INTO contract_form_submissions (form_id, location_id, data_json, status, submitted_by)
       VALUES (?, ?, ?, 'COMPLETED', ?)`,
      [formId, locationId, JSON.stringify(data), submittedBy || userId || 'Client / User']
    );

    res.status(201).json({
      submissionId: result.insertId,
      message: 'Form response successfully recorded.',
      data,
    });
  } catch (err) {
    console.error('[Forms] Submission error:', err.message);
    res.status(500).json({ error: 'Failed to record form response.' });
  }
});

// ─── GET /api/forms/:id/submissions — Retrieve form responses ─────────────────
router.get('/:id/submissions', async (req, res) => {
  try {
    const formId = req.params.id;
    const [rows] = await db.execute(
      `SELECT id, form_id, location_id, data_json, status, submitted_by, created_at
       FROM contract_form_submissions
       WHERE form_id = ?
       ORDER BY id DESC`,
      [formId]
    );

    const submissions = (rows || []).map(r => ({
      id: r.id,
      form_id: r.form_id,
      status: r.status,
      submitted_by: r.submitted_by,
      created_at: r.created_at,
      data: typeof r.data_json === 'string' ? JSON.parse(r.data_json) : r.data_json,
    }));

    res.json({ submissions });
  } catch (err) {
    console.error('[Forms] Submissions list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch form responses.' });
  }
});

// ─── DELETE /api/forms/:id — Delete form ──────────────────────────────────────
router.delete('/:id', requirePermission('form:create'), async (req, res) => {
  try {
    const formId = req.params.id;
    await db.execute('DELETE FROM contract_form_submissions WHERE form_id = ?', [formId]);
    await db.execute('DELETE FROM contract_forms WHERE id = ?', [formId]);
    res.json({ success: true, message: 'Form deleted successfully.' });
  } catch (err) {
    console.error('[Forms] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete form.' });
  }
});

module.exports = router;
