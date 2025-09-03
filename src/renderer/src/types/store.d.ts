/**
 * Store类型定义
 * 为Pinia stores提供TypeScript类型支持
 */

import type { StoreDefinition } from 'pinia'

// 主store类型
export interface MainState {
  platform: string
  appVersion: string
  windowActive: boolean
  init: boolean
  loading: boolean
  error: Error | null
}

export interface MainGetters {
  isReady: boolean
  platformName: string
  version: string
}

export interface MainActions {
  SET_WIN_STATUS(status: boolean): void
  SET_INITIALIZED(): void
  SET_LOADING(loading: boolean): void
  SET_ERROR(error: Error | null): void
  CLEAR_ERROR(): void
  initializeApp(): Promise<boolean>
  reset(): void
  initIpcListeners(): void
  cleanupIpcListeners(): void
}

export type MainStore = StoreDefinition<'main', MainState, MainGetters, MainActions>

// 编辑器store类型
export interface EditorState {
  currentFile: any
  tabs: any[]
  listToc: any[]
  toc: any[]
}

export interface EditorGetters {
  hasUnsavedChanges: boolean
  activeTab: any
  totalTabs: number
}

export interface EditorActions {
  UPDATE_CURRENT_FILE(file: any): void
  CLOSE_TAB(file: any): void
  NEW_UNTITLED_TAB(options?: any): void
  SAVE_FILE(): Promise<void>
  LOAD_FILE(filePath: string): Promise<void>
  initializeModules(): void
}

export type EditorStore = StoreDefinition<'editor', EditorState, EditorGetters, EditorActions>

// 项目store类型
export interface ProjectState {
  projectTree: any
  openedFiles: any[]
  activeItem: any
}

export interface ProjectGetters {
  hasOpenProject: boolean
  totalFiles: number
  projectName: string
}

export interface ProjectActions {
  LOAD_PROJECT(projectPath: string): Promise<void>
  CREATE_FILE(name: string, path: string): Promise<void>
  CREATE_FOLDER(name: string, path: string): Promise<void>
  DELETE_ITEM(item: any): Promise<void>
  RENAME_ITEM(item: any, newName: string): Promise<void>
}

export type ProjectStore = StoreDefinition<'project', ProjectState, ProjectGetters, ProjectActions>

// 偏好设置store类型
export interface PreferencesState {
  theme: string
  fontSize: number
  lineHeight: number
  autoSave: boolean
  wordWrap: boolean
  [key: string]: any
}

export interface PreferencesGetters {
  isDarkTheme: boolean
  fontSizePx: string
  lineHeightValue: number
}

export interface PreferencesActions {
  SET_PREFERENCE(key: string, value: any): void
  LOAD_PREFERENCES(): Promise<void>
  SAVE_PREFERENCES(): Promise<void>
  RESET_PREFERENCES(): void
}

export type PreferencesStore = StoreDefinition<'preferences', PreferencesState, PreferencesGetters, PreferencesActions>

// IPC插件类型扩展
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $ipc: {
      send(channel: string, data?: any): void
      sendSync(channel: string, data?: any): any
      on(channel: string, callback: Function, options?: any): () => void
      off(channel: string): void
      once(channel: string, callback: Function): void
    }
    $send: (channel: string, data?: any) => void
    $sendSync: (channel: string, data?: any) => any
    $on: (channel: string, callback: Function, options?: any) => () => void
    $off: (channel: string) => void
    $once: (channel: string, callback: Function) => void
  }
}

// 通用类型
export interface AsyncOperation<T = any> {
  loading: boolean
  error: Error | null
  data: T | null
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export interface StoreConfig {
  id: string
  state: () => Record<string, any>
  getters?: Record<string, Function>
  actions?: Record<string, Function>
  ipc?: Record<string, Function | { callback: Function; once?: boolean }>
}

// 组合函数类型
export interface UseAsyncOperationOptions {
  immediate?: boolean
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

export interface UseDebouncedOperationOptions {
  delay?: number
}

export interface UseThrottledOperationOptions {
  delay?: number
}

export interface UseCachedOperationOptions {
  ttl?: number
  maxSize?: number
  keyFn?: (...args: any[]) => string
}

export interface UseRetryOperationOptions {
  maxRetries?: number
  delay?: number
  backoff?: number
  retryIf?: (error: Error) => boolean
}

