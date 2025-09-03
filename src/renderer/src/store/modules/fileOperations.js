import { deepClone } from '../../util'
import { getOptionsFromState } from '../help'
import { usePreferencesStore } from '../preferences'
import { useProjectStore } from '../project'
import bus from '../../bus'

// Helper function for getting root folder
const getRootFolderFromState = (projectStore) => {
  const openedFolder = projectStore.projectTree
  if (openedFolder) {
    return openedFolder.pathname
  }
  return ''
}

export default {
  // Save operations
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

  // Move operations
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

  // Rename operations
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

  RENAME(newFilename) {
    const { id, pathname, filename } = this.currentFile
    if (typeof filename === 'string' && filename !== newFilename) {
      const newPathname = window.path.join(window.path.dirname(pathname), newFilename)
      window.electron.ipcRenderer.send('mt::rename', {
        id,
        pathname,
        newPathname,
        currentFile: deepClone(this.currentFile)
      })
    }
  },

  // Auto save functionality
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

  SET_SAVE_STATUS_WHEN_REMOVE({ pathname }) {
    this.tabs.forEach((f) => {
      if (f.pathname === pathname) {
        f.isSaved = false
      }
    })
  }
}
