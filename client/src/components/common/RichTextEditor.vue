<template>
  <div class="rich-text-editor-container" :class="{ 'is-focused': isFocused, 'source-mode': showSource }">
    <!-- Quick Preset Templates Bar -->
    <div class="rte-presets-bar">
      <span class="presets-label">⚡ Quick Presets:</span>
      <button type="button" class="preset-chip" @click="applyPreset('milestone_50_50')" title="Insert standard 50/50 payment milestone">
        📋 50/50 Milestone
      </button>
      <button type="button" class="preset-chip" @click="applyPreset('milestone_3_stage')" title="Insert 3-stage milestone (40/30/30)">
        💳 3-Stage Schedule
      </button>
      <button type="button" class="preset-chip" @click="applyPreset('fee_table')" title="Insert structured commercial fee table">
        📊 Fee Breakdown Table
      </button>
      <button type="button" class="preset-chip" @click="applyPreset('lump_sum')" title="Insert 100% upfront with exclusive discount">
        💰 Lump Sum & Discount
      </button>
      <button type="button" class="preset-chip preset-chip-danger" @click="confirmClear" title="Clear all editor content">
        🧹 Reset
      </button>
    </div>

    <!-- Main Toolbar -->
    <div class="rte-toolbar" role="toolbar" aria-label="Formatting options">
      <!-- History Group -->
      <div class="toolbar-group">
        <button type="button" class="tb-btn" @click="exec('undo')" title="Undo (Ctrl+Z)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('redo')" title="Redo (Ctrl+Y)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Block Format Dropdown -->
      <div class="toolbar-group">
        <select class="tb-select" :value="currentBlockFormat" @change="setBlockFormat($event.target.value)" title="Text Paragraph / Heading style">
          <option value="p">Normal Text</option>
          <option value="h2">Heading 2 (Section)</option>
          <option value="h3">Heading 3 (Sub-clause)</option>
          <option value="h4">Heading 4 (Minor title)</option>
          <option value="blockquote">Callout / Quote</option>
          <option value="pre">Code / Monospace</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Inline Text Styles -->
      <div class="toolbar-group">
        <button type="button" class="tb-btn" :class="{ active: isFormatActive('bold') }" @click="exec('bold')" title="Bold (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button type="button" class="tb-btn" :class="{ active: isFormatActive('italic') }" @click="exec('italic')" title="Italic (Ctrl+I)">
          <em>I</em>
        </button>
        <button type="button" class="tb-btn" :class="{ active: isFormatActive('underline') }" @click="exec('underline')" title="Underline (Ctrl+U)">
          <u>U</u>
        </button>
        <button type="button" class="tb-btn" :class="{ active: isFormatActive('strikeThrough') }" @click="exec('strikeThrough')" title="Strikethrough">
          <s>S</s>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Color Controls -->
      <div class="toolbar-group color-group">
        <!-- Text Color -->
        <div class="color-picker-wrap" title="Text Color">
          <span class="color-indicator-letter">A</span>
          <input
            type="color"
            class="tb-color-input"
            v-model="textColor"
            @change="exec('foreColor', textColor)"
            title="Choose text color"
          />
        </div>

        <!-- Highlight Color -->
        <div class="color-picker-wrap" title="Highlight / Background Color">
          <span class="color-indicator-hl">🖍️</span>
          <input
            type="color"
            class="tb-color-input"
            v-model="highlightColor"
            @change="exec('hiliteColor', highlightColor)"
            title="Choose background highlight"
          />
        </div>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Alignment Controls -->
      <div class="toolbar-group">
        <button type="button" class="tb-btn" @click="exec('justifyLeft')" title="Align Left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('justifyCenter')" title="Align Center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('justifyRight')" title="Align Right">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('justifyFull')" title="Justify">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Lists & Indent -->
      <div class="toolbar-group">
        <button type="button" class="tb-btn" @click="exec('insertUnorderedList')" title="Bullet List">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('insertOrderedList')" title="Numbered List">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('outdent')" title="Outdent">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/></svg>
        </button>
        <button type="button" class="tb-btn" @click="exec('indent')" title="Indent">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="13 8 17 12 13 16"/><line x1="3" y1="12" x2="13" y2="12"/><line x1="3" y1="6" x2="13" y2="6"/><line x1="3" y1="18" x2="13" y2="18"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Structural Elements: Table & Horizontal Line -->
      <div class="toolbar-group">
        <button type="button" class="tb-btn tb-btn-badge" @click="insertTable" title="Insert 3-column Fee Table">
          <span>📊</span> Table
        </button>
        <button type="button" class="tb-btn" @click="addTableRow" title="Add Row to Current Table">
          <span>➕Row</span>
        </button>
        <button type="button" class="tb-btn" @click="exec('insertHorizontalRule')" title="Insert Horizontal Rule Line">
          <span>―</span>
        </button>
        <button type="button" class="tb-btn" @click="exec('removeFormat')" title="Clear Formatting">
          <span>🧹</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- HTML / Source Toggle -->
      <div class="toolbar-group toolbar-group-end">
        <button
          type="button"
          class="tb-btn tb-btn-toggle"
          :class="{ active: showSource }"
          @click="toggleSource"
          title="Toggle Raw HTML Source Code"
        >
          <span>&lt;&gt; HTML</span>
        </button>
      </div>
    </div>

    <!-- Editable Canvas Area -->
    <div class="rte-canvas-wrap">
      <!-- WYSIWYG Contenteditable -->
      <div
        v-show="!showSource"
        ref="editorRef"
        class="rte-editor-area"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="onEditorInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown="onKeydown"
      ></div>

      <!-- Raw HTML Source Editor -->
      <textarea
        v-show="showSource"
        ref="sourceRef"
        class="rte-source-area"
        :value="modelValue"
        @input="onSourceInput"
        placeholder="Enter raw HTML code here…"
      ></textarea>
    </div>

    <!-- Footer Status Bar -->
    <div class="rte-statusbar">
      <div class="statusbar-left">
        <span class="statusbar-item">
          <strong>Mode:</strong> {{ showSource ? 'Raw HTML Source' : 'Visual WYSIWYG' }}
        </span>
        <span class="statusbar-sep">•</span>
        <span class="statusbar-item">
          {{ wordCount }} words | {{ charCount }} characters
        </span>
      </div>
      <div class="statusbar-right">
        <span class="badge-hint">✨ Changes automatically sync to contract terms &amp; PDF</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Write your comprehensive commercial terms, fee schedule, and milestone breakup here…',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = ref(null)
const sourceRef = ref(null)
const isFocused = ref(false)
const showSource = ref(false)
const textColor = ref('#0f172a')
const highlightColor = ref('#fef08a')
const currentBlockFormat = ref('p')

// Word and character counting
const charCount = computed(() => {
  const text = (props.modelValue || '').replace(/<[^>]*>/g, '').trim()
  return text.length
})

const wordCount = computed(() => {
  const text = (props.modelValue || '').replace(/<[^>]*>/g, '').trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
})

// Sync external modelValue into contenteditable
watch(
  () => props.modelValue,
  (newVal) => {
    if (editorRef.value && !showSource.value) {
      if (editorRef.value.innerHTML !== newVal) {
        editorRef.value.innerHTML = newVal || ''
      }
    }
  }
)

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || ''
  }
})

function onEditorInput() {
  if (!editorRef.value) return
  const html = editorRef.value.innerHTML
  emit('update:modelValue', html)
  emit('change', html)
}

function onSourceInput(e) {
  const val = e.target.value
  emit('update:modelValue', val)
  emit('change', val)
  if (editorRef.value) {
    editorRef.value.innerHTML = val
  }
}

function toggleSource() {
  showSource.value = !showSource.value
  if (!showSource.value && editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || ''
  }
}

function exec(cmd, arg = null) {
  if (showSource.value) return
  document.execCommand(cmd, false, arg)
  if (editorRef.value) {
    editorRef.value.focus()
  }
  onEditorInput()
}

function setBlockFormat(tag) {
  currentBlockFormat.value = tag
  exec('formatBlock', `<${tag}>`)
}

function isFormatActive(cmd) {
  try {
    return document.queryCommandState(cmd)
  } catch {
    return false
  }
}

function onKeydown(e) {
  // Allow Tab indentation inside lists/tables
  if (e.key === 'Tab') {
    e.preventDefault()
    if (e.shiftKey) {
      exec('outdent')
    } else {
      exec('indent')
    }
  }
}

// ─── Table Insertion ─────────────────────────────────────────────────────────
function insertTable() {
  const tableHtml = `
    <table class="rte-styled-table" style="width:100%; border-collapse:collapse; margin:14px 0; border:1px solid #cbd5e1;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:#0f172a;">Milestone / Item</th>
          <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:#0f172a;">Percentage / Terms</th>
          <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:right; font-weight:700; color:#0f172a;">Amount (EUR / USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 14px; border:1px solid #cbd5e1;">1. Initial Advance Deposit</td>
          <td style="padding:8px 14px; border:1px solid #cbd5e1;">Upon agreement execution</td>
          <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right;"><strong>10,000</strong></td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:8px 14px; border:1px solid #cbd5e1;">2. Final Balance Payment</td>
          <td style="padding:8px 14px; border:1px solid #cbd5e1;">Upon visa issuance / file approval</td>
          <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right;"><strong>10,000</strong></td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background:#e2e8f0; font-weight:bold;">
          <td colspan="2" style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right;">Total Agreed Consideration:</td>
          <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right; color:#1e3a8a;"><strong>20,000</strong></td>
        </tr>
      </tfoot>
    </table>
    <p><br></p>
  `
  exec('insertHTML', tableHtml)
}

function addTableRow() {
  if (!editorRef.value) return
  const tables = editorRef.value.querySelectorAll('table')
  if (!tables.length) {
    insertTable()
    return
  }
  const lastTable = tables[tables.length - 1]
  const tbody = lastTable.querySelector('tbody') || lastTable
  const colCount = (lastTable.querySelector('tr')?.children?.length) || 3

  const newRow = document.createElement('tr')
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td')
    td.style.padding = '8px 14px'
    td.style.border = '1px solid #cbd5e1'
    td.innerHTML = i === colCount - 1 ? '<strong>0.00</strong>' : 'New Milestone Item'
    if (i === colCount - 1) td.style.textAlign = 'right'
    newRow.appendChild(td)
  }
  tbody.appendChild(newRow)
  onEditorInput()
}

// ─── Quick Presets ───────────────────────────────────────────────────────────
function applyPreset(type) {
  let content = ''
  if (type === 'milestone_50_50') {
    content = `
      <p><strong>Total Professional Fees:</strong> 20,000 EUR</p>
      <p><strong>Amount after Exclusive Discount:</strong> 15,000 EUR</p>
      <p><strong>Agreed Payment Milestones:</strong></p>
      <ul>
        <li><strong>Stage 1 (50% Advance):</strong> 7,500 EUR payable immediately upon contract signing to initiate document processing &amp; legal preparation.</li>
        <li><strong>Stage 2 (50% Balance):</strong> 7,500 EUR payable within twenty-four (24) hours following formal issuance/approval from the immigration authority.</li>
      </ul>
      <p><em>* All fees are net of bank wire charges and third-party governmental application levies.</em></p>
    `
  } else if (type === 'milestone_3_stage') {
    content = `
      <p><strong>Total Program Advisory Fee:</strong> 25,000 USD / EUR</p>
      <p><strong>Structured 3-Stage Milestone Plan:</strong></p>
      <ol>
        <li><strong>Milestone 1 — Initial Retainer (40%):</strong> 10,000 EUR upon signing for client due diligence &amp; dossier compilation.</li>
        <li><strong>Milestone 2 — File Lodgement (30%):</strong> 7,500 EUR upon formal submission of the application to immigration authorities.</li>
        <li><strong>Milestone 3 — Visa Issuance (30%):</strong> 7,500 EUR upon receipt of official approval decision / residence permit.</li>
      </ol>
      <p><strong>Payment Mode:</strong> International Bank Wire Transfer / Credit Card.</p>
    `
  } else if (type === 'fee_table') {
    content = `
      <p><strong>Schedule Three: Commercial Terms &amp; Professional Charges</strong></p>
      <table class="rte-styled-table" style="width:100%; border-collapse:collapse; margin:12px 0; border:1px solid #cbd5e1;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:left;">Description</th>
            <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:center;">Due Timeline</th>
            <th style="padding:10px 14px; border:1px solid #cbd5e1; text-align:right;">Amount (EUR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 14px; border:1px solid #cbd5e1;">Standard Legal Advisory &amp; Processing</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:center;">Upon Signing</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right;">12,000</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:8px 14px; border:1px solid #cbd5e1;">Exclusive Promotional Discount</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:center;">Immediate deduction</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right; color:#dc2626;">- 2,000</td>
          </tr>
          <tr>
            <td style="padding:8px 14px; border:1px solid #cbd5e1;">Government Submission &amp; Final Approval</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:center;">On Approval</td>
            <td style="padding:8px 14px; border:1px solid #cbd5e1; text-align:right;">5,000</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#e2e8f0; font-weight:bold;">
            <td colspan="2" style="padding:10px 14px; border:1px solid #cbd5e1; text-align:right;">Net Payable Consideration:</td>
            <td style="padding:10px 14px; border:1px solid #cbd5e1; text-align:right; color:#1e3a8a; font-size:1.05rem;"><strong>15,000 EUR</strong></td>
          </tr>
        </tfoot>
      </table>
      <p><em>Agreed fees are subject to 360GI standard terms and conditions.</em></p>
    `
  } else if (type === 'lump_sum') {
    content = `
      <p><strong>Total Agreed Professional Charges:</strong> 18,000 EUR</p>
      <p><strong>Full Upfront Settlement Discount:</strong> - 3,000 EUR</p>
      <p><strong>Net Payable Consideration:</strong> <strong>15,000 EUR (100% Upfront)</strong></p>
      <p><strong>Payment Mode:</strong> Direct Corporate Bank Transfer / Swift.</p>
      <p><em>Payment is due in full within three (3) business days of signing to initiate priority fast-track file preparation.</em></p>
    `
  }

  if (editorRef.value) {
    editorRef.value.innerHTML = content
  }
  emit('update:modelValue', content)
  emit('change', content)
}

function confirmClear() {
  if (confirm('Clear all commercial terms and fee content in the editor?')) {
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('update:modelValue', '')
    emit('change', '')
  }
}
</script>

<style scoped>
.rich-text-editor-container {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.rich-text-editor-container.is-focused {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* ── Quick Presets Bar ── */
.rte-presets-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  flex-wrap: wrap;
}

.presets-label {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  white-space: nowrap;
}

.preset-chip {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.preset-chip:hover {
  background: #eef2ff;
  border-color: #6366f1;
  color: #4338ca;
  transform: translateY(-1px);
}

.preset-chip-danger:hover {
  background: #fef2f2;
  border-color: #f87171;
  color: #dc2626;
}

/* ── Main Toolbar ── */
.rte-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-bottom: 1px solid #cbd5e1;
}

.toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.toolbar-group-end {
  margin-left: auto;
}

.toolbar-divider {
  width: 1px;
  height: 22px;
  background: #cbd5e1;
  margin: 0 4px;
}

.tb-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  transition: all 0.15s ease;
}

.tb-btn:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.tb-btn.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4338ca;
}

.tb-btn-badge {
  padding: 4px 10px;
  font-size: 0.78rem;
  background: #ffffff;
  border-color: #cbd5e1;
  gap: 4px;
}

.tb-btn-toggle {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-family: monospace;
  font-size: 0.76rem;
  padding: 4px 10px;
}

.tb-btn-toggle.active {
  background: #0f172a;
  color: #38bdf8;
  border-color: #0f172a;
}

.tb-select {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  outline: none;
}

.tb-select:focus {
  border-color: #4f46e5;
}

/* Color Pickers */
.color-picker-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  overflow: hidden;
}

.color-indicator-letter {
  font-weight: 800;
  font-size: 0.85rem;
  color: #0f172a;
  border-bottom: 3px solid currentColor;
}

.color-indicator-hl {
  font-size: 0.8rem;
}

.tb-color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* ── Canvas Area ── */
.rte-canvas-wrap {
  position: relative;
  min-height: 240px;
  background: #ffffff;
}

.rte-editor-area {
  min-height: 240px;
  max-height: 480px;
  overflow-y: auto;
  padding: 16px 20px;
  outline: none;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #0f172a;
  box-sizing: border-box;
}

.rte-editor-area:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  font-style: italic;
  pointer-events: none;
  display: block;
}

.rte-source-area {
  width: 100%;
  min-height: 240px;
  max-height: 480px;
  padding: 16px 20px;
  background: #0f172a;
  color: #38bdf8;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.88rem;
  line-height: 1.5;
  border: none;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

/* Deep Styles for Contenteditable Elements */
.rte-editor-area :deep(h2) {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 12px 0 6px 0;
  border-bottom: 1.5px solid #e2e8f0;
  padding-bottom: 4px;
}

.rte-editor-area :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 10px 0 4px 0;
}

.rte-editor-area :deep(p) {
  margin: 0 0 8px 0;
}

.rte-editor-area :deep(ul),
.rte-editor-area :deep(ol) {
  padding-left: 24px;
  margin: 6px 0 10px 0;
}

.rte-editor-area :deep(li) {
  margin-bottom: 4px;
}

.rte-editor-area :deep(blockquote) {
  margin: 10px 0;
  padding: 8px 16px;
  border-left: 4px solid #6366f1;
  background: #f8fafc;
  color: #475569;
  font-style: italic;
  border-radius: 0 6px 6px 0;
}

.rte-editor-area :deep(hr) {
  border: none;
  border-top: 1px solid #cbd5e1;
  margin: 16px 0;
}

.rte-editor-area :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  border: 1px solid #cbd5e1;
}

.rte-editor-area :deep(th),
.rte-editor-area :deep(td) {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
}

.rte-editor-area :deep(th) {
  background: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
}

/* ── Status Bar ── */
.rte-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.76rem;
  color: #64748b;
}

.statusbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.statusbar-sep {
  color: #cbd5e1;
}

.badge-hint {
  color: #4f46e5;
  font-weight: 600;
}
</style>
