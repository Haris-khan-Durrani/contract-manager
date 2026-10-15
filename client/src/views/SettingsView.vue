<template>
  <div class="settings-root">
    <!-- ─── FLOATING TOAST NOTIFICATIONS ──────────────────────────────── -->
    <transition name="toast-fade">
      <div v-if="successMsg" class="toast-card toast-card-success">
        <svg class="toast-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <div class="toast-content">
          <div class="toast-head">Settings Saved</div>
          <div class="toast-text">{{ successMsg }}</div>
        </div>
        <button type="button" class="toast-dismiss" @click="successMsg = ''">✕</button>
      </div>
    </transition>

    <transition name="toast-fade">
      <div v-if="errorMsg" class="toast-card toast-card-error">
        <svg class="toast-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="toast-content">
          <div class="toast-head">Configuration Alert</div>
          <div class="toast-text">{{ errorMsg }}</div>
        </div>
        <button type="button" class="toast-dismiss" @click="errorMsg = ''">✕</button>
      </div>
    </transition>

    <transition name="toast-fade">
      <div v-if="copyToast" class="toast-card toast-card-info">
        <svg class="toast-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        <div class="toast-content">
          <div class="toast-head">Copied</div>
          <div class="toast-text">{{ copyToast }}</div>
        </div>
        <button type="button" class="toast-dismiss" @click="copyToast = ''">✕</button>
      </div>
    </transition>

    <!-- ─── TOP HEADER BAR ───────────────────────────────────────────── -->
    <header class="settings-top-header">
      <div class="header-left-cluster">
        <div class="header-icon-square">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </div>
        <div>
          <div class="header-title-flex">
            <h1 class="header-main-title">System &amp; Integration Settings</h1>
            <span class="mysql-sync-pill">
              <span class="pulse-beacon"></span>
              <span>MySQL 8+ Live Sync</span>
            </span>
          </div>
          <p class="header-sub-text">
            Configure GoHighLevel CRM integration, automated outbound webhooks, official legal branding, and security access.
          </p>
        </div>
      </div>

      <div class="header-right-cluster">
        <div class="dirty-status-tag" :class="{ 'dirty': isFormDirty }">
          <span class="status-dot"></span>
          <span>{{ isFormDirty ? 'Unsaved changes' : 'Synchronized' }}</span>
        </div>

        <button 
          type="button" 
          class="btn-hdr btn-hdr-ghost" 
          :disabled="loading || saving" 
          @click="reloadAll"
          title="Reload configuration from MySQL"
        >
          <svg class="btn-svg" :class="{ 'spin-active': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.19"/>
          </svg>
          <span>Refresh</span>
        </button>

        <button 
          type="button" 
          class="btn-hdr btn-hdr-primary" 
          :disabled="saving || loading" 
          @click="saveSettings"
        >
          <svg v-if="!saving" class="btn-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span v-else class="spin-active">⏳</span>
          <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </div>
    </header>

    <!-- ─── TWO-COLUMN WORKSPACE ─────────────────────────────────────── -->
    <div class="settings-workspace-layout">
      <!-- ─── LEFT SIDEBAR NAVIGATION ──────────────────────────────── -->
      <aside class="settings-sidebar-nav">
        <div class="sidebar-nav-title">Configuration Modules</div>
        <nav class="sidebar-nav-list">
          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'ghl' }"
            @click="activeTab = 'ghl'"
          >
            <div class="tab-icon-box icon-ghl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">GoHighLevel CRM</span>
              <span class="tab-desc">API keys, tokens &amp; endpoints</span>
            </div>
            <span class="tab-micro-badge">Core</span>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'webhooks' }"
            @click="activeTab = 'webhooks'"
          >
            <div class="tab-icon-box icon-webhooks">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Webhooks &amp; Operations</span>
              <span class="tab-desc">Outbound handoff &amp; triggers</span>
            </div>
            <span class="tab-micro-badge badge-purple">Hub</span>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'signing' }"
            @click="activeTab = 'signing'"
          >
            <div class="tab-icon-box icon-signing">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Signing URLs &amp; Portal</span>
              <span class="tab-desc">Public signing base domain</span>
            </div>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'branding' }"
            @click="activeTab = 'branding'"
          >
            <div class="tab-icon-box icon-branding">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Company Branding</span>
              <span class="tab-desc">Official seal &amp; officer signature</span>
            </div>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'schema' }"
            @click="activeTab = 'schema'"
          >
            <div class="tab-icon-box icon-schema">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Client Summary Schema</span>
              <span class="tab-desc">Custom fields &amp; 9-page dossier</span>
            </div>
            <span class="tab-micro-badge badge-blue">{{ customSchema.fields?.length || 0 }}</span>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'access' }"
            @click="activeTab = 'access'"
          >
            <div class="tab-icon-box icon-access">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Access &amp; Security</span>
              <span class="tab-desc">Sales privacy &amp; lead isolation</span>
            </div>
          </button>

          <button 
            type="button" 
            class="nav-tab-item" 
            :class="{ active: activeTab === 'workers' }"
            @click="activeTab = 'workers'"
          >
            <div class="tab-icon-box icon-workers">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
            </div>
            <div class="tab-label-group">
              <span class="tab-name">Background Workers</span>
              <span class="tab-desc">Cron schedules &amp; rate limits</span>
            </div>
          </button>
        </nav>
      </aside>

      <!-- ─── RIGHT CONTENT WORKSPACE ──────────────────────────────── -->
      <main class="settings-content-pane">
        
        <!-- Loading State -->
        <div v-if="loading" class="pane-loading-box">
          <div class="pane-spinner"></div>
          <div class="pane-loading-text">Loading Configuration from MySQL…</div>
        </div>

        <div v-else>
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 1: GOHIGHLEVEL CREDENTIALS                             -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'ghl'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">GoHighLevel API &amp; Marketplace Credentials</h2>
                <p class="module-desc">Configure your GoHighLevel credentials for bi-directional contact synchronization, custom fields, and PDF storage.</p>
              </div>
              <span class="module-tag tag-blue">LeadConnector v2</span>
            </div>

            <div class="form-layout-grid">
              <!-- Shared Secret -->
              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">GHL Marketplace Shared Secret</span>
                  <span class="label-pill">Context JWT</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>
                  </span>
                  <input 
                    v-model="form.GHL_SHARED_SECRET" 
                    :type="showSecret.GHL_SHARED_SECRET ? 'text' : 'password'" 
                    class="clean-input with-lead with-trail" 
                    placeholder="Enter GHL Marketplace Shared Secret" 
                  />
                  <button 
                    type="button" 
                    class="input-trailing-btn" 
                    @click="toggleShow('GHL_SHARED_SECRET')"
                    title="Toggle Visibility"
                  >
                    <svg v-if="!showSecret.GHL_SHARED_SECRET" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Found in Marketplace Developer Portal &rarr; App Credentials</span>
                  <button type="button" class="btn-copy-link" @click="copyToClipboard(form.GHL_SHARED_SECRET, 'Shared Secret')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <!-- Private Integration Token -->
              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Private Integration Token (PIT)</span>
                  <span class="label-pill">REST API Bearer</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                  <input 
                    v-model="form.GHL_PRIVATE_INTEGRATION_TOKEN" 
                    :type="showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'text' : 'password'" 
                    class="clean-input with-lead with-trail" 
                    placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                  />
                  <button 
                    type="button" 
                    class="input-trailing-btn" 
                    @click="toggleShow('GHL_PRIVATE_INTEGRATION_TOKEN')"
                    title="Toggle Visibility"
                  >
                    <svg v-if="!showSecret.GHL_PRIVATE_INTEGRATION_TOKEN" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Sub-Account Settings &rarr; Developers &rarr; Private Integrations</span>
                  <button type="button" class="btn-copy-link" @click="copyToClipboard(form.GHL_PRIVATE_INTEGRATION_TOKEN, 'Private Token')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <!-- Webhook Ingestion Secret -->
              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Inbound Webhook Secret</span>
                  <span class="label-pill">Authorization Header</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <input 
                    v-model="form.GHL_WEBHOOK_SECRET" 
                    :type="showSecret.GHL_WEBHOOK_SECRET ? 'text' : 'password'" 
                    class="clean-input with-lead with-trail" 
                    placeholder="Enter Webhook Auth Secret" 
                  />
                  <button 
                    type="button" 
                    class="input-trailing-btn" 
                    @click="toggleShow('GHL_WEBHOOK_SECRET')"
                  >
                    <svg v-if="!showSecret.GHL_WEBHOOK_SECRET" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Sent in header: <code>Authorization: Bearer &lt;secret&gt;</code></span>
                  <button type="button" class="btn-copy-link" @click="copyToClipboard(form.GHL_WEBHOOK_SECRET, 'Webhook Secret')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <!-- GHL API Version -->
              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">GoHighLevel API Version</span>
                  <span class="label-pill">Header: Version</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  <input v-model="form.GHL_API_VERSION" type="text" class="clean-input with-lead" placeholder="2021-07-28" />
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Default: <code>2021-07-28</code></span>
                </div>
              </div>

              <!-- GHL API Base URL -->
              <div class="form-item span-full">
                <label class="form-label-row">
                  <span class="label-name">GHL API Base Endpoint</span>
                  <span class="label-pill">Production Gateway</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  </span>
                  <input v-model="form.GHL_API_BASE_URL" type="text" class="clean-input with-lead" placeholder="https://services.leadconnectorhq.com" />
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save GoHighLevel Settings' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 2: WEBHOOKS & OPERATIONS                               -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'webhooks'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Webhooks &amp; Operations Integration Hub</h2>
                <p class="module-desc">Connect automated case handoffs to your Operations team (Make.com, Zapier, n8n, Slack, or internal ERP).</p>
              </div>
              <div class="sub-tab-pill-group">
                <button 
                  type="button" 
                  class="sub-pill" 
                  :class="{ active: webhookTab === 'operations' }"
                  @click="webhookTab = 'operations'"
                >
                  Outbound (Operations)
                </button>
                <button 
                  type="button" 
                  class="sub-pill" 
                  :class="{ active: webhookTab === 'inbound' }"
                  @click="webhookTab = 'inbound'"
                >
                  Inbound (GHL Trigger)
                </button>
                <button 
                  type="button" 
                  class="sub-pill" 
                  :class="{ active: webhookTab === 'docs' }"
                  @click="webhookTab = 'docs'"
                >
                  Documentation
                </button>
              </div>
            </div>

            <!-- Subtab 2.1: Outbound Operations -->
            <div v-if="webhookTab === 'operations'" class="subtab-pane">
              <div class="form-item span-full">
                <label class="form-label-row">
                  <span class="label-name">Operations Webhook Destination URL</span>
                  <span class="label-pill">POST Request</span>
                </label>
                <div class="inline-action-input">
                  <div class="input-icon-group" style="flex: 1;">
                    <span class="input-leading-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </span>
                    <input 
                      v-model="form.OPERATIONS_WEBHOOK_URL" 
                      type="text" 
                      class="clean-input with-lead" 
                      placeholder="https://hook.eu1.make.com/... or https://hooks.zapier.com/... or https://n8n.yourorg.com/webhook/ops" 
                    />
                  </div>
                  <button 
                    type="button" 
                    class="btn-trigger-ping" 
                    :disabled="testingWebhook || !form.OPERATIONS_WEBHOOK_URL"
                    @click="testOperationsWebhook"
                  >
                    <span v-if="testingWebhook" class="spin-active">⏳</span>
                    <span v-else>⚡</span>
                    <span>{{ testingWebhook ? 'Pinging…' : 'Test Ping' }}</span>
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Delivered automatically when sales clicks <strong>"Share with Operations"</strong> on a completed dossier.</span>
                </div>
              </div>

              <!-- Quick Platform Connect Presets -->
              <div class="platform-quick-bar">
                <span class="quick-bar-label">⚡ Platform Connection Guides:</span>
                <div class="quick-bar-pills">
                  <button type="button" class="quick-brand-btn brand-make" @click="openPlatformGuide('make')">
                    <span class="brand-dot">🟣</span> Make.com Recipe
                  </button>
                  <button type="button" class="quick-brand-btn brand-zapier" @click="openPlatformGuide('zapier')">
                    <span class="brand-dot">🟠</span> Zapier Pipeline
                  </button>
                  <button type="button" class="quick-brand-btn brand-n8n" @click="openPlatformGuide('n8n')">
                    <span class="brand-dot">🔴</span> n8n Workflow
                  </button>
                  <button type="button" class="quick-brand-btn brand-slack" @click="openPlatformGuide('slack')">
                    <span class="brand-dot">💬</span> Slack / Discord
                  </button>
                  <button type="button" class="quick-brand-btn brand-sec" @click="openPlatformGuide('security')">
                    <span class="brand-dot">🔒</span> HMAC Security
                  </button>
                  <button type="button" class="quick-brand-btn brand-dict" @click="openPlatformGuide('schema')">
                    <span class="brand-dot">📋</span> Field Dictionary
                  </button>
                </div>
              </div>

              <!-- Ping Result -->
              <div v-if="testWebhookResult" class="ping-banner" :class="testWebhookResult.success ? 'ping-success' : 'ping-error'">
                <div class="ping-banner-header">
                  <span class="ping-badge-status">{{ testWebhookResult.success ? '✓ Delivered' : '✕ Delivery Notice' }}</span>
                  <span v-if="testWebhookResult.status" class="ping-http-code">HTTP {{ testWebhookResult.status }}</span>
                  <span v-if="testWebhookResult.durationMs" class="ping-ms">{{ testWebhookResult.durationMs }}ms</span>
                </div>
                <div class="ping-detail-text">{{ testWebhookResult.message || testWebhookResult.error }}</div>
                <div v-if="testWebhookResult.responseData" class="ping-response-box">
                  <div class="ping-response-title">
                    {{ testWebhookResult.success ? 'Receiver Response Body (HTTP 200):' : 'Receiver Response Body:' }}
                  </div>
                  <pre class="ping-response-code"><code>{{ typeof testWebhookResult.responseData === 'object' ? JSON.stringify(testWebhookResult.responseData, null, 2) : testWebhookResult.responseData }}</code></pre>
                </div>
              </div>

              <div class="form-item span-full" style="margin-top: 14px;">
                <label class="form-label-row">
                  <span class="label-name">HMAC-SHA256 Signing Secret</span>
                  <span class="label-pill">X-Webhook-Signature</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                  <input 
                    v-model="form.OPERATIONS_WEBHOOK_SECRET" 
                    :type="showSecret.OPERATIONS_WEBHOOK_SECRET ? 'text' : 'password'" 
                    class="clean-input with-lead with-trail" 
                    placeholder="Enter HMAC signing secret" 
                  />
                  <button 
                    type="button" 
                    class="input-trailing-btn" 
                    @click="toggleShow('OPERATIONS_WEBHOOK_SECRET')"
                  >
                    <svg v-if="!showSecret.OPERATIONS_WEBHOOK_SECRET" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Sent in header <code>X-Webhook-Signature</code> as an HMAC-SHA256 hex digest of the raw JSON body to verify authenticity.</span>
                </div>
              </div>

              <!-- Key Output Mapping Cheat Sheet -->
              <div class="cheat-sheet-box">
                <div class="cheat-sheet-header">
                  <span class="cheat-sheet-title">★ Key Output Fields for Operations (Click to copy JSON path)</span>
                  <span class="cheat-sheet-hint">Use these paths directly in your automation scenario / zap</span>
                </div>
                <div class="cheat-sheet-grid">
                  <div class="cheat-card" @click="copyToClipboard('documents.packageZipUrl', 'ZIP Package URL')">
                    <div class="cheat-card-top">
                      <span class="cheat-card-badge badge-zip">📦 Full Case Archive</span>
                      <span class="cheat-copy-tag">Copy</span>
                    </div>
                    <code class="cheat-path">documents.packageZipUrl</code>
                    <div class="cheat-desc">ZIP containing Signed PDF + 9-page Summary + all client attachments.</div>
                  </div>
                  <div class="cheat-card" @click="copyToClipboard('documents.signedContractPdfUrl', 'Signed PDF URL')">
                    <div class="cheat-card-top">
                      <span class="cheat-card-badge badge-pdf">📄 Executed Contract</span>
                      <span class="cheat-copy-tag">Copy</span>
                    </div>
                    <code class="cheat-path">documents.signedContractPdfUrl</code>
                    <div class="cheat-desc">Direct PDF download of the signed legal agreement with digital audit certificates.</div>
                  </div>
                  <div class="cheat-card" @click="copyToClipboard('documents.clientSummaryPdfUrl', 'Summary PDF URL')">
                    <div class="cheat-card-top">
                      <span class="cheat-card-badge badge-summary">📑 Client Summary PDF</span>
                      <span class="cheat-copy-tag">Copy</span>
                    </div>
                    <code class="cheat-path">documents.clientSummaryPdfUrl</code>
                    <div class="cheat-desc">Official 9-page Client Summary dossier PDF with client profile and forms.</div>
                  </div>
                  <div class="cheat-card" @click="copyToClipboard('client.fullName', 'Client Full Name')">
                    <div class="cheat-card-top">
                      <span class="cheat-card-badge badge-client">👤 Client Name &amp; ID</span>
                      <span class="cheat-copy-tag">Copy</span>
                    </div>
                    <code class="cheat-path">client.fullName</code>
                    <div class="cheat-desc">Client legal name (also <code>client.ghlContactId</code> for instant CRM lookups).</div>
                  </div>
                </div>
              </div>

              <!-- Terminal Code Box -->
              <div class="code-terminal-card">
                <div class="terminal-bar">
                  <span class="terminal-title">OUTBOUND PAYLOAD SCHEMA (JSON)</span>
                  <div class="terminal-btn-group">
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleCurlCommand, 'cURL Test Command')">
                      📋 Copy cURL
                    </button>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleOutboundJson, 'Schema JSON')">
                      📄 Copy JSON
                    </button>
                  </div>
                </div>
                <pre class="terminal-body"><code>{{ sampleOutboundJson }}</code></pre>
              </div>
            </div>

            <!-- Subtab 2.2: Inbound GHL Trigger -->
            <div v-else-if="webhookTab === 'inbound'" class="subtab-pane">
              <div class="form-item span-full">
                <label class="form-label-row">
                  <span class="label-name">Inbound Webhook Trigger URL</span>
                  <span class="label-pill">GHL Workflow Action</span>
                </label>
                <div class="inline-action-input">
                  <input 
                    :value="inboundWebhookUrl" 
                    type="text" 
                    readonly 
                    class="clean-input code-font" 
                  />
                  <button 
                    type="button" 
                    class="btn-trigger-ping btn-blue-action" 
                    @click="copyToClipboard(inboundWebhookUrl, 'Inbound Trigger URL')"
                  >
                    Copy URL
                  </button>
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">Paste into GoHighLevel Workflow (Add Action &rarr; Custom Webhook &rarr; POST).</span>
                </div>
              </div>

              <!-- Inbound Workflow Breadcrumb Banner -->
              <div class="flow-diagram-bar">
                <div class="flow-step">
                  <span class="flow-step-num">1</span>
                  <span>GHL Trigger (Won / Tag)</span>
                </div>
                <span class="flow-arrow">&rarr;</span>
                <div class="flow-step">
                  <span class="flow-step-num">2</span>
                  <span>Custom Webhook (POST)</span>
                </div>
                <span class="flow-arrow">&rarr;</span>
                <div class="flow-step">
                  <span class="flow-step-num">3</span>
                  <span>Rule Engine Matching</span>
                </div>
                <span class="flow-arrow">&rarr;</span>
                <div class="flow-step">
                  <span class="flow-step-num">4</span>
                  <span>Ready Draft Contract</span>
                </div>
              </div>

              <!-- Quick Helper Info for Inbound Auth -->
              <div class="inbound-helper-card">
                <div class="inbound-helper-header">
                  <strong>Required HTTP Headers for Inbound Webhook:</strong>
                </div>
                <div class="inbound-headers-grid">
                  <div class="header-chip">
                    <span class="header-name">Authorization:</span>
                    <code class="header-val">Bearer {{ form.GHL_WEBHOOK_SECRET || 'YOUR_GHL_WEBHOOK_SECRET' }}</code>
                  </div>
                  <div class="header-chip">
                    <span class="header-name">Content-Type:</span>
                    <code class="header-val">application/json</code>
                  </div>
                </div>
              </div>

              <div class="code-terminal-card">
                <div class="terminal-bar">
                  <span class="terminal-title">INBOUND PAYLOAD REQUEST BODY (GHL MERGE TAGS)</span>
                  <div class="terminal-btn-group">
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleInboundCurlCommand, 'Inbound cURL Command')">
                      📋 Copy cURL
                    </button>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleInboundJson, 'Inbound JSON')">
                      📄 Copy JSON
                    </button>
                  </div>
                </div>
                <pre class="terminal-body"><code>{{ sampleInboundJson }}</code></pre>
              </div>

              <div class="doc-jump-card">
                <div>
                  <div class="doc-jump-title">Need step-by-step GoHighLevel Workflow instructions?</div>
                  <div class="doc-jump-sub">Learn how to setup Opportunity Won triggers and automated drafting in seconds.</div>
                </div>
                <button type="button" class="btn-terminal-copy btn-jump" @click="openPlatformGuide('ghl')">
                  Open GHL Setup Guide &rarr;
                </button>
              </div>
            </div>

            <!-- Subtab 2.3: Comprehensive Documentation & Guides -->
            <div v-else-if="webhookTab === 'docs'" class="subtab-pane">
              <!-- Platform Switcher Navigation -->
              <div class="platform-nav-tabs">
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'make' }"
                  @click="selectedDocPlatform = 'make'"
                >
                  <span class="brand-dot">🟣</span> Make.com
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'zapier' }"
                  @click="selectedDocPlatform = 'zapier'"
                >
                  <span class="brand-dot">🟠</span> Zapier
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'n8n' }"
                  @click="selectedDocPlatform = 'n8n'"
                >
                  <span class="brand-dot">🔴</span> n8n
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'slack' }"
                  @click="selectedDocPlatform = 'slack'"
                >
                  <span class="brand-dot">💬</span> Slack &amp; Discord
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'ghl' }"
                  @click="selectedDocPlatform = 'ghl'"
                >
                  <span class="brand-dot">🟢</span> GHL Workflows (Inbound)
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'security' }"
                  @click="selectedDocPlatform = 'security'"
                >
                  <span class="brand-dot">🔒</span> HMAC Security &amp; API
                </button>
                <button 
                  type="button" 
                  class="platform-nav-btn" 
                  :class="{ active: selectedDocPlatform === 'schema' }"
                  @click="selectedDocPlatform = 'schema'"
                >
                  <span class="brand-dot">📋</span> Field Dictionary
                </button>
              </div>

              <!-- PLATFORM 1: MAKE.COM -->
              <div v-if="selectedDocPlatform === 'make'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-make">🟣 MAKE.COM (INTEGROMAT)</div>
                  <h3 class="platform-heading">Automated Case Dossier Ingestion Scenario</h3>
                  <p class="platform-sub">
                    Automatically download client case attachments and signed legal PDFs to Google Drive, create a row in Google Sheets, and notify your Operations channel in Slack.
                  </p>
                </div>

                <div class="flow-diagram-bar">
                  <div class="flow-step"><span>1. Custom Webhook</span></div>
                  <span class="flow-arrow">&rarr;</span>
                  <div class="flow-step"><span>2. HTTP Get a file</span></div>
                  <span class="flow-arrow">&rarr;</span>
                  <div class="flow-step"><span>3. Google Drive Upload</span></div>
                  <span class="flow-arrow">&rarr;</span>
                  <div class="flow-step"><span>4. Slack / Sheets Notice</span></div>
                </div>

                <div class="guide-steps-list">
                  <div class="guide-step-card">
                    <div class="step-badge">Step 1</div>
                    <div class="step-body">
                      <h4 class="step-title">Create Custom Webhook in Make.com</h4>
                      <p class="step-text">
                        Create a new Scenario in Make.com. Add the <strong>Webhooks &rarr; Custom Webhook</strong> module. 
                        Click <em>Add</em>, name it <code>Contract Manager Operations Handoff</code>, and copy the generated Webhook URL.
                      </p>
                      <div class="step-action-row">
                        <button type="button" class="btn-inline-action" @click="webhookTab = 'operations'">
                          &larr; Paste URL in Outbound Tab &amp; Click "Test Ping"
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 2</div>
                    <div class="step-body">
                      <h4 class="step-title">Download Complete Case ZIP or Signed PDF</h4>
                      <p class="step-text">
                        Add an <strong>HTTP &rarr; Get a file</strong> module. In the <em>URL</em> field, map:
                      </p>
                      <div class="code-pill-row">
                        <div class="code-pill-item" @click="copyToClipboard('1.documents.packageZipUrl', 'ZIP Expression')">
                          <code>1.documents.packageZipUrl</code>
                          <span class="pill-label">Downloads Complete Archive ZIP (Signed PDF + Summary + Uploads)</span>
                        </div>
                        <div class="code-pill-item" @click="copyToClipboard('1.documents.signedContractPdfUrl', 'PDF Expression')">
                          <code>1.documents.signedContractPdfUrl</code>
                          <span class="pill-label">Downloads Executed PDF Agreement Only</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 3</div>
                    <div class="step-body">
                      <h4 class="step-title">Upload Archive to Google Drive / OneDrive / Dropbox</h4>
                      <p class="step-text">
                        Add a <strong>Google Drive &rarr; Upload a File</strong> module. 
                        Set the folder path to <code>/Operations/Client Files/&#123;&#123; 1.client.fullName &#125;&#125;</code>. 
                        Pass the binary file output from Step 2 into <em>File</em>.
                      </p>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 4</div>
                    <div class="step-body">
                      <h4 class="step-title">Send Alert to Slack / Microsoft Teams / ClickUp</h4>
                      <p class="step-text">
                        Add a <strong>Slack &rarr; Create a Message</strong> module to post into <code>#operations-cases</code>. 
                        Copy the template message below:
                      </p>
                      <div class="code-terminal-card mini">
                        <div class="terminal-bar">
                          <span class="terminal-title">MAKE.COM SLACK NOTIFICATION FORMULA</span>
                          <button type="button" class="btn-terminal-copy" @click="copyMakeSlackFormula">
                            Copy Formula
                          </button>
                        </div>
                        <pre class="terminal-body"><code>📁 *New Operations Dossier Received!*
• *Client:* &#123;&#123;1.client.fullName&#125;&#125; (&#123;&#123;1.client.nationality&#125;&#125;)
• *Contract:* &#123;&#123;1.contract.templateName&#125;&#125; (#&#123;&#123;1.contract.id&#125;&#125;)
• *Counsellor:* &#123;&#123;1.handover.counsellorName&#125;&#125; | *Branch:* &#123;&#123;1.handover.registeredBranch&#125;&#125;
• *Signed PDF:* &#123;&#123;1.documents.signedContractPdfUrl&#125;&#125;
• *Full ZIP:* &#123;&#123;1.documents.packageZipUrl&#125;&#125;</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PLATFORM 2: ZAPIER -->
              <div v-else-if="selectedDocPlatform === 'zapier'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-zapier">🟠 ZAPIER PIPELINE</div>
                  <h3 class="platform-heading">3-Step Instant Cloud Pipeline</h3>
                  <p class="platform-sub">
                    Directly stream client dossier packages into Google Drive, AWS S3, or Dropbox and notify your operations managers without writing a single line of code.
                  </p>
                </div>

                <div class="flow-diagram-bar">
                  <div class="flow-step"><span>1. Webhooks Catch Hook</span></div>
                  <span class="flow-arrow">&rarr;</span>
                  <div class="flow-step"><span>2. Google Drive Upload</span></div>
                  <span class="flow-arrow">&rarr;</span>
                  <div class="flow-step"><span>3. Slack / Teams Alert</span></div>
                </div>

                <div class="guide-steps-list">
                  <div class="guide-step-card">
                    <div class="step-badge">Step 1</div>
                    <div class="step-body">
                      <h4 class="step-title">Trigger: Webhooks by Zapier &rarr; Catch Hook</h4>
                      <p class="step-text">
                        Create a new Zap. Choose <strong>Webhooks by Zapier</strong> as the trigger and select <strong>Catch Hook</strong>. 
                        Zapier gives you a unique URL.
                      </p>
                      <div class="step-action-row">
                        <button type="button" class="btn-inline-action" @click="webhookTab = 'operations'">
                          &larr; Paste URL in Outbound Tab &amp; Click "Test Ping"
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 2</div>
                    <div class="step-body">
                      <h4 class="step-title">Action: Google Drive &rarr; Upload File</h4>
                      <p class="step-text">
                        In Zapier, choose <strong>Google Drive</strong> &rarr; <strong>Upload File</strong>.
                        In the <em>File</em> parameter, choose <code>documents packageZipUrl</code>. 
                        Zapier automatically streams and saves the full case package archive into your chosen folder!
                      </p>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 3</div>
                    <div class="step-body">
                      <h4 class="step-title">Action: Slack / Teams Channel Notification</h4>
                      <p class="step-text">
                        Add a <strong>Slack &rarr; Send Channel Message</strong> action. Map <code>client fullName</code>, <code>handover counsellorName</code>, and include direct links to <code>documents signedContractPdfUrl</code> and <code>documents packageZipUrl</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PLATFORM 3: N8N -->
              <div v-else-if="selectedDocPlatform === 'n8n'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-n8n">🔴 N8N (SELF-HOSTED &amp; CLOUD)</div>
                  <h3 class="platform-heading">Complete n8n Workflow with Direct Canvas Import</h3>
                  <p class="platform-sub">
                    Copy the JSON workflow below and press <code>Ctrl+V</code> inside your n8n workspace to instantly deploy the full case reception, file download, and cloud storage flow.
                  </p>
                </div>

                <div class="code-terminal-card">
                  <div class="terminal-bar">
                    <span class="terminal-title">N8N READY-TO-PASTE WORKFLOW JSON</span>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleN8nWorkflow, 'n8n Workflow JSON')">
                      📋 Copy n8n Workflow (Ctrl+V)
                    </button>
                  </div>
                  <pre class="terminal-body"><code>{{ sampleN8nWorkflow }}</code></pre>
                </div>

                <div class="guide-steps-list" style="margin-top: 14px;">
                  <div class="guide-step-card">
                    <div class="step-badge">Node 1</div>
                    <div class="step-body">
                      <h4 class="step-title">Webhook Node (POST)</h4>
                      <p class="step-text">Listens on <code>/webhook/contract-operations-handoff</code>. Set <em>Response Mode</em> to "Immediately" (HTTP 200 OK).</p>
                    </div>
                  </div>
                  <div class="guide-step-card">
                    <div class="step-badge">Node 2</div>
                    <div class="step-body">
                      <h4 class="step-title">HTTP Request Node (Binary Stream)</h4>
                      <p class="step-text">Fetches <code>&#123;&#123; $json.body.documents.packageZipUrl &#125;&#125;</code> with <em>Response Format</em> set to <strong>File</strong>.</p>
                    </div>
                  </div>
                  <div class="guide-step-card">
                    <div class="step-badge">Node 3</div>
                    <div class="step-body">
                      <h4 class="step-title">Storage &amp; Notification Nodes</h4>
                      <p class="step-text">Routes the binary file to Nextcloud, Google Drive, AWS S3, or local disk, and triggers Telegram / Slack alerts.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PLATFORM 4: SLACK & DISCORD -->
              <div v-else-if="selectedDocPlatform === 'slack'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-slack">💬 SLACK &amp; DISCORD ALERTS</div>
                  <h3 class="platform-heading">Rich Channel Notifications with Interactive Action Buttons</h3>
                  <p class="platform-sub">
                    Send formatted Block Kit messages directly into Slack or Discord with 1-click download buttons for operations teams.
                  </p>
                </div>

                <div class="code-terminal-card">
                  <div class="terminal-bar">
                    <span class="terminal-title">SLACK BLOCK KIT TEMPLATE (JSON)</span>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleSlackBlockKit, 'Slack Block Kit')">
                      📋 Copy Slack Block Kit
                    </button>
                  </div>
                  <pre class="terminal-body"><code>{{ sampleSlackBlockKit }}</code></pre>
                </div>

                <div class="code-terminal-card" style="margin-top: 14px;">
                  <div class="terminal-bar">
                    <span class="terminal-title">DISCORD WEBHOOK EMBED TEMPLATE (JSON)</span>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleDiscordEmbed, 'Discord Embed')">
                      📋 Copy Discord Embed
                    </button>
                  </div>
                  <pre class="terminal-body"><code>{{ sampleDiscordEmbed }}</code></pre>
                </div>
              </div>

              <!-- PLATFORM 5: GHL INBOUND TRIGGER -->
              <div v-else-if="selectedDocPlatform === 'ghl'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-ghl">🟢 GOHIGHLEVEL WORKFLOW TRIGGER</div>
                  <h3 class="platform-heading">Trigger Automatic Contract Generation from GHL</h3>
                  <p class="platform-sub">
                    When an Opportunity moves to Won, or a specific tag (e.g. <code>contract-ready</code>) is added in GoHighLevel, automatically create and prepare the contract draft.
                  </p>
                </div>

                <div class="guide-steps-list">
                  <div class="guide-step-card">
                    <div class="step-badge">Step 1</div>
                    <div class="step-body">
                      <h4 class="step-title">Open GHL Automations &rarr; Workflows</h4>
                      <p class="step-text">
                        Create a new Workflow. Add Trigger: <strong>Opportunity Status Changed</strong> (filter: <em>Status = Won</em>) OR <strong>Contact Tag Added</strong>.
                      </p>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 2</div>
                    <div class="step-body">
                      <h4 class="step-title">Add Action: Custom Webhook</h4>
                      <p class="step-text">
                        In Workflow Actions, choose <strong>Custom Webhook</strong>.
                      </p>
                      <ul class="clean-bullet-list">
                        <li><strong>Method:</strong> <code>POST</code></li>
                        <li><strong>URL:</strong> <code>{{ inboundWebhookUrl }}</code></li>
                      </ul>
                      <div class="step-action-row">
                        <button type="button" class="btn-inline-action" @click="copyToClipboard(inboundWebhookUrl, 'Inbound URL')">
                          Copy Inbound Webhook URL
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 3</div>
                    <div class="step-body">
                      <h4 class="step-title">Configure Headers &amp; Security</h4>
                      <p class="step-text">Add the following two headers to the webhook action:</p>
                      <ul class="clean-bullet-list">
                        <li><strong>Authorization:</strong> <code>Bearer {{ form.GHL_WEBHOOK_SECRET || 'YOUR_GHL_WEBHOOK_SECRET' }}</code></li>
                        <li><strong>Content-Type:</strong> <code>application/json</code></li>
                      </ul>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 4</div>
                    <div class="step-body">
                      <h4 class="step-title">Set Request Body with GHL Merge Tags</h4>
                      <p class="step-text">Select <em>Custom Data (Raw JSON)</em> and paste the body below:</p>
                      <div class="code-terminal-card mini">
                        <div class="terminal-bar">
                          <span class="terminal-title">GHL REQUEST BODY JSON</span>
                          <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleInboundJson, 'Inbound JSON')">
                            Copy JSON
                          </button>
                        </div>
                        <pre class="terminal-body"><code>{{ sampleInboundJson }}</code></pre>
                      </div>
                    </div>
                  </div>

                  <div class="guide-step-card">
                    <div class="step-badge">Step 5</div>
                    <div class="step-body">
                      <h4 class="step-title">Automated Execution by Contract Manager</h4>
                      <p class="step-text">
                        When received, the Contract Manager rule engine evaluates the client data, matches the correct legal template, populates custom values, and stages the contract draft ready for signing!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PLATFORM 6: HMAC SECURITY & CUSTOM CODE -->
              <div v-else-if="selectedDocPlatform === 'security'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-sec">🔒 HMAC-SHA256 SECURITY</div>
                  <h3 class="platform-heading">Cryptographic Signature Verification &amp; Custom API</h3>
                  <p class="platform-sub">
                    Every outbound webhook POST includes an <code>X-Webhook-Signature</code> header containing an HMAC-SHA256 hex digest of the raw payload. Verify this to guarantee that requests are genuine and untampered.
                  </p>
                </div>

                <div class="code-terminal-card">
                  <div class="terminal-bar">
                    <span class="terminal-title">NODE.JS (EXPRESS) VERIFICATION MIDDLEWARE</span>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(sampleNodeHmacCode, 'Node.js Code')">
                      📋 Copy Node.js Snippet
                    </button>
                  </div>
                  <pre class="terminal-body"><code>{{ sampleNodeHmacCode }}</code></pre>
                </div>

                <div class="code-terminal-card" style="margin-top: 14px;">
                  <div class="terminal-bar">
                    <span class="terminal-title">PYTHON (FASTAPI / FLASK) VERIFICATION ENDPOINT</span>
                    <button type="button" class="btn-terminal-copy" @click="copyToClipboard(samplePythonHmacCode, 'Python Code')">
                      📋 Copy Python Snippet
                    </button>
                  </div>
                  <pre class="terminal-body"><code>{{ samplePythonHmacCode }}</code></pre>
                </div>
              </div>

              <!-- PLATFORM 7: DATA DICTIONARY -->
              <div v-else-if="selectedDocPlatform === 'schema'" class="platform-doc-container">
                <div class="platform-doc-header">
                  <div class="platform-badge badge-dict">📋 EXHAUSTIVE DATA DICTIONARY</div>
                  <h3 class="platform-heading">Complete Outbound Payload Schema Reference</h3>
                  <p class="platform-sub">
                    Comprehensive catalog of all fields transmitted when sales shares a completed dossier with Operations.
                  </p>
                </div>

                <div class="dict-filter-row">
                  <input 
                    v-model="dictSearchQuery" 
                    type="text" 
                    class="clean-input dict-search-input" 
                    placeholder="Search field path, type, or description (e.g. 'packageZipUrl', 'client', 'signedAt')…" 
                  />
                  <span class="dict-count-pill">{{ filteredDataDictionary.length }} Fields</span>
                </div>

                <div class="field-table-wrapper">
                  <table class="field-ref-table">
                    <thead>
                      <tr>
                        <th style="width: 28%;">JSON Field Path</th>
                        <th style="width: 14%;">Data Type</th>
                        <th style="width: 26%;">Example Value</th>
                        <th style="width: 32%;">Description &amp; Operational Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in filteredDataDictionary" :key="item.field">
                        <td class="col-path">
                          <code class="clickable-code" @click="copyToClipboard(item.field, item.field)" title="Click to copy path">
                            {{ item.field }}
                          </code>
                        </td>
                        <td class="col-type"><span class="type-pill">{{ item.type }}</span></td>
                        <td class="col-sample"><code>{{ item.sample }}</code></td>
                        <td class="col-desc">{{ item.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save Webhook Configuration' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 3: SIGNING URLS & DOMAINS                              -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'signing'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Public Signing &amp; Verification URLs</h2>
                <p class="module-desc">Controls the external domain and protocol embedded into SMS invitations, emails, and QR verification stamps.</p>
              </div>
              <span class="module-tag tag-emerald">Live Signer Gateway</span>
            </div>

            <div class="form-layout-grid">
              <div class="form-item span-full">
                <label class="form-label-row">
                  <span class="label-name">Signing Base URL</span>
                  <span class="label-pill">External FQDN</span>
                </label>
                <div class="input-icon-group">
                  <span class="input-leading-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  </span>
                  <input 
                    v-model="form.SIGNING_BASE_URL" 
                    type="text" 
                    class="clean-input with-lead" 
                    placeholder="https://contract.onesol.ae" 
                  />
                </div>
                <div class="field-sub-row">
                  <span class="field-explanation">
                    Signer invitation format: <code>{{ form.SIGNING_BASE_URL || 'https://contract.onesol.ae' }}/sign/&lt;secure_token&gt;</code>
                  </span>
                  <button type="button" class="btn-copy-link" @click="copyToClipboard(form.SIGNING_BASE_URL, 'Signing Base URL')">
                    Copy URL
                  </button>
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save Signing URL' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 4: COMPANY BRANDING (SEAL & SIGNATURE)                 -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'branding'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Official Company Seal &amp; Authorized Signature</h2>
                <p class="module-desc">Uploaded assets are automatically stamped and embedded into finalized legal contracts and certificates.</p>
              </div>
              <span class="module-tag tag-purple">Legal Stamping</span>
            </div>

            <div class="branding-side-by-side">
              <!-- Stamp Box -->
              <div class="asset-card-unit">
                <div class="asset-card-top">
                  <div class="asset-title-group">
                    <span class="asset-svg-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </span>
                    <div>
                      <h4 class="asset-unit-title">Company Seal / Stamp</h4>
                      <p class="asset-unit-sub">Overlaid alongside authorized signature on execution</p>
                    </div>
                  </div>
                </div>

                <div class="asset-upload-row">
                  <input 
                    v-model="form.COMPANY_STAMP_URL" 
                    type="text" 
                    class="clean-input" 
                    placeholder="https://... or upload PNG" 
                  />
                  <button 
                    type="button" 
                    class="btn-file-pick" 
                    :disabled="uploadingStampMedia" 
                    @click="triggerStampUpload"
                  >
                    {{ uploadingStampMedia ? 'Uploading…' : 'Upload PNG' }}
                  </button>
                  <input 
                    ref="stampFileInput" 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp" 
                    style="display: none;" 
                    @change="onStampFileSelected" 
                  />
                </div>

                <!-- Paper Canvas Preview -->
                <div class="paper-preview-box">
                  <div v-if="form.COMPANY_STAMP_URL" class="preview-active-wrap">
                    <img :src="form.COMPANY_STAMP_URL" alt="Company Stamp" class="stamp-preview-img" />
                    <div class="preview-status-pill">
                      <span class="dot-live"></span>
                      <span>Active Stamp</span>
                    </div>
                  </div>
                  <div v-else class="preview-blank-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>No company seal uploaded</span>
                  </div>
                </div>

                <div v-if="form.COMPANY_STAMP_URL" class="asset-remove-row">
                  <button type="button" class="btn-asset-delete" @click="clearStamp">Remove Stamp</button>
                </div>
              </div>

              <!-- Signature Box -->
              <div class="asset-card-unit">
                <div class="asset-card-top">
                  <div class="asset-title-group">
                    <span class="asset-svg-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                    </span>
                    <div>
                      <h4 class="asset-unit-title">Authorized Officer Signature</h4>
                      <p class="asset-unit-sub">Embedded as primary signing authority on contracts</p>
                    </div>
                  </div>
                </div>

                <div class="asset-upload-row">
                  <input 
                    v-model="form.COMPANY_SIGNATURE_URL" 
                    type="text" 
                    class="clean-input" 
                    placeholder="https://... or upload PNG" 
                  />
                  <button 
                    type="button" 
                    class="btn-file-pick" 
                    :disabled="uploadingSigMedia" 
                    @click="triggerSigUpload"
                  >
                    {{ uploadingSigMedia ? 'Uploading…' : 'Upload PNG' }}
                  </button>
                  <input 
                    ref="sigFileInput" 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp" 
                    style="display: none;" 
                    @change="onSigFileSelected" 
                  />
                </div>

                <!-- Paper Canvas Preview -->
                <div class="paper-preview-box">
                  <div v-if="form.COMPANY_SIGNATURE_URL" class="preview-active-wrap">
                    <img :src="form.COMPANY_SIGNATURE_URL" alt="Company Signature" class="sig-preview-img" />
                    <div class="preview-status-pill">
                      <span class="dot-live"></span>
                      <span>Active Signature</span>
                    </div>
                  </div>
                  <div v-else class="preview-blank-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>No signature uploaded</span>
                  </div>
                </div>

                <div v-if="form.COMPANY_SIGNATURE_URL" class="asset-remove-row">
                  <button type="button" class="btn-asset-delete" @click="clearSignature">Remove Signature</button>
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save Branding Assets' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 5: CLIENT SUMMARY SCHEMA BUILDER                       -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'schema'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Client Summary Dossier Customization</h2>
                <p class="module-desc">Configure custom fields and custom sections for the official 9-page Client Summary dossier and PDF reports.</p>
              </div>
              <div class="schema-btn-toolbar">
                <div class="preset-menu-wrap">
                  <button type="button" class="btn-tool btn-tool-ghost" @click="showPresetMenu = !showPresetMenu">
                    <span>Quick Presets ▾</span>
                  </button>
                  <div v-if="showPresetMenu" class="preset-popover">
                    <button type="button" class="preset-choice" @click="applyPreset('medical')">
                      Medical &amp; Health Clearance (New Section + 4 Fields)
                    </button>
                    <button type="button" class="preset-choice" @click="applyPreset('guarantor')">
                      Secondary Sponsor &amp; Guarantor (New Section + 4 Fields)
                    </button>
                    <button type="button" class="preset-choice" @click="applyPreset('identity')">
                      Emirates ID &amp; Tax Verification (Added to Page 1 &amp; 7)
                    </button>
                  </div>
                </div>

                <button type="button" class="btn-tool btn-tool-ghost" @click="openAddSectionModal">
                  + Add Section
                </button>
                <button type="button" class="btn-tool btn-tool-solid" @click="openAddFieldModal">
                  + Add Field
                </button>
              </div>
            </div>

            <div class="schema-sub-tabs">
              <button 
                type="button" 
                class="schema-tab-btn" 
                :class="{ active: schemaActiveTab === 'fields' }"
                @click="schemaActiveTab = 'fields'"
              >
                <span>Custom Fields</span>
                <span class="count-tag">{{ customSchema.fields?.length || 0 }}</span>
              </button>
              <button 
                type="button" 
                class="schema-tab-btn" 
                :class="{ active: schemaActiveTab === 'sections' }"
                @click="schemaActiveTab = 'sections'"
              >
                <span>Custom Sections / Pages</span>
                <span class="count-tag">{{ customSchema.sections?.length || 0 }}</span>
              </button>
            </div>

            <!-- Fields Table -->
            <div v-if="schemaActiveTab === 'fields'">
              <div v-if="!customSchema.fields?.length" class="empty-table-note">
                <p>No custom fields configured yet. Add fields to existing standard pages or custom sections.</p>
                <button type="button" class="btn-tool btn-tool-solid" @click="openAddFieldModal">+ Add First Field</button>
              </div>

              <div v-else class="table-border-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Field Label</th>
                      <th style="width: 20%;">Variable Key</th>
                      <th style="width: 15%;">Type</th>
                      <th style="width: 22%;">Target Section</th>
                      <th style="width: 8%; text-align: center;">Required</th>
                      <th style="width: 10%; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(fld, idx) in customSchema.fields" :key="fld.id || idx">
                      <td>
                        <div class="row-main-text">{{ fld.label }}</div>
                        <div v-if="fld.placeholder" class="row-sub-text">{{ fld.placeholder }}</div>
                      </td>
                      <td>
                        <code class="code-badge">{{ fld.key }}</code>
                      </td>
                      <td>
                        <span class="type-pill">{{ formatFieldType(fld.type) }}</span>
                      </td>
                      <td>
                        <span class="section-label-text">{{ getSectionDisplayLabel(fld.section) }}</span>
                      </td>
                      <td style="text-align: center;">
                        <span class="req-tag" :class="fld.required ? 'tag-req' : 'tag-opt'">
                          {{ fld.required ? 'Yes' : 'No' }}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div class="row-actions">
                          <button type="button" class="btn-act" :disabled="idx === 0" @click="moveField(idx, -1)" title="Move Up">▲</button>
                          <button type="button" class="btn-act" :disabled="idx === customSchema.fields.length - 1" @click="moveField(idx, 1)" title="Move Down">▼</button>
                          <button type="button" class="btn-act" @click="openEditFieldModal(fld, idx)" title="Edit">✎</button>
                          <button type="button" class="btn-act btn-act-del" @click="deleteField(idx)" title="Delete">✕</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Sections Table -->
            <div v-else-if="schemaActiveTab === 'sections'">
              <div v-if="!customSchema.sections?.length" class="empty-table-note">
                <p>No custom sections configured yet. Add custom sections to create standalone pages in the dossier.</p>
                <button type="button" class="btn-tool btn-tool-solid" @click="openAddSectionModal">+ Add First Section</button>
              </div>

              <div v-else class="table-border-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 14%; text-align: center;">Order</th>
                      <th style="width: 30%;">Section Title</th>
                      <th style="width: 38%;">Description</th>
                      <th style="width: 8%; text-align: center;">Fields</th>
                      <th style="width: 10%; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sec, idx) in customSchema.sections" :key="sec.id || idx">
                      <td style="text-align: center;">
                        <div class="order-reorder-flex">
                          <button type="button" class="btn-act" :disabled="idx === 0" @click="moveSection(idx, -1)">▲</button>
                          <span class="order-num">#{{ sec.order || idx + 1 }}</span>
                          <button type="button" class="btn-act" :disabled="idx === customSchema.sections.length - 1" @click="moveSection(idx, 1)">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="row-main-text">{{ sec.title }}</div>
                        <div class="row-sub-text">ID: {{ sec.id }}</div>
                      </td>
                      <td class="row-desc-cell">
                        {{ sec.description || '—' }}
                      </td>
                      <td style="text-align: center;">
                        <span class="count-pill-gray">{{ getFieldsCountForSection(sec.id) }}</span>
                      </td>
                      <td style="text-align: right;">
                        <div class="row-actions">
                          <button type="button" class="btn-act" @click="openEditSectionModal(sec, idx)" title="Edit">✎</button>
                          <button type="button" class="btn-act btn-act-del" @click="deleteSection(idx)" title="Delete">✕</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="savingSchema" @click="saveCustomSchemaManual">
                <span>{{ savingSchema ? 'Saving Schema…' : 'Save Dossier Schema' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 6: ACCESS CONTROL & SALES PRIVACY                      -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'access'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Access Control &amp; Sales Lead Privacy</h2>
                <p class="module-desc">Control whether sales representatives can only view and generate contracts for leads assigned directly to them.</p>
              </div>
              <span class="module-tag tag-blue">Data Privacy</span>
            </div>

            <div class="form-layout-grid">
              <div class="form-item span-full">
                <label class="form-label-row">
                  <span class="label-name">Restrict Sales Agents to Assigned Data</span>
                  <span class="label-pill">{{ form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'Enforced' : 'Open' }}</span>
                </label>
                <select v-model="form.RESTRICT_CONTACTS_TO_ASSIGNED" class="clean-select">
                  <option value="true">Enabled (Restricted) — Sales users only see their own assigned contacts &amp; opportunities</option>
                  <option value="false">Disabled (Open) — Sales users can search and view all contacts &amp; opportunities across the location</option>
                </select>
                <div class="field-sub-row">
                  <span class="field-explanation">
                    When enabled, representatives (e.g. Akram Mammeri) will strictly view leads assigned to their GHL account. Admins always view all records.
                  </span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">App Session Duration (JWT)</span>
                  <span class="label-pill">Auto-Logout</span>
                </label>
                <input v-model="form.JWT_EXPIRES_IN" type="text" class="clean-input" placeholder="8h" />
                <div class="field-sub-row">
                  <span class="field-explanation">Default: <code>8h</code></span>
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save Access Configuration' }}</span>
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- TAB 7: BACKGROUND WORKERS & PERFORMANCE                    -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-show="activeTab === 'workers'" class="module-card">
            <div class="module-header">
              <div>
                <h2 class="module-title">Background Workers &amp; Concurrency</h2>
                <p class="module-desc">Tune rate limits for GoHighLevel API and configure automated background cron scanner intervals.</p>
              </div>
              <span class="module-tag tag-purple">Performance</span>
            </div>

            <div class="form-layout-grid">
              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">GHL Concurrency Limit</span>
                  <span class="label-pill">Rate Limit</span>
                </label>
                <input v-model="form.GHL_CONCURRENCY_LIMIT" type="number" class="clean-input" placeholder="4" />
                <div class="field-sub-row">
                  <span class="field-explanation">Max concurrent parallel API calls</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Field Cache TTL (ms)</span>
                  <span class="label-pill">In-Memory</span>
                </label>
                <input v-model="form.GHL_FIELD_CACHE_TTL_MS" type="number" class="clean-input" placeholder="900000" />
                <div class="field-sub-row">
                  <span class="field-explanation">Default: <code>900000</code> ms (15 min)</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Max PDF Upload Retries</span>
                  <span class="label-pill">Dead-letter</span>
                </label>
                <input v-model="form.MAX_UPLOAD_RETRIES" type="number" class="clean-input" placeholder="5" />
                <div class="field-sub-row">
                  <span class="field-explanation">Retries before escalation</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Expiry Worker Cron</span>
                  <span class="label-pill">Scanner</span>
                </label>
                <input v-model="form.EXPIRY_WORKER_CRON" type="text" class="clean-input" placeholder="*/5 * * * *" />
                <div class="field-sub-row">
                  <span class="field-explanation">Overdue contract scanner frequency</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label-row">
                  <span class="label-name">Retry Worker Cron</span>
                  <span class="label-pill">Sync</span>
                </label>
                <input v-model="form.RETRY_WORKER_CRON" type="text" class="clean-input" placeholder="*/2 * * * *" />
                <div class="field-sub-row">
                  <span class="field-explanation">Failed upload retry scanner</span>
                </div>
              </div>
            </div>

            <div class="module-footer">
              <button type="button" class="btn-save-inline" :disabled="saving" @click="saveSettings">
                <span>{{ saving ? 'Saving…' : 'Save Worker Settings' }}</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>

    <!-- ─── FLOATING ACTION BAR FOR UNSAVED CHANGES ────────────────────── -->
    <transition name="toast-fade">
      <div v-if="isFormDirty" class="sticky-save-dock">
        <div class="save-dock-inner">
          <div class="dock-meta">
            <span class="dock-dot"></span>
            <div>
              <span class="dock-title">You have unsaved changes</span>
              <span class="dock-sub">Configurations have not yet been written to MySQL database.</span>
            </div>
          </div>
          <div class="dock-buttons">
            <button type="button" class="btn-dock-cancel" :disabled="saving" @click="discardChanges">Discard</button>
            <button type="button" class="btn-dock-commit" :disabled="saving" @click="saveSettings">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── MODAL: ADD / EDIT CUSTOM FIELD ──────────────────────────── -->
    <div v-if="showFieldModal" class="modal-layer" @click.self="showFieldModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3 class="modal-title-text">{{ editingFieldIndex >= 0 ? 'Edit Custom Field' : 'Add New Custom Field' }}</h3>
          <button type="button" class="modal-x" @click="showFieldModal = false">✕</button>
        </div>

        <form @submit.prevent="submitFieldModal" class="modal-body-form">
          <div class="modal-2-col">
            <div>
              <label class="field-label-text">Field Label <span class="req-star">*</span></label>
              <input
                type="text"
                v-model="fieldForm.label"
                class="clean-input"
                placeholder="e.g. National ID / Emirates ID"
                required
                @input="onFieldLabelInput"
              />
            </div>
            <div>
              <label class="field-label-text">Variable Key <span class="req-star">*</span></label>
              <input
                type="text"
                v-model="fieldForm.key"
                class="clean-input code-font"
                placeholder="e.g. national_id_number"
                required
              />
            </div>
          </div>

          <div class="modal-2-col">
            <div>
              <label class="field-label-text">Field Type <span class="req-star">*</span></label>
              <select v-model="fieldForm.type" class="clean-select">
                <option value="text">Text (Single-line)</option>
                <option value="textarea">Textarea (Multi-line paragraph)</option>
                <option value="number">Number / Currency Amount</option>
                <option value="date">Date (YYYY-MM-DD)</option>
                <option value="dropdown">Dropdown / Select Menu</option>
                <option value="yes_no">Yes / No Toggle</option>
                <option value="checkbox">Checkbox (True / False)</option>
              </select>
            </div>

            <div>
              <label class="field-label-text">Target Section / Page <span class="req-star">*</span></label>
              <select v-model="fieldForm.section" class="clean-select">
                <optgroup label="Standard Built-in Dossier Pages">
                  <option v-for="sec in standardSectionOptions" :key="sec.id" :value="sec.id">
                    {{ sec.label }}
                  </option>
                </optgroup>
                <optgroup v-if="customSchema.sections?.length" label="Custom Configured Sections">
                  <option v-for="cSec in customSchema.sections" :key="cSec.id" :value="cSec.id">
                    Custom: {{ cSec.title }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div v-if="fieldForm.type === 'dropdown'">
            <label class="field-label-text">Dropdown Options (Comma-separated) <span class="req-star">*</span></label>
            <input
              type="text"
              v-model="fieldForm.optionsText"
              class="clean-input"
              placeholder="e.g. Option A, Option B, Option C"
              required
            />
          </div>

          <div class="modal-2-col">
            <div>
              <label class="field-label-text">Placeholder Text</label>
              <input type="text" v-model="fieldForm.placeholder" class="clean-input" placeholder="e.g. Enter value..." />
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 8px; padding-top: 14px;">
              <label class="check-row">
                <input type="checkbox" v-model="fieldForm.required" />
                <span>Required Field</span>
              </label>
              <label class="check-row">
                <input type="checkbox" v-model="fieldForm.fullWidth" />
                <span>Full Width in PDF</span>
              </label>
            </div>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-tool btn-tool-ghost" @click="showFieldModal = false">Cancel</button>
            <button type="submit" class="btn-tool btn-tool-solid">{{ editingFieldIndex >= 0 ? 'Save Changes' : 'Add Field' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── MODAL: ADD / EDIT CUSTOM SECTION ────────────────────────── -->
    <div v-if="showSectionModal" class="modal-layer" @click.self="showSectionModal = false">
      <div class="modal-box" style="max-width: 480px;">
        <div class="modal-head">
          <h3 class="modal-title-text">{{ editingSectionIndex >= 0 ? 'Edit Custom Section' : 'Add New Custom Section' }}</h3>
          <button type="button" class="modal-x" @click="showSectionModal = false">✕</button>
        </div>

        <form @submit.prevent="submitSectionModal" class="modal-body-form">
          <div class="modal-2-col">
            <div>
              <label class="field-label-text">Section Title <span class="req-star">*</span></label>
              <input type="text" v-model="sectionForm.title" class="clean-input" placeholder="e.g. Medical Clearance" required />
            </div>
            <div>
              <label class="field-label-text">Order Position</label>
              <input type="number" v-model.number="sectionForm.order" min="1" class="clean-input" placeholder="1" />
            </div>
          </div>

          <div>
            <label class="field-label-text">Description</label>
            <textarea v-model="sectionForm.description" class="clean-input" rows="3" placeholder="Brief section instructions..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-tool btn-tool-ghost" @click="showSectionModal = false">Cancel</button>
            <button type="submit" class="btn-tool btn-tool-solid">{{ editingSectionIndex >= 0 ? 'Save Section' : 'Create Section' }}</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const stampFileInput = ref(null)
const sigFileInput = ref(null)

// Primary Sidebar Navigation
const activeTab = ref('ghl') // 'ghl', 'webhooks', 'signing', 'branding', 'schema', 'access', 'workers'

// Webhook Subtabs
const webhookTab = ref('operations') // 'operations', 'inbound', 'docs'
const selectedDocPlatform = ref('make') // 'make', 'zapier', 'n8n', 'slack', 'ghl', 'security', 'schema'
const dictSearchQuery = ref('')
const testingWebhook = ref(false)
const testWebhookResult = ref(null)
const copyToast = ref('')

function openPlatformGuide(platform) {
  webhookTab.value = 'docs'
  selectedDocPlatform.value = platform
}

function copyMakeSlackFormula() {
  const text = `📁 *New Operations Dossier Received!*
• *Client:* {{1.client.fullName}} ({{1.client.nationality}})
• *Contract:* {{1.contract.templateName}} (#{{1.contract.id}})
• *Counsellor:* {{1.handover.counsellorName}} | *Branch:* {{1.handover.registeredBranch}}
• *Signed PDF:* {{1.documents.signedContractPdfUrl}}
• *Full ZIP:* {{1.documents.packageZipUrl}}`
  copyToClipboard(text, 'Make.com Slack Formula')
}

// Form State
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
  COMPANY_STAMP_URL: '',
  COMPANY_SIGNATURE_URL: '',
  OPERATIONS_WEBHOOK_URL: '',
  OPERATIONS_WEBHOOK_SECRET: '',
})

// Snapshot for dirty state detection
const initialSnapshot = ref('')

const isFormDirty = computed(() => {
  if (!initialSnapshot.value) return false
  return JSON.stringify(form.value) !== initialSnapshot.value
})

function discardChanges() {
  if (initialSnapshot.value) {
    try {
      form.value = JSON.parse(initialSnapshot.value)
    } catch (_) {}
  }
}

const uploadingStampMedia = ref(false)
const uploadingSigMedia = ref(false)

function triggerStampUpload() {
  stampFileInput.value?.click()
}

function triggerSigUpload() {
  sigFileInput.value?.click()
}

async function onStampFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.')
    return
  }
  const reader = new FileReader()
  reader.onload = async (event) => {
    const dataBase64 = event.target.result
    form.value.COMPANY_STAMP_URL = dataBase64
    uploadingStampMedia.value = true
    try {
      const res = await api.post('/ghl/media/upload', {
        dataBase64,
        filename: `stamp_${Date.now()}.png`,
        mimeType: file.type || 'image/png',
      })
      const finalUrl = res.data?.url || dataBase64
      form.value.COMPANY_STAMP_URL = finalUrl
      
      await api.put('/settings', { settings: { COMPANY_STAMP_URL: finalUrl } })
      initialSnapshot.value = JSON.stringify(form.value)
      successMsg.value = 'Company seal saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Stamp upload save fallback:', err)
      try {
        await api.put('/settings', { settings: { COMPANY_STAMP_URL: dataBase64 } })
        initialSnapshot.value = JSON.stringify(form.value)
        successMsg.value = 'Company seal saved successfully!'
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (saveErr) {
        errorMsg.value = 'Failed to save company seal.'
      }
    } finally {
      uploadingStampMedia.value = false
    }
  }
  reader.readAsDataURL(file)
}

async function clearStamp() {
  form.value.COMPANY_STAMP_URL = ''
  try {
    await api.put('/settings', { settings: { COMPANY_STAMP_URL: '' } })
    initialSnapshot.value = JSON.stringify(form.value)
    successMsg.value = 'Company seal removed.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (_) {}
}

async function onSigFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.')
    return
  }
  const reader = new FileReader()
  reader.onload = async (event) => {
    const dataBase64 = event.target.result
    form.value.COMPANY_SIGNATURE_URL = dataBase64
    uploadingSigMedia.value = true
    try {
      const res = await api.post('/ghl/media/upload', {
        dataBase64,
        filename: `signature_${Date.now()}.png`,
        mimeType: file.type || 'image/png',
      })
      const finalUrl = res.data?.url || dataBase64
      form.value.COMPANY_SIGNATURE_URL = finalUrl

      await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: finalUrl } })
      initialSnapshot.value = JSON.stringify(form.value)
      successMsg.value = 'Authorized signature saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Signature upload save fallback:', err)
      try {
        await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: dataBase64 } })
        initialSnapshot.value = JSON.stringify(form.value)
        successMsg.value = 'Authorized signature saved successfully!'
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (saveErr) {
        errorMsg.value = 'Failed to save signature.'
      }
    } finally {
      uploadingSigMedia.value = false
    }
  }
  reader.readAsDataURL(file)
}

async function clearSignature() {
  form.value.COMPANY_SIGNATURE_URL = ''
  try {
    await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: '' } })
    initialSnapshot.value = JSON.stringify(form.value)
    successMsg.value = 'Company signature removed.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (_) {}
}

const showSecret = ref({
  GHL_SHARED_SECRET: false,
  GHL_PRIVATE_INTEGRATION_TOKEN: false,
  GHL_WEBHOOK_SECRET: false,
  OPERATIONS_WEBHOOK_SECRET: false,
})

function toggleShow(field) {
  showSecret.value[field] = !showSecret.value[field]
}

const inboundWebhookUrl = computed(() => {
  const origin = window.location.origin
  const serverBase = origin.includes(':5173') ? origin.replace(':5173', ':3000') : origin
  return `${serverBase}/api/webhooks/ghl/contract-trigger`
})

function copyToClipboard(text, label = 'Copied') {
  if (!text) return
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      copyToast.value = `${label} copied to clipboard!`
      setTimeout(() => { copyToast.value = '' }, 2500)
    }).catch(() => {
      prompt('Copy to clipboard:', text)
    })
  } else {
    prompt('Copy to clipboard:', text)
  }
}

async function testOperationsWebhook() {
  if (!form.value.OPERATIONS_WEBHOOK_URL) {
    alert('Please enter an Operations Webhook URL first.')
    return
  }

  testingWebhook.value = true
  testWebhookResult.value = null

  try {
    const payload = {
      webhookUrl: form.value.OPERATIONS_WEBHOOK_URL,
    }
    // Only pass secret if it was explicitly typed/changed (not masked with bullets)
    if (form.value.OPERATIONS_WEBHOOK_SECRET && !form.value.OPERATIONS_WEBHOOK_SECRET.includes('••••')) {
      payload.webhookSecret = form.value.OPERATIONS_WEBHOOK_SECRET
    }

    const res = await api.post('/settings/test-operations-webhook', payload)
    testWebhookResult.value = res.data
  } catch (err) {
    testWebhookResult.value = {
      success: false,
      status: err.response?.status,
      error: err.response?.data?.error || err.message,
      responseData: err.response?.data?.responseData || err.response?.data || null,
    }
  } finally {
    testingWebhook.value = false
  }
}

const sampleOutboundJson = computed(() => {
  return JSON.stringify({
    event: "client_dossier.shared_with_operations",
    eventId: "evt_ops_1042_1713180000",
    timestamp: new Date().toISOString(),
    locationId: "ghl_location_123",
    handover: {
      action: "OPERATIONS_HANDOFF",
      sharedByName: "Akram Mammeri",
      sharedAt: new Date().toISOString(),
      counsellorName: "Akram Mammeri",
      registeredBranch: "Dubai HQ"
    },
    client: {
      ghlContactId: "cont_8829103",
      fullName: "Ahmed Al Mansoor",
      email: "ahmed.mansoor@example.com",
      phone: "+971501234567",
      nationality: "Emirati"
    },
    contract: {
      id: 1042,
      templateName: "Cyprus Permanent Residency Agreement",
      state: "COMPLETED",
      signedAt: new Date().toISOString(),
      pdfSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    documents: {
      signedContractPdfUrl: "https://services.leadconnectorhq.com/.../contract_1042_signed.pdf",
      clientSummaryPdfUrl: "https://services.leadconnectorhq.com/.../Client_Summary_1042.pdf",
      packageZipUrl: "https://services.leadconnectorhq.com/.../Case_Package_1042.zip",
      attachments: [
        {
          name: "Passport_Copy.pdf",
          url: "https://services.leadconnectorhq.com/.../passport.pdf",
          sizeBytes: 1420500,
          category: "Identity"
        }
      ]
    }
  }, null, 2)
})

const sampleInboundJson = computed(() => {
  return JSON.stringify({
    locationId: "{{contact.location_id}}",
    contactId: "{{contact.id}}",
    opportunityId: "{{opportunity.id}}",
    trigger: "OPPORTUNITY_WON"
  }, null, 2)
})

const sampleCurlCommand = computed(() => {
  const url = form.value.OPERATIONS_WEBHOOK_URL || 'https://hook.eu1.make.com/your-endpoint'
  return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Event: client_dossier.shared_with_operations" \\
  -H "X-Webhook-Signature: a8f4b238e0789726dc6a0f7e...hex_hmac_sha256" \\
  -d '${sampleOutboundJson.value.replace(/'/g, "'\\''")}'`
})

const sampleInboundCurlCommand = computed(() => {
  const url = inboundWebhookUrl.value
  const secret = form.value.GHL_WEBHOOK_SECRET || 'YOUR_GHL_WEBHOOK_SECRET'
  return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${secret}" \\
  -d '{\\n  "locationId": "NJOPxsxylG8ulEPo9hX9",\\n  "contactId": "SAMPLE_CONTACT_ID",\\n  "opportunityId": "SAMPLE_OPPORTUNITY_ID",\\n  "trigger": "OPPORTUNITY_WON"\\n}'`
})

const sampleSlackBlockKit = computed(() => {
  return JSON.stringify({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 New Client Case Handover to Operations",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: "*Client Name:*\n{{client.fullName}}" },
          { type: "mrkdwn", text: "*Nationality:*\n{{client.nationality}}" },
          { type: "mrkdwn", text: "*Contract Template:*\n{{contract.templateName}} (#{{contract.id}})" },
          { type: "mrkdwn", text: "*Counsellor & Branch:*\n{{handover.counsellorName}} ({{handover.registeredBranch}})" }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "📦 Download Full Case ZIP" },
            style: "primary",
            url: "{{documents.packageZipUrl}}"
          },
          {
            type: "button",
            text: { type: "plain_text", text: "📄 View Signed Contract" },
            url: "{{documents.signedContractPdfUrl}}"
          },
          {
            type: "button",
            text: { type: "plain_text", text: "📑 View Summary PDF" },
            url: "{{documents.clientSummaryPdfUrl}}"
          }
        ]
      }
    ]
  }, null, 2)
})

const sampleDiscordEmbed = computed(() => {
  return JSON.stringify({
    content: "📁 **New Operations Case Handoff Received!**",
    embeds: [
      {
        title: "Client Case Dossier Ready for Processing",
        color: 3066993,
        fields: [
          { name: "Client Name", value: "{{client.fullName}}", inline: true },
          { name: "Nationality", value: "{{client.nationality}}", inline: true },
          { name: "Contract", value: "{{contract.templateName}} (#{{contract.id}})", inline: false },
          { name: "Counsellor", value: "{{handover.counsellorName}} ({{handover.registeredBranch}})", inline: true },
          { name: "Signed At", value: "{{contract.signedAt}}", inline: true }
        ],
        description: "[📦 Download Full Case Package ZIP]({{documents.packageZipUrl}})\n[📄 Executed Agreement PDF]({{documents.signedContractPdfUrl}})\n[📑 9-Page Client Summary PDF]({{documents.clientSummaryPdfUrl}})"
      }
    ]
  }, null, 2)
})

const sampleN8nWorkflow = computed(() => {
  return JSON.stringify({
    name: "Contract Operations Dossier Ingestion",
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "contract-operations-handoff",
          responseMode: "onReceived",
          options: {}
        },
        name: "Contract Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [240, 300]
      },
      {
        parameters: {
          url: "={{ $json.body.documents.packageZipUrl }}",
          responseFormat: "file",
          options: {}
        },
        name: "Download Dossier ZIP",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.1,
        position: [460, 300]
      },
      {
        parameters: {
          operation: "upload",
          name: "={{ $('Contract Webhook').item.json.body.client.fullName }}_Dossier_{{ $('Contract Webhook').item.json.body.contract.id }}.zip",
          binaryData: true,
          binaryPropertyName: "data"
        },
        name: "Upload to Google Drive",
        type: "n8n-nodes-base.googleDrive",
        typeVersion: 2,
        position: [680, 300]
      }
    ],
    connections: {
      "Contract Webhook": {
        main: [[{ node: "Download Dossier ZIP", type: "main", index: 0 }]]
      },
      "Download Dossier ZIP": {
        main: [[{ node: "Upload to Google Drive", type: "main", index: 0 }]]
      }
    }
  }, null, 2)
})

const sampleNodeHmacCode = computed(() => {
  const secret = form.value.OPERATIONS_WEBHOOK_SECRET || 'your_shared_secret'
  return `// Node.js (Express) Webhook Signature Verification
const express = require('express');
const crypto = require('crypto');
const app = express();

const WEBHOOK_SECRET = process.env.OPERATIONS_WEBHOOK_SECRET || '${secret}';

// Ensure raw body is preserved for signature calculation
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.post('/webhook/operations', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('⚠️ Invalid HMAC signature received!');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  const { event: evt, client, contract, documents, handover } = req.body;
  console.log(\`✅ Verified case handoff for: \${client.fullName} (\${contract.templateName})\`);
  console.log(\`📦 Case ZIP Package URL: \${documents.packageZipUrl}\`);

  // Respond immediately with 200 OK
  res.status(200).json({ received: true });
});

app.listen(4000, () => console.log('Webhook server running on port 4000'));`
})

const samplePythonHmacCode = computed(() => {
  const secret = form.value.OPERATIONS_WEBHOOK_SECRET || 'your_shared_secret'
  return `# Python (FastAPI / Flask) Webhook Signature Verification
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI()
WEBHOOK_SECRET = "${secret}"

@app.post("/webhook/operations")
async def receive_operations_webhook(
    request: Request,
    x_webhook_signature: str = Header(None),
    x_webhook_event: str = Header(None)
):
    raw_body = await request.body()

    # Calculate expected HMAC-SHA256
    expected_sig = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(x_webhook_signature or "", expected_sig):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    payload = await request.json()
    client_name = payload["client"]["fullName"]
    zip_url = payload["documents"]["packageZipUrl"]

    print(f"✅ Handover received for {client_name} - ZIP: {zip_url}")
    return {"status": "success", "client": client_name}`
})

const payloadDataDictionary = [
  { field: 'event', type: 'String', sample: '"client_dossier.shared_with_operations"', desc: 'Event identifier. Always "client_dossier.shared_with_operations" when staff initiates handoff.' },
  { field: 'eventId', type: 'String', sample: '"evt_ops_1042_1713180000"', desc: 'Unique idempotent transaction ID (includes contract ID and timestamp). Safe for deduplication.' },
  { field: 'timestamp', type: 'ISO 8601 String', sample: '"2026-10-15T02:30:00.000Z"', desc: 'UTC timestamp when the webhook payload was generated and dispatched.' },
  { field: 'locationId', type: 'String', sample: '"NJOPxsxylG8ulEPo9hX9"', desc: 'GoHighLevel Sub-Account Location ID where the client contract lives.' },
  
  { field: 'handover.action', type: 'String', sample: '"OPERATIONS_HANDOFF"', desc: 'Internal workflow classification descriptor.' },
  { field: 'handover.sharedByUserId', type: 'String', sample: '"usr_928192"', desc: 'Internal user ID or GHL ID of the staff member who initiated the handover.' },
  { field: 'handover.sharedByName', type: 'String', sample: '"Akram Mammeri"', desc: 'Full display name of the staff member who clicked "Share with Operations".' },
  { field: 'handover.sharedAt', type: 'ISO 8601 String', sample: '"2026-10-15T02:30:00.000Z"', desc: 'Exact timestamp when the file was handed over to Operations.' },
  { field: 'handover.counsellorName', type: 'String', sample: '"Akram Mammeri"', desc: 'Assigned immigration counsellor / sales consultant handling the account.' },
  { field: 'handover.registeredBranch', type: 'String', sample: '"Dubai HQ"', desc: 'Branch office where the client was registered and contract was closed.' },
  
  { field: 'client.fullName', type: 'String', sample: '"Ahmed Al Mansoor"', desc: 'Primary client full legal name as executed on the contract.' },
  { field: 'client.email', type: 'String', sample: '"ahmed.mansoor@example.com"', desc: 'Client email address.' },
  { field: 'client.phone', type: 'String', sample: '"+971501234567"', desc: 'Client mobile number in international E.164 format.' },
  { field: 'client.nationality', type: 'String', sample: '"Emirati"', desc: 'Client nationality/citizenship from the dossier summary.' },
  { field: 'client.ghlContactId', type: 'String', sample: '"cont_8829103"', desc: 'GoHighLevel CRM Contact ID. Use to update CRM tags or pipeline stages.' },
  { field: 'client.ghlOpportunityId', type: 'String', sample: '"opp_551920"', desc: 'GoHighLevel Deal/Opportunity ID associated with this contract.' },
  { field: 'client.dateOfBirth', type: 'String', sample: '"1985-04-12"', desc: 'Client date of birth from summary records.' },
  { field: 'client.residentialAddress', type: 'String', sample: '"Downtown Dubai, UAE"', desc: 'Full residential address from client dossier.' },
  
  { field: 'contract.id', type: 'Number', sample: '1042', desc: 'Internal primary key ID of the contract in Contract Manager.' },
  { field: 'contract.templateName', type: 'String', sample: '"Cyprus Permanent Residency Agreement"', desc: 'Official legal template title.' },
  { field: 'contract.contractType', type: 'String', sample: '"IMMIGRATION_SERVICES"', desc: 'Contract category classification.' },
  { field: 'contract.state', type: 'String', sample: '"COMPLETED"', desc: 'Contract status (COMPLETED indicates fully signed and certified).' },
  { field: 'contract.signedAt', type: 'ISO 8601 String', sample: '"2026-10-15T02:28:45.000Z"', desc: 'Timestamp when the client completed digital signature.' },
  { field: 'contract.pdfSha256', type: 'String (64 Hex)', sample: '"e3b0c44298fc1c149afbf4c8996fb92427..."', desc: 'Cryptographic SHA-256 tamper-proof hash of the signed contract PDF.' },
  
  { field: 'documents.packageZipUrl', type: 'String (URL)', sample: '"https://services.leadconnectorhq.com/.../Case_Package_1042.zip"', desc: '★ COMPLETE CASE DOSSIER ZIP. Contains signed contract PDF + 9-page Client Summary PDF + all client uploaded supporting files.' },
  { field: 'documents.signedContractPdfUrl', type: 'String (URL)', sample: '"https://services.leadconnectorhq.com/.../contract_1042_signed.pdf"', desc: 'Direct download URL for the finalized, digitally signed PDF agreement.' },
  { field: 'documents.clientSummaryPdfUrl', type: 'String (URL)', sample: '"https://services.leadconnectorhq.com/.../Client_Summary_1042.pdf"', desc: 'Direct download URL for the generated 9-page Client Summary PDF dossier.' },
  { field: 'documents.attachments[]', type: 'Array of Objects', sample: '[{ name: "Passport.pdf", url: "https://...", mimeType: "application/pdf", sizeBytes: 1420500, category: "Identity" }]', desc: 'List of individual client-uploaded supporting documents (identity, financial, proof of address).' },
  { field: 'summaryData', type: 'Object', sample: '{ "marital_status": "Married", "invest_budget": "$350,000", ... }', desc: 'Raw key-value object containing all answers and custom fields captured in the dossier.' }
]

const filteredDataDictionary = computed(() => {
  if (!dictSearchQuery.value) return payloadDataDictionary
  const q = dictSearchQuery.value.toLowerCase().trim()
  return payloadDataDictionary.filter(item => 
    item.field.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q) ||
    item.sample.toLowerCase().includes(q)
  )
})

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
      initialSnapshot.value = JSON.stringify(form.value)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to load settings.'
  } finally {
    loading.value = false
  }
}

async function reloadAll() {
  await Promise.all([loadSettings(), loadCustomSchema()])
  successMsg.value = 'Configuration reloaded from database.'
  setTimeout(() => { successMsg.value = '' }, 2500)
}

async function saveSettings() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = { ...form.value }
    const res = await api.put('/settings', { settings: payload })
    initialSnapshot.value = JSON.stringify(form.value)
    successMsg.value = res.data?.message || 'Settings saved successfully in MySQL!'
    setTimeout(() => { successMsg.value = '' }, 4000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to save settings.'
  } finally {
    saving.value = false
  }
}

// ─── Custom Schema State ──────────────────────────────────────────────────
const customSchema = ref({ sections: [], fields: [] })
const loadingSchema = ref(false)
const savingSchema = ref(false)
const schemaActiveTab = ref('fields')
const showPresetMenu = ref(false)

const showFieldModal = ref(false)
const editingFieldIndex = ref(-1)
const fieldForm = ref({
  id: '',
  label: '',
  key: '',
  type: 'text',
  section: 'page1',
  required: false,
  fullWidth: false,
  placeholder: '',
  optionsText: '',
})

const showSectionModal = ref(false)
const editingSectionIndex = ref(-1)
const sectionForm = ref({
  id: '',
  title: '',
  description: '',
  order: 1,
})

const standardSectionOptions = [
  { id: 'page1', label: 'Page 1: General Info' },
  { id: 'page2', label: 'Page 2: Immigration History' },
  { id: 'page3', label: 'Page 3: Business Background' },
  { id: 'page4', label: 'Page 4: Employment Background' },
  { id: 'page5', label: 'Page 5: Personal & Family' },
  { id: 'page6', label: 'Page 6: Academic Background' },
  { id: 'page7', label: 'Page 7: Financials' },
  { id: 'page8', label: 'Page 8: Action Plan & Declaration' },
]

function getSectionDisplayLabel(sectionId) {
  const std = standardSectionOptions.find(s => s.id === sectionId)
  if (std) return std.label
  const custom = (customSchema.value.sections || []).find(s => s.id === sectionId)
  if (custom) return `Custom: ${custom.title}`
  return sectionId
}

function getFieldsCountForSection(sectionId) {
  return (customSchema.value.fields || []).filter(f => f.section === sectionId).length
}

function formatFieldType(t) {
  const map = {
    text: 'Single Text',
    textarea: 'Paragraph',
    number: 'Number',
    date: 'Date',
    dropdown: 'Dropdown',
    yes_no: 'Yes / No',
    checkbox: 'Checkbox',
  }
  return map[t] || t
}

function onFieldLabelInput() {
  if (editingFieldIndex.value < 0 && fieldForm.value.label) {
    fieldForm.value.key = fieldForm.value.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }
}

async function loadCustomSchema() {
  loadingSchema.value = true
  try {
    const res = await api.get('/client-summary/schema')
    if (res.data?.schema) {
      customSchema.value = {
        sections: Array.isArray(res.data.schema.sections) ? res.data.schema.sections : [],
        fields: Array.isArray(res.data.schema.fields) ? res.data.schema.fields : [],
      }
    }
  } catch (err) {
    console.warn('Could not load custom schema:', err.message)
  } finally {
    loadingSchema.value = false
  }
}

async function saveCustomSchema(notify = true) {
  savingSchema.value = true
  try {
    await api.put('/client-summary/schema', { schema: customSchema.value })
    if (notify) {
      successMsg.value = 'Dossier schema saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 3500)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to save schema.'
  } finally {
    savingSchema.value = false
  }
}

function saveCustomSchemaManual() {
  saveCustomSchema(true)
}

function openAddFieldModal() {
  editingFieldIndex.value = -1
  fieldForm.value = {
    id: `fld_${Date.now()}`,
    label: '',
    key: '',
    type: 'text',
    section: customSchema.value.sections?.[0]?.id || 'page1',
    required: false,
    fullWidth: false,
    placeholder: '',
    optionsText: '',
  }
  showFieldModal.value = true
}

function openEditFieldModal(fld, idx) {
  editingFieldIndex.value = idx
  fieldForm.value = {
    id: fld.id || `fld_${Date.now()}`,
    label: fld.label || '',
    key: fld.key || '',
    type: fld.type || 'text',
    section: fld.section || 'page1',
    required: Boolean(fld.required),
    fullWidth: Boolean(fld.fullWidth),
    placeholder: fld.placeholder || '',
    optionsText: Array.isArray(fld.options) ? fld.options.join(', ') : '',
  }
  showFieldModal.value = true
}

async function submitFieldModal() {
  const cleanKey = fieldForm.value.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
  if (!cleanKey || !fieldForm.value.label.trim()) return

  const options = fieldForm.value.type === 'dropdown'
    ? fieldForm.value.optionsText.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const fieldData = {
    id: fieldForm.value.id || `fld_${Date.now()}`,
    label: fieldForm.value.label.trim(),
    key: cleanKey,
    type: fieldForm.value.type,
    section: fieldForm.value.section,
    required: fieldForm.value.required,
    fullWidth: fieldForm.value.fullWidth,
    placeholder: fieldForm.value.placeholder.trim(),
    options,
  }

  if (editingFieldIndex.value >= 0) {
    customSchema.value.fields[editingFieldIndex.value] = fieldData
  } else {
    customSchema.value.fields.push(fieldData)
  }

  showFieldModal.value = false
  await saveCustomSchema(true)
}

async function deleteField(idx) {
  if (!confirm(`Delete field "${customSchema.value.fields[idx]?.label}"?`)) return
  customSchema.value.fields.splice(idx, 1)
  await saveCustomSchema(true)
}

function openAddSectionModal() {
  editingSectionIndex.value = -1
  sectionForm.value = {
    id: `sec_${Date.now()}`,
    title: '',
    description: '',
    order: (customSchema.value.sections?.length || 0) + 1,
  }
  showSectionModal.value = true
}

function openEditSectionModal(sec, idx) {
  editingSectionIndex.value = idx
  sectionForm.value = {
    id: sec.id || `sec_${Date.now()}`,
    title: sec.title || '',
    description: sec.description || '',
    order: sec.order || idx + 1,
  }
  showSectionModal.value = true
}

async function submitSectionModal() {
  if (!sectionForm.value.title.trim()) return

  const sectionData = {
    id: sectionForm.value.id || `sec_${Date.now()}`,
    title: sectionForm.value.title.trim(),
    description: sectionForm.value.description.trim(),
    order: Number(sectionForm.value.order || (customSchema.value.sections?.length || 0) + 1),
  }

  if (editingSectionIndex.value >= 0) {
    customSchema.value.sections[editingSectionIndex.value] = sectionData
  } else {
    customSchema.value.sections.push(sectionData)
  }

  customSchema.value.sections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  customSchema.value.sections.forEach((s, i) => { s.order = i + 1 })

  showSectionModal.value = false
  schemaActiveTab.value = 'sections'
  await saveCustomSchema(true)
}

async function moveSection(idx, delta) {
  const targetIdx = idx + delta
  if (targetIdx < 0 || targetIdx >= customSchema.value.sections.length) return
  const temp = customSchema.value.sections[idx]
  customSchema.value.sections[idx] = customSchema.value.sections[targetIdx]
  customSchema.value.sections[targetIdx] = temp
  customSchema.value.sections.forEach((s, i) => { s.order = i + 1 })
  await saveCustomSchema(true)
}

async function moveField(idx, delta) {
  const targetIdx = idx + delta
  if (targetIdx < 0 || targetIdx >= customSchema.value.fields.length) return
  const temp = customSchema.value.fields[idx]
  customSchema.value.fields[idx] = customSchema.value.fields[targetIdx]
  customSchema.value.fields[targetIdx] = temp
  await saveCustomSchema(true)
}

async function deleteSection(idx) {
  const sec = customSchema.value.sections[idx]
  if (!confirm(`Delete section "${sec?.title}"? Fields in this section will be reassigned to Page 1.`)) return
  customSchema.value.fields.forEach(f => {
    if (f.section === sec.id) f.section = 'page1'
  })
  customSchema.value.sections.splice(idx, 1)
  await saveCustomSchema(true)
}

async function applyPreset(type) {
  showPresetMenu.value = false
  if (type === 'medical') {
    const secId = `sec_med_${Date.now()}`
    customSchema.value.sections.push({
      id: secId,
      title: 'Medical & Health Clearance',
      description: 'Official clinical screening and vaccination compliance',
      order: customSchema.value.sections.length + 1,
    })
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_1`, key: 'medical_exam_completed', label: 'Medical Exam Completed', type: 'yes_no', section: secId, required: true },
      { id: `fld_${Date.now()}_2`, key: 'medical_clinic_name', label: 'Approved Clinical Center', type: 'text', section: secId, placeholder: 'e.g. MedCare Clinic Dubai' }
    )
    schemaActiveTab.value = 'sections'
  } else if (type === 'guarantor') {
    const secId = `sec_guar_${Date.now()}`
    customSchema.value.sections.push({
      id: secId,
      title: 'Secondary Sponsor & Guarantor',
      description: 'Co-sponsor financial support guarantee',
      order: customSchema.value.sections.length + 1,
    })
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_3`, key: 'guarantor_full_name', label: 'Guarantor Full Name', type: 'text', section: secId, required: true }
    )
    schemaActiveTab.value = 'sections'
  } else if (type === 'identity') {
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_4`, key: 'national_id_number', label: 'National ID / Emirates ID Number', type: 'text', section: 'page1', placeholder: '784-XXXX-XXXXXXX-X' }
    )
    schemaActiveTab.value = 'fields'
  }
  await saveCustomSchema(true)
}

onMounted(() => {
  loadSettings()
  loadCustomSchema()
})
</script>

<style scoped>
/* ─── ENFORCE PURE INTER & OUTFIT TYPOGRAPHY ─────────────────────────── */
.settings-root,
.settings-root * {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  box-sizing: border-box;
}

.code-font,
.code-font * {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}

/* ─── CONTAINER ──────────────────────────────────────────────────────── */
.settings-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 18px 24px 80px;
  color: #0f172a;
}

/* ─── TOAST NOTIFICATIONS ────────────────────────────────────────────── */
.toast-card {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 10px;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-size: 13px;
  min-width: 280px;
  max-width: 420px;
  border: 1px solid;
}

.toast-card-success { background: #f0fdf4; border-color: #86efac; color: #166534; }
.toast-card-error { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
.toast-card-info { background: #f0f9ff; border-color: #7dd3fc; color: #075985; }

.toast-svg { width: 18px; height: 18px; flex-shrink: 0; }
.toast-content { flex: 1; }
.toast-head { font-weight: 700; font-size: 13px; }
.toast-text { font-size: 11.5px; opacity: 0.9; margin-top: 1px; }

.toast-dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 13px;
  opacity: 0.6;
}
.toast-dismiss:hover { opacity: 1; }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ─── TOP HEADER ─────────────────────────────────────────────────────── */
.settings-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.header-left-cluster {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-square {
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

.header-title-flex {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-main-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.015em;
}

.mysql-sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.pulse-beacon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.header-sub-text {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: #64748b;
}

.header-right-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dirty-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #16a34a;
}
.dirty-status-tag.dirty {
  color: #d97706;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
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

.btn-hdr:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spin-active {
  animation: rotate-inf 1s linear infinite;
  display: inline-block;
}
@keyframes rotate-inf {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── TWO-COLUMN WORKSPACE ─────────────────────────────────────────── */
.settings-workspace-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

@media (max-width: 960px) {
  .settings-workspace-layout {
    flex-direction: column;
  }
}

/* ─── SIDEBAR NAVIGATION ─────────────────────────────────────────────── */
.settings-sidebar-nav {
  width: 260px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

@media (max-width: 960px) {
  .settings-sidebar-nav {
    width: 100%;
  }
}

.sidebar-nav-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 6px 10px 8px;
}

.sidebar-nav-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

@media (max-width: 960px) {
  .sidebar-nav-list {
    flex-direction: row;
    overflow-x: auto;
  }
}

.nav-tab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #334155;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.15s ease;
  position: relative;
}

.nav-tab-item:hover {
  background: #f8fafc;
  color: #0f172a;
}

.nav-tab-item.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.tab-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-ghl { background: #fef3c7; color: #d97706; }
.icon-webhooks { background: #f3e8ff; color: #7e22ce; }
.icon-signing { background: #e0f2fe; color: #0284c7; }
.icon-branding { background: #dcfce7; color: #16a34a; }
.icon-schema { background: #e0e7ff; color: #4338ca; }
.icon-access { background: #f1f5f9; color: #475569; }
.icon-workers { background: #f1f5f9; color: #475569; }

.tab-label-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-desc {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-tab-item.active .tab-desc {
  color: #3b82f6;
}

.tab-micro-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #475569;
}

.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }

/* ─── CONTENT PANE ───────────────────────────────────────────────────── */
.settings-content-pane {
  flex: 1;
  min-width: 0;
}

.pane-loading-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
}

.pane-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: rotate-inf 0.8s linear infinite;
}

.pane-loading-text {
  font-size: 13px;
  color: #64748b;
}

/* ─── MODULE CARD ────────────────────────────────────────────────────── */
.module-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.module-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.module-desc {
  font-size: 12.5px;
  color: #64748b;
  margin: 3px 0 0;
  line-height: 1.4;
}

.module-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.tag-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.tag-emerald { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.tag-purple { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }

/* ─── FORM GRID & INPUT CONTROLS ─────────────────────────────────────── */
.form-layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

@media (max-width: 720px) {
  .form-layout-grid {
    grid-template-columns: 1fr;
  }
}

.span-full {
  grid-column: 1 / -1;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 5px;
}

.label-pill {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.input-icon-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-leading-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.clean-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  transition: all 0.15s ease;
}

.clean-input.with-lead {
  padding-left: 32px;
}

.clean-input.with-trail {
  padding-right: 36px;
}

.clean-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.clean-select {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  cursor: pointer;
}

.clean-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.input-trailing-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.input-trailing-btn:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.field-sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  gap: 8px;
}

.field-explanation {
  font-size: 11px;
  color: #64748b;
}

.field-explanation code {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
  color: #1e40af;
  font-size: 11px;
}

.btn-copy-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.btn-copy-link:hover {
  text-decoration: underline;
}

.module-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-save-inline {
  padding: 8px 16px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-inline:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-save-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ─── WEBHOOK SUBTABS ────────────────────────────────────────────────── */
.sub-tab-pill-group {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.sub-pill {
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.sub-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.subtab-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inline-action-input {
  display: flex;
  gap: 8px;
}

.btn-trigger-ping {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  background: #7c3aed;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-trigger-ping:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-blue-action {
  background: #0284c7;
}
.btn-blue-action:hover:not(:disabled) {
  background: #0369a1;
}

.ping-banner {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 12px;
}

.ping-success { background: #f0fdf4; border-color: #86efac; color: #166534; }
.ping-error { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }

.ping-banner-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.ping-http-code {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

.ping-ms {
  font-size: 11px;
  opacity: 0.8;
}

.ping-detail-text {
  margin-top: 4px;
  font-family: monospace;
  font-size: 11px;
}

.ping-response-box {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.ping-error .ping-response-box {
  background: #ffffff;
  border-color: #fecaca;
}
.ping-success .ping-response-box {
  background: #ffffff;
  border-color: #bbf7d0;
}
.ping-response-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 0.85;
}
.ping-response-code {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  color: #0f172a;
  max-height: 180px;
  overflow-y: auto;
}

.code-terminal-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 6px;
}

.terminal-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.terminal-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.btn-terminal-copy {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}
.btn-terminal-copy:hover {
  background: rgba(255, 255, 255, 0.2);
}

.terminal-body {
  margin: 0;
  padding: 12px;
  color: #38bdf8;
  font-size: 11.5px;
  max-height: 240px;
  overflow-y: auto;
  line-height: 1.45;
}

.terminal-btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.platform-quick-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 10px;
}
.quick-bar-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #475569;
}
.quick-bar-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.quick-brand-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}
.quick-brand-btn:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
  transform: translateY(-1px);
}

.cheat-sheet-box {
  margin-top: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}
.cheat-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 6px;
}
.cheat-sheet-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}
.cheat-sheet-hint {
  font-size: 11px;
  color: #64748b;
}
.cheat-sheet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}
.cheat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cheat-card:hover {
  border-color: #38bdf8;
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.15);
  transform: translateY(-1px);
}
.cheat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cheat-card-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-zip { background: #e0e7ff; color: #4338ca; }
.badge-pdf { background: #fee2e2; color: #b91c1c; }
.badge-summary { background: #e0f2fe; color: #0369a1; }
.badge-client { background: #fef3c7; color: #b45309; }
.cheat-copy-tag {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}
.cheat-card:hover .cheat-copy-tag {
  color: #0284c7;
}
.cheat-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  font-weight: 600;
  color: #0f172a;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  word-break: break-all;
}
.cheat-desc {
  font-size: 10.5px;
  color: #64748b;
  line-height: 1.35;
}

.flow-diagram-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 10px;
  margin-bottom: 12px;
  overflow-x: auto;
  flex-wrap: wrap;
}
.flow-step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
}
.flow-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 50%;
}
.flow-arrow {
  color: #94a3b8;
  font-weight: 700;
  font-size: 13px;
}

.inbound-helper-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.inbound-helper-header {
  font-size: 11.5px;
  color: #166534;
  margin-bottom: 6px;
}
.inbound-headers-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.header-chip {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.header-name {
  font-weight: 600;
  color: #15803d;
}
.header-val {
  background: #fff;
  border: 1px solid #86efac;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #14532d;
}
.doc-jump-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 14px;
  gap: 12px;
  flex-wrap: wrap;
}
.doc-jump-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}
.doc-jump-sub {
  font-size: 11px;
  color: #64748b;
}
.btn-jump {
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-jump:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.platform-nav-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
  margin-bottom: 16px;
}
.platform-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}
.platform-nav-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}
.platform-nav-btn.active {
  background: #1e293b;
  color: #fff;
  border-color: #0f172a;
}
.platform-doc-container {
  animation: fadeIn 0.2s ease-in-out;
}
.platform-doc-header {
  margin-bottom: 14px;
}
.platform-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.badge-make { background: #ede9fe; color: #6d28d9; }
.badge-zapier { background: #ffedd5; color: #c2410c; }
.badge-n8n { background: #ffe4e6; color: #be123c; }
.badge-slack { background: #e0e7ff; color: #3730a3; }
.badge-ghl { background: #dcfce7; color: #15803d; }
.badge-sec { background: #f1f5f9; color: #334155; }
.badge-dict { background: #e0f2fe; color: #0369a1; }
.platform-heading {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}
.platform-sub {
  font-size: 12px;
  color: #64748b;
  line-height: 1.45;
  margin: 0;
}
.guide-steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.guide-step-card {
  display: flex;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s ease;
}
.guide-step-card:hover {
  border-color: #cbd5e1;
}
.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: #1e293b;
  background: #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
  height: fit-content;
  white-space: nowrap;
}
.step-body {
  flex: 1;
}
.step-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}
.step-text {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.45;
  margin: 0 0 6px;
}
.step-action-row {
  margin-top: 6px;
}
.btn-inline-action {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  padding: 3px 10px;
  cursor: pointer;
}
.btn-inline-action:hover {
  background: #dbeafe;
}
.code-pill-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}
.code-pill-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.code-pill-item:hover {
  border-color: #38bdf8;
}
.code-pill-item code {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #0284c7;
  background: #f0f9ff;
  padding: 2px 5px;
  border-radius: 4px;
}
.code-pill-item .pill-label {
  font-size: 10.5px;
  color: #64748b;
}
.clean-bullet-list {
  margin: 4px 0;
  padding-left: 18px;
  font-size: 11.5px;
  color: #334155;
  line-height: 1.5;
}
.code-terminal-card.mini {
  margin-top: 8px;
}
.code-terminal-card.mini .terminal-body {
  max-height: 130px;
  font-size: 11px;
}
.dict-filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.dict-search-input {
  flex: 1;
  font-size: 12px;
}
.dict-count-pill {
  font-size: 11px;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.field-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}
.field-ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  text-align: left;
}
.field-ref-table th {
  background: #f8fafc;
  padding: 8px 12px;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.field-ref-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
  line-height: 1.4;
}
.field-ref-table tbody tr:hover {
  background: #f8fafc;
}
.col-path code.clickable-code {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #0f172a;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-block;
}
.col-path code.clickable-code:hover {
  background: #e0f2fe;
  color: #0369a1;
}
.type-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.col-sample code {
  font-family: monospace;
  font-size: 10.5px;
  color: #0369a1;
  word-break: break-all;
}
.col-desc {
  color: #334155;
  font-size: 11px;
}

/* ─── BRANDING SIDE BY SIDE ─────────────────────────────────────────── */
.branding-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

@media (max-width: 820px) {
  .branding-side-by-side { grid-template-columns: 1fr; }
}

.asset-card-unit {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}

.asset-card-top {
  margin-bottom: 12px;
}

.asset-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-svg-icon {
  color: #16a34a;
}

.asset-unit-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.asset-unit-sub {
  font-size: 11.5px;
  color: #64748b;
  margin: 1px 0 0;
}

.asset-upload-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-file-pick {
  padding: 0 12px;
  height: 38px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
}
.btn-file-pick:hover:not(:disabled) {
  background: #f1f5f9;
}

.paper-preview-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 12px 12px;
}

.preview-active-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stamp-preview-img {
  max-height: 75px;
  max-width: 140px;
  object-fit: contain;
  transform: rotate(-5deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}

.sig-preview-img {
  max-height: 50px;
  max-width: 160px;
  object-fit: contain;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08));
}

.preview-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  color: #166534;
  background: #f0fdf4;
  padding: 1px 6px;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
  margin-top: 8px;
}

.dot-live {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
}

.preview-blank-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.asset-remove-row {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.btn-asset-delete {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  padding: 0;
}
.btn-asset-delete:hover {
  text-decoration: underline;
}

/* ─── SCHEMA CUSTOMIZER ──────────────────────────────────────────────── */
.schema-btn-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-menu-wrap {
  position: relative;
}

.preset-popover {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 50;
  min-width: 280px;
}

.preset-choice {
  width: 100%;
  text-align: left;
  padding: 6px 10px;
  background: transparent;
  border: none;
  font-size: 11.5px;
  color: #334155;
  border-radius: 4px;
  cursor: pointer;
}
.preset-choice:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.btn-tool {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-tool-ghost {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}
.btn-tool-ghost:hover {
  background: #f1f5f9;
}

.btn-tool-solid {
  background: #2563eb;
  color: #ffffff;
}
.btn-tool-solid:hover {
  background: #1d4ed8;
}

.schema-sub-tabs {
  display: flex;
  gap: 6px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.schema-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.schema-tab-btn.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.count-tag {
  font-size: 10px;
  background: #e2e8f0;
  color: #475569;
  padding: 1px 5px;
  border-radius: 8px;
}

.schema-tab-btn.active .count-tag {
  background: #2563eb;
  color: #ffffff;
}

.empty-table-note {
  text-align: center;
  padding: 30px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 12.5px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.table-border-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.data-table thead th {
  background: #f8fafc;
  padding: 9px 12px;
  font-weight: 700;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.row-main-text {
  font-weight: 600;
  color: #0f172a;
}

.row-sub-text {
  font-size: 10.5px;
  color: #94a3b8;
}

.code-badge {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  color: #0369a1;
  font-family: monospace;
  font-size: 11px;
}

.type-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10.5px;
}

.section-label-text {
  color: #475569;
}

.req-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.tag-req { background: #fee2e2; color: #b91c1c; }
.tag-opt { background: #f1f5f9; color: #64748b; }

.row-actions {
  display: inline-flex;
  gap: 3px;
}

.btn-act {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 10.5px;
  cursor: pointer;
}
.btn-act:hover:not(:disabled) {
  background: #e2e8f0;
}
.btn-act:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-act-del:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.order-reorder-flex {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.order-num {
  font-size: 11px;
  font-weight: 700;
  color: #1e40af;
  background: #dbeafe;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: monospace;
}

.row-desc-cell {
  color: #64748b;
  font-size: 11.5px;
}

.count-pill-gray {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 10.5px;
}

/* ─── STICKY SAVE DOCK ───────────────────────────────────────────────── */
.sticky-save-dock {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: calc(100% - 40px);
  max-width: 680px;
}

.save-dock-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px 18px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  gap: 12px;
}

.dock-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dock-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
}

.dock-title {
  font-size: 12.5px;
  font-weight: 700;
  display: block;
}

.dock-sub {
  font-size: 11px;
  color: #94a3b8;
}

.dock-buttons {
  display: flex;
  gap: 8px;
}

.btn-dock-cancel {
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-dock-commit {
  background: #2563eb;
  border: none;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* ─── MODAL ──────────────────────────────────────────────────────────── */
.modal-layer {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.18);
  padding: 20px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title-text {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.modal-x {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
}

.modal-body-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.modal-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-label-text {
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  display: block;
  margin-bottom: 4px;
}

.req-star {
  color: #dc2626;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
</style>
