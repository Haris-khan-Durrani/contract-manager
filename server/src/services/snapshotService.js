/**
 * snapshotService.js — Immutable Contract Send Snapshot Builder
 *
 * At the moment of SEND, this service:
 *   1. Fetches the latest permitted GHL Contact + Opportunity data.
 *   2. Merges with form responses from the contract instance.
 *   3. Authoritatively resolves all calculated fields.
 *   4. Authoritatively evaluates all conditions to select active clauses.
 *   5. Assembles the final rendered document structure.
 *   6. Freezes ONE immutable snapshot JSON object.
 *
 * After this snapshot is created, NO subsequent change to GHL Contact,
 * Opportunity, or the contract template can alter the sent document.
 */
const ghlService       = require('./ghlService');
const conditionEngine  = require('./conditionEngine');
const formulaEngine    = require('./formulaEngine');
const db               = require('../config/db');

/**
 * Build the data context from all sources.
 * @param {object} ghlContact     — full GHL Contact object
 * @param {object} ghlOpportunity — full GHL Opportunity object (or null)
 * @param {object} formResponse   — saved form_response_json
 * @param {object} systemValues   — { contractId, currentDate, assignedUserName, ... }
 */
function buildContext(ghlContact, ghlOpportunity, formResponse, systemValues) {
  const contact = {
    id:         ghlContact?.id,
    name:       ghlContact?.fullNameLowerCase || `${ghlContact?.firstName || ''} ${ghlContact?.lastName || ''}`.trim(),
    first_name: ghlContact?.firstName,
    last_name:  ghlContact?.lastName,
    email:      ghlContact?.email,
    phone:      ghlContact?.phone,
    address:    ghlContact?.address1,
    city:       ghlContact?.city,
    country:    ghlContact?.country,
    // Flatten custom fields into the contact namespace
    ...(ghlContact?.customFields || []).reduce((acc, cf) => {
      acc[cf.id] = cf.value;
      return acc;
    }, {}),
  };

  const opportunity = ghlOpportunity ? {
    id:       ghlOpportunity.id,
    name:     ghlOpportunity.name,
    value:    ghlOpportunity.monetaryValue || 0,
    pipeline: ghlOpportunity.pipelineId,
    stage:    ghlOpportunity.pipelineStageId,
    status:   ghlOpportunity.status,
    // Flatten custom fields
    ...(ghlOpportunity?.customFields || []).reduce((acc, cf) => {
      acc[cf.id] = cf.value;
      return acc;
    }, {}),
  } : {};

  return {
    contact,
    opportunity,
    form:   formResponse  || {},
    system: systemValues  || {},
    calc:   {}, // will be populated below
  };
}

/**
 * Replace all template variable tokens in a string with resolved values.
 * Supports: {{contact.name}}, {{form.passport_number}}, {{calc.total}}, {{system.current_date}}
 * @param {string} text
 * @param {object} context
 */
function resolveTokens(text, context) {
  if (typeof text !== 'string') return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const p = path.trim();
    if (context.form && context.form[p] !== undefined && context.form[p] !== null && context.form[p] !== '') {
      return String(context.form[p]);
    }
    if (context.contact && context.contact[p] !== undefined && context.contact[p] !== null && context.contact[p] !== '') {
      return String(context.contact[p]);
    }
    if (context.calc && context.calc[p] !== undefined && context.calc[p] !== null) {
      return String(context.calc[p]);
    }
    if (context.system && context.system[p] !== undefined && context.system[p] !== null) {
      return String(context.system[p]);
    }
    const val = conditionEngine.resolveField(p, context);
    return val !== undefined && val !== null ? String(val) : `{{${p}}}`;
  });
}

/**
 * Recursively resolve tokens in a document schema object.
 */
function resolveDocumentTokens(obj, context) {
  if (typeof obj === 'string') return resolveTokens(obj, context);
  if (Array.isArray(obj)) return obj.map(item => resolveDocumentTokens(item, context));
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = resolveDocumentTokens(val, context);
    }
    return result;
  }
  return obj;
}

/**
 * Build the immutable contract snapshot.
 *
 * @param {object} opts
 * @param {number} opts.contractInstanceId
 * @param {object} opts.template            — contract_templates row
 * @param {object} opts.formSchema          — contract_forms schema_json
 * @param {object} opts.formResponse        — current form_response_json
 * @param {string} opts.locationId
 * @param {string} opts.ghlContactId
 * @param {string} opts.ghlOpportunityId
 * @param {string} opts.assignedUserName
 */
async function buildSnapshot(opts) {
  const {
    contractInstanceId,
    template,
    formSchema,
    formResponse,
    locationId,
    ghlContactId,
    ghlOpportunityId,
    assignedUserName,
  } = opts;

  // 1. Fetch latest live GHL data (with graceful fallback if GHL token is invalid or API is unreachable)
  let ghlContact = null;
  let ghlOpportunity = null;

  try {
    ghlContact = await ghlService.getContact(locationId, ghlContactId, opts.privateToken).catch(() => null);
  } catch (e) {
    console.warn('[SnapshotService] Failed to fetch GHL Contact, falling back to cached/form data:', e.message);
  }

  if (ghlOpportunityId) {
    try {
      ghlOpportunity = await ghlService.getOpportunity(locationId, ghlOpportunityId, opts.privateToken).catch(() => null);
    } catch (e) {
      console.warn('[SnapshotService] Failed to fetch GHL Opportunity:', e.message);
    }
  }

  // If GHL contact was not returned (e.g. invalid token), synthesize basic contact from formResponse
  if (!ghlContact) {
    ghlContact = {
      id: ghlContactId,
      fullNameLowerCase: formResponse?.name || formResponse?.client_name || formResponse?.applicant_name || 'Client',
      firstName: formResponse?.first_name || formResponse?.name?.split(' ')?.[0] || 'Client',
      lastName: formResponse?.last_name || formResponse?.name?.split(' ')?.[1] || '',
      email: formResponse?.email || formResponse?.client_email || '',
      phone: formResponse?.phone || formResponse?.mobile || '',
      address1: formResponse?.address || formResponse?.client_address || '',
      city: formResponse?.city || '',
      country: formResponse?.country || '',
      customFields: []
    };
  }

  const systemValues = {
    contract_id:        contractInstanceId,
    current_date:       new Date().toLocaleDateString('en-GB'),
    current_datetime:   new Date().toISOString(),
    assigned_user_name: assignedUserName || '',
    location_id:        locationId,
  };

  // 2. Build context
  const context = buildContext(ghlContact, ghlOpportunity, formResponse, systemValues);

  // 3. Authoritatively resolve calculated fields
  const fields = formSchema?.fields || [];
  const calcValues = formulaEngine.resolveCalculatedFields(fields, context);
  context.calc = calcValues;

  // 4. Authoritatively select active document blocks
  const allBlocks      = template.document_schema_json?.blocks || [];
  const conditionalRules = template.conditional_rules_json || null;
  const activeBlocks   = conditionEngine.getActiveBlocks(allBlocks, context);

  // 5. Resolve all tokens in active blocks
  const renderedBlocks = resolveDocumentTokens(activeBlocks, context);

  // Construct full list of applicants (Applicant 1 + additional team applicants)
  const primaryApplicant = {
    name:        formResponse?.client_name || ghlContact?.fullNameLowerCase || '',
    passport:    formResponse?.passport_number || '',
    nationality: formResponse?.nationality || '',
    phone:       formResponse?.phone || ghlContact?.phone || '',
    address:     formResponse?.address || ghlContact?.address1 || '',
    email:       formResponse?.client_email || ghlContact?.email || '',
    dob:         formResponse?.date_of_birth || '',
    note:        formResponse?.note || 'Spouse & Kids under 18 are included.',
    noteAr:      formResponse?.note_ar || 'الزوجة والأطفال دون 18 عاماً مشمولون.',
  };

  const extraApplicants = (Array.isArray(formResponse?.teamMembers) ? formResponse.teamMembers : []).map(m => ({
    name:        m.fullName || m.name || '',
    passport:    m.idNumber || m.passport || '',
    nationality: m.nationality || '',
    phone:       m.phone || m.mobile || '',
    address:     m.address || '',
    email:       m.email || '',
    dob:         m.dob || '',
    note:        m.note || 'Spouse & Kids under 18 are included.',
    noteAr:      m.noteAr || m.note || 'الزوجة والأطفال دون 18 عاماً مشمولون.',
  }));

  const allApplicants = [primaryApplicant, ...extraApplicants];

  // Populate Schedule One block (Main Applicant 1, Main Applicant 2, ...)
  for (const b of renderedBlocks) {
    if (b.id === 'b_schedule_one' || (b.titleEn && b.titleEn.includes('SCHEDULE ONE'))) {
      b.contentEn = allApplicants.map((app, idx) => `
<div class="applicant-schedule-entry" style="margin-bottom: 20px;">
  <div style="font-weight: bold; font-size: 1.05em; margin-bottom: 6px;">Main Applicant: ${idx + 1}</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.92em;">
    <tr><td style="width: 130px; font-weight: bold; padding: 2px 0;">Name:</td><td>${app.name || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Passport No:</td><td>${app.passport || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Nationality:</td><td>${app.nationality || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Mobile:</td><td>${app.phone || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Address:</td><td>${app.address || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Email Address:</td><td>${app.email || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Date of Birth:</td><td>${app.dob || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">Note:</td><td>${app.note || 'Spouse & Kids under 18 are included.'}</td></tr>
  </table>
</div>
      `.trim()).join('\n<hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 12px 0;" />\n');

      b.contentAr = allApplicants.map((app, idx) => `
<div class="applicant-schedule-entry" dir="rtl" style="margin-bottom: 20px; font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;">
  <div style="font-weight: bold; font-size: 1.05em; margin-bottom: 6px;">المتقدم الرئيسي: ${idx + 1}</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.92em;" dir="rtl">
    <tr><td style="width: 140px; font-weight: bold; padding: 2px 0;">الاسم:</td><td>${app.name || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">رقم جواز السفر:</td><td>${app.passport || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">الجنسية:</td><td>${app.nationality || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">المحمول:</td><td>${app.phone || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">العنوان:</td><td>${app.address || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">عنوان البريد الإلكتروني:</td><td>${app.email || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">تاريخ الميلاد:</td><td>${app.dob || '—'}</td></tr>
    <tr><td style="font-weight: bold; padding: 2px 0;">ملاحظة:</td><td>${app.noteAr || app.note || 'الزوجة والأطفال دون 18 عاماً مشمولون.'}</td></tr>
  </table>
</div>
      `.trim()).join('\n<hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 12px 0;" />\n');

      b.bilingual = true;
    }
  }

  // If team members are provided and not yet injected into a team summary, include covered team table
  if (Array.isArray(formResponse?.teamMembers) && formResponse.teamMembers.length > 0) {
    const hasTeamBlock = renderedBlocks.some(b => b.type === 'team_summary');
    if (!hasTeamBlock) {
      const teamTableBlock = {
        id: 'block_team_summary_auto',
        type: 'team_summary',
        bilingual: true,
        titleEn: 'Covered Team / Group Members',
        titleAr: 'الأعضاء والمرافقون المشمولون بالعقد',
        members: formResponse.teamMembers,
      };
      const sigIdx = renderedBlocks.findIndex(b => b.type === 'signature');
      if (sigIdx !== -1) {
        renderedBlocks.splice(sigIdx, 0, teamTableBlock);
      } else {
        renderedBlocks.push(teamTableBlock);
      }
    }
  }

  // 6. Check for HTML/CSS template schema
  const docSchema = typeof template.document_schema_json === 'string'
    ? JSON.parse(template.document_schema_json)
    : template.document_schema_json || {};

  const rawHtml = docSchema.rawHtml || template.rawHtml;
  const customCss = docSchema.customCss || template.customCss;
  let renderedRawHtml = null;

  if (rawHtml) {
    const htmlTemplateService = require('./htmlTemplateService');
    renderedRawHtml = htmlTemplateService.renderHtmlTemplate(rawHtml, customCss, {
      form: formResponse,
      contact: ghlContact,
      system: systemValues,
      teamMembers: formResponse?.teamMembers,
      contractDate: new Date().toLocaleDateString('en-GB'),
      applicant: {
        full_name: formResponse.client_name || primaryApplicant.name,
        passport_or_eid: formResponse.passport_number || primaryApplicant.passport,
        nationality: formResponse.nationality || primaryApplicant.nationality,
        mobile: formResponse.phone || primaryApplicant.phone,
        address: formResponse.address || primaryApplicant.address,
        email: formResponse.client_email || primaryApplicant.email,
        date_of_birth: formResponse.date_of_birth || primaryApplicant.dob,
        dependents: formResponse.note || formResponse.dependents || primaryApplicant.note,
      },
      fees: {
        total_after_discount: formResponse.contract_value,
        initial_amount: formResponse.discounted_amount || formResponse.initial_deposit,
        currency_text: formResponse.currency || 'THE GREAT BRITAIN POUND (GBP)',
        payment_mode: formResponse.payment_terms,
        additional_information: formResponse.visa_type || formResponse.additional_information,
        payment_breakup: formResponse.payment_breakup,
      },
    });
  }

  // 7. Assemble immutable snapshot
  const snapshot = {
    version:            1,
    frozenAt:           new Date().toISOString(),
    contractInstanceId,
    templateId:         template.id,
    templateVersion:    template.current_version,
    templateName:       template.name,
    ghlContact,
    ghlOpportunity,
    formResponse,
    calcValues,
    systemValues,
    conditionContext:   context,
    activeBlocks:       renderedBlocks,
    rawHtml:            renderedRawHtml || rawHtml,
    customCss:          customCss,
    documentTitle:      resolveTokens(docSchema?.title || template.name, context),
  };

  return { snapshot, context, renderedBlocks };
}

module.exports = { buildSnapshot, resolveTokens, buildContext };
