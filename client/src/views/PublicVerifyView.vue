<template>
  <div class="verify-portal">
    <!-- Header -->
    <header class="verify-header">
      <div class="verify-header-inner">
        <div class="brand-row">
          <img
            class="brand-logo"
            src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"
            alt="360 Global Immigration"
          />
          <div class="brand-text">
            <div class="brand-name">360 GLOBAL IMMIGRATION</div>
            <div class="brand-tagline">Official Digital Execution Registry · سجل التنفيذ الرقمي</div>
          </div>
        </div>
      </div>
    </header>

    <main class="verify-main">
      <!-- Loading -->
      <div v-if="loading" class="state-card loading-card">
        <div class="shield-icon shield-loading">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="spinner-ring"></div>
        <h2>Verifying Document…</h2>
        <p class="text-sub">Querying the 360 Global Cryptographic Registry</p>
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="error" class="state-card error-card">
        <div class="shield-icon shield-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span class="icon-badge badge-x">✕</span>
        </div>
        <h2 class="error-title">Verification Failed</h2>
        <p class="text-sub">{{ error }}</p>
        <p class="ref-text">Reference: <code>{{ identifier }}</code></p>
      </div>

      <!-- SUCCESS -->
      <div v-else-if="data" class="verify-body">

        <!-- Status Banner -->
        <div class="status-banner" :class="data.isExecuted ? 'banner-success' : 'banner-pending'">
          <div class="banner-shield">
            <svg v-if="data.isExecuted" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="banner-text">
            <div class="banner-label">{{ data.statusLabel }}</div>
            <div class="banner-ref">Contract {{ data.reference }}</div>
          </div>
          <div class="banner-check" v-if="data.isExecuted">✓ AUTHENTIC</div>
        </div>

        <!-- Main Certificate Card -->
        <div class="cert-card">
          <div class="cert-card-header">
            <h1 class="cert-title">Digital Execution Certificate</h1>
            <p class="cert-subtitle">شهادة التنفيذ الرقمي المعتمدة</p>
          </div>

          <!-- Agreement Info Grid -->
          <div class="info-grid">
            <div class="info-cell">
              <span class="info-label">Contract Reference</span>
              <span class="info-val highlight">{{ data.reference }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Agreement Title</span>
              <span class="info-val">{{ data.title }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Status</span>
              <span class="info-val">
                <span class="status-chip" :class="data.isExecuted ? 'chip-success' : 'chip-pending'">
                  {{ data.state }}
                </span>
              </span>
            </div>
            <div class="info-cell">
              <span class="info-label">Created</span>
              <span class="info-val">{{ formatDate(data.createdAt) }}</span>
            </div>
            <div class="info-cell" v-if="data.signedAt">
              <span class="info-label">Executed (Signed)</span>
              <span class="info-val text-success">{{ formatDate(data.signedAt) }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Issuing Authority</span>
              <span class="info-val">{{ data.issuingAuthority }}</span>
            </div>
          </div>

          <!-- Signatory -->
          <div class="signatory-block">
            <div class="signatory-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Signatory (Client)
            </div>
            <div class="signatory-body">
              <div class="sig-name">{{ data.signerName }}</div>
              <div class="sig-email">{{ data.signerEmailMasked }}</div>
            </div>
          </div>

          <!-- Cryptographic Hash -->
          <div class="hash-block">
            <div class="hash-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Cryptographic Security Seal (SHA-256)
            </div>
            <div class="hash-val">{{ data.sha256 }}</div>
            <div class="hash-record">Security Record ID: {{ data.securityRecordId }}</div>
          </div>

          <!-- Audit Timeline (condensed) -->
          <div v-if="data.auditTimeline && data.auditTimeline.length" class="audit-mini">
            <div class="audit-mini-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
              Audit Trail
            </div>
            <div class="audit-mini-list">
              <div v-for="(log, i) in data.auditTimeline" :key="i" class="audit-mini-item">
                <span class="audit-dot" :class="log.action.includes('COMPLETE') ? 'dot-green' : log.action.includes('SIGN') ? 'dot-emerald' : 'dot-blue'"></span>
                <span class="audit-action">{{ formatAction(log.action) }}</span>
                <span class="audit-ts">{{ formatDate(log.timestamp) }}</span>
              </div>
            </div>
          </div>

          <!-- Legal Assurance bilingual -->
          <div class="legal-block">
            <div class="legal-en">
              <strong>Legal Validity:</strong> {{ data.legalAssuranceEn }}
            </div>
            <div class="legal-ar">
              <strong>الحجية القانونية:</strong> {{ data.legalAssuranceAr }}
            </div>
          </div>

          <!-- Actions -->
          <div class="cert-actions">
            <a
              v-if="data.pdfDownloadUrl"
              :href="apiBase + data.pdfDownloadUrl"
              target="_blank"
              class="btn-download"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Certified PDF
            </a>
            <button class="btn-share" @click="copyUrl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {{ copied ? 'Link Copied ✓' : 'Share Verification Link' }}
            </button>
          </div>
        </div>

        <!-- Jurisdiction Footer -->
        <div class="jurisdiction-note">
          <p>{{ data.governingJurisdiction }}</p>
          <p>{{ data.officialRegistry }}</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="verify-footer">
      <span>© 360 Global Immigration · Official Digital Execution Registry</span>
      <span>Secured with SHA-256 Cryptographic Seal</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const identifier = route.params.id
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const loading = ref(true)
const error   = ref('')
const data    = ref(null)
const copied  = ref(false)

onMounted(async () => {
  try {
    const res = await axios.get(`${apiBase}/verify/${identifier}`)
    data.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Contract not found in the 360 Global Official Execution Registry.'
  } finally {
    loading.value = false
  }
})

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch { return String(iso) }
}

function formatAction(action) {
  return (action || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700&display=swap');

* { box-sizing: border-box; }

.verify-portal {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8edf3 50%, #f0f4f8 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.verify-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 0 20px;
}
.verify-header-inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 16px 0;
}
.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.brand-logo {
  height: 44px;
  object-fit: contain;
}
.brand-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #20383e;
  letter-spacing: 0.5px;
}
.brand-tagline {
  font-size: 0.72rem;
  color: #64748b;
  letter-spacing: 0.3px;
  margin-top: 1px;
}

/* ── Main ── */
.verify-main {
  flex: 1;
  padding: 36px 20px;
  max-width: 780px;
  margin: 0 auto;
  width: 100%;
}

/* ── State Cards ── */
.state-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 56px 32px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  max-width: 480px;
  margin: 0 auto;
}

.shield-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.shield-loading { color: #94a3b8; }
.shield-error { color: #ef4444; }

.icon-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}
.badge-x { background: #ef4444; color: #fff; }

.spinner-ring {
  width: 56px;
  height: 56px;
  border: 3px solid #e2e8f0;
  border-top-color: #20383e;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.state-card h2 { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
.text-sub { font-size: 0.9rem; color: #64748b; margin: 0 0 10px; }
.error-title { color: #dc2626; }
.ref-text { font-size: 0.8rem; color: #94a3b8; }
.ref-text code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }

/* ── Status Banner ── */
.status-banner {
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.banner-success {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1.5px solid #6ee7b7;
}
.banner-pending {
  background: linear-gradient(135deg, #fefce8, #fef3c7);
  border: 1.5px solid #fcd34d;
}
.banner-shield {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.banner-success .banner-shield { background: #10b981; color: #fff; }
.banner-pending .banner-shield { background: #f59e0b; color: #fff; }
.banner-text { flex: 1; }
.banner-label { font-size: 1rem; font-weight: 700; color: #0f172a; }
.banner-ref { font-size: 0.82rem; color: #475569; margin-top: 2px; }
.banner-check {
  font-size: 0.8rem;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 20px;
  padding: 6px 14px;
  letter-spacing: 0.5px;
}

/* ── Certificate Card ── */
.cert-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  overflow: hidden;
}
.cert-card-header {
  background: linear-gradient(135deg, #20383e 0%, #1a2e33 60%, #b79b52 200%);
  padding: 28px 32px;
  text-align: center;
  position: relative;
}
.cert-card-header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #b79b52, #d4b96a, #b79b52);
}
.cert-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 4px;
  letter-spacing: 0.3px;
}
.cert-subtitle {
  font-family: 'Cairo', sans-serif;
  font-size: 1rem;
  color: #b79b52;
  margin: 0;
}

/* ── Info Grid ── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}
.info-cell {
  background: #ffffff;
  padding: 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.info-label {
  font-size: 0.68rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.info-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}
.info-val.highlight { color: #20383e; font-size: 1.05rem; }
.text-success { color: #059669; }

.status-chip {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.chip-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.chip-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }

/* ── Signatory ── */
.signatory-block {
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.signatory-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.sig-name {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}
.sig-email {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 2px;
}

/* ── Hash Block ── */
.hash-block {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}
.hash-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.hash-val {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: #334155;
  word-break: break-all;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-bottom: 6px;
}
.hash-record {
  font-size: 0.72rem;
  color: #94a3b8;
  font-family: monospace;
}

/* ── Audit Mini Timeline ── */
.audit-mini {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.audit-mini-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.audit-mini-list { display: flex; flex-direction: column; gap: 6px; }
.audit-mini-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
}
.audit-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-green { background: #059669; }
.dot-emerald { background: #10b981; }
.dot-blue { background: #3b82f6; }
.audit-action { flex: 1; font-weight: 500; color: #334155; }
.audit-ts { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; }

/* ── Legal Block ── */
.legal-block {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(to right, #fffbeb, #ffffff);
  border-left: 3px solid #b79b52;
}
.legal-en {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 8px;
}
.legal-ar {
  font-family: 'Cairo', sans-serif;
  font-size: 0.78rem;
  color: #475569;
  direction: rtl;
  text-align: right;
  line-height: 1.5;
}

/* ── Actions ── */
.cert-actions {
  padding: 20px 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-download, .btn-share {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}
.btn-download {
  background: linear-gradient(135deg, #20383e, #1a2e33);
  color: #ffffff;
}
.btn-download:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(32,56,62,0.3); }
.btn-share {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}
.btn-share:hover { background: #e2e8f0; transform: translateY(-1px); }

/* ── Jurisdiction Note ── */
.jurisdiction-note {
  margin-top: 16px;
  text-align: center;
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.6;
}
.jurisdiction-note p { margin: 2px 0; }

/* ── Footer ── */
.verify-footer {
  background: #0f172a;
  color: #475569;
  font-size: 0.72rem;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── Responsive ── */
@media (max-width: 540px) {
  .info-grid { grid-template-columns: 1fr; }
  .cert-card-header { padding: 20px 18px; }
  .cert-title { font-size: 1.1rem; }
  .status-banner { flex-direction: column; text-align: center; }
  .cert-actions { flex-direction: column; }
  .verify-footer { flex-direction: column; text-align: center; }
}
</style>
