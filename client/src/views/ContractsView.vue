<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">Contracts</h1>
        <p class="page-subtitle">
          Track all agreements across your pipeline from draft intake to signature and completion.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="fetchContracts" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Refresh
        </button>

        <router-link to="/contracts/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Contract
        </router-link>
      </div>
    </div>

    <!-- Page Body -->
    <div class="page-body animate-fade-in">
      <!-- Status Filter Tabs & Search -->
      <div class="contracts-filter-bar">
        <div class="status-pills">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            type="button"
            class="status-pill-btn"
            :class="{ active: selectedStatus === s.value }"
            @click="selectedStatus = s.value; fetchContracts()"
          >
            {{ s.label }}
          </button>
        </div>

        <div class="search-wrap">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search contracts…"
            class="table-search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="glass-card" style="padding: var(--space-12); text-align: center;">
        <div class="spinner"></div>
        <p class="text-muted" style="margin-top: var(--space-4);">Loading contracts…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredContracts.length" class="glass-card empty-card">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h2 style="margin: var(--space-4) 0 var(--space-2);">No Contracts Found</h2>
        <p class="text-muted" style="max-width: 420px; margin: 0 auto var(--space-6);">
          {{ selectedStatus ? `No contracts matching status "${selectedStatus}".` : 'Get started by creating your first contract or triggering one from HighLevel.' }}
        </p>
        <router-link to="/contracts/new" class="btn btn-primary">
          Create New Contract
        </router-link>
      </div>

      <!-- Contracts Table -->
      <div v-else class="glass-card table-card">
        <div class="table-responsive">
          <table class="contracts-table">
            <thead>
              <tr>
                <th>Contract #</th>
                <th>Template</th>
                <th>Status</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Agent</th>
                <th>Created / Updated</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in filteredContracts"
                :key="c.id"
                class="clickable-row"
                @click="openContract(c.id)"
              >
                <td>
                  <strong>#{{ c.id }}</strong>
                </td>
                <td>
                  <strong>{{ c.template_name }}</strong>
                  <div class="text-muted small-text">{{ c.contract_type }}</div>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(c.state)">
                    {{ formatStatusLabel(c.state) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="c.form_mode === 'TEAM' ? 'badge-primary' : 'badge-neutral'">
                    {{ c.form_mode || 'NORMAL' }}
                  </span>
                </td>
                <td>
                  <div style="font-weight:600;">{{ c.recipient_name || c.ghl_contact_id }}</div>
                  <div v-if="c.recipient_email" class="text-muted small-text">{{ c.recipient_email }}</div>
                </td>
                <td>
                  <div style="font-size:0.82rem;font-weight:500;">{{ c.assigned_user_name || '—' }}</div>
                </td>
                <td>
                  <div>{{ formatDate(c.updated_at) }}</div>
                  <div class="text-muted small-text">Created {{ formatDate(c.created_at) }}</div>
                </td>
                <td style="text-align: right;" @click.stop>
                  <div style="display:inline-flex; gap:6px; align-items:center;">
                    <button
                      v-if="c.signing_token"
                      type="button"
                      class="btn btn-secondary btn-sm"
                      @click="copySigningLink(c.signing_token, c.id)"
                      title="Copy Public Link"
                    >
                      {{ copiedId === c.id ? '✓ Copied' : '📋 Link' }}
                    </button>
                    <router-link :to="`/contracts/${c.id}`" class="btn btn-secondary btn-sm">
                      Open →
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
const contracts = ref([])
const selectedStatus = ref('')
const searchQuery = ref('')
const copiedId = ref(null)

const statusOptions = [
  { label: 'All Contracts', value: '' },
  { label: 'Ready', value: 'READY' },
  { label: 'Opened / Sent', value: 'OPENED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
]

function copySigningLink(token, id) {
  const url = `${window.location.origin}/sign/${token}`
  navigator.clipboard?.writeText(url).catch(() => {})
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 2500)
}

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

const filteredContracts = computed(() => {
  return contracts.value.filter(c => {
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.toLowerCase()
    return String(c.id).includes(q) ||
      (c.template_name || '').toLowerCase().includes(q) ||
      (c.recipient_name || '').toLowerCase().includes(q) ||
      (c.recipient_email || '').toLowerCase().includes(q) ||
      (c.assigned_user_name || '').toLowerCase().includes(q) ||
      (c.ghl_contact_id || '').toLowerCase().includes(q)
  })
})

async function fetchContracts() {
  loading.value = true
  try {
    const params = {}
    if (selectedStatus.value) {
      params.state = selectedStatus.value
    }
    const res = await axios.get(`${apiBase}/contracts`, {
      params,
      headers: getHeaders(),
    })
    contracts.value = res.data.contracts || []
  } catch (err) {
    console.error('Failed to fetch contracts:', err)
  } finally {
    loading.value = false
  }
}

function openContract(id) {
  router.push(`/contracts/${id}`)
}

function getStatusBadgeClass(state) {
  const map = {
    AWAITING_FORM:          'badge-warning',
    READY:                  'badge-info',
    SENT:                   'badge-primary',
    VIEWED:                 'badge-primary',
    SIGNED:                 'badge-success',
    SIGNED_PENDING_STORAGE: 'badge-warning',
    COMPLETED:              'badge-success',
    EXPIRED:                'badge-neutral',
    CANCELLED:              'badge-danger',
    DECLINED:               'badge-danger',
  }
  return map[state] || 'badge-neutral'
}

function formatStatusLabel(state) {
  const map = {
    AWAITING_FORM:          'Awaiting Form',
    READY:                  'Ready to Send',
    SENT:                   'Sent to Client',
    VIEWED:                 'Viewed by Client',
    SIGNED:                 'Signed',
    SIGNED_PENDING_STORAGE: 'Syncing with GHL',
    COMPLETED:              'Completed & Sealed',
    EXPIRED:                'Expired',
    CANCELLED:              'Cancelled',
    DECLINED:               'Declined',
  }
  return map[state] || state
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
  fetchContracts()
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

.contracts-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.status-pills {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.status-pill-btn {
  padding: 6px 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.status-pill-btn:hover {
  color: var(--color-text-base);
}

.status-pill-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

.table-search-input {
  padding: 6px 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-base);
  font-size: 0.85rem;
  min-width: 220px;
}

.table-card {
  padding: var(--space-2);
}

.contracts-table {
  width: 100%;
  border-collapse: collapse;
}

.contracts-table th, .contracts-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.contracts-table th {
  color: var(--color-text-muted);
  font-weight: 600;
  background: var(--color-bg-base);
}

.clickable-row {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.clickable-row:hover {
  background: rgba(99, 102, 241, 0.04);
}

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
</style>
