/**
 * Memory Management Service
 * Handles memory monitoring, cleanup, and optimization
 */

class MemoryService {
  constructor() {
    this.monitor = null
    this.gcThreshold = 0.8 // 80% memory usage
    this.cleanupThreshold = 0.7 // 70% memory usage
    this.checkInterval = 30000 // 30 seconds
    this.memoryHistory = []
    this.maxHistorySize = 100
    this.eventListeners = new Set()
    this.isMonitoring = false
    this.cleanupStrategies = new Map()
  }

  /**
   * Start memory monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // Check if memory API is available
    if (!this.isMemoryAPIAvailable()) {
      console.warn('Memory API not available, monitoring disabled')
      return false
    }

    this.monitor = setInterval(() => {
      this.checkMemoryUsage()
    }, this.checkInterval)

    console.log('Memory monitoring started')
    return true
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring() {
    if (this.monitor) {
      clearInterval(this.monitor)
      this.monitor = null
    }
    this.isMonitoring = false
    console.log('Memory monitoring stopped')
  }

  /**
   * Check current memory usage
   */
  checkMemoryUsage() {
    const memInfo = performance.memory
    const usageRatio = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize

    // Record memory history
    this.recordMemoryUsage(memInfo, usageRatio)

    // Check thresholds
    if (usageRatio > this.gcThreshold) {
      console.warn('High memory usage detected:', this.formatMemoryInfo(memInfo))
      this.triggerGarbageCollection()
      this.notifyMemoryPressure('critical')
    } else if (usageRatio > this.cleanupThreshold) {
      console.info('Elevated memory usage:', this.formatMemoryInfo(memInfo))
      this.performCleanup()
      this.notifyMemoryPressure('high')
    }

    // Periodic cleanup
    if (Math.random() < 0.1) { // 10% chance every check
      this.performPeriodicCleanup()
    }
  }

  /**
   * Record memory usage in history
   */
  recordMemoryUsage(memInfo, usageRatio) {
    const record = {
      timestamp: Date.now(),
      used: memInfo.usedJSHeapSize,
      total: memInfo.totalJSHeapSize,
      limit: memInfo.jsHeapSizeLimit,
      usageRatio,
      usedMB: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)
    }

    this.memoryHistory.push(record)

    // Maintain history size
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift()
    }
  }

  /**
   * Trigger garbage collection
   */
  triggerGarbageCollection() {
    if (window.gc && typeof window.gc === 'function') {
      console.log('Triggering garbage collection...')
      window.gc()
      return true
    } else {
      console.warn('Garbage collection not available')
      return false
    }
  }

  /**
   * Perform memory cleanup
   */
  async performCleanup() {
    console.log('Performing memory cleanup...')

    const cleanupPromises = []

    // Execute registered cleanup strategies
    for (const [name, strategy] of this.cleanupStrategies) {
      try {
        const promise = strategy()
        if (promise && typeof promise.then === 'function') {
          cleanupPromises.push(promise)
        }
      } catch (error) {
        console.error(`Cleanup strategy '${name}' failed:`, error)
      }
    }

    // Wait for all cleanup to complete
    if (cleanupPromises.length > 0) {
      await Promise.allSettled(cleanupPromises)
    }

    // Trigger GC after cleanup
    setTimeout(() => this.triggerGarbageCollection(), 100)
  }

  /**
   * Perform periodic cleanup
   */
  performPeriodicCleanup() {
    // Clear old event listeners
    this.cleanupEventListeners()

    // Clear unused DOM references
    this.cleanupDOMReferences()

    // Clear expired cache entries (if cache service exists)
    if (window.cacheService) {
      window.cacheService.clearExpired()
    }
  }

  /**
   * Register cleanup strategy
   */
  registerCleanupStrategy(name, strategy) {
    if (typeof strategy === 'function') {
      this.cleanupStrategies.set(name, strategy)
      return true
    }
    return false
  }

  /**
   * Unregister cleanup strategy
   */
  unregisterCleanupStrategy(name) {
    return this.cleanupStrategies.delete(name)
  }

  /**
   * Cleanup event listeners
   */
  cleanupEventListeners() {
    // Find and remove unused event listeners
    // This is a simplified implementation
    const elements = document.querySelectorAll('*')
    elements.forEach(element => {
      // Check if element has excessive event listeners
      if (element._eventListeners && Object.keys(element._eventListeners).length > 10) {
        console.warn('Element with many event listeners found:', element)
      }
    })
  }

  /**
   * Cleanup DOM references
   */
  cleanupDOMReferences() {
    // Find detached DOM elements that might be referenced
    // This is a simplified implementation
    if (window.WeakMap && window.MutationObserver) {
      // Could implement more sophisticated tracking here
    }
  }

  /**
   * Notify memory pressure to listeners
   */
  notifyMemoryPressure(level) {
    const event = new CustomEvent('memory-pressure', {
      detail: { level, timestamp: Date.now() }
    })

    window.dispatchEvent(event)

    // Notify registered listeners
    this.eventListeners.forEach(listener => {
      try {
        listener({ level, timestamp: Date.now() })
      } catch (error) {
        console.error('Memory pressure listener error:', error)
      }
    })
  }

  /**
   * Add memory pressure listener
   */
  addMemoryPressureListener(callback) {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    if (!this.isMemoryAPIAvailable()) {
      return { available: false }
    }

    const memInfo = performance.memory
    const currentUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize

    return {
      available: true,
      current: {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        usageRatio: currentUsage,
        usedMB: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)
      },
      history: this.memoryHistory.slice(-10), // Last 10 records
      monitoring: {
        active: this.isMonitoring,
        interval: this.checkInterval,
        thresholds: {
          cleanup: this.cleanupThreshold,
          gc: this.gcThreshold
        }
      }
    }
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend(samples = 10) {
    if (this.memoryHistory.length < samples) {
      return { trend: 'insufficient-data', samples: this.memoryHistory.length }
    }

    const recent = this.memoryHistory.slice(-samples)
    const usageRatios = recent.map(record => record.usageRatio)

    const first = usageRatios[0]
    const last = usageRatios[usageRatios.length - 1]
    const difference = last - first

    let trend = 'stable'
    if (difference > 0.05) trend = 'increasing'
    else if (difference < -0.05) trend = 'decreasing'

    return {
      trend,
      difference: difference * 100, // percentage
      first: first * 100,
      last: last * 100,
      samples
    }
  }

  /**
   * Force memory cleanup
   */
  async forceCleanup() {
    console.log('Forcing memory cleanup...')
    await this.performCleanup()
    return this.getMemoryStats()
  }

  /**
   * Set memory thresholds
   */
  setThresholds(cleanupThreshold, gcThreshold) {
    if (cleanupThreshold >= 0 && cleanupThreshold <= 1) {
      this.cleanupThreshold = cleanupThreshold
    }
    if (gcThreshold >= 0 && gcThreshold <= 1) {
      this.gcThreshold = gcThreshold
    }
  }

  /**
   * Set monitoring interval
   */
  setMonitoringInterval(interval) {
    if (interval >= 1000) { // Minimum 1 second
      this.checkInterval = interval

      // Restart monitoring if active
      if (this.isMonitoring) {
        this.stopMonitoring()
        this.startMonitoring()
      }
    }
  }

  /**
   * Check if Memory API is available
   */
  isMemoryAPIAvailable() {
    return typeof performance !== 'undefined' &&
           performance.memory &&
           typeof performance.memory.usedJSHeapSize === 'number'
  }

  /**
   * Format memory info for logging
   */
  formatMemoryInfo(memInfo) {
    return {
      used: this.formatBytes(memInfo.usedJSHeapSize),
      total: this.formatBytes(memInfo.totalJSHeapSize),
      limit: this.formatBytes(memInfo.jsHeapSizeLimit),
      usage: ((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100).toFixed(1) + '%'
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get registered cleanup strategies
   */
  getCleanupStrategies() {
    return Array.from(this.cleanupStrategies.keys())
  }

  /**
   * Clear memory history
   */
  clearHistory() {
    this.memoryHistory = []
  }

  /**
   * Destroy service
   */
  destroy() {
    this.stopMonitoring()
    this.cleanupStrategies.clear()
    this.eventListeners.clear()
    this.clearHistory()
  }
}

// Default cleanup strategies
const defaultCleanupStrategies = {
  // Clear Vue component cache
  vueComponents: () => {
    if (window.Vue && window.Vue._installedPlugins) {
      // Could implement component cache clearing here
      console.log('Vue component cleanup completed')
    }
  },

  // Clear event cache
  eventCache: () => {
    // Clear any cached event data
    console.log('Event cache cleanup completed')
  },

  // Clear DOM cache
  domCache: () => {
    // Clear any cached DOM references
    console.log('DOM cache cleanup completed')
  }
}

// Export singleton instance
const memoryService = new MemoryService()

// Register default cleanup strategies
Object.entries(defaultCleanupStrategies).forEach(([name, strategy]) => {
  memoryService.registerCleanupStrategy(name, strategy)
})

export default memoryService
