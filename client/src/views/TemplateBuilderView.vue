<template>
  <div class="studio-container">
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TOP STUDIO HEADER                                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <header class="studio-header">
      <div class="header-left">
        <router-link to="/templates" class="btn-back" title="Return to Templates List">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span class="btn-back-text">Templates</span>
        </router-link>

        <div class="header-divider"></div>

        <div class="template-title-group">
          <input
            type="text"
            v-model="templateName"
            class="template-title-input"
            placeholder="Untitled Template"
            title="Click to rename template"
          />
          <span class="badge badge-version" title="Template Version">v{{ currentVersion }}</span>
          <span v-if="isActive" class="badge badge-live" title="Active in Production">
            <span class="pulse-dot"></span> Active
          </span>
          <span v-else class="badge badge-draft">Draft</span>
        </div>
      </div>

      <!-- Studio Multi-Tabs -->
      <div class="header-center">
        <div class="view-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'builder' }"
            @click="activeTab = 'builder'"
            title="Visual A4 Template Designer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Designer</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'form' }"
            @click="activeTab = 'form'"
            title="Associated Intake Form"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <span>Intake Form</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'variables' }"
            @click="activeTab = 'variables'"
            title="Dynamic Contract Tokens"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>Variables</span>
            <span class="tab-badge">{{ availableVariables.length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
            title="Full Page Live Preview"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Preview</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'code' }"
            @click="activeTab = 'code'"
            title="Direct HTML & CSS Source Editor"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>HTML / CSS</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'versions' }"
            @click="activeTab = 'versions'"
            title="Version History & Snapshots"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 14 14"/>
            </svg>
            <span>Versions</span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <!-- History / Undo Redo Controls -->
        <div class="history-controls" title="Undo (Ctrl+Z) / Redo (Ctrl+Y)">
          <button
            type="button"
            class="history-btn"
            :disabled="!canUndo"
            @click="triggerUndo"
            title="Undo (Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 14 4 9l5-5"/>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </button>
          <button
            type="button"
            class="history-btn"
            :disabled="!canRedo"
            @click="triggerRedo"
            title="Redo (Ctrl+Y)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 14 5-5-5-5"/>
              <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>
            </svg>
          </button>
        </div>

        <!-- Zoom Controls -->
        <div class="zoom-controls">
          <button class="btn-tool" @click="changeZoom(-0.15)" title="Zoom Out">−</button>
          <span class="zoom-level">{{ Math.round(zoomScale * 100) }}%</span>
          <button class="btn-tool" @click="changeZoom(0.15)" title="Zoom In">+</button>
          <button class="btn-tool btn-fit" @click="fitZoom" title="Auto Fit to Screen">Fit</button>
        </div>

        <div class="header-divider"></div>

        <button
          type="button"
          class="btn btn-secondary btn-sm header-action-btn"
          @click="openImportHtmlModal"
          title="Import or replace with raw HTML and CSS"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Import HTML/CSS</span>
        </button>

        <button
          type="button"
          class="btn btn-secondary btn-sm header-action-btn"
          @click="openPublishModal"
          title="Increment version number and archive snapshot"
        >
          Publish Version
        </button>

        <button class="btn btn-primary btn-sm btn-save-primary" @click="saveTemplate(false)" :disabled="saving">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
          </svg>
          <span>{{ saving ? 'Saving…' : 'Save Draft' }}</span>
        </button>

        <span v-if="saveStatus === 'saved'" class="status-pill text-success">
          ✓ Saved
        </span>
        <span v-else-if="saveStatus && saveStatus.startsWith('Undo')" class="status-pill text-info">
          {{ saveStatus }}
        </span>
        <span v-else-if="saveStatus && saveStatus.startsWith('Redo')" class="status-pill text-info">
          {{ saveStatus }}
        </span>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- STUDIO CONTENT PANES                                                -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="studio-body">
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: A4 DOCUMENT DESIGNER (WYSIWYG PAPER CANVAS & THUMBNAILS)     -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'builder'" class="builder-three-pane" :class="{ 'left-collapsed': isLeftCollapsed, 'right-collapsed': isRightCollapsed, 'in-iframe': isInIframe }">
        <!-- LEFT: BLOCK PALETTE, PREBUILT LEGAL BLOCKS & VARIABLE PICKER -->
        <aside class="palette-sidebar" :class="{ 'is-collapsed': isLeftCollapsed }">
          <!-- COLLAPSED RAIL -->
          <div v-if="isLeftCollapsed" class="palette-collapsed-rail">
            <button
              type="button"
              class="btn-rail-toggle"
              @click="toggleLeftPane"
              title="Expand Components Palette"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div class="rail-divider"></div>
            <button
              type="button"
              class="btn-rail-icon"
              :class="{ active: paletteTab === 'blocks' }"
              @click="isLeftCollapsed = false; paletteTab = 'blocks'"
              title="Document Components"
            >
              🧩
            </button>
            <button
              type="button"
              class="btn-rail-icon"
              :class="{ active: paletteTab === 'prebuilt' }"
              @click="isLeftCollapsed = false; paletteTab = 'prebuilt'"
              title="360GI Prebuilt Clauses"
            >
              🏢
            </button>
            <button
              type="button"
              class="btn-rail-icon"
              :class="{ active: paletteTab === 'layers' }"
              @click="isLeftCollapsed = false; openLayersTab()"
              title="Layers &amp; Hierarchy"
            >
              📑
            </button>
            <button
              type="button"
              class="btn-rail-icon"
              :class="{ active: paletteTab === 'tokens' }"
              @click="isLeftCollapsed = false; paletteTab = 'tokens'"
              title="Variables"
            >
              💲
            </button>
          </div>

          <!-- EXPANDED PALETTE CONTENT -->
          <template v-else>
            <div class="palette-tabs-nav-wrap">
              <div class="palette-header-row">
                <span class="palette-panel-title">COMPONENTS</span>
                <button
                  type="button"
                  class="btn-panel-collapse"
                  @click="toggleLeftPane"
                  title="Collapse Palette (Maximize Document Canvas)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              </div>
              <div class="palette-tabs-nav">
              <button
                class="palette-subtab"
                :class="{ active: paletteTab === 'blocks' }"
                @click="paletteTab = 'blocks'"
              >
                Blocks
              </button>
              <button
                class="palette-subtab"
                :class="{ active: paletteTab === 'prebuilt' }"
                @click="paletteTab = 'prebuilt'"
              >
                360GI
              </button>
              <button
                class="palette-subtab"
                :class="{ active: paletteTab === 'layers' }"
                @click="openLayersTab"
                title="Inspect &amp; select document layers"
              >
                <span>Layers</span>
                <span v-if="scannedLayers.length" class="subtab-badge">{{ scannedLayers.length }}</span>
              </button>
              <button
                class="palette-subtab"
                :class="{ active: paletteTab === 'tokens' }"
                @click="paletteTab = 'tokens'"
              >
                Variables
              </button>
            </div>
          </div>

          <!-- SUBTAB A: STANDARD & BILINGUAL BLOCKS -->
          <div v-if="paletteTab === 'blocks'" class="sidebar-section">
            <h4 class="palette-title">Document Components</h4>
            <div class="palette-grid">
              <button
                type="button"
                class="palette-btn highlight-btn"
                @click="addComponent('bilingual_clause')"
                title="50/50 English LTR & Arabic RTL Side-by-Side Clause"
              >
                <div class="btn-icon">🌐</div>
                <div class="btn-text">
                  <strong>Bilingual Clause (EN/AR)</strong>
                  <span>Two-column 50/50 side-by-side with central divider</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('clause')"
              >
                <div class="btn-icon">📝</div>
                <div class="btn-text">
                  <strong>Standard Clause</strong>
                  <span>Single language paragraph / section</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('heading')"
              >
                <div class="btn-icon">🔤</div>
                <div class="btn-text">
                  <strong>Heading / Title</strong>
                  <span>Document title or major section heading</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('table')"
              >
                <div class="btn-icon">📊</div>
                <div class="btn-text">
                  <strong>Data / Fee Table</strong>
                  <span>Multi-column pricing or fee matrix</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('key_value')"
              >
                <div class="btn-icon">📑</div>
                <div class="btn-text">
                  <strong>Applicant Info Grid</strong>
                  <span>Key/value 2-column applicant metadata</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('signature')"
              >
                <div class="btn-icon">✍️</div>
                <div class="btn-text">
                  <strong>Signature Execution Box</strong>
                  <span>Digital signing line & timestamp block</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="addComponent('divider')"
              >
                <div class="btn-icon">➖</div>
                <div class="btn-text">
                  <strong>Divider Line</strong>
                  <span>Horizontal visual separator</span>
                </div>
              </button>
            </div>
          </div>

          <!-- SUBTAB B: PREBUILT 360 GLOBAL IMMIGRATION LEGAL BLOCKS -->
          <div v-if="paletteTab === 'prebuilt'" class="sidebar-section">
            <h4 class="palette-title">360GI Prebuilt Clauses</h4>
            <p class="section-hint">Click any prebuilt block to insert it directly into the active A4 page.</p>

            <div class="palette-grid">
              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('cover_header')"
              >
                <div class="btn-icon">🏢</div>
                <div class="btn-text">
                  <strong>360GI Logo & Title Header</strong>
                  <span>Official bilingual title block</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('agreement_main')"
              >
                <div class="btn-icon">📜</div>
                <div class="btn-text">
                  <strong>Recitals & Appointment (EN/AR)</strong>
                  <span>Clauses 1 to 7 with 80% refund terms</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('terms_business')"
              >
                <div class="btn-icon">⚖️</div>
                <div class="btn-text">
                  <strong>Terms of Business (12 Clauses)</strong>
                  <span>DIFC Courts jurisdiction & English precedence</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('schedule_one')"
              >
                <div class="btn-icon">👤</div>
                <div class="btn-text">
                  <strong>Schedule 1: Applicant Details</strong>
                  <span>Bilingual applicant fields with tokens</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('schedule_two')"
              >
                <div class="btn-icon">📋</div>
                <div class="btn-text">
                  <strong>Schedule 2: Scope of Services</strong>
                  <span>Pre-visa and post-visa immigration scope</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('schedule_three')"
              >
                <div class="btn-icon">💳</div>
                <div class="btn-text">
                  <strong>Schedule 3: Fees & Payments</strong>
                  <span>Professional fee, discount & payment mode</span>
                </div>
              </button>

              <button
                type="button"
                class="palette-btn"
                @click="insertPrebuilt('declaration')"
              >
                <div class="btn-icon">🛡️</div>
                <div class="btn-text">
                  <strong>Declaration & Acknowledgement</strong>
                  <span>Bilingual client legal undertaking</span>
                </div>
              </button>
            </div>
          </div>

          <!-- SUBTAB: LAYERS & DOCUMENT HIERARCHY -->
          <div v-if="paletteTab === 'layers'" class="sidebar-section layers-drawer">
            <div class="layers-header-block">
              <div class="layers-title-row">
                <div class="title-with-icon">
                  <div class="layer-icon-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="palette-heading">Layers &amp; Hierarchy</h4>
                    <span class="layers-subtext">Click any layer to select in canvas</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-icon-refresh"
                  @click="refreshLayersList"
                  title="Re-scan document layers"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              </div>

              <!-- Page filter dropdown with custom chevron -->
              <div class="layer-filter-row">
                <div class="custom-select-wrap">
                  <select v-model="layerPageFilter" class="layer-page-select">
                    <option :value="-1">All Pages ({{ isHtmlTemplate ? htmlPageList.length : pages.length }} Pages)</option>
                    <option
                      v-for="(pg, idx) in (isHtmlTemplate ? htmlPageList : pages)"
                      :key="idx"
                      :value="idx"
                    >
                      Page {{ idx + 1 }}: {{ pg.title || `Page ${idx + 1}` }}
                    </option>
                  </select>
                  <svg class="select-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              <!-- Search in layers with embedded magnifying lens -->
              <div class="layer-search-wrap">
                <svg class="search-lens-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  v-model="layerSearchQuery"
                  placeholder="Filter layers by name or text…"
                  class="layer-search-input"
                />
                <button v-if="layerSearchQuery" type="button" class="clear-search-btn" @click="layerSearchQuery = ''">✕</button>
              </div>
            </div>

            <!-- Grouped Layers List -->
            <div class="layers-tree-list">
              <div
                v-for="group in groupedLayers"
                :key="group.pageIndex"
                class="layer-page-group"
              >
                <!-- Group Header / Page Card -->
                <div
                  class="layer-group-header"
                  :class="{ 'is-active-page': activePageIndex === group.pageIndex }"
                  @click="scrollToHtmlPage(group.pageIndex)"
                >
                  <div class="group-left">
                    <span class="group-page-tag">Page {{ group.pageNumber }}</span>
                    <span class="group-title-label" :title="group.title">{{ group.title }}</span>
                  </div>
                  <span class="group-count-pill">{{ group.layers.length }}</span>
                </div>

                <!-- Layers inside this page -->
                <div class="layer-group-body">
                  <div
                    v-for="layer in group.layers"
                    :key="layer.id"
                    class="layer-item-card"
                    :class="{
                      'layer-selected': layer.isSelected,
                      'is-row': layer.isRow
                    }"
                    @click="selectLayerFromTree(layer)"
                    @mouseenter="onLayerHover(layer, true)"
                    @mouseleave="onLayerHover(layer, false)"
                  >
                    <div class="layer-item-left">
                      <div class="layer-icon-chip" :class="'chip-' + layer.type" :title="layer.typeLabel">
                        <span>{{ layer.icon }}</span>
                      </div>
                      <div class="layer-text-wrap">
                        <div class="layer-title-line">
                          <span class="layer-title" :title="layer.title">{{ layer.title }}</span>
                          <span class="layer-tag-badge">{{ layer.tagName.toUpperCase() }}</span>
                        </div>
                        <div v-if="layer.subtitle" class="layer-desc" :title="layer.subtitle">
                          {{ layer.subtitle }}
                        </div>
                      </div>
                    </div>

                    <!-- Row / Layer Quick Actions -->
                    <div class="layer-item-actions" @click.stop>
                      <button
                        type="button"
                        class="layer-btn-xs"
                        @click="moveLayer(layer, -1)"
                        title="Move Row Up (▲)"
                      >▲</button>
                      <button
                        type="button"
                        class="layer-btn-xs"
                        @click="moveLayer(layer, 1)"
                        title="Move Row Down (▼)"
                      >▼</button>
                      <button
                        type="button"
                        class="layer-btn-xs"
                        @click="duplicateLayer(layer)"
                        title="Duplicate Row (📋)"
                      >📋</button>
                      <button
                        type="button"
                        class="layer-btn-xs text-danger"
                        @click="deleteLayer(layer)"
                        title="Delete Row (🗑️)"
                      >✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="groupedLayers.length === 0" class="empty-layers-state">
                <div class="empty-icon">🔍</div>
                <p>No layers match your search filter.</p>
              </div>
            </div>
          </div>

          <!-- SUBTAB C: QUICK VARIABLE TOKEN INSERTER -->
          <div v-if="paletteTab === 'tokens'" class="sidebar-section variable-drawer">
            <h4 class="palette-title">Insert Dynamic Token</h4>
            <input
              type="text"
              v-model="varSearch"
              placeholder="Search variables…"
              class="token-search"
            />
            <div class="token-list">
              <div
                v-for="v in filteredVariables"
                :key="v.token"
                class="token-item"
                @click="insertTokenIntoSelected(v.token)"
                title="Click to insert into selected text/clause"
              >
                <code>{{ varTag(v.token) }}</code>
                <span class="token-desc">{{ v.label }} ({{ v.source }})</span>
              </div>
            </div>
          </div>
          </template>
        </aside>

        <!-- CENTER: A4 PAPER DOCUMENT CANVAS & BOTTOM THUMBNAIL BAR -->
        <main class="canvas-area-wrapper">
          <!-- Document General Meta Header -->
          <div class="canvas-top-meta">
            <div class="meta-row">
              <span class="meta-label">Contract:</span>
              <input
                type="text"
                v-model="documentSchema.title"
                class="doc-title-inline"
                placeholder="Contract Title"
                title="Click to edit document title"
              />
            </div>
            <div class="meta-pills">
              <span class="pill">Type: <strong>{{ contractType }}</strong></span>
              <span class="pill">Validity: <strong>{{ validityDays }}d</strong></span>
              <span class="pill" v-if="associatedForm" :title="associatedForm.name">
                Form: <strong>{{ associatedForm.name.length > 22 ? associatedForm.name.substring(0, 22) + '…' : associatedForm.name }}</strong>
              </span>
              <span class="pill pill-accent">Pages: <strong>{{ isHtmlTemplate ? htmlPageList.length : pages.length }}</strong></span>
            </div>
          </div>

          <!-- SCROLLABLE ZOOMABLE A4 WORKSPACE -->
          <div class="a4-scroll-viewport" :style="{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }">
            <!-- If raw HTML template -->
            <div v-if="documentSchema.rawHtml" class="html-canvas-view" style="position: relative;">
              <!-- Floating Row / Element Quick Action Toolbar -->
              <div
                v-if="isHtmlTemplate && floatingToolbarPos.visible && activeSelectedDomEl"
                class="canvas-floating-toolbar"
                :style="{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }"
                @click.stop
              >
                <div class="float-tag">
                  <span class="float-tag-name">&lt;{{ selectedHtmlTag }}&gt;</span>
                  <span v-if="hasSelectedRow" class="float-tag-sub">Row</span>
                </div>

                <button
                  v-if="!isTrSelected && hasSelectedRow"
                  type="button"
                  class="float-btn float-btn-primary"
                  @click="selectParentRow"
                  title="Select entire bilingual row (TR)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                  Select Row
                </button>

                <button
                  type="button"
                  class="float-btn"
                  @click="moveSelectedRow(-1)"
                  title="Move Row Up (▲)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  Up
                </button>

                <button
                  type="button"
                  class="float-btn"
                  @click="moveSelectedRow(1)"
                  title="Move Row Down (▼)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  Down
                </button>

                <button
                  type="button"
                  class="float-btn"
                  @click="duplicateSelectedRow"
                  title="Duplicate Row (📋)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Duplicate
                </button>

                <button
                  type="button"
                  class="float-btn float-btn-danger"
                  @click="deleteSelectedRow"
                  title="Delete Row (🗑️)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              </div>

              <div class="html-mode-banner glass-card" style="margin-bottom: 24px; padding: 16px 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <span class="badge badge-success" style="margin-bottom: 4px;">HTML &amp; CSS Paired-Table Template (12 Pages)</span>
                    <h4 style="margin: 0; font-size: 1.05rem;">{{ documentSchema.title || templateName }}</h4>
                    <p style="margin: 2px 0 0; font-size: 0.82rem; color: #64748b;">
                      High-fidelity paired-table layout with Arabic RTL &amp; English LTR synchronization.
                    </p>
                  </div>
                  <div style="display:flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary btn-sm" @click="activeTab = 'code'">
                      💻 Edit HTML / CSS Source
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" @click="activeTab = 'preview'">
                      👁️ Full Page Live Preview
                    </button>
                  </div>
                </div>
              </div>
              <div
                id="html-studio-canvas"
                class="html-canvas-inner interactive-html-canvas"
                v-html="canvasContent"
                @click="onHtmlCanvasClick"
                @input="onHtmlCanvasInput"
                @dragover.prevent
                @drop="onDropOnHtmlCanvas($event)"
              ></div>
            </div>

            <!-- Standard structured pages mode -->
            <template v-else>
              <div
                v-for="(page, pIdx) in pages"
                :key="page.id"
                :id="`page-card-${pIdx}`"
                class="a4-page-frame"
                :class="{
                  'selected-page': activePageIndex === pIdx,
                  'has-legal-border': page.hasBorder !== false
                }"
                @click="activePageIndex = pIdx"
              >
              <!-- Page Header -->
              <div class="a4-page-header">
                <span class="header-brand">360 GLOBAL IMMIGRATION</span>
                <span class="header-title">{{ documentSchema.title || 'Legal Services Agreement' }}</span>
                <div class="header-controls">
                  <label class="border-toggle" @click.stop title="Toggle Page Outer Legal Double Border">
                    <input type="checkbox" v-model="page.hasBorder" />
                    <span>Border</span>
                  </label>
                </div>
              </div>

              <!-- Page Body Components Container -->
              <div class="a4-page-body" @dragover.prevent @drop="onDropOnPage(pIdx, $event)">
                <div v-if="!page.components || page.components.length === 0" class="page-empty-dropzone">
                  <p>Page {{ pIdx + 1 }} is empty.</p>
                  <small>Click any block from the left panel to add content here.</small>
                </div>

                <div
                  v-for="(comp, cIdx) in (page.components || [])"
                  :key="comp.id"
                  class="a4-component-card"
                  :class="{ selected: selectedComponentId === comp.id }"
                  @click.stop="selectComponent(page.id, comp.id)"
                >
                  <!-- Component Action Ribbon -->
                  <div class="comp-ribbon">
                    <span class="comp-type-badge">{{ getCompLabel(comp.type) }}</span>

                    <div class="comp-actions">
                      <button
                        type="button"
                        class="btn-tool-mini"
                        :disabled="cIdx === 0"
                        @click.stop="moveComponent(pIdx, cIdx, -1)"
                        title="Move Up"
                      >▲</button>
                      <button
                        type="button"
                        class="btn-tool-mini"
                        :disabled="cIdx === page.components.length - 1"
                        @click.stop="moveComponent(pIdx, cIdx, 1)"
                        title="Move Down"
                      >▼</button>
                      <button
                        type="button"
                        class="btn-tool-mini"
                        @click.stop="duplicateComponent(pIdx, comp)"
                        title="Duplicate"
                      >📋</button>
                      <button
                        type="button"
                        class="btn-tool-mini btn-danger"
                        @click.stop="deleteComponent(pIdx, comp.id)"
                        title="Delete"
                      >✕</button>
                    </div>
                  </div>

                  <!-- 1. BILINGUAL CLAUSE (50/50 ENGLISH & ARABIC) -->
                  <div v-if="comp.type === 'bilingual_clause' || comp.bilingual" class="bilingual-render-box">
                    <div class="bilingual-grid">
                      <!-- English Column LTR -->
                      <div class="bilingual-col col-en" dir="ltr">
                        <input
                          type="text"
                          v-model="comp.titleEn"
                          class="comp-title-edit"
                          placeholder="English Clause Title..."
                        />
                        <textarea
                          v-model="comp.contentEn"
                          class="comp-textarea-edit"
                          rows="4"
                          placeholder="English body text. Supports HTML & {{tokens}}..."
                        ></textarea>
                      </div>

                      <!-- Center Divider -->
                      <div class="bilingual-center-line"></div>

                      <!-- Arabic Column RTL -->
                      <div class="bilingual-col col-ar" dir="rtl">
                        <input
                          type="text"
                          v-model="comp.titleAr"
                          class="comp-title-edit ar-text"
                          placeholder="عنوان البند بالعربية..."
                        />
                        <textarea
                          v-model="comp.contentAr"
                          class="comp-textarea-edit ar-text"
                          rows="4"
                          placeholder="نص البند باللغة العربية مع دعم {{tokens}}..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- 2. STANDARD CLAUSE -->
                  <div v-else-if="comp.type === 'clause'" class="standard-clause-box">
                    <input
                      type="text"
                      v-model="comp.title"
                      class="comp-title-edit"
                      placeholder="Clause Title (e.g. 1. Confidentiality)"
                    />
                    <textarea
                      v-model="comp.content"
                      class="comp-textarea-edit"
                      rows="3"
                      placeholder="Clause body text..."
                    ></textarea>
                  </div>

                  <!-- 3. HEADING -->
                  <div v-else-if="comp.type === 'heading'" class="heading-render-box">
                    <input
                      type="text"
                      v-model="comp.content"
                      class="comp-heading-edit"
                      :placeholder="`Heading Level ${comp.level || 2}`"
                    />
                  </div>

                  <!-- 4. TABLE -->
                  <div v-else-if="comp.type === 'table'" class="table-render-box">
                    <input
                      type="text"
                      v-model="comp.title"
                      class="comp-title-edit"
                      placeholder="Table Title"
                    />
                    <table class="a4-builder-table">
                      <thead>
                        <tr>
                          <th v-for="(h, hi) in (comp.headers || ['Item', 'Quantity', 'Rate', 'Total'])" :key="hi">
                            <input type="text" v-model="comp.headers[hi]" class="tbl-input tbl-header" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in (comp.rows || [['Standard Application', '1', '€5,000', '€5,000']])" :key="ri">
                          <td v-for="(cell, ci) in row" :key="ci">
                            <input type="text" v-model="comp.rows[ri][ci]" class="tbl-input" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 5. KEY/VALUE GRID -->
                  <div v-else-if="comp.type === 'key_value'" class="kv-render-box">
                    <input
                      type="text"
                      v-model="comp.title"
                      class="comp-title-edit"
                      placeholder="Section Title"
                    />
                    <div class="kv-grid-2col">
                      <div v-for="(val, key) in (comp.data || { 'Client': '{{client_name}}', 'Passport': '{{passport_number}}' })" :key="key" class="kv-pair">
                        <span class="kv-lbl">{{ key }}:</span>
                        <span class="kv-val">{{ val }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 6. SIGNATURE BLOCK -->
                  <div v-else-if="comp.type === 'signature'" class="sig-render-box">
                    <input
                      type="text"
                      v-model="comp.label"
                      class="sig-label-edit"
                      placeholder="Signature Section Label"
                    />
                    <div class="sig-placeholder-area">
                      <span>✕ Client / Authorized Party Signature will be captured & timestamped here</span>
                    </div>
                  </div>

                  <!-- 7. DIVIDER -->
                  <div v-else-if="comp.type === 'divider'" class="divider-render-box">
                    <hr class="a4-hr" />
                  </div>
                </div>
              </div>

              <!-- Page Footer -->
              <div class="a4-page-footer">
                <span class="footer-left">Ref: {{ templateName }}</span>
                <span class="footer-center">360 Global Immigration LLC • Confidential & Legal</span>
                <span class="footer-right">Page {{ pIdx + 1 }} of {{ pages.length }}</span>
              </div>
            </div>
            </template>
          </div>

          <!-- BOTTOM A4 PAGE THUMBNAILS STRIP -->
          <footer class="bottom-page-strip" :class="{ 'is-minimized': isBottomStripCollapsed }">
            <div class="strip-header">
              <div class="strip-header-left">
                <button
                  type="button"
                  class="btn-toggle-strip"
                  @click="toggleBottomStrip"
                  :title="isBottomStripCollapsed ? 'Expand Page Navigation' : 'Minimize Page Navigation'"
                >
                  <svg v-if="isBottomStripCollapsed" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  <span>{{ isBottomStripCollapsed ? '▲ Pages' : '▼ Hide' }}</span>
                </button>
                <span class="strip-label">
                  Page {{ activePageIndex + 1 }} of {{ isHtmlTemplate ? htmlPageList.length : pages.length }}
                </span>
                <span v-if="isHtmlTemplate" class="badge badge-success badge-sm" style="font-size: 0.68rem; padding: 2px 7px;">
                  12-Page Bilingual HTML Template
                </span>
              </div>

              <!-- Quick Prev/Next Navigation Controls -->
              <div class="strip-header-right">
                <div class="page-quick-nav">
                  <button
                    type="button"
                    class="btn-nav-step"
                    :disabled="activePageIndex <= 0"
                    @click="scrollToHtmlPage(activePageIndex - 1)"
                    title="Previous Page"
                  >
                    ‹ Prev
                  </button>
                  <span class="page-step-num">{{ activePageIndex + 1 }} / {{ isHtmlTemplate ? htmlPageList.length : pages.length }}</span>
                  <button
                    type="button"
                    class="btn-nav-step"
                    :disabled="activePageIndex >= (isHtmlTemplate ? htmlPageList.length - 1 : pages.length - 1)"
                    @click="scrollToHtmlPage(activePageIndex + 1)"
                    title="Next Page"
                  >
                    Next ›
                  </button>
                </div>

                <button v-if="!isHtmlTemplate" type="button" class="btn btn-secondary btn-sm" @click="addNewPage">
                  + Add Page
                </button>
              </div>
            </div>

            <!-- If HTML Template: Render 12 Paired-Table Page Thumbnails -->
            <div v-show="!isBottomStripCollapsed" v-if="isHtmlTemplate" class="strip-thumbnails-scroll">
              <div
                v-for="(pg, idx) in htmlPageList"
                :key="idx"
                class="page-thumbnail-card html-page-card"
                :class="{ active: activePageIndex === idx }"
                @click="scrollToHtmlPage(idx)"
              >
                <div class="thumbnail-preview" :class="{ 'thumb-cover': pg.isCover }">
                  <div class="thumb-top-accent" :class="{ 'accent-gold': pg.isCover }"></div>
                  
                  <!-- Cover layout preview -->
                  <div v-if="pg.isCover" class="thumb-cover-body">
                    <div class="thumb-cover-text">AGREEMENT</div>
                    <div class="thumb-cover-line"></div>
                    <div class="thumb-cover-logo">❖</div>
                  </div>

                  <!-- Bilingual paired table preview -->
                  <div v-else class="thumb-bilingual-body">
                    <div class="thumb-col-half en-half">
                      <div class="thumb-col-bar w-80"></div>
                      <div class="thumb-col-bar w-100"></div>
                      <div class="thumb-col-bar w-60"></div>
                    </div>
                    <div class="thumb-col-divider"></div>
                    <div class="thumb-col-half ar-half">
                      <div class="thumb-col-bar w-80"></div>
                      <div class="thumb-col-bar w-100"></div>
                      <div class="thumb-col-bar w-60"></div>
                    </div>
                  </div>

                  <div class="thumb-bottom-row">
                    <span v-if="pg.isSign" class="thumb-sign-tag" title="Signature Zone">✍️</span>
                    <span class="thumb-page-num">{{ pg.pageNumber }}</span>
                  </div>
                </div>

                <div class="thumbnail-meta">
                  <span class="page-tag">Page {{ pg.pageNumber }}</span>
                  <small class="page-title-label" :title="pg.title">{{ pg.title }}</small>
                </div>
              </div>
            </div>

            <!-- Standard structured pages thumbnails -->
            <div v-else v-show="!isBottomStripCollapsed" class="strip-thumbnails-scroll">
              <div
                v-for="(pg, idx) in pages"
                :key="pg.id"
                class="page-thumbnail-card"
                :class="{ active: activePageIndex === idx }"
                @click="scrollToPage(idx)"
              >
                <div class="thumbnail-preview">
                  <div class="thumb-header-line"></div>
                  <div class="thumb-body-blocks">
                    <div
                      v-for="(c, ci) in (pg.components || []).slice(0, 5)"
                      :key="ci"
                      class="thumb-block-bar"
                      :class="c.type"
                    ></div>
                  </div>
                  <div class="thumb-footer-line"></div>
                </div>

                <div class="thumbnail-meta">
                  <span class="page-tag">Page {{ idx + 1 }}</span>
                  <div class="page-quick-actions">
                    <button
                      type="button"
                      class="btn-icon-xs"
                      :disabled="idx === 0"
                      @click.stop="movePage(idx, -1)"
                      title="Move Page Left"
                    >◀</button>
                    <button
                      type="button"
                      class="btn-icon-xs"
                      :disabled="idx === pages.length - 1"
                      @click.stop="movePage(idx, 1)"
                      title="Move Page Right"
                    >▶</button>
                    <button
                      type="button"
                      class="btn-icon-xs"
                      @click.stop="duplicatePage(idx)"
                      title="Duplicate Page"
                    >📋</button>
                    <button
                      type="button"
                      class="btn-icon-xs text-danger"
                      :disabled="pages.length <= 1"
                      @click.stop="deletePage(idx)"
                      title="Delete Page"
                    >✕</button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>

        <!-- RIGHT: COMPONENT & TYPOGRAPHY INSPECTOR -->
        <aside class="inspector-sidebar" :class="{ 'is-collapsed': isRightCollapsed }">
          <!-- COLLAPSED RAIL -->
          <div v-if="isRightCollapsed" class="inspector-collapsed-rail" @click="toggleRightPane" title="Click to Expand Inspector &amp; Properties">
            <button type="button" class="btn-rail-toggle" @click.stop="toggleRightPane">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="rail-vertical-text">PROPERTIES &amp; STYLES</span>
          </div>

          <!-- EXPANDED INSPECTOR CONTENT -->
          <template v-else>
            <div class="inspector-top-collapse-bar">
              <span class="inspector-panel-title">INSPECTOR &amp; STYLES</span>
              <button
                type="button"
                class="btn-panel-collapse"
                @click="toggleRightPane"
                title="Collapse Inspector (Maximize Document Canvas)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          <!-- ── 1. HTML TEMPLATE MODE: ELEMENT SELECTED ── -->
          <div v-if="isHtmlTemplate && selectedHtmlNode" class="inspector-content">
            <!-- Interactive DOM Breadcrumbs Bar -->
            <div class="dom-breadcrumbs">
              <span class="breadcrumb-chip" @click="scrollToHtmlPage(activePageIndex)" title="Scroll to Current Page">
                📄 Page {{ activePageIndex + 1 }}
              </span>
              <span class="breadcrumb-arrow">›</span>
              <span
                v-if="hasSelectedRow"
                class="breadcrumb-chip clickable"
                @click="selectParentRow"
                title="Select parent bilingual row (&lt;tr&gt;)"
              >
                &lt;tr&gt; Row
              </span>
              <span v-if="hasSelectedRow" class="breadcrumb-arrow">›</span>
              <span class="breadcrumb-chip current-chip">
                &lt;{{ selectedHtmlTag }}&gt;
              </span>
            </div>

            <div class="inspector-header">
              <div>
                <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 3px;">
                  <span class="badge badge-primary badge-sm">&lt;{{ selectedHtmlTag }}&gt;</span>
                  <span class="badge badge-neutral badge-sm">{{ selectedHtmlDir === 'rtl' ? 'Arabic (RTL)' : 'English (LTR)' }}</span>
                </div>
                <h3 class="inspector-title" style="font-size: 0.88rem; font-family: monospace;">
                  {{ selectedHtmlClass ? '.' + selectedHtmlClass.split(' ')[0] : 'HTML Element' }}
                </h3>
              </div>
              <button type="button" class="btn-icon-xs text-danger" @click="clearHtmlSelection" title="Deselect">✕</button>
            </div>

            <!-- Content Editor -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Text &amp; Clause Content</h4>
              <textarea
                v-model="selectedHtmlText"
                @input="updateSelectedHtmlText(selectedHtmlText)"
                class="form-control"
                rows="4"
                :dir="selectedHtmlDir"
                style="font-size: 0.82rem; line-height: 1.45;"
              ></textarea>
              <small class="text-muted" style="display: block; margin-top: 4px; font-size: 0.72rem;">
                ✏️ Direct inline typing in document canvas is also supported.
              </small>
            </div>

            <!-- Typography & Direction -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Typography &amp; Direction</h4>

              <div class="form-group">
                <label class="form-label">Font Family</label>
                <select
                  v-model="selectedHtmlFontFamily"
                  @change="updateSelectedHtmlStyle('fontFamily', selectedHtmlFontFamily)"
                  class="form-control"
                >
                  <option value="Inter, 'Segoe UI', Arial, sans-serif">Inter (Modern Clean Sans)</option>
                  <option value="'Noto Sans Arabic', Tahoma, sans-serif">Noto Sans Arabic (Official Arabic)</option>
                  <option value="'Cairo', sans-serif">Cairo (Standard Arabic/English)</option>
                  <option value="'Amiri', serif">Amiri (Classical Arabic Serif)</option>
                  <option value="Georgia, serif">Georgia (Traditional Legal)</option>
                </select>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Font Size</label>
                  <select
                    v-model="selectedHtmlFontSize"
                    @change="updateSelectedHtmlStyle('fontSize', selectedHtmlFontSize)"
                    class="form-control"
                  >
                    <option value="7.6pt">7.6pt (Fine print)</option>
                    <option value="7.9pt">7.9pt (Body compact)</option>
                    <option value="8.45pt">8.45pt (Standard body)</option>
                    <option value="10.2pt">10.2pt (Section title)</option>
                    <option value="12pt">12pt (Subheading)</option>
                    <option value="16pt">16pt (Heading)</option>
                    <option value="21pt">21pt (Cover title)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Direction</label>
                  <select
                    v-model="selectedHtmlDir"
                    @change="updateSelectedHtmlDir(selectedHtmlDir)"
                    class="form-control"
                  >
                    <option value="ltr">LTR (English)</option>
                    <option value="rtl">RTL (Arabic)</option>
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Font Weight</label>
                  <select
                    v-model="selectedHtmlFontWeight"
                    @change="updateSelectedHtmlStyle('fontWeight', selectedHtmlFontWeight)"
                    class="form-control"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra-Bold (800)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Text Align</label>
                  <select
                    v-model="selectedHtmlTextAlign"
                    @change="updateSelectedHtmlStyle('textAlign', selectedHtmlTextAlign)"
                    class="form-control"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Dynamic Variables Quick Inserter -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Insert Dynamic Variable Token</h4>
              <p class="text-muted" style="font-size: 0.72rem; margin-bottom: 6px;">
                Click to insert token into this element:
              </p>
              <div class="quick-token-wrap">
                <button
                  v-for="v in quickVariables"
                  :key="v"
                  type="button"
                  class="token-chip-btn"
                  @click="insertDynamicTokenToElement(v)"
                >
                  + &#123;&#123;{{ v }}&#125;&#125;
                </button>
              </div>
            </div>

            <!-- Row & Element Operations -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Row &amp; Element Actions</h4>
              
              <div v-if="hasSelectedRow && !isTrSelected" style="margin-bottom: 8px;">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600;"
                  @click="selectParentRow"
                  title="Select the entire bilingual row (TR)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                  <span>Select Entire Bilingual Row</span>
                </button>
              </div>

              <div class="row-actions-grid">
                <button
                  type="button"
                  class="row-action-btn"
                  @click="moveSelectedRow(-1)"
                  title="Move Row Up (▲)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  <span>Move Up</span>
                </button>

                <button
                  type="button"
                  class="row-action-btn"
                  @click="moveSelectedRow(1)"
                  title="Move Row Down (▼)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  <span>Move Down</span>
                </button>

                <button
                  type="button"
                  class="row-action-btn"
                  @click="duplicateSelectedRow"
                  title="Duplicate Row (📋)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  class="row-action-btn text-danger"
                  @click="deleteSelectedRow"
                  title="Delete Row (🗑️)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <span>Delete Row</span>
                </button>
              </div>

              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button type="button" class="btn btn-secondary btn-sm" style="flex:1;" @click="clearHtmlSelection">
                  Done Editing
                </button>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="deleteSelectedHtmlElement" title="Delete only this element">
                  Delete Element
                </button>
              </div>
            </div>
          </div>

          <!-- ── 2. HTML TEMPLATE MODE: NO ELEMENT SELECTED ── -->
          <div v-else-if="isHtmlTemplate" class="inspector-empty">
            <div class="empty-icon">🎯</div>
            <div class="badge badge-success badge-sm" style="margin-bottom: 6px;">Interactive Selection Active</div>
            <h4 style="margin: 0 0 6px;">Click Any Element to Edit</h4>
            <p style="font-size: 0.8rem; color: #64748b; line-height: 1.4; margin-bottom: 16px;">
              Hover and click on any clause, paragraph, heading, or dynamic token in the document canvas to edit text and styling directly.
            </p>
            <div style="text-align: left; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Quick Insert Tokens:</span>
              <div class="quick-token-wrap" style="margin-top: 6px;">
                <button
                  v-for="v in quickVariables.slice(0, 8)"
                  :key="v"
                  type="button"
                  class="token-chip-btn"
                  @click="insertDynamicTokenToElement(v)"
                >
                  + &#123;&#123;{{ v }}&#125;&#125;
                </button>
              </div>
            </div>
          </div>

          <!-- ── 3. STRUCTURED PAGES MODE: COMPONENT SELECTED ── -->
          <div v-else-if="selectedComponent" class="inspector-content">
            <div class="inspector-header">
              <div>
                <h3 class="inspector-title">Block Properties</h3>
                <span class="text-muted" style="font-size: 0.75rem;">Page {{ activePageIndex + 1 }} • {{ selectedComponent.type }}</span>
              </div>
              <span class="badge badge-primary">{{ selectedComponent.type }}</span>
            </div>

            <!-- Typography & Font Controls -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Typography & Direction</h4>

              <div class="form-group">
                <label class="form-label">Font Family</label>
                <select v-model="selectedComponent.fontFamily" class="form-control">
                  <option value="Inter, sans-serif">Inter (Modern Clean Sans)</option>
                  <option value="'Cairo', sans-serif">Cairo (Standard Arabic/English)</option>
                  <option value="'Amiri', serif">Amiri (Classical Arabic Serif)</option>
                  <option value="Georgia, serif">Georgia (Traditional Legal Serif)</option>
                  <option value="Arial, sans-serif">Arial</option>
                </select>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Font Size</label>
                  <select v-model="selectedComponent.fontSize" class="form-control">
                    <option value="8pt">8pt (Fine print)</option>
                    <option value="8.5pt">8.5pt (Bilingual body)</option>
                    <option value="9pt">9pt (Standard body)</option>
                    <option value="10pt">10pt (Medium)</option>
                    <option value="11pt">11pt (Subheading)</option>
                    <option value="14pt">14pt (Heading)</option>
                    <option value="18pt">18pt (Doc Title)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Text Direction</label>
                  <select v-model="selectedComponent.dir" class="form-control">
                    <option value="auto">Auto</option>
                    <option value="ltr">LTR (English)</option>
                    <option value="rtl">RTL (Arabic)</option>
                  </select>
                </div>
              </div>

              <div class="form-check-group" v-if="selectedComponent.type === 'bilingual_clause' || selectedComponent.type === 'clause'">
                <label class="check-label">
                  <input type="checkbox" v-model="selectedComponent.emphasis" />
                  <span>Highlight / Emphasis Box (Amber outline)</span>
                </label>
              </div>
            </div>

            <!-- Bilingual Specific Fields -->
            <div v-if="selectedComponent.type === 'bilingual_clause' || selectedComponent.bilingual" class="inspector-section">
              <h4 class="section-subtitle">Bilingual Content</h4>

              <div class="form-group">
                <label class="form-label">English Section Title</label>
                <input type="text" v-model="selectedComponent.titleEn" class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Arabic Section Title (العنوان بالعربية)</label>
                <input type="text" v-model="selectedComponent.titleAr" class="form-control ar-text" dir="rtl" />
              </div>
            </div>

            <!-- Table Controls -->
            <div v-if="selectedComponent.type === 'table'" class="inspector-section">
              <h4 class="section-subtitle">Table Operations</h4>
              <div class="btn-group-row">
                <button type="button" class="btn btn-secondary btn-sm" @click="addTableRow">
                  + Add Row
                </button>
                <button type="button" class="btn btn-secondary btn-sm" @click="addTableColumn">
                  + Add Column
                </button>
              </div>
            </div>

            <!-- Conditional Clause Rules -->
            <div class="inspector-section">
              <h4 class="section-subtitle">Conditional Inclusion</h4>
              <p class="text-muted" style="font-size: 0.75rem; margin-bottom: var(--space-2);">
                Include this clause in the generated contract only if the intake form or contact matches this rule.
              </p>

              <div class="form-check-group">
                <label class="check-label">
                  <input type="checkbox" v-model="selectedComponent.hasCondition" />
                  <span>Make this block conditional</span>
                </label>
              </div>

              <div v-if="selectedComponent.hasCondition" class="condition-builder-box">
                <div class="form-group">
                  <label class="form-label">Field / Token</label>
                  <select v-model="selectedComponent.conditionField" class="form-control">
                    <option value="">-- Select Variable --</option>
                    <option
                      v-for="v in availableVariables"
                      :key="v.token"
                      :value="v.token"
                    >
                      {{ v.label }} ({{ v.token }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Condition</label>
                  <select v-model="selectedComponent.conditionOperator" class="form-control">
                    <option value="EQUALS">Equals</option>
                    <option value="NOT_EQUALS">Does not equal</option>
                    <option value="CONTAINS">Contains</option>
                    <option value="IS_EMPTY">Is empty</option>
                    <option value="IS_NOT_EMPTY">Is not empty</option>
                  </select>
                </div>

                <div class="form-group" v-if="!['IS_EMPTY', 'IS_NOT_EMPTY'].includes(selectedComponent.conditionOperator)">
                  <label class="form-label">Match Value</label>
                  <input
                    type="text"
                    v-model="selectedComponent.conditionValue"
                    class="form-control"
                    placeholder="e.g. Portugal D7 or Yes"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="inspector-empty">
            <div class="empty-icon">📄</div>
            <h4>No Block Selected</h4>
            <p>Click any clause, table, heading, or signature block on the A4 page to configure its properties.</p>
          </div>
          </template>
        </aside>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: ASSOCIATED FORM                                              -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'form'" class="tab-pane-container">
        <div class="glass-card panel-card">
          <div class="panel-card-header">
            <div>
              <h3>Associated Intake Form</h3>
              <p class="text-muted">
                Link an intake form that staff fill out to dynamically populate this legal contract.
              </p>
            </div>

            <div class="form-link-controls">
              <select v-model="selectedFormId" class="form-control" style="min-width: 240px;" @change="onFormChange">
                <option :value="null">-- No Associated Form --</option>
                <option v-for="f in availableForms" :key="f.id" :value="f.id">
                  {{ f.name }}
                </option>
              </select>

              <router-link
                v-if="selectedFormId"
                :to="`/forms/${selectedFormId}/builder`"
                class="btn btn-secondary"
              >
                Open Form Builder ↗
              </router-link>
            </div>
          </div>

          <div v-if="associatedForm" class="associated-form-preview">
            <div class="form-info-banner">
              <h4>{{ associatedForm.name }}</h4>
              <p class="text-muted">{{ associatedForm.description || 'No description provided.' }}</p>
            </div>

            <h4 style="margin: var(--space-4) 0 var(--space-2);">Form Fields Defined:</h4>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Field Label</th>
                    <th>Type</th>
                    <th>Contract Token</th>
                    <th>HighLevel Mapping</th>
                    <th>Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in formFieldsList" :key="f.id">
                    <td><strong>{{ f.label }}</strong></td>
                    <td><span class="badge badge-neutral">{{ f.type }}</span></td>
                    <td><code>{{ varTag(f.contractVariable || f.key) }}</code></td>
                    <td>
                      <span v-if="f.ghlFieldId" class="badge badge-info">{{ f.ghlFieldId }}</span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td>{{ f.required ? 'Yes' : 'No' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="empty-state-notice">
            <p>No intake form is attached to this template. Attach a form to define input fields and dynamic variables.</p>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: DYNAMIC VARIABLES                                            -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'variables'" class="tab-pane-container">
        <div class="glass-card panel-card">
          <div class="panel-card-header">
            <div>
              <h3>Contract Dynamic Variables</h3>
              <p class="text-muted">
                These tokens can be pasted into any clause, table, or title in your contract. They are replaced with live values before client view.
              </p>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Token Placeholder</th>
                  <th>Variable Name</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in availableVariables" :key="v.token">
                  <td><code>{{ varTag(v.token) }}</code></td>
                  <td><strong>{{ v.label }}</strong></td>
                  <td><span class="badge badge-neutral">{{ v.category }}</span></td>
                  <td>{{ v.source }}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      @click="copyToken(v.token)"
                    >
                      Copy Token
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 4: LIVE REAL-TIME CONTRACT PREVIEW                              -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'preview'" class="tab-pane-container live-preview-tab">
        <div class="preview-stage-container">
          <div class="preview-toolbar-box">
            <div class="preview-title-box">
              <h4>Real-Time A4 Multi-Page Document Preview</h4>
              <p class="text-muted small-text">Simulates the exact A4 layout rendered by the Playwright PDF engine.</p>
            </div>

            <div class="test-controls">
              <button type="button" class="btn btn-primary btn-sm" @click="exportPdf">
                📥 Download / Export A4 PDF
              </button>
            </div>
          </div>

          <!-- A4 Multi-Page Render Stream -->
          <div v-if="documentSchema.rawHtml" class="html-preview-stream" :style="{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }">
            <div class="html-preview-inner" v-html="renderedRawDocument"></div>
          </div>
          <div v-else class="a4-preview-stream">
            <div
              v-for="(page, pIdx) in pages"
              :key="page.id"
              class="a4-preview-page"
              :class="{ 'has-legal-border': page.hasBorder !== false }"
            >
              <div class="a4-page-header">
                <span class="header-brand">360 GLOBAL IMMIGRATION</span>
                <span class="header-title">{{ documentSchema.title || 'Legal Services Agreement' }}</span>
              </div>

              <div class="a4-preview-body">
                <template v-for="c in (page.components || [])" :key="c.id">
                  <!-- Bilingual Preview -->
                  <div v-if="c.type === 'bilingual_clause' || c.bilingual" class="bilingual-clause-preview">
                    <div class="bilingual-grid">
                      <div class="bilingual-col col-en" dir="ltr">
                        <h4 v-if="c.titleEn" class="clause-title-p">{{ c.titleEn }}</h4>
                        <div class="clause-body-p" v-html="renderTokens(c.contentEn)"></div>
                      </div>
                      <div class="bilingual-center-line"></div>
                      <div class="bilingual-col col-ar" dir="rtl">
                        <h4 v-if="c.titleAr" class="clause-title-p ar-text">{{ c.titleAr }}</h4>
                        <div class="clause-body-p ar-text" v-html="renderTokens(c.contentAr)"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Standard Clause Preview -->
                  <div v-else-if="c.type === 'clause'" class="clause-preview">
                    <h4 v-if="c.title" class="clause-title-p">{{ c.title }}</h4>
                    <div class="clause-body-p" v-html="renderTokens(c.content)"></div>
                  </div>

                  <!-- Heading Preview -->
                  <div v-else-if="c.type === 'heading'" class="heading-preview">
                    <h2 class="block-heading">{{ c.content || c.title }}</h2>
                  </div>

                  <!-- Table Preview -->
                  <div v-else-if="c.type === 'table'" class="table-preview">
                    <h4 v-if="c.title" class="clause-title-p">{{ c.title }}</h4>
                    <table class="data-table">
                      <thead v-if="c.headers">
                        <tr>
                          <th v-for="(h, hi) in c.headers" :key="hi">{{ h }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in (c.rows || [])" :key="ri">
                          <td v-for="(cell, ci) in row" :key="ci">{{ renderTokens(cell) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Key/Value Preview -->
                  <div v-else-if="c.type === 'key_value'" class="kv-preview">
                    <h4 v-if="c.title" class="clause-title-p">{{ c.title }}</h4>
                    <div class="kv-items-grid">
                      <div v-for="(v, k) in (c.data || {})" :key="k" class="kv-item">
                        <span class="kv-k"><strong>{{ k }}:</strong></span>
                        <span class="kv-v">{{ renderTokens(v) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Signature Preview -->
                  <div v-else-if="c.type === 'signature'" class="sig-preview-box">
                    <div class="sig-title">{{ c.label || 'Authorized Signature' }}</div>
                    <div class="sig-line-box">
                      <span>✕ Client Signature</span>
                    </div>
                  </div>

                  <!-- Divider -->
                  <div v-else-if="c.type === 'divider'" class="divider-preview">
                    <hr class="a4-hr" />
                  </div>
                </template>
              </div>

              <div class="a4-page-footer">
                <span class="footer-left">Ref: #DRAFT</span>
                <span class="footer-center">360 Global Immigration LLC • Confidential & Legal</span>
                <span class="footer-right">Page {{ pIdx + 1 }} of {{ pages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB CODE: HTML & CSS SOURCE EDITOR                                  -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'code'" class="tab-pane-container html-code-tab">
        <div class="code-editor-layout glass-card">
          <!-- Editor Controls Bar -->
          <div class="code-editor-bar">
            <div class="code-editor-title-wrap">
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;">
                <span class="badge badge-primary badge-sm">Source Code Studio</span>
                <span class="badge badge-neutral badge-sm">{{ codeSubTab === 'html' ? 'HTML 5' : 'CSS 3' }}</span>
              </div>
              <h3 style="margin: 4px 0 2px; font-size: 1.05rem; font-weight: 700;">Template Source Code</h3>
              <p class="text-muted small-text">Directly edit raw HTML markup, layout classes, responsive styles, and dynamic tokens.</p>
            </div>

            <div class="code-subtabs">
              <button
                type="button"
                class="code-subtab-btn"
                :class="{ active: codeSubTab === 'html' }"
                @click="codeSubTab = 'html'"
              >
                <span>📄 HTML Markup</span>
                <span class="subtab-count">{{ (documentSchema.rawHtml || '').length.toLocaleString() }} chars</span>
              </button>
              <button
                type="button"
                class="code-subtab-btn"
                :class="{ active: codeSubTab === 'css' }"
                @click="codeSubTab = 'css'"
              >
                <span>🎨 CSS Stylesheet</span>
                <span class="subtab-count">{{ (documentSchema.customCss || '').length.toLocaleString() }} chars</span>
              </button>
            </div>

            <div class="code-editor-quick-actions">
              <button type="button" class="btn btn-secondary btn-sm" @click="loadCyprusPreset">
                🔄 Load Cyprus Preset
              </button>
              <button type="button" class="btn btn-secondary btn-sm" @click="copyActiveCode">
                📋 Copy Code
              </button>
            </div>
          </div>

          <!-- Variable helper quick-insert ribbon -->
          <div class="variable-chips-ribbon">
            <div class="ribbon-title">
              <span>⚡ Click token to insert at cursor:</span>
            </div>
            <div class="chips-scroll">
              <button
                v-for="v in quickVariables"
                :key="v"
                type="button"
                class="var-chip-btn"
                @click="insertTokenAtCursor(v)"
                :title="`Insert {{${v}}}`"
              >
                + &#123;&#123;{{ v }}&#125;&#125;
              </button>
            </div>
          </div>

          <!-- Code Editor Body -->
          <div class="code-editor-panes">
            <div v-show="codeSubTab === 'html'" class="code-pane">
              <div class="pane-status-line">
                <span class="lang-tag">HTML5 Paired-Table Template</span>
                <span>Encoding: UTF-8</span>
                <span class="pane-stats">{{ (documentSchema.rawHtml || '').split('\n').length }} lines</span>
              </div>
              <textarea
                id="raw-html-editor"
                v-model="documentSchema.rawHtml"
                class="code-editor-textarea"
                placeholder="Enter HTML document structure..."
                spellcheck="false"
              ></textarea>
            </div>

            <div v-show="codeSubTab === 'css'" class="code-pane">
              <div class="pane-status-line">
                <span class="lang-tag">CSS3 Stylesheet</span>
                <span>Encoding: UTF-8</span>
                <span class="pane-stats">{{ (documentSchema.customCss || '').split('\n').length }} lines</span>
              </div>
              <textarea
                id="raw-css-editor"
                v-model="documentSchema.customCss"
                class="code-editor-textarea"
                placeholder="Enter CSS rules..."
                spellcheck="false"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 5: VERSIONS & AUDIT                                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'versions'" class="tab-pane-container">
        <div class="glass-card panel-card">
          <div class="panel-card-header">
            <div>
              <h3>Version History</h3>
              <p class="text-muted">
                Every published version is permanently archived so contracts created under older versions remain legal and immutable.
              </p>
            </div>

            <button type="button" class="btn btn-primary" @click="openPublishModal">
              + Publish New Version
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Change Summary</th>
                  <th>Author</th>
                  <th>Created Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in versions" :key="v.id">
                  <td><strong>v{{ v.version_number }}</strong></td>
                  <td>{{ v.change_summary || 'No summary entered' }}</td>
                  <td>{{ v.created_by }}</td>
                  <td>{{ formatDate(v.created_at) }}</td>
                  <td>
                    <span v-if="v.version_number === currentVersion" class="badge badge-success">Current Live</span>
                    <span v-else class="badge badge-neutral">Archived</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PUBLISH VERSION MODAL -->
    <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Publish Version {{ currentVersion + 1 }}</h3>
          <button class="btn-close" @click="showPublishModal = false">✕</button>
        </div>

        <form @submit.prevent="publishNewVersion" class="modal-form">
          <p class="text-muted" style="font-size: 0.85rem;">
            Publishing will increment the template version to v{{ currentVersion + 1 }}. All new contracts will use this version.
          </p>

          <div class="form-group">
            <label class="form-label">Change Summary <span class="req">*</span></label>
            <textarea
              v-model="changeSummary"
              class="form-control"
              rows="3"
              placeholder="e.g. Updated Schedule 2 scope and added bilingual terms"
              required
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showPublishModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !changeSummary.trim()">
              {{ saving ? 'Publishing…' : `Publish v${currentVersion + 1}` }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── IMPORT HTML / CSS MODAL ────────────────────────────────────── -->
    <div v-if="showImportModal" class="modal-overlay animate-fade-in" @click.self="showImportModal = false">
      <div class="modal-card glass-card" style="max-width: 840px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div>
            <div class="badge badge-primary badge-sm" style="margin-bottom: 4px;">HTML &amp; CSS Engine</div>
            <h3 class="modal-title">Import or Replace Template Markup</h3>
            <p class="modal-sub">Paste paired-table bilingual HTML and CSS code to update this template layout.</p>
          </div>
          <button type="button" class="btn-close" @click="showImportModal = false">✕</button>
        </div>

        <form @submit.prevent="applyImportedHtml" class="modal-form">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" @click="loadCyprusPreset">
              📄 Load Cyprus Business Residence Visa Preset
            </button>
          </div>

          <div class="form-group">
            <label class="field-label">Official Logo CDN URL</label>
            <input
              type="url"
              v-model="importLogoUrl"
              class="form-control"
              placeholder="https://assets.cdn.filesafe.space/..."
            />
          </div>

          <div class="form-group">
            <label class="field-label">HTML Template Code <span class="req">*</span></label>
            <textarea
              v-model="importHtmlText"
              class="form-control code-textarea"
              rows="9"
              placeholder="<!DOCTYPE html>... or <div class='document'>..."
              required
              style="font-family: monospace; font-size: 0.82rem; line-height: 1.4;"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="field-label">CSS Stylesheet</label>
            <textarea
              v-model="importCssText"
              class="form-control code-textarea"
              rows="6"
              placeholder=":root { --page-width: 210mm; ... }"
              style="font-family: monospace; font-size: 0.82rem; line-height: 1.4;"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showImportModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="!importHtmlText.trim()">
              Apply to Studio
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth  = useAuthStore()
const templateId = route.params.id

// Canvas content (independent of documentSchema.rawHtml to prevent destructive re-renders during editing)
const canvasContent = ref('')
const floatingToolbarPos = ref({ top: 0, left: 0, visible: false })

// Undo / Redo History Stack
const undoStack = ref([])
const redoStack = ref([])
const MAX_HISTORY = 40

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

const activeTab = ref('builder') // 'builder' | 'form' | 'variables' | 'preview' | 'code' | 'versions'
const codeSubTab = ref('html') // 'html' | 'css'
const paletteTab = ref('blocks') // 'blocks' | 'prebuilt' | 'layers' | 'tokens'
const zoomScale = ref(0.85)

// Responsive Layout & Panel Collapsing (Optimized for HighLevel CRM Iframe)
const isInIframe = ref(typeof window !== 'undefined' && window.self !== window.top)
const isLeftCollapsed = ref(false)
const isRightCollapsed = ref(isInIframe.value) // In iframe, default right inspector collapsed to give maximum room to A4 document
const isBottomStripCollapsed = ref(isInIframe.value) // In iframe, default compact bottom strip so full page height is visible

function toggleLeftPane() {
  isLeftCollapsed.value = !isLeftCollapsed.value
}

function toggleRightPane() {
  isRightCollapsed.value = !isRightCollapsed.value
}

function toggleBottomStrip() {
  isBottomStripCollapsed.value = !isBottomStripCollapsed.value
}

function fitZoom() {
  nextTick(() => {
    const canvasEl = document.querySelector('.studio-canvas-scroll')
    if (canvasEl) {
      const availableWidth = canvasEl.clientWidth - 48
      if (availableWidth > 260) {
        // A4 page width with borders and shadows is ~830px
        const calculated = Math.min(1.15, Math.max(0.45, Math.round((availableWidth / 830) * 100) / 100))
        zoomScale.value = calculated
        return
      }
    }
    zoomScale.value = isInIframe.value ? 0.72 : 0.85
  })
}

// Document Layers Tree State
const layerPageFilter = ref(-1) // -1 = All Pages, or 0..11
const layerSearchQuery = ref('')
const scannedLayers = ref([])

const showImportModal = ref(false)
const importHtmlText = ref('')
const importCssText = ref('')
const importLogoUrl = ref('https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png')

const quickVariables = ref([
  'applicant.full_name',
  'applicant.passport_or_eid',
  'applicant.nationality',
  'applicant.mobile',
  'applicant.address',
  'applicant.email',
  'applicant.date_of_birth',
  'applicant.dependents',
  'fees.total_after_discount',
  'fees.currency_text',
  'fees.payment_mode',
  'fees.additional_information',
  'fees.payment_breakup',
  'fees.initial_amount',
  'contract.date',
  'jurisdiction',
])

const templateName = ref('Untitled Template')
const contractType = ref('Legal Services Agreement')
const currentVersion = ref(1)
const isActive = ref(true)
const validityDays = ref(14)
const selectedFormId = ref(null)

const documentSchema = ref({
  title: 'LEGAL SERVICES AGREEMENT / اتفاقية خدمات قانونية - 360 Global Immigration',
  pages: [],
})

const availableForms = ref([])
const associatedForm = ref(null)
const versions = ref([])

const activePageIndex = ref(0)
const selectedComponentId = ref(null)
const varSearch = ref('')
const saving = ref(false)
const saveStatus = ref('')

const showPublishModal = ref(false)
const changeSummary = ref('')

const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

function varTag(v) {
  return v ? '{{' + v + '}}' : '—'
}

function changeZoom(delta) {
  const next = Math.round((zoomScale.value + delta) * 100) / 100
  if (next >= 0.4 && next <= 1.8) {
    zoomScale.value = next
  }
}

const isHtmlTemplate = computed(() => {
  return !!documentSchema.value.rawHtml || documentSchema.value.type === 'HTML'
})

const htmlPageList = computed(() => {
  if (!isHtmlTemplate.value) return []
  const html = documentSchema.value.rawHtml || ''
  // Match only actual page sections/containers, explicitly excluding .page-no or other sub-classes
  const pageRegex = /<(?:section|div)[^>]*class=["'][^"']*\bpage(?![\-_])\b[^"']*["'][^>]*>/gi
  const matches = [...html.matchAll(pageRegex)]
  const count = matches.length || documentSchema.value.pageCount || 12

  const titles = [
    'Cover Page',
    'Agreement & Recitals',
    'Refusal & Refund',
    'Terms of Business',
    'Terms Continued',
    'Complaints Procedure',
    'Schedule 1: Applicant',
    'Schedule 2: Services',
    'Schedule 3: Fees',
    'Declaration',
    'Contract Acceptance',
    'Final Declaration',
  ]

  const list = []
  for (let i = 0; i < count; i++) {
    const defaultTitle = titles[i] || `Page ${i + 1}`
    list.push({
      pageIndex: i,
      pageNumber: i + 1,
      title: defaultTitle,
      isCover: i === 0,
      isSign: i === 10 || i === 11,
      isSchedule: i >= 6 && i <= 8,
    })
  }
  return list
})

function scrollToHtmlPage(idx) {
  activePageIndex.value = idx
  const pageEls = document.querySelectorAll('.html-canvas-inner .page:not(.page-no), .html-canvas-inner section.page')
  if (pageEls && pageEls[idx]) {
    pageEls[idx].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function setupScrollSpy() {
  const viewport = document.querySelector('.a4-scroll-viewport')
  if (!viewport) return
  viewport.addEventListener('scroll', () => {
    if (!isHtmlTemplate.value) return
    const pageEls = document.querySelectorAll('.html-canvas-inner .page:not(.page-no), .html-canvas-inner section.page')
    if (!pageEls.length) return
    const viewportTop = viewport.scrollTop + 140
    let closestIndex = 0
    let minDistance = Infinity
    pageEls.forEach((el, index) => {
      const dist = Math.abs(el.offsetTop - viewportTop)
      if (dist < minDistance) {
        minDistance = dist
        closestIndex = index
      }
    })
    activePageIndex.value = closestIndex
  }, { passive: true })
}

// ─── HTML Interactive Studio Element Selection & Operations ──────────────────
const selectedHtmlNode = ref(null)
const selectedHtmlTag = ref('')
const selectedHtmlText = ref('')
const selectedHtmlClass = ref('')
const selectedHtmlFontSize = ref('8.45pt')
const selectedHtmlFontFamily = ref("Inter, 'Segoe UI', Arial, sans-serif")
const selectedHtmlFontWeight = ref('400')
const selectedHtmlTextAlign = ref('left')
const selectedHtmlDir = ref('ltr')
const selectedHtmlColor = ref('#202629')
let activeSelectedDomEl = null

const hasSelectedRow = computed(() => {
  if (!activeSelectedDomEl) return false
  return !!activeSelectedDomEl.closest('tr')
})

const isTrSelected = computed(() => {
  return activeSelectedDomEl?.tagName?.toLowerCase() === 'tr'
})

function updateFloatingToolbarPos() {
  if (!activeSelectedDomEl) {
    floatingToolbarPos.value.visible = false
    return
  }
  const canvas = document.getElementById('html-studio-canvas')
  const canvasView = canvas?.parentElement
  if (!canvas || !canvasView || !canvas.contains(activeSelectedDomEl)) {
    floatingToolbarPos.value.visible = false
    return
  }

  const el = activeSelectedDomEl.closest('tr') || activeSelectedDomEl
  const rect = el.getBoundingClientRect()
  const viewRect = canvasView.getBoundingClientRect()

  const scale = zoomScale.value || 1
  let top = (rect.top - viewRect.top) / scale - 42
  const left = (rect.left - viewRect.left) / scale + 10

  if (top < 8) {
    top = (rect.bottom - viewRect.top) / scale + 6
  }

  floatingToolbarPos.value = {
    top: Math.max(8, top),
    left: Math.max(10, left),
    visible: true,
  }
}

function selectHtmlElement(target) {
  if (!target) return
  const canvas = document.getElementById('html-studio-canvas')
  if (!canvas || !canvas.contains(target)) return

  // Automatically expand inspector sidebar so user can immediately style/edit
  isRightCollapsed.value = false

  if (activeSelectedDomEl && activeSelectedDomEl !== target) {
    activeSelectedDomEl.classList.remove('studio-selected-node')
  }

  activeSelectedDomEl = target
  target.classList.add('studio-selected-node')
  target.setAttribute('contenteditable', 'true')
  target.focus()

  const pageEl = target.closest('.page:not(.page-no), section.page')
  if (pageEl) {
    const allPages = Array.from(canvas.querySelectorAll('.page:not(.page-no), section.page'))
    const pIdx = allPages.indexOf(pageEl)
    if (pIdx !== -1) {
      activePageIndex.value = pIdx
    }
  }

  const compStyle = window.getComputedStyle(target)
  selectedHtmlNode.value = target
  selectedHtmlTag.value = target.tagName.toLowerCase()
  selectedHtmlText.value = target.innerText || ''
  selectedHtmlClass.value = target.className.replace('studio-selected-node', '').trim()
  selectedHtmlFontSize.value = target.style.fontSize || compStyle.fontSize || '8.45pt'
  selectedHtmlFontFamily.value = target.style.fontFamily || compStyle.fontFamily || 'Inter, sans-serif'
  selectedHtmlFontWeight.value = target.style.fontWeight || compStyle.fontWeight || '400'
  selectedHtmlTextAlign.value = target.style.textAlign || compStyle.textAlign || 'left'
  selectedHtmlDir.value = target.getAttribute('dir') || compStyle.direction || 'ltr'
  selectedHtmlColor.value = target.style.color || compStyle.color || '#202629'

  updateFloatingToolbarPos()
}

function onHtmlCanvasClick(event) {
  if (!isHtmlTemplate.value) return
  if (event.target.closest('.canvas-floating-toolbar')) return

  const target = event.target.closest(
    '.clause, .clause-text, .clause-number, .section-title, .cover-title, ' +
    '.money, .dynamic, .label, p, h1, h2, h3, td, th, li, tr, .signature-line'
  ) || event.target

  if (!target || target.classList.contains('html-canvas-inner') || target.classList.contains('document')) {
    clearHtmlSelection()
    return
  }

  selectHtmlElement(target)
}

let textInputDebounce = null
function onHtmlCanvasInput(event) {
  if (!activeSelectedDomEl) return
  selectedHtmlText.value = activeSelectedDomEl.innerText

  clearTimeout(textInputDebounce)
  textInputDebounce = setTimeout(() => {
    recordHistoryState('Text Edit')
    syncDomToRawHtml()
  }, 400)
}

function clearHtmlSelection() {
  if (activeSelectedDomEl) {
    activeSelectedDomEl.classList.remove('studio-selected-node')
    activeSelectedDomEl.removeAttribute('contenteditable')
    activeSelectedDomEl = null
  }
  selectedHtmlNode.value = null
  floatingToolbarPos.value.visible = false
}

function selectParentRow() {
  if (!activeSelectedDomEl) return
  const tr = activeSelectedDomEl.closest('tr')
  if (tr) {
    selectHtmlElement(tr)
  }
}

function moveSelectedRow(delta) {
  if (!activeSelectedDomEl) return
  const tr = activeSelectedDomEl.closest('tr')
  if (!tr) return

  recordHistoryState(delta < 0 ? 'Move Row Up' : 'Move Row Down')

  if (delta < 0 && tr.previousElementSibling) {
    tr.parentNode.insertBefore(tr, tr.previousElementSibling)
    syncDomToRawHtml()
    updateFloatingToolbarPos()
    tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  } else if (delta > 0 && tr.nextElementSibling) {
    tr.parentNode.insertBefore(tr.nextElementSibling, tr)
    syncDomToRawHtml()
    updateFloatingToolbarPos()
    tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

function duplicateSelectedRow() {
  if (!activeSelectedDomEl) return
  const tr = activeSelectedDomEl.closest('tr')
  if (!tr) return

  recordHistoryState('Duplicate Row')
  const clone = tr.cloneNode(true)
  clone.classList.remove('studio-selected-node')
  tr.insertAdjacentElement('afterend', clone)
  selectHtmlElement(clone)
  syncDomToRawHtml()
}

function deleteSelectedRow() {
  if (!activeSelectedDomEl) return
  const tr = activeSelectedDomEl.closest('tr')
  if (!tr) {
    deleteSelectedHtmlElement()
    return
  }

  if (confirm('Delete this bilingual row / clause from the contract?')) {
    recordHistoryState('Delete Row')
    const nextTarget = tr.nextElementSibling || tr.previousElementSibling
    tr.remove()
    if (nextTarget) {
      selectHtmlElement(nextTarget)
    } else {
      clearHtmlSelection()
    }
    syncDomToRawHtml()
  }
}

function updateSelectedHtmlStyle(prop, val) {
  if (!activeSelectedDomEl) return
  recordHistoryState(`Update ${prop}`)
  activeSelectedDomEl.style[prop] = val
  syncDomToRawHtml()
}

function updateSelectedHtmlDir(dir) {
  if (!activeSelectedDomEl) return
  recordHistoryState('Change Direction')
  activeSelectedDomEl.setAttribute('dir', dir)
  activeSelectedDomEl.style.direction = dir
  selectedHtmlDir.value = dir
  syncDomToRawHtml()
}

function updateSelectedHtmlText(val) {
  if (!activeSelectedDomEl) return
  activeSelectedDomEl.innerText = val
  syncDomToRawHtml()
}

function insertDynamicTokenToElement(token) {
  const tokenStr = `{{${token}}}`
  if (!activeSelectedDomEl) {
    alert('Please click on an element in the document canvas first where you want to insert ' + tokenStr)
    return
  }
  recordHistoryState('Insert Token')
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && activeSelectedDomEl.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const span = document.createElement('span')
    span.className = 'dynamic'
    span.setAttribute('data-field', token)
    span.textContent = tokenStr
    range.insertNode(span)
    range.collapse(false)
  } else {
    activeSelectedDomEl.innerHTML += ` <span class="dynamic" data-field="${token}">${tokenStr}</span>`
  }
  syncDomToRawHtml()
}

function deleteSelectedHtmlElement() {
  if (!activeSelectedDomEl) return
  if (confirm('Are you sure you want to remove this element from the template?')) {
    recordHistoryState('Delete Element')
    const parent = activeSelectedDomEl.parentElement
    activeSelectedDomEl.remove()
    if (parent && parent.children.length > 0) {
      selectHtmlElement(parent.firstElementChild)
    } else {
      clearHtmlSelection()
    }
    syncDomToRawHtml()
  }
}

function buildCanvasHtml(rawHtml, customCss) {
  if (!rawHtml) return ''
  const css = customCss || ''

  // Replace tokens with preview values
  let rendered = rawHtml
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
    .replace(/\{\{contract\.date\}\}/g, new Date().toLocaleDateString('en-GB'))
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')

  return `<style>${css}</style>\n${rendered}`
}

function refreshCanvasHtml() {
  canvasContent.value = buildCanvasHtml(documentSchema.value.rawHtml, documentSchema.value.customCss)
  nextTick(() => {
    refreshLayersList()
  })
}

function syncDomToRawHtml() {
  const canvas = document.getElementById('html-studio-canvas')
  if (!canvas) return
  const clone = canvas.cloneNode(true)
  clone.querySelectorAll('.studio-selected-node').forEach(el => {
    el.classList.remove('studio-selected-node')
    el.removeAttribute('contenteditable')
  })
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'))
  clone.querySelectorAll('[data-studio-insert]').forEach(el => el.removeAttribute('data-studio-insert'))
  clone.querySelectorAll('style').forEach(el => el.remove())

  const docEl = clone.querySelector('.document') || clone
  documentSchema.value.rawHtml = docEl.outerHTML || clone.innerHTML
  nextTick(() => {
    refreshLayersList()
  })
}

// ─── Layers Scanner & Hierarchy Operations ───────────────────────────────────
function scanCanvasLayers() {
  const canvas = document.getElementById('html-studio-canvas')
  if (!canvas) return []

  const pageEls = Array.from(canvas.querySelectorAll('.page:not(.page-no), section.page'))
  const result = []

  pageEls.forEach((pageEl, pIdx) => {
    const pageNum = pIdx + 1
    const pageMeta = htmlPageList.value[pIdx] || { title: `Page ${pageNum}` }

    // Find all rows or major elements inside page
    const rows = Array.from(pageEl.querySelectorAll('tr, .header-row, .cover-title, .signature-box'))
    const elementsToScan = rows.length > 0 ? rows : Array.from(pageEl.children)

    elementsToScan.forEach((el, elIdx) => {
      if (el.tagName === 'TD' || el.tagName === 'TH') return

      const text = el.innerText?.trim() || ''
      const textLower = text.toLowerCase()
      const classStr = el.className || ''

      const clauseNumEl = el.querySelector('.clause-number')
      const clauseTextEl = el.querySelector('.clause-text, .clause')
      const secTitleEl = el.querySelector('.section-title')
      const enCell = el.querySelector('.en-cell')
      const arCell = el.querySelector('.ar-cell')
      const hasSignatureLine = el.querySelector('.signature-line, [data-field*="signature"]')
      const hasTableLike = el.querySelector('.table-like')
      const hasMoney = el.querySelector('.money')

      let type = 'clause'
      let icon = '📄'
      let typeLabel = 'Clause'
      let title = ''
      let subtitle = ''

      // 1. Header or Logo row
      if (classStr.includes('header-row') || el.querySelector('img, .logo-left, .logo-right') || (pIdx === 0 && elIdx === 0)) {
        type = 'header'
        icon = '🏛️'
        typeLabel = pIdx === 0 ? 'Cover Title' : 'Bilingual Header'
        title = pIdx === 0 ? 'Cover Agreement Title' : '360GI Official Header'
      }
      // 2. Section Heading (when it has .section-title and NOT an individual clause row)
      else if (secTitleEl && !clauseNumEl && !clauseTextEl) {
        type = 'heading'
        icon = '🔤'
        typeLabel = 'Section Heading'
        title = secTitleEl.innerText.trim() || 'Section Heading'
      }
      // 3. True Signature line / block
      else if (hasSignatureLine || textLower.includes('signature of client') || textLower.includes('first party signature') || textLower.includes('second party signature')) {
        type = 'signature'
        icon = '✍️'
        typeLabel = 'Signature Block'
        title = 'Signature & Acceptance'
      }
      // 4. Applicant Details Grid
      else if (hasTableLike || (textLower.includes('applicant') && textLower.includes('passport'))) {
        type = 'applicant'
        icon = '👤'
        typeLabel = 'Applicant Grid'
        title = 'Schedule 1: Applicant Grid'
      }
      // 5. Scope of Services
      else if (textLower.includes('schedule two') || textLower.includes('scope of services')) {
        type = 'services'
        icon = '📋'
        typeLabel = 'Services'
        title = 'Schedule 2: Services Scope'
      }
      // 6. Fees & Payments
      else if (hasMoney || (textLower.includes('schedule three') && textLower.includes('fees'))) {
        type = 'fees'
        icon = '💳'
        typeLabel = 'Fees Matrix'
        title = 'Schedule 3: Fees Table'
      }
      // 7. Clauses (bilingual or standard)
      else if (clauseNumEl || clauseTextEl || /^\s*\d+[\.\)]/.test(text) || (enCell && arCell)) {
        type = (enCell && arCell) ? 'bilingual' : 'clause'
        icon = (enCell && arCell) ? '🌐' : '📄'
        typeLabel = (enCell && arCell) ? 'Bilingual Clause' : 'Standard Clause'

        const cNum = clauseNumEl?.innerText?.trim() || (text.match(/^\s*(\d+[\.\)])/)?.[1] || '')
        const cText = (clauseTextEl?.innerText || text)
          .replace(/^\s*\d+[\.\)]\s*/, '')
          .replace(/[\r\n\t]+/g, ' ')
          .trim()

        if (cNum) {
          const cleanNum = cNum.replace(/[\.\)]$/, '')
          title = `Clause ${cleanNum}: ${cText.substring(0, 24)}${cText.length > 24 ? '…' : ''}`
        } else if (cText) {
          title = cText.substring(0, 32) + (cText.length > 32 ? '…' : '')
        } else {
          title = 'Bilingual Clause'
        }
      }
      // 8. General Row / Paragraph
      else {
        type = 'row'
        icon = '📄'
        typeLabel = 'Row'
        const cleanText = text.replace(/[\r\n\t]+/g, ' ').trim()
        title = cleanText ? cleanText.substring(0, 32) + (cleanText.length > 32 ? '…' : '') : 'Document Row'
      }

      // Subtitle excerpt: clean and single line
      if (enCell) {
        subtitle = enCell.innerText.replace(/[\r\n\t]+/g, ' ').trim().substring(0, 42) + '…'
      } else if (text) {
        subtitle = text.replace(/[\r\n\t]+/g, ' ').trim().substring(0, 42) + (text.length > 42 ? '…' : '')
      }

      result.push({
        id: `layer_p${pIdx}_r${elIdx}`,
        pageIndex: pIdx,
        pageNumber: pageNum,
        pageTitle: pageMeta.title,
        domEl: el,
        tagName: el.tagName.toLowerCase(),
        isRow: el.tagName.toLowerCase() === 'tr',
        type,
        icon,
        typeLabel,
        title,
        subtitle,
        text,
      })
    })
  })

  return result
}

function refreshLayersList() {
  scannedLayers.value = scanCanvasLayers()
}

const groupedLayers = computed(() => {
  let list = scannedLayers.value
  if (layerPageFilter.value !== -1) {
    list = list.filter(l => l.pageIndex === layerPageFilter.value)
  }
  if (layerSearchQuery.value.trim()) {
    const q = layerSearchQuery.value.toLowerCase()
    list = list.filter(l =>
      l.title.toLowerCase().includes(q) ||
      (l.subtitle && l.subtitle.toLowerCase().includes(q)) ||
      (l.text && l.text.toLowerCase().includes(q)) ||
      l.typeLabel.toLowerCase().includes(q)
    )
  }

  const map = new Map()
  list.forEach(layer => {
    layer.isSelected = !!(activeSelectedDomEl && (activeSelectedDomEl === layer.domEl || layer.domEl.contains(activeSelectedDomEl)))

    if (!map.has(layer.pageIndex)) {
      const pageMeta = htmlPageList.value[layer.pageIndex] || { title: `Page ${layer.pageNumber}` }
      map.set(layer.pageIndex, {
        pageIndex: layer.pageIndex,
        pageNumber: layer.pageNumber,
        title: pageMeta.title,
        layers: []
      })
    }
    map.get(layer.pageIndex).layers.push(layer)
  })

  return Array.from(map.values())
})

function openLayersTab() {
  paletteTab.value = 'layers'
  if (layerPageFilter.value === -1 && activePageIndex.value !== undefined) {
    layerPageFilter.value = activePageIndex.value
  }
  refreshLayersList()
}

function selectLayerFromTree(layer) {
  if (!layer?.domEl) return
  selectHtmlElement(layer.domEl)
  layer.domEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function onLayerHover(layer, isEntering) {
  if (!layer?.domEl) return
  if (isEntering) {
    layer.domEl.classList.add('studio-layer-hover')
  } else {
    layer.domEl.classList.remove('studio-layer-hover')
  }
}

function moveLayer(layer, delta) {
  if (!layer?.domEl) return
  selectHtmlElement(layer.domEl)
  moveSelectedRow(delta)
  nextTick(() => {
    refreshLayersList()
  })
}

function duplicateLayer(layer) {
  if (!layer?.domEl) return
  selectHtmlElement(layer.domEl)
  duplicateSelectedRow()
  nextTick(() => {
    refreshLayersList()
  })
}

function deleteLayer(layer) {
  if (!layer?.domEl) return
  selectHtmlElement(layer.domEl)
  deleteSelectedRow()
  nextTick(() => {
    refreshLayersList()
  })
}

function recordHistoryState(actionLabel = 'Edit') {
  undoStack.value.push({
    label: actionLabel,
    schema: JSON.parse(JSON.stringify(documentSchema.value)),
    timestamp: Date.now(),
  })
  if (undoStack.value.length > MAX_HISTORY) {
    undoStack.value.shift()
  }
  redoStack.value = []
}

function triggerUndo() {
  if (!canUndo.value) return

  redoStack.value.push({
    label: 'Redo state',
    schema: JSON.parse(JSON.stringify(documentSchema.value)),
    timestamp: Date.now(),
  })

  const prev = undoStack.value.pop()
  documentSchema.value = JSON.parse(JSON.stringify(prev.schema))

  clearHtmlSelection()
  refreshCanvasHtml()

  saveStatus.value = `Undo: ${prev.label}`
  setTimeout(() => { if (saveStatus.value.startsWith('Undo:')) saveStatus.value = '' }, 2500)
}

function triggerRedo() {
  if (!canRedo.value) return

  undoStack.value.push({
    label: 'Undo state',
    schema: JSON.parse(JSON.stringify(documentSchema.value)),
    timestamp: Date.now(),
  })

  const next = redoStack.value.pop()
  documentSchema.value = JSON.parse(JSON.stringify(next.schema))

  clearHtmlSelection()
  refreshCanvasHtml()

  saveStatus.value = `Redo: ${next.label || 'Action'}`
  setTimeout(() => { if (saveStatus.value.startsWith('Redo:')) saveStatus.value = '' }, 2500)
}

function onGlobalKeydown(e) {
  if (activeTab.value === 'code') return
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

  if (cmdOrCtrl && !e.altKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      triggerUndo()
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault()
      triggerRedo()
    }
  }
}

function copyActiveCode() {
  const code = codeSubTab.value === 'html' ? documentSchema.value.rawHtml : documentSchema.value.customCss
  if (!code) return
  navigator.clipboard?.writeText(code)
  alert(`✓ Copied ${codeSubTab.value.toUpperCase()} code to clipboard!`)
}

const pages = computed(() => {
  if (!documentSchema.value.pages || !Array.isArray(documentSchema.value.pages)) {
    documentSchema.value.pages = []
  }
  return documentSchema.value.pages
})

const activePage = computed(() => {
  return pages.value[activePageIndex.value] || null
})

const selectedComponent = computed(() => {
  if (!selectedComponentId.value) return null
  for (const p of pages.value) {
    const found = (p.components || []).find(c => c.id === selectedComponentId.value)
    if (found) return found
  }
  return null
})

const formFieldsList = computed(() => {
  if (!associatedForm.value?.schema_json) return []
  const s = typeof associatedForm.value.schema_json === 'string'
    ? JSON.parse(associatedForm.value.schema_json)
    : associatedForm.value.schema_json
  return s.fields || []
})

// Combined variables list from System + Form + Contact
const availableVariables = computed(() => {
  const vars = [
    { token: 'client_name',       label: 'Client Full Name / اسم العميل', category: 'Contact', source: 'GHL Contact / Form' },
    { token: 'passport_number',   label: 'Passport or EID No. / جواز السفر', category: 'Contact', source: 'Form / Contact' },
    { token: 'nationality',       label: 'Nationality / الجنسية', category: 'Contact', source: 'Form / Contact' },
    { token: 'phone',             label: 'Mobile Phone / رقم المحمول', category: 'Contact', source: 'GHL Contact' },
    { token: 'client_email',      label: 'Email Address / البريد الإلكتروني', category: 'Contact', source: 'GHL Contact' },
    { token: 'address',           label: 'Physical Address / العنوان', category: 'Contact', source: 'GHL Contact' },
    { token: 'date_of_birth',     label: 'Date of Birth / تاريخ الميلاد', category: 'Contact', source: 'Form / Contact' },
    { token: 'dependents',        label: 'Dependents / المعالون', category: 'Intake Form', source: 'Form Input' },
    { token: 'visa_type',         label: 'Visa Program / برنامج التأشيرة', category: 'Intake Form', source: 'Form Input' },
    { token: 'contract_value',    label: 'Total Fee / إجمالي الرسوم', category: 'Pricing', source: 'Form Input' },
    { token: 'discounted_amount', label: 'Discounted Amount / بعد الخصم', category: 'Pricing', source: 'Form Input' },
    { token: 'payment_terms',     label: 'Payment Mode / طريقة وسداد الدفع', category: 'Pricing', source: 'Form Input' },
    { token: 'contract_id',       label: 'Contract ID', category: 'System', source: 'Auto-Generated' },
    { token: 'created_date',      label: 'Effective Date', category: 'System', source: 'Auto-Generated' },
  ]

  for (const f of formFieldsList.value) {
    const t = f.contractVariable || f.key
    if (!vars.some(v => v.token === t)) {
      vars.push({
        token: t,
        label: f.label,
        category: 'Form Field',
        source: f.source || 'Form Input',
      })
    }
  }

  return vars
})

const filteredVariables = computed(() => {
  if (!varSearch.value.trim()) return availableVariables.value
  const q = varSearch.value.toLowerCase()
  return availableVariables.value.filter(v => v.token.toLowerCase().includes(q) || v.label.toLowerCase().includes(q))
})

function getCompLabel(type) {
  const map = {
    bilingual_clause: 'Bilingual (EN/AR)',
    clause: 'Standard Clause',
    heading: 'Heading',
    table: 'Table / Fees',
    key_value: 'Applicant Grid',
    signature: 'Signature Box',
    divider: 'Divider',
  }
  return map[type] || type
}

function renderTokens(text) {
  if (!text) return ''
  return String(text)
    .replace(/\{\{client_name\}\}/g, 'John Doe / محمد علي')
    .replace(/\{\{passport_number\}\}/g, 'P12345678')
    .replace(/\{\{nationality\}\}/g, 'British / بريطاني')
    .replace(/\{\{phone\}\}/g, '+971 50 123 4567')
    .replace(/\{\{client_email\}\}/g, 'client@example.com')
    .replace(/\{\{address\}\}/g, 'Dubai, UAE')
    .replace(/\{\{date_of_birth\}\}/g, '01 Jan 1988')
    .replace(/\{\{dependents\}\}/g, 'Spouse + 2 Children / لا يوجد')
    .replace(/\{\{visa_type\}\}/g, 'Portugal D7 Residency Visa')
    .replace(/\{\{contract_value\}\}/g, '€5,000')
    .replace(/\{\{discounted_amount\}\}/g, '€4,500')
    .replace(/\{\{payment_terms\}\}/g, 'Bank Wire Transfer / تحويل بنكي')
    .replace(/\{\{created_date\}\}/g, todayDate)
    .replace(/\{\{contract_id\}\}/g, '#360-10042')
}

// ─── Component Operations ───────────────────────────────────────────────────
function selectComponent(pageId, compId) {
  selectedComponentId.value = compId
  isRightCollapsed.value = false
}

function onDropOnHtmlCanvas(event) {
  if (!isHtmlTemplate.value) return
  event.preventDefault()
  const type = event.dataTransfer?.getData('text/plain')
  if (type) {
    addComponent(type)
  }
}

function insertHtmlComponent(htmlSnippet, componentType = 'Component') {
  const canvas = document.getElementById('html-studio-canvas')
  if (!canvas) return

  recordHistoryState(`Add ${componentType}`)

  // Parse HTML snippet
  const temp = document.createElement('tbody')
  temp.innerHTML = htmlSnippet.trim()
  const newEl = temp.firstElementChild
  if (!newEl) return

  let inserted = false

  // Case 1: A node inside canvas is currently selected
  if (activeSelectedDomEl && canvas.contains(activeSelectedDomEl)) {
    const parentTr = activeSelectedDomEl.closest('tr')
    if (parentTr && parentTr.parentNode) {
      parentTr.insertAdjacentElement('afterend', newEl)
      inserted = true
    } else {
      const page = activeSelectedDomEl.closest('.page:not(.page-no), section.page') || activeSelectedDomEl
      const tbody = page.querySelector('tbody') || (page.tagName === 'TABLE' ? page.querySelector('tbody') || page : null)
      if (tbody) {
        tbody.appendChild(newEl)
        inserted = true
      }
    }
  }

  // Case 2: No row selected, insert into current active page
  if (!inserted) {
    const pageEls = Array.from(canvas.querySelectorAll('.page:not(.page-no), section.page'))
    const activePg = pageEls[activePageIndex.value] || pageEls[0]
    if (activePg) {
      const tbody = activePg.querySelector('tbody') || activePg.querySelector('table')
      if (tbody) {
        tbody.appendChild(newEl)
        inserted = true
      }
    }
  }

  // Case 3: Canvas fallback
  if (!inserted) {
    const anyTbody = canvas.querySelector('tbody')
    if (anyTbody) {
      anyTbody.appendChild(newEl)
      inserted = true
    } else {
      const table = document.createElement('table')
      table.className = 'bilingual-table'
      const tb = document.createElement('tbody')
      tb.appendChild(newEl)
      table.appendChild(tb)
      canvas.appendChild(table)
      inserted = true
    }
  }

  // Select the newly added element immediately in live DOM
  selectHtmlElement(newEl)
  newEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Synchronize to documentSchema.rawHtml
  syncDomToRawHtml()
}

function addComponent(type) {
  if (isHtmlTemplate.value) {
    const snippetMap = {
      bilingual_clause: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">NEW SECTION TITLE</div>
    <div class="clause-row">
      <div class="clause-number">1.</div>
      <div class="clause-text">Enter English legal clause content here. Use {{client_name}} tokens.</div>
    </div>
  </td>
  <td class="ar-cell">
    <div class="section-title">عنوان القسم الجديد</div>
    <div class="clause-row">
      <div class="clause-number">١.</div>
      <div class="clause-text">أدخل نص البند القانوني باللغة العربية هنا.</div>
    </div>
  </td>
</tr>`,
      clause: `
<tr>
  <td class="en-cell">
    <p class="clause"><strong>New Clause:</strong> Enter clause terms and specifications here.</p>
  </td>
  <td class="ar-cell">
    <p class="clause"><strong>بند جديد:</strong> أدخل شروط وأحكام البند هنا باللغة العربية.</p>
  </td>
</tr>`,
      heading: `
<tr>
  <td class="en-cell">
    <div class="section-title">NEW SECTION TITLE</div>
  </td>
  <td class="ar-cell">
    <div class="section-title">عنوان القسم الجديد</div>
  </td>
</tr>`,
      table: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">SCHEDULE: FEES & CHARGES</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">Total Fee:</td><td><span class="dynamic">{{fees.total_after_discount}}</span></td></tr>
        <tr><td class="label">Initial Deposit:</td><td><span class="dynamic">{{fees.initial_amount}}</span></td></tr>
        <tr><td class="label">Payment Mode:</td><td><span class="dynamic">{{fees.payment_mode}}</span></td></tr>
      </table>
    </div>
  </td>
  <td class="ar-cell">
    <div class="section-title">الجدول: الرسوم والمصروفات</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">إجمالي الرسوم:</td><td><span class="dynamic">{{fees.total_after_discount}}</span></td></tr>
        <tr><td class="label">الدفعة الأولى:</td><td><span class="dynamic">{{fees.initial_amount}}</span></td></tr>
        <tr><td class="label">طريقة السداد:</td><td><span class="dynamic">{{fees.payment_mode}}</span></td></tr>
      </table>
    </div>
  </td>
</tr>`,
      key_value: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">APPLICANT DETAILS:</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">Name:</td><td><span class="dynamic" data-field="applicant.full_name">{{applicant.full_name}}</span></td></tr>
        <tr><td class="label">Passport/EID:</td><td><span class="dynamic" data-field="applicant.passport_or_eid">{{applicant.passport_or_eid}}</span></td></tr>
        <tr><td class="label">Nationality:</td><td><span class="dynamic" data-field="applicant.nationality">{{applicant.nationality}}</span></td></tr>
        <tr><td class="label">Mobile:</td><td><span class="dynamic" data-field="applicant.mobile">{{applicant.mobile}}</span></td></tr>
      </table>
    </div>
  </td>
  <td class="ar-cell">
    <div class="section-title">بيانات المتقدم:</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">الاسم:</td><td><span class="dynamic" data-field="applicant.full_name">{{applicant.full_name}}</span></td></tr>
        <tr><td class="label">رقم الجواز / الهوية:</td><td><span class="dynamic" data-field="applicant.passport_or_eid">{{applicant.passport_or_eid}}</span></td></tr>
        <tr><td class="label">الجنسية:</td><td><span class="dynamic" data-field="applicant.nationality">{{applicant.nationality}}</span></td></tr>
        <tr><td class="label">المحمول:</td><td><span class="dynamic" data-field="applicant.mobile">{{applicant.mobile}}</span></td></tr>
      </table>
    </div>
  </td>
</tr>`,
      signature: `
<tr class="group-gap">
  <td class="en-cell">
    <p class="clause"><strong>Client Signature / Authorized Signatory:</strong></p>
    <div class="signature-line" data-field="signature.client"></div>
    <p class="clause" style="margin-top: 4px;">Date: <span class="dynamic">{{contract.date}}</span></p>
  </td>
  <td class="ar-cell">
    <p class="clause"><strong>توقيع العميل / المفوض بالتوقيع:</strong></p>
    <div class="signature-line" data-field="signature.client"></div>
    <p class="clause" style="margin-top: 4px;">التاريخ: <span class="dynamic">{{contract.date}}</span></p>
  </td>
</tr>`,
      divider: `
<tr class="group-gap">
  <td colspan="2" style="padding: 4mm 0;">
    <hr style="border: 0; border-top: 0.3mm solid var(--line, #cfd8db); margin: 0;" />
  </td>
</tr>`,
    }

    const snippet = snippetMap[type] || snippetMap.clause
    insertHtmlComponent(snippet)
    return
  }

  if (!activePage.value) {
    addNewPage()
  }

  const p = activePage.value
  if (!p.components) p.components = []

  const id = `comp_${Date.now()}_${p.components.length + 1}`
  let comp = {
    id,
    type,
    title: '',
    hasCondition: false,
    conditionField: '',
    conditionOperator: 'EQUALS',
    conditionValue: '',
  }

  if (type === 'bilingual_clause') {
    comp.titleEn = 'SECTION TITLE (EN)'
    comp.titleAr = 'عنوان البند (AR)'
    comp.contentEn = 'Enter English legal clause terms here. Use {{client_name}} tokens.'
    comp.contentAr = 'أدخل نص البند القانوني باللغة العربية هنا.'
  } else if (type === 'clause') {
    comp.title = 'Clause Title'
    comp.content = 'Standard clause terms...'
  } else if (type === 'heading') {
    comp.level = 2
    comp.content = 'Document Heading Section'
  } else if (type === 'table') {
    comp.title = 'Schedule: Fees & Breakdown'
    comp.headers = ['Item Description', 'Qty', 'Unit Price', 'Total']
    comp.rows = [['Legal Immigration Processing', '1', '€5,000.00', '€5,000.00']]
  } else if (type === 'key_value') {
    comp.title = 'Applicant Details'
    comp.data = { 'Client Name': '{{client_name}}', 'Passport No': '{{passport_number}}' }
  } else if (type === 'signature') {
    comp.label = 'Contract Acceptance & Signature / توقيع وقبول العقد'
  }

  p.components.push(comp)
  selectedComponentId.value = comp.id
}

function duplicateComponent(pIdx, comp) {
  const p = pages.value[pIdx]
  const copy = JSON.parse(JSON.stringify(comp))
  copy.id = `comp_${Date.now()}`
  if (copy.titleEn) copy.titleEn = `${copy.titleEn} (Copy)`
  else if (copy.title) copy.title = `${copy.title} (Copy)`

  const idx = p.components.findIndex(c => c.id === comp.id)
  p.components.splice(idx + 1, 0, copy)
  selectedComponentId.value = copy.id
}

function deleteComponent(pIdx, compId) {
  const p = pages.value[pIdx]
  p.components = p.components.filter(c => c.id !== compId)
  if (selectedComponentId.value === compId) {
    selectedComponentId.value = p.components[0]?.id || null
  }
}

function moveComponent(pIdx, cIdx, delta) {
  const p = pages.value[pIdx]
  const target = cIdx + delta
  if (target < 0 || target >= p.components.length) return
  const item = p.components.splice(cIdx, 1)[0]
  p.components.splice(target, 0, item)
}

function addTableRow() {
  if (selectedComponent.value?.type === 'table') {
    const cols = selectedComponent.value.headers?.length || 4
    selectedComponent.value.rows.push(new Array(cols).fill('Sample Item'))
  }
}

function addTableColumn() {
  if (selectedComponent.value?.type === 'table') {
    selectedComponent.value.headers.push('New Column')
    for (const r of selectedComponent.value.rows) {
      r.push('—')
    }
  }
}

// ─── Prebuilt 360GI Clauses Inserter ────────────────────────────────────────
function insertPrebuilt(templateKey) {
  if (isHtmlTemplate.value) {
    const prebuiltHtmlMap = {
      cover_header: `
<tr>
  <td class="en-cell" style="text-align: center; padding: 20mm 10mm 10mm;">
    <div class="cover-title"><h1>LEGAL<br>SERVICES<br>AGREEMENT</h1></div>
    <img class="logo" src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png" alt="360 Global Immigration" />
  </td>
  <td class="ar-cell" style="text-align: center; padding: 20mm 10mm 10mm;">
    <div class="cover-title arabic">اتفاقية<br>خدمات<br>قانونية</div>
    <img class="logo" src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png" alt="360 Global Immigration" />
  </td>
</tr>`,
      agreement_main: `
<tr>
  <td class="en-cell">
    <div class="section-title">AGREEMENT</div>
    <div class="center block"><b>Between<br>360 Global Immigration LLC<br>AND<br>The client listed in Schedule One WHEREAS:</b></div>
    <p class="clause"><b>A.</b> 360 Global Immigration LLC offers services to applicant to apply Visa.</p>
    <div class="clause-row"><div class="clause-number">1.</div><div class="clause-text">The client appoints 360 Global Immigration LLC to assist the client.</div></div>
  </td>
  <td class="ar-cell">
    <div class="section-title">اتفاقية</div>
    <div class="center block"><b>بين شركة<br>360 العالمية ذ.م.م. للهجرة<br>و<br>العميل المدرج في الجدول الأول، حيث:</b></div>
    <p class="clause"><b>أ.</b> تقدم شركة 360 العالمية للهجرة خدمات للمتقدمين.</p>
    <div class="clause-row"><div class="clause-number">١.</div><div class="clause-text">يعين العميل شركة 360 العالمية للهجرة لمساعدته.</div></div>
  </td>
</tr>`,
      terms_business: `
<tr>
  <td class="en-cell">
    <div class="section-title">TERMS OF BUSINESS:</div>
    <div class="clause-row"><div class="clause-number">1.</div><div class="clause-text">You are automatically bound by the terms of this application process after initial deposit.</div></div>
    <div class="clause-row"><div class="clause-number">2.</div><div class="clause-text">Disputes & Jurisdiction: Subject to the exclusive jurisdiction of the Courts of DIFC.</div></div>
  </td>
  <td class="ar-cell">
    <div class="section-title">شروط العمل:</div>
    <div class="clause-row"><div class="clause-number">١.</div><div class="clause-text">أنت ملزم تلقائياً بشروط المعاملة بعد سداد الدفعة الأولى.</div></div>
    <div class="clause-row"><div class="clause-number">٢.</div><div class="clause-text">النزاعات والاختصاص القضائي: تخضع لمحاكم مركز دبي المالي العالمي (DIFC).</div></div>
  </td>
</tr>`,
      schedule_one: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">SCHEDULE ONE: APPLICANT DETAILS</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">Name:</td><td><span class="dynamic" data-field="applicant.full_name">{{applicant.full_name}}</span></td></tr>
        <tr><td class="label">Passport/EID:</td><td><span class="dynamic" data-field="applicant.passport_or_eid">{{applicant.passport_or_eid}}</span></td></tr>
        <tr><td class="label">Nationality:</td><td><span class="dynamic" data-field="applicant.nationality">{{applicant.nationality}}</span></td></tr>
        <tr><td class="label">Mobile:</td><td><span class="dynamic" data-field="applicant.mobile">{{applicant.mobile}}</span></td></tr>
      </table>
    </div>
  </td>
  <td class="ar-cell">
    <div class="section-title">الجدول الأول: بيانات المتقدم</div>
    <div class="data-wrap">
      <table class="table-like">
        <tr><td class="label">الاسم:</td><td><span class="dynamic" data-field="applicant.full_name">{{applicant.full_name}}</span></td></tr>
        <tr><td class="label">رقم الجواز / الهوية:</td><td><span class="dynamic" data-field="applicant.passport_or_eid">{{applicant.passport_or_eid}}</span></td></tr>
        <tr><td class="label">الجنسية:</td><td><span class="dynamic" data-field="applicant.nationality">{{applicant.nationality}}</span></td></tr>
        <tr><td class="label">المحمول:</td><td><span class="dynamic" data-field="applicant.mobile">{{applicant.mobile}}</span></td></tr>
      </table>
    </div>
  </td>
</tr>`,
      schedule_two: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">SCHEDULE TWO: SERVICES</div>
    <ul class="list">
      <li>A detailed assessment of client's circumstances.</li>
      <li>Advising for the exact documentation needed for visa authorities.</li>
      <li>Assistance with business and compliance registrations.</li>
    </ul>
  </td>
  <td class="ar-cell">
    <div class="section-title">الجدول الثاني: الخدمات</div>
    <ul class="list">
      <li>إجراء تقييم مفصل لظروف العميل وملفه.</li>
      <li>تقديم المشورة بشأن المستندات الدقيقة المطلوبة.</li>
      <li>المساعدة في إجراءات التسجيل ومزاولة الأعمال.</li>
    </ul>
  </td>
</tr>`,
      schedule_three: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">SCHEDULE THREE: FEES</div>
    <p class="money">Total Amount after exclusive discount:<br><span class="dynamic">{{fees.total_after_discount}}</span></p>
    <p class="center clause">Payment Mode: <span class="dynamic">{{fees.payment_mode}}</span></p>
  </td>
  <td class="ar-cell">
    <div class="section-title">الجدول الثالث: الرسوم</div>
    <p class="money">إجمالي الرسوم بعد الخصم الحصري:<br><span class="dynamic">{{fees.total_after_discount}}</span></p>
    <p class="center clause">طريقة السداد: <span class="dynamic">{{fees.payment_mode}}</span></p>
  </td>
</tr>`,
      declaration: `
<tr class="group-gap">
  <td class="en-cell">
    <div class="section-title">DECLARATION & SIGNATURE:</div>
    <p class="clause">I/we, <span class="dynamic">{{applicant.full_name}}</span> hereby accept the services offered by 360GI.</p>
    <div class="signature-line" data-field="signature.client"></div>
    <p class="clause" style="margin-top: 4px;">Date: <span class="dynamic">{{contract.date}}</span></p>
  </td>
  <td class="ar-cell">
    <div class="section-title">إقرار وتوقيع:</div>
    <p class="clause">أنا/نحن، <span class="dynamic">{{applicant.full_name}}</span> أقبل بموجبه الخدمات المقدمة من 360GI.</p>
    <div class="signature-line" data-field="signature.client"></div>
    <p class="clause" style="margin-top: 4px;">التاريخ: <span class="dynamic">{{contract.date}}</span></p>
  </td>
</tr>`,
    }

    const snippet = prebuiltHtmlMap[templateKey] || prebuiltHtmlMap.agreement_main
    insertHtmlComponent(snippet)
    return
  }

  if (!activePage.value) addNewPage()
  const p = activePage.value
  if (!p.components) p.components = []

  const id = `comp_360_${Date.now()}`
  let comp = null

  if (templateKey === 'cover_header') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'LEGAL SERVICES AGREEMENT',
      titleAr: 'اتفاقية خدمات قانونية',
      contentEn: '<div style="text-align:center; padding: 15px 0;"><div style="background:#0f172a; color:#fff; display:inline-block; padding: 16px 36px; border-radius: 6px; font-size: 22px; font-weight: bold; letter-spacing: 3px;">3 6 0<br><span style="font-size:11px; font-weight:normal; letter-spacing:2px;">GLOBAL IMMIGRATION</span></div></div>',
      contentAr: '<div style="text-align:center; padding: 15px 0;"><div style="background:#0f172a; color:#fff; display:inline-block; padding: 16px 36px; border-radius: 6px; font-size: 22px; font-weight: bold; letter-spacing: 3px;">3 6 0<br><span style="font-size:11px; font-weight:normal; letter-spacing:2px;">العالمية للهجرة</span></div></div>',
    }
  } else if (templateKey === 'agreement_main') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'AGREEMENT Between 360 Global Immigration LLC AND The client listed in Schedule One WHEREAS:',
      titleAr: 'اتفاقية بين شركة 360 العالمية ذ.م.م. للهجرة و العميل المدرج في الجدول الأول، حيث:',
      contentEn: '<strong>A.</strong> 360 Global Immigration LLC offers services to applicant to apply Visa to enter THE <strong>{{visa_type}}</strong>.<br>The term \'360GI\', is used as 360 Global Immigration LLC in this attached document.<br><br><strong>B.</strong> The client has requested 360 Global to provide such assistance for them. IT IS RECORDED:<br><br><strong>1.</strong> The client appoints 360 Global Immigration LLC to assist the client to apply for the Visa mentioned above.<br><br><strong>2.</strong> 360GI will act on client\'s instructions and will provide all the legal advice and services with best endeavours to obtain the Visa for the client and their dependent(s), if any, as per Schedule One.<br><br><strong>3.</strong> The client warrants that, to the best of their knowledge:<br>a. They have clean police and personal history.<br>b. They are not aware of anything adverse with regards to their application that has not been disclosed to 360GI.<br><br><strong>4.</strong> The advisory fee shall be as set out in Schedule three of this Agreement. Any balance amount as set out in Schedule Three of this Agreement must be paid within twenty-four hours after the visa is granted. The fees incorporate the cost of the immigration services provided by 360GI only and does not include any third-party fees.<br><br><strong>5.</strong> If the client revokes this Agreement or change his/her mind or found to a criminal record after signing this agreement, then 360GI shall nevertheless be deemed to have performed its services satisfactorily.<br><br><strong>6.</strong> If the application is refused due to any error by applicant -like but not limited to- any false/incorrect information provided by applicant OR any fake document provided by applicant for the application purpose OR if the immigration authorities make an enquiry to an authority on the applicant and the authority does not reply to satisfactory level OR if the applicant fails to give correct reply to the questions in the official interview related to visa application. In all these cases applicant will not be refunded any service charges paid to 360GI.<br><br><strong>7.</strong> 360GI will represent the applicant until the successful result of the application. In case the application remains unsuccessful without falling under clause no. 6 of this agreement, 80% of the payment received will be eligible for a refund within 30 working days.',
      contentAr: '<strong>أ.</strong> تقدم شركة 360 Global Immigration LLC خدمات للمتقدمين للحصول على تأشيرة لدخول <strong>{{visa_type}}</strong>.<br>ويستخدم مصطلح "شركة 360 العالمية للهجرة" للإشارة إلى شركة 360 العالمية للهجرة ذ.م.م. في هذه الوثيقة المرفقة.<br><br><strong>ب.</strong> طلب العميل من شركة 360 العالمية للهجرة تقديم هذه المساعدة له، وتم تسجيل ما يلي:<br><br><strong>١.</strong> يعين العميل شركة 360 العالمية للهجرة لمساعدته في التقدم بطلب للحصول على التأشيرة المذكورة أعلاه.<br><br><strong>٢.</strong> ستتصرف شركة 360 العالمية للهجرة وفقاً لتعليمات العميل وستقدم جميع الاستشارات القانونية والخدمات بأقصى جهد للحصول على التأشيرة للعميل والمعالين التابعين له، إن وجدوا، كما هو موضح في الجدول الأول.<br><br><strong>٣.</strong> يضمن العميل أنه على حد علمه:<br>أ. لديه سجل شخصي وشرطي نظيف.<br>ب. لا يعلم بأي شيء سلبي فيما يتعلق بطلبه لم يتم الإفصاح عنه لشركة 360 العالمية للهجرة.<br><br><strong>٤.</strong> يجب دفع الرسوم الاستشارية كما هو موضح في الجدول الثالث من هذه الاتفاقية. كما يتعين دفع أي مبلغ متبقي كما هو موضح في الجدول الثالث من هذه الاتفاقية خلال أربع وعشرين ساعة بعد منح التأشيرة. تشمل الرسوم تكلفة خدمات الهجرة التي تقدمها شركة 360 العالمية للهجرة فقط ولا تشمل أي رسوم للغير.<br><br><strong>٥.</strong> إذا ألغى العميل هذه الاتفاقية أو غير رأيه أو ثبت وجود سجل جنائي بعد توقيع هذه الاتفاقية، فستعتبر شركة 360 العالمية للهجرة على الرغم من ذلك أنها قد قدمت خدماتها بشكل مرضي.<br><br><strong>٦.</strong> إذا تم رفض الطلب بسبب أي خطأ من المتقدم - على سبيل المثال لا الحصر - أي معلومات خاطئة/غير صحيحة قدمها المتقدم أو أي مستند مزور قدمه المتقدم أو عدم رد السلطات أو الفشل في المقابلة الرسمية، فلن يتم رد أي رسوم خدمة دفعها المتقدم.<br><br><strong>٧.</strong> ستمثل شركة 360 العالمية للهجرة المتقدم حتى النتيجة الناجحة للطلب. في حال بقي الطلب غير ناجح دون الوقوع تحت البند رقم ٦، يكون ٨٠٪ من المبلغ المستلم مستحقاً للاسترداد خلال ٣٠ يوم عمل.',
    }
  } else if (templateKey === 'terms_business') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'TERMS OF BUSINESS',
      titleAr: 'شروط العمل',
      contentEn: '<strong>1.</strong> You are automatically bound by the terms of this application process after you have paid an initial deposit of the total fees or have accepted by signing 360GI application form.<br><br><strong>2.</strong> 360GI will not be liable to client or to officials for misleading documents and information.<br><br><strong>3.</strong> 360GI is a private firm and do not hold the authority to grant you a visa of any kind. Final decision on all Visa applications rests with the immigration authorities.<br><br><strong>4. Disputes & Jurisdiction:</strong> Any dispute, difference, controversy or claim arising out of or in connection with this contract shall be subject to the exclusive jurisdiction of the Courts of the Dubai International Financial Centre ("the DIFC COURTS") governed by UAE laws.<br><br><strong>5.</strong> We attempt to ensure that information on 360GI website is accurate.<br><br><strong>6.</strong> If a client fails to pay the sum due in full within the given time scale, we reserve the right to stop counselling.<br><br><strong>7.</strong> The client undertakes to provide accurate and detailed information.<br><br><strong>8.</strong> The applicant agrees to create a new personal email address and give its access to 360GI.<br><br><strong>9.</strong> The visa application along with required documents will be ready to submit after it is checked by applicant.<br><br><strong>10.</strong> Applicant permits 360GI to communicate with any authority on applicant\'s behalf.<br><br><strong>11.</strong> 360GI shall not be liable for force majeure events.<br><br><strong>12.</strong> This agreement is written in English and Arabic. In case of discrepancies, the English version shall prevail.<br><br><strong>Complaints:</strong> All complaints should be sent to:<br>Telephone: +971-58-580-3412<br>E-mail: support@360globalimmigration.com',
      contentAr: '<strong>١.</strong> أنت ملزم تلقائياً بشروط عملية التقديم هذه بعد أن تدفع دفعة أولى من الرسوم أو موافقتك بالتوقيع على نموذج الطلب.<br><br><strong>٢.</strong> لن تكون شركة 360 العالمية للهجرة مسؤولة أمام العميل أو المسؤولين عن المستندات والمعلومات المضللة.<br><br><strong>٣.</strong> شركة 360 العالمية للهجرة هي شركة خاصة ولا تملك سلطة منح أي نوع من التأشيرات.<br><br><strong>٤. النزاعات والاختصاص القضائي:</strong> تخضع أي نزاعات للاختصاص القضائي الحصري لمحاكم مركز دبي المالي العالمي ("محاكم DIFC") وتفسر وفقاً لقوانين دولة الإمارات.<br><br><strong>٥.</strong> نحاول ضمان دقة المعلومات في جميع الأوقات.<br><br><strong>٦.</strong> في حال عدم سداد الرسوم المستحقة يحق للشركة إيقاف المعاملة ومتابعة الإجراءات القانونية.<br><br><strong>٧.</strong> يتعهد العميل بتقديم كافة المستندات والمعلومات الصحيحة والمفصلة.<br><br><strong>٨.</strong> يوافق المتقدم على تخصيص بريد إلكتروني خاص بالمعاملة ومشاركته مع الشركة.<br><br><strong>٩.</strong> مراجعة واعتماد ملف الطلب والموافقة الخطية قبل تقديمه رسمياً.<br><br><strong>١٠.</strong> تفويض الشركة بالتواصل مع الجهات والسلطات المختصة نيابة عن المتقدم.<br><br><strong>١١.</strong> إخلاء المسؤولية عن حالات القوة القاهرة والظروف الطارئة.<br><br><strong>١٢.</strong> تم تحرير هذه الاتفاقية باللغتين الإنجليزية والعربية وتسود النسخة الإنجليزية عند الاختلاف.<br><br><strong>الشكاوى:</strong> ترسل الشكاوى إلى:<br>هاتف: 3412-580-58-971+<br>البريد الإلكتروني: support@360globalimmigration.com',
    }
  } else if (templateKey === 'schedule_one') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'COURSE OF ACTION & SCHEDULE ONE: Main Applicant Details',
      titleAr: 'خطة العمل والجدول الأول: بيانات المتقدم الرئيسي',
      contentEn: '<strong>Main Applicant:</strong><br><strong>Name:</strong> {{client_name}}<br><strong>Passport/EID No.:</strong> {{passport_number}}<br><strong>Nationality:</strong> {{nationality}}<br><strong>Mobile:</strong> {{phone}}<br><strong>Address:</strong> {{address}}<br><strong>Email Address:</strong> {{client_email}}<br><strong>Date of Birth:</strong> {{date_of_birth}}<br><strong>Dependents:</strong> {{dependents}}',
      contentAr: '<strong>المتقدم الرئيسي:</strong><br><strong>الاسم:</strong> {{client_name}}<br><strong>رقم جواز السفر / الهوية:</strong> {{passport_number}}<br><strong>الجنسية:</strong> {{nationality}}<br><strong>المحمول:</strong> {{phone}}<br><strong>العنوان:</strong> {{address}}<br><strong>عنوان البريد الإلكتروني:</strong> {{client_email}}<br><strong>تاريخ الميلاد:</strong> {{date_of_birth}}<br><strong>المعالون:</strong> {{dependents}}',
    }
  } else if (templateKey === 'schedule_two') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'SCHEDULE TWO: Scope of Services',
      titleAr: 'الجدول الثاني: نطاق الخدمات',
      contentEn: '<strong>Services include before visa:</strong><br>• A detailed assessment of client\'s circumstances.<br>• Advising for exact documentation needed.<br>• Completing online application for applicant and dependents.<br>• Assisting with business plan/financial requirements.<br>• Ongoing application tracking.<br><br><strong>After Visa Services:</strong><br>• Complete visa requirements for visa holder.<br>• Assistance with registration at SEF / Immigration Authorities.<br>• Support with Tax Number (NIF) application.<br>• Assistance with opening personal bank account.<br>• Social Security (NISS) registration.<br>• Introduction to certified accountants & legal professionals.<br>• Property rental / accommodation setup guidance.<br>• Health insurance enrollment guidance.<br>• TRC and residency card processing.',
      contentAr: '<strong>تشمل خدمات ما قبل التأشيرة:</strong><br>• تقييم مفصل لظروف العميل وملفه.<br>• تقديم المشورة بشأن المستندات المطلوبة بدقة.<br>• استكمال الطلب عبر الإنترنت للمتقدم والمعالين.<br>• مساعدة المتقدم في موضوع خطة العمل.<br>• إبقاء المتقدم على اطلاع بحالة طلبه.<br>• الاستمرار في العمل حتى النتيجة الناجحة.<br><br><strong>خدمات ما بعد التأشيرة:</strong><br>• استكمال متطلبات إصدار بطاقة الإقامة.<br>• المساعدة في التسجيل لدى سلطة الهجرة والحدود (SEF).<br>• استخراج الرقم الضريبي البرتغالي (NIF).<br>• المساعدة في فتح الحساب البنكي.<br>• التسجيل في الضمان الاجتماعي (NISS).<br>• التعريف بالمحاسبين المعتمدين والمحامين.<br>• التوجيه بشأن استئجار السكن والمرافق.<br>• المشورة بشأن التأمين الصحي.<br>• استخراج بطاقة الإقامة (TRC) أو الجنسية.',
    }
  } else if (templateKey === 'schedule_three') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'SCHEDULE THREE: Fees & Payment Terms',
      titleAr: 'الجدول الثالث: الرسوم وشروط الدفع',
      contentEn: '<strong>Total Fees payable as 360GI Professional charges:</strong> {{contract_value}}<br><strong>Total Amount after exclusive discount:</strong> {{discounted_amount}}<br><strong>Payment Mode:</strong> {{payment_terms}}<br><strong>Additional Information:</strong> N/A<br><br><em>All fees are payable in EURO or equivalent currency. Agreed fees are subject to 360GI Terms and Conditions.</em>',
      contentAr: '<strong>إجمالي الرسوم المستحقة كرسوم مهنية:</strong> {{contract_value}}<br><strong>المبلغ الإجمالي بعد الخصم الحصري:</strong> {{discounted_amount}}<br><strong>طريقة وسداد الدفع:</strong> {{payment_terms}}<br><strong>معلومات إضافية:</strong> لا يوجد<br><br><em>تستحق جميع الرسوم باليورو أو ما يعادلها بالعملات الأخرى وفقاً لشروط وأحكام 360GI.</em>',
    }
  } else if (templateKey === 'declaration') {
    comp = {
      id,
      type: 'bilingual_clause',
      titleEn: 'DECLARATION & ACKNOWLEDGEMENT',
      titleAr: 'إقرار وتعهد',
      contentEn: 'I/we, <strong>{{client_name}}</strong> holding <strong>{{nationality}}</strong> Passport Number <strong>{{passport_number}}</strong> have hired 360 Global Immigration LLC by signing an agreement to assist me/us for my <strong>{{visa_type}}</strong>.<br><br>I/we declare that I/we have read and understand the declaration, terms of business, and agreement, and by signing below, I/we enter into a legal contract with 360GI.',
      contentAr: 'أنا/نحن، <strong>{{client_name}}</strong> حامل جواز سفر <strong>{{nationality}}</strong> رقم <strong>{{passport_number}}</strong> قمنا بتعيين شركة 360 Global Immigration LLC لمساعدتي/مساعدتنا للحصول على <strong>{{visa_type}}</strong>.<br><br>أقر بأنني قرأت وفهمت الإقرار وشروط العمل والاتفاقية، وبالتوقيع أدناه أبرم عقداً قانونياً ملزماً مع 360GI.',
    }
  }

  if (comp) {
    p.components.push(comp)
    selectedComponentId.value = comp.id
  }
}

// ─── Page Operations ────────────────────────────────────────────────────────
function addNewPage() {
  const newNum = pages.value.length + 1
  const newPg = {
    id: `page_${Date.now()}_${newNum}`,
    pageNumber: newNum,
    hasBorder: true,
    components: [],
  }
  pages.value.push(newPg)
  activePageIndex.value = pages.value.length - 1
  selectedComponentId.value = null
}

function duplicatePage(idx) {
  const copy = JSON.parse(JSON.stringify(pages.value[idx]))
  copy.id = `page_${Date.now()}`
  copy.pageNumber = pages.value.length + 1
  pages.value.splice(idx + 1, 0, copy)
  activePageIndex.value = idx + 1
}

function deletePage(idx) {
  if (pages.value.length <= 1) return
  pages.value.splice(idx, 1)
  if (activePageIndex.value >= pages.value.length) {
    activePageIndex.value = pages.value.length - 1
  }
}

function movePage(idx, delta) {
  const target = idx + delta
  if (target < 0 || target >= pages.value.length) return
  const item = pages.value.splice(idx, 1)[0]
  pages.value.splice(target, 0, item)
  activePageIndex.value = target
}

function scrollToPage(idx) {
  activePageIndex.value = idx
  const el = document.getElementById(`page-card-${idx}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function onDropOnPage(pIdx, evt) {
  activePageIndex.value = pIdx
}

function insertTokenIntoSelected(token) {
  if (!selectedComponent.value) {
    alert('Please select a clause block on the A4 canvas first.')
    return
  }
  const t = `{{${token}}}`
  const c = selectedComponent.value
  if (c.type === 'bilingual_clause') {
    c.contentEn = (c.contentEn || '') + ' ' + t
  } else if (c.type === 'clause') {
    c.content = (c.content || '') + ' ' + t
  } else if (c.titleEn !== undefined) {
    c.titleEn = (c.titleEn || '') + ' ' + t
  } else {
    c.title = (c.title || '') + ' ' + t
  }
}

function copyToken(token) {
  navigator.clipboard?.writeText(`{{${token}}}`)
  alert(`Copied {{${token}}} to clipboard!`)
}

// ─── API Persistence & Schema Normalization ─────────────────────────────────
function normalizeLoadedSchema(rawSchema) {
  if (!rawSchema) {
    return { title: 'Legal Agreement', pages: [{ id: 'page_1', pageNumber: 1, hasBorder: true, components: [] }] }
  }

  let s = typeof rawSchema === 'string' ? JSON.parse(rawSchema) : rawSchema

  // Check if raw HTML/CSS template
  if (s.rawHtml || s.type === 'HTML') {
    return {
      type: 'HTML',
      title: s.title || templateName.value || 'Legal Services Agreement',
      templateCode: s.templateCode || 'CUSTOM_TEMPLATE',
      rawHtml: s.rawHtml || '',
      customCss: s.customCss || '',
      pageCount: s.pageCount || 1,
      detectedVariables: s.detectedVariables || [],
      dataFields: s.dataFields || [],
      pages: s.pages || [],
      blocks: s.blocks || [],
    }
  }

  // If already in pages format
  if (s.pages && Array.isArray(s.pages) && s.pages.length > 0) {
    return s
  }

  // Convert flat blocks array into multi-page pages array
  const blocks = s.blocks || []
  const pagesList = []
  let currentComps = []
  let pageNumber = 1

  for (const b of blocks) {
    if (b.type === 'pagebreak') {
      pagesList.push({
        id: `page_${pageNumber}`,
        pageNumber,
        hasBorder: true,
        components: currentComps,
      })
      currentComps = []
      pageNumber++
    } else {
      currentComps.push(b)
    }
  }

  pagesList.push({
    id: `page_${pageNumber}`,
    pageNumber,
    hasBorder: true,
    components: currentComps,
  })

  return {
    title: s.title || 'Legal Agreement',
    pages: pagesList,
  }
}

function denormalizeToFlatBlocks(schema) {
  const flatBlocks = []
  for (let i = 0; i < (schema.pages || []).length; i++) {
    const p = schema.pages[i]
    for (const c of (p.components || [])) {
      flatBlocks.push(c)
    }
    if (i < schema.pages.length - 1) {
      flatBlocks.push({ id: `pb_${i}`, type: 'pagebreak' })
    }
  }
  return flatBlocks
}

function insertTokenAtCursor(token) {
  const tokenStr = `{{${token}}}`
  if (codeSubTab.value === 'html') {
    const el = document.getElementById('raw-html-editor')
    if (el && el.selectionStart !== undefined) {
      const start = el.selectionStart
      const end = el.selectionEnd
      const text = documentSchema.value.rawHtml || ''
      documentSchema.value.rawHtml = text.substring(0, start) + tokenStr + text.substring(end)
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + tokenStr.length
        el.focus()
      }, 0)
    } else {
      documentSchema.value.rawHtml = (documentSchema.value.rawHtml || '') + tokenStr
    }
  } else {
    documentSchema.value.customCss = (documentSchema.value.customCss || '') + tokenStr
  }
}

function openImportHtmlModal() {
  importHtmlText.value = documentSchema.value.rawHtml || ''
  importCssText.value = documentSchema.value.customCss || ''
  showImportModal.value = true
}

async function loadCyprusPreset() {
  try {
    const res = await axios.get(`${apiBase}/templates/4`, { headers: getHeaders() })
      .catch(() => axios.get(`${apiBase}/templates/5`, { headers: getHeaders() }))
    const schema = typeof res.data.template?.document_schema_json === 'string'
      ? JSON.parse(res.data.template.document_schema_json)
      : res.data.template?.document_schema_json
    if (schema?.rawHtml) {
      importHtmlText.value = schema.rawHtml
      importCssText.value = schema.customCss || ''
    }
  } catch (e) {
    console.warn('Could not load preset from server:', e)
  }
}

function applyImportedHtml() {
  if (!importHtmlText.value.trim()) return
  recordHistoryState('Import HTML/CSS')
  documentSchema.value.rawHtml = importHtmlText.value
  documentSchema.value.customCss = importCssText.value
  documentSchema.value.type = 'HTML'
  
  const titleMatch = importHtmlText.value.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    documentSchema.value.title = titleMatch[1].trim()
    templateName.value = titleMatch[1].trim()
  }
  
  refreshCanvasHtml()
  showImportModal.value = false
  activeTab.value = 'builder'
}

const renderedRawDocument = computed(() => {
  const html = documentSchema.value.rawHtml
  if (!html) return ''
  const css = documentSchema.value.customCss || ''
  
  // Replace tokens with preview values
  let rendered = html
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
    .replace(/\{\{contract\.date\}\}/g, new Date().toLocaleDateString('en-GB'))
    .replace(/src=["'](?:assets\/)?logo-left\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')
    .replace(/src=["'](?:assets\/)?logo-right\.png["']/gi, 'src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"')

  return `<style>${css}</style>\n${rendered}`
})

async function loadTemplate() {
  try {
    const [tRes, fRes, vRes] = await Promise.all([
      axios.get(`${apiBase}/templates/${templateId}`, { headers: getHeaders() }),
      axios.get(`${apiBase}/forms`, { headers: getHeaders() }),
      axios.get(`${apiBase}/templates/${templateId}/versions`, { headers: getHeaders() }).catch(() => ({ data: { versions: [] } })),
    ])

    const t = tRes.data.template
    templateName.value = t.name
    contractType.value = t.contract_type || 'Legal Services Agreement'
    currentVersion.value = t.current_version || 1
    isActive.value = !!t.is_active
    validityDays.value = t.validity_days || 14
    selectedFormId.value = t.form_id || null

    if (t.document_schema_json) {
      documentSchema.value = normalizeLoadedSchema(t.document_schema_json)
      refreshCanvasHtml()
      undoStack.value = []
      redoStack.value = []
    } else {
      addNewPage()
    }

    availableForms.value = fRes.data.forms || []
    if (selectedFormId.value) {
      onFormChange()
    }

    versions.value = vRes.data.versions || []
    if (pages.value.length > 0 && pages.value[0].components?.length > 0) {
      selectedComponentId.value = pages.value[0].components[0].id
    }
  } catch (err) {
    console.error('Failed to load template:', err)
  }
}

async function onFormChange() {
  if (!selectedFormId.value) {
    associatedForm.value = null
    return
  }
  try {
    const res = await axios.get(`${apiBase}/forms/${selectedFormId.value}`, { headers: getHeaders() })
    associatedForm.value = res.data.form
  } catch (err) {
    console.warn('Could not load associated form:', err)
  }
}

async function saveTemplate(incrementVersion = false, summary = '') {
  saving.value = true
  saveStatus.value = 'saving'

  try {
    // Generate both structured pages and flat blocks for 100% backward & forward compatibility
    const fullSchema = {
      type: documentSchema.value.rawHtml ? 'HTML' : (documentSchema.value.type || 'STRUCTURED'),
      title: documentSchema.value.title,
      templateCode: documentSchema.value.templateCode || 'CUSTOM_TEMPLATE',
      rawHtml: documentSchema.value.rawHtml || '',
      customCss: documentSchema.value.customCss || '',
      pageCount: documentSchema.value.pageCount || (documentSchema.value.pages?.length || 1),
      detectedVariables: documentSchema.value.detectedVariables || [],
      dataFields: documentSchema.value.dataFields || [],
      pages: documentSchema.value.pages || [],
      blocks: denormalizeToFlatBlocks(documentSchema.value),
    }

    const res = await axios.put(
      `${apiBase}/templates/${templateId}`,
      {
        name: templateName.value,
        contractType: contractType.value,
        validityDays: validityDays.value,
        formId: selectedFormId.value,
        isActive: isActive.value,
        documentSchema: fullSchema,
        incrementVersion,
        changeSummary: summary || 'Updated fixed A4 template layout',
      },
      { headers: getHeaders() }
    )

    if (incrementVersion && res.data.version) {
      currentVersion.value = res.data.version
      const vRes = await axios.get(`${apiBase}/templates/${templateId}/versions`, { headers: getHeaders() })
      versions.value = vRes.data.versions || []
    }

    saveStatus.value = 'saved'
    setTimeout(() => { if (saveStatus.value === 'saved') saveStatus.value = '' }, 3000)
  } catch (err) {
    console.error('Failed to save template:', err)
    const errMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to save template changes.'
    alert(errMessage)
    saveStatus.value = ''
  } finally {
    saving.value = false
  }
}

function openPublishModal() {
  changeSummary.value = ''
  showPublishModal.value = true
}

async function publishNewVersion() {
  if (!changeSummary.value.trim()) return
  await saveTemplate(true, changeSummary.value.trim())
  showPublishModal.value = false
}

function exportPdf() {
  window.print()
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  loadTemplate()
  window.addEventListener('keydown', onGlobalKeydown)
  window.addEventListener('resize', updateFloatingToolbarPos)
  window.addEventListener('resize', fitZoom)
  setTimeout(() => {
    fitZoom()
  }, 350)
  setTimeout(() => {
    refreshLayersList()
  }, 600)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  window.removeEventListener('resize', updateFloatingToolbarPos)
  window.removeEventListener('resize', fitZoom)
})

watch(activePageIndex, (newIdx) => {
  if (layerPageFilter.value !== -1) {
    layerPageFilter.value = newIdx
  }
})

watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'builder' && isHtmlTemplate.value) {
    refreshCanvasHtml()
    nextTick(() => {
      updateFloatingToolbarPos()
      refreshLayersList()
    })
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.studio-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: var(--color-bg-base);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── Studio Header ── */
.studio-header {
  height: 54px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 12px;
  z-index: 30;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-shrink: 1;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 8px;
  border-radius: 6px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-back-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.btn-back:hover .btn-back-text {
  color: #0f172a;
}

.header-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 2px;
  flex-shrink: 0;
}

.template-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.template-title-input {
  font-family: inherit;
  font-size: 0.94rem;
  font-weight: 700;
  color: #0f172a;
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 8px;
  border-radius: 6px;
  max-width: 340px;
  min-width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.15s ease;
}

.template-title-input:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.template-title-input:focus {
  border-color: #6366f1;
  background: #ffffff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
  max-width: 440px;
}

.badge-version {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.badge-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ecfdf5;
  color: #059669;
  font-weight: 600;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #a7f3d0;
  flex-shrink: 0;
}

.badge-draft {
  background: #fef2f2;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  flex-shrink: 0;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.header-center {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.view-tabs {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  gap: 2px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}

.tab-btn.active {
  background: #ffffff;
  color: #4f46e5;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.tab-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ── History (Undo / Redo) Controls in Header ── */
.history-controls {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px;
  gap: 1px;
  height: 32px;
  box-sizing: border-box;
}

.history-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #475569;
  cursor: pointer;
  transition: all 0.12s ease;
}

.history-btn:hover:not(:disabled) {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.history-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.zoom-controls {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 4px;
  border-radius: 6px;
  height: 32px;
  box-sizing: border-box;
}

.zoom-controls .btn-tool {
  height: 26px;
  min-width: 22px;
  padding: 0 5px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s ease;
}

.zoom-controls .btn-tool:hover {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.zoom-level {
  font-size: 0.74rem;
  font-weight: 600;
  color: #475569;
  min-width: 36px;
  text-align: center;
  user-select: none;
}

.header-action-btn {
  height: 32px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.btn-save-primary {
  height: 32px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  border: 1px solid #4338ca;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.35);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-primary:hover:not(:disabled) {
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.45);
  transform: translateY(-1px);
}

.btn-save-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-pill {
  font-size: 0.74rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  white-space: nowrap;
}

/* ── Studio Body & Three-Pane Layout ── */
.studio-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.builder-three-pane {
  display: grid;
  grid-template-columns: 290px 1fr 340px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: grid-template-columns 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.builder-three-pane.left-collapsed {
  grid-template-columns: 46px 1fr 340px;
}

.builder-three-pane.right-collapsed {
  grid-template-columns: 290px 1fr 46px;
}

.builder-three-pane.left-collapsed.right-collapsed {
  grid-template-columns: 46px 1fr 46px;
}

/* ── Left Palette ── */
.palette-sidebar {
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.palette-sidebar.is-collapsed {
  padding: 0;
  overflow: hidden;
  background: #f8fafc;
}

.palette-collapsed-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  gap: 8px;
  height: 100%;
}

.btn-rail-toggle {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #4f46e5;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}

.btn-rail-toggle:hover {
  background: #eef2ff;
  border-color: #6366f1;
  transform: scale(1.05);
}

.rail-divider {
  width: 20px;
  height: 1px;
  background: #e2e8f0;
  margin: 2px 0;
}

.btn-rail-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-rail-icon:hover {
  background: #e2e8f0;
}

.btn-rail-icon.active {
  background: #ede9fe;
}

.palette-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.palette-panel-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #64748b;
}

.btn-panel-collapse {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-panel-collapse:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.palette-tabs-nav-wrap {
  padding: 8px 10px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.palette-tabs-nav {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  border: 1px solid #e2e8f0;
}

.palette-subtab {
  flex: 1;
  padding: 5px 2px;
  font-size: 0.72rem;
  font-weight: 600;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.palette-subtab:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}

.palette-subtab.active {
  color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.subtab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  background: #ede9fe;
  color: #6d28d9;
  line-height: 1;
}

.sidebar-section {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.palette-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  font-weight: 700;
}

.section-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.palette-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.palette-btn {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-base);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.palette-btn:hover {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
}

.highlight-btn {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.04);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text strong {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-base);
}

.btn-text span {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

/* Variable Drawer */
.token-search {
  width: 100%;
  padding: 6px 10px;
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-base);
  margin-bottom: var(--space-2);
}

.token-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 480px;
  overflow-y: auto;
}

.token-item {
  padding: 6px 8px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.token-item:hover {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.token-item code {
  color: #f59e0b;
  font-size: 0.75rem;
  font-weight: bold;
}

.token-desc {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* ── Center Canvas Area ── */
.canvas-area-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #cbd5e1;
}

.canvas-top-meta {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 6px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  min-height: 40px;
  box-sizing: border-box;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.meta-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.doc-title-inline {
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid transparent;
  padding: 3px 8px;
  background: transparent;
  color: #0f172a;
  border-radius: 6px;
  min-width: 140px;
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.15s ease;
}

.doc-title-inline:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.doc-title-inline:focus {
  border-color: #6366f1;
  background: #ffffff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
  max-width: 440px;
}

.meta-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.pill {
  font-size: 0.72rem;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.pill-accent {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.pill-accent strong {
  color: #1d4ed8;
}

/* Viewport for zoom & scroll */
.a4-scroll-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 30px 20px 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  transition: transform 0.15s ease-out;
}

/* Fixed Discrete A4 Page Canvas */
.a4-page-frame {
  width: 210mm;
  min-height: 297mm;
  max-height: 297mm;
  background: #ffffff;
  color: #0f172a;
  padding: 15mm 16mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  overflow: hidden;
  cursor: default;
}

.a4-page-frame.selected-page {
  box-shadow: 0 0 0 3px var(--color-primary), 0 12px 35px rgba(0, 0, 0, 0.3);
}

.a4-page-frame.has-legal-border {
  border: 2px solid #0f172a;
  outline: 1px solid #cbd5e1;
  outline-offset: -5px;
}

.a4-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
  margin-bottom: 10px;
  font-size: 7.5pt;
  color: #64748b;
  text-transform: uppercase;
}

.header-brand {
  font-weight: 700;
  color: #0f172a;
}

.border-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 7pt;
  cursor: pointer;
  color: #64748b;
}

.a4-page-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow-y: auto;
}

.page-empty-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  margin: auto 0;
}

.a4-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 6px;
  margin-top: 10px;
  font-size: 7.5pt;
  color: #64748b;
}

/* Component Box inside A4 Page */
.a4-component-card {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px;
  transition: all var(--transition-fast);
}

.a4-component-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(248, 250, 252, 0.6);
}

.a4-component-card.selected {
  border-color: var(--color-primary);
  background: #ffffff;
  box-shadow: 0 0 0 1.5px var(--color-primary);
}

.comp-ribbon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  opacity: 0.35;
  transition: opacity var(--transition-fast);
}

.a4-component-card:hover .comp-ribbon,
.a4-component-card.selected .comp-ribbon {
  opacity: 1;
}

.comp-type-badge {
  font-size: 6.5pt;
  text-transform: uppercase;
  font-weight: 700;
  background: #0f172a;
  color: #fff;
  padding: 1px 5px;
  border-radius: 3px;
}

.comp-actions {
  display: flex;
  gap: 2px;
}

.btn-tool-mini {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  font-size: 7pt;
  padding: 1px 4px;
  cursor: pointer;
  color: #0f172a;
}

.btn-tool-mini:hover {
  background: #e2e8f0;
}

.btn-tool-mini.btn-danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── Bilingual 50/50 Editor Grid ── */
.bilingual-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 6px 8px;
  align-items: stretch;
}

.bilingual-center-line {
  background: #cbd5e1;
  height: 100%;
  min-height: 40px;
}

.bilingual-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-en {
  direction: ltr;
  text-align: left;
}

.col-ar {
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;
}

.ar-text {
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;
}

.comp-title-edit {
  width: 100%;
  font-size: 8pt;
  font-weight: 700;
  border: 1px solid transparent;
  padding: 2px 4px;
  border-radius: 2px;
  color: #0f172a;
  background: transparent;
}

.comp-title-edit:hover, .comp-title-edit:focus {
  border-color: #cbd5e1;
  background: #ffffff;
  outline: none;
}

.comp-textarea-edit {
  width: 100%;
  font-size: 8pt;
  line-height: 1.4;
  border: 1px solid transparent;
  padding: 4px;
  border-radius: 2px;
  color: #334155;
  background: transparent;
  resize: vertical;
}

.comp-textarea-edit:hover, .comp-textarea-edit:focus {
  border-color: #cbd5e1;
  background: #ffffff;
  outline: none;
}

.comp-heading-edit {
  width: 100%;
  font-size: 11pt;
  font-weight: 800;
  border: 1px solid transparent;
  padding: 2px 4px;
  color: #0f172a;
  background: transparent;
}

.comp-heading-edit:focus {
  border-color: #cbd5e1;
  background: #fff;
  outline: none;
}

/* Builder Tables */
.a4-builder-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7.5pt;
}

.a4-builder-table th {
  background: #0f172a;
  color: #ffffff;
  padding: 4px;
  border: 1px solid #0f172a;
}

.a4-builder-table td {
  padding: 3px;
  border: 1px solid #cbd5e1;
}

.tbl-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 7.5pt;
  padding: 2px;
  color: inherit;
}

.tbl-input.tbl-header {
  color: #ffffff;
  font-weight: bold;
}

.tbl-input:focus {
  background: #f1f5f9;
  color: #0f172a;
  outline: none;
}

/* Key/Value Grid */
.kv-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  background: #f8fafc;
  padding: 6px;
  border-radius: 3px;
}

.kv-pair {
  font-size: 7.5pt;
  display: flex;
  gap: 4px;
}

.kv-lbl {
  font-weight: 600;
  color: #64748b;
}

.kv-val {
  color: #0f172a;
}

/* Signature Box */
.sig-render-box {
  border: 1px dashed #94a3b8;
  padding: 8px 10px;
  border-radius: 4px;
  background: #fafafa;
}

.sig-label-edit {
  width: 100%;
  font-weight: 700;
  font-size: 8pt;
  border: 1px solid transparent;
  background: transparent;
  margin-bottom: 4px;
}

.sig-label-edit:focus {
  border-color: #cbd5e1;
  background: #fff;
  outline: none;
}

.sig-placeholder-area {
  height: 35px;
  border-bottom: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  font-size: 7.5pt;
  color: #94a3b8;
}

.a4-hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 6px 0;
}

/* ── Bottom Page Strip Carousel ── */
.bottom-page-strip {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 15;
  transition: all 0.2s ease;
}

.bottom-page-strip.is-minimized {
  padding: 4px 16px;
  gap: 0;
}

.strip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strip-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strip-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-toggle-strip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-toggle-strip:hover {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #a5b4fc;
}

.page-quick-nav {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px 4px;
  gap: 6px;
}

.btn-nav-step {
  border: none;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 4px;
  transition: all 0.12s;
}

.btn-nav-step:hover:not(:disabled) {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-nav-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-step-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e293b;
}

.strip-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.strip-thumbnails-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px;
}

.page-thumbnail-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.page-thumbnail-card.active {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
}

.thumbnail-preview {
  width: 54px;
  height: 76px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.thumb-header-line {
  height: 2px;
  background: #cbd5e1;
  width: 80%;
}

.thumb-body-blocks {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.thumb-block-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 1px;
}

.thumb-block-bar.bilingual_clause {
  background: #6366f1;
}

.thumb-block-bar.signature {
  background: #10b981;
}

.thumb-footer-line {
  height: 2px;
  background: #cbd5e1;
  width: 60%;
}

.thumbnail-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
}

.page-tag {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.page-quick-actions {
  display: flex;
  gap: 2px;
}

.btn-icon-xs {
  border: none;
  background: transparent;
  font-size: 0.65rem;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 1px 2px;
}

.btn-icon-xs:hover {
  color: var(--color-text-base);
}

/* ── Right Inspector ── */
.inspector-sidebar {
  background: var(--color-bg-card);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--space-4);
  transition: all 0.2s ease;
}

.inspector-sidebar.is-collapsed {
  padding: 0;
  overflow: hidden;
  background: #f8fafc;
}

.inspector-collapsed-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  gap: 16px;
  height: 100%;
  cursor: pointer;
  transition: background 0.15s ease;
}

.inspector-collapsed-rail:hover {
  background: #f1f5f9;
}

.rail-vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 12px;
  user-select: none;
}

.inspector-top-collapse-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -1rem -1rem 1rem -1rem;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.inspector-panel-title {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #64748b;
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

.empty-state-notice {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
}

/* ── Live Preview Stream ── */
.a4-preview-stream {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background: #94a3b8;
  max-height: 80vh;
  overflow-y: auto;
}

.a4-preview-page {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  color: #0f172a;
  padding: 16mm 18mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.a4-preview-page.has-legal-border {
  border: 2px solid #0f172a;
  outline: 1px solid #cbd5e1;
  outline-offset: -5px;
}

.a4-preview-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clause-title-p {
  font-size: 9pt;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.clause-body-p {
  font-size: 8.5pt;
  line-height: 1.5;
  color: #334155;
}

.sig-preview-box {
  border: 1px dashed #cbd5e1;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.sig-line-box {
  height: 45px;
  border-bottom: 1px solid #cbd5e1;
  display: flex;
  align-items: flex-end;
  font-size: 8pt;
  color: #94a3b8;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

/* ═══════════════════════════════════════════════════════════════════════════
   HTML & CSS CODE STUDIO STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
.html-code-tab {
  padding: 16px 24px 30px;
  height: calc(100vh - 124px);
  display: flex;
  flex-direction: column;
}

.code-editor-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.code-editor-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
  gap: 12px;
}

.code-editor-title-wrap h3 {
  color: #f8fafc;
}

.code-editor-title-wrap .small-text {
  color: #94a3b8;
  font-size: 0.8rem;
  margin: 0;
}

.code-subtabs {
  display: flex;
  background: #0f172a;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #334155;
  gap: 4px;
}

.code-subtab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-subtab-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.05);
}

.code-subtab-btn.active {
  background: #6366f1;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.subtab-count {
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.85);
}

.code-editor-quick-actions {
  display: flex;
  gap: 8px;
}

/* Variable Chips Ribbon */
.variable-chips-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #141e33;
  padding: 8px 18px;
  border-bottom: 1px solid #1e293b;
  overflow: hidden;
}

.ribbon-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #818cf8;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.var-chip-btn, .token-chip-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.var-chip-btn:hover, .token-chip-btn:hover {
  background: #6366f1;
  color: #ffffff;
  border-color: #818cf8;
  transform: translateY(-1px);
}

/* Code Editor Panes */
.code-editor-panes {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  background: #090d16;
}

.code-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.pane-status-line {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 18px;
  background: #0d1322;
  border-bottom: 1px solid #1e293b;
  font-size: 0.72rem;
  color: #64748b;
  font-family: monospace;
}

.lang-tag {
  color: #38bdf8;
  font-weight: 700;
}

.pane-stats {
  margin-left: auto;
}

.code-editor-textarea {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 330px);
  background: #090d16;
  color: #e2e8f0;
  border: none;
  padding: 18px 22px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
  box-sizing: border-box;
}

.code-editor-textarea:focus {
  background: #0c111d;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HTML THUMBNAILS CAROUSEL STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
.html-page-card {
  min-width: 82px;
}

.html-page-card .thumbnail-preview {
  width: 66px;
  height: 90px;
  position: relative;
  overflow: hidden;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.thumb-top-accent {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #20383e, #29464d, #b79b52);
  border-radius: 1px;
}

.thumb-top-accent.accent-gold {
  background: linear-gradient(90deg, #b79b52, #29464d);
}

.thumb-cover-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 3px;
}

.thumb-cover-text {
  font-size: 5pt;
  font-weight: 800;
  color: #20383e;
  letter-spacing: 0.5px;
}

.thumb-cover-line {
  width: 18px;
  height: 1.5px;
  background: #b79b52;
  border-radius: 1px;
}

.thumb-cover-logo {
  font-size: 10pt;
  color: #29464d;
  margin-top: 4px;
}

.thumb-bilingual-body {
  display: flex;
  gap: 2px;
  flex: 1;
  padding: 3px 0;
}

.thumb-col-half {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.thumb-col-divider {
  width: 1px;
  background: #cfd8db;
}

.thumb-col-bar {
  height: 3px;
  background: #e2e8f0;
  border-radius: 1px;
}

.thumb-col-bar.w-100 { width: 100%; }
.thumb-col-bar.w-80 { width: 80%; }
.thumb-col-bar.w-60 { width: 60%; }

.thumb-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6pt;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
  padding-top: 2px;
}

.thumb-sign-tag {
  font-size: 7pt;
}

.thumb-page-num {
  font-weight: 700;
  margin-left: auto;
}

.page-title-label {
  display: block;
  font-size: 0.68rem;
  color: var(--color-text-muted);
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  margin-top: 3px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE CANVAS ELEMENT SELECTION & OUTLINES
   ═══════════════════════════════════════════════════════════════════════════ */
.interactive-html-canvas {
  cursor: default;
}

.interactive-html-canvas :deep(.clause),
.interactive-html-canvas :deep(.section-title),
.interactive-html-canvas :deep(.cover-title),
.interactive-html-canvas :deep(.clause-row),
.interactive-html-canvas :deep(.dynamic),
.interactive-html-canvas :deep(td),
.interactive-html-canvas :deep(p) {
  transition: outline 0.12s ease, background-color 0.12s ease;
  border-radius: 2px;
}

.interactive-html-canvas :deep(.clause:hover),
.interactive-html-canvas :deep(.section-title:hover),
.interactive-html-canvas :deep(.cover-title:hover),
.interactive-html-canvas :deep(.clause-row:hover),
.interactive-html-canvas :deep(.dynamic:hover),
.interactive-html-canvas :deep(td:hover) {
  outline: 1.5px dashed rgba(99, 102, 241, 0.6) !important;
  cursor: pointer;
}

.interactive-html-canvas :deep(.studio-selected-node) {
  outline: 2.5px solid #6366f1 !important;
  outline-offset: 1px;
  background-color: rgba(99, 102, 241, 0.08) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
  border-radius: 3px;
}

.interactive-html-canvas :deep([contenteditable="true"]:focus) {
  outline: 2.5px solid #4f46e5 !important;
  background-color: rgba(99, 102, 241, 0.12) !important;
}

.quick-token-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

/* ── Interactive Floating Row / Element Toolbar on Canvas ── */
.canvas-floating-toolbar {
  position: absolute;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #1e293b;
  color: #ffffff;
  padding: 4px 6px;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12);
  pointer-events: auto;
  user-select: none;
  animation: floatFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes floatFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.float-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  color: #94a3b8;
  margin-right: 2px;
}

.float-tag-name {
  color: #38bdf8;
  font-weight: 600;
}

.float-tag-sub {
  color: #a78bfa;
  font-size: 0.68rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.float-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.12s ease;
}

.float-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.float-btn-primary {
  background: #4f46e5;
  border-color: #6366f1;
  color: #ffffff;
}

.float-btn-primary:hover {
  background: #4338ca;
  border-color: #4f46e5;
}

.float-btn-danger {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.float-btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: #ef4444;
}

/* Row operations grid in right sidebar inspector */
.row-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.row-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-action-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
  color: #4f46e5;
}

.row-action-btn.text-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: #ef4444;
  color: #dc2626;
}

/* Enhanced selected row indicator across bilingual columns */
.interactive-html-canvas :deep(tr.studio-selected-node) {
  outline: 2.5px solid #6366f1 !important;
  outline-offset: 1px;
  background-color: rgba(99, 102, 241, 0.06) !important;
}

.interactive-html-canvas :deep(tr.studio-selected-node > td) {
  background-color: rgba(99, 102, 241, 0.07) !important;
  box-shadow: inset 0 0 0 1.5px rgba(99, 102, 241, 0.4) !important;
}

/* Hover outline when hovering a layer in the Layers sidebar */
.interactive-html-canvas :deep(.studio-layer-hover) {
  outline: 2px dashed #818cf8 !important;
  outline-offset: 2px;
  background-color: rgba(99, 102, 241, 0.04) !important;
  transition: outline 0.1s ease;
}

/* ── DOM Breadcrumbs Bar in Inspector ── */
.dom-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  margin-bottom: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.72rem;
  overflow-x: auto;
  white-space: nowrap;
}

.breadcrumb-chip {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.breadcrumb-chip.clickable:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.breadcrumb-chip.current-chip {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6d28d9;
  font-weight: 700;
  font-family: monospace;
}

.breadcrumb-arrow {
  color: #94a3b8;
  font-size: 0.8rem;
  user-select: none;
}

/* ── Layers Drawer in Sidebar ── */
.layers-drawer {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layers-header-block {
  padding: 12px 14px 10px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.layers-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  color: #6d28d9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.palette-heading {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.layers-subtext {
  font-size: 0.68rem;
  color: #64748b;
  display: block;
  margin-top: 1px;
}

.btn-icon-refresh {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon-refresh:hover {
  background: #f1f5f9;
  color: #4f46e5;
  border-color: #cbd5e1;
}

.layer-filter-row {
  width: 100%;
}

.custom-select-wrap {
  position: relative;
  width: 100%;
}

.layer-page-select {
  width: 100%;
  height: 32px;
  padding: 0 28px 0 10px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.15s ease;
}

.layer-page-select:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

.select-chevron {
  position: absolute;
  right: 10px;
  top: 11px;
  pointer-events: none;
  color: #64748b;
}

.layer-search-wrap {
  position: relative;
  width: 100%;
}

.search-lens-icon {
  position: absolute;
  left: 9px;
  top: 9.5px;
  color: #94a3b8;
  pointer-events: none;
}

.layer-search-input {
  width: 100%;
  height: 32px;
  padding: 0 26px 0 30px;
  font-size: 0.74rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: #0f172a;
  box-sizing: border-box;
  outline: none;
  transition: all 0.15s ease;
}

.layer-search-input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 6px;
  font-size: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 4px;
}

.clear-search-btn:hover {
  color: #0f172a;
}

.layers-tree-list {
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.layer-page-group {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.layer-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.15s ease;
}

.layer-group-header:hover {
  background: #f1f5f9;
}

.layer-group-header.is-active-page {
  background: #eff6ff;
  border-bottom-color: #dbeafe;
}

.group-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.group-page-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  white-space: nowrap;
}

.is-active-page .group-page-tag {
  background: #3b82f6;
  border-color: #2563eb;
  color: #ffffff;
}

.group-title-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 145px;
}

.group-count-pill {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.layer-group-body {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.layer-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.layer-item-card:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.layer-item-card.layer-selected {
  background: #f5f3ff;
  border-color: #c4b5fd;
  border-left: 3px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.08);
}

.layer-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.layer-icon-chip {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.layer-icon-chip.chip-bilingual {
  background: #eff6ff;
  border-color: #dbeafe;
}

.layer-icon-chip.chip-clause {
  background: #f0fdf4;
  border-color: #dcfce7;
}

.layer-icon-chip.chip-heading {
  background: #f5f3ff;
  border-color: #ede9fe;
}

.layer-icon-chip.chip-applicant {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.layer-icon-chip.chip-services {
  background: #f0fdfa;
  border-color: #ccfbf1;
}

.layer-icon-chip.chip-fees {
  background: #fffbeb;
  border-color: #fef3c7;
}

.layer-icon-chip.chip-signature {
  background: #fff1f2;
  border-color: #ffe4e6;
}

.layer-icon-chip.chip-header {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.layer-text-wrap {
  min-width: 0;
  flex: 1;
}

.layer-title-line {
  display: flex;
  align-items: center;
  gap: 5px;
}

.layer-title {
  font-size: 0.77rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 145px;
}

.layer-selected .layer-title {
  color: #4338ca;
}

.layer-tag-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

.layer-desc {
  font-size: 0.7rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  line-height: 1.35;
  margin-top: 1px;
}

.layer-item-actions {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.layer-item-card:hover .layer-item-actions,
.layer-item-card.layer-selected .layer-item-actions {
  display: flex;
}

.layer-btn-xs {
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.65rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.12s ease;
}

.layer-btn-xs:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.layer-btn-xs.text-danger:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

.empty-layers-state {
  text-align: center;
  padding: 30px 14px;
  color: #94a3b8;
}

.empty-layers-state .empty-icon {
  font-size: 1.6rem;
  margin-bottom: 6px;
}

.empty-layers-state p {
  font-size: 0.78rem;
  margin: 0;
}
</style>
