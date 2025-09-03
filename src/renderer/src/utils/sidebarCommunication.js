/**
 * 侧边栏专用通信管理器
 * 替代侧边栏相关的事件总线通信
 */

import { SIDEBAR_ACTIONS, SIDEBAR_EVENTS } from '../types/sidebar'

class SidebarCommunicationManager {
  constructor() {
    this.listeners = new Map()
    this.pendingActions = new Map()
  }

  /**
   * 发送侧边栏操作
   * @param {string} actionType - 操作类型
   * @param {Object} payload - 操作参数
   * @param {Function} [callback] - 完成回调
   */
  emitAction(actionType, payload = {}, callback) {
    const actionId = Symbol(`sidebar-action-${Date.now()}`)

    const action = {
      id: actionId,
      type: actionType,
      payload,
      callback,
      timestamp: new Date()
    }

    // 存储待处理的操作
    this.pendingActions.set(actionId, action)

    // 通知所有监听器
    if (this.listeners.has(actionType)) {
      const listeners = this.listeners.get(actionType)
      listeners.forEach(listener => {
        try {
          listener.callback(action)
        } catch (error) {
          console.error(`Sidebar action error for ${actionType}:`, error)
        }
      })
    }

    return actionId
  }

  /**
   * 监听侧边栏操作
   * @param {string} actionType - 操作类型
   * @param {Function} callback - 回调函数
   * @param {string} componentName - 组件名称（用于调试）
   * @returns {Function} 取消监听的函数
   */
  onAction(actionType, callback, componentName = 'unknown') {
    if (!this.listeners.has(actionType)) {
      this.listeners.set(actionType, new Map())
    }

    const listeners = this.listeners.get(actionType)
    const listenerId = Symbol(`${componentName}-${actionType}`)

    listeners.set(listenerId, {
      callback,
      componentName,
      registeredAt: new Date()
    })

    return () => {
      this.offAction(actionType, listenerId)
    }
  }

  /**
   * 取消监听侧边栏操作
   * @param {string} actionType - 操作类型
   * @param {Symbol} listenerId - 监听器ID
   */
  offAction(actionType, listenerId) {
    if (this.listeners.has(actionType)) {
      const listeners = this.listeners.get(actionType)
      listeners.delete(listenerId)
    }
  }

  /**
   * 发送侧边栏事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  emitEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date()
    }

    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType)
      listeners.forEach(listener => {
        try {
          listener.callback(event)
        } catch (error) {
          console.error(`Sidebar event error for ${eventType}:`, error)
        }
      })
    }
  }

  /**
   * 监听侧边栏事件
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   * @param {string} componentName - 组件名称
   * @returns {Function} 取消监听的函数
   */
  onEvent(eventType, callback, componentName = 'unknown') {
    return this.onAction(eventType, callback, componentName)
  }

  /**
   * 完成操作
   * @param {Symbol} actionId - 操作ID
   * @param {*} result - 操作结果
   */
  completeAction(actionId, result) {
    if (this.pendingActions.has(actionId)) {
      const action = this.pendingActions.get(actionId)
      if (action.callback) {
        action.callback(result)
      }
      this.pendingActions.delete(actionId)
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const stats = {
      totalListeners: 0,
      totalPendingActions: this.pendingActions.size,
      listenersByType: {}
    }

    this.listeners.forEach((listeners, type) => {
      stats.listenersByType[type] = listeners.size
      stats.totalListeners += listeners.size
    })

    return stats
  }

  /**
   * 清理所有监听器和待处理操作
   */
  clear() {
    this.listeners.clear()
    this.pendingActions.clear()
  }
}

// 创建单例实例
export const sidebarCommunication = new SidebarCommunicationManager()

// 便捷方法
export const createFile = (payload, callback) =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.CREATE_FILE, payload, callback)

export const createFolder = (payload, callback) =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.CREATE_FOLDER, payload, callback)

export const renameItem = (payload, callback) =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.RENAME_ITEM, payload, callback)

export const deleteItem = (payload, callback) =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.DELETE_ITEM, payload, callback)

export const selectItem = (payload) =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.SELECT_ITEM, payload)

export const toggleOpenedFiles = () =>
  sidebarCommunication.emitAction(SIDEBAR_ACTIONS.TOGGLE_OPENED_FILES)

export const onItemCreated = (callback, componentName) =>
  sidebarCommunication.onEvent(SIDEBAR_EVENTS.ITEM_CREATED, callback, componentName)

export const onItemSelected = (callback, componentName) =>
  sidebarCommunication.onEvent(SIDEBAR_EVENTS.ITEM_SELECTED, callback, componentName)

export const onInputFocusRequested = (callback, componentName) =>
  sidebarCommunication.onEvent(SIDEBAR_EVENTS.INPUT_FOCUS_REQUESTED, callback, componentName)

// 重新导出常量，方便其他文件使用
export { SIDEBAR_ACTIONS, SIDEBAR_EVENTS }

// 开发环境调试工具
if (process.env.NODE_ENV === 'development') {
  window.__sidebarCommunicationStats = () => sidebarCommunication.getStats()
}
