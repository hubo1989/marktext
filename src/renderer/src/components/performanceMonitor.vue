<template>
  <div
    class="performance-monitor"
    :class="{ 'performance-monitor--visible': isVisible }"
    @click="toggleVisibility"
  >
    <div class="performance-monitor__header">
      <h4>Performance Monitor</h4>
      <button @click.stop="toggleVisibility" class="performance-monitor__close">
        ×
      </button>
    </div>

    <div class="performance-monitor__content">
      <!-- Memory Usage -->
      <div class="performance-monitor__section">
        <h5>Memory Usage</h5>
        <div class="performance-monitor__metrics">
          <div class="metric">
            <span class="metric__label">Used:</span>
            <span class="metric__value">{{ formatBytes(memoryInfo.used) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Total:</span>
            <span class="metric__value">{{ formatBytes(memoryInfo.total) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Limit:</span>
            <span class="metric__value">{{ formatBytes(memoryInfo.limit) }}</span>
          </div>
        </div>
      </div>

      <!-- Cache Info -->
      <div class="performance-monitor__section">
        <h5>Cache Status</h5>
        <div class="performance-monitor__metrics">
          <div class="metric">
            <span class="metric__label">Size:</span>
            <span class="metric__value">{{ formatBytes(cacheInfo.size) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Entries:</span>
            <span class="metric__value">{{ cacheInfo.entries }}</span>
          </div>
        </div>
      </div>

      <!-- Animation Status -->
      <div class="performance-monitor__section">
        <h5>Animations</h5>
        <div class="performance-monitor__metrics">
          <div class="metric">
            <span class="metric__label">Active:</span>
            <span class="metric__value">{{ animationCount }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Mode:</span>
            <span class="metric__value">{{ performanceMode }}</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="performance-monitor__controls">
        <button @click.stop="clearCache" class="performance-monitor__button">
          Clear Cache
        </button>
        <button @click.stop="triggerGC" class="performance-monitor__button">
          Force GC
        </button>
        <button @click.stop="toggleAnimations" class="performance-monitor__button">
          {{ animationsEnabled ? 'Disable' : 'Enable' }} Animations
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PerformanceService from '@/services/performanceService'
import AnimationService from '@/services/animationService'

// Reactive data
const isVisible = ref(false)
const memoryInfo = ref({ used: 0, total: 0, limit: 0 })
const cacheInfo = ref({ size: 0, entries: 0 })
const animationCount = ref(0)
const performanceMode = ref('unknown')
const animationsEnabled = ref(true)

// Update interval
let updateInterval = null

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

const updateMetrics = () => {
  try {
    const metrics = PerformanceService.getMetrics()

    // Update memory info
    if (metrics.memory) {
      memoryInfo.value = {
        used: metrics.memory.used || 0,
        total: metrics.memory.total || 0,
        limit: metrics.memory.limit || 0
      }
    }

    // Update cache info
    if (metrics.cache) {
      cacheInfo.value = {
        size: metrics.cache.size || 0,
        entries: metrics.cache.entries || 0
      }
    }

    // Update animation info
    animationCount.value = AnimationService.getActiveAnimationsCount()
    performanceMode.value = AnimationService.detectPerformanceMode()

  } catch (error) {
    console.error('Failed to update performance metrics:', error)
  }
}

const clearCache = () => {
  try {
    PerformanceService.clearExpiredCache()
    console.log('Cache cleared')
    updateMetrics()
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}

const triggerGC = () => {
  try {
    PerformanceService.triggerGC()
    console.log('Garbage collection triggered')
    updateMetrics()
  } catch (error) {
    console.error('Failed to trigger GC:', error)
  }
}

const toggleAnimations = () => {
  try {
    animationsEnabled.value = !animationsEnabled.value
    AnimationService.setEnabled(animationsEnabled.value)
    console.log('Animations', animationsEnabled.value ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle animations:', error)
  }
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

onMounted(() => {
  // Initial update
  updateMetrics()

  // Start monitoring
  updateInterval = setInterval(updateMetrics, 2000)

  // Keyboard shortcut to toggle monitor
  const handleKeydown = (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault()
      toggleVisibility()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: calc(-1 * (var(--perf-monitor-width) + 20px));
  width: var(--perf-monitor-width);
  background: var(--floatBgColor);
  border: 1px solid var(--floatBorderColor);
  border-radius: var(--perf-monitor-border-radius);
  box-shadow: var(--perf-monitor-shadow);
  backdrop-filter: blur(10px);
  z-index: 10000;
  transition: right var(--dual-screen-transition-duration) var(--easing-standard);
  font-size: 12px;
}

.performance-monitor--visible {
  right: 20px;
}

.performance-monitor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--floatBorderColor);
  background: var(--floatBgColor);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.performance-monitor__header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--editorColor);
}

.performance-monitor__close {
  background: none;
  border: none;
  color: var(--iconColor);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.performance-monitor__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--editorColor);
}

.performance-monitor__content {
  padding: var(--spacing-md);
}

.performance-monitor__section {
  margin-bottom: var(--spacing-md);
}

.performance-monitor__section h5 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--editorColor);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-monitor__metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric__label {
  color: var(--editorColor60);
  font-weight: 500;
}

.metric__value {
  color: var(--editorColor);
  font-weight: 600;
  font-family: var(--codeFontFamily, monospace);
}

.performance-monitor__controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--floatBorderColor);
}

.performance-monitor__button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--buttonBgColor);
  border: var(--buttonBorder);
  border-radius: var(--radius-sm);
  color: var(--buttonFontColor);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.performance-monitor__button:hover {
  background: var(--buttonBgColorHover);
  border-color: var(--buttonBorderHover);
  transform: translateY(-1px);
}

/* Dark theme support */
.theme-dark .performance-monitor,
.theme-material-dark .performance-monitor,
.theme-one-dark .performance-monitor {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.theme-dark .performance-monitor__header,
.theme-material-dark .performance-monitor__header,
.theme-one-dark .performance-monitor__header {
  background: rgba(45, 45, 45, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .performance-monitor {
    width: calc(var(--perf-monitor-width) - 20px);
    right: calc(-1 * (var(--perf-monitor-width) + 10px));
  }

  .performance-monitor--visible {
    right: 10px;
  }
}
</style>
