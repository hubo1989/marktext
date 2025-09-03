// File icons fallback implementation
// Since @marktext/file-icons was removed, this provides basic functionality

const fileIcons = {
  // Basic file extension mappings
  extensions: {
    js: 'icon-javascript',
    ts: 'icon-typescript',
    vue: 'icon-vue',
    html: 'icon-html',
    css: 'icon-css',
    scss: 'icon-sass',
    less: 'icon-less',
    json: 'icon-json',
    md: 'icon-markdown',
    txt: 'icon-text',
    pdf: 'icon-pdf',
    jpg: 'icon-image',
    jpeg: 'icon-image',
    png: 'icon-image',
    gif: 'icon-image',
    svg: 'icon-image'
  },

  // Language mappings
  languages: {
    javascript: 'icon-javascript',
    typescript: 'icon-typescript',
    vue: 'icon-vue',
    html: 'icon-html',
    css: 'icon-css',
    scss: 'icon-sass',
    less: 'icon-less',
    json: 'icon-json',
    markdown: 'icon-markdown'
  },

  // Match by filename
  matchName: function (filename) {
    if (!filename) return null

    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext && this.extensions[ext]) {
      return {
        getClass: () => this.extensions[ext]
      }
    }

    return null
  },

  // Match by language
  matchLanguage: function (lang) {
    if (!lang) return null

    const language = lang.toLowerCase()
    if (this.languages[language]) {
      return {
        getClass: () => this.languages[language]
      }
    }

    return null
  },

  // Custom methods
  getClassByName: function (name) {
    const icon = this.matchName(name)
    return icon ? icon.getClass(0, false) : null
  },

  getClassByLanguage: function (lang) {
    const icon = this.matchLanguage(lang)
    return icon ? icon.getClass(0, false) : null
  }
}

export default fileIcons
