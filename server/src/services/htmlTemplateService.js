/**
 * htmlTemplateService.js — High-Fidelity HTML/CSS Template Engine & Parser
 *
 * Enables importing, parsing, storing, and rendering pixel-perfect A4
 * paired-table bilingual contract templates (English LTR / Arabic RTL)
 * directly from raw HTML and CSS.
 */

const DEFAULT_LOGO_URL = 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png';

/**
 * Clean and normalize imported HTML & CSS
 */
function normalizeTemplateAssets(html, css, logoUrl = DEFAULT_LOGO_URL) {
  let cleanHtml = String(html || '');
  let cleanCss = String(css || '');

  // Replace relative logo asset paths with the official high-res CDN logo
  cleanHtml = cleanHtml
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, `src="${logoUrl}"`)
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, `src="${logoUrl}"`)
    .replace(/src=["']assets\/[^"']+["']/gi, `src="${logoUrl}"`);

  // Ensure UTF-8 and necessary font links are preserved
  return { html: cleanHtml, css: cleanCss };
}

/**
 * Extract template metadata and detected dynamic variables from raw HTML
 */
function extractTemplateMetadata(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Bilingual Legal Services Agreement';

  const codeMatch = html.match(/data-template-code=["']([^"']+)["']/i);
  const templateCode = codeMatch ? codeMatch[1].trim() : 'LEGAL_SERVICES_AGREEMENT';

  // Count pages based on <section class="page">
  const pageMatches = html.match(/<section[^>]*class=["'][^"']*page[^"']*["']/gi);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Extract all {{token}} variables
  const tokenMatches = html.match(/\{\{([^}]+)\}\}/g) || [];
  const detectedVariables = Array.from(new Set(tokenMatches.map(t => t.replace(/[{}]/g, '').trim())));

  // Extract data-fields
  const dataFieldMatches = html.match(/data-field=["']([^"']+)["']/gi) || [];
  const dataFields = Array.from(new Set(dataFieldMatches.map(m => {
    const val = m.match(/data-field=["']([^"']+)["']/i);
    return val ? val[1].trim() : null;
  }).filter(Boolean)));

  return {
    title,
    templateCode,
    pageCount,
    detectedVariables,
    dataFields,
  };
}

/**
 * Format a date nicely
 */
function formatDate(d) {
  if (!d) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return String(d);
  }
}

/**
 * Substitute dynamic tokens into HTML template
 */
function renderHtmlTemplate(html, css, context = {}, options = {}) {
  const { html: normHtml, css: normCss } = normalizeTemplateAssets(html, css, options.logoUrl || DEFAULT_LOGO_URL);
  let rendered = normHtml;

  const form = context.form || {};
  const contact = context.contact || {};
  const fees = context.fees || {};
  const applicant = context.applicant || {};
  const system = context.system || {};

  // Resolve values with flexible fallbacks
  const fullName = applicant.full_name || form.client_name || contact.name || 'Valued Client';
  const passportOrEid = applicant.passport_or_eid || form.passport_number || form.idNumber || contact.passport || '—';
  const nationality = applicant.nationality || form.nationality || contact.nationality || '—';
  const mobile = applicant.mobile || form.phone || contact.phone || '—';
  const address = applicant.address || form.address || contact.address || '—';
  const email = applicant.email || form.client_email || contact.email || '—';
  const dateOfBirth = applicant.date_of_birth || form.date_of_birth || form.dob || '—';
  const dependents = applicant.dependents || form.dependents || form.note || 'Spouse & Kids under 18 are included.';

  const totalAfterDiscount = fees.total_after_discount || form.contract_value || '—';
  const currencyText = fees.currency_text || form.currency || 'THE GREAT BRITAIN POUND (GBP)';
  const paymentMode = fees.payment_mode || form.payment_terms || '100% Upfront';
  const additionalInfo = fees.additional_information || form.additional_information || form.visa_type || 'Standard Legal & Immigration Advisory';
  const paymentBreakup = fees.payment_breakup || form.schedule_three_content || form.payment_breakup || '50% Initial Deposit upon signing, 50% upon Visa Approval';
  const initialAmount = fees.initial_amount || form.discounted_amount || form.initial_deposit || '—';

  const contractDate = formatDate(context.contractDate || form.contract_date || system.currentDate);
  const jurisdiction = context.jurisdiction || form.jurisdiction || 'Dubai International Financial Centre (DIFC)';

  // Build replacement dictionary
  const replacements = {
    'applicant.full_name': fullName,
    'applicant.name': fullName,
    'client_name': fullName,

    'applicant.passport_or_eid': passportOrEid,
    'applicant.passport': passportOrEid,
    'passport_number': passportOrEid,

    'applicant.nationality': nationality,
    'nationality': nationality,

    'applicant.mobile': mobile,
    'applicant.phone': mobile,
    'phone': mobile,

    'applicant.address': address,
    'address': address,

    'applicant.email': email,
    'client_email': email,

    'applicant.date_of_birth': dateOfBirth,
    'applicant.dob': dateOfBirth,
    'date_of_birth': dateOfBirth,

    'applicant.dependents': dependents,
    'dependents': dependents,

    'jurisdiction': jurisdiction,

    'fees.total_after_discount': totalAfterDiscount,
    'contract_value': totalAfterDiscount,

    'fees.currency_text': currencyText,
    'currency': currencyText,

    'fees.payment_mode': paymentMode,
    'payment_terms': paymentMode,

    'fees.additional_information': additionalInfo,
    'additional_information': additionalInfo,

    'fees.payment_breakup': paymentBreakup,
    'payment_breakup': paymentBreakup,
    'schedule_three_content': form.schedule_three_content || paymentBreakup,
    'commercial_terms': form.schedule_three_content || paymentBreakup,

    'fees.initial_amount': initialAmount,
    'initial_amount': initialAmount,
    'discounted_amount': initialAmount,

    'contract.date': contractDate,
    'contract_date': contractDate,
  };

  // Replace {{token}} occurrences
  rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const cleanKey = key.trim();
    if (replacements[cleanKey] !== undefined) {
      return replacements[cleanKey];
    }
    // Check nested form object
    if (form[cleanKey] !== undefined) return String(form[cleanKey]);
    if (contact[cleanKey] !== undefined) return String(contact[cleanKey]);
    return match;
  });

  // Handle Team Members Schedule One Repeater if group/team mode
  const teamMembers = form.teamMembers || context.teamMembers || [];
  if (Array.isArray(teamMembers) && teamMembers.length > 0) {
    // Generate extra applicants HTML for English and Arabic Schedule One
    const extraApplicantsEn = teamMembers.map((m, idx) => `
      <div class="data-wrap" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
        <table class="table-like">
          <tr><td class="label">Main Applicant: ${idx + 2}</td><td></td></tr>
          <tr><td class="label">Name:</td><td><span class="dynamic">${m.name || m.fullName || '—'}</span></td></tr>
          <tr><td class="label">Passport/EID No.:</td><td><span class="dynamic">${m.passport || m.idNumber || '—'}</span></td></tr>
          <tr><td class="label">Nationality:</td><td><span class="dynamic">${m.nationality || '—'}</span></td></tr>
          <tr><td class="label">Mobile:</td><td><span class="dynamic">${m.phone || m.mobile || '—'}</span></td></tr>
          <tr><td class="label">Address:</td><td><span class="dynamic">${m.address || address || '—'}</span></td></tr>
          <tr><td class="label">Email Address:</td><td><span class="dynamic">${m.email || '—'}</span></td></tr>
          <tr><td class="label">Date of Birth:</td><td><span class="dynamic">${m.dob || '—'}</span></td></tr>
          <tr><td class="label">Dependents:</td><td><span class="dynamic">${m.note || 'Spouse & Kids under 18 are included.'}</span></td></tr>
        </table>
      </div>
    `).join('\n');

    const extraApplicantsAr = teamMembers.map((m, idx) => `
      <div class="data-wrap" dir="rtl" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
        <table class="table-like" dir="rtl">
          <tr><td class="label">المتقدم الرئيسي: ${idx + 2}</td><td></td></tr>
          <tr><td class="label">الاسم:</td><td><span class="dynamic">${m.name || m.fullName || '—'}</span></td></tr>
          <tr><td class="label">رقم جواز السفر / الهوية:</td><td><span class="dynamic">${m.passport || m.idNumber || '—'}</span></td></tr>
          <tr><td class="label">الجنسية:</td><td><span class="dynamic">${m.nationality || '—'}</span></td></tr>
          <tr><td class="label">المحمول:</td><td><span class="dynamic">${m.phone || m.mobile || '—'}</span></td></tr>
          <tr><td class="label">العنوان:</td><td><span class="dynamic">${m.address || address || '—'}</span></td></tr>
          <tr><td class="label">عنوان البريد الإلكتروني:</td><td><span class="dynamic">${m.email || '—'}</span></td></tr>
          <tr><td class="label">تاريخ الميلاد:</td><td><span class="dynamic">${m.dob || '—'}</span></td></tr>
          <tr><td class="label">المعالون:</td><td><span class="dynamic">${m.noteAr || m.note || 'الزوجة والأطفال دون 18 عاماً مشمولون.'}</span></td></tr>
        </table>
      </div>
    `).join('\n');

    // Inject after the primary applicant table inside page 7
    rendered = rendered.replace(
      /(<td class="en-cell">[\s\S]*?<div class="section-title">SCHEDULE ONE:<\/div>[\s\S]*?<div class="data-wrap">[\s\S]*?<\/div>)/i,
      `$1\n${extraApplicantsEn}`
    );
    rendered = rendered.replace(
      /(<td class="ar-cell">[\s\S]*?<div class="section-title">الجدول الأول:<\/div>[\s\S]*?<div class="data-wrap">[\s\S]*?<\/div>)/i,
      `$1\n${extraApplicantsAr}`
    );
  }

  // Handle Client Signature Injection if provided
  const clientSignature = context.clientSignature || form.signatureDataUrl;
  if (clientSignature) {
    const sigImgTag = `<img src="${clientSignature}" alt="Client Signature" style="max-height: 12mm; max-width: 90%; display: block; margin: auto;" />`;
    rendered = rendered.replace(
      /<div class=["']signature-line["'] data-field=["']signature\.client["']>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.client" style="display:flex;align-items:center;justify-content:center;background:#fff;">${sigImgTag}</div>`
    );
  }

  // Handle Company Signature
  const companySignature = context.companySignature || options.companySignature;
  if (companySignature) {
    const compSigImg = `<img src="${companySignature}" alt="Company Signature" style="max-height: 12mm; max-width: 90%; display: block; margin: auto;" />`;
    rendered = rendered.replace(
      /<div class=["']signature-line["'] data-field=["']signature\.company["']>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.company" style="display:flex;align-items:center;justify-content:center;background:#fff;">${compSigImg}</div>`
    );
  }

  // Wrap in standalone document HTML if requested or if missing outer wrapper
  if (!rendered.includes('<!DOCTYPE html>')) {
    rendered = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${extractTemplateMetadata(normHtml).title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
${normCss}
</style>
</head>
<body>
${rendered}
</body>
</html>`;
  } else {
    // Inject custom CSS into existing <head>
    if (!rendered.includes('<style>') && normCss) {
      rendered = rendered.replace('</head>', `<style>\n${normCss}\n</style>\n</head>`);
    } else if (rendered.includes('<link rel="stylesheet" href="styles.css" />')) {
      rendered = rendered.replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${normCss}\n</style>`);
    }
  }

  return rendered;
}

module.exports = {
  DEFAULT_LOGO_URL,
  normalizeTemplateAssets,
  extractTemplateMetadata,
  renderHtmlTemplate,
};
