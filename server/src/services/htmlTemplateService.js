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

  // Replace relative logo asset paths or previous CDN links with the configured logo
  if (logoUrl) {
    cleanHtml = cleanHtml
      .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, `src="${logoUrl}"`)
      .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, `src="${logoUrl}"`)
    // Replace primary logo images while preserving secondary logos / partner badges
    cleanHtml = cleanHtml.replace(/(<img\b(?=[^>]*\bclass=["'][^"']*\blogo\b)(?![^>]*\bsecondary-logo\b)[^>]*\bsrc=["'])[^"']+([^"']*["'])/gi, `$1${logoUrl}$2`);
  }

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
 * Format a date nicely without timezone shift
 */
function formatDate(d) {
  if (!d) d = new Date();
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    const [y, m, day] = d.trim().split('-').map(Number);
    const dateObj = new Date(y, m - 1, day);
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

/**
 * Ensure all .signature-line elements have data-field="signature.client" or data-field="signature.company"
 */
function ensureSignatureDataFields(html) {
  let processed = String(html || '');

  // 1. Contextual tagging based on label closest to each untagged signature line
  processed = processed.replace(
    /([\s\S]{1,300})(<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>)/gi,
    (match, precedingText, sigDiv) => {
      const clientIndex = Math.max(
        precedingText.lastIndexOf('Applicant'),
        precedingText.lastIndexOf('applicant'),
        precedingText.lastIndexOf('Client'),
        precedingText.lastIndexOf('client'),
        precedingText.lastIndexOf('المتقدم'),
        precedingText.lastIndexOf('العميل'),
        precedingText.lastIndexOf('المتعاقد')
      );
      const companyIndex = Math.max(
        precedingText.lastIndexOf('360GI'),
        precedingText.lastIndexOf('360 Global'),
        precedingText.lastIndexOf('شركة 360')
      );

      let targetField = '';
      if (clientIndex !== -1 && companyIndex !== -1) {
        // Whichever label is closer to the signature line wins
        targetField = clientIndex > companyIndex ? 'signature.client' : 'signature.company';
      } else if (clientIndex !== -1) {
        targetField = 'signature.client';
      } else if (companyIndex !== -1) {
        targetField = 'signature.company';
      }

      if (targetField) {
        return precedingText + sigDiv.replace(/class=["']([^"']*)["']/, `class="$1" data-field="${targetField}"`);
      }
      return match;
    }
  );

  // 2. Positional fallback tagging for any remaining untagged .signature-line elements on Page 11 & Page 12
  processed = processed.replace(/(<section\b[^>]*class=["'][^"']*\bpage-11\b[^"']*["'][\s\S]*?<\/section>)/gi, (pageMatch) => {
    let count = 0;
    return pageMatch.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, (sigDiv) => {
      count++;
      const field = (count % 2 === 1) ? 'signature.client' : 'signature.company';
      return sigDiv.replace(/class=["']([^"']*)["']/, `class="$1" data-field="${field}"`);
    });
  });

  processed = processed.replace(/(<section\b[^>]*class=["'][^"']*\bpage-12\b[^"']*["'][\s\S]*?<\/section>)/gi, (pageMatch) => {
    return pageMatch.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, (sigDiv) => {
      return sigDiv.replace(/class=["']([^"']*)["']/, 'class="$1" data-field="signature.client"');
    });
  });

  return processed;
}

/**
 * Restore any corrupted dummy strings back to standard tokens
 */
function restoreCorruptedTokens(html) {
  if (!html || typeof html !== 'string') return html || '';
  let cleaned = html;

  // 1. Restore trapped dummy values inside dynamic spans
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:full_)?name["'][^>]*>)\s*(?:ALI KAMRAN|Haris Khan)\s*(<\/span>)/gi, '$1{{client_name}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?passport(?:_or_eid|_number)?["'][^>]*>)\s*CQ4220892\s*(<\/span>)/gi, '$1{{passport_eid}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?nationality["'][^>]*>)\s*PAKISTANI\s*(<\/span>)/gi, '$1{{nationality}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:mobile|phone)["'][^>]*>)\s*\+966 54 128 1675\s*(<\/span>)/gi, '$1{{mobile}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?address["'][^>]*>)\s*RIYADH, SAUDI ARABIA\s*(<\/span>)/gi, '$1{{address}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?email["'][^>]*>)\s*kamran\.ali@gmail\.com\s*(<\/span>)/gi, '$1{{email}}$2');
  cleaned = cleaned.replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:date_of_birth|dob)["'][^>]*>)\s*14 APR 1991\s*(<\/span>)/gi, '$1{{date_of_birth}}$2');

  // 2. Declaration text restoration (English & Arabic as seen on Page 10 / Page 11)
  cleaned = cleaned.replace(/I\/we,\s*(?:<span\b[^>]*>)?\s*(?:ALI KAMRAN|Haris Khan)\s*(?:<\/span>)?\s*holding/gi, 'I/we, <span class="dynamic" data-field="applicant.full_name">{{client_name}}</span> holding');
  cleaned = cleaned.replace(/number\s*(?:<span\b[^>]*>)?\s*CQ4220892\s*(?:<\/span>)?\s*have hired/gi, 'number <span class="dynamic" data-field="applicant.passport_or_eid">{{passport_eid}}</span> have hired');

  cleaned = cleaned.replace(/أنا\/نحن،?\s*(?:<span\b[^>]*>)?\s*(?:ALI KAMRAN|Haris Khan)\s*(?:<\/span>)?،?\s*حامل/gi, 'أنا/نحن، <span class="dynamic" data-field="applicant.full_name">{{client_name}}</span>، حامل');
  cleaned = cleaned.replace(/جواز السفر رقم\s*(?:<span\b[^>]*>)?\s*CQ4220892\s*(?:<\/span>)?\s*،?\s*قد تعاقدت/gi, 'جواز السفر رقم <span class="dynamic" data-field="applicant.passport_or_eid">{{passport_eid}}</span>، قد تعاقدت');

  // 3. Table cells in Schedule One
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?CQ4220892(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.passport_or_eid">{{passport_eid}}</span>$2');
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?PAKISTANI(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.nationality">{{nationality}}</span>$2');
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?\+966 54 128 1675(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.mobile">{{mobile}}</span>$2');
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?RIYADH, SAUDI ARABIA(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.address">{{address}}</span>$2');
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?kamran\.ali@gmail\.com(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.email">{{email}}</span>$2');
  cleaned = cleaned.replace(/(<td\b[^>]*>\s*)(?:<span\b[^>]*>)?14 APR 1991(?:<\/span>)?(\s*<\/td>)/gi, '$1<span class="dynamic" data-field="applicant.date_of_birth">{{date_of_birth}}</span>$2');

  return cleaned;
}

/**
 * Substitute dynamic tokens into HTML template
 */
function renderHtmlTemplate(html, css, context = {}, options = {}) {
  const logoUrl = options.logoUrl || context.logoUrl || DEFAULT_LOGO_URL;
  const { html: normHtml, css: normCss } = normalizeTemplateAssets(html, css, logoUrl);
  let rendered = restoreCorruptedTokens(ensureSignatureDataFields(normHtml));

  const form = context.form || {};
  const contact = context.contact || {};
  const fees = context.fees || {};
  const applicant = context.applicant || {};
  const system = context.system || {};

  // Resolve values with flexible fallbacks - if not provided or empty, show '—'
  const fullName = applicant.full_name || form.client_name || form.recipientName || contact.name || context.fullName || context.name || '—';
  const passportOrEid = applicant.passport_or_eid || form.passport_number || form.passport_eid || form.idNumber || contact.passport || context.passportOrEid || context.passport || '—';
  const nationality = applicant.nationality || form.nationality || contact.nationality || context.nationality || '—';
  const mobile = applicant.mobile || form.phone || form.mobile || form.recipientPhone || contact.phone || context.mobile || context.phone || '—';
  const address = applicant.address || form.address || contact.address || context.address || '—';
  const email = applicant.email || form.client_email || form.recipientEmail || contact.email || context.email || '—';
  const dateOfBirth = applicant.date_of_birth || form.date_of_birth || form.dob || context.dateOfBirth || context.dob || '—';
  const dependents = applicant.dependents || form.dependents || form.note || context.dependents || context.note || '—';

  const sectionsConfig = form.sectionsConfig || {};
  const isCommercialTermsDisabled = sectionsConfig.commercialTerms === false;
  const isRteDisabled = isCommercialTermsDisabled || sectionsConfig.includeScheduleThreeRte === false;
  const isVarsDisabled = isCommercialTermsDisabled || sectionsConfig.includeIndividualVars === false;

  const totalFees = isVarsDisabled ? '' : (fees.total_fees || form.contract_value || '20,000 EUR');
  const totalAfterDiscount = isVarsDisabled ? '' : (fees.total_after_discount || form.discounted_amount || form.contract_value || '15,000 EUR');
  const currencyText = fees.currency_text || form.currency || 'THE GREAT BRITAIN POUND (GBP)';
  const paymentMode = isVarsDisabled ? '' : (fees.payment_mode || form.payment_terms || '50% Upon Signing, 50% on Approval');
  const additionalInfo = isVarsDisabled ? '' : (fees.additional_information || form.additional_information || form.visa_type || 'Standard Legal & Immigration Advisory');
  
  // Section 5: Commercial Terms & Fees (Schedule Three) rich editor content
  const scheduleThreeContent = isRteDisabled ? '' : (form.schedule_three_content || form.payment_breakup || fees.payment_breakup || form.commercial_terms || fees.commercial_terms || '50% Initial Deposit upon signing, 50% upon Visa Approval');
  const initialAmount = isVarsDisabled ? '' : (fees.initial_amount || form.discounted_amount || form.initial_deposit || '15,000 EUR');

  const contractDate = formatDate(form.contract_date || context.contractDate || form.created_at || system.currentDate);
  const jurisdiction = context.jurisdiction || form.jurisdiction || 'Courts of the Dubai International Financial Centre (“the DIFC COURTS”)';

  // Signatures & Company Seal
  const settingsService = require('./settingsService');
  const { DEFAULT_COMPANY_STAMP, DEFAULT_COMPANY_SIGNATURE } = require('../constants/defaultAssets');

  const clientSignature = context.clientSignature || form.signatureDataUrl || '';
  const companySignature = context.companySignature || options.companySignature || settingsService.get('COMPANY_SIGNATURE_URL') || DEFAULT_COMPANY_SIGNATURE;
  const companyStamp = context.companyStamp || options.companyStamp || settingsService.get('COMPANY_STAMP_URL') || DEFAULT_COMPANY_STAMP;

  const clientSigImg = clientSignature ? `<img src="${clientSignature}" alt="Client Signature" class="client-sig-img" style="max-height: 14mm; max-width: 90%; display: block; margin: auto;" />` : '';
  const compSigImg = companySignature ? `<img src="${companySignature}" alt="Company Signature" class="comp-sig-img" style="max-height: 13mm; max-width: 82%; display: block; margin: auto;" />` : '';
  const compStampImg = companyStamp ? `<img src="${companyStamp}" alt="Company Seal" class="comp-stamp-img" style="max-height: 22mm; max-width: 26mm; opacity: 0.88; transform: rotate(-5deg); filter: drop-shadow(0 1px 3px rgba(0,0,0,0.12)); display: block;" />` : '';

  // Build comprehensive replacement dictionary covering Belgium, Uruguay, Cyprus, and custom variants
  const replacements = {
    // Branding & Logo
    'logo_url': logoUrl,
    'company_logo': logoUrl,
    'cover_image': logoUrl,
    'cover_image_url': logoUrl,

    // Applicant Name
    'applicant.full_name': fullName,
    'applicant.name': fullName,
    'client_name': fullName,
    'recipient_name': fullName,
    'main_applicant': form.main_applicant || fullName,

    // Passport / EID
    'applicant.passport_or_eid': passportOrEid,
    'applicant.passport': passportOrEid,
    'passport_number': passportOrEid,
    'passport_eid': passportOrEid,
    'passport': passportOrEid,
    'idNumber': passportOrEid,

    // Nationality
    'applicant.nationality': nationality,
    'nationality': nationality,

    // Mobile / Phone
    'applicant.mobile': mobile,
    'applicant.phone': mobile,
    'mobile': mobile,
    'phone': mobile,
    'contact_number': mobile,

    // Address
    'applicant.address': address,
    'address': address,

    // Email
    'applicant.email': email,
    'client_email': email,
    'email': email,

    // Date of Birth
    'applicant.date_of_birth': dateOfBirth,
    'applicant.dob': dateOfBirth,
    'date_of_birth': dateOfBirth,
    'dob': dateOfBirth,

    // Dependents & Schedule Note
    'applicant.dependents': dependents,
    'dependents': dependents,
    'note': dependents,

    // Jurisdiction
    'jurisdiction': jurisdiction,

    // Fees & Totals (Individual Variable Inputs)
    'total_fees': totalFees,
    'fees.total_fees': totalFees,
    'contract_value': totalFees,
    'fees.contract_value': totalFees,
    'discounted_total': totalAfterDiscount,
    'total_after_discount': totalAfterDiscount,
    'fees.total_after_discount': totalAfterDiscount,
    'discounted_amount': totalAfterDiscount,
    'fees.discounted_amount': totalAfterDiscount,

    'fees.currency_text': currencyText,
    'currency': currencyText,

    'fees.payment_mode': paymentMode,
    'payment_mode': paymentMode,
    'payment_terms': paymentMode,
    'fees.payment_terms': paymentMode,

    'fees.additional_information': additionalInfo,
    'additional_information': additionalInfo,
    'visa_type': additionalInfo,
    'fees.visa_type': additionalInfo,

    // Schedule Three, Milestones & Commercial Terms
    'fees.payment_breakup': scheduleThreeContent,
    'payment_breakup': scheduleThreeContent,
    'schedule_three_content': scheduleThreeContent,
    'schedule_three': scheduleThreeContent,
    'commercial_terms': scheduleThreeContent,
    'fees.commercial_terms': scheduleThreeContent,
    'fees.schedule_three': scheduleThreeContent,
    'milestones': scheduleThreeContent,
    'fees.milestones': scheduleThreeContent,

    // Initial Deposit / Downpayment
    'fees.initial_amount': initialAmount,
    'initial_amount': initialAmount,
    'discounted_amount': initialAmount,
    'initial_deposit': initialAmount,

    // Dates
    'contract.date': contractDate,
    'contract_date': contractDate,
    'acceptance_date': contractDate,
    'declaration_date': contractDate,
    'date': contractDate,
    'today': contractDate,
    'today_date': contractDate,

    // Signature & Stamp shortcodes
    'signature.client': clientSigImg,
    'client_signature': clientSigImg,
    'user_signature': clientSigImg,
    'signature.company': compSigImg,
    'company_signature': compSigImg,
    'agent_signature': compSigImg,
    'company_stamp': compStampImg,
    'company_stamp_url': companyStamp,
  };

  // Handle Team Members Schedule One Dynamic Blueprint Repeater
  const teamMembers = form.teamMembers || context.teamMembers || form.team_members || context.team_members || [];
  if (Array.isArray(teamMembers) && teamMembers.length > 0 && !rendered.includes('data-schedule-one-processed="true"')) {
    const primaryApplicant = {
      name:        fullName,
      passport:    passportOrEid,
      nationality: nationality,
      phone:       mobile,
      address:     address,
      email:       email,
      dob:         dateOfBirth,
      note:        dependents,
      noteAr:      'الزوجة والأطفال دون 18 عاماً مشمولون.',
    };

    const extraApplicants = teamMembers.map(m => ({
      name:        m.name || m.fullName || '',
      passport:    m.passport || m.idNumber || '',
      nationality: m.nationality || '',
      phone:       m.phone || m.mobile || '',
      address:     m.address || '',
      email:       m.email || '',
      dob:         m.dob || '',
      note:        m.note || '',
      noteAr:      m.noteAr || m.note || '',
    }));

    const allApplicants = [primaryApplicant, ...extraApplicants];

    // Strictly cell-bounded (cannot cross </td>) to ensure ONLY Page 7 Schedule One is matched
    const enRegex = /(<td\b([^>]*\bclass=["'][^"']*\ben-cell\b[^"']*["'][^>]*)>(?:(?!<\/td>)[\s\S])*?<div\b[^>]*\bclass=["'][^"']*\bsection-title\b[^"']*["'][^>]*>(?:(?!<\/div>)[\s\S])*?SCHEDULE ONE[\s\S]*?<\/div>\s*)([\s\S]*?<table\b[^>]*>[\s\S]*?<\/table>(?:\s*<\/div>)?)\s*(?=<\/td>)/i;
    const arRegex = /(<td\b([^>]*\bclass=["'][^"']*\bar-cell\b[^"']*["'][^>]*)>(?:(?!<\/td>)[\s\S])*?<div\b[^>]*\bclass=["'][^"']*\bsection-title\b[^"']*["'][^>]*>(?:(?!<\/div>)[\s\S])*?الجدول الأول[\s\S]*?<\/div>\s*)([\s\S]*?<table\b[^>]*>[\s\S]*?<\/table>(?:\s*<\/div>)?)\s*(?=<\/td>)/i;

    const enMatch = rendered.match(enRegex);
    const arMatch = rendered.match(arRegex);

    if (enMatch && arMatch) {
      const enPrefix = enMatch[1];
      const enBlueprint = enMatch[3].trim();

      const arPrefix = arMatch[1];
      const arBlueprint = arMatch[3].trim();

      const buildCard = (blueprint, app, idx, isArabic) => {
        let card = blueprint;

        // Clean numbering: replace any existing "Main Applicant" label with clean number
        if (!isArabic) {
          if (card.includes('Main Applicant:')) {
            card = card.replace(/Main Applicant:\s*\d*/g, `Main Applicant: ${idx + 1}`);
          } else if (card.includes('Main Applicant')) {
            card = card.replace(/Main Applicant\s*\d*/g, `Main Applicant: ${idx + 1}`);
          } else {
            card = `<p class="clause" style="margin: 4px 0 2px; font-weight: 700; font-size: 8pt;">Main Applicant: ${idx + 1}</p>\n` + card;
          }
        } else {
          if (card.includes('المتقدم الرئيسي:')) {
            card = card.replace(/المتقدم الرئيسي:\s*\d*/g, `المتقدم الرئيسي: ${idx + 1}`);
          } else if (card.includes('المتقدم الرئيسي')) {
            card = card.replace(/المتقدم الرئيسي\s*\d*/g, `المتقدم الرئيسي: ${idx + 1}`);
          } else {
            card = `<p class="clause" style="margin: 4px 0 2px; font-weight: 700; font-size: 8pt;" dir="rtl">المتقدم الرئيسي: ${idx + 1}</p>\n` + card;
          }
        }

        const noteVal = isArabic ? (app.noteAr || app.note || '—') : (app.note || '—');

        const appMap = {
          'client_name': app.name,
          'applicant.full_name': app.name,
          'applicant.name': app.name,
          'main_applicant': app.name,
          'recipient_name': app.name,

          'passport_eid': app.passport,
          'passport_number': app.passport,
          'applicant.passport_or_eid': app.passport,
          'applicant.passport': app.passport,
          'passport': app.passport,
          'idnumber': app.passport,

          'nationality': app.nationality,
          'applicant.nationality': app.nationality,

          'mobile': app.phone,
          'phone': app.phone,
          'applicant.mobile': app.phone,
          'applicant.phone': app.phone,
          'contact_number': app.phone,

          'address': app.address,
          'applicant.address': app.address,

          'email': app.email,
          'client_email': app.email,
          'applicant.email': app.email,

          'date_of_birth': app.dob,
          'applicant.date_of_birth': app.dob,
          'dob': app.dob,

          'dependents': noteVal,
          'applicant.dependents': noteVal,
          'note': noteVal,
        };

        // First replace any standard {{tokens}}
        card = card.replace(/\{\{([^}]+)\}\}/g, (m, k) => {
          const clean = k.trim().toLowerCase();
          for (const [mk, mv] of Object.entries(appMap)) {
            if (mk.toLowerCase() === clean) {
              const val = (mv !== undefined && mv !== null && String(mv).trim() !== '') ? String(mv).trim() : '—';
              return val;
            }
          }
          return '—';
        });

        // Also clean out any static dummy placeholders in the blueprint!
        // This guarantees that even if the blueprint in the database had dummy text baked into it,
        // it is strictly replaced with the current applicant's actual values or '—'!
        card = card
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:full_)?name["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.name || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?passport(?:_or_eid|_number)?["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.passport || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?nationality["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.nationality || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:mobile|phone)["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.phone || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?address["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.address || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?email["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.email || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?(?:date_of_birth|dob)["'][^>]*>)[^<]*(<\/span>)/gi, `$1${app.dob || '—'}$2`)
          .replace(/(<span\b[^>]*\bdata-field=["'](?:applicant\.)?dependents["'][^>]*>)[^<]*(<\/span>)/gi, `$1${noteVal}$2`);

        // Extra fallback for plain text dummy values in blueprint
        card = card
          .replace(/\bCQ4220892\b/g, app.passport || '—')
          .replace(/\bPAKISTANI\b/g, app.nationality || '—')
          .replace(/\+966 54 128 1675/g, app.phone || '—')
          .replace(/RIYADH, SAUDI ARABIA/g, app.address || '—')
          .replace(/kamran\.ali@gmail\.com/g, app.email || '—')
          .replace(/14 APR 1991/g, app.dob || '—');

        // Ensure compact font and padding for multi-applicant view to avoid page-7 overflow
        card = card.replace(/<table\b([^>]*)>/i, '<table $1 style="font-size: 7.2pt; line-height: 1.25; margin-bottom: 2px;">');
        card = card.replace(/<td\b([^>]*)class=["']([^"']*\blabel\b[^"']*)["']/gi, '<td $1class="$2" style="padding: 1.2px 3px; font-size: 7.2pt;"');

        if (isArabic) {
          card = card.replace(/(<span\b[^>]*\bclass=["'][^"']*\bdynamic\b[^"']*["'])([^>]*>[\s\S]*?<\/span>)/gi, (m, openTag, rest) => {
            if ((openTag.includes('mobile') || openTag.includes('phone') || openTag.includes('email')) && !openTag.includes('dir=')) {
              return `${openTag} dir="ltr" style="direction: ltr; display: inline-block; unicode-bidi: embed;"${rest}`;
            }
            return m;
          });
        }

        return card;
      };

      const separator = '\n<div style="margin: 6px 0 4px; border-top: 1px dashed #cbd5e1;"></div>\n';
      const repeatedEn = allApplicants.map((app, idx) => buildCard(enBlueprint, app, idx, false)).join(separator);
      const repeatedAr = allApplicants.map((app, idx) => buildCard(arBlueprint, app, idx, true)).join(separator);

      rendered = rendered.replace(enMatch[0], () => `${enPrefix.replace('<td ', '<td data-schedule-one-processed="true" ')}\n${repeatedEn}`);
      rendered = rendered.replace(arMatch[0], () => `${arPrefix.replace('<td ', '<td data-schedule-one-processed="true" ')}\n${repeatedAr}`);
    }
  }

  // Replace remaining global document {{token}} occurrences
  rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const cleanKey = key.trim();
    if (replacements[cleanKey] !== undefined) {
      return replacements[cleanKey];
    }
    // Check nested form object
    if (form[cleanKey] !== undefined && form[cleanKey] !== null) return String(form[cleanKey]);
    if (contact[cleanKey] !== undefined && contact[cleanKey] !== null) return String(contact[cleanKey]);

    // Check case-insensitive match
    const lowerKey = cleanKey.toLowerCase();
    for (const [rk, rv] of Object.entries(replacements)) {
      if (rk.toLowerCase() === lowerKey) return rv;
    }

    // Return empty fallback instead of displaying broken raw handlebars to the user
    return '—';
  });

  // Handle Client Signature Injection into .signature-line
  if (clientSignature) {
    const sigImgTag = `<img src="${clientSignature}" alt="Client Signature" class="client-sig-img" style="max-height: 14mm; max-width: 90%; display: block; margin: auto;" />`;
    rendered = rendered.replace(
      /<div\b[^>]*\bdata-field=["']signature\.client["'][^>]*>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.client" style="display:flex;align-items:center;justify-content:center;background:#fff;">${sigImgTag}</div>`
    );
  }

  // Handle Company Signature & Stamp Injection into .signature-line
  if (companySignature || companyStamp) {
    let innerHtml = '';
    if (companySignature) {
      innerHtml += `<img src="${companySignature}" alt="Company Signature" class="comp-sig-img" style="max-height: 13mm; max-width: 82%; display: block; position: relative; z-index: 2;" />`;
    }
    if (companyStamp) {
      innerHtml += `<img src="${companyStamp}" alt="Company Seal" class="comp-stamp-img" style="max-height: 22mm; position: absolute; right: 2mm; top: -5mm; opacity: 0.88; transform: rotate(-5deg); z-index: 1; pointer-events: none;" />`;
    }

    rendered = rendered.replace(
      /<div\b[^>]*\bdata-field=["']signature\.company["'][^>]*>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.company" style="display:flex;align-items:center;justify-content:center;position:relative;background:#fff;overflow:visible;">${innerHtml}</div>`
    );
  }

  // Inject official company stamp onto agreement body pages (excluding cover page)
  // Strip any previously-injected stamps first so the latest Settings stamp is always used
  rendered = rendered.replace(/\n?\s*<div class=["']page-official-stamp["'][^>]*>[\s\S]*?<\/div>/gi, '');
  if (companyStamp) {
    const pageStampHtml = `\n  <div class="page-official-stamp" style="position: absolute; right: 18mm; bottom: 3.2mm; z-index: 9; pointer-events: none;"><img src="${companyStamp}" alt="Company Stamp" style="max-height: 19mm; max-width: 24mm; opacity: 0.86; transform: rotate(-6deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12)); display: block;" /></div>\n</section>`;
    rendered = rendered.replace(/(<section\b[^>]*class=["'][^"']*\bpage\b[^"']*["'][\s\S]*?)<\/section>/gi, (match, p1) => {
      if (/class=["'][^"']*\bcover\b[^"']*["']/i.test(p1)) {
        return match;
      }
      return `${p1}${pageStampHtml}`;
    });
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
