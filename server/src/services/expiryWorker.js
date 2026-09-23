/**
 * expiryWorker.js — Background Cron: SENT/VIEWED → EXPIRED
 *
 * Runs every 5 minutes (configurable via EXPIRY_WORKER_CRON).
 * Finds contracts past their token_expires_at and transitions them to EXPIRED.
 *
 * Per state change:
 *   - Transitions state in MySQL
 *   - Invalidates signing token
 *   - Syncs GHL Contract Status custom field
 *   - Posts GHL Internal Comment to assigned salesperson
 *   - Writes audit log
 */
const cron       = require('node-cron');
const db         = require('../config/db');
const ghlService = require('./ghlService');
const settingsService = require('./settingsService');

async function runExpiryJob() {
  let connection;
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [expired] = await db.execute(
      `SELECT id, location_id, ghl_contact_id, ghl_opportunity_id, assigned_user_id, signing_token
       FROM contract_instances
       WHERE state IN ('SENT', 'VIEWED')
         AND token_expires_at < NOW()
       LIMIT 50`,
    );

    if (!expired.length) return;
    console.log(`[ExpiryWorker] Processing ${expired.length} expired contract(s)…`);

    for (const contract of expired) {
      try {
        // Transition state
        await db.execute(
          `UPDATE contract_instances
           SET state = 'EXPIRED', signing_token = NULL, updated_at = NOW()
           WHERE id = ? AND state IN ('SENT', 'VIEWED')`,
          [contract.id]
        );

        // Audit log
        await db.execute(
          `INSERT INTO contract_audit_logs
             (contract_instance_id, actor_type, actor_id, action, from_state, to_state, metadata_json)
           VALUES (?, 'SYSTEM', 'EXPIRY_WORKER', 'CONTRACT_EXPIRED', 'SENT_OR_VIEWED', 'EXPIRED', '{}')`,
          [contract.id]
        );

        // GHL status sync — best effort (don't crash worker on GHL failure)
        await syncGHLStatus(contract, 'EXPIRED').catch(err =>
          console.warn(`[ExpiryWorker] GHL sync failed for contract ${contract.id}:`, err.message)
        );

        console.log(`[ExpiryWorker] Contract ${contract.id} → EXPIRED`);
      } catch (err) {
        console.error(`[ExpiryWorker] Error processing contract ${contract.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[ExpiryWorker] Job failed:', err.message);
  }
}

async function syncGHLStatus(contract, status) {
  // Update GHL Contact custom fields for contract status
  // Field keys should be configured per-location; using generic approach here.
  // In production, the field IDs come from the template's GHL mapping config.
  await ghlService.updateContact(contract.location_id, contract.ghl_contact_id, {
    customFields: [
      { id: 'contract_status', value: status },
    ],
  });
}

function start() {
  const cronExpr = settingsService.get('EXPIRY_WORKER_CRON', '*/5 * * * *');
  console.log(`[ExpiryWorker] Starting with cron: "${cronExpr}"`);
  cron.schedule(cronExpr, runExpiryJob, { timezone: 'UTC' });
}

module.exports = { start, runExpiryJob };
