<template>
  <div class="wechat-config">
    <div class="config-header">
      <h3>{{ $t('settings.wechat.title') || 'WeChat Official Account' }}</h3>
      <div class="status-indicator" :class="{ active: isConfigured }">
        <span class="indicator-dot"></span>
        <span>{{ isConfigured ? ($t('settings.wechat.configured') || 'Configured') : ($t('settings.wechat.notConfigured') || 'Not Configured') }}</span>
      </div>
    </div>

    <div class="config-content">
      <!-- App ID Input -->
      <div class="form-group">
        <label for="wechat-appid">
          {{ $t('settings.wechat.appId') || 'App ID' }}
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            id="wechat-appid"
            v-model="config.appId"
            type="text"
            :placeholder="$t('settings.wechat.appIdPlaceholder') || 'Enter your WeChat App ID'"
            class="form-input"
            :class="{ 'input-error': validationErrors.appId }"
            @input="clearValidationError('appId')"
          />
          <div v-if="validationErrors.appId" class="error-message">
            {{ validationErrors.appId }}
          </div>
        </div>
      </div>

      <!-- App Secret Input -->
      <div class="form-group">
        <label for="wechat-appsecret">
          {{ $t('settings.wechat.appSecret') || 'App Secret' }}
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <div class="password-input-wrapper">
            <input
              id="wechat-appsecret"
              v-model="config.appSecret"
              :type="showSecret ? 'text' : 'password'"
              :placeholder="$t('settings.wechat.appSecretPlaceholder') || 'Enter your WeChat App Secret'"
              class="form-input"
              :class="{ 'input-error': validationErrors.appSecret }"
              @input="clearValidationError('appSecret')"
            />
            <button
              type="button"
              class="toggle-password-btn"
              @click="showSecret = !showSecret"
              :title="showSecret ? ($t('settings.wechat.hideSecret') || 'Hide Secret') : ($t('settings.wechat.showSecret') || 'Show Secret')"
            >
              <span v-if="showSecret">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>
          <div v-if="validationErrors.appSecret" class="error-message">
            {{ validationErrors.appSecret }}
          </div>
        </div>
      </div>

      <!-- Default Path Input -->
      <div class="form-group">
        <label for="wechat-default-path">
          {{ $t('settings.wechat.defaultPath') || 'Default Upload Path' }}
        </label>
        <div class="input-wrapper">
          <input
            id="wechat-default-path"
            v-model="config.defaultPath"
            type="text"
            :placeholder="$t('settings.wechat.defaultPathPlaceholder') || '/marktext'"
            class="form-input"
          />
          <div class="help-text">
            {{ $t('settings.wechat.pathHelp') || 'Path prefix for uploaded images' }}
          </div>
        </div>
      </div>

      <!-- Enable Toggle -->
      <div class="form-group">
        <div class="checkbox-wrapper">
          <input
            id="wechat-enabled"
            v-model="config.enabled"
            type="checkbox"
            class="form-checkbox"
          />
          <label for="wechat-enabled" class="checkbox-label">
            {{ $t('settings.wechat.enableUpload') || 'Enable WeChat image upload' }}
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          @click="testConnection"
          :disabled="!canTestConnection || isTesting"
          class="btn btn-secondary"
        >
          <span v-if="isTesting" class="loading-spinner"></span>
          {{ isTesting ? ($t('settings.wechat.testing') || 'Testing...') : ($t('settings.wechat.testConnection') || 'Test Connection') }}
        </button>

        <button
          @click="saveConfig"
          :disabled="!canSave || isSaving"
          class="btn btn-primary"
        >
          <span v-if="isSaving" class="loading-spinner"></span>
          {{ isSaving ? ($t('settings.wechat.saving') || 'Saving...') : ($t('settings.wechat.saveConfig') || 'Save Configuration') }}
        </button>
      </div>

      <!-- Status Messages -->
      <div v-if="testResult" class="status-message" :class="{ success: testResult.success, error: !testResult.success }">
        <span class="status-icon">{{ testResult.success ? '✅' : '❌' }}</span>
        <span>{{ testResult.message }}</span>
        <div v-if="testResult.timestamp" class="timestamp">
          {{ $t('settings.wechat.lastTested') || 'Last tested' }}: {{ formatTimestamp(testResult.timestamp) }}
        </div>
      </div>

      <div v-if="saveResult" class="status-message" :class="{ success: saveResult.success, error: !saveResult.success }">
        <span class="status-icon">{{ saveResult.success ? '✅' : '❌' }}</span>
        <span>{{ saveResult.message }}</span>
      </div>

      <!-- Service Status -->
      <div class="service-status" v-if="serviceStatus">
        <h4>{{ $t('settings.wechat.serviceStatus') || 'Service Status' }}</h4>
        <div class="status-item">
          <span class="status-label">{{ $t('settings.wechat.tokenStatus') || 'Access Token' }}:</span>
          <span class="status-value" :class="{ valid: serviceStatus.hasValidToken, invalid: !serviceStatus.hasValidToken }">
            {{ serviceStatus.hasValidToken ? ($t('settings.wechat.valid') || 'Valid') : ($t('settings.wechat.invalid') || 'Invalid') }}
          </span>
        </div>
        <div class="status-item" v-if="serviceStatus.tokenExpiry">
          <span class="status-label">{{ $t('settings.wechat.expires') || 'Expires' }}:</span>
          <span class="status-value">{{ formatTimestamp(serviceStatus.tokenExpiry) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WeChatService from '@/services/weChatService'

// Props
const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({
      appId: '',
      appSecret: '',
      defaultPath: '/marktext',
      enabled: false
    })
  }
})

// Emits
const emit = defineEmits(['config-saved', 'config-changed'])

// Reactive data
const config = ref({ ...props.initialConfig })
const showSecret = ref(false)
const isTesting = ref(false)
const isSaving = ref(false)
const testResult = ref(null)
const saveResult = ref(null)
const serviceStatus = ref(null)
const validationErrors = ref({})

// Computed
const canTestConnection = computed(() => {
  return config.value.appId && config.value.appSecret && !isTesting.value
})

const canSave = computed(() => {
  return config.value.appId && config.value.appSecret && !isSaving.value
})

// Methods
const clearValidationError = (field) => {
  if (validationErrors.value[field]) {
    validationErrors.value[field] = null
  }
}

const validateForm = () => {
  const errors = {}
  const validation = WeChatService.validateConfig(config.value)

  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('App ID')) {
        errors.appId = error
      } else if (error.includes('App Secret')) {
        errors.appSecret = error
      }
    })
  }

  validationErrors.value = errors
  return validation.isValid
}

const testConnection = async () => {
  if (!canTestConnection.value) return

  isTesting.value = true
  testResult.value = null

  try {
    // Initialize service with current config
    WeChatService.initialize(config.value)

    const success = await WeChatService.testConnection()

    testResult.value = {
      success,
      message: success
        ? 'Connection successful! WeChat API is working correctly.'
        : 'Connection failed. Please check your App ID and App Secret.',
      timestamp: new Date()
    }

    // Update service status
    updateServiceStatus()

  } catch (error) {
    testResult.value = {
      success: false,
      message: `Connection error: ${error.message}`,
      timestamp: new Date()
    }
  } finally {
    isTesting.value = false
  }
}

const saveConfig = async () => {
  if (!validateForm()) return

  isSaving.value = true
  saveResult.value = null

  try {
    // Initialize service with new config
    WeChatService.initialize(config.value)

    // Emit save event with config
    emit('config-saved', { ...config.value })

    saveResult.value = {
      success: true,
      message: 'Configuration saved successfully!'
    }

    // Update service status
    updateServiceStatus()

  } catch (error) {
    saveResult.value = {
      success: false,
      message: `Save failed: ${error.message}`
    }
  } finally {
    isSaving.value = false
  }
}

const updateServiceStatus = () => {
  serviceStatus.value = WeChatService.getStatus()
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

// Watch for config changes
watch(config, () => {
  emit('config-changed', { ...config.value })
}, { deep: true })

// Initialize
onMounted(() => {
  updateServiceStatus()
})
</script>

<style scoped>
.wechat-config {
  max-width: 600px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--borderColor);
}

.config-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--textColor);
}

.status-indicator.active {
  color: var(--successColor);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--textColor);
}

.status-indicator.active .indicator-dot {
  background-color: var(--successColor);
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--textColor);
}

.required {
  color: var(--errorColor);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--bgColor);
  color: var(--textColor);
}

.form-input:focus {
  outline: none;
  border-color: var(--themeColor);
  box-shadow: 0 0 0 2px rgba(var(--themeColor-rgb), 0.2);
}

.input-error {
  border-color: var(--errorColor);
}

.password-input-wrapper {
  position: relative;
}

.toggle-password-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 2px;
}

.toggle-password-btn:hover {
  background-color: var(--hoverBgColor);
}

.error-message {
  color: var(--errorColor);
  font-size: 12px;
  margin-top: 4px;
}

.help-text {
  color: var(--textSecondaryColor);
  font-size: 12px;
  margin-top: 4px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--themeColor);
}

.checkbox-label {
  font-weight: normal;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--themeColor);
  color: white;
  border-color: var(--themeColor);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--themeColorHover);
  border-color: var(--themeColorHover);
}

.btn-secondary {
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColor);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--hoverBgColor);
}

.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-message {
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.status-message.success {
  background-color: rgba(var(--successColor-rgb), 0.1);
  border: 1px solid var(--successColor);
  color: var(--successColor);
}

.status-message.error {
  background-color: rgba(var(--errorColor-rgb), 0.1);
  border: 1px solid var(--errorColor);
  color: var(--errorColor);
}

.status-icon {
  flex-shrink: 0;
  font-size: 16px;
}

.timestamp {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
}

.service-status {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--bgColor);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
}

.service-status h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.status-label {
  color: var(--textSecondaryColor);
}

.status-value.valid {
  color: var(--successColor);
  font-weight: 500;
}

.status-value.invalid {
  color: var(--errorColor);
  font-weight: 500;
}
</style>
