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
        <template #fallback>
          <div class="startup-loading">
            <div class="loading-spinner"></div>
            <p>正在加载启动页面...</p>
          </div>
        </template>
      </Suspense>

      <!-- 编辑器 -->
      <Suspense v-if="(hasCurrentFile || (!shouldShowStartupChoice && hasShownStartupChoice)) && init" @resolve="onEditorResolve">
        <component :is="EditorWithTabs"
          :markdown="markdown || ''"
          :cursor="cursor || {}"
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
import { computed, watch, nextTick, onMounted, onBeforeMount, ref, defineAsyncComponent, Suspense } from 'vue'
import { useI18n } from 'vue-i18n'

// 环境检测工具函数
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV
}

// 开发环境专用日志函数
const devLog = (...args) => {
  if (isDevelopment()) {
    devLog(...args)
  }
}

const devWarn = (...args) => {
  if (isDevelopment()) {
    console.warn(...args)
  }
}

// StartupChoice 组件已预加载，直接使用

// Set up IPC listeners as early as possible
onBeforeMount(() => {
  devLog('🚀 [APP] ========== ON BEFORE MOUNT CALLED ==========')
  devLog('🚀 [APP] onBeforeMount - Setting up early IPC listeners')
  devLog('🚀 [APP] window.electron exists:', !!window.electron)
  devLog('🚀 [APP] window.electron.ipcRenderer exists:', !!window.electron?.ipcRenderer)

  devLog('📡 [APP] Setting up mt::bootstrap-editor listener...')

  // Listen to all IPC messages for debugging
  window.electron.ipcRenderer.on('*', (event, ...args) => {
    devLog('📡 [APP] IPC MESSAGE RECEIVED - Channel:', event.channel || event.type, 'Args length:', args.length)
    if (event.channel === 'mt::bootstrap-editor') {
      devLog('📡 [APP] BOOTSTRAP MESSAGE RECEIVED:', args[0])
    }
  })

  // Initialize editor store modules if not already done
  devLog('📡 [APP] Checking if editor store modules are initialized...')
  if (!editorStore.NEW_UNTITLED_TAB) {
    devLog('📡 [APP] Modules not initialized, initializing now...')
    editorStore.initializeModules()
    devLog('📡 [APP] Editor store modules initialized')
  }
  
  // Initialize listener manager early to ensure bootstrap listener is ready
  devLog('📡 [APP] Initializing listener manager early')
  if (!listenerManager.value) {
    listenerManager.value = new ListenerManager(editorStore)
  }
  devLog('🎧 [APP] Registering bootstrap listener early')
  listenerManager.value.registerAllListeners()

  devLog('✅ [APP] Early IPC listeners set up successfully')
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

// EditorWithTabs 组件已预加载，直接使用

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
import StartupChoice from '@/components/startupChoice'
import EditorWithTabs from '@/components/editorWithTabs'

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
const { sourceCode, theme, customCss, textDirection, zoom, dualScreenMode } = storeToRefs(preferencesStore)
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
  // If we're showing startup choice, don't consider current file as existing
  if (shouldShowStartupChoice.value && !hasShownStartupChoice.value) {
    return false
  }

  // Check if currentFile exists (even with empty markdown content)
  if (currentFile.value && currentFile.value.id) {
    return true
  }

  // Fallback: check markdown content
  return markdown.value !== undefined && markdown.value !== ''
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
  devLog('🎨 [APP] Editor component loaded successfully')
  editorLoaded.value = true
}

// 最近文件组件加载完成时的处理函数
const onRecentResolve = () => {
  devLog('🎨 [APP] Recent component loaded successfully')
  editorLoaded.value = true
}

// 侧边栏组件加载完成时的处理函数
const onSideBarResolve = () => {
  devLog('🎨 [APP] SideBar component loaded successfully')
  // 侧边栏加载完成后不直接结束加载动画，需要等待主要内容组件加载完成
}

// 标题栏组件加载完成时的处理函数
const onTitleBarResolve = () => {
  devLog('🎨 [APP] TitleBar component loaded successfully')
  // 标题栏加载完成后不直接结束加载动画，需要等待主要内容组件加载完成
}

// 启动选择页面组件加载完成时的处理函数
const onStartupChoiceResolve = () => {
  devLog('🎨 [APP] StartupChoice component loaded successfully')
  editorLoaded.value = true
}

// 处理启动选择
const handleStartupChoice = (choice) => {
  devLog('🎯 [APP] User made startup choice:', choice)

  switch (choice) {
    case 'new-file':
      // 直接创建新文件并进入编辑器
      devLog('📝 [APP] Creating new file...')
      editorStore.NEW_UNTITLED_TAB({})

      // 等待文件创建完成后更新状态
      nextTick(() => {
        devLog('📝 [APP] New file created, currentFile:', currentFile.value)
        devLog('📝 [APP] Markdown value:', markdown.value)
        devLog('📝 [APP] hasCurrentFile:', hasCurrentFile.value)

        // 关键修复：新建文件后需要重置启动选择状态
        shouldShowStartupChoice.value = false
        hasShownStartupChoice.value = true
      })
      break
    case 'recent-files':
      // 显示最近文件页面
      hasShownStartupChoice.value = true
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
    devLog('🎨 [APP] Theme changed:', oldValue, '->', value)
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

      devLog('✅ [APP] Theme transition completed successfully')
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
    devLog('🚀 [APP] onMounted - Starting application initialization')

    // IPC listeners are already set up in onBeforeMount, just test communication
    devLog('📡 [APP] IPC listeners already set up in onBeforeMount')
    devLog('📡 [APP] ipcRenderer available:', !!window.electron?.ipcRenderer)

    // Test IPC communication
    devLog('📡 [APP] Testing IPC communication...')
    try {
      window.electron.ipcRenderer.send('test-message', { test: 'hello from renderer' })
      devLog('📡 [APP] Test message sent successfully')
    } catch (error) {
      console.error('📡 [APP] Failed to send test message:', error)
    }
  devLog('🎨 [APP] Loading animation will be visible from now')
  devLog('🔧 [APP] Components defined:', {
    Recent: typeof Recent,
    EditorWithTabs: typeof EditorWithTabs,
    TitleBar: typeof TitleBar,
    SideBar: typeof SideBar,
    StartupChoice: typeof StartupChoice
  })

  // 预热关键组件，确保快速响应
  devLog('🎯 [APP] Pre-warming critical components')
  try {
    // 预热 StartupChoice 组件
    if (StartupChoice && typeof StartupChoice === 'function') {
      devLog('✅ [APP] StartupChoice component pre-loaded')
    }

    // 预热 EditorWithTabs 组件 - 这是最重要的组件，应该尽快加载
    if (EditorWithTabs && typeof EditorWithTabs === 'function') {
      devLog('✅ [APP] EditorWithTabs component pre-loaded')
    }
  } catch (error) {
    console.warn('⚠️ [APP] Failed to pre-warm components:', error)
  }

  // Initialize new services
  devLog('🎨 [APP] Initializing theme and animation services')
  try {
    // Initialize configuration persistence service
    ConfigPersistenceService.initialize()

    // Load all saved preferences using the unified service
    const savedSettings = ConfigPersistenceService.getAllSettings()
    devLog('⚙️ [APP] Loading saved settings:', savedSettings)

    // Apply theme setting
    if (savedSettings.theme && savedSettings.theme !== theme.value) {
      devLog('🎨 [APP] Applying saved theme:', savedSettings.theme)
      preferencesStore.SET_SINGLE_PREFERENCE({
        type: 'theme',
        value: savedSettings.theme
      })
    }

    // Apply dual screen settings
    if (savedSettings.dualScreenMode && savedSettings.dualScreenMode !== dualScreenMode.value) {
      devLog('📺 [APP] Applying saved dual screen mode:', savedSettings.dualScreenMode)
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

    devLog('✅ [APP] Services initialized successfully')

    // Force hide startup choice page after 3 seconds to ensure blank page is always shown
    setTimeout(() => {
      devLog('⏰ [APP] Forcing hide startup choice page after 3 seconds')
      shouldShowStartupChoice.value = false
      hasShownStartupChoice.value = true
    }, 3000)
  } catch (error) {
    console.error('❌ [APP] Failed to initialize services:', error)
  }

  if (global.marktext.initialState) {
    devLog('⚙️ [APP] Setting initial user preferences')
    preferencesStore.SET_USER_PREFERENCE(global.marktext.initialState)
  }

  devLog('🎧 [APP] Setting up additional store listeners')
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

  // 监听所有标签页关闭事件，回到启动选择页面
  devLog('🎧 [APP] Setting up all-tabs-closed listener')
  bus.on('all-tabs-closed', () => {
    devLog('🎯 [APP] All tabs closed, showing startup choice page')
    shouldShowStartupChoice.value = true
    hasShownStartupChoice.value = false
  })

  // 监听来自store的启动选择页面事件
  devLog('🎧 [APP] Setting up startup choice event listeners')
  bus.on('show-startup-choice', () => {
    devLog('🎯 [APP] Received show-startup-choice event from store')
    devLog('🎯 [APP] Before setting: shouldShowStartupChoice =', shouldShowStartupChoice.value, ', hasShownStartupChoice =', hasShownStartupChoice.value)
    shouldShowStartupChoice.value = true
    devLog('🎯 [APP] After setting: shouldShowStartupChoice =', shouldShowStartupChoice.value, ', hasShownStartupChoice =', hasShownStartupChoice.value)
  })

  bus.on('hide-startup-choice', () => {
    devLog('🎯 [APP] Received hide-startup-choice event from store')
    devLog('🎯 [APP] Before setting: shouldShowStartupChoice =', shouldShowStartupChoice.value, ', hasShownStartupChoice =', hasShownStartupChoice.value)
    shouldShowStartupChoice.value = false
    hasShownStartupChoice.value = true
    devLog('🎯 [APP] After setting: shouldShowStartupChoice =', shouldShowStartupChoice.value, ', hasShownStartupChoice =', hasShownStartupChoice.value)
  })

  // 监听文件加载事件 - 确保编辑器显示
  devLog('🎧 [APP] Setting up file-loaded listener')
  bus.on('file-loaded', (fileData) => {
    devLog('🎯 [APP] ===== RECEIVED FILE-LOADED EVENT =====')
    devLog('🎯 [APP] File data:', fileData)
    devLog('🎯 [APP] Current file state:', currentFile.value)
    devLog('🎯 [APP] hasCurrentFile:', hasCurrentFile.value)
    devLog('🎯 [APP] shouldShowStartupChoice:', shouldShowStartupChoice.value)
    devLog('🎯 [APP] hasShownStartupChoice:', hasShownStartupChoice.value)
    devLog('🎯 [APP] Editor store tabs length:', editorStore.tabs?.length || 0)

    if (editorStore.tabs && editorStore.tabs.length > 0) {
      devLog('🎯 [APP] First tab:', editorStore.tabs[0])
      devLog('🎯 [APP] All tab IDs:', editorStore.tabs.map(t => t.id))
    }

    // 强制触发响应式更新
    nextTick(() => {
      devLog('🎯 [APP] Next tick - checking file state after file-loaded')
      devLog('🎯 [APP] Current file after nextTick:', currentFile.value)
      devLog('🎯 [APP] hasCurrentFile after nextTick:', hasCurrentFile.value)
      devLog('🎯 [APP] Tabs after nextTick:', editorStore.tabs)
    })
  })

  // module: notification
  notificationStore.listenForNotification()

  setupDragDropHandler()

  devLog('✅ [APP] Setting app as initialized')
  // Set app as initialized
  mainStore.SET_INITIALIZED()

  // 初始化布局状态
  devLog('📐 [APP] Initializing layout state')
  layoutStore.SET_LAYOUT({
    showSideBar: false, // 默认隐藏侧边栏，让编辑器居中
    showTabBar: true   // 显示标签栏
  })

  devLog('🎨 [APP] Applying styles')
  nextTick(() => {
    const style = global.marktext.initialState || DEFAULT_STYLE
    addStyles(style)
    devLog('🎨 [APP] Styles applied, app fully initialized')
    devLog('📊 [APP] Current state after initialization:', {
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
  z-index: 9999; /* 降低z-index，让启动选择页面可以覆盖 */
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

/* StartupChoice 组件加载样式 */
.startup-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.startup-loading p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 暗色主题下的加载样式 */
@media (prefers-color-scheme: dark) {
  .loading-spinner {
    border-color: #4a5568;
    border-top-color: #63b3ed;
  }

  .startup-loading p {
    color: #a0aec0;
  }
}

.theme-dark .loading-spinner,
.theme-material-dark .loading-spinner,
.theme-one-dark .loading-spinner {
  border-color: #4a5568;
  border-top-color: #63b3ed;
}

.theme-dark .startup-loading p,
.theme-material-dark .startup-loading p,
.theme-one-dark .startup-loading p {
  color: #a0aec0;
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
