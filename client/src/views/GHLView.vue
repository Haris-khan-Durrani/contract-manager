<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">HighLevel Integration & Sync</h1>
        <p class="page-subtitle">
          Configure webhook ingestion, discover custom fields, and manage bidirectional sync settings.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="refreshFields" :disabled="refreshing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          {{ refreshing ? 'Refreshing Cache…' : 'Refresh Fields Cache' }}
        </button>

        <button class="btn btn-primary" @click="showNewFieldModal = true">
          + Create HighLevel Field
        </button>
      </div>
    </div>

    <!-- Page Body -->
    <div class="page-body animate-fade-in">
      <!-- Connection Status Banner -->
      <div class="glass-card status-banner">
        <div class="banner-icon-wrap">
          <div class="pulse-dot"></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <div class="banner-text">
          <h3>HighLevel Private Integration Connected</h3>
          <p class="text-muted">
            API calls are executed server-side with throttled concurrency (4 req/sec limit) and exponential backoff retry.
          </p>
        </div>

        <div class="banner-badges">
          <span class="badge badge-success">API Active</span>
          <span class="badge badge-neutral">Version: 2021-07-28</span>
        </div>
      </div>

      <!-- Two-Column Grid: Webhook Settings & Field Discovery -->
      <div class="ghl-grid">
        <!-- Webhook Configuration -->
        <div class="glass-card ghl-panel">
          <div class="panel-header">
            <h3>Webhook Automation Ingestion</h3>
            <p class="text-muted">
              Configure this webhook URL inside your HighLevel Automation Workflow to trigger contracts on opportunity moves.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Webhook Endpoint URL</label>
            <div class="input-with-copy">
              <input
                type="text"
                :value="webhookUrl"
                class="form-control"
                readonly
              />
              <button type="button" class="btn btn-secondary btn-sm" @click="copyText(webhookUrl)">
                Copy URL
              </button>
            </div>
            <small class="text-muted" style="margin-top: 4px; display: block;">
              Method: <code>POST</code> • Payload format: <code>JSON</code>
            </small>
          </div>

          <div class="webhook-steps">
            <h4>Setup Guide in HighLevel:</h4>
            <ol class="steps-ol">
              <li>In HighLevel, open <strong>Automation → Workflows</strong>.</li>
              <li>Create a workflow triggered by <strong>Opportunity Status Update</strong> or <strong>Opportunity Stage Changed</strong>.</li>
              <li>Add a <strong>Webhook Action</strong> pointing to the URL above.</li>
              <li>Add header: <code>X-Webhook-Secret: [Your configured secret]</code>.</li>
            </ol>
          </div>
        </div>

        <!-- Custom Fields Discovery -->
        <div class="glass-card ghl-panel">
          <div class="panel-header">
            <div class="panel-title-row">
              <h3>HighLevel Custom Fields ({{ filteredFields.length }})</h3>
              <div class="model-filter">
                <button
                  type="button"
                  class="filter-pill"
                  :class="{ active: selectedModel === '' }"
                  @click="selectedModel = ''"
                >All</button>
                <button
                  type="button"
                  class="filter-pill"
                  :class="{ active: selectedModel === 'contact' }"
                  @click="selectedModel = 'contact'"
                >Contact</button>
                <button
                  type="button"
                  class="filter-pill"
                  :class="{ active: selectedModel === 'opportunity' }"
                  @click="selectedModel = 'opportunity'"
                >Opportunity</button>
              </div>
            </div>
            <p class="text-muted">
              Discovered custom fields cached for 15 minutes. Click "Refresh Fields Cache" to pull changes.
            </p>
          </div>

          <div class="field-search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search custom fields by name or ID…"
              class="form-control"
            />
          </div>

          <div v-if="loadingFields" style="padding: var(--space-8); text-align: center;">
            <div class="spinner"></div>
          </div>

          <div v-else class="fields-scroll-list">
            <div
              v-for="f in filteredFields"
              :key="f.id"
              class="field-item-card"
            >
              <div class="field-item-top">
                <strong>{{ f.name }}</strong>
                <span class="badge" :class="f.model === 'opportunity' ? 'badge-warning' : 'badge-info'">
                  {{ f.model || 'contact' }}
                </span>
              </div>
              <div class="field-item-bottom">
                <code>{{ f.id }}</code>
                <span class="badge badge-neutral">{{ f.dataType }}</span>
              </div>
            </div>

            <div v-if="!filteredFields.length" class="empty-notice">
              No custom fields found.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Custom Field Modal -->
    <div v-if="showNewFieldModal" class="modal-overlay" @click.self="showNewFieldModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Create HighLevel Custom Field</h3>
          <button class="btn-close" @click="showNewFieldModal = false">✕</button>
        </div>

        <form @submit.prevent="createField" class="modal-form">
          <div class="form-group">
            <label class="form-label">Field Name <span class="req">*</span></label>
            <input
              type="text"
              v-model="newField.name"
              class="form-control"
              placeholder="e.g. Contract Signed Date"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Target Model</label>
            <select v-model="newField.model" class="form-control">
              <option value="contact">Contact Field</option>
              <option value="opportunity">Opportunity Field</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Data Type</label>
            <select v-model="newField.dataType" class="form-control">
              <option value="TEXT">Short Text (TEXT)</option>
              <option value="LARGE_TEXT">Paragraph / Long Text (LARGE_TEXT)</option>
              <option value="NUMERICAL">Number (NUMERICAL)</option>
              <option value="MONETARY">Currency / Money (MONETARY)</option>
              <option value="DATE">Date (DATE)</option>
              <option value="CHECKBOX">Checkbox (CHECKBOX)</option>
              <option value="SINGLE_OPTIONS">Dropdown (SINGLE_OPTIONS)</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showNewFieldModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Creating in HighLevel…' : 'Create Field' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const fields = ref([])
const loadingFields = ref(true)
const refreshing = ref(false)
const selectedModel = ref('')
const searchQuery = ref('')

const showNewFieldModal = ref(false)
const creating = ref(false)
const newField = ref({
  name: '',
  dataType: 'TEXT',
  model: 'contact',
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const webhookUrl = `${window.location.origin.replace(':5173', ':3001')}/api/webhooks/ghl`

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

const filteredFields = computed(() => {
  return fields.value.filter(f => {
    const matchModel = !selectedModel.value || f.model === selectedModel.value
    const matchSearch = !searchQuery.value.trim() ||
      (f.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (f.id || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchModel && matchSearch
  })
})

async function fetchFields() {
  loadingFields.value = true
  try {
    const res = await axios.get(`${apiBase}/ghl/custom-fields`, { headers: getHeaders() })
    fields.value = res.data.fields || []
  } catch (err) {
    console.error('Fetch fields error:', err)
  } finally {
    loadingFields.value = false
  }
}

async function refreshFields() {
  refreshing.value = true
  try {
    const res = await axios.post(`${apiBase}/ghl/custom-fields/refresh`, {}, { headers: getHeaders() })
    fields.value = res.data.fields || []
    alert(`Refreshed ${res.data.count || fields.value.length} HighLevel custom fields!`)
  } catch (err) {
    console.error('Refresh fields error:', err)
  } finally {
    refreshing.value = false
  }
}

async function createField() {
  if (!newField.value.name.trim()) return
  creating.value = true

  try {
    const res = await axios.post(`${apiBase}/ghl/custom-fields`, newField.value, { headers: getHeaders() })
    fields.value.unshift(res.data.field)
    showNewFieldModal.value = false
    newField.value = { name: '', dataType: 'TEXT', model: 'contact' }
    alert('HighLevel custom field created successfully!')
  } catch (err) {
    console.error('Create field error:', err)
    alert('Failed to create field in HighLevel.')
  } finally {
    creating.value = false
  }
}

function copyText(text) {
  navigator.clipboard?.writeText(text)
  alert(`Copied to clipboard:\n${text}`)
}

onMounted(() => {
  fetchFields()
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

.status-banner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-6);
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.banner-icon-wrap {
  position: relative;
  color: var(--color-success);
}

.pulse-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.banner-badges {
  display: flex;
  gap: var(--space-2);
}

.ghl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .ghl-grid {
    grid-template-columns: 1fr;
  }
}

.ghl-panel {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: var(--space-4);
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.model-filter {
  display: flex;
  gap: 4px;
}

.filter-pill {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
}

.filter-pill.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.input-with-copy {
  display: flex;
  gap: var(--space-2);
}

.webhook-steps {
  margin-top: var(--space-6);
  background: var(--color-bg-base);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.webhook-steps h4 {
  font-size: 0.85rem;
  margin-bottom: var(--space-2);
}

.steps-ol {
  padding-left: var(--space-4);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.field-search-box {
  margin-bottom: var(--space-3);
}

.fields-scroll-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 440px;
  overflow-y: auto;
}

.field-item-card {
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-item-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.field-item-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
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
  max-width: 480px;
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

.empty-notice {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
</style>
