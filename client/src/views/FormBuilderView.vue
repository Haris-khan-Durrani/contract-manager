<template>
  <div class="studio-container">
    <!-- Top Studio Header -->
    <header class="studio-header">
      <div class="header-left">
        <router-link to="/forms" class="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Forms
        </router-link>

        <div class="form-title-group">
          <input
            type="text"
            v-model="formName"
            class="form-title-input"
            placeholder="Untitled Form"
          />
          <span class="badge" :class="formType === 'TEAM' ? 'badge-primary' : 'badge-neutral'">
            {{ formType === 'TEAM' ? '👥 TEAM FORM' : '👤 NORMAL FORM' }}
          </span>
          <span class="badge badge-neutral">ID #{{ formId }}</span>
        </div>
      </div>

      <!-- Studio Navigation Tabs -->
      <div class="header-center">
        <div class="view-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeView === 'canvas' }"
            @click="activeView = 'canvas'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            Form Designer
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeView === 'preview' }"
            @click="activeView = 'preview'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Live Preview & Test Fill
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeView === 'submissions' }"
            @click="fetchSubmissions(); activeView = 'submissions'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Responses ({{ submissions.length }})
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeView === 'settings' }"
            @click="activeView = 'settings'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Contract Settings
          </button>
        </div>
      </div>

      <div class="header-right">
        <span v-if="saveStatus === 'saved'" class="status-msg text-success">
          ✓ All changes saved
        </span>
        <span v-else-if="saveStatus === 'saving'" class="status-msg text-muted">
          Saving…
        </span>

        <button class="btn btn-primary btn-sm" @click="saveForm" :disabled="saving">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
          </svg>
          Save Form
        </button>
      </div>
    </header>

    <!-- Studio Main Content -->
    <div class="studio-body">
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- VIEW 1: FORM DESIGNER (3-PANE CANVAS)                               -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeView === 'canvas'" class="builder-three-pane">
        <!-- LEFT: FIELD PALETTE & STRUCTURE -->
        <aside class="palette-sidebar">
          <div class="sidebar-section">
            <h4 class="palette-section-title">Form Structure</h4>
            <div class="palette-grid">
              <button
                type="button"
                class="palette-btn"
                @click="addSection"
              >
                <span class="p-icon">📑</span>
                <span class="p-label"><strong>+ Add Form Section</strong></span>
              </button>

              <button
                type="button"
                class="palette-btn highlight-btn"
                @click="addRepeaterSection"
              >
                <span class="p-icon">👥</span>
                <span class="p-label"><strong>+ Add Repeating Group (Team Members)</strong></span>
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h4 class="palette-section-title">Standard Fields (17 Types)</h4>
            <div class="palette-grid">
              <button
                v-for="ft in fieldTypes"
                :key="ft.type"
                type="button"
                class="palette-btn"
                @click="addFieldToActiveSection(ft.type)"
              >
                <span class="p-icon">{{ ft.icon }}</span>
                <span class="p-label">{{ ft.label }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- CENTER: CANVAS (SECTIONS, FIELDS & REPEATERS) -->
        <main class="canvas-area">
          <div class="canvas-container">
            <div class="form-meta-box">
              <input
                type="text"
                v-model="formName"
                class="form-headline-input"
                placeholder="Form Name"
              />
              <textarea
                v-model="formDescription"
                class="form-desc-input"
                rows="2"
                placeholder="Add optional description or instructions for the applicant..."
              ></textarea>
            </div>

            <!-- Empty Sections Notice -->
            <div v-if="!sections.length" class="empty-canvas">
              <p>No sections in this form.</p>
              <button class="btn btn-primary btn-sm" @click="addSection">+ Add First Section</button>
            </div>

            <!-- Sections Stream -->
            <div v-else class="sections-stream">
              <div
                v-for="(sec, sIdx) in sections"
                :key="sec.id"
                class="section-card"
                :class="{ 'repeater-section': sec.isRepeater, 'selected-section': selectedSectionId === sec.id }"
                @click="selectSection(sec.id)"
              >
                <!-- Section Header -->
                <div class="section-header">
                  <div class="sec-title-wrap">
                    <span v-if="sec.isRepeater" class="badge badge-primary">REPEATING GROUP (TEAM)</span>
                    <input
                      type="text"
                      v-model="sec.title"
                      class="section-title-input"
                      placeholder="Section Title"
                    />
                  </div>

                  <div class="sec-actions">
                    <button
                      type="button"
                      class="btn-tool-xs"
                      :disabled="sIdx === 0"
                      @click.stop="moveSection(sIdx, -1)"
                      title="Move section up"
                    >▲</button>
                    <button
                      type="button"
                      class="btn-tool-xs"
                      :disabled="sIdx === sections.length - 1"
                      @click.stop="moveSection(sIdx, 1)"
                      title="Move section down"
                    >▼</button>
                    <button
                      type="button"
                      class="btn-tool-xs btn-danger"
                      @click.stop="deleteSection(sec.id)"
                      title="Delete section"
                    >✕</button>
                  </div>
                </div>

                <div v-if="sec.isRepeater" class="repeater-info-banner">
                  <div class="rep-prop">Key: <code>{{ sec.repeaterKey || 'team_members' }}</code></div>
                  <div class="rep-prop">Label: <strong>{{ sec.repeaterLabel || 'Team Member' }}</strong></div>
                  <div class="rep-prop">Button: <em>{{ sec.addButtonText || '+ Add Another Person' }}</em></div>
                </div>

                <!-- Section Fields Grid -->
                <div class="fields-grid-layout">
                  <div
                    v-for="(field, fIdx) in (sec.fields || [])"
                    :key="field.id"
                    class="field-card"
                    :class="[
                      field.width ? `w-${field.width}` : 'w-full',
                      { selected: selectedFieldId === field.id }
                    ]"
                    @click.stop="selectField(sec.id, field.id)"
                  >
                    <div class="field-card-header">
                      <div class="f-label-row">
                        <span class="f-label">{{ field.label || 'Untitled Field' }}</span>
                        <span v-if="field.required" class="req">*</span>
                      </div>
                      <div class="f-badges">
                        <span class="badge badge-neutral">{{ field.type }}</span>
                        <span v-if="field.hasCondition" class="badge badge-warning">⚡ Condition</span>
                      </div>
                    </div>

                    <!-- Mock Input Representation -->
                    <div class="field-mock-box">
                      <input
                        v-if="['text', 'email', 'phone', 'number', 'currency', 'date', 'datetime'].includes(field.type)"
                        type="text"
                        class="mock-input"
                        :placeholder="field.placeholder || `Enter ${field.label}...`"
                        disabled
                      />
                      <textarea
                        v-else-if="field.type === 'textarea'"
                        class="mock-input"
                        rows="2"
                        :placeholder="field.placeholder || `Enter ${field.label}...`"
                        disabled
                      ></textarea>
                      <select v-else-if="field.type === 'dropdown'" class="mock-input" disabled>
                        <option>{{ field.placeholder || '-- Select option --' }}</option>
                      </select>
                      <div v-else-if="field.type === 'radio'" class="mock-choices">
                        <span v-for="(o, oi) in (field.options || ['Option 1', 'Option 2'])" :key="oi" class="choice-item">
                          <input type="radio" disabled /> {{ o.label || o }}
                        </span>
                      </div>
                      <div v-else-if="field.type === 'checkbox'" class="mock-choices">
                        <label class="choice-item">
                          <input type="checkbox" disabled /> {{ field.placeholder || field.label }}
                        </label>
                      </div>
                      <div v-else-if="field.type === 'file'" class="mock-file">
                        <span>📎 Drag & Drop Passport / Attachment</span>
                      </div>
                      <div v-else-if="field.type === 'heading'" class="mock-heading">
                        <strong>{{ field.label }}</strong>
                      </div>
                      <div v-else-if="field.type === 'divider'" class="mock-divider">
                        <hr />
                      </div>
                    </div>

                    <div class="field-card-footer">
                      <code class="f-key">{{ field.key }}</code>
                      <div class="f-actions">
                        <button
                          type="button"
                          class="btn-tool-mini"
                          :disabled="fIdx === 0"
                          @click.stop="moveField(sec.id, fIdx, -1)"
                        >▲</button>
                        <button
                          type="button"
                          class="btn-tool-mini"
                          :disabled="fIdx === sec.fields.length - 1"
                          @click.stop="moveField(sec.id, fIdx, 1)"
                        >▼</button>
                        <button
                          type="button"
                          class="btn-tool-mini btn-danger"
                          @click.stop="deleteField(sec.id, field.id)"
                        >✕</button>
                      </div>
                    </div>
                  </div>

                  <div v-if="!sec.fields || !sec.fields.length" class="empty-section-dropzone">
                    <span>Click any field from the left palette to add fields to "{{ sec.title }}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- RIGHT: FIELD & ADVANCED CONDITION INSPECTOR -->
        <aside class="inspector-sidebar">
          <!-- Field Properties Mode -->
          <div v-if="selectedField" class="inspector-content">
            <div class="inspector-header">
              <div>
                <h3 class="inspector-title">Field Settings</h3>
                <span class="text-muted" style="font-size: 0.72rem;">Key: <code>{{ selectedField.key }}</code></span>
              </div>
              <span class="badge badge-primary">{{ selectedField.type }}</span>
            </div>

            <!-- General Config -->
            <div class="inspector-section">
              <div class="form-group">
                <label class="form-label">Field Label <span class="req">*</span></label>
                <input
                  type="text"
                  v-model="selectedField.label"
                  class="form-control"
                  @input="onLabelChange"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Internal Data Key (Exact Variable Path)</label>
                <input
                  type="text"
                  v-model="selectedField.key"
                  class="form-control"
                  placeholder="e.g. applicant.full_name or passport_number"
                />
                <small class="text-muted">Used for dynamic contract mapping & JSON submission payload.</small>
              </div>

              <div class="form-group" v-if="!['checkbox', 'heading', 'divider', 'file'].includes(selectedField.type)">
                <label class="form-label">Placeholder Text</label>
                <input
                  type="text"
                  v-model="selectedField.placeholder"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Help / Instruction Text</label>
                <input
                  type="text"
                  v-model="selectedField.helpText"
                  class="form-control"
                  placeholder="Shown below input"
                />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Field Layout Width</label>
                  <select v-model="selectedField.width" class="form-control">
                    <option value="full">Full Width (100%)</option>
                    <option value="half">Half Width (50%)</option>
                    <option value="third">One Third (33%)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Requirement</label>
                  <label class="check-label" style="margin-top: 8px;">
                    <input type="checkbox" v-model="selectedField.required" />
                    <span>Required Field</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Options Editor for Choice Fields -->
            <div v-if="['dropdown', 'radio', 'multiselect', 'checkbox_group'].includes(selectedField.type)" class="inspector-section">
              <h4 class="section-subtitle">Choices & Options</h4>
              <div class="options-list">
                <div
                  v-for="(opt, oi) in (selectedField.options || [])"
                  :key="oi"
                  class="option-row"
                >
                  <input
                    type="text"
                    v-model="opt.label"
                    class="form-control option-input"
                    placeholder="Option Label"
                    @input="syncOptionValue(opt)"
                  />
                  <button
                    type="button"
                    class="btn-remove-opt"
                    @click="removeOption(oi)"
                    title="Remove option"
                  >✕</button>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" @click="addOption" style="margin-top: var(--space-2);">
                + Add Option
              </button>
            </div>

            <!-- ADVANCED CONDITION MODULE (SHOW / HIDE / REMOVE / REPEATER) -->
            <div class="inspector-section">
              <h4 class="section-subtitle">⚡ Advanced Conditional Logic</h4>
              <p class="text-muted" style="font-size: 0.72rem; margin-bottom: var(--space-2);">
                Dynamically control field appearance, validation, or repeater activation based on client answers.
              </p>

              <div class="form-check-group">
                <label class="check-label">
                  <input type="checkbox" v-model="selectedField.hasCondition" />
                  <span>Enable Conditional Rule</span>
                </label>
              </div>

              <div v-if="selectedField.hasCondition" class="condition-builder-box">
                <div class="form-group">
                  <label class="form-label">Rule Action</label>
                  <select v-model="selectedField.conditionAction" class="form-control">
                    <option value="SHOW">SHOW this field when condition is met</option>
                    <option value="HIDE">HIDE this field when condition is met</option>
                    <option value="REMOVE">REMOVE / DISABLE field from validation</option>
                    <option value="CONVERT_REPEATER">CONVERT / ENABLE Repeating Group</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Match Logic</label>
                  <select v-model="selectedField.conditionMatch" class="form-control">
                    <option value="ALL">Match ALL conditions (AND)</option>
                    <option value="ANY">Match ANY condition (OR)</option>
                  </select>
                </div>

                <div class="rules-list">
                  <div
                    v-for="(rule, ri) in (selectedField.conditionRules || [{ fieldKey: '', operator: 'EQUALS', value: '' }])"
                    :key="ri"
                    class="rule-row-box"
                  >
                    <div class="form-group">
                      <label class="form-label">Depends on Field</label>
                      <select v-model="rule.fieldKey" class="form-control">
                        <option value="">-- Select Field --</option>
                        <option
                          v-for="f in allOtherFields"
                          :key="f.id"
                          :value="f.key"
                        >
                          {{ f.label }} ({{ f.key }})
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Operator</label>
                      <select v-model="rule.operator" class="form-control">
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Does not equal</option>
                        <option value="CONTAINS">Contains</option>
                        <option value="DOES_NOT_CONTAIN">Does not contain</option>
                        <option value="GREATER_THAN">Greater than</option>
                        <option value="LESS_THAN">Less than</option>
                        <option value="IS_EMPTY">Is empty</option>
                        <option value="IS_NOT_EMPTY">Is not empty</option>
                      </select>
                    </div>

                    <div class="form-group" v-if="!['IS_EMPTY', 'IS_NOT_EMPTY'].includes(rule.operator)">
                      <label class="form-label">Target Comparison Value</label>
                      <input
                        type="text"
                        v-model="rule.value"
                        class="form-control"
                        placeholder="e.g. Yes / Other / Child"
                      />
                    </div>

                    <button
                      type="button"
                      v-if="selectedField.conditionRules && selectedField.conditionRules.length > 1"
                      class="btn btn-danger btn-sm"
                      style="margin-top: 4px;"
                      @click="removeConditionRule(ri)"
                    >
                      Delete Rule
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  style="margin-top: 6px;"
                  @click="addConditionRule"
                >
                  + Add Another Condition
                </button>
              </div>
            </div>
          </div>

          <!-- Section Properties Mode -->
          <div v-else-if="selectedSection" class="inspector-content">
            <div class="inspector-header">
              <h3 class="inspector-title">Section Settings</h3>
              <span class="badge badge-neutral">Section</span>
            </div>

            <div class="inspector-section">
              <div class="form-group">
                <label class="form-label">Section Title</label>
                <input type="text" v-model="selectedSection.title" class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Description / Instructions</label>
                <textarea v-model="selectedSection.description" class="form-control" rows="2"></textarea>
              </div>

              <div class="form-check-group">
                <label class="check-label">
                  <input type="checkbox" v-model="selectedSection.isRepeater" />
                  <strong>Make this a Repeating Group (Team Members)</strong>
                </label>
              </div>

              <div v-if="selectedSection.isRepeater" class="repeater-config-box">
                <div class="form-group">
                  <label class="form-label">Repeater JSON Array Key</label>
                  <input type="text" v-model="selectedSection.repeaterKey" class="form-control" placeholder="e.g. team_members" />
                </div>
                <div class="form-group">
                  <label class="form-label">Item Label</label>
                  <input type="text" v-model="selectedSection.repeaterLabel" class="form-control" placeholder="e.g. Team Member or Child" />
                </div>
                <div class="form-group">
                  <label class="form-label">Add Button Text</label>
                  <input type="text" v-model="selectedSection.addButtonText" class="form-control" placeholder="e.g. + Add Another Person" />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="inspector-empty">
            <div class="empty-icon">📝</div>
            <h4>No Element Selected</h4>
            <p>Click any field or section on the canvas to configure its settings, internal keys, and advanced conditions.</p>
          </div>
        </aside>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- VIEW 2: LIVE PREVIEW & INTERACTIVE SUBMISSION (STAGE 2 TEST FILL)   -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeView === 'preview'" class="preview-mode-container">
        <div class="preview-card glass-card">
          <div class="preview-header">
            <h2>{{ formName }}</h2>
            <p class="text-muted">{{ formDescription || 'Complete all required applicant details below.' }}</p>
          </div>

          <form @submit.prevent="submitTestForm" class="preview-interactive-form">
            <!-- Render Sections -->
            <div v-for="sec in sections" :key="sec.id" class="preview-section-box">
              <h3 class="p-sec-title">{{ sec.title }}</h3>
              <p v-if="sec.description" class="p-sec-desc text-muted">{{ sec.description }}</p>

              <!-- Standard (Non-Repeater) Section -->
              <div v-if="!sec.isRepeater" class="p-fields-grid">
                <template v-for="f in sec.fields" :key="f.id">
                  <div
                    v-if="isFieldVisibleInPreview(f)"
                    class="form-group preview-field-cell"
                    :class="[f.width ? `w-${f.width}` : 'w-full']"
                  >
                    <label class="form-label">
                      {{ f.label }}
                      <span v-if="f.required" class="req">*</span>
                    </label>

                    <input
                      v-if="['text', 'email', 'phone', 'number', 'currency'].includes(f.type)"
                      :type="f.type === 'number' || f.type === 'currency' ? 'number' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'"
                      v-model="previewValues[f.key]"
                      class="form-control"
                      :placeholder="f.placeholder"
                      :required="f.required"
                    />

                    <input
                      v-else-if="f.type === 'date'"
                      type="date"
                      v-model="previewValues[f.key]"
                      class="form-control"
                      :required="f.required"
                    />

                    <input
                      v-else-if="f.type === 'datetime'"
                      type="datetime-local"
                      v-model="previewValues[f.key]"
                      class="form-control"
                      :required="f.required"
                    />

                    <textarea
                      v-else-if="f.type === 'textarea'"
                      v-model="previewValues[f.key]"
                      class="form-control"
                      rows="3"
                      :placeholder="f.placeholder"
                      :required="f.required"
                    ></textarea>

                    <select
                      v-else-if="f.type === 'dropdown'"
                      v-model="previewValues[f.key]"
                      class="form-control"
                      :required="f.required"
                    >
                      <option value="">{{ f.placeholder || '-- Select --' }}</option>
                      <option
                        v-for="(opt, oi) in (f.options || [])"
                        :key="oi"
                        :value="opt.value || opt.label || opt"
                      >
                        {{ opt.label || opt }}
                      </option>
                    </select>

                    <div v-else-if="f.type === 'radio'" class="radio-group-flex">
                      <label v-for="(opt, oi) in (f.options || [])" :key="oi" class="radio-label">
                        <input
                          type="radio"
                          :name="f.key"
                          :value="opt.value || opt.label || opt"
                          v-model="previewValues[f.key]"
                        />
                        <span>{{ opt.label || opt }}</span>
                      </label>
                    </div>

                    <label v-else-if="f.type === 'checkbox'" class="check-label">
                      <input type="checkbox" v-model="previewValues[f.key]" />
                      <span>{{ f.placeholder || f.label }}</span>
                    </label>

                    <div v-else-if="f.type === 'file'" class="file-upload-box">
                      <span>📁 Drag & Drop file or click to upload</span>
                      <input type="file" @change="onFileChange($event, f.key)" />
                    </div>

                    <small v-if="f.helpText" class="text-muted">{{ f.helpText }}</small>
                  </div>
                </template>
              </div>

              <!-- REPEATER SECTION (TEAM MEMBERS / DEPENDENTS) -->
              <div v-else class="repeater-render-container">
                <div
                  v-for="(member, mIdx) in (previewRepeaters[sec.repeaterKey || 'team_members'] || [])"
                  :key="mIdx"
                  class="repeater-item-card"
                >
                  <div class="repeater-item-header">
                    <h4>{{ sec.repeaterLabel || 'Person' }} #{{ mIdx + 1 }}</h4>
                    <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="removeRepeaterItem(sec.repeaterKey || 'team_members', mIdx)"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div class="p-fields-grid">
                    <div
                      v-for="f in sec.fields"
                      :key="f.id"
                      class="form-group preview-field-cell"
                      :class="[f.width ? `w-${f.width}` : 'w-full']"
                    >
                      <label class="form-label">
                        {{ f.label }}
                        <span v-if="f.required" class="req">*</span>
                      </label>

                      <input
                        v-if="['text', 'email', 'phone', 'number', 'currency'].includes(f.type)"
                        type="text"
                        v-model="member[f.key]"
                        class="form-control"
                        :placeholder="f.placeholder"
                        :required="f.required"
                      />

                      <input
                        v-else-if="f.type === 'date'"
                        type="date"
                        v-model="member[f.key]"
                        class="form-control"
                        :required="f.required"
                      />

                      <select
                        v-else-if="f.type === 'dropdown'"
                        v-model="member[f.key]"
                        class="form-control"
                        :required="f.required"
                      >
                        <option value="">-- Select --</option>
                        <option
                          v-for="(opt, oi) in (f.options || [])"
                          :key="oi"
                          :value="opt.value || opt.label || opt"
                        >
                          {{ opt.label || opt }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn btn-secondary"
                  style="margin-top: 10px;"
                  @click="addRepeaterItem(sec.repeaterKey || 'team_members')"
                >
                  {{ sec.addButtonText || '+ Add Another Person' }}
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="preview-submit-bar">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
                {{ submitting ? 'Recording Submission…' : 'Submit Form Response' }}
              </button>
            </div>
          </form>

          <!-- Real-Time JSON Payload Inspector -->
          <div class="payload-preview-box">
            <h4>Live Generated Form Payload (JSON):</h4>
            <pre class="json-code-box">{{ JSON.stringify(computedFinalPayload, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- VIEW 3: SUBMISSIONS & RESPONSES HISTORY                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeView === 'submissions'" class="submissions-container">
        <div class="glass-card" style="padding: var(--space-6);">
          <div class="submissions-header">
            <div>
              <h3>Submitted Responses History</h3>
              <p class="text-muted">All responses recorded for this form independently of contract PDFs.</p>
            </div>
            <button class="btn btn-secondary btn-sm" @click="fetchSubmissions">Refresh Responses</button>
          </div>

          <div v-if="!submissions.length" class="empty-notice">
            <p>No submissions recorded yet for this form. Use the "Live Preview & Test Fill" tab to submit test data.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submitted By</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Payload Preview</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sub in submissions" :key="sub.id">
                  <td><strong>#{{ sub.id }}</strong></td>
                  <td>{{ sub.submitted_by || 'Client' }}</td>
                  <td>{{ formatDate(sub.created_at) }}</td>
                  <td><span class="badge badge-success">{{ sub.status }}</span></td>
                  <td>
                    <details>
                      <summary style="cursor:pointer; color:var(--color-primary-light);">View Full JSON Payload</summary>
                      <pre class="json-mini-box">{{ JSON.stringify(sub.data, null, 2) }}</pre>
                    </details>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- VIEW 4: CONTRACT SETTINGS                                           -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeView === 'settings'" class="settings-view-container">
        <div class="settings-page-inner">
          <div class="settings-page-header">
            <h2>Contract Settings</h2>
            <p class="text-muted">Configure how this form behaves when used inside a contract. These settings apply when staff create a contract using this form.</p>
          </div>

          <div class="settings-grid">
            <!-- Form Mode -->
            <div class="settings-card">
              <h4 class="settings-card-title">
                <span class="settings-icon">📋</span>
                Form Mode
              </h4>
              <p class="text-muted" style="font-size:0.85rem; margin-bottom:var(--space-4);">Determines whether this form collects data for a single applicant or a team of people.</p>
              <div class="radio-group">
                <label class="radio-option" :class="{ active: formSettings.formMode === 'NORMAL' }">
                  <input type="radio" v-model="formSettings.formMode" value="NORMAL" />
                  <div class="radio-content">
                    <span class="radio-icon">👤</span>
                    <div>
                      <strong>Normal / Individual</strong>
                      <small>Single applicant fills the form</small>
                    </div>
                  </div>
                </label>
                <label class="radio-option" :class="{ active: formSettings.formMode === 'TEAM' }">
                  <input type="radio" v-model="formSettings.formMode" value="TEAM" />
                  <div class="radio-content">
                    <span class="radio-icon">👥</span>
                    <div>
                      <strong>Team / Group</strong>
                      <small>Main applicant + additional members</small>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Team-specific options -->
              <div v-if="formSettings.formMode === 'TEAM'" class="team-options">
                <div class="form-row-2">
                  <div class="form-group">
                    <label>Minimum Team Members</label>
                    <input type="number" v-model.number="formSettings.minMembers" min="0" class="form-input" />
                    <small class="text-muted">0 = no minimum required</small>
                  </div>
                  <div class="form-group">
                    <label>Maximum Team Members</label>
                    <input type="number" v-model.number="formSettings.maxMembers" min="1" class="form-input" placeholder="∞ Unlimited" />
                    <small class="text-muted">Leave blank for unlimited</small>
                  </div>
                </div>
                <div class="form-group">
                  <label class="toggle-label">
                    <div>
                      <strong>Ask count first</strong>
                      <small>Prompt "How many additional applicants?" before showing member fields</small>
                    </div>
                    <div class="toggle-switch" :class="{ on: formSettings.askCountFirst }" @click="formSettings.askCountFirst = !formSettings.askCountFirst">
                      <div class="toggle-knob"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Link Expiry -->
            <div class="settings-card">
              <h4 class="settings-card-title">
                <span class="settings-icon">⏱️</span>
                Default Link Expiry
              </h4>
              <p class="text-muted" style="font-size:0.85rem; margin-bottom:var(--space-4);">How long the public signing link remains valid after a contract is created. Staff can override this per contract.</p>
              <div class="expiry-options">
                <button
                  v-for="opt in expiryOptions"
                  :key="opt.value"
                  type="button"
                  class="expiry-chip"
                  :class="{ active: formSettings.defaultExpiryDays === opt.value }"
                  @click="formSettings.defaultExpiryDays = opt.value"
                >{{ opt.label }}</button>
              </div>
              <div class="form-group" style="margin-top:var(--space-3);">
                <label>Or enter custom days</label>
                <input type="number" v-model.number="formSettings.defaultExpiryDays" min="1" max="365" class="form-input" style="max-width:140px;" />
              </div>
            </div>

            <!-- Client Journey -->
            <div class="settings-card">
              <h4 class="settings-card-title">
                <span class="settings-icon">🛤️</span>
                Client Journey Options
              </h4>

              <div class="toggle-list">
                <div class="form-group">
                  <label class="toggle-label">
                    <div>
                      <strong>Allow Save &amp; Resume</strong>
                      <small>Client can close the link and continue later. Their progress is auto-saved.</small>
                    </div>
                    <div class="toggle-switch" :class="{ on: formSettings.allowSaveResume }" @click="formSettings.allowSaveResume = !formSettings.allowSaveResume">
                      <div class="toggle-knob"></div>
                    </div>
                  </label>
                </div>

                <div class="form-group">
                  <label class="toggle-label">
                    <div>
                      <strong>Require Review Before Signing</strong>
                      <small>Client must scroll the full agreement and check a confirmation box before the Sign step is unlocked.</small>
                    </div>
                    <div class="toggle-switch" :class="{ on: formSettings.requireReview }" @click="formSettings.requireReview = !formSettings.requireReview">
                      <div class="toggle-knob"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Signature Methods -->
            <div class="settings-card">
              <h4 class="settings-card-title">
                <span class="settings-icon">✍️</span>
                Signature Methods Allowed
              </h4>
              <p class="text-muted" style="font-size:0.85rem; margin-bottom:var(--space-4);">Which methods can the client use to sign? At least one must be selected.</p>
              <div class="sig-method-grid">
                <label class="sig-method-card" :class="{ active: formSettings.signatureMethods.draw }">
                  <input type="checkbox" v-model="formSettings.signatureMethods.draw" />
                  <span class="sig-icon">✏️</span>
                  <strong>Draw</strong>
                  <small>Freehand on canvas</small>
                </label>
                <label class="sig-method-card" :class="{ active: formSettings.signatureMethods.type }">
                  <input type="checkbox" v-model="formSettings.signatureMethods.type" />
                  <span class="sig-icon">⌨️</span>
                  <strong>Type</strong>
                  <small>Typed name in cursive</small>
                </label>
                <label class="sig-method-card" :class="{ active: formSettings.signatureMethods.upload }">
                  <input type="checkbox" v-model="formSettings.signatureMethods.upload" />
                  <span class="sig-icon">📤</span>
                  <strong>Upload</strong>
                  <small>Upload image file</small>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-actions">
            <button class="btn btn-primary" @click="saveForm" :disabled="saving">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
              </svg>
              Save Settings
            </button>
            <span v-if="saveStatus === 'saved'" class="text-success" style="font-size:0.85rem;">✓ Saved</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth  = useAuthStore()
const formId = route.params.id

const formName = ref('Untitled Form')
const formDescription = ref('')
const formType = ref('NORMAL') // 'NORMAL' | 'TEAM'
const sections = ref([])

const selectedSectionId = ref(null)
const selectedFieldId = ref(null)
const activeView = ref('canvas') // 'canvas' | 'preview' | 'submissions' | 'settings'

const saving = ref(false)
const saveStatus = ref('')
const submitting = ref(false)
const submissions = ref([])

// Contract Settings State
const formSettings = ref({
  formMode: 'NORMAL',
  minMembers: 0,
  maxMembers: null,
  askCountFirst: false,
  defaultExpiryDays: 7,
  allowSaveResume: true,
  requireReview: true,
  signatureMethods: { draw: true, type: true, upload: false },
})

const expiryOptions = [
  { label: '1 Day',   value: 1  },
  { label: '3 Days',  value: 3  },
  { label: '7 Days',  value: 7  },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
]

// Preview State
const previewValues = ref({})
const previewRepeaters = ref({
  team_members: [],
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

// 17 Form Field Types
const fieldTypes = [
  { type: 'text',           label: 'Short Text',        icon: '🔤' },
  { type: 'textarea',       label: 'Paragraph / Long',  icon: '📄' },
  { type: 'email',          label: 'Email Address',     icon: '📧' },
  { type: 'phone',          label: 'Phone Number',      icon: '📞' },
  { type: 'number',         label: 'Number',            icon: '🔢' },
  { type: 'currency',       label: 'Currency / Fee',    icon: '💰' },
  { type: 'date',           label: 'Date Picker',       icon: '📅' },
  { type: 'datetime',       label: 'Date & Time',       icon: '⏰' },
  { type: 'dropdown',       label: 'Dropdown Select',   icon: '🔽' },
  { type: 'multiselect',    label: 'Multi-Select',      icon: '☑️' },
  { type: 'radio',          label: 'Radio Options',     icon: '🔘' },
  { type: 'checkbox',       label: 'Single Checkbox',   icon: '✅' },
  { type: 'checkbox_group', label: 'Checkbox Group',    icon: '📋' },
  { type: 'file',           label: 'File / Document',   icon: '📎' },
  { type: 'heading',        label: 'Section Heading',   icon: '🏷️' },
  { type: 'divider',        label: 'Divider Line',      icon: '➖' },
]

const selectedSection = computed(() => {
  return sections.value.find(s => s.id === selectedSectionId.value) || null
})

const selectedField = computed(() => {
  if (!selectedFieldId.value) return null
  for (const s of sections.value) {
    const f = (s.fields || []).find(f => f.id === selectedFieldId.value)
    if (f) return f
  }
  return null
})

const allOtherFields = computed(() => {
  const result = []
  for (const s of sections.value) {
    for (const f of (s.fields || [])) {
      if (f.id !== selectedFieldId.value) {
        result.push(f)
      }
    }
  }
  return result
})

const computedFinalPayload = computed(() => {
  const payload = { ...previewValues.value }
  // Add repeaters
  for (const [key, items] of Object.entries(previewRepeaters.value)) {
    if (items && items.length) {
      payload[key] = items
    }
  }
  return payload
})

// ─── Section & Field Operations ─────────────────────────────────────────────
function selectSection(id) {
  selectedSectionId.value = id
}

function selectField(secId, fieldId) {
  selectedSectionId.value = secId
  selectedFieldId.value = fieldId
}

function addSection() {
  const num = sections.value.length + 1
  const newSec = {
    id: `sec_${Date.now()}_${num}`,
    title: `Section ${num}: Details`,
    description: '',
    isRepeater: false,
    fields: [],
  }
  sections.value.push(newSec)
  selectedSectionId.value = newSec.id
}

function addRepeaterSection() {
  const num = sections.value.length + 1
  const newSec = {
    id: `sec_repeater_${Date.now()}`,
    title: 'Team Members / Dependents',
    description: 'Repeatable group for additional applicants or associates',
    isRepeater: true,
    repeaterKey: 'team_members',
    repeaterLabel: 'Team Member',
    addButtonText: '+ Add Another Person',
    fields: [
      { id: `f_${Date.now()}_1`, key: 'full_name', label: 'Full Name', type: 'text', required: true, width: 'half' },
      { id: `f_${Date.now()}_2`, key: 'passport_number', label: 'Passport / EID', type: 'text', required: true, width: 'half' },
      { id: `f_${Date.now()}_3`, key: 'nationality', label: 'Nationality', type: 'text', required: true, width: 'half' },
      { id: `f_${Date.now()}_4`, key: 'relationship', label: 'Relationship', type: 'dropdown', options: ['Spouse', 'Child', 'Associate'], required: true, width: 'half' },
    ],
  }
  sections.value.push(newSec)
  selectedSectionId.value = newSec.id
}

function deleteSection(id) {
  sections.value = sections.value.filter(s => s.id !== id)
  if (selectedSectionId.value === id) {
    selectedSectionId.value = sections.value[0]?.id || null
    selectedFieldId.value = null
  }
}

function moveSection(index, delta) {
  const target = index + delta
  if (target < 0 || target >= sections.value.length) return
  const item = sections.value.splice(index, 1)[0]
  sections.value.splice(target, 0, item)
}

function addFieldToActiveSection(type) {
  if (!sections.value.length) addSection()
  let sec = selectedSection.value || sections.value[0]

  const count = (sec.fields || []).length + 1
  const fieldKey = sec.isRepeater
    ? `field_${type}_${count}`
    : `applicant.${type}_${count}`

  const newField = {
    id: `f_${Date.now()}_${count}`,
    key: fieldKey,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    type,
    required: false,
    placeholder: '',
    helpText: '',
    width: ['textarea', 'file', 'heading', 'divider'].includes(type) ? 'full' : 'half',
    hasCondition: false,
    conditionAction: 'SHOW',
    conditionMatch: 'ALL',
    conditionRules: [{ fieldKey: '', operator: 'EQUALS', value: '' }],
    options: ['dropdown', 'radio', 'multiselect', 'checkbox_group'].includes(type)
      ? [{ label: 'Option 1', value: 'Option 1' }, { label: 'Option 2', value: 'Option 2' }]
      : [],
  }

  if (!sec.fields) sec.fields = []
  sec.fields.push(newField)
  selectedSectionId.value = sec.id
  selectedFieldId.value = newField.id
}

function deleteField(secId, fieldId) {
  const s = sections.value.find(s => s.id === secId)
  if (!s) return
  s.fields = s.fields.filter(f => f.id !== fieldId)
  if (selectedFieldId.value === fieldId) {
    selectedFieldId.value = s.fields[0]?.id || null
  }
}

function moveField(secId, index, delta) {
  const s = sections.value.find(s => s.id === secId)
  if (!s) return
  const target = index + delta
  if (target < 0 || target >= s.fields.length) return
  const item = s.fields.splice(index, 1)[0]
  s.fields.splice(target, 0, item)
}

function onLabelChange() {
  if (!selectedField.value) return
  const label = selectedField.value.label || ''
  const cleanKey = label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  if (cleanKey && (!selectedField.value.key || selectedField.value.key.startsWith('applicant.field_') || selectedField.value.key.startsWith('field_'))) {
    selectedField.value.key = selectedSection.value?.isRepeater ? cleanKey : `applicant.${cleanKey}`
  }
}

function addOption() {
  if (!selectedField.value) return
  if (!selectedField.value.options) selectedField.value.options = []
  const n = selectedField.value.options.length + 1
  selectedField.value.options.push({ label: `Option ${n}`, value: `Option ${n}` })
}

function removeOption(idx) {
  if (!selectedField.value?.options) return
  selectedField.value.options.splice(idx, 1)
}

function syncOptionValue(opt) {
  opt.value = opt.label
}

// ─── Condition Rules Operations ─────────────────────────────────────────────
function addConditionRule() {
  if (!selectedField.value) return
  if (!selectedField.value.conditionRules) selectedField.value.conditionRules = []
  selectedField.value.conditionRules.push({ fieldKey: '', operator: 'EQUALS', value: '' })
}

function removeConditionRule(idx) {
  if (!selectedField.value?.conditionRules) return
  selectedField.value.conditionRules.splice(idx, 1)
}

// ─── Preview & Condition Evaluation ─────────────────────────────────────────
function isFieldVisibleInPreview(field) {
  if (!field.hasCondition || !field.conditionRules || !field.conditionRules.length) return true

  const evaluateRule = (rule) => {
    if (!rule.fieldKey) return true
    const currentVal = previewValues.value[rule.fieldKey] || ''
    const targetVal = rule.value || ''

    switch (rule.operator) {
      case 'EQUALS':
        return String(currentVal).toLowerCase() === String(targetVal).toLowerCase()
      case 'NOT_EQUALS':
        return String(currentVal).toLowerCase() !== String(targetVal).toLowerCase()
      case 'CONTAINS':
        return String(currentVal).toLowerCase().includes(String(targetVal).toLowerCase())
      case 'DOES_NOT_CONTAIN':
        return !String(currentVal).toLowerCase().includes(String(targetVal).toLowerCase())
      case 'GREATER_THAN':
        return Number(currentVal) > Number(targetVal)
      case 'LESS_THAN':
        return Number(currentVal) < Number(targetVal)
      case 'IS_EMPTY':
        return currentVal === '' || currentVal === null || currentVal === undefined
      case 'IS_NOT_EMPTY':
        return currentVal !== '' && currentVal !== null && currentVal !== undefined
      default:
        return true
    }
  }

  const matchMode = field.conditionMatch || 'ALL'
  const isMatch = matchMode === 'ALL'
    ? field.conditionRules.every(evaluateRule)
    : field.conditionRules.some(evaluateRule)

  const action = field.conditionAction || 'SHOW'
  if (action === 'SHOW') return isMatch
  if (action === 'HIDE') return !isMatch
  if (action === 'REMOVE') return !isMatch
  return true
}

function addRepeaterItem(key) {
  if (!previewRepeaters.value[key]) previewRepeaters.value[key] = []
  previewRepeaters.value[key].push({
    full_name: '',
    passport_number: '',
    nationality: '',
    relationship: 'Spouse',
  })
}

function removeRepeaterItem(key, idx) {
  if (!previewRepeaters.value[key]) return
  previewRepeaters.value[key].splice(idx, 1)
}

function onFileChange(e, key) {
  const file = e.target.files?.[0]
  if (file) {
    previewValues.value[key] = `[Uploaded File: ${file.name} (${Math.round(file.size / 1024)} KB)]`
  }
}

async function submitTestForm() {
  submitting.value = true
  try {
    const payload = computedFinalPayload.value
    const res = await axios.post(
      `${apiBase}/forms/${formId}/submit`,
      { data: payload, submittedBy: 'Live Test Fill' },
      { headers: getHeaders() }
    )

    alert(`✓ Form successfully submitted! Submission ID: #${res.data.submissionId}`)
    fetchSubmissions()
  } catch (err) {
    console.error('Submit form error:', err)
    alert('Failed to submit form.')
  } finally {
    submitting.value = false
  }
}

async function fetchSubmissions() {
  try {
    const res = await axios.get(`${apiBase}/forms/${formId}/submissions`, { headers: getHeaders() })
    submissions.value = res.data.submissions || []
  } catch (err) {
    console.warn('Submissions fetch error:', err)
  }
}

// ─── API Persistence ────────────────────────────────────────────────────────
async function loadForm() {
  try {
    const res = await axios.get(`${apiBase}/forms/${formId}`, { headers: getHeaders() })
    const f = res.data.form
    formName.value = f.name
    formDescription.value = f.description || ''

    if (f.schema_json) {
      const s = typeof f.schema_json === 'string' ? JSON.parse(f.schema_json) : f.schema_json
      formType.value = s.formType || 'NORMAL'

      if (s.sections && Array.isArray(s.sections)) {
        sections.value = s.sections
      } else if (s.fields && Array.isArray(s.fields)) {
        // Convert flat legacy fields into a section
        sections.value = [
          {
            id: 'sec_main',
            title: 'General Information',
            description: '',
            isRepeater: false,
            fields: s.fields,
          },
        ]
      }
    }

    // Load contract settings
    if (f.settings_json) {
      const settings = typeof f.settings_json === 'string' ? JSON.parse(f.settings_json) : f.settings_json
      formSettings.value = { ...formSettings.value, ...settings }
    }
    // Also sync formMode from db column if present
    if (f.form_mode) formSettings.value.formMode = f.form_mode

    if (sections.value.length > 0) {
      selectedSectionId.value = sections.value[0].id
      if (sections.value[0].fields?.length > 0) {
        selectedFieldId.value = sections.value[0].fields[0].id
      }
    }

    fetchSubmissions()
  } catch (err) {
    console.error('Failed to load form:', err)
  }
}

async function saveForm() {
  saving.value = true
  saveStatus.value = 'saving'

  try {
    // Keep formType in sync with formSettings.formMode for legacy compatibility
    formType.value = formSettings.value.formMode

    const schema = {
      formType: formType.value,
      sections: sections.value,
      // Legacy flat fields array for backward compatibility
      fields: sections.value.flatMap(s => s.fields || []),
    }

    await axios.put(
      `${apiBase}/forms/${formId}`,
      {
        name: formName.value.trim(),
        description: formDescription.value.trim(),
        form_mode: formSettings.value.formMode,
        settings_json: formSettings.value,
        schema,
      },
      { headers: getHeaders() }
    )

    saveStatus.value = 'saved'
    setTimeout(() => { if (saveStatus.value === 'saved') saveStatus.value = '' }, 3000)
  } catch (err) {
    console.error('Failed to save form:', err)
    alert('Failed to save form changes.')
    saveStatus.value = ''
  } finally {
    saving.value = false
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadForm()
})
</script>

<style scoped>
.studio-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow: hidden;
  background: var(--color-bg-base);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.studio-header {
  height: 60px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.form-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-title-input {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-base);
}

.form-title-input:focus {
  border-color: var(--color-border);
  background: var(--color-bg-base);
  outline: none;
}

.header-center {
  display: flex;
  align-items: center;
}

.view-tabs {
  display: flex;
  background: var(--color-bg-base);
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.studio-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

/* 3-Pane Designer */
.builder-three-pane {
  display: grid;
  grid-template-columns: 280px 1fr 340px;
  width: 100%;
  height: 100%;
}

.palette-sidebar {
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.palette-section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  font-weight: 700;
}

.palette-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.palette-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-base);
  cursor: pointer;
  text-align: left;
  font-size: 0.82rem;
  transition: all var(--transition-fast);
}

.palette-btn:hover {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.06);
}

.highlight-btn {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.05);
}

.p-icon {
  font-size: 1.1rem;
}

/* Canvas Area */
.canvas-area {
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f1f5f9;
}

.canvas-container {
  width: 100%;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-meta-box {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-headline-input {
  font-size: 1.4rem;
  font-weight: 700;
  border: 1px solid transparent;
  color: #0f172a;
  padding: 4px;
}

.form-headline-input:focus {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

.form-desc-input {
  font-size: 0.85rem;
  color: #64748b;
  border: 1px solid transparent;
  padding: 4px;
  resize: vertical;
}

.form-desc-input:focus {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

/* Sections */
.sections-stream {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  background: #ffffff;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-fast);
}

.section-card.selected-section {
  border-color: var(--color-primary);
}

.section-card.repeater-section {
  border-left: 5px solid var(--color-primary);
  background: #fcfcfd;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.sec-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.section-title-input {
  font-size: 1.1rem;
  font-weight: 700;
  border: 1px solid transparent;
  color: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
}

.section-title-input:focus {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

.repeater-info-banner {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 6px 12px;
  border-radius: 4px;
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #166534;
  margin-bottom: 14px;
}

.sec-actions {
  display: flex;
  gap: 4px;
}

.btn-tool-xs {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-tool-xs:hover {
  background: #e2e8f0;
}

.btn-tool-xs.btn-danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Fields Grid inside Section */
.fields-grid-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.field-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
}

.field-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
}

.field-card.selected {
  border-color: var(--color-primary);
  background: #ffffff;
  box-shadow: 0 0 0 1.5px var(--color-primary);
}

.w-full { width: 100%; }
.w-half { width: calc(50% - 6px); }
.w-third { width: calc(33.333% - 8px); }

.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.f-label-row {
  display: flex;
  gap: 4px;
}

.f-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
}

.f-badges {
  display: flex;
  gap: 4px;
}

.field-mock-box {
  margin: 4px 0;
}

.mock-input {
  width: 100%;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.mock-choices {
  display: flex;
  gap: 10px;
  font-size: 0.78rem;
  color: #64748b;
}

.mock-file {
  border: 1px dashed #cbd5e1;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
}

.mock-heading {
  font-size: 0.95rem;
  color: #0f172a;
}

.mock-divider hr {
  border: none;
  border-top: 1px solid #e2e8f0;
}

.field-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 6px;
}

.f-key {
  font-size: 0.7rem;
  color: #64748b;
}

.f-actions {
  display: flex;
  gap: 2px;
}

.btn-tool-mini {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  padding: 1px 4px;
  font-size: 0.65rem;
  cursor: pointer;
}

.empty-section-dropzone {
  width: 100%;
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Right Inspector */
.inspector-sidebar {
  background: var(--color-bg-card);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--space-4);
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-3);
}

.inspector-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-base);
}

.section-subtitle {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-row {
  display: flex;
  gap: 6px;
}

.option-input {
  font-size: 0.8rem;
  padding: 4px 8px;
}

.btn-remove-opt {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
}

.condition-builder-box {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-row-box {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inspector-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

/* Preview & Test Fill View */
.preview-mode-container {
  overflow-y: auto;
  padding: 30px 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  background: #e2e8f0;
}

.preview-card {
  width: 100%;
  max-width: 800px;
  background: #ffffff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-header {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 12px;
}

.preview-interactive-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section-box {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}

.p-sec-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.p-sec-desc {
  font-size: 0.82rem;
  margin-bottom: 12px;
}

.p-fields-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.preview-field-cell {
  box-sizing: border-box;
}

.radio-group-flex {
  display: flex;
  gap: 16px;
  padding: 6px 0;
}

.file-upload-box {
  border: 2px dashed #cbd5e1;
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  position: relative;
  cursor: pointer;
}

.file-upload-box input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.repeater-render-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.repeater-item-card {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 16px;
  background: #f8fafc;
}

.repeater-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
}

.preview-submit-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.payload-preview-box {
  background: #0f172a;
  color: #38bdf8;
  padding: 16px;
  border-radius: 6px;
}

.payload-preview-box h4 {
  color: #ffffff;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.json-code-box {
  font-size: 0.75rem;
  max-height: 250px;
  overflow-y: auto;
  font-family: monospace;
}

/* Submissions View */
.submissions-container {
  overflow-y: auto;
  padding: 24px;
  width: 100%;
}

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.json-mini-box {
  background: #f1f5f9;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  max-height: 180px;
  overflow-y: auto;
  margin-top: 4px;
}

/* ─── Contract Settings View ──────────────────────────────────────────────── */
.settings-view-container {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg-base);
}

.settings-page-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px;
}

.settings-page-header {
  margin-bottom: 28px;
}

.settings-page-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 700px) {
  .settings-grid { grid-template-columns: 1fr; }
}

.settings-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.settings-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.settings-icon {
  font-size: 1.1rem;
}

/* Radio Options */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.radio-option:hover {
  border-color: var(--color-primary);
}

.radio-option.active {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.06);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-icon {
  font-size: 1.2rem;
}

.radio-content strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text-primary);
}

.radio-content small {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.team-options {
  margin-top: 14px;
  padding: 14px;
  background: rgba(99,102,241,0.04);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

/* Expiry chip pills */
.expiry-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.expiry-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--color-border);
  background: transparent;
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}

.expiry-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.expiry-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* Toggle switch */
.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
}

.toggle-label strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text-primary);
}

.toggle-label small {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.toggle-switch {
  min-width: 42px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--color-primary);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.toggle-switch.on .toggle-knob {
  left: 21px;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Signature method cards */
.sig-method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.sig-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}

.sig-method-card input[type="checkbox"] {
  display: none;
}

.sig-method-card:hover {
  border-color: var(--color-primary);
}

.sig-method-card.active {
  border-color: var(--color-primary);
  background: rgba(99,102,241,0.06);
}

.sig-icon {
  font-size: 1.5rem;
}

.sig-method-card strong {
  font-size: 0.83rem;
  color: var(--color-text-primary);
}

.sig-method-card small {
  font-size: 0.73rem;
  color: var(--color-text-muted);
}

/* Settings form row */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.settings-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
