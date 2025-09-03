/**
 * Listener Manager - 统一管理所有监听器的注册
 * 优化监听器注册模式，减少重复代码和性能问题
 */

export default class ListenerManager {
  constructor(editorStore) {
    this.editorStore = editorStore
    this.listeners = []
  }

  /**
   * 注册所有监听器
   */
  registerAllListeners() {
    const listenerGroups = [
      // 文件操作监听器
      'LISTEN_FOR_SAVE',
      'LISTEN_FOR_SAVE_AS',
      'LISTEN_FOR_SAVE_CLOSE',
      'LISTEN_FOR_MOVE_TO',
      'LISTEN_FOR_RENAME',

      // 标签页操作监听器
      'LISTEN_FOR_NEW_TAB',
      'LISTEN_FOR_CLOSE_TAB',
      'LISTEN_FOR_TAB_CYCLE',
      'LISTEN_FOR_SWITCH_TABS',

      // 设置监听器
      'LISTEN_FOR_SET_PATHNAME',
      'LISTEN_FOR_SET_LINE_ENDING',
      'LISTEN_FOR_SET_ENCODING',
      'LISTEN_FOR_SET_FINAL_NEWLINE',

      // 窗口和界面监听器
      'LISTEN_FOR_BOOTSTRAP_WINDOW',
      'LISTEN_FOR_CLOSE',
      'LISTEN_SCREEN_SHOT',
      'LISTEN_WINDOW_ZOOM',
      'LISTEN_FOR_RELOAD_IMAGES',
      'LISTEN_FOR_CONTEXT_MENU',

      // 文件系统监听器
      'LISTEN_FOR_FILE_CHANGE',

      // 打印和导出监听器
      'LISTEN_FOR_PRINT_SERVICE_CLEARUP',
      'LISTEN_FOR_EXPORT_SUCCESS'
    ]

    // 批量注册监听器
    listenerGroups.forEach(listenerName => {
      if (typeof this.editorStore[listenerName] === 'function') {
        try {
          this.editorStore[listenerName]()
          this.listeners.push(listenerName)
        } catch (error) {
          console.error(`Failed to register listener ${listenerName}:`, error)
        }
      } else {
        console.warn(`Listener method ${listenerName} not found in editorStore`)
      }
    })

    console.log(`Successfully registered ${this.listeners.length} listeners`)
  }

  /**
   * 取消注册所有监听器
   */
  unregisterAllListeners() {
    // Note: Electron IPC listeners are automatically cleaned up when the window is closed
    // This method is for future use if manual cleanup is needed
    console.log(`Unregistered ${this.listeners.length} listeners`)
    this.listeners = []
  }

  /**
   * 获取已注册的监听器列表
   */
  getRegisteredListeners() {
    return [...this.listeners]
  }

  /**
   * 检查监听器是否已注册
   */
  isListenerRegistered(listenerName) {
    return this.listeners.includes(listenerName)
  }
}
