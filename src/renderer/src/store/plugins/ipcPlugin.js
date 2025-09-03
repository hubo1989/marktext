/**
 * Pinia Store Plugin - IPC通信统一处理
 * 自动处理与主进程的IPC通信，减少重复代码
 */

import { toRaw } from 'vue'

// IPC监听器缓存，避免重复注册
const ipcListeners = new Map()

/**
 * IPC插件配置
 * @param {Object} options - 插件选项
 * @param {string} options.prefix - IPC事件前缀
 * @param {boolean} options.autoCleanup - 是否自动清理监听器
 */
export function createIpcPlugin(options = {}) {
  const { prefix = 'mt::', autoCleanup = true } = options
  const ipcListeners = new Map()

  return ({ store }) => {
    // 检查是否在 Electron 环境中
    const isElectron = window.electron && window.electron.ipcRenderer
    
    // 为每个store添加IPC通信方法
    store.$ipc = {
      /**
       * 发送IPC消息到主进程
       * @param {string} channel - IPC通道
       * @param {*} data - 要发送的数据
       */
      send(channel, data) {
        if (window.electron && window.electron.ipcRenderer) {
          window.electron.ipcRenderer.send(channel, data)
        }
      },

      /**
       * 发送同步IPC消息
       * @param {string} channel - IPC通道
       * @param {*} data - 要发送的数据
       * @returns {*} 返回结果
       */
      sendSync(channel, data) {
        if (window.electron && window.electron.ipcRenderer) {
          return window.electron.ipcRenderer.sendSync(channel, data)
        }
        return null
      },

      /**
       * 监听IPC消息
       * @param {string} channel - IPC通道
       * @param {Function} callback - 回调函数
       * @param {Object} options - 监听选项
       */
      on(channel, callback, options = {}) {
        if (!window.electron || !window.electron.ipcRenderer) return

        const listenerId = `${store.$id}-${channel}`

        // 避免重复注册
        if (ipcListeners.has(listenerId)) {
          console.warn(`IPC listener for ${channel} already exists in store ${store.$id}`)
          return
        }

        const wrappedCallback = (event, ...args) => {
          try {
            callback.apply(store, [event, ...args])
          } catch (error) {
            console.error(`Error in IPC listener for ${channel}:`, error)
          }
        }

        window.electron.ipcRenderer.on(channel, wrappedCallback)
        ipcListeners.set(listenerId, { callback: wrappedCallback, channel })

        // 如果设置了自动清理，则在store销毁时清理监听器
        if (autoCleanup) {
          const unsubscribe = store.$subscribe(() => {}, {
            detached: true,
            flush: 'post'
          })

          // 监听store销毁事件
          const originalDispose = store._disposers || []
          store._disposers = [
            ...originalDispose,
            () => {
              this.off(channel)
              unsubscribe()
            }
          ]
        }

        return () => this.off(channel)
      },

      /**
       * 取消监听IPC消息
       * @param {string} channel - IPC通道
       */
      off(channel) {
        if (!window.electron || !window.electron.ipcRenderer) return

        const listenerId = `${store.$id}-${channel}`
        const listener = ipcListeners.get(listenerId)

        if (listener) {
          window.electron.ipcRenderer.removeListener(channel, listener.callback)
          ipcListeners.delete(listenerId)
        }
      },

      /**
       * 一次性监听IPC消息
       * @param {string} channel - IPC通道
       * @param {Function} callback - 回调函数
       */
      once(channel, callback) {
        if (!window.electron || !window.electron.ipcRenderer) return

        const wrappedCallback = (event, ...args) => {
          try {
            callback.apply(store, [event, ...args])
            // 自动移除监听器
            this.off(channel)
          } catch (error) {
            console.error(`Error in IPC once listener for ${channel}:`, error)
          }
        }

        window.electron.ipcRenderer.once(channel, wrappedCallback)
      }
    }

    // 为store添加便捷的IPC方法
    store.$send = store.$ipc ? store.$ipc.send.bind(store.$ipc) : () => {}
    store.$sendSync = store.$ipc ? store.$ipc.sendSync.bind(store.$ipc) : () => null
    store.$on = store.$ipc ? store.$ipc.on.bind(store.$ipc) : () => {}
    store.$off = store.$ipc ? store.$ipc.off.bind(store.$ipc) : () => {}
    store.$once = store.$ipc ? store.$ipc.once.bind(store.$ipc) : () => {}
  }
}

/**
 * 创建带IPC通信的store
 * @param {string} id - store ID
 * @param {Object} options - store选项
 * @returns {Object} 配置后的store选项
 */
export function createIpcStore(id, options) {
  const { ipc = {}, ...storeOptions } = options

  return {
    id,
    ...storeOptions,
    actions: {
      ...storeOptions.actions,

      /**
       * 初始化IPC监听器
       */
      initIpcListeners() {
        Object.entries(ipc).forEach(([channel, handler]) => {
          if (typeof handler === 'function') {
            this.$on(channel, handler)
          } else if (typeof handler === 'object') {
            const { callback, once = false } = handler
            if (once) {
              this.$once(channel, callback)
            } else {
              this.$on(channel, callback)
            }
          }
        })
      },

      /**
       * 清理IPC监听器
       */
      cleanupIpcListeners() {
        Object.keys(ipc).forEach(channel => {
          this.$off(channel)
        })
      }
    }
  }
}

/**
 * IPC状态同步插件
 * 自动同步store状态到主进程
 */
export function createStateSyncPlugin(options = {}) {
  const { channels = {}, debounce = 300 } = options

  return ({ store }) => {
    let debounceTimer = null

    // 监听store变化，同步到主进程
    store.$subscribe((mutation, state) => {
      const channel = channels[store.$id]
      if (channel && window.electron?.ipcRenderer) {
        // 防抖处理，避免频繁发送
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          try {
            // 只发送原始对象，避免循环引用
            const rawState = toRaw(state)
            window.electron.ipcRenderer.send(channel, {
              storeId: store.$id,
              state: rawState,
              timestamp: Date.now()
            })
          } catch (error) {
            console.error(`Failed to sync state for store ${store.$id}:`, error)
          }
        }, debounce)
      }
    }, { detached: true })
  }
}

