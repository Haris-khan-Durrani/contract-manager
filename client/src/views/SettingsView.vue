<template>
  <div class="settings-view">
    <!-- ─── FLOATING TOAST NOTIFICATIONS ──────────────────────────────── -->
    <transition name="toast-slide">
      <div v-if="successMsg" class="floating-toast toast-success">
        <div class="toast-icon">✅</div>
        <div class="toast-body">
          <div class="toast-title">Settings Saved</div>
          <div class="toast-msg">{{ successMsg }}</div>
        </div>
        <button type="button" class="toast-close" @click="successMsg = ''">✕</button>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="errorMsg" class="floating-toast toast-error">
        <div class="toast-icon">⚠️</div>
        <div class="toast-body">
          <div class="toast-title">Configuration Notice</div>
          <div class="toast-msg">{{ errorMsg }}</div>
        </div>
        <button type="button" class="toast-close" @click="errorMsg = ''">✕</button>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="copyToast" class="floating-toast toast-info">
        <div class="toast-icon">📋</div>
        <div class="toast-body">
          <div class="toast-title">Copied to Clipboard</div>
          <div class="toast-msg">{{ copyToast }}</div>
        </div>
        <button type="button" class="toast-close" @click="copyToast = ''">✕</button>
      </div>
    </transition>

    <!-- ─── EXECUTIVE HEADER BANNER ──────────────────────────────────── -->
    <div class="settings-header-card">
      <div class="header-main-col">
        <div class="header-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <div>
          <div class="header-badge-row">
            <h1 class="header-heading">System &amp; Integration Settings</h1>
            <div class="status-pill-badge live-sync" title="Real-time live persistence in MySQL">
              <span class="live-dot"></span>
              <span>Live MySQL Sync</span>
            </div>
            <span class="version-tag">ContractOS v2.5</span>
          </div>
          <p class="header-caption">
            Manage GoHighLevel CRM integration, automated outbound webhooks, official document branding, and enterprise security policies.
          </p>
        </div>
      </div>

      <div class="header-actions-col">
        <div class="dirty-state-badge" :class="{ 'is-unsaved': isFormDirty }">
          <span class="state-bullet">{{ isFormDirty ? '●' : '✓' }}</span>
          <span>{{ isFormDirty ? 'Unsaved changes pending' : 'All settings synchronized' }}</span>
        </div>

        <div class="header-button-group">
          <button 
            type="button" 
            class="btn-header btn-header-secondary" 
            :disabled="loading || saving" 
            @click="reloadAll"
            title="Reload settings from MySQL database"
          >
            <svg class="icon-refresh" :class="{ 'spin-infinite': loading }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.19" />
            </svg>
            <span>Refresh</span>
          </button>

          <button 
            type="button" 
            class="btn-header btn-header-primary" 
            :disabled="saving || loading" 
            @click="saveSettings"
          >
            <span v-if="saving" class="spin-infinite">⏳</span>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{{ saving ? 'Saving Changes…' : 'Save Settings' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── CATEGORY NAVIGATION TABS & FILTER ────────────────────────── -->
    <div class="settings-nav-bar">
      <div class="category-tabs-scroll">
        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          type="button"
          class="category-nav-tab" 
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-label">{{ cat.label }}</span>
          <span v-if="cat.badge" class="cat-pill">{{ cat.badge }}</span>
        </button>
      </div>

      <div class="search-filter-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          v-model="searchFilter" 
          type="text" 
          placeholder="Filter settings…" 
          class="search-filter-input"
        />
        <button v-if="searchFilter" type="button" class="btn-clear-search" @click="searchFilter = ''">✕</button>
      </div>
    </div>

    <!-- ─── LOADING STATE SKELETON ───────────────────────────────────── -->
    <div v-if="loading" class="settings-loading-card">
      <div class="loading-spinner"></div>
      <div style="font-weight: 600; font-size: 15px; color: #1e293b; margin-top: 14px;">Loading System Configuration…</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Fetching encrypted settings and schema definitions from MySQL database</div>
    </div>

    <!-- ─── SETTINGS CONTENT CARDS ───────────────────────────────────── -->
    <div v-else class="settings-content-stack">
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 1. GOHIGHLEVEL CREDENTIALS CARD                                 -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('ghl')" 
        class="executive-card" 
        :class="{ 'card-highlight': matchesSearch('ghl leadconnector private token secret marketplace api') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-amber">⚡</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">GoHighLevel API &amp; Webhook Credentials</h2>
                <span class="badge-chip chip-amber">LeadConnector v2</span>
              </div>
              <p class="card-subtitle">
                Configure your GHL marketplace shared secret, sub-account Private Integration Token (PIT), and webhook auth headers.
              </p>
            </div>
          </div>
          <span class="card-status-badge badge-active">CRM Backbone</span>
        </div>

        <div class="card-form-grid grid-2">
          <!-- GHL Shared Secret -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">GHL Marketplace Shared Secret</span>
              <span class="meta-tag tag-blue">Context JWT</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🔑</span>
              <input 
                v-model="form.GHL_SHARED_SECRET" 
                :type="showSecret.GHL_SHARED_SECRET ? 'text' : 'password'" 
                class="modern-text-input with-prefix with-suffix" 
                placeholder="Enter GHL Marketplace Shared Secret" 
              />
              <button 
                type="button" 
                class="input-suffix-action" 
                @click="toggleShow('GHL_SHARED_SECRET')"
                :title="showSecret.GHL_SHARED_SECRET ? 'Hide Secret' : 'Reveal Secret'"
              >
                {{ showSecret.GHL_SHARED_SECRET ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
            <div class="field-meta-row">
              <span class="field-hint">Configured in GHL Marketplace Developer Portal &rarr; App Credentials</span>
              <button type="button" class="btn-micro-copy" @click="copyToClipboard(form.GHL_SHARED_SECRET, 'Shared Secret')">Copy</button>
            </div>
          </div>

          <!-- GHL Private Integration Token -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">GHL Private Integration Token (PIT)</span>
              <span class="meta-tag tag-emerald">Backend REST API</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🔒</span>
              <input 
                v-model="form.GHL_PRIVATE_INTEGRATION_TOKEN" 
                :type="showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'text' : 'password'" 
                class="modern-text-input with-prefix with-suffix" 
                placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
              />
              <button 
                type="button" 
                class="input-suffix-action" 
                @click="toggleShow('GHL_PRIVATE_INTEGRATION_TOKEN')"
                :title="showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'Hide Token' : 'Reveal Token'"
              >
                {{ showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
            <div class="field-meta-row">
              <span class="field-hint">Found in Sub-Account Settings &rarr; Developers &rarr; Private Integrations</span>
              <button type="button" class="btn-micro-copy" @click="copyToClipboard(form.GHL_PRIVATE_INTEGRATION_TOKEN, 'Private Token')">Copy</button>
            </div>
          </div>

          <!-- Webhook Ingestion Secret -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Inbound Webhook Authentication Secret</span>
              <span class="meta-tag tag-purple">Bearer Header</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🛡️</span>
              <input 
                v-model="form.GHL_WEBHOOK_SECRET" 
                :type="showSecret.GHL_WEBHOOK_SECRET ? 'text' : 'password'" 
                class="modern-text-input with-prefix with-suffix" 
                placeholder="Enter Webhook Auth Secret" 
              />
              <button 
                type="button" 
                class="input-suffix-action" 
                @click="toggleShow('GHL_WEBHOOK_SECRET')"
                :title="showSecret.GHL_WEBHOOK_SECRET ? 'Hide Secret' : 'Reveal Secret'"
              >
                {{ showSecret.GHL_WEBHOOK_SECRET ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
            <div class="field-meta-row">
              <span class="field-hint">Send in GHL Workflow header: <code>Authorization: Bearer &lt;secret&gt;</code></span>
              <button type="button" class="btn-micro-copy" @click="copyToClipboard(form.GHL_WEBHOOK_SECRET, 'Webhook Secret')">Copy</button>
            </div>
          </div>

          <!-- GHL API Version -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">GoHighLevel API Version</span>
              <span class="meta-tag tag-slate">Header: Version</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">📅</span>
              <input 
                v-model="form.GHL_API_VERSION" 
                type="text" 
                class="modern-text-input with-prefix" 
                placeholder="2021-07-28" 
              />
            </div>
            <div class="field-meta-row">
              <span class="field-hint">Standard LeadConnector API Version (Default: <code>2021-07-28</code>)</span>
            </div>
          </div>

          <!-- GHL API Base URL -->
          <div class="form-field-group grid-span-2">
            <label class="modern-label">
              <span class="label-text">GoHighLevel API Base Endpoint</span>
              <span class="meta-tag tag-blue">LeadConnector Gateway</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🌐</span>
              <input 
                v-model="form.GHL_API_BASE_URL" 
                type="text" 
                class="modern-text-input with-prefix" 
                placeholder="https://services.leadconnectorhq.com" 
              />
            </div>
            <div class="field-meta-row">
              <span class="field-hint">Primary API endpoint for Contacts, Opportunities, Custom Fields, Conversations, and Media Uploads</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 2. APPLICATION & SIGNING URL CARD                               -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('signing')" 
        class="executive-card"
        :class="{ 'card-highlight': matchesSearch('signing base url domain public sign verify portal') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-blue">🌐</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">Public Signing &amp; Verification URLs</h2>
                <span class="badge-chip chip-blue">Signer Portal</span>
              </div>
              <p class="card-subtitle">
                Controls the external domain and protocol embedded into SMS invitations, email dispatches, and QR code stamps.
              </p>
            </div>
          </div>
          <span class="card-status-badge badge-active">Live Domain</span>
        </div>

        <div class="card-form-grid">
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Public Signing Base URL</span>
              <span class="meta-tag tag-emerald">External FQDN</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🔗</span>
              <input 
                v-model="form.SIGNING_BASE_URL" 
                type="text" 
                class="modern-text-input with-prefix" 
                placeholder="https://contract.onesol.ae" 
              />
              <button 
                type="button" 
                class="input-suffix-action btn-copy-inline" 
                @click="copyToClipboard(form.SIGNING_BASE_URL, 'Signing Base URL')"
                title="Copy Signing URL"
              >
                📋 Copy
              </button>
            </div>
            <div class="url-preview-pill">
              <span class="preview-icon">👁️</span>
              <span class="preview-text">
                Live link format sent to signers: <code>{{ form.SIGNING_BASE_URL || 'https://contract.onesol.ae' }}/sign/&lt;secure_token&gt;</code>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 3. WEBHOOKS & INTEGRATION HUB CARD                              -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('webhooks')" 
        class="executive-card webhook-card-accent"
        :class="{ 'card-highlight': matchesSearch('webhook operations make zapier n8n inbound outbound signature hmac') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-purple">🔌</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">Webhooks &amp; Integration Hub</h2>
                <span class="badge-chip chip-purple">Operations &amp; Automation</span>
              </div>
              <p class="card-subtitle">
                Connect inbound GHL deal triggers and automated outbound handoffs to Make.com, Zapier, n8n, Slack, or internal Operations ERP.
              </p>
            </div>
          </div>

          <!-- Webhook Sub-Tabs -->
          <div class="webhook-segmented-control">
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: webhookTab === 'operations' }"
              @click="webhookTab = 'operations'"
            >
              🚀 Outbound (Operations)
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: webhookTab === 'inbound' }"
              @click="webhookTab = 'inbound'"
            >
              📥 Inbound (GHL Trigger)
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              :class="{ active: webhookTab === 'docs' }"
              @click="webhookTab = 'docs'"
            >
              📖 Docs &amp; Setup Guide
            </button>
          </div>
        </div>

        <!-- 3.1 SUBTAB: OUTBOUND OPERATIONS WEBHOOK -->
        <div v-if="webhookTab === 'operations'" class="webhook-panel-body">
          <div class="webhook-config-banner">
            <div class="form-field-group">
              <label class="modern-label">
                <span class="label-text">Operations Webhook Destination URL</span>
                <span class="meta-tag tag-blue">HTTP POST</span>
              </label>
              <div class="webhook-input-action-row">
                <div class="modern-input-box" style="flex: 1;">
                  <span class="input-prefix-icon">🎯</span>
                  <input 
                    v-model="form.OPERATIONS_WEBHOOK_URL" 
                    type="text" 
                    class="modern-text-input with-prefix" 
                    placeholder="https://hook.eu1.make.com/... or https://hooks.zapier.com/... or https://n8n.onesol.ae/webhook/ops" 
                  />
                </div>
                <button 
                  type="button" 
                  class="btn-ping-action" 
                  :disabled="testingWebhook || !form.OPERATIONS_WEBHOOK_URL"
                  @click="testOperationsWebhook"
                >
                  <span v-if="testingWebhook" class="spin-infinite">⏳</span>
                  <span v-else>⚡</span>
                  <span>{{ testingWebhook ? 'Pinging Webhook…' : 'Test Webhook Ping' }}</span>
                </button>
              </div>
              <span class="field-hint" style="margin-top: 6px;">
                When staff marks a Client Summary as completed or clicks <strong>"Share with Operations"</strong>, the complete dossier, signed legal agreement, 9-page summary PDF, and all attachments will be delivered here.
              </span>
            </div>

            <!-- Ping Result Box -->
            <transition name="fade">
              <div v-if="testWebhookResult" class="ping-result-card" :class="testWebhookResult.success ? 'ping-success' : 'ping-failed'">
                <div class="ping-status-header">
                  <div class="ping-title">
                    <span class="ping-icon">{{ testWebhookResult.success ? '✅' : '⚠️' }}</span>
                    <span>{{ testWebhookResult.success ? 'Webhook Delivered Successfully' : 'Webhook Delivery Failed' }}</span>
                  </div>
                  <div class="ping-metrics">
                    <span v-if="testWebhookResult.status" class="status-code-tag">HTTP {{ testWebhookResult.status }}</span>
                    <span v-if="testWebhookResult.durationMs" class="latency-tag">{{ testWebhookResult.durationMs }}ms</span>
                  </div>
                </div>
                <div class="ping-message-detail">
                  {{ testWebhookResult.message || testWebhookResult.error }}
                </div>
              </div>
            </transition>

            <!-- HMAC Signing Secret -->
            <div class="form-field-group" style="margin-top: 14px;">
              <label class="modern-label">
                <span class="label-text">HMAC-SHA256 Signing Secret Key</span>
                <span class="meta-tag tag-emerald">Header: X-Webhook-Signature</span>
              </label>
              <div class="modern-input-box">
                <span class="input-prefix-icon">🔐</span>
                <input 
                  v-model="form.OPERATIONS_WEBHOOK_SECRET" 
                  :type="showSecret.OPERATIONS_WEBHOOK_SECRET ? 'text' : 'password'" 
                  class="modern-text-input with-prefix with-suffix" 
                  placeholder="Enter secret key for HMAC signature verification" 
                />
                <button 
                  type="button" 
                  class="input-suffix-action" 
                  @click="toggleShow('OPERATIONS_WEBHOOK_SECRET')"
                >
                  {{ showSecret.OPERATIONS_WEBHOOK_SECRET ? '👁️‍🗨️' : '👁️' }}
                </button>
              </div>
              <div class="field-meta-row">
                <span class="field-hint">Sent in <code>X-Webhook-Signature</code> header. Your receiver can verify this hash to guarantee payload authenticity.</span>
                <button type="button" class="btn-micro-copy" @click="copyToClipboard(form.OPERATIONS_WEBHOOK_SECRET, 'Secret Key')">Copy</button>
              </div>
            </div>
          </div>

          <!-- Outbound Schema Code Box -->
          <div class="modern-code-terminal">
            <div class="terminal-topbar">
              <div class="terminal-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="terminal-label">OUTBOUND PAYLOAD SCHEMA (JSON)</span>
              </div>
              <button type="button" class="btn-copy-terminal" @click="copyToClipboard(sampleOutboundJson, 'Payload Schema')">
                📋 Copy Schema JSON
              </button>
            </div>
            <pre class="terminal-code"><code>{{ sampleOutboundJson }}</code></pre>
          </div>
        </div>

        <!-- 3.2 SUBTAB: INBOUND GHL TRIGGER WEBHOOK -->
        <div v-else-if="webhookTab === 'inbound'" class="webhook-panel-body">
          <div class="webhook-config-banner">
            <div class="form-field-group">
              <label class="modern-label">
                <span class="label-text">Inbound Webhook Trigger URL</span>
                <span class="meta-tag tag-blue">GHL Workflow Action</span>
              </label>
              <div class="webhook-input-action-row">
                <div class="modern-input-box" style="flex: 1;">
                  <span class="input-prefix-icon">📥</span>
                  <input 
                    :value="inboundWebhookUrl" 
                    type="text" 
                    readonly 
                    class="modern-text-input with-prefix mono-text" 
                  />
                </div>
                <button 
                  type="button" 
                  class="btn-ping-action btn-copy-action" 
                  @click="copyToClipboard(inboundWebhookUrl, 'Inbound Webhook URL')"
                >
                  📋 Copy Trigger URL
                </button>
              </div>
              <span class="field-hint" style="margin-top: 6px;">
                Paste into GoHighLevel Workflows (<strong>Add Action &rarr; Custom Webhook &rarr; POST</strong>) to automatically generate contracts upon deal stages or tags.
              </span>
            </div>

            <!-- Inbound Secret -->
            <div class="form-field-group" style="margin-top: 14px;">
              <label class="modern-label">
                <span class="label-text">Webhook Authentication Header Secret</span>
                <span class="meta-tag tag-purple">Authorization: Bearer</span>
              </label>
              <div class="modern-input-box">
                <span class="input-prefix-icon">🛡️</span>
                <input 
                  v-model="form.GHL_WEBHOOK_SECRET" 
                  :type="showSecret.GHL_WEBHOOK_SECRET ? 'text' : 'password'" 
                  class="modern-text-input with-prefix with-suffix" 
                  placeholder="Enter secret" 
                />
                <button 
                  type="button" 
                  class="input-suffix-action" 
                  @click="toggleShow('GHL_WEBHOOK_SECRET')"
                >
                  {{ showSecret.GHL_WEBHOOK_SECRET ? '👁️‍🗨️' : '👁️' }}
                </button>
              </div>
              <div class="field-meta-row">
                <span class="field-hint">Required Header: <code>Authorization: Bearer {{ form.GHL_WEBHOOK_SECRET || 'secret' }}</code></span>
                <button type="button" class="btn-micro-copy" @click="copyToClipboard(form.GHL_WEBHOOK_SECRET, 'Webhook Secret')">Copy</button>
              </div>
            </div>
          </div>

          <div class="modern-code-terminal">
            <div class="terminal-topbar">
              <div class="terminal-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="terminal-label">INBOUND WORKFLOW REQUEST BODY (JSON)</span>
              </div>
              <button type="button" class="btn-copy-terminal" @click="copyToClipboard(sampleInboundJson, 'Inbound Payload')">
                📋 Copy Sample JSON
              </button>
            </div>
            <pre class="terminal-code"><code>{{ sampleInboundJson }}</code></pre>
          </div>
        </div>

        <!-- 3.3 SUBTAB: INTEGRATION DOCUMENTATION -->
        <div v-else-if="webhookTab === 'docs'" class="webhook-panel-body">
          <div class="docs-feature-grid">
            <div class="doc-card">
              <div class="doc-badge badge-ghl">GHL WORKFLOW AUTOMATION</div>
              <h3 class="doc-card-title">1. Automatic Contract Creation via GoHighLevel</h3>
              <p class="doc-card-text">Trigger contract generation whenever a lead moves to a specific pipeline stage or an Opportunity is Won.</p>
              <ol class="doc-numbered-list">
                <li>Go to <strong>GoHighLevel &rarr; Automation &rarr; Workflows</strong>.</li>
                <li>Add Trigger: <strong>Opportunity Status Changed</strong> (<code>Won</code>) or <strong>Pipeline Stage Changed</strong>.</li>
                <li>Add Action: <strong>Custom Webhook</strong>.</li>
                <li>Method: <code>POST</code> &bull; URL: <code>{{ inboundWebhookUrl }}</code></li>
                <li>Header: <code>Authorization</code> &bull; Value: <code>Bearer {{ form.GHL_WEBHOOK_SECRET }}</code></li>
                <li>JSON Body: Send <code>locationId</code>, <code>contactId</code>, <code>opportunityId</code>, and <code>trigger</code>.</li>
              </ol>
            </div>

            <div class="doc-card">
              <div class="doc-badge badge-ops">OPERATIONS &amp; CASE HANDOFF</div>
              <h3 class="doc-card-title">2. Receiving Completed Dossiers in Make / Zapier</h3>
              <p class="doc-card-text">Upload client files to Google Drive, notify processing teams on Slack, or create tickets in ClickUp / Jira.</p>
              <ol class="doc-numbered-list">
                <li>Create a <strong>Custom Webhook</strong> in Make.com or <strong>Catch Hook</strong> in Zapier.</li>
                <li>Paste the webhook URL into the <strong>Operations Webhook Destination</strong> tab above.</li>
                <li>Click <strong>"Test Webhook Ping"</strong> to capture and map all client &amp; contract data.</li>
                <li>Extract <code>documents.packageZipUrl</code> to download the compiled case dossier in 1 step.</li>
                <li>Extract <code>documents.attachments</code> array for individual passports, Emirates IDs, and bank statements.</li>
              </ol>
            </div>

            <div class="doc-card">
              <div class="doc-badge badge-sec">HMAC SECURITY</div>
              <h3 class="doc-card-title">3. Verifying HMAC-SHA256 Webhook Signatures</h3>
              <p class="doc-card-text">Verify that incoming handoff payloads originate genuinely from your Contract &amp; Summary platform.</p>
              <div class="modern-code-terminal" style="margin-top: 8px;">
                <div class="terminal-topbar">
                  <span class="terminal-label" style="font-size: 11px;">Node.js Verification Snippet</span>
                  <button type="button" class="btn-copy-terminal" @click="copyToClipboard(nodeVerifySnippet, 'Node.js Snippet')">📋 Copy</button>
                </div>
                <pre class="terminal-code" style="max-height: 120px;"><code>{{ nodeVerifySnippet }}</code></pre>
              </div>
            </div>

            <div class="doc-card">
              <div class="doc-badge badge-ghl">GHL MEDIA STORAGE</div>
              <h3 class="doc-card-title">4. GoHighLevel Media &amp; Custom Fields Access</h3>
              <p class="doc-card-text">All finalized documents are permanently stored in GoHighLevel for instant access across your team.</p>
              <ul class="doc-bullet-list">
                <li><strong>Signed Legal Agreement:</strong> Stored in <code>contract.ghl_file_url</code> and contact custom field <code>contract_pdf_url</code>.</li>
                <li><strong>9-Page Client Summary PDF:</strong> Uploaded to GHL Media Library and synced to custom field <code>client_summary_pdf_url</code>.</li>
                <li><strong>Case Package ZIP:</strong> Uploaded to GHL Media Library and synced to custom field <code>case_package_zip_url</code>.</li>
                <li><strong>Conversation Thread:</strong> Automatic Internal Comments are posted in GoHighLevel conversations whenever a contract is signed or shared with Operations.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 4. OFFICIAL COMPANY BRANDING (STAMP & SIGNATURE)               -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('branding')" 
        class="executive-card"
        :class="{ 'card-highlight': matchesSearch('branding stamp signature seal seal authorized officer logo') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-emerald">🎨</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">Company Seal &amp; Authorized Signature</h2>
                <span class="badge-chip chip-emerald">Legal Assets</span>
              </div>
              <p class="card-subtitle">
                Official company seal and authorized officer signature stamped onto completed agreements and QR-verified certificates.
              </p>
            </div>
          </div>
          <span class="card-status-badge badge-active">Auto Stamping</span>
        </div>

        <div class="branding-dual-grid">
          <!-- 4.1 Company Stamp -->
          <div class="asset-editor-box">
            <div class="asset-box-header">
              <div class="asset-title-row">
                <span class="asset-badge-icon">🔴</span>
                <div>
                  <h3 class="asset-heading">Official Company Stamp / Seal</h3>
                  <p class="asset-sub">Overlaid alongside authorized signature on contract execution</p>
                </div>
              </div>
            </div>

            <div class="asset-input-row">
              <div class="modern-input-box" style="flex: 1;">
                <span class="input-prefix-icon">🖼️</span>
                <input 
                  v-model="form.COMPANY_STAMP_URL" 
                  type="text" 
                  class="modern-text-input with-prefix" 
                  placeholder="https://... or upload PNG file" 
                />
              </div>
              <button 
                type="button" 
                class="btn-asset-upload" 
                :disabled="uploadingStampMedia" 
                @click="triggerStampUpload"
              >
                {{ uploadingStampMedia ? '⏳ Uploading…' : '📁 Upload PNG' }}
              </button>
              <input 
                ref="stampFileInput" 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                style="display: none;" 
                @change="onStampFileSelected" 
              />
            </div>

            <!-- Preview Canvas -->
            <div class="asset-preview-canvas">
              <div class="paper-texture">
                <div v-if="form.COMPANY_STAMP_URL" class="stamp-preview-wrapper">
                  <img :src="form.COMPANY_STAMP_URL" alt="Company Stamp" class="stamp-image-preview" />
                  <div class="preview-tag-badge">
                    <span class="dot-green"></span>
                    <span>Live Seal Preview</span>
                  </div>
                </div>
                <div v-else class="preview-empty-state">
                  <span class="empty-icon">🔴</span>
                  <span>No company seal uploaded yet</span>
                  <span class="empty-hint">Transparent PNG recommended (max 5MB)</span>
                </div>
              </div>
              <div v-if="form.COMPANY_STAMP_URL" class="preview-footer-action">
                <button type="button" class="btn-remove-asset" @click="clearStamp">
                  🗑️ Remove Stamp
                </button>
              </div>
            </div>
          </div>

          <!-- 4.2 Authorized Signature -->
          <div class="asset-editor-box">
            <div class="asset-box-header">
              <div class="asset-title-row">
                <span class="asset-badge-icon">✍️</span>
                <div>
                  <h3 class="asset-heading">Authorized Officer Signature</h3>
                  <p class="asset-sub">Embedded as official party signature on executed agreements</p>
                </div>
              </div>
            </div>

            <div class="asset-input-row">
              <div class="modern-input-box" style="flex: 1;">
                <span class="input-prefix-icon">🖋️</span>
                <input 
                  v-model="form.COMPANY_SIGNATURE_URL" 
                  type="text" 
                  class="modern-text-input with-prefix" 
                  placeholder="https://... or upload PNG signature" 
                />
              </div>
              <button 
                type="button" 
                class="btn-asset-upload" 
                :disabled="uploadingSigMedia" 
                @click="triggerSigUpload"
              >
                {{ uploadingSigMedia ? '⏳ Uploading…' : '📁 Upload PNG' }}
              </button>
              <input 
                ref="sigFileInput" 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                style="display: none;" 
                @change="onSigFileSelected" 
              />
            </div>

            <!-- Preview Canvas -->
            <div class="asset-preview-canvas">
              <div class="paper-texture">
                <div v-if="form.COMPANY_SIGNATURE_URL" class="sig-preview-wrapper">
                  <img :src="form.COMPANY_SIGNATURE_URL" alt="Company Signature" class="sig-image-preview" />
                  <div class="preview-tag-badge">
                    <span class="dot-green"></span>
                    <span>Live Signature Preview</span>
                  </div>
                </div>
                <div v-else class="preview-empty-state">
                  <span class="empty-icon">✍️</span>
                  <span>No authorized signature uploaded yet</span>
                  <span class="empty-hint">Transparent PNG with clean ink recommended</span>
                </div>
              </div>
              <div v-if="form.COMPANY_SIGNATURE_URL" class="preview-footer-action">
                <button type="button" class="btn-remove-asset" @click="clearSignature">
                  🗑️ Remove Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 5. CLIENT SUMMARY DOSSIER SCHEMA BUILDER                        -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('schema')" 
        class="executive-card"
        :class="{ 'card-highlight': matchesSearch('client summary schema custom fields sections dossier pages') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-indigo">📋</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">Client Summary Dossier Customization</h2>
                <span class="badge-chip chip-indigo">Schema Builder</span>
              </div>
              <p class="card-subtitle">
                Add custom sections and fields to the official 9-page Client Summary Form. Captured by counsellors and rendered into the official dossier PDF and ZIP package.
              </p>
            </div>
          </div>

          <div class="schema-action-toolbar">
            <!-- Preset Menu -->
            <div class="preset-dropdown-container">
              <button type="button" class="btn-schema-preset" @click="showPresetMenu = !showPresetMenu">
                <span>⚡ Quick Presets</span>
                <span>▾</span>
              </button>
              <div v-if="showPresetMenu" class="preset-dropdown-menu">
                <button type="button" class="preset-item" @click="applyPreset('medical')">
                  🏥 Medical &amp; Health Clearance (New Section + 4 Fields)
                </button>
                <button type="button" class="preset-item" @click="applyPreset('guarantor')">
                  🤝 Secondary Sponsor &amp; Guarantor (New Section + 4 Fields)
                </button>
                <button type="button" class="preset-item" @click="applyPreset('identity')">
                  🪪 Emirates ID &amp; Tax Verification (Added to Page 1 &amp; 7)
                </button>
              </div>
            </div>

            <button type="button" class="btn-schema-action btn-add-section" @click="openAddSectionModal">
              ➕ Add Section
            </button>
            <button type="button" class="btn-schema-action btn-add-field" @click="openAddFieldModal">
              ➕ Add Field
            </button>
          </div>
        </div>

        <!-- Schema Sub-Tabs -->
        <div class="schema-tabs-row">
          <button 
            type="button" 
            class="schema-tab-pill" 
            :class="{ active: schemaActiveTab === 'fields' }"
            @click="schemaActiveTab = 'fields'"
          >
            <span>Custom Fields</span>
            <span class="tab-counter">{{ customSchema.fields?.length || 0 }}</span>
          </button>
          <button 
            type="button" 
            class="schema-tab-pill" 
            :class="{ active: schemaActiveTab === 'sections' }"
            @click="schemaActiveTab = 'sections'"
          >
            <span>Custom Sections / Pages</span>
            <span class="tab-counter">{{ customSchema.sections?.length || 0 }}</span>
          </button>
        </div>

        <!-- Schema Tab 1: Fields Table -->
        <div v-if="schemaActiveTab === 'fields'">
          <div v-if="!customSchema.fields?.length" class="empty-schema-state">
            <div class="empty-schema-icon">📝</div>
            <div class="empty-schema-title">No Custom Fields Configured</div>
            <p class="empty-schema-desc">
              Add custom fields to existing standard pages (General Info, Immigration History, Financials) or attach them to newly created custom sections.
            </p>
            <div class="empty-schema-actions">
              <button type="button" class="btn btn-primary btn-sm" @click="openAddFieldModal">
                ➕ Add First Field
              </button>
              <button type="button" class="btn btn-secondary btn-sm" @click="applyPreset('identity')">
                ⚡ Load Sample Fields
              </button>
            </div>
          </div>

          <div v-else class="schema-table-container">
            <table class="modern-schema-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Field Label</th>
                  <th style="width: 20%;">Variable Key</th>
                  <th style="width: 15%;">Field Type</th>
                  <th style="width: 22%;">Target Section / Page</th>
                  <th style="width: 8%; text-align: center;">Required</th>
                  <th style="width: 10%; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fld, idx) in customSchema.fields" :key="fld.id || idx">
                  <td>
                    <div class="field-title-bold">{{ fld.label }}</div>
                    <div v-if="fld.placeholder" class="field-placeholder-text">Placeholder: "{{ fld.placeholder }}"</div>
                  </td>
                  <td>
                    <code class="mono-key-badge">{{ fld.key }}</code>
                  </td>
                  <td>
                    <span class="field-type-chip">{{ formatFieldType(fld.type) }}</span>
                    <span v-if="fld.options?.length" class="options-tag" :title="fld.options.join(', ')">
                      {{ fld.options.length }} options
                    </span>
                  </td>
                  <td>
                    <span class="section-tag-pill">
                      {{ getSectionDisplayLabel(fld.section) }}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span v-if="fld.required" class="badge-req">Required</span>
                    <span v-else class="badge-opt">Optional</span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-action-group">
                      <button type="button" class="btn-table-icon" :disabled="idx === 0" title="Move Up" @click="moveField(idx, -1)">▲</button>
                      <button type="button" class="btn-table-icon" :disabled="idx === customSchema.fields.length - 1" title="Move Down" @click="moveField(idx, 1)">▼</button>
                      <button type="button" class="btn-table-icon" title="Edit Field" @click="openEditFieldModal(fld, idx)">✎</button>
                      <button type="button" class="btn-table-icon btn-table-delete" title="Delete Field" @click="deleteField(idx)">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Schema Tab 2: Sections Table -->
        <div v-else-if="schemaActiveTab === 'sections'">
          <div v-if="!customSchema.sections?.length" class="empty-schema-state">
            <div class="empty-schema-icon">📑</div>
            <div class="empty-schema-title">No Custom Sections Configured</div>
            <p class="empty-schema-desc">
              Create dedicated custom sections (such as "Medical Clearance" or "Guarantor Credentials") that appear as separate pages in the dossier and PDF.
            </p>
            <div class="empty-schema-actions">
              <button type="button" class="btn btn-primary btn-sm" @click="openAddSectionModal">
                ➕ Add First Section
              </button>
              <button type="button" class="btn btn-secondary btn-sm" @click="applyPreset('medical')">
                ⚡ Load Medical Clearance Section
              </button>
            </div>
          </div>

          <div v-else class="schema-table-container">
            <div class="sections-sorting-toolbar">
              <div class="sort-hint">
                <span>⇅ Arrange order of custom pages rendered in dossier tabs and PDF</span>
              </div>
              <div class="sort-buttons-row">
                <span class="sort-title">Sort:</span>
                <button type="button" class="btn-sort-chip" @click="sortSectionsBy('title-asc')">A &rarr; Z</button>
                <button type="button" class="btn-sort-chip" @click="sortSectionsBy('fields-count')">Most Fields</button>
                <button type="button" class="btn-sort-chip" @click="sortSectionsBy('order')">Re-index</button>
              </div>
            </div>

            <table class="modern-schema-table">
              <thead>
                <tr>
                  <th style="width: 14%; text-align: center;">Position</th>
                  <th style="width: 30%;">Section Title</th>
                  <th style="width: 38%;">Description</th>
                  <th style="width: 8%; text-align: center;">Fields</th>
                  <th style="width: 10%; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sec, idx) in customSchema.sections" :key="sec.id || idx">
                  <td style="text-align: center;">
                    <div class="order-cell-row">
                      <button type="button" class="btn-table-icon" :disabled="idx === 0" @click="moveSection(idx, -1)">▲</button>
                      <span class="order-pill">#{{ sec.order || idx + 1 }}</span>
                      <button type="button" class="btn-table-icon" :disabled="idx === customSchema.sections.length - 1" @click="moveSection(idx, 1)">▼</button>
                    </div>
                  </td>
                  <td>
                    <div class="field-title-bold">{{ sec.title }}</div>
                    <div class="field-meta-id">ID: {{ sec.id }}</div>
                  </td>
                  <td class="sec-description-text">
                    {{ sec.description || '—' }}
                  </td>
                  <td style="text-align: center;">
                    <span class="fields-count-badge">{{ getFieldsCountForSection(sec.id) }}</span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-action-group">
                      <button type="button" class="btn-table-icon" title="Edit Section" @click="openEditSectionModal(sec, idx)">✎</button>
                      <button type="button" class="btn-table-icon btn-table-delete" title="Delete Section" @click="deleteSection(idx)">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="schema-footer-bar">
          <span class="footer-meta-text">
            Changes to schema are synchronized with <strong>Client Summary Form</strong> and official A4 PDF exports.
          </span>
          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            :disabled="savingSchema" 
            @click="saveCustomSchemaManual"
          >
            {{ savingSchema ? 'Saving Schema…' : '💾 Save Custom Schema' }}
          </button>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 6. ACCESS, SALES PRIVACY & BACKGROUND WORKERS                  -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section 
        v-show="isCategoryVisible('access')" 
        class="executive-card"
        :class="{ 'card-highlight': matchesSearch('sales access privacy restrict assigned cron workers cache session') }"
      >
        <div class="card-header-row">
          <div class="card-title-group">
            <div class="card-icon-pill icon-slate">🛡️</div>
            <div>
              <div class="card-title-with-badge">
                <h2 class="card-title">Access Control, Sales Privacy &amp; Workers</h2>
                <span class="badge-chip chip-slate">Security &amp; Performance</span>
              </div>
              <p class="card-subtitle">
                Configure whether sales representatives can only access contacts assigned to them, and tune background workers.
              </p>
            </div>
          </div>
          <span class="card-status-badge badge-active">Protected</span>
        </div>

        <div class="card-form-grid grid-2">
          <!-- Sales Lead Isolation -->
          <div class="form-field-group grid-span-2">
            <label class="modern-label">
              <span class="label-text">Sales Representative Data Isolation</span>
              <span class="meta-tag" :class="form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'tag-emerald' : 'tag-slate'">
                {{ form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'Enforced' : 'Unrestricted' }}
              </span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">👥</span>
              <select v-model="form.RESTRICT_CONTACTS_TO_ASSIGNED" class="modern-text-input with-prefix modern-select">
                <option value="true">Enabled (Restricted) — Sales users only see their own assigned contacts &amp; opportunities</option>
                <option value="false">Disabled (Open) — Sales users can search and view all contacts &amp; opportunities across the location</option>
              </select>
            </div>
            <span class="field-hint">
              When enabled, representatives (e.g. Akram Mammeri) will only see leads assigned to their GHL account. Admins and Super Admins always have access to all records.
            </span>
          </div>

          <!-- Session Token Duration -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">App Session JWT Duration</span>
              <span class="meta-tag tag-blue">Auto-Logout</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">⏱️</span>
              <input v-model="form.JWT_EXPIRES_IN" type="text" class="modern-text-input with-prefix" placeholder="8h" />
            </div>
            <span class="field-hint">Time before session expires and user must re-authenticate (Default: <code>8h</code>)</span>
          </div>

          <!-- GHL Concurrency Limit -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">GHL API Concurrency Limit</span>
              <span class="meta-tag tag-slate">Rate-Limiting</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">⚡</span>
              <input v-model="form.GHL_CONCURRENCY_LIMIT" type="number" class="modern-text-input with-prefix" placeholder="4" />
            </div>
            <span class="field-hint">Maximum concurrent parallel requests to GoHighLevel API</span>
          </div>

          <!-- Field Cache TTL -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Custom Field Cache TTL (ms)</span>
              <span class="meta-tag tag-slate">In-Memory Cache</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">💾</span>
              <input v-model="form.GHL_FIELD_CACHE_TTL_MS" type="number" class="modern-text-input with-prefix" placeholder="900000" />
            </div>
            <span class="field-hint">Default: <code>900000</code> ms (15 minutes)</span>
          </div>

          <!-- Max PDF Upload Retries -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Max PDF Upload Retries</span>
              <span class="meta-tag tag-slate">Exponential Backoff</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">🔁</span>
              <input v-model="form.MAX_UPLOAD_RETRIES" type="number" class="modern-text-input with-prefix" placeholder="5" />
            </div>
            <span class="field-hint">Retries before escalating failed PDF sync</span>
          </div>

          <!-- Expiry Worker Cron -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Contract Expiry Worker Cron</span>
              <span class="meta-tag tag-slate">Cron Schedule</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">⏰</span>
              <input v-model="form.EXPIRY_WORKER_CRON" type="text" class="modern-text-input with-prefix" placeholder="*/5 * * * *" />
            </div>
            <span class="field-hint">Overdue contract scanner frequency (Default: <code>*/5 * * * *</code>)</span>
          </div>

          <!-- Retry Worker Cron -->
          <div class="form-field-group">
            <label class="modern-label">
              <span class="label-text">Dead-letter Retry Worker Cron</span>
              <span class="meta-tag tag-slate">Cron Schedule</span>
            </label>
            <div class="modern-input-box">
              <span class="input-prefix-icon">⏰</span>
              <input v-model="form.RETRY_WORKER_CRON" type="text" class="modern-text-input with-prefix" placeholder="*/2 * * * *" />
            </div>
            <span class="field-hint">Failed PDF upload retrier frequency (Default: <code>*/2 * * * *</code>)</span>
          </div>
        </div>
      </section>

    </div>

    <!-- ─── FLOATING ACTION BAR FOR UNSAVED CHANGES ────────────────────── -->
    <transition name="bar-slide">
      <div v-if="isFormDirty" class="floating-save-bar">
        <div class="save-bar-content">
          <div class="save-bar-left">
            <span class="warning-pulse-icon">⚠️</span>
            <div>
              <div class="save-bar-title">Unsaved System Changes</div>
              <div class="save-bar-desc">You have modified system configurations that have not been persisted to MySQL yet.</div>
            </div>
          </div>
          <div class="save-bar-actions">
            <button type="button" class="btn-discard" :disabled="saving" @click="discardChanges">
              Discard
            </button>
            <button type="button" class="btn-save-floating" :disabled="saving" @click="saveSettings">
              <span v-if="saving" class="spin-infinite">⏳</span>
              <span v-else>💾</span>
              <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ─── MODAL: ADD / EDIT CUSTOM FIELD ──────────────────────────── -->
    <div v-if="showFieldModal" class="modal-backdrop-custom" @click.self="showFieldModal = false">
      <div class="modal-card-custom animate-scale-up">
        <div class="modal-header-custom">
          <div class="modal-title-row">
            <span class="modal-badge-icon">📝</span>
            <h3 class="modal-heading-text">
              {{ editingFieldIndex >= 0 ? 'Edit Custom Field' : 'Add New Custom Field' }}
            </h3>
          </div>
          <button type="button" class="btn-close-custom" @click="showFieldModal = false">✕</button>
        </div>

        <form @submit.prevent="submitFieldModal" class="modal-form-body">
          <div class="modal-grid-2">
            <div>
              <label class="modern-label">Field Label <span class="req">*</span></label>
              <input
                type="text"
                v-model="fieldForm.label"
                class="modern-text-input"
                placeholder="e.g. National ID / Emirates ID"
                required
                @input="onFieldLabelInput"
              />
            </div>
            <div>
              <label class="modern-label">Variable Key <span class="req">*</span></label>
              <input
                type="text"
                v-model="fieldForm.key"
                class="modern-text-input mono-text"
                placeholder="e.g. national_id_number"
                required
              />
              <span class="field-hint">Unique identifier used in dossier JSON</span>
            </div>
          </div>

          <div class="modal-grid-2">
            <div>
              <label class="modern-label">Field Type <span class="req">*</span></label>
              <select v-model="fieldForm.type" class="modern-text-input modern-select">
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
              <label class="modern-label">Target Section / Page <span class="req">*</span></label>
              <select v-model="fieldForm.section" class="modern-text-input modern-select">
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

          <!-- Dropdown Options if type is dropdown -->
          <div v-if="fieldForm.type === 'dropdown'">
            <label class="modern-label">Dropdown Options (Comma separated) <span class="req">*</span></label>
            <input
              type="text"
              v-model="fieldForm.optionsText"
              class="modern-text-input"
              placeholder="e.g. Option A, Option B, Option C"
              required
            />
            <span class="field-hint">Separate each option with a comma.</span>
          </div>

          <div class="modal-grid-2">
            <div>
              <label class="modern-label">Placeholder Text</label>
              <input
                type="text"
                v-model="fieldForm.placeholder"
                class="modern-text-input"
                placeholder="e.g. Enter value..."
              />
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 8px; padding-top: 16px;">
              <label class="checkbox-label-row">
                <input type="checkbox" v-model="fieldForm.required" />
                <span>Mark as Required Field</span>
              </label>
              <label class="checkbox-label-row">
                <input type="checkbox" v-model="fieldForm.fullWidth" />
                <span>Span Full Width (2 columns in form)</span>
              </label>
            </div>
          </div>

          <div class="modal-footer-actions">
            <button type="button" class="btn btn-secondary" @click="showFieldModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ editingFieldIndex >= 0 ? 'Save Changes' : 'Add Field' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── MODAL: ADD / EDIT CUSTOM SECTION ────────────────────────── -->
    <div v-if="showSectionModal" class="modal-backdrop-custom" @click.self="showSectionModal = false">
      <div class="modal-card-custom animate-scale-up" style="max-width: 480px;">
        <div class="modal-header-custom">
          <div class="modal-title-row">
            <span class="modal-badge-icon">📑</span>
            <h3 class="modal-heading-text">
              {{ editingSectionIndex >= 0 ? 'Edit Custom Section' : 'Add New Custom Section' }}
            </h3>
          </div>
          <button type="button" class="btn-close-custom" @click="showSectionModal = false">✕</button>
        </div>

        <form @submit.prevent="submitSectionModal" class="modal-form-body">
          <div class="modal-grid-2">
            <div>
              <label class="modern-label">Section Title <span class="req">*</span></label>
              <input
                type="text"
                v-model="sectionForm.title"
                class="modern-text-input"
                placeholder="e.g. Medical &amp; Health Clearance"
                required
              />
            </div>
            <div>
              <label class="modern-label">Sort / Order Position</label>
              <input
                type="number"
                v-model.number="sectionForm.order"
                min="1"
                class="modern-text-input"
                placeholder="e.g. 1"
              />
              <span class="field-hint">Display position in form tabs &amp; PDF</span>
            </div>
          </div>

          <div>
            <label class="modern-label">Section Description (Optional)</label>
            <textarea
              v-model="sectionForm.description"
              class="modern-text-input"
              rows="3"
              placeholder="Brief instructions or purpose for counsellors filling this section..."
            ></textarea>
          </div>

          <div class="modal-footer-actions">
            <button type="button" class="btn btn-secondary" @click="showSectionModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ editingSectionIndex >= 0 ? 'Save Section' : 'Create Section' }}
            </button>
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

// Navigation & Filter
const activeCategory = ref('all')
const searchFilter = ref('')
const categories = [
  { id: 'all', label: 'All Settings', icon: '🗂️' },
  { id: 'ghl', label: 'GoHighLevel & API', icon: '⚡', badge: 'Core' },
  { id: 'webhooks', label: 'Webhooks & Operations', icon: '🔌', badge: 'Hub' },
  { id: 'signing', label: 'Signing & Domains', icon: '🌐' },
  { id: 'branding', label: 'Company Branding', icon: '🎨' },
  { id: 'schema', label: 'Client Summary Schema', icon: '📋', badge: 'Custom' },
  { id: 'access', label: 'Access & Workers', icon: '🛡️' },
]

function isCategoryVisible(catId) {
  if (searchFilter.value.trim()) return true
  if (activeCategory.value === 'all') return true
  return activeCategory.value === catId
}

function matchesSearch(keywords) {
  if (!searchFilter.value.trim()) return false
  const q = searchFilter.value.toLowerCase().trim()
  return keywords.toLowerCase().includes(q)
}

// Webhook Tabs
const webhookTab = ref('operations') // 'operations', 'inbound', 'docs'
const testingWebhook = ref(false)
const testWebhookResult = ref(null)
const copyToast = ref('')

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

// Initial snapshot to track dirty state
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
      
      // Auto-persist immediately to system_settings so it survives restart
      await api.put('/settings', { settings: { COMPANY_STAMP_URL: finalUrl } })
      initialSnapshot.value = JSON.stringify(form.value)
      successMsg.value = 'Company stamp uploaded and saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Stamp upload save fallback:', err)
      try {
        await api.put('/settings', { settings: { COMPANY_STAMP_URL: dataBase64 } })
        initialSnapshot.value = JSON.stringify(form.value)
        successMsg.value = 'Company stamp saved successfully!'
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (saveErr) {
        errorMsg.value = 'Failed to save company stamp.'
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
    successMsg.value = 'Company stamp removed.'
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

      // Auto-persist immediately to system_settings so it survives restart
      await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: finalUrl } })
      initialSnapshot.value = JSON.stringify(form.value)
      successMsg.value = 'Company signature uploaded and saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Signature upload save fallback:', err)
      try {
        await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: dataBase64 } })
        initialSnapshot.value = JSON.stringify(form.value)
        successMsg.value = 'Company signature saved successfully!'
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (saveErr) {
        errorMsg.value = 'Failed to save company signature.'
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
    const res = await api.post('/settings/test-operations-webhook', {
      webhookUrl: form.value.OPERATIONS_WEBHOOK_URL,
      webhookSecret: form.value.OPERATIONS_WEBHOOK_SECRET,
    })
    testWebhookResult.value = res.data
  } catch (err) {
    testWebhookResult.value = {
      success: false,
      error: err.response?.data?.error || err.message,
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
      nationality: "Emirati",
      dateOfBirth: "1988-06-14"
    },
    contract: {
      id: 1042,
      templateName: "Cyprus Permanent Residency Agreement",
      contractType: "IMMIGRATION_SERVICES",
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
          mimeType: "application/pdf",
          sizeBytes: 1420500,
          category: "Identity"
        }
      ]
    },
    summaryData: {
      page1_general_info: { reg_number: "REF-1042", country_applying_for: "Cyprus" },
      page2_immigration_history: { q2_refused_visa: "no" },
      page3_business_background: { q8_own_business: "yes", q9_business_name: "Apex Trading LLC" },
      page8_financials: { q48_source_of_funds: "Business retained earnings" }
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

const nodeVerifySnippet = computed(() => {
  return `const crypto = require('crypto');\n\nfunction verifyWebhook(rawPayload, headerSignature, secret) {\n  const calculated = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');\n  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(headerSignature));\n}`
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
  successMsg.value = 'Settings reloaded from database.'
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

// ─── Client Summary Custom Schema State ──────────────────────────────────────
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
    text: 'Single-line Text',
    textarea: 'Multi-line Paragraph',
    number: 'Number / Currency',
    date: 'Date (YYYY-MM-DD)',
    dropdown: 'Dropdown Select',
    yes_no: 'Yes / No Toggle',
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
      successMsg.value = 'Client Summary custom schema saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 3500)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to save schema.'
    setTimeout(() => { errorMsg.value = '' }, 4000)
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

  // Sort and re-normalize sequential order
  customSchema.value.sections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  customSchema.value.sections.forEach((s, i) => {
    s.order = i + 1
  })

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

  customSchema.value.sections.forEach((s, i) => {
    s.order = i + 1
  })

  await saveCustomSchema(true)
}

async function sortSectionsBy(criteria) {
  if (!customSchema.value.sections?.length) return
  if (criteria === 'title-asc') {
    customSchema.value.sections.sort((a, b) => a.title.localeCompare(b.title))
  } else if (criteria === 'title-desc') {
    customSchema.value.sections.sort((a, b) => b.title.localeCompare(a.title))
  } else if (criteria === 'fields-count') {
    customSchema.value.sections.sort((a, b) => getFieldsCountForSection(b.id) - getFieldsCountForSection(a.id))
  } else if (criteria === 'order') {
    customSchema.value.sections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  }
  customSchema.value.sections.forEach((s, i) => {
    s.order = i + 1
  })
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
      description: 'Official clinical screening, chest x-ray, blood test, and vaccination compliance',
      order: customSchema.value.sections.length + 1,
    })
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_1`, key: 'medical_exam_completed', label: 'Medical Exam Completed', type: 'yes_no', section: secId, required: true },
      { id: `fld_${Date.now()}_2`, key: 'medical_exam_date', label: 'Examination Date', type: 'date', section: secId, required: false },
      { id: `fld_${Date.now()}_3`, key: 'medical_clinic_name', label: 'Approved Clinical Center', type: 'text', section: secId, placeholder: 'e.g. MedCare Clinic Dubai' },
      { id: `fld_${Date.now()}_4`, key: 'medical_clearance_notes', label: 'Physician Clearance Notes', type: 'textarea', section: secId, fullWidth: true, placeholder: 'Detailed medical assessment remarks...' }
    )
    schemaActiveTab.value = 'sections'
  } else if (type === 'guarantor') {
    const secId = `sec_guar_${Date.now()}`
    customSchema.value.sections.push({
      id: secId,
      title: 'Secondary Sponsor & Guarantor',
      description: 'Co-sponsor financial support guarantee, legal identity, and proof of funds verification',
      order: customSchema.value.sections.length + 1,
    })
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_5`, key: 'guarantor_full_name', label: 'Guarantor Full Name', type: 'text', section: secId, required: true },
      { id: `fld_${Date.now()}_6`, key: 'guarantor_relationship', label: 'Relationship to Applicant', type: 'dropdown', section: secId, options: ['Parent', 'Spouse', 'Sibling', 'Business Partner', 'Employer', 'Other'] },
      { id: `fld_${Date.now()}_7`, key: 'guarantor_annual_income', label: 'Guarantor Annual Income ($)', type: 'number', section: secId, placeholder: 'e.g. 150000' },
      { id: `fld_${Date.now()}_8`, key: 'guarantor_address_contact', label: 'Residential Address & Phone', type: 'textarea', section: secId, fullWidth: true }
    )
    schemaActiveTab.value = 'sections'
  } else if (type === 'identity') {
    customSchema.value.fields.push(
      { id: `fld_${Date.now()}_9`, key: 'national_id_number', label: 'National ID / Emirates ID Number', type: 'text', section: 'page1', placeholder: '784-XXXX-XXXXXXX-X' },
      { id: `fld_${Date.now()}_10`, key: 'tax_identification_number', label: 'Tax Identification Number (TIN)', type: 'text', section: 'page7', placeholder: 'Tax ID' }
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
/* ─── MAIN SETTINGS CONTAINER ────────────────────────────────────────── */
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1360px;
  margin: 0 auto;
  padding-bottom: 90px;
  font-family: var(--font-body, 'Inter', -apple-system, sans-serif);
}

/* ─── FLOATING TOASTS ────────────────────────────────────────────────── */
.floating-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  min-width: 300px;
  max-width: 440px;
  border: 1px solid;
}

.toast-success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.toast-error {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}

.toast-info {
  background: #f0f9ff;
  border-color: #7dd3fc;
  color: #0369a1;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-body {
  flex: 1;
}

.toast-title {
  font-weight: 700;
  font-size: 13px;
}

.toast-msg {
  font-size: 12px;
  margin-top: 2px;
  line-height: 1.35;
  opacity: 0.92;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 14px;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* ─── EXECUTIVE HEADER BANNER ────────────────────────────────────────── */
.settings-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 22px 28px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.settings-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #3b82f6, #06b6d4, #10b981);
}

.header-main-col {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 320px;
}

.header-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.12);
}

.header-badge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-heading {
  font-family: var(--font-heading, 'Inter', sans-serif);
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.live-sync {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  animation: pulse-dot-anim 2s infinite;
}

@keyframes pulse-dot-anim {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.version-tag {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
}

.header-caption {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.45;
}

.header-actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.dirty-state-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
}

.dirty-state-badge.is-unsaved {
  color: #d97706;
}

.state-bullet {
  font-size: 10px;
}

.header-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-header-secondary {
  background: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.btn-header-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-header-primary {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.btn-header-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.btn-header:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spin-infinite {
  display: inline-block;
  animation: spin-anim 1s linear infinite;
}

@keyframes spin-anim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── CATEGORY NAVIGATION BAR ────────────────────────────────────────── */
.settings-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #ffffff;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  flex-wrap: wrap;
}

.category-tabs-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 2px 0;
}

.category-nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.category-nav-tab:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.category-nav-tab.active {
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.cat-pill {
  font-size: 10px;
  background: #dbeafe;
  color: #1e40af;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.category-nav-tab.active .cat-pill {
  background: #1d4ed8;
  color: #ffffff;
}

.search-filter-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  color: #64748b;
  min-width: 200px;
}

.search-filter-input {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #1e293b;
  outline: none;
  width: 100%;
}

.btn-clear-search {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 11px;
}

/* ─── LOADING STATE ──────────────────────────────────────────────────── */
.settings-loading-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin-anim 0.8s linear infinite;
}

/* ─── CONTENT STACK ──────────────────────────────────────────────────── */
.settings-content-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ─── EXECUTIVE CARD ─────────────────────────────────────────────────── */
.executive-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 26px 28px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.executive-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
}

.card-highlight {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.webhook-card-accent {
  border-color: rgba(147, 51, 234, 0.35);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.06);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 22px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon-pill {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.icon-amber {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #d97706;
}

.icon-blue {
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: #0284c7;
}

.icon-purple {
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  color: #7c3aed;
}

.icon-emerald {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.icon-indigo {
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  color: #4338ca;
}

.icon-slate {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.card-title-with-badge {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.card-title {
  font-family: var(--font-heading, 'Inter', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.015em;
}

.badge-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.chip-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.chip-blue { background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }
.chip-purple { background: #ede9fe; color: #5b21b6; border: 1px solid #ddd6fe; }
.chip-emerald { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.chip-indigo { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
.chip-slate { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }

.card-subtitle {
  margin: 3px 0 0 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.card-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.badge-active {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* ─── FORM GRID & INPUT FIELDS ───────────────────────────────────────── */
.card-form-grid {
  display: grid;
  gap: 18px;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 860px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.grid-span-2 {
  grid-column: span 2;
}

@media (max-width: 860px) {
  .grid-span-2 {
    grid-column: span 1;
  }
}

.form-field-group {
  display: flex;
  flex-direction: column;
}

.modern-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.meta-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  font-family: monospace;
}

.tag-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.tag-emerald { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.tag-purple { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }
.tag-slate { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }

.modern-input-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-prefix-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #94a3b8;
  pointer-events: none;
  z-index: 2;
}

.modern-text-input {
  width: 100%;
  padding: 9px 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 13.5px;
  color: #0f172a;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.modern-text-input.with-prefix {
  padding-left: 36px;
}

.modern-text-input.with-suffix {
  padding-right: 42px;
}

.modern-text-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.modern-text-input:hover:not(:focus) {
  border-color: #94a3b8;
}

.modern-select {
  cursor: pointer;
}

.input-suffix-action {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  color: #64748b;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.input-suffix-action:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.btn-copy-inline {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 4px 8px !important;
}

.field-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  gap: 8px;
}

.field-hint {
  font-size: 11.5px;
  color: #64748b;
  line-height: 1.35;
}

.field-hint code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  color: #1e40af;
  font-size: 11px;
}

.btn-micro-copy {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-micro-copy:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.mono-text {
  font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace !important;
  font-size: 12.5px !important;
}

.url-preview-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
}

.preview-icon {
  font-size: 14px;
}

.preview-text code {
  color: #2563eb;
  font-weight: 600;
  font-family: monospace;
}

/* ─── WEBHOOK SEGMENTED CONTROL ──────────────────────────────────────── */
.webhook-segmented-control {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
  flex-wrap: wrap;
}

.segment-btn {
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn:hover {
  color: #0f172a;
}

.segment-btn.active {
  background: #ffffff;
  color: #7c3aed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.webhook-panel-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webhook-config-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
}

.webhook-input-action-row {
  display: flex;
  gap: 10px;
}

@media (max-width: 680px) {
  .webhook-input-action-row {
    flex-direction: column;
  }
}

.btn-ping-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #7c3aed;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
}

.btn-ping-action:hover:not(:disabled) {
  background: #6d28d9;
  transform: translateY(-1px);
}

.btn-ping-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-copy-action {
  background: #0284c7;
  box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);
}

.btn-copy-action:hover:not(:disabled) {
  background: #0369a1;
}

/* ─── PING RESULT BOX ────────────────────────────────────────────────── */
.ping-result-card {
  margin-top: 14px;
  border-radius: 9px;
  padding: 12px 16px;
  border: 1px solid;
}

.ping-success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.ping-failed {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.ping-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 12.5px;
}

.ping-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ping-metrics {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-code-tag {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
}

.latency-tag {
  font-size: 11px;
  opacity: 0.8;
}

.ping-message-detail {
  margin-top: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 11.5px;
  line-height: 1.4;
  white-space: pre-wrap;
}

/* ─── MODERN CODE TERMINAL ───────────────────────────────────────────── */
.modern-code-terminal {
  background: #0b1120;
  border: 1px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.terminal-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #131c31;
  border-bottom: 1px solid #1e293b;
}

.terminal-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.terminal-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  margin-left: 8px;
  letter-spacing: 0.5px;
}

.btn-copy-terminal {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #cbd5e1;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-copy-terminal:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.terminal-code {
  margin: 0;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #38bdf8;
}

/* ─── DOCS GUIDE GRID ────────────────────────────────────────────────── */
.docs-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 920px) {
  .docs-feature-grid {
    grid-template-columns: 1fr;
  }
}

.doc-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.doc-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 5px;
  margin-bottom: 8px;
}

.badge-ghl { background: #e0f2fe; color: #0369a1; }
.badge-ops { background: #ede9fe; color: #6d28d9; }
.badge-sec { background: #fef3c7; color: #b45309; }

.doc-card-title {
  margin: 0 0 6px 0;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

.doc-card-text {
  margin: 0 0 12px 0;
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
}

.doc-numbered-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #334155;
  line-height: 1.6;
}

.doc-numbered-list li {
  margin-bottom: 5px;
}

.doc-bullet-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #334155;
  line-height: 1.6;
}

/* ─── BRANDING DUAL GRID ─────────────────────────────────────────────── */
.branding-dual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 860px) {
  .branding-dual-grid {
    grid-template-columns: 1fr;
  }
}

.asset-editor-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}

.asset-box-header {
  margin-bottom: 14px;
}

.asset-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.asset-badge-icon {
  font-size: 20px;
}

.asset-heading {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

.asset-sub {
  margin: 2px 0 0 0;
  font-size: 11.5px;
  color: #64748b;
}

.asset-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.btn-asset-upload {
  padding: 9px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-asset-upload:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.asset-preview-canvas {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.paper-texture {
  padding: 24px;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(#f1f5f9 1px, #ffffff 1px);
  background-size: 16px 16px;
  position: relative;
}

.stamp-preview-wrapper,
.sig-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stamp-image-preview {
  max-height: 90px;
  max-width: 170px;
  object-fit: contain;
  transform: rotate(-6deg);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.12));
}

.sig-image-preview {
  max-height: 60px;
  max-width: 190px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
}

.preview-tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #15803d;
  background: #f0fdf4;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
}

.dot-green {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.preview-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12.5px;
  text-align: center;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 2px;
  opacity: 0.7;
}

.empty-hint {
  font-size: 11px;
  color: #cbd5e1;
}

.preview-footer-action {
  padding: 8px 12px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-remove-asset {
  background: transparent;
  border: none;
  font-size: 11.5px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-remove-asset:hover {
  background: #fee2e2;
}

/* ─── SCHEMA BUILDER ─────────────────────────────────────────────────── */
.schema-action-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-dropdown-container {
  position: relative;
}

.btn-schema-preset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.preset-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 6px;
  z-index: 50;
  min-width: 310px;
}

.preset-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-item:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.btn-schema-action {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-section {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn-add-section:hover {
  background: #f1f5f9;
}

.btn-add-field {
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: #ffffff;
}

.btn-add-field:hover {
  background: #1d4ed8;
}

.schema-tabs-row {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
  margin-bottom: 18px;
}

.schema-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.schema-tab-pill.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.tab-counter {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #475569;
}

.schema-tab-pill.active .tab-counter {
  background: #2563eb;
  color: #ffffff;
}

.empty-schema-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
}

.empty-schema-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.empty-schema-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

.empty-schema-desc {
  font-size: 12.5px;
  color: #64748b;
  max-width: 520px;
  margin: 6px auto 16px;
  line-height: 1.45;
}

.empty-schema-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.schema-table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.modern-schema-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.modern-schema-table thead th {
  background: #f8fafc;
  padding: 10px 14px;
  font-weight: 700;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.modern-schema-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.modern-schema-table tbody tr:last-child td {
  border-bottom: none;
}

.field-title-bold {
  font-weight: 700;
  color: #0f172a;
}

.field-placeholder-text {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.mono-key-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 7px;
  border-radius: 5px;
  color: #0369a1;
  font-family: monospace;
  font-size: 11.5px;
}

.field-type-chip {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
}

.options-tag {
  font-size: 10px;
  color: #64748b;
  margin-left: 6px;
}

.section-tag-pill {
  font-size: 11.5px;
  color: #475569;
}

.badge-req {
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
}

.badge-opt {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 11px;
}

.table-action-group {
  display: inline-flex;
  gap: 3px;
  align-items: center;
}

.btn-table-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-table-icon:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-table-icon:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-table-delete:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.sections-sorting-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.sort-hint {
  font-size: 11.5px;
  color: #64748b;
}

.sort-buttons-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.btn-sort-chip {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  font-size: 11px;
  padding: 2px 7px;
  color: #334155;
  cursor: pointer;
}

.btn-sort-chip:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.order-cell-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-pill {
  font-size: 11px;
  font-weight: 800;
  color: #1e40af;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.field-meta-id {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}

.sec-description-text {
  color: #475569;
  font-size: 12px;
  line-height: 1.4;
}

.fields-count-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 11px;
}

.schema-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-meta-text {
  font-size: 12px;
  color: #64748b;
}

/* ─── FLOATING SAVE BAR ──────────────────────────────────────────────── */
.floating-save-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: calc(100% - 48px);
  max-width: 820px;
}

.save-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 12px 20px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
  color: #ffffff;
  gap: 16px;
  flex-wrap: wrap;
}

.save-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-pulse-icon {
  font-size: 22px;
}

.save-bar-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #f8fafc;
}

.save-bar-desc {
  font-size: 11.5px;
  color: #94a3b8;
}

.save-bar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-discard {
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-discard:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.btn-save-floating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
  transition: all 0.15s;
}

.btn-save-floating:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-1px);
}

.bar-slide-enter-active,
.bar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bar-slide-enter-from,
.bar-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 25px);
}

/* ─── MODAL CUSTOM STYLES ────────────────────────────────────────────── */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card-custom {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 24px;
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-badge-icon {
  font-size: 20px;
}

.modal-heading-text {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.btn-close-custom {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.btn-close-custom:hover {
  color: #0f172a;
}

.modal-form-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
}

.modal-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 560px) {
  .modal-grid-2 {
    grid-template-columns: 1fr;
  }
}

.checkbox-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.animate-scale-up {
  animation: scale-up-anim 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-up-anim {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.req {
  color: #dc2626;
}
</style>
