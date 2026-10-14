<template>
  <div v-if="loading" class="loading-full-page">
    <div class="glass-card" style="padding: var(--space-12); text-align: center;">
      <div class="spinner"></div>
      <p class="text-muted" style="margin-top: var(--space-4);">Loading contract workspace…</p>
    </div>
  </div>

  <div v-else-if="error" class="loading-full-page">
    <div class="glass-card" style="padding: var(--space-12); text-align: center;">
      <h2>Contract Not Found</h2>
      <p class="text-muted">{{ error }}</p>
      <router-link to="/contracts" class="btn btn-secondary" style="margin-top: var(--space-4);">
        Back to Contracts
      </router-link>
    </div>
  </div>

  <div v-else class="contract-workspace">
    <!-- Top Workspace Header -->
    <header class="workspace-header">
      <div class="header-left">
        <router-link to="/contracts" class="btn-hdr-back" title="Back to All Contracts">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Contracts</span>
        </router-link>

        <div class="header-v-divider"></div>

        <div class="contract-id-tag">
          <h1 class="contract-heading">Contract #{{ contract.id }}</h1>
          <span class="status-indicator-chip" :class="getStatusBadgeClass(contract.state)">
            <span class="status-pulse-dot"></span>
            <span>{{ formatStatusLabel(contract.state) }}</span>
          </span>
          <span class="template-name-chip" :title="contract.template_name">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{{ contract.template_name || 'Standard Agreement' }}</span>
          </span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Copy Signing Link -->
        <button
          v-if="signingUrl"
          type="button"
          class="btn-hdr-action btn-hdr-secondary"
          :class="{ 'btn-hdr-copied': linkCopied }"
          @click="copySigningLink"
          title="Copy Public Client Signing Link"
        >
          <svg v-if="!linkCopied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{{ linkCopied ? 'Copied!' : 'Copy Link' }}</span>
        </button>

        <!-- Extend Expiry -->
        <button
          v-if="canExtend"
          type="button"
          class="btn-hdr-action btn-hdr-secondary"
          @click="openExtendModal"
          title="Extend contract validity and signing link expiry"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          <span>Extend Expiry</span>
        </button>

        <!-- Revoke -->
        <button
          v-if="canRevoke"
          type="button"
          class="btn-hdr-action btn-hdr-warning"
          @click="revokeContract"
          :disabled="revoking"
          title="Revoke and void this agreement"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <span>{{ revoking ? 'Revoking…' : 'Revoke' }}</span>
        </button>

        <!-- Delete Contract -->
        <button
          type="button"
          class="btn-hdr-action btn-hdr-danger"
          @click="deleteContract"
          :disabled="deleting"
          title="Permanently delete this contract"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
          <span>{{ deleting ? 'Deleting…' : 'Delete' }}</span>
        </button>

        <!-- If COMPLETED: Download Signed PDF -->
        <button
          v-if="contract.state === 'COMPLETED' || contract.ghl_file_url"
          type="button"
          class="btn-hdr-action btn-hdr-secondary"
          @click="downloadPdf"
          :disabled="downloadingPdf"
          title="Download official sealed PDF"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>{{ downloadingPdf ? 'Downloading…' : 'Download PDF' }}</span>
        </button>

        <!-- If COMPLETED: Client Summary Form -->
        <button
          v-if="(contract.state === 'COMPLETED' || contract.signed_at) && auth.hasClientSummaryAccess"
          type="button"
          class="btn-hdr-action btn-hdr-dark"
          @click="router.push(`/client-summary?contractId=${contract.id}`)"
          title="Open Post-Contract Client Summary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Client Summary</span>
        </button>

        <!-- Primary Action: SEND CONTRACT VIA GOHIGHLEVEL -->
        <button
          v-if="['READY', 'DRAFT', 'AWAITING_FORM'].includes(contract.state)"
          type="button"
          class="btn-hdr-action btn-hdr-primary"
          @click="openSendModal"
          :disabled="sending"
          title="Dispatch invitation via GoHighLevel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span>{{ sending ? 'Sending…' : 'Send via GHL' }}</span>
        </button>
      </div>
    </header>

    <!-- Send via GHL Conversation Modal -->
    <div v-if="showSendModal" class="modal-backdrop" @click.self="showSendModal = false">
      <div class="modal-card">
        <div class="modal-header-row">
          <div class="modal-icon-badge" style="background:#eff6ff; color:#2563eb;">
            💬
          </div>
          <div>
            <h3 class="modal-title">Send via GoHighLevel Conversation</h3>
            <p class="modal-subtitle">Auto-dispatch to client and log directly in GHL Conversation thread</p>
          </div>
          <button type="button" class="btn-modal-close" @click="showSendModal = false">✕</button>
        </div>

        <div style="background:var(--color-bg-secondary, #f8fafc); border:1px solid var(--color-border); border-radius:8px; padding:14px; margin-bottom:16px;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-secondary); margin-bottom:6px; letter-spacing:0.5px;">RECIPIENT CONTACT</div>
          <div style="font-weight:700; font-size:0.95rem; color:var(--color-text);">{{ contract.recipient_name || ghlContact?.name || 'Client' }}</div>
          <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:6px; font-size:0.82rem; color:var(--color-text-muted);">
            <span>📱 {{ contract.recipient_phone || ghlContact?.phone || 'No phone number' }}</span>
            <span>✉️ {{ contract.recipient_email || ghlContact?.email || 'No email' }}</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label class="section-micro-label">GHL DELIVERY CHANNELS:</label>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;" :style="!(contract.recipient_phone || ghlContact?.phone) ? 'opacity:0.6;' : ''">
              <input type="checkbox" v-model="sendChannels.sms" :disabled="!(contract.recipient_phone || ghlContact?.phone)" />
              <div style="font-size:0.85rem;">
                <strong>Send via SMS</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Direct text message from GHL to {{ contract.recipient_phone || ghlContact?.phone || 'client phone' }}</span>
              </div>
            </label>

            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;" :style="!(contract.recipient_email || ghlContact?.email) ? 'opacity:0.6;' : ''">
              <input type="checkbox" v-model="sendChannels.email" :disabled="!(contract.recipient_email || ghlContact?.email)" />
              <div style="font-size:0.85rem;">
                <strong>Send via Email</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Branded signing invitation from GHL to {{ contract.recipient_email || ghlContact?.email || 'client email' }}</span>
              </div>
            </label>

            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:6px; cursor:pointer;">
              <input type="checkbox" v-model="sendChannels.note" checked disabled />
              <div style="font-size:0.85rem;">
                <strong>GHL Internal Conversation Note</strong>
                <span class="text-muted" style="display:block; font-size:0.75rem;">Permanent audit entry inside the contact's GHL conversation thread</span>
              </div>
            </label>
          </div>
        </div>

        <div style="margin-bottom:18px;">
          <label class="section-micro-label">SIGNING LINK VALIDITY:</label>
          <div class="extend-pills">
            <button v-for="d in [1,3,7,14,30]" :key="d"
              type="button" class="validity-chip" :class="{ active: sendDays === d }"
              @click="sendDays = d">
              {{ d }} Day{{ d !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="showSendModal = false" :disabled="sending">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="executeSendContract" :disabled="sending">
            <span v-if="sending" class="spinner-inline">Sending via GHL…</span>
            <span v-else>🚀 Dispatch via GoHighLevel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Extend Expiry Modal -->
    <div v-if="showExtendModal" class="modal-backdrop" @click.self="showExtendModal = false">
      <div class="modal-card">
        <div class="modal-header-row">
          <div class="modal-icon-badge">
            ⏱️
          </div>
          <div>
            <h3 class="modal-title">Extend Contract Expiry</h3>
            <p class="modal-subtitle">Contract #{{ contract.id }} • {{ contract.template_name || 'Legal Agreement' }}</p>
          </div>
          <button type="button" class="btn-modal-close" @click="showExtendModal = false">✕</button>
        </div>

        <div class="modal-body-section">
          <!-- Live Expiry Comparison Card -->
          <div class="expiry-compare-box">
            <div class="compare-col">
              <span class="compare-label">CURRENT EXPIRY</span>
              <span class="compare-val text-muted">{{ contract.token_expires_at ? formatDate(contract.token_expires_at) : 'Not Dispatched' }}</span>
            </div>
            <div class="compare-arrow">➔</div>
            <div class="compare-col">
              <span class="compare-label">NEW EXPIRY DATE</span>
              <span class="compare-val text-primary font-bold">
                {{ formatProjectedDate(extendDays) }}
                <span class="badge badge-primary badge-sm" style="margin-left: 6px;">+{{ extendDays }}d</span>
              </span>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label class="section-micro-label">SELECT ADDITIONAL VALIDITY DAYS:</label>
            <div class="extend-pills">
              <button v-for="d in [1, 3, 7, 14, 30]" :key="d"
                type="button" class="validity-chip" :class="{ active: extendDays === d }"
                @click="extendDays = d">
                +{{ d }} Day{{ d !== 1 ? 's' : '' }}
              </button>
            </div>
          </div>

          <div class="form-group custom-days-block">
            <label class="section-micro-label">OR ENTER CUSTOM DAYS:</label>
            <div class="custom-days-row">
              <input type="number" v-model.number="extendDays" min="1" max="365" class="form-control custom-days-input" />
              <span class="custom-days-hint">Day(s) from right now</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="showExtendModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" @click="extendExpiry" :disabled="extending">
            <span v-if="extending">Extending…</span>
            <span v-else>✓ Save &amp; Extend Link</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Workspace Sub-Header Info Banner -->
    <div class="workspace-subbar">
      <div class="subbar-content">
        <!-- Client Recipient -->
        <div class="subbar-card-item">
          <div class="subbar-avatar" :style="{ backgroundColor: getAvatarColor(ghlContact?.name || contract.recipient_name || contract.ghl_contact_id) }">
            {{ getInitials(ghlContact?.name || contract.recipient_name || contract.ghl_contact_id) }}
          </div>
          <div class="subbar-text-group">
            <span class="subbar-label">Client Recipient</span>
            <span class="subbar-value" :title="ghlContact?.name || contract.recipient_name || contract.ghl_contact_id">
              {{ ghlContact?.name || contract.recipient_name || contract.ghl_contact_id || 'Client' }}
            </span>
            <span v-if="ghlContact?.email || contract.recipient_email" class="subbar-sub" :title="ghlContact?.email || contract.recipient_email">
              {{ ghlContact?.email || contract.recipient_email }}
            </span>
          </div>
        </div>

        <!-- Opportunity / Location -->
        <div class="subbar-card-item" v-if="contract.ghl_opportunity_id || contract.ghl_contact_id">
          <div class="subbar-icon-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <div class="subbar-text-group">
            <span class="subbar-label">GHL Opportunity</span>
            <span class="subbar-value">{{ ghlOpportunity?.name || contract.ghl_opportunity_id || 'Direct Pipeline' }}</span>
            <span class="subbar-sub" v-if="contract.ghl_contact_id">Contact: {{ contract.ghl_contact_id }}</span>
          </div>
        </div>

        <!-- Created Date -->
        <div class="subbar-card-item" :title="contract.created_at ? 'UAE: ' + formatUaeDateTime(contract.created_at) + ' | GMT: ' + formatGmtDateTime(contract.created_at) : ''">
          <div class="subbar-icon-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="subbar-text-group">
            <span class="subbar-label">Created On</span>
            <span class="subbar-value">{{ formatDate(contract.created_at) }}</span>
            <span class="subbar-sub">{{ formatRelativeDate(contract.created_at) }}</span>
          </div>
        </div>

        <!-- Expiry or Signed Date -->
        <div class="subbar-card-item" v-if="contract.signed_at">
          <div class="subbar-icon-box subbar-icon-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="subbar-text-group">
            <span class="subbar-label">Signed On</span>
            <span class="subbar-value text-success">{{ formatDate(contract.signed_at) }}</span>
            <span class="subbar-sub text-success">Verified &amp; Sealed</span>
          </div>
        </div>
        <div class="subbar-card-item" v-else-if="contract.token_expires_at">
          <div class="subbar-icon-box subbar-icon-warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <div class="subbar-text-group">
            <span class="subbar-label">Signing Expiry</span>
            <span class="subbar-value text-warning">{{ formatDate(contract.token_expires_at) }}</span>
            <span class="subbar-sub">Active signing token</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace Body with Tabs -->
    <div class="workspace-body">
      <!-- Nav Tabs -->
      <div class="workspace-tabs-row">
        <div class="workspace-tabs-bar">
          <button type="button" class="ws-tab" :class="{ active: activeTab === 'form' }" @click="activeTab = 'form'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Intake Form</span>
          </button>

          <button type="button" class="ws-tab" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Document Preview</span>
          </button>

          <button type="button" class="ws-tab" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'; fetchTimeline()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
            </svg>
            <span>Activity</span>
            <span class="ws-tab-count">{{ timeline.length }}</span>
          </button>

          <button type="button" class="ws-tab" :class="{ active: activeTab === 'audit' }" @click="activeTab = 'audit'; fetchAuditLogs()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Audit Trail</span>
            <span class="ws-tab-count">{{ auditLogs.length }}</span>
          </button>
        </div>
      </div>

      <!-- ─── TAB 1: INTAKE FORM ───────────────────────────────────────────── -->
      <div v-show="activeTab === 'form'" class="tab-content animate-fade-in">
        <div class="intake-tab-layout">
          <!-- Left: Main Form Card -->
          <div class="glass-card form-container-card">
            <div class="form-header-box">
              <div>
                <div class="form-header-title-row">
                  <h3 class="form-main-heading">Contract Intake &amp; Custom Fields</h3>
                  <span v-if="saveStatus === 'saved'" class="status-saved-pill">
                    <span class="saved-dot"></span> Synced with HighLevel
                  </span>
                  <span v-else-if="saveStatus === 'saving'" class="status-saving-pill">
                    <span class="saving-spinner"></span> Saving…
                  </span>
                </div>
                <p class="form-sub-text">
                  {{ isReadOnly ? 'This contract has been frozen for signature or completed. Form inputs are locked.' : 'Fill or edit fields below. Changes are debounced and synced automatically with HighLevel.' }}
                </p>
              </div>
            </div>

            <div v-if="!formFields.length" class="empty-form-notice">
              <div class="empty-notice-icon">📄</div>
              <h4>No Intake Form Attached</h4>
              <p>This contract template generates directly from standard agreement clauses without custom questionnaire fields.</p>
            </div>

            <form v-else class="intake-form-grid" @submit.prevent>
              <div
                v-for="f in formFields"
                :key="f.id"
                class="form-field-item"
                :class="{ full: f.type === 'textarea' || f.type === 'file' }"
              >
                <label class="form-field-label">
                  <span>{{ f.label }}</span>
                  <span v-if="f.required" class="req-star">*</span>
                  <span v-if="f.ghlFieldId" class="ghl-tag-badge" title="Mapped to GoHighLevel Custom Field">GHL</span>
                </label>

                <!-- Text / Number / Currency / Date -->
                <input
                  v-if="['text', 'number', 'currency', 'date'].includes(f.type)"
                  :type="f.type === 'number' || f.type === 'currency' ? 'number' : f.type === 'date' ? 'date' : 'text'"
                  v-model="formResponses[f.key]"
                  class="field-input-box"
                  :disabled="isReadOnly"
                  :placeholder="f.placeholder || `Enter ${f.label.toLowerCase()}…`"
                  @input="onFormInput"
                />

                <!-- Textarea -->
                <textarea
                  v-else-if="f.type === 'textarea'"
                  v-model="formResponses[f.key]"
                  class="field-input-box field-textarea"
                  rows="3"
                  :disabled="isReadOnly"
                  :placeholder="f.placeholder"
                  @input="onFormInput"
                ></textarea>

                <!-- Dropdown -->
                <div v-else-if="f.type === 'dropdown'" class="select-field-wrapper">
                  <select
                    v-model="formResponses[f.key]"
                    class="field-input-box field-select"
                    :disabled="isReadOnly"
                    @change="onFormInput"
                  >
                    <option value="">{{ f.placeholder || '-- Select an option --' }}</option>
                    <option v-for="(opt, oi) in (f.options || [])" :key="oi" :value="opt.value || opt">
                      {{ opt.label || opt }}
                    </option>
                  </select>
                </div>

                <!-- Checkbox -->
                <label v-else-if="f.type === 'checkbox'" class="field-check-label">
                  <input
                    type="checkbox"
                    v-model="formResponses[f.key]"
                    :disabled="isReadOnly"
                    @change="onFormInput"
                  />
                  <span>{{ f.placeholder || f.label }}</span>
                </label>

                <small v-if="f.helpText" class="field-help-text">{{ f.helpText }}</small>
              </div>
            </form>
          </div>

          <!-- Right: Sidebar Workspace Cards -->
          <div class="intake-sidebar">
            <!-- Sidebar Card 1: Public Signing Link -->
            <div class="glass-card sidebar-panel-card" v-if="signingUrl">
              <div class="panel-card-header">
                <div class="panel-header-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <span>Client Signing Portal</span>
                </div>
                <span class="badge-mini-live">Live</span>
              </div>
              <p class="panel-card-desc">
                Public signing portal link generated for the client to review and sign digitally.
              </p>
              <div class="signing-url-box">
                <input type="text" :value="signingUrl" readonly class="signing-url-input" />
                <button
                  type="button"
                  class="btn-copy-url"
                  :class="{ copied: linkCopied }"
                  @click="copySigningLink"
                  :title="linkCopied ? 'Copied!' : 'Copy to Clipboard'"
                >
                  <svg v-if="!linkCopied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ linkCopied ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
              <div class="panel-actions-sub">
                <a :href="signingUrl" target="_blank" class="link-open-portal">
                  <span>Open Client Portal</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              </div>
            </div>

            <!-- Sidebar Card 2: Quick GHL Dispatch Card -->
            <div class="glass-card sidebar-panel-card" v-if="['READY', 'DRAFT', 'AWAITING_FORM'].includes(contract.state)">
              <div class="panel-card-header">
                <div class="panel-header-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span>Dispatch via HighLevel</span>
                </div>
              </div>
              <p class="panel-card-desc">
                Send signing invitation directly to client's phone and email via GoHighLevel automations.
              </p>
              <div class="panel-dispatch-channels">
                <span class="channel-tag" :class="{ inactive: !(contract.recipient_phone || ghlContact?.phone) }">
                  📱 SMS {{ contract.recipient_phone || ghlContact?.phone ? 'Ready' : 'No Phone' }}
                </span>
                <span class="channel-tag" :class="{ inactive: !(contract.recipient_email || ghlContact?.email) }">
                  ✉️ Email {{ contract.recipient_email || ghlContact?.email ? 'Ready' : 'No Email' }}
                </span>
                <span class="channel-tag">
                  📝 Conversation Note
                </span>
              </div>
              <button
                type="button"
                class="btn-sidebar-dispatch"
                @click="openSendModal"
                :disabled="sending"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span>{{ sending ? 'Sending…' : 'Send via GoHighLevel' }}</span>
              </button>
            </div>

            <!-- Sidebar Card 3: Summary Details -->
            <div class="glass-card sidebar-panel-card">
              <div class="panel-card-header">
                <div class="panel-header-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Contract Snapshot</span>
                </div>
              </div>
              <div class="snapshot-list">
                <div class="snapshot-row">
                  <span class="snapshot-key">Reference #</span>
                  <span class="snapshot-val font-mono">#{{ contract.id }}</span>
                </div>
                <div class="snapshot-row">
                  <span class="snapshot-key">Lifecycle State</span>
                  <span class="snapshot-val">{{ formatStatusLabel(contract.state) }}</span>
                </div>
                <div class="snapshot-row">
                  <span class="snapshot-key">Template</span>
                  <span class="snapshot-val" :title="contract.template_name">{{ contract.template_name || 'Standard' }}</span>
                </div>
                <div class="snapshot-row" v-if="contract.assigned_user_name">
                  <span class="snapshot-key">Assigned Agent</span>
                  <span class="snapshot-val">{{ contract.assigned_user_name }}</span>
                </div>
                <div class="snapshot-row">
                  <span class="snapshot-key">Application</span>
                  <span class="snapshot-val">{{ contract.form_mode === 'TEAM' ? 'Team / Family' : 'Individual' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB 2: DOCUMENT PREVIEW ──────────────────────────────────────── -->
      <div v-show="activeTab === 'preview'" class="tab-content animate-fade-in">
        <!-- If raw HTML template contract (e.g. Cyprus 12-page paired table) -->
        <div v-if="isHtmlContract" class="html-contract-preview-wrapper">
          <div class="html-preview-topbar glass-card">
            <div>
              <span class="badge badge-success badge-sm">12-Page Bilingual Legal Agreement</span>
              <h4 style="margin: 4px 0 0; font-size: 1.05rem;">{{ documentSchema?.title || contract.template_name }}</h4>
              <p style="margin: 2px 0 0; font-size: 0.8rem; color: #64748b;">
                Contract Ref: #{{ contract.id }} • Recipient: {{ ghlContact?.name || contract.ghl_contact_id }} • Status: {{ contract.state }}
              </p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <a v-if="signingUrl" :href="signingUrl" target="_blank" class="btn btn-secondary btn-sm">
                🔗 Client Sign Portal ↗
              </a>
            </div>
          </div>
          <div class="html-contract-canvas-inner" v-html="renderedContractHtml"></div>
        </div>

        <!-- Standard structured blocks document -->
        <div v-else class="paper-preview-container">
          <div class="paper-document">
            <h1 class="paper-title">{{ documentSchema?.title || contract.template_name }}</h1>
            <div class="paper-meta-row">
              <span>Contract Reference: #{{ contract.id }}</span>
              <span>Recipient: {{ ghlContact?.name || contract.ghl_contact_id }}</span>
              <span>Status: {{ contract.state }}</span>
            </div>

            <div class="paper-sep"></div>

            <div class="paper-blocks-list">
              <template v-for="b in (documentSchema?.blocks || [])" :key="b.id">
                <div v-if="b.type === 'clause'" class="p-clause">
                  <h3 v-if="b.title" class="p-clause-title">{{ b.title }}</h3>
                  <div class="p-clause-body">{{ interpolate(b.content) }}</div>
                </div>

                <div v-else-if="b.type === 'table'" class="p-table-box">
                  <h4 v-if="b.title" class="p-clause-title">{{ b.title }}</h4>
                  <table class="p-table">
                    <thead v-if="b.headers">
                      <tr>
                        <th v-for="(h, hi) in b.headers" :key="hi">{{ h }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in (b.rows || [])" :key="ri">
                        <td v-for="(cell, ci) in row" :key="ci">{{ interpolate(cell) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-else-if="b.type === 'key_value'" class="p-kv-box">
                  <h4 v-if="b.title" class="p-clause-title">{{ b.title }}</h4>
                  <div class="p-kv-grid">
                    <div v-for="(v, k) in (b.data || {})" :key="k" class="p-kv-row">
                      <span class="p-k">{{ k }}:</span>
                      <span class="p-v">{{ interpolate(v) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="b.type === 'signature'" class="p-sig-box">
                  <div class="p-sig-line">
                    <span v-if="contract.signed_at" class="text-success">
                      ✓ Digitally signed by {{ ghlContact?.name || 'Client' }} on {{ formatDate(contract.signed_at) }}
                    </span>
                    <span v-else class="text-muted">
                      {{ b.label || 'Client Authorized Signature Required' }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB 3: AUDIT TRAIL ───────────────────────────────────────────── -->
      <div v-show="activeTab === 'audit'" class="tab-content animate-fade-in">
        <div class="glass-card audit-card">
          <div class="audit-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3>Contract Audit Trail</h3>
              <p class="text-muted">
                Immutable chronological record of every view, form edit, signature, and HighLevel sync event. (All events auto-sync to GoHighLevel internal comments in real time).
              </p>
            </div>
            <button
              v-if="auditLogs.length"
              type="button"
              class="btn btn-secondary btn-sm"
              @click="syncAuditLogsToGhl"
              :disabled="syncingAuditToGhl"
              style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; white-space: nowrap;"
              title="Push all recorded audit events to GoHighLevel internal comments and contact notes"
            >
              <span v-if="syncingAuditToGhl" class="spinner-inline">Syncing…</span>
              <span v-else>💬 Sync to GHL Internal Comments</span>
            </button>
          </div>

          <div v-if="loadingAudit" style="padding: var(--space-6); text-align: center;">
            <div class="spinner"></div>
          </div>

          <div v-else-if="!auditLogs.length" class="empty-audit">
            <p class="text-muted">No audit events recorded yet.</p>
          </div>

          <div v-else class="audit-timeline">
            <div
              v-for="log in auditLogs"
              :key="log.id"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="log.action.toLowerCase()"></div>
              <div class="timeline-content">
                <div class="timeline-top">
                  <strong>{{ formatAuditAction(log.action) }}</strong>
                  <div class="rt-time-block">
                    <!-- UAE Time -->
                    <div class="rt-time-row uae-row" :title="'UAE Time (Gulf Standard Time, UTC+4)'">
                      <span class="rt-badge-tz uae-tz">{{ isUaeTimeSameAsClient ? 'UAE & Client' : 'UAE' }}</span>
                      <span class="rt-time-val">{{ formatUaeDateTime(log.created_at) }}</span>
                    </div>

                    <!-- Client Time (if different from UAE) -->
                    <div v-if="!isUaeTimeSameAsClient" class="rt-time-row client-row" :title="'Client Local Time: ' + clientTzLabel(log.created_at)">
                      <span class="rt-badge-tz client-tz">Client ({{ clientTzAbbr(log.created_at) }})</span>
                      <span class="rt-time-val">{{ formatClientDateTime(log.created_at) }}</span>
                    </div>

                    <!-- GMT Time -->
                    <div class="rt-time-row gmt-row" :title="'Greenwich Mean Time (UTC)'">
                      <span class="rt-badge-tz gmt-tz">GMT</span>
                      <span class="rt-time-val">{{ formatGmtDateTime(log.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <div class="timeline-meta text-muted small-text">
                  <span>Actor: <strong>{{ log.actor_name || log.actor_id }}</strong> ({{ log.actor_type }})</span>
                  <span v-if="log.from_state && log.to_state">
                    • State: {{ log.from_state }} → <strong>{{ log.to_state }}</strong>
                  </span>
                  <span v-if="log.ip_address">• IP: {{ formatIp(log.ip_address) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB: ACTIVITY TIMELINE ─────────────────────────────────────── -->
      <div v-show="activeTab === 'timeline'" class="tab-content animate-fade-in">
        <div class="glass-card" style="padding: var(--space-6);">
          <div class="submissions-header">
            <div>
              <h3>Activity Timeline</h3>
              <p class="text-muted">
                Full event history — tracked across 
                <strong style="color: #065f46;">UAE Time</strong>, 
                <strong style="color: #0369a1;">Client Time</strong> ({{ activeClientTzLabel }}), and 
                <strong style="color: #64748b;">GMT</strong>.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <select v-model="selectedClientTz" class="tz-select" title="Switch Client Timezone">
                <option value="AUTO">Auto Client ({{ autoClientTzLabel }})</option>
                <option value="Asia/Dubai">🇦🇪 UAE (GST, +04:00)</option>
                <option value="Europe/London">🇬🇧 London (GMT/BST)</option>
                <option value="America/New_York">🇺🇸 New York (EDT/EST, -04:00)</option>
                <option value="America/Chicago">🇺🇸 Chicago (CDT/CST, -05:00)</option>
                <option value="America/Los_Angeles">🇺🇸 Los Angeles (PDT/PST, -07:00)</option>
                <option value="Asia/Riyadh">🇸🇦 Saudi Arabia (AST, +03:00)</option>
                <option value="Asia/Qatar">🇶🇦 Qatar (+03:00)</option>
                <option value="Asia/Karachi">🇵🇰 Pakistan (PKT, +05:00)</option>
                <option value="Asia/Kolkata">🇮🇳 India (IST, +05:30)</option>
                <option value="Asia/Manila">🇵🇭 Philippines (PHT, +08:00)</option>
                <option value="Asia/Singapore">🇸🇬 Singapore (SGT, +08:00)</option>
                <option value="Australia/Sydney">🇦🇺 Sydney (AEST, +10:00)</option>
                <option value="Europe/Paris">🇫🇷 Paris/CET (+01:00)</option>
                <option value="UTC">🌐 UTC / GMT</option>
              </select>
              <button class="btn btn-secondary btn-sm" @click="fetchTimeline">Refresh</button>
            </div>
          </div>

          <div v-if="loadingTimeline" style="text-align:center; padding:32px;">
            <div class="spinner"></div>
          </div>

          <div v-else-if="!timeline.length" class="empty-form-notice">
            No activity recorded yet.
          </div>

          <div v-else class="rich-timeline">
            <div v-for="(evt, i) in timeline" :key="i" class="rt-item">
              <div class="rt-track">
                <div class="rt-icon" :class="'rt-color-' + getTimelineConfig(evt.action).color">
                  <span>{{ getTimelineConfig(evt.action).icon }}</span>
                </div>
                <div v-if="i < timeline.length - 1" class="rt-connector"></div>
              </div>
              <div class="rt-card">
                <div class="rt-top">
                  <div class="rt-heading-group">
                    <span class="rt-title">{{ getTimelineConfig(evt.action).label }}</span>
                    <span class="rt-badge" :class="'badge-' + getTimelineConfig(evt.action).color">
                      {{ evt.action }}
                    </span>
                  </div>
                  <div class="rt-time-block">
                    <!-- UAE Time -->
                    <div class="rt-time-row uae-row" :title="'UAE Time (Gulf Standard Time, UTC+4)'">
                      <span class="rt-badge-tz uae-tz">{{ isUaeTimeSameAsClient ? 'UAE & Client' : 'UAE' }}</span>
                      <span class="rt-time-val">{{ formatUaeDateTime(evt.createdAt || evt.created_at) }}</span>
                    </div>

                    <!-- Client Time (if different from UAE) -->
                    <div v-if="!isUaeTimeSameAsClient" class="rt-time-row client-row" :title="'Client Local Time: ' + clientTzLabel(evt.createdAt || evt.created_at)">
                      <span class="rt-badge-tz client-tz">Client ({{ clientTzAbbr(evt.createdAt || evt.created_at) }})</span>
                      <span class="rt-time-val">{{ formatClientDateTime(evt.createdAt || evt.created_at) }}</span>
                    </div>

                    <!-- GMT Time -->
                    <div class="rt-time-row gmt-row" :title="'Greenwich Mean Time (UTC)'">
                      <span class="rt-badge-tz gmt-tz">GMT</span>
                      <span class="rt-time-val">{{ formatGmtDateTime(evt.createdAt || evt.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <div class="rt-meta">
                  <span v-if="evt.actorName" class="rt-actor">
                    by <strong>{{ evt.actorName }}</strong>
                  </span>
                  <span v-if="evt.ipAddress" class="rt-ip">
                    <span class="rt-dot">•</span> IP: <code>{{ formatIp(evt.ipAddress) }}</code>
                  </span>
                  <router-link
                    v-if="['CLIENT_SUMMARY_COMPLETED', 'CLIENT_SUMMARY_SAVED', 'CLIENT_SUMMARY_PENDING', 'CLIENT_SUMMARY_READY', 'CLIENT_SUMMARY_INITIALIZED'].includes(evt.action)"
                    :to="`/client-summary?contractId=${contract.id}`"
                    class="btn btn-secondary btn-sm"
                    style="margin-left: auto; padding: 3px 10px; font-size: 0.76rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;"
                  >
                    📋 Open Client Summary ➔
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'
import { DEFAULT_COMPANY_STAMP, DEFAULT_COMPANY_SIGNATURE } from '../constants/defaultAssets'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const contractId = route.params.id

const loading = ref(true)
const error   = ref('')
const contract = ref({})
const ghlContact = ref(null)
const ghlOpportunity = ref(null)
const formFields = ref([])
const documentSchema = ref(null)

const activeTab = ref('form')
const formResponses = ref({})
const saveStatus = ref('')
const sending = ref(false)
const linkCopied = ref(false)

// Timeline / Audit
const auditLogs = ref([])
const loadingAudit = ref(false)
const timeline = ref([])
const loadingTimeline = ref(false)

// Extend / Revoke
const showExtendModal = ref(false)
const extendDays = ref(7)
const extending = ref(false)
const revoking  = ref(false)
const deleting  = ref(false)
const downloadingPdf = ref(false)

// GHL Send Modal
const showSendModal = ref(false)
const sendDays = ref(7)
const sendChannels = ref({
  sms: true,
  email: true,
  note: true,
})

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

const isReadOnly = computed(() => {
  return ['SENT', 'VIEWED', 'SIGNED', 'SIGNED_PENDING_STORAGE', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(contract.value?.state)
})

async function fetchContract() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}`, { headers: getHeaders() })
    contract.value = res.data.contract
    ghlContact.value = res.data.ghlContact
    ghlOpportunity.value = res.data.ghlOpportunity

    // Form schema
    const rawForm = contract.value.form_schema
    if (rawForm) {
      const parsed = typeof rawForm === 'string' ? JSON.parse(rawForm) : rawForm
      formFields.value = parsed.fields || []
    }

    // Document schema
    const rawDoc = contract.value.document_schema_json
    if (rawDoc) {
      documentSchema.value = typeof rawDoc === 'string' ? JSON.parse(rawDoc) : rawDoc
    }

    // Form responses
    const rawResponses = contract.value.form_response_json
    const initialResponses = rawResponses
      ? (typeof rawResponses === 'string' ? JSON.parse(rawResponses) : rawResponses)
      : {}

    // Prepopulate with contact/opportunity values if empty
    if (ghlContact.value) {
      if (!initialResponses.client_name && ghlContact.value.name) {
        initialResponses.client_name = ghlContact.value.name
      }
      if (!initialResponses.client_email && ghlContact.value.email) {
        initialResponses.client_email = ghlContact.value.email
      }
      if (!initialResponses.client_phone && ghlContact.value.phone) {
        initialResponses.client_phone = ghlContact.value.phone
      }
    }

    formResponses.value = initialResponses

    // Fetch audit logs & activity timeline in background so tab badge counters populate immediately
    fetchAuditLogs()
    fetchTimeline()
  } catch (err) {
    console.error('Fetch contract detail error:', err)
    error.value = 'Failed to load contract details. Check access permissions.'
  } finally {
    loading.value = false
  }
}

let debounceTimer = null
function onFormInput() {
  if (isReadOnly.value) return
  saveStatus.value = 'saving'
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      await axios.patch(
        `${apiBase}/contracts/${contractId}/form`,
        {
          formResponse: formResponses.value,
        },
        { headers: getHeaders() }
      )
      saveStatus.value = 'saved'
      setTimeout(() => { if (saveStatus.value === 'saved') saveStatus.value = '' }, 3000)
    } catch (err) {
      console.warn('Form save error:', err)
      saveStatus.value = ''
    }
  }, 600)
}

function openSendModal() {
  let defaultDays = 7
  if (contract.value?.validity_days) {
    defaultDays = contract.value.validity_days
  } else if (contract.value?.token_expires_at) {
    const diffMs = new Date(contract.value.token_expires_at).getTime() - Date.now()
    if (diffMs > 0) {
      defaultDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)))
    }
  }
  sendDays.value = defaultDays
  sendChannels.value = {
    sms: !!(contract.value?.recipient_phone || ghlContact.value?.phone),
    email: !!(contract.value?.recipient_email || ghlContact.value?.email),
    note: true,
  }
  showSendModal.value = true
}

function openExtendModal() {
  extendDays.value = 7
  showExtendModal.value = true
}

function formatProjectedDate(days) {
  const num = parseInt(days) || 1
  const d = new Date(Date.now() + num * 24 * 60 * 60 * 1000)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function executeSendContract() {
  sending.value = true
  try {
    const selectedChannels = []
    if (sendChannels.value.sms) selectedChannels.push('sms')
    if (sendChannels.value.email) selectedChannels.push('email')

    const res = await axios.post(
      `${apiBase}/contracts/${contractId}/send`,
      {
        validityDays: sendDays.value,
        channels: selectedChannels,
      },
      { headers: getHeaders() }
    )

    showSendModal.value = false
    const msg = res.data.message || 'Contract dispatched successfully via GoHighLevel Conversation!'
    alert(`${msg}\n\nSigning Link:\n${res.data.signingUrl || res.data.signingLink}`)
    fetchContract()
  } catch (err) {
    console.error('Send contract error:', err)
    alert(err.response?.data?.error || 'Failed to dispatch contract via GoHighLevel.')
  } finally {
    sending.value = false
  }
}

const signingUrl = computed(() => {
  if (!contract.value.signing_token) return ''
  return `${window.location.origin}/sign/${contract.value.signing_token}`
})

const canExtend = computed(() => {
  const s = contract.value.state
  return s && !['SIGNED', 'COMPLETED', 'REVOKED', 'CANCELLED'].includes(s)
})

const canRevoke = computed(() => {
  const s = contract.value.state
  return s && !['SIGNED', 'COMPLETED', 'REVOKED', 'CANCELLED'].includes(s)
})

function copySigningLink() {
  if (!signingUrl.value) return
  navigator.clipboard?.writeText(signingUrl.value).catch(() => {})
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2500)
}

function timelineEmoji(action) {
  const map = {
    CONTRACT_CREATED:   '📄',
    CONTRACT_SENT:      '📤',
    CONTRACT_VIEWED:    '👁',
    FORM_STARTED:       '✏️',
    FORM_COMPLETED:     '✅',
    FORM_PROGRESS:      '💾',
    AGREEMENT_REVIEWED: '📖',
    CONTRACT_SIGNED:    '✍️',
    PDF_UPLOADED:       '🗂️',
    CONTRACT_COMPLETED: '🏁',
    CLIENT_SUMMARY_INITIALIZED: '📋',
    CLIENT_SUMMARY_PENDING:     '⏳',
    CLIENT_SUMMARY_READY:       '⏳',
    CLIENT_SUMMARY_SAVED:       '📝',
    CLIENT_SUMMARY_COMPLETED:   '✅',
    EXPIRY_EXTENDED:    '⏱️',
    CONTRACT_REVOKED:   '🚫',
    CONTRACT_CANCELLED: '❌',
    CONTRACT_EXPIRED:   '⏰',
  }
  return map[action] || '•'
}

function timelineIconClass(action) {
  if (['CONTRACT_SIGNED', 'CONTRACT_COMPLETED', 'PDF_UPLOADED'].includes(action)) return 'rt-icon--success'
  if (['CONTRACT_REVOKED', 'CONTRACT_CANCELLED', 'CONTRACT_EXPIRED'].includes(action)) return 'rt-icon--danger'
  if (['CONTRACT_SENT', 'EXPIRY_EXTENDED'].includes(action)) return 'rt-icon--primary'
  return 'rt-icon--neutral'
}

function formatIp(ip) {
  if (!ip) return '—'
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') return '127.0.0.1 (Localhost)'
  return String(ip).replace(/^::ffff:/, '')
}

async function fetchAuditLogs() {
  loadingAudit.value = true
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}/audit`, { headers: getHeaders() })
    auditLogs.value = res.data.auditLogs || []
  } catch (err) {
    console.warn('Audit fetch error:', err)
  } finally {
    loadingAudit.value = false
  }
}

const syncingAuditToGhl = ref(false)
async function syncAuditLogsToGhl() {
  syncingAuditToGhl.value = true
  try {
    const res = await axios.post(`${apiBase}/contracts/${contractId}/sync-ghl-notes`, {}, { headers: getHeaders() })
    alert(res.data.message || 'Audit trail events synced to GoHighLevel!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to sync audit logs to GHL.')
  } finally {
    syncingAuditToGhl.value = false
  }
}

async function fetchTimeline() {
  loadingTimeline.value = true
  try {
    const res = await axios.get(`${apiBase}/contracts/${contractId}/events`, { headers: getHeaders() })
    timeline.value = res.data.timeline || []
  } catch (err) {
    // Fall back to audit logs mapped as timeline
    timeline.value = auditLogs.value.map(l => ({
      action: l.action,
      actorName: l.actor_name || l.actor_id,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
    }))
  } finally {
    loadingTimeline.value = false
  }
}

async function extendExpiry() {
  extending.value = true
  try {
    const res = await axios.post(`${apiBase}/contracts/${contractId}/extend`, { extraDays: extendDays.value }, { headers: getHeaders() })
    showExtendModal.value = false
    alert(`✓ Expiry extended! New link: ${res.data.signingUrl}`)
    fetchContract()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to extend expiry.')
  } finally {
    extending.value = false
  }
}

async function revokeContract() {
  const result = await Swal.fire({
    title: 'Revoke Contract?',
    text: 'Are you sure you want to revoke this contract? The public signing link will immediately stop working.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, Revoke',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })

  if (!result.isConfirmed) return

  revoking.value = true
  try {
    await axios.post(`${apiBase}/contracts/${contractId}/revoke`, {}, { headers: getHeaders() })
    Swal.fire({
      title: 'Revoked!',
      text: 'Contract has been revoked successfully.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
    fetchContract()
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.response?.data?.error || 'Failed to revoke contract.',
      icon: 'error',
      confirmButtonColor: '#2563eb',
    })
  } finally {
    revoking.value = false
  }
}

async function deleteContract() {
  const c = contract.value || {}
  const result = await Swal.fire({
    title: 'Delete Contract?',
    html: `Are you sure you want to delete contract <strong>#${c.id || contractId}</strong> (${c.recipient_name || 'Client'})?<br><br><span style="color:#ef4444;font-size:0.9em;">This action cannot be undone and will permanently remove this contract and its audit trail.</span>`,
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

  deleting.value = true
  try {
    await axios.delete(`${apiBase}/contracts/${contractId}`, { headers: getHeaders() })
    await Swal.fire({
      title: 'Deleted!',
      text: `Contract #${contractId} was permanently deleted.`,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false,
    })
    router.push('/contracts')
  } catch (err) {
    console.error('Delete contract error:', err)
    Swal.fire({
      title: 'Failed to Delete',
      text: err.response?.data?.message || err.response?.data?.error || 'Failed to delete contract.',
      icon: 'error',
      confirmButtonColor: '#2563eb',
    })
  } finally {
    deleting.value = false
  }
}

function interpolate(text) {
  if (!text) return ''
  let out = text
  for (const [k, v] of Object.entries(formResponses.value || {})) {
    const reg = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
    out = out.replace(reg, v || '')
  }
  if (ghlContact.value?.name) {
    out = out.replace(/\{\{client_name\}\}/g, ghlContact.value.name)
  }
  return out
}

const isHtmlContract = computed(() => {
  const snap = typeof contract.value?.snapshot_json === 'string'
    ? JSON.parse(contract.value.snapshot_json)
    : contract.value?.snapshot_json

  return !!(snap?.rawHtml || documentSchema.value?.rawHtml || documentSchema.value?.type === 'HTML')
})

const renderedContractHtml = computed(() => {
  let raw = ''
  let css = ''
  const snap = typeof contract.value?.snapshot_json === 'string'
    ? JSON.parse(contract.value.snapshot_json)
    : contract.value?.snapshot_json

  if (snap?.rawHtml) {
    raw = snap.rawHtml
    css = snap.customCss || ''
  } else if (documentSchema.value?.rawHtml) {
    raw = documentSchema.value.rawHtml
    css = documentSchema.value.customCss || ''
  }

  if (!raw) return ''

  const resp = formResponses.value || {}
  const contact = ghlContact.value || {}
  const snapFd = snap?.formData || snap?.formResponse || {}

  // Merge form responses
  const fd = { ...snapFd, ...resp }

  // Tag signatures
  let html = raw.replace(
    /([\s\S]{1,300})(<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>)/gi,
    (match, precedingText, sigDiv) => {
      const clientIndex = Math.max(
        precedingText.lastIndexOf('Applicant'),
        precedingText.lastIndexOf('applicant'),
        precedingText.lastIndexOf('Client'),
        precedingText.lastIndexOf('client'),
        precedingText.lastIndexOf('المتقدم'),
        precedingText.lastIndexOf('العميل'),
        precedingText.lastIndexOf('المتعاقد')
      )
      const companyIndex = Math.max(
        precedingText.lastIndexOf('360GI'),
        precedingText.lastIndexOf('360 Global'),
        precedingText.lastIndexOf('شركة 360')
      )

      let targetField = ''
      if (clientIndex !== -1 && companyIndex !== -1) {
        targetField = clientIndex > companyIndex ? 'signature.client' : 'signature.company'
      } else if (clientIndex !== -1) {
        targetField = 'signature.client'
      } else if (companyIndex !== -1) {
        targetField = 'signature.company'
      }

      if (targetField) {
        return precedingText + sigDiv.replace(/class=["']([^"']*)["']/, `class="$1" data-field="${targetField}"`)
      }
      return match
    }
  )

  html = html.replace(/(<section\b[^>]*class=["'][^"']*\bpage-11\b[^"']*["'][\s\S]*?<\/section>)/gi, (pageMatch) => {
    let count = 0
    return pageMatch.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, (sigDiv) => {
      count++
      const field = (count % 2 === 1) ? 'signature.client' : 'signature.company'
      return sigDiv.replace(/class=["']([^"']*)["']/, `class="$1" data-field="${field}"`)
    })
  })

  html = html.replace(/(<section\b[^>]*class=["'][^"']*\bpage-12\b[^"']*["'][\s\S]*?<\/section>)/gi, (pageMatch) => {
    return pageMatch.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, (sigDiv) => {
      return sigDiv.replace(/class=["']([^"']*)["']/, 'class="$1" data-field="signature.client"')
    })
  })

  const fullName = fd.client_name || fd.recipientName || contact.name || 'Valued Client'
  const passportOrEid = fd.passport_number || fd.passport_eid || contact.passport || '—'
  const nationality = fd.nationality || contact.nationality || '—'
  const mobile = fd.phone || fd.mobile || contact.phone || '—'
  const address = fd.address || contact.address1 || '—'
  const email = fd.client_email || fd.email || contact.email || '—'
  const dateOfBirth = fd.date_of_birth || fd.dob || '—'
  const dependents = fd.dependents || fd.note || 'Spouse & Kids under 18 are included.'

  const totalFees = fd.contract_value || '20,000 EUR'
  const totalAfterDiscount = fd.discounted_amount || fd.contract_value || '15,000 EUR'
  const currencyText = fd.currency || 'THE GREAT BRITAIN POUND (GBP)'
  const paymentMode = fd.payment_terms || '50% Upon Signing, 50% on Approval'
  const additionalInfo = fd.visa_type || fd.additional_information || 'Standard Legal & Immigration Advisory'

  const scheduleThreeContent = fd.schedule_three_content || fd.payment_breakup || fd.commercial_terms || '50% Initial Deposit upon signing, 50% upon Visa Approval'
  const initialAmount = fd.discounted_amount || fd.initial_deposit || '15,000 EUR'

  const rawContractDate = fd.contract_date || contract.value?.created_at
  let formattedContractDate = '—'
  try {
    if (rawContractDate && /^\d{4}-\d{2}-\d{2}$/.test(String(rawContractDate).trim())) {
      const [y, m, d] = String(rawContractDate).trim().split('-').map(Number)
      formattedContractDate = new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } else if (rawContractDate) {
      formattedContractDate = new Date(rawContractDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  } catch {
    formattedContractDate = String(rawContractDate)
  }

  const replacements = {
    'logo_url': 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png',
    'company_logo': 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png',
    'applicant.full_name': fullName,
    'applicant.name': fullName,
    'client_name': fullName,
    'recipient_name': fullName,
    'main_applicant': fd.main_applicant || fullName,

    'applicant.passport_or_eid': passportOrEid,
    'applicant.passport': passportOrEid,
    'passport_number': passportOrEid,
    'passport_eid': passportOrEid,
    'passport': passportOrEid,
    'idNumber': passportOrEid,

    'applicant.nationality': nationality,
    'nationality': nationality,

    'applicant.mobile': mobile,
    'applicant.phone': mobile,
    'mobile': mobile,
    'phone': mobile,

    'applicant.address': address,
    'address': address,

    'applicant.email': email,
    'client_email': email,
    'email': email,

    'applicant.date_of_birth': dateOfBirth,
    'applicant.dob': dateOfBirth,
    'date_of_birth': dateOfBirth,
    'dob': dateOfBirth,

    'applicant.dependents': dependents,
    'dependents': dependents,
    'note': dependents,

    'jurisdiction': fd.jurisdiction || 'Courts of the Dubai International Financial Centre (“the DIFC COURTS”)',

    'total_fees': totalFees,
    'fees.total_fees': totalFees,
    'discounted_total': totalAfterDiscount,
    'total_after_discount': totalAfterDiscount,
    'fees.total_after_discount': totalAfterDiscount,
    'contract_value': totalFees,

    'fees.currency_text': currencyText,
    'currency': currencyText,

    'fees.payment_mode': paymentMode,
    'payment_mode': paymentMode,
    'payment_terms': paymentMode,

    'fees.additional_information': additionalInfo,
    'additional_information': additionalInfo,
    'visa_type': additionalInfo,

    'fees.payment_breakup': scheduleThreeContent,
    'payment_breakup': scheduleThreeContent,
    'schedule_three_content': scheduleThreeContent,
    'schedule_three': scheduleThreeContent,
    'commercial_terms': scheduleThreeContent,
    'fees.commercial_terms': scheduleThreeContent,
    'fees.schedule_three': scheduleThreeContent,
    'milestones': scheduleThreeContent,
    'fees.milestones': scheduleThreeContent,

    'fees.initial_amount': initialAmount,
    'initial_amount': initialAmount,
    'discounted_amount': initialAmount,
    'initial_deposit': initialAmount,

    'contract.date': formattedContractDate,
    'contract_date': formattedContractDate,
    'acceptance_date': formattedContractDate,
    'declaration_date': formattedContractDate,
    'date': formattedContractDate,
    'today': formattedContractDate,
    'today_date': formattedContractDate,
  }

  for (const [k, v] of Object.entries(fd)) {
    if (v !== undefined && v !== null && v !== '') {
      replacements[k] = String(v)
    }
  }

  html = html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const k = key.trim()
    if (replacements[k] !== undefined) return replacements[k]

    const lowerK = k.toLowerCase()
    for (const [rk, rv] of Object.entries(replacements)) {
      if (rk.toLowerCase() === lowerK) return rv
    }

    return '—'
  })
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')

  // Inject Company Signature & Stamp into .signature-line
  const companySig = contract.value?.companySignature || snap?.companySignature || DEFAULT_COMPANY_SIGNATURE;
  const companySeal = contract.value?.companyStamp || snap?.companyStamp || DEFAULT_COMPANY_STAMP;
  if (companySig || companySeal) {
    let companyContent = '';
    if (companySig) {
      companyContent += `<img src="${companySig}" alt="Company Signature" class="comp-sig-img" style="max-height: 13mm; max-width: 82%; display: block; position: relative; z-index: 2;" />`;
    }
    if (companySeal) {
      companyContent += `<img src="${companySeal}" alt="Company Seal" class="comp-stamp-img" style="max-height: 22mm; position: absolute; right: 2mm; top: -5mm; opacity: 0.88; transform: rotate(-5deg); z-index: 1; pointer-events: none;" />`;
    }
    html = html.replace(
      /<div\b[^>]*\bdata-field=["']signature\.company["'][^>]*>[\s\S]*?<\/div>/gi,
      `<div class="signature-line signed" data-field="signature.company" style="display:flex;align-items:center;justify-content:center;position:relative;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${companyContent}</div>`
    );
  }

  // Official company stamp on every page (except cover)
  html = html.replace(/<div class=["']page-official-stamp["'][^>]*>[\s\S]*?<\/div>/gi, '')
  if (companySeal) {
    const pageStampHtml = `<div class="page-official-stamp" style="position: absolute; right: 18mm; bottom: 3.2mm; z-index: 9; pointer-events: none;"><img src="${companySeal}" alt="Company Stamp" style="max-height: 19mm; max-width: 24mm; opacity: 0.86; transform: rotate(-6deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12)); display: block;" /></div>`
    html = html.replace(/(<section\b[^>]*class=["'][^"']*\bpage\b[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/gi, (match, open, body, close) => {
      if (/\bcover\b/i.test(open)) return match
      return `${open}${body}${pageStampHtml}${close}`
    })
  }

  return `<style>${css}</style>\n${html}`
})

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
    REVOKED:                'status-cancelled',
    DECLINED:               'status-cancelled',
  }
  return map[state] || 'status-neutral'
}

function formatStatusLabel(state) {
  const map = {
    DRAFT:                  'Draft',
    AWAITING_FORM:          'Awaiting Form',
    READY:                  'Ready to Send',
    SENT:                   'Sent to Client',
    VIEWED:                 'Opened by Client',
    OPENED:                 'Opened by Client',
    IN_PROGRESS:            'In Progress',
    SIGNED:                 'Signed',
    SIGNED_PENDING_STORAGE: 'Syncing GHL',
    COMPLETED:              'Completed & Sealed',
    EXPIRED:                'Expired',
    CANCELLED:              'Cancelled',
    REVOKED:                'Revoked',
    DECLINED:               'Declined',
  }
  return map[state] || state
}

function getTimelineConfig(action) {
  const configs = {
    CONTRACT_CREATED:   { icon: '📄', label: 'Contract Created', color: 'indigo' },
    CONTRACT_OPENED:    { icon: '👁️', label: 'Client Opened Contract', color: 'blue' },
    CONTRACT_VIEWED:    { icon: '👁️', label: 'Client Viewed Link', color: 'blue' },
    FORM_STARTED:       { icon: '✏️', label: 'Client Started Intake Form', color: 'amber' },
    FORM_PROGRESS:      { icon: '💾', label: 'Form Progress Autosaved', color: 'teal' },
    FORM_UPDATED:       { icon: '✏️', label: 'Intake Form Updated', color: 'teal' },
    FORM_COMPLETED:     { icon: '✅', label: 'Intake Form Completed', color: 'emerald' },
    AGREEMENT_REVIEWED: { icon: '📖', label: 'Agreement Reviewed', color: 'blue' },
    CONTRACT_READY:     { icon: '📋', label: 'Contract Marked Ready', color: 'blue' },
    CONTRACT_SENT:      { icon: '📤', label: 'Contract Sent to Client', color: 'indigo' },
    IN_PROGRESS:        { icon: '✍️', label: 'Client Filling Details', color: 'amber' },
    CONTRACT_SIGNED:    { icon: '✍️', label: 'Signed by Client', color: 'emerald' },
    PDF_UPLOADED:       { icon: '🗂️', label: 'PDF Generated & Stored', color: 'purple' },
    CONTRACT_COMPLETED: { icon: '🏁', label: 'Fully Completed & Sealed', color: 'emerald' },
    CLIENT_SUMMARY_INITIALIZED: { icon: '📋', label: 'Client Summary Initialized', color: 'blue' },
    CLIENT_SUMMARY_PENDING:     { icon: '⏳', label: 'Client Summary Pending Review', color: 'amber' },
    CLIENT_SUMMARY_READY:       { icon: '⏳', label: 'Client Summary Ready to Fill', color: 'amber' },
    CLIENT_SUMMARY_SAVED:       { icon: '📝', label: 'Client Summary Draft Saved', color: 'teal' },
    CLIENT_SUMMARY_COMPLETED:   { icon: '✅', label: 'Client Summary Completed', color: 'emerald' },
    EXPIRY_EXTENDED:    { icon: '⏱️', label: 'Signing Expiry Extended', color: 'amber' },
    CONTRACT_EXPIRED:   { icon: '⏰', label: 'Signing Link Expired', color: 'rose' },
    CONTRACT_REVOKED:   { icon: '🚫', label: 'Contract Revoked', color: 'rose' },
    CONTRACT_CANCELLED: { icon: '❌', label: 'Contract Cancelled', color: 'rose' },
  }

  const key = String(action || '').toUpperCase()
  return configs[key] || {
    icon: '⚡',
    label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    color: 'neutral',
  }
}

function formatAuditAction(action) {
  const map = {
    CONTRACT_CREATED:    'Contract Created',
    CONTRACT_OPENED:     'Client Opened Contract',
    FORM_UPDATED:        'Intake Form Updated',
    FORM_PROGRESS:       'Form Progress Saved',
    FORM_STARTED:        'Client Started Form',
    FORM_COMPLETED:      'Form Completed',
    AGREEMENT_REVIEWED:  'Agreement Reviewed',
    CONTRACT_READY:      'Marked Ready',
    CONTRACT_SENT:       'Sent to Client',
    CONTRACT_VIEWED:     'Client Opened Link',
    IN_PROGRESS:         'Client Filling Form',
    CONTRACT_SIGNED:     'Signed by Client',
    PDF_UPLOADED:        'PDF Sealed & Uploaded',
    CONTRACT_COMPLETED:  'Fully Completed',
    CLIENT_SUMMARY_INITIALIZED: 'Client Summary Initialized',
    CLIENT_SUMMARY_PENDING:     'Client Summary Pending',
    CLIENT_SUMMARY_READY:       'Client Summary Ready to Fill',
    CLIENT_SUMMARY_SAVED:       'Client Summary Draft Saved',
    CLIENT_SUMMARY_COMPLETED:   'Client Summary Completed',
    CONTRACT_EXPIRED:    'Link Expired',
    CONTRACT_CANCELLED:  'Cancelled',
    CONTRACT_REVOKED:    'Revoked',
    EXPIRY_EXTENDED:     'Expiry Extended',
  }
  return map[action] || action
}

function parseSafeDate(d) {
  if (!d) return null
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d
  if (typeof d === 'string') {
    let s = d.trim()
    if (!s) return null
    // If it's a bare SQL string like "2026-10-14 21:15:27" or "2026-10-14T21:15:27" without timezone indicator
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      s = s.replace(' ', 'T') + (s.includes('Z') ? '' : 'Z')
    }
    const parsed = new Date(s)
    if (!isNaN(parsed.getTime())) return parsed
  }
  const fallback = new Date(d)
  return isNaN(fallback.getTime()) ? null : fallback
}

function formatDate(d) {
  if (!d) return ''
  const date = parseSafeDate(d)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    timeZone: UAE_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(d) {
  if (!d) return ''
  const date = parseSafeDate(d)
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return ''
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

const UAE_TIMEZONE = 'Asia/Dubai'
const selectedClientTz = ref('AUTO')

const detectedClientTz = computed(() => {
  return ghlContact.value?.timezone ||
         contract.value?.client_timezone ||
         contract.value?.snapshot?.ghlContact?.timezone ||
         contract.value?.snapshot?.contact?.timezone ||
         Intl.DateTimeFormat().resolvedOptions().timeZone ||
         'Asia/Dubai'
})

const activeClientTz = computed(() => {
  return selectedClientTz.value === 'AUTO' ? detectedClientTz.value : selectedClientTz.value
})

const autoClientTzLabel = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: detectedClientTz.value, timeZoneName: 'short' }).formatToParts(new Date())
    const abbr = parts.find(p => p.type === 'timeZoneName')?.value || ''
    const contactName = ghlContact.value?.name ? ` • ${ghlContact.value.name}` : ''
    return `${abbr || detectedClientTz.value}${contactName}`
  } catch {
    return detectedClientTz.value
  }
})

const activeClientTzLabel = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: activeClientTz.value, timeZoneName: 'short' }).formatToParts(new Date())
    const abbr = parts.find(p => p.type === 'timeZoneName')?.value || ''
    return abbr ? `${abbr} (${activeClientTz.value})` : activeClientTz.value
  } catch {
    return activeClientTz.value
  }
})

const isUaeTimeSameAsClient = computed(() => {
  try {
    const now = new Date()
    const uaeStr = now.toLocaleString('en-US', { timeZone: UAE_TIMEZONE, hour: '2-digit', minute: '2-digit' })
    const clientStr = now.toLocaleString('en-US', { timeZone: activeClientTz.value, hour: '2-digit', minute: '2-digit' })
    return uaeStr === clientStr
  } catch {
    return activeClientTz.value === UAE_TIMEZONE
  }
})

function formatUaeDateTime(d) {
  if (!d) return ''
  try {
    const date = parseSafeDate(d)
    if (!date) return String(d)
    return date.toLocaleString('en-US', {
      timeZone: UAE_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return String(d)
  }
}

function formatClientDateTime(d) {
  if (!d) return ''
  try {
    const date = parseSafeDate(d)
    if (!date) return String(d)
    return date.toLocaleString('en-US', {
      timeZone: activeClientTz.value,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return String(d)
  }
}

function formatGmtDateTime(d) {
  if (!d) return ''
  try {
    const date = parseSafeDate(d)
    if (!date) return ''
    return date.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ''
  }
}

function clientTzAbbr(d) {
  try {
    const date = d ? (parseSafeDate(d) || new Date()) : new Date()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: activeClientTz.value, timeZoneName: 'short' }).formatToParts(date)
    return parts.find(p => p.type === 'timeZoneName')?.value || activeClientTz.value
  } catch {
    return ''
  }
}

function clientTzLabel(d) {
  const abbr = clientTzAbbr(d)
  return `${activeClientTz.value}${abbr ? ' • ' + abbr : ''}`
}

function formatDateTime(d) {
  return formatUaeDateTime(d)
}

function printDocument() {
  const content = renderedContractHtml.value || (document.querySelector('.paper-document')?.innerHTML || '')
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    window.print()
    return
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contract #${contractId}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ${documentSchema.value?.customCss || ''}
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          }
        <\/script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

// ─── Download PDF (Agent only) ────────────────────────────────────────────────
async function downloadPdf() {
  if (downloadingPdf.value) return
  downloadingPdf.value = true
  try {
    // 1. Primary: Download via authenticated agent endpoint (works in any contract state)
    const res = await axios.get(
      `${apiBase}/contracts/${contractId}/pdf`,
      { headers: getHeaders(), responseType: 'blob' }
    )
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `contract_${contractId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return
  } catch (err) {
    console.warn('[Download PDF] Primary endpoint failed, attempting fallbacks…', err?.message)

    // 2. Fallback: if signing_token is available, try signing endpoint
    if (contract.value?.signing_token) {
      try {
        const res2 = await axios.get(
          `${apiBase}/sign/${contract.value.signing_token}/pdf`,
          { headers: getHeaders(), responseType: 'blob' }
        )
        const blob2 = new Blob([res2.data], { type: 'application/pdf' })
        const url2  = URL.createObjectURL(blob2)
        const a2    = document.createElement('a')
        a2.href     = url2
        a2.download = `contract_${contractId}.pdf`
        document.body.appendChild(a2)
        a2.click()
        document.body.removeChild(a2)
        URL.revokeObjectURL(url2)
        return
      } catch (e2) {
        console.warn('[Download PDF] Sign token endpoint fallback failed:', e2?.message)
      }
    }

    // 3. Fallback: direct GHL file URL
    if (contract.value?.ghl_file_url) {
      try {
        const fileRes = await axios.get(contract.value.ghl_file_url, { responseType: 'blob' })
        const blob3 = new Blob([fileRes.data], { type: 'application/pdf' })
        const url3 = URL.createObjectURL(blob3)
        const a3 = document.createElement('a')
        a3.href = url3
        a3.download = `contract_${contractId}.pdf`
        document.body.appendChild(a3)
        a3.click()
        document.body.removeChild(a3)
        URL.revokeObjectURL(url3)
        return
      } catch (ghlErr) {
        window.open(contract.value.ghl_file_url, '_blank')
        return
      }
    }

    // 4. Fallback: Client-side print / save to PDF
    if (renderedContractHtml.value || isHtmlContract.value) {
      printDocument()
      return
    }

    alert('Unable to download PDF. Please try again or use the browser print dialog.')
  } finally {
    downloadingPdf.value = false
  }
}

onMounted(() => {
  fetchContract()
  fetchAuditLogs()
  fetchTimeline()
})
</script>

<style scoped>
/* ─── TYPOGRAPHY LOCK & APP ROOT ─────────────────────────────────────── */
.contract-workspace,
.contract-workspace * {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  box-sizing: border-box;
}

.contract-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 20px 80px;
  color: #0f172a;
}

.loading-full-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── TOP WORKSPACE HEADER ───────────────────────────────────────────── */
.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-hdr-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}
.btn-hdr-back:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.header-v-divider {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
}

.contract-id-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.contract-heading {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.015em;
}

.template-name-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Indicators */
.status-indicator-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.status-pulse-dot {
  width: 6px;
  height: 6px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-hdr-action {
  height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap !important;
  box-sizing: border-box;
}

.btn-hdr-secondary {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.btn-hdr-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.btn-hdr-copied {
  background: #ecfdf5 !important;
  border-color: #34d399 !important;
  color: #059669 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15) !important;
}

.btn-hdr-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}
.btn-hdr-warning:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #f59e0b;
}

.btn-hdr-danger {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #64748b;
}
.btn-hdr-danger:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.15);
}

.btn-hdr-dark {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}
.btn-hdr-dark:hover:not(:disabled) {
  background: #1e293b;
}

.btn-hdr-primary {
  background: #2563eb;
  border-color: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25);
}
.btn-hdr-primary:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

/* ─── WORKSPACE SUB-BAR ──────────────────────────────────────────────── */
.workspace-subbar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.subbar-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.subbar-card-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.subbar-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.subbar-icon-success { background: #dcfce7; color: #16a34a; }
.subbar-icon-warning { background: #fef3c7; color: #d97706; }

.subbar-text-group {
  display: flex;
  flex-direction: column;
}

.subbar-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.subbar-value {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.subbar-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* ─── WORKSPACE TABS ─────────────────────────────────────────────────── */
.workspace-tabs-row {
  margin-top: 2px;
}

.workspace-tabs-bar {
  display: inline-flex;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.ws-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ws-tab:hover {
  color: #0f172a;
  background: #f8fafc;
}

.ws-tab.active {
  background: #2563eb;
  color: #ffffff;
}

.ws-tab-count {
  font-size: 10px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 1px 6px;
  border-radius: 10px;
}
.ws-tab.active .ws-tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ─── INTAKE TAB 2-COLUMN LAYOUT & FORM ──────────────────────────────── */
.intake-tab-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1080px) {
  .intake-tab-layout {
    grid-template-columns: 1fr;
  }
}

.form-container-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 22px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.form-header-box {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.form-header-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.form-main-heading {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.status-saved-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  padding: 2px 8px;
  border-radius: 12px;
}

.saved-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #16a34a;
}

.status-saving-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #0369a1;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  padding: 2px 8px;
  border-radius: 12px;
}

.form-sub-text {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0 0;
  line-height: 1.45;
}

.empty-form-notice {
  text-align: center;
  padding: 40px 20px;
}
.empty-notice-icon {
  font-size: 32px;
  margin-bottom: 10px;
}
.empty-form-notice h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}
.empty-form-notice p {
  font-size: 12px;
  color: #64748b;
  max-width: 440px;
  margin: 0 auto;
}

.intake-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .intake-form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-field-item.full {
  grid-column: span 2;
}
@media (max-width: 640px) {
  .form-field-item.full {
    grid-column: span 1;
  }
}

.form-field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.req-star {
  color: #ef4444;
  font-weight: 700;
}

.ghl-tag-badge {
  font-size: 9.5px;
  font-weight: 700;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 0 5px;
  border-radius: 4px;
}

.field-input-box {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}
.field-input-box:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.field-input-box:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.field-textarea {
  height: auto;
  padding: 10px 12px;
  font-family: inherit;
  resize: vertical;
}

.select-field-wrapper {
  position: relative;
}

.field-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 32px;
}

.field-check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
}
.field-check-label input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
}

.field-help-text {
  font-size: 11px;
  color: #94a3b8;
}

/* ─── SIDEBAR PANELS ─────────────────────────────────────────────────── */
.intake-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-panel-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.panel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-header-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.panel-header-title svg {
  color: #2563eb;
}

.badge-mini-live {
  font-size: 9.5px;
  font-weight: 700;
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 1px 6px;
  border-radius: 10px;
}

.panel-card-desc {
  font-size: 11.5px;
  color: #64748b;
  margin: 0 0 12px;
  line-height: 1.4;
}

.signing-url-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 4px;
}

.signing-url-input {
  flex: 1;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 11.5px;
  color: #475569;
  padding: 0 8px;
  outline: none;
  font-family: ui-monospace, SFMono-Regular, monospace !important;
}

.btn-copy-url {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-copy-url:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.btn-copy-url.copied {
  background: #ecfdf5;
  border-color: #34d399;
  color: #059669;
}

.panel-actions-sub {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.link-open-portal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}
.link-open-portal:hover {
  text-decoration: underline;
}

.panel-dispatch-channels {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.channel-tag {
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 5px 8px;
  border-radius: 6px;
}
.channel-tag.inactive {
  opacity: 0.5;
  color: #94a3b8;
}

.btn-sidebar-dispatch {
  width: 100%;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: #ffffff;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25);
  transition: all 0.15s;
}
.btn-sidebar-dispatch:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.35);
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.snapshot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #f1f5f9;
}
.snapshot-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.snapshot-key {
  color: #64748b;
  font-weight: 500;
}

.snapshot-val {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Document Paper Tab */
.paper-preview-container {
  display: flex;
  justify-content: center;
  padding: var(--space-6) 0;
}

.paper-document {
  background: #ffffff;
  color: #0f172a;
  border-radius: var(--radius-lg);
  padding: var(--space-12) var(--space-10);
  max-width: 840px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.paper-title {
  font-family: var(--font-heading);
  font-size: 1.85rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.paper-meta-row {
  display: flex;
  gap: var(--space-6);
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: var(--space-6);
}

.paper-sep {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: var(--space-6);
}

.paper-blocks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.p-clause-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.p-clause-body {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.7;
}

.p-table {
  width: 100%;
  border-collapse: collapse;
}

.p-table th, .p-table td {
  border: 1px solid #e2e8f0;
  padding: var(--space-2) var(--space-3);
  text-align: left;
}

.p-table th {
  background: #f1f5f9;
}

.p-kv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.p-sig-box {
  border: 2px dashed #94a3b8;
  border-radius: var(--radius-md);
  padding: var(--space-6);
  background: #f8fafc;
  margin-top: var(--space-4);
}

.p-sig-line {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 6px;
  font-weight: 600;
}

/* Audit Trail Tab */
.audit-card {
  padding: var(--space-8);
  max-width: 860px;
}

.audit-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.audit-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: relative;
  padding-left: var(--space-6);
  border-left: 2px solid var(--color-border);
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -31px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg-card);
}

.timeline-dot.contract_signed, .timeline-dot.contract_completed {
  background: var(--color-success);
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ── HTML Contract Preview Canvas ── */
.html-contract-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-bottom: 60px;
}

.html-preview-topbar {
  width: 210mm;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  margin-bottom: 24px;
}

.html-contract-canvas-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.html-contract-canvas-inner :deep(.page) {
  margin: 0 auto 16mm;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.14);
}

/* ── Rich Activity Timeline Styling ── */
.rich-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: var(--space-4);
  position: relative;
}

.rt-item {
  display: flex;
  gap: var(--space-4);
  position: relative;
}

.rt-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}

.rt-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rt-connector {
  width: 2px;
  flex: 1;
  min-height: 28px;
  background: var(--color-border);
  margin: 4px 0;
}

.rt-card {
  flex: 1;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.rt-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.rt-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.rt-heading-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rt-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.rt-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 12px;
}

.rt-time-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  gap: 3px;
  flex-shrink: 0;
}

.rt-time-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.25;
  white-space: nowrap;
}

.rt-time-row.uae-row {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.rt-time-row.client-row {
  font-size: 0.76rem;
  font-weight: 500;
  color: #0369a1;
}

.rt-time-row.gmt-row {
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.rt-badge-tz {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.2;
}

.rt-badge-tz.uae-tz {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.rt-badge-tz.client-tz {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.rt-badge-tz.gmt-tz {
  background: var(--color-bg-subtle, #f1f5f9);
  color: var(--color-text-muted, #475569);
  border: 1px solid var(--color-border, #e2e8f0);
}

.tz-select {
  font-size: 0.74rem;
  padding: 4px 8px;
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--color-border, #cbd5e1);
  background: var(--color-bg-card, #ffffff);
  color: var(--color-text-main, #334155);
  font-weight: 500;
  cursor: pointer;
}

.rt-meta {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.rt-actor strong {
  color: var(--color-text-main);
}

.rt-ip code {
  background: var(--color-bg-subtle, #f1f5f9);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-main);
}

.rt-dot {
  color: var(--color-text-muted);
  margin: 0 2px;
}

/* Timeline colors */
.rt-color-indigo { background: #eef2ff; border: 1.5px solid #c7d2fe; }
.rt-color-blue   { background: #eff6ff; border: 1.5px solid #bfdbfe; }
.rt-color-emerald{ background: #ecfdf5; border: 1.5px solid #a7f3d0; }
.rt-color-teal   { background: #f0fdfa; border: 1.5px solid #99f6e4; }
.rt-color-amber  { background: #fffbeb; border: 1.5px solid #fde68a; }
.rt-color-purple { background: #faf5ff; border: 1.5px solid #e9d5ff; }
.rt-color-rose   { background: #fff1f2; border: 1.5px solid #fecdd3; }
.rt-color-neutral{ background: #f8fafc; border: 1.5px solid #e2e8f0; }

.badge-indigo { background: #eef2ff; color: #4338ca; }
.badge-blue   { background: #eff6ff; color: #1d4ed8; }
.badge-emerald{ background: #ecfdf5; color: #047857; }
.badge-teal   { background: #f0fdfa; color: #0f766e; }
.badge-amber  { background: #fffbeb; color: #b45309; }
.badge-purple { background: #faf5ff; color: #6b21a8; }
.badge-rose   { background: #fff1f2; color: #be123c; }
.badge-neutral{ background: #f1f5f9; color: #475569; }

/* ── Modern Modal & Validity Controls ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
  animation: modalFadeIn 0.15s ease-out;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 520px;
  padding: 24px;
  position: relative;
  animation: modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fdf2f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-subtitle {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

.btn-modal-close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 1.15rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.expiry-compare-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 18px;
  gap: 12px;
}

.compare-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.compare-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #64748b;
  text-transform: uppercase;
}

.compare-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.compare-arrow {
  color: #94a3b8;
  font-size: 1.2rem;
}

.section-micro-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #475569;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.extend-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.validity-chip {
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.validity-chip:hover {
  border-color: #94a3b8;
  color: #0f172a;
  background: #f8fafc;
  transform: translateY(-1px);
}

.validity-chip.active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);
}

.custom-days-block {
  margin-top: 14px;
}

.custom-days-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-days-input {
  max-width: 100px;
  height: 38px;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
  font-size: 0.95rem;
}

.custom-days-hint {
  font-size: 0.8rem;
  color: #64748b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
</style>
