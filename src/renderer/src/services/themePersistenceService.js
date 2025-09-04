/**
 * Theme Persistence Service
 * Handles saving and loading theme preferences
 */

class ThemePersistenceService {
  constructor() {
    this.storageKey = 'marktext-theme-preferences'
    this.defaults = {
      currentTheme: 'default',
      themeHistory: [],
      customThemes: {},
      preferences: {
        autoSave: true,
        transitionDuration: 300,
        reduceMotion: false,
        highContrast: false
      }
    }
  }

  /**
   * Load theme preferences from storage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const preferences = JSON.parse(stored)
        return { ...this.defaults, ...preferences }
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error)
    }
    return { ...this.defaults }
  }

  /**
   * Save theme preferences to storage
   */
  savePreferences(preferences) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(preferences))
      return true
    } catch (error) {
      console.error('Failed to save theme preferences:', error)
      return false
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    const preferences = this.loadPreferences()
    return preferences.currentTheme
  }

  /**
   * Set current theme
   */
  setCurrentTheme(themeId) {
    const preferences = this.loadPreferences()
    const oldTheme = preferences.currentTheme

    // Update current theme
    preferences.currentTheme = themeId

    // Add to history if different
    if (oldTheme && oldTheme !== themeId) {
      this.addToHistory(preferences, oldTheme)
    }

    // Update last used timestamp
    preferences.lastUsed = Date.now()

    return this.savePreferences(preferences)
  }

  /**
   * Add theme to usage history
   */
  addToHistory(preferences, themeId) {
    const history = preferences.themeHistory || []

    // Remove if already exists
    const existingIndex = history.findIndex(item => item.themeId === themeId)
    if (existingIndex > -1) {
      history.splice(existingIndex, 1)
    }

    // Add to beginning
    history.unshift({
      themeId,
      timestamp: Date.now()
    })

    // Keep only last 10 themes
    preferences.themeHistory = history.slice(0, 10)
  }

  /**
   * Get theme usage history
   */
  getThemeHistory() {
    const preferences = this.loadPreferences()
    return preferences.themeHistory || []
  }

  /**
   * Get recently used themes
   */
  getRecentlyUsedThemes(limit = 5) {
    const history = this.getThemeHistory()
    return history.slice(0, limit).map(item => item.themeId)
  }

  /**
   * Save custom theme
   */
  saveCustomTheme(themeId, themeConfig) {
    const preferences = this.loadPreferences()
    preferences.customThemes = preferences.customThemes || {}
    preferences.customThemes[themeId] = {
      ...themeConfig,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    }
    return this.savePreferences(preferences)
  }

  /**
   * Load custom themes
   */
  loadCustomThemes() {
    const preferences = this.loadPreferences()
    return preferences.customThemes || {}
  }

  /**
   * Delete custom theme
   */
  deleteCustomTheme(themeId) {
    const preferences = this.loadPreferences()
    if (preferences.customThemes && preferences.customThemes[themeId]) {
      delete preferences.customThemes[themeId]
      return this.savePreferences(preferences)
    }
    return false
  }

  /**
   * Update theme preferences
   */
  updatePreferences(newPreferences) {
    const preferences = this.loadPreferences()
    preferences.preferences = {
      ...preferences.preferences,
      ...newPreferences
    }
    return this.savePreferences(preferences)
  }

  /**
   * Get theme preferences
   */
  getPreferences() {
    const preferences = this.loadPreferences()
    return preferences.preferences
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Failed to reset theme preferences:', error)
      return false
    }
  }

  /**
   * Export preferences as JSON
   */
  exportPreferences() {
    const preferences = this.loadPreferences()
    return JSON.stringify(preferences, null, 2)
  }

  /**
   * Import preferences from JSON
   */
  importPreferences(jsonString) {
    try {
      const imported = JSON.parse(jsonString)

      // Validate structure
      if (!imported || typeof imported !== 'object') {
        throw new Error('Invalid preferences format')
      }

      // Merge with defaults to ensure all required fields exist
      const merged = { ...this.defaults, ...imported }

      return this.savePreferences(merged)
    } catch (error) {
      console.error('Failed to import theme preferences:', error)
      throw new Error('Invalid preferences file')
    }
  }

  /**
   * Get storage usage
   */
  getStorageUsage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const sizeInBytes = new Blob([stored]).size
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
   * Migrate old theme settings
   */
  migrateLegacySettings() {
    try {
      // Check for old theme setting
      const oldTheme = localStorage.getItem('marktext-theme')
      if (oldTheme && oldTheme !== 'default') {
        const preferences = this.loadPreferences()
        if (preferences.currentTheme === 'default') {
          preferences.currentTheme = oldTheme
          this.savePreferences(preferences)
          console.log('Migrated legacy theme setting:', oldTheme)
        }
        // Keep old key for backward compatibility
      }
    } catch (error) {
      console.warn('Failed to migrate legacy settings:', error)
    }
  }

  /**
   * Initialize service
   */
  initialize() {
    if (!this.isStorageAvailable()) {
      console.warn('Local storage not available, theme preferences will not persist')
      return false
    }

    // Migrate legacy settings
    this.migrateLegacySettings()

    // Ensure defaults exist
    const preferences = this.loadPreferences()
    const hasChanges = this.savePreferences(preferences)

    if (hasChanges) {
      console.log('Theme preferences initialized')
    }

    return true
  }
}

// Export singleton instance
export default new ThemePersistenceService()
