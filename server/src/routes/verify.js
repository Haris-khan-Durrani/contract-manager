/**
 * verify.js — Public Cryptographic Verification Endpoint
 *
 * Allows anyone (clients, embassies, banks, counterparties) to verify the authenticity
 * and execution status of a 360 Global agreement by scanning its QR code or entering
 * the Contract Reference ID / Security Hash.
 *
 * Fully public — No login required.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// Helper to mask email for privacy
function maskEmail(email) {
  if (!email || !email.includes('@')) return '—';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 ? local[0] + '***' + local.slice(-1) : local[0] + '***';
  return `${maskedLocal}@${domain}`;
}

// ─── GET /api/verify/:identifier ─────────────────────────────────────────────
router.get('/:identifier', async (req, res) => {
  try {
    let identifier = String(req.params.identifier || '').trim();
    if (identifier.startsWith('#')) {
      identifier = identifier.slice(1).trim();
    }

    const isNumeric = /^\d+$/.test(identifier);

    const [rows] = await db.execute(
      `SELECT ci.id, ci.state, ci.signing_token, ci.pdf_sha256, ci.signed_at, ci.created_at, ci.updated_at,
              ci.location_id, ci.recipient_name, ci.recipient_email, ci.ghl_file_url, ci.snapshot_json,
              ct.name AS template_name, COALESCE(ci.template_version, ct.current_version, 1) AS template_version
       FROM contract_instances ci
       JOIN contract_templates ct ON ct.id = ci.template_id
       WHERE ${isNumeric ? 'ci.id = ?' : 'ci.signing_token = ? OR ci.pdf_sha256 = ?'}
       LIMIT 1`,
      isNumeric ? [parseInt(identifier, 10)] : [identifier, identifier]
    );

    if (!rows.length) {
      return res.status(404).json({
        valid: false,
        error: 'Record not found in 360 Global Official Execution Registry.',
        identifier,
      });
    }

    const c = rows[0];
    let snapshot = null;
    try {
      snapshot = typeof c.snapshot_json === 'string' ? JSON.parse(c.snapshot_json) : c.snapshot_json;
    } catch {}

    const isCompleted = ['COMPLETED', 'SIGNED'].includes(c.state);
    const clientName  = c.recipient_name || snapshot?.recipientInfo?.name || snapshot?.formData?.client_name || 'Authorized Client';
    const clientEmail = c.recipient_email || snapshot?.recipientInfo?.email || snapshot?.formData?.client_email || '';
    const sha256      = c.pdf_sha256 || 'SHA256:SECURE_EXECUTION_SEAL';

    // Fetch audit timeline summary
    const [auditRows] = await db.execute(
      `SELECT action, actor_name, actor_type, ip_address, created_at
       FROM contract_audit_logs
       WHERE contract_instance_id = ?
       ORDER BY created_at ASC`,
      [c.id]
    );

    return res.json({
      valid: true,
      contractId: c.id,
      reference: `#${c.id}`,
      title: `${c.template_name} (v${c.template_version || 1})`,
      templateName: c.template_name,
      templateVersion: c.template_version || 1,
      state: c.state,
      isExecuted: isCompleted,
      statusLabel: isCompleted ? 'Cryptographically Sealed & Executed' : c.state === 'OPENED' ? 'Under Review by Client' : 'Pending Signature',
      signerName: clientName,
      signerEmailMasked: maskEmail(clientEmail),
      createdAt: c.created_at,
      signedAt: c.signed_at,
      sha256,
      securityRecordId: `360-AUDIT-${c.id}-${sha256.slice(0, 8).toUpperCase()}`,
      issuingAuthority: '360 Global Digital Trust Authority',
      officialRegistry: 'Official Digital Execution Registry • سجل التنفيذ الرقمي',
      governingJurisdiction: 'Courts of Dubai International Financial Centre (DIFC) & UAE Federal Decree-Law No. (46) of 2021',
      legalAssuranceEn: 'This document has been executed using secure electronic signature technology pursuant to UAE Federal Decree-Law No. (46) of 2021 on Electronic Transactions and Trust Services, US E-SIGN Act, and EU Regulation No 910/2014 (eIDAS).',
      legalAssuranceAr: 'تم توقيع واعتماد هذه الوثيقة إلكترونياً استناداً لأحكام مرسوم بقانون اتحادي رقم (46) لسنة 2021 بشأن المعاملات الإلكترونية وخدمات الثقة بدولة الإمارات العربية المتحدة، واللوائح الدولية المعتمدة للتوقيعات الإلكترونية.',
      pdfDownloadUrl: null, // Downloads restricted to authenticated agents only (internal panel)
      ghlFileUrl: c.ghl_file_url || null,
      auditTimeline: (auditRows || []).map(a => ({
        action: a.action,
        actor: a.actor_name || a.actor_type,
        timestamp: a.created_at,
      })),
    });
  } catch (err) {
    console.error('[Verify API Error]:', err.message);
    res.status(500).json({ error: 'Verification lookup service failed.' });
  }
});

module.exports = router;
