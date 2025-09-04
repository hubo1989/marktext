/**
 * Enhanced Theme Service for MarkText-Next
 * Provides theme management with smooth transitions and configuration
 */

class ThemeService {
  constructor() {
    this.currentTheme = 'default'
    this.themes = {}
    this.transitionDuration = 300 // ms
    this.isTransitioning = false
    this.loadThemeDefinitions()
  }

  /**
   * Load all available theme definitions
   */
  loadThemeDefinitions() {
    this.themes = {
      default: {
        name: 'Default',
        description: 'Classic MarkText theme',
        variables: {
          // Base colors
          themeColor: '#409EFF',
          editorBgColor: '#ffffff',
          editorColor: '#303133',
          iconColor: '#909399',

          // Component colors
          sideBarBgColor: '#f8f9fa',
          sideBarColor: '#303133',
          buttonBgColor: '#ffffff',
          buttonBorder: '1px solid #dcdfe6',

          // Status colors
          successColor: '#67c23a',
          warningColor: '#e6a23c',
          errorColor: '#f56c6c',
          infoColor: '#909399'
        },
        metadata: {
          isDark: false,
          supportsHighContrast: true,
          accessibility: 'AA'
        }
      },

      dark: {
        name: 'Dark',
        description: 'Modern dark theme for low-light environments',
        variables: {
          // Base colors
          themeColor: '#409EFF',
          editorBgColor: '#1e1e1e',
          editorColor: 'rgba(255, 255, 255, 0.9)',
          iconColor: 'rgba(255, 255, 255, 0.7)',

          // Component colors
          sideBarBgColor: '#252526',
          sideBarColor: 'rgba(255, 255, 255, 0.9)',
          buttonBgColor: '#2d2d30',
          buttonBorder: '1px solid #3e3e42',

          // Status colors
          successColor: '#4ade80',
          warningColor: '#fbbf24',
          errorColor: '#ef4444',
          infoColor: '#60a5fa'
        },
        metadata: {
          isDark: true,
          supportsHighContrast: true,
          accessibility: 'AA'
        }
      },

      graphite: {
        name: 'Graphite',
        description: 'Subtle graphite theme with warm undertones',
        variables: {
          // Base colors
          themeColor: '#8e7cc3',
          editorBgColor: '#f5f5f6',
          editorColor: '#2c2c2c',
          iconColor: '#6b6b6b',

          // Component colors
          sideBarBgColor: '#e8e8e8',
          sideBarColor: '#2c2c2c',
          buttonBgColor: '#ffffff',
          buttonBorder: '1px solid #d1d1d1',

          // Status colors
          successColor: '#52c41a',
          warningColor: '#faad14',
          errorColor: '#ff4d4f',
          infoColor: '#1890ff'
        },
        metadata: {
          isDark: false,
          supportsHighContrast: false,
          accessibility: 'AA'
        }
      },

      materialDark: {
        name: 'Material Dark',
        description: 'Google Material Design inspired dark theme',
        variables: {
          // Base colors
          themeColor: '#2196f3',
          editorBgColor: '#263238',
          editorColor: '#ffffff',
          iconColor: 'rgba(255, 255, 255, 0.7)',

          // Component colors
          sideBarBgColor: '#37474f',
          sideBarColor: '#ffffff',
          buttonBgColor: '#455a64',
          buttonBorder: '1px solid #546e7a',

          // Status colors
          successColor: '#4caf50',
          warningColor: '#ff9800',
          errorColor: '#f44336',
          infoColor: '#2196f3'
        },
        metadata: {
          isDark: true,
          supportsHighContrast: true,
          accessibility: 'AA'
        }
      },

      oneDark: {
        name: 'One Dark',
        description: 'Atom One Dark inspired theme',
        variables: {
          // Base colors
          themeColor: '#61afef',
          editorBgColor: '#282c34',
          editorColor: '#abb2bf',
          iconColor: '#5c6370',

          // Component colors
          sideBarBgColor: '#21252b',
          sideBarColor: '#abb2bf',
          buttonBgColor: '#3e4451',
          buttonBorder: '1px solid #181a1f',

          // Status colors
          successColor: '#98c379',
          warningColor: '#d19a66',
          errorColor: '#e06c75',
          infoColor: '#56b6c2'
        },
        metadata: {
          isDark: true,
          supportsHighContrast: true,
          accessibility: 'AA'
        }
      },

      ulysses: {
        name: 'Ulysses',
        description: 'Clean, distraction-free writing theme',
        variables: {
          // Base colors
          themeColor: '#6c5ce7',
          editorBgColor: '#fefefe',
          editorColor: '#2d3436',
          iconColor: '#636e72',

          // Component colors
          sideBarBgColor: '#f8f9fa',
          sideBarColor: '#2d3436',
          buttonBgColor: '#ffffff',
          buttonBorder: '1px solid #e1e8ed',

          // Status colors
          successColor: '#00b894',
          warningColor: '#fdcb6e',
          errorColor: '#e17055',
          infoColor: '#74b9ff'
        },
        metadata: {
          isDark: false,
          supportsHighContrast: false,
          accessibility: 'A'
        }
      }
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      ...this.themes[key]
    }))
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId) {
    return this.themes[themeId] || this.themes.default
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.themes[this.currentTheme] || this.themes.default
  }

  /**
   * Get theme variable value
   */
  getThemeVariable(variableName) {
    const theme = this.getCurrentTheme()
    return theme.variables[variableName]
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme() {
    const theme = this.getCurrentTheme()
    return theme.metadata.isDark
  }

  /**
   * Validate theme configuration
   */
  validateTheme(themeId) {
    const theme = this.themes[themeId]
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`)
    }

    const requiredVars = ['themeColor', 'editorBgColor', 'editorColor']
    for (const varName of requiredVars) {
      if (!theme.variables[varName]) {
        throw new Error(`Theme '${themeId}' missing required variable: ${varName}`)
      }
    }

    return true
  }

  /**
   * Export theme configuration as CSS variables
   */
  exportAsCSSVariables(themeId) {
    const theme = this.getTheme(themeId)
    const cssVars = []

    // Convert theme variables to CSS custom properties
    for (const [key, value] of Object.entries(theme.variables)) {
      cssVars.push(`  --${key}: ${value};`)
    }

    return `:root {\n${cssVars.join('\n')}\n}`
  }

  /**
   * Get theme metadata
   */
  getThemeMetadata(themeId) {
    const theme = this.getTheme(themeId)
    return theme.metadata
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category) {
    const themes = this.getAvailableThemes()

    switch (category) {
      case 'dark':
        return themes.filter(theme => theme.metadata && theme.metadata.isDark)
      case 'light':
        return themes.filter(theme => theme.metadata && !theme.metadata.isDark)
      case 'high-contrast':
        return themes.filter(theme => theme.metadata && theme.metadata.supportsHighContrast)
      default:
        return themes
    }
  }
}

// Export singleton instance
export default new ThemeService()
