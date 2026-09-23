/**
 * contracts.js — Contract Instance Routes
 *
 * All routes require:
 *   - ghlAuthMiddleware (GHL Signed User Context)
 *   - loadAppUser (RBAC allowlist check)
 *
 * Routes:
 *   GET    /api/contracts              — List contracts (all or own, by role)
 *   GET    /api/contracts/:id          — Get contract detail
 *   POST   /api/contracts/manual       — Create contract (manual flow)
 *   PATCH  /api/contracts/:id/form     — Save form responses (debounced)
 *   POST   /api/contracts/:id/send     — Dispatch contract (freeze snapshot)
 *   PATCH  /api/contracts/:id/cancel   — Cancel contract
 *   GET    /api/contracts/:id/audit    — Audit trail for this contract
 */
const express          = require('express');
const router           = express.Router();
const { v4: uuidv4 }  = require('uuid');
const crypto           = require('crypto');
const db               = require('../config/db');
const { ghlAuthMiddleware }              = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission, hasPermission } = require('../middleware/rbac');
const ghlService       = require('../services/ghlService');
const snapshotService  = require('../services/snapshotService');
const settingsService  = require('../services/settingsService');

// Apply auth to all routes in this router
router.use(ghlAuthMiddleware, loadAppUser);

// ─── GET /api/contracts ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { role } = req.appUser;
    const { state, page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [locationId];
    let whereClause = 'WHERE ci.location_id = ?';

    const restrictToAssigned = settingsService.get('RESTRICT_CONTACTS_TO_ASSIGNED', 'true') !== 'false';
    const canViewAll = hasPermission(role, 'contract:view:all') || !restrictToAssigned;

    // SALES can only see their own contracts unless restriction is disabled or user can view all
    if (!canViewAll) {
      whereClause += ' AND ci.assigned_user_id = ?';
      params.push(userId);
    }

    if (state) {
      whereClause += ' AND ci.state = ?';
      params.push(state);
    }

    const [contracts] = await db.execute(
      `SELECT ci.id, ci.state, ci.creation_mode, ci.form_mode, ci.recipient_name, ci.recipient_email, ci.signing_token,
              ci.ghl_contact_id, ci.ghl_opportunity_id,
              ci.assigned_user_id, ci.assigned_user_name, ci.created_at, ci.updated_at, ci.token_expires_at,
              ci.signed_at, ci.ghl_file_url,
              ct.name AS template_name, ct.contract_type
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       ${whereClause}
       ORDER BY ci.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ contracts, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Contracts] List error:', err.message);
    res.status(500).json({ error: 'Failed to list contracts.' });
  }
});

// ─── GET /api/contracts/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { role } = req.appUser;

    const [rows] = await db.execute(
      `SELECT ci.*, ct.name AS template_name, ct.document_schema_json, ct.conditional_rules_json,
              cf.schema_json AS form_schema
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ci.id = ? AND ci.location_id = ?`,
      [req.params.id, locationId]
    );

    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });
    const contract = rows[0];

    // SALES can only view their own unless restriction is disabled
    const restrictToAssigned = settingsService.get('RESTRICT_CONTACTS_TO_ASSIGNED', 'true') !== 'false';
    const canViewAll = hasPermission(role, 'contract:view:all') || !restrictToAssigned;
    if (!canViewAll && contract.assigned_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this contract.' });
    }

    // Fetch live GHL data for active (non-sent) contracts
    let ghlContact = null, ghlOpportunity = null;
    if (!['SENT', 'VIEWED', 'SIGNED', 'SIGNED_PENDING_STORAGE', 'COMPLETED'].includes(contract.state)) {
      [ghlContact, ghlOpportunity] = await Promise.all([
        ghlService.getContact(locationId, contract.ghl_contact_id).catch(() => null),
        contract.ghl_opportunity_id
          ? ghlService.getOpportunity(locationId, contract.ghl_opportunity_id).catch(() => null)
          : Promise.resolve(null),
      ]);
    } else {
      // Use frozen snapshot for dispatched/signed contracts
      const snapshot = typeof contract.snapshot_json === 'string'
        ? JSON.parse(contract.snapshot_json)
        : contract.snapshot_json;
      ghlContact     = snapshot?.ghlContact     || null;
      ghlOpportunity = snapshot?.ghlOpportunity || null;
    }

    // Fetch activity events
    const [events] = await db.execute(
      'SELECT id, contract_instance_id, event_type, event_data_json, actor_type, actor_label, ip_address, created_at FROM contract_events WHERE contract_instance_id = ? ORDER BY created_at DESC LIMIT 50',
      [contract.id]
    );

    // Fetch signatures if any
    const [signatures] = await db.execute(
      'SELECT id, signer_name, signer_email, signed_at, signature_method, ip_address, user_agent, consent_accepted FROM contract_signatures WHERE contract_instance_id = ? ORDER BY signed_at ASC',
      [contract.id]
    );

    res.json({
      contract,
      ghlContact,
      ghlOpportunity,
      events: events || [],
      signatures: signatures || [],
    });
  } catch (err) {
    console.error('[Contracts] Get error:', err.message);
    res.status(500).json({ error: 'Failed to get contract.' });
  }
});

// ─── POST /api/contracts/manual ──────────────────────────────────────────────
router.post('/manual', requirePermission('contract:create'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const {
      templateId,
      ghlContactId,
      ghlOpportunityId,
      formId,
      formMode     = 'NORMAL',
      recipientName,
      recipientEmail,
      recipientPhone,
      formData     = {},
      teamMembers  = [],
      validityDays = 7,
      signingConfig,
    } = req.body;

    if (!templateId || !ghlContactId) {
      return res.status(400).json({ error: 'templateId and ghlContactId are required.' });
    }

    // Verify template belongs to this location and retrieve attached form schema
    const [templates] = await db.execute(
      `SELECT ct.id, ct.current_version, ct.name, ct.document_schema_json, ct.conditional_rules_json,
              ct.form_id, cf.schema_json AS form_schema_json
       FROM contract_templates ct
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ct.id = ? 
         AND (ct.location_id = ? OR ct.location_id = 'loc_default_001' OR ct.location_id = 'GLOBAL' OR LOWER(ct.location_id) = LOWER(?)) 
         AND ct.is_active = TRUE`,
      [templateId, locationId, locationId]
    );
    if (!templates.length) return res.status(404).json({ error: 'Template not found.' });

    const template = templates[0];

    // Combine form data and team members
    const resolvedFormData = {
      client_name: recipientName || '',
      client_email: recipientEmail || '',
      phone: recipientPhone || '',
      ...(formData || {}),
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    };

    // Generate signing token immediately on creation
    const signingToken   = crypto.randomBytes(32).toString('hex');
    const numDays        = parseInt(validityDays) || 7;
    const tokenExpiresAt = new Date(Date.now() + numDays * 24 * 60 * 60 * 1000);

    // Build immutable snapshot with all tokens resolved
    let snapshot = null;
    try {
      const formSchema = typeof template.form_schema_json === 'string'
        ? JSON.parse(template.form_schema_json)
        : (template.form_schema_json || { fields: [] });

      const templateObj = {
        id: template.id,
        name: template.name,
        current_version: template.current_version,
        document_schema_json: typeof template.document_schema_json === 'string'
          ? JSON.parse(template.document_schema_json)
          : template.document_schema_json,
        conditional_rules_json: template.conditional_rules_json,
      };

      const built = await snapshotService.buildSnapshot({
        contractInstanceId: null,
        template: templateObj,
        formSchema,
        formResponse: resolvedFormData,
        locationId,
        ghlContactId,
        ghlOpportunityId: ghlOpportunityId || null,
        assignedUserName: req.ghlUser?.name || '',
        privateToken: req.ghlUser?.privateToken,
      });
      snapshot = built.snapshot;
    } catch (sErr) {
      console.warn('[Contracts] Could not pre-build snapshot:', sErr.message);
    }

    const [result] = await db.execute(
      `INSERT INTO contract_instances
         (location_id, template_id, template_version, ghl_contact_id, ghl_opportunity_id,
          assigned_user_id, created_by_user_id, assigned_user_name, creation_mode, form_mode, state, public_state,
          recipient_name, recipient_email, recipient_phone, signing_config_json,
          signing_token, token_expires_at, form_response_json, form_data_json, snapshot_json, validity_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MANUAL', ?, 'READY', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        locationId, templateId, template.current_version, ghlContactId, ghlOpportunityId || null,
        userId, userId,
        req.ghlUser.name || '',
        formMode.toUpperCase(),
        recipientName  || null,
        recipientEmail || null,
        recipientPhone || null,
        signingConfig  ? JSON.stringify(signingConfig) : null,
        signingToken,
        tokenExpiresAt,
        JSON.stringify(resolvedFormData),
        JSON.stringify(resolvedFormData),
        snapshot ? JSON.stringify(snapshot) : null,
        numDays,
      ]
    );

    const contractInstanceId = result.insertId;

    // Audit log — creation
    await db.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, actor_name, action, to_state, metadata_json)
       VALUES (?, 'USER', ?, ?, 'CONTRACT_CREATED', 'READY', ?)`,
      [contractInstanceId, userId, req.ghlUser.name, JSON.stringify({ templateId, mode: 'MANUAL', formMode })]
    );

    // Event log
    await db.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, event_data_json, actor_type, actor_label)
       VALUES (?, 'CONTRACT_CREATED', ?, 'USER', ?)`,
      [contractInstanceId, JSON.stringify({ templateId, formMode, validityDays: numDays }), req.ghlUser.name || userId]
    );

    // Sync Contract Created event to GHL Conversation stream & Contact Notes
    ghlService.syncAuditLogToGHL(locationId, {
      contactId: ghlContactId,
      userId,
      title: `Contract #${contractInstanceId} Created (${template.name})`,
      details: `Form Mode: ${formMode} | Validity: ${numDays} days`,
      actorName: req.ghlUser?.name || 'Staff User',
      privateToken: req.ghlUser?.privateToken,
    }).catch(err => console.warn('[Contracts] GHL creation note failed:', err.message));

    const baseUrl    = settingsService.getSigningBaseUrl(req);
    const signingUrl = `${baseUrl}/sign/${signingToken}`;

    res.status(201).json({
      contractInstanceId,
      state: 'READY',
      template: template.name,
      signingUrl,
      signingToken,
      expiresAt: tokenExpiresAt,
    });
  } catch (err) {
    console.error('[Contracts] Manual create error:', err.message);
    res.status(500).json({ error: 'Failed to create contract.' });
  }
});

// ─── POST /api/contracts/:id/extend ──────────────────────────────────────────
router.post('/:id/extend', requirePermission('contract:send'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { extraDays = 7, expiresAt: customExpiry } = req.body;

    const [rows] = await db.execute(
      'SELECT id, state, signing_token, token_expires_at, ghl_contact_id FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract  = rows[0];
    if (['SIGNED', 'COMPLETED', 'REVOKED'].includes(contract.state)) {
      return res.status(409).json({ error: `Cannot extend contract in state: ${contract.state}` });
    }

    const isExpired = contract.token_expires_at && new Date(contract.token_expires_at) < new Date();

    // New token if expired, keep same token if still active
    const newToken   = isExpired ? crypto.randomBytes(32).toString('hex') : contract.signing_token;
    const numExtra   = Math.max(1, parseInt(extraDays) || 7);
    const baseDate   = customExpiry ? new Date(customExpiry) : new Date(Date.now() + numExtra * 24 * 60 * 60 * 1000);
    const newExpiry  = baseDate;

    const previousState = contract.state;
    const newState = isExpired ? 'READY' : contract.state;

    await db.execute(
      `UPDATE contract_instances
         SET signing_token = ?, token_expires_at = ?, validity_days = ?, state = ?, revoked_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      [newToken, newExpiry, numExtra, newState, contract.id]
    );

    // Sync updated expiry date to GHL contact custom fields
    if (contract.ghl_contact_id) {
      ghlService.updateContact(locationId, contract.ghl_contact_id, {
        customFields: [
          { id: 'contract_expiry_date', value: newExpiry.toISOString() },
        ],
        privateToken: req.ghlUser?.privateToken,
      }).catch(err => console.warn('[Contracts] GHL expiry sync note:', err.message));
    }

    await db.execute(
      `INSERT INTO contract_audit_logs (contract_instance_id, actor_type, actor_id, actor_name, action, from_state, to_state, metadata_json)
       VALUES (?, 'USER', ?, ?, 'EXPIRY_EXTENDED', ?, ?, ?)`,
      [contract.id, userId, req.ghlUser.name, previousState, newState, JSON.stringify({ extraDays, newExpiry, newToken: isExpired })]
    );

    await db.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, event_data_json, actor_type, actor_label)
       VALUES (?, 'EXPIRY_EXTENDED', ?, 'USER', ?)`,
      [contract.id, JSON.stringify({ extraDays, newExpiry: newExpiry.toISOString() }), req.ghlUser.name || userId]
    );

    const baseUrl    = settingsService.getSigningBaseUrl(req);
    const signingUrl = `${baseUrl}/sign/${newToken}`;

    res.json({ success: true, signingUrl, signingToken: newToken, expiresAt: newExpiry, newTokenGenerated: isExpired });
  } catch (err) {
    console.error('[Contracts] Extend error:', err.message);
    res.status(500).json({ error: 'Failed to extend contract expiry.' });
  }
});

// ─── POST /api/contracts/:id/revoke ──────────────────────────────────────────
router.post('/:id/revoke', requirePermission('contract:cancel'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;

    const [rows] = await db.execute(
      'SELECT id, state FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (['SIGNED', 'COMPLETED', 'REVOKED'].includes(contract.state)) {
      return res.status(409).json({ error: `Cannot revoke contract in state: ${contract.state}` });
    }

    const previousState = contract.state;

    await db.execute(
      `UPDATE contract_instances
         SET state = 'REVOKED', revoked_at = NOW(), signing_token = NULL, updated_at = NOW()
       WHERE id = ?`,
      [contract.id]
    );

    await db.execute(
      `INSERT INTO contract_audit_logs (contract_instance_id, actor_type, actor_id, actor_name, action, from_state, to_state)
       VALUES (?, 'USER', ?, ?, 'CONTRACT_REVOKED', ?, 'REVOKED')`,
      [contract.id, userId, req.ghlUser.name, previousState]
    );

    await db.execute(
      `INSERT INTO contract_events (contract_instance_id, event_type, actor_type, actor_label)
       VALUES (?, 'CONTRACT_REVOKED', 'USER', ?)`,
      [contract.id, req.ghlUser.name || userId]
    );

    res.json({ success: true, state: 'REVOKED' });
  } catch (err) {
    console.error('[Contracts] Revoke error:', err.message);
    res.status(500).json({ error: 'Failed to revoke contract.' });
  }
});

// ─── PATCH /api/contracts/:id/form ───────────────────────────────────────────
router.patch('/:id/form', requirePermission('contract:form:submit'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { formResponse, ghlFields } = req.body;
    // formResponse: { key: value, ... } — all form values
    // ghlFields:    { contact: {...}, opportunity: {...} } — only GHL-mapped fields

    const [rows] = await db.execute(
      'SELECT id, state, ghl_contact_id, ghl_opportunity_id, assigned_user_id FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (['SENT', 'SIGNED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(contract.state)) {
      return res.status(409).json({ error: `Cannot edit form on contract in state: ${contract.state}` });
    }

    // Save form_response_json (non-GHL values stay here)
    await db.execute(
      'UPDATE contract_instances SET form_response_json = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(formResponse), contract.id]
    );

    // Batch update GHL Contact/Opportunity fields if provided (debounced by frontend)
    if (ghlFields?.contact && Object.keys(ghlFields.contact).length) {
      ghlService.updateContact(locationId, contract.ghl_contact_id, { customFields: Object.entries(ghlFields.contact).map(([id, value]) => ({ id, value })) })
        .catch(err => console.warn('[Contracts] GHL contact update failed:', err.message));
    }
    if (ghlFields?.opportunity && contract.ghl_opportunity_id && Object.keys(ghlFields.opportunity).length) {
      ghlService.updateOpportunity(locationId, contract.ghl_opportunity_id, { customFields: Object.entries(ghlFields.opportunity).map(([id, value]) => ({ id, value })) })
        .catch(err => console.warn('[Contracts] GHL opportunity update failed:', err.message));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Contracts] Form save error:', err.message);
    res.status(500).json({ error: 'Failed to save form.' });
  }
});

// ─── POST /api/contracts/:id/send ────────────────────────────────────────────
router.post('/:id/send', requirePermission('contract:send'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { validityDays, deliveryMethod = 'email' } = req.body;

    const [rows] = await db.execute(
      `SELECT ci.*, ct.name AS template_name, ct.document_schema_json, ct.conditional_rules_json,
              ct.validity_days AS template_validity_days, cf.schema_json AS form_schema
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       LEFT JOIN contract_forms cf ON cf.id = ct.form_id
       WHERE ci.id = ? AND ci.location_id = ?`,
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (contract.state !== 'READY') {
      return res.status(409).json({ error: `Contract must be in READY state to send. Current: ${contract.state}` });
    }

    // Build immutable snapshot
    const formResponse = typeof contract.form_response_json === 'string'
      ? JSON.parse(contract.form_response_json)
      : contract.form_response_json;

    const formSchema = typeof contract.form_schema === 'string'
      ? JSON.parse(contract.form_schema)
      : (contract.form_schema || { fields: [] });

    const template = {
      id:                    contract.template_id,
      name:                  contract.template_name,
      current_version:       contract.template_version,
      document_schema_json:  typeof contract.document_schema_json === 'string'
        ? JSON.parse(contract.document_schema_json)
        : contract.document_schema_json,
      conditional_rules_json: contract.conditional_rules_json,
    };

    const assignedUser = await ghlService.getUser(locationId, contract.assigned_user_id, req.ghlUser?.privateToken).catch(() => ({ name: '' }));

    const { snapshot } = await snapshotService.buildSnapshot({
      contractInstanceId: contract.id,
      template,
      formSchema,
      formResponse,
      locationId,
      ghlContactId:     contract.ghl_contact_id,
      ghlOpportunityId: contract.ghl_opportunity_id,
      assignedUserName: assignedUser?.name || '',
      privateToken:     req.ghlUser?.privateToken,
    });

    // Generate signing token (or preserve existing active token)
    const signingToken = contract.signing_token || crypto.randomBytes(32).toString('hex');

    // Determine validity days: explicit request parameter > instance validity_days > remaining time > template default > 7
    let expiryDays;
    if (validityDays !== undefined && validityDays !== null && validityDays !== '') {
      expiryDays = Math.max(1, parseInt(validityDays));
    } else if (contract.validity_days) {
      expiryDays = Math.max(1, parseInt(contract.validity_days));
    } else if (contract.token_expires_at && new Date(contract.token_expires_at) > new Date()) {
      const diffMs = new Date(contract.token_expires_at).getTime() - Date.now();
      expiryDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
    } else {
      expiryDays = contract.template_validity_days || 7;
    }

    const tokenExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Transition to SENT with snapshot
    await db.execute(
      `UPDATE contract_instances
       SET state = 'SENT', snapshot_json = ?, signing_token = ?, token_expires_at = ?, validity_days = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(snapshot), signingToken, tokenExpiresAt, expiryDays, contract.id]
    );

    // Audit log
    await db.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, actor_name, action, from_state, to_state, metadata_json)
       VALUES (?, 'USER', ?, ?, 'CONTRACT_SENT', 'READY', 'SENT', ?)`,
      [contract.id, userId, req.ghlUser.name, JSON.stringify({ expiryDays, deliveryMethod })]
    );

    // Build signing URL
    const baseUrl = settingsService.getSigningBaseUrl(req);
    const signingUrl = `${baseUrl}/sign/${signingToken}`;

    // Deliver via GHL Conversation (SMS, Email, and Internal Conversation Thread)
    const deliveryChannels = req.body.channels || (deliveryMethod === 'sms' ? ['sms'] : deliveryMethod === 'email' ? ['email'] : ['sms', 'email']);
    const delivery = await ghlService.sendContractViaGHLConversation(locationId, {
      contactId: contract.ghl_contact_id,
      recipientName: contract.recipient_name,
      recipientEmail: contract.recipient_email,
      recipientPhone: contract.recipient_phone,
      contractName: template.name,
      signingUrl,
      expiryDays,
      channels: deliveryChannels,
      userId,
      privateToken: req.ghlUser?.privateToken,
    }).catch(err => {
      console.warn('[Contracts] GHL delivery note:', err.message);
      return { smsSent: false, emailSent: false, notePosted: false, errors: [err.message] };
    });

    // Sync GHL status
    ghlService.updateContact(locationId, contract.ghl_contact_id, {
      customFields: [
        { id: 'contract_status',  value: 'Sent' },
        { id: 'contract_sent_date', value: new Date().toISOString() },
        { id: 'contract_expiry_date', value: tokenExpiresAt.toISOString() },
      ],
    }, req.ghlUser?.privateToken).catch(err => console.warn('[Contracts] GHL status sync failed:', err.message));

    const channelsSentText = [
      delivery?.smsSent ? 'SMS' : null,
      delivery?.emailSent ? 'Email' : null,
      delivery?.notePosted ? 'Conversation Note' : null,
    ].filter(Boolean).join(' & ');

    res.json({
      success: true,
      state: 'SENT',
      signingUrl,
      signingLink: signingUrl,
      expiresAt: tokenExpiresAt,
      delivery,
      message: channelsSentText
        ? `Contract sent successfully via GoHighLevel Conversation (${channelsSentText})!`
        : 'Contract marked as sent and logged in GoHighLevel Conversation.',
    });
  } catch (err) {
    console.error('[Contracts] Send error:', err.message);
    res.status(500).json({ error: 'Failed to send contract.' });
  }
});

// ─── PATCH /api/contracts/:id/cancel ─────────────────────────────────────────
router.patch('/:id/cancel', requirePermission('contract:cancel'), async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;

    const [rows] = await db.execute(
      'SELECT id, state, ghl_contact_id FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (['SIGNED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(contract.state)) {
      return res.status(409).json({ error: `Cannot cancel contract in state: ${contract.state}` });
    }

    await db.execute(
      'UPDATE contract_instances SET state = \'CANCELLED\', signing_token = NULL, updated_at = NOW() WHERE id = ?',
      [contract.id]
    );

    await db.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, actor_name, action, from_state, to_state)
       VALUES (?, 'USER', ?, ?, 'CONTRACT_CANCELLED', ?, 'CANCELLED')`,
      [contract.id, userId, req.ghlUser.name, contract.state]
    );

    ghlService.updateContact(locationId, contract.ghl_contact_id, {
      customFields: [{ id: 'contract_status', value: 'Cancelled' }],
    }).catch(() => {});

    res.json({ success: true, state: 'CANCELLED' });
  } catch (err) {
    console.error('[Contracts] Cancel error:', err.message);
    res.status(500).json({ error: 'Failed to cancel contract.' });
  }
});

// ─── GET /api/contracts/:id/audit ────────────────────────────────────────────
router.get('/:id/audit', async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { role } = req.appUser;

    const [rows] = await db.execute(
      'SELECT id, assigned_user_id, location_id FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (!hasPermission(role, 'audit:view:all') && contract.assigned_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied to audit trail.' });
    }

    const [logs] = await db.execute(
      `SELECT id, actor_type, actor_id, actor_name, action, from_state, to_state,
              ip_address, metadata_json, created_at
       FROM contract_audit_logs
       WHERE contract_instance_id = ?
       ORDER BY created_at ASC`,
      [contract.id]
    );

    res.json({ auditLogs: logs });
  } catch (err) {
    console.error('[Contracts] Audit error:', err.message);
    res.status(500).json({ error: 'Failed to get audit trail.' });
  }
});

// ─── GET /api/contracts/:id/events (activity timeline) ───────────────────────
router.get('/:id/events', async (req, res) => {
  try {
    const { userId, locationId } = req.ghlUser;
    const { role } = req.appUser;

    const [rows] = await db.execute(
      'SELECT id, assigned_user_id FROM contract_instances WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found.' });

    const contract = rows[0];
    if (!hasPermission(role, 'audit:view:all') && contract.assigned_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Merge contract_events + audit_logs into a unified timeline
    const [events] = await db.execute(
      `SELECT 'event' AS source, event_type AS action, actor_label AS actor_name,
              event_data_json AS metadata_json, ip_address, created_at
       FROM contract_events
       WHERE contract_instance_id = ?
       UNION ALL
       SELECT 'audit' AS source, action, COALESCE(actor_name, actor_id) AS actor_name,
              metadata_json, ip_address, created_at
       FROM contract_audit_logs
       WHERE contract_instance_id = ?
       ORDER BY created_at ASC`,
      [contract.id, contract.id]
    );

    const timeline = events.map(e => ({
      source:       e.source,
      action:       e.action,
      actorName:    e.actor_name,
      ipAddress:    e.ip_address,
      metadata:     e.metadata_json ? (typeof e.metadata_json === 'string' ? JSON.parse(e.metadata_json) : e.metadata_json) : {},
      createdAt:    e.created_at,
    }));

    res.json({ timeline });
  } catch (err) {
    console.error('[Contracts] Events error:', err.message);
    res.status(500).json({ error: 'Failed to get activity timeline.' });
  }
});

// ─── POST /api/contracts/:id/sync-ghl-notes ──────────────────────────────────
// Manually / retroactively sync all audit trail events to GHL Conversation stream & Contact Notes
router.post('/:id/sync-ghl-notes', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM contract_instances WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contract not found' });
    const contract = rows[0];

    const [logs] = await db.execute(
      'SELECT * FROM contract_audit_logs WHERE contract_instance_id = ? ORDER BY id ASC',
      [id]
    );

    let syncedCount = 0;
    for (const log of logs) {
      await ghlService.syncAuditLogToGHL(contract.location_id, {
        contactId: contract.ghl_contact_id,
        userId: contract.assigned_user_id || req.ghlUser?.userId,
        title: `${log.action.replace(/_/g, ' ')} (${log.from_state ? log.from_state + ' → ' : ''}${log.to_state || contract.state})`,
        details: log.metadata_json ? (typeof log.metadata_json === 'string' ? log.metadata_json : JSON.stringify(log.metadata_json)) : '',
        actorName: log.actor_name || log.actor_id || 'System',
        pdfUrl: contract.ghl_file_url || '',
        privateToken: req.ghlUser?.privateToken,
      });
      syncedCount++;
    }

    res.json({
      success: true,
      synced: syncedCount,
      message: `Dispatched ${syncedCount} audit events to HighLevel conversations and contact notes.`,
    });
  } catch (err) {
    console.error('[Contracts] sync-ghl-notes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
