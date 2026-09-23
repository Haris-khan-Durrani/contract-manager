<template>
  <div class="settings-view">
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
      <div>
        <h1 style="font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 4px;">System & Integration Settings</h1>
        <p style="color: var(--color-text-secondary); font-size: var(--text-sm);">
          All settings below are persisted directly in the MySQL <code>system_settings</code> table and reloaded dynamically in real time.
        </p>
      </div>
      <button class="btn btn-primary" :disabled="saving || loading" @click="saveSettings">
        {{ saving ? 'Saving Changes…' : '💾 Save Settings' }}
      </button>
    </div>

    <!-- Alert / Toast Messages -->
    <div v-if="successMsg" class="badge badge-completed" style="padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px; width: 100%;">
      <span>✅</span>
      <span>{{ successMsg }}</span>
    </div>
    <div v-if="errorMsg" class="badge badge-declined" style="padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px; width: 100%;">
      <span>⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <div v-if="loading" class="glass-card" style="padding: var(--space-8); text-align: center; color: var(--color-text-muted);">
      Loading system settings from MySQL…
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- 1. GoHighLevel Credentials -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">⚡</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">GoHighLevel API & Webhook Credentials</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Configure your GHL marketplace shared secret, private integration tokens, and webhook secrets.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>GHL Shared Secret</span>
              <span class="badge badge-info" style="font-size: 10px;">Context JWT</span>
            </label>
            <input 
              v-model="form.GHL_SHARED_SECRET" 
              :type="showSecret.GHL_SHARED_SECRET ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter GHL Marketplace Shared Secret" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Found in Marketplace App Settings</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_SHARED_SECRET')">
                {{ showSecret.GHL_SHARED_SECRET ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>GHL Private Integration Token</span>
              <span class="badge badge-info" style="font-size: 10px;">Backend API</span>
            </label>
            <input 
              v-model="form.GHL_PRIVATE_INTEGRATION_TOKEN" 
              :type="showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter Private Integration Token (Bearer)" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Found in Sub-Account Settings → Private Integrations</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_PRIVATE_INTEGRATION_TOKEN')">
                {{ showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>Webhook Ingestion Secret</span>
              <span class="badge badge-info" style="font-size: 10px;">Automation</span>
            </label>
            <input 
              v-model="form.GHL_WEBHOOK_SECRET" 
              :type="showSecret.GHL_WEBHOOK_SECRET ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter Webhook Auth Secret" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Pass in webhook header: Authorization: Bearer &lt;secret&gt;</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_WEBHOOK_SECRET')">
                {{ showSecret.GHL_WEBHOOK_SECRET ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label">GHL API Version</label>
            <input v-model="form.GHL_API_VERSION" type="text" class="form-control" placeholder="2021-07-28" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 2021-07-28
            </span>
          </div>

          <div style="grid-column: span 2;">
            <label class="form-label">GHL API Base URL</label>
            <input v-model="form.GHL_API_BASE_URL" type="text" class="form-control" placeholder="https://services.leadconnectorhq.com" />
          </div>
        </div>
      </div>

      <!-- 2. Application & Public Signing Portal -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">🌐</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Application & Public Signing URL</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Controls the external URL generated for client contract signing links.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div style="grid-column: span 2;">
            <label class="form-label">Signing Base URL</label>
            <input v-model="form.SIGNING_BASE_URL" type="text" class="form-control" placeholder="https://sign.yourdomain.com or http://localhost:5173" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Links sent to signers will use: <code>{{ form.SIGNING_BASE_URL || 'http://localhost:5173' }}/sign/&lt;token&gt;</code>
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Performance & Worker Configurations -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">⚙️</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Performance & Background Workers</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Fine-tune GHL rate-limiting concurrency and automated cron frequencies.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label">GHL Concurrency Limit</label>
            <input v-model="form.GHL_CONCURRENCY_LIMIT" type="number" class="form-control" placeholder="4" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Max concurrent requests to GHL
            </span>
          </div>

          <div>
            <label class="form-label">Field Cache TTL (ms)</label>
            <input v-model="form.GHL_FIELD_CACHE_TTL_MS" type="number" class="form-control" placeholder="900000" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 900000 (15 min)
            </span>
          </div>

          <div>
            <label class="form-label">Max PDF Upload Retries</label>
            <input v-model="form.MAX_UPLOAD_RETRIES" type="number" class="form-control" placeholder="5" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Before dead-letter escalation
            </span>
          </div>

          <div>
            <label class="form-label">Expiry Worker Cron</label>
            <input v-model="form.EXPIRY_WORKER_CRON" type="text" class="form-control" placeholder="*/5 * * * *" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Overdue contract scanner
            </span>
          </div>

          <div>
            <label class="form-label">Retry Worker Cron</label>
            <input v-model="form.RETRY_WORKER_CRON" type="text" class="form-control" placeholder="*/2 * * * *" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Failed PDF upload retrier
            </span>
          </div>

          <div>
            <label class="form-label">Session Token Duration</label>
            <input v-model="form.JWT_EXPIRES_IN" type="text" class="form-control" placeholder="8h" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 8h
            </span>
          </div>
        </div>
      </div>

      <!-- 4. Data Access & Sales Privacy Controls -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">🛡️</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Data Access & Sales Permissions</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Configure whether sales representatives can only access contacts and deals assigned to them in GoHighLevel.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Restrict Sales Agents to Assigned Data</span>
              <span class="badge" :class="form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'badge-completed' : 'badge-neutral'" style="font-size: 11px;">
                {{ form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'Enforced' : 'Unrestricted' }}
              </span>
            </label>
            <select v-model="form.RESTRICT_CONTACTS_TO_ASSIGNED" class="form-control">
              <option value="true">Enabled (Restricted) — Sales users only see their own assigned contacts & deals</option>
              <option value="false">Disabled (Open) — Sales users can search and view all contacts & deals across the location</option>
            </select>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 6px;">
              When enabled, representatives (e.g. Akram Mammeri) will only see contacts/leads assigned to their GoHighLevel account. Admins and Super Admins always have access to all data.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  GHL_SHARED_SECRET: '',
  GHL_PRIVATE_INTEGRATION_TOKEN: '',
  GHL_WEBHOOK_SECRET: '',
  GHL_API_BASE_URL: '',
  GHL_API_VERSION: '',
  SIGNING_BASE_URL: '',
  GHL_CONCURRENCY_LIMIT: 4,
  GHL_FIELD_CACHE_TTL_MS: 900000,
  MAX_UPLOAD_RETRIES: 5,
  EXPIRY_WORKER_CRON: '*/5 * * * *',
  RETRY_WORKER_CRON: '*/2 * * * *',
  JWT_EXPIRES_IN: '8h',
  RESTRICT_CONTACTS_TO_ASSIGNED: 'true',
})

const showSecret = ref({
  GHL_SHARED_SECRET: false,
  GHL_PRIVATE_INTEGRATION_TOKEN: false,
  GHL_WEBHOOK_SECRET: false,
})

function toggleShow(field) {
  showSecret.value[field] = !showSecret.value[field]
}

async function loadSettings() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.get('/settings')
    if (res.data?.settings) {
      for (const item of res.data.settings) {
        if (form.value[item.key] !== undefined) {
          form.value[item.key] = item.value
        }
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to load settings.'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = { ...form.value }
    const res = await api.put('/settings', { settings: payload })
    successMsg.value = res.data?.message || 'Settings saved successfully in MySQL!'
    setTimeout(() => { successMsg.value = '' }, 4000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to save settings.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>
