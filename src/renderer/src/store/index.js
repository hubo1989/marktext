import { createPinia, defineStore } from 'pinia'
import { createIpcPlugin } from './plugins/ipcPlugin'
import { useAsyncOperation } from './composables/useStoreHelpers'

// 创建Pinia实例并添加插件
const pinia = createPinia()
pinia.use(createIpcPlugin({
  prefix: 'mt::',
  autoCleanup: true
}))

// 主store - 全局状态管理
export const useMainStore = defineStore('main', {
  state: () => ({
    platform: window.electron?.process?.platform || 'unknown',
    appVersion: window.electron?.process?.env?.MARKTEXT_VERSION_STRING || 'unknown',
    windowActive: true,
    init: false,
    loading: false,
    error: null
  }),

  getters: {
    isReady: (state) => state.init && !state.loading,
    platformName: (state) => {
      const platforms = {
        darwin: 'macOS',
        win32: 'Windows',
        linux: 'Linux'
      }
      return platforms[state.platform] || state.platform
    },
    version: (state) => state.appVersion.replace(/^v/, '')
  },

  actions: {
    // 状态管理
    SET_WIN_STATUS(status) {
      this.windowActive = status
    },

    SET_INITIALIZED() {
      this.init = true
      this.loading = false
    },

    SET_LOADING(loading) {
      this.loading = loading
    },

    SET_ERROR(error) {
      this.error = error
      this.loading = false
    },

    CLEAR_ERROR() {
      this.error = null
    },

    // 窗口状态监听
    LISTEN_WIN_STATUS() {
      if (!window.electron || !window.electron.ipcRenderer) return
      
      window.electron.ipcRenderer.on('mt::window-active-status', (e, { status }) => {
        this.SET_WIN_STATUS(status)
      })
    },

    // 异步操作示例
    async initializeApp() {
      const initOperation = useAsyncOperation(async () => {
        // 模拟应用初始化
        await new Promise(resolve => setTimeout(resolve, 100))

        return true
      }, {
        onSuccess: () => {
          this.SET_INITIALIZED()
        },
        onError: (error) => {
          this.SET_ERROR(error)
          console.error('Failed to initialize app:', error)
        }
      })

      return initOperation.execute()
    },

    // 重置store状态
    reset() {
      this.$patch({
        windowActive: true,
        init: false,
        loading: false,
        error: null
      })

    }
  }
})

export default pinia
