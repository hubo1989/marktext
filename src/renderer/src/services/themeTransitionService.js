/**
 * Theme Transition Service
 * Handles smooth theme transitions with animation coordination
 */

import themeService from './themeService.js'

class ThemeTransitionService {
  constructor() {
    this.isTransitioning = false
    this.transitionDuration = 300 // ms
    this.animationFrame = null
    this.transitionQueue = []
    this.eventListeners = new Map()
  }

  /**
   * Switch theme with smooth transition
   */
  async switchTheme(themeId, options = {}) {
    const {
      duration = this.transitionDuration,
      easing = 'ease-in-out',
      skipValidation = false
    } = options

    // Prevent concurrent transitions
    if (this.isTransitioning) {
      this.transitionQueue.push({ themeId, options })
      return
    }

    this.isTransitioning = true

    try {
      // Validate theme if required
      if (!skipValidation) {
        themeService.validateTheme(themeId)
      }

      // Prepare transition
      await this.prepareTransition()

      // Apply new theme
      await this.applyTheme(themeId, duration, easing)

      // Emit completion event
      this.emit('transitionComplete', { themeId, duration })

    } catch (error) {
      console.error('Theme transition failed:', error)
      this.emit('transitionError', { themeId, error })

      // Fallback to default theme
      if (themeId !== 'default') {
        await this.switchTheme('default', { skipValidation: true })
      }
    } finally {
      this.isTransitioning = false

      // Process queued transitions
      if (this.transitionQueue.length > 0) {
        const next = this.transitionQueue.shift()
        setTimeout(() => this.switchTheme(next.themeId, next.options), 50)
      }
    }
  }

  /**
   * Prepare DOM for transition
   */
  async prepareTransition() {
    return new Promise((resolve) => {
      // Add transition preparation class
      document.documentElement.classList.add('theme-transition-preparing')

      // Allow DOM to update
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('theme-transition-preparing')
        document.documentElement.classList.add('theme-transitioning')
        resolve()
      })
    })
  }

  /**
   * Apply theme with animation
   */
  async applyTheme(themeId, duration, easing) {
    return new Promise((resolve) => {
      // Set transition duration
      document.documentElement.style.setProperty('--theme-transition-duration', `${duration}ms`)

      // Apply CSS variables
      this.applyThemeVariables(themeId)

      // Wait for transition to complete
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
        resolve()
      }, duration)
    })
  }

  /**
   * Apply theme CSS variables to DOM
   */
  applyThemeVariables(themeId) {
    const theme = themeService.getTheme(themeId)

    // Apply all theme variables
    for (const [key, value] of Object.entries(theme.variables)) {
      document.documentElement.style.setProperty(`--${key}`, value)
    }

    // Update current theme
    themeService.currentTheme = themeId

    // Store theme preference
    this.persistThemePreference(themeId)
  }

  /**
   * Persist theme preference
   */
  persistThemePreference(themeId) {
    try {
      localStorage.setItem('marktext-theme', themeId)
    } catch (error) {
      console.warn('Failed to persist theme preference:', error)
    }
  }

  /**
   * Load saved theme preference
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('marktext-theme')
      if (savedTheme && themeService.themes[savedTheme]) {
        return savedTheme
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error)
    }
    return 'default'
  }

  /**
   * Preview theme without applying permanently
   */
  async previewTheme(themeId, duration = 1000) {
    const originalTheme = themeService.currentTheme

    try {
      await this.applyTheme(themeId, duration, 'ease-in-out')
      return true
    } catch (error) {
      // Revert to original theme
      await this.applyTheme(originalTheme, 200, 'ease-in-out')
      throw error
    }
  }

  /**
   * Cancel ongoing transition
   */
  cancelTransition() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    document.documentElement.classList.remove('theme-transitioning', 'theme-transition-preparing')
    this.isTransitioning = false
    this.transitionQueue = []
  }

  /**
   * Get transition status
   */
  getTransitionStatus() {
    return {
      isTransitioning: this.isTransitioning,
      queueLength: this.transitionQueue.length,
      currentTheme: themeService.currentTheme
    }
  }

  /**
   * Event system for transition lifecycle
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event callback error:', error)
        }
      })
    }
  }

  /**
   * Get supported transition types
   */
  getSupportedTransitions() {
    return [
      'fade',
      'slide',
      'scale',
      'color-shift',
      'none'
    ]
  }

  /**
   * Check if transitions are supported
   */
  areTransitionsSupported() {
    return window.getComputedStyle(document.documentElement)
                 .transition !== undefined
  }

  /**
   * Get optimal transition settings for device
   */
  getOptimalTransitionSettings() {
    // Reduce animation on low-performance devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 ||
                          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isLowEndDevice) {
      return {
        duration: 150,
        easing: 'ease',
        reducedMotion: true
      }
    }

    return {
      duration: 300,
      easing: 'ease-in-out',
      reducedMotion: false
    }
  }

  /**
   * Respect user's motion preferences
   */
  respectsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Initialize the theme transition service
   */
  initialize() {
    console.log('🎨 [ThemeTransitionService] Initializing theme transition service')

    // Set up reduced motion listener
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', (event) => {
      console.log('🎨 [ThemeTransitionService] Reduced motion preference changed:', event.matches)
      if (event.matches) {
        this.transitionDuration = 0 // Disable transitions
      } else {
        this.transitionDuration = this.getOptimalTransitionSettings().duration
      }
    })

    // Load saved theme preference
    const savedTheme = this.loadSavedTheme()
    if (savedTheme && savedTheme !== themeService.currentTheme) {
      console.log('🎨 [ThemeTransitionService] Loading saved theme:', savedTheme)
      // Apply saved theme without animation on startup
      this.applyThemeVariables(savedTheme)
    }

    console.log('✅ [ThemeTransitionService] Theme transition service initialized successfully')
  }
}

// Export singleton instance
export default new ThemeTransitionService()
