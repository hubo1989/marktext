import path from 'path-browserify'
import equal from 'deep-equal'
import bus from '../bus'
import { hasKeys, getUniqueId, deepClone } from '../util'
import listToTree from '../util/listToTree'
import {
  createDocumentState,
  getOptionsFromState,
  getSingleFileState,
  getBlankFileState
} from './help'
import notice from '../services/notification'
import {
  FileEncodingCommand,
  LineEndingCommand,
  QuickOpenCommand,
  TrailingNewlineCommand
} from '../commands'
import { defineStore } from 'pinia'
import { usePreferencesStore } from './preferences'
import { useProjectStore } from './project'
import { useLayoutStore } from './layout'
import { useMainStore } from '.'

const autoSaveTimers = new Map()

export const useEditorStore = defineStore('editor', {
  state: () => ({
    currentFile: {},
    tabs: [],
    listToc: [], // Just use for deep equal check. and replace with new toc if needed.
    toc: []
  }),

  actions: {
    /**
     * Push a tab specific notification on stack that never disappears.
     */
    pushTabNotification(data) {
      const defaultAction = () => {}
      const { tabId, msg } = data
      const action = data.action || defaultAction
      const showConfirm = data.showConfirm || false
      const style = data.style || 'info'
      // Whether only one notification should exist.
      const exclusiveType = data.exclusiveType || ''

      const tab = this.tabs.find((t) => t.id === tabId)
      if (!tab) {
        console.error('pushTabNotification: Cannot find tab in tab list.')
        return
      }

      const { notifications } = tab

      // Remove the old notification if only one should exist.
      if (exclusiveType) {
        const index = notifications.findIndex((n) => n.exclusiveType === exclusiveType)
        if (index >= 0) {
          // Reorder current notification
          notifications.splice(index, 1)
        }
      }

      // Push new notification on stack.
      notifications.push({
        msg,
        showConfirm,
        style,
        exclusiveType,
        action
      })
    },

    loadChange(change) {
      const { tabs, currentFile } = this
      const { data, pathname } = change
      const {
        isMixedLineEndings,
        lineEnding,
        adjustLineEndingOnSave,
        trimTrailingNewline,
        encoding,
        markdown,
        filename
      } = data
      const options = { encoding, lineEnding, adjustLineEndingOnSave, trimTrailingNewline }
      // Create a new document and update few entires later.
      const newFileState = getSingleFileState({ markdown, filename, pathname, options })

      const tab = tabs.find((t) => window.fileUtils.isSamePathSync(t.pathname, pathname))
      if (!tab) {
        // The tab may be closed in the meanwhile.
        console.error('loadChange: Cannot find tab in tab list.')
        notice.notify({
          title: 'Error loading tab',
          message:
            'There was an error while loading the file change because the tab cannot be found.',
          type: 'error',
          time: 20000,
          showConfirm: false
        })
        return
      }

      // Backup few entries that we need to restore later.
      const oldId = tab.id
      const oldNotifications = tab.notifications
      let oldHistory = null
      if (tab.history.index >= 0 && tab.history.stack.length >= 1) {
        // Allow to restore the old document.
        oldHistory = {
          stack: [tab.history.stack[tab.history.index]],
          index: 0
        }

        // Free reference from array
        tab.history.index--
        tab.history.stack.pop()
      }

      // Update file content and restore some entries.
      Object.assign(tab, newFileState)
      tab.id = oldId
      tab.notifications = oldNotifications
      if (oldHistory) {
        tab.history = oldHistory
      }

      if (isMixedLineEndings) {
        this.pushTabNotification({
          tabId: tab.id,
          msg: `"${filename}" has mixed line endings which are automatically normalized to ${lineEnding.toUpperCase()}.`,
          showConfirm: false,
          style: 'info',
          exclusiveType: ''
        })
      }

      // Reload the editor if the tab is currently opened.
      if (pathname === currentFile.pathname) {
        this.currentFile = tab
        const { id, cursor, history } = tab
        bus.emit('file-changed', { id, markdown, cursor, renderCursor: true, history })
      }
    },

    FORMAT_LINK_CLICK({ data, dirname }) {
      window.electron.ipcRenderer.send('mt::format-link-click', { data, dirname })
    },

    LISTEN_SCREEN_SHOT() {
      window.electron.ipcRenderer.on('mt::screenshot-captured', () => {
        bus.emit('screenshot-captured')
      })
    },

    // image path auto complement
    ASK_FOR_IMAGE_AUTO_PATH(src) {
      const { pathname } = this.currentFile
      if (pathname) {
        let rs
        const promise = new Promise((resolve) => {
          rs = resolve
        })
        const id = getUniqueId()
        window.electron.ipcRenderer.once(`mt::response-of-image-path-${id}`, (_, files) => {
          rs(files)
        })
        window.electron.ipcRenderer.send('mt::ask-for-image-auto-path', {
          pathname,
          src,
          id,
          currentFile: deepClone(this.currentFile)
        })
        return promise
      } else {
        return Promise.resolve([])
      }
    },

    SEARCH(value) {
      this.currentFile.searchMatches = value
    },

    SHOW_IMAGE_DELETION_URL(deletionUrl) {
      notice
        .notify({
          title: 'Image deletion URL',
          message: `Click to copy the deletion URL of the uploaded image to the clipboard (${deletionUrl}).`,
          showConfirm: true,
          time: 20000
        })
        .then(() => {
          window.electron.clipboard.writeText(deletionUrl)
        })
    },

    // We need to update line endings menu when changing tabs.
    UPDATE_LINE_ENDING_MENU() {
      const { lineEnding } = this.currentFile
      if (lineEnding) {
        const { windowId } = global.marktext.env
        window.electron.ipcRenderer.send('mt::update-line-ending-menu', windowId, lineEnding)
      }
    },

    // need pass some data to main process when `save` menu item clicked
    LISTEN_FOR_SAVE() {
      const projectStore = useProjectStore()
      window.electron.ipcRenderer.on('mt::editor-ask-file-save', () => {
        const { id, filename, pathname, markdown } = this.currentFile
        const options = getOptionsFromState(this.currentFile)
        const defaultPath = getRootFolderFromState(projectStore)
        if (id) {
          window.electron.ipcRenderer.send(
            'mt::response-file-save',
            id,
            filename,
            pathname,
            markdown,
            deepClone(options),
            defaultPath
          )
        }
      })
    },

    // need pass some data to main process when `save as` menu item clicked
    LISTEN_FOR_SAVE_AS() {
      const projectStore = useProjectStore()
      window.electron.ipcRenderer.on('mt::editor-ask-file-save-as', () => {
        const { id, filename, pathname, markdown } = this.currentFile
        const options = getOptionsFromState(this.currentFile)
        const defaultPath = getRootFolderFromState(projectStore)

        if (id) {
          window.electron.ipcRenderer.send(
            'mt::response-file-save-as',
            id,
            filename,
            pathname,
            markdown,
            deepClone(options),
            defaultPath
          )
        }
      })
    },

    LISTEN_FOR_SET_PATHNAME() {
      window.electron.ipcRenderer.on('mt::set-pathname', (_, fileInfo) => {
        const { tabs } = this
        const { pathname, id } = fileInfo
        const tab = tabs.find((f) => f.id === id)
        if (!tab) {
          console.error('[ERROR] Cannot change file path from unknown tab.')
          return
        }

        // If a tab with the same file path already exists we need to close the tab.
        // The existing tab is overwritten by this tab.
        const existingTab = tabs.find(
          (t) => t.id !== id && window.fileUtils.isSamePathSync(t.pathname, pathname)
        )
        if (existingTab) {
          this.CLOSE_TAB(existingTab)
        }

        // SET_PATHNAME
        const { filename } = fileInfo
        if (id === this.currentFile.id && pathname) {
          window.DIRNAME = path.dirname(pathname)
        }
        if (tab) {
          Object.assign(tab, { filename, pathname, isSaved: true })
        }
      })

      window.electron.ipcRenderer.on('mt::tab-saved', (_, tabId) => {
        const tab = this.tabs.find((f) => f.id === tabId)
        if (tab) {
          tab.isSaved = true
        }
      })

      window.electron.ipcRenderer.on('mt::tab-save-failure', (_, tabId, msg) => {
        const tab = this.tabs.find((t) => t.id === tabId)
        if (!tab) {
          notice.notify({
            title: 'Save failure',
            message: msg,
            type: 'error',
            time: 20000,
            showConfirm: false
          })
          return
        }

        tab.isSaved = false
        this.pushTabNotification({
          tabId,
          msg: `There was an error while saving: ${msg}`,
          style: 'crit'
        })
      })
    },

    LISTEN_FOR_CLOSE() {
      window.electron.ipcRenderer.on('mt::ask-for-close', () => {
        const unsavedFiles = this.tabs
          .filter((file) => !file.isSaved)
          .map((file) => {
            const { id, filename, pathname, markdown } = file
            const options = getOptionsFromState(file)
            return { id, filename, pathname, markdown, options }
          })

        if (unsavedFiles.length) {
          window.electron.ipcRenderer.send('mt::close-window-confirm', deepClone(unsavedFiles))
        } else {
          window.electron.ipcRenderer.send('mt::close-window')
        }
      })
    },

    LISTEN_FOR_SAVE_CLOSE() {
      window.electron.ipcRenderer.on('mt::force-close-tabs-by-id', (_, tabIdList) => {
        if (Array.isArray(tabIdList) && tabIdList.length) {
          this.CLOSE_TABS(tabIdList)
        }
      })
    },

    ASK_FOR_SAVE_ALL(closeTabs) {
      const { tabs } = this
      const unsavedFiles = tabs
        .filter((file) => !(file.isSaved && /[^\n]/.test(file.markdown)))
        .map((file) => {
          const { id, filename, pathname, markdown } = file
          const options = getOptionsFromState(file)
          return { id, filename, pathname, markdown, options }
        })

      if (closeTabs) {
        if (unsavedFiles.length) {
          this.CLOSE_TABS(tabs.filter((f) => f.isSaved).map((f) => f.id))
          window.electron.ipcRenderer.send('mt::save-and-close-tabs', deepClone(unsavedFiles))
        } else {
          this.CLOSE_TABS(tabs.map((f) => f.id))
        }
      } else {
        window.electron.ipcRenderer.send('mt::save-tabs', deepClone(unsavedFiles))
      }
    },

    LISTEN_FOR_MOVE_TO() {
      const projectStore = useProjectStore()
      window.electron.ipcRenderer.on('mt::editor-move-file', () => {
        const { id, filename, pathname, markdown } = this.currentFile
        const options = getOptionsFromState(this.currentFile)
        const defaultPath = getRootFolderFromState(projectStore)
        if (!id) return
        if (!pathname) {
          // if current file is a newly created file, just save it!
          window.electron.ipcRenderer.send(
            'mt::response-file-save',
            id,
            filename,
            pathname,
            markdown,
            deepClone(options),
            defaultPath
          )
        } else {
          // if not, move to a new(maybe) folder
          window.electron.ipcRenderer.send('mt::response-file-move-to', { id, pathname })
        }
      })
    },

    LISTEN_FOR_RENAME() {
      window.electron.ipcRenderer.on('mt::editor-rename-file', () => {
        this.RESPONSE_FOR_RENAME()
      })
    },

    RESPONSE_FOR_RENAME() {
      const projectStore = useProjectStore()
      const { id, filename, pathname, markdown } = this.currentFile
      const options = getOptionsFromState(this.currentFile)
      const defaultPath = getRootFolderFromState(projectStore)
      if (!id) return
      if (!pathname) {
        // if current file is a newly created file, just save it!
        window.electron.ipcRenderer.send(
          'mt::response-file-save',
          id,
          filename,
          pathname,
          markdown,
          deepClone(options),
          defaultPath
        )
      } else {
        bus.emit('rename')
      }
    },

    // ask for main process to rename this file to a new name `newFilename`
    RENAME(newFilename) {
      const { id, pathname, filename } = this.currentFile
      if (typeof filename === 'string' && filename !== newFilename) {
        const newPathname = path.join(path.dirname(pathname), newFilename)
        window.electron.ipcRenderer.send('mt::rename', {
          id,
          pathname,
          newPathname,
          currentFile: deepClone(this.currentFile)
        })
      }
    },

    UPDATE_CURRENT_FILE(currentFile) {
      const oldCurrentFile = this.currentFile
      if (!oldCurrentFile.id || oldCurrentFile.id !== currentFile.id) {
        const { id, markdown, cursor, history, pathname } = currentFile
        window.DIRNAME = pathname ? path.dirname(pathname) : ''
        this.currentFile = currentFile
        bus.emit('file-changed', { id, markdown, cursor, renderCursor: true, history })
      }

      if (!this.tabs.some((file) => file.id === currentFile.id)) {
        this.tabs.push(currentFile)
      }
      this.UPDATE_LINE_ENDING_MENU()
    },

    // This events are only used during window creation.
    LISTEN_FOR_BOOTSTRAP_WINDOW() {
      const preferencesStore = usePreferencesStore()
      const layoutStore = useLayoutStore()
      const projectStore = useProjectStore()
      const mainStore = useMainStore()

      // Delay load runtime commands and initialize commands.
      setTimeout(() => {
        bus.emit('cmd::register-command', new FileEncodingCommand(this))
        bus.emit(
          'cmd::register-command',
          new QuickOpenCommand({
            editor: this,
            preferences: preferencesStore,
            project: projectStore
          })
        )
        bus.emit('cmd::register-command', new LineEndingCommand(this))
        bus.emit('cmd::register-command', new TrailingNewlineCommand(this))

        setTimeout(() => {
          window.electron.ipcRenderer.send('mt::request-keybindings')
          bus.emit('cmd::sort-commands')
        }, 100)
      }, 400)

      window.electron.ipcRenderer.on('mt::bootstrap-editor', (_, config) => {
        const {
          addBlankTab,
          markdownList,
          lineEnding,
          sideBarVisibility,
          tabBarVisibility,
          sourceCodeModeEnabled
        } = config

        window.electron.ipcRenderer.send('mt::window-initialized')
        mainStore.SET_INITIALIZED()
        preferencesStore.SET_USER_PREFERENCE({ endOfLine: lineEnding })
        layoutStore.SET_LAYOUT({
          rightColumn: 'files',
          showSideBar: !!sideBarVisibility,
          showTabBar: !!tabBarVisibility
        })
        layoutStore.DISPATCH_LAYOUT_MENU_ITEMS()
        preferencesStore.SET_MODE({
          type: 'sourceCode',
          checked: !!sourceCodeModeEnabled
        })

        if (addBlankTab) {
          this.NEW_UNTITLED_TAB({ selected: true })
        } else if (markdownList.length) {
          let isFirst = true
          for (const markdown of markdownList) {
            this.NEW_UNTITLED_TAB({ markdown, selected: isFirst })
            isFirst = false
          }
        }
      })
    },

    // Open a new tab, optionally with content.
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
          const { id, markdown, cursor, history, pathname } = fileState
          window.DIRNAME = pathname ? path.dirname(pathname) : ''
          bus.emit('file-changed', { id, markdown, cursor, renderCursor: true, history })
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
          const { id, markdown, cursor, history, pathname } = this.currentFile
          window.DIRNAME = pathname ? path.dirname(pathname) : ''
          bus.emit('file-changed', { id, markdown, cursor, renderCursor: true, history })
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

    // Direction is a boolean where false is left and true right.
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

    /**
     * Create a new untitled tab optional from a markdown string.
     *
     * @param {*} _ The store context - not used.
     * @param {{markdown?: string, selected?: boolean}} obj Optional markdown string
     * and whether the tab should become the selected tab (true if not set).
     */
    NEW_UNTITLED_TAB({ markdown: markdownString, selected }) {
      if (selected == null) {
        selected = true
      }

      this.SHOW_TAB_VIEW(false)

      const preferencesStore = usePreferencesStore()
      const { defaultEncoding, endOfLine } = preferencesStore
      const fileState = getBlankFileState(this.tabs, defaultEncoding, endOfLine, markdownString)

      if (selected) {
        const { id, markdown } = fileState
        this.UPDATE_CURRENT_FILE(fileState)
        bus.emit('file-loaded', { id, markdown })
      } else {
        this.tabs.push(fileState)
      }
    },

    /**
     * Create a new tab from the given markdown document.
     *
     * @param {*} _ The store context - not used.
     * @param {{markdownDocument: IMarkdownDocumentRaw, selected?: boolean}} obj The markdown document
     * and optional whether the tab should become the selected tab (true if not set).
     */
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
        this.pushTabNotification({
          tabId: id,
          msg: `${filename}" has mixed line endings which are automatically normalized to ${lineEnding.toUpperCase()}.`
        })
      }
    },

    SHOW_TAB_VIEW(always) {
      const { tabs } = this
      const layoutStore = useLayoutStore()
      if (always || tabs.length === 1) {
        layoutStore.SET_LAYOUT({ showTabBar: true })
        layoutStore.DISPATCH_LAYOUT_MENU_ITEMS()
      }
    },

    // Content change from realtime preview editor and source code editor
    LISTEN_FOR_CONTENT_CHANGE({ id, markdown, wordCount, cursor, history, toc }) {
      const preferencesStore = usePreferencesStore()
      const { autoSave } = preferencesStore
      const {
        id: currentId,
        filename,
        pathname,
        markdown: oldMarkdown,
        trimTrailingNewline
      } = this.currentFile

      if (!id) {
        throw new Error('Listen for document change but id was not set!')
      } else if (!currentId || this.tabs.length === 0) {
        return
      } else if (id !== 'muya' && currentId !== id) {
        for (const tab of this.tabs) {
          if (tab.id && tab.id === id) {
            tab.markdown = adjustTrailingNewlines(markdown, tab.trimTrailingNewline)
            if (cursor) tab.cursor = cursor
            if (history) tab.history = history
            break
          }
        }
        return
      }

      markdown = adjustTrailingNewlines(markdown, trimTrailingNewline)
      this.currentFile.markdown = markdown

      if (oldMarkdown.length === 0 && markdown.length === 1 && markdown[0] === '\n') {
        return
      }

      if (wordCount) this.currentFile.wordCount = wordCount
      if (cursor) this.currentFile.cursor = cursor
      if (history) this.currentFile.history = history
      if (toc && !equal(toc, this.listToc)) {
        this.listToc = toc
        this.toc = listToTree(toc)
      }

      if (markdown !== oldMarkdown) {
        this.currentFile.isSaved = false
        if (pathname && autoSave) {
          const options = getOptionsFromState(this.currentFile)
          this.HANDLE_AUTO_SAVE({
            id: currentId,
            filename,
            pathname,
            markdown,
            options
          })
        }
      }
    },

    HANDLE_AUTO_SAVE({ id, filename, pathname, markdown, options }) {
      if (!id || !pathname) {
        throw new Error('HANDLE_AUTO_SAVE: Invalid tab.')
      }

      const preferencesStore = usePreferencesStore()
      const projectStore = useProjectStore()
      const { autoSaveDelay } = preferencesStore

      if (autoSaveTimers.has(id)) {
        const timer = autoSaveTimers.get(id)
        clearTimeout(timer)
        autoSaveTimers.delete(id)
      }

      const timer = setTimeout(() => {
        autoSaveTimers.delete(id)

        const tab = this.tabs.find((t) => t.id === id)
        if (tab && !tab.isSaved) {
          const defaultPath = getRootFolderFromState(projectStore)
          window.electron.ipcRenderer.send(
            'mt::response-file-save',
            id,
            filename,
            pathname,
            markdown,
            deepClone(options),
            defaultPath
          )
        }
      }, autoSaveDelay)
      autoSaveTimers.set(id, timer)
    },

    SELECTION_CHANGE(changes) {
      const { start, end } = changes
      if (start.key === end.key && start.block.text) {
        const value = start.block.text.substring(start.offset, end.offset)
        this.currentFile.searchMatches = {
          matches: [],
          index: -1,
          value
        }
      }

      const { windowId } = global.marktext.env
      window.electron.ipcRenderer.send(
        'mt::editor-selection-changed',
        windowId,
        createApplicationMenuState(changes)
      )
    },

    SELECTION_FORMATS(formats) {
      const { windowId } = global.marktext.env
      window.electron.ipcRenderer.send(
        'mt::update-format-menu',
        windowId,
        createSelectionFormatState(formats)
      )
    },

    EXPORT({ type, content, pageOptions }) {
      if (!hasKeys(this.currentFile)) return

      let title = ''
      const { listToc } = this
      if (listToc && listToc.length > 0) {
        let headerRef = listToc[0]
        const len = Math.min(listToc.length, 6)
        for (let i = 1; i < len; ++i) {
          if (headerRef.lvl === 1) break
          const header = listToc[i]
          if (headerRef.lvl > header.lvl) {
            headerRef = header
          }
        }
        title = headerRef.content
      }

      const { filename, pathname } = this.currentFile
      window.electron.ipcRenderer.send('mt::response-export', {
        type,
        title,
        content,
        filename,
        pathname,
        pageOptions
      })
    },

    LINTEN_FOR_EXPORT_SUCCESS() {
      window.electron.ipcRenderer.on('mt::export-success', (_, { filePath }) => {
        notice
          .notify({
            title: 'Exported successfully',
            message: `Exported "${path.basename(filePath)}" successfully!`,
            showConfirm: true
          })
          .then(() => {
            window.electron.shell.showItemInFolder(filePath)
          })
      })
    },

    PRINT_RESPONSE() {
      window.electron.ipcRenderer.send('mt::response-print')
    },

    LINTEN_FOR_PRINT_SERVICE_CLEARUP() {
      window.electron.ipcRenderer.on('mt::print-service-clearup', () => {
        bus.emit('print-service-clearup')
      })
    },

    LINTEN_FOR_SET_LINE_ENDING() {
      window.electron.ipcRenderer.on('mt::set-line-ending', (_, lineEnding) => {
        const { lineEnding: oldLineEnding } = this.currentFile
        if (lineEnding !== oldLineEnding) {
          this.currentFile.lineEnding = lineEnding
          this.currentFile.adjustLineEndingOnSave = lineEnding !== 'lf'
          this.currentFile.isSaved = true
          this.UPDATE_LINE_ENDING_MENU()
        }
      })
    },

    LINTEN_FOR_SET_ENCODING() {
      window.electron.ipcRenderer.on('mt::set-file-encoding', (_, encodingName) => {
        const { encoding } = this.currentFile.encoding
        if (encoding !== encodingName) {
          this.currentFile.encoding.encoding = encodingName
          this.currentFile.encoding.isBom = false
          this.currentFile.isSaved = true
        }
      })
    },

    LINTEN_FOR_SET_FINAL_NEWLINE() {
      window.electron.ipcRenderer.on('mt::set-final-newline', (_, value) => {
        const { trimTrailingNewline } = this.currentFile
        if (trimTrailingNewline !== value) {
          this.currentFile.trimTrailingNewline = value
          this.currentFile.isSaved = true
        }
      })
    },

    LISTEN_FOR_FILE_CHANGE() {
      const preferencesStore = usePreferencesStore()
      window.electron.ipcRenderer.on('mt::update-file', (_, { type, change }) => {
        const { tabs } = this
        const { pathname } = change
        const tab = tabs.find((t) => window.fileUtils.isSamePathSync(t.pathname, pathname))
        if (tab) {
          const { id, isSaved, filename } = tab
          switch (type) {
            case 'unlink': {
              tab.isSaved = false
              this.pushTabNotification({
                tabId: id,
                msg: `"${filename}" has been removed on disk.`,
                style: 'warn',
                showConfirm: false,
                exclusiveType: 'file_changed'
              })
              break
            }
            case 'add':
            case 'change': {
              const { autoSave } = preferencesStore
              if (autoSave) {
                if (autoSaveTimers.has(id)) {
                  const timer = autoSaveTimers.get(id)
                  clearTimeout(timer)
                  autoSaveTimers.delete(id)
                }

                if (isSaved) {
                  this.loadChange(change)
                  return
                }
              }

              tab.isSaved = false
              this.pushTabNotification({
                tabId: id,
                msg: `"${filename}" has been changed on disk. Do you want to reload it?`,
                showConfirm: true,
                exclusiveType: 'file_changed',
                action: (status) => {
                  if (status) {
                    this.loadChange(change)
                  }
                }
              })
              break
            }
            default:
              console.error(`LISTEN_FOR_FILE_CHANGE: Invalid type "${type}"`)
          }
        } else {
          console.error(`LISTEN_FOR_FILE_CHANGE: Cannot find tab for path "${pathname}".`)
        }
      })
    },

    ASK_FOR_IMAGE_PATH() {
      return window.electron.ipcRenderer.sendSync('mt::ask-for-image-path')
    },

    LISTEN_WINDOW_ZOOM() {
      const preferencesStore = usePreferencesStore()
      window.electron.ipcRenderer.on('mt::window-zoom', (_, zoomFactor) => {
        zoomFactor = Number.parseFloat(zoomFactor.toFixed(3))
        const { zoom } = preferencesStore
        if (zoom !== zoomFactor) {
          preferencesStore.setSinglePreference({ type: 'zoom', value: zoomFactor })
        }
        window.electron.webFrame.setZoomFactor(zoomFactor)
      })
    },

    LISTEN_FOR_RELOAD_IMAGES() {
      window.electron.ipcRenderer.on('mt::invalidate-image-cache', () => {
        bus.emit('invalidate-image-cache')
      })
    },

    LISTEN_FOR_CONTEXT_MENU() {
      // General context menu
      window.electron.ipcRenderer.on('mt::cm-copy-as-markdown', () => {
        bus.emit('copyAsMarkdown', 'copyAsMarkdown')
      })
      window.electron.ipcRenderer.on('mt::cm-copy-as-html', () => {
        bus.emit('copyAsHtml', 'copyAsHtml')
      })
      window.electron.ipcRenderer.on('mt::cm-paste-as-plain-text', () => {
        bus.emit('pasteAsPlainText', 'pasteAsPlainText')
      })
      window.electron.ipcRenderer.on('mt::cm-insert-paragraph', (_, location) => {
        bus.emit('insertParagraph', location)
      })

      // Spelling
      window.electron.ipcRenderer.on('mt::spelling-replace-misspelling', (_, info) => {
        bus.emit('replace-misspelling', info)
      })
      window.electron.ipcRenderer.on('mt::spelling-show-switch-language', () => {
        bus.emit('open-command-spellchecker-switch-language')
      })
    }
  }
})

// ----------------------------------------------------------------------------

/**
 * Return the opened root folder or an empty string.
 *
 * @param {object} projectStore The project store instance.
 */
const getRootFolderFromState = (projectStore) => {
  const openedFolder = projectStore.projectTree
  if (openedFolder) {
    return openedFolder.pathname
  }
  return ''
}

/**
 * Trim the final newlines according `trimTrailingNewlineOption`.
 *
 * @param {string} markdown The text to trim.
 * @param {*} trimTrailingNewlineOption The option how we should trim the final newlines.
 */
const adjustTrailingNewlines = (markdown, trimTrailingNewlineOption) => {
  if (!markdown) {
    return ''
  }

  switch (trimTrailingNewlineOption) {
    // Trim trailing newlines.
    case 0: {
      return trimTrailingNewlines(markdown)
    }
    // Ensure single trailing newline.
    case 1: {
      // Muya will always add a final new line to the markdown text. Check first whether
      // only one newline exist to prevent copying the string.
      const lastIndex = markdown.length - 1
      if (markdown[lastIndex] === '\n') {
        if (markdown.length === 1) {
          // Just return nothing because adding a final new line makes no sense.
          return ''
        } else if (markdown[lastIndex - 1] !== '\n') {
          return markdown
        }
      }

      // Otherwise trim trailing newlines and add one.
      markdown = trimTrailingNewlines(markdown)
      if (markdown.length === 0) {
        // Just return nothing because adding a final new line makes no sense.
        return ''
      }
      return markdown + '\n'
    }
    // Disabled, use text as it is.
    default:
      return markdown
  }
}

/**
 * Trim trailing newlines from `text`.
 *
 * @param {string} text The text to trim.
 */
const trimTrailingNewlines = (text) => {
  return text.replace(/[\r?\n]+$/, '')
}

/**
 * Creates a object that contains the application menu state.
 *
 * @param {*} selection The selection.
 * @returns A object that represents the application menu state.
 */
const createApplicationMenuState = ({ start, end, affiliation }) => {
  const state = {
    isDisabled: false,
    // Whether multiple lines are selected.
    isMultiline: start.key !== end.key,
    // List information - a list must be selected.
    isLooseListItem: false,
    isTaskList: false,
    // Whether the selection is code block like (math, html or code block).
    isCodeFences: false,
    // Whether a code block line is selected.
    isCodeContent: false,
    // Whether the selection contains a table.
    isTable: false,
    // Contains keys about the selection type(s) (string, boolean) like "ul: true".
    affiliation: {}
  }
  const { isMultiline } = state

  // Get code block information from selection.
  if (
    (start.block.functionType === 'cellContent' && end.block.functionType === 'cellContent') ||
    (start.type === 'span' && start.block.functionType === 'codeContent') ||
    (end.type === 'span' && end.block.functionType === 'codeContent')
  ) {
    // A code block like block is selected (code, math, ...).
    state.isCodeFences = true

    // A code block line is selected.
    if (start.block.functionType === 'codeContent' || end.block.functionType === 'codeContent') {
      state.isCodeContent = true
    }
  }

  // Query list information.
  if (affiliation.length >= 1 && /ul|ol/.test(affiliation[0].type)) {
    const listBlock = affiliation[0]
    state.affiliation[listBlock.type] = true
    state.isLooseListItem = listBlock.children[0].isLooseListItem
    state.isTaskList = listBlock.listType === 'task'
  } else if (affiliation.length >= 3 && affiliation[1].type === 'li') {
    const listItem = affiliation[1]
    const listType = listItem.listItemType === 'order' ? 'ol' : 'ul'
    state.affiliation[listType] = true
    state.isLooseListItem = listItem.isLooseListItem
    state.isTaskList = listItem.listItemType === 'task'
  }

  // Search with block depth 3 (e.g. "ul -> li -> p" where p is the actually paragraph inside the list (item)).
  for (const b of affiliation.slice(0, 3)) {
    if (b.type === 'pre' && b.functionType) {
      if (/frontmatter|html|multiplemath|code$/.test(b.functionType)) {
        state.isCodeFences = true
        state.affiliation[b.functionType] = true
      }
      break
    } else if (b.type === 'figure' && b.functionType) {
      if (b.functionType === 'table') {
        state.isTable = true
        state.isDisabled = true
      }
      break
    } else if (isMultiline && /^h{1,6}$/.test(b.type)) {
      // Multiple block elements are selected.
      state.affiliation = {}
      break
    } else {
      if (!state.affiliation[b.type]) {
        state.affiliation[b.type] = true
      }
    }
  }

  // Clean up
  if (Object.getOwnPropertyNames(state.affiliation).length >= 2 && state.affiliation.p) {
    delete state.affiliation.p
  }
  if ((state.affiliation.ul || state.affiliation.ol) && state.affiliation.li) {
    delete state.affiliation.li
  }
  return state
}

/**
 * Creates a object that contains the formats selection state.
 *
 * @param {*} formats The selection formats.
 * @returns A object that represents the formats menu state.
 */
const createSelectionFormatState = (formats) => {
  const state = {}
  for (const item of formats) {
    state[item.type] = true
  }
  return state
}
