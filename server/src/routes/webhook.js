/**
 * webhook.js — GHL Workflow Webhook Handler
 *
 * POST /api/webhooks/ghl/contract-trigger
 *
 * Security: Validated via Authorization: Bearer <GHL_WEBHOOK_SECRET>
 * or X-Contract-App-Key header. NOT GHL Signed User Context.
 *
 * Idempotency: SHA-256 hash of (locationId + contactId + opportunityId + trigger)
 * stored in webhook_idempotency_keys to prevent duplicate contracts on GHL retry.
 *
 * Flow:
 *   1. Validate webhook secret
 *   2. Check idempotency key
 *   3. Fetch Contact + Opportunity from GHL using Private Integration Token
 *   4. Run Contract Rule Engine
 *   5. Evaluate required fields → AWAITING_FORM or READY
 *   6. Create contract instance (atomic)
 *   7. Sync GHL status
 *   8. Write audit log
 */
const express       = require('express');
const router        = express.Router();
const crypto        = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db            = require('../config/db');
const ghlService    = require('../services/ghlService');
const conditionEngine = require('../services/conditionEngine');
const settingsService = require('../services/settingsService');

// ─── Webhook Secret Validator ─────────────────────────────────────────────────
function validateWebhookSecret(req, res, next) {
  const webhookSecret = settingsService.get('GHL_WEBHOOK_SECRET') || process.env.GHL_WEBHOOK_SECRET;
  const authHeader = req.headers['authorization'] || '';
  const customKey  = req.headers['x-contract-app-key'] || '';

  const isBearer = authHeader === `Bearer ${webhookSecret}`;
  const isCustom = customKey  === webhookSecret;

  if (!webhookSecret || (!isBearer && !isCustom)) {
    return res.status(401).json({ error: 'Unauthorized webhook request.' });
  }
  next();
}

// ─── Main Webhook Handler ─────────────────────────────────────────────────────
router.post('/contract-trigger', validateWebhookSecret, async (req, res) => {
  const { locationId, contactId, opportunityId, trigger } = req.body;

  if (!locationId || !contactId || !trigger) {
    return res.status(400).json({ error: 'Missing required fields: locationId, contactId, trigger.' });
  }

  // 1. Idempotency check
  const rawKey     = `${locationId}:${contactId}:${opportunityId || ''}:${trigger}`;
  const idempKey   = crypto.createHash('sha256').update(rawKey).digest('hex');
  const expiresAt  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h TTL

  try {
    const [existingKey] = await db.execute(
      'SELECT contract_instance_id FROM webhook_idempotency_keys WHERE idempotency_key = ? AND expires_at > NOW() LIMIT 1',
      [idempKey]
    );

    if (existingKey.length) {
      return res.status(200).json({
        message:            'Duplicate webhook — contract already created.',
        contractInstanceId: existingKey[0].contract_instance_id,
      });
    }
  } catch (err) {
    console.error('[Webhook] Idempotency check failed:', err.message);
    return res.status(500).json({ error: 'Idempotency check failed.' });
  }

  // 2. Fetch GHL data
  let ghlContact, ghlOpportunity;
  try {
    [ghlContact, ghlOpportunity] = await Promise.all([
      ghlService.getContact(locationId, contactId),
      opportunityId ? ghlService.getOpportunity(locationId, opportunityId) : Promise.resolve(null),
    ]);
  } catch (err) {
    console.error('[Webhook] GHL fetch failed:', err.message);
    return res.status(502).json({ error: 'Failed to fetch GHL data. Will retry via GHL workflow.' });
  }

  // 3. Run Contract Rule Engine
  let matchedTemplate;
  try {
    matchedTemplate = await findMatchingTemplate(locationId, ghlContact, ghlOpportunity, trigger);
    if (!matchedTemplate) {
      return res.status(200).json({ message: 'No matching contract template for this trigger.' });
    }
  } catch (err) {
    console.error('[Webhook] Rule engine error:', err.message);
    return res.status(500).json({ error: 'Contract rule engine failed.' });
  }

  // 4. Evaluate required fields → determine initial state
  const context = {
    contact:     ghlContact,
    opportunity: ghlOpportunity,
    form:        {},
    system:      { trigger },
  };

  const formSchema     = matchedTemplate.form_schema || { fields: [] };
  const requiredFields = (formSchema.fields || []).filter(f => f.required && f.source !== 'system');
  const missingFields  = requiredFields.filter(f => {
    const val = conditionEngine.resolveField(f.key, context);
    return val === undefined || val === null || val === '';
  });

  const initialState = missingFields.length > 0 ? 'AWAITING_FORM' : 'READY';
  const assignedUserId = ghlOpportunity?.assignedTo || ghlContact?.assignedTo || '';

  // 5. Create contract instance (atomic with idempotency key)
  let contractInstanceId;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.execute(
      `INSERT INTO contract_instances
         (location_id, template_id, template_version, ghl_contact_id, ghl_opportunity_id,
          assigned_user_id, created_by_user_id, creation_mode, state, form_response_json)
       VALUES (?, ?, ?, ?, ?, ?, 'SYSTEM_WEBHOOK', 'AUTOMATIC', ?, '{}')`,
      [
        locationId,
        matchedTemplate.id,
        matchedTemplate.current_version,
        contactId,
        opportunityId || null,
        assignedUserId,
        initialState,
      ]
    );

    contractInstanceId = insertResult.insertId;

    await connection.execute(
      'INSERT INTO webhook_idempotency_keys (idempotency_key, contract_instance_id, expires_at) VALUES (?, ?, ?)',
      [idempKey, contractInstanceId, expiresAt]
    );

    await connection.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, action, from_state, to_state, metadata_json)
       VALUES (?, 'SYSTEM', 'GHL_WEBHOOK', 'CONTRACT_CREATED', NULL, ?, ?)`,
      [contractInstanceId, initialState, JSON.stringify({ trigger, matchedTemplate: matchedTemplate.id, missingFields: missingFields.map(f => f.key) })]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('[Webhook] Contract creation failed:', err.message);
    return res.status(500).json({ error: 'Failed to create contract instance.' });
  }
  connection.release();

  // 6. Sync GHL status (best effort)
  ghlService.updateContact(locationId, contactId, {
    customFields: [{ id: 'contract_status', value: initialState === 'AWAITING_FORM' ? 'Awaiting Form' : 'Ready' }],
  }).catch(err => console.warn('[Webhook] GHL status sync failed:', err.message));

  console.log(`[Webhook] Contract ${contractInstanceId} created → ${initialState} (template: ${matchedTemplate.name})`);

  return res.status(200).json({
    contractInstanceId,
    state:    initialState,
    template: matchedTemplate.name,
  });
});

/**
 * Find the first matching active template for this location + trigger + GHL data.
 */
async function findMatchingTemplate(locationId, ghlContact, ghlOpportunity, trigger) {
  const [templates] = await db.execute(
    `SELECT t.*, f.schema_json AS form_schema
     FROM contract_templates t
     LEFT JOIN contract_forms f ON f.id = t.form_id
     WHERE t.location_id = ? AND t.is_active = TRUE
     ORDER BY t.id ASC`,
    [locationId]
  );

  const context = {
    contact:     ghlContact,
    opportunity: ghlOpportunity,
    system:      { trigger },
  };

  for (const template of templates) {
    const rules = template.creation_rules_json;
    if (!rules) continue; // Templates without rules are not auto-matched

    const matched = conditionEngine.evaluate(rules, context);
    if (matched) {
      if (typeof template.form_schema === 'string') {
        template.form_schema = JSON.parse(template.form_schema);
      }
      return template;
    }
  }

  return null;
}

module.exports = router;
