<template>
  <div class="settings-view">
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
      <div>
        <h1 style="font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 4px;">System & Integration Settings</h1>
        <p style="color: var(--color-text-secondary); font-size: var(--text-sm);">
          All settings below are persisted directly in the MySQL <code>system_settings</code> table and reloaded dynamically in real time.
        </p>
      </div>
      <button class="btn btn-primary" :disabled="saving || loading" @click="saveSettings">
        {{ saving ? 'Saving Changes…' : '💾 Save Settings' }}
      </button>
    </div>

    <!-- Alert / Toast Messages -->
    <div v-if="successMsg" class="badge badge-completed" style="padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px; width: 100%;">
      <span>✅</span>
      <span>{{ successMsg }}</span>
    </div>
    <div v-if="errorMsg" class="badge badge-declined" style="padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px; width: 100%;">
      <span>⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <div v-if="loading" class="glass-card" style="padding: var(--space-8); text-align: center; color: var(--color-text-muted);">
      Loading system settings from MySQL…
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- 1. GoHighLevel Credentials -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">⚡</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">GoHighLevel API & Webhook Credentials</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Configure your GHL marketplace shared secret, private integration tokens, and webhook secrets.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>GHL Shared Secret</span>
              <span class="badge badge-info" style="font-size: 10px;">Context JWT</span>
            </label>
            <input 
              v-model="form.GHL_SHARED_SECRET" 
              :type="showSecret.GHL_SHARED_SECRET ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter GHL Marketplace Shared Secret" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Found in Marketplace App Settings</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_SHARED_SECRET')">
                {{ showSecret.GHL_SHARED_SECRET ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>GHL Private Integration Token</span>
              <span class="badge badge-info" style="font-size: 10px;">Backend API</span>
            </label>
            <input 
              v-model="form.GHL_PRIVATE_INTEGRATION_TOKEN" 
              :type="showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter Private Integration Token (Bearer)" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Found in Sub-Account Settings → Private Integrations</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_PRIVATE_INTEGRATION_TOKEN')">
                {{ showSecret.GHL_PRIVATE_INTEGRATION_TOKEN ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>Webhook Ingestion Secret</span>
              <span class="badge badge-info" style="font-size: 10px;">Automation</span>
            </label>
            <input 
              v-model="form.GHL_WEBHOOK_SECRET" 
              :type="showSecret.GHL_WEBHOOK_SECRET ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter Webhook Auth Secret" 
            />
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted);">
              <span>Pass in webhook header: Authorization: Bearer &lt;secret&gt;</span>
              <a href="javascript:void(0)" @click="toggleShow('GHL_WEBHOOK_SECRET')">
                {{ showSecret.GHL_WEBHOOK_SECRET ? 'Hide' : 'Show' }}
              </a>
            </div>
          </div>

          <div>
            <label class="form-label">GHL API Version</label>
            <input v-model="form.GHL_API_VERSION" type="text" class="form-control" placeholder="2021-07-28" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 2021-07-28
            </span>
          </div>

          <div style="grid-column: span 2;">
            <label class="form-label">GHL API Base URL</label>
            <input v-model="form.GHL_API_BASE_URL" type="text" class="form-control" placeholder="https://services.leadconnectorhq.com" />
          </div>
        </div>
      </div>

      <!-- 2. Application & Public Signing Portal -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">🌐</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Application & Public Signing URL</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Controls the external URL generated for client contract signing links.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div style="grid-column: span 2;">
            <label class="form-label">Signing Base URL</label>
            <input v-model="form.SIGNING_BASE_URL" type="text" class="form-control" placeholder="https://sign.yourdomain.com or http://localhost:5173" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Links sent to signers will use: <code>{{ form.SIGNING_BASE_URL || 'http://localhost:5173' }}/sign/&lt;token&gt;</code>
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Performance & Worker Configurations -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">⚙️</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Performance & Background Workers</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Fine-tune GHL rate-limiting concurrency and automated cron frequencies.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label">GHL Concurrency Limit</label>
            <input v-model="form.GHL_CONCURRENCY_LIMIT" type="number" class="form-control" placeholder="4" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Max concurrent requests to GHL
            </span>
          </div>

          <div>
            <label class="form-label">Field Cache TTL (ms)</label>
            <input v-model="form.GHL_FIELD_CACHE_TTL_MS" type="number" class="form-control" placeholder="900000" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 900000 (15 min)
            </span>
          </div>

          <div>
            <label class="form-label">Max PDF Upload Retries</label>
            <input v-model="form.MAX_UPLOAD_RETRIES" type="number" class="form-control" placeholder="5" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Before dead-letter escalation
            </span>
          </div>

          <div>
            <label class="form-label">Expiry Worker Cron</label>
            <input v-model="form.EXPIRY_WORKER_CRON" type="text" class="form-control" placeholder="*/5 * * * *" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Overdue contract scanner
            </span>
          </div>

          <div>
            <label class="form-label">Retry Worker Cron</label>
            <input v-model="form.RETRY_WORKER_CRON" type="text" class="form-control" placeholder="*/2 * * * *" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Failed PDF upload retrier
            </span>
          </div>

          <div>
            <label class="form-label">Session Token Duration</label>
            <input v-model="form.JWT_EXPIRES_IN" type="text" class="form-control" placeholder="8h" />
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 4px;">
              Default: 8h
            </span>
          </div>
        </div>
      </div>

      <!-- 4. Data Access & Sales Privacy Controls -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">🛡️</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Data Access & Sales Permissions</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Configure whether sales representatives can only access contacts and deals assigned to them in GoHighLevel.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-4);">
          <div>
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Restrict Sales Agents to Assigned Data</span>
              <span class="badge" :class="form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'badge-completed' : 'badge-neutral'" style="font-size: 11px;">
                {{ form.RESTRICT_CONTACTS_TO_ASSIGNED === 'true' ? 'Enforced' : 'Unrestricted' }}
              </span>
            </label>
            <select v-model="form.RESTRICT_CONTACTS_TO_ASSIGNED" class="form-control">
              <option value="true">Enabled (Restricted) — Sales users only see their own assigned contacts & deals</option>
              <option value="false">Disabled (Open) — Sales users can search and view all contacts & deals across the location</option>
            </select>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 6px;">
              When enabled, representatives (e.g. Akram Mammeri) will only see contacts/leads assigned to their GoHighLevel account. Admins and Super Admins always have access to all data.
            </span>
          </div>
        </div>
      </div>

      <!-- 5. Official Company Stamp / Seal -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">🔴</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Official Company Stamp &amp; Seal</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Upload your official company stamp / seal (transparent PNG recommended). It will automatically be overlaid with the authorized company signature on completed contracts.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 220px; gap: var(--space-6); align-items: start;">
          <div>
            <label class="form-label">Company Stamp Image (PNG or Image URL)</label>
            <div style="display: flex; gap: 8px;">
              <input 
                v-model="form.COMPANY_STAMP_URL" 
                type="text" 
                class="form-control" 
                placeholder="https://... or click Upload PNG below" 
              />
              <button type="button" class="btn btn-secondary" :disabled="uploadingStampMedia" @click="triggerStampUpload">
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
            <div v-if="form.COMPANY_STAMP_URL" style="margin-top: 10px; display: flex; gap: 8px;">
              <button type="button" class="btn btn-danger btn-sm" @click="clearStamp">
                🗑️ Remove Stamp
              </button>
            </div>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 6px;">
              Tip: Use a transparent PNG (circular/rectangular company seal). Max size: 5MB.
            </span>
          </div>

          <!-- Live Stamp Preview -->
          <div style="border: 1px dashed var(--color-border); border-radius: 8px; padding: 12px; background: #fff; text-align: center; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(0,0,0,0.03);">
            <div v-if="form.COMPANY_STAMP_URL" style="position: relative;">
              <img :src="form.COMPANY_STAMP_URL" alt="Company Stamp Preview" style="max-height: 85px; max-width: 160px; object-fit: contain; transform: rotate(-5deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
              <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 6px;">Live Stamp Preview</div>
              <div style="margin-top: 4px;">
                <span v-if="uploadingStampMedia" class="badge badge-warning" style="font-size: 9px; padding: 2px 6px;">
                  ⏳ Uploading &amp; Saving…
                </span>
                <span v-else class="badge badge-success" style="font-size: 9px; padding: 2px 6px;">
                  ✅ Saved in System Branding
                </span>
              </div>
            </div>
            <div v-else style="color: #94a3b8; font-size: var(--text-xs);">
              <span>No stamp uploaded yet</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Official Authorized Company Signature -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-4);">
          <div style="font-size: 1.5rem;">✍️</div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Official Authorized Company Signature</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">
              Upload the official authorized officer signature (transparent PNG recommended). It is automatically stamped and embedded on all legal contracts.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 220px; gap: var(--space-6); align-items: start;">
          <div>
            <label class="form-label">Company Signature Image (PNG or Image URL)</label>
            <div style="display: flex; gap: 8px;">
              <input 
                v-model="form.COMPANY_SIGNATURE_URL" 
                type="text" 
                class="form-control" 
                placeholder="https://... or click Upload PNG below" 
              />
              <button type="button" class="btn btn-secondary" :disabled="uploadingSigMedia" @click="triggerSigUpload">
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
            <div v-if="form.COMPANY_SIGNATURE_URL" style="margin-top: 10px; display: flex; gap: 8px;">
              <button type="button" class="btn btn-danger btn-sm" @click="clearSignature">
                🗑️ Remove Signature
              </button>
            </div>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); display: block; margin-top: 6px;">
              Tip: Use a transparent PNG (cursive ink signature). Max size: 5MB.
            </span>
          </div>

          <!-- Live Signature Preview -->
          <div style="border: 1px dashed var(--color-border); border-radius: 8px; padding: 12px; background: #fff; text-align: center; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(0,0,0,0.03);">
            <div v-if="form.COMPANY_SIGNATURE_URL" style="position: relative;">
              <img :src="form.COMPANY_SIGNATURE_URL" alt="Company Signature Preview" style="max-height: 55px; max-width: 180px; object-fit: contain; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.08));" />
              <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 6px;">Live Signature Preview</div>
              <div style="margin-top: 4px;">
                <span v-if="uploadingSigMedia" class="badge badge-warning" style="font-size: 9px; padding: 2px 6px;">
                  ⏳ Uploading &amp; Saving…
                </span>
                <span v-else class="badge badge-success" style="font-size: 9px; padding: 2px 6px;">
                  ✅ Saved in System Branding
                </span>
              </div>
            </div>
            <div v-else style="color: #94a3b8; font-size: var(--text-xs);">
              <span>No signature uploaded yet</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Client Summary Dossier Customization (Custom Fields & Sections) -->
      <div class="glass-card" style="padding: var(--space-6);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: var(--space-4);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 1.5rem;">📋</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="margin: 0; font-size: 1.1rem; font-family: var(--font-heading);">Client Summary Dossier Customization</h3>
                <span class="badge badge-info" style="font-size: 10px;">Post-Contract Onboarding</span>
              </div>
              <p style="margin: 2px 0 0; font-size: var(--text-xs); color: var(--color-text-muted);">
                Add custom sections and fields to the official 9-page Client Summary Form. Configured fields are automatically captured by staff and rendered in the official case PDF and ZIP archive.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <!-- Preset Dropdown -->
            <div class="preset-dropdown-container">
              <button type="button" class="btn btn-secondary btn-sm" @click="showPresetMenu = !showPresetMenu">
                ⚡ Quick Presets ▾
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

            <button type="button" class="btn btn-secondary btn-sm" @click="openAddSectionModal">
              ➕ Add Section
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="openAddFieldModal">
              ➕ Add Field
            </button>
          </div>
        </div>

        <!-- Customizer Tabs Navigation -->
        <div class="schema-tabs-row">
          <button
            type="button"
            class="schema-tab-btn"
            :class="{ active: schemaActiveTab === 'fields' }"
            @click="schemaActiveTab = 'fields'"
          >
            Custom Fields
            <span class="schema-count-pill">{{ customSchema.fields?.length || 0 }}</span>
          </button>
          <button
            type="button"
            class="schema-tab-btn"
            :class="{ active: schemaActiveTab === 'sections' }"
            @click="schemaActiveTab = 'sections'"
          >
            Custom Sections / Pages
            <span class="schema-count-pill">{{ customSchema.sections?.length || 0 }}</span>
          </button>
        </div>

        <!-- TAB 1: CUSTOM FIELDS TABLE -->
        <div v-if="schemaActiveTab === 'fields'">
          <div v-if="!customSchema.fields?.length" class="empty-schema-box">
            <div style="font-size: 1.6rem; margin-bottom: 4px;">📝</div>
            <strong>No Custom Fields Configured</strong>
            <p style="margin: 4px 0 10px; font-size: var(--text-xs); color: var(--color-text-muted);">
              Add custom fields to existing standard pages (General Info, Immigration History, Financials, etc.) or attach them to newly created custom sections.
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="btn btn-primary btn-sm" @click="openAddFieldModal">
                ➕ Add First Field
              </button>
              <button type="button" class="btn btn-secondary btn-sm" @click="applyPreset('identity')">
                ⚡ Load Sample Fields
              </button>
            </div>
          </div>

          <div v-else class="schema-table-wrapper">
            <table class="schema-table">
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
                    <strong>{{ fld.label }}</strong>
                    <div v-if="fld.placeholder" style="font-size: 10.5px; color: #94a3b8;">
                      Placeholder: "{{ fld.placeholder }}"
                    </div>
                  </td>
                  <td>
                    <code class="schema-key-code">{{ fld.key }}</code>
                  </td>
                  <td>
                    <span class="badge-type-pill">{{ formatFieldType(fld.type) }}</span>
                    <span v-if="fld.options?.length" class="options-count-tag" :title="fld.options.join(', ')">
                      {{ fld.options.length }} options
                    </span>
                  </td>
                  <td>
                    <span class="badge-section-pill">
                      {{ getSectionDisplayLabel(fld.section) }}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span v-if="fld.required" class="badge-req">Required</span>
                    <span v-else class="badge-opt">Optional</span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button type="button" class="btn-icon-action" title="Edit Field" @click="openEditFieldModal(fld, idx)">
                        ✎
                      </button>
                      <button type="button" class="btn-icon-action btn-icon-delete" title="Delete Field" @click="deleteField(idx)">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: CUSTOM SECTIONS TABLE -->
        <div v-else-if="schemaActiveTab === 'sections'">
          <div v-if="!customSchema.sections?.length" class="empty-schema-box">
            <div style="font-size: 1.6rem; margin-bottom: 4px;">📑</div>
            <strong>No Custom Sections Configured</strong>
            <p style="margin: 4px 0 10px; font-size: var(--text-xs); color: var(--color-text-muted);">
              Create dedicated custom sections (such as "Medical Clearance" or "Guarantor Credentials") that appear as separate pages in the dossier and PDF.
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="btn btn-primary btn-sm" @click="openAddSectionModal">
                ➕ Add First Section
              </button>
              <button type="button" class="btn btn-secondary btn-sm" @click="applyPreset('medical')">
                ⚡ Load Medical Clearance Section
              </button>
            </div>
          </div>

          <div v-else class="schema-table-wrapper">
            <table class="schema-table">
              <thead>
                <tr>
                  <th style="width: 8%; text-align: center;">Order</th>
                  <th style="width: 32%;">Section Title</th>
                  <th style="width: 42%;">Description</th>
                  <th style="width: 8%; text-align: center;">Fields</th>
                  <th style="width: 10%; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sec, idx) in customSchema.sections" :key="sec.id || idx">
                  <td style="text-align: center; font-weight: 700; color: #64748b;">
                    #{{ idx + 1 }}
                  </td>
                  <td>
                    <strong>{{ sec.title }}</strong>
                    <div style="font-size: 10px; color: #94a3b8;">ID: {{ sec.id }}</div>
                  </td>
                  <td style="font-size: 12px; color: #475569;">
                    {{ sec.description || '—' }}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge-count-pill">{{ getFieldsCountForSection(sec.id) }}</span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button type="button" class="btn-icon-action" title="Edit Section" @click="openEditSectionModal(sec, idx)">
                        ✎
                      </button>
                      <button type="button" class="btn-icon-action btn-icon-delete" title="Delete Section" @click="deleteSection(idx)">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="margin-top: var(--space-4); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          <span style="font-size: var(--text-xs); color: var(--color-text-muted);">
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
      </div>
    </div>

    <!-- ─── MODAL: ADD / EDIT CUSTOM FIELD ──────────────────────────── -->
    <div v-if="showFieldModal" class="modal-backdrop-custom" @click.self="showFieldModal = false">
      <div class="modal-card-custom animate-scale-up">
        <div class="modal-header-custom">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">
            {{ editingFieldIndex >= 0 ? 'Edit Custom Field' : 'Add New Custom Field' }}
          </h3>
          <button type="button" class="btn-close-custom" @click="showFieldModal = false">✕</button>
        </div>

        <form @submit.prevent="submitFieldModal" style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
          <div class="modal-grid-2">
            <div>
              <label class="form-label">Field Label <span class="req">*</span></label>
              <input
                type="text"
                v-model="fieldForm.label"
                class="form-control"
                placeholder="e.g. National ID / Emirates ID"
                required
                @input="onFieldLabelInput"
              />
            </div>
            <div>
              <label class="form-label">Variable Key <span class="req">*</span></label>
              <input
                type="text"
                v-model="fieldForm.key"
                class="form-control"
                placeholder="e.g. national_id_number"
                required
              />
              <span style="font-size: 10px; color: #94a3b8;">Identifier used in dossier JSON</span>
            </div>
          </div>

          <div class="modal-grid-2">
            <div>
              <label class="form-label">Field Type <span class="req">*</span></label>
              <select v-model="fieldForm.type" class="form-control">
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
              <label class="form-label">Target Section / Page <span class="req">*</span></label>
              <select v-model="fieldForm.section" class="form-control">
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
            <label class="form-label">Dropdown Options (Comma separated) <span class="req">*</span></label>
            <input
              type="text"
              v-model="fieldForm.optionsText"
              class="form-control"
              placeholder="e.g. Option A, Option B, Option C"
              required
            />
            <span style="font-size: 10.5px; color: #64748b;">Separate each option with a comma.</span>
          </div>

          <div class="modal-grid-2">
            <div>
              <label class="form-label">Placeholder Text</label>
              <input
                type="text"
                v-model="fieldForm.placeholder"
                class="form-control"
                placeholder="e.g. Enter value..."
              />
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 8px; padding-top: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px; font-weight: 600; color: #334155;">
                <input type="checkbox" v-model="fieldForm.required" />
                <span>Mark as Required</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px; font-weight: 600; color: #334155;">
                <input type="checkbox" v-model="fieldForm.fullWidth" />
                <span>Span Full Width (2 columns)</span>
              </label>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
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
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">
            {{ editingSectionIndex >= 0 ? 'Edit Custom Section' : 'Add New Custom Section' }}
          </h3>
          <button type="button" class="btn-close-custom" @click="showSectionModal = false">✕</button>
        </div>

        <form @submit.prevent="submitSectionModal" style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
          <div>
            <label class="form-label">Section Title <span class="req">*</span></label>
            <input
              type="text"
              v-model="sectionForm.title"
              class="form-control"
              placeholder="e.g. Medical & Health Clearance"
              required
            />
          </div>

          <div>
            <label class="form-label">Section Description (Optional)</label>
            <textarea
              v-model="sectionForm.description"
              class="form-control"
              rows="3"
              placeholder="Brief instructions or purpose for counsellors filling this section..."
            ></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
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
import { ref, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const stampFileInput = ref(null)
const sigFileInput = ref(null)

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
})

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
      successMsg.value = 'Company stamp uploaded and saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Stamp upload save fallback:', err)
      // Save directly as base64 in case of upload failure
      try {
        await api.put('/settings', { settings: { COMPANY_STAMP_URL: dataBase64 } })
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
      successMsg.value = 'Company signature uploaded and saved successfully!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (err) {
      console.warn('Signature upload save fallback:', err)
      try {
        await api.put('/settings', { settings: { COMPANY_SIGNATURE_URL: dataBase64 } })
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
    successMsg.value = 'Company signature removed.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (_) {}
}

const showSecret = ref({
  GHL_SHARED_SECRET: false,
  GHL_PRIVATE_INTEGRATION_TOKEN: false,
  GHL_WEBHOOK_SECRET: false,
})

function toggleShow(field) {
  showSecret.value[field] = !showSecret.value[field]
}

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
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to load settings.'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = { ...form.value }
    const res = await api.put('/settings', { settings: payload })
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
    order: Number(sectionForm.value.order || 1),
  }

  if (editingSectionIndex.value >= 0) {
    customSchema.value.sections[editingSectionIndex.value] = sectionData
  } else {
    customSchema.value.sections.push(sectionData)
  }

  showSectionModal.value = false
  schemaActiveTab.value = 'sections'
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
.schema-tabs-row {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.schema-tab-btn {
  background: none;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s ease;
}

.schema-tab-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.schema-tab-btn.active {
  background: #eff6ff;
  color: #2563eb;
}

.schema-count-pill {
  background: rgba(100, 116, 139, 0.15);
  color: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

.schema-tab-btn.active .schema-count-pill {
  background: #bfdbfe;
  color: #1e40af;
}

.empty-schema-box {
  text-align: center;
  padding: 32px 16px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.schema-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.schema-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
  background: #ffffff;
}

.schema-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.schema-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.schema-table tr:hover td {
  background: #fdfdfd;
}

.schema-key-code {
  background: #f1f5f9;
  color: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.78rem;
  font-family: monospace;
}

.badge-type-pill {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
}

.options-count-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.7rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}

.badge-section-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.badge-req {
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-opt {
  color: #94a3b8;
  font-size: 0.7rem;
}

.badge-count-pill {
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
}

.btn-icon-action {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: #475569;
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.btn-icon-action:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.btn-icon-delete:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fee2e2;
}

.preset-dropdown-container {
  position: relative;
}

.preset-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 290px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preset-item {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.preset-item:last-child {
  border-bottom: none;
}

.preset-item:hover {
  background: #eff6ff;
  color: #2563eb;
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card-custom {
  background: #ffffff;
  border-radius: 14px;
  padding: 22px 24px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.btn-close-custom:hover {
  color: #0f172a;
}

.modal-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.req {
  color: #ef4444;
}
</style>
