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
      <!-- 1. Status Filter Pills Bar with Live Counts -->
      <div class="status-pills-bar">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          type="button"
          class="status-pill-btn"
          :class="{ active: selectedStatus === s.value }"
          @click="selectedStatus = s.value"
        >
          <span>{{ s.label }}</span>
          <span class="pill-count" :class="{ 'pill-count-active': selectedStatus === s.value }">
            {{ getStatusCount(s.value) }}
          </span>
        </button>
      </div>

      <!-- 2. Advanced Multi-Filter Control Toolbar -->
      <div class="filter-controls-card glass-card">
        <div class="filter-grid">
          <!-- Live Search Input -->
          <div class="filter-group search-group">
            <label class="filter-label">Search</label>
            <div class="search-input-wrap">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search contract #, client, email, phone, agent…"
                class="filter-input search-field"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="btn-clear-search"
                @click="searchQuery = ''"
                title="Clear search text"
              >✕</button>
            </div>
          </div>

          <!-- Template Filter Dropdown -->
          <div class="filter-group">
            <label class="filter-label">Template</label>
            <div class="select-wrap">
              <select v-model="filterTemplate" class="filter-select">
                <option value="">All Templates ({{ availableTemplates.length }})</option>
                <option v-for="t in availableTemplates" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <!-- Assigned Agent Filter Dropdown -->
          <div class="filter-group">
            <label class="filter-label">Assigned Agent</label>
            <div class="select-wrap">
              <select v-model="filterAgent" class="filter-select">
                <option value="">All Agents ({{ availableAgents.length }})</option>
                <option v-for="a in availableAgents" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>

          <!-- Application Mode (Type) Filter -->
          <div class="filter-group">
            <label class="filter-label">Application Type</label>
            <div class="select-wrap">
              <select v-model="filterType" class="filter-select">
                <option value="">All Types</option>
                <option value="NORMAL">Individual (NORMAL)</option>
                <option value="TEAM">Team / Family (TEAM)</option>
              </select>
            </div>
          </div>

          <!-- Date Range Preset Dropdown -->
          <div class="filter-group">
            <label class="filter-label">Date Filter</label>
            <div class="select-wrap">
              <select v-model="filterDateRange" class="filter-select">
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="CUSTOM">Custom Range…</option>
              </select>
            </div>
          </div>

          <!-- Sort Order Dropdown -->
          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <div class="select-wrap">
              <select v-model="sortBy" class="filter-select">
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="ID_DESC">Contract # (High to Low)</option>
                <option value="ID_ASC">Contract # (Low to High)</option>
                <option value="NAME_ASC">Client Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Custom Date Range Row (Shown when 'CUSTOM' is selected) -->
        <div v-if="filterDateRange === 'CUSTOM'" class="custom-date-row animate-fade-in">
          <div class="date-pick-field">
            <label class="filter-label">From Date</label>
            <input type="date" v-model="customStartDate" class="filter-input" />
          </div>
          <div class="date-pick-field">
            <label class="filter-label">To Date</label>
            <input type="date" v-model="customEndDate" class="filter-input" />
          </div>
        </div>

        <!-- Active Filters Bar & Reset Action -->
        <div v-if="hasActiveFilters" class="active-filters-bar animate-fade-in">
          <div class="active-chips-left">
            <span class="active-filters-label">Active Filters:</span>

            <span v-if="selectedStatus" class="filter-chip">
              Status: <strong>{{ getStatusLabel(selectedStatus) }}</strong>
              <button type="button" @click="selectedStatus = ''" title="Remove status filter">✕</button>
            </span>

            <span v-if="searchQuery" class="filter-chip">
              Search: <strong>"{{ searchQuery }}"</strong>
              <button type="button" @click="searchQuery = ''" title="Clear search">✕</button>
            </span>

            <span v-if="filterTemplate" class="filter-chip">
              Template: <strong>{{ filterTemplate }}</strong>
              <button type="button" @click="filterTemplate = ''" title="Clear template filter">✕</button>
            </span>

            <span v-if="filterAgent" class="filter-chip">
              Agent: <strong>{{ filterAgent }}</strong>
              <button type="button" @click="filterAgent = ''" title="Clear agent filter">✕</button>
            </span>

            <span v-if="filterType" class="filter-chip">
              Type: <strong>{{ filterType === 'TEAM' ? 'Team (TEAM)' : 'Individual (NORMAL)' }}</strong>
              <button type="button" @click="filterType = ''" title="Clear type filter">✕</button>
            </span>

            <span v-if="filterDateRange !== 'ALL'" class="filter-chip">
              Date: <strong>{{ getDateRangeLabel() }}</strong>
              <button type="button" @click="filterDateRange = 'ALL'; customStartDate = ''; customEndDate = ''" title="Clear date filter">✕</button>
            </span>
          </div>

          <button type="button" class="btn-reset-filters" @click="clearAllFilters">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Reset All Filters
          </button>
        </div>
      </div>

      <!-- Table Header Meta Count -->
      <div class="table-results-meta">
        <span class="results-count-text">
          Showing <strong>{{ filteredContracts.length }}</strong> of <strong>{{ contracts.length }}</strong> contracts
        </span>
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
        <p class="text-muted" style="max-width: 480px; margin: 0 auto var(--space-6);">
          {{ hasActiveFilters ? 'No agreements match your current filter settings. Try clearing some filters or searching for another keyword.' : 'Get started by creating your first contract or triggering one from GoHighLevel.' }}
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
          <button v-if="hasActiveFilters" type="button" class="btn btn-secondary" @click="clearAllFilters">
            Clear Filters
          </button>
          <router-link to="/contracts/new" class="btn btn-primary">
            Create New Contract
          </router-link>
        </div>
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
                  <strong class="contract-id-badge">#{{ c.id }}</strong>
                </td>
                <td>
                  <div class="template-name-cell">{{ c.template_name }}</div>
                  <div class="text-muted small-text">{{ c.contract_type || 'Services Agreement' }}</div>
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
                  <div style="font-weight:600; color:var(--color-text-base);">{{ c.recipient_name || c.ghl_contact_id }}</div>
                  <div v-if="c.recipient_email" class="text-muted small-text">{{ c.recipient_email }}</div>
                </td>
                <td>
                  <div style="font-size:0.83rem; font-weight:500;">{{ c.assigned_user_name || '—' }}</div>
                </td>
                <td>
                  <div style="font-weight: 500;">{{ formatDate(c.updated_at || c.created_at) }}</div>
                  <div class="text-muted small-text">Created {{ formatDate(c.created_at) }}</div>
                </td>
                <td style="text-align: right;" @click.stop>
                  <div style="display:inline-flex; gap:6px; align-items:center;">
                    <!-- Direct "Send via GHL" button for Draft contracts -->
                    <button
                      v-if="['DRAFT', 'READY'].includes(c.state)"
                      type="button"
                      class="btn btn-primary btn-sm"
                      style="font-weight:600; padding:4px 8px; font-size:0.78rem; background:#2563eb;"
                      :disabled="sendingContractId === c.id"
                      @click="sendViaGhl(c)"
                      title="Send via GoHighLevel to client"
                    >
                      <span v-if="sendingContractId === c.id">Sending…</span>
                      <span v-else>📤 Send via GHL</span>
                    </button>
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
const filterTemplate = ref('')
const filterAgent = ref('')
const filterType = ref('')
const filterDateRange = ref('ALL')
const customStartDate = ref('')
const customEndDate = ref('')
const sortBy = ref('NEWEST')

const copiedId = ref(null)
const sendingContractId = ref(null)

const statusOptions = [
  { label: 'All Contracts', value: '' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Ready', value: 'READY' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Opened / Viewed', value: 'OPENED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed & Sealed', value: 'COMPLETED' },
  { label: 'Revoked / Cancelled', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
]

function getStatusLabel(val) {
  const opt = statusOptions.find(o => o.value === val)
  return opt ? opt.label : val
}

function getDateRangeLabel() {
  if (filterDateRange.value === 'TODAY') return 'Today'
  if (filterDateRange.value === 'LAST_7_DAYS') return 'Last 7 Days'
  if (filterDateRange.value === 'THIS_MONTH') return 'This Month'
  if (filterDateRange.value === 'LAST_30_DAYS') return 'Last 30 Days'
  if (filterDateRange.value === 'CUSTOM') {
    if (customStartDate.value && customEndDate.value) {
      return `${customStartDate.value} to ${customEndDate.value}`
    } else if (customStartDate.value) {
      return `From ${customStartDate.value}`
    } else if (customEndDate.value) {
      return `Until ${customEndDate.value}`
    }
    return 'Custom Date Range'
  }
  return 'All Time'
}

function matchesStatus(contractState, targetStatus) {
  if (!targetStatus) return true
  const state = String(contractState || '').toUpperCase()
  if (targetStatus === 'DRAFT') return state === 'DRAFT'
  if (targetStatus === 'READY') return state === 'READY'
  if (targetStatus === 'SENT') return state === 'SENT'
  if (targetStatus === 'OPENED') return ['OPENED', 'VIEWED'].includes(state)
  if (targetStatus === 'IN_PROGRESS') return ['IN_PROGRESS', 'AWAITING_FORM'].includes(state)
  if (targetStatus === 'COMPLETED') return ['COMPLETED', 'SIGNED', 'SIGNED_PENDING_STORAGE'].includes(state)
  if (targetStatus === 'REVOKED') return ['REVOKED', 'CANCELLED', 'DECLINED'].includes(state)
  if (targetStatus === 'EXPIRED') return state === 'EXPIRED'
  return state === targetStatus
}

function getStatusCount(statusValue) {
  if (!statusValue) return contracts.value.length
  return contracts.value.filter(c => matchesStatus(c.state, statusValue)).length
}

const availableTemplates = computed(() => {
  const set = new Set()
  contracts.value.forEach(c => {
    if (c.template_name && c.template_name.trim()) set.add(c.template_name.trim())
  })
  return Array.from(set).sort()
})

const availableAgents = computed(() => {
  const set = new Set()
  contracts.value.forEach(c => {
    const a = (c.assigned_user_name || '').trim()
    if (a && a !== '—' && a !== '-') {
      set.add(a)
    }
  })
  return Array.from(set).sort()
})

const hasActiveFilters = computed(() => {
  return Boolean(
    selectedStatus.value ||
    searchQuery.value.trim() ||
    filterTemplate.value ||
    filterAgent.value ||
    filterType.value ||
    filterDateRange.value !== 'ALL' ||
    customStartDate.value ||
    customEndDate.value
  )
})

function clearAllFilters() {
  selectedStatus.value = ''
  searchQuery.value = ''
  filterTemplate.value = ''
  filterAgent.value = ''
  filterType.value = ''
  filterDateRange.value = 'ALL'
  customStartDate.value = ''
  customEndDate.value = ''
  sortBy.value = 'NEWEST'
}

function isInDateRange(dateStr) {
  if (!dateStr || filterDateRange.value === 'ALL') return true
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return true

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filterDateRange.value === 'TODAY') {
    return d >= startOfToday
  }
  if (filterDateRange.value === 'LAST_7_DAYS') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= sevenDaysAgo
  }
  if (filterDateRange.value === 'THIS_MONTH') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return d >= startOfMonth
  }
  if (filterDateRange.value === 'LAST_30_DAYS') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return d >= thirtyDaysAgo
  }
  if (filterDateRange.value === 'CUSTOM') {
    if (customStartDate.value) {
      const start = new Date(`${customStartDate.value}T00:00:00`)
      if (d < start) return false
    }
    if (customEndDate.value) {
      const end = new Date(`${customEndDate.value}T23:59:59`)
      if (d > end) return false
    }
    return true
  }
  return true
}

const filteredContracts = computed(() => {
  let list = contracts.value.filter(c => {
    // 1. Status Filter
    if (!matchesStatus(c.state, selectedStatus.value)) return false

    // 2. Template Filter
    if (filterTemplate.value && (c.template_name || '').trim() !== filterTemplate.value) return false

    // 3. Agent Filter
    if (filterAgent.value && (c.assigned_user_name || '').trim() !== filterAgent.value) return false

    // 4. Type / Mode Filter
    if (filterType.value && (c.form_mode || 'NORMAL') !== filterType.value) return false

    // 5. Date Range Filter
    if (!isInDateRange(c.created_at || c.updated_at)) return false

    // 6. Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchId = String(c.id).toLowerCase().includes(q) || `#${c.id}`.toLowerCase().includes(q)
      const matchTemplate = (c.template_name || '').toLowerCase().includes(q)
      const matchRecipient = (c.recipient_name || '').toLowerCase().includes(q)
      const matchEmail = (c.recipient_email || '').toLowerCase().includes(q)
      const matchAgent = (c.assigned_user_name || '').toLowerCase().includes(q)
      const matchContact = (c.ghl_contact_id || '').toLowerCase().includes(q)
      if (!matchId && !matchTemplate && !matchRecipient && !matchEmail && !matchAgent && !matchContact) {
        return false
      }
    }

    return true
  })

  // Sorting
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'OLDEST') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0)
    }
    if (sortBy.value === 'ID_DESC') {
      return Number(b.id) - Number(a.id)
    }
    if (sortBy.value === 'ID_ASC') {
      return Number(a.id) - Number(b.id)
    }
    if (sortBy.value === 'NAME_ASC') {
      return (a.recipient_name || '').localeCompare(b.recipient_name || '')
    }
    // Default NEWEST
    return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
  })

  return list
})

function copySigningLink(token, id) {
  const url = `${window.location.origin}/sign/${token}`
  navigator.clipboard?.writeText(url).catch(() => {})
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 2500)
}

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

async function fetchContracts() {
  loading.value = true
  try {
    const res = await axios.get(`${apiBase}/contracts`, {
      params: { limit: 250 },
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
    DRAFT:                  'badge-warning',
    AWAITING_FORM:          'badge-warning',
    READY:                  'badge-info',
    SENT:                   'badge-primary',
    VIEWED:                 'badge-primary',
    OPENED:                 'badge-primary',
    IN_PROGRESS:            'badge-primary',
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
    DRAFT:                  'Draft',
    AWAITING_FORM:          'Awaiting Form',
    READY:                  'Ready to Send',
    SENT:                   'Sent to Client',
    VIEWED:                 'Viewed by Client',
    OPENED:                 'Opened',
    IN_PROGRESS:            'In Progress',
    SIGNED:                 'Signed',
    SIGNED_PENDING_STORAGE: 'Syncing with GHL',
    COMPLETED:              'Completed & Sealed',
    EXPIRED:                'Expired',
    CANCELLED:              'Cancelled',
    DECLINED:               'Declined',
  }
  return map[state] || state
}

async function sendViaGhl(contract) {
  if (!confirm(`Dispatch contract #${contract.id} (${contract.template_name}) to ${contract.recipient_name || 'client'} via GoHighLevel?`)) return
  sendingContractId.value = contract.id
  try {
    const res = await axios.post(`${apiBase}/contracts/${contract.id}/send`, {
      channels: ['sms', 'email'],
    }, { headers: getHeaders() })
    alert(res.data?.message || 'Contract dispatched via GoHighLevel successfully! Status updated to Sent.')
    contract.state = 'SENT'
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to dispatch contract via GoHighLevel.')
  } finally {
    sendingContractId.value = null
  }
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
  color: var(--color-text-base);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: var(--space-1);
}

/* Status Pills */
.status-pills-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.status-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg-card, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-full, 9999px);
  color: var(--color-text-muted, #64748b);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.status-pill-btn:hover {
  color: var(--color-text-base, #1e293b);
  border-color: #cbd5e1;
  background: #f8fafc;
}

.status-pill-btn.active {
  background: var(--color-primary, #2563eb);
  border-color: var(--color-primary, #2563eb);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.pill-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 18px;
}

.pill-count-active {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Filter Controls Toolbar Card */
.filter-controls-card {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--color-border, #e2e8f0);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1.3fr 1.1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}

@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .search-group {
    grid-column: span 3;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .search-group {
    grid-column: span 1;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  font-size: 0.84rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-field {
  padding-left: 32px;
  padding-right: 28px;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 2px 4px;
}

.btn-clear-search:hover {
  color: #1e293b;
}

.select-wrap {
  position: relative;
}

/* Custom Date Row */
.custom-date-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.date-pick-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
}

/* Active Filters Bar */
.active-filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.active-chips-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.active-filters-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #334155;
}

.filter-chip button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 0.78rem;
  padding: 0;
  display: flex;
  align-items: center;
}

.filter-chip button:hover {
  color: #ef4444;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-filters:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* Table Results Meta Bar */
.table-results-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}

.results-count-text {
  font-size: 0.82rem;
  color: #64748b;
}

/* Table styling */
.table-card {
  padding: 4px;
}

.contracts-table {
  width: 100%;
  border-collapse: collapse;
}

.contracts-table th, .contracts-table td {
  padding: 10px 14px;
  text-align: left;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.contracts-table th {
  color: var(--color-text-muted, #64748b);
  font-weight: 600;
  background: var(--color-bg-base, #f8fafc);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.clickable-row {
  cursor: pointer;
  transition: background var(--transition-fast, 0.15s ease);
}

.clickable-row:hover {
  background: rgba(37, 99, 235, 0.03);
}

.contract-id-badge {
  font-family: monospace;
  font-size: 0.88rem;
  color: #0f172a;
}

.template-name-cell {
  font-weight: 600;
  color: #1e293b;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-card {
  padding: var(--space-12, 48px);
  text-align: center;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-bg-base, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: var(--color-text-muted, #94a3b8);
}
</style>
