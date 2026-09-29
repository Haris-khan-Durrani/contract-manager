/**
 * clientSummaryZipService.js — Compiles Contract, Summary PDF & Attachments into a unified ZIP archive
 */
const JSZip = require('jszip');
const axios = require('axios');
const db = require('../config/db');
const { getContractPdfBuffer } = require('./contractPdfHelper');
const { generateSummaryPdf } = require('./clientSummaryPdfService');

async function compileClientPackageZip(contractId, locationId) {
  // 1. Fetch Contract & Template info
  const [contractRows] = await db.execute(
    `SELECT ci.*, ct.name AS template_name, ct.contract_type
     FROM contract_instances ci
     JOIN contract_templates ct ON ct.id = ci.template_id
     WHERE ci.id = ? AND ci.location_id = ? LIMIT 1`,
    [contractId, locationId]
  );

  if (!contractRows.length) {
    throw new Error('Contract not found.');
  }

  const contract = contractRows[0];

  // 2. Fetch Client Summary Data
  const [summaryRows] = await db.execute(
    `SELECT * FROM contract_client_summaries WHERE location_id = ? AND contract_id = ? LIMIT 1`,
    [locationId, contractId]
  );

  let summaryData = {};
  let summaryRow = null;
  if (summaryRows.length) {
    summaryRow = summaryRows[0];
    try {
      summaryData = JSON.parse(summaryRow.summary_data_json || '{}');
    } catch {
      summaryData = {};
    }
  }

  const zip = new JSZip();
  const clientSlug = (contract.recipient_name || 'Client')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 30);

  // 3. Generate or retrieve Signed Contract PDF Buffer
  console.log(`[ZIP Service] Compiling Contract #${contractId} PDF…`);
  let contractPdfBuffer;
  try {
    contractPdfBuffer = await getContractPdfBuffer(contractId, locationId);
    zip.file(`1_Signed_Contract_${contractId}.pdf`, contractPdfBuffer);
  } catch (err) {
    console.error(`[ZIP Service] Contract PDF error:`, err.message);
    zip.file(`1_Signed_Contract_${contractId}_ERROR.txt`, `Could not generate contract PDF: ${err.message}`);
  }

  // 4. Generate Client Summary PDF Buffer
  console.log(`[ZIP Service] Generating Client Summary PDF for Contract #${contractId}…`);
  let summaryPdfBuffer;
  try {
    summaryPdfBuffer = await generateSummaryPdf(contract, summaryData);
    zip.file(`2_Client_Summary_Contract_${contractId}.pdf`, summaryPdfBuffer);
  } catch (err) {
    console.error(`[ZIP Service] Summary PDF error:`, err.message);
    zip.file(`2_Client_Summary_Contract_${contractId}_ERROR.txt`, `Could not generate summary PDF: ${err.message}`);
  }

  // 5. Download and bundle all Attached Files
  const attachments = Array.isArray(summaryData.attachments) ? summaryData.attachments : [];
  const attachmentsManifest = [];

  if (attachments.length > 0) {
    const attachFolder = zip.folder('3_Supporting_Attachments');
    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      const safeName = (att.name || `attachment_${i + 1}`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${i + 1}_${safeName}`;

      try {
        let fileBuffer = null;
        if (att.url && (att.url.startsWith('http://') || att.url.startsWith('https://'))) {
          const res = await axios.get(att.url, { responseType: 'arraybuffer', timeout: 15000 });
          fileBuffer = Buffer.from(res.data);
        } else if (att.dataBase64) {
          const base64Data = att.dataBase64.replace(/^data:[^;]+;base64,/, '');
          fileBuffer = Buffer.from(base64Data, 'base64');
        }

        if (fileBuffer) {
          attachFolder.file(filename, fileBuffer);
          attachmentsManifest.push(`- 3_Supporting_Attachments/${filename} (${Math.round(fileBuffer.length / 1024)} KB)`);
        } else {
          attachmentsManifest.push(`- ${filename} (URL: ${att.url || 'Not available'})`);
        }
      } catch (attErr) {
        console.warn(`[ZIP Service] Failed to fetch attachment ${safeName}:`, attErr.message);
        attachmentsManifest.push(`- ${filename} (Download error: ${attErr.message})`);
      }
    }
  }

  // 6. Build Manifest File
  const manifestContent = `========================================================================
360 GLOBAL IMMIGRATION — COMPILED CASE FILE DOSSIER
========================================================================
Generated on:    ${new Date().toUTCString()}
Client Name:     ${contract.recipient_name || 'Client'}
Client Email:    ${contract.recipient_email || '—'}
Client Phone:    ${contract.recipient_phone || '—'}
Contract ID:     #${contract.id} (${contract.template_name || 'Legal Agreement'})
Contract Status: ${contract.state || 'COMPLETED'}
Signed Date:     ${contract.signed_at || '—'}
Counsellor:      ${contract.assigned_user_name || summaryData.counsellor_name || 'Assigned Agent'}
Summary Status:  ${summaryRow?.status || 'DRAFT'}

INCLUDED COMPILED DOCUMENTS:
1. 1_Signed_Contract_${contract.id}.pdf
   - Official Legally Executed Services Agreement with Digital Verification & Audit Seal.

2. 2_Client_Summary_Contract_${contract.id}.pdf
   - Complete 9-Page Client Summary Form & Immigration Assessment Dossier.

3. Supporting Attachments (${attachments.length} file(s)):
${attachmentsManifest.length ? attachmentsManifest.join('\n') : '   - (No external supporting files attached)'}

========================================================================
All documents securely compiled and hosted via 360 Global Immigration System.
`;

  zip.file('0_Case_Dossier_Manifest.txt', manifestContent);

  // 7. Compress into ZIP buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const zipFilename = `Case_Package_Contract_${contract.id}_${clientSlug}.zip`;

  return {
    zipBuffer,
    zipFilename,
    contract,
    summaryData,
  };
}

module.exports = { compileClientPackageZip };
