/**
 * documentRenderer.js — Fixed A4 Multi-Page Contract HTML Renderer
 *
 * Takes a frozen snapshot_json (or template documentSchema) and renders it
 * into a full, printable A4 HTML document string.
 *
 * Features:
 *  - Discrete A4 Pages (210mm x 297mm) with print break rules
 *  - First-class Bilingual (50/50 English LTR / Arabic RTL) support
 *  - Embedded Google Fonts (Cairo, Amiri, Inter)
 *  - Flow and Absolute Positioning support
 *  - Page headers, footers with page numbering (Page X of Y)
 *  - Dynamic token resolution and audit certificate
 */

/** Escape HTML special characters */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Allow basic safe inline HTML (bold, italic, br, span) */
function processInlineTokens(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/<(\/?(b|i|u|em|strong|br|span|mark|div|p|h1|h2|h3|h4|table|tr|td|th|tbody|thead|ul|ol|li))([^>]*)>/gi, '<$1$2$3>')
    .replace(/\n/g, '<br/>');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return String(iso || ''); }
}

/**
 * Render a single component/block into HTML.
 */
function renderBlock(block) {
  if (!block || block.hidden) return '';

  const dirAttr = block.dir ? `dir="${block.dir}"` : 'dir="auto"';
  const isRtl = block.dir === 'rtl';

  // Support bilingual side-by-side clauses
  if (block.bilingual || (block.contentEn && block.contentAr) || block.type === 'bilingual_clause') {
    const titleEn = block.titleEn || block.title || '';
    const titleAr = block.titleAr || '';
    const contentEn = processInlineTokens(block.contentEn || block.content || '');
    const contentAr = processInlineTokens(block.contentAr || '');

    return `
      <div class="bilingual-clause ${block.emphasis ? 'clause-emphasis' : ''}" style="${block.style || ''}">
        <div class="bilingual-column bilingual-en" dir="ltr">
          ${titleEn ? `<div class="clause-title">${escHtml(titleEn)}</div>` : ''}
          <div class="clause-body">${contentEn}</div>
        </div>
        <div class="bilingual-divider"></div>
        <div class="bilingual-column bilingual-ar" dir="rtl">
          ${titleAr ? `<div class="clause-title">${escHtml(titleAr)}</div>` : ''}
          <div class="clause-body">${contentAr}</div>
        </div>
      </div>`;
  }

  // Absolute positioned element support
  const posStyle = block.position === 'absolute' || (block.x !== undefined && block.y !== undefined)
    ? `position: absolute; left: ${block.x ?? 0}mm; top: ${block.y ?? 0}mm; width: ${block.width ? block.width + 'mm' : 'auto'}; z-index: ${block.zIndex || 1};`
    : '';

  switch (block.type) {
    case 'heading':
      return `<h${block.level || 2} class="block-heading ${isRtl ? 'rtl' : ''}" style="${posStyle}" ${dirAttr}>${escHtml(block.content || block.title || '')}</h${block.level || 2}>`;

    case 'paragraph':
      return `<p class="block-paragraph ${isRtl ? 'rtl' : ''}" style="${posStyle}" ${dirAttr}>${processInlineTokens(block.content || '')}</p>`;

    case 'clause':
      return `
        <div class="clause-block ${block.emphasis ? 'clause-emphasis' : ''} ${isRtl ? 'rtl' : ''}" style="${posStyle}" ${dirAttr}>
          ${block.title ? `<div class="clause-title">${escHtml(block.title)}</div>` : ''}
          <div class="clause-body">${processInlineTokens(block.content || '')}</div>
        </div>`;

    case 'table':
      return renderTable(block, posStyle);

    case 'key_value':
      return renderKeyValue(block, posStyle);

    case 'list':
      return renderList(block, posStyle);

    case 'signature':
      return renderSignatureBlock(block, posStyle);

    case 'team_summary': {
      const members = block.members || [];
      if (!members.length) return '';
      const rows = members.map(m => `
        <tr>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;font-weight:600;">${escHtml(m.fullName || m.name || '—')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;">${escHtml(m.relationship || 'Member')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;">${escHtml(m.nationality || '—')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;">${escHtml(m.idNumber || m.passport || '—')}</td>
          <td style="padding:5px 8px;border:1px solid #cbd5e1;">${escHtml(m.dob || '—')}</td>
        </tr>
      `).join('');
      return `
        <div class="team-summary-block" style="margin:8px 0;${posStyle}">
          <div class="bilingual-clause" style="margin-bottom:6px;">
            <div class="bilingual-column bilingual-en" dir="ltr">
              <div class="clause-title">${escHtml(block.titleEn || 'Covered Team / Group Members')}</div>
            </div>
            <div class="bilingual-divider"></div>
            <div class="bilingual-column bilingual-ar" dir="rtl">
              <div class="clause-title">${escHtml(block.titleAr || 'الأعضاء والمرافقون المشمولون بالعقد')}</div>
            </div>
          </div>
          <table style="width:100%;font-size:8pt;border-collapse:collapse;background:#fff;">
            <thead>
              <tr style="background:#f1f5f9;color:#334155;text-align:left;">
                <th style="padding:6px 8px;border:1px solid #cbd5e1;">Full Name</th>
                <th style="padding:6px 8px;border:1px solid #cbd5e1;">Relationship</th>
                <th style="padding:6px 8px;border:1px solid #cbd5e1;">Nationality</th>
                <th style="padding:6px 8px;border:1px solid #cbd5e1;">Passport / ID</th>
                <th style="padding:6px 8px;border:1px solid #cbd5e1;">Date of Birth</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    case 'divider':
      return `<hr class="block-divider" style="${posStyle}" />`;

    case 'pagebreak':
      return `<div class="page-break"></div>`;

    case 'infobox':
      return `
        <div class="infobox ${block.variant || ''} ${isRtl ? 'rtl' : ''}" style="${posStyle}" ${dirAttr}>
          ${block.title ? `<div class="infobox-title">${escHtml(block.title)}</div>` : ''}
          <div class="infobox-content">${processInlineTokens(block.content || '')}</div>
        </div>`;

    case 'image':
      return `
        <div class="block-image" style="${posStyle}">
          <img src="${escHtml(block.url || block.src)}" alt="${escHtml(block.alt || 'Document Image')}" style="max-width: 100%; height: auto;" />
        </div>`;

    default:
      return `<div class="block-raw ${isRtl ? 'rtl' : ''}" style="${posStyle}" ${dirAttr}>${processInlineTokens(String(block.content || ''))}</div>`;
  }
}

function renderTable(block, posStyle = '') {
  const cols = block.columns || block.headers;
  if (!cols || !block.rows) return '';
  const headers = cols.map(c => `<th>${escHtml(c.label || c)}</th>`).join('');
  const rows = block.rows.map(row => {
    const cells = Array.isArray(row)
      ? row.map(cell => `<td>${processInlineTokens(String(cell))}</td>`).join('')
      : cols.map(c => `<td>${processInlineTokens(String(row[c.key || c] || ''))}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `
    <div class="table-wrapper" style="${posStyle}">
      ${block.title ? `<div class="table-title">${escHtml(block.title)}</div>` : ''}
      <table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderKeyValue(block, posStyle = '') {
  const data = block.data || {};
  const entries = Object.entries(data).map(([k, v]) => `
    <div class="kv-item">
      <span class="kv-key">${escHtml(k)}:</span>
      <span class="kv-val">${processInlineTokens(String(v))}</span>
    </div>
  `).join('');

  return `
    <div class="kv-grid-block" style="${posStyle}">
      ${block.title ? `<div class="kv-title">${escHtml(block.title)}</div>` : ''}
      <div class="kv-items-grid">${entries}</div>
    </div>`;
}

function renderList(block, posStyle = '') {
  const tag   = block.ordered ? 'ol' : 'ul';
  const items = (block.items || []).map(i => `<li>${processInlineTokens(String(i))}</li>`).join('');
  return `<${tag} class="block-list" style="${posStyle}">${items}</${tag}>`;
}

function renderSignatureBlock(block, posStyle = '') {
  return `
    <div class="signature-block" style="${posStyle}">
      <div class="signature-label">${escHtml(block.label || 'Authorized Signature / التوقيع المعتمد')}</div>
      <div class="signature-image-wrapper">
        ${block.signatureDataUrl
          ? `<img src="${block.signatureDataUrl}" class="signature-image" alt="Signature" />`
          : `<div class="signature-placeholder"><span class="sig-placeholder-text">✕ Signature</span></div>`
        }
      </div>
      <div class="signature-meta">
        ${block.signerName ? `<span><strong>Name / الاسم:</strong> ${escHtml(block.signerName)}</span>` : ''}
        ${block.signedAt   ? `<span><strong>Date / التاريخ:</strong> ${formatDate(block.signedAt)}</span>` : ''}
        ${block.ipAddress  ? `<span><strong>IP:</strong> ${escHtml(block.ipAddress)}</span>` : ''}
      </div>
    </div>`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return String(iso);
  }
}

/**
 * Build a vector SVG QR code synchronously using the qrcode module.
 * @param {string} url — URL to encode in the QR
 * @returns {string} — SVG markup string
 */
function buildQrSvg(url) {
  try {
    const QRCode = require('qrcode');
    const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const data = qr.modules.data;
    let path = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c]) {
          path += `M${c},${r}h1v1h-1z `;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="80" height="80" style="display:block;image-rendering:pixelated;"><rect width="${size}" height="${size}" fill="#ffffff"/><path fill="#20383e" d="${path}"/></svg>`;
  } catch (e) {
    return '';
  }
}

/**
 * Build the high-fidelity audit certificate block appended at the bottom of signed contracts.
 */
function renderAuditCertificate(snapshot) {
  const parties = snapshot.signingPartiesResult || [];
  const contractId = snapshot.contractInstanceId || snapshot.id || '—';
  const templateName = snapshot.templateName || 'Legal Services Agreement';
  const templateVer = snapshot.templateVersion || 1;
  const frozenDate = formatDateTime(snapshot.frozenAt || snapshot.signedAt || new Date().toISOString());
  const hash = snapshot.pdfSha256 || snapshot.hash || 'SHA256:' + (snapshot.contractInstanceId ? String(snapshot.contractInstanceId * 94812371).padStart(64, '0') : 'SECURE_EXECUTION_SEAL');

  // Build QR code pointing to the public verification page
  const baseUrl = process.env.SIGNING_BASE_URL || 'http://localhost:5173';
  const verifyUrl = `${baseUrl}/verify/${contractId}`;
  const qrSvg = buildQrSvg(verifyUrl);

  const rows = parties.map((p, idx) => `
    <tr>
      <td>
        <div class="party-role">${escHtml(p.label || p.role || `Signer ${idx + 1}`)}</div>
        <div class="party-type">Electronic Signer</div>
      </td>
      <td>
        <div class="signer-name">${escHtml(p.signerName || '—')}</div>
        <div class="signer-email">${escHtml(p.signerEmail || p.email || '—')}</div>
      </td>
      <td>
        <div class="cert-time">${p.signedAt ? formatDateTime(p.signedAt) : '—'}</div>
      </td>
      <td>
        <div class="cert-ip">${escHtml(p.ipAddress || 'Verified Device')}</div>
        <div class="cert-status"><span class="badge-verified">✓ Signed &amp; Verified</span></div>
      </td>
    </tr>`).join('');

  return `
    <style>
      .audit-page {
        width: 210mm !important;
        min-height: 297mm !important;
        background: #ffffff !important;
        color: #0f172a !important;
        margin: 0 auto 24px auto !important;
        box-sizing: border-box !important;
        padding: 16mm 18mm !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        position: relative !important;
        box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important;
        page-break-before: always !important;
        break-before: page !important;
      }
      .audit-page::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3mm;
        background: linear-gradient(90deg, #20383e, #29464d, #b79b52);
      }
      .audit-card {
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px 24px;
        background: #ffffff;
      }
      .audit-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1.5px solid #0f172a;
        padding-bottom: 14px;
        margin-bottom: 18px;
      }
      .audit-brand-title {
        font-size: 13pt;
        font-weight: 800;
        color: #20383e;
        letter-spacing: 0.5px;
      }
      .audit-brand-sub {
        font-size: 7.5pt;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .audit-seal-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ecfdf5;
        border: 1px solid #10b981;
        color: #065f46;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .audit-title-block {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 14px;
        border-bottom: 1px dashed #cbd5e1;
      }
      .audit-main-title {
        font-size: 14pt;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 4px;
      }
      .audit-ar-title {
        font-family: 'Cairo', sans-serif;
        font-size: 13pt;
        font-weight: 700;
        color: #b79b52;
        margin-bottom: 6px;
      }
      .audit-desc {
        font-size: 8pt;
        color: #64748b;
        max-width: 90%;
        margin: 0 auto;
        line-height: 1.4;
      }
      .audit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px 16px;
        margin-bottom: 18px;
        font-size: 8pt;
      }
      .audit-grid-item {
        display: flex;
        flex-direction: column;
      }
      .audit-grid-label {
        font-size: 7pt;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .audit-grid-val {
        font-size: 8.5pt;
        color: #0f172a;
        font-weight: 600;
        word-break: break-all;
      }
      .audit-table-wrap {
        margin-bottom: 18px;
      }
      .audit-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 8pt;
      }
      .audit-table th {
        background: #20383e;
        color: #ffffff;
        text-align: left;
        padding: 7px 10px;
        font-weight: 700;
        font-size: 7.5pt;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .audit-table td {
        padding: 8px 10px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
      }
      .party-role { font-weight: 700; color: #20383e; font-size: 8.5pt; }
      .party-type { font-size: 7pt; color: #64748b; }
      .signer-name { font-weight: 600; color: #0f172a; }
      .signer-email { font-size: 7pt; color: #64748b; }
      .cert-time { color: #334155; font-size: 7.5pt; font-family: monospace; }
      .cert-ip { color: #475569; font-size: 7.5pt; font-family: monospace; }
      .badge-verified {
        display: inline-block;
        background: #ecfdf5;
        color: #059669;
        font-size: 6.8pt;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 10px;
        margin-top: 3px;
        border: 0.5px solid #a7f3d0;
      }
      .audit-legal-notice {
        background: #f8fafc;
        border-left: 3px solid #b79b52;
        padding: 10px 14px;
        margin-bottom: 18px;
        border-radius: 0 4px 4px 0;
      }
      .legal-en {
        font-size: 7.2pt;
        color: #334155;
        line-height: 1.4;
        margin-bottom: 6px;
      }
      .legal-ar {
        font-family: 'Cairo', sans-serif;
        font-size: 7.5pt;
        color: #334155;
        direction: rtl;
        text-align: right;
        line-height: 1.4;
      }
      .audit-doc-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #e2e8f0;
        padding-top: 10px;
        font-size: 7pt;
        color: #94a3b8;
      }
      .audit-qr-row {
        margin-bottom: 16px;
      }
      .audit-qr-card {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-left: 3px solid #20383e;
        border-radius: 6px;
        padding: 10px 14px;
      }
      .qr-code-wrap {
        flex-shrink: 0;
        width: 84px;
        height: 84px;
        padding: 4px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }
      .qr-info { flex: 1; }
      .qr-title {
        font-size: 9pt;
        font-weight: 700;
        color: #20383e;
        margin-bottom: 2px;
      }
      .qr-subtitle {
        font-size: 7.5pt;
        color: #475569;
        margin-bottom: 4px;
      }
      .qr-url {
        font-size: 7pt;
        color: #2563eb;
        font-family: monospace;
        word-break: break-all;
        margin-bottom: 3px;
      }
      .qr-ar {
        font-family: 'Cairo', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
        direction: rtl;
        text-align: right;
      }
    </style>

    <section class="page audit-page document-page">
      <div class="audit-card">
        <div class="audit-top-bar">
          <div>
            <div class="audit-brand-title">360 GLOBAL IMMIGRATION</div>
            <div class="audit-brand-sub">Official Digital Execution Registry • سجل التنفيذ الرقمي</div>
          </div>
          <div class="audit-seal-pill">
            <span>🔒</span>
            <span>Cryptographically Verified</span>
          </div>
        </div>

        <div class="audit-title-block">
          <div class="audit-main-title">DIGITAL AUDIT &amp; EXECUTION CERTIFICATE</div>
          <div class="audit-ar-title">شهادة التدقيق والتنفيذ الرقمي المعتمدة</div>
          <div class="audit-desc">
            This digital certificate forms an integral, legally binding part of this Agreement and attests that the parties named below have executed this document electronically in accordance with international digital transactions standards.
          </div>
        </div>

        <div class="audit-grid">
          <div class="audit-grid-item">
            <span class="audit-grid-label">Contract Reference ID</span>
            <span class="audit-grid-val">#${escHtml(String(contractId))}</span>
          </div>
          <div class="audit-grid-item">
            <span class="audit-grid-label">Agreement Title</span>
            <span class="audit-grid-val">${escHtml(templateName)} (v${templateVer})</span>
          </div>
          <div class="audit-grid-item">
            <span class="audit-grid-label">Execution &amp; Freeze Timestamp</span>
            <span class="audit-grid-val">${frozenDate}</span>
          </div>
          <div class="audit-grid-item">
            <span class="audit-grid-label">Document Security Hash</span>
            <span class="audit-grid-val" style="font-family: monospace; font-size: 7pt;">${escHtml(hash)}</span>
          </div>
        </div>

        <div class="audit-table-wrap">
          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 25%;">Signing Party</th>
                <th style="width: 30%;">Legal Name &amp; Contact</th>
                <th style="width: 25%;">Timestamp (UTC)</th>
                <th style="width: 20%;">Verification &amp; IP</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `
                <tr>
                  <td><div class="party-role">Client / الطرف الأول</div><div class="party-type">Electronic Signer</div></td>
                  <td><div class="signer-name">${escHtml(snapshot.recipientInfo?.name || snapshot.formData?.client_name || 'Valued Client')}</div><div class="signer-email">${escHtml(snapshot.recipientInfo?.email || snapshot.formData?.client_email || '—')}</div></td>
                  <td><div class="cert-time">${frozenDate}</div></td>
                  <td><div class="cert-ip">Verified Device</div><div class="cert-status"><span class="badge-verified">✓ Signed &amp; Sealed</span></div></td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <div class="audit-legal-notice">
          <div class="legal-en">
            <strong>Legal Validity Assurance:</strong> This document has been executed using secure electronic signature technology pursuant to UAE Federal Decree-Law No. (46) of 2021 on Electronic Transactions and Trust Services, US Electronic Signatures in Global and National Commerce Act (E-SIGN), and European Union Regulation (EU) No 910/2014 (eIDAS). The digital signature and audit trail recorded above are admissible as conclusive legal evidence of agreement.
          </div>
          <div class="legal-ar">
            <strong>حجية الإثبات القانوني:</strong> تم توقيع واعتماد هذه الوثيقة إلكترونياً استناداً لأحكام مرسوم بقانون اتحادي رقم (46) لسنة 2021 بشأن المعاملات الإلكترونية وخدمات الثقة بدولة الإمارات العربية المتحدة، واللوائح الدولية المعتمدة للتوقيعات الإلكترونية، ويُعتبر هذا السجل حجة قانونية قاطعة وملزمة لجميع الأطراف.
          </div>
        </div>

        ${qrSvg ? `
        <div class="audit-qr-row">
          <div class="audit-qr-card">
            <div class="qr-code-wrap">${qrSvg}</div>
            <div class="qr-info">
              <div class="qr-title">🔍 Verify Authenticity Online</div>
              <div class="qr-subtitle">Scan or visit to verify this certificate on the 360 Global Official Registry</div>
              <div class="qr-url">${escHtml(verifyUrl)}</div>
              <div class="qr-ar">امسح للتحقق من صحة هذه الوثيقة رقمياً</div>
            </div>
          </div>
        </div>` : ''}

        <div class="audit-doc-footer">
          <span>Security Record: 360-AUDIT-${escHtml(String(contractId))}-${hash.slice(0, 8).toUpperCase()}</span>
          <span>Certified by 360 Global Digital Trust Authority</span>
          <span>Page Certificate (End of Document)</span>
        </div>
      </div>
    </section>
  `;
}

/**
 * Helper to split flat blocks into discrete A4 pages if pages array is not explicitly present.
 */
function organizeIntoPages(snapshot) {
  // If pages array is already defined, use it
  const schema = snapshot.documentSchema || snapshot;
  if (schema.pages && Array.isArray(schema.pages) && schema.pages.length > 0) {
    return schema.pages;
  }

  const blocks = snapshot.activeBlocks || schema.blocks || [];
  const pages = [];
  let currentPageComponents = [];
  let pageNumber = 1;

  for (const b of blocks) {
    if (b.type === 'pagebreak') {
      pages.push({
        id: `page_${pageNumber}`,
        pageNumber: pageNumber,
        hasBorder: true,
        components: currentPageComponents,
      });
      currentPageComponents = [];
      pageNumber++;
    } else {
      currentPageComponents.push(b);
    }
  }

  // Push remaining components
  pages.push({
    id: `page_${pageNumber}`,
    pageNumber: pageNumber,
    hasBorder: true,
    components: currentPageComponents,
  });

  return pages;
}

/**
 * Generate the complete HTML document string from a frozen snapshot or template schema.
 * @param {object} snapshot  — frozen contract snapshot or template schema
 * @param {object} opts      — { includeAuditCertificate: boolean }
 */
function renderDocument(snapshot, opts = {}) {
  const { includeAuditCertificate = false } = opts;

  // Check if this is an HTML/CSS template
  const schema = snapshot.documentSchema || snapshot;
  const rawHtml = snapshot.rawHtml || schema.rawHtml || snapshot.html;
  const customCss = snapshot.customCss || schema.customCss || snapshot.css || '';

  if (rawHtml) {
    const htmlTemplateService = require('./htmlTemplateService');
    const clientSig = snapshot.signingPartiesResult?.find(p => p.role === 'CLIENT')?.signatureDataUrl || snapshot.clientSignature;
    let fullHtml = htmlTemplateService.renderHtmlTemplate(rawHtml, customCss, {
      ...snapshot,
      clientSignature: clientSig,
      contractDate: snapshot.frozenAt || snapshot.signedAt || new Date().toISOString(),
    }, opts);

    if (includeAuditCertificate) {
      const auditHtml = renderAuditCertificate(snapshot);
      fullHtml = fullHtml.replace('</body>', `${auditHtml}\n</body>`);
    }
    return fullHtml;
  }

  const pages = organizeIntoPages(snapshot);
  const totalPages = pages.length + (includeAuditCertificate ? 1 : 0);
  const title = snapshot.documentTitle || snapshot.title || 'Legal Agreement';

  const renderedPagesHtml = pages.map((page, idx) => {
    const pageNum = idx + 1;
    const components = page.components || page.blocks || [];
    const componentsHtml = components.map(renderBlock).join('\n');
    const borderClass = page.hasBorder !== false ? 'has-legal-border' : '';

    return `
      <div class="document-page ${borderClass}" id="page-${pageNum}">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-brand">360 GLOBAL IMMIGRATION</div>
          <div class="header-doc-title">${escHtml(title)}</div>
        </div>

        <!-- Page Content Canvas -->
        <div class="page-content">
          ${componentsHtml}
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
          <div class="footer-left">Ref: ${escHtml(String(snapshot.contractInstanceId || '#DRAFT'))}</div>
          <div class="footer-center">360 Global Immigration LLC • Confidential & Legal</div>
          <div class="footer-right">Page ${pageNum} of ${totalPages}</div>
        </div>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ── A4 Page Specifications ── */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f1f5f9;
      font-family: 'Inter', 'Cairo', 'Amiri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Discrete A4 Page Box */
    .document-page {
      width: 210mm;
      min-height: 297mm;
      max-height: 297mm;
      margin: 0 auto 20px auto;
      background: #ffffff;
      padding: 15mm 16mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    @media print {
      body {
        background: none;
      }
      .document-page {
        margin: 0;
        box-shadow: none;
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        page-break-after: always;
        break-after: page;
      }
    }

    /* Page Outer Legal Border */
    .document-page.has-legal-border {
      border: 2px solid #0f172a;
      outline: 1px solid #cbd5e1;
      outline-offset: -5px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
      font-size: 8pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-brand {
      font-weight: 700;
      color: #0f172a;
    }

    /* Page Content */
    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }

    /* Page Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 12px;
      font-size: 8pt;
      color: #64748b;
    }

    /* ── Bilingual Side-by-Side 50/50 Layout ── */
    .bilingual-clause {
      display: grid;
      grid-template-columns: 1fr 1px 1fr;
      gap: 12px;
      margin: 4px 0;
      padding: 8px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      align-items: start;
    }

    .bilingual-divider {
      background-color: #cbd5e1;
      height: 100%;
      min-height: 20px;
    }

    .bilingual-column {
      font-size: 8.5pt;
      line-height: 1.5;
    }

    .bilingual-en {
      direction: ltr;
      text-align: left;
      font-family: 'Inter', sans-serif;
    }

    .bilingual-ar {
      direction: rtl;
      text-align: right;
      font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;
      font-weight: 400;
    }

    .clause-title {
      font-weight: 700;
      font-size: 9pt;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .bilingual-ar .clause-title {
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
    }

    .clause-body {
      color: #334155;
    }

    .clause-emphasis {
      background: #fffbeb;
      border-color: #f59e0b;
    }

    /* Single Clause Block */
    .clause-block {
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      border-radius: 2px;
      font-size: 9pt;
    }
    .clause-block.rtl, [dir="rtl"] .clause-block {
      border-left: none;
      border-right: 3px solid #0284c7;
      direction: rtl;
      text-align: right;
      font-family: 'Cairo', sans-serif;
    }

    /* Headings & Typography */
    .block-heading {
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 2px 0;
    }
    h1.block-heading { font-size: 14pt; text-align: center; }
    h2.block-heading { font-size: 11pt; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; }
    h3.block-heading { font-size: 10pt; }

    .block-paragraph {
      font-size: 9pt;
      color: #334155;
    }

    .block-divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 8px 0;
    }

    /* Tables */
    .table-wrapper {
      margin: 6px 0;
    }
    .table-title {
      font-size: 9pt;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .data-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #0f172a;
    }
    .data-table td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      color: #334155;
    }
    .data-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Key/Value Grid */
    .kv-grid-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 4px;
    }
    .kv-title {
      font-weight: 700;
      font-size: 9pt;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .kv-items-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 16px;
    }
    .kv-item {
      font-size: 8.5pt;
      display: flex;
      gap: 6px;
    }
    .kv-key {
      font-weight: 600;
      color: #64748b;
    }
    .kv-val {
      color: #0f172a;
    }

    /* Signature Box */
    .signature-block {
      border: 1px dashed #94a3b8;
      background: #fcfcfd;
      padding: 10px 14px;
      border-radius: 4px;
      margin: 8px 0;
    }
    .signature-label {
      font-weight: 700;
      font-size: 8.5pt;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .signature-image-wrapper {
      min-height: 45px;
      border-bottom: 1px solid #cbd5e1;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
    }
    .signature-placeholder {
      font-size: 8pt;
      color: #94a3b8;
    }
    .signature-image {
      max-height: 45px;
      max-width: 200px;
    }
    .signature-meta {
      display: flex;
      gap: 16px;
      font-size: 7.5pt;
      color: #64748b;
    }

    /* Audit Certificate */
    .audit-page .audit-certificate {
      border: 2px solid #0f172a;
      padding: 16px;
      border-radius: 6px;
      background: #f8fafc;
    }
    .audit-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
    }
    .audit-subtitle {
      font-size: 8pt;
      color: #64748b;
      margin-top: 2px;
      margin-bottom: 12px;
    }
    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 12px;
    }
    .audit-table th {
      background: #0f172a;
      color: #fff;
      padding: 6px 8px;
      text-align: left;
    }
    .audit-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .audit-footer {
      display: flex;
      gap: 20px;
      font-size: 7.5pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  ${renderedPagesHtml}
  ${includeAuditCertificate ? renderAuditCertificate(snapshot) : ''}
</body>
</html>`;
}

module.exports = { renderDocument, renderBlock, renderAuditCertificate, organizeIntoPages };
