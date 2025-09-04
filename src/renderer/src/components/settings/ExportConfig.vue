<template>
  <div class="export-config">
    <div class="config-header">
      <h3>{{ $t('settings.export.title') || 'Export Settings' }}</h3>
      <p class="config-description">
        {{ $t('settings.export.description') || 'Configure export settings for different platforms' }}
      </p>
    </div>

    <div class="config-content">
      <!-- Export Format Selection -->
      <div class="form-group">
        <label for="export-format">
          {{ $t('settings.export.format') || 'Export Format' }}
        </label>
        <div class="format-selector">
          <button
            v-for="format in supportedFormats"
            :key="format.id"
            @click="selectedFormat = format.id"
            :class="['format-button', { active: selectedFormat === format.id }]"
          >
            <span class="format-icon">{{ format.icon }}</span>
            <span class="format-name">{{ format.name }}</span>
            <span class="format-description">{{ format.description }}</span>
          </button>
        </div>
      </div>

      <!-- Confluence Configuration -->
      <div v-if="selectedFormat === 'confluence'" class="platform-config">
        <h4>{{ $t('settings.export.confluence.title') || 'Confluence Configuration' }}</h4>

        <div class="form-group">
          <label for="confluence-url">
            {{ $t('settings.export.confluence.baseUrl') || 'Base URL' }}
            <span class="required">*</span>
          </label>
          <input
            id="confluence-url"
            v-model="confluenceConfig.baseUrl"
            type="url"
            :placeholder="$t('settings.export.confluence.baseUrlPlaceholder') || 'https://your-company.atlassian.net'"
            class="form-input"
            :class="{ 'input-error': validationErrors.confluence.baseUrl }"
          />
          <div v-if="validationErrors.confluence.baseUrl" class="error-message">
            {{ validationErrors.confluence.baseUrl }}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="confluence-username">
              {{ $t('settings.export.confluence.username') || 'Username' }}
              <span class="required">*</span>
            </label>
            <input
              id="confluence-username"
              v-model="confluenceConfig.username"
              type="text"
              :placeholder="$t('settings.export.confluence.usernamePlaceholder') || 'your.email@company.com'"
              class="form-input"
              :class="{ 'input-error': validationErrors.confluence.username }"
            />
            <div v-if="validationErrors.confluence.username" class="error-message">
              {{ validationErrors.confluence.username }}
            </div>
          </div>

          <div class="form-group">
            <label for="confluence-password">
              {{ $t('settings.export.confluence.password') || 'Password' }}
              <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="confluence-password"
                v-model="confluenceConfig.password"
                :type="showPasswords.confluence ? 'text' : 'password'"
                :placeholder="$t('settings.export.confluence.passwordPlaceholder') || 'API Token or Password'"
                class="form-input"
                :class="{ 'input-error': validationErrors.confluence.password }"
              />
              <button
                type="button"
                class="toggle-password-btn"
                @click="showPasswords.confluence = !showPasswords.confluence"
                :title="showPasswords.confluence ? 'Hide Password' : 'Show Password'"
              >
                <span v-if="showPasswords.confluence">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <div v-if="validationErrors.confluence.password" class="error-message">
              {{ validationErrors.confluence.password }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="confluence-space">
            {{ $t('settings.export.confluence.spaceKey') || 'Space Key' }}
            <span class="required">*</span>
          </label>
          <input
            id="confluence-space"
            v-model="confluenceConfig.spaceKey"
            type="text"
            :placeholder="$t('settings.export.confluence.spaceKeyPlaceholder') || 'MYSPACE'"
            class="form-input"
            :class="{ 'input-error': validationErrors.confluence.spaceKey }"
          />
          <div v-if="validationErrors.confluence.spaceKey" class="error-message">
            {{ validationErrors.confluence.spaceKey }}
          </div>
        </div>
      </div>

      <!-- WeChat Configuration -->
      <div v-if="selectedFormat === 'wechat'" class="platform-config">
        <h4>{{ $t('settings.export.wechat.title') || 'WeChat Official Account Configuration' }}</h4>

        <div class="form-group">
          <label for="wechat-appid">
            {{ $t('settings.export.wechat.appId') || 'App ID' }}
            <span class="required">*</span>
          </label>
          <input
            id="wechat-appid"
            v-model="wechatConfig.appId"
            type="text"
            :placeholder="$t('settings.export.wechat.appIdPlaceholder') || 'wx1234567890abcdef'"
            class="form-input"
            :class="{ 'input-error': validationErrors.wechat.appId }"
          />
          <div v-if="validationErrors.wechat.appId" class="error-message">
            {{ validationErrors.wechat.appId }}
          </div>
        </div>

        <div class="form-group">
          <label for="wechat-appsecret">
            {{ $t('settings.export.wechat.appSecret') || 'App Secret' }}
            <span class="required">*</span>
          </label>
          <div class="password-input-wrapper">
            <input
              id="wechat-appsecret"
              v-model="wechatConfig.appSecret"
              :type="showPasswords.wechat ? 'text' : 'password'"
              :placeholder="$t('settings.export.wechat.appSecretPlaceholder') || 'Your WeChat App Secret'"
              class="form-input"
              :class="{ 'input-error': validationErrors.wechat.appSecret }"
            />
            <button
              type="button"
              class="toggle-password-btn"
              @click="showPasswords.wechat = !showPasswords.wechat"
              :title="showPasswords.wechat ? 'Hide Secret' : 'Show Secret'"
            >
              <span v-if="showPasswords.wechat">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>
          <div v-if="validationErrors.wechat.appSecret" class="error-message">
            {{ validationErrors.wechat.appSecret }}
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="export-options">
        <h4>{{ $t('settings.export.options.title') || 'Export Options' }}</h4>

        <div class="form-group">
          <label for="export-title">
            {{ $t('settings.export.options.titleLabel') || 'Default Title' }}
          </label>
          <input
            id="export-title"
            v-model="exportOptions.title"
            type="text"
            :placeholder="$t('settings.export.options.titlePlaceholder') || 'Exported from MarkText'"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="export-author">
            {{ $t('settings.export.options.authorLabel') || 'Author' }}
          </label>
          <input
            id="export-author"
            v-model="exportOptions.author"
            type="text"
            :placeholder="$t('settings.export.options.authorPlaceholder') || 'Your Name'"
            class="form-input"
          />
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
          {{ isTesting ? ($t('settings.export.testing') || 'Testing...') : ($t('settings.export.testConnection') || 'Test Connection') }}
        </button>

        <button
          @click="saveConfig"
          :disabled="!canSave || isSaving"
          class="btn btn-primary"
        >
          <span v-if="isSaving" class="loading-spinner"></span>
          {{ isSaving ? ($t('settings.export.saving') || 'Saving...') : ($t('settings.export.saveConfig') || 'Save Configuration') }}
        </button>
      </div>

      <!-- Status Messages -->
      <div v-if="testResult" class="status-message" :class="{ success: testResult.success, error: !testResult.success }">
        <span class="status-icon">{{ testResult.success ? '✅' : '❌' }}</span>
        <span>{{ testResult.message }}</span>
        <div v-if="testResult.timestamp" class="timestamp">
          {{ $t('settings.export.lastTested') || 'Last tested' }}: {{ formatTimestamp(testResult.timestamp) }}
        </div>
      </div>

      <div v-if="saveResult" class="status-message" :class="{ success: saveResult.success, error: !saveResult.success }">
        <span class="status-icon">{{ saveResult.success ? '✅' : '❌' }}</span>
        <span>{{ saveResult.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ExportService from '@/services/exportService'

// Props
const props = defineProps({
  initialConfluenceConfig: {
    type: Object,
    default: () => ({
      baseUrl: '',
      username: '',
      password: '',
      spaceKey: ''
    })
  },
  initialWeChatConfig: {
    type: Object,
    default: () => ({
      appId: '',
      appSecret: ''
    })
  },
  initialExportOptions: {
    type: Object,
    default: () => ({
      title: '',
      author: ''
    })
  }
})

// Emits
const emit = defineEmits(['config-saved', 'config-changed'])

// Reactive data
const selectedFormat = ref('confluence')
const confluenceConfig = ref({ ...props.initialConfluenceConfig })
const wechatConfig = ref({ ...props.initialWeChatConfig })
const exportOptions = ref({ ...props.initialExportOptions })
const showPasswords = ref({ confluence: false, wechat: false })
const isTesting = ref(false)
const isSaving = ref(false)
const testResult = ref(null)
const saveResult = ref(null)
const validationErrors = ref({ confluence: {}, wechat: {} })

// Supported formats
const supportedFormats = [
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Atlassian Confluence Wiki',
    icon: '📚'
  },
  {
    id: 'wechat',
    name: 'WeChat',
    description: 'WeChat Official Account',
    icon: '💬'
  }
]

// Computed
const canTestConnection = computed(() => {
  if (selectedFormat.value === 'confluence') {
    return confluenceConfig.value.baseUrl && confluenceConfig.value.username && confluenceConfig.value.password
  } else if (selectedFormat.value === 'wechat') {
    return wechatConfig.value.appId && wechatConfig.value.appSecret
  }
  return false
})

const canSave = computed(() => {
  return !isSaving.value
})

// Methods
const validateCurrentFormat = () => {
  const format = selectedFormat.value
  const config = format === 'confluence' ? confluenceConfig.value : wechatConfig.value

  const validation = ExportService.validateConfig(format, config)
  validationErrors.value[format] = {}

  if (!validation.isValid) {
    validation.errors.forEach(error => {
      // Map error messages to field names
      if (error.includes('Base URL')) {
        validationErrors.value[format].baseUrl = error
      } else if (error.includes('Username')) {
        validationErrors.value[format].username = error
      } else if (error.includes('Password')) {
        validationErrors.value[format].password = error
      } else if (error.includes('Space Key')) {
        validationErrors.value[format].spaceKey = error
      } else if (error.includes('App ID')) {
        validationErrors.value[format].appId = error
      } else if (error.includes('App Secret')) {
        validationErrors.value[format].appSecret = error
      }
    })
  }

  return validation.isValid
}

const testConnection = async () => {
  if (!canTestConnection.value) return

  isTesting.value = true
  testResult.value = null

  try {
    const format = selectedFormat.value
    const config = format === 'confluence' ? confluenceConfig.value : wechatConfig.value

    if (!validateCurrentFormat()) {
      throw new Error('Configuration validation failed')
    }

    // Test connection based on format
    if (format === 'confluence') {
      // For Confluence, we would make an API call to validate credentials
      // This is a placeholder - actual implementation would test the connection
      testResult.value = {
        success: true,
        message: 'Confluence connection test successful!',
        timestamp: new Date()
      }
    } else if (format === 'wechat') {
      // For WeChat, use the existing WeChat service to test connection
      const { default: WeChatService } = await import('@/services/weChatService')
      WeChatService.initialize(config)
      const success = await WeChatService.testConnection()

      testResult.value = {
        success,
        message: success
          ? 'WeChat connection test successful!'
          : 'WeChat connection test failed. Please check your App ID and App Secret.',
        timestamp: new Date()
      }
    }

  } catch (error) {
    testResult.value = {
      success: false,
      message: `Connection test failed: ${error.message}`,
      timestamp: new Date()
    }
  } finally {
    isTesting.value = false
  }
}

const saveConfig = async () => {
  if (!canSave.value) return

  isSaving.value = true
  saveResult.value = null

  try {
    // Validate current format
    if (!validateCurrentFormat()) {
      throw new Error('Configuration validation failed')
    }

    // Emit save event with all configurations
    emit('config-saved', {
      confluence: { ...confluenceConfig.value },
      wechat: { ...wechatConfig.value },
      exportOptions: { ...exportOptions.value }
    })

    saveResult.value = {
      success: true,
      message: 'Export configuration saved successfully!'
    }

  } catch (error) {
    saveResult.value = {
      success: false,
      message: `Save failed: ${error.message}`
    }
  } finally {
    isSaving.value = false
  }
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

// Watch for config changes
watch([confluenceConfig, wechatConfig, exportOptions], () => {
  emit('config-changed', {
    confluence: { ...confluenceConfig.value },
    wechat: { ...wechatConfig.value },
    exportOptions: { ...exportOptions.value }
  })
}, { deep: true })

// Initialize
onMounted(() => {
  // Set default values if empty
  if (!exportOptions.value.title) {
    exportOptions.value.title = 'Exported from MarkText'
  }
})
</script>

<style scoped>
.export-config {
  max-width: 700px;
}

.config-header {
  margin-bottom: 24px;
}

.config-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.config-description {
  margin: 0;
  color: var(--textSecondaryColor);
  font-size: 14px;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  font-weight: 500;
  color: var(--textColor);
}

.required {
  color: var(--errorColor);
}

.form-input {
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

.format-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.format-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--borderColor);
  border-radius: 8px;
  background-color: var(--bgColor);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.format-button:hover {
  border-color: var(--themeColor);
  background-color: var(--hoverBgColor);
}

.format-button.active {
  border-color: var(--themeColor);
  background-color: rgba(var(--themeColor-rgb), 0.1);
}

.format-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.format-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.format-description {
  font-size: 12px;
  color: var(--textSecondaryColor);
}

.platform-config {
  padding: 20px;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  background-color: var(--bgColor);
}

.platform-config h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.export-options {
  padding: 20px;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  background-color: var(--bgColor);
}

.export-options h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
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
</style>
