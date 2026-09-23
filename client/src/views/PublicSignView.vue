<template>
  <div class="public-sign-portal">
    <!-- Top Security & Branding Header -->
    <header class="portal-header">
      <div class="portal-header-inner">
        <div class="portal-brand">
          <div class="brand-shield-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <div>
            <span class="portal-brand-name">ContractManager</span>
            <span class="portal-brand-sub">Client Review & Secure Execution Portal</span>
          </div>
        </div>

        <div v-if="contract && !isCompleted" class="portal-header-meta">
          <span v-if="contract.expiresAt" class="expiry-pill">
            ⏱️ {{ formatRemainingTime(contract.expiresAt) }}
          </span>
          <span class="badge badge-success badge-sm">
            🔒 Encrypted & Verified
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content Canvas -->
    <main class="portal-main">

      <!-- ─── LOADING STATE ──────────────────────────────────────────────── -->
      <div v-if="loading" class="portal-loading animate-fade-in">
        <div class="loading-card">
          <div class="spinner-lg"></div>
          <h3>Loading Legal Agreement</h3>
          <p class="text-muted">Establishing secure session and retrieving contract document…</p>
        </div>
      </div>

      <!-- ─── ERROR / EXPIRED / REVOKED STATES ────────────────────────────── -->
      <div v-else-if="pageState !== 'sign' && pageState !== 'completed'" class="portal-state-view animate-fade-in">
        <div class="glass-card status-card">
          <div class="status-icon-ring" :class="pageState">
            <span v-if="pageState === 'expired'">⌛</span>
            <span v-else-if="pageState === 'revoked'">🚫</span>
            <span v-else>⚠️</span>
          </div>
          <h2 class="status-head">{{ statusTitle }}</h2>
          <p class="status-text">{{ statusMessage }}</p>
          <div class="status-help">
            Please contact the issuing representative if you have any questions or require an updated link.
          </div>
        </div>
      </div>

      <!-- ─── COMPLETED / SIGNED SCREEN ─────────────────────────────────── -->
      <div v-else-if="pageState === 'completed' || isCompleted" class="portal-completed-view animate-fade-in">
        <div class="glass-card completion-card">
          <div class="completion-icon-ring">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <span class="completion-tag">Contract Successfully Executed</span>
          <h2 class="completion-title">{{ contract?.snapshot?.documentTitle || contract?.templateName }}</h2>
          <p class="completion-sub">
            This agreement has been signed and legally finalized. An immutable audit certificate has been generated.
          </p>

          <div class="receipt-box">
            <div class="receipt-row">
              <span class="receipt-label">Signer Name:</span>
              <strong class="receipt-val">{{ signerName || contract?.recipient?.name || contract?.recipientName || 'Verified Client' }}</strong>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Status:</span>
              <span class="badge badge-success">COMPLETED</span>
            </div>
            <div class="receipt-row" v-if="signedTimestamp">
              <span class="receipt-label">Signed At:</span>
              <span class="receipt-val">{{ formatDate(signedTimestamp) }}</span>
            </div>
            <div class="receipt-row" v-if="pdfSha256">
              <span class="receipt-label">Digital Fingerprint:</span>
              <code class="sha-code">{{ pdfSha256.slice(0, 24) }}…</code>
            </div>
          </div>

          <div class="completion-actions">
            <!-- PDF download is restricted to agents only — clients receive their copy through their agent -->
            <div class="client-copy-notice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
              <div class="notice-text">
                <span class="notice-title">Your signed copy is being processed</span>
                <span class="notice-sub">Your agent will share the executed contract with you shortly.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── ACTIVE SIGNING VIEW ────────────────────────────────────────── -->
      <div v-else class="portal-active-view animate-fade-in">

        <!-- Banner Header -->
        <div class="contract-hero-banner">
          <div class="hero-left">
            <span class="badge badge-primary badge-sm" style="margin-bottom:6px;">Legal Agreement</span>
            <h1 class="hero-title">{{ contract?.snapshot?.documentTitle || contract?.templateName }}</h1>
            <p class="hero-desc">
              Please review all agreement clauses, commercial terms, and personal details below. When ready, provide your signature at the bottom to execute this contract.
            </p>
          </div>
          <div class="hero-right">
            <div class="hero-client-card">
              <span class="hero-card-k">Prepared For:</span>
              <strong class="hero-card-v">{{ recipientInfo.name || 'Valued Client' }}</strong>
              <small class="hero-card-email">{{ recipientInfo.email }}</small>
            </div>
          </div>
        </div>

        <!-- Floating / Sticky Document Navigation & Quick Actions -->
        <div v-if="isHtmlTemplate" class="doc-nav-sticky-bar">
          <div class="doc-nav-bar-inner">
            <div class="doc-nav-info">
              <span class="doc-nav-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 4px;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {{ htmlPageCount }} Pages Document
              </span>
              <span class="doc-nav-title">{{ contract?.snapshot?.documentTitle || contract?.templateName }}</span>
            </div>
            <div class="doc-nav-actions">
              <button type="button" class="doc-nav-btn" @click="scrollToSection('.page-4, .page:nth-of-type(4)')" title="Jump to Terms of Business">
                📜 Terms
              </button>
              <button type="button" class="doc-nav-btn" @click="scrollToSection('.page-7, .page:nth-of-type(7)')" title="Jump to Schedules">
                👤 Schedules
              </button>
              <button type="button" class="doc-nav-btn doc-nav-btn-highlight" @click="scrollToSign" title="Jump down to Digital Signature">
                ✍️ Jump to Sign ↓
              </button>
            </div>
          </div>
        </div>

        <!-- Document Paper Canvas -->
        <div class="doc-paper-wrap" :class="{ 'html-mode-paper-wrap': isHtmlTemplate }">

          <!-- MULTI-PAGE HTML/CSS TEMPLATE CANVAS -->
          <div
            v-if="isHtmlTemplate"
            class="html-contract-render-host"
            v-html="renderedHtmlContent"
          ></div>

          <!-- FALLBACK BLOCK-BY-BLOCK PAPER CANVAS -->
          <div v-else class="document-paper">

            <!-- Paper Header -->
            <div class="paper-header">
              <div class="header-branding-row">
                <span class="paper-brand">360 GLOBAL IMMIGRATION</span>
                <span class="paper-type-badge">{{ formMode === 'TEAM' ? 'Group / Team Agreement' : 'Standard Agreement' }}</span>
              </div>
              <h2 class="doc-main-heading">{{ contract?.snapshot?.documentTitle || contract?.templateName }}</h2>

              <!-- Key Summary Metadata Row -->
              <div class="doc-meta-bar">
                <div class="doc-meta-item">
                  <span class="doc-meta-k">Primary Applicant:</span>
                  <strong class="doc-meta-v">{{ recipientInfo.name || '—' }}</strong>
                </div>
                <div class="doc-meta-item" v-if="recipientInfo.email">
                  <span class="doc-meta-k">Email:</span>
                  <span class="doc-meta-v">{{ recipientInfo.email }}</span>
                </div>
                <div class="doc-meta-item" v-if="recipientInfo.phone">
                  <span class="doc-meta-k">Phone:</span>
                  <span class="doc-meta-v">{{ recipientInfo.phone }}</span>
                </div>
                <div class="doc-meta-item" v-if="recipientInfo.idNumber">
                  <span class="doc-meta-k">Passport / ID:</span>
                  <span class="doc-meta-v">{{ recipientInfo.idNumber }}</span>
                </div>
                <div class="doc-meta-item" v-if="recipientInfo.nationality">
                  <span class="doc-meta-k">Nationality:</span>
                  <span class="doc-meta-v">{{ recipientInfo.nationality }}</span>
                </div>
                <div class="doc-meta-item" v-if="formMode === 'TEAM' && teamMembers.length">
                  <span class="doc-meta-k">Group Coverage:</span>
                  <span class="doc-meta-v">{{ teamMembers.length + 1 }} Applicants</span>
                </div>
              </div>
            </div>

            <div class="paper-divider"></div>

            <!-- Paper Document Clauses & Content -->
            <div class="paper-body">
              <template v-for="(block, idx) in populatedDocumentBlocks" :key="idx">

                <!-- Bilingual Clause Block (50/50 English & Arabic) -->
                <div
                  v-if="block.bilingual || (block.contentEn && block.contentAr)"
                  class="doc-block block-bilingual"
                  :class="{ 'clause-emphasis': block.emphasis }"
                >
                  <div class="bilingual-col bilingual-en" dir="ltr">
                    <h4 v-if="block.titleEn || block.title" class="clause-title">
                      {{ block.titleEn || block.title }}
                    </h4>
                    <div class="clause-body" v-html="formatContent(block.contentEn || block.content)"></div>
                  </div>
                  <div class="bilingual-divider"></div>
                  <div class="bilingual-col bilingual-ar" dir="rtl">
                    <h4 v-if="block.titleAr" class="clause-title font-arabic">
                      {{ block.titleAr }}
                    </h4>
                    <div class="clause-body font-arabic" v-html="formatContent(block.contentAr)"></div>
                  </div>
                </div>

                <!-- Standard Monolingual Clause -->
                <div
                  v-else-if="block.type === 'clause'"
                  class="doc-block block-clause"
                  :class="{ 'clause-emphasis': block.emphasis }"
                >
                  <h4 v-if="block.title" class="clause-title">{{ block.title }}</h4>
                  <div class="clause-body" v-html="formatContent(block.content)"></div>
                </div>

                <!-- Paragraph Block -->
                <div v-else-if="block.type === 'paragraph'" class="doc-block block-paragraph">
                  <p v-html="formatContent(block.content)"></p>
                </div>

                <!-- Heading Block -->
                <div v-else-if="block.type === 'heading'" class="doc-block block-heading">
                  <h3 class="heading-content">{{ block.content || block.title }}</h3>
                </div>

                <!-- Key Value Grid -->
                <div v-else-if="block.type === 'key_value'" class="doc-block block-key-value">
                  <h4 v-if="block.title" class="table-block-title">{{ block.title }}</h4>
                  <div class="kv-grid">
                    <div v-for="(val, key) in (block.data || {})" :key="key" class="kv-row">
                      <span class="kv-key">{{ key }}</span>
                      <span class="kv-val">{{ val }}</span>
                    </div>
                  </div>
                </div>

                <!-- Team / Family Members Table -->
                <div
                  v-else-if="block.type === 'team_summary' || (idx === 1 && formMode === 'TEAM' && teamMembers.length)"
                  class="doc-block block-team-table"
                >
                  <div class="bilingual-header-row">
                    <h4 class="table-block-title">Covered Team / Family Group Members</h4>
                    <span class="table-block-title-ar font-arabic" dir="rtl">الأعضاء والمرافقون المشمولون بالعقد</span>
                  </div>
                  <div class="table-responsive">
                    <table class="doc-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Full Legal Name</th>
                          <th>Relationship</th>
                          <th>Passport / ID</th>
                          <th>Nationality</th>
                          <th>Date of Birth</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(m, mi) in (block.members || teamMembers)" :key="mi">
                          <td>{{ mi + 1 }}</td>
                          <td><strong>{{ m.fullName || m.name }}</strong></td>
                          <td>{{ m.relationship || 'Member' }}</td>
                          <td>{{ m.idNumber || '—' }}</td>
                          <td>{{ m.nationality || '—' }}</td>
                          <td>{{ m.dob || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Structured Table Block -->
                <div v-else-if="block.type === 'table'" class="doc-block block-table">
                  <h4 v-if="block.title" class="table-block-title">{{ block.title }}</h4>
                  <div class="table-responsive">
                    <table class="doc-table">
                      <thead v-if="block.headers">
                        <tr>
                          <th v-for="(h, hi) in block.headers" :key="hi">{{ h }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in (block.rows || [])" :key="ri">
                          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </template>
            </div>

            <!-- Paper Legal Notice Footer -->
            <div class="paper-footer">
              <div class="footer-legal-text">
                This document is electronically drafted and authorized. Any alteration or unauthorized modification renders it void.
              </div>
              <div class="footer-security-seal">
                <span>🔐 Authenticated Electronic Contract</span>
              </div>
            </div>

          </div>
        </div>

        <!-- ─── DIGITAL SIGNATURE SECTION (Directly Below Document) ─────── -->
        <div class="sign-execution-section">
          <div class="glass-card execution-card">
            <div class="execution-head">
              <div class="execution-icon-wrap">✍️</div>
              <div>
                <h3 class="execution-title">Sign & Finalize Agreement</h3>
                <p class="execution-sub">
                  Verify your name and provide your digital signature below to legally execute this contract.
                </p>
              </div>
            </div>

            <div class="execution-body">
              <!-- Signer Name Input -->
              <div class="form-group signer-name-group">
                <label class="field-label" for="signer-name">
                  Signer Full Legal Name <span class="req">*</span>
                </label>
                <input
                  id="signer-name"
                  type="text"
                  v-model="signerName"
                  class="form-control"
                  placeholder="e.g. Ahmed Khan"
                  required
                  maxlength="100"
                />
              </div>

              <!-- Signature Pad -->
              <div class="sig-pad-container">
                <label class="field-label">Digital Signature <span class="req">*</span></label>
                <SignaturePad
                  :initial-name="signerName"
                  @change="onSignatureChange"
                />
              </div>

              <!-- Consent Checkbox -->
              <div class="consent-box">
                <label class="consent-label">
                  <input
                    type="checkbox"
                    v-model="acceptedTerms"
                    class="consent-checkbox"
                    required
                  />
                  <span class="consent-text">
                    <strong>I confirm that I have read, understood, and agreed to all terms and conditions of this Agreement</strong>, and I consent to electronically signing this document pursuant to applicable Electronic Transactions regulations.
                  </span>
                </label>
              </div>

              <!-- Execution Checklist Indicators -->
              <div class="execution-checklist">
                <div class="check-item" :class="{ done: !!signerName.trim() }">
                  <span class="check-dot">{{ signerName.trim() ? '✓' : '1' }}</span>
                  <span>Legal Name</span>
                </div>
                <div class="check-item" :class="{ done: !!currentSignatureUrl }">
                  <span class="check-dot">{{ currentSignatureUrl ? '✓' : '2' }}</span>
                  <span>Digital Signature</span>
                </div>
                <div class="check-item" :class="{ done: acceptedTerms }">
                  <span class="check-dot">{{ acceptedTerms ? '✓' : '3' }}</span>
                  <span>Agreement Consent</span>
                </div>
              </div>

              <!-- Submit Error -->
              <div v-if="submitError" class="alert-banner alert-danger" style="margin-top: 14px;">
                {{ submitError }}
              </div>
            </div>

            <!-- Submit Button Bar -->
            <div class="execution-foot">
              <!-- Requirement Warning Notice (Full-width callout above submit button) -->
              <div v-if="!canSubmitSign && !submitting" class="missing-req-hint">
                <span v-if="!signerName.trim()">⚠️ Please enter your full legal name above to proceed</span>
                <span v-else-if="!currentSignatureUrl">✍️ Please draw, type, or upload your signature above to enable completion</span>
                <span v-else-if="!acceptedTerms">☑️ Please check the agreement consent box above to proceed</span>
              </div>

              <button
                type="button"
                class="btn-submit-sign"
                :class="{ 'can-submit': canSubmitSign }"
                :disabled="submitting || !canSubmitSign"
                @click="submitSignature"
              >
                <span v-if="submitting" class="spinner-sm"></span>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{{ submitting ? 'Executing & Sealing Agreement…' : '✍️ Sign & Complete Agreement' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import SignaturePad from '../components/signing/SignaturePad.vue'

const route = useRoute()
const token = route.params.token
const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

// ─── State ───────────────────────────────────────────────────────────────────
const loading            = ref(true)
const pageState          = ref('sign') // 'sign' | 'completed' | 'expired' | 'revoked' | 'error'
const statusTitle        = ref('')
const statusMessage      = ref('')

const contract           = ref(null)
const formMode           = ref('NORMAL')

const recipientInfo      = ref({
  name:        '',
  email:       '',
  phone:       '',
  idNumber:    '',
  nationality: '',
  address:     '',
})

const teamMembers        = ref([])

// Signing Form
const signerName         = ref('')
const currentSignatureUrl = ref('')
const signatureMethod    = ref('draw')
const acceptedTerms      = ref(false)
const submitting         = ref(false)
const submitError        = ref('')

// Post-sign receipt
const signedTimestamp    = ref(null)
const pdfSha256          = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────────
const isCompleted = computed(() => {
  const s = contract.value?.state || ''
  return ['SIGNED', 'COMPLETED', 'SIGNED_PENDING_STORAGE'].includes(s)
})

const isHtmlTemplate = computed(() => {
  return !!(contract.value?.rawHtml || contract.value?.snapshot?.rawHtml)
})

const htmlPageCount = computed(() => {
  if (!isHtmlTemplate.value) return 1
  const html = contract.value?.snapshot?.rawHtml || contract.value?.rawHtml || ''
  const matches = html.match(/<(?:section|div)[^>]*class=["'][^"']*\bpage(?![\-_])\b[^"']*["']/gi)
  return matches ? matches.length : 12
})

const canSubmitSign = computed(() => {
  return (
    !!signerName.value.trim() &&
    !!currentSignatureUrl.value &&
    acceptedTerms.value
  )
})

const renderedHtmlContent = computed(() => {
  const rawHtml = contract.value?.snapshot?.rawHtml || contract.value?.rawHtml
  if (!rawHtml) return ''
  const customCss = contract.value?.snapshot?.customCss || contract.value?.customCss || ''

  let rendered = rawHtml
  const fd = contract.value?.formData || {}
  const recipient = recipientInfo.value || {}

  const replacements = {
    'applicant.full_name': recipient.name || fd.client_name || 'Valued Client',
    'applicant.name': recipient.name || fd.client_name || 'Valued Client',
    'client_name': recipient.name || fd.client_name || 'Valued Client',

    'applicant.passport_or_eid': recipient.idNumber || fd.passport_number || '—',
    'applicant.passport': recipient.idNumber || fd.passport_number || '—',
    'passport_number': recipient.idNumber || fd.passport_number || '—',

    'applicant.nationality': recipient.nationality || fd.nationality || '—',
    'nationality': recipient.nationality || fd.nationality || '—',

    'applicant.mobile': recipient.phone || fd.phone || '—',
    'applicant.phone': recipient.phone || fd.phone || '—',
    'phone': recipient.phone || fd.phone || '—',

    'applicant.address': recipient.address || fd.address || '—',
    'address': recipient.address || fd.address || '—',

    'applicant.email': recipient.email || fd.client_email || '—',
    'client_email': recipient.email || fd.client_email || '—',

    'applicant.date_of_birth': fd.date_of_birth || fd.dob || '—',
    'applicant.dob': fd.date_of_birth || fd.dob || '—',
    'date_of_birth': fd.date_of_birth || fd.dob || '—',

    'applicant.dependents': fd.dependents || fd.note || 'Spouse & Kids under 18 are included.',
    'dependents': fd.dependents || fd.note || 'Spouse & Kids under 18 are included.',

    'jurisdiction': fd.jurisdiction || 'Courts of Dubai International Financial Centre (DIFC)',

    'fees.total_after_discount': fd.contract_value || '—',
    'contract_value': fd.contract_value || '—',

    'fees.currency_text': fd.currency || 'THE GREAT BRITAIN POUND (GBP)',
    'currency': fd.currency || 'THE GREAT BRITAIN POUND (GBP)',

    'fees.payment_mode': fd.payment_terms || '100% Upfront',
    'payment_terms': fd.payment_terms || '100% Upfront',

    'fees.additional_information': fd.visa_type || fd.additional_information || 'Standard Legal & Immigration Advisory',
    'additional_information': fd.visa_type || fd.additional_information || 'Standard Legal & Immigration Advisory',

    'fees.payment_breakup': fd.payment_breakup || '50% Initial Deposit upon signing, 50% upon Visa Approval',
    'payment_breakup': fd.payment_breakup || '50% Initial Deposit upon signing, 50% upon Visa Approval',

    'fees.initial_amount': fd.discounted_amount || fd.initial_deposit || '—',
    'discounted_amount': fd.discounted_amount || fd.initial_deposit || '—',
    'initial_amount': fd.discounted_amount || fd.initial_deposit || '—',

    'contract.date': new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    'contract_date': new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  }

  for (const [k, v] of Object.entries(fd)) {
    if (v !== undefined && v !== null && v !== '') {
      replacements[k] = String(v)
    }
  }

  rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const k = key.trim()
    return replacements[k] !== undefined ? replacements[k] : match
  })

  // Ensure absolute logo paths
  rendered = rendered
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["']assets\/[^"']+["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')

  // If user has provided a signature, inject into signature-line elements on pages 11 and 12 live!
  if (currentSignatureUrl.value) {
    const sigImgTag = `<img src="${currentSignatureUrl.value}" alt="Client Signature" style="max-height: 14mm; max-width: 90%; display: block; margin: auto;" />`
    rendered = rendered.replace(
      /<div class=["']signature-line["'] data-field=["']signature\.client["']>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.client" style="display:flex;align-items:center;justify-content:center;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${sigImgTag}</div>`
    )
  }

  // Extract embedded <style> tags from rawHtml if present
  let extractedCss = ''
  rendered = rendered.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    extractedCss += '\n' + css
    return ''
  })

  // Strip broken local stylesheet link tags
  rendered = rendered.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '')

  // Extract body content or strip html/head/body wrappers
  const bodyMatch = rendered.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    rendered = bodyMatch[1]
  } else {
    rendered = rendered
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
  }

  const baseCss = (customCss + '\n' + extractedCss).trim()

  // High-fidelity styling overrides: enforce dark text on white pages, fix bilingual table layout & typography
  const isolationCss = `
    .sign-html-canvas-pages {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #202629 !important;
      --ink: #202629;
      --paper: #ffffff;
      --font-en: "Inter", "Segoe UI", Arial, Helvetica, sans-serif;
      --font-ar: "Cairo", "Noto Sans Arabic", Tahoma, Arial, sans-serif;
    }
    .sign-html-canvas-pages .document {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0 auto;
    }
    .sign-html-canvas-pages .page {
      width: 210mm !important;
      max-width: 100% !important;
      min-height: 297mm !important;
      background: #ffffff !important;
      color: #202629 !important;
      margin: 0 auto 28px auto !important;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45) !important;
      position: relative !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }
    .sign-html-canvas-pages td,
    .sign-html-canvas-pages th,
    .sign-html-canvas-pages p,
    .sign-html-canvas-pages li,
    .sign-html-canvas-pages .clause-text,
    .sign-html-canvas-pages .clause-body,
    .sign-html-canvas-pages .group-desc {
      color: #202629 !important;
    }
    .sign-html-canvas-pages .bilingual-table {
      width: calc(100% - 16mm) !important;
      margin: 8mm 8mm 10mm !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
    }
    .sign-html-canvas-pages .bilingual-table td {
      color: #202629 !important;
      padding: 1.35mm 6mm !important;
      vertical-align: top !important;
    }
    .sign-html-canvas-pages .bilingual-table td.en-cell {
      color: #202629 !important;
      direction: ltr !important;
      text-align: left !important;
      font-family: var(--font-en) !important;
      border-right: 0.28mm solid #7f8e93 !important;
    }
    .sign-html-canvas-pages .bilingual-table td.ar-cell {
      color: #202629 !important;
      direction: rtl !important;
      text-align: right !important;
      font-family: var(--font-ar) !important;
    }
    .sign-html-canvas-pages h1,
    .sign-html-canvas-pages h2,
    .sign-html-canvas-pages h3 {
      color: #20383e !important;
    }
    .sign-html-canvas-pages .label {
      color: #20383e !important;
      font-weight: 800 !important;
    }
    .sign-html-canvas-pages .page-no {
      color: #29464d !important;
      background: #eef4f5 !important;
    }
    /* Fixed horizontal alignment for Cover Page title yellow underline across EN & AR */
    .sign-html-canvas-pages .cover-title {
      min-height: 38mm !important;
      height: 38mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      text-align: center !important;
      position: relative !important;
      padding-bottom: 8mm !important;
    }
    .sign-html-canvas-pages .cover-title::after {
      content: "" !important;
      position: absolute !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      bottom: 1.5mm !important;
      width: 30mm !important;
      height: 0.65mm !important;
      border-radius: 2mm !important;
      background: linear-gradient(90deg, #20383e, #b79b52) !important;
    }
  `

  return `<style>${baseCss}\n${isolationCss}</style>\n<div class="sign-html-canvas-pages">${rendered}</div>`
})

// Interpolate dynamic placeholders in contract blocks (for non-HTML fallback)
const populatedDocumentBlocks = computed(() => {
  const blocks = contract.value?.snapshot?.activeBlocks || contract.value?.snapshot?.documentSchema?.blocks || []
  if (!Array.isArray(blocks)) return []

  return blocks.map(b => {
    return {
      ...b,
      title:     interpolateText(b.title),
      titleEn:   interpolateText(b.titleEn),
      titleAr:   interpolateText(b.titleAr),
      content:   interpolateText(b.content),
      contentEn: interpolateText(b.contentEn),
      contentAr: interpolateText(b.contentAr),
    }
  })
})

function interpolateText(text) {
  if (!text || typeof text !== 'string') return text || ''
  let out = text

  const fd = contract.value?.formData || {}
  const data = {
    client_name: recipientInfo.value.name,
    'contact.name': recipientInfo.value.name,
    'form.name': recipientInfo.value.name,
    client_email: recipientInfo.value.email,
    'contact.email': recipientInfo.value.email,
    phone: recipientInfo.value.phone,
    'contact.phone': recipientInfo.value.phone,
    passport_number: recipientInfo.value.idNumber || fd.passport_number || '',
    'form.passport_number': recipientInfo.value.idNumber || fd.passport_number || '',
    nationality: recipientInfo.value.nationality || fd.nationality || '',
    address: recipientInfo.value.address || fd.address || '',
    ...fd,
  }

  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null && v !== '') {
      const reg = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
      out = out.replace(reg, String(v))
    }
  }
  return out
}

function formatContent(str) {
  if (!str) return ''
  return String(str).replace(/\n/g, '<br/>')
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRemainingTime(expiresAt) {
  if (!expiresAt) return 'Active'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`
  return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`
}

function scrollToSign() {
  const el = document.querySelector('.sign-execution-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollToSection(selector) {
  const el = document.querySelector(selector)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ─── Data Loaders ────────────────────────────────────────────────────────────
async function fetchContract() {
  loading.value = true
  submitError.value = ''

  try {
    const res = await axios.get(`${apiBase}/sign/${token}`)
    contract.value = res.data
    formMode.value = (res.data.formMode || 'NORMAL').toUpperCase()

    // Handle already completed
    if (res.data.alreadySigned || isCompleted.value) {
      pageState.value = 'completed'
      signedTimestamp.value = res.data.signedAt || new Date().toISOString()
      return
    }

    // Populate recipient details from server
    if (res.data.recipient) {
      recipientInfo.value.name  = res.data.recipient.name  || ''
      recipientInfo.value.email = res.data.recipient.email || ''
      recipientInfo.value.phone = res.data.recipient.phone || ''
    }

    // Populate from saved formData
    const saved = res.data.formData || {}
    if (saved.client_name && !recipientInfo.value.name) recipientInfo.value.name = saved.client_name
    if (saved.client_email && !recipientInfo.value.email) recipientInfo.value.email = saved.client_email
    if (saved.phone && !recipientInfo.value.phone) recipientInfo.value.phone = saved.phone
    if (saved.passport_number) recipientInfo.value.idNumber = saved.passport_number
    if (saved.nationality) recipientInfo.value.nationality = saved.nationality
    if (saved.address) recipientInfo.value.address = saved.address

    // Populate team members if in team mode
    if (Array.isArray(saved.teamMembers)) {
      teamMembers.value = saved.teamMembers
    }

    // Pre-fill signer name
    signerName.value = recipientInfo.value.name || ''
    pageState.value = 'sign'
  } catch (err) {
    console.error('Fetch contract error:', err)
    const status = err.response?.status
    const data   = err.response?.data || {}

    if (data.error === 'REVOKED') {
      pageState.value = 'revoked'
      statusTitle.value = 'Contract Revoked'
      statusMessage.value = 'This contract has been revoked by the issuer and is no longer accessible.'
    } else if (status === 410 || data.error === 'EXPIRED') {
      pageState.value = 'expired'
      statusTitle.value = 'Signing Link Expired'
      statusMessage.value = 'This signing invitation has expired. Links are time-sensitive for security.'
    } else if (status === 409 || data.error === 'COMPLETED' || data.error === 'SIGNED') {
      pageState.value = 'completed'
      signedTimestamp.value = new Date().toISOString()
    } else {
      pageState.value = 'error'
      statusTitle.value = 'Unable to Load Contract'
      statusMessage.value = data.error || 'Failed to load signing portal.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContract()
})

// ─── Signature Change Handler ─────────────────────────────────────────────────
function onSignatureChange(payload) {
  if (!payload) {
    currentSignatureUrl.value = ''
    return
  }
  if (typeof payload === 'string') {
    currentSignatureUrl.value = payload
    signatureMethod.value = 'draw'
  } else if (typeof payload === 'object') {
    currentSignatureUrl.value = payload.dataUrl || ''
    signatureMethod.value = payload.method || 'draw'
  }
}

// ─── Submit Signature ─────────────────────────────────────────────────────────
async function submitSignature() {
  if (!canSubmitSign.value) {
    if (!signerName.value.trim()) {
      submitError.value = 'Please enter your full legal name.'
    } else if (!currentSignatureUrl.value) {
      submitError.value = 'Please draw, type, or upload your signature.'
    } else if (!acceptedTerms.value) {
      submitError.value = 'Please check the consent box to accept the agreement terms.'
    }
    return
  }
  submitting.value  = true
  submitError.value = ''

  try {
    const payload = {
      signerName:       signerName.value.trim(),
      signerEmail:      recipientInfo.value.email || '',
      signatureMethod:  signatureMethod.value,
      signatureDataB64: currentSignatureUrl.value,
      signatureDataUrl: currentSignatureUrl.value,
      signature:        currentSignatureUrl.value,
      acceptedTerms:    true,
      consentAccepted:  true,
    }

    const res = await axios.post(`${apiBase}/sign/${token}/submit`, payload)
    signedTimestamp.value = new Date().toISOString()
    pdfSha256.value       = res.data.pdfSha256 || ''
    pageState.value       = 'completed'
  } catch (err) {
    console.error('Signature submit error:', err)
    submitError.value = err.response?.data?.message || err.response?.data?.error || 'Failed to submit signature. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ─── Download PDF ─────────────────────────────────────────────────────────────
async function downloadSignedPdf() {
  try {
    const url = `${apiBase}/sign/${token}/pdf`
    window.open(url, '_blank')
  } catch (e) {
    alert('Unable to initiate PDF download. Please try again.')
  }
}
</script>

<style scoped>
.public-sign-portal {
  min-height: 100vh;
  background-color: #f1f5f9;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.portal-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.portal-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.portal-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-shield-icon {
  width: 36px;
  height: 36px;
  background: #20383e;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portal-brand-name {
  display: block;
  font-weight: 800;
  font-size: 1.05rem;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.portal-brand-sub {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
}

.portal-header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expiry-pill {
  font-size: 0.8rem;
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

/* Main */
.portal-main {
  flex: 1;
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 80px 20px;
}

/* Loading */
.portal-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.loading-card {
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.spinner-lg {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(79, 70, 229, 0.15);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Status Cards */
.portal-state-view {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.status-card {
  max-width: 540px;
  text-align: center;
  padding: 48px 36px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.06);
}

.status-icon-ring {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  font-size: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  margin-bottom: 20px;
}

.status-head {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.status-text {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.status-help {
  font-size: 0.82rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

/* Hero Banner */
.contract-hero-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 4px 0 8px 0;
  line-height: 1.3;
}

.hero-desc {
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.5;
  max-width: 640px;
  margin: 0;
}

.hero-client-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.hero-card-k {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.hero-card-v {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 700;
  margin: 2px 0;
}

.hero-card-email {
  font-size: 0.78rem;
  color: #64748b;
}

.doc-paper-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  width: 100%;
}

.html-mode-paper-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 36px;
  background: transparent;
}

.html-contract-render-host {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #202629;
}

.html-contract-render-host :deep(.document) {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 0 auto;
}

.html-contract-render-host :deep(.page) {
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  background: #ffffff;
  color: #202629;
  margin: 0 auto 28px auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.html-contract-render-host :deep(p),
.html-contract-render-host :deep(td),
.html-contract-render-host :deep(th),
.html-contract-render-host :deep(li),
.html-contract-render-host :deep(.clause-text),
.html-contract-render-host :deep(.clause-body),
.html-contract-render-host :deep(.group-desc) {
  color: #202629;
}

.html-contract-render-host :deep(.bilingual-table) {
  width: calc(100% - 16mm);
  margin: 8mm 8mm 10mm;
  border-collapse: collapse;
  table-layout: fixed;
}

.html-contract-render-host :deep(.bilingual-table td.en-cell) {
  direction: ltr;
  text-align: left;
  color: #202629;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  border-right: 0.28mm solid #7f8e93;
}

.html-contract-render-host :deep(.bilingual-table td.ar-cell) {
  direction: rtl;
  text-align: right;
  color: #202629;
  font-family: 'Cairo', 'Noto Sans Arabic', Tahoma, sans-serif;
}

.document-paper {
  width: 100%;
  background: #ffffff;
  color: #0f172a;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  padding: 48px 56px;
  box-sizing: border-box;
}

.header-branding-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.paper-brand {
  font-size: 0.85rem;
  font-weight: 800;
  color: #475569;
  letter-spacing: 1px;
}

.paper-type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 20px;
}

.doc-main-heading {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.doc-meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.doc-meta-item {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
}

.doc-meta-k {
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 600;
}

.doc-meta-v {
  color: #0f172a;
  font-weight: 600;
}

.paper-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0 28px 0;
}

/* Document Blocks */
.paper-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.doc-block {
  margin-bottom: 4px;
}

/* Bilingual 50/50 Columns */
.block-bilingual {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 20px;
  padding: 14px 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  align-items: start;
}

.bilingual-divider {
  background: #cbd5e1;
  height: 100%;
  min-height: 40px;
}

.bilingual-col {
  font-size: 0.88rem;
  line-height: 1.6;
}

.bilingual-en {
  text-align: left;
}

.bilingual-ar {
  text-align: right;
  direction: rtl;
}

.font-arabic {
  font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;
}

.clause-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.clause-body {
  color: #334155;
  font-size: 0.87rem;
}

.clause-emphasis {
  border-left: 4px solid #6366f1;
}

/* Key Value Table */
.block-key-value {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.kv-key {
  color: #64748b;
  font-weight: 500;
}

.kv-val {
  color: #0f172a;
  font-weight: 600;
}

/* Team Table */
.bilingual-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-block-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.table-block-title-ar {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.doc-table th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.doc-table td {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  color: #334155;
}

/* Paper Footer */
.paper-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: #64748b;
}

/* Execution / Signing Section */
.sign-execution-section {
  max-width: 900px;
  margin: 0 auto;
}

.execution-card {
  background: #ffffff;
  color: #0f172a;
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.execution-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.execution-icon-wrap {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.execution-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.execution-sub {
  color: #64748b;
  font-size: 0.85rem;
  margin: 2px 0 0 0;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.req {
  color: #ef4444;
}

.signer-name-group {
  max-width: 480px;
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.95rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.sig-pad-container {
  margin-bottom: 24px;
}

.consent-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 20px;
}

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.consent-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #6366f1;
}

.consent-text {
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.5;
}

.execution-foot {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
}

.btn-submit-sign {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  background: #10b981;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  transition: all 0.15s ease;
}

.btn-submit-sign:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-submit-sign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Completion Card */
.portal-completed-view {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}

.completion-card {
  max-width: 620px;
  width: 100%;
  text-align: center;
  background: #ffffff;
  color: #0f172a;
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.completion-icon-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.completion-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.completion-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.completion-sub {
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.receipt-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
  text-align: left;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.receipt-label {
  color: #64748b;
}

.sha-code {
  font-family: monospace;
  font-size: 0.78rem;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #334155;
}

.client-copy-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1.5px solid #bfdbfe;
  border-left: 4px solid #3b82f6;
  border-radius: 10px;
  padding: 14px 16px;
  color: #1e40af;
}

.client-copy-notice svg {
  flex-shrink: 0;
  opacity: 0.75;
}

.notice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notice-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e40af;
}

.notice-sub {
  font-size: 0.8rem;
  color: #3b82f6;
  line-height: 1.4;
}

/* ── Sticky Document Navigation Bar ────────────────────────────────────────── */
.doc-nav-sticky-bar {
  position: sticky;
  top: 70px;
  z-index: 90;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 10px 18px;
}

.doc-nav-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.doc-nav-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-nav-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  font-weight: 700;
  color: #4338ca;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 4px 10px;
  border-radius: 20px;
}

.doc-nav-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  max-width: 480px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-nav-btn {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.doc-nav-btn:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.doc-nav-btn-highlight {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.doc-nav-btn-highlight:hover {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

/* ── HTML Multi-Page Contract Container ───────────────────────────────────── */
.html-mode-paper-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.html-contract-render-host {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.html-contract-render-host :deep(.document) {
  padding: 0 0 16mm;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.html-contract-render-host :deep(.page) {
  max-width: 100%;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 20mm;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.html-contract-render-host :deep(.page:hover) {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.html-contract-render-host :deep(.signature-line.signed img) {
  filter: contrast(1.1);
  mix-blend-mode: multiply;
}

/* ── Realtime Execution Checklist ─────────────────────────────────────────── */
.execution-checklist {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  flex-wrap: wrap;
}

.check-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s ease;
}

.check-item.done {
  color: #059669;
}

.check-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  background: #e2e8f0;
  color: #64748b;
}

.check-item.done .check-dot {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
}

.btn-submit-sign.can-submit {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.45);
  animation: pulse-glow 2.5s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.45); }
  50% { box-shadow: 0 4px 28px rgba(16, 185, 129, 0.75); }
}

.execution-foot {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.btn-submit-sign {
  align-self: flex-end;
}

.missing-req-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

@media (max-width: 768px) {
  .document-paper {
    padding: 24px 20px;
  }
  .block-bilingual {
    grid-template-columns: 1fr;
  }
  .bilingual-divider {
    display: none;
  }
  .contract-hero-banner {
    flex-direction: column;
  }
  .html-contract-render-host {
    overflow-x: auto;
    width: 100%;
  }
  .doc-nav-sticky-bar {
    top: 60px;
    padding: 8px 12px;
  }
  .doc-nav-title {
    display: none;
  }
}
</style>
