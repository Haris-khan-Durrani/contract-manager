<template>
  <div class="signature-pad-container">
    <!-- Mode Tabs -->
    <div class="sig-tabs">
      <button
        type="button"
        class="sig-tab-btn"
        :class="{ active: mode === 'draw' }"
        @click="switchMode('draw')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Draw
      </button>

      <button
        type="button"
        class="sig-tab-btn"
        :class="{ active: mode === 'type' }"
        @click="switchMode('type')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 7 4 4 20 4 20 7"/>
          <line x1="9" y1="20" x2="15" y2="20"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
        Type
      </button>

      <button
        type="button"
        class="sig-tab-btn"
        :class="{ active: mode === 'upload' }"
        @click="switchMode('upload')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Upload
      </button>
    </div>

    <!-- Mode 1: DRAW CANVAS -->
    <div v-show="mode === 'draw'" class="canvas-wrapper">
      <div class="canvas-header">
        <span class="canvas-hint">Draw your signature with mouse, stylus, or finger</span>
        <button type="button" class="btn-clear" @click="clearCanvas" :disabled="!hasDrawn">
          Clear
        </button>
      </div>
      <div class="canvas-box">
        <canvas
          ref="canvasRef"
          class="drawing-canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startTouch"
          @touchmove.prevent="touchMove"
          @touchend.prevent="stopDrawing"
        ></canvas>
        <div class="signature-baseline">
          <span class="sig-x">✕</span>
        </div>
      </div>
    </div>

    <!-- Mode 2: TYPE SIGNATURE -->
    <div v-show="mode === 'type'" class="type-wrapper">
      <label class="form-label">Type your full legal name:</label>
      <input
        type="text"
        v-model="typedName"
        class="sig-text-input"
        placeholder="e.g. Jane Doe"
        maxlength="60"
        @input="generateTypedSignature"
      />

      <div class="type-styles-list" v-if="typedName.trim()">
        <label class="form-label" style="margin-top: var(--space-4);">Select signature style:</label>
        <div class="style-cards">
          <div
            v-for="(font, idx) in signatureFonts"
            :key="idx"
            class="style-card"
            :class="{ selected: selectedFontIndex === idx }"
            @click="selectFont(idx)"
          >
            <span :style="{ fontFamily: font.family, fontStyle: font.style || 'italic', fontSize: '1.6rem' }">
              {{ typedName }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 3: UPLOAD SIGNATURE -->
    <div v-show="mode === 'upload'" class="upload-wrapper">
      <div
        class="drop-zone"
        :class="{ dragging: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          type="file"
          ref="fileInputRef"
          accept="image/png, image/jpeg, image/webp"
          style="display: none;"
          @change="handleFileChange"
        />

        <div v-if="!uploadedPreview" class="upload-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/>
            <path d="m16 16-4-4-4 4"/>
          </svg>
          <p class="drop-text">Click or drag an image of your signature here</p>
          <span class="drop-hint">PNG, JPG or WEBP (transparent background recommended)</span>
        </div>

        <div v-else class="upload-preview-box">
          <img :src="uploadedPreview" alt="Signature preview" class="uploaded-img" />
          <button type="button" class="btn-clear" @click.stop="clearUpload">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  initialName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change'])

const mode = ref('draw')
const hasDrawn = ref(false)
const isDrawing = ref(false)
const typedName = ref(props.initialName || '')
const selectedFontIndex = ref(0)
const isDragging = ref(false)
const uploadedPreview = ref('')

const canvasRef = ref(null)
const fileInputRef = ref(null)

const signatureFonts = [
  { name: 'Cursive Elegant', family: "'Dancing Script', 'Brush Script MT', cursive", style: 'italic' },
  { name: 'Casual Hand', family: "'Caveat', cursive", style: 'normal' },
  { name: 'Formal Script', family: "'Great Vibes', cursive", style: 'normal' },
  { name: 'Modern Signature', family: "'Allura', cursive", style: 'italic' },
]

function emitChange(dataUrl, methodName = mode.value) {
  emit('change', {
    dataUrl: dataUrl || null,
    method: methodName,
  })
}

function switchMode(newMode) {
  mode.value = newMode
  if (newMode === 'draw') {
    nextTick(() => initCanvas())
    if (hasDrawn.value && canvasRef.value) {
      exportCanvas()
    } else {
      emitChange(null, 'draw')
    }
  } else if (newMode === 'type') {
    generateTypedSignature()
  } else if (newMode === 'upload') {
    emitChange(uploadedPreview.value || null, 'upload')
  }
}

// ── Drawing Canvas Logic ──────────────────────────────────────────────────────
let ctx = null

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = rect.width || 560
  const height = rect.height || 160
  canvas.width = width * dpr
  canvas.height = height * dpr

  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function getPos(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function startDrawing(e) {
  isDrawing.value = true
  hasDrawn.value = true
  const pos = getPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function draw(e) {
  if (!isDrawing.value) return
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function stopDrawing() {
  if (!isDrawing.value) return
  isDrawing.value = false
  ctx.closePath()
  exportCanvas()
}

function startTouch(e) {
  if (e.touches.length !== 1) return
  isDrawing.value = true
  hasDrawn.value = true
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const t = e.touches[0]
  ctx.beginPath()
  ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top)
}

function touchMove(e) {
  if (!isDrawing.value || e.touches.length !== 1) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const t = e.touches[0]
  ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top)
  ctx.stroke()
}

function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
  hasDrawn.value = false
  emitChange(null, 'draw')
}

function exportCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !hasDrawn.value) return
  const dataUrl = canvas.toDataURL('image/png')
  emitChange(dataUrl, 'draw')
}

// ── Type Signature Logic ─────────────────────────────────────────────────────
function selectFont(idx) {
  selectedFontIndex.value = idx
  generateTypedSignature()
}

function generateTypedSignature() {
  if (!typedName.value.trim()) {
    emitChange(null, 'type')
    return
  }

  const offscreen = document.createElement('canvas')
  offscreen.width = 600
  offscreen.height = 160
  const oCtx = offscreen.getContext('2d')

  oCtx.clearRect(0, 0, 600, 160)
  const font = signatureFonts[selectedFontIndex.value] || signatureFonts[0]
  oCtx.font = `${font.style || 'normal'} 52px ${font.family}`
  oCtx.fillStyle = '#0f172a'
  oCtx.textAlign = 'center'
  oCtx.textBaseline = 'middle'
  oCtx.fillText(typedName.value.trim(), 300, 80)

  const dataUrl = offscreen.toDataURL('image/png')
  emitChange(dataUrl, 'type')
}

// ── Upload Signature Logic ───────────────────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processUploadedFile(file)
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) processUploadedFile(file)
}

function processUploadedFile(file) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    uploadedPreview.value = ev.target.result
    emitChange(uploadedPreview.value, 'upload')
  }
  reader.readAsDataURL(file)
}

function clearUpload() {
  uploadedPreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  emitChange(null, 'upload')
}

watch(() => props.initialName, (newVal) => {
  if (newVal && !typedName.value) {
    typedName.value = newVal
    if (mode.value === 'type') generateTypedSignature()
  }
})

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
  if (typedName.value && mode.value === 'type') {
    generateTypedSignature()
  }
})
</script>

<style scoped>
.signature-pad-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.sig-tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.sig-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sig-tab-btn:hover {
  color: var(--color-text-base);
  background: var(--color-bg-card);
}

.sig-tab-btn.active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  font-weight: 600;
}

/* Canvas Mode */
.canvas-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.btn-clear {
  background: none;
  border: 1px solid var(--color-border);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.btn-clear:hover:not(:disabled) {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.canvas-box {
  position: relative;
  width: 100%;
  height: 180px;
  background: #ffffff;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
}

.signature-baseline {
  position: absolute;
  bottom: 25%;
  left: 20px;
  right: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.sig-x {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.3);
  margin-left: 2px;
  margin-bottom: 2px;
}

/* Type Mode */
.type-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-base);
}

.sig-text-input {
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-base);
  font-size: 1rem;
}

.style-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
}

.style-card {
  padding: var(--space-4);
  background: #ffffff;
  color: #0f172a;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-card:hover {
  border-color: var(--color-primary-light);
}

.style-card.selected {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

/* Upload Mode */
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-8);
  text-align: center;
  background: var(--color-bg-card);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.drop-zone:hover, .drop-zone.dragging {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.04);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.drop-text {
  font-weight: 500;
  color: var(--color-text-base);
  margin: 0;
}

.drop-hint {
  font-size: 0.8rem;
}

.upload-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.uploaded-img {
  max-height: 120px;
  max-width: 100%;
  object-fit: contain;
  background: #ffffff;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
}
</style>
