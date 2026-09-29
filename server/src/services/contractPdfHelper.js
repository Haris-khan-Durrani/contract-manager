/**
 * contractPdfHelper.js — Helper to retrieve or generate signed contract PDF buffer
 */
const axios = require('axios');
const db = require('../config/db');
const pdfService = require('./pdfService');

async function getContractPdfBuffer(contractId, locationId) {
  const [rows] = await db.execute(
    `SELECT ci.*, ct.name AS template_name, ct.document_schema_json
     FROM contract_instances ci
     JOIN contract_templates ct ON ct.id = ci.template_id
     WHERE ci.id = ? AND ci.location_id = ? LIMIT 1`,
    [contractId, locationId]
  );
  if (!rows.length) throw new Error('Contract not found.');
  const contract = rows[0];

  // Try ghl_file_url if exists
  if (contract.ghl_file_url && ['COMPLETED', 'SIGNED'].includes(contract.state)) {
    try {
      const fileRes = await axios.get(contract.ghl_file_url, { responseType: 'arraybuffer', timeout: 15000 });
      return Buffer.from(fileRes.data);
    } catch (err) {
      console.warn('[ContractPdfHelper] Streaming ghl_file_url failed, falling back to dynamic generation:', err.message);
    }
  }

  let snapshot = null;
  if (contract.snapshot_json) {
    snapshot = typeof contract.snapshot_json === 'string'
      ? JSON.parse(contract.snapshot_json)
      : contract.snapshot_json;
  }

  if (!snapshot) {
    const formData = typeof contract.form_data_json === 'string'
      ? JSON.parse(contract.form_data_json || '{}')
      : (contract.form_data_json || {});
    const docSchema = typeof contract.document_schema_json === 'string'
      ? JSON.parse(contract.document_schema_json || '{}')
      : (contract.document_schema_json || {});

    snapshot = {
      contractInstanceId: contract.id,
      templateId: contract.template_id,
      templateName: contract.template_name,
      documentTitle: contract.template_name,
      rawHtml: docSchema.rawHtml || null,
      customCss: docSchema.customCss || '',
      isHtmlTemplate: !!docSchema.rawHtml,
      activeBlocks: docSchema.blocks || [],
      formData,
      clientName: contract.recipient_name,
      clientEmail: contract.recipient_email,
      clientPhone: contract.recipient_phone,
      recipient: {
        name: contract.recipient_name,
        email: contract.recipient_email,
        phone: contract.recipient_phone,
      },
      frozenAt: contract.created_at || new Date().toISOString(),
    };
  }

  const isSigned = ['SIGNED', 'COMPLETED'].includes(contract.state);
  const { buffer } = isSigned
    ? await pdfService.generateSigned(snapshot)
    : await pdfService.generatePreview(snapshot);

  return buffer;
}

module.exports = { getContractPdfBuffer };
