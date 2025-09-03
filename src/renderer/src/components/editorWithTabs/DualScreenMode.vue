<template>
  <div class="dual-screen-container" :class="{ 'dual-screen-active': isActive }">
    <!-- Source Panel (Left) -->
    <div
      class="source-panel"
      :style="{ width: `${sourceWidth}%` }"
      ref="sourcePanel"
    >
      <div class="panel-header">
        <h4>{{ t('editor.dualScreen.sourceTitle') || 'Source Code' }}</h4>
        <div class="panel-controls">
          <button
            @click="toggleSync"
            :class="{ active: syncEnabled }"
            :title="syncEnabled ? t('editor.dualScreen.disableSync') || 'Disable Sync' : t('editor.dualScreen.enableSync') || 'Enable Sync'"
          >
            🔄
          </button>
          <button
            @click="resetSplit"
            :title="t('editor.dualScreen.resetSplit') || 'Reset Split'"
          >
            ↔️
          </button>
        </div>
      </div>
      <div class="source-content" ref="sourceContent">
        <slot name="source"></slot>
      </div>
    </div>

    <!-- Splitter -->
    <div
      class="splitter"
      ref="splitter"
      @mousedown="startResize"
    >
      <div class="splitter-handle"></div>
    </div>

    <!-- Preview Panel (Right) -->
    <div
      class="preview-panel"
      :style="{ width: `${previewWidth}%` }"
    >
      <div class="panel-header">
        <h4>{{ t('editor.dualScreen.previewTitle') || 'Live Preview' }}</h4>
        <div class="panel-controls">
          <span class="sync-indicator" v-if="syncEnabled">
            {{ t('editor.dualScreen.synced') || 'Synced' }}
          </span>
        </div>
      </div>
      <div class="preview-content" ref="previewContent">
        <slot name="preview"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  splitRatio: {
    type: Number,
    default: 0.5
  },
  syncScroll: {
    type: Boolean,
    default: true
  },
  syncCursor: {
    type: Boolean,
    default: true
  },
  currentLine: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['split-change', 'sync-toggle', 'line-focus'])

// Composables
const { t } = useI18n()

// Reactive data
const sourcePanel = ref(null)
const previewContent = ref(null)
const splitter = ref(null)
const isResizing = ref(false)
const syncEnabled = ref(true)

// Computed
const sourceWidth = computed(() => props.splitRatio * 100)
const previewWidth = computed(() => (1 - props.splitRatio) * 100)

// Methods
const startResize = (e) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

const handleResize = (e) => {
  if (!isResizing.value || !sourcePanel.value) return

  const container = sourcePanel.value.parentElement
  const containerRect = container.getBoundingClientRect()
  const newRatio = (e.clientX - containerRect.left) / containerRect.width

  // Constrain ratio between 0.2 and 0.8
  const constrainedRatio = Math.max(0.2, Math.min(0.8, newRatio))

  emit('split-change', constrainedRatio)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const toggleSync = () => {
  syncEnabled.value = !syncEnabled.value
  emit('sync-toggle', syncEnabled.value)
}

const resetSplit = () => {
  emit('split-change', 0.5)
}

// Enhanced sync scroll functionality
const syncScroll = (sourceElement, targetElement) => {
  if (!props.syncScroll || !syncEnabled.value) return

  let isSyncing = false
  let scrollTimeout

  const syncTargetScroll = () => {
    if (isSyncing || !targetElement || !sourceElement) return

    isSyncing = true

    try {
      const sourceScrollTop = sourceElement.scrollTop
      const sourceScrollHeight = sourceElement.scrollHeight - sourceElement.clientHeight
      const targetScrollHeight = targetElement.scrollHeight - targetElement.clientHeight

      if (sourceScrollHeight > 0 && targetScrollHeight > 0) {
        const scrollRatio = sourceScrollTop / sourceScrollHeight
        const targetScrollTop = scrollRatio * targetScrollHeight

        // Smooth scroll animation
        targetElement.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
      }
    } finally {
      // Reset syncing flag after a short delay
      setTimeout(() => {
        isSyncing = false
      }, 50)
    }
  }

  // Throttled scroll handler for better performance
  const throttledSync = () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(syncTargetScroll, 16) // ~60fps
  }

  sourceElement.addEventListener('scroll', throttledSync, { passive: true })

  return () => {
    sourceElement.removeEventListener('scroll', throttledSync)
    clearTimeout(scrollTimeout)
  }
}

// Watch for line changes to sync cursor
watch(() => props.currentLine, (newLine) => {
  if (props.syncCursor && syncEnabled.value) {
    emit('line-focus', newLine)
  }
})

// Refs for cleanup functions
let cleanupSourceScroll = null
let cleanupPreviewScroll = null

// Enhanced lifecycle management
onMounted(() => {
  // Initialize sync functionality if elements are available
  if (sourcePanel.value && previewContent.value) {
    try {
      cleanupSourceScroll = syncScroll(sourcePanel.value, previewContent.value)
      cleanupPreviewScroll = syncScroll(previewContent.value, sourcePanel.value)
    } catch (error) {
      console.error('Failed to initialize dual screen sync:', error)
    }
  }
})

onBeforeUnmount(() => {
  // Clean up scroll sync listeners
  try {
    if (cleanupSourceScroll) cleanupSourceScroll()
    if (cleanupPreviewScroll) cleanupPreviewScroll()
  } catch (error) {
    console.error('Error cleaning up dual screen sync:', error)
  }

  // Clean up resize listeners
  try {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  } catch (error) {
    console.error('Error cleaning up resize listeners:', error)
  }

  // Clean up any remaining timeouts
  try {
    if (scrollTimeout) clearTimeout(scrollTimeout)
  } catch (error) {
    console.error('Error cleaning up timeouts:', error)
  }
})
</script>

<style scoped>
.dual-screen-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  background: var(--editorBgColor);
}

.dual-screen-active {
  /* Active state styling */
}

.source-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--itemBgColor);
}

.source-panel {
  background: var(--editorBgColor);
}

.preview-panel {
  background: var(--editorBgColor);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--floatBgColor);
  border-bottom: 1px solid var(--itemBgColor);
  min-height: 40px;
}

.panel-header h4 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--editorColor);
}

.panel-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.panel-controls button {
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  cursor: pointer;
  color: var(--editorColor);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.panel-controls button:hover {
  background: rgba(128, 128, 128, 0.2);
  border-color: rgba(128, 128, 128, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-controls button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-controls button.active {
  background: rgba(64, 158, 255, 0.15);
  border-color: var(--themeColor);
  color: var(--themeColor);
  font-weight: 600;
}

.sync-indicator {
  font-size: 12px;
  color: var(--themeColor);
  font-weight: 500;
}

.source-content,
.preview-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-md);
}

.source-content {
  font-family: var(--codeFontFamily, 'Monaco', 'Menlo', monospace);
  font-size: var(--codeFontSize, 14px);
  line-height: 1.5;
  background: var(--editorBgColor);
  color: var(--editorColor);
}

.preview-content {
  background: var(--editorBgColor);
}

.splitter {
  width: 8px;
  background: var(--floatBgColor);
  border-left: 1px solid var(--itemBgColor);
  border-right: 1px solid var(--itemBgColor);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.splitter:hover .splitter-handle {
  opacity: 1;
}

.splitter-handle {
  width: 2px;
  height: 24px;
  background: var(--themeColor);
  border-radius: 1px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.splitter:active .splitter-handle {
  opacity: 1;
  background: var(--themeColor);
}

/* Responsive design */
@media (max-width: 768px) {
  .dual-screen-container {
    flex-direction: column;
  }

  .splitter {
    height: 8px;
    width: 100%;
    cursor: row-resize;
    border-top: 1px solid var(--itemBgColor);
    border-bottom: 1px solid var(--itemBgColor);
    border-left: none;
    border-right: none;
  }

  .source-panel,
  .preview-panel {
    width: 100%;
    height: 50%;
  }

  .splitter-handle {
    width: 24px;
    height: 2px;
  }
}

/* Animation for mode transitions */
.dual-screen-container {
  transition: all 0.3s ease;
}

.panel-header {
  transition: background-color 0.2s ease;
}

.source-content,
.preview-content {
  transition: background-color 0.2s ease;
}
</style>
