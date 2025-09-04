// 环境检测工具函数
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV
}

// 开发环境专用日志函数
const devLog = (...args) => {
  if (isDevelopment()) {
    devLog(...args)
  }
}

import { defineStore } from 'pinia'
import { addFile, unlinkFile, addDirectory, unlinkDirectory } from './treeCtrl'
import bus from '../bus'
import { create, paste, rename } from '../util/fileSystem'
import { PATH_SEPARATOR } from '../config'
import notice from '../services/notification'
import { getFileStateFromData } from './help'
import { useLayoutStore } from './layout'
import { useEditorStore } from './editor'

export const useProjectStore = defineStore('project', {
  state: () => ({
    activeItem: {},
    createCache: {},
    // Use to cache newly created filename, for open immediately.
    newFileNameCache: '',
    renameCache: null,
    clipboard: null,
    projectTree: null
  }),

  actions: {
    LISTEN_FOR_LOAD_PROJECT() {
      const layoutStore = useLayoutStore()
      window.electron.ipcRenderer.on('mt::open-directory', (e, pathname) => {
        let name = window.path.basename(pathname)
        if (!name) {
          // Root directory such as "/" or "C:\"
          name = pathname
        }

        this.projectTree = {
          // Root full path
          pathname: window.path.normalize(pathname),
          // Root directory name
          name,
          isDirectory: true,
          isFile: false,
          isMarkdown: false,
          folders: [],
          files: []
        }
        const layout = {
          rightColumn: 'files',
          showSideBar: true,
          showTabBar: true
        }
        layoutStore.SET_LAYOUT(layout)
        layoutStore.DISPATCH_LAYOUT_MENU_ITEMS()
      })
    },

    LISTEN_FOR_UPDATE_PROJECT() {
      const editorStore = useEditorStore()
      window.electron.ipcRenderer.on('mt::update-object-tree', (e, { type, change }) => {
        switch (type) {
          case 'add': {
            const { pathname, data, isMarkdown } = change
            addFile(this.projectTree, change)
            if (isMarkdown && this.newFileNameCache && pathname === this.newFileNameCache) {
              const fileState = getFileStateFromData(data)
              editorStore.UPDATE_CURRENT_FILE(fileState)
              this.newFileNameCache = ''
            }
            break
          }
          case 'unlink':
            unlinkFile(this.projectTree, change)
            editorStore.SET_SAVE_STATUS_WHEN_REMOVE(change)
            break
          case 'addDir':
            addDirectory(this.projectTree, change)
            break
          case 'unlinkDir':
            unlinkDirectory(this.projectTree, change)
            break
          case 'change':
            break
          default:
            if (process.env.NODE_ENV === 'development') {
              devLog(`Unknown directory watch type: "${type}"`)
            }
            break
        }
      })
    },

    CHANGE_ACTIVE_ITEM(activeItem) {
      this.activeItem = activeItem
    },

    CHANGE_CLIPBOARD(data) {
      this.clipboard = data
    },

    ASK_FOR_OPEN_PROJECT() {
      window.electron.ipcRenderer.send('mt::ask-for-open-project-in-sidebar')
    },

    LISTEN_FOR_SIDEBAR_CONTEXT_MENU() {
      bus.on('SIDEBAR::show-in-folder', () => {
        const { pathname } = this.activeItem
        window.electron.shell.showItemInFolder(pathname)
      })
      bus.on('SIDEBAR::new', (type) => {
        const { pathname, isDirectory } = this.activeItem
        const dirname = isDirectory ? pathname : window.path.dirname(pathname)
        this.createCache = { dirname, type }
        bus.emit('SIDEBAR::show-new-input')
      })
      bus.on('SIDEBAR::remove', () => {
        const { pathname } = this.activeItem
        window.electron.ipcRenderer.invoke('mt::fs-trash-item', pathname).catch((err) => {
          notice.notify({
            title: 'Error while deleting',
            type: 'error',
            message: err.message
          })
        })
      })
      bus.on('SIDEBAR::copy-cut', (type) => {
        const { pathname: src } = this.activeItem
        this.clipboard = { type, src }
      })
      bus.on('SIDEBAR::paste', () => {
        const { clipboard } = this
        const { pathname, isDirectory } = this.activeItem
        const dirname = isDirectory ? pathname : window.path.dirname(pathname)
        if (clipboard && clipboard.src) {
          clipboard.dest = dirname + PATH_SEPARATOR + window.path.basename(clipboard.src)

          if (window.path.normalize(clipboard.src) === window.path.normalize(clipboard.dest)) {
            notice.notify({
              title: 'Paste Forbidden',
              type: 'warning',
              message: 'Source and destination must not be the same.'
            })
            return
          }

          paste(clipboard)
            .then(() => {
              this.clipboard = null
            })
            .catch((err) => {
              notice.notify({
                title: 'Error while pasting',
                type: 'error',
                message: err.message
              })
            })
        }
      })
      bus.on('SIDEBAR::rename', () => {
        const { pathname } = this.activeItem
        this.renameCache = pathname
        bus.emit('SIDEBAR::show-rename-input')
      })
    },

    CREATE_FILE_DIRECTORY(name) {
      const { dirname, type } = this.createCache

      if (type === 'file' && !window.fileUtils.hasMarkdownExtension(name)) {
        name += '.md'
      }

      const fullName = `${dirname}/${name}`

      create(fullName, type)
        .then(() => {
          this.createCache = {}
          if (type === 'file') {
            this.newFileNameCache = fullName
          }
        })
        .catch((err) => {
          notice.notify({
            title: 'Error in Side Bar',
            type: 'error',
            message: err.message
          })
        })
    },

    RENAME_IN_SIDEBAR(name) {
      const editorStore = useEditorStore()
      const src = this.renameCache
      const dirname = window.path.dirname(src)
      const dest = dirname + PATH_SEPARATOR + name
      rename(src, dest).then(() => {
        editorStore.RENAME_IF_NEEDED({ src, dest })
      })
    },

    OPEN_SETTING_WINDOW() {
      window.electron.ipcRenderer.send('mt::open-setting-window')
    }
  }
})
