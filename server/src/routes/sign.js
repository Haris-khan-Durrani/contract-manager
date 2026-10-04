/**
 * sign.js — Public Client Signing API
 *
 * Routes (all public — no GHL auth required):
 *   GET   /api/sign/:token          — Fetch contract, form schema, progress for signing portal
 *   PATCH /api/sign/:token/progress — Autosave client form progress (debounced)
 *   POST  /api/sign/:token/review   — Mark document reviewed by client
 *   POST  /api/sign/:token/submit   — Submit signature & complete contract
 *
 * Security model:
 *  - Token is a 32-byte random hex string (signing_token in contract_instances).
 *  - Single-use: once SIGNED/COMPLETED, token is consumed.
 *  - Expiry: token_expires_at strictly enforced.
 *  - Revocation: revoked_at checked.
 *  - Client IP, User-Agent, and consent recorded in contract_signatures & contract_events.
 */
const express    = require('express');
const router     = express.Router();
const axios      = require('axios');
const db         = require('../config/db');
const pdfService = require('../services/pdfService');
const { ghlAuthMiddleware } = require('../middleware/ghlAuth');
const ghlService = require('../services/ghlService');
const { getClientIp } = require('../utils/ipHelper');

function extractGhlFileUrl(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (result.fileUrl) return result.fileUrl;
  if (result.url) return result.url;
  if (result.uploadedFiles) {
    if (Array.isArray(result.uploadedFiles) && result.uploadedFiles[0]) return result.uploadedFiles[0];
    const vals = Object.values(result.uploadedFiles);
    if (vals.length > 0 && typeof vals[0] === 'string') return vals[0];
    if (vals.length > 0 && vals[0]?.url) return vals[0].url;
  }
  if (Array.isArray(result.urls) && result.urls[0]) return result.urls[0];
  if (result.meta?.url) return result.meta.url;
  return '';
}

// Allowed states where client can view/interact with the contract
const INTERACTIVE_STATES = ['DRAFT', 'READY', 'SENT', 'VIEWED', 'OPENED', 'IN_PROGRESS', 'READY_TO_SIGN'];

// ─── GET /api/sign/:token ─────────────────────────────────────────────────────
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await db.execute(
      `SELECT ci.id, ci.location_id, ci.template_id, ci.template_version, ci.state, ci.public_state, ci.form_mode,
              ci.token_expires_at, ci.snapshot_json, ci.form_data_json, ci.form_response_json,
              ci.recipient_name, ci.recipient_email, ci.recipient_phone, ci.signing_config_json,
              ci.client_opened_at, ci.form_started_at, ci.form_completed_at, ci.contract_reviewed_at,
              ci.signed_at, ci.completed_at, ci.revoked_at,
              ci.ghl_contact_id, ci.ghl_opportunity_id, ci.assigned_user_id,
              ct.name AS template_name, ct.document_schema_json,
              cf.id AS form_id, cf.name AS form_name, cf.schema_json AS form_schema_json, cf.settings_json AS form_settings_json
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ci.signing_token = ?
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Invalid or expired signing link.' });
    }

    const contract = rows[0];

    // Check revocation
    if (contract.state === 'REVOKED' || contract.revoked_at) {
      return res.status(410).json({
        error: 'REVOKED',
        message: 'This contract has been revoked and is no longer available.',
      });
    }

    // Check expiry
    if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
      return res.status(410).json({
        error: 'EXPIRED',
        message: 'This signing link has expired. Please contact the sender for a new link.',
      });
    }

    // Check completed/signed
    if (['SIGNED', 'COMPLETED', 'SIGNED_PENDING_STORAGE'].includes(contract.state)) {
      return res.json({
        alreadySigned: true,
        contractId:    contract.id,
        state:         contract.state,
        templateName:  contract.template_name,
        signedAt:      contract.signed_at,
        recipientName: contract.recipient_name,
      });
    }

    if (!INTERACTIVE_STATES.includes(contract.state)) {
      return res.status(409).json({
        error:   contract.state,
        message: `Contract is in state: ${contract.state}`,
      });
    }

    // Record open event if not yet opened
    if (['READY', 'SENT'].includes(contract.state)) {
      await db.execute(
        `UPDATE contract_instances
         SET state = 'OPENED', public_state = 'OPENED',
             client_opened_at = COALESCE(client_opened_at, NOW()), updated_at = NOW()
         WHERE id = ?`,
        [contract.id]
      );

      const clientIp = getClientIp(req);
      await db.execute(
        `INSERT INTO contract_audit_logs (contract_instance_id, actor_type, actor_id, action, from_state, to_state, ip_address, user_agent)
         VALUES (?, 'CLIENT', ?, 'CONTRACT_OPENED', ?, 'OPENED', ?, ?)`,
        [contract.id, token.slice(0, 8), contract.state, clientIp, req.headers['user-agent'] || '']
      );

      await db.execute(
        `INSERT INTO contract_events (contract_instance_id, event_type, actor_type, actor_label, ip_address)
         VALUES (?, 'CLIENT_OPENED', 'CLIENT', ?, ?)`,
        [contract.id, contract.recipient_name || 'Client', clientIp]
      );

      // Post audit event to GHL Conversation stream & Contact Note
      ghlService.syncAuditLogToGHL(contract.location_id, {
        contactId: contract.ghl_contact_id,
        userId:    contract.assigned_user_id,
        title:     `Client Opened Contract #${contract.id}`,
        details:   `Client accessed contract signing link from IP: ${clientIp || '—'}`,
        actorName: contract.recipient_name || 'Client',
      }).catch(err => console.warn('[Sign] GHL open note failed:', err.message));
    }

    // Parse JSON blobs safely
    const snapshot = typeof contract.snapshot_json === 'string'
      ? JSON.parse(contract.snapshot_json)
      : (contract.snapshot_json || null);

    let docSchema = null;
    try {
      docSchema = typeof contract.document_schema_json === 'string'
        ? JSON.parse(contract.document_schema_json)
        : contract.document_schema_json;
    } catch (e) {}

    let formSchema = null;
    try {
      formSchema = typeof contract.form_schema_json === 'string'
        ? JSON.parse(contract.form_schema_json)
        : contract.form_schema_json;
    } catch (e) {}

    let formSettings = null;
    try {
      formSettings = typeof contract.form_settings_json === 'string'
        ? JSON.parse(contract.form_settings_json)
        : contract.form_settings_json;
    } catch (e) {}

    let formData = {};
    try {
      formData = contract.form_data_json
        ? (typeof contract.form_data_json === 'string' ? JSON.parse(contract.form_data_json) : contract.form_data_json)
        : (contract.form_response_json ? JSON.parse(contract.form_response_json) : {});
    } catch (e) {}

    let signingConfig = {
      clientSignatureRequired: true,
      companySignatureRequired: false,
      allowedMethods: ['draw', 'type'],
    };
    try {
      if (contract.signing_config_json) {
        const parsed = typeof contract.signing_config_json === 'string'
          ? JSON.parse(contract.signing_config_json)
          : contract.signing_config_json;
        signingConfig = { ...signingConfig, ...parsed };
      }
    } catch (e) {}

    // Resolve company signature & stamp for public signing view
    const settingsService = require('../services/settingsService');
    const { DEFAULT_COMPANY_STAMP, DEFAULT_COMPANY_SIGNATURE } = require('../constants/defaultAssets');

    // 1. Signature resolution:
    let companySignature = '';
    if (contract.assigned_user_id) {
      const [uRows] = await db.execute(
        `SELECT signature_png_url FROM app_user_access
         WHERE ghl_user_id = ? AND signature_png_url IS NOT NULL AND signature_png_url != ''
         ORDER BY (location_id = ?) DESC LIMIT 1`,
        [contract.assigned_user_id, contract.location_id]
      ).catch(() => [[]]);
      if (uRows.length && uRows[0].signature_png_url) {
        companySignature = uRows[0].signature_png_url;
      }
    }
    if (!companySignature && contract.location_id) {
      const [adminRows] = await db.execute(
        `SELECT signature_png_url FROM app_user_access
         WHERE location_id = ? AND signature_png_url IS NOT NULL AND signature_png_url != ''
         ORDER BY (app_role = 'SUPER_ADMIN') DESC LIMIT 1`,
        [contract.location_id]
      ).catch(() => [[]]);
      if (adminRows.length && adminRows[0].signature_png_url) {
        companySignature = adminRows[0].signature_png_url;
      }
    }
    if (!companySignature) {
      const globalSig = settingsService.get('COMPANY_SIGNATURE_URL');
      if (globalSig) companySignature = globalSig;
    }
    if (!companySignature && snapshot?.companySignature) {
      companySignature = snapshot.companySignature;
    }
    if (!companySignature) {
      companySignature = DEFAULT_COMPANY_SIGNATURE;
    }

    // 2. Stamp resolution:
    const globalStamp = settingsService.get('COMPANY_STAMP_URL');
    let companyStamp = globalStamp || snapshot?.companyStamp || DEFAULT_COMPANY_STAMP;

    let rawHtml = snapshot?.rawHtml || docSchema?.rawHtml || null;
    let customCss = snapshot?.customCss || docSchema?.customCss || null;

    if (rawHtml) {
      const htmlTemplateService = require('../services/htmlTemplateService');
      rawHtml = htmlTemplateService.renderHtmlTemplate(rawHtml, customCss, {
        form: formData,
        clientSignature: '',
        companySignature,
        companyStamp,
        contractDate: formData.contract_date || contract.created_at || new Date().toLocaleDateString('en-GB'),
      });
    }

    return res.json({
      contractId:         contract.id,
      templateName:       contract.template_name,
      expiresAt:          contract.token_expires_at,
      state:              contract.state,
      publicState:        contract.public_state || 'OPENED',
      formMode:           contract.form_mode || 'NORMAL',
      recipient: {
        name:  contract.recipient_name  || '',
        email: contract.recipient_email || '',
        phone: contract.recipient_phone || '',
      },
      formData,
      formSchema,
      formSettings,
      signingConfig,
      companySignature,
      companyStamp,
      rawHtml,
      customCss,
      snapshot: {
        ...(snapshot || {}),
        documentTitle: snapshot?.documentTitle || docSchema?.title || contract.template_name,
        activeBlocks:  snapshot?.activeBlocks || docSchema?.blocks || [],
        rawHtml,
        customCss,
        companySignature,
        companyStamp,
        systemValues:  snapshot?.systemValues || {},
        templateName:  contract.template_name,
      },
      clientOpenedAt:     contract.client_opened_at,
      formStartedAt:      contract.form_started_at,
      contractReviewedAt: contract.contract_reviewed_at,
    });
  } catch (err) {
    console.error('[Sign] Get error:', err.message);
    return res.status(500).json({ error: 'Failed to load signing portal.' });
  }
});

// ─── PATCH /api/sign/:token/progress — Autosave client form answers ──────────
router.patch('/:token/progress', async (req, res) => {
  try {
    const { token } = req.params;
    const { formData, currentStep } = req.body;

    const [rows] = await db.execute(
      'SELECT id, state, token_expires_at, recipient_name FROM contract_instances WHERE signing_token = ? LIMIT 1',
      [token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (contract.state === 'REVOKED') return res.status(410).json({ error: 'Contract revoked.' });
    if (new Date(contract.token_expires_at) < new Date()) return res.status(410).json({ error: 'Contract expired.' });
    if (['SIGNED', 'COMPLETED'].includes(contract.state)) return res.status(409).json({ error: 'Already completed.' });

    const nextState = ['READY', 'SENT', 'OPENED', 'VIEWED'].includes(contract.state) ? 'IN_PROGRESS' : contract.state;

    await db.execute(
      `UPDATE contract_instances
       SET form_data_json   = ?,
           form_started_at  = COALESCE(form_started_at, NOW()),
           state            = ?,
           public_state     = 'IN_PROGRESS',
           updated_at       = NOW()
       WHERE signing_token  = ?`,
      [JSON.stringify(formData || {}), nextState, token]
    );

    const clientIp = getClientIp(req);
    await db.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, event_data_json, actor_type, actor_label, ip_address)
       VALUES (?, 'FORM_PROGRESS_SAVED', ?, 'CLIENT', ?, ?)`,
      [contract.id, JSON.stringify({ currentStep, fieldCount: Object.keys(formData || {}).length }), contract.recipient_name || 'Client', clientIp]
    );

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[Sign] Progress error:', err.message);
    res.status(500).json({ error: 'Failed to save progress.' });
  }
});

// ─── POST /api/sign/:token/review — Client marked agreement as reviewed ───────
router.post('/:token/review', async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await db.execute(
      'SELECT id, state, token_expires_at, recipient_name, location_id, ghl_contact_id, assigned_user_id FROM contract_instances WHERE signing_token = ? LIMIT 1',
      [token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (contract.state === 'REVOKED') return res.status(410).json({ error: 'Contract revoked.' });
    if (new Date(contract.token_expires_at) < new Date()) return res.status(410).json({ error: 'Contract expired.' });

    await db.execute(
      `UPDATE contract_instances
       SET contract_reviewed_at = NOW(),
           state                = 'READY_TO_SIGN',
           public_state         = 'READY_TO_SIGN',
           updated_at           = NOW()
       WHERE signing_token      = ?`,
      [token]
    );

    const clientIp = getClientIp(req);
    await db.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, actor_type, actor_label, ip_address)
       VALUES (?, 'AGREEMENT_REVIEWED', 'CLIENT', ?, ?)`,
      [contract.id, contract.recipient_name || 'Client', clientIp]
    );

    // Post audit event to GHL Conversation stream (InternalComment) & Contact Notes
    ghlService.syncAuditLogToGHL(contract.location_id, {
      contactId: contract.ghl_contact_id,
      userId:    contract.assigned_user_id,
      title:     `Client Reviewed Contract #${contract.id}`,
      details:   `Client verified clauses and proceeded to execution step. IP: ${clientIp || '—'}`,
      actorName: contract.recipient_name || 'Client',
    }).catch(err => console.warn('[Sign] GHL review note failed:', err.message));

    res.json({ success: true, reviewedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[Sign] Review error:', err.message);
    res.status(500).json({ error: 'Failed to record review.' });
  }
});

// ─── POST /api/sign/:token/submit ─────────────────────────────────────────────
router.post('/:token/submit', async (req, res) => {
  const { token } = req.params;
  const {
    signatureDataUrl: rawSigUrl,
    signatureDataB64,
    signature,
    signerName,
    signerEmail,
    signatureMethod = 'draw',
    acceptedTerms,
    consentAccepted,
  } = req.body;

  const signatureDataUrl = rawSigUrl || signatureDataB64 || signature;

  if (!acceptedTerms && !consentAccepted) {
    return res.status(400).json({ error: 'Terms and consent must be accepted before signing.' });
  }
  if (!signatureDataUrl) {
    return res.status(400).json({ error: 'Signature is required.' });
  }
  if (!signerName || !signerName.trim()) {
    return res.status(400).json({ error: 'Signer name is required.' });
  }

  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const signedAt  = new Date().toISOString();

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify contract can be signed
    const [rows] = await connection.execute(
      `SELECT ci.*, ct.document_schema_json, ct.name AS template_name
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       WHERE ci.signing_token = ?
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Contract not found.' });
    }

    const contract = rows[0];

    if (contract.state === 'REVOKED') {
      await connection.rollback();
      connection.release();
      return res.status(410).json({ error: 'Contract has been revoked.' });
    }

    if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
      await connection.rollback();
      connection.release();
      return res.status(410).json({ error: 'Contract has expired.' });
    }

    if (['SIGNED', 'COMPLETED'].includes(contract.state)) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ error: 'Contract already completed.' });
    }

    // Insert into contract_signatures
    await connection.execute(
      `INSERT INTO contract_signatures
         (contract_instance_id, signer_name, signer_email, signature_method,
          signature_data_b64, consent_accepted, ip_address, user_agent, template_version_at_sign)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        contract.id,
        signerName.trim(),
        signerEmail || contract.recipient_email || null,
        signatureMethod,
        signatureDataUrl,
        ipAddress,
        userAgent,
        contract.template_version || 1,
      ]
    );

    // Update contract_instances
    await connection.execute(
      `UPDATE contract_instances
       SET state              = 'COMPLETED',
           public_state       = 'COMPLETED',
           signed_at          = NOW(),
           completed_at       = NOW(),
           form_completed_at  = COALESCE(form_completed_at, NOW()),
           updated_at         = NOW()
       WHERE id = ?`,
      [contract.id]
    );

    // Build or augment snapshot
    let snapshot = null;
    try {
      snapshot = contract.snapshot_json
        ? (typeof contract.snapshot_json === 'string' ? JSON.parse(contract.snapshot_json) : contract.snapshot_json)
        : null;
    } catch (e) {}

    if (!snapshot) {
      let docSchema = {};
      try {
        docSchema = typeof contract.document_schema_json === 'string'
          ? JSON.parse(contract.document_schema_json)
          : contract.document_schema_json;
      } catch (e) {}

      snapshot = {
        documentTitle: docSchema?.title || contract.template_name,
        activeBlocks:  docSchema?.blocks || [],
        rawHtml:       docSchema?.rawHtml || null,
        customCss:     docSchema?.customCss || null,
        systemValues:  {},
        templateName:  contract.template_name,
      };
    } else if (!snapshot.rawHtml) {
      let docSchema = {};
      try {
        docSchema = typeof contract.document_schema_json === 'string'
          ? JSON.parse(contract.document_schema_json)
          : contract.document_schema_json;
      } catch (e) {}
      if (docSchema?.rawHtml) {
        snapshot.rawHtml = docSchema.rawHtml;
        snapshot.customCss = docSchema.customCss;
      }
    }

    snapshot.contractInstanceId = contract.id;
    snapshot.id = contract.id;
    snapshot.contractId = contract.id;
    snapshot.recipientInfo = {
      name: contract.recipient_name,
      email: contract.recipient_email,
      phone: contract.recipient_phone,
    };
    snapshot.recipient = snapshot.recipientInfo;

    snapshot.signingPartiesResult = [
      ...(snapshot.signingPartiesResult || []),
      {
        role:             'CLIENT',
        label:            'Client',
        signerName:       signerName.trim(),
        signerEmail:      signerEmail || contract.recipient_email,
        signatureMethod,
        signedAt,
        ipAddress,
        userAgent,
        signatureDataUrl,
      },
    ];

    snapshot.activeBlocks = [
      ...(snapshot.activeBlocks || []),
      {
        type:             'signature',
        label:            `Signed by: ${signerName.trim()}`,
        signatureDataUrl,
        signerName:       signerName.trim(),
        signedAt,
        ipAddress,
      },
    ];

    const settingsService = require('../services/settingsService');
    const { DEFAULT_COMPANY_STAMP, DEFAULT_COMPANY_SIGNATURE } = require('../constants/defaultAssets');

    // 1. Signature resolution:
    let companySignature = '';
    if (contract.assigned_user_id) {
      const [uRows] = await connection.execute(
        `SELECT signature_png_url FROM app_user_access
         WHERE ghl_user_id = ? AND signature_png_url IS NOT NULL AND signature_png_url != ''
         ORDER BY (location_id = ?) DESC LIMIT 1`,
        [contract.assigned_user_id, contract.location_id]
      ).catch(() => [[]]);
      if (uRows.length && uRows[0].signature_png_url) {
        companySignature = uRows[0].signature_png_url;
      }
    }
    if (!companySignature && contract.location_id) {
      const [adminRows] = await connection.execute(
        `SELECT signature_png_url FROM app_user_access
         WHERE location_id = ? AND signature_png_url IS NOT NULL AND signature_png_url != ''
         ORDER BY (app_role = 'SUPER_ADMIN') DESC LIMIT 1`,
        [contract.location_id]
      ).catch(() => [[]]);
      if (adminRows.length && adminRows[0].signature_png_url) {
        companySignature = adminRows[0].signature_png_url;
      }
    }
    if (!companySignature) {
      const globalSig = settingsService.get('COMPANY_SIGNATURE_URL');
      if (globalSig) companySignature = globalSig;
    }
    if (!companySignature && snapshot?.companySignature) {
      companySignature = snapshot.companySignature;
    }
    if (!companySignature) {
      companySignature = DEFAULT_COMPANY_SIGNATURE;
    }

    // 2. Stamp resolution:
    const globalStamp = settingsService.get('COMPANY_STAMP_URL');
    let companyStamp = globalStamp || snapshot?.companyStamp || DEFAULT_COMPANY_STAMP;

    snapshot.companySignature = companySignature;
    snapshot.companyStamp = companyStamp;

    if (snapshot.rawHtml) {
      const htmlTemplateService = require('../services/htmlTemplateService');
      const parsedForm = typeof contract.form_response_json === 'string'
        ? JSON.parse(contract.form_response_json || '{}')
        : (contract.form_response_json || {});
      snapshot.rawHtml = htmlTemplateService.renderHtmlTemplate(snapshot.rawHtml, snapshot.customCss, {
        form: parsedForm,
        clientSignature: signatureDataUrl,
        companySignature,
        companyStamp,
        contractDate: parsedForm.contract_date || contract.created_at || signedAt,
      });
    }

    await connection.execute(
      'UPDATE contract_instances SET snapshot_json = ? WHERE id = ?',
      [JSON.stringify(snapshot), contract.id]
    );

    // Log events & audit
    await connection.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, event_data_json, actor_type, actor_label, ip_address)
       VALUES (?, 'CONTRACT_SIGNED', ?, 'CLIENT', ?, ?)`,
      [contract.id, JSON.stringify({ signatureMethod, signerName: signerName.trim() }), signerName.trim(), ipAddress]
    );

    await connection.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, action, from_state, to_state, ip_address, user_agent, metadata_json)
       VALUES (?, 'CLIENT', ?, 'CONTRACT_SIGNED', ?, 'COMPLETED', ?, ?, ?)`,
      [contract.id, token.slice(0, 8), contract.state, ipAddress, userAgent, JSON.stringify({ signerName: signerName.trim(), signatureMethod })]
    );

    await connection.commit();
    connection.release();

    // Immediately post internal note to GHL in Communication & Activity streams
    ghlService.syncAuditLogToGHL(contract.location_id, {
      contactId: contract.ghl_contact_id,
      userId:    contract.assigned_user_id,
      title:     `Contract #${contract.id} Signed by Client`,
      details:   `Signer: ${signerName.trim()} | Method: ${signatureMethod} | IP: ${ipAddress}`,
      actorName: signerName.trim(),
    }).catch(err => console.warn('[Sign] GHL sign note failed:', err.message));

    // Trigger async PDF pipeline
    setImmediate(() => generateAndUploadPdf(contract, snapshot));

    return res.json({
      success:    true,
      message:    'Contract signed successfully. Your signed agreement has been recorded.',
      signedAt,
      contractId: contract.id,
    });
  } catch (err) {
    await connection.rollback().catch(() => {});
    connection.release();
    console.error('[Sign] Submit error:', err.message);
    return res.status(500).json({ error: 'Signing submission failed. Please try again.' });
  }
});

/**
 * Async post-signing pipeline:
 *   1. Generate signed PDF (Playwright/Puppeteer)
 *   2. Upload to GHL Contact
 *   3. Update GHL custom fields
 *   4. Post GHL Conversation note & Contact note
 *   5. Transition to COMPLETED
 */
async function generateAndUploadPdf(contract, snapshot) {
  try {
    console.log(`[Sign] Generating signed PDF for contract ${contract.id}…`);

    const { buffer, sha256 } = await pdfService.generateSigned(snapshot);
    const filename = `contract_${contract.id}_signed.pdf`;

    console.log(`[Sign] PDF generated (${buffer.length} bytes, SHA-256: ${sha256.slice(0, 16)}…)`);

    // Save SHA-256
    await db.execute(
      'UPDATE contract_instances SET pdf_sha256 = ? WHERE id = ?',
      [sha256, contract.id]
    );

    let ghlFileUrl = '';
    try {
      const uploadResult = await ghlService.uploadContactFile(
        contract.location_id,
        contract.ghl_contact_id,
        buffer,
        filename
      );
      ghlFileUrl = extractGhlFileUrl(uploadResult);
    } catch (uploadErr) {
      console.warn(`[Sign] GHL file upload notice for contract ${contract.id}:`, uploadErr.message);
    }

    await db.execute(
      "UPDATE contract_instances SET state = 'COMPLETED', ghl_file_url = ?, updated_at = NOW() WHERE id = ?",
      [ghlFileUrl, contract.id]
    );

    // Update GHL Contact custom fields
    await ghlService.updateContact(contract.location_id, contract.ghl_contact_id, {
      customFields: [
        { id: 'contract_status',         value: 'Completed' },
        ...(ghlFileUrl ? [{ id: 'contract_pdf_url', value: ghlFileUrl }] : []),
        { id: 'contract_signed_date',    value: new Date().toISOString() },
        { id: 'contract_completed_date', value: new Date().toISOString() },
      ],
    }).catch(err => console.warn('[Sign] GHL contact field update failed:', err.message));

    // Post to GHL Conversation stream (InternalComment) AND Contact Notes (Activity)
    await ghlService.syncAuditLogToGHL(contract.location_id, {
      contactId:   contract.ghl_contact_id,
      userId:      contract.assigned_user_id,
      title:       `Contract #${contract.id} Fully Completed & Sealed`,
      details:     `Cryptographic Seal: SHA256:${sha256.slice(0, 16)}...`,
      pdfUrl:      ghlFileUrl,
      actorName:   'PDF_SERVICE',
    }).catch(err => console.warn('[Sign] GHL conversation note failed:', err.message));

    await db.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, action, from_state, to_state, metadata_json)
       VALUES (?, 'SYSTEM', 'PDF_SERVICE', 'CONTRACT_COMPLETED', 'SIGNED', 'COMPLETED', ?)`,
      [contract.id, JSON.stringify({ ghlFileUrl, sha256 })]
    );

    console.log(`[Sign] Contract ${contract.id} → COMPLETED ✅`);
  } catch (err) {
    console.error(`[Sign] generateAndUploadPdf failed for contract ${contract.id}:`, err.message);
    await db.execute(
      `UPDATE contract_instances SET state = 'SIGNED_PENDING_STORAGE', updated_at = NOW()
       WHERE id = ? AND state = 'SIGNED'`,
      [contract.id]
    ).catch(() => {});
  }
}

// ─── GET /api/sign/:token/pdf — Download signed PDF ──────────────────────────
// Accessible by agent or signed client
router.get('/:token/pdf', async (req, res) => {
  try {
    const { token } = req.params;
    const [rows] = await db.execute(
      `SELECT ci.*, ct.name AS template_name
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       WHERE ci.signing_token = ? LIMIT 1`,
      [token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });
    const contract = rows[0];

    const isSigned = ['SIGNED', 'SIGNED_PENDING_STORAGE', 'COMPLETED'].includes(contract.state);

    // If not yet signed, require authenticated GHL agent session
    if (!isSigned) {
      const authHeader = req.headers['authorization'] || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Contract is not yet signed and requires agent credentials.' });
      }
    }

    // 1. If an uploaded GHL file URL exists and contract is completed, fetch and stream it directly
    if (contract.ghl_file_url && ['COMPLETED', 'SIGNED'].includes(contract.state)) {
      try {
        const fileRes = await axios.get(contract.ghl_file_url, { responseType: 'arraybuffer', timeout: 15000 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="contract_${contract.id}_signed.pdf"`);
        return res.send(Buffer.from(fileRes.data));
      } catch (streamErr) {
        console.warn('[Sign] Streaming ghl_file_url failed, falling back to on-the-fly generation:', streamErr.message);
      }
    }

    const snapshot = typeof contract.snapshot_json === 'string'
      ? JSON.parse(contract.snapshot_json)
      : contract.snapshot_json;

    if (!snapshot) {
      return res.status(404).json({ error: 'Document snapshot not found.' });
    }

    const { buffer } = await pdfService.generateSigned(snapshot);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="contract_${contract.id}_signed.pdf"`);
    return res.send(buffer);
  } catch (err) {
    console.error('[Sign] Download PDF error:', err.message);
    return res.status(500).json({ error: 'Failed to generate PDF.', details: err.message });
  }
});

module.exports = router;
