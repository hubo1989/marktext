/**
 * 测试工具函数
 * 提供常用的测试辅助函数
 */

import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { vi } from 'vitest'

/**
 * 创建测试应用实例
 * @param {Object} options - 配置选项
 * @returns {Object} 测试应用实例
 */
export function createTestApp(options = {}) {
  const {
    routes = [],
    initialState = {},
    plugins = []
  } = options

  const app = createApp({
    template: '<div id="app"><router-view /></div>'
  })

  // 创建Pinia实例
  const pinia = createPinia()
  app.use(pinia)

  // 创建路由实例
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  app.use(router)

  // 应用其他插件
  plugins.forEach(plugin => {
    app.use(plugin)
  })

  return { app, router, pinia }
}

/**
 * 挂载Vue组件进行测试
 * @param {Object} Component - 要测试的组件
 * @param {Object} options - 挂载选项
 * @returns {Object} 包装后的组件实例
 */
export function mountComponent(Component, options = {}) {
  const {
    props = {},
    global = {},
    mocks = {},
    stubs = {}
  } = options

  // 默认全局配置
  const defaultGlobal = {
    mocks: {
      $t: (key) => key,
      $tc: (key) => key,
      ...mocks
    },
    stubs: {
      'el-button': true,
      'el-dialog': true,
      'el-form': true,
      'el-input': true,
      'el-tooltip': true,
      ...stubs
    },
    ...global
  }

  return mount(Component, {
    props,
    global: defaultGlobal
  })
}

/**
 * 创建模拟的store
 * @param {Object} initialState - 初始状态
 * @returns {Object} 模拟的store
 */
export function createMockStore(initialState = {}) {
  return {
    ...initialState,
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $onAction: vi.fn()
  }
}

/**
 * 模拟IPC通信
 * @param {Object} mockResponses - 模拟的响应
 * @returns {Object} 模拟的IPC实例
 */
export function mockIPC(mockResponses = {}) {
  const mockIpcRenderer = {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    sendSync: vi.fn((channel) => mockResponses[channel]),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn()
  }

  // 设置全局mock
  global.window.electron = {
    ...global.window.electron,
    ipcRenderer: mockIpcRenderer
  }

  return mockIpcRenderer
}

/**
 * 模拟文件系统操作
 * @param {Object} mockFiles - 模拟的文件结构
 * @returns {Object} 模拟的fs实例
 */
export function mockFileSystem(mockFiles = {}) {
  const mockFs = {
    existsSync: vi.fn((path) => !!mockFiles[path]),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn((path) => mockFiles[path] || ''),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(() => Object.keys(mockFiles))
  }

  global.fs = mockFs
  return mockFs
}

/**
 * 等待指定的时间
 * @param {number} ms - 等待的毫秒数
 * @returns {Promise} Promise
 */
export function wait(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建模拟的事件
 * @param {string} type - 事件类型
 * @param {Object} options - 事件选项
 * @returns {Event} 模拟的事件
 */
export function createMockEvent(type, options = {}) {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: { value: '' },
    ...options
  }
}

/**
 * 清理所有模拟
 */
export function cleanupMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

/**
 * 测试异步操作的辅助函数
 * @param {Function} asyncFn - 异步函数
 * @returns {Promise} 测试结果
 */
export async function testAsync(asyncFn) {
  try {
    const result = await asyncFn()
    return { success: true, result }
  } catch (error) {
    return { success: false, error }
  }
}

