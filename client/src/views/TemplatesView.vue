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
          class="template-card"
          @click="openBuilder(t.id)"
        >
          <!-- Top Accent Bar -->
          <div class="card-accent-bar" :class="{ 'accent-active': t.is_active }"></div>

          <!-- Card Header & Badges -->
          <div class="card-header">
            <div class="card-badges">
              <span class="badge-type" :title="t.contract_type">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>{{ t.contract_type }}</span>
              </span>
              <span class="badge-version">v{{ t.current_version }}</span>
              <span v-if="t.is_active" class="badge-status-active">
                <span class="pulse-dot"></span>
                Active
              </span>
              <span v-else class="badge-status-draft">Draft</span>
              <span v-if="t.name && (t.name.includes('Cyprus') || t.name.includes('Bilingual') || t.is_html_template)" class="badge-format">
                ✨ HTML Studio
              </span>
            </div>

            <div class="card-actions-row">
              <button
                type="button"
                class="btn-card-action"
                @click.stop="duplicateTemplate(t.id)"
                title="Duplicate Template"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button
                type="button"
                class="btn-card-action btn-card-delete"
                @click.stop="confirmDeleteTemplate(t)"
                title="Delete Template"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Title Block with Document Icon -->
          <div class="template-title-block">
            <div class="template-doc-icon" :class="{ 'icon-active': t.is_active }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 class="template-name">{{ t.name }}</h3>
          </div>

          <!-- Structured Metadata Cardlet -->
          <div class="template-meta-cardlet">
            <div class="meta-row">
              <span class="meta-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Associated Form
              </span>
              <span class="meta-value form-value" :title="t.form_name">
                {{ t.form_name || 'Standard Service Intake Form' }}
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Signing Validity
              </span>
              <span class="meta-value validity-badge">
                {{ t.validity_days || 7 }} days
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Last Modified
              </span>
              <span class="meta-value text-muted">{{ formatDate(t.updated_at) }}</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="template-id-tag">
              <span class="id-hash">#</span>
              <span class="id-num">{{ t.id }}</span>
            </div>
            <div class="btn-open-studio">
              <span>Open Studio</span>
              <svg class="studio-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
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

    <!-- Delete Template Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-card animate-fade-in" style="max-width: 440px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              ⚠️
            </div>
            <h3 style="margin: 0; color: #0f172a;">Delete Contract Template?</h3>
          </div>
          <button class="btn-close" @click="showDeleteModal = false">✕</button>
        </div>

        <div style="padding: 16px 0 6px;">
          <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 0 0 12px;">
            Are you sure you want to permanently delete <strong>"{{ templateToDelete?.name }}"</strong> (Template #{{ templateToDelete?.id }})?
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; color: #64748b;">
            ⚠️ This will remove the document blueprint and all its version history. Contracts already signed or dispatched will remain securely sealed in the audit repository.
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 14px;">
          <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button type="button" class="btn btn-danger" :disabled="deleting" @click="deleteTemplate">
            {{ deleting ? 'Deleting…' : '🗑️ Delete Template' }}
          </button>
        </div>
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

const showDeleteModal = ref(false)
const templateToDelete = ref(null)
const deleting = ref(false)

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

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

function confirmDeleteTemplate(t) {
  templateToDelete.value = t
  showDeleteModal.value = true
}

async function deleteTemplate() {
  if (!templateToDelete.value) return
  deleting.value = true
  try {
    await axios.delete(`${apiBase}/templates/${templateToDelete.value.id}`, { headers: getHeaders() })
    showDeleteModal.value = false
    templateToDelete.value = null
    fetchTemplates()
  } catch (err) {
    console.error('Failed to delete template:', err)
    alert(err.response?.data?.error || 'Failed to delete template.')
  } finally {
    deleting.value = false
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
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 20px 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
}

.template-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
  box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.25);
}

/* Top Accent Line */
.card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3.5px;
  background: linear-gradient(90deg, #94a3b8, #cbd5e1);
  transition: all 0.25s ease;
}

.card-accent-bar.accent-active {
  background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
}

.template-card:hover .card-accent-bar {
  height: 4.5px;
}

/* Card Header & Badges */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-badges {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.badge-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-version {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

.badge-status-active {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  font-size: 0.72rem;
  font-weight: 600;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.badge-status-draft {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fefce8;
  color: #a16207;
  border: 1px solid #fef08a;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-format {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Card Actions */
.card-actions-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.btn-card-action {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-card-action:hover {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: translateY(-1px);
}

.btn-card-action.btn-card-delete:hover {
  color: #dc2626;
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Title Block */
.template-title-block {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.template-doc-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.template-doc-icon.icon-active {
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
  border-color: #bfdbfe;
  color: #2563eb;
}

.template-card:hover .template-doc-icon {
  transform: scale(1.05);
}

.template-name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.38;
  margin: 0;
  transition: color 0.15s ease;
}

.template-card:hover .template-name {
  color: #2563eb;
}

/* Metadata Cardlet */
.template-meta-cardlet {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  flex: 1;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  gap: 8px;
}

.meta-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
}

.meta-label svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.meta-value {
  font-weight: 600;
  color: #1e293b;
  max-width: 60%;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
}

.form-value {
  color: #334155;
  font-weight: 500;
}

.validity-badge {
  display: inline-flex;
  align-items: center;
  background: #e0f2fe;
  color: #0369a1;
  padding: 1px 7px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #bae6fd;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: auto;
}

.template-id-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

.id-hash {
  color: #94a3b8;
  font-size: 0.7rem;
}

.btn-open-studio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.82rem;
  border: 1px solid #bfdbfe;
  transition: all 0.2s ease;
}

.template-card:hover .btn-open-studio {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.studio-arrow {
  transition: transform 0.2s ease;
}

.template-card:hover .studio-arrow {
  transform: translateX(3px);
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
