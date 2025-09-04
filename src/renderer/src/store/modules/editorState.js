import equal from 'deep-equal'
import bus from '../../bus'
import listToTree from '../../util/listToTree'
import { getOptionsFromState } from '../help'
import { usePreferencesStore } from '../preferences'
import { i18n } from '../../i18n'
import notice from '../../services/notification'

export default {
  // Content change handling
  LISTEN_FOR_CONTENT_CHANGE({
    id,
    markdown,
    wordCount,
    cursor,
    muyaIndexCursor,
    history,
    toc,
    blocks
  }) {
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

    this.currentFile.blocks = blocks || []

    if (oldMarkdown.length === 0 && markdown.length === 1 && markdown[0] === '\n') {
      return
    }

    if (wordCount) this.currentFile.wordCount = wordCount
    if (cursor) this.currentFile.cursor = cursor
    if (muyaIndexCursor) this.currentFile.muyaIndexCursor = muyaIndexCursor
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

  // File state updates
  UPDATE_CURRENT_FILE(currentFile) {
    // Check if currentFile is null or undefined
    if (!currentFile) {
      console.warn('🔄 [UPDATE_CURRENT_FILE] Called with null/undefined currentFile')
      return
    }

    console.log('🔄 [UPDATE_CURRENT_FILE] Called with:', {
      id: currentFile.id,
      filename: currentFile.filename,
      pathname: currentFile.pathname
    })

    const oldCurrentFile = this.currentFile
    console.log('🔄 [UPDATE_CURRENT_FILE] Old currentFile:', oldCurrentFile)

    if (!oldCurrentFile || !oldCurrentFile.id || oldCurrentFile.id !== currentFile.id) {
      const { id, markdown, cursor, history, pathname, scrollTop, blocks } = currentFile
      window.DIRNAME = pathname ? window.path.dirname(pathname) : ''
      this.currentFile = currentFile

      console.log('🔄 [UPDATE_CURRENT_FILE] Updated currentFile to:', this.currentFile)
      console.log('🔄 [UPDATE_CURRENT_FILE] Tabs before adding:', this.tabs)

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

    // 检查文件是否已经在tabs中
    const existingIndex = this.tabs.findIndex((file) => file.id === currentFile.id)
    if (existingIndex === -1) {
      console.log('🔄 [UPDATE_CURRENT_FILE] File not in tabs, adding it')
      this.tabs.push(currentFile)
      console.log('🔄 [UPDATE_CURRENT_FILE] Tabs after adding:', this.tabs)
    } else {
      console.log('🔄 [UPDATE_CURRENT_FILE] File already exists in tabs at index:', existingIndex)
      // 确保更新现有文件的状态
      this.tabs[existingIndex] = { ...currentFile }
    }
    this.UPDATE_LINE_ENDING_MENU()
  },

  // Scroll position management
  updateScrollPosition(scrollTop) {
    this.currentFile.scrollTop = scrollTop
  },

  // Notification management
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
      console.error(i18n.global.t('store.editor.tabNotFound'))
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

  // Selection management
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
  }
}

// Helper functions
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

const trimTrailingNewlines = (text) => {
  return text.replace(/[\r?\n]+$/, '')
}

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

const createSelectionFormatState = (formats) => {
  const state = {}
  for (const item of formats) {
    state[item.type] = true
  }
  return state
}
