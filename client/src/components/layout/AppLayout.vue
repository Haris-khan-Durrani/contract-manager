<template>
  <div
    class="app-layout"
    :class="{
      'sidebar-collapsed': isSidebarCollapsed,
      'is-builder-mode': isBuilderRoute,
      'in-iframe': isInIframe
    }"
  >
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-brand-row">
        <router-link to="/dashboard" class="sidebar-brand" title="ContractOS">
          <div class="sidebar-logo-icon">⚡</div>
          <div v-show="!isSidebarCollapsed" class="sidebar-brand-text" style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>ContractOS</span>
              <span class="badge badge-sent" style="font-size: 10px; padding: 1px 6px;">v2.5</span>
            </div>
            <span style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 500;">GHL & MySQL Cloud</span>
          </div>
        </router-link>
        <button
          type="button"
          class="sidebar-collapse-toggle"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
          :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar (More Workspace)'"
        >
          <svg v-if="isSidebarCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 8px 0;">
        <!-- Overview -->
        <div v-show="!isSidebarCollapsed" class="sidebar-section-label">Overview</div>
        <router-link to="/dashboard" class="nav-item" active-class="active" title="Dashboard">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span v-show="!isSidebarCollapsed" class="nav-item-text">Dashboard</span>
        </router-link>

        <!-- Contracts -->
        <div v-show="!isSidebarCollapsed" class="sidebar-section-label">Contracts</div>
        <router-link to="/contracts" class="nav-item" active-class="active" title="All Contracts">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span v-show="!isSidebarCollapsed" class="nav-item-text">All Contracts</span>
        </router-link>
        <router-link to="/contracts/new" class="nav-item" active-class="active" title="+ Create Contract">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span v-show="!isSidebarCollapsed" class="nav-item-text">+ Create Contract</span>
        </router-link>

        <!-- Templates & Studio (Admin+) -->
        <template v-if="auth.hasRole(['ADMIN', 'SUPER_ADMIN'])">
          <div v-show="!isSidebarCollapsed" class="sidebar-section-label">Studio & Templates</div>
          <router-link to="/templates" class="nav-item" active-class="active" title="Contract Studio">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h10M4 18h6"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">Contract Studio</span>
          </router-link>
          <router-link to="/forms" class="nav-item" active-class="active" title="Form Builder">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">Form Builder</span>
          </router-link>
          <router-link to="/automation" class="nav-item" active-class="active" title="Trigger Automations">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">Trigger Automations</span>
          </router-link>
          <router-link to="/ghl" class="nav-item" active-class="active" title="GHL Field Mapping">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">GHL Field Mapping</span>
          </router-link>
        </template>

        <!-- Super Admin -->
        <template v-if="auth.hasRole(['SUPER_ADMIN'])">
          <div v-show="!isSidebarCollapsed" class="sidebar-section-label">Administration</div>
          <router-link to="/admin/users" class="nav-item" active-class="active" title="Users & Access">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">Users & Access</span>
          </router-link>
          <router-link to="/admin/settings" class="nav-item" active-class="active" title="System Settings">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span v-show="!isSidebarCollapsed" class="nav-item-text">System Settings</span>
          </router-link>
        </template>
      </div>

      <!-- User Info (Bottom) -->
      <div class="sidebar-user-footer" style="padding: 12px 14px; border-top: 1px solid var(--color-border); background: #ffffff;">
        <div class="sidebar-user-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;" :title="auth.user?.name">
              {{ userInitial }}
            </div>
            <div v-show="!isSidebarCollapsed" class="sidebar-user-details" style="overflow: hidden; flex: 1;">
              <div style="font-size: 0.825rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="auth.user?.userId">
                {{ auth.user?.name || auth.user?.userId || 'Authorized User' }}
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="badge" :class="roleBadgeClass" style="font-size: 9px; padding: 0 6px;">{{ auth.role }}</span>
                <span style="font-size: 10px; color: var(--color-text-muted); font-family: monospace;">{{ auth.user?.locationId }}</span>
              </div>
            </div>
          </div>
          <button
            v-show="!isSidebarCollapsed"
            @click="handleLogout"
            class="btn btn-secondary btn-sm sidebar-logout-btn"
            style="padding: 4px 8px; font-size: 11px; flex-shrink: 0;"
            title="Log out or switch GoHighLevel account"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Wrapper with Modern Topbar -->
    <div class="main-wrapper">
      <header v-if="!isBuilderRoute" class="topbar">
        <!-- Left: Sidebar toggle + Location / Sub-account selector pill -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <button
            type="button"
            class="topbar-sidebar-toggle"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-full); box-shadow: var(--shadow-xs); font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary);">
            <span class="dot-green"></span>
            <span>{{ auth.user?.locationId ? `Location: ${auth.user.locationId}` : 'ContractOS Live' }}</span>
          </div>

          <!-- Status pills -->
          <div class="status-pill-live">
            <span class="dot-green"></span>
            <span>GHL Connected</span>
          </div>

          <div class="badge badge-info" style="font-size: 11px;">
            <span>☁️ Direct REST API</span>
          </div>
        </div>

        <!-- Right: Actions & Tools -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <router-link to="/automation" class="btn btn-secondary btn-sm" style="font-size: 0.78rem;">
            <span>⚡ Automations</span>
            <span class="badge badge-sent" style="font-size: 9px; padding: 1px 5px;">Active</span>
          </router-link>

          <router-link to="/contracts/new" class="btn btn-live btn-sm btn-pill" style="font-size: 0.8rem; font-weight: 600; padding: 6px 16px;">
            <span>+ New Contract</span>
          </router-link>
        </div>
      </header>

      <main class="page-body">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const isInIframe = ref(typeof window !== 'undefined' && window.self !== window.top)
const isBuilderRoute = computed(() => route.name === 'TemplateBuilder' || route.name === 'FormBuilder')

// Start collapsed in iframe or on builder routes to maximize workspace width
const isSidebarCollapsed = ref(isInIframe.value || isBuilderRoute.value)

watch(isBuilderRoute, (isBuilder) => {
  if (isBuilder) {
    isSidebarCollapsed.value = true
  }
})

const userInitial = computed(() => (auth.user?.name || auth.user?.userId || 'U').charAt(0).toUpperCase())

const roleBadgeClass = computed(() => {
  if (auth.role === 'SUPER_ADMIN') return 'badge-sent'
  if (auth.role === 'ADMIN') return 'badge-completed'
  return 'badge-draft'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
