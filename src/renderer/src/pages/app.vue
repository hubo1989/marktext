<template>
  <div class="editor-container">
    <!-- 侧边栏 -->
    <Suspense v-if="init" @resolve="onSideBarResolve">
      <component :is="SideBar"></component>
    </Suspense>

    <div class="editor-middle" :class="{ 'sidebar-hidden': !showSideBar }">
      <!-- 标题栏 -->
      <Suspense @resolve="onTitleBarResolve">
        <component :is="TitleBar"
          :project="projectTree"
          :pathname="pathname"
          :filename="filename"
          :active="windowActive"
          :word-count="wordCount"
          :platform="platform"
          :is-saved="isSaved"
        ></component>
      </Suspense>

      <!-- 统一的加载动画 - 从应用启动到组件加载完成都显示 -->
      <div v-if="isAppLoading" class="app-startup-loading-overlay">
        <div class="app-startup-loading-content">
          <div class="modern-loading-spinner"></div>
          <h2 class="startup-loading-title">{{ loadingTitle }}</h2>
          <p class="startup-loading-subtitle">{{ loadingSubtitle }}</p>
        </div>
      </div>

      <!-- 启动选择页面 -->
      <Suspense v-if="!hasCurrentFile && shouldShowStartupChoice && !hasShownStartupChoice && init" @resolve="onStartupChoiceResolve">
        <component :is="StartupChoice" @choice-made="handleStartupChoice"></component>
      </Suspense>

      <!-- 最近文件 -->
      <Suspense v-if="!hasCurrentFile && hasShownStartupChoice && init" @resolve="onRecentResolve">
        <component :is="Recent"></component>
      </Suspense>

      <!-- 编辑器 -->
      <Suspense v-if="hasCurrentFile && init" @resolve="onEditorResolve">
        <component :is="EditorWithTabs"
          :markdown="markdown"
          :cursor="cursor"
          :muyaIndexCursor="muyaIndexCursor"
          :source-code="sourceCode"
          :show-tab-bar="showTabBar"
          :text-direction="textDirection"
          :platform="platform"
        ></component>
        <template #fallback>
          <div class="editor-loading-overlay">
            <div class="editor-loading-content">
              <div class="modern-loading-spinner"></div>
              <h3 class="loading-title">{{ t('preferences.general.loading.editorComponent') }}</h3>
              <p class="loading-subtitle">{{ t('preferences.general.loading.initializingEditor') }}</p>
            </div>
          </div>
        </template>
      </Suspense>


      <!-- 其他组件 -->
      <command-palette></command-palette>
      <about-dialog></about-dialog>
      <export-setting-dialog></export-setting-dialog>
      <rename></rename>
      <tweet></tweet>
      <import-modal></import-modal>

      <!-- Performance Monitor (Development Only) -->
      <performance-monitor v-if="isDevelopment"></performance-monitor>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, nextTick, onMounted, ref, defineAsyncComponent, Suspense } from 'vue'
import { useI18n } from 'vue-i18n'

// 正确定义异步组件
const StartupChoice = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "startup-choice" */ '@/components/startupChoice'),
  loadingComponent: {
    template: '<div>Loading Startup Choice...</div>'
  },
  errorComponent: {
    template: '<div>Failed to load Startup Choice component</div>'
  },
  onError(error, retry, fail) {
    console.error('❌ [ASYNC COMPONENT] StartupChoice component failed to load:', error)
    fail()
  }
})

const Recent = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "recent" */ '@/components/recent'),
  loadingComponent: {
    template: '<div>Loading Recent...</div>'
  },
  errorComponent: {
    template: '<div>Failed to load Recent component</div>'
  },
  onError(error, retry, fail) {
    console.error('❌ [ASYNC COMPONENT] Recent component failed to load:', error)
    fail()
  }
})

const EditorWithTabs = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "editor" */ '@/components/editorWithTabs'),
  loadingComponent: {
    template: '<div>Loading Editor...</div>'
  },
  errorComponent: {
    template: '<div>Failed to load Editor component</div>'
  },
  onError(error, retry, fail) {
    console.error('❌ [ASYNC COMPONENT] EditorWithTabs component failed to load:', error)
    fail()
  }
})

const TitleBar = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "titlebar" */ '@/components/titleBar'),
  loadingComponent: {
    template: '<div>Loading Title Bar...</div>'
  },
  errorComponent: {
    template: '<div>Failed to load TitleBar component</div>'
  },
  onError(error, retry, fail) {
    console.error('❌ [ASYNC COMPONENT] TitleBar component failed to load:', error)
    fail()
  }
})

const SideBar = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "sidebar" */ '@/components/sideBar'),
  loadingComponent: {
    template: '<div>Loading SideBar...</div>'
  },
  errorComponent: {
    template: '<div>Failed to load SideBar component</div>'
  },
  onError(error, retry, fail) {
    console.error('❌ [ASYNC COMPONENT] SideBar component failed to load:', error)
    fail()
  }
})
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { addStyles, addThemeStyle, addCustomStyle } from '@/util/theme'

// Import new services
import ThemeService from '@/services/themeService'
import ThemePersistenceService from '@/services/themePersistenceService'
import ThemeTransitionService from '@/services/themeTransitionService'
import AnimationService from '@/services/animationService'
import PerformanceService from '@/services/performanceService'
import AnimationController from '@/services/animationController'
import ConfigPersistenceService from '@/services/configPersistenceService'

// 同步导入常用组件（这些组件通常很快被需要）
import AboutDialog from '@/components/about'
import CommandPalette from '@/components/commandPalette'
import ExportSettingDialog from '@/components/exportSettings'
import Rename from '@/components/rename'
import Tweet from '@/components/tweet'
import ImportModal from '@/components/import'

// Performance monitor component (lazy loaded)
const PerformanceMonitor = () => import('@/components/performanceMonitor')

import bus from '@/bus'
import { DEFAULT_STYLE } from '@/config'
import { useTweetStore } from '@/store/tweet'
import { useLayoutStore } from '@/store/layout'
import { useListenForMainStore } from '@/store/listenForMain'
import { usePreferencesStore } from '@/store/preferences'
import { useEditorStore } from '@/store/editor'
import { useCommandCenterStore } from '@/store/commandCenter'
import { useProjectStore } from '@/store/project'
import { useAutoUpdatesStore } from '@/store/autoUpdates'
import { useNotificationStore } from '@/store/notification'
import ListenerManager from '@/store/modules/listenerManager'

const mainStore = useMainStore()
const editorStore = useEditorStore()
const preferencesStore = usePreferencesStore()
const layoutStore = useLayoutStore()
const projectStore = useProjectStore()
const tweetStore = useTweetStore()
const listenForMainStore = useListenForMainStore()
const autoUpdateStore = useAutoUpdatesStore()
const commandCenterStore = useCommandCenterStore()
const notificationStore = useNotificationStore()

const { t } = useI18n()
const timer = ref(null)
const listenerManager = ref(null)



// States from Pini
const { windowActive, platform, init } = storeToRefs(mainStore)
const { showTabBar, showSideBar } = storeToRefs(layoutStore)
const { sourceCode, theme, customCss, textDirection, zoom } = storeToRefs(preferencesStore)
const { projectTree } = storeToRefs(projectStore)
const { currentFile } = storeToRefs(editorStore)

const pathname = computed(() => currentFile.value?.pathname)
const filename = computed(() => currentFile.value?.filename)
const isSaved = computed(() => currentFile.value?.isSaved)
const markdown = computed(() => currentFile.value?.markdown)
const cursor = computed(() => currentFile.value?.cursor)
const wordCount = computed(() => currentFile.value?.wordCount)
const muyaIndexCursor = computed(() => currentFile.value?.muyaIndexCursor)

const hasCurrentFile = computed(() => {
  return markdown.value !== undefined
})

// 启动选择页面状态
const hasShownStartupChoice = ref(false)
const shouldShowStartupChoice = ref(false)

// 统一的加载状态 - 从应用启动到组件加载完成都显示
const isAppLoading = computed(() => {
  // 从应用启动开始显示加载状态，直到编辑器组件加载完成
  return !editorLoaded.value
})

// 跟踪编辑器组件是否已加载完成
const editorLoaded = ref(false)

// Development mode flag
const isDevelopment = ref(process.env.NODE_ENV === 'development')

// 动态加载标题
const loadingTitle = computed(() => {
  if (!init.value) {
    return t('preferences.general.loading.initializingApplication')
  }
  return t('preferences.general.loading.loadingComponents')
})

// 动态加载副标题
const loadingSubtitle = computed(() => {
  if (!init.value) {
    return t('preferences.general.loading.startingApplication')
  }
  return t('preferences.general.loading.preparingInterface')
})

// 编辑器组件加载完成时的处理函数
const onEditorResolve = () => {
  console.log('🎨 [APP] Editor component loaded successfully')
  editorLoaded.value = true
}

// 最近文件组件加载完成时的处理函数
const onRecentResolve = () => {
  console.log('🎨 [APP] Recent component loaded successfully')
  editorLoaded.value = true
}

// 侧边栏组件加载完成时的处理函数
const onSideBarResolve = () => {
  console.log('🎨 [APP] SideBar component loaded successfully')
  // 侧边栏加载完成后不直接结束加载动画，需要等待主要内容组件加载完成
}

// 标题栏组件加载完成时的处理函数
const onTitleBarResolve = () => {
  console.log('🎨 [APP] TitleBar component loaded successfully')
  // 标题栏加载完成后不直接结束加载动画，需要等待主要内容组件加载完成
}

// 启动选择页面组件加载完成时的处理函数
const onStartupChoiceResolve = () => {
  console.log('🎨 [APP] StartupChoice component loaded successfully')
}

// 处理启动选择
const handleStartupChoice = (choice) => {
  console.log('🎯 [APP] User made startup choice:', choice)
  hasShownStartupChoice.value = true

  switch (choice) {
    case 'new-file':
      // 已经通过editorStore.NEW_UNTITLED_TAB()处理
      // 通知主进程创建空白标签页
      window.electron.ipcRenderer.send('mt::new-untitled-tab', true, '')
      break
    case 'recent-files':
      // 显示最近文件页面 - 已经在模板中处理
      break
    case 'open-file':
      // 文件打开对话框已触发
      break
    default:
      console.warn('⚠️ [APP] Unknown startup choice:', choice)
  }
}

// Watchers - Enhanced with new theme service
watch(theme, async (value, oldValue) => {
  if (value !== oldValue) {
    console.log('🎨 [APP] Theme changed:', oldValue, '->', value)
    try {
      // Use new theme transition service for smooth transitions
      await ThemeTransitionService.switchTheme(value, {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      })

      // Save theme preference
      ThemePersistenceService.setCurrentTheme(value)

      // Update legacy theme style for compatibility
      addThemeStyle(value)

      console.log('✅ [APP] Theme transition completed successfully')
    } catch (error) {
      console.error('❌ [APP] Theme transition failed:', error)
      // Fallback to legacy method
      addThemeStyle(value)
    }
  }
})

watch(customCss, (value, oldValue) => {
  if (value !== oldValue) {
    addCustomStyle({
      customCss: value
    })
  }
})

watch(zoom, (zoomValue) => {
  window.electron.ipcRenderer.emit('mt::window-zoom', null, zoomValue)
})

const setupDragDropHandler = () => {
  window.addEventListener(
    'dragover',
    (e) => {
      if (!e.dataTransfer.types.length) return

      if (e.dataTransfer.types.indexOf('Files') >= 0) {
        if (
          e.dataTransfer.items.length === 1 &&
          e.dataTransfer.items[0].type.indexOf('image') > -1
        ) {
          // Do nothing
        } else {
          e.preventDefault()
          if (timer.value) {
            clearTimeout(timer.value)
          }
          timer.value = setTimeout(() => {
            bus.emit('importDialog', false)
          }, 300)
          bus.emit('importDialog', true)
        }
        e.dataTransfer.dropEffect = 'copy'
      } else {
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'none'
      }
    },
    false
  )
}
onMounted(async () => {
  console.log('🚀 [APP] onMounted - Starting application initialization')
  console.log('🎨 [APP] Loading animation will be visible from now')
  console.log('🔧 [APP] Async components defined:', {
    Recent: typeof Recent,
    EditorWithTabs: typeof EditorWithTabs,
    TitleBar: typeof TitleBar,
    SideBar: typeof SideBar
  })

  // Initialize new services
  console.log('🎨 [APP] Initializing theme and animation services')
  try {
    // Initialize configuration persistence service
    ConfigPersistenceService.initialize()

    // Load all saved preferences using the unified service
    const savedSettings = ConfigPersistenceService.getAllSettings()
    console.log('⚙️ [APP] Loading saved settings:', savedSettings)

    // Apply theme setting
    if (savedSettings.theme && savedSettings.theme !== theme.value) {
      console.log('🎨 [APP] Applying saved theme:', savedSettings.theme)
      preferencesStore.SET_THEME(savedSettings.theme)
    }

    // Apply dual screen settings
    if (savedSettings.dualScreenMode && savedSettings.dualScreenMode !== dualScreenMode.value) {
      console.log('📺 [APP] Applying saved dual screen mode:', savedSettings.dualScreenMode)
      preferencesStore.SET_SINGLE_PREFERENCE({
        type: 'dualScreenMode',
        value: savedSettings.dualScreenMode
      })
    }

    // Initialize theme persistence service (legacy compatibility)
    ThemePersistenceService.initialize()

    // Initialize theme transition service
    ThemeTransitionService.initialize()

    // Initialize animation service
    AnimationService.initialize()

    // Initialize performance service
    PerformanceService.initialize()

    // Initialize animation controller
    AnimationController.initialize()

    console.log('✅ [APP] Services initialized successfully')

    // Listen for bootstrap message from main process to determine if startup choice should be shown
    window.electron.ipcRenderer.on('mt::bootstrap-editor', (event, data) => {
      console.log('📡 [APP] Received bootstrap data:', data)

      // Check if we should show startup choice page
      if (data.showStartupChoice || (!data.addBlankTab && (!data.markdownList || data.markdownList.length === 0))) {
        console.log('🎯 [APP] Showing startup choice page')
        shouldShowStartupChoice.value = true
      } else {
        console.log('📝 [APP] Skipping startup choice, proceeding directly to editor')
        shouldShowStartupChoice.value = false
        hasShownStartupChoice.value = true // Skip startup choice page
      }
    })
  } catch (error) {
    console.error('❌ [APP] Failed to initialize services:', error)
  }

  if (global.marktext.initialState) {
    console.log('⚙️ [APP] Setting initial user preferences')
    preferencesStore.SET_USER_PREFERENCE(global.marktext.initialState)
  }

  // Initialize listener manager
  console.log('📡 [APP] Initializing listener manager')
  listenerManager.value = new ListenerManager(editorStore)

  console.log('🎧 [APP] Setting up store listeners')
  mainStore.LISTEN_WIN_STATUS()
  await commandCenterStore.LISTEN_COMMAND_CENTER_BUS()
  tweetStore.LISTEN_FOR_TWEET()
  layoutStore.LISTEN_FOR_LAYOUT()
  listenForMainStore.LISTEN_FOR_EDIT()
  preferencesStore.LISTEN_FOR_VIEW()
  listenForMainStore.LISTEN_FOR_SHOW_DIALOG()
  listenForMainStore.LISTEN_FOR_PARAGRAPH_INLINE_STYLE()
  projectStore.LISTEN_FOR_UPDATE_PROJECT()
  projectStore.LISTEN_FOR_LOAD_PROJECT()
  projectStore.LISTEN_FOR_SIDEBAR_CONTEXT_MENU()
  autoUpdateStore.LISTEN_FOR_UPDATE()
  preferencesStore.ASK_FOR_USER_PREFERENCE()
  preferencesStore.LISTEN_TOGGLE_VIEW()

  // Register all editor listeners using the manager
  console.log('🎧 [APP] Registering editor listeners')
  listenerManager.value.registerAllListeners()

  // module: notification
  notificationStore.listenForNotification()

  setupDragDropHandler()

  console.log('✅ [APP] Setting app as initialized')
  // Set app as initialized
  mainStore.SET_INITIALIZED()

  // 初始化布局状态
  console.log('📐 [APP] Initializing layout state')
  layoutStore.SET_LAYOUT({
    showSideBar: false, // 默认隐藏侧边栏，让编辑器居中
    showTabBar: true   // 显示标签栏
  })

  console.log('🎨 [APP] Applying styles')
  nextTick(() => {
    const style = global.marktext.initialState || DEFAULT_STYLE
    addStyles(style)
    console.log('🎨 [APP] Styles applied, app fully initialized')
    console.log('📊 [APP] Current state after initialization:', {
      init: init.value,
      hasCurrentFile: hasCurrentFile.value,
      currentFile: currentFile.value?.pathname || 'none',
      markdownLength: markdown.value?.length || 0
    })
  })
})
</script>

<style scoped>
.editor-placeholder,
.editor-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.editor-container .hide {
  z-index: -1;
  opacity: 0;
  position: absolute;
  left: -10000px;
}
.editor-placeholder {
  background: var(--editorBgColor);
}
.editor-middle {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
  position: relative;
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  background-color: var(--editorBgColor);
  color: var(--editorColor);

  & > .editor {
    flex: 1;
  }

  /* 当sidebar隐藏时，充满整个容器 */
  &.sidebar-hidden {
    max-width: none;
    width: 100%;
    margin: 0;
  }
}

/* Loading styles */
.editor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--editorBgColor);
  color: var(--editorColor);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--editorColor, #ccc);
  border-top: 4px solid var(--themeColor, #007acc);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editor-placeholder p {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
}

.component-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--editorColor);
  font-size: 14px;
  opacity: 0.7;
}

/* 现代化的编辑器加载样式 */
.editor-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: transparent;
}

.editor-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.modern-loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--themeColor, #007acc);
  border-radius: 50%;
  animation: modern-spin 1s linear infinite, modern-pulse 1s ease-in-out infinite;
  margin-bottom: 20px;
  position: relative;
}

.modern-loading-spinner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: var(--themeColor, #007acc);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: modern-fill 1s linear infinite;
}

.loading-title {
  margin: 0 0 8px 0;
  color: var(--editorColor, #333);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.loading-subtitle {
  margin: 0;
  color: var(--editorColor, #666);
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
}

/* 应用启动加载动画样式 */
.app-startup-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .app-startup-loading-overlay {
    background: rgba(0, 0, 0, 0.95);
  }
}

/* 基于主题的背景色 */
.theme-dark .app-startup-loading-overlay,
.theme-material-dark .app-startup-loading-overlay,
.theme-one-dark .app-startup-loading-overlay {
  background: rgba(0, 0, 0, 0.95);
}

.theme-light .app-startup-loading-overlay,
.theme-material-light .app-startup-loading-overlay,
.theme-graphite-light .app-startup-loading-overlay,
.theme-ulysses-light .app-startup-loading-overlay {
  background: rgba(255, 255, 255, 0.95);
}

.app-startup-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.startup-loading-title {
  margin: 0 0 12px 0;
  color: var(--editorColor, #333);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.startup-loading-subtitle {
  margin: 0;
  color: var(--editorColor, #666);
  font-size: 16px;
  opacity: 0.85;
  line-height: 1.5;
  font-weight: 400;
}


@keyframes modern-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes modern-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes modern-fill {
  0% {
    clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  }
  25% {
    clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%);
  }
  50% {
    clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 0% 100%);
  }
  75% {
    clip-path: polygon(50% 50%, 100% 50%, 0% 50%, 0% 100%);
  }
  100% {
    clip-path: polygon(50% 50%, 100% 50%, 0% 50%, 0% 0%);
  }
}
</style>
