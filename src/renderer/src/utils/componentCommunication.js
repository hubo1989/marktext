/**
 * Component Communication Manager
 * 替代事件总线的结构化组件通信方案
 * 支持类型安全的事件处理和更好的调试体验
 */

class ComponentCommunicationManager {
  constructor() {
    this.listeners = new Map()
    this.events = new Map()
  }

  /**
   * 注册事件监听器
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {string} componentName 组件名称（用于调试）
   * @returns {Function} 取消监听的函数
   */
  on(eventName, callback, componentName = 'unknown') {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Map())
    }

    const eventListeners = this.listeners.get(eventName)
    const listenerId = Symbol(`${componentName}-${eventName}`)

    eventListeners.set(listenerId, {
      callback,
      componentName,
      registeredAt: new Date()
    })

    // 记录事件
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [])
    }
    this.events.get(eventName).push({
      type: 'register',
      componentName,
      timestamp: new Date()
    })

    return () => {
      this.off(eventName, listenerId)
    }
  }

  /**
   * 移除事件监听器
   * @param {string} eventName 事件名称
   * @param {Symbol} listenerId 监听器ID
   */
  off(eventName, listenerId) {
    if (this.listeners.has(eventName)) {
      const eventListeners = this.listeners.get(eventName)
      if (eventListeners.has(listenerId)) {
        const listener = eventListeners.get(listenerId)
        eventListeners.delete(listenerId)

        // 记录事件
        if (this.events.has(eventName)) {
          this.events.get(eventName).push({
            type: 'unregister',
            componentName: listener.componentName,
            timestamp: new Date()
          })
        }
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {*} data 传递的数据
   */
  emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      const eventListeners = this.listeners.get(eventName)
      const listenersToCall = Array.from(eventListeners.values())

      // 记录事件
      if (!this.events.has(eventName)) {
        this.events.set(eventName, [])
      }
      this.events.get(eventName).push({
        type: 'emit',
        data: data,
        listenerCount: listenersToCall.length,
        timestamp: new Date()
      })

      // 调用所有监听器
      listenersToCall.forEach(({ callback, componentName }) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${componentName} event listener for ${eventName}:`, error)
        }
      })
    }
  }

  /**
   * 获取事件统计信息
   * @returns {Object} 事件统计
   */
  getStats() {
    const stats = {
      totalEvents: this.events.size,
      totalListeners: 0,
      events: {}
    }

    this.listeners.forEach((listeners, eventName) => {
      stats.totalListeners += listeners.size
      stats.events[eventName] = {
        listeners: listeners.size,
        history: this.events.get(eventName) || []
      }
    })

    return stats
  }

  /**
   * 清理所有监听器（用于测试或重置）
   */
  clear() {
    this.listeners.clear()
    this.events.clear()
  }
}

// 创建单例实例
export const componentCommunication = new ComponentCommunicationManager()

// 导出便捷方法
export const on = (eventName, callback, componentName) =>
  componentCommunication.on(eventName, callback, componentName)

export const off = (eventName, listenerId) =>
  componentCommunication.off(eventName, listenerId)

export const emit = (eventName, data) =>
  componentCommunication.emit(eventName, data)

export const getCommunicationStats = () =>
  componentCommunication.getStats()

// 开发环境下的调试工具
if (process.env.NODE_ENV === 'development') {
  window.__componentCommunicationStats = getCommunicationStats
}
