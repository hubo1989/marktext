/**
 * WeChat Official Account Service
 * Handles WeChat API integration for image upload and media management
 */

import axios from 'axios'

class WeChatService {
  constructor() {
    this.appId = null
    this.appSecret = null
    this.accessToken = null
    this.tokenExpiry = null
    this.baseURL = 'https://api.weixin.qq.com/cgi-bin'
  }

  /**
   * Initialize WeChat service with configuration
   * @param {Object} config - WeChat configuration
   * @param {string} config.appId - WeChat App ID
   * @param {string} config.appSecret - WeChat App Secret
   */
  initialize(config) {
    this.appId = config.appId
    this.appSecret = config.appSecret
    console.log('🔧 [WeChatService] Initialized with App ID:', this.appId ? '***' + this.appId.slice(-4) : 'Not set')
  }

  /**
   * Test connection to WeChat API
   * @returns {Promise<boolean>} - Connection test result
   */
  async testConnection() {
    try {
      console.log('🔍 [WeChatService] Testing connection...')
      const token = await this.getValidAccessToken()

      if (!token) {
        console.error('❌ [WeChatService] Failed to obtain access token')
        return false
      }

      // Test token validity with a simple API call
      const response = await axios.get(`${this.baseURL}/getcallbackip`, {
        params: { access_token: token },
        timeout: 10000
      })

      if (response.data.errcode === 0) {
        console.log('✅ [WeChatService] Connection test successful')
        return true
      } else {
        console.error('❌ [WeChatService] Connection test failed:', response.data.errmsg)
        return false
      }
    } catch (error) {
      console.error('❌ [WeChatService] Connection test error:', error.message)
      return false
    }
  }

  /**
   * Get valid access token, refresh if expired
   * @returns {Promise<string|null>} - Valid access token or null
   */
  async getValidAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('🔄 [WeChatService] Using existing valid access token')
        return this.accessToken
      }

      // Token expired or doesn't exist, get new one
      console.log('🔄 [WeChatService] Requesting new access token...')
      const response = await axios.get(`${this.baseURL}/token`, {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret
        },
        timeout: 10000
      })

      if (response.data.errcode === 0) {
        this.accessToken = response.data.access_token
        // Token expires in 7200 seconds (2 hours), set expiry 10 minutes early
        this.tokenExpiry = Date.now() + (response.data.expires_in - 600) * 1000
        console.log('✅ [WeChatService] New access token obtained, expires at:', new Date(this.tokenExpiry))
        return this.accessToken
      } else {
        console.error('❌ [WeChatService] Failed to get access token:', response.data.errmsg)
        return null
      }
    } catch (error) {
      console.error('❌ [WeChatService] Error getting access token:', error.message)
      return null
    }
  }

  /**
   * Upload image to WeChat media library
   * @param {Buffer|Blob} imageBuffer - Image data
   * @param {string} filename - Original filename
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Upload result
   */
  async uploadImage(imageBuffer, filename, onProgress = null) {
    try {
      console.log('📤 [WeChatService] Starting image upload:', filename)

      const token = await this.getValidAccessToken()
      if (!token) {
        throw new Error('Failed to obtain valid access token')
      }

      // Create FormData for multipart upload
      const formData = new FormData()

      // Convert buffer to blob if needed
      let blob
      if (imageBuffer instanceof Buffer) {
        blob = new Blob([imageBuffer])
      } else if (imageBuffer instanceof Blob) {
        blob = imageBuffer
      } else {
        throw new Error('Unsupported image buffer type')
      }

      formData.append('media', blob, filename)

      // Upload to WeChat API
      const response = await axios.post(`${this.baseURL}/media/upload`, formData, {
        params: {
          access_token: token,
          type: 'image'
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 second timeout
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        }
      })

      if (response.data.errcode === 0) {
        console.log('✅ [WeChatService] Image uploaded successfully:', response.data.media_id)
        return {
          success: true,
          mediaId: response.data.media_id,
          url: response.data.url,
          type: response.data.type,
          createdAt: response.data.created_at
        }
      } else {
        console.error('❌ [WeChatService] Upload failed:', response.data.errmsg)
        return {
          success: false,
          error: response.data.errmsg,
          errcode: response.data.errcode
        }
      }
    } catch (error) {
      console.error('❌ [WeChatService] Upload error:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get media URL from media ID
   * @param {string} mediaId - WeChat media ID
   * @returns {Promise<string|null>} - Media URL or null
   */
  async getMediaUrl(mediaId) {
    try {
      console.log('🔗 [WeChatService] Getting media URL for:', mediaId)

      const token = await this.getValidAccessToken()
      if (!token) {
        throw new Error('Failed to obtain valid access token')
      }

      const response = await axios.get(`${this.baseURL}/media/get`, {
        params: {
          access_token: token,
          media_id: mediaId
        },
        timeout: 10000
      })

      if (response.status === 200) {
        // WeChat returns binary data, we need to extract the URL from headers or response
        console.log('✅ [WeChatService] Media URL retrieved')
        return `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`
      } else {
        console.error('❌ [WeChatService] Failed to get media URL')
        return null
      }
    } catch (error) {
      console.error('❌ [WeChatService] Error getting media URL:', error.message)
      return null
    }
  }

  /**
   * Validate WeChat configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig(config) {
    const errors = []

    if (!config.appId || config.appId.trim() === '') {
      errors.push('App ID is required')
    } else if (!/^wx[a-zA-Z0-9]{15,18}$/.test(config.appId)) {
      errors.push('Invalid App ID format')
    }

    if (!config.appSecret || config.appSecret.trim() === '') {
      errors.push('App Secret is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get service status
   * @returns {Object} - Service status information
   */
  getStatus() {
    return {
      configured: !!(this.appId && this.appSecret),
      hasValidToken: !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry),
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry) : null
    }
  }

  /**
   * Clear cached token (useful for testing or reconfiguration)
   */
  clearToken() {
    console.log('🧹 [WeChatService] Clearing cached token')
    this.accessToken = null
    this.tokenExpiry = null
  }
}

// Export singleton instance
const weChatService = new WeChatService()
export default weChatService
