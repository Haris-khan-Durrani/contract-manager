/**
 * auditSyncService.js — Universal Contract Audit & GoHighLevel Real-Time Dispatcher
 *
 * Automatically records contract audit trail events to MySQL database AND
 * immediately synchronizes them as live InternalComments into GoHighLevel conversation threads
 * without requiring any manual button click.
 */
const db = require('../config/db');
const ghlService = require('./ghlService');

/**
 * Log contract audit entry, timeline event, and immediately dispatch to GoHighLevel.
 *
 * @param {number|string} contractId
 * @param {object} opts
 * @param {string} opts.action         — e.g. 'CONTRACT_CREATED', 'CONTRACT_SIGNED', 'CONTRACT_COMPLETED'
 * @param {string} [opts.actorType]    — 'USER', 'CLIENT', 'SYSTEM'
 * @param {string} [opts.actorId]      — user ID, token prefix, or system identifier
 * @param {string} [opts.actorName]    — human readable name (e.g. 'Aaqeel Shariff', 'Haris Khan')
 * @param {string} [opts.fromState]    — previous state (e.g. 'DRAFT', 'SIGNED')
 * @param {string} [opts.toState]      — target state (e.g. 'DRAFT', 'COMPLETED')
 * @param {string} [opts.ipAddress]    — IP address
 * @param {string} [opts.userAgent]    — User Agent string
 * @param {object|string} [opts.metadata] — Event metadata object or JSON string
 * @param {string} [opts.privateToken] — GHL Private Integration Token if present
 */
async function logContractAuditAndSync(contractId, {
  action,
  actorType = 'USER',
  actorId = null,
  actorName = null,
  fromState = null,
  toState = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
  privateToken = null,
} = {}) {
  if (!contractId || !action) return null;

  const metadataJson = metadata
    ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata))
    : null;

  // 1. Insert into contract_audit_logs
  try {
    await db.execute(
      `INSERT INTO contract_audit_logs
         (contract_instance_id, actor_type, actor_id, actor_name, action, from_state, to_state, ip_address, user_agent, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [contractId, actorType, actorId, actorName, action, fromState, toState, ipAddress, userAgent, metadataJson]
    );
  } catch (err) {
    console.warn(`[AuditSync] Insert audit log failed for contract #${contractId}:`, err.message);
  }

  // 2. Insert into contract_events
  try {
    await db.execute(
      `INSERT INTO contract_events
         (contract_instance_id, event_type, event_data_json, actor_type, actor_label, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [contractId, action, metadataJson || '{}', actorType, actorName || actorId || 'System', ipAddress]
    );
  } catch (err) {
    console.warn(`[AuditSync] Insert event log failed for contract #${contractId}:`, err.message);
  }

  // 3. Look up contract instance to auto-sync to GoHighLevel in real-time
  try {
    const [rows] = await db.execute(
      'SELECT id, location_id, ghl_contact_id, ghl_opportunity_id, assigned_user_id, ghl_file_url, state FROM contract_instances WHERE id = ? LIMIT 1',
      [contractId]
    );

    if (!rows.length) return null;
    const contract = rows[0];

    let parsedMeta = {};
    if (metadata) {
      parsedMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    }
    const pdfUrl = parsedMeta.ghlFileUrl || contract.ghl_file_url || '';

    const effectiveToState = toState || contract.state;
    const stateTransition = fromState ? `${fromState} → ${effectiveToState}` : effectiveToState;
    const title = `${action.replace(/_/g, ' ')}${stateTransition ? ` (${stateTransition})` : ''}`;

    await ghlService.syncAuditLogToGHL(contract.location_id, {
      contactId: contract.ghl_contact_id,
      userId: contract.assigned_user_id,
      title,
      details: metadataJson || '',
      actorName: actorName || actorId || 'System',
      pdfUrl,
      privateToken,
    });
  } catch (err) {
    console.warn(`[AuditSync] Auto GHL sync failed for contract #${contractId}:`, err.message);
  }
}

module.exports = {
  logContractAuditAndSync,
};
