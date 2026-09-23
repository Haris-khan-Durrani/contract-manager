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

            <!-- SECTION 1: Agreement Template -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">📄</span>
                <div>
                  <h3 class="section-title">1. Agreement Template</h3>
                  <p class="section-sub">Select your template. Variables and Schedule One applicant details will be linked automatically.</p>
                </div>
              </div>

              <div class="form-group">
                <label class="field-label">Contract Template <span class="req">*</span></label>
                <div v-if="loadingTemplates" class="spinner-inline">Loading templates…</div>
                <div v-else class="select-wrap">
                  <select v-model="form.templateId" class="form-control form-select" @change="onTemplateChange">
                    <option value="">— Select a template —</option>
                    <option v-for="t in templates" :key="t.id" :value="t.id">
                      {{ t.name }} (v{{ t.current_version }}) · {{ t.contract_type }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Linked Form Banner -->
              <div v-if="selectedTemplate" class="linked-form-banner animate-fade-in">
                <div class="linked-form-icon">📋</div>
                <div class="linked-form-content">
                  <span class="linked-form-label">Attached Legal Form:</span>
                  <strong>{{ selectedTemplate.form_name || 'Standard Client Intake Form' }}</strong>
                  <small>Schedule One and commercial variables will be populated from your entries below.</small>
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
                  <p class="section-sub">Search and select a contact to automatically fill the applicant details below.</p>
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
            </div>

            <div class="section-divider"></div>

            <!-- SECTION 3: Main Applicant: 1 (Schedule One) -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">👤</span>
                <div>
                  <h3 class="section-title">3. Schedule One: Main Applicant 1 Details</h3>
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
                      placeholder="e.g. ALI KAMRAN"
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
                      placeholder="Alikamran003@gmail.com"
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

            <div class="section-divider"></div>

            <!-- SECTION 4: Application Type & Additional Team Applicants (Repeater) -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">👥</span>
                <div>
                  <h3 class="section-title">4. Application Mode & Group Applicants</h3>
                  <p class="section-sub">Select Individual for a single applicant, or Team to add Main Applicant 2, 3, etc. into Schedule One.</p>
                </div>
              </div>

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

            <div class="section-divider"></div>

            <!-- SECTION 5: Commercial Terms & Fees -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">💼</span>
                <div>
                  <h3 class="section-title">5. Commercial Terms & Fees (Schedule Three)</h3>
                  <p class="section-sub">Fill in the program fees and payment schedule terms for this contract.</p>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="field-label">Total Professional Fees <span class="req">*</span></label>
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
                  <label class="field-label">Payment Mode / Schedule <span class="req">*</span></label>
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

            <div class="section-divider"></div>

            <!-- SECTION 6: Signing & Link Validity Controls -->
            <div class="card-section">
              <div class="section-title-wrap">
                <span class="section-icon">⏱️</span>
                <div>
                  <h3 class="section-title">6. Validity & Signing Controls</h3>
                  <p class="section-sub">Configure how long the client's public link remains active and permitted signature methods.</p>
                </div>
              </div>

              <div class="form-group">
                <label class="field-label">Public Link Validity</label>
                <div class="validity-row">
                  <div class="validity-chips">
                    <button
                      v-for="opt in validityOptions"
                      :key="opt.value"
                      type="button"
                      class="validity-pill"
                      :class="{ active: form.validityDays === opt.value }"
                      @click="form.validityDays = opt.value"
                    >
                      {{ opt.label }}
                    </button>
                  </div>

                  <div class="custom-days-box">
                    <span>Custom:</span>
                    <input
                      type="number"
                      v-model.number="form.validityDays"
                      min="1"
                      max="365"
                      class="form-control custom-num-input"
                    />
                    <span>days</span>
                  </div>

                  <div class="live-expiry-badge" v-if="form.validityDays">
                    Expires on <strong>{{ computedExpiryDate }}</strong>
                  </div>
                </div>
              </div>

              <!-- Allowed Signature Methods -->
              <div class="form-group" style="margin-top: 18px;">
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
                <span class="summary-k">Application</span>
                <span class="badge" :class="form.formMode === 'TEAM' ? 'badge-primary' : 'badge-neutral'">
                  {{ form.formMode === 'TEAM' ? `👥 Team (${teamMembers.length + 1} Applicants)` : '👤 Individual (1 Applicant)' }}
                </span>
              </div>
              <div class="summary-row">
                <span class="summary-k">Main Applicant: 1</span>
                <strong class="summary-v">{{ form.recipientName || '—' }}</strong>
              </div>
              <div class="summary-row" v-if="form.formMode === 'TEAM' && teamMembers.length">
                <span class="summary-k">Additional:</span>
                <span class="summary-v">{{ teamMembers.length }} member{{ teamMembers.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="summary-row" v-if="formResponses['contract_value']">
                <span class="summary-k">Total Fees:</span>
                <strong class="summary-v">{{ formResponses['contract_value'] }}</strong>
              </div>
              <div class="summary-row">
                <span class="summary-k">Expires On</span>
                <strong class="summary-v text-warning">{{ computedExpiryDate }}</strong>
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
              <div class="check-item" :class="{ ok: atLeastOneSignatureMethod }">
                <span class="check-bullet">{{ atLeastOneSignatureMethod ? '✓' : '○' }}</span>
                <span>Signature method selected</span>
              </div>
            </div>

            <div class="sidebar-actions">
              <button
                type="button"
                class="btn btn-primary btn-full-width"
                :disabled="!canCreate || creating"
                @click="createContract"
              >
                <span v-if="creating" class="spinner-inline">Generating Contract…</span>
                <span v-else>🚀 Create Contract & Link</span>
              </button>

              <router-link to="/contracts" class="btn btn-secondary btn-full-width" style="text-align:center;">
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
          <div class="success-icon-ring">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 class="success-head">Contract Created Successfully!</h2>
          <p class="text-muted">
            <strong>{{ createdContract.template }}</strong> · {{ form.recipientName }}
          </p>

          <div class="success-details-grid">
            <div class="detail-box">
              <span class="detail-label">Status</span>
              <span class="badge badge-primary">{{ createdContract.state }}</span>
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
            <button
              type="button"
              class="btn btn-primary"
              :disabled="sendingGhl"
              @click="sendViaGhlNow"
            >
              <span v-if="sendingGhl" class="spinner-inline">Sending via GHL…</span>
              <span v-else>💬 Auto-Send via GHL Conversation</span>
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

const router = useRouter()
const auth   = useAuthStore()
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// ─── State ───────────────────────────────────────────────────────────────────
const form = ref({
  templateId:               '',
  formMode:                 'NORMAL',
  formId:                   '',
  ghlContactId:             '',
  ghlOpportunityId:         '',
  recipientName:            '',
  recipientEmail:           '',
  recipientPhone:           '',
  validityDays:             7,
  signatureMethods: {
    draw:   true,
    type:   true,
    upload: false,
  },
  clientSignatureRequired:  true,
  companySignatureRequired: false,
})

// Dynamic form questions values
const formResponses = ref({
  note: 'Spouse & Kids under 18 are included.',
  passport_number: '',
  nationality: '',
  address: '',
  date_of_birth: '',
  contract_value: '',
  discounted_amount: '',
  payment_terms: '',
  visa_type: '',
})

// Team members repeater (Applicant 2, 3, ...)
const teamMembers = ref([])

const templates        = ref([])
const forms            = ref([])
const loadingTemplates = ref(false)
const selectedTemplate = ref(null)

// Contacts / Leads
const allContacts          = ref([])
const contactSearch        = ref('')
const selectedContact      = ref(null)
const loadingContacts      = ref(false)
const showContactDropdown  = ref(false)
const searchContainerRef   = ref(null)

const creating         = ref(false)
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getHeaders() {
  const token = auth.sessionToken || auth.token || localStorage.getItem('contract_auth_token') || ''
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'X-GHL-Context': token || '',
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
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

function onTemplateChange() {
  const t = templates.value.find(t => t.id === form.value.templateId)
  selectedTemplate.value = t || null
  if (t?.validity_days) form.value.validityDays = t.validity_days
  if (t?.form_id) form.value.formId = t.form_id
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
  contactSearch.value         = c.name || c.email || ''
  showContactDropdown.value   = false

  // Populate dynamic form responses
  formResponses.value['client_name']  = c.name || ''
  formResponses.value['client_email'] = c.email || ''
  formResponses.value['phone']        = c.phone || ''
  if (c.companyName) formResponses.value['company_name'] = c.companyName
  if (c.monetaryValue) formResponses.value['contract_value'] = String(c.monetaryValue)
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
async function createContract() {
  if (!canCreate.value) return
  creating.value    = true
  createError.value = ''

  try {
    const contactId = form.value.ghlContactId || `manual_${Date.now()}`

    // Ensure primary recipient values are also inside formResponses
    formResponses.value['client_name']  = form.value.recipientName
    formResponses.value['client_email'] = form.value.recipientEmail
    formResponses.value['phone']        = form.value.recipientPhone

    const payload = {
      templateId:       parseInt(form.value.templateId),
      ghlContactId:     contactId,
      ghlOpportunityId: form.value.ghlOpportunityId || null,
      formMode:         form.value.formMode,
      recipientName:    form.value.recipientName,
      recipientEmail:   form.value.recipientEmail,
      recipientPhone:   form.value.recipientPhone,
      formData:         formResponses.value,
      teamMembers:      form.value.formMode === 'TEAM' ? teamMembers.value : [],
      validityDays:     form.value.validityDays,
      signingConfig: {
        clientSignatureRequired:  form.value.clientSignatureRequired,
        companySignatureRequired: form.value.companySignatureRequired,
        allowedMethods: Object.keys(form.value.signatureMethods || {}).filter(m => form.value.signatureMethods[m]),
      },
    }

    const res = await api.post('/contracts/manual', payload, { headers: getHeaders() })
    createdContract.value = res.data
  } catch (err) {
    createError.value = err.response?.data?.error || err.message || 'Failed to create contract.'
  } finally {
    creating.value = false
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
      { channels: ['sms', 'email'] },
      { headers: getHeaders() }
    )
    alert(res.data?.message || 'Contract dispatched successfully via GoHighLevel Conversation!')
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
    contract_value: '',
    discounted_amount: '',
    payment_terms: '',
    visa_type: '',
  }
  form.value = {
    templateId:               '',
    formMode:                 'NORMAL',
    formId:                   '',
    ghlContactId:             '',
    ghlOpportunityId:         '',
    recipientName:            '',
    recipientEmail:           '',
    recipientPhone:           '',
    validityDays:             7,
    signatureMethods: {
      draw:   true,
      type:   true,
      upload: false,
    },
    clientSignatureRequired:  true,
    companySignatureRequired: false,
  }
  selectedTemplate.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await Promise.all([loadTemplates(), loadForms(), loadInitialContacts()])
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
  background: #ffffff;
  color: #0f172a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.select-wrap select {
  cursor: pointer;
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
