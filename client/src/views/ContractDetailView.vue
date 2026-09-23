<template>
  <div v-if="loading" class="loading-full-page">
    <div class="glass-card" style="padding: var(--space-12); text-align: center;">
      <div class="spinner"></div>
      <p class="text-muted" style="margin-top: var(--space-4);">Loading contract workspace…</p>
    </div>
  </div>

  <div v-else-if="error" class="loading-full-page">
    <div class="glass-card" style="padding: var(--space-12); text-align: center;">
      <h2>Contract Not Found</h2>
      <p class="text-muted">{{ error }}</p>
      <router-link to="/contracts" class="btn btn-secondary" style="margin-top: var(--space-4);">
        Back to Contracts
      </router-link>
    </div>
  </div>

  <div v-else class="contract-workspace">
    <!-- Top Workspace Header -->
    <header class="workspace-header">
      <div class="header-left">
        <router-link to="/contracts" class="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Contracts
        </router-link>

        <div class="contract-id-tag">
          <h2 class="contract-heading">Contract #{{ contract.id }}</h2>
          <span class="badge" :class="getStatusBadgeClass(contract.state)">
            {{ formatStatusLabel(contract.state) }}
          </span>
          <span class="badge badge-neutral">{{ contract.template_name }}</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Copy Signing Link (available whenever token exists) -->
        <button
          v-if="signingUrl"
          class="btn btn-secondary"
          @click="copySigningLink"
        >
          {{ linkCopied ? '✓ Copied!' : '📋 Copy Link' }}
        </button>

        <!-- Extend Expiry -->
        <button
          v-if="canExtend"
          class="btn btn-secondary"
          @click="showExtendModal = true"
        >
          ⏱️ Extend Expiry
        </button>

        <!-- Revoke -->
        <button
          v-if="canRevoke"
          class="btn btn-danger"
          @click="revokeContract"
          :disabled="revoking"
        >
          {{ revoking ? 'Revoking…' : '🚫 Revoke' }}
        </button>

        <!-- If COMPLETED: Download Signed PDF (Agent only) -->
        <button
          v-if="contract.state === 'COMPLETED' || contract.ghl_file_url"
          class="btn btn-secondary"
          @click="downloadPdf"
          :disabled="downloadingPdf"
        >
          {{ downloadingPdf ? '⏳ Downloading…' : '⬇️ Download PDF' }}
        </button>

        <!-- Primary Action: SEND CONTRACT VIA GOHIGHLEVEL -->
        <button
          v-if="['READY', 'AWAITING_FORM'].includes(contract.state)"
          class="btn btn-primary"
          @click="openSendModal"
          :disabled="sending"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          {{ sending ? 'Sending…' : 'Send via GHL Conversation' }}
        </button>
      </div>
    </header>

    <!-- Send via GHL Conversation Modal -->
    <div v-if="showSendModal" class="modal-backdrop" @click.self="showSendModal = false">
      <div class="modal-card glass-card" style="max-width: 520px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:42px; height:42px; border-radius:10px; background:#eff6ff; display:flex; align-items:center; justify-content:center; font-size:22px; color:#2563eb;">
            💬
          </div>
          <div>
            <h3 style="margin:0; font-size:1.15rem;">Send via GoHighLevel Conversation</h3>
            <p class="text-muted" style="margin:0; font-size:0.8rem;">Auto-dispatch to client and log directly in GHL Conversation thread</p>
          </div>
        </div>

        <div style="background:var(--color-bg-secondary, #f8fafc); border:1px solid var(--color-border); border-radius:8px; padding:14px; margin-bottom:16px;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); margin-bottom:6px; letter-spacing:0.5px;">RECIPIENT CONTACT</div>
          <div style="font-weight:700; font-size:0.95rem; color:var(--color-text);">{{ contract.recipient_name || ghlContact?.name || 'Client' }}</div>
          <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:6px; font-size:0.82rem; color:var(--color-text-muted);">
            <span>📱 {{ contract.recipient_phone || ghlContact?.phone || 'No phone number' }}</span>
            <span>✉️ {{ contract.recipient_email || ghlContact?.email || 'No email' }}</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:0.82rem; font-weight:600; display:block; margin-bottom:8px;">GHL Delivery Channels:</label>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;" :style="!(contract.recipient_phone || ghlContact?.phone) ? 'opacity:0.6;' : ''">
              <input type="checkbox" v-model="sendChannels.sms" :disabled="!(contract.recipient_phone || ghlContact?.phone)" />
              <div style="font-size:0.85rem;">
                <strong>Send via SMS</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Direct text message from GHL to {{ contract.recipient_phone || ghlContact?.phone || 'client phone' }}</span>
              </div>
            </label>

            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;" :style="!(contract.recipient_email || ghlContact?.email) ? 'opacity:0.6;' : ''">
              <input type="checkbox" v-model="sendChannels.email" :disabled="!(contract.recipient_email || ghlContact?.email)" />
              <div style="font-size:0.85rem;">
                <strong>Send via Email</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Branded signing invitation from GHL to {{ contract.recipient_email || ghlContact?.email || 'client email' }}</span>
              </div>
            </label>

            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;">
              <input type="checkbox" v-model="sendChannels.note" checked disabled />
              <div style="font-size:0.85rem;">
                <strong>GHL Internal Conversation Note</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Permanent audit entry inside the contact's GHL conversation thread</span>
              </div>
            </label>
          </div>
        </div>

        <div style="margin-bottom:18px;">
          <label style="font-size:0.82rem; font-weight:600; display:block; margin-bottom:6px;">Signing Link Expiry:</label>
          <div class="extend-pills">
            <button v-for="d in [1,3,7,14,30]" :key="d"
              type="button" class="validity-chip" :class="{ active: sendDays === d }"
              @click="sendDays = d">
              {{ d }} Day{{ d !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>

        <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" @click="showSendModal = false" :disabled="sending">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="executeSendContract" :disabled="sending">
            <span v-if="sending" class="spinner-inline">Sending via GHL…</span>
            <span v-else>🚀 Dispatch via GoHighLevel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Extend Expiry Modal -->
    <div v-if="showExtendModal" class="modal-backdrop" @click.self="showExtendModal = false">
      <div class="modal-card glass-card">
        <h3>Extend Contract Expiry</h3>
        <p class="text-muted" style="margin-bottom:16px;">Select how many additional days to extend the signing link.</p>

        <div class="extend-pills">
          <button v-for="d in [1,3,7,14,30]" :key="d"
            type="button" class="validity-chip" :class="{ active: extendDays === d }"
            @click="extendDays = d">
            +{{ d }} Day{{ d !== 1 ? 's' : '' }}
          </button>
        </div>

        <div class="form-group" style="margin-top:12px;">
          <label>Custom days</label>
          <input type="number" v-model.number="extendDays" min="1" max="365" class="form-input" style="max-width:100px;"/>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showExtendModal = false">Cancel</button>
          <button class="btn btn-primary" @click="extendExpiry" :disabled="extending">
            {{ extending ? 'Extending…' : 'Extend Expiry' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Workspace Sub-Header Info -->
    <div class="workspace-subbar">
      <div class="subbar-content">
        <div class="info-pill">
          <span class="info-k">Contact:</span>
          <span class="info-v">{{ ghlContact?.name || contract.ghl_contact_id }}</span>
          <span class="info-email" v-if="ghlContact?.email">({{ ghlContact.email }})</span>
        </div>

        <div class="info-pill" v-if="contract.ghl_opportunity_id">
          <span class="info-k">Opportunity:</span>
          <span class="info-v">{{ ghlOpportunity?.name || contract.ghl_opportunity_id }}</span>
        </div>

        <div class="info-pill">
          <span class="info-k">Created:</span>
          <span class="info-v">{{ formatDate(contract.created_at) }}</span>
        </div>

        <div class="info-pill" v-if="contract.token_expires_at && ['SENT', 'VIEWED'].includes(contract.state)">
          <span class="info-k">Expires:</span>
          <span class="info-v text-warning">{{ formatDate(contract.token_expires_at) }}</span>
        </div>

        <div class="info-pill" v-if="contract.signed_at">
          <span class="info-k">Signed:</span>
          <span class="info-v text-success">{{ formatDate(contract.signed_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Workspace Body with Tabs -->
    <div class="workspace-body">
      <!-- Nav Tabs -->
      <div class="workspace-tabs">
        <button type="button" class="ws-tab" :class="{ active: activeTab === 'form' }" @click="activeTab = 'form'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          Intake Form
        </button>

        <button type="button" class="ws-tab" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Document Preview
        </button>

        <button type="button" class="ws-tab" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'; fetchTimeline()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Activity ({{ timeline.length }})
        </button>

        <button type="button" class="ws-tab" :class="{ active: activeTab === 'audit' }" @click="activeTab = 'audit'; fetchAuditLogs()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 14 14"/>
          </svg>
          Audit Trail ({{ auditLogs.length }})
        </button>
      </div>

      <!-- ─── TAB 1: INTAKE FORM ───────────────────────────────────────────── -->
      <div v-show="activeTab === 'form'" class="tab-content animate-fade-in">
        <div class="glass-card form-container-card">
          <div class="form-header-box">
            <div>
              <h3>Contract Intake & Custom Fields</h3>
              <p class="text-muted">
                {{ isReadOnly ? 'This contract has been frozen for signature or completed. Form inputs are locked.' : 'Fill or edit fields below. Changes are debounced and synced automatically with HighLevel.' }}
              </p>
            </div>
            <div v-if="saveStatus === 'saved'" class="text-success small-text">
              ✓ Saved to contract & HighLevel
            </div>
          </div>

          <div v-if="!formFields.length" class="empty-form-notice">
            <p>This contract template does not have an associated intake form.</p>
          </div>

          <form v-else class="intake-form-grid" @submit.prevent>
            <div
              v-for="f in formFields"
              :key="f.id"
              class="form-group"
              :class="{ full: f.type === 'textarea' || f.type === 'file' }"
            >
              <label class="form-label">
                {{ f.label }}
                <span v-if="f.required" class="req">*</span>
                <span v-if="f.ghlFieldId" class="badge badge-info badge-sm">GHL</span>
              </label>

              <!-- Text / Number / Currency / Date -->
              <input
                v-if="['text', 'number', 'currency', 'date'].includes(f.type)"
                :type="f.type === 'number' || f.type === 'currency' ? 'number' : f.type === 'date' ? 'date' : 'text'"
                v-model="formResponses[f.key]"
                class="form-control"
                :disabled="isReadOnly"
                :placeholder="f.placeholder"
                @input="onFormInput"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="f.type === 'textarea'"
                v-model="formResponses[f.key]"
                class="form-control"
                rows="3"
                :disabled="isReadOnly"
                :placeholder="f.placeholder"
                @input="onFormInput"
              ></textarea>

              <!-- Dropdown -->
              <select
                v-else-if="f.type === 'dropdown'"
                v-model="formResponses[f.key]"
                class="form-control"
                :disabled="isReadOnly"
                @change="onFormInput"
              >
                <option value="">{{ f.placeholder || '-- Select --' }}</option>
                <option v-for="(opt, oi) in (f.options || [])" :key="oi" :value="opt.value || opt">
                  {{ opt.label || opt }}
                </option>
              </select>

              <!-- Checkbox -->
              <label v-else-if="f.type === 'checkbox'" class="check-label">
                <input
                  type="checkbox"
                  v-model="formResponses[f.key]"
                  :disabled="isReadOnly"
                  @change="onFormInput"
                />
                <span>{{ f.placeholder || f.label }}</span>
              </label>

              <small v-if="f.helpText" class="text-muted">{{ f.helpText }}</small>
            </div>
          </form>
        </div>
      </div>

      <!-- ─── TAB 2: DOCUMENT PREVIEW ──────────────────────────────────────── -->
      <div v-show="activeTab === 'preview'" class="tab-content animate-fade-in">
        <!-- If raw HTML template contract (e.g. Cyprus 12-page paired table) -->
        <div v-if="isHtmlContract" class="html-contract-preview-wrapper">
          <div class="html-preview-topbar glass-card">
            <div>
              <span class="badge badge-success badge-sm">12-Page Bilingual Legal Agreement</span>
              <h4 style="margin: 4px 0 0; font-size: 1.05rem;">{{ documentSchema?.title || contract.template_name }}</h4>
              <p style="margin: 2px 0 0; font-size: 0.8rem; color: #64748b;">
                Contract Ref: #{{ contract.id }} • Recipient: {{ ghlContact?.name || contract.ghl_contact_id }} • Status: {{ contract.state }}
              </p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <a v-if="signingUrl" :href="signingUrl" target="_blank" class="btn btn-secondary btn-sm">
                🔗 Client Sign Portal ↗
              </a>
            </div>
          </div>
          <div class="html-contract-canvas-inner" v-html="renderedContractHtml"></div>
        </div>

        <!-- Standard structured blocks document -->
        <div v-else class="paper-preview-container">
          <div class="paper-document">
            <h1 class="paper-title">{{ documentSchema?.title || contract.template_name }}</h1>
            <div class="paper-meta-row">
              <span>Contract Reference: #{{ contract.id }}</span>
              <span>Recipient: {{ ghlContact?.name || contract.ghl_contact_id }}</span>
              <span>Status: {{ contract.state }}</span>
            </div>

            <div class="paper-sep"></div>

            <div class="paper-blocks-list">
              <template v-for="b in (documentSchema?.blocks || [])" :key="b.id">
                <div v-if="b.type === 'clause'" class="p-clause">
                  <h3 v-if="b.title" class="p-clause-title">{{ b.title }}</h3>
                  <div class="p-clause-body">{{ interpolate(b.content) }}</div>
                </div>

                <div v-else-if="b.type === 'table'" class="p-table-box">
                  <h4 v-if="b.title" class="p-clause-title">{{ b.title }}</h4>
                  <table class="p-table">
                    <thead v-if="b.headers">
                      <tr>
                        <th v-for="(h, hi) in b.headers" :key="hi">{{ h }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in (b.rows || [])" :key="ri">
                        <td v-for="(cell, ci) in row" :key="ci">{{ interpolate(cell) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-else-if="b.type === 'key_value'" class="p-kv-box">
                  <h4 v-if="b.title" class="p-clause-title">{{ b.title }}</h4>
                  <div class="p-kv-grid">
                    <div v-for="(v, k) in (b.data || {})" :key="k" class="p-kv-row">
                      <span class="p-k">{{ k }}:</span>
                      <span class="p-v">{{ interpolate(v) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="b.type === 'signature'" class="p-sig-box">
                  <div class="p-sig-line">
                    <span v-if="contract.signed_at" class="text-success">
                      ✓ Digitally signed by {{ ghlContact?.name || 'Client' }} on {{ formatDate(contract.signed_at) }}
                    </span>
                    <span v-else class="text-muted">
                      {{ b.label || 'Client Authorized Signature Required' }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB 3: AUDIT TRAIL ───────────────────────────────────────────── -->
      <div v-show="activeTab === 'audit'" class="tab-content animate-fade-in">
        <div class="glass-card audit-card">
          <div class="audit-header">
            <h3>Contract Audit Trail</h3>
            <p class="text-muted">
              Immutable chronological record of every view, form edit, signature, and HighLevel sync event.
            </p>
          </div>

          <div v-if="loadingAudit" style="padding: var(--space-6); text-align: center;">
            <div class="spinner"></div>
          </div>

          <div v-else-if="!auditLogs.length" class="empty-audit">
            <p class="text-muted">No audit events recorded yet.</p>
          </div>

          <div v-else class="audit-timeline">
            <div
              v-for="log in auditLogs"
              :key="log.id"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="log.action.toLowerCase()"></div>
              <div class="timeline-content">
                <div class="timeline-top">
                  <strong>{{ formatAuditAction(log.action) }}</strong>
                  <span class="timeline-time">{{ formatDateTime(log.created_at) }}</span>
                </div>
                <div class="timeline-meta text-muted small-text">
                  <span>Actor: <strong>{{ log.actor_name || log.actor_id }}</strong> ({{ log.actor_type }})</span>
                  <span v-if="log.from_state && log.to_state">
                    • State: {{ log.from_state }} → <strong>{{ log.to_state }}</strong>
                  </span>
                  <span v-if="log.ip_address">• IP: {{ log.ip_address }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB: ACTIVITY TIMELINE ─────────────────────────────────────── -->
      <div v-show="activeTab === 'timeline'" class="tab-content animate-fade-in">
        <div class="glass-card" style="padding: var(--space-6);">
          <div class="submissions-header">
            <div>
              <h3>Activity Timeline</h3>
              <p class="text-muted">Full event history — client actions and staff operations combined.</p>
            </div>
            <button class="btn btn-secondary btn-sm" @click="fetchTimeline">Refresh</button>
          </div>

          <div v-if="loadingTimeline" style="text-align:center; padding:32px;">
            <div class="spinner"></div>
          </div>

          <div v-else-if="!timeline.length" class="empty-form-notice">
            No activity recorded yet.
          </div>

          <div v-else class="rich-timeline">
            <div v-for="(evt, i) in timeline" :key="i" class="rt-item">
              <div class="rt-track">
                <div class="rt-icon" :class="'rt-color-' + getTimelineConfig(evt.action).color">
                  <span>{{ getTimelineConfig(evt.action).icon }}</span>
                </div>
                <div v-if="i < timeline.length - 1" class="rt-connector"></div>
              </div>
              <div class="rt-card">
                <div class="rt-top">
                  <div class="rt-heading-group">
                    <span class="rt-title">{{ getTimelineConfig(evt.action).label }}</span>
                    <span class="rt-badge" :class="'badge-' + getTimelineConfig(evt.action).color">
                      {{ evt.action }}
                    </span>
                  </div>
                  <span class="rt-time">{{ formatDateTime(evt.createdAt || evt.created_at) }}</span>
                </div>
                <div class="rt-meta">
                  <span v-if="evt.actorName" class="rt-actor">
                    by <strong>{{ evt.actorName }}</strong>
                  </span>
                  <span v-if="evt.ipAddress" class="rt-ip">
                    <span class="rt-dot">•</span> IP: <code>{{ evt.ipAddress }}</code>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth  = useAuthStore()
const contractId = route.params.id

const loading = ref(true)
const error   = ref('')
const contract = ref({})
const ghlContact = ref(null)
const ghlOpportunity = ref(null)
const formFields = ref([])
const documentSchema = ref(null)

const activeTab = ref('form')
const formResponses = ref({})
const saveStatus = ref('')
const sending = ref(false)
const linkCopied = ref(false)

// Timeline / Audit
const auditLogs = ref([])
const loadingAudit = ref(false)
const timeline = ref([])
const loadingTimeline = ref(false)

// Extend / Revoke
const showExtendModal = ref(false)
const extendDays = ref(7)
const extending = ref(false)
const revoking  = ref(false)
const downloadingPdf = ref(false)

// GHL Send Modal
const showSendModal = ref(false)
const sendDays = ref(7)
const sendChannels = ref({
  sms: true,
  email: true,
  note: true,
})

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

const isReadOnly = computed(() => {
  return ['SENT', 'VIEWED', 'SIGNED', 'SIGNED_PENDING_STORAGE', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(contract.value?.state)
})

async function fetchContract() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}`, { headers: getHeaders() })
    contract.value = res.data.contract
    ghlContact.value = res.data.ghlContact
    ghlOpportunity.value = res.data.ghlOpportunity

    // Form schema
    const rawForm = contract.value.form_schema
    if (rawForm) {
      const parsed = typeof rawForm === 'string' ? JSON.parse(rawForm) : rawForm
      formFields.value = parsed.fields || []
    }

    // Document schema
    const rawDoc = contract.value.document_schema_json
    if (rawDoc) {
      documentSchema.value = typeof rawDoc === 'string' ? JSON.parse(rawDoc) : rawDoc
    }

    // Form responses
    const rawResponses = contract.value.form_response_json
    const initialResponses = rawResponses
      ? (typeof rawResponses === 'string' ? JSON.parse(rawResponses) : rawResponses)
      : {}

    // Prepopulate with contact/opportunity values if empty
    if (ghlContact.value) {
      if (!initialResponses.client_name && ghlContact.value.name) {
        initialResponses.client_name = ghlContact.value.name
      }
      if (!initialResponses.client_email && ghlContact.value.email) {
        initialResponses.client_email = ghlContact.value.email
      }
      if (!initialResponses.client_phone && ghlContact.value.phone) {
        initialResponses.client_phone = ghlContact.value.phone
      }
    }

    formResponses.value = initialResponses
  } catch (err) {
    console.error('Fetch contract detail error:', err)
    error.value = 'Failed to load contract details. Check access permissions.'
  } finally {
    loading.value = false
  }
}

let debounceTimer = null
function onFormInput() {
  if (isReadOnly.value) return
  saveStatus.value = 'saving'
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      await axios.patch(
        `${apiBase}/contracts/${contractId}/form`,
        {
          formResponse: formResponses.value,
        },
        { headers: getHeaders() }
      )
      saveStatus.value = 'saved'
      setTimeout(() => { if (saveStatus.value === 'saved') saveStatus.value = '' }, 3000)
    } catch (err) {
      console.warn('Form save error:', err)
      saveStatus.value = ''
    }
  }, 600)
}

function openSendModal() {
  sendDays.value = contract.value?.validity_days || 7
  sendChannels.value = {
    sms: !!(contract.value?.recipient_phone || ghlContact.value?.phone),
    email: !!(contract.value?.recipient_email || ghlContact.value?.email),
    note: true,
  }
  showSendModal.value = true
}

async function executeSendContract() {
  sending.value = true
  try {
    const selectedChannels = []
    if (sendChannels.value.sms) selectedChannels.push('sms')
    if (sendChannels.value.email) selectedChannels.push('email')

    const res = await axios.post(
      `${apiBase}/contracts/${contractId}/send`,
      {
        validityDays: sendDays.value,
        channels: selectedChannels,
      },
      { headers: getHeaders() }
    )

    showSendModal.value = false
    const msg = res.data.message || 'Contract dispatched successfully via GoHighLevel Conversation!'
    alert(`${msg}\n\nSigning Link:\n${res.data.signingUrl || res.data.signingLink}`)
    fetchContract()
  } catch (err) {
    console.error('Send contract error:', err)
    alert(err.response?.data?.error || 'Failed to dispatch contract via GoHighLevel.')
  } finally {
    sending.value = false
  }
}

const signingUrl = computed(() => {
  if (!contract.value.signing_token) return ''
  return `${window.location.origin}/sign/${contract.value.signing_token}`
})

const canExtend = computed(() => {
  const s = contract.value.state
  return s && !['SIGNED', 'COMPLETED', 'REVOKED', 'CANCELLED'].includes(s)
})

const canRevoke = computed(() => {
  const s = contract.value.state
  return s && !['SIGNED', 'COMPLETED', 'REVOKED', 'CANCELLED'].includes(s)
})

function copySigningLink() {
  if (!signingUrl.value) return
  navigator.clipboard?.writeText(signingUrl.value).catch(() => {})
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2500)
}

function timelineEmoji(action) {
  const map = {
    CONTRACT_CREATED:   '📄',
    CONTRACT_SENT:      '📤',
    CONTRACT_VIEWED:    '👁',
    FORM_STARTED:       '✏️',
    FORM_COMPLETED:     '✅',
    FORM_PROGRESS:      '💾',
    AGREEMENT_REVIEWED: '📖',
    CONTRACT_SIGNED:    '✍️',
    PDF_UPLOADED:       '🗂️',
    CONTRACT_COMPLETED: '🏁',
    EXPIRY_EXTENDED:    '⏱️',
    CONTRACT_REVOKED:   '🚫',
    CONTRACT_CANCELLED: '❌',
    CONTRACT_EXPIRED:   '⏰',
  }
  return map[action] || '•'
}

function timelineIconClass(action) {
  if (['CONTRACT_SIGNED', 'CONTRACT_COMPLETED', 'PDF_UPLOADED'].includes(action)) return 'rt-icon--success'
  if (['CONTRACT_REVOKED', 'CONTRACT_CANCELLED', 'CONTRACT_EXPIRED'].includes(action)) return 'rt-icon--danger'
  if (['CONTRACT_SENT', 'EXPIRY_EXTENDED'].includes(action)) return 'rt-icon--primary'
  return 'rt-icon--neutral'
}

async function fetchAuditLogs() {
  loadingAudit.value = true
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}/audit`, { headers: getHeaders() })
    auditLogs.value = res.data.auditLogs || []
  } catch (err) {
    console.warn('Audit fetch error:', err)
  } finally {
    loadingAudit.value = false
  }
}

async function fetchTimeline() {
  loadingTimeline.value = true
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}/events`, { headers: getHeaders() })
    timeline.value = res.data.timeline || []
  } catch (err) {
    // Fall back to audit logs mapped as timeline
    timeline.value = auditLogs.value.map(l => ({
      action: l.action,
      actorName: l.actor_name || l.actor_id,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
    }))
  } finally {
    loadingTimeline.value = false
  }
}

async function extendExpiry() {
  extending.value = true
  try {
    const res = await axios.post(`${apiBase}/contracts/${contractId}/extend`, { extraDays: extendDays.value }, { headers: getHeaders() })
    showExtendModal.value = false
    alert(`✓ Expiry extended! New link: ${res.data.signingUrl}`)
    fetchContract()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to extend expiry.')
  } finally {
    extending.value = false
  }
}

async function revokeContract() {
  if (!confirm('Are you sure you want to revoke this contract? The public signing link will immediately stop working.')) return
  revoking.value = true
  try {
    await axios.post(`${apiBase}/contracts/${contractId}/revoke`, {}, { headers: getHeaders() })
    fetchContract()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to revoke contract.')
  } finally {
    revoking.value = false
  }
}

function interpolate(text) {
  if (!text) return ''
  let out = text
  for (const [k, v] of Object.entries(formResponses.value || {})) {
    const reg = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
    out = out.replace(reg, v || '')
  }
  if (ghlContact.value?.name) {
    out = out.replace(/\{\{client_name\}\}/g, ghlContact.value.name)
  }
  return out
}

const isHtmlContract = computed(() => {
  const snap = typeof contract.value?.snapshot_json === 'string'
    ? JSON.parse(contract.value.snapshot_json)
    : contract.value?.snapshot_json

  return !!(snap?.rawHtml || documentSchema.value?.rawHtml || documentSchema.value?.type === 'HTML')
})

const renderedContractHtml = computed(() => {
  let raw = ''
  let css = ''
  const snap = typeof contract.value?.snapshot_json === 'string'
    ? JSON.parse(contract.value.snapshot_json)
    : contract.value?.snapshot_json

  if (snap?.rawHtml) {
    raw = snap.rawHtml
    css = snap.customCss || ''
  } else if (documentSchema.value?.rawHtml) {
    raw = documentSchema.value.rawHtml
    css = documentSchema.value.customCss || ''
  }

  if (!raw) return ''

  const resp = formResponses.value || {}
  const contact = ghlContact.value || {}

  let html = raw
    .replace(/\{\{applicant\.full_name\}\}/g, resp.client_name || contact.name || '—')
    .replace(/\{\{applicant\.passport_or_eid\}\}/g, resp.passport_number || contact.passport || '—')
    .replace(/\{\{applicant\.nationality\}\}/g, resp.nationality || '—')
    .replace(/\{\{applicant\.mobile\}\}/g, resp.phone || contact.phone || '—')
    .replace(/\{\{applicant\.address\}\}/g, resp.address || contact.address1 || '—')
    .replace(/\{\{applicant\.email\}\}/g, resp.client_email || contact.email || '—')
    .replace(/\{\{applicant\.date_of_birth\}\}/g, resp.date_of_birth || '—')
    .replace(/\{\{applicant\.dependents\}\}/g, resp.note || resp.dependents || '—')
    .replace(/\{\{jurisdiction\}\}/g, 'Courts of Dubai International Financial Centre (DIFC)')
    .replace(/\{\{fees\.total_after_discount\}\}/g, resp.contract_value || '—')
    .replace(/\{\{fees\.currency_text\}\}/g, resp.currency || 'THE GREAT BRITAIN POUND (GBP)')
    .replace(/\{\{fees\.payment_mode\}\}/g, resp.payment_terms || '—')
    .replace(/\{\{fees\.additional_information\}\}/g, resp.visa_type || resp.additional_information || '—')
    .replace(/\{\{fees\.payment_breakup\}\}/g, resp.payment_breakup || '—')
    .replace(/\{\{fees\.initial_amount\}\}/g, resp.discounted_amount || resp.initial_deposit || '—')
    .replace(/\{\{contract\.date\}\}/g, formatDate(contract.value?.created_at) || new Date().toLocaleDateString('en-GB'))
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')

  return `<style>${css}</style>\n${html}`
})

function getStatusBadgeClass(state) {
  const map = {
    AWAITING_FORM:  'badge-warning',
    DRAFT:          'badge-neutral',
    READY:          'badge-info',
    SENT:           'badge-primary',
    OPENED:         'badge-primary',
    IN_PROGRESS:    'badge-primary',
    READY_TO_SIGN:  'badge-primary',
    VIEWED:         'badge-primary',
    SIGNED:         'badge-success',
    COMPLETED:      'badge-success',
    EXPIRED:        'badge-neutral',
    CANCELLED:      'badge-danger',
    REVOKED:        'badge-danger',
    DECLINED:       'badge-danger',
  }
  return map[state] || 'badge-neutral'
}

function formatStatusLabel(state) {
  const map = {
    AWAITING_FORM:  'Awaiting Form',
    DRAFT:          'Draft',
    READY:          'Ready',
    SENT:           'Sent to Client',
    OPENED:         'Opened by Client',
    IN_PROGRESS:    'In Progress',
    READY_TO_SIGN:  'Ready to Sign',
    VIEWED:         'Viewed by Client',
    SIGNED:         'Signed',
    COMPLETED:      'Completed & Sealed',
    EXPIRED:        'Expired',
    CANCELLED:      'Cancelled',
    REVOKED:        'Revoked',
    DECLINED:       'Declined',
  }
  return map[state] || state
}

function getTimelineConfig(action) {
  const configs = {
    CONTRACT_CREATED:   { icon: '📄', label: 'Contract Created', color: 'indigo' },
    CONTRACT_OPENED:    { icon: '👁️', label: 'Client Opened Contract', color: 'blue' },
    CONTRACT_VIEWED:    { icon: '👁️', label: 'Client Viewed Link', color: 'blue' },
    FORM_STARTED:       { icon: '✏️', label: 'Client Started Intake Form', color: 'amber' },
    FORM_PROGRESS:      { icon: '💾', label: 'Form Progress Autosaved', color: 'teal' },
    FORM_UPDATED:       { icon: '✏️', label: 'Intake Form Updated', color: 'teal' },
    FORM_COMPLETED:     { icon: '✅', label: 'Intake Form Completed', color: 'emerald' },
    AGREEMENT_REVIEWED: { icon: '📖', label: 'Agreement Reviewed', color: 'blue' },
    CONTRACT_READY:     { icon: '📋', label: 'Contract Marked Ready', color: 'blue' },
    CONTRACT_SENT:      { icon: '📤', label: 'Contract Sent to Client', color: 'indigo' },
    IN_PROGRESS:        { icon: '✍️', label: 'Client Filling Details', color: 'amber' },
    CONTRACT_SIGNED:    { icon: '✍️', label: 'Signed by Client', color: 'emerald' },
    PDF_UPLOADED:       { icon: '🗂️', label: 'PDF Generated & Stored', color: 'purple' },
    CONTRACT_COMPLETED: { icon: '🏁', label: 'Fully Completed & Sealed', color: 'emerald' },
    EXPIRY_EXTENDED:    { icon: '⏱️', label: 'Signing Expiry Extended', color: 'amber' },
    CONTRACT_EXPIRED:   { icon: '⏰', label: 'Signing Link Expired', color: 'rose' },
    CONTRACT_REVOKED:   { icon: '🚫', label: 'Contract Revoked', color: 'rose' },
    CONTRACT_CANCELLED: { icon: '❌', label: 'Contract Cancelled', color: 'rose' },
  }

  const key = String(action || '').toUpperCase()
  return configs[key] || {
    icon: '⚡',
    label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    color: 'neutral',
  }
}

function formatAuditAction(action) {
  const map = {
    CONTRACT_CREATED:    'Contract Created',
    CONTRACT_OPENED:     'Client Opened Contract',
    FORM_UPDATED:        'Intake Form Updated',
    FORM_PROGRESS:       'Form Progress Saved',
    FORM_STARTED:        'Client Started Form',
    FORM_COMPLETED:      'Form Completed',
    AGREEMENT_REVIEWED:  'Agreement Reviewed',
    CONTRACT_READY:      'Marked Ready',
    CONTRACT_SENT:       'Sent to Client',
    CONTRACT_VIEWED:     'Client Opened Link',
    IN_PROGRESS:         'Client Filling Form',
    CONTRACT_SIGNED:     'Signed by Client',
    PDF_UPLOADED:        'PDF Sealed & Uploaded',
    CONTRACT_COMPLETED:  'Fully Completed',
    CONTRACT_EXPIRED:    'Link Expired',
    CONTRACT_CANCELLED:  'Cancelled',
    CONTRACT_REVOKED:    'Revoked',
    EXPIRY_EXTENDED:     'Expiry Extended',
  }
  return map[action] || action
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ─── Download PDF (Agent only) ────────────────────────────────────────────────
async function downloadPdf() {
  if (downloadingPdf.value) return
  downloadingPdf.value = true
  try {
    // Prefer the already-uploaded GHL file URL (direct download, no auth needed on that CDN URL)
    if (contract.value.ghl_file_url) {
      window.open(contract.value.ghl_file_url, '_blank')
      return
    }
    // Fall back to authenticated PDF endpoint using the signing_token
    const token = contract.value.signing_token
    if (!token) throw new Error('No signing token available.')
    const res = await axios.get(
      `${apiBase}/sign/${token}/pdf`,
      { headers: getHeaders(), responseType: 'blob' }
    )
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `contract_${contractId}_signed.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('[Download PDF] Error:', err.message)
    alert('Unable to download PDF. Please check your permissions or try again.')
  } finally {
    downloadingPdf.value = false
  }
}

onMounted(() => {
  fetchContract()
})
</script>

<style scoped>
.loading-full-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contract-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.contract-id-tag {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.contract-heading {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

/* Sub-header */
.workspace-subbar {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.subbar-content {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.info-pill {
  display: flex;
  gap: 6px;
  font-size: 0.85rem;
}

.info-k {
  color: var(--color-text-muted);
}

.info-v {
  font-weight: 600;
}

.info-email {
  color: var(--color-text-muted);
}

/* Nav Tabs */
.workspace-tabs {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.ws-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-tab:hover {
  color: var(--color-text-base);
}

.ws-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

/* Form Tab */
.form-container-card {
  padding: var(--space-8);
  max-width: 900px;
}

.form-header-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.intake-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.form-group.full {
  grid-column: span 2;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 1px 4px;
  margin-left: 4px;
}

/* Document Paper Tab */
.paper-preview-container {
  display: flex;
  justify-content: center;
  padding: var(--space-6) 0;
}

.paper-document {
  background: #ffffff;
  color: #0f172a;
  border-radius: var(--radius-lg);
  padding: var(--space-12) var(--space-10);
  max-width: 840px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.paper-title {
  font-family: var(--font-heading);
  font-size: 1.85rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.paper-meta-row {
  display: flex;
  gap: var(--space-6);
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: var(--space-6);
}

.paper-sep {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: var(--space-6);
}

.paper-blocks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.p-clause-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.p-clause-body {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.7;
}

.p-table {
  width: 100%;
  border-collapse: collapse;
}

.p-table th, .p-table td {
  border: 1px solid #e2e8f0;
  padding: var(--space-2) var(--space-3);
  text-align: left;
}

.p-table th {
  background: #f1f5f9;
}

.p-kv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.p-sig-box {
  border: 2px dashed #94a3b8;
  border-radius: var(--radius-md);
  padding: var(--space-6);
  background: #f8fafc;
  margin-top: var(--space-4);
}

.p-sig-line {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 6px;
  font-weight: 600;
}

/* Audit Trail Tab */
.audit-card {
  padding: var(--space-8);
  max-width: 860px;
}

.audit-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.audit-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: relative;
  padding-left: var(--space-6);
  border-left: 2px solid var(--color-border);
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -31px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg-card);
}

.timeline-dot.contract_signed, .timeline-dot.contract_completed {
  background: var(--color-success);
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ── HTML Contract Preview Canvas ── */
.html-contract-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-bottom: 60px;
}

.html-preview-topbar {
  width: 210mm;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  margin-bottom: 24px;
}

.html-contract-canvas-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.html-contract-canvas-inner :deep(.page) {
  margin: 0 auto 16mm;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.14);
}

/* ── Rich Activity Timeline Styling ── */
.rich-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: var(--space-4);
  position: relative;
}

.rt-item {
  display: flex;
  gap: var(--space-4);
  position: relative;
}

.rt-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}

.rt-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rt-connector {
  width: 2px;
  flex: 1;
  min-height: 28px;
  background: var(--color-border);
  margin: 4px 0;
}

.rt-card {
  flex: 1;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.rt-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.rt-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.rt-heading-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rt-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.rt-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 12px;
}

.rt-time {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.rt-meta {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.rt-actor strong {
  color: var(--color-text-main);
}

.rt-ip code {
  background: var(--color-bg-subtle, #f1f5f9);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-main);
}

.rt-dot {
  color: var(--color-text-muted);
  margin: 0 2px;
}

/* Timeline colors */
.rt-color-indigo { background: #eef2ff; border: 1.5px solid #c7d2fe; }
.rt-color-blue   { background: #eff6ff; border: 1.5px solid #bfdbfe; }
.rt-color-emerald{ background: #ecfdf5; border: 1.5px solid #a7f3d0; }
.rt-color-teal   { background: #f0fdfa; border: 1.5px solid #99f6e4; }
.rt-color-amber  { background: #fffbeb; border: 1.5px solid #fde68a; }
.rt-color-purple { background: #faf5ff; border: 1.5px solid #e9d5ff; }
.rt-color-rose   { background: #fff1f2; border: 1.5px solid #fecdd3; }
.rt-color-neutral{ background: #f8fafc; border: 1.5px solid #e2e8f0; }

.badge-indigo { background: #eef2ff; color: #4338ca; }
.badge-blue   { background: #eff6ff; color: #1d4ed8; }
.badge-emerald{ background: #ecfdf5; color: #047857; }
.badge-teal   { background: #f0fdfa; color: #0f766e; }
.badge-amber  { background: #fffbeb; color: #b45309; }
.badge-purple { background: #faf5ff; color: #6b21a8; }
.badge-rose   { background: #fff1f2; color: #be123c; }
.badge-neutral{ background: #f1f5f9; color: #475569; }
</style>
