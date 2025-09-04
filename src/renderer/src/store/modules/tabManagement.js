// 环境检测工具函数
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV
}

// 开发环境专用日志函数
const devLog = (...args) => {
  if (isDevelopment()) {
    console.log(...args)
  }
}

import { hasKeys, deepClone } from '../../util'
import { getBlankFileState, createDocumentState, getOptionsFromState } from '../help'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import { usePreferencesStore } from '../preferences'
import { useLayoutStore } from '../layout'
import { i18n } from '../../i18n'
import notice from '../../services/notification'
import bus from '../../bus'
import { getUniqueId } from '../../util'

const autoSaveTimers = new Map()

export default {
  // Tab lifecycle management
  LISTEN_FOR_NEW_TAB() {
    window.electron.ipcRenderer.on(
      'mt::open-new-tab',
      (_, markdownDocument, options = {}, selected = true) => {
        if (markdownDocument) {
          // Create tab with content.
          this.NEW_TAB_WITH_CONTENT({ markdownDocument, options, selected })
        } else {
          // Fallback: create a blank tab and always select it
          this.NEW_UNTITLED_TAB({})
        }
      }
    )

    window.electron.ipcRenderer.on(
      'mt::new-untitled-tab',
      (_, selected = true, markdown = '') => {
        // Create a blank tab
        this.NEW_UNTITLED_TAB({ markdown, selected })
      }
    )
  },

  LISTEN_FOR_CLOSE_TAB() {
    window.electron.ipcRenderer.on('mt::editor-close-tab', () => {
      const file = this.currentFile
      if (!hasKeys(file)) return
      this.CLOSE_TAB(file)
    })
  },

  LISTEN_FOR_TAB_CYCLE() {
    window.electron.ipcRenderer.on('mt::tabs-cycle-left', () => {
      this.CYCLE_TABS(false)
    })
    window.electron.ipcRenderer.on('mt::tabs-cycle-right', () => {
      this.CYCLE_TABS(true)
    })
  },

  LISTEN_FOR_SWITCH_TABS() {
    window.electron.ipcRenderer.on('mt::switch-tab-by-index', (_, index) => {
      this.SWITCH_TAB_BY_INDEX(index)
    })
  },

  // Tab operations
  CLOSE_TAB(file) {
    if (file.isSaved) {
      this.FORCE_CLOSE_TAB(file)
    } else {
      this.CLOSE_UNSAVED_TAB(file)
    }
  },

  FORCE_CLOSE_TAB(file) {
    const { tabs, currentFile } = this
    const index = tabs.findIndex((t) => t.id === file.id)
    if (index > -1) {
      tabs.splice(index, 1)
    }

    if (file.id && autoSaveTimers.has(file.id)) {
      const timer = autoSaveTimers.get(file.id)
      clearTimeout(timer)
      autoSaveTimers.delete(file.id)
    }

    if (file.id === currentFile.id) {
      const fileState = this.tabs[index] || this.tabs[index - 1] || this.tabs[0] || {}
      this.currentFile = fileState
      if (typeof fileState.markdown === 'string') {
        const { id, markdown, cursor, history, pathname, scrollTop, blocks } = fileState
        window.DIRNAME = pathname ? window.path.dirname(pathname) : ''
        bus.emit('file-changed', {
          id,
          markdown,
          cursor,
          renderCursor: true,
          history,
          scrollTop,
          blocks
        })
      } else {
        window.DIRNAME = ''
      }
    }

    if (this.tabs.length === 0) {
      this.listToc = []
      this.toc = []
    }

    const { pathname } = file
    if (pathname) {
      window.electron.ipcRenderer.send('mt::window-tab-closed', pathname)
    }
  },

  CLOSE_UNSAVED_TAB(file) {
    const { id, pathname, filename, markdown } = file
    const options = getOptionsFromState(file)
    window.electron.ipcRenderer.send('mt::save-and-close-tabs', [
      { id, pathname, filename, markdown, options: deepClone(options) }
    ])
  },

  CLOSE_OTHER_TABS(file) {
    this.tabs
      .filter((f) => f.id !== file.id)
      .forEach((tab) => {
        this.CLOSE_TAB(tab)
      })
  },

  CLOSE_SAVED_TABS() {
    this.tabs
      .filter((f) => f.isSaved)
      .forEach((tab) => {
        this.CLOSE_TAB(tab)
      })
  },

  CLOSE_ALL_TABS() {
    this.tabs.slice().forEach((tab) => {
      this.CLOSE_TAB(tab)
    })
  },

  CLOSE_TABS(tabIdList) {
    if (!tabIdList || tabIdList.length === 0) return

    let tabIndex = 0
    tabIdList.forEach((id) => {
      const index = this.tabs.findIndex((f) => f.id === id)
      if (index === -1) return

      const { pathname } = this.tabs[index]

      if (pathname) {
        window.electron.ipcRenderer.send('mt::window-tab-closed', pathname)
      }

      this.tabs.splice(index, 1)
      if (this.currentFile.id === id) {
        this.currentFile = {}
        window.DIRNAME = ''
        if (tabIdList.length === 1) {
          tabIndex = index
        }
      }
    })

    if (!this.currentFile.id && this.tabs.length > 0) {
      this.currentFile = this.tabs[tabIndex] || this.tabs[tabIndex - 1] || this.tabs[0] || {}
      if (typeof this.currentFile.markdown === 'string') {
        const { id, markdown, cursor, history, pathname, scrollTop, blocks } = this.currentFile
        window.DIRNAME = pathname ? window.path.dirname(pathname) : ''
        bus.emit('file-changed', {
          id,
          markdown,
          cursor,
          renderCursor: true,
          history,
          scrollTop,
          blocks
        })
      }
    }

    if (this.tabs.length === 0) {
      this.listToc = []
      this.toc = []
    }
  },

  EXCHANGE_TABS_BY_ID(tabIDs) {
    const { fromId, toId } = tabIDs
    const { tabs } = this
    const moveItem = (arr, from, to) => {
      if (from === to) return true
      const len = arr.length
      const item = arr.splice(from, 1)
      if (item.length === 0) return false

      arr.splice(to, 0, item[0])
      return arr.length === len
    }

    const fromIndex = tabs.findIndex((t) => t.id === fromId)
    if (fromIndex === -1) return

    if (!toId) {
      moveItem(tabs, fromIndex, tabs.length - 1)
    } else {
      const toIndex = tabs.findIndex((t) => t.id === toId)
      if (toIndex === -1) return
      const realToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
      moveItem(tabs, fromIndex, realToIndex)
    }
  },

  RENAME_FILE(file) {
    this.UPDATE_CURRENT_FILE(file)
    bus.emit('rename')
  },

  // Tab navigation
  CYCLE_TABS(direction) {
    const { tabs, currentFile } = this
    if (tabs.length <= 1) {
      return
    }

    const currentIndex = tabs.findIndex((t) => t.id === currentFile.id)
    if (currentIndex === -1) {
      console.error('CYCLE_TABS: Cannot find current tab index.')
      return
    }

    let nextTabIndex = 0
    if (!direction) {
      // Switch tab to the left.
      nextTabIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
    } else {
      // Switch tab to the right.
      nextTabIndex = (currentIndex + 1) % tabs.length
    }

    const nextTab = tabs[nextTabIndex]
    if (!nextTab || !nextTab.id) {
      console.error(`CYCLE_TABS: Cannot find next tab (index="${nextTabIndex}").`)
      return
    }

    this.UPDATE_CURRENT_FILE(nextTab)
  },

  SWITCH_TAB_BY_INDEX(nextTabIndex) {
    const { tabs, currentFile } = this
    if (nextTabIndex < 0 || nextTabIndex >= tabs.length) {
      console.warn('Invalid tab index:', nextTabIndex)
      return
    }

    const currentIndex = tabs.findIndex((t) => t.id === currentFile.id)
    if (currentIndex === -1) {
      console.error('Cannot find current tab index.')
      return
    }

    const nextTab = tabs[nextTabIndex]
    if (!nextTab || !nextTab.id) {
      console.error(`Cannot find tab by index="${nextTabIndex}".`)
      return
    }
    this.UPDATE_CURRENT_FILE(nextTab)
  },

  // Tab creation
  NEW_UNTITLED_TAB({ markdown: markdownString, selected }) {
    if (selected == null) {
      selected = true
    }

    devLog('🔥 [NEW_UNTITLED_TAB] Called with selected:', selected)
    devLog('🔥 [NEW_UNTITLED_TAB] Current tabs before:', this.tabs)
    devLog('🔥 [NEW_UNTITLED_TAB] Current tabs length:', this.tabs.length)

    this.SHOW_TAB_VIEW(false)

    const preferencesStore = usePreferencesStore()
    const { defaultEncoding, endOfLine } = preferencesStore
    const fileState = getBlankFileState(this.tabs, defaultEncoding, endOfLine, markdownString)

    devLog('🔥 [NEW_UNTITLED_TAB] Created fileState:', {
      id: fileState.id,
      filename: fileState.filename,
      isSaved: fileState.isSaved
    })

    if (selected) {
      const { id, markdown } = fileState
      devLog('🔥 [NEW_UNTITLED_TAB] Selected=true, calling UPDATE_CURRENT_FILE')

      // 强制触发响应式更新
      const oldTabsLength = this.tabs.length
      this.UPDATE_CURRENT_FILE(fileState)

      devLog('🔥 [NEW_UNTITLED_TAB] After UPDATE_CURRENT_FILE:')
      devLog('🔥 [NEW_UNTITLED_TAB] - currentFile:', this.currentFile)
      devLog('🔥 [NEW_UNTITLED_TAB] - tabs length changed:', oldTabsLength, '->', this.tabs.length)
      devLog('🔥 [NEW_UNTITLED_TAB] - tabs content:', this.tabs)

      // 确保 Vue 响应式系统有时间更新
      nextTick(() => {
        devLog('🔥 [NEW_UNTITLED_TAB] After nextTick:')
        devLog('🔥 [NEW_UNTITLED_TAB] - tabs length:', this.tabs.length)
        devLog('🔥 [NEW_UNTITLED_TAB] - current tabs:', this.tabs)
      })

      bus.emit('file-loaded', { id, markdown })
      devLog('🔥 [NEW_UNTITLED_TAB] Emitted file-loaded event for id:', id)
    } else {
      devLog('🔥 [NEW_UNTITLED_TAB] Selected=false, pushing to tabs array')
      this.tabs.push(fileState)
      devLog('🔥 [NEW_UNTITLED_TAB] After push, tabs length:', this.tabs.length)
    }
  },

  NEW_TAB_WITH_CONTENT({ markdownDocument, options = {}, selected }) {
    if (!markdownDocument) {
      console.warn('Cannot create a file tab without a markdown document!')
      this.NEW_UNTITLED_TAB({})
      return
    }

    if (typeof selected === 'undefined') {
      selected = true
    }

    const { currentFile, tabs } = this
    const { pathname } = markdownDocument
    const existingTab = tabs.find((t) => window.fileUtils.isSamePathSync(t.pathname, pathname))
    if (existingTab) {
      this.UPDATE_CURRENT_FILE(existingTab)
      return
    }

    let keepTabBarState = false
    if (currentFile) {
      const { isSaved, pathname } = currentFile
      if (isSaved && !pathname) {
        keepTabBarState = true
        this.FORCE_CLOSE_TAB(currentFile)
      }
    }

    if (!keepTabBarState) {
      this.SHOW_TAB_VIEW(false)
    }

    const { markdown, isMixedLineEndings } = markdownDocument
    const docState = createDocumentState(Object.assign(markdownDocument, options))
    const { id, cursor } = docState

    if (selected) {
      this.UPDATE_CURRENT_FILE(docState)
      bus.emit('file-loaded', { id, markdown, cursor })
    } else {
      this.tabs.push(docState)
    }

    if (isMixedLineEndings) {
      const { filename, lineEnding } = markdownDocument
      // Note: pushTabNotification should be called from the main store
      console.warn('Mixed line endings detected, notification should be handled by main store')
    }
  },

  SHOW_TAB_VIEW(always) {
    const { tabs } = this
    const layoutStore = useLayoutStore()
    if (always || tabs.length === 1) {
      layoutStore.SET_LAYOUT({ showTabBar: true })
      layoutStore.DISPATCH_LAYOUT_MENU_ITEMS()
    }
  }
}
