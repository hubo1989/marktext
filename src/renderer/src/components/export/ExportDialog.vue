<template>
  <div class="export-dialog-overlay" @click="closeDialog">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ $t('export.title') || 'Export Document' }}</h3>
        <button @click="closeDialog" class="close-button">
          <span>✕</span>
        </button>
      </div>

      <div class="dialog-content">
        <!-- Export Preview -->
        <div class="preview-section">
          <h4>{{ $t('export.preview') || 'Preview' }}</h4>
          <div class="preview-content">
            <div class="preview-title">
              <label>{{ $t('export.documentTitle') || 'Title' }}:</label>
              <input
                v-model="exportData.title"
                type="text"
                :placeholder="$t('export.titlePlaceholder') || 'Enter document title'"
                class="title-input"
              />
            </div>
            <div class="preview-summary">
              <label>{{ $t('export.contentPreview') || 'Content Preview' }}:</label>
              <div class="content-preview">
                {{ contentPreview }}
              </div>
            </div>
          </div>
        </div>

        <!-- Export Formats -->
        <div class="format-section">
          <h4>{{ $t('export.chooseFormat') || 'Choose Export Format' }}</h4>
          <div class="format-grid">
            <div
              v-for="format in availableFormats"
              :key="format.id"
              @click="selectFormat(format.id)"
              :class="['format-card', { selected: selectedFormat === format.id }]"
            >
              <div class="format-icon">{{ format.icon }}</div>
              <div class="format-info">
                <h5>{{ format.name }}</h5>
                <p>{{ format.description }}</p>
                <div class="format-status" :class="{ configured: format.configured }">
                  {{ format.configured ? ($t('export.configured') || 'Configured') : ($t('export.notConfigured') || 'Not Configured') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div v-if="selectedFormat" class="options-section">
          <h4>{{ $t('export.options') || 'Export Options' }}</h4>
          <div class="options-grid">
            <div class="option-item">
              <label for="export-author">
                {{ $t('export.author') || 'Author' }}:
              </label>
              <input
                id="export-author"
                v-model="exportData.author"
                type="text"
                :placeholder="$t('export.authorPlaceholder') || 'Your name'"
                class="option-input"
              />
            </div>

            <div class="option-item" v-if="selectedFormat === 'confluence'">
              <label for="export-parent">
                {{ $t('export.parentPage') || 'Parent Page ID' }}:
              </label>
              <input
                id="export-parent"
                v-model="exportData.parentId"
                type="text"
                :placeholder="$t('export.parentPagePlaceholder') || 'Optional parent page ID'"
                class="option-input"
              />
            </div>

            <div class="option-item" v-if="selectedFormat === 'wechat'">
              <label for="export-digest">
                {{ $t('export.digest') || 'Article Digest' }}:
              </label>
              <textarea
                id="export-digest"
                v-model="exportData.digest"
                :placeholder="$t('export.digestPlaceholder') || 'Brief description of the article'"
                class="option-textarea"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Export Progress -->
        <div v-if="isExporting" class="progress-section">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: exportProgress + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            {{ $t('export.exporting') || 'Exporting' }}... {{ exportProgress }}%
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button @click="closeDialog" class="btn btn-secondary" :disabled="isExporting">
          {{ $t('export.cancel') || 'Cancel' }}
        </button>
        <button @click="exportDocument" class="btn btn-primary" :disabled="!canExport || isExporting">
          <span v-if="isExporting" class="loading-spinner"></span>
          {{ isExporting ? ($t('export.exporting') || 'Exporting...') : ($t('export.startExport') || 'Start Export') }}
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="exportResult" class="result-message" :class="{ success: exportResult.success, error: !exportResult.success }">
        <span class="result-icon">{{ exportResult.success ? '✅' : '❌' }}</span>
        <div class="result-content">
          <div class="result-title">{{ exportResult.title }}</div>
          <div class="result-description">{{ exportResult.description }}</div>
          <div v-if="exportResult.url" class="result-url">
            <a :href="exportResult.url" target="_blank">{{ $t('export.viewResult') || 'View Result' }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ExportService from '@/services/exportService'

// Props
const props = defineProps({
  content: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'exported'])

// Reactive data
const selectedFormat = ref('')
const exportData = ref({
  title: '',
  author: '',
  parentId: '',
  digest: ''
})
const isExporting = ref(false)
const exportProgress = ref(0)
const exportResult = ref(null)

// Available export formats
const availableFormats = ref([
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Export to Atlassian Confluence',
    icon: '📚',
    configured: false
  },
  {
    id: 'wechat',
    name: 'WeChat',
    description: 'Export to WeChat Official Account',
    icon: '💬',
    configured: false
  }
])

// Computed
const contentPreview = computed(() => {
  const preview = props.content.replace(/[#*`_~\[\]()]/g, '').trim()
  return preview.length > 200 ? preview.substring(0, 197) + '...' : preview
})

const canExport = computed(() => {
  return selectedFormat.value &&
         exportData.value.title.trim() &&
         !isExporting.value
})

// Methods
const selectFormat = (formatId) => {
  selectedFormat.value = formatId
  exportResult.value = null

  // Set default title if empty
  if (!exportData.value.title.trim()) {
    const timestamp = new Date().toLocaleDateString()
    exportData.value.title = `MarkText Export - ${timestamp}`
  }
}

const exportDocument = async () => {
  if (!canExport.value) return

  isExporting.value = true
  exportProgress.value = 0
  exportResult.value = null

  try {
    console.log(`🚀 [ExportDialog] Starting export to ${selectedFormat.value}`)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (exportProgress.value < 90) {
        exportProgress.value += 10
      }
    }, 200)

    const result = await ExportService.export(props.content, selectedFormat.value, {
      ...exportData.value,
      onProgress: (progress) => {
        exportProgress.value = progress
      }
    })

    clearInterval(progressInterval)
    exportProgress.value = 100

    if (result.success) {
      exportResult.value = {
        success: true,
        title: 'Export Successful!',
        description: `Document exported to ${availableFormats.value.find(f => f.id === selectedFormat.value)?.name}`,
        url: result.result?.url
      }

      emit('exported', result)
    } else {
      throw new Error(result.error || 'Export failed')
    }

  } catch (error) {
    console.error('❌ [ExportDialog] Export failed:', error)

    exportResult.value = {
      success: false,
      title: 'Export Failed',
      description: error.message
    }
  } finally {
    isExporting.value = false
  }
}

const closeDialog = () => {
  if (!isExporting.value) {
    emit('close')
  }
}

// Initialize
onMounted(() => {
  // Check which formats are configured
  availableFormats.value.forEach(format => {
    if (format.id === 'confluence') {
      // Check if Confluence is configured
      format.configured = !!(
        exportData.value.confluence?.baseUrl &&
        exportData.value.confluence?.username &&
        exportData.value.confluence?.password &&
        exportData.value.confluence?.spaceKey
      )
    } else if (format.id === 'wechat') {
      // Check if WeChat is configured
      format.configured = !!(
        exportData.value.wechat?.appId &&
        exportData.value.wechat?.appSecret
      )
    }
  })
})
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.export-dialog {
  background-color: var(--bgColor);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--borderColor);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--textSecondaryColor);
}

.close-button:hover {
  background-color: var(--hoverBgColor);
  color: var(--textColor);
}

.dialog-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4,
.format-section h4,
.options-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-title label {
  font-weight: 500;
  font-size: 14px;
}

.title-input {
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 14px;
}

.preview-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content-preview {
  padding: 12px;
  background-color: var(--hoverBgColor);
  border-radius: 4px;
  font-size: 13px;
  color: var(--textSecondaryColor);
  max-height: 80px;
  overflow-y: auto;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.format-card {
  padding: 16px;
  border: 2px solid var(--borderColor);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-card:hover {
  border-color: var(--themeColor);
  background-color: var(--hoverBgColor);
}

.format-card.selected {
  border-color: var(--themeColor);
  background-color: rgba(var(--themeColor-rgb), 0.1);
}

.format-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.format-info {
  flex: 1;
}

.format-info h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.format-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--textSecondaryColor);
}

.format-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: var(--borderColor);
  color: var(--textSecondaryColor);
  display: inline-block;
}

.format-status.configured {
  background-color: var(--successColor);
  color: white;
}

.options-grid {
  display: grid;
  gap: 12px;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-item label {
  font-weight: 500;
  font-size: 14px;
}

.option-input {
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 14px;
}

.option-textarea {
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}

.progress-section {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--borderColor);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: var(--themeColor);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: var(--textSecondaryColor);
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid var(--borderColor);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.result-message {
  margin: 20px;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.result-message.success {
  background-color: rgba(var(--successColor-rgb), 0.1);
  border: 1px solid var(--successColor);
}

.result-message.error {
  background-color: rgba(var(--errorColor-rgb), 0.1);
  border: 1px solid var(--errorColor);
}

.result-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.result-description {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--textSecondaryColor);
}

.result-url a {
  color: var(--themeColor);
  text-decoration: none;
}

.result-url a:hover {
  text-decoration: underline;
}
</style>
