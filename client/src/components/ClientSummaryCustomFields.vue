<template>
  <div v-if="fields && fields.length" class="custom-fields-wrapper" :class="{ standalone: isStandalone }">
    <div v-if="sectionLabel && !isStandalone" class="cfg-header-banner">
      <div class="cfg-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2v20M2 12h20"/>
        </svg>
        <span>CUSTOM SPECIFICATIONS</span>
      </div>
      <span class="cfg-header-title">{{ sectionLabel }}</span>
    </div>

    <div class="cfg-grid" :class="{ 'grid-cards': isStandalone, 'grid-lines': !isStandalone }">
      <div
        v-for="field in fields"
        :key="field.key"
        class="cfg-field-unit"
        :class="{
          'full-width': field.type === 'textarea' || field.type === 'checkbox',
          'card-unit': isStandalone,
          'line-unit': !isStandalone
        }"
      >
        <!-- Standalone layout (Custom Sections) -->
        <template v-if="isStandalone">
          <div class="card-label-row">
            <label :for="`cf-${field.key}`" class="card-field-label">
              {{ field.label }}
              <span v-if="field.required" class="req-star" title="Required Field">*</span>
            </label>
            <span class="field-type-tag">{{ formatType(field.type) }}</span>
          </div>

          <!-- Text / Number / Date -->
          <input
            v-if="['text', 'number', 'date'].includes(field.type)"
            :id="`cf-${field.key}`"
            :type="field.type"
            v-model="formData[field.key]"
            class="form-control styled-input"
            :placeholder="field.placeholder || `Enter ${field.label}`"
            :required="field.required"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="`cf-${field.key}`"
            v-model="formData[field.key]"
            class="form-control styled-textarea"
            rows="3"
            :placeholder="field.placeholder || `Enter ${field.label} details...`"
            :required="field.required"
          ></textarea>

          <!-- Dropdown -->
          <select
            v-else-if="field.type === 'dropdown'"
            :id="`cf-${field.key}`"
            v-model="formData[field.key]"
            class="form-control styled-select"
            :required="field.required"
          >
            <option value="">-- Select an option --</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- Yes / No -->
          <div v-else-if="field.type === 'yes_no'" class="yn-toggle-group">
            <button
              type="button"
              class="yn-pill"
              :class="{ active: formData[field.key] === 'yes' }"
              @click="formData[field.key] = 'yes'"
            >
              <span class="yn-dot"></span>
              <span>Yes</span>
            </button>
            <button
              type="button"
              class="yn-pill"
              :class="{ active: formData[field.key] === 'no' }"
              @click="formData[field.key] = 'no'"
            >
              <span class="yn-dot"></span>
              <span>No</span>
            </button>
          </div>

          <!-- Checkbox -->
          <label v-else-if="field.type === 'checkbox'" class="cb-card-label">
            <input type="checkbox" v-model="formData[field.key]" class="custom-cb-input" />
            <span class="cb-custom-text">{{ field.help_text || field.label }}</span>
          </label>

          <p v-if="field.help_text && field.type !== 'checkbox'" class="card-field-help">
            {{ field.help_text }}
          </p>
        </template>

        <!-- Standard Page Inline Layout (replicates official 9-page form style) -->
        <template v-else>
          <div class="line-label-wrap">
            <span class="official-line-label">
              {{ field.label }}<span v-if="field.required" class="req-star">*</span>:
            </span>
          </div>

          <div class="line-input-wrap">
            <!-- Text / Number / Date -->
            <input
              v-if="['text', 'number', 'date'].includes(field.type)"
              :type="field.type"
              v-model="formData[field.key]"
              class="line-input official-input"
              :placeholder="field.placeholder || field.label"
            />

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.key]"
              class="line-input official-input"
              rows="2"
              :placeholder="field.placeholder || field.label"
            ></textarea>

            <!-- Dropdown -->
            <select
              v-else-if="field.type === 'dropdown'"
              v-model="formData[field.key]"
              class="line-input official-input select-line"
            >
              <option value="">-- Select --</option>
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- Yes / No -->
            <div v-else-if="field.type === 'yes_no'" class="yes-no-group">
              <label class="cb-label">
                <input type="radio" value="yes" v-model="formData[field.key]" />
                <span>Yes</span>
              </label>
              <label class="cb-label">
                <input type="radio" value="no" v-model="formData[field.key]" />
                <span>No</span>
              </label>
            </div>

            <!-- Single Checkbox -->
            <label v-else-if="field.type === 'checkbox'" class="cb-label">
              <input type="checkbox" v-model="formData[field.key]" />
              <span>{{ field.help_text || field.label }}</span>
            </label>

            <span v-if="field.help_text && field.type !== 'checkbox'" class="official-line-help">
              ({{ field.help_text }})
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  fields: {
    type: Array,
    default: () => []
  },
  formData: {
    type: Object,
    required: true
  },
  sectionLabel: {
    type: String,
    default: ''
  },
  isStandalone: {
    type: Boolean,
    default: false
  }
})

function formatType(t) {
  const map = {
    text: 'Text',
    textarea: 'Paragraph',
    number: 'Number',
    date: 'Date',
    dropdown: 'Select',
    yes_no: 'Yes / No',
    checkbox: 'Checkbox',
  }
  return map[t] || t
}
</script>

<style scoped>
.custom-fields-wrapper {
  margin: 18px 0 12px;
}

.custom-fields-wrapper.standalone {
  margin: 0;
}

/* Header Banner for standard pages */
.cfg-header-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f5f9;
  border-left: 4px solid #1e3a8a;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.cfg-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 3px;
  text-transform: uppercase;
}

.cfg-header-title {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
}

/* Grids */
.cfg-grid.grid-lines {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 24px;
}

.cfg-grid.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.cfg-field-unit.full-width {
  grid-column: 1 / -1;
}

/* Standard official line styling */
.line-unit {
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-bottom: 1px dotted #cbd5e1;
  padding-bottom: 4px;
}

.line-label-wrap {
  flex-shrink: 0;
}

.official-line-label {
  font-size: 11px;
  font-weight: 700;
  color: #0f172a;
}

.req-star {
  color: #ef4444;
  font-weight: 700;
  margin-left: 2px;
}

.line-input-wrap {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.official-input {
  width: 100%;
  border: none !important;
  border-bottom: 1px solid #000000 !important;
  background: transparent !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 2px 4px !important;
  border-radius: 0 !important;
  color: #0f172a !important;
}

.select-line {
  cursor: pointer;
  height: 24px;
}

.official-line-help {
  font-size: 10px;
  color: #64748b;
  font-style: italic;
  white-space: nowrap;
}

/* Standalone Card styling */
.card-unit {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;
}

.card-unit:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.card-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-field-label {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.field-type-tag {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: capitalize;
}

.styled-input,
.styled-textarea,
.styled-select {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #0f172a;
  transition: border-color 0.2s ease;
}

.styled-input:focus,
.styled-textarea:focus,
.styled-select:focus {
  background: #ffffff;
  border-color: #2563eb;
  outline: none;
}

.card-field-help {
  font-size: 10.5px;
  color: #64748b;
  margin: 6px 0 0 0;
}

/* Yes / No Toggle in cards */
.yn-toggle-group {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.yn-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.yn-pill:hover {
  background: #f1f5f9;
}

.yn-pill.active {
  background: #1e3a8a;
  border-color: #1e3a8a;
  color: #ffffff;
}

.yn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Checkbox pill in cards */
.cb-card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 0;
}

.custom-cb-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1e3a8a;
}

.cb-custom-text {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

/* Yes-no radio group for line inputs */
.yes-no-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cb-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
}

@media (max-width: 768px) {
  .cfg-grid.grid-lines,
  .cfg-grid.grid-cards {
    grid-template-columns: 1fr;
  }
}
</style>
