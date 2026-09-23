/**
 * retryWorker.js — Background Queue: SIGNED_PENDING_STORAGE → COMPLETED
 *
 * Runs every 2 minutes (configurable via RETRY_WORKER_CRON).
 * Retries GHL PDF upload for contracts that signed successfully
 * but whose GHL upload temporarily failed.
 *
 * CRITICAL: Clients NEVER re-sign. The document is legally signed.
 * Only the GHL storage/notification step is retried.
 *
 * On success:
 *   - Stores ghl_file_url
 *   - Transitions state to COMPLETED
 *   - Updates GHL Contact custom fields (Status, Signed Date, PDF URL)
 *   - Posts GHL Conversation InternalComment with PDF attachment
 *   - Writes audit log
 *
 * On permanent failure (max retries exceeded):
 *   - Writes dead-letter log entry
 *   - Posts internal alert note
 */
const cron       = require('node-cron');
const db         = require('../config/db');
const ghlService = require('./ghlService');
const settingsService = require('./settingsService');

async function runRetryJob() {
  const maxRetries = settingsService.getInt('MAX_UPLOAD_RETRIES', 5);
  try {
    const [pending] = await db.execute(
      `SELECT id, location_id, ghl_contact_id, ghl_opportunity_id,
              assigned_user_id, snapshot_json, upload_retry_count, pdf_sha256, signed_at
       FROM contract_instances
       WHERE state = 'SIGNED_PENDING_STORAGE'
         AND upload_retry_count < ?
       LIMIT 20`,
      [maxRetries]
    );

    if (!pending.length) return;
    console.log(`[RetryWorker] Processing ${pending.length} pending upload(s)…`);

    for (const contract of pending) {
      try {
        await attemptUpload(contract);
      } catch (err) {
        console.error(`[RetryWorker] Upload failed for contract ${contract.id}:`, err.message);

        await db.execute(
          `UPDATE contract_instances SET upload_retry_count = upload_retry_count + 1, updated_at = NOW() WHERE id = ?`,
          [contract.id]
        );

        const newCount = contract.upload_retry_count + 1;
        if (newCount >= MAX_RETRIES) {
          await deadLetterContract(contract);
        }
      }
    }
  } catch (err) {
    console.error('[RetryWorker] Job failed:', err.message);
  }
}

async function attemptUpload(contract) {
  const snapshot = typeof contract.snapshot_json === 'string'
    ? JSON.parse(contract.snapshot_json)
    : contract.snapshot_json;

  // Re-generate or retrieve the PDF bytes
  // In production this would call pdfService.generateFromSnapshot(snapshot)
  // For now, we check if the PDF was already generated and stored temporarily.
  // The full pdfService integration happens in Phase 5.
  const pdfBuffer = await getPdfBuffer(contract.id, snapshot);
  if (!pdfBuffer) {
    throw new Error('PDF buffer not available for retry.');
  }

  const filename = `contract_${contract.id}_signed.pdf`;

  // Upload to GHL
  const uploadResult = await ghlService.uploadContactFile(
    contract.location_id,
    contract.ghl_contact_id,
    pdfBuffer,
    filename
  );

  const ghlFileUrl = uploadResult?.fileUrl || uploadResult?.url || '';

  // Transition to COMPLETED
  await db.execute(
    `UPDATE contract_instances
     SET state = 'COMPLETED', ghl_file_url = ?, upload_retry_count = upload_retry_count + 1, updated_at = NOW()
     WHERE id = ?`,
    [ghlFileUrl, contract.id]
  );

  // Update GHL Contact custom fields
  await ghlService.updateContact(contract.location_id, contract.ghl_contact_id, {
    customFields: [
      { id: 'contract_status',   value: 'Completed' },
      { id: 'contract_pdf_url',  value: ghlFileUrl },
      { id: 'contract_signed_date', value: contract.signed_at },
    ],
  }).catch(err => console.warn('[RetryWorker] GHL contact update failed:', err.message));

  // Post conversation note
  await ghlService.postConversationNote(contract.location_id, {
    contactId:   contract.ghl_contact_id,
    userId:      contract.assigned_user_id,
    message:     `✅ Contract #${contract.id} has been signed and the PDF is now available.`,
    attachments: [ghlFileUrl].filter(Boolean),
  }).catch(err => console.warn('[RetryWorker] Conversation note failed:', err.message));

  // Audit log
  await db.execute(
    `INSERT INTO contract_audit_logs
       (contract_instance_id, actor_type, actor_id, action, from_state, to_state, metadata_json)
     VALUES (?, 'SYSTEM', 'RETRY_WORKER', 'PDF_UPLOADED', 'SIGNED_PENDING_STORAGE', 'COMPLETED', ?)`,
    [contract.id, JSON.stringify({ ghlFileUrl })]
  );

  console.log(`[RetryWorker] Contract ${contract.id} → COMPLETED (GHL file: ${ghlFileUrl})`);
}

async function getPdfBuffer(contractId, snapshot) {
  // Placeholder: in Phase 5 this integrates with pdfService.
  // Returns null if not yet available (triggers retry increment).
  try {
    const pdfService = require('./pdfService');
    return await pdfService.generateFromSnapshot(snapshot);
  } catch {
    return null;
  }
}

async function handleDeadLetter(contract) {
  const maxRetries = settingsService.getInt('MAX_UPLOAD_RETRIES', 5);
  console.error(`[RetryWorker] ☠️  Dead letter: Contract ${contract.id} exceeded ${maxRetries} retries.`);
  await db.execute(
    `INSERT INTO contract_audit_logs
       (contract_instance_id, actor_type, actor_id, action, from_state, to_state, metadata_json)
     VALUES (?, 'SYSTEM', 'RETRY_WORKER', 'PDF_UPLOAD_DEAD_LETTER', 'SIGNED_PENDING_STORAGE', 'SIGNED_PENDING_STORAGE', ?)`,
    [contract.id, JSON.stringify({ maxRetries, retryCount: contract.upload_retry_count })]
  );

  // Alert via GHL internal note to admin
  await ghlService.postConversationNote(contract.location_id, {
    contactId: contract.ghl_contact_id,
    userId:    contract.assigned_user_id,
    message:   `⚠️ ALERT: Contract #${contract.id} PDF upload failed after ${maxRetries} attempts. Manual intervention required.`,
  }).catch(() => {});
}

function start() {
  const cronExpr = settingsService.get('RETRY_WORKER_CRON', '*/2 * * * *');
  console.log(`[RetryWorker] Starting with cron: "${cronExpr}"`);
  cron.schedule(cronExpr, runRetryJob, { timezone: 'UTC' });
}

module.exports = { start, runRetryJob };
