<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">Contract Templates</h1>
        <p class="page-subtitle">
          Manage contract blueprints, document clause schemas, conditional logic, and HighLevel automation rules.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="fetchTemplates" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Refresh
        </button>

        <button class="btn btn-secondary" @click="openImportHtmlModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import HTML / CSS
        </button>

        <button class="btn btn-primary" @click="openCreateModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Template
        </button>
      </div>
    </div>

    <!-- Page Body -->
    <div class="page-body animate-fade-in">
      <!-- Search & Filters -->
      <div class="filter-bar">
        <div class="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search templates by name or contract type…"
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="typeFilter" class="filter-select">
            <option value="">All Contract Types</option>
            <option value="Service Agreement">Service Agreement</option>
            <option value="Non-Disclosure Agreement">NDA</option>
            <option value="Master Services Agreement">MSA</option>
            <option value="Sales Proposal">Sales Proposal</option>
            <option value="Retainer">Retainer</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="glass-card" style="padding: var(--space-12); text-align: center;">
        <div class="spinner"></div>
        <p class="text-muted" style="margin-top: var(--space-4);">Loading templates…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredTemplates.length" class="glass-card empty-card">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h2 style="margin: var(--space-4) 0 var(--space-2);">No Templates Found</h2>
        <p class="text-muted" style="max-width: 440px; margin: 0 auto var(--space-6);">
          Templates unify your document builder, associated form, GHL field mappings, and automated opportunity rules.
        </p>
        <button class="btn btn-primary" @click="openCreateModal">
          Create First Template
        </button>
      </div>

      <!-- Templates Grid -->
      <div v-else class="templates-grid">
        <div
          v-for="t in filteredTemplates"
          :key="t.id"
          class="glass-card template-card"
          @click="openBuilder(t.id)"
        >
          <div class="card-header">
            <div class="card-badges">
              <span class="badge badge-primary">{{ t.contract_type }}</span>
              <span class="badge badge-neutral">v{{ t.current_version }}</span>
              <span v-if="t.is_active" class="badge badge-success">Active</span>
              <span v-else class="badge badge-danger">Draft</span>
            </div>

            <button
              type="button"
              class="btn-icon-more"
              @click.stop="duplicateTemplate(t.id)"
              title="Duplicate Template"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>

          <h3 class="template-name">{{ t.name }}</h3>

          <div class="template-meta-list">
            <div class="meta-row">
              <span class="meta-label">Associated Form:</span>
              <span class="meta-value">{{ t.form_name || 'No form attached' }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Signing Validity:</span>
              <span class="meta-value">{{ t.validity_days || 7 }} days</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Last Modified:</span>
              <span class="meta-value">{{ formatDate(t.updated_at) }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="text-muted small-text">Template #{{ t.id }}</span>
            <span class="open-builder-text">Open Studio →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Template Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Create Contract Template</h3>
          <button class="btn-close" @click="showCreateModal = false">✕</button>
        </div>

        <form @submit.prevent="createTemplate" class="modal-form">
          <div class="form-group">
            <label class="form-label">Template Name <span class="req">*</span></label>
            <input
              type="text"
              v-model="newTemplate.name"
              class="form-control"
              placeholder="e.g. Master Services Agreement (Standard)"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contract Type</label>
            <select v-model="newTemplate.contractType" class="form-control">
              <option value="Service Agreement">Service Agreement</option>
              <option value="Non-Disclosure Agreement">Non-Disclosure Agreement (NDA)</option>
              <option value="Master Services Agreement">Master Services Agreement (MSA)</option>
              <option value="Sales Proposal">Sales Proposal</option>
              <option value="Retainer Agreement">Retainer Agreement</option>
              <option value="Employment Contract">Employment Contract</option>
              <option value="Custom Agreement">Custom Agreement</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Attach Intake Form</label>
            <select v-model="newTemplate.formId" class="form-control">
              <option :value="null">-- No form attached (Document only) --</option>
              <option v-for="f in availableForms" :key="f.id" :value="f.id">
                {{ f.name }}
              </option>
            </select>
            <small class="text-muted" style="font-size: 0.75rem;">
              The form defines what fields the sales rep fills out before sending.
            </small>
          </div>

          <div class="form-group">
            <label class="form-label">Signing Validity Window (Days)</label>
            <input
              type="number"
              v-model.number="newTemplate.validityDays"
              class="form-control"
              min="1"
              max="90"
            />
            <small class="text-muted" style="font-size: 0.75rem;">
              Client signing link automatically expires after this many days.
            </small>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="creating || !newTemplate.name.trim()">
              {{ creating ? 'Creating…' : 'Create & Open Studio' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── IMPORT HTML / CSS TEMPLATE MODAL ────────────────────────────── -->
    <div v-if="showImportModal" class="modal-backdrop animate-fade-in" @click.self="showImportModal = false">
      <div class="modal-card glass-card animate-scale-up" style="max-width: 820px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div>
            <div class="badge badge-primary badge-sm" style="margin-bottom: 4px;">HTML & CSS Engine</div>
            <h3 class="modal-title">Import Template from HTML / CSS</h3>
            <p class="modal-sub">
              Paste your A4 paired-table bilingual markup and CSS to create a 100% pixel-perfect legal agreement.
            </p>
          </div>
          <button type="button" class="btn-close" @click="showImportModal = false">✕</button>
        </div>

        <form @submit.prevent="handleHtmlImport" class="modal-form">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" @click="loadCyprusPreset">
              📄 Load Cyprus Business Residence Visa Preset
            </button>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="field-label">Template Name <span class="req">*</span></label>
              <input
                type="text"
                v-model="importForm.name"
                class="form-control"
                placeholder="e.g. Legal Services Agreement - Cyprus Business Residence Visa"
                required
              />
            </div>

            <div class="form-group">
              <label class="field-label">Contract Type</label>
              <input
                type="text"
                v-model="importForm.contractType"
                class="form-control"
                placeholder="e.g. Cyprus Business Residence Visa"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Official Logo CDN URL</label>
            <input
              type="url"
              v-model="importForm.logoUrl"
              class="form-control"
              placeholder="https://assets.cdn.filesafe.space/..."
            />
            <small class="text-muted" style="font-size: 0.75rem;">
              Relative logo images in the HTML will automatically be mapped to this URL.
            </small>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="field-label">HTML Template Code <span class="req">*</span></label>
              <span class="text-muted" style="font-size: 0.75rem;">Includes paired &lt;table class="bilingual-table"&gt; &amp; pages</span>
            </div>
            <textarea
              v-model="importForm.html"
              class="form-control code-textarea"
              rows="9"
              placeholder="<!DOCTYPE html>... or <div class='document'>..."
              required
              style="font-family: monospace; font-size: 0.82rem; line-height: 1.4;"
            ></textarea>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="field-label">CSS Stylesheet</label>
              <span class="text-muted" style="font-size: 0.75rem;">Variables, typography, A4 page layout rules</span>
            </div>
            <textarea
              v-model="importForm.css"
              class="form-control code-textarea"
              rows="6"
              placeholder=":root { --page-width: 210mm; ... }"
              style="font-family: monospace; font-size: 0.82rem; line-height: 1.4;"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showImportModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="importing || !importForm.html.trim()">
              {{ importing ? 'Importing & Initializing…' : 'Import & Open in Studio' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const loading = ref(true)
const templates = ref([])
const availableForms = ref([])
const searchQuery = ref('')
const typeFilter = ref('')

const showCreateModal = ref(false)
const creating = ref(false)
const newTemplate = ref({
  name: '',
  contractType: 'Service Agreement',
  formId: null,
  validityDays: 7,
})

const showImportModal = ref(false)
const importing = ref(false)
const importForm = ref({
  name: '',
  contractType: 'Cyprus Business Residence Visa',
  validityDays: 7,
  logoUrl: 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png',
  html: '',
  css: '',
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchSearch = !searchQuery.value.trim() ||
      (t.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.contract_type || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = !typeFilter.value || t.contract_type === typeFilter.value
    return matchSearch && matchType
  })
})

async function fetchTemplates() {
  loading.value = true
  try {
    const [tRes, fRes] = await Promise.all([
      axios.get(`${apiBase}/templates`, { headers: getHeaders() }),
      axios.get(`${apiBase}/forms`, { headers: getHeaders() }).catch(() => ({ data: { forms: [] } })),
    ])
    templates.value = tRes.data.templates || []
    availableForms.value = fRes.data.forms || []
  } catch (err) {
    console.error('Failed to fetch templates:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  newTemplate.value = {
    name: '',
    contractType: 'Service Agreement',
    formId: availableForms.value[0]?.id || null,
    validityDays: 7,
  }
  showCreateModal.value = true
}

async function createTemplate() {
  if (!newTemplate.value.name.trim()) return
  creating.value = true

  try {
    const initialDocSchema = {
      title: newTemplate.value.name.trim(),
      blocks: [
        {
          id: `block_${Date.now()}_1`,
          type: 'clause',
          title: '1. Purpose & Parties',
          content: 'This Agreement is entered into by and between the issuing party and {{client_name}} ("Client"). The parties agree to the terms and specifications outlined herein.',
        },
        {
          id: `block_${Date.now()}_2`,
          type: 'clause',
          title: '2. Services & Scope',
          content: 'The Provider shall deliver the designated scope of services with professional skill and care. All deliverables shall conform to agreed specifications.',
        },
        {
          id: `block_${Date.now()}_3`,
          type: 'signature',
          label: 'Client Authorized Signature',
        },
      ],
    }

    const res = await axios.post(
      `${apiBase}/templates`,
      {
        name: newTemplate.value.name.trim(),
        contractType: newTemplate.value.contractType,
        formId: newTemplate.value.formId,
        validityDays: newTemplate.value.validityDays,
        documentSchema: initialDocSchema,
        conditionalRules: [],
        creationRules: {
          enabled: false,
          pipelineId: '',
          stageId: '',
          conditions: [],
        },
      },
      { headers: getHeaders() }
    )

    showCreateModal.value = false
    router.push(`/templates/${res.data.templateId}/builder`)
  } catch (err) {
    console.error('Failed to create template:', err)
    alert('Failed to create template. Please check permissions.')
  } finally {
    creating.value = false
  }
}

function openImportHtmlModal() {
  importForm.value = {
    name: 'Legal Services Agreement - Cyprus Business Residence Visa',
    contractType: 'Cyprus Business Residence Visa',
    validityDays: 7,
    logoUrl: 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png',
    html: '',
    css: '',
  }
  showImportModal.value = true
}

async function loadCyprusPreset() {
  try {
    const res = await axios.get(`${apiBase}/templates/4`, { headers: getHeaders() })
      .catch(() => axios.get(`${apiBase}/templates/5`, { headers: getHeaders() }))
    const schema = typeof res.data.template?.document_schema_json === 'string'
      ? JSON.parse(res.data.template.document_schema_json)
      : res.data.template?.document_schema_json
    if (schema?.rawHtml) {
      importForm.value.name = res.data.template.name || 'Legal Services Agreement - Cyprus Business Residence Visa'
      importForm.value.html = schema.rawHtml
      importForm.value.css = schema.customCss || ''
      return
    }
  } catch (e) {
    console.warn('Could not load preset from server:', e)
  }
}

async function handleHtmlImport() {
  if (!importForm.value.html.trim()) return
  importing.value = true
  try {
    const res = await axios.post(
      `${apiBase}/templates/import-html`,
      {
        name: importForm.value.name.trim() || 'Imported HTML/CSS Template',
        contractType: importForm.value.contractType || 'Legal Services Agreement',
        validityDays: importForm.value.validityDays || 7,
        html: importForm.value.html,
        css: importForm.value.css,
        logoUrl: importForm.value.logoUrl,
      },
      { headers: getHeaders() }
    )

    showImportModal.value = false
    router.push(`/templates/${res.data.templateId}/builder`)
  } catch (err) {
    console.error('Failed to import template:', err)
    alert(err.response?.data?.error || 'Failed to import HTML template.')
  } finally {
    importing.value = false
  }
}

async function duplicateTemplate(id) {
  try {
    const res = await axios.post(`${apiBase}/templates/${id}/duplicate`, {}, { headers: getHeaders() })
    fetchTemplates()
    router.push(`/templates/${res.data.templateId}/builder`)
  } catch (err) {
    console.error('Failed to duplicate template:', err)
  }
}

function openBuilder(id) {
  router.push(`/templates/${id}/builder`)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.page-title {
  font-family: var(--font-heading);
  font-size: 1.85rem;
  font-weight: 700;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: var(--space-1);
}

.filter-bar {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.search-input-wrap {
  flex: 1;
  min-width: 260px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrap svg {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) 38px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-base);
  font-size: 0.9rem;
}

.filter-select {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-base);
  font-size: 0.9rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-6);
}

.template-card {
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.card-badges {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.btn-icon-more {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
}

.btn-icon-more:hover {
  color: var(--color-text-base);
  background: var(--color-bg-base);
}

.template-name {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.template-meta-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex: 1;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.meta-label {
  color: var(--color-text-muted);
}

.meta-value {
  font-weight: 500;
  color: var(--color-text-base);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.open-builder-text {
  color: var(--color-primary-light);
  font-weight: 600;
  font-size: 0.85rem;
}

/* Empty Card */
.empty-card {
  padding: var(--space-12);
  text-align: center;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: var(--color-text-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 520px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
}

.req {
  color: var(--color-danger);
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-base);
  font-size: 0.9rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
