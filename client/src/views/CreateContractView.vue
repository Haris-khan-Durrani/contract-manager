<template>
  <div class="create-contract-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">Create Contract</h1>
        <p class="page-subtitle">Configure applicant details, commercial terms, and generate the client signing link.</p>
      </div>
      <div class="header-actions">
        <router-link to="/contracts" class="btn btn-secondary">← Back to Contracts</router-link>
      </div>
    </div>

    <div class="page-body animate-fade-in">

      <!-- ──── CREATION FORM ────────────────────────────────────────────── -->
      <div v-if="!createdContract" class="create-layout">

        <!-- LEFT: Main Form Card -->
        <div class="create-main">
          <div class="glass-card main-form-card">

            <!-- SECTION 1: Agreement Template & Contract Date -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">📄</span>
                <div>
                  <h3 class="section-title">1. Agreement Template &amp; Contract Date</h3>
                  <p class="section-sub">Select your template and execution date. Variables and Schedule One applicant details will be linked automatically.</p>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group" style="position: relative;" ref="templateSearchContainerRef">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="field-label" style="margin-bottom: 0;">Contract Template <span class="req">*</span></label>
                    <span v-if="templates.length" style="font-size: 0.75rem; color: #64748b; font-weight: 500;">
                      {{ templates.length }} available templates
                    </span>
                  </div>

                  <div v-if="loadingTemplates" class="spinner-inline">Loading templates…</div>
                  <div v-else class="template-combobox-wrap">
                    <!-- Search Input Box -->
                    <div class="template-search-bar" :class="{ 'has-selection': !!selectedTemplate }">
                      <div class="search-input-wrap">
                        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                          type="text"
                          v-model="templateSearch"
                          class="form-control search-input template-input"
                          placeholder="Search template by name, country, visa type (e.g. Cyprus, France, CBI)..."
                          @focus="onTemplateSearchFocus"
                          @input="onTemplateSearchInput"
                          @keydown.esc="showTemplateDropdown = false"
                        />
                        <button
                          v-if="templateSearch"
                          type="button"
                          class="clear-input-btn"
                          @click="clearTemplateSearch"
                          title="Clear search"
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          class="dropdown-arrow-btn"
                          @click="toggleTemplateDropdown"
                          :title="showTemplateDropdown ? 'Close list' : 'Open list'"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="showTemplateDropdown ? 'transform: rotate(180deg);' : ''" style="transition: transform 0.2s ease;">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Dropdown Results Floating Menu -->
                    <div v-if="showTemplateDropdown" class="template-results-dropdown animate-fade-in">
                      <div class="dropdown-header-bar">
                        <span class="dropdown-header-count">
                          <strong>{{ filteredTemplates.length }}</strong> template{{ filteredTemplates.length === 1 ? '' : 's' }}
                          <template v-if="templateSearch && (!selectedTemplate || templateSearch.toLowerCase() !== selectedTemplate.name.toLowerCase())">
                            matching "<span class="dropdown-header-query">{{ templateSearch }}</span>"
                          </template>
                        </span>
                        <span v-if="selectedTemplate" class="dropdown-active-hint">
                          ✓ {{ selectedTemplate.name.slice(0, 22) }}… selected
                        </span>
                      </div>

                      <div class="template-results-list">
                        <div
                          v-for="t in filteredTemplates"
                          :key="t.id"
                          class="template-result-row"
                          :class="{ selected: form.templateId === t.id }"
                          @click="selectTemplate(t)"
                        >
                          <div class="template-result-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                          </div>
                          <div class="template-result-meta">
                            <div class="template-result-title-row">
                              <span class="template-result-name">{{ t.name }}</span>
                              <span class="badge badge-neutral badge-xs">v{{ t.current_version || 1 }}</span>
                            </div>
                            <div class="template-result-tags">
                              <span v-if="t.contract_type" class="type-tag">{{ t.contract_type }}</span>
                              <span v-if="t.form_name" class="form-tag">📋 {{ t.form_name }}</span>
                            </div>
                          </div>
                          <div class="template-result-status">
                            <span v-if="form.templateId === t.id" class="badge badge-primary badge-xs">Active</span>
                            <span v-else class="select-indicator-hint">Select</span>
                          </div>
                        </div>

                        <div v-if="filteredTemplates.length === 0" class="no-templates-found">
                          <div style="font-size: 1.5rem; margin-bottom: 4px;">🔍</div>
                          <strong>No templates found</strong>
                          <p style="margin: 4px 0 10px; font-size: 0.82rem; color: #64748b;">
                            No agreement matches "<strong>{{ templateSearch }}</strong>". Try searching for country, visa name, or "CBI".
                          </p>
                          <button type="button" class="btn btn-secondary btn-xs" @click="clearTemplateSearch">
                            Show All {{ templates.length }} Templates
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Selected Template Banner / Confirmation Chip -->
                    <div v-if="selectedTemplate" class="selected-template-chip animate-fade-in">
                      <div class="selected-template-info">
                        <span class="chip-check-badge">✓</span>
                        <div class="chip-details">
                          <span class="chip-sub-label">Selected Agreement:</span>
                          <strong class="chip-name">{{ selectedTemplate.name }}</strong>
                          <span class="badge badge-neutral badge-xs" style="margin-left: 6px;">v{{ selectedTemplate.current_version || 1 }}</span>
                          <span v-if="selectedTemplate.contract_type" class="badge badge-neutral badge-xs" style="margin-left: 4px;">
                            {{ selectedTemplate.contract_type }}
                          </span>
                        </div>
                      </div>
                      <div class="chip-actions">
                        <button type="button" class="btn-chip-action" @click="openTemplatePicker" title="Pick another template">
                          Change Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="field-label">Contract Execution Date <span class="req">*</span></label>
                  <input
                    type="date"
                    v-model="formResponses['contract_date']"
                    class="form-control"
                    title="Agreement execution date shown across the contract (Schedule, Page 11, Page 12)"
                  />
                  <small style="display:block; margin-top:4px; font-size:0.75rem; color:var(--color-text-muted);">
                    Select the signing / agreement date appearing on page 11, 12, etc. (Defaults to today).
                  </small>
                </div>
              </div>

              <!-- Linked Form Banner -->
              <div v-if="selectedTemplate" class="linked-form-banner animate-fade-in" style="margin-top: 14px;">
                <div class="linked-form-icon">📋</div>
                <div class="linked-form-content">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="linked-form-label">Attached Legal Intake Form:</span>
                    <strong>{{ selectedTemplate.form_name || 'Standard Client Intake Form' }}</strong>
                    <span v-if="templateFormFields.length" class="badge badge-success badge-xs">
                      {{ templateFormFields.length }} Dynamic Field{{ templateFormFields.length === 1 ? '' : 's' }}
                    </span>
                    <span v-else class="badge badge-neutral badge-xs">Standard Fields</span>
                  </div>
                  <small v-if="templateFormFields.length">
                    All {{ templateFormFields.length }} intake specifications are brought in front below (Section 3) and automatically saved to the contract workspace.
                  </small>
                  <small v-else>
                    Schedule One and commercial variables will be populated from your entries below.
                  </small>
                </div>
                <span class="badge badge-success badge-xs">Auto-Linked</span>
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- SECTION 2: GHL Lead Lookup -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">🔍</span>
                <div>
                  <h3 class="section-title">2. Find GoHighLevel Lead / Contact</h3>
                  <p class="section-sub">Search and select a contact to automatically fill applicant &amp; intake details below.</p>
                </div>
              </div>

              <div class="form-group" style="position: relative;" ref="searchContainerRef">
                <div class="ghl-search-bar">
                  <div class="search-input-wrap">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      v-model="contactSearch"
                      class="form-control search-input"
                      placeholder="Search contacts by name, email, or phone…"
                      @focus="onSearchFocus"
                      @input="onSearchInput"
                      @keydown.esc="showContactDropdown = false"
                    />
                  </div>
                  <button type="button" class="btn btn-secondary btn-search" @click="triggerSearch">
                    Search
                  </button>
                </div>

                <!-- Dropdown Results -->
                <div v-if="showContactDropdown" class="contact-results-dropdown animate-fade-in">
                  <div v-if="loadingContacts" class="dropdown-loading-row">
                    <span class="spinner-inline">Searching contacts…</span>
                  </div>
                  <div
                    v-for="c in filteredContacts"
                    :key="c.id || c.opportunityId"
                    class="contact-result-row"
                    :class="{ selected: form.ghlContactId === c.id }"
                    @click="selectContact(c)"
                  >
                    <div class="contact-initial">{{ (c.name || c.email || '?')[0].toUpperCase() }}</div>
                    <div class="contact-meta">
                      <strong>{{ c.name || 'Unnamed Contact' }}</strong>
                      <span>{{ c.email || 'No email' }} · {{ c.phone || 'No phone' }}</span>
                    </div>
                    <span v-if="c.pipelineStageName || c.opportunityName" class="badge badge-neutral badge-xs">
                      {{ c.pipelineStageName || c.opportunityName }}
                    </span>
                  </div>
                  <div v-if="!loadingContacts && filteredContacts.length === 0" style="padding: 14px 16px; font-size: 0.82rem; color: var(--color-text-muted); text-align: center;">
                    No contacts found in GoHighLevel{{ contactSearch ? ` matching "${contactSearch}"` : '' }}.
                  </div>
                </div>

                <!-- Selected Contact Chip -->
                <div v-if="selectedContact" class="selected-contact-chip animate-fade-in">
                  <span>✓ Linked to Lead: <strong>{{ selectedContact.name || selectedContact.email }}</strong></span>
                  <button type="button" class="chip-remove" @click="clearContact" title="Clear lead">✕</button>
                </div>
              </div>

              <!-- Assigned Agent / Staff Member -->
              <div class="form-group" style="margin-top: 14px;">
                <label class="field-label">Assigned Agent / Staff Member</label>
                <div v-if="loadingUsers" class="spinner-inline">Loading team members…</div>
                <div v-else class="select-wrap">
                  <select v-model="form.assignedUserId" class="form-control form-select">
                    <option value="">— Auto-detect from Lead / Logged-in Staff —</option>
                    <option v-for="u in locationUsers" :key="u.id" :value="u.id">
                      {{ u.name || u.email || 'Unnamed Staff' }}{{ u.email ? ` (${u.email})` : '' }}{{ u.role ? ` · ${u.role}` : '' }}
                    </option>
                  </select>
                </div>
                <small style="display:block; margin-top:4px; font-size:0.78rem; color:var(--color-text-muted);">
                  The contract emails and SMS will be sent with this agent as the sender in GoHighLevel.
                </small>
              </div>
            </div>

            <div v-if="sectionToggles.intakeFields" class="section-divider"></div>

            <!-- SECTION 3: Template Intake & Specifications Form -->
            <div v-if="sectionToggles.intakeFields" class="card-section">
              <div class="section-title-wrap section-title-flex">
                <div class="section-title-left">
                  <span class="section-icon">📋</span>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <h3 class="section-title">
                        3. Template Intake Specifications
                        <span v-if="selectedTemplate?.form_name" style="font-weight: 600; color: #4f46e5; font-size: 0.92rem; margin-left: 4px;">
                          ({{ selectedTemplate.form_name }})
                        </span>
                      </h3>
                      <div style="display: flex; gap: 6px; align-items: center;" v-if="selectedTemplate">
                        <span v-if="templateFormFields.length" class="badge badge-primary badge-xs">
                          {{ completedIntakeFieldsCount }}/{{ templateFormFields.length }} Completed
                        </span>
                        <span v-if="selectedTemplate.form_name" class="badge badge-success badge-xs">Auto-Linked</span>
                      </div>
                    </div>
                    <p class="section-sub">
                      Intake specifications linked to this template. Completed values are automatically embedded into the agreement and saved directly to the contract workspace (Tab 1).
                    </p>
                  </div>
                </div>

                <div class="section-title-controls">
                  <button
                    type="button"
                    class="btn-collapse-toggle"
                    @click="toggleCollapse('intakeFields')"
                    :title="sectionCollapsed.intakeFields ? 'Expand Section' : 'Collapse Section'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="sectionCollapsed.intakeFields ? '' : 'transform: rotate(180deg);'" style="transition: transform 0.2s ease;">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- When Section 3 is open -->
              <div v-if="!sectionCollapsed.intakeFields" class="section-body-flow animate-fade-in">
                <!-- When no template selected yet -->
              <div v-if="!selectedTemplate" class="empty-intake-banner animate-fade-in">
                <span style="font-size: 1.3rem;">📋</span>
                <div>
                  <strong>No Template Selected</strong>
                  <p style="margin: 2px 0 0; font-size: 0.82rem; color: #64748b;">
                    Select an agreement template in Step 1 to load its dynamic intake specifications here.
                  </p>
                </div>
              </div>

              <!-- Loading Indicator -->
              <div v-else-if="loadingTemplateForm" class="intake-loading-card">
                <div class="spinner-inline">Loading template intake fields…</div>
              </div>

              <!-- Template Has Form Fields -->
              <div v-else-if="templateFormFields.length" class="intake-form-box-card animate-fade-in">
                <div class="intake-form-grid">
                  <div
                    v-for="f in templateFormFields"
                    :key="f.id || f.key"
                    class="form-group"
                    :class="{
                      'full-col': f.type === 'textarea' || f.width === 'full' || f.type === 'file',
                      'half-col': f.width === 'half'
                    }"
                  >
                    <div class="field-label-row">
                      <label class="field-label">
                        {{ f.label }}
                        <span v-if="f.required" class="req">*</span>
                        <span v-if="f.ghlFieldId" class="badge badge-info badge-xs" style="margin-left: 4px;" title="Mapped to GoHighLevel Contact Field">GHL</span>
                      </label>
                      <span v-if="formResponses[f.key]" class="field-filled-indicator">✓</span>
                    </div>

                    <!-- Text / Number / Currency / Date / Phone / Email -->
                    <div v-if="['text', 'number', 'currency', 'date', 'phone', 'email'].includes(f.type)" class="input-with-icon-wrap">
                      <span v-if="f.type === 'currency'" class="input-addon-currency">$</span>
                      <input
                        :type="f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'"
                        v-model="formResponses[f.key]"
                        class="form-control"
                        :class="{ 'has-currency-addon': f.type === 'currency' }"
                        :placeholder="f.placeholder || (f.type === 'currency' ? 'e.g. 5,000 USD' : '')"
                        @input="onIntakeFieldInput(f.key, $event.target.value)"
                      />
                    </div>

                    <!-- Textarea -->
                    <textarea
                      v-else-if="f.type === 'textarea'"
                      v-model="formResponses[f.key]"
                      class="form-control"
                      :rows="f.rows || 3"
                      :placeholder="f.placeholder"
                      @input="onIntakeFieldInput(f.key, $event.target.value)"
                    ></textarea>

                    <!-- Dropdown -->
                    <select
                      v-else-if="f.type === 'dropdown' || f.type === 'select'"
                      v-model="formResponses[f.key]"
                      class="form-control form-select"
                      @change="onIntakeFieldInput(f.key, $event.target.value)"
                    >
                      <option value="">{{ f.placeholder || '-- Select an option --' }}</option>
                      <option
                        v-for="(opt, oi) in (f.options || [])"
                        :key="oi"
                        :value="typeof opt === 'object' ? (opt.value ?? opt.label) : opt"
                      >
                        {{ typeof opt === 'object' ? (opt.label ?? opt.value) : opt }}
                      </option>
                    </select>

                    <!-- Radio -->
                    <div v-else-if="f.type === 'radio'" class="radio-chip-group">
                      <label
                        v-for="(opt, oi) in (f.options || [])"
                        :key="oi"
                        class="radio-chip"
                        :class="{ active: formResponses[f.key] === (typeof opt === 'object' ? (opt.value ?? opt.label) : opt) }"
                      >
                        <input
                          type="radio"
                          :name="'radio_' + (f.id || f.key)"
                          :value="typeof opt === 'object' ? (opt.value ?? opt.label) : opt"
                          v-model="formResponses[f.key]"
                          @change="onIntakeFieldInput(f.key, formResponses[f.key])"
                        />
                        <span>{{ typeof opt === 'object' ? (opt.label ?? opt.value) : opt }}</span>
                      </label>
                    </div>

                    <!-- Checkbox -->
                    <label v-else-if="f.type === 'checkbox'" class="check-label" style="margin-top: 6px;">
                      <input
                        type="checkbox"
                        v-model="formResponses[f.key]"
                        @change="onIntakeFieldInput(f.key, formResponses[f.key])"
                      />
                      <span>{{ f.placeholder || f.label }}</span>
                    </label>

                    <!-- Fallback Input -->
                    <input
                      v-else
                      type="text"
                      v-model="formResponses[f.key]"
                      class="form-control"
                      :placeholder="f.placeholder"
                      @input="onIntakeFieldInput(f.key, $event.target.value)"
                    />

                    <small v-if="f.helpText" class="text-muted" style="display:block; margin-top:4px; font-size:0.75rem;">
                      {{ f.helpText }}
                    </small>
                  </div>
                </div>
              </div>

              <!-- Notice when no specific intake form fields -->
              <div v-else class="empty-intake-banner animate-fade-in">
                <span style="font-size: 1.2rem;">ℹ️</span>
                <div>
                  <strong>No custom intake questions attached to "{{ selectedTemplate.name }}".</strong>
                  <p style="margin: 2px 0 0; font-size: 0.8rem; color: #64748b;">
                    Standard Schedule One applicant details and commercial terms below will be used for this contract.
                  </p>
                </div>
              </div>
            </div>
          </div>

            <div class="section-divider"></div>

            <!-- SECTION 4: Main Applicant: 1 (Schedule One) -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">👤</span>
                <div>
                  <h3 class="section-title">4. Schedule One: Main Applicant 1 Details</h3>
                  <p class="section-sub">Details populated into Schedule One of the contract.</p>
                </div>
              </div>

              <div class="applicant-box-card">
                <div class="applicant-box-head">
                  <span class="applicant-tag-badge">Primary Applicant</span>
                  <strong class="applicant-head-title">Main Applicant: 1</strong>
                </div>

                <div class="form-grid-3" style="margin-top: 14px;">
                  <div class="form-group">
                    <label class="field-label">Full Name <span class="req">*</span></label>
                    <input
                      type="text"
                      v-model="form.recipientName"
                      class="form-control"
                      placeholder="e.g. Full Name / اسم العميل"
                      @input="syncField('client_name', form.recipientName)"
                    />
                  </div>
                  <div class="form-group">
                    <label class="field-label">Passport No / EID <span class="req">*</span></label>
                    <input
                      type="text"
                      v-model="formResponses['passport_number']"
                      class="form-control"
                      placeholder="e.g. CQ4220892"
                    />
                  </div>
                  <div class="form-group">
                    <label class="field-label">Nationality <span class="req">*</span></label>
                    <input
                      type="text"
                      v-model="formResponses['nationality']"
                      class="form-control"
                      placeholder="e.g. PAKISTANI"
                    />
                  </div>

                  <div class="form-group">
                    <label class="field-label">Mobile / Phone <span class="req">*</span></label>
                    <input
                      type="tel"
                      v-model="form.recipientPhone"
                      class="form-control"
                      placeholder="e.g. +966 54 128 1675"
                      @input="syncField('phone', form.recipientPhone)"
                    />
                  </div>
                  <div class="form-group">
                    <label class="field-label">Address</label>
                    <input
                      type="text"
                      v-model="formResponses['address']"
                      class="form-control"
                      placeholder="e.g. SAUDI ARABIA"
                    />
                  </div>
                  <div class="form-group">
                    <label class="field-label">Email Address <span class="req">*</span></label>
                    <input
                      type="email"
                      v-model="form.recipientEmail"
                      class="form-control"
                      placeholder="e.g. client@example.com"
                      @input="syncField('client_email', form.recipientEmail)"
                    />
                  </div>

                  <div class="form-group">
                    <label class="field-label">Date of Birth</label>
                    <input
                      type="text"
                      v-model="formResponses['date_of_birth']"
                      class="form-control"
                      placeholder="e.g. 28 FEB 1988"
                    />
                  </div>
                  <div class="form-group full-col-2">
                    <label class="field-label">Schedule Note</label>
                    <input
                      type="text"
                      v-model="formResponses['note']"
                      class="form-control"
                      placeholder="e.g. Spouse & Kids under 18 are included."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="sectionToggles.groupApplicants" class="section-divider"></div>

            <!-- SECTION 5: Application Type & Additional Team Applicants (Repeater) -->
            <div v-if="sectionToggles.groupApplicants" class="card-section">
              <div class="section-title-wrap section-title-flex">
                <div class="section-title-left">
                  <span class="section-icon">👥</span>
                  <div>
                    <h3 class="section-title">5. Application Mode &amp; Group Applicants</h3>
                    <p class="section-sub">Select Individual for a single applicant, or Team to add Main Applicant 2, 3, etc. into Schedule One.</p>
                  </div>
                </div>

                <div class="section-title-controls">
                  <button
                    type="button"
                    class="btn-collapse-toggle"
                    @click="toggleCollapse('groupApplicants')"
                    :title="sectionCollapsed.groupApplicants ? 'Expand Section' : 'Collapse Section'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="sectionCollapsed.groupApplicants ? '' : 'transform: rotate(180deg);'" style="transition: transform 0.2s ease;">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- When Section 5 is open -->
              <div v-if="!sectionCollapsed.groupApplicants" class="section-body-flow animate-fade-in">
                <!-- Application Type Mode Selector -->
              <div class="mode-toggle-grid">
                <button
                  type="button"
                  class="mode-toggle-card"
                  :class="{ active: form.formMode === 'NORMAL' }"
                  @click="form.formMode = 'NORMAL'"
                >
                  <div class="mode-icon">👤</div>
                  <div class="mode-content">
                    <div class="mode-title-row">
                      <strong>Individual Contract</strong>
                      <span v-if="form.formMode === 'NORMAL'" class="check-pill">Selected</span>
                    </div>
                    <small>Single applicant contract (Schedule One has Main Applicant: 1 only).</small>
                  </div>
                </button>

                <button
                  type="button"
                  class="mode-toggle-card"
                  :class="{ active: form.formMode === 'TEAM' }"
                  @click="form.formMode = 'TEAM'"
                >
                  <div class="mode-icon">👥</div>
                  <div class="mode-content">
                    <div class="mode-title-row">
                      <strong>Team / Family Group Contract</strong>
                      <span v-if="form.formMode === 'TEAM'" class="check-pill">Selected</span>
                    </div>
                    <small>Multi-party contract. Adds Main Applicant: 2, 3... into Schedule One.</small>
                  </div>
                </button>
              </div>

              <!-- TEAM REPEATER SECTION -->
              <div v-if="form.formMode === 'TEAM'" class="team-repeater-box animate-fade-in" style="margin-top: 20px;">
                <div class="repeater-header">
                  <div>
                    <h4 class="repeater-title">Additional Applicants (Schedule One)</h4>
                    <p class="repeater-sub">Each added applicant will appear as Main Applicant: 2, Main Applicant: 3... in Schedule One.</p>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" @click="addTeamMember">
                    + Add Applicant {{ teamMembers.length + 2 }}
                  </button>
                </div>

                <!-- Empty State -->
                <div v-if="teamMembers.length === 0" class="empty-team-state">
                  <p>No additional applicants added yet.</p>
                  <button type="button" class="btn btn-outline btn-sm" @click="addTeamMember">
                    + Add Main Applicant: 2
                  </button>
                </div>

                <!-- Additional Applicant Cards -->
                <div v-else class="team-members-container">
                  <div
                    v-for="(member, mIdx) in teamMembers"
                    :key="mIdx"
                    class="applicant-box-card additional-applicant animate-fade-in"
                  >
                    <div class="applicant-box-head">
                      <span class="applicant-tag-badge">Applicant {{ mIdx + 2 }}</span>
                      <strong class="applicant-head-title">Main Applicant: {{ mIdx + 2 }}</strong>
                      <button type="button" class="btn-remove-member" @click="removeTeamMember(mIdx)" title="Remove Member">
                        ✕ Remove
                      </button>
                    </div>

                    <div class="form-grid-3" style="margin-top: 14px;">
                      <div class="form-group">
                        <label class="field-label">Full Name <span class="req">*</span></label>
                        <input
                          type="text"
                          v-model="member.fullName"
                          class="form-control"
                          placeholder="e.g. SYED AASIM ABDUL KHALIQ"
                        />
                      </div>
                      <div class="form-group">
                        <label class="field-label">Passport No / EID <span class="req">*</span></label>
                        <input
                          type="text"
                          v-model="member.idNumber"
                          class="form-control"
                          placeholder="e.g. ZA399083"
                        />
                      </div>
                      <div class="form-group">
                        <label class="field-label">Nationality <span class="req">*</span></label>
                        <input
                          type="text"
                          v-model="member.nationality"
                          class="form-control"
                          placeholder="e.g. INDIAN"
                        />
                      </div>

                      <div class="form-group">
                        <label class="field-label">Mobile / Phone</label>
                        <input
                          type="tel"
                          v-model="member.phone"
                          class="form-control"
                          placeholder="e.g. +971 50 551 8780"
                        />
                      </div>
                      <div class="form-group">
                        <label class="field-label">Address</label>
                        <input
                          type="text"
                          v-model="member.address"
                          class="form-control"
                          placeholder="e.g. QATAR"
                        />
                      </div>
                      <div class="form-group">
                        <label class="field-label">Email Address</label>
                        <input
                          type="email"
                          v-model="member.email"
                          class="form-control"
                          placeholder="aasim.sayed@gmail.com"
                        />
                      </div>

                      <div class="form-group">
                        <label class="field-label">Date of Birth</label>
                        <input
                          type="text"
                          v-model="member.dob"
                          class="form-control"
                          placeholder="e.g. 31/08/1978"
                        />
                      </div>
                      <div class="form-group full-col-2">
                        <label class="field-label">Schedule Note</label>
                        <input
                          type="text"
                          v-model="member.note"
                          class="form-control"
                          placeholder="e.g. Spouse & Kids under 18 are included."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div v-if="sectionToggles.commercialTerms" class="section-divider"></div>

            <!-- SECTION 6: Commercial Terms & Fees (Rich Text Editor) -->
            <div v-if="sectionToggles.commercialTerms" class="card-section">
              <div class="section-title-wrap section-title-flex">
                <div class="section-title-left">
                  <span class="section-icon">💼</span>
                  <div>
                    <h3 class="section-title">6. Commercial Terms &amp; Fees (Schedule Three)</h3>
                    <p class="section-sub">Use the rich editor below to format professional fees, milestones, tables, and payment conditions.</p>
                  </div>
                </div>

                <div class="section-title-controls">
                  <button
                    type="button"
                    class="btn-collapse-toggle"
                    @click="toggleCollapse('commercialTerms')"
                    :title="sectionCollapsed.commercialTerms ? 'Expand Section' : 'Collapse Section'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="sectionCollapsed.commercialTerms ? '' : 'transform: rotate(180deg);'" style="transition: transform 0.2s ease;">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- When Section 6 is open -->
              <div v-if="!sectionCollapsed.commercialTerms" class="section-body-flow animate-fade-in">
                <!-- Sub-part A: Rich Text Editor -->
                <div v-if="sectionToggles.includeScheduleThreeRte" class="sub-section-container">
                  <div class="sub-section-header">
                    <div class="sub-header-left">
                      <span class="sub-header-badge">WYSIWYG</span>
                      <strong class="sub-header-title">Schedule Three Rich Text Editor</strong>
                    </div>
                  </div>

                  <div class="rte-section-box">
                    <RichTextEditor
                      v-model="formResponses['schedule_three_content']"
                      @change="onScheduleThreeChange"
                      placeholder="Draft program fees, payment schedule terms, discount details, or structured milestone table here…"
                    />
                  </div>
                </div>

                <!-- Sub-part B: Individual Variable Inputs -->
                <div v-if="sectionToggles.includeIndividualVars" class="individual-fields-box">
                  <div class="field-sync-hint-row" style="margin-top: 0; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <span class="field-label" style="font-weight: 700; color: #1e293b; margin: 0;">
                        Individual Variable Inputs
                      </span>
                      <small class="text-hint">
                        Your formatted terms and these individual variables will be rendered directly into the legal agreement &amp; PDF certificate.
                      </small>
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="form-group">
                      <label class="field-label">Total Professional Fees</label>
                      <input
                        type="text"
                        v-model="formResponses['contract_value']"
                        class="form-control"
                        placeholder="e.g. 20,000 USD / AED"
                      />
                    </div>
                    <div class="form-group">
                      <label class="field-label">Amount after Exclusive Discount</label>
                      <input
                        type="text"
                        v-model="formResponses['discounted_amount']"
                        class="form-control"
                        placeholder="e.g. 15,000 USD / AED"
                      />
                    </div>
                    <div class="form-group full-col">
                      <label class="field-label">Payment Mode / Schedule</label>
                      <input
                        type="text"
                        v-model="formResponses['payment_terms']"
                        class="form-control"
                        placeholder="e.g. 50% Advance Upon Signing, 50% on File Approval"
                      />
                    </div>
                    <div class="form-group full-col">
                      <label class="field-label">Visa Program / Scope (Schedule Two)</label>
                      <input
                        type="text"
                        v-model="formResponses['visa_type']"
                        class="form-control"
                        placeholder="e.g. Golden Visa Program / Business Immigration"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="sectionToggles.signatureControls" class="section-divider"></div>

            <!-- SECTION 7: Client Signature Controls -->
            <div v-if="sectionToggles.signatureControls" class="card-section">
              <div class="section-title-wrap section-title-flex">
                <div class="section-title-left">
                  <span class="section-icon">✍️</span>
                  <div>
                    <h3 class="section-title">7. Client Signature Controls</h3>
                    <p class="section-sub">Configure permitted signature methods for the client (public link validity defaults to 1 day).</p>
                  </div>
                </div>

                <div class="section-title-controls">
                  <button
                    type="button"
                    class="btn-collapse-toggle"
                    @click="toggleCollapse('signatureControls')"
                    :title="sectionCollapsed.signatureControls ? 'Expand Section' : 'Collapse Section'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="sectionCollapsed.signatureControls ? '' : 'transform: rotate(180deg);'" style="transition: transform 0.2s ease;">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- When Section 7 is open -->
              <div v-if="!sectionCollapsed.signatureControls" class="section-body-flow animate-fade-in">
                <!-- Allowed Signature Methods -->
                <div class="form-group">
                  <label class="field-label">Allowed Client Signature Methods <span class="req">*</span></label>
                  <div class="sig-methods-row">
                    <label class="sig-toggle-chip" :class="{ active: form.signatureMethods.draw }">
                      <input type="checkbox" v-model="form.signatureMethods.draw" />
                      <span class="sig-icon">✏️</span>
                      <div class="sig-text">
                        <strong>Draw</strong>
                        <small>Freehand canvas</small>
                      </div>
                    </label>

                    <label class="sig-toggle-chip" :class="{ active: form.signatureMethods.type }">
                      <input type="checkbox" v-model="form.signatureMethods.type" />
                      <span class="sig-icon">⌨️</span>
                      <div class="sig-text">
                        <strong>Type</strong>
                        <small>Cursive script</small>
                      </div>
                    </label>

                    <label class="sig-toggle-chip" :class="{ active: form.signatureMethods.upload }">
                      <input type="checkbox" v-model="form.signatureMethods.upload" />
                      <span class="sig-icon">📤</span>
                      <div class="sig-text">
                        <strong>Upload</strong>
                        <small>Signature image</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- RIGHT: Summary & Submit Sidebar -->
        <div class="create-sidebar">
          <div class="glass-card summary-card">
            <h4 class="summary-card-title">
              <span>📋</span>
              Contract Summary
            </h4>

            <div class="summary-list">
              <div class="summary-row">
                <span class="summary-k">Template</span>
                <strong class="summary-v">{{ selectedTemplate?.name || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span class="summary-k">Contract Date</span>
                <strong class="summary-v">{{ formatContractDate(formResponses['contract_date']) }}</strong>
              </div>
              <div class="summary-row">
                <span class="summary-k">Sections:</span>
                <span class="summary-v">
                  <span class="badge" :class="activeSectionsCount === 4 ? 'badge-success' : 'badge-neutral'">
                    {{ activeSectionsCount }}/4 Included
                  </span>
                </span>
              </div>
              <div class="summary-row">
                <span class="summary-k">Application</span>
                <span class="badge" :class="form.formMode === 'TEAM' && sectionToggles.groupApplicants ? 'badge-primary' : 'badge-neutral'">
                  {{ (form.formMode === 'TEAM' && sectionToggles.groupApplicants) ? `👥 Team (${teamMembers.length + 1} Applicants)` : '👤 Individual (1 Applicant)' }}
                </span>
              </div>
              <div class="summary-row" v-if="selectedTemplate?.form_name">
                <span class="summary-k">Intake Form:</span>
                <strong class="summary-v" style="color: #4f46e5; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  📋 {{ selectedTemplate.form_name }}
                </strong>
              </div>
              <div class="summary-row" v-if="templateFormFields.length && sectionToggles.intakeFields">
                <span class="summary-k">Intake Fields:</span>
                <span class="summary-v">
                  <strong style="color: #16a34a;">{{ completedIntakeFieldsCount }}</strong> / {{ templateFormFields.length }} filled
                </span>
              </div>
              <div class="summary-row" v-else-if="templateFormFields.length && !sectionToggles.intakeFields">
                <span class="summary-k">Intake Fields:</span>
                <span class="summary-v" style="color: #64748b; font-size: 0.8rem; font-style: italic;">Omitted</span>
              </div>
              <div class="summary-row">
                <span class="summary-k">Main Applicant: 1</span>
                <strong class="summary-v">{{ form.recipientName || '—' }}</strong>
              </div>
              <div class="summary-row" v-if="selectedAgentName">
                <span class="summary-k">Assigned Agent:</span>
                <strong class="summary-v">{{ selectedAgentName }}</strong>
              </div>
              <div class="summary-row" v-if="sectionToggles.groupApplicants && form.formMode === 'TEAM' && teamMembers.length">
                <span class="summary-k">Additional:</span>
                <span class="summary-v">{{ teamMembers.length }} member{{ teamMembers.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="summary-row" v-if="sectionToggles.commercialTerms && sectionToggles.includeIndividualVars && formResponses['contract_value']">
                <span class="summary-k">Total Fees:</span>
                <strong class="summary-v">{{ formResponses['contract_value'] }}</strong>
              </div>
              <div class="summary-row" v-else-if="!sectionToggles.commercialTerms">
                <span class="summary-k">Commercial Terms:</span>
                <span class="summary-v" style="color: #64748b; font-size: 0.8rem; font-style: italic;">Omitted for this contract</span>
              </div>
              <div class="summary-row">
                <span class="summary-k">Validity:</span>
                <span class="summary-v">1 Day (Expires {{ computedExpiryDate }})</span>
              </div>
            </div>

            <div class="validation-checklist">
              <div class="check-item" :class="{ ok: form.templateId }">
                <span class="check-bullet">{{ form.templateId ? '✓' : '○' }}</span>
                <span>Template selected</span>
              </div>
              <div class="check-item" :class="{ ok: form.recipientName && form.recipientEmail }">
                <span class="check-bullet">{{ (form.recipientName && form.recipientEmail) ? '✓' : '○' }}</span>
                <span>Applicant 1 Name & Email filled</span>
              </div>
              <div v-if="sectionToggles.intakeFields && requiredIntakeFieldsCount > 0" class="check-item" :class="{ ok: allRequiredIntakeFilled }">
                <span class="check-bullet">{{ allRequiredIntakeFilled ? '✓' : '○' }}</span>
                <span>Required intake completed ({{ filledRequiredIntakeCount }}/{{ requiredIntakeFieldsCount }})</span>
              </div>
              <div class="check-item" :class="{ ok: atLeastOneSignatureMethod }">
                <span class="check-bullet">{{ atLeastOneSignatureMethod ? '✓' : '○' }}</span>
                <span>Signature method selected</span>
              </div>
            </div>

            <div class="sidebar-actions" style="display:flex; flex-direction:column; gap:10px;">
              <!-- Primary: Create Contract & Link (Auto-Sends immediately) -->
              <button
                type="button"
                class="btn btn-primary btn-full-width"
                :disabled="!canCreate || creating || savingDraft"
                @click="createContract(false)"
                title="Create agreement and automatically send to client via GoHighLevel"
              >
                <span v-if="creating" class="spinner-inline">Creating &amp; Sending via GHL…</span>
                <span v-else>🚀 Create Contract &amp; Link</span>
              </button>
              <div style="font-size:0.73rem; color:var(--color-text-muted); text-align:center; margin-top:-4px;">
                ⚡ Auto-sends signing link to client via GoHighLevel
              </div>

              <!-- Secondary: Save as Draft (User sends manually later) -->
              <button
                type="button"
                class="btn btn-secondary btn-full-width"
                style="background: #f8fafc; color: #1e293b; border: 1.5px solid #cbd5e1; font-weight: 600;"
                :disabled="!canCreate || creating || savingDraft"
                @click="createContract(true)"
                title="Save agreement as Draft without sending to client"
              >
                <span v-if="savingDraft" class="spinner-inline">Saving Draft…</span>
                <span v-else>💾 Save as Draft</span>
              </button>
              <div style="font-size:0.73rem; color:var(--color-text-muted); text-align:center; margin-top:-4px;">
                ⏸️ Creates draft; send to client manually later via GHL
              </div>

              <router-link to="/contracts" class="btn btn-secondary btn-full-width" style="text-align:center; margin-top:4px;">
                Cancel
              </router-link>
            </div>

            <div v-if="createError" class="alert-banner alert-danger" style="margin-top:12px;">
              {{ createError }}
            </div>
          </div>
        </div>

      </div>

      <!-- ──── SUCCESS: CONTRACT CREATED ──────────────────────────────────── -->
      <div v-else class="created-success-view animate-fade-in">
        <div class="glass-card success-banner-card">
          <div class="success-icon-ring" :style="createdContract.state === 'DRAFT' ? 'background: #fef3c7; color: #d97706;' : ''">
            <span v-if="createdContract.state === 'DRAFT'" style="font-size: 24px;">📝</span>
            <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 class="success-head">
            {{ createdContract.state === 'DRAFT' ? 'Contract Saved as Draft!' : 'Contract Created & Dispatched!' }}
          </h2>
          <p class="text-muted">
            <strong>{{ createdContract.template }}</strong> · {{ form.recipientName }}
          </p>

          <div v-if="createdContract.state === 'DRAFT'" class="alert-banner alert-warning" style="margin: 14px 0 18px; text-align: left; font-size: 0.88rem; background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 12px 16px; border-radius: 8px;">
            ℹ️ <strong>Draft Mode:</strong> This contract has been saved as a Draft and has <strong>not</strong> been sent to the client yet. You can copy the link below or click <strong>"Send via GHL"</strong> whenever you are ready to dispatch it. Once clicked, its status will automatically update to <strong>Sent</strong>.
          </div>
          <div v-else class="alert-banner alert-success" style="margin: 14px 0 18px; text-align: left; font-size: 0.88rem; background: #ecfdf5; border: 1px solid #d1fae5; color: #065f46; padding: 12px 16px; border-radius: 8px;">
            ✓ <strong>Dispatched:</strong> Contract generated and automatically sent to {{ form.recipientName }} via GoHighLevel Conversation (SMS &amp; Email)!
          </div>

          <div class="success-details-grid">
            <div class="detail-box">
              <span class="detail-label">Status</span>
              <span class="badge" :class="createdContract.state === 'DRAFT' ? 'badge-warning' : 'badge-primary'">
                {{ createdContract.state }}
              </span>
            </div>
            <div class="detail-box">
              <span class="detail-label">Mode</span>
              <span class="badge badge-neutral">
                {{ form.formMode === 'TEAM' ? `👥 Team (${teamMembers.length + 1} Applicants)` : '👤 Individual' }}
              </span>
            </div>
            <div class="detail-box">
              <span class="detail-label">Expires On</span>
              <strong style="font-size:0.85rem;">{{ formatDate(createdContract.expiresAt) }}</strong>
            </div>
          </div>

          <!-- Public Signing Link Box -->
          <div class="signing-link-card">
            <label class="signing-link-label">Secure Public Client Signing Link</label>
            <div class="signing-link-row">
              <input
                type="text"
                readonly
                :value="createdContract.signingUrl"
                class="form-control signing-url-input"
                @click="$event.target.select()"
              />
              <button type="button" class="btn btn-primary btn-copy" @click="copyLink">
                {{ copied ? '✓ Copied!' : '📋 Copy Link' }}
              </button>
            </div>
            <p class="signing-link-note">
              Send this link to the client. The client will directly view the completed contract and sign it without filling any forms.
            </p>
          </div>

          <!-- Actions -->
          <div class="success-actions-row" style="display:flex; flex-wrap:wrap; gap:10px;">
            <!-- Send via GHL Button -->
            <button
              v-if="createdContract.state === 'DRAFT'"
              type="button"
              class="btn btn-primary"
              style="background: #2563eb; font-weight: 700;"
              :disabled="sendingGhl"
              @click="sendViaGhlNow"
            >
              <span v-if="sendingGhl" class="spinner-inline">Sending via GHL…</span>
              <span v-else>📤 Send via GHL</span>
            </button>
            <button
              v-else
              type="button"
              class="btn btn-secondary"
              :disabled="sendingGhl"
              @click="sendViaGhlNow"
            >
              <span v-if="sendingGhl" class="spinner-inline">Resending via GHL…</span>
              <span v-else>🔄 Resend via GHL</span>
            </button>

            <a
              :href="createdContract.signingUrl"
              target="_blank"
              class="btn btn-secondary"
            >
              👁️ Open Signing Portal
            </a>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              + Create Another Contract
            </button>
            <router-link to="/contracts" class="btn btn-secondary">
              View All Contracts →
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import RichTextEditor from '../components/common/RichTextEditor.vue'

const router = useRouter()
const auth   = useAuthStore()
// ─── Section Visibility & Requirement Settings (Default: All Open & Included) ─
const sectionToggles = ref({
  intakeFields:            true, // Section 3: Template Intake Specifications
  groupApplicants:         true, // Section 5: Group / Team Applicants
  commercialTerms:         true, // Section 6: Commercial Terms & Fees (Schedule Three)
  includeScheduleThreeRte: true, // Section 6 Sub: WYSIWYG Rich Text Editor
  includeIndividualVars:   true, // Section 6 Sub: Individual Variable Inputs
  signatureControls:       true, // Section 7: Client Signature Controls
})

// Visual collapse state (all false = all open by default)
const sectionCollapsed = ref({
  settingsBar:             false,
  intakeFields:            false,
  groupApplicants:         false,
  commercialTerms:         false,
  includeScheduleThreeRte: false,
  includeIndividualVars:   false,
  signatureControls:       false,
})

function toggleSection(secKey) {
  sectionToggles.value[secKey] = !sectionToggles.value[secKey]
  if (sectionToggles.value[secKey]) {
    sectionCollapsed.value[secKey] = false
  }
}

function toggleCollapse(secKey) {
  sectionCollapsed.value[secKey] = !sectionCollapsed.value[secKey]
}

function resetAllSections() {
  sectionToggles.value = {
    intakeFields:            true,
    groupApplicants:         true,
    commercialTerms:         true,
    includeScheduleThreeRte: true,
    includeIndividualVars:   true,
    signatureControls:       true,
  }
  sectionCollapsed.value = {
    intakeFields:            false,
    groupApplicants:         false,
    commercialTerms:         false,
    includeScheduleThreeRte: false,
    includeIndividualVars:   false,
    signatureControls:       false,
  }
}

function applyTemplateSectionSettings(t) {
  if (!t) {
    resetAllSections()
    return
  }
  let rules = null
  let schema = null
  try {
    rules = t.creation_rules_json ? (typeof t.creation_rules_json === 'string' ? JSON.parse(t.creation_rules_json) : t.creation_rules_json) : null
  } catch (_) {
    rules = null
  }
  try {
    schema = t.document_schema_json ? (typeof t.document_schema_json === 'string' ? JSON.parse(t.document_schema_json) : t.document_schema_json) : null
  } catch (_) {
    schema = null
  }

  const savedToggles = rules?.sectionToggles || schema?.sectionToggles || null
  if (savedToggles) {
    sectionToggles.value = {
      intakeFields:            savedToggles.intakeFields ?? true,
      groupApplicants:         savedToggles.groupApplicants ?? true,
      commercialTerms:         savedToggles.commercialTerms ?? true,
      includeScheduleThreeRte: savedToggles.includeScheduleThreeRte ?? true,
      includeIndividualVars:   savedToggles.includeIndividualVars ?? true,
      signatureControls:       savedToggles.signatureControls ?? true,
    }
  } else {
    resetAllSections()
  }
}

const activeSectionsCount = computed(() => {
  let count = 0
  if (sectionToggles.value.intakeFields) count++
  if (sectionToggles.value.groupApplicants) count++
  if (sectionToggles.value.commercialTerms) count++
  if (sectionToggles.value.signatureControls) count++
  return count
})

const defaultScheduleHtml = `
<p><strong>Total Professional Fees:</strong> 20,000 EUR</p>
<p><strong>Amount after Exclusive Discount:</strong> 15,000 EUR</p>
<p><strong>Agreed Payment Milestones:</strong></p>
<ul>
  <li><strong>First Milestone (50% Advance):</strong> 7,500 EUR payable upon signing this agreement.</li>
  <li><strong>Second Milestone (50% Balance):</strong> 7,500 EUR payable upon formal file approval / visa issuance.</li>
</ul>
<p><strong>Payment Mode:</strong> International Bank Wire Transfer / Swift.</p>
<p><em>All fees are net of third-party government charges and subject to standard terms of business.</em></p>
`.trim()

// ─── State ───────────────────────────────────────────────────────────────────
const form = ref({
  templateId:               '',
  formMode:                 'NORMAL',
  formId:                   '',
  ghlContactId:             '',
  ghlOpportunityId:         '',
  assignedUserId:           '',
  recipientName:            '',
  recipientEmail:           '',
  recipientPhone:           '',
  validityDays:             1,
  signatureMethods: {
    draw:   true,
    type:   true,
    upload: false,
  },
  clientSignatureRequired:  true,
  companySignatureRequired: false,
})

function getTodayDateString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatContractDate(val) {
  if (!val) return '—'
  try {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
      const [y, m, d] = val.trim().split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return String(val)
  }
}

// Dynamic form questions values
const formResponses = ref({
  contract_date: getTodayDateString(),
  note: 'Spouse & Kids under 18 are included.',
  passport_number: '',
  nationality: '',
  address: '',
  date_of_birth: '',
  contract_value: '20,000 EUR',
  discounted_amount: '15,000 EUR',
  payment_terms: '50% Upon Signing, 50% on Approval',
  visa_type: 'Cyprus Business Residence Visa',
  schedule_three_content: defaultScheduleHtml,
})

function onScheduleThreeChange(html) {
  formResponses.value.schedule_three_content = html
  formResponses.value.payment_breakup = html
  formResponses.value.commercial_terms = html

  if (html) {
    const feeMatch = html.match(/(?:Total(?: Professional)? Fees?:?\s*(?:<\/strong>)?\s*)([0-9,.]+\s*[A-Z]{3}|[0-9,.]+)/i)
    if (feeMatch && feeMatch[1]) {
      formResponses.value.contract_value = feeMatch[1].trim()
    }
    const discountMatch = html.match(/(?:Discount(?:ed)?:?\s*(?:<\/strong>)?\s*)([0-9,.]+\s*[A-Z]{3}|[0-9,.]+)/i)
    if (discountMatch && discountMatch[1]) {
      formResponses.value.discounted_amount = discountMatch[1].trim()
    }
  }
}

// Team members repeater (Applicant 2, 3, ...)
const teamMembers = ref([])

const templates                  = ref([])
const forms                      = ref([])
const loadingTemplates           = ref(false)
const selectedTemplate           = ref(null)
const templateSearch             = ref('')
const showTemplateDropdown       = ref(false)
const templateSearchContainerRef = ref(null)

// Dynamic Intake Form (loaded based on selectedTemplate)
const templateFormFields           = ref([])
const templateFormSections         = ref([])
const loadingTemplateForm          = ref(false)

// Location Users / Staff Members
const locationUsers        = ref([])
const loadingUsers         = ref(false)

// Contacts / Leads
const allContacts          = ref([])
const contactSearch        = ref('')
const selectedContact      = ref(null)
const loadingContacts      = ref(false)
const showContactDropdown  = ref(false)
const searchContainerRef   = ref(null)

const creating         = ref(false)
const savingDraft      = ref(false)
const createError      = ref('')
const createdContract  = ref(null)
const copied           = ref(false)
const sendingGhl       = ref(false)

const validityOptions = [
  { label: '1 Day',   value: 1  },
  { label: '3 Days',  value: 3  },
  { label: '7 Days',  value: 7  },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredTemplates = computed(() => {
  const q = (templateSearch.value || '').trim().toLowerCase()
  if (!q || (selectedTemplate.value && selectedTemplate.value.name.toLowerCase() === q)) {
    return templates.value
  }
  return templates.value.filter(t => {
    const nameMatch = t.name && t.name.toLowerCase().includes(q)
    const typeMatch = t.contract_type && t.contract_type.toLowerCase().includes(q)
    const formMatch = t.form_name && t.form_name.toLowerCase().includes(q)
    const descMatch = t.description && t.description.toLowerCase().includes(q)
    const verMatch  = t.current_version && String(t.current_version).toLowerCase().includes(q)
    return nameMatch || typeMatch || formMatch || descMatch || verMatch
  })
})

const filteredContacts = computed(() => {
  const q = (contactSearch.value || '').trim().toLowerCase()
  if (!q) return allContacts.value.slice(0, 10)
  return allContacts.value.filter(c => {
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.opportunityName && c.opportunityName.toLowerCase().includes(q))
    )
  }).slice(0, 15)
})

const computedExpiryDate = computed(() => {
  if (!form.value.validityDays) return '—'
  const d = new Date(Date.now() + form.value.validityDays * 24 * 60 * 60 * 1000)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})

const selectedAgentName = computed(() => {
  if (!form.value.assignedUserId) return ''
  const u = locationUsers.value.find(user => user.id === form.value.assignedUserId)
  return u ? (u.name || u.email) : ''
})

const atLeastOneSignatureMethod = computed(() => {
  return !!(form.value.signatureMethods?.draw || form.value.signatureMethods?.type || form.value.signatureMethods?.upload)
})

const canCreate = computed(() => {
  return !!(
    form.value.templateId &&
    form.value.recipientName &&
    form.value.recipientEmail &&
    atLeastOneSignatureMethod.value
  )
})

const completedIntakeFieldsCount = computed(() => {
  return templateFormFields.value.filter(f => {
    const val = formResponses.value[f.key]
    return val !== undefined && val !== null && String(val).trim() !== ''
  }).length
})

const requiredIntakeFieldsCount = computed(() => {
  return templateFormFields.value.filter(f => f.required).length
})

const filledRequiredIntakeCount = computed(() => {
  return templateFormFields.value.filter(f => {
    if (!f.required) return false
    const val = formResponses.value[f.key]
    return val !== undefined && val !== null && String(val).trim() !== ''
  }).length
})

const allRequiredIntakeFilled = computed(() => {
  if (!sectionToggles.value.intakeFields) return true
  if (requiredIntakeFieldsCount.value === 0) return true
  return filledRequiredIntakeCount.value >= requiredIntakeFieldsCount.value
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getHeaders() {
  const token = auth.sessionToken || auth.token || localStorage.getItem('contract_auth_token') || ''
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'X-GHL-Context': token || '',
  }
}

function parseSafeDate(d) {
  if (!d) return null
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d
  if (typeof d === 'string') {
    let s = d.trim()
    if (!s) return null
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
  if (!d) return '—'
  const date = parseSafeDate(d)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Dubai',
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function syncField(key, val) {
  formResponses.value[key] = val
}

// ─── Data Loaders ────────────────────────────────────────────────────────────
async function loadTemplates() {
  loadingTemplates.value = true
  try {
    const res = await api.get('/templates', { headers: getHeaders() })
    templates.value = res.data.templates || []
    if (form.value.templateId && !selectedTemplate.value) {
      const found = templates.value.find(t => t.id === form.value.templateId)
      if (found) {
        selectedTemplate.value = found
        templateSearch.value = found.name
        applyTemplateSectionSettings(found)
        loadTemplateIntakeForm(found)
      }
    }
  } catch (e) {
    console.error('Templates load error', e)
  } finally {
    loadingTemplates.value = false
  }
}

async function loadForms() {
  try {
    const res = await api.get('/forms', { headers: getHeaders() })
    forms.value = res.data.forms || []
  } catch (e) {
    console.error('Forms load error', e)
  }
}

async function loadInitialContacts() {
  loadingContacts.value = true
  try {
    const res = await api.get('/ghl/contacts', { headers: getHeaders() })
    allContacts.value = res.data.contacts || []
  } catch (e) {
    console.warn('Initial contacts load error', e.message)
  } finally {
    loadingContacts.value = false
  }
}

async function loadLocationUsers() {
  loadingUsers.value = true
  try {
    const res = await api.get('/ghl/users', { headers: getHeaders() })
    locationUsers.value = res.data.users || []
    if (!form.value.assignedUserId && auth.user?.userId) {
      form.value.assignedUserId = auth.user.userId
    }
  } catch (e) {
    console.warn('Failed to load location users:', e.message)
  } finally {
    loadingUsers.value = false
  }
}

// ─── Template Combobox Controls ───────────────────────────────────────────────
function onTemplateSearchFocus(e) {
  showTemplateDropdown.value = true
  if (e?.target) {
    e.target.select()
  }
}

function onTemplateSearchInput() {
  showTemplateDropdown.value = true
}

function toggleTemplateDropdown() {
  showTemplateDropdown.value = !showTemplateDropdown.value
}

function clearTemplateSearch() {
  templateSearch.value = ''
  showTemplateDropdown.value = true
}

function openTemplatePicker() {
  templateSearch.value = ''
  showTemplateDropdown.value = true
}

// ─── Dynamic Template Intake Form Loaders & Sync ───────────────────────────────
async function loadTemplateIntakeForm(t) {
  templateFormFields.value = []
  templateFormSections.value = []
  if (!t) return

  loadingTemplateForm.value = true
  try {
    let rawSchema = t.form_schema
    let formObj = null

    // If schema is not directly on template, check loaded forms list
    if (!rawSchema && t.form_id && forms.value?.length) {
      formObj = forms.value.find(f => f.id === t.form_id)
      if (formObj?.schema_json) {
        rawSchema = formObj.schema_json
      }
    }

    // If still not found and template has form_id, fetch form directly
    if (!rawSchema && t.form_id) {
      try {
        const res = await api.get(`/forms/${t.form_id}`, { headers: getHeaders() })
        if (res.data?.form?.schema_json) {
          rawSchema = res.data.form.schema_json
        }
      } catch (err) {
        console.warn('Could not fetch form schema for form_id:', t.form_id, err.message)
      }
    }

    // Parse schema
    if (rawSchema) {
      const parsed = typeof rawSchema === 'string' ? JSON.parse(rawSchema) : rawSchema
      let fields = []

      if (Array.isArray(parsed.fields) && parsed.fields.length) {
        fields = parsed.fields
      } else if (Array.isArray(parsed.sections) && parsed.sections.length) {
        templateFormSections.value = parsed.sections
        fields = parsed.sections.flatMap(sec => (sec.fields || []).map(f => ({ ...f, sectionTitle: sec.title })))
      }

      templateFormFields.value = fields

      // Initialize defaults for any missing keys in formResponses
      fields.forEach(f => {
        if (!f.key) return
        if (formResponses.value[f.key] === undefined || formResponses.value[f.key] === null) {
          if (f.type === 'checkbox') {
            formResponses.value[f.key] = false
          } else if (f.defaultValue !== undefined && f.defaultValue !== null) {
            formResponses.value[f.key] = f.defaultValue
          } else {
            formResponses.value[f.key] = ''
          }
        }
      })

      // If a GHL contact is already selected, prefill matching fields
      if (selectedContact.value) {
        autoFillIntakeFromContact(selectedContact.value, fields)
      }
    }
  } catch (e) {
    console.error('Error loading template intake form schema:', e)
  } finally {
    loadingTemplateForm.value = false
  }
}

function autoFillIntakeFromContact(c, fields = templateFormFields.value) {
  if (!c) return
  const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()
  const email = c.email || ''
  const phone = c.phone || ''
  const company = c.companyName || ''
  const address = c.address1 || c.address || ''
  const dob = c.dateOfBirth || ''

  // Build custom fields lookup map from GHL contact
  const customMap = {}
  if (Array.isArray(c.customFields)) {
    c.customFields.forEach(cf => {
      if (cf.id) customMap[cf.id] = cf.value
      if (cf.fieldKey) customMap[cf.fieldKey] = cf.value
      if (cf.name) customMap[cf.name.toLowerCase().replace(/[^a-z0-9]/g, '_')] = cf.value
    })
  }

  (fields || []).forEach(f => {
    if (!f.key) return
    const curVal = formResponses.value[f.key]
    const isEmpty = curVal === undefined || curVal === null || curVal === ''

    if (f.key === 'client_name' && fullName) {
      formResponses.value['client_name'] = fullName
      if (!form.value.recipientName) form.value.recipientName = fullName
    } else if (f.key === 'client_email' && email) {
      formResponses.value['client_email'] = email
      if (!form.value.recipientEmail) form.value.recipientEmail = email
    } else if (f.key === 'phone' && phone) {
      formResponses.value['phone'] = phone
      if (!form.value.recipientPhone) form.value.recipientPhone = phone
    } else if (f.key === 'company_name' && company && isEmpty) {
      formResponses.value['company_name'] = company
    } else if (f.key === 'address' && address && isEmpty) {
      formResponses.value['address'] = address
    } else if (f.key === 'date_of_birth' && dob && isEmpty) {
      formResponses.value['date_of_birth'] = dob
    }

    // Check by ghlFieldId mapping
    if (f.ghlFieldId && isEmpty) {
      if (f.ghlFieldId === 'contact.name') {
        formResponses.value[f.key] = fullName
      } else if (f.ghlFieldId === 'contact.email') {
        formResponses.value[f.key] = email
      } else if (f.ghlFieldId === 'contact.phone') {
        formResponses.value[f.key] = phone
      } else if (f.ghlFieldId === 'contact.companyName') {
        formResponses.value[f.key] = company
      } else if (f.ghlFieldId === 'contact.address1') {
        formResponses.value[f.key] = address
      } else if (f.ghlFieldId === 'contact.dateOfBirth') {
        formResponses.value[f.key] = dob
      } else if (customMap[f.ghlFieldId] !== undefined) {
        formResponses.value[f.key] = customMap[f.ghlFieldId]
      } else {
        const cleanGhlId = f.ghlFieldId.replace(/^contact\./, '').replace(/^customField_/, '')
        if (customMap[cleanGhlId] !== undefined) formResponses.value[f.key] = customMap[cleanGhlId]
      }
    }
  })
}

function onIntakeFieldInput(key, val) {
  formResponses.value[key] = val
  if (key === 'client_name') {
    form.value.recipientName = val
  } else if (key === 'client_email') {
    form.value.recipientEmail = val
  } else if (key === 'phone') {
    form.value.recipientPhone = val
  }
}

// ─── Template Selection ──────────────────────────────────────────────────────
function selectTemplate(t) {
  form.value.templateId = t.id
  selectedTemplate.value = t
  form.value.validityDays = 1
  if (t?.form_id) form.value.formId = t.form_id
  templateSearch.value = t.name
  showTemplateDropdown.value = false
  applyTemplateSectionSettings(t)
  loadTemplateIntakeForm(t)
}

function onTemplateChange() {
  const t = templates.value.find(t => t.id === form.value.templateId)
  selectedTemplate.value = t || null
  form.value.validityDays = 1
  if (t?.form_id) form.value.formId = t.form_id
  if (t) {
    templateSearch.value = t.name
    applyTemplateSectionSettings(t)
    loadTemplateIntakeForm(t)
  } else {
    resetAllSections()
    templateFormFields.value = []
    templateFormSections.value = []
  }
}

// ─── Contact Search ───────────────────────────────────────────────────────────
function onSearchFocus() {
  showContactDropdown.value = true
  if (!allContacts.value.length) loadInitialContacts()
}

let searchTimeout = null
function onSearchInput() {
  showContactDropdown.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(triggerSearch, 350)
}

async function triggerSearch() {
  const query = contactSearch.value.trim()
  loadingContacts.value = true
  try {
    const res = await api.get('/ghl/contacts', {
      params: query ? { search: query } : {},
      headers: getHeaders(),
    })
    allContacts.value = res.data.contacts || []
  } catch (e) {
    console.warn('Live search error', e.message)
  } finally {
    loadingContacts.value = false
  }
}

function selectContact(c) {
  selectedContact.value = c
  form.value.ghlContactId     = c.id || `ghl_${Date.now()}`
  form.value.ghlOpportunityId = c.opportunityId || ''
  form.value.recipientName    = c.name || ''
  form.value.recipientEmail   = c.email || ''
  form.value.recipientPhone   = c.phone || ''
  if (c.assignedTo) {
    form.value.assignedUserId = c.assignedTo
  }
  contactSearch.value         = c.name || c.email || ''
  showContactDropdown.value   = false

  // Populate dynamic form responses
  formResponses.value['client_name']  = c.name || ''
  formResponses.value['client_email'] = c.email || ''
  formResponses.value['phone']        = c.phone || ''
  if (c.companyName) formResponses.value['company_name'] = c.companyName
  if (c.monetaryValue) formResponses.value['contract_value'] = String(c.monetaryValue)

  // Autofill dynamic template intake form fields
  autoFillIntakeFromContact(c)
}

function clearContact() {
  selectedContact.value = null
  form.value.ghlContactId = ''
  form.value.ghlOpportunityId = ''
  contactSearch.value = ''
  showContactDropdown.value = false
}

function handleClickOutside(e) {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showContactDropdown.value = false
  }
  if (templateSearchContainerRef.value && !templateSearchContainerRef.value.contains(e.target)) {
    showTemplateDropdown.value = false
  }
}

// ─── Team Members Repeater ────────────────────────────────────────────────────
function addTeamMember() {
  teamMembers.value.push({
    fullName:    '',
    idNumber:    '',
    nationality: '',
    phone:       '',
    address:     '',
    email:       '',
    dob:         '',
    note:        'Spouse & Kids under 18 are included.',
  })
}

function removeTeamMember(idx) {
  teamMembers.value.splice(idx, 1)
}

// ─── Create Contract ──────────────────────────────────────────────────────────
async function createContract(isDraft = false) {
  if (!canCreate.value) return
  if (isDraft) {
    savingDraft.value = true
  } else {
    creating.value = true
  }
  createError.value = ''

  try {
    const contactId = form.value.ghlContactId || `manual_${Date.now()}`

    // Ensure primary recipient values are also inside formResponses
    formResponses.value['client_name']   = form.value.recipientName
    formResponses.value['client_email']  = form.value.recipientEmail
    formResponses.value['phone']         = form.value.recipientPhone
    formResponses.value['contract_date'] = formResponses.value['contract_date'] || getTodayDateString()

    const sectionsConfig = {
      intakeFields:            Boolean(sectionToggles.value.intakeFields),
      groupApplicants:         Boolean(sectionToggles.value.groupApplicants),
      commercialTerms:         Boolean(sectionToggles.value.commercialTerms),
      includeScheduleThreeRte: Boolean(sectionToggles.value.commercialTerms && sectionToggles.value.includeScheduleThreeRte),
      includeIndividualVars:   Boolean(sectionToggles.value.commercialTerms && sectionToggles.value.includeIndividualVars),
      signatureControls:       Boolean(sectionToggles.value.signatureControls),
    }

    const resolvedResponses = { ...formResponses.value }

    // If commercial terms disabled, do not inject fee or schedule 3 values
    if (!sectionsConfig.commercialTerms) {
      resolvedResponses.schedule_three_content = ''
      resolvedResponses.commercial_terms = ''
      resolvedResponses.payment_breakup = ''
      resolvedResponses.contract_value = ''
      resolvedResponses.discounted_amount = ''
      resolvedResponses.payment_terms = ''
      resolvedResponses.visa_type = ''
    } else {
      if (!sectionsConfig.includeScheduleThreeRte) {
        resolvedResponses.schedule_three_content = ''
        resolvedResponses.commercial_terms = ''
        resolvedResponses.payment_breakup = ''
      }
      if (!sectionsConfig.includeIndividualVars) {
        resolvedResponses.contract_value = ''
        resolvedResponses.discounted_amount = ''
        resolvedResponses.payment_terms = ''
        resolvedResponses.visa_type = ''
      }
    }

    resolvedResponses.sectionsConfig = sectionsConfig

    const payload = {
      templateId:       parseInt(form.value.templateId),
      ghlContactId:     contactId,
      ghlOpportunityId: form.value.ghlOpportunityId || null,
      assignedUserId:   form.value.assignedUserId || null,
      formMode:         sectionsConfig.groupApplicants ? form.value.formMode : 'NORMAL',
      recipientName:    form.value.recipientName,
      recipientEmail:   form.value.recipientEmail,
      recipientPhone:   form.value.recipientPhone,
      formData:         resolvedResponses,
      teamMembers:      (sectionsConfig.groupApplicants && form.value.formMode === 'TEAM') ? teamMembers.value : [],
      validityDays:     form.value.validityDays,
      isDraft:          Boolean(isDraft),
      saveAsDraft:      Boolean(isDraft),
      autoSend:         !isDraft,
      sectionsConfig,
      signingConfig: {
        clientSignatureRequired:  form.value.clientSignatureRequired,
        companySignatureRequired: form.value.companySignatureRequired,
        allowedMethods: Object.keys(form.value.signatureMethods || {}).filter(m => form.value.signatureMethods[m]),
      },
    }

    const res = await api.post('/contracts/manual', payload, { headers: getHeaders() })
    const data = res.data || {}
    let sUrl = data.signingUrl || ''
    if (data.signingToken) {
      sUrl = `${window.location.origin}/sign/${data.signingToken}`
    } else if (sUrl && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        const parsed = new URL(sUrl)
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          sUrl = `${window.location.origin}${parsed.pathname}${parsed.search}`
        }
      } catch (_) {}
    }
    createdContract.value = { ...data, signingUrl: sUrl, state: data.state || (isDraft ? 'DRAFT' : 'SENT') }
  } catch (err) {
    createError.value = err.response?.data?.error || err.message || 'Failed to create contract.'
  } finally {
    creating.value = false
    savingDraft.value = false
  }
}

// ─── Copy Link ────────────────────────────────────────────────────────────────
async function copyLink() {
  try {
    await navigator.clipboard.writeText(createdContract.value.signingUrl)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch (e) {
    alert(createdContract.value.signingUrl)
  }
}

async function sendViaGhlNow() {
  const contractId = createdContract.value?.contractInstanceId || createdContract.value?.id
  if (!contractId) return
  sendingGhl.value = true
  try {
    const res = await api.post(
      `/contracts/${contractId}/send`,
      {
        validityDays: form.value.validityDays,
        channels: ['sms', 'email'],
      },
      { headers: getHeaders() }
    )
    alert(res.data?.message || 'Contract dispatched successfully via GoHighLevel Conversation! Status updated to Sent.')
    if (createdContract.value) {
      createdContract.value.state = 'SENT'
    }
  } catch (err) {
    console.error('Send via GHL error:', err)
    alert(err.response?.data?.error || 'Failed to dispatch contract via GoHighLevel.')
  } finally {
    sendingGhl.value = false
  }
}

function resetForm() {
  createdContract.value = null
  createError.value = ''
  contactSearch.value = ''
  selectedContact.value = null
  teamMembers.value = []
  formResponses.value = {
    note: 'Spouse & Kids under 18 are included.',
    passport_number: '',
    nationality: '',
    address: '',
    date_of_birth: '',
    contract_value: '20,000 EUR',
    discounted_amount: '15,000 EUR',
    payment_terms: '50% Upon Signing, 50% on Approval',
    visa_type: 'Cyprus Business Residence Visa',
    schedule_three_content: defaultScheduleHtml,
  }
  form.value = {
    templateId:               '',
    formMode:                 'NORMAL',
    formId:                   '',
    ghlContactId:             '',
    ghlOpportunityId:         '',
    assignedUserId:           auth.user?.userId || '',
    recipientName:            '',
    recipientEmail:           '',
    recipientPhone:           '',
    validityDays:             1,
    signatureMethods: {
      draw:   true,
      type:   true,
      upload: false,
    },
    clientSignatureRequired:  true,
    companySignatureRequired: false,
  }
  selectedTemplate.value = null
  templateSearch.value = ''
  showTemplateDropdown.value = false
  templateFormFields.value = []
  templateFormSections.value = []
  loadingTemplateForm.value = false
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await Promise.all([loadTemplates(), loadForms(), loadInitialContacts(), loadLocationUsers()])
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.create-contract-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Two-column layout */
.create-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.main-form-card {
  padding: 32px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}

.section-icon {
  font-size: 1.3rem;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.section-sub {
  font-size: 0.84rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.section-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 28px 0;
}

/* Linked Form Banner */
.linked-form-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  margin-top: 4px;
}

.linked-form-icon {
  font-size: 1.3rem;
}

.linked-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.linked-form-label {
  font-size: 0.75rem;
  color: #166534;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.linked-form-content strong {
  color: #14532d;
  font-size: 0.92rem;
}

.linked-form-content small {
  color: #15803d;
  font-size: 0.78rem;
}

/* Applicant Cards */
.applicant-box-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.applicant-box-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.applicant-tag-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #e2e8f0;
  color: #334155;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.applicant-head-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  flex: 1;
}

.additional-applicant {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Form Grids */
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
}

.full-col {
  grid-column: 1 / -1;
}

.full-col-2 {
  grid-column: span 2;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.req {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 9px 12px;
  font-size: 0.9rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #0f172a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

select.form-control,
.form-select,
.select-wrap select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px 16px;
  padding-right: 36px;
}

select.form-control:focus,
.form-select:focus,
.select-wrap select:focus {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236366f1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

/* Template Combobox & Search */
.template-combobox-wrap {
  position: relative;
  width: 100%;
}

.template-search-bar {
  position: relative;
}

.template-input {
  padding-left: 36px;
  padding-right: 64px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.template-combobox-wrap .clear-input-btn {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 0.72rem;
  line-height: 1;
  transition: all 0.15s ease;
}

.template-combobox-wrap .clear-input-btn:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.template-combobox-wrap .dropdown-arrow-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.template-combobox-wrap .dropdown-arrow-btn:hover {
  color: #334155;
}

/* Template Results Dropdown */
.template-results-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 150;
  overflow: hidden;
  max-height: 380px;
  display: flex;
  flex-direction: column;
}

.dropdown-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.78rem;
  color: #64748b;
}

.dropdown-header-query {
  color: #4f46e5;
  font-weight: 600;
}

.dropdown-active-hint {
  color: #059669;
  font-weight: 600;
}

.template-results-list {
  overflow-y: auto;
  max-height: 330px;
}

.template-result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s ease;
}

.template-result-row:last-child {
  border-bottom: none;
}

.template-result-row:hover {
  background: #f8fafc;
}

.template-result-row.selected {
  background: #eef2ff;
  border-left: 3px solid #6366f1;
}

.template-result-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-result-row.selected .template-result-icon {
  background: #e0e7ff;
  color: #4338ca;
}

.template-result-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.template-result-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-result-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-result-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.type-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.form-tag {
  font-size: 0.72rem;
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 1px 6px;
  border-radius: 4px;
}

.template-result-status {
  flex-shrink: 0;
}

.select-indicator-hint {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.template-result-row:hover .select-indicator-hint {
  opacity: 1;
  color: #6366f1;
}

.no-templates-found {
  padding: 24px 16px;
  text-align: center;
  color: #334155;
  background: #ffffff;
}

/* Selected Template Chip / Banner */
.selected-template-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 8px 14px;
  border-radius: 10px;
  margin-top: 8px;
}

.selected-template-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.chip-check-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #16a34a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
}

.chip-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
  font-size: 0.82rem;
}

.chip-sub-label {
  color: #166534;
  font-weight: 600;
}

.chip-name {
  color: #14532d;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.btn-chip-action {
  background: #ffffff;
  border: 1px solid #86efac;
  color: #15803d;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-chip-action:hover {
  background: #dcfce7;
  border-color: #4ade80;
  color: #166534;
}

/* GHL Search Bar */
.ghl-search-bar {
  display: flex;
  gap: 10px;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding-left: 36px;
}

.btn-search {
  padding: 9px 18px;
  white-space: nowrap;
}

/* Results Dropdown */
.contact-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-loading-row {
  padding: 14px;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

.contact-result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s ease;
}

.contact-result-row:last-child {
  border-bottom: none;
}

.contact-result-row:hover {
  background: #f8fafc;
}

.contact-result-row.selected {
  background: rgba(99, 102, 241, 0.08);
}

.contact-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.contact-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.contact-meta span {
  color: #64748b;
  font-size: 0.78rem;
}

.selected-contact-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  margin-top: 8px;
}

.chip-remove {
  background: transparent;
  border: none;
  color: #065f46;
  cursor: pointer;
  font-weight: 700;
  padding: 0 4px;
}

/* Mode Toggle Grid */
.mode-toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.mode-toggle-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
}

.mode-toggle-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.mode-toggle-card.active {
  background: rgba(99, 102, 241, 0.05);
  border-color: #6366f1;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.1);
}

.mode-icon {
  font-size: 1.5rem;
}

.mode-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mode-title-row strong {
  font-size: 0.95rem;
  color: #0f172a;
}

.check-pill {
  font-size: 0.72rem;
  background: #6366f1;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.mode-content small {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.35;
  display: block;
}

/* Team Repeater Box */
.team-repeater-box {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.repeater-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.repeater-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.repeater-sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.empty-team-state {
  text-align: center;
  padding: 24px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
}

.team-members-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.btn-remove-member {
  background: transparent;
  border: 1px solid #fecaca;
  color: #ef4444;
  font-weight: 600;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.btn-remove-member:hover {
  background: #fee2e2;
  border-color: #f87171;
}

/* Validity Controls */
.validity-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.validity-chips {
  display: flex;
  gap: 6px;
}

.validity-pill {
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.validity-pill:hover {
  background: #e2e8f0;
}

.validity-pill.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.custom-days-box {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #64748b;
}

.custom-num-input {
  width: 65px;
  height: 34px;
  padding: 4px 8px;
  text-align: center;
}

.live-expiry-badge {
  font-size: 0.82rem;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #b45309;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
}

/* Signature Methods */
.sig-methods-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.sig-toggle-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sig-toggle-chip:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.sig-toggle-chip.active {
  background: rgba(99, 102, 241, 0.06);
  border-color: #6366f1;
}

.sig-toggle-chip input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.sig-icon {
  font-size: 1.1rem;
}

.sig-text strong {
  display: block;
  font-size: 0.85rem;
  color: #0f172a;
}

.sig-text small {
  font-size: 0.74rem;
  color: #64748b;
}

/* Sidebar Summary Card */
.create-sidebar {
  position: sticky;
  top: 80px;
}

.summary-card {
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.summary-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 14px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.85rem;
  margin-bottom: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-k {
  color: #64748b;
}

.summary-v {
  color: #0f172a;
  text-align: right;
}

.validation-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.82rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.check-item.ok {
  color: #059669;
  font-weight: 600;
}

.check-bullet {
  font-weight: 800;
  width: 14px;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-full-width {
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-weight: 700;
}

/* Success View */
.created-success-view {
  max-width: 760px;
  margin: 30px auto;
}

.success-banner-card {
  text-align: center;
  padding: 48px 36px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
}

.success-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.success-head {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.success-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 480px;
  margin: 24px auto;
}

.detail-box {
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 0.74rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.signing-link-card {
  margin: 28px 0;
  padding: 20px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  text-align: left;
}

.signing-link-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.signing-link-row {
  display: flex;
  gap: 8px;
}

.signing-url-input {
  font-family: monospace;
  font-size: 0.85rem;
  background: #ffffff;
  color: #334155;
}

.btn-copy {
  white-space: nowrap;
  padding: 0 20px;
}

.signing-link-note {
  font-size: 0.82rem;
  color: #64748b;
  margin: 10px 0 0 0;
}

.success-actions-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

/* ── Section 5 Rich Text Editor Styling ── */
.rte-section-box {
  margin-top: 14px;
}

.field-sync-hint-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-text-toggle {
  background: transparent;
  border: none;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.btn-text-toggle:hover {
  background: #eef2ff;
  color: #4338ca;
}

.text-hint {
  font-size: 0.78rem;
  color: #64748b;
}

.individual-fields-box {
  margin-top: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
}

/* ── Dynamic Template Intake Form Styling ── */
.intake-form-box-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 22px;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.intake-form-box-card:hover {
  border-color: #cbd5e1;
}

.intake-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 1200px) {
  .intake-form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.field-filled-indicator {
  font-size: 0.72rem;
  font-weight: 800;
  color: #16a34a;
  background: #dcfce7;
  padding: 1px 6px;
  border-radius: 10px;
}

.input-with-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-addon-currency {
  position: absolute;
  left: 12px;
  font-weight: 700;
  color: #64748b;
  pointer-events: none;
}

.has-currency-addon {
  padding-left: 26px !important;
}

.radio-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.radio-chip {
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.radio-chip input[type="radio"] {
  margin: 0;
  accent-color: #4f46e5;
}

.radio-chip:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.radio-chip.active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4338ca;
}

.empty-intake-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #334155;
}

.intake-loading-card {
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Contract Builder Settings & Requirement Sections Controls         */
/* ═══════════════════════════════════════════════════════════════════ */
.contract-settings-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.contract-settings-card:hover {
  border-color: #cbd5e1;
}

.settings-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
}

.settings-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-icon {
  font-size: 1.25rem;
  background: #eef2ff;
  color: #4f46e5;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.settings-title {
  font-size: 0.96rem;
  font-weight: 700;
  color: #0f172a;
}

.settings-sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}

.btn-settings-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-settings-pill:hover,
.btn-settings-pill.active {
  background: #eef2ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.settings-drawer {
  padding: 16px 18px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.setting-item-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.15s ease;
}

.setting-item-box:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.setting-item-box.sub-setting {
  margin-left: 12px;
  border-left: 3px solid #818cf8;
  background: #fafbff;
}

.setting-item-box.disabled {
  opacity: 0.65;
  background: #f8fafc;
  border-color: #e2e8f0;
}

.setting-item-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-item-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #1e293b;
}

.setting-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  display: inline-block;
  flex-shrink: 0;
}

.setting-dot.on {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.setting-item-meta small {
  font-size: 0.74rem;
  color: #64748b;
}

/* Modern Toggle Switch */
.switch-control {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  cursor: pointer;
}

.switch-control input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-control .slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
}

.switch-control .slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch-control input:checked + .slider {
  background-color: #4f46e5;
}

.switch-control input:checked + .slider:before {
  transform: translateX(18px);
}

.switch-control.opacity-50 {
  opacity: 0.45;
  pointer-events: none;
}

.settings-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-hint {
  font-size: 0.77rem;
  color: #64748b;
}

/* Section Title Flex & Controls */
.section-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.section-title-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 240px;
}

.section-title-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-toggle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.btn-toggle-badge.included {
  background: #f0fdf4;
  color: #15803d;
  border: 1.5px solid #86efac;
}

.btn-toggle-badge.included:hover {
  background: #dcfce7;
  border-color: #4ade80;
}

.btn-toggle-badge.included .toggle-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 5px rgba(22, 163, 74, 0.5);
}

.btn-toggle-badge.omitted {
  background: #f8fafc;
  color: #64748b;
  border: 1.5px dashed #cbd5e1;
}

.btn-toggle-badge.omitted:hover {
  background: #f1f5f9;
  color: #334155;
  border-color: #94a3b8;
}

.btn-toggle-badge.omitted .toggle-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.btn-collapse-toggle {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-collapse-toggle:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Omitted Notices */
.section-omitted-card {
  opacity: 0.9;
  border-color: #e2e8f0;
}

.section-omitted-notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  flex-wrap: wrap;
}

.omitted-notice-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.omitted-icon {
  font-size: 1.4rem;
  opacity: 0.8;
}

.omitted-notice-left strong {
  display: block;
  font-size: 0.88rem;
  color: #334155;
}

.omitted-notice-left p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

/* Sub-section Container inside Section 6 */
.sub-section-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
  margin-bottom: 16px;
  transition: all 0.15s ease;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-header-badge {
  font-size: 0.68rem;
  font-weight: 700;
  background: #eef2ff;
  color: #4f46e5;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.sub-header-title {
  font-size: 0.94rem;
  font-weight: 700;
  color: #1e293b;
}

.sub-toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  user-select: none;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 3px 10px;
  transition: all 0.15s ease;
}

.sub-toggle-label:hover {
  background: #f1f5f9;
}

.sub-toggle-label input[type="checkbox"] {
  cursor: pointer;
  accent-color: #4f46e5;
}

.sub-box-omitted {
  background: #f8fafc;
  border-style: dashed;
}

.sub-omitted-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #64748b;
  flex-wrap: wrap;
}

.btn-settings-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 1024px) {
  .create-layout {
    grid-template-columns: 1fr;
  }
  .form-grid-3 {
    grid-template-columns: 1fr;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
  .full-col-2 {
    grid-column: span 1;
  }
  .mode-toggle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
