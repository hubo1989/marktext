/**
 * Vitest 测试设置文件
 */

// 设置测试环境
import { beforeAll, afterAll, vi } from 'vitest'

// Mock window.electron
global.window.electron = {
  ipcRenderer: {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    sendSync: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn()
  },
  process: {
    platform: 'darwin',
    env: {
      MARKTEXT_VERSION_STRING: 'v0.18.3'
    }
  },
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn()
  },
  shell: {
    showItemInFolder: vi.fn(),
    openExternal: vi.fn()
  },
  webFrame: {
    setZoomFactor: vi.fn()
  }
}

// Mock global.marktext
global.marktext = {
  env: {
    type: 'editor',
    windowId: 'test-window'
  },
  initialState: null
}

// Mock fileUtils
global.fileUtils = {
  isSamePathSync: vi.fn((path1, path2) => path1 === path2)
}

// Mock path
global.path = {
  join: (...args) => args.join('/'),
  dirname: (path) => path.split('/').slice(0, -1).join('/') || '.',
  basename: (path) => path.split('/').pop(),
  extname: (path) => {
    const ext = path.split('.').pop()
    return ext ? `.${ext}` : ''
  }
}

// Mock fs
global.fs = {
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn()
}

// Mock Element Plus
vi.mock('element-plus', () => ({
  default: vi.fn(),
  ElMessage: vi.fn(),
  ElNotification: vi.fn()
}))

// Mock Pinia
vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({
    use: vi.fn()
  })),
  defineStore: vi.fn(),
  storeToRefs: vi.fn((store) => store)
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(),
  createWebHashHistory: vi.fn(),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    name: 'test'
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }))
}))

// Mock i18n
vi.mock('../i18n', () => ({
  default: vi.fn(),
  t: vi.fn((key) => key),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: 'en'
  }))
}))

// 清理函数
afterAll(() => {
  vi.clearAllMocks()
})

