<template>
  <div class="startup-choice-container">
    <div class="startup-choice-content">
      <!-- Logo and Title -->
      <div class="startup-header">
        <div class="logo-section">
          <svg class="app-logo" viewBox="0 0 177.27 236.36" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style>.a{fill:#fff;}.b{fill:#999faa;}.c{fill:#6e737a;}.d{fill:#c8ccd6;fill-rule:evenodd;}</style>
            </defs>
            <title>markdown-document</title>
            <polygon class="a" points="121.87 3.69 3.69 3.69 3.69 232.67 173.58 232.67 173.58 55.4 121.87 3.69"/>
            <rect class="b" x="48.64" y="125.18" width="106" height="7"/>
            <rect class="b" x="48.64" y="113.18" width="69" height="7"/>
            <rect class="b" x="48.64" y="101.18" width="106" height="7"/>
            <circle class="c" cx="34.14" cy="104.68" r="3.5"/>
            <circle class="c" cx="34.14" cy="117.68" r="3.5"/>
            <circle class="c" cx="34.14" cy="128.68" r="3.5"/>
            <rect class="b" x="22.64" y="84.18" width="132" height="7"/>
            <rect class="b" x="22.64" y="72.18" width="132" height="7"/>
            <path class="c" d="M178.06,234H77.94a8.45,8.45,0,0,1-8.44-8.44V170.44A8.45,8.45,0,0,1,77.94,162H178.06a8.45,8.45,0,0,1,8.44,8.44v55.12A8.45,8.45,0,0,1,178.06,234ZM77.94,167.63a2.81,2.81,0,0,0-2.81,2.81v55.12a2.82,2.82,0,0,0,2.81,2.82H178.06a2.83,2.83,0,0,0,2.82-2.82V170.44a2.82,2.82,0,0,0-2.82-2.81Z" transform="translate(-39.36 -10.82)"/>
            <path class="c" d="M86.38,217.13V178.88H97.63l11.25,14.06,11.25-14.06h11.25v38.25H120.13V195.19l-11.25,14.06L97.63,195.19v21.94Z" transform="translate(-39.36 -10.82)"/>
            <path class="c" d="M156.13,217.69,139.25,198H150.5V178.88h11.25V198H173Z" transform="translate(-39.36 -10.82)"/>
            <rect class="b" x="48.64" y="41.18" width="33.81" height="7"/>
            <rect class="b" x="48.64" y="29.18" width="56" height="7"/>
            <rect class="c" x="66" y="48" width="19" height="3" transform="translate(-13.36 114.18) rotate(-90)"/>
            <rect class="c" x="58" y="48" width="19" height="3" transform="translate(-21.36 106.18) rotate(-90)"/>
            <rect class="c" x="22.64" y="41.18" width="19" height="3"/>
            <rect class="c" x="22.64" y="33.18" width="19" height="3"/>
            <path class="d" d="M216.61,66.18a3.56,3.56,0,0,0-1-2.42L163.7,11.87a3.57,3.57,0,0,0-2.39-1l-.07,0H39.36V247.18H216.64v-181ZM164.93,23.31l39.22,39.21H164.93Zm44.32,216.48H46.75V18.21h110.8v51.7h51.7Z" transform="translate(-39.36 -10.82)"/>
          </svg>
        </div>
        <h1 class="app-title">MarkText Next</h1>
        <p class="app-subtitle">{{ t('startup.welcome') }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="startup-actions">
        <div class="action-cards">
          <!-- New File Card -->
          <div class="action-card" @click="handleNewFile">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <h3 class="card-title">{{ t('startup.newFile') }}</h3>
            <p class="card-description">{{ t('startup.newFileDesc') }}</p>
          </div>

          <!-- Open Recent Card -->
          <div class="action-card" @click="handleOpenRecent">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                <path d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0"/>
              </svg>
            </div>
            <h3 class="card-title">{{ t('startup.openRecent') }}</h3>
            <p class="card-description">{{ t('startup.openRecentDesc') }}</p>
          </div>

          <!-- Open File Card -->
          <div class="action-card" @click="handleOpenFile">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 class="card-title">{{ t('startup.openFile') }}</h3>
            <p class="card-description">{{ t('startup.openFileDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="startup-footer">
        <p class="version-info">Version {{ appVersion }}</p>
        <div class="footer-links">
          <a href="#" @click.prevent="openPreferences">{{ t('startup.preferences') }}</a>
          <span class="separator">•</span>
          <a href="#" @click.prevent="openHelp">{{ t('startup.help') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/store/editor'
import { useMainStore } from '@/store'

// Emits
const emit = defineEmits(['choice-made'])

// Composables
const { t } = useI18n()
const editorStore = useEditorStore()
const mainStore = useMainStore()

// Reactive data
const appVersion = ref('0.1.0')

// Methods
const handleNewFile = () => {
  console.log('🎯 [STARTUP] User selected: New File')
  try {
    // Create new blank document
    editorStore.NEW_UNTITLED_TAB({})
    emit('choice-made', 'new-file')
  } catch (error) {
    console.error('❌ [STARTUP] Failed to create new file:', error)
  }
}

const handleOpenRecent = () => {
  console.log('🎯 [STARTUP] User selected: Open Recent')
  try {
    // Show recent files view
    emit('choice-made', 'recent-files')
  } catch (error) {
    console.error('❌ [STARTUP] Failed to open recent files:', error)
  }
}

const handleOpenFile = () => {
  console.log('🎯 [STARTUP] User selected: Open File')
  try {
    // Trigger file open dialog
    window.electron.ipcRenderer.send('mt::show-open-file-dialog')
  } catch (error) {
    console.error('❌ [STARTUP] Failed to open file dialog:', error)
  }
}

const openPreferences = () => {
  console.log('🎯 [STARTUP] Opening preferences')
  try {
    window.electron.ipcRenderer.send('mt::show-settings-window')
  } catch (error) {
    console.error('❌ [STARTUP] Failed to open preferences:', error)
  }
}

const openHelp = () => {
  console.log('🎯 [STARTUP] Opening help')
  try {
    window.electron.ipcRenderer.send('mt::show-help-window')
  } catch (error) {
    console.error('❌ [STARTUP] Failed to open help:', error)
  }
}

// Lifecycle
onMounted(() => {
  console.log('🎨 [STARTUP] StartupChoice component mounted')
})
</script>

<style scoped>
.startup-choice-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-bg, #f5f7fa) 0%, var(--secondary-bg, #c3cfe2) 100%);
  padding: 20px;
}

.startup-choice-content {
  max-width: 800px;
  width: 100%;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.startup-header {
  margin-bottom: 60px;
}

.logo-section {
  margin-bottom: 24px;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-text, #2d3748);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 18px;
  color: var(--secondary-text, #718096);
  margin: 0;
  font-weight: 400;
}

.startup-actions {
  margin-bottom: 60px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 720px;
  margin: 0 auto;
}

.action-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  border-radius: 16px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  border: 2px solid transparent;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.action-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-color, #4299e1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: var(--primary-color, #4299e1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon svg {
  width: 24px;
  height: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text, #2d3748);
  margin: 0 0 8px 0;
}

.card-description {
  font-size: 14px;
  color: var(--secondary-text, #718096);
  margin: 0;
  line-height: 1.5;
}

.startup-footer {
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  padding-top: 24px;
}

.version-info {
  font-size: 12px;
  color: var(--tertiary-text, #a0aec0);
  margin: 0 0 8px 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.footer-links a {
  color: var(--primary-color, #4299e1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary-hover, #3182ce);
  text-decoration: underline;
}

.separator {
  color: var(--secondary-text, #718096);
}

/* Responsive Design */
@media (max-width: 768px) {
  .startup-choice-content {
    padding: 20px;
  }

  .app-title {
    font-size: 36px;
  }

  .action-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .action-card {
    padding: 24px 16px;
  }

  .startup-header {
    margin-bottom: 40px;
  }

  .startup-actions {
    margin-bottom: 40px;
  }
}

@media (max-width: 480px) {
  .app-logo {
    width: 60px;
    height: 60px;
  }

  .app-title {
    font-size: 28px;
  }

  .app-subtitle {
    font-size: 16px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-description {
    font-size: 13px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .startup-choice-container {
    background: linear-gradient(135deg, var(--dark-primary-bg, #1a202c) 0%, var(--dark-secondary-bg, #2d3748) 100%);
  }

  .app-title {
    color: var(--dark-primary-text, #f7fafc);
  }

  .app-subtitle {
    color: var(--dark-secondary-text, #a0aec0);
  }

  .action-card {
    background: var(--dark-card-bg, rgba(45, 55, 72, 0.9));
    border-color: var(--dark-border-color, rgba(255, 255, 255, 0.1));
  }

  .card-title {
    color: var(--dark-primary-text, #f7fafc);
  }

  .card-description {
    color: var(--dark-secondary-text, #a0aec0);
  }

  .version-info {
    color: var(--dark-tertiary-text, #718096);
  }
}
</style>
