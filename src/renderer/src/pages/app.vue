<template>
  <div class="editor-container">
    <!-- 侧边栏 -->
    <Suspense v-if="init">
      <component :is="SideBar"></component>
      <template #fallback>
        <div class="component-loading" style="background: #f0f0f0; border: 2px solid #ccc; padding: 20px; text-align: center;">
          <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
          <p style="margin: 0 0 10px 0; color: #333;">{{ t('preferences.general.loading.editorComponent') }}</p>
        </div>
      </template>
    </Suspense>

    <div class="editor-middle">
      <!-- 标题栏 -->
      <Suspense>
        <component :is="TitleBar"
          :project="projectTree"
          :pathname="pathname"
          :filename="filename"
          :active="windowActive"
          :word-count="wordCount"
          :platform="platform"
          :is-saved="isSaved"
        ></component>
        <template #fallback>
          <div class="component-loading" style="background: #e7f3ff; border: 2px solid #2196f3; padding: 20px; text-align: center; min-height: 60px; display: flex; align-items: center; justify-content: center;">
            <div class="loading-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #2196f3; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; margin-right: 10px;"></div>
            <div>
              <p style="margin: 0; color: #1976d2; font-weight: bold;">{{ t('preferences.general.loading.editorComponent') }}</p>
              <div class="debug-info" style="font-size: 10px; color: #666; margin-top: 5px;">
                Project: {{ projectTree?.length || 0 }} items | File: {{ filename || 'none' }}
              </div>
            </div>
          </div>
        </template>
      </Suspense>

      <div v-if="!init" class="editor-placeholder">
        <div class="loading-spinner"></div>
        <p>Initializing application...</p>
      </div>

      <!-- 最近文件 -->
      <Suspense v-if="!hasCurrentFile && init">
        <component :is="Recent"></component>
        <template #fallback>
          <div class="component-loading" style="background: #f3e5f5; border: 2px solid #9c27b0; padding: 30px; text-align: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #9c27b0; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
            <h4 style="margin: 0 0 10px 0; color: #7b1fa2;">Loading Recent Files...</h4>
            <p style="margin: 0 0 15px 0; color: #7b1fa2;">Preparing your recent documents</p>
          </div>
        </template>
      </Suspense>

      <!-- 编辑器 -->
      <Suspense v-if="hasCurrentFile && init">
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
          <div class="component-loading" style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; text-align: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center;">
            <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #ffc107; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <h3 style="margin: 0 0 10px 0; color: #856404;">{{ t('preferences.general.loading.editorComponent') }}</h3>
            <p style="margin: 0 0 15px 0; color: #856404;">{{ t('preferences.general.loading.initializingEditor') }}</p>
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
    </div>
  </div>
</template>

<script setup>
import { computed, watch, nextTick, onMounted, ref, defineAsyncComponent, Suspense } from 'vue'
import { useI18n } from 'vue-i18n'

// 正确定义异步组件
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

// 同步导入常用组件（这些组件通常很快被需要）
import AboutDialog from '@/components/about'
import CommandPalette from '@/components/commandPalette'
import ExportSettingDialog from '@/components/exportSettings'
import Rename from '@/components/rename'
import Tweet from '@/components/tweet'
import ImportModal from '@/components/import'

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
const { showTabBar } = storeToRefs(layoutStore)
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

// Watchers
watch(theme, (value, oldValue) => {
  if (value !== oldValue) {
    addThemeStyle(value)
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
  console.log('🔧 [APP] Async components defined:', {
    Recent: typeof Recent,
    EditorWithTabs: typeof EditorWithTabs,
    TitleBar: typeof TitleBar,
    SideBar: typeof SideBar
  })

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

  & > .editor {
    flex: 1;
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
</style>
