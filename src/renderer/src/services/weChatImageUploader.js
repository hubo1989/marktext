/**
 * WeChat Image Uploader
 * Integrates WeChat Official Account API for image upload functionality
 */

import WeChatService from './weChatService'

class WeChatImageUploader {
  constructor(config = {}) {
    this.config = {
      enabled: false,
      defaultPath: '/marktext',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
      ...config
    }

    this.service = WeChatService
  }

  /**
   * Initialize uploader with configuration
   * @param {Object} config - Configuration object
   */
  initialize(config) {
    this.config = { ...this.config, ...config }
    if (this.config.appId && this.config.appSecret) {
      this.service.initialize({
        appId: this.config.appId,
        appSecret: this.config.appSecret
      })
    }
  }

  /**
   * Check if uploader is enabled and configured
   * @returns {boolean} - Whether uploader is ready
   */
  isEnabled() {
    return this.config.enabled && this.config.appId && this.config.appSecret
  }

  /**
   * Validate image file before upload
   * @param {File|Blob} file - Image file to validate
   * @returns {Object} - Validation result
   */
  validateImage(file) {
    const errors = []

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size exceeds ${this.config.maxFileSize / (1024 * 1024)}MB limit`)
    }

    // Check file format
    const fileName = file.name || 'image'
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    if (!fileExtension || !this.config.supportedFormats.includes(fileExtension)) {
      errors.push(`Unsupported file format. Supported: ${this.config.supportedFormats.join(', ')}`)
    }

    // Check if file is actually an image
    if (!file.type || !file.type.startsWith('image/')) {
      errors.push('File is not a valid image')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Upload image to WeChat
   * @param {File|Blob} file - Image file to upload
   * @param {Object} options - Upload options
   * @param {Function} options.onProgress - Progress callback
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @returns {Promise<Object>} - Upload result
   */
  async uploadImage(file, options = {}) {
    const { onProgress, onSuccess, onError } = options

    try {
      // Check if uploader is enabled
      if (!this.isEnabled()) {
        const error = new Error('WeChat uploader is not configured or disabled')
        if (onError) onError(error)
        throw error
      }

      // Validate image
      const validation = this.validateImage(file)
      if (!validation.isValid) {
        const error = new Error(validation.errors.join('; '))
        if (onError) onError(error)
        throw error
      }

      console.log('📤 [WeChatImageUploader] Starting upload for:', file.name || 'image')

      // Convert file to buffer for WeChat API
      const buffer = await this.fileToBuffer(file)

      // Upload to WeChat
      const result = await this.service.uploadImage(buffer, file.name || 'image.jpg', (progress) => {
        if (onProgress) {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress
          })
        }
      })

      if (result.success) {
        // Get the media URL
        const mediaUrl = await this.service.getMediaUrl(result.mediaId)

        const uploadResult = {
          success: true,
          url: mediaUrl,
          mediaId: result.mediaId,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          platform: 'wechat'
        }

        if (onSuccess) onSuccess(uploadResult)
        return uploadResult

      } else {
        const error = new Error(result.error || 'Upload failed')
        if (onError) onError(error)
        throw error
      }

    } catch (error) {
      console.error('❌ [WeChatImageUploader] Upload failed:', error.message)

      const uploadResult = {
        success: false,
        error: error.message,
        originalName: file.name,
        size: file.size,
        platform: 'wechat'
      }

      if (onError) onError(error)
      return uploadResult
    }
  }

  /**
   * Convert file to buffer for WeChat API
   * @param {File|Blob} file - File to convert
   * @returns {Promise<Buffer>} - File buffer
   */
  async fileToBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const buffer = Buffer.from(reader.result)
          resolve(buffer)
        } catch (error) {
          reject(new Error('Failed to convert file to buffer'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Test WeChat connection
   * @returns {Promise<boolean>} - Connection test result
   */
  async testConnection() {
    if (!this.isEnabled()) {
      return false
    }

    return await this.service.testConnection()
  }

  /**
   * Get uploader status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      configured: !!(this.config.appId && this.config.appSecret),
      serviceStatus: this.service.getStatus(),
      supportedFormats: this.config.supportedFormats,
      maxFileSize: this.config.maxFileSize
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.initialize(this.config)
  }

  /**
   * Get supported file formats
   * @returns {Array<string>} - Supported formats
   */
  getSupportedFormats() {
    return [...this.config.supportedFormats]
  }

  /**
   * Get maximum file size
   * @returns {number} - Max file size in bytes
   */
  getMaxFileSize() {
    return this.config.maxFileSize
  }

  /**
   * Generate markdown image syntax for uploaded image
   * @param {Object} uploadResult - Upload result from WeChat
   * @param {string} altText - Alt text for image
   * @returns {string} - Markdown image syntax
   */
  generateMarkdown(uploadResult, altText = '') {
    if (!uploadResult.success || !uploadResult.url) {
      return ''
    }

    const alt = altText || uploadResult.originalName || 'Image'
    return `![${alt}](${uploadResult.url})`
  }
}

// Export singleton instance
const weChatImageUploader = new WeChatImageUploader()
export default weChatImageUploader
