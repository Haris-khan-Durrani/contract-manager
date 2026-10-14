<template>
  <div class="contracts-page-root">
    <!-- ─── TOP EXECUTIVE HEADER ─────────────────────────────────────── -->
    <header class="contracts-header-card">
      <div class="header-main-info">
        <div class="header-badge-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <div class="header-title-row">
            <h1 class="header-title">Contracts &amp; Legal Agreements</h1>
            <span class="live-count-chip">{{ contracts.length }} Total</span>
          </div>
          <p class="header-subtitle">
            Manage your end-to-end digital contract lifecycle from draft intake to GoHighLevel dispatch and execution.
          </p>
        </div>
      </div>

      <div class="header-action-group">
        <button 
          type="button" 
          class="btn-hdr btn-hdr-ghost" 
          @click="fetchContracts" 
          :disabled="loading"
          title="Refresh agreements list"
        >
          <svg class="btn-svg" :class="{ 'spin-active': loading }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.19"/>
          </svg>
          <span>Refresh</span>
        </button>

        <router-link to="/contracts/new" class="btn-hdr btn-hdr-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Create Contract</span>
        </router-link>
      </div>
    </header>

    <!-- ─── EXECUTIVE KPI SUMMARY METRICS ────────────────────────────── -->
    <div class="kpi-metrics-grid">
      <div class="kpi-card" :class="{ 'kpi-active': selectedStatus === '' }" @click="selectedStatus = ''">
        <div class="kpi-icon-box kpi-icon-blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">All Contracts</div>
          <div class="kpi-value">{{ contracts.length }}</div>
        </div>
      </div>

      <div class="kpi-card" :class="{ 'kpi-active': selectedStatus === 'DRAFT' }" @click="selectedStatus = 'DRAFT'">
        <div class="kpi-icon-box kpi-icon-amber">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Drafts / In Prep</div>
          <div class="kpi-value">{{ getStatusCount('DRAFT') }}</div>
        </div>
      </div>

      <div class="kpi-card" :class="{ 'kpi-active': selectedStatus === 'OPENED' }" @click="selectedStatus = 'OPENED'">
        <div class="kpi-icon-box kpi-icon-cyan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Opened / Viewed</div>
          <div class="kpi-value">{{ getStatusCount('OPENED') }}</div>
        </div>
      </div>

      <div class="kpi-card" :class="{ 'kpi-active': selectedStatus === 'COMPLETED' }" @click="selectedStatus = 'COMPLETED'">
        <div class="kpi-icon-box kpi-icon-emerald">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Signed &amp; Sealed</div>
          <div class="kpi-value">{{ getStatusCount('COMPLETED') }}</div>
        </div>
      </div>
    </div>

    <!-- ─── STATUS FILTER PILLS ROW ──────────────────────────────────── -->
    <div class="status-pills-container">
      <div class="status-pills-scroll">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          type="button"
          class="status-nav-chip"
          :class="{ active: selectedStatus === s.value }"
          @click="selectedStatus = s.value"
        >
          <span>{{ s.label }}</span>
          <span class="chip-count">{{ getStatusCount(s.value) }}</span>
        </button>
      </div>
    </div>

    <!-- ─── MULTI-FILTER CONTROL CARD ────────────────────────────────── -->
    <div class="filter-dashboard-card">
      <div class="filter-controls-row">
        <!-- Search Box -->
        <div class="filter-cell search-cell">
          <label class="filter-cell-label">Search Agreements</label>
          <div class="search-box-wrap">
            <svg class="search-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search contract #, client, email, agent…"
              class="search-text-field"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="search-clear-x"
              @click="searchQuery = ''"
            >✕</button>
          </div>
        </div>

        <!-- Template Filter -->
        <div class="filter-cell">
          <label class="filter-cell-label">Template</label>
          <div class="select-box-wrap">
            <select v-model="filterTemplate" class="filter-select-input">
              <option value="">All Templates ({{ availableTemplates.length }})</option>
              <option v-for="t in availableTemplates" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- Agent Filter -->
        <div class="filter-cell">
          <label class="filter-cell-label">Assigned Agent</label>
          <div class="select-box-wrap">
            <select v-model="filterAgent" class="filter-select-input">
              <option value="">All Agents ({{ availableAgents.length }})</option>
              <option v-for="a in availableAgents" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <!-- Application Mode -->
        <div class="filter-cell">
          <label class="filter-cell-label">Application Type</label>
          <div class="select-box-wrap">
            <select v-model="filterType" class="filter-select-input">
              <option value="">All Types</option>
              <option value="NORMAL">Individual (Normal)</option>
              <option value="TEAM">Team / Family</option>
            </select>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="filter-cell">
          <label class="filter-cell-label">Date Range</label>
          <div class="select-box-wrap">
            <select v-model="filterDateRange" class="filter-select-input">
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Range…</option>
            </select>
          </div>
        </div>

        <!-- Sort Order -->
        <div class="filter-cell">
          <label class="filter-cell-label">Sort Order</label>
          <div class="select-box-wrap">
            <select v-model="sortBy" class="filter-select-input">
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="ID_DESC">Contract # (High to Low)</option>
              <option value="ID_ASC">Contract # (Low to High)</option>
              <option value="NAME_ASC">Client Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Custom Date Pickers -->
      <div v-if="filterDateRange === 'CUSTOM'" class="custom-date-subrow">
        <div class="date-input-field">
          <label class="filter-cell-label">Start Date</label>
          <input type="date" v-model="customStartDate" class="filter-select-input" />
        </div>
        <div class="date-input-field">
          <label class="filter-cell-label">End Date</label>
          <input type="date" v-model="customEndDate" class="filter-select-input" />
        </div>
      </div>

      <!-- Active Filter Tags -->
      <div v-if="hasActiveFilters" class="active-tags-strip">
        <div class="active-tags-list">
          <span class="active-tags-heading">Active:</span>

          <span v-if="selectedStatus" class="active-filter-tag">
            Status: <strong>{{ getStatusLabel(selectedStatus) }}</strong>
            <button type="button" @click="selectedStatus = ''">✕</button>
          </span>

          <span v-if="searchQuery" class="active-filter-tag">
            Search: <strong>"{{ searchQuery }}"</strong>
            <button type="button" @click="searchQuery = ''">✕</button>
          </span>

          <span v-if="filterTemplate" class="active-filter-tag">
            Template: <strong>{{ filterTemplate }}</strong>
            <button type="button" @click="filterTemplate = ''">✕</button>
          </span>

          <span v-if="filterAgent" class="active-filter-tag">
            Agent: <strong>{{ filterAgent }}</strong>
            <button type="button" @click="filterAgent = ''">✕</button>
          </span>

          <span v-if="filterType" class="active-filter-tag">
            Type: <strong>{{ filterType === 'TEAM' ? 'Team' : 'Individual' }}</strong>
            <button type="button" @click="filterType = ''">✕</button>
          </span>

          <span v-if="filterDateRange !== 'ALL'" class="active-filter-tag">
            Date: <strong>{{ getDateRangeLabel() }}</strong>
            <button type="button" @click="filterDateRange = 'ALL'; customStartDate = ''; customEndDate = ''">✕</button>
          </span>
        </div>

        <button type="button" class="btn-clear-all" @click="clearAllFilters">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          <span>Reset Filters</span>
        </button>
      </div>
    </div>

    <!-- ─── RESULTS BAR & BULK ACTIONS ───────────────────────────────── -->
    <div class="table-meta-bar">
      <div class="results-text">
        Showing <strong>{{ filteredContracts.length }}</strong> of <strong>{{ contracts.length }}</strong> agreements
      </div>

      <transition name="fade">
        <div v-if="selectedIds.length > 0" class="bulk-action-pill-bar">
          <span class="selected-count-tag">
            {{ selectedIds.length }} contract{{ selectedIds.length > 1 ? 's' : '' }} selected
          </span>
          <button
            type="button"
            class="btn-bulk-delete"
            :disabled="bulkDeleting"
            @click="bulkDeleteContracts"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            <span>{{ bulkDeleting ? 'Deleting…' : 'Delete Selected' }}</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- ─── CONTRACTS TABLE CARD ─────────────────────────────────────── -->
    <div class="table-main-card">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="table-loading-state">
        <div class="table-spinner"></div>
        <p class="loading-sub-text">Loading agreements from MySQL…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredContracts.length" class="table-empty-state">
        <div class="empty-icon-ring">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h3 class="empty-title">No Contracts Match Criteria</h3>
        <p class="empty-desc">
          {{ hasActiveFilters ? 'No agreements match your search or filter settings. Try clearing some filters to view results.' : 'No contracts exist yet in this location. Create your first contract or trigger one automatically from GoHighLevel.' }}
        </p>
        <div class="empty-actions">
          <button v-if="hasActiveFilters" type="button" class="btn-hdr btn-hdr-ghost" @click="clearAllFilters">
            Clear Filters
          </button>
          <router-link to="/contracts/new" class="btn-hdr btn-hdr-primary">
            + Create New Contract
          </router-link>
        </div>
      </div>

      <!-- Data Table -->
      <div v-else class="table-scroll-wrapper">
        <table class="contracts-executive-table">
          <thead>
            <tr>
              <th style="width: 44px; text-align: center;">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="custom-check"
                  title="Select All"
                />
              </th>
              <th style="width: 90px;">Contract</th>
              <th style="width: 240px;">Template / Agreement</th>
              <th style="width: 140px;">Status</th>
              <th style="width: 110px;">Type</th>
              <th style="width: 210px;">Client Contact</th>
              <th style="width: 150px;">Assigned Agent</th>
              <th style="width: 130px;">Date</th>
              <th style="text-align: right; min-width: 200px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in filteredContracts"
              :key="c.id"
              class="contract-row-interactive"
              @click="openContract(c.id)"
            >
              <!-- Checkbox -->
              <td style="text-align: center;" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(c.id)"
                  @change="toggleSelectContract(c.id)"
                  class="custom-check"
                />
              </td>

              <!-- Contract ID -->
              <td>
                <span class="contract-number-badge">#{{ c.id }}</span>
              </td>

              <!-- Template & Type -->
              <td>
                <div class="template-title-text" :title="c.template_name">
                  {{ c.template_name || 'Standard Agreement' }}
                </div>
                <div class="template-category-sub">
                  {{ formatContractType(c.contract_type) }}
                </div>
              </td>

              <!-- Status Pill with Live Dot -->
              <td>
                <span class="status-indicator-chip" :class="getStatusBadgeClass(c.state)">
                  <span class="status-pulse-dot"></span>
                  <span>{{ formatStatusLabel(c.state) }}</span>
                </span>
              </td>

              <!-- Application Type -->
              <td>
                <span class="type-pill-chip" :class="c.form_mode === 'TEAM' ? 'team-mode' : 'single-mode'">
                  <span class="type-icon">{{ c.form_mode === 'TEAM' ? '👥' : '👤' }}</span>
                  <span>{{ c.form_mode === 'TEAM' ? 'Team' : 'Individual' }}</span>
                </span>
              </td>

              <!-- Client Recipient -->
              <td>
                <div class="client-avatar-row">
                  <div class="client-avatar-circle" :style="{ backgroundColor: getAvatarColor(c.recipient_name || c.ghl_contact_id) }">
                    {{ getInitials(c.recipient_name || c.ghl_contact_id) }}
                  </div>
                  <div class="client-info-block">
                    <div class="client-name-bold" :title="c.recipient_name">
                      {{ c.recipient_name || c.ghl_contact_id || 'Client' }}
                    </div>
                    <div v-if="c.recipient_email" class="client-email-sub" :title="c.recipient_email">
                      {{ c.recipient_email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Assigned Agent -->
              <td>
                <div class="agent-info-block">
                  <span class="agent-name-text">{{ c.assigned_user_name || '—' }}</span>
                </div>
              </td>

              <!-- Created / Updated Date -->
              <td>
                <div class="date-main-text">{{ formatDate(c.updated_at || c.created_at) }}</div>
                <div class="date-relative-sub">{{ formatRelativeDate(c.updated_at || c.created_at) }}</div>
              </td>

              <!-- Actions Column -->
              <td style="text-align: right;" @click.stop>
                <div class="row-actions-cluster">
                  <!-- Direct "Send via GHL" button for Draft/Ready contracts -->
                  <button
                    v-if="['DRAFT', 'READY'].includes(c.state)"
                    type="button"
                    class="btn-row-action btn-send-ghl"
                    :disabled="sendingContractId === c.id"
                    @click="sendViaGhl(c)"
                    title="Dispatch invitation via GoHighLevel"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span>{{ sendingContractId === c.id ? 'Sending…' : 'Send GHL' }}</span>
                  </button>

                  <!-- Copy Signing Link -->
                  <button
                    v-if="c.signing_token"
                    type="button"
                    class="btn-row-icon-btn"
                    :class="{ 'btn-copied': copiedId === c.id }"
                    @click="copySigningLink(c.signing_token, c.id)"
                    :title="copiedId === c.id ? 'Copied to clipboard!' : 'Copy Public Signing Link'"
                  >
                    <svg v-if="copiedId !== c.id" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>

                  <!-- View / Open Details -->
                  <router-link :to="`/contracts/${c.id}`" class="btn-row-action btn-open-details">
                    <span>Open</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </router-link>

                  <!-- Delete Contract -->
                  <button
                    type="button"
                    class="btn-row-icon-btn btn-delete-row"
                    :disabled="deletingId === c.id"
                    @click="deleteContract(c)"
                    title="Permanently Delete Contract"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
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
const deletingId = ref(null)
const selectedIds = ref([])
const bulkDeleting = ref(false)

const isAllSelected = computed(() => {
  if (!filteredContracts.value.length) return false
  return filteredContracts.value.every(c => selectedIds.value.includes(c.id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredContracts.value.map(c => c.id)
  }
}

function toggleSelectContract(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

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
    return 'Custom Range'
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
    if (!matchesStatus(c.state, selectedStatus.value)) return false
    if (filterTemplate.value && (c.template_name || '').trim() !== filterTemplate.value) return false
    if (filterAgent.value && (c.assigned_user_name || '').trim() !== filterAgent.value) return false
    if (filterType.value && (c.form_mode || 'NORMAL') !== filterType.value) return false
    if (!isInDateRange(c.created_at || c.updated_at)) return false

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
    DRAFT:                  'status-draft',
    AWAITING_FORM:          'status-draft',
    READY:                  'status-ready',
    SENT:                   'status-sent',
    VIEWED:                 'status-opened',
    OPENED:                 'status-opened',
    IN_PROGRESS:            'status-progress',
    SIGNED:                 'status-completed',
    SIGNED_PENDING_STORAGE: 'status-ready',
    COMPLETED:              'status-completed',
    EXPIRED:                'status-expired',
    CANCELLED:              'status-cancelled',
    DECLINED:               'status-cancelled',
  }
  return map[state] || 'status-neutral'
}

function formatStatusLabel(state) {
  const map = {
    DRAFT:                  'Draft',
    AWAITING_FORM:          'Awaiting Form',
    READY:                  'Ready to Send',
    SENT:                   'Sent',
    VIEWED:                 'Opened',
    OPENED:                 'Opened',
    IN_PROGRESS:            'In Progress',
    SIGNED:                 'Signed',
    SIGNED_PENDING_STORAGE: 'Syncing GHL',
    COMPLETED:              'Completed & Sealed',
    EXPIRED:                'Expired',
    CANCELLED:              'Cancelled',
    DECLINED:               'Declined',
  }
  return map[state] || state
}

function formatContractType(type) {
  if (!type) return 'Legal Agreement'
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

function getInitials(name) {
  if (!name) return 'CL'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(name) {
  const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#dc2626', '#475569']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return ''
}

async function sendViaGhl(contract) {
  const result = await Swal.fire({
    title: 'Dispatch Contract?',
    text: `Dispatch contract #${contract.id} (${contract.template_name || 'Contract'}) to ${contract.recipient_name || 'client'} via GoHighLevel?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, Send Now',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  sendingContractId.value = contract.id
  try {
    const res = await axios.post(`${apiBase}/contracts/${contract.id}/send`, {
      channels: ['sms', 'email'],
    }, { headers: getHeaders() })
    contract.state = 'SENT'
    Swal.fire({
      title: 'Sent!',
      text: res.data?.message || 'Contract dispatched via GoHighLevel successfully!',
      icon: 'success',
      timer: 2500,
      showConfirmButton: false,
    })
  } catch (err) {
    Swal.fire({
      title: 'Send Failed',
      text: err.response?.data?.error || 'Failed to dispatch contract via GoHighLevel.',
      icon: 'error',
      confirmButtonColor: '#2563eb',
    })
  } finally {
    sendingContractId.value = null
  }
}

async function deleteContract(contract) {
  const result = await Swal.fire({
    title: 'Delete Contract?',
    html: `Are you sure you want to delete contract <strong>#${contract.id}</strong> (${contract.recipient_name || 'Client'})?<br><br><span style="color:#ef4444;font-size:0.9em;">This action cannot be undone and will permanently remove this contract record.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })

  if (!result.isConfirmed) return

  deletingId.value = contract.id
  try {
    await axios.delete(`${apiBase}/contracts/${contract.id}`, {
      headers: getHeaders(),
    })
    contracts.value = contracts.value.filter(c => c.id !== contract.id)
    selectedIds.value = selectedIds.value.filter(id => id !== contract.id)

    Swal.fire({
      title: 'Deleted!',
      text: `Contract #${contract.id} has been permanently deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (err) {
    console.error('Delete contract error:', err)
    Swal.fire({
      title: 'Failed to Delete',
      text: err.response?.data?.message || err.response?.data?.error || 'Failed to delete contract.',
      icon: 'error',
      confirmButtonColor: '#2563eb',
    })
  } finally {
    deletingId.value = null
  }
}

async function bulkDeleteContracts() {
  const count = selectedIds.value.length
  if (!count) return

  const result = await Swal.fire({
    title: `Delete ${count} Contract${count > 1 ? 's' : ''}?`,
    html: `Are you sure you want to delete <strong>${count}</strong> selected contract${count > 1 ? 's' : ''}?<br><br><span style="color:#ef4444;font-size:0.9em;">This action will permanently delete these contracts and all records.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: `Yes, delete ${count > 1 ? 'all ' + count : 'it'}`,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })

  if (!result.isConfirmed) return

  bulkDeleting.value = true
  try {
    const res = await axios.post(`${apiBase}/contracts/bulk-delete`, {
      ids: selectedIds.value,
    }, {
      headers: getHeaders(),
    })
    const deletedSet = new Set(selectedIds.value)
    contracts.value = contracts.value.filter(c => !deletedSet.has(c.id))
    selectedIds.value = []

    Swal.fire({
      title: 'Deleted!',
      text: res.data?.message || `Successfully deleted ${count} contract(s).`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (err) {
    console.error('Bulk delete error:', err)
    Swal.fire({
      title: 'Failed to Delete',
      text: err.response?.data?.message || err.response?.data?.error || 'Failed to delete selected contracts.',
      icon: 'error',
      confirmButtonColor: '#2563eb',
    })
  } finally {
    bulkDeleting.value = false
  }
}

onMounted(() => {
  fetchContracts()
})
</script>

<style scoped>
/* ─── TYPOGRAPHY LOCK ────────────────────────────────────────────────── */
.contracts-page-root,
.contracts-page-root * {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  box-sizing: border-box;
}

.contracts-page-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 18px 24px 80px;
  color: #0f172a;
}

/* ─── HEADER CARD ────────────────────────────────────────────────────── */
.contracts-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.header-main-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.015em;
}

.live-count-chip {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 1px 8px;
  border-radius: 12px;
}

.header-subtitle {
  font-size: 12.5px;
  color: #64748b;
  margin: 2px 0 0;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-hdr {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  text-decoration: none;
}

.btn-hdr-ghost {
  background: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}
.btn-hdr-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-hdr-primary {
  background: #2563eb;
  color: #ffffff;
}
.btn-hdr-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.spin-active {
  animation: rotate-anim 1s linear infinite;
}
@keyframes rotate-anim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── KPI METRICS ────────────────────────────────────────────────────── */
.kpi-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .kpi-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.kpi-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.kpi-card.kpi-active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.kpi-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-blue { background: #dbeafe; color: #1d4ed8; }
.kpi-icon-amber { background: #fef3c7; color: #d97706; }
.kpi-icon-cyan { background: #e0f2fe; color: #0284c7; }
.kpi-icon-emerald { background: #dcfce7; color: #16a34a; }

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

/* ─── STATUS PILLS SCROLL ────────────────────────────────────────────── */
.status-pills-container {
  overflow-x: auto;
  padding-bottom: 2px;
}

.status-pills-scroll {
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-nav-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.status-nav-chip:hover {
  background: #f8fafc;
  color: #0f172a;
}

.status-nav-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.chip-count {
  font-size: 10px;
  background: #f1f5f9;
  color: #475569;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.status-nav-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ─── FILTER CONTROLS CARD ───────────────────────────────────────────── */
.filter-dashboard-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.filter-controls-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: flex-end;
}

@media (max-width: 1100px) {
  .filter-controls-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .search-cell {
    grid-column: span 3;
  }
}

@media (max-width: 680px) {
  .filter-controls-row {
    grid-template-columns: 1fr;
  }
  .search-cell {
    grid-column: span 1;
  }
}

.filter-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-cell-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.search-box-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-svg {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.search-text-field {
  width: 100%;
  height: 36px;
  padding: 0 28px 0 32px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 12.5px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s;
}

.search-text-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.search-clear-x {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  padding: 2px;
}

.select-box-wrap {
  position: relative;
}

.filter-select-input {
  width: 100%;
  height: 36px;
  padding: 0 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 12.5px;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-select-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.custom-date-subrow {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

.date-input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.active-tags-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.active-tags-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.active-tags-heading {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  border-radius: 5px;
  font-size: 11.5px;
}

.active-filter-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  font-size: 10px;
  padding: 0;
}
.active-filter-tag button:hover {
  color: #ef4444;
}

.btn-clear-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.btn-clear-all:hover {
  background: #fef2f2;
}

/* ─── TABLE RESULTS BAR ──────────────────────────────────────────────── */
.table-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  min-height: 32px;
}

.results-text {
  font-size: 12px;
  color: #64748b;
}

.bulk-action-pill-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-count-tag {
  font-size: 11.5px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 5px;
}

.btn-bulk-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}
.btn-bulk-delete:hover:not(:disabled) {
  background: #dc2626;
}

/* ─── TABLE CONTAINER & ROWS ─────────────────────────────────────────── */
.table-main-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.table-scroll-wrapper {
  overflow-x: auto;
}

.contracts-executive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.contracts-executive-table thead th {
  background: #f8fafc;
  padding: 10px 14px;
  font-weight: 700;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.contracts-executive-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.contract-row-interactive {
  cursor: pointer;
  transition: all 0.12s ease;
}

.contract-row-interactive:hover {
  background: #f8fafc;
}

.custom-check {
  cursor: pointer;
  width: 15px;
  height: 15px;
  accent-color: #2563eb;
  vertical-align: middle;
}

.contract-number-badge {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #1e40af;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 6px;
  border-radius: 5px;
}

.template-title-text {
  font-weight: 600;
  color: #0f172a;
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-category-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

/* Status Indicators */
.status-indicator-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-pulse-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-draft { background: #fef3c7; color: #b45309; }
.status-ready { background: #e0f2fe; color: #0369a1; }
.status-sent { background: #ede9fe; color: #6d28d9; }
.status-opened { background: #eff6ff; color: #1d4ed8; }
.status-progress { background: #eff6ff; color: #2563eb; }
.status-completed { background: #dcfce7; color: #15803d; }
.status-expired { background: #f1f5f9; color: #64748b; }
.status-cancelled { background: #fee2e2; color: #b91c1c; }
.status-neutral { background: #f1f5f9; color: #475569; }

/* Type Pills */
.type-pill-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
}

.single-mode { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
.team-mode { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

/* Client Avatar Row */
.client-avatar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.client-info-block {
  overflow: hidden;
}

.client-name-bold {
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.client-email-sub {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.agent-name-text {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
}

.date-main-text {
  font-weight: 600;
  color: #334155;
  font-size: 12px;
}

.date-relative-sub {
  font-size: 10.5px;
  color: #94a3b8;
}

/* Row Actions Cluster */
.row-actions-cluster {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-row-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn-send-ghl {
  background: #2563eb;
  color: #ffffff;
}
.btn-send-ghl:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-open-details {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}
.btn-open-details:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-row-icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-row-icon-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
}

.btn-copied {
  background: #ecfdf5 !important;
  border-color: #a7f3d0 !important;
  color: #059669 !important;
}

.btn-delete-row:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* Empty & Loading States */
.table-loading-state,
.table-empty-state {
  text-align: center;
  padding: 50px 20px;
}

.table-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: rotate-anim 0.8s linear infinite;
}

.loading-sub-text {
  font-size: 12.5px;
  color: #64748b;
}

.empty-icon-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 12.5px;
  color: #64748b;
  max-width: 480px;
  margin: 0 auto 16px;
  line-height: 1.45;
}

.empty-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
