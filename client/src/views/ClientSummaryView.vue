<template>
  <div class="client-summary-page">
    <!-- Top Action Bar -->
    <div class="page-header executive-header glass-card">
      <div class="header-left">
        <div class="header-brand-badge">
          <div class="header-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="header-title-group">
            <div class="header-title-row">
              <h1 class="page-title">Client Summary Form</h1>
              <div v-if="selectedContract" class="contract-id-chip">
                #{{ selectedContract.id }} • {{ selectedContract.recipient_name }}
              </div>
            </div>
            <p class="page-subtitle">Official post-contract immigration onboarding & compliance dossier</p>
          </div>
        </div>
      </div>

      <div class="header-right" v-if="selectedContract">
        <!-- Status indicator -->
        <div class="summary-status-badge">
          <span v-if="summaryStatus === 'COMPLETED'" class="status-pill status-completed" title="Completed Dossier">
            <span class="status-dot-pulse"></span>
            <span class="status-text">Completed by <strong>{{ completedByName || 'Staff' }}</strong></span>
          </span>
          <span v-else-if="summaryStatus === 'DRAFT'" class="status-pill status-draft" title="Draft in Progress">
            <span class="status-dot"></span>
            <span class="status-text">Draft in Progress</span>
          </span>
          <span v-else class="status-pill status-neutral" title="Not Started">
            <span class="status-dot"></span>
            <span class="status-text">Not Started</span>
          </span>
        </div>

        <div class="action-btn-group">
          <!-- Secondary export actions -->
          <button
            type="button"
            class="action-btn action-btn-secondary"
            :disabled="downloadingPdf"
            @click="downloadSummaryPdf"
            title="Download official Client Summary PDF"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>{{ downloadingPdf ? 'Generating…' : 'Summary PDF' }}</span>
          </button>

          <button
            type="button"
            class="action-btn action-btn-secondary"
            @click="printDocument"
            title="Print or Save as PDF"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print</span>
          </button>

          <!-- Primary Hero Export Button -->
          <button
            type="button"
            class="action-btn action-btn-primary"
            :disabled="downloadingZip"
            @click="downloadZipPackage"
            title="Download Complete Compiled Package (Contract + Summary + Attached Files)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>{{ downloadingZip ? 'Compiling ZIP…' : 'Download Package (ZIP)' }}</span>
          </button>

          <div class="action-divider"></div>

          <!-- Workflow action buttons -->
          <button
            type="button"
            class="action-btn action-btn-neutral"
            :disabled="saving"
            @click="saveSummary('DRAFT')"
            title="Save changes as Draft"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ saving && savingMode === 'DRAFT' ? 'Saving…' : 'Save Draft' }}</span>
          </button>

          <button
            v-if="summaryStatus !== 'COMPLETED'"
            type="button"
            class="action-btn action-btn-success"
            :disabled="saving"
            @click="saveSummary('COMPLETED')"
            title="Mark dossier as completed and finalized"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{{ saving && savingMode === 'COMPLETED' ? 'Completing…' : 'Mark Completed' }}</span>
          </button>
          <button
            v-else
            type="button"
            class="action-btn action-btn-reopen"
            :disabled="saving"
            @click="saveSummary('DRAFT')"
            title="Re-open dossier for editing"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
            <span>Reopen Draft</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contract Search & Selector Section -->
    <div class="selector-card glass-card">
      <div class="selector-grid">
        <div class="search-input-col">
          <label class="section-label">SEARCH COMPLETED CONTRACT CLIENTS</label>
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              placeholder="Search by client name, email, phone, or contract #..."
              class="form-control"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="btn-clear"
              @click="clearSearch"
            >✕</button>
          </div>
        </div>

        <div class="contract-pick-col">
          <label class="section-label">SELECT COMPLETED CONTRACT ({{ completedContracts.length }} AVAILABLE)</label>
          <select
            v-model="selectedContractId"
            @change="loadSelectedContract"
            class="form-control select-contract"
            :disabled="loadingContracts"
          >
            <option value="" disabled>-- Select a completed contract client --</option>
            <option v-for="c in completedContracts" :key="c.id" :value="c.id">
              #{{ c.id }} — {{ c.recipient_name || 'Client' }} ({{ c.template_name }}) — {{ c.summary_status || 'NOT STARTED' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Quick summary of selected contract info -->
      <div v-if="selectedContract" class="selected-contract-banner">
        <div class="scb-item">
          <span class="scb-label">CLIENT</span>
          <strong>{{ selectedContract.recipient_name || 'Client' }}</strong>
        </div>
        <div class="scb-item">
          <span class="scb-label">CONTRACT</span>
          <span>#{{ selectedContract.id }} ({{ selectedContract.template_name }})</span>
        </div>
        <div class="scb-item">
          <span class="scb-label">SIGNED DATE</span>
          <span>{{ formatDate(selectedContract.signed_at) }}</span>
        </div>
        <div class="scb-item">
          <span class="scb-label">COUNSELLOR</span>
          <span>{{ selectedContract.assigned_user_name || 'Assigned Agent' }}</span>
        </div>
        <div class="scb-actions">
          <router-link :to="`/contracts/${selectedContract.id}`" class="link-subtle" target="_blank">
            View Contract ↗
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty State if no contract selected -->
    <div v-if="!selectedContract && !loadingContractData" class="empty-state-card glass-card">
      <div class="empty-icon">📁</div>
      <h3>No Contract Selected</h3>
      <p class="text-muted">
        Select a completed contract from the dropdown or search above to view and fill the official Client Summary Form.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loadingContractData" class="loading-state-card glass-card">
      <div class="spinner"></div>
      <p>Loading Client Summary details…</p>
    </div>

    <!-- 9-Page Comprehensive Form (when contract is selected) -->
    <div v-if="selectedContract && !loadingContractData" class="form-container">
      <!-- Section Tabs Navigation & Stepper Header -->
      <div class="stepper-header-card">
        <!-- Progress bar line -->
        <div class="stepper-progress-track">
          <div class="stepper-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <div class="stepper-meta-bar">
          <div class="stepper-title-area">
            <span class="stepper-step-pill">Part {{ currentTabObj.step }} of {{ formTabs.length }}</span>
            <span class="stepper-section-title">{{ currentTabObj.title }}</span>
            <span class="stepper-page-tag">{{ currentTabObj.page }}</span>
          </div>

          <div class="stepper-controls-right">
            <span class="stepper-progress-text">{{ progressPercent }}% Done</span>
            <button
              type="button"
              class="btn-step-nav"
              :disabled="currentTabIndex <= 0"
              @click="goToPrevTab"
              title="Previous Section"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>Prev</span>
            </button>

            <button
              type="button"
              class="btn-step-nav btn-step-nav-primary"
              :disabled="currentTabIndex >= formTabs.length - 1"
              @click="goToNextTab"
              title="Next Section"
            >
              <span>Next</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Tabs with sleek indicators & scroll arrows -->
        <div class="tabs-scroll-wrapper">
          <button 
            type="button" 
            class="tab-scroll-arrow arrow-left" 
            @click="scrollTabs('left')"
            aria-label="Scroll left"
            title="Scroll sections left"
          >
            ‹
          </button>

          <div ref="tabsContainerRef" class="form-nav-tabs">
            <button
              v-for="tab in formTabs"
              :key="tab.id"
              type="button"
              class="tab-btn"
              :class="{ 
                active: currentTab === tab.id,
                completed: isTabCompleted(tab.id)
              }"
              @click="selectTab(tab.id)"
            >
              <span class="tab-number">
                <span v-if="isTabCompleted(tab.id)" class="tab-check">✓</span>
                <span v-else>{{ tab.step }}</span>
              </span>
              <span class="tab-label">{{ tab.title }}</span>
              <span class="tab-page-hint">{{ tab.page }}</span>
            </button>
          </div>

          <button 
            type="button" 
            class="tab-scroll-arrow arrow-right" 
            @click="scrollTabs('right')"
            aria-label="Scroll right"
            title="Scroll sections right"
          >
            ›
          </button>
        </div>
      </div>

      <!-- Document Sheet Container (replicates official 9-page form layout) -->
      <div class="document-sheet glass-card print-target">
        
        <!-- ═══════════════ PAGE 1: GENERAL INFORMATION ═══════════════ -->
        <section v-show="currentTab === 'page1' || isPrinting" class="form-page" id="page-1">
          <div class="official-header">
            <h2 class="doc-main-title">CLIENT SUMMARY FORM</h2>
          </div>

          <div class="grid-two-col">
            <div class="form-row-line">
              <span class="line-label">Registration Number:</span>
              <input type="text" v-model="form.reg_number" class="line-input" placeholder="Registration No." />
            </div>
            <div class="form-row-line">
              <span class="line-label">Registration Date:</span>
              <input type="date" v-model="form.reg_date" class="line-input" />
            </div>
          </div>

          <div class="grid-two-col">
            <div class="form-row-line">
              <span class="line-label">Registered at:</span>
              <input type="text" v-model="form.registered_at" class="line-input" placeholder="e.g. Dubai / Abu Dhabi" />
            </div>
            <div class="form-row-line">
              <span class="line-label">Counsellor Name:</span>
              <input type="text" v-model="form.counsellor_name" class="line-input" placeholder="Counsellor Name" />
            </div>
          </div>

          <div class="form-row-line full-width">
            <span class="line-label">Country Applying From:</span>
            <input type="text" v-model="form.country_applying_from" class="line-input" placeholder="Country Applying From" />
          </div>

          <div class="form-row-line full-width">
            <span class="line-label">Country Applying For:</span>
            <input type="text" v-model="form.country_applying_for" class="line-input" placeholder="Country Applying For" />
          </div>

          <div class="form-row-line full-width">
            <span class="line-label">Applying Category:</span>
            <input type="text" v-model="form.applying_category" class="line-input" placeholder="e.g. Innovator Founder, Skilled Worker, Golden Visa" />
          </div>

          <div class="form-row-line full-width">
            <span class="line-label">Client Name:</span>
            <input type="text" v-model="form.client_name" class="line-input" placeholder="Full Legal Client Name" />
          </div>

          <div class="grid-two-col">
            <div class="form-row-line">
              <span class="line-label">Nationality:</span>
              <input type="text" v-model="form.nationality" class="line-input" placeholder="Nationality" />
            </div>
            <div class="form-row-line">
              <span class="line-label">Date of Birth:</span>
              <input type="date" v-model="form.dob" class="line-input" />
            </div>
          </div>

          <div class="grid-two-col">
            <div class="form-row-line">
              <span class="line-label">Contact Number (Landline):</span>
              <input type="text" v-model="form.contact_landline" class="line-input" placeholder="Landline" />
            </div>
            <div class="form-row-line">
              <span class="line-label">(Mobile):</span>
              <input type="text" v-model="form.contact_mobile" class="line-input" placeholder="Mobile Number" />
            </div>
          </div>

          <div class="form-row-line full-width">
            <span class="line-label">Email:</span>
            <input type="email" v-model="form.email" class="line-input" placeholder="Client Email" />
          </div>

          <div class="form-row-line full-width" style="align-items: flex-start;">
            <span class="line-label" style="padding-top: 6px;">Residential Address:</span>
            <textarea v-model="form.residential_address" class="line-input" rows="2" placeholder="Full Residential Address"></textarea>
          </div>

          <div class="submission-time-box">
            <span class="bold-text">Expected Time of Submission after registration:</span>
            <div class="checkbox-group inline-group">
              <label class="cb-label">
                <input type="radio" value="8_weeks" v-model="form.expected_submission" />
                <span>8 Weeks</span>
              </label>
              <label class="cb-label">
                <input type="radio" value="12_weeks" v-model="form.expected_submission" />
                <span>12 Weeks</span>
              </label>
            </div>
          </div>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 1</div>
        </section>

        <!-- ═══════════════ PAGE 2: IMMIGRATION HISTORY ═══════════════ -->
        <section v-show="currentTab === 'page2' || isPrinting" class="form-page" id="page-2">
          <div class="section-banner">
            <h3>Immigration Background/History</h3>
          </div>

          <table class="bordered-table">
            <tbody>
              <!-- 1 -->
              <tr>
                <td class="col-num">1</td>
                <td class="col-content">
                  <div class="q-title">Have you ever applied for any of the following Countries?</div>
                  <div class="countries-checkbox-row">
                    <label v-for="c in ['UK', 'Canada', 'USA', 'Australia', 'Europe']" :key="c" class="cb-label">
                      <input type="checkbox" :value="c" v-model="form.q1_applied_countries" />
                      <span>{{ c }}</span>
                    </label>
                  </div>
                </td>
              </tr>

              <!-- 2 -->
              <tr>
                <td class="col-num">2</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever been refused a visa for any country?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q2_refused_visa" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q2_refused_visa" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q2_refused_visa === 'yes'" class="q-subdetails animate-fade-in">
                    <p class="sub-instruction">If yes – provide details:</p>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• Country of visa application:</span>
                        <input type="text" v-model="form.q2_details.country" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Type of Visa refused:</span>
                        <input type="text" v-model="form.q2_details.visa_type" class="line-input" />
                      </div>
                    </div>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• Date of Refusal:</span>
                        <input type="date" v-model="form.q2_details.refusal_date" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Reason for Refusal:</span>
                        <input type="text" v-model="form.q2_details.refusal_reason" class="line-input" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 3 -->
              <tr>
                <td class="col-num">3</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever been overstayed in any country?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q3_overstayed" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q3_overstayed" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q3_overstayed === 'yes'" class="q-subdetails animate-fade-in">
                    <div class="form-row-line full-width">
                      <span class="line-label">If yes – provide the reason:</span>
                      <input type="text" v-model="form.q3_details.reason" class="line-input" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 4 -->
              <tr>
                <td class="col-num">4</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you been deported, removed, or otherwise required to leave any country in the last 10 years?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q4_deported" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q4_deported" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q4_deported === 'yes'" class="q-subdetails animate-fade-in">
                    <p class="sub-instruction">If yes – provide details:</p>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• Country:</span>
                        <input type="text" v-model="form.q4_details.country" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Date of deportation/removal:</span>
                        <input type="date" v-model="form.q4_details.deportation_date" class="line-input" />
                      </div>
                    </div>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• The port or airport:</span>
                        <input type="text" v-model="form.q4_details.port_airport" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Reason for deportation/removal:</span>
                        <input type="text" v-model="form.q4_details.deportation_reason" class="line-input" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 5 -->
              <tr>
                <td class="col-num">5</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever voluntarily elected to depart from any country?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q5_voluntary_depart" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q5_voluntary_depart" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q5_voluntary_depart === 'yes'" class="q-subdetails animate-fade-in">
                    <p class="sub-instruction">If yes – provide details:</p>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• Date of departure (DD/MM/YYYY):</span>
                        <input type="date" v-model="form.q5_details.departure_date" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Airport or port of departure:</span>
                        <input type="text" v-model="form.q5_details.airport_port" class="line-input" />
                      </div>
                    </div>
                    <div class="grid-two-col">
                      <div class="form-row-line">
                        <span class="line-label">• Immigration decision / served papers:</span>
                        <input type="text" v-model="form.q5_details.decision_papers" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Reference number:</span>
                        <input type="text" v-model="form.q5_details.ref_number" class="line-input" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 6 -->
              <tr>
                <td class="col-num">6</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Are you, or have you been subject to, an exclusion order from any Country?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q6_exclusion_order" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q6_exclusion_order" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q6_exclusion_order === 'yes'" class="q-subdetails animate-fade-in">
                    <p class="sub-instruction">If yes – provide details:</p>
                    <div class="grid-three-col">
                      <div class="form-row-line">
                        <span class="line-label">• Date:</span>
                        <input type="date" v-model="form.q6_details.date" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Reference Number:</span>
                        <input type="text" v-model="form.q6_details.ref_number" class="line-input" />
                      </div>
                      <div class="form-row-line">
                        <span class="line-label">• Reason:</span>
                        <input type="text" v-model="form.q6_details.reason" class="line-input" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 7 -->
              <tr>
                <td class="col-num">7</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever held work permit/UK National Insurance Number?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q7_work_permit_ni" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q7_work_permit_ni" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q7_work_permit_ni === 'yes'" class="q-subdetails animate-fade-in">
                    <div class="form-row-line full-width">
                      <span class="line-label">• National Insurance number:</span>
                      <input type="text" v-model="form.q7_details.ni_number" class="line-input" placeholder="e.g. QQ 12 34 56 A" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 2</div>
        </section>

        <!-- ═══════════════ PAGE 3 & 4: BUSINESS BACKGROUND ═══════════════ -->
        <section v-show="currentTab === 'page3' || isPrinting" class="form-page" id="page-3">
          <div class="section-banner">
            <h3>Business Background</h3>
            <span class="banner-sub">(If any provide details, in case none - mark N/A. If the applicant going to use this business for visa application)</span>
          </div>

          <table class="bordered-table">
            <tbody>
              <!-- 8 -->
              <tr>
                <td class="col-num">8</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Do you own a business?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q8_own_business" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q8_own_business" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q8_own_business === 'yes'" class="q-subdetails animate-fade-in">
                    <div class="sub-instruction">Legal Status of the Business:</div>
                    <div class="checkbox-group inline-group" style="margin-top: 6px;">
                      <label v-for="st in ['Sole Trader', 'Partnership', 'Limited Liability Company']" :key="st" class="cb-label">
                        <input type="radio" :value="st" v-model="form.q8_legal_status" />
                        <span>{{ st }}</span>
                      </label>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 9 & 10 -->
              <tr>
                <td class="col-num">9</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Name of The Business:</span>
                    <input type="text" v-model="form.q9_business_name" class="line-input" placeholder="Business name" />
                  </div>
                </td>
              </tr>

              <tr>
                <td class="col-num">10</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Business Establishment Date:</span>
                    <input type="date" v-model="form.q10_est_date" class="line-input" />
                  </div>
                </td>
              </tr>

              <!-- 11 -->
              <tr>
                <td class="col-num">11</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 8px;">List the name of Partners/Directors and their Shares</div>
                  <div class="subtable-wrapper">
                    <table class="nested-table">
                      <thead>
                        <tr>
                          <th style="width: 50px;">#</th>
                          <th>Partners / Directors</th>
                          <th style="width: 140px;">Shares (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(p, idx) in form.q11_partners_shares" :key="idx">
                          <td style="text-align: center; color: #64748b;">{{ idx + 1 }}.</td>
                          <td>
                            <input type="text" v-model="p.partner" class="table-cell-input" placeholder="Partner / Director Name" />
                          </td>
                          <td>
                            <input type="text" v-model="p.shares" class="table-cell-input" placeholder="e.g. 50%" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- 12 -->
              <tr>
                <td class="col-num">12</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Nature Of Business:</span>
                    <input type="text" v-model="form.q12_nature_of_business" class="line-input" placeholder="e.g. Software Development / E-commerce / Consulting" />
                  </div>
                </td>
              </tr>

              <!-- 13 -->
              <tr>
                <td class="col-num">13</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 8px;">Business Documents Available / Provided:</div>
                  <div class="grid-two-col checklist-grid">
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.company_profile" /> Company Profile</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.ntn_license" /> NTN/Professional License Number</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.tax_returns" /> Tax Returns</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.audit_reports" /> Audit Reports</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.business_registration" /> Business Registration Documents</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.business_accreditation" /> Business Accreditation Documents</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.professional_membership" /> Professional Membership</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.premises_documents" /> Business Premises Documents</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.sales_purchase_invoices" /> Sales & Purchase Invoices</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.bank_confirmation_letter" /> Letter from Bank Confirming business</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.business_bank_statements" /> Business Bank Statements</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.appreciation_letter" /> Letter of appreciation</label>
                    <label class="cb-label"><input type="checkbox" v-model="form.q13_business_docs.import_export_docs" /> Import/Export Documents</label>
                  </div>
                </td>
              </tr>

              <!-- 14 -->
              <tr>
                <td class="col-num">14</td>
                <td class="col-content">
                  <div class="q-title">Any Other Related Business Documents:</div>
                  <div class="sub-instruction" style="margin-bottom: 6px;">(Any other documents applicant may believe will be supporting for application)</div>
                  <textarea v-model="form.q14_other_business_docs" class="form-control" rows="2" placeholder="List any other relevant documents..."></textarea>
                </td>
              </tr>

              <!-- 15 -->
              <tr>
                <td class="col-num">15</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">Brief Description of Products & Services:</div>
                  <textarea v-model="form.q15_products_services_desc" class="form-control" rows="3" placeholder="Describe the products, services, value proposition, and customer base..."></textarea>
                </td>
              </tr>

              <!-- 16 -->
              <tr>
                <td class="col-num">16</td>
                <td class="col-content">
                  <div class="q-title">If the applicant has multiple businesses, please provide details below:</div>
                  <div class="sub-instruction" style="margin-bottom: 6px;">Please give details about business name, description, activity, AND shareholders.</div>
                  <textarea v-model="form.q16_multiple_businesses" class="form-control" rows="3" placeholder="Additional businesses details..."></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 3 & 4</div>
        </section>

        <!-- ═══════════════ PAGE 4 & 5: EMPLOYMENT BACKGROUND ═══════════════ -->
        <section v-show="currentTab === 'page4' || isPrinting" class="form-page" id="page-4">
          <div class="section-banner">
            <h3>Employment Background</h3>
            <span class="banner-sub">(If any provide details, in case none - mark N/A)</span>
          </div>

          <!-- Current Employment -->
          <div class="subsection-header">Current Employment</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">17</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Name of the Current Employer:</span>
                    <input type="text" v-model="form.q17_current_employer" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">18</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Current Designation:</span>
                    <input type="text" v-model="form.q18_current_designation" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">19</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Number of years of Employment at this company:</span>
                    <input type="text" v-model="form.q19_current_years" class="line-input" placeholder="e.g. 4 years (2020 - Present)" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">20</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">Brief Job Description:</div>
                  <textarea v-model="form.q20_current_job_desc" class="form-control" rows="2" placeholder="Key responsibilities and day-to-day duties..."></textarea>
                </td>
              </tr>
              <tr>
                <td class="col-num">21</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Area of Expertise:</span>
                    <input type="text" v-model="form.q21_current_expertise" class="line-input" placeholder="e.g. Strategic Management, Operations, AI Development" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Previous Employment 1 -->
          <div class="subsection-header" style="margin-top: 20px;">Previous Employment (Role 1)</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">22</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Name of the Previous Employer:</span>
                    <input type="text" v-model="form.q22_prev1_employer" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">23</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Designation:</span>
                    <input type="text" v-model="form.q23_prev1_designation" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">24</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Number of years of Employment / Worked Since-Till:</span>
                    <input type="text" v-model="form.q24_prev1_years_worked" class="line-input" placeholder="e.g. 2017 - 2020 (3 years)" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">25</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">Brief Job Description:</div>
                  <textarea v-model="form.q25_prev1_job_desc" class="form-control" rows="2" placeholder="Responsibilities..."></textarea>
                </td>
              </tr>
              <tr>
                <td class="col-num">26</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Area of Expertise:</span>
                    <input type="text" v-model="form.q26_prev1_expertise" class="line-input" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Previous Employment 2 -->
          <div class="subsection-header" style="margin-top: 20px;">Previous Employment (Role 2)</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">27</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Name of the Previous Employer:</span>
                    <input type="text" v-model="form.q27_prev2_employer" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">28</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Designation:</span>
                    <input type="text" v-model="form.q28_prev2_designation" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">29</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Number of years of Employment / Worked Since-Till:</span>
                    <input type="text" v-model="form.q29_prev2_years_worked" class="line-input" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="col-num">30</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">Brief Job Description:</div>
                  <textarea v-model="form.q30_prev2_job_desc" class="form-control" rows="2" placeholder="Responsibilities..."></textarea>
                </td>
              </tr>
              <tr>
                <td class="col-num">31</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Area of Expertise:</span>
                    <input type="text" v-model="form.q31_prev2_expertise" class="line-input" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 4 & 5</div>
        </section>

        <!-- ═══════════════ PAGE 5 & 6: PERSONAL & FAMILY BACKGROUND ═══════════════ -->
        <section v-show="currentTab === 'page5' || isPrinting" class="form-page" id="page-5">
          <div class="section-banner">
            <h3>Personal/Family Background</h3>
          </div>

          <table class="bordered-table">
            <tbody>
              <!-- 32 -->
              <tr>
                <td class="col-num">32</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Do you currently hold, or have you ever held, any other Nationality/Nationalities?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q32_other_nationality" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q32_other_nationality" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q32_other_nationality === 'yes'" class="q-subdetails animate-fade-in">
                    <div class="form-row-line full-width">
                      <span class="line-label">• Name of the Country:</span>
                      <input type="text" v-model="form.q32_details.country" class="line-input" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 33 -->
              <tr>
                <td class="col-num">33</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">Place of issue of your Passport:</span>
                    <input type="text" v-model="form.q33_passport_issue_place" class="line-input" placeholder="e.g. London / Dubai / Islamabad" />
                  </div>
                </td>
              </tr>

              <!-- 34 -->
              <tr>
                <td class="col-num">34</td>
                <td class="col-content">
                  <div class="form-row-line full-width">
                    <span class="line-label bold-text">How long have you lived at your current address?</span>
                    <input type="text" v-model="form.q34_address_duration" class="line-input" placeholder="e.g. 5 Years" />
                  </div>
                </td>
              </tr>

              <!-- 35 -->
              <tr>
                <td class="col-num">35</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Do you have any criminal convictions in any country (including spent/unspent convictions and traffic offences)?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q35_criminal_convictions" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q35_criminal_convictions" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q35_criminal_convictions === 'yes'" class="q-subdetails animate-fade-in">
                    <textarea v-model="form.q35_details" class="form-control" rows="2" placeholder="Provide full details of convictions..."></textarea>
                  </div>
                </td>
              </tr>

              <!-- 36 -->
              <tr>
                <td class="col-num">36</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever been charged in any country with a criminal offence for which you have not yet been tried in the court (including traffic offences)?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q36_criminal_charges" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q36_criminal_charges" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q36_criminal_charges === 'yes'" class="q-subdetails animate-fade-in">
                    <textarea v-model="form.q36_details" class="form-control" rows="2" placeholder="Provide full details of charges..."></textarea>
                  </div>
                </td>
              </tr>

              <!-- 37 -->
              <tr>
                <td class="col-num">37</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Will your spouse/partner/dependent be applying with you?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q37_spouse_dependents_applying" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q37_spouse_dependents_applying" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q37_spouse_dependents_applying === 'yes'" class="q-subdetails animate-fade-in">
                    <div class="form-row-line full-width">
                      <span class="line-label">• Name of the Spouse:</span>
                      <input type="text" v-model="form.q37_details.spouse_name" class="line-input" />
                    </div>
                    <div class="form-row-line full-width" style="margin-top: 6px;">
                      <span class="line-label">• Number of Dependents and Names:</span>
                      <input type="text" v-model="form.q37_details.dependents_count_names" class="line-input" placeholder="e.g. 2 Dependents: Sarah (daughter, age 6), Adam (son, age 4)" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 38 -->
              <tr>
                <td class="col-num">38</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Does your spouse / partner currently live with you?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q38_spouse_live_with_you" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q38_spouse_live_with_you" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q38_spouse_live_with_you === 'no'" class="q-subdetails animate-fade-in">
                    <div class="form-row-line full-width">
                      <span class="line-label">• Address and contact details:</span>
                      <input type="text" v-model="form.q38_details.address_contact" class="line-input" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 39: Parents of Main Applicant -->
          <div class="subsection-header" style="margin-top: 24px;">
            39. Provide the following details of your parents (Father and Mother of the main applicant)
          </div>
          <table class="parents-table">
            <thead>
              <tr>
                <th style="width: 25%;">Field</th>
                <th style="width: 37.5%;">Father</th>
                <th style="width: 37.5%;">Mother</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="field-title">Given Name</td>
                <td><input type="text" v-model="form.q39_parents_details.father.given_name" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q39_parents_details.mother.given_name" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Family Name</td>
                <td><input type="text" v-model="form.q39_parents_details.father.family_name" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q39_parents_details.mother.family_name" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Date of Birth</td>
                <td><input type="date" v-model="form.q39_parents_details.father.dob" class="table-cell-input" /></td>
                <td><input type="date" v-model="form.q39_parents_details.mother.dob" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Place of Birth (City & Country)</td>
                <td><input type="text" v-model="form.q39_parents_details.father.birth_place" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q39_parents_details.mother.birth_place" class="table-cell-input" /></td>
              </tr>
            </tbody>
          </table>

          <!-- 40: Spouse's Parents -->
          <div class="subsection-header" style="margin-top: 24px;">
            40. Provide the following details of spouse’s parents (Father and Mother of the main applicant’s spouse)
          </div>
          <table class="parents-table">
            <thead>
              <tr>
                <th style="width: 25%;">Field</th>
                <th style="width: 37.5%;">Father</th>
                <th style="width: 37.5%;">Mother</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="field-title">Given Name</td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.father.given_name" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.mother.given_name" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Family Name</td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.father.family_name" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.mother.family_name" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Date of Birth</td>
                <td><input type="date" v-model="form.q40_spouse_parents_details.father.dob" class="table-cell-input" /></td>
                <td><input type="date" v-model="form.q40_spouse_parents_details.mother.dob" class="table-cell-input" /></td>
              </tr>
              <tr>
                <td class="field-title">Place of Birth (City & Country)</td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.father.birth_place" class="table-cell-input" /></td>
                <td><input type="text" v-model="form.q40_spouse_parents_details.mother.birth_place" class="table-cell-input" /></td>
              </tr>
            </tbody>
          </table>

          <!-- 41: Medical Treatment -->
          <div class="subsection-header" style="margin-top: 24px;">41. Medical Treatment</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">41</td>
                <td class="col-content">
                  <div class="q-header-row">
                    <span class="q-title">Have you ever received medical treatment in the UK or any other Country (out of your residence)?</span>
                    <div class="yes-no-group">
                      <label class="cb-label"><input type="radio" value="yes" v-model="form.q41_medical_treatment" /> Yes</label>
                      <label class="cb-label"><input type="radio" value="no" v-model="form.q41_medical_treatment" /> No</label>
                    </div>
                  </div>
                  <div v-if="form.q41_medical_treatment === 'yes'" class="q-subdetails animate-fade-in">
                    <p class="sub-instruction">If yes – provide details:</p>
                    <div class="q-header-row" style="margin-bottom: 8px;">
                      <span>• Did you have to pay for the treatment?</span>
                      <div class="yes-no-group">
                        <label class="cb-label"><input type="radio" value="yes" v-model="form.q41_details.pay_for_treatment" /> Yes</label>
                        <label class="cb-label"><input type="radio" value="no" v-model="form.q41_details.pay_for_treatment" /> No</label>
                      </div>
                    </div>
                    <div class="form-row-line full-width">
                      <span class="line-label">• Facility address and contact details:</span>
                      <input type="text" v-model="form.q41_details.facility_address_contact" class="line-input" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 5 & 6</div>
        </section>

        <!-- ═══════════════ PAGE 6 & 7: ACADEMIC BACKGROUND ═══════════════ -->
        <section v-show="currentTab === 'page6' || isPrinting" class="form-page" id="page-6">
          <div class="section-banner">
            <h3>Academic Background</h3>
          </div>

          <!-- 42: Education -->
          <div class="subsection-header">42. Education</div>
          <table class="bordered-table">
            <tbody>
              <!-- PHD -->
              <tr>
                <td class="col-num">
                  <input type="checkbox" v-model="form.q42_education.phd.checked" />
                </td>
                <td class="col-content">
                  <div class="grid-two-col">
                    <div class="form-row-line">
                      <span class="line-label bold-text">PHD — Name of Institute:</span>
                      <input type="text" v-model="form.q42_education.phd.institute" class="line-input" />
                    </div>
                    <div class="form-row-line">
                      <span class="line-label bold-text">Year of Award:</span>
                      <input type="text" v-model="form.q42_education.phd.year" class="line-input" style="max-width: 140px;" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Masters -->
              <tr>
                <td class="col-num">
                  <input type="checkbox" v-model="form.q42_education.masters.checked" />
                </td>
                <td class="col-content">
                  <div class="grid-two-col">
                    <div class="form-row-line">
                      <span class="line-label bold-text">Masters — Name of Institute:</span>
                      <input type="text" v-model="form.q42_education.masters.institute" class="line-input" />
                    </div>
                    <div class="form-row-line">
                      <span class="line-label bold-text">Year of Award:</span>
                      <input type="text" v-model="form.q42_education.masters.year" class="line-input" style="max-width: 140px;" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Post Graduate Diploma -->
              <tr>
                <td class="col-num">
                  <input type="checkbox" v-model="form.q42_education.post_grad_diploma.checked" />
                </td>
                <td class="col-content">
                  <div class="grid-two-col">
                    <div class="form-row-line">
                      <span class="line-label bold-text">Post Graduate Diploma — Name of Institute:</span>
                      <input type="text" v-model="form.q42_education.post_grad_diploma.institute" class="line-input" />
                    </div>
                    <div class="form-row-line">
                      <span class="line-label bold-text">Year of Award:</span>
                      <input type="text" v-model="form.q42_education.post_grad_diploma.year" class="line-input" style="max-width: 140px;" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Bachelor's Degree -->
              <tr>
                <td class="col-num">
                  <input type="checkbox" v-model="form.q42_education.bachelors.checked" />
                </td>
                <td class="col-content">
                  <div class="grid-two-col">
                    <div class="form-row-line">
                      <span class="line-label bold-text">Bachelor’s Degree — Name of Institute:</span>
                      <input type="text" v-model="form.q42_education.bachelors.institute" class="line-input" />
                    </div>
                    <div class="form-row-line">
                      <span class="line-label bold-text">Year of Award:</span>
                      <input type="text" v-model="form.q42_education.bachelors.year" class="line-input" style="max-width: 140px;" />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Higher Secondary / A Levels -->
              <tr>
                <td class="col-num">
                  <input type="checkbox" v-model="form.q42_education.higher_secondary.checked" />
                </td>
                <td class="col-content">
                  <div class="grid-two-col">
                    <div class="form-row-line">
                      <span class="line-label bold-text">Higher Secondary / A Levels — Name of Institute:</span>
                      <input type="text" v-model="form.q42_education.higher_secondary.institute" class="line-input" />
                    </div>
                    <div class="form-row-line">
                      <span class="line-label bold-text">Year of Award:</span>
                      <input type="text" v-model="form.q42_education.higher_secondary.year" class="line-input" style="max-width: 140px;" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 43: Professional Courses/Certificates -->
          <div class="subsection-header" style="margin-top: 24px;">43. Professional Courses/Certificates</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">43</td>
                <td class="col-content">
                  <div class="bullet-inputs-col">
                    <div v-for="(_, i) in form.q43_prof_courses" :key="i" class="bullet-input-row">
                      <span class="bullet-dot">•</span>
                      <input type="text" v-model="form.q43_prof_courses[i]" class="line-input" :placeholder="`Course / Certificate ${i + 1}`" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 44: Professional Memberships -->
          <div class="subsection-header" style="margin-top: 24px;">44. Professional Memberships</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">44</td>
                <td class="col-content">
                  <div class="bullet-inputs-col">
                    <div v-for="(_, i) in form.q44_prof_memberships" :key="i" class="bullet-input-row">
                      <span class="bullet-dot">•</span>
                      <input type="text" v-model="form.q44_prof_memberships[i]" class="line-input" :placeholder="`Professional Membership ${i + 1}`" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 45: Other Achievements -->
          <div class="subsection-header" style="margin-top: 24px;">45. Other Achievements</div>
          <table class="bordered-table">
            <tbody>
              <tr>
                <td class="col-num">45</td>
                <td class="col-content">
                  <div class="bullet-inputs-col">
                    <div v-for="(_, i) in form.q45_other_achievements" :key="i" class="bullet-input-row">
                      <span class="bullet-dot">•</span>
                      <input type="text" v-model="form.q45_other_achievements[i]" class="line-input" :placeholder="`Achievement ${i + 1}`" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 6 & 7</div>
        </section>

        <!-- ═══════════════ PAGE 8: FINANCIALS ═══════════════ -->
        <section v-show="currentTab === 'page7' || isPrinting" class="form-page" id="page-7">
          <div class="section-banner">
            <h3>Financials</h3>
          </div>

          <table class="bordered-table">
            <tbody>
              <!-- 46 -->
              <tr>
                <td class="col-num">46</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">Personal Bank Statements:</div>
                  <div class="checkbox-group inline-group" style="margin-bottom: 12px;">
                    <label class="cb-label">
                      <input type="checkbox" v-model="form.q46_bank_statements.individual" />
                      <span>Individual Account</span>
                    </label>
                    <label class="cb-label">
                      <input type="checkbox" v-model="form.q46_bank_statements.joint" />
                      <span>Joint Account</span>
                    </label>
                  </div>

                  <div class="q-title" style="margin-bottom: 6px;">Category of Application:</div>
                  <div class="checkbox-group inline-group flex-wrap">
                    <label v-for="cat in ['Innovator', 'Global Business Mobility', 'Portugal D2/D7/D8', 'Isle of Man', 'Ireland', 'Denmark', 'France']" :key="cat" class="cb-label">
                      <input type="checkbox" :value="cat" v-model="form.q46_categories" />
                      <span>{{ cat }}</span>
                    </label>
                  </div>
                </td>
              </tr>

              <!-- 47 -->
              <tr>
                <td class="col-num">47</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 8px;">Availability of Investment Funds:</div>
                  <div class="bullet-checkboxes">
                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q47_investment_funds.own_funds" />
                      <span>Own Funds (Maintained 90 days)</span>
                    </label>

                    <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 6px; margin-top: 4px; margin-bottom: 6px;">
                      <span class="sub-instruction">• Third Party Funds:</span>
                      <label class="cb-label block-cb" style="margin-left: 12px;">
                        <input type="checkbox" v-model="form.q47_investment_funds.third_party_individual" />
                        <span>Funded by Individuals</span>
                      </label>
                      <label class="cb-label block-cb" style="margin-left: 12px;">
                        <input type="checkbox" v-model="form.q47_investment_funds.third_party_company" />
                        <span>Funded by Company</span>
                      </label>
                    </div>

                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q47_investment_funds.agree_endorsing_fee" />
                      <span>Agree to pay endorsing body Fee</span>
                    </label>

                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q47_investment_funds.agree_visa_ihs_fee" />
                      <span>Agree to pay visa fee and Immigration Healthcare Surcharge/Insurance</span>
                    </label>
                  </div>
                </td>
              </tr>

              <!-- 48 -->
              <tr>
                <td class="col-num">48</td>
                <td class="col-content">
                  <div class="q-title">Source of Funds:</div>
                  <div class="sub-instruction" style="margin-bottom: 6px;">
                    (Kindly furnish information about the origin of the funds. This may include sources such as inheritance, asset sales, gifts, savings, or others. Please provide documentary evidence to support this.)
                  </div>
                  <textarea v-model="form.q48_source_of_funds" class="form-control" rows="3" placeholder="Explain the origin and breakdown of funds..."></textarea>
                </td>
              </tr>

              <!-- 49 -->
              <tr>
                <td class="col-num">49</td>
                <td class="col-content">
                  <div class="q-title">Maintenance Funds:</div>
                  <div class="sub-instruction" style="margin-bottom: 8px;">Applicant will maintain funds as per the schedule appurtenant:</div>
                  <div class="maintenance-funds-grid">
                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q49_maintenance_funds.applicant" />
                      <span>Applicant - £1,270</span>
                    </label>
                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q49_maintenance_funds.spouse" />
                      <span>Spouse/Partner - £285</span>
                    </label>
                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q49_maintenance_funds.first_child" />
                      <span>First Child - £315</span>
                    </label>
                    <label class="cb-label block-cb">
                      <input type="checkbox" v-model="form.q49_maintenance_funds.additional_child" />
                      <span>Additional Child - £200</span>
                    </label>
                  </div>
                </td>
              </tr>

              <!-- 50 -->
              <tr>
                <td class="col-num">50</td>
                <td class="col-content">
                  <div class="q-title" style="margin-bottom: 6px;">English Language Proficiency:</div>
                  <textarea v-model="form.q50_english_proficiency" class="form-control" rows="2" placeholder="e.g. IELTS UKVI 6.5, Degree taught in English, or Ecctis Certified"></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 8</div>
        </section>

        <!-- ═══════════════ PAGE 9: ACTION PLAN & SIGNATURES ═══════════════ -->
        <section v-show="currentTab === 'page8' || isPrinting" class="form-page" id="page-9">
          <!-- Course of Action for Business Plan -->
          <div class="section-banner">
            <h3>Course of Action for Business Plan:</h3>
          </div>
          <div class="action-box">
            <textarea
              v-model="form.course_of_action_business_plan"
              class="form-control box-textarea"
              rows="6"
              placeholder="Outline the course of action for business plan drafting, market research, financial forecasting, and endorsement preparation..."
            ></textarea>
          </div>

          <!-- Course of Action for Application -->
          <div class="section-banner" style="margin-top: 24px;">
            <h3>Course of Action for Application: (Complete Case Summary)</h3>
          </div>
          <div class="action-box">
            <textarea
              v-model="form.course_of_action_application"
              class="form-control box-textarea"
              rows="6"
              placeholder="Comprehensive summary of the case, procedural roadmap, milestones, document checklist, and anticipated submission timeline..."
            ></textarea>
          </div>

          <!-- Signatures Section -->
          <div class="signatures-wrapper">
            <div class="sig-block">
              <div class="sig-line">
                <input
                  type="text"
                  v-model="form.applicant_signature.name"
                  class="sig-name-input"
                  placeholder="Applicant Name"
                />
              </div>
              <div class="sig-title">Signed by Applicant</div>
              <div class="sig-date-row">
                <span>Date:</span>
                <input type="date" v-model="form.applicant_signature.date" class="line-input sig-date-input" />
              </div>
            </div>

            <div class="sig-block">
              <div class="sig-line">
                <input
                  type="text"
                  v-model="form.counselor_signature.name"
                  class="sig-name-input"
                  placeholder="Counselor Name"
                />
              </div>
              <div class="sig-title">Signed by Counselor</div>
              <div class="sig-date-row">
                <span>Date:</span>
                <input type="date" v-model="form.counselor_signature.date" class="line-input sig-date-input" />
              </div>
            </div>
          </div>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Page 9</div>
        </section>

        <!-- ═══════════════ PAGE 9: SUPPORTING ATTACHMENTS & COMPILED PACKAGE ═══════════════ -->
        <section v-show="currentTab === 'page9' || isPrinting" class="form-page" id="page-9">
          <div class="official-header">
            <h2 class="doc-main-title">SUPPORTING DOCUMENTS & CASE COMPILATION</h2>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              Upload supporting client documents (Passport, CV, Bank Statements, Degrees). All files are hosted on HighLevel Media and compiled into a single download archive with the contract and summary.
            </div>
          </div>

          <!-- Upload Dropzone Card -->
          <div class="attachment-upload-zone" @click="triggerAttachmentUpload">
            <input
              ref="attachmentFileInput"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              style="display: none;"
              @change="onAttachmentSelected"
            />
            <div class="upload-zone-content">
              <div class="upload-icon">📂</div>
              <h4 style="margin: 4px 0; font-size: 0.95rem; font-weight: 700; color: #0f172a;">
                {{ uploadingAttachment ? '⏳ Uploading file to HighLevel Media Library…' : 'Click to Upload Supporting Files or Drag & Drop' }}
              </h4>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">
                Supports PDF, JPG, PNG, DOCX, XLSX up to 25MB per file. Stored securely in GoHighLevel Media.
              </p>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                style="margin-top: 10px;"
                :disabled="uploadingAttachment"
              >
                {{ uploadingAttachment ? 'Uploading…' : '📁 Select Files from Device' }}
              </button>
            </div>
          </div>

          <!-- Attachments List -->
          <div style="margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: #1e293b;">
                Attached Documents ({{ form.attachments?.length || 0 }})
              </h3>
              <span v-if="form.attachments?.length" style="font-size: 11px; color: #047857; font-weight: 600;">
                ✓ Saved & Embedded with Summary Dossier
              </span>
            </div>

            <div v-if="!form.attachments || !form.attachments.length" class="no-attachments-box">
              <span>No documents uploaded yet. Click above to attach client identification, certificates, or financial records.</span>
            </div>

            <div v-else class="attachments-grid">
              <div v-for="(att, idx) in form.attachments" :key="att.id || idx" class="attachment-card">
                <div class="att-card-icon">
                  <span v-if="att.mimeType?.includes('pdf')">📄</span>
                  <span v-else-if="att.mimeType?.includes('image')">🖼️</span>
                  <span v-else>📁</span>
                </div>
                <div class="att-card-info">
                  <div class="att-card-name" :title="att.name">{{ att.name }}</div>
                  <div class="att-card-meta">
                    <span>{{ att.size ? Math.round(att.size / 1024) + ' KB' : 'Document' }}</span>
                    <span>•</span>
                    <span>{{ formatDate(att.uploadedAt) }}</span>
                    <span class="badge badge-success" style="font-size: 9px; padding: 1px 6px;">☁️ HighLevel Media</span>
                  </div>
                </div>
                <div class="att-card-actions">
                  <a
                    :href="att.url"
                    target="_blank"
                    class="btn-att-action btn-att-view"
                    title="View file in new tab"
                  >
                    View ↗
                  </a>
                  <button
                    type="button"
                    class="btn-att-action btn-att-delete"
                    title="Remove attachment"
                    @click="removeAttachment(idx)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Compiled Package Download Box -->
          <div class="compiled-package-card">
            <div class="cp-header">
              <div class="cp-icon">📦</div>
              <div>
                <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">Compiled Case Package (ZIP Archive)</h3>
                <p style="margin: 2px 0 0; font-size: 11.5px; color: #475569;">
                  Download everything together in one complete, organized ZIP dossier:
                </p>
              </div>
            </div>

            <div class="cp-contents-list">
              <div class="cp-item">
                <span class="cp-check">✓</span>
                <span><strong>1_Signed_Contract.pdf</strong> — Official Executed Legal Services Agreement</span>
              </div>
              <div class="cp-item">
                <span class="cp-check">✓</span>
                <span><strong>2_Client_Summary.pdf</strong> — Complete 9-Page Case Summary Assessment</span>
              </div>
              <div class="cp-item">
                <span class="cp-check">✓</span>
                <span><strong>3_Supporting_Attachments/</strong> — All {{ form.attachments?.length || 0 }} uploaded client files</span>
              </div>
              <div class="cp-item">
                <span class="cp-check">✓</span>
                <span><strong>0_Case_Dossier_Manifest.txt</strong> — Full audit index & verification timestamps</span>
              </div>
            </div>

            <div class="cp-actions">
              <button
                type="button"
                class="btn btn-primary btn-lg"
                :disabled="downloadingZip"
                @click="downloadZipPackage"
                style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 12px 24px; font-weight: 700;"
              >
                {{ downloadingZip ? '⏳ Generating Complete Package (ZIP)…' : '📦 Download Compiled Case Package (ZIP)' }}
              </button>

              <button
                type="button"
                class="btn btn-secondary btn-lg"
                :disabled="downloadingPdf"
                @click="downloadSummaryPdf"
                style="padding: 12px 18px;"
              >
                {{ downloadingPdf ? '⏳ Generating…' : '📄 Download Summary PDF Only' }}
              </button>
            </div>
          </div>

          <div class="page-footer-mark">CLIENT SUMMARY FORM | Attachments & Compiled Dossier</div>
        </section>

        <!-- In-Sheet Bottom Page Navigation -->
        <div class="page-bottom-nav">
          <button
            v-if="currentTabIndex > 0"
            type="button"
            class="btn-bottom-prev"
            @click="goToPrevTab"
          >
            ‹ Back: {{ formTabs[currentTabIndex - 1]?.title }}
          </button>
          <div v-else></div>

          <div class="page-bottom-actions">
            <button
              type="button"
              class="btn-bottom-draft"
              :disabled="saving"
              @click="saveSummary('DRAFT')"
            >
              {{ saving && savingMode === 'DRAFT' ? 'Saving…' : '💾 Save Draft' }}
            </button>

            <button
              v-if="currentTabIndex < formTabs.length - 1"
              type="button"
              class="btn-bottom-next"
              @click="goToNextTab"
            >
              Next: {{ formTabs[currentTabIndex + 1]?.title }} ›
            </button>
            <button
              v-else-if="summaryStatus !== 'COMPLETED'"
              type="button"
              class="btn-bottom-complete"
              :disabled="saving"
              @click="saveSummary('COMPLETED')"
            >
              ✓ Complete Summary Form
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Floating / Sticky Save Toolbar -->
      <div class="floating-save-toolbar glass-card">
        <div class="toolbar-left">
          <span class="status-indicator" :class="summaryStatus === 'COMPLETED' ? 'dot-completed' : 'dot-draft'"></span>
          <span>Status: <strong>{{ summaryStatus }}</strong></span>
          <span v-if="lastSavedAt" class="text-muted small-text">• Last saved {{ formatTime(lastSavedAt) }}</span>
        </div>
        <div class="toolbar-right">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="saving"
            @click="saveSummary('DRAFT')"
          >
            {{ saving && savingMode === 'DRAFT' ? 'Saving…' : '💾 Save Draft' }}
          </button>
          <button
            v-if="summaryStatus !== 'COMPLETED'"
            type="button"
            class="btn btn-primary"
            :disabled="saving"
            @click="saveSummary('COMPLETED')"
          >
            {{ saving && savingMode === 'COMPLETED' ? 'Completing…' : '✓ Mark Completed' }}
          </button>
          <button
            v-else
            type="button"
            class="btn btn-secondary"
            :disabled="saving"
            @click="saveSummary('DRAFT')"
          >
            🔓 Reopen as Draft
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

// Contracts list state
const completedContracts = ref([])
const loadingContracts = ref(false)
const searchQuery = ref('')
const selectedContractId = ref('')
const selectedContract = ref(null)
const loadingContractData = ref(false)

// Summary state
const summaryStatus = ref('NOT_STARTED')
const completedByName = ref('')
const completedAt = ref(null)
const lastSavedAt = ref(null)
const saving = ref(false)
const savingMode = ref('DRAFT')
const isPrinting = ref(false)

// Tabs navigation
const currentTab = ref('page1')
const tabsContainerRef = ref(null)

const attachmentFileInput = ref(null)
const uploadingAttachment = ref(false)
const downloadingZip = ref(false)
const downloadingPdf = ref(false)

const formTabs = [
  { id: 'page1', step: 1, page: 'Page 1', title: 'General Info' },
  { id: 'page2', step: 2, page: 'Page 2', title: 'Immigration History' },
  { id: 'page3', step: 3, page: 'Pages 3-4', title: 'Business Background' },
  { id: 'page4', step: 4, page: 'Pages 4-5', title: 'Employment Background' },
  { id: 'page5', step: 5, page: 'Pages 5-6', title: 'Personal & Family' },
  { id: 'page6', step: 6, page: 'Pages 6-7', title: 'Academic Background' },
  { id: 'page7', step: 7, page: 'Page 8', title: 'Financials' },
  { id: 'page8', step: 8, page: 'Page 9', title: 'Action Plan & Signatures' },
  { id: 'page9', step: 9, page: 'Dossier', title: 'Attached Files & ZIP Package' },
]

const currentTabIndex = computed(() => {
  const idx = formTabs.findIndex(t => t.id === currentTab.value)
  return idx >= 0 ? idx : 0
})

const currentTabObj = computed(() => {
  return formTabs[currentTabIndex.value] || formTabs[0]
})

const progressPercent = computed(() => {
  return Math.round(((currentTabIndex.value + 1) / formTabs.length) * 100)
})

function scrollTabs(direction) {
  if (!tabsContainerRef.value) return
  const amount = direction === 'left' ? -220 : 220
  tabsContainerRef.value.scrollBy({ left: amount, behavior: 'smooth' })
}

function selectTab(tabId) {
  currentTab.value = tabId
  setTimeout(() => {
    const activeEl = tabsContainerRef.value?.querySelector('.tab-btn.active')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
    }
  }, 50)
}

function goToNextTab() {
  const nextIdx = currentTabIndex.value + 1
  if (nextIdx < formTabs.length) {
    selectTab(formTabs[nextIdx].id)
    scrollDocumentToTop()
  }
}

function goToPrevTab() {
  const prevIdx = currentTabIndex.value - 1
  if (prevIdx >= 0) {
    selectTab(formTabs[prevIdx].id)
    scrollDocumentToTop()
  }
}

function scrollDocumentToTop() {
  const sheet = document.querySelector('.document-sheet')
  if (sheet) {
    sheet.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function isTabCompleted(tabId) {
  if (!form.value) return false
  if (tabId === 'page1') {
    return Boolean(form.value.client_name && form.value.country_applying_for)
  }
  if (tabId === 'page2') {
    return Boolean(form.value.q1_applied_countries?.length || form.value.q2_refused_visa !== null)
  }
  if (tabId === 'page3') {
    return Boolean(form.value.q15_has_business !== null)
  }
  if (tabId === 'page4') {
    return Boolean(form.value.q18_current_employment_status)
  }
  if (tabId === 'page5') {
    return Boolean(form.value.q21_marital_status)
  }
  if (tabId === 'page6') {
    return Boolean(form.value.q25_highest_qualification)
  }
  if (tabId === 'page7') {
    return Boolean(form.value.q28_funds_available)
  }
  if (tabId === 'page8') {
    return Boolean(summaryStatus.value === 'COMPLETED' || form.value.counselor_signature?.signed)
  }
  if (tabId === 'page9') {
    return Boolean(form.value.attachments && form.value.attachments.length > 0)
  }
  return false
}

// The reactive summary form data object
const form = ref(getDefaultForm())

function getDefaultForm() {
  return {
    reg_number: '',
    reg_date: new Date().toISOString().slice(0, 10),
    registered_at: 'Dubai',
    counsellor_name: '',
    country_applying_from: 'United Arab Emirates',
    country_applying_for: '',
    applying_category: '',
    client_name: '',
    nationality: '',
    dob: '',
    contact_landline: '',
    contact_mobile: '',
    email: '',
    residential_address: '',
    expected_submission: '8_weeks',

    q1_applied_countries: [],
    q2_refused_visa: 'no',
    q2_details: { country: '', visa_type: '', refusal_date: '', refusal_reason: '' },
    q3_overstayed: 'no',
    q3_details: { reason: '' },
    q4_deported: 'no',
    q4_details: { country: '', deportation_date: '', port_airport: '', deportation_reason: '' },
    q5_voluntary_depart: 'no',
    q5_details: { departure_date: '', airport_port: '', decision_papers: '', ref_number: '' },
    q6_exclusion_order: 'no',
    q6_details: { date: '', ref_number: '', reason: '' },
    q7_work_permit_ni: 'no',
    q7_details: { ni_number: '' },

    q8_own_business: 'no',
    q8_legal_status: '',
    q9_business_name: '',
    q10_est_date: '',
    q11_partners_shares: [
      { partner: '', shares: '' },
      { partner: '', shares: '' },
      { partner: '', shares: '' },
      { partner: '', shares: '' },
      { partner: '', shares: '' },
      { partner: '', shares: '' },
    ],
    q12_nature_of_business: '',
    q13_business_docs: {
      company_profile: false,
      ntn_license: false,
      tax_returns: false,
      audit_reports: false,
      business_registration: false,
      business_accreditation: false,
      professional_membership: false,
      premises_documents: false,
      sales_purchase_invoices: false,
      bank_confirmation_letter: false,
      business_bank_statements: false,
      appreciation_letter: false,
      import_export_docs: false,
    },
    q14_other_business_docs: '',
    q15_products_services_desc: '',
    q16_multiple_businesses: '',

    q17_current_employer: '',
    q18_current_designation: '',
    q19_current_years: '',
    q20_current_job_desc: '',
    q21_current_expertise: '',

    q22_prev1_employer: '',
    q23_prev1_designation: '',
    q24_prev1_years_worked: '',
    q25_prev1_job_desc: '',
    q26_prev1_expertise: '',

    q27_prev2_employer: '',
    q28_prev2_designation: '',
    q29_prev2_years_worked: '',
    q30_prev2_job_desc: '',
    q31_prev2_expertise: '',

    q32_other_nationality: 'no',
    q32_details: { country: '' },
    q33_passport_issue_place: '',
    q34_address_duration: '',
    q35_criminal_convictions: 'no',
    q35_details: '',
    q36_criminal_charges: 'no',
    q36_details: '',
    q37_spouse_dependents_applying: 'no',
    q37_details: { spouse_name: '', dependents_count_names: '' },
    q38_spouse_live_with_you: 'yes',
    q38_details: { address_contact: '' },

    q39_parents_details: {
      father: { given_name: '', family_name: '', dob: '', birth_place: '' },
      mother: { given_name: '', family_name: '', dob: '', birth_place: '' },
    },
    q40_spouse_parents_details: {
      father: { given_name: '', family_name: '', dob: '', birth_place: '' },
      mother: { given_name: '', family_name: '', dob: '', birth_place: '' },
    },
    q41_medical_treatment: 'no',
    q41_details: { pay_for_treatment: 'no', facility_address_contact: '' },

    q42_education: {
      phd: { checked: false, institute: '', year: '' },
      masters: { checked: false, institute: '', year: '' },
      post_grad_diploma: { checked: false, institute: '', year: '' },
      bachelors: { checked: false, institute: '', year: '' },
      higher_secondary: { checked: false, institute: '', year: '' },
    },

    q43_prof_courses: ['', '', '', '', '', ''],
    q44_prof_memberships: ['', '', ''],
    q45_other_achievements: ['', ''],

    q46_bank_statements: { individual: false, joint: false },
    q46_categories: [],
    q47_investment_funds: {
      own_funds: false,
      third_party_individual: false,
      third_party_company: false,
      agree_endorsing_fee: false,
      agree_visa_ihs_fee: false,
    },
    q48_source_of_funds: '',
    q49_maintenance_funds: {
      applicant: false,
      spouse: false,
      first_child: false,
      additional_child: false,
    },
    q50_english_proficiency: '',

    course_of_action_business_plan: '',
    course_of_action_application: '',
    applicant_signature: { signed: false, name: '', date: '' },
    counselor_signature: { signed: false, name: '', date: '' },
    attachments: [],
  }
}

// Fetch completed contracts accessible to user
async function fetchCompletedContracts(query = '') {
  loadingContracts.value = true
  try {
    const params = { limit: 100 }
    if (query && query.trim()) params.q = query.trim()
    const res = await axios.get(`${apiBase}/client-summary/contracts`, {
      headers: getHeaders(),
      params,
    })
    completedContracts.value = res.data?.contracts || []
  } catch (err) {
    console.error('Fetch completed contracts error:', err)
  } finally {
    loadingContracts.value = false
  }
}

let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchCompletedContracts(searchQuery.value)
  }, 350)
}

function clearSearch() {
  searchQuery.value = ''
  fetchCompletedContracts()
}

// Load a specific contract's summary
async function loadSelectedContract() {
  if (!selectedContractId.value) return
  loadingContractData.value = true

  // Update URL query parameter without full reload
  router.replace({ query: { ...route.query, contractId: selectedContractId.value } })

  try {
    const res = await axios.get(`${apiBase}/client-summary/${selectedContractId.value}`, {
      headers: getHeaders(),
    })

    const data = res.data
    selectedContract.value = data.contract
    summaryStatus.value = data.status || 'NOT_STARTED'
    completedByName.value = data.completed_by_name || ''
    completedAt.value = data.completed_at || null
    lastSavedAt.value = data.updated_at || null

    if (data.summary && Object.keys(data.summary).length > 0) {
      form.value = {
        ...getDefaultForm(),
        ...data.summary,
        attachments: Array.isArray(data.summary.attachments) ? data.summary.attachments : [],
      }
    } else {
      form.value = getDefaultForm()
    }
  } catch (err) {
    console.error('Load summary error:', err)
    alert(err.response?.data?.message || err.response?.data?.error || 'Failed to load Client Summary for selected contract.')
  } finally {
    loadingContractData.value = false
  }
}

// Save summary (DRAFT or COMPLETED)
async function saveSummary(mode = 'DRAFT') {
  if (!selectedContractId.value) return
  saving.value = true
  savingMode.value = mode

  try {
    const res = await axios.post(
      `${apiBase}/client-summary/${selectedContractId.value}`,
      {
        summaryData: form.value,
        status: mode,
      },
      { headers: getHeaders() }
    )

    summaryStatus.value = res.data.status
    completedByName.value = res.data.completed_by_name || completedByName.value
    completedAt.value = res.data.completed_at || completedAt.value
    lastSavedAt.value = new Date().toISOString()

    // Update status in completedContracts dropdown list
    const found = completedContracts.value.find(c => c.id == selectedContractId.value)
    if (found) {
      found.summary_status = res.data.status
    }

    if (mode === 'COMPLETED') {
      alert('✓ Client Summary has been marked as COMPLETED.')
    }
  } catch (err) {
    console.error('Save summary error:', err)
    alert(err.response?.data?.error || 'Failed to save Client Summary.')
  } finally {
    saving.value = false
  }
}

function triggerAttachmentUpload() {
  attachmentFileInput.value?.click()
}

async function onAttachmentSelected(e) {
  const files = e.target.files
  if (!files || !files.length) return

  for (const file of Array.from(files)) {
    if (file.size > 25 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds the 25MB limit.`)
      continue
    }

    uploadingAttachment.value = true
    try {
      const base64Data = await readFileAsBase64(file)
      // Upload directly to GoHighLevel Media Library
      const res = await axios.post(
        `${apiBase}/ghl/media/upload`,
        {
          dataBase64: base64Data,
          filename: `summary_${selectedContractId.value || 'case'}_${Date.now()}_${file.name}`,
          mimeType: file.type || 'application/octet-stream',
        },
        { headers: getHeaders() }
      )

      const uploadedUrl = res.data?.url || res.data?.fileUrl || ''

      if (!form.value.attachments) {
        form.value.attachments = []
      }

      form.value.attachments.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: uploadedUrl,
        uploadedAt: new Date().toISOString(),
      })

      // Auto save draft after uploading
      await saveSummary('DRAFT')
    } catch (err) {
      console.error('Upload attachment error:', err)
      alert(`Failed to upload ${file.name} to HighLevel Media Library.`)
    } finally {
      uploadingAttachment.value = false
    }
  }
  if (attachmentFileInput.value) attachmentFileInput.value.value = ''
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function removeAttachment(index) {
  if (!confirm(`Are you sure you want to remove "${form.value.attachments[index]?.name}"?`)) return
  form.value.attachments.splice(index, 1)
  await saveSummary('DRAFT')
}

async function downloadZipPackage() {
  if (!selectedContractId.value) return
  downloadingZip.value = true
  try {
    const res = await axios.get(
      `${apiBase}/client-summary/${selectedContractId.value}/package-zip`,
      {
        headers: getHeaders(),
        responseType: 'blob',
      }
    )
    const clientSlug = (selectedContract.value?.recipient_name || 'Client').replace(/[^a-zA-Z0-9]+/g, '_')
    const filename = `Case_Package_Contract_${selectedContractId.value}_${clientSlug}.zip`
    const blob = new Blob([res.data], { type: 'application/zip' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error('Download ZIP error:', err)
    alert(err.response?.data?.error || 'Failed to download compiled Case Package ZIP.')
  } finally {
    downloadingZip.value = false
  }
}

async function downloadSummaryPdf() {
  if (!selectedContractId.value) return
  downloadingPdf.value = true
  try {
    const res = await axios.get(
      `${apiBase}/client-summary/${selectedContractId.value}/pdf`,
      {
        headers: getHeaders(),
        responseType: 'blob',
      }
    )
    const filename = `Client_Summary_Contract_${selectedContractId.value}.pdf`
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error('Download PDF error:', err)
    alert(err.response?.data?.error || 'Failed to generate Client Summary PDF.')
  } finally {
    downloadingPdf.value = false
  }
}

function printDocument() {
  isPrinting.value = true
  setTimeout(() => {
    window.print()
    isPrinting.value = false
  }, 200)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  await fetchCompletedContracts()

  // If contractId provided in URL query, automatically select and load it
  const urlContractId = route.query.contractId
  if (urlContractId) {
    selectedContractId.value = urlContractId
    await loadSelectedContract()
  }
})
</script>

<style scoped>
.client-summary-page {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header — Executive Suite */
.page-header.executive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: var(--space-6);
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03);
  gap: 20px;
  flex-wrap: wrap;
}

.header-left {
  flex: 1 1 auto;
  min-width: 260px;
}

.header-brand-badge {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
}

.header-title-group {
  display: flex;
  flex-direction: column;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.contract-id-chip {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  letter-spacing: 0.2px;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.8rem;
  margin: 3px 0 0;
  line-height: 1.35;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1px;
  border: 1px solid transparent;
  user-select: none;
}

.status-completed {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.status-draft {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.status-neutral {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.status-dot-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.4);
  }
}

/* Action Button Toolbar */
.action-btn-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  padding: 4px 6px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
  line-height: 1.2;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn-secondary {
  background: #ffffff;
  color: #334155;
  border-color: #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.action-btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.action-btn-primary {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #ffffff;
  border: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.action-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transform: translateY(-0.5px);
}

.action-divider {
  width: 1px;
  height: 20px;
  background: #cbd5e1;
  margin: 0 2px;
}

.action-btn-neutral {
  background: #ffffff;
  color: #475569;
  border-color: #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.action-btn-neutral:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.action-btn-success {
  background: #059669;
  color: #ffffff;
  border: none;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);
}

.action-btn-success:hover:not(:disabled) {
  background: #047857;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
}

.action-btn-reopen {
  background: #ffffff;
  color: #b45309;
  border-color: #fde68a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.action-btn-reopen:hover:not(:disabled) {
  background: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
}

/* Contract Selector Card */
.selector-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-6);
}

.selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.section-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.search-box input {
  padding-left: 32px;
}

.btn-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
}

.select-contract {
  cursor: pointer;
  font-weight: 500;
}

.selected-contract-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
}

.scb-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scb-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.scb-actions {
  margin-left: auto;
}

.link-subtle {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
}

.link-subtle:hover {
  text-decoration: underline;
}

/* Empty / Loading States */
.empty-state-card, .loading-state-card {
  text-align: center;
  padding: 60px var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stepper & Section Navigation Header */
.stepper-header-card {
  background: var(--color-bg-card, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  position: sticky;
  top: 10px;
  z-index: 30;
  backdrop-filter: blur(12px);
}

.stepper-progress-track {
  width: 100%;
  height: 4px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
}

.stepper-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #3b82f6, #06b6d4);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.stepper-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px 8px;
  gap: 12px;
  flex-wrap: wrap;
}

.stepper-title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stepper-step-pill {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 3px 9px;
  border-radius: 9999px;
}

.stepper-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-base, #0f172a);
}

.stepper-page-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

.stepper-controls-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stepper-progress-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: #3b82f6;
  margin-right: 4px;
}

.btn-step-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #cbd5e1);
  background: #ffffff;
  color: var(--color-text-base, #1e293b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-step-nav:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.btn-step-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-step-nav-primary {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.btn-step-nav-primary:hover:not(:disabled) {
  background: #1e293b;
  border-color: #1e293b;
  color: #ffffff;
}

/* Tabs Scroll Wrapper */
.tabs-scroll-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 10px 12px;
}

.tab-scroll-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-border, #e2e8f0);
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  flex-shrink: 0;
  transition: all 0.2s ease;
  z-index: 2;
}

.tab-scroll-arrow:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.tab-scroll-arrow.arrow-left {
  margin-right: 6px;
}

.tab-scroll-arrow.arrow-right {
  margin-left: 6px;
}

.form-nav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 2px;
  scroll-behavior: smooth;
  flex: 1;
}

.form-nav-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.tab-btn:hover {
  background: #ffffff;
  color: #0f172a;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-btn.active {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  border-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.tab-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
}

.tab-btn.active .tab-number {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.tab-btn.completed .tab-number {
  background: #10b981;
  color: #ffffff;
}

.tab-btn.completed:not(.active) {
  border-color: #a7f3d0;
  background: #f0fdf4;
  color: #065f46;
}

.tab-check {
  font-size: 0.75rem;
  line-height: 1;
}

.tab-page-hint {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 2px;
}

.tab-btn.active .tab-page-hint {
  opacity: 0.85;
  color: #93c5fd;
}

/* Page Bottom Navigation */
.page-bottom-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed #cbd5e1;
  gap: 12px;
  flex-wrap: wrap;
}

.page-bottom-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-bottom-prev {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-bottom-prev:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-bottom-draft {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-bottom-draft:hover {
  background: #f8fafc;
}

.btn-bottom-next {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  border: 1px solid #0f172a;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
}

.btn-bottom-next:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
}

.btn-bottom-complete {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  border: 1px solid #059669;
  background: #059669;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);
}

.btn-bottom-complete:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Document Sheet */
.document-sheet {
  background: #ffffff;
  color: #000000;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  font-family: inherit;
}

.official-header {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #000;
  padding-bottom: 12px;
}

.doc-main-title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  color: #000000;
}

.section-banner {
  background: #254b68;
  color: #ffffff;
  padding: 8px 14px;
  margin-bottom: 16px;
}

.section-banner h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.banner-sub {
  display: block;
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 2px;
  opacity: 0.9;
}

.subsection-header {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 8px;
  color: #1e293b;
}

/* Row Lines & Form Styles */
.form-row-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.line-label {
  font-size: 0.85rem;
  color: #1e293b;
  white-space: nowrap;
}

.line-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid #64748b;
  border-radius: 0;
  background: transparent;
  padding: 4px 6px;
  font-size: 0.88rem;
  color: #000000;
  outline: none;
}

.line-input:focus {
  border-bottom: 2px solid #2563eb;
}

.grid-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.grid-three-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.full-width {
  width: 100%;
}

.bold-text {
  font-weight: 600;
}

.submission-time-box {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 16px;
  border-top: 1px dashed #cbd5e1;
}

.checkbox-group {
  display: flex;
  gap: 16px;
}

.inline-group {
  flex-direction: row;
}

.flex-wrap {
  flex-wrap: wrap;
}

.cb-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.block-cb {
  display: flex;
  margin-bottom: 6px;
}

/* Bordered Table for QA */
.bordered-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #cbd5e1;
  margin-bottom: 20px;
}

.bordered-table td {
  border: 1px solid #cbd5e1;
  padding: 10px 12px;
  vertical-align: top;
}

.col-num {
  width: 38px;
  text-align: center;
  font-weight: 700;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.88rem;
}

.col-content {
  background: #ffffff;
}

.q-title {
  font-weight: 600;
  font-size: 0.88rem;
  color: #0f172a;
}

.q-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.yes-no-group {
  display: flex;
  gap: 14px;
}

.q-subdetails {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.sub-instruction {
  font-size: 0.78rem;
  font-style: italic;
  color: #64748b;
  margin: 4px 0 8px;
}

.countries-checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 8px;
}

.nested-table, .parents-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #cbd5e1;
  margin-top: 6px;
}

.nested-table th, .parents-table th {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  font-size: 0.82rem;
  text-align: left;
}

.nested-table td, .parents-table td {
  border: 1px solid #cbd5e1;
  padding: 4px 6px;
}

.field-title {
  font-weight: 600;
  font-size: 0.82rem;
  background: #f8fafc;
}

.table-cell-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 4px 6px;
  font-size: 0.85rem;
  outline: none;
}

.bullet-inputs-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bullet-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bullet-dot {
  font-weight: 700;
  color: #475569;
}

.action-box {
  border: 1px solid #cbd5e1;
  padding: 6px;
  background: #fcfcfc;
}

.box-textarea {
  width: 100%;
  border: none;
  resize: vertical;
  background: transparent;
  font-size: 0.9rem;
}

.signatures-wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 20px 40px;
}

.sig-block {
  width: 280px;
  text-align: center;
}

.sig-line {
  border-bottom: 1px solid #000;
  padding-bottom: 4px;
  margin-bottom: 6px;
}

.sig-name-input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  outline: none;
}

.sig-title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.sig-date-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.sig-date-input {
  width: 130px;
  text-align: center;
}

.page-footer-mark {
  margin-top: 30px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  text-align: right;
  font-size: 0.72rem;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

/* Floating Save Toolbar */
.floating-save-toolbar {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-top: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-completed {
  background: #10b981;
}

.dot-draft {
  background: #f59e0b;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

/* Attachment Upload Zone */
.attachment-upload-zone {
  border: 2px dashed #94a3b8;
  border-radius: 12px;
  padding: 30px 20px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 14px;
}

.attachment-upload-zone:hover {
  border-color: #2563eb;
  background: #eff6ff;
  transform: translateY(-1px);
}

.upload-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 2.4rem;
  margin-bottom: 6px;
}

.no-attachments-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}

.attachment-card:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.att-card-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.att-card-info {
  flex: 1;
  min-width: 0;
}

.att-card-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.att-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 3px;
  flex-wrap: wrap;
}

.att-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-att-action {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-att-view {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.btn-att-view:hover {
  background: #dbeafe;
}

.btn-att-delete {
  background: none;
  color: #ef4444;
  border: none;
  font-size: 0.9rem;
  padding: 4px 6px;
}

.btn-att-delete:hover {
  background: #fee2e2;
  border-radius: 4px;
}

/* Compiled Package Card */
.compiled-package-card {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

.cp-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.cp-icon {
  font-size: 2.2rem;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.cp-contents-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  background: #ffffff;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.cp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #334155;
}

.cp-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #059669;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid #a7f3d0;
}

.cp-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Print Styles */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }

  .page-header,
  .selector-card,
  .stepper-header-card,
  .form-nav-tabs,
  .page-bottom-nav,
  .floating-save-toolbar,
  .attachment-upload-zone,
  .btn-att-delete,
  .cp-actions,
  button {
    display: none !important;
  }

  .client-summary-page {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }

  .document-sheet {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .form-page {
    page-break-after: always !important;
    break-after: page !important;
    margin: 0 0 20px 0 !important;
    padding-bottom: 20px !important;
  }

  .form-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Make inputs print cleanly like official text without borders or gray placeholder boxes */
  .line-input, input, textarea, select {
    border: none !important;
    border-bottom: 1px solid #000000 !important;
    background: transparent !important;
    color: #000000 !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    box-shadow: none !important;
    padding: 2px 4px !important;
    resize: none !important;
  }

  /* Hide raw input placeholders in print */
  input::placeholder,
  textarea::placeholder {
    color: transparent !important;
    opacity: 0 !important;
  }

  .section-banner {
    background: #1e3a8a !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .col-num {
    background: #f1f5f9 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .official-header {
    border-bottom: 2px solid #000000 !important;
  }

  .page-footer-mark {
    color: #64748b !important;
    font-size: 9px !important;
    margin-top: 15px !important;
    border-top: 1px solid #cbd5e1 !important;
    padding-top: 4px !important;
  }
}

@media (max-width: 768px) {
  .selector-grid,
  .grid-two-col,
  .grid-three-col {
    grid-template-columns: 1fr;
  }

  .signatures-wrapper {
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }
}
</style>
