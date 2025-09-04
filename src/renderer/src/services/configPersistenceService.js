/**
 * Configuration Persistence Service
 * Handles saving and loading of all application configuration settings
 */

class ConfigPersistenceService {
  constructor() {
    this.storageKey = 'marktext-app-config'
    this.defaults = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      settings: {
        theme: 'default',
        dualScreenMode: 'disabled',
        dualScreenSplitRatio: 0.5,
        dualScreenSyncScroll: true,
        dualScreenSyncCursor: true,
        dualScreenKeyboardShortcuts: true,
        animationsEnabled: true,
        performanceMode: 'auto'
      }
    }
  }

  /**
   * Initialize service
   */
  initialize() {
    if (!this.isStorageAvailable()) {
      console.warn('Local storage not available, configuration persistence disabled')
      return false
    }

    // Migrate legacy settings if needed
    this.migrateLegacySettings()

    // Ensure defaults exist
    const config = this.loadConfig()
    this.saveConfig(config)

    console.log('Configuration persistence service initialized')
    return true
  }

  /**
   * Load configuration from storage
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const config = JSON.parse(stored)
        return { ...this.defaults, ...config }
      }
    } catch (error) {
      console.warn('Failed to load configuration:', error)
    }
    return { ...this.defaults }
  }

  /**
   * Save configuration to storage
   */
  saveConfig(config) {
    try {
      config.lastUpdated = Date.now()
      localStorage.setItem(this.storageKey, JSON.stringify(config))
      return true
    } catch (error) {
      console.error('Failed to save configuration:', error)
      return false
    }
  }

  /**
   * Get setting value
   */
  getSetting(key) {
    const config = this.loadConfig()
    return config.settings[key]
  }

  /**
   * Set setting value
   */
  setSetting(key, value) {
    const config = this.loadConfig()
    config.settings[key] = value
    return this.saveConfig(config)
  }

  /**
   * Get all settings
   */
  getAllSettings() {
    const config = this.loadConfig()
    return config.settings
  }

  /**
   * Set multiple settings
   */
  setMultipleSettings(settings) {
    const config = this.loadConfig()
    config.settings = { ...config.settings, ...settings }
    return this.saveConfig(config)
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    try {
      localStorage.removeItem(this.storageKey)
      return this.saveConfig({ ...this.defaults })
    } catch (error) {
      console.error('Failed to reset configuration:', error)
      return false
    }
  }

  /**
   * Export configuration
   */
  exportConfig() {
    const config = this.loadConfig()
    return JSON.stringify(config, null, 2)
  }

  /**
   * Import configuration
   */
  importConfig(jsonString) {
    try {
      const imported = JSON.parse(jsonString)

      // Validate structure
      if (!imported || typeof imported !== 'object' || !imported.settings) {
        throw new Error('Invalid configuration format')
      }

      // Merge with defaults to ensure all required fields exist
      const merged = { ...this.defaults, ...imported }
      merged.settings = { ...this.defaults.settings, ...imported.settings }

      return this.saveConfig(merged)
    } catch (error) {
      console.error('Failed to import configuration:', error)
      throw new Error('Invalid configuration file')
    }
  }

  /**
   * Migrate legacy settings
   */
  migrateLegacySettings() {
    try {
      // Migrate theme setting
      const oldTheme = localStorage.getItem('marktext-theme')
      if (oldTheme) {
        this.setSetting('theme', oldTheme)
        localStorage.removeItem('marktext-theme')
        console.log('Migrated legacy theme setting')
      }

      // Migrate dual screen settings
      const oldDualScreen = localStorage.getItem('marktext-dual-screen-mode')
      if (oldDualScreen) {
        this.setSetting('dualScreenMode', oldDualScreen)
        localStorage.removeItem('marktext-dual-screen-mode')
        console.log('Migrated legacy dual screen setting')
      }
    } catch (error) {
      console.warn('Failed to migrate legacy settings:', error)
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get storage usage
   */
  getStorageUsage() {
    try {
      const config = localStorage.getItem(this.storageKey)
      if (config) {
        const sizeInBytes = new Blob([config]).size
        return {
          sizeInBytes,
          sizeInKB: Math.round(sizeInBytes / 1024 * 100) / 100,
          sizeInMB: Math.round(sizeInBytes / 1024 / 1024 * 100) / 100
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage usage:', error)
    }
    return { sizeInBytes: 0, sizeInKB: 0, sizeInMB: 0 }
  }

  /**
   * Get configuration metadata
   */
  getMetadata() {
    const config = this.loadConfig()
    const usage = this.getStorageUsage()

    return {
      version: config.version,
      lastUpdated: new Date(config.lastUpdated).toISOString(),
      storage: usage,
      settingsCount: Object.keys(config.settings).length,
      isStorageAvailable: this.isStorageAvailable()
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const config = this.loadConfig()
    const errors = []

    // Check required fields
    if (!config.version) errors.push('Missing version')
    if (!config.settings) errors.push('Missing settings')
    if (!config.lastUpdated) errors.push('Missing lastUpdated')

    // Check setting types
    const expectedTypes = {
      theme: 'string',
      dualScreenMode: 'string',
      dualScreenSplitRatio: 'number',
      dualScreenSyncScroll: 'boolean',
      dualScreenSyncCursor: 'boolean',
      dualScreenKeyboardShortcuts: 'boolean',
      animationsEnabled: 'boolean',
      performanceMode: 'string'
    }

    for (const [key, expectedType] of Object.entries(expectedTypes)) {
      const value = config.settings[key]
      if (value !== undefined && typeof value !== expectedType) {
        errors.push(`Setting '${key}' should be ${expectedType}, got ${typeof value}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export default new ConfigPersistenceService()
