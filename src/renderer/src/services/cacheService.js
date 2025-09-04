/**
 * Cache Service
 * Multi-level caching system for different data types and use cases
 */

class CacheService {
  constructor() {
    this.caches = new Map()
    this.cleanupInterval = null
    this.setupCleanup()
  }

  /**
   * Create a new cache instance
   */
  createCache(name, options = {}) {
    const cache = new CacheInstance(name, options)
    this.caches.set(name, cache)
    return cache
  }

  /**
   * Get existing cache instance
   */
  getCache(name) {
    return this.caches.get(name)
  }

  /**
   * Remove cache instance
   */
  removeCache(name) {
    const cache = this.caches.get(name)
    if (cache) {
      cache.clear()
      this.caches.delete(name)
      return true
    }
    return false
  }

  /**
   * Get all cache statistics
   */
  getStats() {
    const stats = {}
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats()
    }
    return stats
  }

  /**
   * Clear all expired entries across all caches
   */
  clearExpired() {
    for (const cache of this.caches.values()) {
      cache.clearExpired()
    }
  }

  /**
   * Clear all caches
   */
  clearAll() {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }

  /**
   * Setup automatic cleanup
   */
  setupCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.clearExpired()
    }, 60000) // Clean up every minute
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Destroy service
   */
  destroy() {
    this.stopCleanup()
    this.clearAll()
    this.caches.clear()
  }

  /**
   * Create preset caches for common use cases
   */
  createPresetCaches() {
    // API response cache
    this.createCache('api', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 10 * 1024 * 1024, // 10MB
      strategy: 'lru'
    })

    // Component data cache
    this.createCache('component', {
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 20 * 1024 * 1024, // 20MB
      strategy: 'lru'
    })

    // User preferences cache
    this.createCache('preferences', {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 1 * 1024 * 1024, // 1MB
      strategy: 'fifo'
    })

    // Static assets cache
    this.createCache('assets', {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'lru'
    })
  }
}

/**
 * Individual Cache Instance
 */
class CacheInstance {
  constructor(name, options = {}) {
    this.name = name
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 10 * 1024 * 1024, // 10MB default
      strategy: 'lru', // lru, fifo, lfu
      compression: false,
      ...options
    }

    this.cache = new Map()
    this.accessCount = new Map() // For LFU strategy
    this.accessOrder = [] // For LRU strategy
  }

  /**
   * Set cache entry
   */
  set(key, value, customOptions = {}) {
    const options = { ...this.options, ...customOptions }
    const entry = {
      value: options.compression ? this.compress(value) : value,
      timestamp: Date.now(),
      ttl: options.ttl,
      accessCount: 0,
      size: this.calculateSize(value)
    }

    // Check size limit
    if (this.getTotalSize() + entry.size > options.maxSize) {
      this.evictToSize(options.maxSize * 0.8)
    }

    // Update access tracking
    if (options.strategy === 'lru') {
      this.updateLRU(key)
    }

    this.cache.set(key, entry)
    this.accessCount.set(key, 0)
  }

  /**
   * Get cache entry
   */
  get(key) {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      return null
    }

    // Update access tracking
    entry.accessCount++
    this.accessCount.set(key, entry.accessCount)

    if (this.options.strategy === 'lru') {
      this.updateLRU(key)
    }

    return this.options.compression ? this.decompress(entry.value) : entry.value
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    const entry = this.cache.get(key)
    return entry && (Date.now() - entry.timestamp <= entry.ttl)
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.accessCount.delete(key)
      this.removeFromLRU(key)
    }
    return deleted
  }

  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear()
    this.accessCount.clear()
    this.accessOrder = []
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now()
    const expiredKeys = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))
    return expiredKeys.length
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalSize = this.getTotalSize()
    const entryCount = this.cache.size
    const expiredCount = this.getExpiredCount()

    return {
      name: this.name,
      entries: entryCount,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      expiredEntries: expiredCount,
      hitRate: this.calculateHitRate(),
      strategy: this.options.strategy,
      maxSize: this.options.maxSize,
      maxSizeMB: (this.options.maxSize / 1024 / 1024).toFixed(2),
      utilization: ((totalSize / this.options.maxSize) * 100).toFixed(1)
    }
  }

  /**
   * Get total cache size
   */
  getTotalSize() {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  /**
   * Get expired entries count
   */
  getExpiredCount() {
    let count = 0
    const now = Date.now()

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        count++
      }
    }

    return count
  }

  /**
   * Calculate hit rate (simplified)
   */
  calculateHitRate() {
    const totalAccess = Array.from(this.accessCount.values()).reduce((sum, count) => sum + count, 0)
    return totalAccess > 0 ? ((this.cache.size / totalAccess) * 100).toFixed(1) : '0.0'
  }

  /**
   * Evict entries to reach target size
   */
  evictToSize(targetSize) {
    const entries = Array.from(this.cache.entries())

    // Sort by eviction priority based on strategy
    entries.sort((a, b) => {
      const [keyA, entryA] = a
      const [keyB, entryB] = b

      switch (this.options.strategy) {
        case 'lru':
          return this.accessOrder.indexOf(keyA) - this.accessOrder.indexOf(keyB)
        case 'lfu':
          return entryA.accessCount - entryB.accessCount
        case 'fifo':
        default:
          return entryA.timestamp - entryB.timestamp
      }
    })

    let currentSize = this.getTotalSize()

    for (const [key] of entries) {
      if (currentSize <= targetSize) break

      const entry = this.cache.get(key)
      if (entry) {
        currentSize -= entry.size
        this.delete(key)
      }
    }
  }

  /**
   * Update LRU access order
   */
  updateLRU(key) {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  /**
   * Remove from LRU order
   */
  removeFromLRU(key) {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  /**
   * Calculate object size
   */
  calculateSize(obj) {
    try {
      return new Blob([JSON.stringify(obj)]).size
    } catch (error) {
      // Fallback for complex objects
      return JSON.stringify(obj).length * 2
    }
  }

  /**
   * Compress data (placeholder - would implement actual compression)
   */
  compress(data) {
    // TODO: Implement actual compression (e.g., LZ4, GZip)
    return data
  }

  /**
   * Decompress data (placeholder)
   */
  decompress(data) {
    // TODO: Implement actual decompression
    return data
  }

  /**
   * Export cache data
   */
  export() {
    const data = {}
    for (const [key, entry] of this.cache.entries()) {
      data[key] = {
        value: entry.value,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount
      }
    }
    return data
  }

  /**
   * Import cache data
   */
  import(data) {
    for (const [key, entry] of Object.entries(data)) {
      if (entry.value && entry.timestamp && entry.ttl) {
        this.cache.set(key, entry)
        this.accessCount.set(key, entry.accessCount || 0)
      }
    }
  }
}

// Export singleton instance
export default new CacheService()
