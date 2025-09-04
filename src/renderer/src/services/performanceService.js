/**
 * Performance Service
 * Handles code splitting, lazy loading, caching, and memory management
 */

class PerformanceService {
  constructor() {
    this.lazyComponents = new Map()
    this.cache = new Map()
    this.memoryMonitor = null
    this.bundleAnalyzer = null
    this.isInitialized = false
  }

  /**
   * Initialize performance service
   */
  initialize() {
    if (this.isInitialized) return

    this.setupMemoryMonitoring()
    this.setupBundleAnalysis()
    this.isInitialized = true

    console.log('Performance service initialized')
  }

  /**
   * Code Splitting & Lazy Loading
   */

  /**
   * Register lazy component
   */
  registerLazyComponent(name, loader, options = {}) {
    this.lazyComponents.set(name, {
      loader,
      options,
      loaded: false,
      component: null,
      promise: null
    })
  }

  /**
   * Load component lazily
   */
  async loadComponent(name, priority = 'normal') {
    const lazyComponent = this.lazyComponents.get(name)
    if (!lazyComponent) {
      throw new Error(`Lazy component '${name}' not registered`)
    }

    if (lazyComponent.loaded && lazyComponent.component) {
      return lazyComponent.component
    }

    if (lazyComponent.promise) {
      return lazyComponent.promise
    }

    // Create loading promise with priority
    lazyComponent.promise = this.loadWithPriority(lazyComponent.loader, priority)

    try {
      const component = await lazyComponent.promise
      lazyComponent.component = component
      lazyComponent.loaded = true
      lazyComponent.promise = null

      return component
    } catch (error) {
      lazyComponent.promise = null
      throw error
    }
  }

  /**
   * Load with priority (for future resource hints)
   */
  async loadWithPriority(loader, priority) {
    // For now, just load normally
    // Future: implement priority-based loading with resource hints
    return loader()
  }

  /**
   * Preload components
   */
  async preloadComponents(names, options = {}) {
    const {
      priority = 'low',
      timeout = 10000,
      concurrent = true
    } = options

    if (concurrent) {
      const promises = names.map(name => this.loadComponent(name, priority))
      return Promise.all(promises)
    } else {
      const results = []
      for (const name of names) {
        try {
          const component = await this.loadComponent(name, priority)
          results.push(component)
        } catch (error) {
          console.warn(`Failed to preload component '${name}':`, error)
        }
      }
      return results
    }
  }

  /**
   * Get component loader function
   * @param {string} name - Component name
   * @returns {Function} Loader function
   */
  getComponentLoader(name) {
    return this.lazyComponents.get(name)?.loader || null
  }

  /**
   * Create error component for failed loads
   */
  createErrorComponent(componentName) {
    return {
      template: `
        <div class="component-error">
          <p>Failed to load component: {{ componentName }}</p>
          <button @click="retry">Retry</button>
        </div>
      `,
      props: ['componentName'],
      methods: {
        retry() {
          // Clear cached component and retry
          const lazyComponent = this.lazyComponents.get(componentName)
          if (lazyComponent) {
            lazyComponent.loaded = false
            lazyComponent.component = null
            // Trigger reload
            this.$forceUpdate()
          }
        }
      }
    }
  }

  /**
   * Caching System
   */

  /**
   * Set cache entry
   */
  setCache(key, value, options = {}) {
    const {
      ttl = 300000, // 5 minutes
      maxSize = 50 * 1024 * 1024 // 50MB
    } = options

    const entry = {
      value,
      timestamp: Date.now(),
      ttl,
      size: this.calculateSize(value)
    }

    // Check cache size limit
    if (this.getCacheSize() + entry.size > maxSize) {
      this.evictCache(maxSize * 0.8) // Evict to 80% of max size
    }

    this.cache.set(key, entry)
  }

  /**
   * Get cache entry
   */
  getCache(key) {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize() {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  /**
   * Evict cache entries to reach target size
   */
  evictCache(targetSize) {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp) // LRU

    let currentSize = this.getCacheSize()

    for (const [key] of entries) {
      if (currentSize <= targetSize) break

      const entry = this.cache.get(key)
      if (entry) {
        currentSize -= entry.size
        this.cache.delete(key)
      }
    }
  }

  /**
   * Calculate object size (approximation)
   */
  calculateSize(obj) {
    try {
      return new Blob([JSON.stringify(obj)]).size
    } catch (error) {
      return 1024 // Default 1KB for complex objects
    }
  }

  /**
   * Memory Management
   */

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    if (typeof performance.memory === 'undefined') {
      console.warn('Memory monitoring not supported in this browser')
      return
    }

    this.memoryMonitor = setInterval(() => {
      const memInfo = performance.memory

      // Check memory usage thresholds
      const usageRatio = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize

      if (usageRatio > 0.8) {
        console.warn('High memory usage detected:', {
          used: this.formatBytes(memInfo.usedJSHeapSize),
          total: this.formatBytes(memInfo.totalJSHeapSize),
          ratio: (usageRatio * 100).toFixed(1) + '%'
        })

        // Trigger garbage collection if available
        this.triggerGC()

        // Clear expired cache
        this.clearExpiredCache()

        // Suggest memory cleanup
        this.suggestMemoryCleanup()
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor)
      this.memoryMonitor = null
    }
  }

  /**
   * Trigger garbage collection (if available)
   */
  triggerGC() {
    if (window.gc && typeof window.gc === 'function') {
      window.gc()
    }
  }

  /**
   * Suggest memory cleanup actions
   */
  suggestMemoryCleanup() {
    // Emit event for components to cleanup
    window.dispatchEvent(new CustomEvent('memory-pressure', {
      detail: { action: 'cleanup' }
    }))
  }

  /**
   * Bundle Analysis
   */

  /**
   * Setup bundle analysis
   */
  setupBundleAnalysis() {
    // Track bundle loading performance
    this.bundleAnalyzer = {
      chunks: new Map(),
      totalLoaded: 0,
      averageLoadTime: 0
    }

    // Monitor dynamic imports
    this.setupDynamicImportMonitoring()
  }

  /**
   * Setup dynamic import monitoring
   */
  setupDynamicImportMonitoring() {
    if (typeof window === 'undefined') {
      return // Skip in non-browser environments
    }

    const originalImport = window.__import__ || this.dynamicImport

    window.__import__ = async (moduleId) => {
      const startTime = performance.now()
      try {
        const result = await originalImport(moduleId)
        const loadTime = performance.now() - startTime

        this.recordBundleLoad(moduleId, loadTime)
        return result
      } catch (error) {
        console.error(`Failed to load module: ${moduleId}`, error)
        throw error
      }
    }
  }

  /**
   * Fallback dynamic import function
   */
  async dynamicImport(moduleId) {
    return await import(moduleId)
  }

  /**
   * Record bundle load performance
   */
  recordBundleLoad(moduleId, loadTime) {
    if (!this.bundleAnalyzer) return

    this.bundleAnalyzer.chunks.set(moduleId, {
      loadTime,
      timestamp: Date.now()
    })

    this.bundleAnalyzer.totalLoaded++
    this.bundleAnalyzer.averageLoadTime =
      (this.bundleAnalyzer.averageLoadTime * (this.bundleAnalyzer.totalLoaded - 1) + loadTime) /
      this.bundleAnalyzer.totalLoaded

    // Log slow loads
    if (loadTime > 1000) {
      console.warn(`Slow bundle load: ${moduleId} (${loadTime.toFixed(2)}ms)`)
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      cache: {
        size: this.getCacheSize(),
        entries: this.cache.size
      },
      memory: typeof performance.memory !== 'undefined' ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      bundles: this.bundleAnalyzer ? {
        totalLoaded: this.bundleAnalyzer.totalLoaded,
        averageLoadTime: this.bundleAnalyzer.averageLoadTime,
        chunks: Array.from(this.bundleAnalyzer.chunks.entries()).map(([id, data]) => ({
          id,
          loadTime: data.loadTime,
          timestamp: data.timestamp
        }))
      } : null
    }
  }

  /**
   * Utility methods
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopMemoryMonitoring()
    this.cache.clear()
    this.lazyComponents.clear()

    if (typeof window !== 'undefined' && window.__import__) {
      delete window.__import__
    }
  }
}

// Export singleton instance
export default new PerformanceService()
