/**
 * clientSummaryPdfService.js — Renders official Client Summary Form to A4 PDF Buffer
 */
const pdfService = require('./pdfService');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderValue(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (Array.isArray(val)) return val.join(', ') || '—';
  if (typeof val === 'boolean') return val ? 'YES' : 'NO';
  return escapeHtml(val);
}

function renderYesNo(val) {
  const norm = String(val || '').toLowerCase();
  const isYes = norm === 'yes' || norm === 'true' || norm === '1';
  const isNo = norm === 'no' || norm === 'false' || norm === '0';
  return `
    <span class="badge-yn ${isYes ? 'badge-yes' : ''}">[ ${isYes ? '✓' : '&nbsp;'} ] YES</span>
    <span class="badge-yn ${isNo ? 'badge-no' : ''}" style="margin-left: 12px;">[ ${isNo ? '✓' : '&nbsp;'} ] NO</span>
  `;
}

/**
 * Generate full HTML and convert to PDF buffer
 */
async function generateSummaryPdf(contract, summaryData = {}) {
  const data = summaryData || {};
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  const actionPlan = Array.isArray(data.action_plan) ? data.action_plan : [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Client Summary Form - #${escapeHtml(contract.id)} - ${escapeHtml(contract.recipient_name)}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 14mm 15mm;
  }
  * {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  body {
    margin: 0;
    padding: 0;
    color: #0f172a;
    font-size: 11px;
    line-height: 1.4;
    background: #fff;
  }
  .page {
    page-break-after: always;
    break-after: page;
    min-height: 250mm;
    position: relative;
    padding-bottom: 25px;
  }
  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }
  .doc-header {
    text-align: center;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .doc-title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    margin: 0;
    color: #0f172a;
  }
  .doc-sub {
    font-size: 10px;
    color: #64748b;
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .section-banner {
    background: #1e3a8a;
    color: #ffffff;
    padding: 6px 10px;
    font-weight: 700;
    font-size: 12px;
    border-radius: 4px;
    margin: 12px 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .grid-2 {
    display: flex;
    gap: 12px;
  }
  .grid-2 > div {
    flex: 1;
  }
  .field-row {
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 3px;
  }
  .field-label {
    font-weight: 700;
    color: #334155;
    font-size: 10.5px;
    min-width: 140px;
    flex-shrink: 0;
  }
  .field-value {
    color: #0f172a;
    font-size: 11px;
    word-break: break-word;
    flex: 1;
  }
  .qa-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    border: 1px solid #cbd5e1;
  }
  .qa-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    vertical-align: top;
    font-size: 10.5px;
  }
  .col-num {
    width: 28px;
    text-align: center;
    font-weight: 700;
    background: #f8fafc;
    color: #475569;
  }
  .badge-yn {
    display: inline-block;
    font-weight: 600;
    font-size: 10px;
    color: #64748b;
  }
  .badge-yes {
    color: #15803d;
    font-weight: 700;
  }
  .badge-no {
    color: #b91c1c;
    font-weight: 700;
  }
  .sub-box {
    margin-top: 4px;
    padding: 4px 8px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 4px;
    font-size: 10px;
  }
  .page-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
  }
  .sig-box {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px;
    background: #fff;
    margin-top: 10px;
  }
  .att-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }
  .att-table th {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    font-size: 10px;
    text-align: left;
    color: #334155;
  }
  .att-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    font-size: 10px;
  }
</style>
</head>
<body>

  <!-- ═════════ PAGE 1: GENERAL INFO ═════════ -->
  <div class="page">
    <div class="doc-header">
      <h1 class="doc-title">CLIENT SUMMARY FORM</h1>
      <div class="doc-sub">360 Global Immigration • Case Registration & Intake Dossier</div>
    </div>

    <div class="grid-2">
      <div class="field-row">
        <span class="field-label">Registration No:</span>
        <span class="field-value">${renderValue(data.reg_number || `REG-${contract.id}`)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Registration Date:</span>
        <span class="field-value">${renderValue(data.reg_date || contract.signed_at?.slice(0, 10))}</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="field-row">
        <span class="field-label">Registered at:</span>
        <span class="field-value">${renderValue(data.registered_at || 'Dubai')}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Counsellor Name:</span>
        <span class="field-value">${renderValue(data.counsellor_name || contract.assigned_user_name)}</span>
      </div>
    </div>

    <div class="field-row">
      <span class="field-label">Country Applying From:</span>
      <span class="field-value">${renderValue(data.country_applying_from)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Country Applying For:</span>
      <span class="field-value"><strong>${renderValue(data.country_applying_for || contract.template_name)}</strong></span>
    </div>
    <div class="field-row">
      <span class="field-label">Applying Category:</span>
      <span class="field-value">${renderValue(data.applying_category || contract.contract_type)}</span>
    </div>

    <div class="section-banner">Personal Information of Primary Applicant</div>

    <div class="field-row">
      <span class="field-label">Client Name:</span>
      <span class="field-value"><strong>${renderValue(data.client_name || contract.recipient_name)}</strong></span>
    </div>

    <div class="grid-2">
      <div class="field-row">
        <span class="field-label">Nationality:</span>
        <span class="field-value">${renderValue(data.nationality)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Date of Birth:</span>
        <span class="field-value">${renderValue(data.dob)}</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="field-row">
        <span class="field-label">Landline Contact:</span>
        <span class="field-value">${renderValue(data.contact_landline)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Mobile Number:</span>
        <span class="field-value">${renderValue(data.contact_mobile || contract.recipient_phone)}</span>
      </div>
    </div>

    <div class="field-row">
      <span class="field-label">Email Address:</span>
      <span class="field-value">${renderValue(data.email || contract.recipient_email)}</span>
    </div>

    <div class="field-row" style="align-items: flex-start;">
      <span class="field-label">Residential Address:</span>
      <span class="field-value">${renderValue(data.residential_address)}</span>
    </div>

    <div class="field-row">
      <span class="field-label">Expected Submission Time:</span>
      <span class="field-value"><strong>${data.expected_submission === '12_weeks' ? '12 Weeks' : '8 Weeks'}</strong></span>
    </div>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Page 1</span>
    </div>
  </div>

  <!-- ═════════ PAGE 2: IMMIGRATION HISTORY ═════════ -->
  <div class="page">
    <div class="section-banner">Page 2: Immigration Background / History</div>

    <table class="qa-table">
      <tr>
        <td class="col-num">1</td>
        <td>
          <strong>Have you ever applied for any of the following countries?</strong><br>
          ${renderValue(data.q1_applied_countries)}
        </td>
      </tr>
      <tr>
        <td class="col-num">2</td>
        <td>
          <strong>Have you ever been refused a visa for any country?</strong> &nbsp; ${renderYesNo(data.q2_refused_visa)}
          ${data.q2_refused_visa === 'yes' && data.q2_details ? `
            <div class="sub-box">
              Country: ${renderValue(data.q2_details.country)} | Visa Type: ${renderValue(data.q2_details.visa_type)}<br>
              Date: ${renderValue(data.q2_details.refusal_date)} | Reason: ${renderValue(data.q2_details.refusal_reason)}
            </div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="col-num">3</td>
        <td>
          <strong>Have you ever overstayed beyond validity in any country?</strong> &nbsp; ${renderYesNo(data.q3_overstayed)}
          ${data.q3_overstayed === 'yes' && data.q3_details ? `
            <div class="sub-box">Reason / Details: ${renderValue(data.q3_details.reason)}</div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="col-num">4</td>
        <td>
          <strong>Have you ever been deported, removed, or required to leave?</strong> &nbsp; ${renderYesNo(data.q4_deported)}
        </td>
      </tr>
      <tr>
        <td class="col-num">5</td>
        <td>
          <strong>Have you ever voluntarily departed any country?</strong> &nbsp; ${renderYesNo(data.q5_voluntary_depart)}
        </td>
      </tr>
      <tr>
        <td class="col-num">6</td>
        <td>
          <strong>Have you ever had an exclusion order or entry ban?</strong> &nbsp; ${renderYesNo(data.q6_exclusion_order)}
        </td>
      </tr>
      <tr>
        <td class="col-num">7</td>
        <td>
          <strong>Have you ever worked without permit or national insurance?</strong> &nbsp; ${renderYesNo(data.q7_work_permit_ni)}
        </td>
      </tr>
      <tr>
        <td class="col-num">8</td>
        <td>
          <strong>Have you ever been arrested, charged, or convicted of criminal offences?</strong> &nbsp; ${renderYesNo(data.q8_criminal_offence)}
        </td>
      </tr>
      <tr>
        <td class="col-num">9</td>
        <td>
          <strong>Have you ever been involved in war crimes or terrorism?</strong> &nbsp; ${renderYesNo(data.q9_war_crimes_terrorism)}
        </td>
      </tr>
      <tr>
        <td class="col-num">10</td>
        <td>
          <strong>Have you ever expressed extremist views?</strong> &nbsp; ${renderYesNo(data.q10_extremist_views)}
        </td>
      </tr>
      <tr>
        <td class="col-num">11</td>
        <td>
          <strong>Have you ever worked for judiciary, military, or security services?</strong> &nbsp; ${renderYesNo(data.q11_judiciary_security_work)}
        </td>
      </tr>
      <tr>
        <td class="col-num">12</td>
        <td>
          <strong>Have you ever applied for asylum in any country?</strong> &nbsp; ${renderYesNo(data.q12_asylum_application)}
        </td>
      </tr>
      <tr>
        <td class="col-num">13</td>
        <td>
          <strong>Do you have any ongoing medical conditions or treatments?</strong> &nbsp; ${renderYesNo(data.q13_medical_conditions)}
        </td>
      </tr>
      <tr>
        <td class="col-num">14</td>
        <td>
          <strong>Any other relevant immigration or travel history?</strong><br>
          ${renderValue(data.q14_additional_history)}
        </td>
      </tr>
    </table>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Page 2</span>
    </div>
  </div>

  <!-- ═════════ PAGE 3: BUSINESS & EMPLOYMENT ═════════ -->
  <div class="page">
    <div class="section-banner">Pages 3–5: Business & Employment Background</div>

    <table class="qa-table">
      <tr>
        <td class="col-num">15</td>
        <td>
          <strong>Do you currently own or operate a registered business?</strong> &nbsp; ${renderYesNo(data.q15_has_business)}
          ${data.q15_has_business === 'yes' && data.q15_business ? `
            <div class="sub-box">
              Business Name: ${renderValue(data.q15_business.company_name)} | Country: ${renderValue(data.q15_business.country)}<br>
              Industry: ${renderValue(data.q15_business.industry)} | Ownership %: ${renderValue(data.q15_business.ownership_percent)}%<br>
              Annual Turnover: ${renderValue(data.q15_business.annual_turnover)} | Employees: ${renderValue(data.q15_business.employees_count)}
            </div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="col-num">16</td>
        <td>
          <strong>Past business ownership experience (last 5 years):</strong><br>
          ${renderValue(data.q16_past_business_summary)}
        </td>
      </tr>
      <tr>
        <td class="col-num">17</td>
        <td>
          <strong>Proposed Business Venture Details (if applying under business stream):</strong><br>
          ${renderValue(data.q17_proposed_business_concept)}
        </td>
      </tr>
      <tr>
        <td class="col-num">18</td>
        <td>
          <strong>Current Employment Status:</strong> &nbsp; ${renderValue(data.q18_current_employment_status)}<br>
          Employer: ${renderValue(data.q18_employer_name)} | Job Title: ${renderValue(data.q18_job_title)}<br>
          Monthly Salary: ${renderValue(data.q18_monthly_salary)} | Experience in field: ${renderValue(data.q18_years_experience)}
        </td>
      </tr>
      <tr>
        <td class="col-num">19</td>
        <td>
          <strong>Past 10 Years Employment History:</strong><br>
          ${renderValue(data.q19_past_employment_history)}
        </td>
      </tr>
      <tr>
        <td class="col-num">20</td>
        <td>
          <strong>Professional Licenses, Certifications, or Memberships:</strong><br>
          ${renderValue(data.q20_professional_memberships)}
        </td>
      </tr>
    </table>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Pages 3–5</span>
    </div>
  </div>

  <!-- ═════════ PAGE 4: PERSONAL, FAMILY & ACADEMIC ═════════ -->
  <div class="page">
    <div class="section-banner">Pages 5–7: Personal, Family & Academic Background</div>

    <table class="qa-table">
      <tr>
        <td class="col-num">21</td>
        <td>
          <strong>Marital Status:</strong> &nbsp; ${renderValue(data.q21_marital_status)}<br>
          ${data.q21_spouse ? `
            <div class="sub-box">
              Spouse Full Name: ${renderValue(data.q21_spouse.name)} | Nationality: ${renderValue(data.q21_spouse.nationality)}<br>
              Date of Birth: ${renderValue(data.q21_spouse.dob)} | Accompanying: ${renderValue(data.q21_spouse.accompanying)}
            </div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="col-num">22</td>
        <td>
          <strong>Children / Dependent Family Members:</strong><br>
          ${renderValue(data.q22_dependents_summary || 'None declared')}
        </td>
      </tr>
      <tr>
        <td class="col-num">23</td>
        <td>
          <strong>Parents Details:</strong><br>
          Father: ${renderValue(data.q23_father_name)} (${renderValue(data.q23_father_nationality)})<br>
          Mother: ${renderValue(data.q23_mother_name)} (${renderValue(data.q23_mother_nationality)})
        </td>
      </tr>
      <tr>
        <td class="col-num">24</td>
        <td>
          <strong>Family Members residing in Target Destination Country:</strong><br>
          ${renderValue(data.q24_relatives_in_destination || 'None declared')}
        </td>
      </tr>
      <tr>
        <td class="col-num">25</td>
        <td>
          <strong>Highest Academic Qualification:</strong> &nbsp; ${renderValue(data.q25_highest_qualification)}<br>
          Institution: ${renderValue(data.q25_institution)} | Country: ${renderValue(data.q25_country)} | Graduation Year: ${renderValue(data.q25_grad_year)}
        </td>
      </tr>
      <tr>
        <td class="col-num">26</td>
        <td>
          <strong>English Language Proficiency / Examination:</strong><br>
          Test: ${renderValue(data.q26_english_test || 'None')} | Overall Score: ${renderValue(data.q26_english_score)} | Test Date: ${renderValue(data.q26_test_date)}
        </td>
      </tr>
      <tr>
        <td class="col-num">27</td>
        <td>
          <strong>Other Languages Spoken:</strong> &nbsp; ${renderValue(data.q27_other_languages)}
        </td>
      </tr>
    </table>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Pages 5–7</span>
    </div>
  </div>

  <!-- ═════════ PAGE 5: FINANCIALS & ACTION PLAN ═════════ -->
  <div class="page">
    <div class="section-banner">Pages 8–9: Financials, Action Plan & Signatures</div>

    <table class="qa-table">
      <tr>
        <td class="col-num">28</td>
        <td>
          <strong>Liquid Funds Available for Investment / Relocation:</strong><br>
          <strong>${renderValue(data.q28_funds_available)}</strong> (Currency: ${renderValue(data.q28_currency || 'USD')})
        </td>
      </tr>
      <tr>
        <td class="col-num">29</td>
        <td>
          <strong>Source of Funds / Wealth:</strong><br>
          ${renderValue(data.q29_source_of_funds)}
        </td>
      </tr>
      <tr>
        <td class="col-num">30</td>
        <td>
          <strong>Real Estate & Property Assets Owned:</strong><br>
          ${renderValue(data.q30_property_assets || 'None declared')}
        </td>
      </tr>
      <tr>
        <td class="col-num">31</td>
        <td>
          <strong>Any Outstanding Liabilities or Bank Loans:</strong><br>
          ${renderValue(data.q31_liabilities || 'None')}
        </td>
      </tr>
    </table>

    <div class="section-banner">Agreed Action Plan & Next Milestones</div>
    ${actionPlan.length > 0 ? `
      <table class="qa-table" style="font-size: 10px;">
        <tr style="background: #f8fafc; font-weight: 700;">
          <td style="width: 25px;">#</td>
          <td>Milestone / Deliverable</td>
          <td style="width: 80px;">Target Date</td>
          <td style="width: 75px;">Status</td>
        </tr>
        ${actionPlan.map((ap, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td><strong>${escapeHtml(ap.title || ap.step)}</strong><br><span style="color: #64748b;">${escapeHtml(ap.notes || '')}</span></td>
            <td>${renderValue(ap.target_date)}</td>
            <td><span style="font-weight: 600;">${renderValue(ap.status || 'PENDING')}</span></td>
          </tr>
        `).join('')}
      </table>
    ` : '<p style="color: #64748b; font-style: italic; font-size: 10px;">Standard visa application onboarding workflow initiated.</p>'}

    <div class="section-banner">Counsellor Assessment & Declaration</div>
    <p style="font-size: 10px; color: #334155; margin: 4px 0 10px;">
      I hereby certify that I have conducted the comprehensive case evaluation and intake assessment with the applicant named herein. The information recorded represents a true and complete summary of the applicant's current background, immigration history, and objectives.
    </p>

    <div class="grid-2">
      <div class="sig-box">
        <div style="font-size: 10px; color: #64748b;">Authorized Case Counsellor:</div>
        <div style="font-size: 12px; font-weight: 700; margin: 4px 0;">${renderValue(data.counselor_signature?.counselor_name || contract.assigned_user_name || 'Authorized Counsellor')}</div>
        <div style="font-size: 10px; color: #64748b;">360 Global Immigration</div>
        <div style="margin-top: 8px; font-size: 10px;">Date: <strong>${renderValue(data.counselor_signature?.date || contract.completed_at?.slice(0, 10) || contract.signed_at?.slice(0, 10))}</strong></div>
      </div>
      <div class="sig-box" style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        ${data.counselor_signature?.signature_png ? `
          <img src="${escapeHtml(data.counselor_signature.signature_png)}" alt="Signature" style="max-height: 40px; max-width: 140px; object-fit: contain;" />
          <div style="border-top: 1px solid #94a3b8; width: 70%; margin-top: 4px; font-size: 9px; color: #64748b;">Official Case Signature</div>
        ` : `
          <div style="font-size: 11px; font-weight: 700; color: #047857;">[ CERTIFIED & FILED ELECTRONICALLY ]</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Contract #${escapeHtml(contract.id)} Assigned Dossier</div>
        `}
      </div>
    </div>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Pages 8–9</span>
    </div>
  </div>

  <!-- ═════════ PAGE 6: ATTACHED DOCUMENTS DOSSIER ═════════ -->
  <div class="page">
    <div class="doc-header">
      <h1 class="doc-title">SUPPORTING DOCUMENTS & ATTACHMENTS</h1>
      <div class="doc-sub">Dossier Compilation Manifest • Contract #${escapeHtml(contract.id)}</div>
    </div>

    <p style="font-size: 11px; color: #334155; margin-bottom: 12px;">
      The following supporting files and client verification documents have been compiled and verified alongside this Client Summary and the official Executed Legal Services Agreement.
    </p>

    <div class="field-row">
      <span class="field-label">Total Attached Files:</span>
      <span class="field-value"><strong>${attachments.length} Document(s)</strong></span>
    </div>
    <div class="field-row">
      <span class="field-label">Client Name:</span>
      <span class="field-value">${renderValue(contract.recipient_name)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Executed Contract Ref:</span>
      <span class="field-value">#${escapeHtml(contract.id)} (${renderValue(contract.template_name)})</span>
    </div>

    <table class="att-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Document Name</th>
          <th style="width: 90px;">File Type</th>
          <th style="width: 80px;">Size</th>
          <th style="width: 90px;">Upload Date</th>
        </tr>
      </thead>
      <tbody>
        ${attachments.length > 0 ? attachments.map((att, i) => `
          <tr>
            <td style="text-align: center; font-weight: 700;">${i + 1}</td>
            <td><strong>${escapeHtml(att.name || 'Supporting Document')}</strong></td>
            <td>${escapeHtml(att.mimeType || 'Document')}</td>
            <td>${att.size ? `${Math.round(att.size / 1024)} KB` : '—'}</td>
            <td>${att.uploadedAt ? escapeHtml(att.uploadedAt.slice(0, 10)) : '—'}</td>
          </tr>
        `).join('') : `
          <tr>
            <td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No supporting documents attached to this dossier yet.</td>
          </tr>
        `}
      </tbody>
    </table>

    <div style="margin-top: 30px; border-top: 2px solid #0f172a; padding-top: 10px; font-size: 10px; color: #64748b;">
      <div>✓ All documents compiled in one secure case archive.</div>
      <div>✓ Hosted securely on GoHighLevel Media Infrastructure.</div>
    </div>

    <div class="page-footer">
      <span>Contract Ref #${escapeHtml(contract.id)} • ${escapeHtml(contract.recipient_name)}</span>
      <span>CLIENT SUMMARY FORM | Attachments Dossier</span>
    </div>
  </div>

</body>
</html>`;

  return await pdfService.htmlToPdf(html);
}

module.exports = { generateSummaryPdf };
