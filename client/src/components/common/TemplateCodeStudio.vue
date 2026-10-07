<template>
  <div
    class="template-code-studio"
    :class="{
      'is-fullscreen': isFullscreen,
      [`view-mode-${viewMode}`]: true
    }"
  >
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 1. TOP STUDIO CONTROL BAR                                              -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <header class="tcs-top-bar">
      <!-- Left: Title & File Subtabs -->
      <div class="tcs-top-left">
        <div class="tcs-branding">
          <div class="tcs-brand-badge">
            <span class="live-pulse-dot" :class="{ syncing: isSyncing }"></span>
            <span>Studio</span>
          </div>
          <div class="tcs-title-group">
            <span class="tcs-title-text">{{ isFullscreen ? 'Zen Studio' : 'Source Code Studio' }}</span>
            <span class="tcs-subtitle-text" v-if="!isFullscreen">Paired-Table Engine Fidelity</span>
          </div>
        </div>

        <div class="tcs-file-tabs" role="tablist">
          <button
            type="button"
            class="tcs-file-tab"
            :class="{ active: currentTab === 'html' }"
            @click="setTab('html')"
            title="Switch to HTML markup (Alt+1)"
          >
            <span class="tab-icon">📄</span>
            <span class="tab-label">HTML Markup</span>
            <span class="tab-stat-pill">{{ (localHtml || '').length.toLocaleString() }} c</span>
          </button>

          <button
            type="button"
            class="tcs-file-tab"
            :class="{ active: currentTab === 'css' }"
            @click="setTab('css')"
            title="Switch to CSS stylesheet (Alt+2)"
          >
            <span class="tab-icon">🎨</span>
            <span class="tab-label">CSS Styles</span>
            <span class="tab-stat-pill">{{ (localCss || '').length.toLocaleString() }} c</span>
          </button>
        </div>
      </div>

      <!-- Center: Split / View Mode Toggle -->
      <div class="tcs-top-center">
        <div class="tcs-view-mode-pill" role="group" aria-label="Layout mode">
          <button
            type="button"
            class="tcs-mode-btn"
            :class="{ active: viewMode === 'split' }"
            @click="viewMode = 'split'"
            title="Split View: Code + Live Front View side-by-side"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
            <span>Split View</span>
          </button>

          <button
            type="button"
            class="tcs-mode-btn"
            :class="{ active: viewMode === 'code' }"
            @click="viewMode = 'code'"
            title="Code Editor Only"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>Code Only</span>
          </button>

          <button
            type="button"
            class="tcs-mode-btn"
            :class="{ active: viewMode === 'preview' }"
            @click="viewMode = 'preview'"
            title="Front View (Live Preview) Only"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Front View</span>
          </button>
        </div>
      </div>

      <!-- Right: Actions & Fullscreen Toggle -->
      <div class="tcs-top-right">
        <!-- Search Toggle -->
        <button
          type="button"
          class="tcs-action-btn"
          :class="{ active: showSearchBar }"
          @click="toggleSearch"
          title="Find & Replace in Code (Ctrl+F)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="btn-text-desktop">Find</span>
        </button>

        <!-- Format Code -->
        <button
          type="button"
          class="tcs-action-btn"
          @click="formatCurrentCode"
          title="Auto-format and beautify code indentation"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
            <polyline points="7.5 19.79 7.5 14.6 3 12"/>
            <polyline points="21 12 16.5 14.6 16.5 19.79"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span class="btn-text-desktop">Beautify</span>
        </button>

        <!-- Load Cyprus Preset -->
        <button
          type="button"
          class="tcs-action-btn"
          @click="$emit('loadCyprusPreset')"
          title="Load official Cyprus 12-page bilingual paired-table preset"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span class="btn-text-desktop">Cyprus Preset</span>
        </button>

        <!-- Copy Code -->
        <button
          type="button"
          class="tcs-action-btn"
          @click="copyActiveCode"
          title="Copy current active code to clipboard"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span class="btn-text-desktop">Copy</span>
        </button>

        <!-- Save Button -->
        <button
          type="button"
          class="tcs-action-btn tcs-btn-save"
          @click="$emit('save')"
          title="Save Template (Ctrl+S)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Save</span>
        </button>

        <!-- FULLSCREEN / ZEN TOGGLE BUTTON -->
        <button
          type="button"
          class="tcs-fullscreen-btn"
          :class="{ 'is-active': isFullscreen }"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Full Screen (Esc)' : 'Full Screen Distraction-Free View (Alt+F)'"
        >
          <template v-if="!isFullscreen">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span>Full Screen</span>
          </template>
          <template v-else>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
            <span>Exit Full Screen</span>
          </template>
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 2. QUICK VARIABLE TOKENS & EDITOR SETTINGS RIBBON                      -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="tcs-ribbon-bar">
      <!-- Left: Token Inserter -->
      <div class="tcs-ribbon-tokens">
        <div class="tcs-ribbon-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>Insert Token:</span>
        </div>

        <div class="tcs-tokens-scroll-list">
          <button
            v-for="tok in displayTokens"
            :key="tok"
            type="button"
            class="tcs-token-chip"
            @click="insertToken(tok)"
            :title="`Insert {{${tok}}} at cursor`"
          >
            + &#123;&#123;{{ tok }}&#125;&#125;
          </button>
        </div>

        <button
          type="button"
          class="tcs-more-tokens-btn"
          @click="showTokenModal = true"
          title="Browse all available dynamic contract tokens"
        >
          <span>All Tokens ({{ allAvailableTokens.length }}) ▾</span>
        </button>
      </div>

      <!-- Right: Editor Ergonomics controls -->
      <div class="tcs-ribbon-settings">
        <!-- Font Size Selector -->
        <div class="tcs-setting-item" title="Editor Font Size">
          <span class="setting-icon">Aa</span>
          <select v-model="fontSize" class="tcs-setting-select">
            <option value="12">12px</option>
            <option value="13">13px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
          </select>
        </div>

        <!-- Word Wrap Toggle -->
        <button
          type="button"
          class="tcs-setting-btn"
          :class="{ active: wordWrap }"
          @click="wordWrap = !wordWrap"
          :title="wordWrap ? 'Disable Word Wrap (Strict Line Alignment)' : 'Enable Word Wrap'"
        >
          <span>Wrap {{ wordWrap ? 'ON' : 'OFF' }}</span>
        </button>

        <!-- Undo / Redo -->
        <div class="tcs-history-btns">
          <button
            type="button"
            class="tcs-setting-icon-btn"
            :disabled="!canUndo"
            @click="undo"
            title="Undo (Ctrl+Z)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </button>
          <button
            type="button"
            class="tcs-setting-icon-btn"
            :disabled="!canRedo"
            @click="redo"
            title="Redo (Ctrl+Y)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 3. IN-EDITOR SEARCH & REPLACE DRAWER                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <transition name="tcs-slide-down">
      <div v-if="showSearchBar" class="tcs-search-bar">
        <div class="tcs-search-fields">
          <div class="search-input-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref="searchInputRef"
              type="text"
              v-model="searchQuery"
              @keydown.enter.prevent="findNext"
              @keydown.esc="showSearchBar = false"
              placeholder="Find in code..."
              class="tcs-search-input"
            />
            <span class="search-count" v-if="searchQuery">
              {{ searchMatchCount > 0 ? `${currentMatchIndex + 1} of ${searchMatchCount}` : 'No matches' }}
            </span>
          </div>

          <div class="replace-input-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <input
              type="text"
              v-model="replaceQuery"
              @keydown.enter.prevent="replaceCurrent"
              @keydown.esc="showSearchBar = false"
              placeholder="Replace with..."
              class="tcs-search-input"
            />
          </div>
        </div>

        <div class="tcs-search-actions">
          <button type="button" class="btn-search-nav" @click="findPrev" title="Previous match (Shift+Enter)">↑</button>
          <button type="button" class="btn-search-nav" @click="findNext" title="Next match (Enter)">↓</button>
          <button type="button" class="btn-search-action" @click="replaceCurrent" :disabled="searchMatchCount === 0">Replace</button>
          <button type="button" class="btn-search-action" @click="replaceAll" :disabled="searchMatchCount === 0">All</button>
          <button type="button" class="btn-search-close" @click="showSearchBar = false" title="Close (Esc)">✕</button>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 4. MAIN SPLIT WORKSPACE (CODE EDITOR + LIVE FRONT VIEW PREVIEW)        -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div
      class="tcs-workspace-grid"
      :class="{ 'is-dragging': isDraggingSplitter }"
      :style="workspaceGridStyle"
    >
      <!-- Shield during drag to prevent iframe stealing mouse events -->
      <div v-if="isDraggingSplitter" class="tcs-drag-shield"></div>

      <!-- ─── PANE A: CODE EDITOR ─────────────────────────────────────────── -->
      <section v-show="viewMode !== 'preview'" class="tcs-editor-pane">
        <!-- Editor Status Sub-Header -->
        <div class="tcs-pane-header">
          <div class="pane-header-left">
            <span class="pane-lang-badge">{{ currentTab === 'html' ? 'HTML5 Template' : 'CSS3 Rules' }}</span>
            <span class="pane-encoding">UTF-8</span>
            <span class="pane-save-status" :class="{ synced: !hasUnsavedChanges }">
              ● {{ hasUnsavedChanges ? 'Unsaved changes' : 'Synchronized' }}
            </span>
          </div>

          <div class="pane-header-right">
            <span class="cursor-coords">Ln {{ cursorInfo.line }}, Col {{ cursorInfo.col }}</span>
            <span v-if="cursorInfo.selected > 0" class="cursor-selected">({{ cursorInfo.selected }} selected)</span>
            <span class="line-count-badge">{{ activeLinesCount }} lines</span>
          </div>
        </div>

        <!-- Code Workspace Area with Line Numbers Gutter -->
        <div
          class="tcs-code-wrapper"
          :style="{
            '--editor-font-size': `${fontSize}px`,
            '--editor-line-height': `${editorLineHeight}px`
          }"
        >
          <!-- Line Numbers Gutter -->
          <div
            ref="gutterRef"
            class="tcs-gutter"
            aria-hidden="true"
          >
            <div
              class="tcs-gutter-inner"
              :style="{ transform: `translateY(-${editorScrollTop}px)` }"
            >
              <div
                v-for="lineNum in activeLinesCount"
                :key="lineNum"
                class="gutter-line-num"
                :class="{ active: lineNum === cursorInfo.line }"
                @click="jumpToLine(lineNum)"
              >
                {{ lineNum }}
              </div>
            </div>
          </div>

          <!-- Active Textarea -->
          <textarea
            ref="textareaRef"
            v-model="activeCode"
            class="tcs-code-textarea"
            :class="{ 'no-wrap': !wordWrap }"
            :placeholder="currentTab === 'html' ? 'Paste or write HTML document markup here...' : 'Paste or write CSS rules here...'"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            @scroll="handleEditorScroll"
            @keydown="handleKeyDown"
            @keyup="updateCursorInfo"
            @click="updateCursorInfo"
            @select="updateCursorInfo"
          ></textarea>
        </div>

        <!-- Bottom Editor Footer Bar -->
        <footer class="tcs-editor-footer">
          <div class="footer-left">
            <span>{{ currentTab === 'html' ? 'Paired-Table A4 Schema' : 'Scoped Print & Web Stylesheet' }}</span>
            <span class="footer-dot">•</span>
            <span>Tab: 2 spaces</span>
            <span class="footer-dot">•</span>
            <span>Ctrl+S Save</span>
          </div>
          <div class="footer-right">
            <span>{{ activeCodeLength.toLocaleString() }} chars</span>
            <span class="footer-dot">•</span>
            <span>{{ (activeCodeLength / 1024).toFixed(1) }} KB</span>
          </div>
        </footer>
      </section>

      <!-- ─── PANE SPLITTER DRAGGABLE DIVIDER (Split mode only) ──────────── -->
      <div
        v-if="viewMode === 'split'"
        class="tcs-splitter-handle"
        @mousedown="startSplitDrag"
        title="Drag to resize Editor / Preview split ratio"
      >
        <div class="splitter-grip"></div>
      </div>

      <!-- ─── PANE B: LIVE FRONT VIEW (REAL-TIME DOCUMENT PREVIEW) ────────── -->
      <section v-show="viewMode !== 'code'" class="tcs-preview-pane">
        <!-- Preview Control Header -->
        <div class="tcs-preview-header">
          <div class="preview-header-left">
            <div class="preview-title-badge">
              <span class="badge-dot"></span>
              <span>Front View</span>
            </div>
            <span class="preview-doc-title">{{ title || 'Legal Document Preview' }}</span>
          </div>

          <div class="preview-header-center">
            <!-- Data Mode: Sample Client Data vs Highlighted Tokens -->
            <div class="preview-data-switch">
              <button
                type="button"
                class="data-switch-btn"
                :class="{ active: previewDataMode === 'sample' }"
                @click="previewDataMode = 'sample'"
                title="Preview with realistic sample client data"
              >
                Sample Data
              </button>
              <button
                type="button"
                class="data-switch-btn"
                :class="{ active: previewDataMode === 'tokens' }"
                @click="previewDataMode = 'tokens'"
                title="Highlight token tags inside the document"
              >
                Tokens
              </button>
            </div>
          </div>

          <div class="preview-header-right">
            <!-- Zoom / Scale Selector -->
            <div class="preview-zoom-group">
              <span class="zoom-label">Zoom:</span>
              <select v-model="previewZoom" class="preview-zoom-select" title="Preview Scale">
                <option value="fit">Fit Page</option>
                <option value="0.5">50%</option>
                <option value="0.65">65%</option>
                <option value="0.75">75%</option>
                <option value="0.85">85%</option>
                <option value="1.0">100%</option>
                <option value="1.2">120%</option>
              </select>
            </div>

            <!-- Reload Preview Button -->
            <button
              type="button"
              class="preview-action-btn"
              @click="forceReloadPreview"
              title="Force reload preview iframe"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span>Reload</span>
            </button>

            <!-- Print / PDF Test -->
            <button
              type="button"
              class="preview-action-btn"
              @click="printPreview"
              title="Print or test clean PDF export"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>Print</span>
            </button>
          </div>
        </div>

        <!-- Live Preview Iframe Container -->
        <div class="tcs-preview-viewport" ref="previewViewportRef">
          <div
            class="tcs-preview-scale-wrapper"
            :style="previewScaleStyle"
          >
            <iframe
              ref="previewIframeRef"
              class="tcs-preview-iframe"
              :srcdoc="previewSrcDoc"
              title="Live A4 Front View Document Preview"
            ></iframe>
          </div>
        </div>
      </section>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 5. ALL TOKENS MODAL                                                    -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="showTokenModal" class="tcs-modal-backdrop" @click.self="showTokenModal = false">
      <div class="tcs-token-modal glass-card">
        <div class="modal-head">
          <div class="modal-title-wrap">
            <span class="badge badge-primary badge-sm">Dynamic Merge Tags</span>
            <h3 style="margin: 4px 0 0; font-size: 1.1rem; color: #f8fafc;">Insert Contract Tokens</h3>
            <p style="margin: 2px 0 0; color: #94a3b8; font-size: 0.8rem;">
              Click any token to insert at cursor position into your HTML or CSS template.
            </p>
          </div>
          <button type="button" class="modal-close-btn" @click="showTokenModal = false">✕</button>
        </div>

        <!-- Token Search -->
        <div class="modal-search-box">
          <input
            type="text"
            v-model="tokenSearchQuery"
            placeholder="Search tokens (e.g. name, passport, fee, date)..."
            class="modal-search-input"
          />
        </div>

        <!-- Grouped Tokens List -->
        <div class="modal-tokens-groups">
          <div
            v-for="group in filteredTokenGroups"
            :key="group.title"
            class="token-group-section"
          >
            <div class="group-title-label">
              <span>{{ group.icon }} {{ group.title }}</span>
            </div>
            <div class="group-tokens-grid">
              <button
                v-for="t in group.tokens"
                :key="t.key"
                type="button"
                class="token-item-card"
                @click="insertTokenFromModal(t.key)"
              >
                <div class="token-item-code">&#123;&#123;{{ t.key }}&#125;&#125;</div>
                <div class="token-item-desc">{{ t.desc }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm" @click="showTokenModal = false">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="tcs-fade">
      <div v-if="toastMessage" class="tcs-toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  rawHtml: { type: String, default: '' },
  customCss: { type: String, default: '' },
  title: { type: String, default: 'Legal Services Agreement' },
  quickVariables: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:rawHtml',
  'update:customCss',
  'save',
  'loadCyprusPreset'
])

// ─── STATE ──────────────────────────────────────────────────────────────────
const currentTab = ref('html') // 'html' | 'css'
const viewMode = ref('split') // 'split' | 'code' | 'preview'
const isFullscreen = ref(false)
const isSyncing = ref(false)
const fontSize = ref('13')
const wordWrap = ref(false) // False by default so lines strictly match line numbers!
const splitRatio = ref(50) // percentage for editor width in split mode
const isDraggingSplitter = ref(false)
const editorScrollTop = ref(0)

// Local code buffers
const localHtml = ref(props.rawHtml || '')
const localCss = ref(props.customCss || '')
const hasUnsavedChanges = ref(false)

// Line height calculation based on font size
const editorLineHeight = computed(() => {
  const fs = parseInt(fontSize.value) || 13
  return Math.round(fs * 1.62)
})

// Undo / Redo stacks
const historyStack = ref([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)

// Search & Replace
const showSearchBar = ref(false)
const searchQuery = ref('')
const replaceQuery = ref('')
const searchMatchCount = ref(0)
const currentMatchIndex = ref(0)
const searchInputRef = ref(null)

// Cursor / stats
const textareaRef = ref(null)
const gutterRef = ref(null)
const cursorInfo = ref({ line: 1, col: 1, selected: 0 })

// Preview settings
const previewViewportRef = ref(null)
const previewIframeRef = ref(null)
const previewZoom = ref('fit')
const previewDataMode = ref('sample') // 'sample' | 'tokens'
let previewDebounceTimer = null
const previewSrcDoc = ref('')

// Toast & Modal
const toastMessage = ref('')
let toastTimer = null
const showTokenModal = ref(false)
const tokenSearchQuery = ref('')

// ─── SYNC PROPS WITH LOCAL BUFFERS ──────────────────────────────────────────
watch(() => props.rawHtml, (val) => {
  if (val !== localHtml.value) {
    localHtml.value = val || ''
    recordHistory('External HTML update')
    triggerLivePreviewSync()
  }
})

watch(() => props.customCss, (val) => {
  if (val !== localCss.value) {
    localCss.value = val || ''
    recordHistory('External CSS update')
    triggerLivePreviewSync()
  }
})

// Active code computed getter/setter
const activeCode = computed({
  get() {
    return currentTab.value === 'html' ? localHtml.value : localCss.value
  },
  set(val) {
    if (currentTab.value === 'html') {
      localHtml.value = val
      emit('update:rawHtml', val)
    } else {
      localCss.value = val
      emit('update:customCss', val)
    }
    hasUnsavedChanges.value = true
    triggerLivePreviewSync()
  }
})

const activeCodeLength = computed(() => (activeCode.value || '').length)
const activeLinesCount = computed(() => {
  const code = activeCode.value || ''
  return Math.max(1, code.split('\n').length)
})

// ─── TABS & VIEW MODES ──────────────────────────────────────────────────────
function setTab(tab) {
  currentTab.value = tab
  nextTick(() => {
    updateCursorInfo()
    editorScrollTop.value = textareaRef.value?.scrollTop || 0
  })
}

// ─── TOKENS LIST ────────────────────────────────────────────────────────────
const tokenGroups = [
  {
    title: 'Applicant & Personal Information',
    icon: '👤',
    tokens: [
      { key: 'applicant.full_name', desc: 'Full name of primary applicant' },
      { key: 'applicant.passport_or_eid', desc: 'Passport number or Emirates ID' },
      { key: 'applicant.nationality', desc: 'Country / Nationality' },
      { key: 'applicant.mobile', desc: 'Contact mobile number' },
      { key: 'applicant.email', desc: 'Applicant primary email' },
      { key: 'applicant.address', desc: 'Residential address' },
      { key: 'applicant.date_of_birth', desc: 'Date of birth' },
      { key: 'applicant.dependents', desc: 'Accompanying family members' }
    ]
  },
  {
    title: 'Commercial Terms & Fees',
    icon: '💰',
    tokens: [
      { key: 'fees.total_after_discount', desc: 'Agreed net professional fee' },
      { key: 'fees.currency_text', desc: 'Currency denomination (e.g. GBP, EUR, USD)' },
      { key: 'fees.payment_mode', desc: 'Payment structure (e.g. 50/50 Milestone)' },
      { key: 'fees.initial_amount', desc: 'First deposit milestone' },
      { key: 'fees.payment_breakup', desc: 'Detailed milestone schedule breakdown' },
      { key: 'fees.additional_information', desc: 'Special scope or program notes' },
      { key: 'commercial_terms', desc: 'Rendered schedule three milestone box' },
      { key: 'schedule_three_content', desc: 'Schedule 3 dynamic fee clause' }
    ]
  },
  {
    title: 'Legal, Dates & Corporate Branding',
    icon: '🏛️',
    tokens: [
      { key: 'contract.date', desc: 'Date of contract execution' },
      { key: 'jurisdiction', desc: 'Governing legal jurisdiction (e.g. DIFC Dubai)' },
      { key: 'logo_url', desc: 'Official 360GI corporate header logo' },
      { key: 'company_stamp_url', desc: 'Official digital corporate seal stamp' },
      { key: 'signature.client', desc: 'Digital signature line for client' },
      { key: 'signature.company', desc: 'Authorized corporate signatory' }
    ]
  }
]

const allAvailableTokens = computed(() => {
  const custom = (props.quickVariables || []).map(v => ({ key: v, desc: `Custom dynamic token: {{${v}}}` }))
  const known = tokenGroups.flatMap(g => g.tokens)
  const map = new Map()
  known.forEach(t => map.set(t.key, t))
  custom.forEach(t => {
    if (!map.has(t.key)) map.set(t.key, t)
  })
  return Array.from(map.values())
})

const displayTokens = computed(() => {
  if (props.quickVariables && props.quickVariables.length > 0) {
    return props.quickVariables.slice(0, 10)
  }
  return [
    'applicant.full_name',
    'applicant.passport_or_eid',
    'applicant.nationality',
    'applicant.mobile',
    'applicant.email',
    'applicant.address',
    'fees.total_after_discount',
    'commercial_terms',
    'contract.date',
    'jurisdiction'
  ]
})

const filteredTokenGroups = computed(() => {
  const q = tokenSearchQuery.value.trim().toLowerCase()
  if (!q) return tokenGroups
  return tokenGroups.map(group => ({
    ...group,
    tokens: group.tokens.filter(t => t.key.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
  })).filter(g => g.tokens.length > 0)
})

// ─── INSERT TOKEN HELPER ────────────────────────────────────────────────────
function insertToken(tok) {
  const tokenStr = `{{${tok}}}`
  const el = textareaRef.value
  if (!el) {
    activeCode.value += tokenStr
    return
  }

  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const val = el.value || ''

  activeCode.value = val.substring(0, start) + tokenStr + val.substring(end)
  showToast(`Inserted {{${tok}}}`)

  nextTick(() => {
    el.focus()
    const newPos = start + tokenStr.length
    el.setSelectionRange(newPos, newPos)
    updateCursorInfo()
  })
}

function insertTokenFromModal(tok) {
  insertToken(tok)
  showTokenModal.value = false
}

// ─── KEYBOARD & SMART INDENTATION ───────────────────────────────────────────
function handleKeyDown(e) {
  const el = textareaRef.value
  if (!el) return

  // Tab key: Insert 2 spaces or indent/dedent selected lines
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = el.selectionStart
    const end = el.selectionEnd
    const val = el.value

    if (e.shiftKey) {
      // Shift+Tab: Dedent
      const beforeSel = val.substring(0, start)
      const afterSel = val.substring(end)
      const lastNewline = beforeSel.lastIndexOf('\n')
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
      const wholeBlock = val.substring(lineStart, end)
      const dedented = wholeBlock.replace(/^ {1,2}/gm, '')
      const diff = wholeBlock.length - dedented.length

      activeCode.value = val.substring(0, lineStart) + dedented + afterSel
      nextTick(() => {
        el.setSelectionRange(Math.max(lineStart, start - (diff > 0 ? 2 : 0)), end - diff)
        updateCursorInfo()
      })
    } else {
      // Normal Tab
      if (start === end) {
        activeCode.value = val.substring(0, start) + '  ' + val.substring(end)
        nextTick(() => {
          el.setSelectionRange(start + 2, start + 2)
          updateCursorInfo()
        })
      } else {
        // Multi-line selection: Indent every line by 2 spaces
        const beforeSel = val.substring(0, start)
        const lastNewline = beforeSel.lastIndexOf('\n')
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
        const wholeBlock = val.substring(lineStart, end)
        const indented = wholeBlock.replace(/^/gm, '  ')
        const diff = indented.length - wholeBlock.length

        activeCode.value = val.substring(0, lineStart) + indented + val.substring(end)
        nextTick(() => {
          el.setSelectionRange(start + 2, end + diff)
          updateCursorInfo()
        })
      }
    }
    return
  }

  // Enter key: Smart indentation matching previous line
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    const start = el.selectionStart
    const val = el.value
    const lineStart = val.lastIndexOf('\n', start - 1) + 1
    const currentLine = val.substring(lineStart, start)
    const match = currentLine.match(/^(\s*)/)
    let indent = match ? match[1] : ''

    const trimmed = currentLine.trimEnd()
    if (trimmed.endsWith('{') || (trimmed.endsWith('>') && !trimmed.endsWith('/>') && !trimmed.endsWith('-->'))) {
      indent += '  '
    }

    const insertion = '\n' + indent
    activeCode.value = val.substring(0, start) + insertion + val.substring(el.selectionEnd)

    nextTick(() => {
      const newPos = start + insertion.length
      el.setSelectionRange(newPos, newPos)
      updateCursorInfo()
    })
    return
  }

  // Ctrl+S / Cmd+S: Save
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    emit('save')
    hasUnsavedChanges.value = false
    showToast('💾 Template saved!')
    return
  }

  // Ctrl+F / Cmd+F: Toggle Search
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    toggleSearch()
    return
  }

  // Alt+F: Toggle Fullscreen
  if (e.altKey && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    toggleFullscreen()
    return
  }
}

// ─── CURSOR TRACKING & GUTTER SYNC ──────────────────────────────────────────
function updateCursorInfo() {
  const el = textareaRef.value
  if (!el) return

  const pos = el.selectionStart || 0
  const end = el.selectionEnd || 0
  const val = el.value || ''

  const lines = val.substring(0, pos).split('\n')
  const lineNum = lines.length
  const colNum = lines[lines.length - 1].length + 1
  const selected = Math.abs(end - pos)

  cursorInfo.value = { line: lineNum, col: colNum, selected }
}

function handleEditorScroll(e) {
  editorScrollTop.value = e.target.scrollTop
}

function jumpToLine(targetLine) {
  const el = textareaRef.value
  if (!el) return
  const lines = (el.value || '').split('\n')
  let charIdx = 0
  for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
    charIdx += lines[i].length + 1
  }
  el.focus()
  el.setSelectionRange(charIdx, charIdx)
  updateCursorInfo()
}

// ─── SEARCH & REPLACE ───────────────────────────────────────────────────────
function toggleSearch() {
  showSearchBar.value = !showSearchBar.value
  if (showSearchBar.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
      executeSearch()
    })
  }
}

function executeSearch() {
  const q = searchQuery.value
  if (!q) {
    searchMatchCount.value = 0
    currentMatchIndex.value = 0
    return
  }
  const code = activeCode.value || ''
  const regex = new RegExp(escapeRegex(q), 'gi')
  const matches = [...code.matchAll(regex)]
  searchMatchCount.value = matches.length
  if (searchMatchCount.value > 0) {
    currentMatchIndex.value = 0
  }
}

watch(searchQuery, () => {
  executeSearch()
})

function findNext() {
  const q = searchQuery.value
  const el = textareaRef.value
  if (!q || !el) return

  const code = el.value || ''
  const startPos = el.selectionEnd || 0
  let idx = code.toLowerCase().indexOf(q.toLowerCase(), startPos)
  if (idx === -1) {
    idx = code.toLowerCase().indexOf(q.toLowerCase(), 0)
  }

  if (idx !== -1) {
    el.focus()
    el.setSelectionRange(idx, idx + q.length)
    updateCursorInfo()
    scrollSelectionIntoView(el)
  }
}

function findPrev() {
  const q = searchQuery.value
  const el = textareaRef.value
  if (!q || !el) return

  const code = el.value || ''
  const startPos = el.selectionStart || 0
  const sub = code.substring(0, Math.max(0, startPos - 1))
  let idx = sub.toLowerCase().lastIndexOf(q.toLowerCase())
  if (idx === -1) {
    idx = code.toLowerCase().lastIndexOf(q.toLowerCase())
  }

  if (idx !== -1) {
    el.focus()
    el.setSelectionRange(idx, idx + q.length)
    updateCursorInfo()
    scrollSelectionIntoView(el)
  }
}

function replaceCurrent() {
  const q = searchQuery.value
  const r = replaceQuery.value
  const el = textareaRef.value
  if (!q || !el) return

  const sel = el.value.substring(el.selectionStart, el.selectionEnd)
  if (sel.toLowerCase() === q.toLowerCase()) {
    const start = el.selectionStart
    activeCode.value = el.value.substring(0, start) + r + el.value.substring(el.selectionEnd)
    nextTick(() => {
      el.setSelectionRange(start, start + r.length)
      findNext()
    })
  } else {
    findNext()
  }
}

function replaceAll() {
  const q = searchQuery.value
  const r = replaceQuery.value
  if (!q) return

  const count = searchMatchCount.value
  const regex = new RegExp(escapeRegex(q), 'gi')
  activeCode.value = (activeCode.value || '').replace(regex, r)
  showToast(`Replaced ${count} occurrences`)
  executeSearch()
}

function scrollSelectionIntoView(el) {
  const line = el.value.substring(0, el.selectionStart).split('\n').length
  const lh = editorLineHeight.value
  const targetScroll = Math.max(0, (line - 5) * lh)
  el.scrollTop = targetScroll
  editorScrollTop.value = targetScroll
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── CODE BEAUTIFIER & FORMATTER ────────────────────────────────────────────
function formatCurrentCode() {
  const raw = activeCode.value || ''
  if (!raw.trim()) return

  if (currentTab.value === 'html') {
    activeCode.value = beautifyHtml(raw)
    showToast('✨ HTML markup formatted cleanly')
  } else {
    activeCode.value = beautifyCss(raw)
    showToast('✨ CSS stylesheet formatted cleanly')
  }
  nextTick(() => {
    updateCursorInfo()
  })
}

function beautifyHtml(html) {
  let formatted = ''
  let indentLevel = 0
  const indentStr = '  '

  const tokens = html.replace(/>\s*</g, '><').match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []

  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
  ])

  tokens.forEach(token => {
    const trimmed = token.trim()
    if (!trimmed) return

    if (/^<\/[a-zA-Z0-9_-]+>/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1)
      formatted += indentStr.repeat(indentLevel) + trimmed + '\n'
    } else if (/^<!--/.test(trimmed) || /^<!DOCTYPE/i.test(trimmed)) {
      formatted += indentStr.repeat(indentLevel) + trimmed + '\n'
    } else if (/^<[a-zA-Z0-9_-]+/.test(trimmed)) {
      formatted += indentStr.repeat(indentLevel) + trimmed + '\n'
      const tagNameMatch = trimmed.match(/^<([a-zA-Z0-9_-]+)/)
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : ''
      const isSelfClosing = trimmed.endsWith('/>') || voidTags.has(tagName)
      if (!isSelfClosing) {
        indentLevel++
      }
    } else {
      formatted += indentStr.repeat(indentLevel) + trimmed + '\n'
    }
  })

  return formatted.trimEnd() + '\n'
}

function beautifyCss(css) {
  let formatted = ''
  let indentLevel = 0
  const indentStr = '  '

  const clean = css.replace(/\s+/g, ' ').replace(/\s*([\{\};:,])\s*/g, '$1')

  let i = 0
  let buffer = ''
  while (i < clean.length) {
    const ch = clean[i]
    if (ch === '{') {
      buffer = buffer.trim()
      formatted += indentStr.repeat(indentLevel) + buffer + ' {\n'
      indentLevel++
      buffer = ''
    } else if (ch === '}') {
      if (buffer.trim()) {
        formatted += indentStr.repeat(indentLevel) + buffer.trim() + ';\n'
      }
      indentLevel = Math.max(0, indentLevel - 1)
      formatted += indentStr.repeat(indentLevel) + '}\n\n'
      buffer = ''
    } else if (ch === ';') {
      formatted += indentStr.repeat(indentLevel) + buffer.trim() + ';\n'
      buffer = ''
    } else {
      buffer += ch
    }
    i++
  }

  if (buffer.trim()) {
    formatted += indentStr.repeat(indentLevel) + buffer.trim() + '\n'
  }

  return formatted.trim() + '\n'
}

// ─── UNDO / REDO ────────────────────────────────────────────────────────────
function recordHistory(label = '') {
  const currentSnapshot = {
    html: localHtml.value,
    css: localCss.value,
    tab: currentTab.value
  }

  if (historyIndex.value >= 0 && historyStack.value[historyIndex.value]) {
    const last = historyStack.value[historyIndex.value]
    if (last.html === currentSnapshot.html && last.css === currentSnapshot.css) {
      return
    }
  }

  historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
  historyStack.value.push(currentSnapshot)
  if (historyStack.value.length > 50) {
    historyStack.value.shift()
  } else {
    historyIndex.value++
  }
}

function undo() {
  if (!canUndo.value) return
  historyIndex.value--
  const snap = historyStack.value[historyIndex.value]
  if (snap) {
    localHtml.value = snap.html
    localCss.value = snap.css
    emit('update:rawHtml', snap.html)
    emit('update:customCss', snap.css)
    triggerLivePreviewSync()
  }
}

function redo() {
  if (!canRedo.value) return
  historyIndex.value++
  const snap = historyStack.value[historyIndex.value]
  if (snap) {
    localHtml.value = snap.html
    localCss.value = snap.css
    emit('update:rawHtml', snap.html)
    emit('update:customCss', snap.css)
    triggerLivePreviewSync()
  }
}

// ─── RESIZABLE SPLITTER (Split Mode) ────────────────────────────────────────
const workspaceGridStyle = computed(() => {
  if (viewMode.value === 'code') return { gridTemplateColumns: '1fr' }
  if (viewMode.value === 'preview') return { gridTemplateColumns: '1fr' }
  return {
    gridTemplateColumns: `${splitRatio.value}% 6px calc(${100 - splitRatio.value}% - 6px)`
  }
})

function startSplitDrag(e) {
  isDraggingSplitter.value = true
  document.addEventListener('mousemove', onSplitDrag)
  document.addEventListener('mouseup', stopSplitDrag)
}

function onSplitDrag(e) {
  if (!isDraggingSplitter.value) return
  const container = document.querySelector('.tcs-workspace-grid')
  if (!container) return
  const rect = container.getBoundingClientRect()
  const offset = e.clientX - rect.left
  const pct = Math.max(20, Math.min(80, Math.round((offset / rect.width) * 100)))
  splitRatio.value = pct
}

function stopSplitDrag() {
  if (isDraggingSplitter.value) {
    isDraggingSplitter.value = false
    document.removeEventListener('mousemove', onSplitDrag)
    document.removeEventListener('mouseup', stopSplitDrag)
  }
}

// ─── LIVE REAL-TIME PREVIEW RENDERER ────────────────────────────────────────
function triggerLivePreviewSync() {
  isSyncing.value = true
  if (previewDebounceTimer) clearTimeout(previewDebounceTimer)

  previewDebounceTimer = setTimeout(() => {
    buildPreviewDocument()
    isSyncing.value = false
  }, 220)
}

function buildPreviewDocument() {
  const html = localHtml.value || ''
  const css = localCss.value || ''

  let rendered = html
  if (previewDataMode.value === 'sample') {
    // High fidelity sample data simulation
    rendered = rendered
      .replace(/\{\{applicant\.full_name\}\}/g, 'ALI KAMRAN')
      .replace(/\{\{applicant\.passport_or_eid\}\}/g, 'CQ4220892')
      .replace(/\{\{applicant\.nationality\}\}/g, 'PAKISTANI')
      .replace(/\{\{applicant\.mobile\}\}/g, '+966 54 128 1675')
      .replace(/\{\{applicant\.address\}\}/g, 'RIYADH, SAUDI ARABIA')
      .replace(/\{\{applicant\.email\}\}/g, 'kamran.ali@gmail.com')
      .replace(/\{\{applicant\.date_of_birth\}\}/g, '14 APR 1991')
      .replace(/\{\{applicant\.dependents\}\}/g, 'Spouse & Kids under 18 are included.')
      .replace(/\{\{jurisdiction\}\}/g, 'Courts of Dubai International Financial Centre (DIFC)')
      .replace(/\{\{fees\.total_after_discount\}\}/g, '£15,000 GBP')
      .replace(/\{\{fees\.currency_text\}\}/g, 'THE GREAT BRITAIN POUND (GBP)')
      .replace(/\{\{fees\.payment_mode\}\}/g, '50% Initial, 50% on approval')
      .replace(/\{\{fees\.additional_information\}\}/g, 'Cyprus Business Residence Advisory')
      .replace(/\{\{fees\.payment_breakup\}\}/g, 'Initial Deposit upon signing, balance upon milestone')
      .replace(/\{\{fees\.initial_amount\}\}/g, '£7,500 GBP')
      .replace(/\{\{(?:commercial_terms|schedule_three_content|fees\.commercial_terms|fees\.schedule_three|milestones)\}\}/g, `
<div class="milestones-preview" style="font-size: 8.2pt; line-height: 1.4; color: var(--ink);">
  <p style="margin: 0 0 1.5mm 0;"><strong>Total Professional Fees:</strong> 20,000 EUR</p>
  <p style="margin: 0 0 1.5mm 0;"><strong>Amount after Exclusive Discount:</strong> 15,000 EUR</p>
  <p style="margin: 0 0 1mm 0;"><strong>Agreed Payment Milestones:</strong></p>
  <ul style="margin: 0 0 1.5mm 0; padding-inline-start: 16px;">
    <li style="margin-bottom: 0.8mm;"><strong>First Milestone (50% Advance):</strong> 7,500 EUR payable upon signing this agreement.</li>
    <li style="margin-bottom: 0.8mm;"><strong>Second Milestone (50% Balance):</strong> 7,500 EUR payable upon formal file approval / visa issuance.</li>
  </ul>
  <p style="margin: 0 0 1.5mm 0;"><strong>Payment Mode:</strong> International Bank Wire Transfer / Swift.</p>
  <p style="margin: 0; font-style: italic; color: var(--muted); font-size: 7.6pt;">All fees are net of third-party government charges and subject to standard terms of business.</p>
</div>
`.trim())
      .replace(/\{\{contract\.date\}\}/g, new Date().toLocaleDateString('en-GB'))
      .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
      .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
  } else {
    // Token highlight mode
    rendered = rendered.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, '<mark class="token-highlight-chip">{{$1}}</mark>')
  }

  previewSrcDoc.value = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${props.title || 'Legal Document Preview'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800&family=Cinzel:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    ${css}

    /* Screen Preview Multi-Page Layout */
    html {
      background: #0d1322;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #0d1322;
      margin: 0;
      padding: 32px 16px 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    .document {
      width: var(--page-w, 210mm);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }
    .page, section.page {
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.12);
      background: #ffffff;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .token-highlight-chip {
      background: #fef08a !important;
      color: #854d0e !important;
      font-weight: 700 !important;
      padding: 1px 4px !important;
      border-radius: 3px !important;
      font-size: 0.88em !important;
      border: 1px dashed #ca8a04 !important;
    }
    @media print {
      html, body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        gap: 0 !important;
      }
      .document { gap: 0 !important; }
      .page, section.page {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
    }
  </style>
</head>
<body>
  ${rendered}
</body>
</html>`
}

watch(previewDataMode, () => {
  buildPreviewDocument()
})

function forceReloadPreview() {
  buildPreviewDocument()
  showToast('🔄 Preview reloaded')
}

function printPreview() {
  if (previewIframeRef.value && previewIframeRef.value.contentWindow) {
    try {
      previewIframeRef.value.contentWindow.focus()
      previewIframeRef.value.contentWindow.print()
    } catch (e) {
      console.warn('Print preview error:', e)
    }
  }
}

const previewScaleStyle = computed(() => {
  if (previewZoom.value === 'fit') {
    const width = previewViewportRef.value?.clientWidth || 700
    // A4 document display width is approx 840px (210mm + padding + shadow)
    const fitFactor = Math.min(1.0, Math.max(0.38, Math.round(((width - 36) / 840) * 100) / 100))
    return {
      transform: `scale(${fitFactor})`,
      transformOrigin: 'top center'
    }
  }
  const z = parseFloat(previewZoom.value) || 1
  return {
    transform: `scale(${z})`,
    transformOrigin: 'top center'
  }
})

// ─── FULLSCREEN / ZEN MODE ──────────────────────────────────────────────────
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    showToast('⛶ Entered Full Screen Zen View (Esc to exit)')
  } else {
    showToast('Exited Full Screen')
  }
  nextTick(() => {
    updateCursorInfo()
  })
}

function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    if (showSearchBar.value) {
      showSearchBar.value = false
    } else if (showTokenModal.value) {
      showTokenModal.value = false
    } else if (isFullscreen.value) {
      isFullscreen.value = false
      showToast('Exited Full Screen')
    }
  }
}

// ─── UTILITIES ──────────────────────────────────────────────────────────────
function copyActiveCode() {
  const code = activeCode.value
  if (!code) return
  navigator.clipboard?.writeText(code)
  showToast(`✓ Copied ${currentTab.value.toUpperCase()} to clipboard!`)
}

function showToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}

// ─── MOUNT & UNMOUNT ────────────────────────────────────────────────────────
onMounted(() => {
  recordHistory('Initial Mount')
  buildPreviewDocument()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (previewDebounceTimer) clearTimeout(previewDebounceTimer)
  if (toastTimer) clearTimeout(toastTimer)
  stopSplitDrag()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ROOT STUDIO CONTAINER & THEME
   ═══════════════════════════════════════════════════════════════════════════ */
.template-code-studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #090d16;
  color: #e2e8f0;
  border: 1px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  position: relative;
  box-sizing: border-box;
}

/* FULLSCREEN ZEN OVERLAY */
.template-code-studio.is-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  z-index: 999999 !important;
  border-radius: 0 !important;
  border: none !important;
  margin: 0 !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. TOP CONTROL BAR
   ═══════════════════════════════════════════════════════════════════════════ */
.tcs-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  gap: 12px;
  flex-shrink: 0;
  min-height: 54px;
}

.tcs-top-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.tcs-branding {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tcs-brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  color: #a5b4fc;
  border: 1px solid rgba(165, 180, 252, 0.25);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-glow 2s infinite ease-in-out;
}

.live-pulse-dot.syncing {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.tcs-title-group {
  display: flex;
  flex-direction: column;
}

.tcs-title-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
}

.tcs-subtitle-text {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1;
}

/* File Tabs (HTML / CSS) */
.tcs-file-tabs {
  display: flex;
  background: #090d16;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  gap: 3px;
}

.tcs-file-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tcs-file-tab:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.tcs-file-tab.active {
  background: #4f46e5;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
}

.tab-stat-pill {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

/* Center Layout Toggles (Split / Code / Preview) */
.tcs-top-center {
  display: flex;
  justify-content: center;
}

.tcs-view-mode-pill {
  display: flex;
  background: #090d16;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  gap: 2px;
}

.tcs-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tcs-mode-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.04);
}

.tcs-mode-btn.active {
  background: #1e293b;
  color: #38bdf8;
  border: 1px solid #334155;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

/* Right Actions */
.tcs-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tcs-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tcs-action-btn:hover {
  background: #334155;
  color: #ffffff;
  border-color: #475569;
}

.tcs-action-btn.active {
  background: #312e81;
  color: #a5b4fc;
  border-color: #4f46e5;
}

.tcs-btn-save {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

.tcs-btn-save:hover {
  background: #10b981;
  border-color: #34d399;
}

/* Fullscreen Toggle Button */
.tcs-fullscreen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.35);
}

.tcs-fullscreen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(37, 99, 235, 0.45);
}

.tcs-fullscreen-btn.is-active {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.35);
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. VARIABLE TOKENS & SETTINGS RIBBON
   ═══════════════════════════════════════════════════════════════════════════ */
.tcs-ribbon-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: #0d1322;
  border-bottom: 1px solid #1e293b;
  gap: 14px;
  flex-shrink: 0;
  overflow: hidden;
}

.tcs-ribbon-tokens {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.tcs-ribbon-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #818cf8;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.tcs-tokens-scroll-list {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #334155 #090d16;
  padding-bottom: 2px;
}

.tcs-tokens-scroll-list::-webkit-scrollbar {
  height: 4px;
}

.tcs-tokens-scroll-list::-webkit-scrollbar-track {
  background: #090d16;
}

.tcs-tokens-scroll-list::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.tcs-token-chip {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.74rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tcs-token-chip:hover {
  background: #4f46e5;
  color: #ffffff;
  border-color: #6366f1;
  transform: translateY(-1px);
}

.tcs-more-tokens-btn {
  background: #141f36;
  color: #93c5fd;
  border: 1px solid #1e3a8a;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.74rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tcs-more-tokens-btn:hover {
  background: #1d4ed8;
  color: #ffffff;
}

/* Settings Controls (Right) */
.tcs-ribbon-settings {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tcs-setting-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 5px;
  padding: 2px 6px;
}

.setting-icon {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.tcs-setting-select {
  background: transparent;
  color: #e2e8f0;
  border: none;
  font-size: 0.74rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.tcs-setting-select option {
  background: #0f172a;
  color: #f8fafc;
}

.tcs-setting-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.tcs-setting-btn.active {
  background: #0369a1;
  color: #ffffff;
  border-color: #38bdf8;
}

.tcs-history-btns {
  display: flex;
  gap: 2px;
}

.tcs-setting-icon-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 7px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tcs-setting-icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tcs-setting-icon-btn:not(:disabled):hover {
  background: #334155;
  color: #ffffff;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. IN-EDITOR SEARCH & REPLACE
   ═══════════════════════════════════════════════════════════════════════════ */
.tcs-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: #111827;
  border-bottom: 1px solid #374151;
  gap: 12px;
  flex-shrink: 0;
}

.tcs-search-fields {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-input-wrap, .replace-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 5px;
  padding: 4px 8px;
  flex: 1;
  max-width: 320px;
}

.tcs-search-input {
  background: transparent;
  border: none;
  color: #f3f4f6;
  font-size: 0.8rem;
  outline: none;
  width: 100%;
  font-family: monospace;
}

.search-count {
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
}

.tcs-search-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-search-nav, .btn-search-action, .btn-search-close {
  background: #1f2937;
  color: #e5e7eb;
  border: 1px solid #374151;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-search-nav:hover, .btn-search-action:hover {
  background: #374151;
}

.btn-search-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-search-close {
  color: #ef4444;
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. WORKSPACE SPLIT GRID
   ═══════════════════════════════════════════════════════════════════════════ */
.tcs-workspace-grid {
  display: grid;
  flex: 1;
  height: calc(100% - 94px);
  min-height: 480px;
  overflow: hidden;
  background: #090d16;
  position: relative;
}

.tcs-drag-shield {
  position: absolute;
  inset: 0;
  z-index: 99999;
  cursor: col-resize;
  background: transparent;
}

/* Splitter Handle */
.tcs-splitter-handle {
  background: #1e293b;
  cursor: col-resize;
  width: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
  user-select: none;
  z-index: 10;
}

.tcs-splitter-handle:hover {
  background: #4f46e5;
}

.splitter-grip {
  width: 2px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

/* ─── PANE A: CODE EDITOR ───────────────────────────────────────────────── */
.tcs-editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #090d16;
  border-right: 1px solid #1e293b;
  overflow: hidden;
}

.tcs-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: #0d1322;
  border-bottom: 1px solid #1e293b;
  font-size: 0.72rem;
  color: #64748b;
  font-family: monospace;
  flex-shrink: 0;
}

.pane-header-left, .pane-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pane-lang-badge {
  color: #38bdf8;
  font-weight: 700;
}

.pane-save-status {
  color: #f59e0b;
}

.pane-save-status.synced {
  color: #10b981;
}

.line-count-badge {
  color: #94a3b8;
  background: #1e293b;
  padding: 1px 6px;
  border-radius: 4px;
}

/* Code area with line numbers */
.tcs-code-wrapper {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #090d16;
}

.tcs-gutter {
  width: 52px;
  background: #0a0f1c;
  border-right: 1px solid #1e293b;
  user-select: none;
  overflow: hidden;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}

.tcs-gutter-inner {
  padding-top: 16px;
  padding-bottom: 40px;
  will-change: transform;
}

.gutter-line-num {
  text-align: right;
  padding-right: 12px;
  cursor: pointer;
  height: var(--editor-line-height, 22px);
  line-height: var(--editor-line-height, 22px);
  font-size: var(--editor-font-size, 13px);
  box-sizing: border-box;
  color: #475569;
}

.gutter-line-num:hover {
  color: #94a3b8;
}

.gutter-line-num.active {
  color: #38bdf8;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.08);
}

.tcs-code-textarea {
  flex: 1;
  height: 100%;
  background: #090d16;
  color: #f1f5f9;
  border: none;
  padding: 16px 18px 40px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: var(--editor-font-size, 13px);
  line-height: var(--editor-line-height, 22px);
  resize: none;
  outline: none;
  tab-size: 2;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #334155 #090d16;
}

.tcs-code-textarea.no-wrap {
  white-space: pre !important;
  word-break: normal !important;
  overflow-x: auto !important;
}

.tcs-code-textarea:focus {
  background: #0a0e19;
}

.tcs-code-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tcs-code-textarea::-webkit-scrollbar-track {
  background: #090d16;
}

.tcs-code-textarea::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.tcs-code-textarea::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

.tcs-editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 14px;
  background: #0d1322;
  border-top: 1px solid #1e293b;
  font-size: 0.72rem;
  color: #64748b;
  font-family: monospace;
  flex-shrink: 0;
}

.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-dot {
  color: #334155;
}

/* ─── PANE B: LIVE FRONT VIEW ───────────────────────────────────────────── */
.tcs-preview-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1322;
  overflow: hidden;
}

.tcs-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  gap: 12px;
  flex-shrink: 0;
  min-height: 40px;
}

.preview-header-left, .preview-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.preview-doc-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-data-switch {
  display: flex;
  background: #090d16;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.data-switch-btn {
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.data-switch-btn.active {
  background: #1e293b;
  color: #38bdf8;
}

.preview-zoom-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-label {
  font-size: 0.72rem;
  color: #94a3b8;
}

.preview-zoom-select {
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.72rem;
  outline: none;
  cursor: pointer;
}

.preview-zoom-select option {
  background: #0f172a;
}

.preview-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.preview-action-btn:hover {
  background: #334155;
  color: #ffffff;
}

/* Viewport for preview */
.tcs-preview-viewport {
  flex: 1;
  overflow: auto;
  background: #0d1322;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #334155 #0d1322;
}

.tcs-preview-viewport::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tcs-preview-viewport::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.tcs-preview-scale-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  transition: transform 0.15s ease-out;
}

.tcs-preview-iframe {
  width: 216mm;
  min-height: 297mm;
  height: calc(100vh - 180px);
  border: none;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. TOKENS MODAL & TOAST
   ═══════════════════════════════════════════════════════════════════════════ */
.tcs-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.tcs-token-modal {
  width: 720px;
  max-width: 95vw;
  max-height: 85vh;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 24px 12px;
  border-bottom: 1px solid #1e293b;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-close-btn:hover {
  color: #ffffff;
}

.modal-search-box {
  padding: 12px 24px;
  background: #0b0f19;
  border-bottom: 1px solid #1e293b;
}

.modal-search-input {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}

.modal-tokens-groups {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-title-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #818cf8;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.group-tokens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
}

.token-item-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  background: #141e33;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.token-item-card:hover {
  background: #1e293b;
  border-color: #4f46e5;
  transform: translateY(-1px);
}

.token-item-code {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: #38bdf8;
}

.token-item-desc {
  font-size: 0.72rem;
  color: #94a3b8;
}

.modal-foot {
  padding: 12px 24px;
  border-top: 1px solid #1e293b;
  display: flex;
  justify-content: flex-end;
  background: #0b0f19;
}

/* Toast */
.tcs-toast {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(15, 23, 42, 0.95);
  color: #38bdf8;
  border: 1px solid #0284c7;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 10000;
}

/* Transitions */
.tcs-slide-down-enter-active, .tcs-slide-down-leave-active {
  transition: all 0.18s ease;
}
.tcs-slide-down-enter-from, .tcs-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.tcs-fade-enter-active, .tcs-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tcs-fade-enter-from, .tcs-fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .btn-text-desktop {
    display: none;
  }
  .tcs-branding .tcs-subtitle-text {
    display: none;
  }
}
</style>
