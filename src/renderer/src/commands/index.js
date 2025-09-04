// List of all static commands that are loaded into command center.
import { getCurrentWindow } from '@electron/remote'
import bus from '../bus'
import { delay, isOsx } from '@/util'
import { isUpdatable } from './utils'
import getCommandDescriptionById from './descriptions'
// Removed i18n import - using hardcoded English descriptions

export { default as FileEncodingCommand } from './fileEncoding'
export { default as LineEndingCommand } from './lineEnding'
export { default as QuickOpenCommand } from './quickOpen'
export { default as SpellcheckerLanguageCommand } from './spellcheckerLanguage'
export { default as TrailingNewlineCommand } from './trailingNewline'

export class RootCommand {
  constructor(subcommands = []) {
    this.id = '#'
    this.description = '#'
    this.subcommands = subcommands
    this.subcommandSelectedIndex = -1
  }

  async run() {}
  async unload() {}

  // Execute the command.
  async execute() {
    throw new Error('Root command.')
  }
}

const focusEditorAndExecute = (fn) => {
  setTimeout(() => bus.emit('editor-focus'), 10)
  setTimeout(() => fn(), 150)
}

const commands = [
  // --------------------------------------------------------------------------
  // File

  {
    id: 'file.new-tab',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::new-untitled-tab', null)
    }
  },
  {
    id: 'file.new-window',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-new-editor-window')
    }
  },
  {
    id: 'file.open-file',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-open-file')
    }
  },
  {
    id: 'file.open-folder',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-open-folder')
    }
  },
  {
    id: 'file.save',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::editor-ask-file-save', null)
    }
  },
  {
    id: 'file.save-as',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::editor-ask-file-save-as', null)
    }
  },
  {
    id: 'file.print',
    execute: async () => {
      await delay(50)
      bus.emit('showExportDialog', 'print')
    }
  },
  {
    id: 'file.close-tab',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::editor-close-tab', null)
    }
  },
  {
    id: 'file.close-window',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-close-window')
    }
  },

  {
    id: 'file.toggle-auto-save',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-toggle-autosave')
    }
  },
  {
    id: 'file.move-file',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::editor-move-file', null)
    }
  },
  {
    id: 'file.rename-file',
    execute: async () => {
      await delay(50)
      window.electron.ipcRenderer.emit('mt::editor-rename-file', null)
    }
  },
  {
    id: 'file.import-file',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::cmd-import-file')
    }
  },
  {
    id: 'file.export-file',
    subcommands: [
      {
        id: 'file.export-file-html',
        description: 'Export as HTML',
        execute: async () => {
          await delay(50)
          bus.emit('showExportDialog', 'styledHtml')
        }
      },
      {
        id: 'file.export-file-pdf',
        description: 'Export as PDF',
        execute: async () => {
          await delay(50)
          bus.emit('showExportDialog', 'pdf')
        }
      }
    ]
  },

  // --------------------------------------------------------------------------
  // Edit

  {
    id: 'edit.undo',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('undo', 'undo'))
    }
  },
  {
    id: 'edit.redo',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('redo', 'redo'))
    }
  },
  {
    id: 'edit.duplicate',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('duplicate', 'duplicate'))
    }
  },
  {
    id: 'edit.create-paragraph',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('createParagraph', 'createParagraph'))
    }
  },
  {
    id: 'edit.delete-paragraph',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('deleteParagraph', 'deleteParagraph'))
    }
  },
  {
    id: 'edit.find',
    execute: async () => {
      await delay(150)
      bus.emit('find', 'find')
    }
  },
  // TODO: Find next/previous doesn't work.
  // {
  //   id: 'edit.find-next',
  //   description: 'Edit: Find Next',
  //   execute: async () => {
  //     await delay(150)
  //     bus.emit('findNext', 'findNext')
  //   }
  // }, {
  //   id: 'edit.find-previous',
  //   description: 'Edit: Find Previous',
  //   execute: async () => {
  //     await delay(150)
  //     bus.emit('findPrev', 'findPrev')
  //   }
  // },
  {
    id: 'edit.replace',
    execute: async () => {
      await delay(150)
      bus.emit('replace', 'replace')
    }
  },
  {
    id: 'edit.find-in-folder',
    execute: async () => {
      await delay(150)
      window.electron.ipcRenderer.emit('mt::editor-edit-action', null, 'findInFolder')
    }
  },

  // --------------------------------------------------------------------------
  // Paragraph

  {
    id: 'paragraph.heading-1',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 1'))
    }
  },
  {
    id: 'paragraph.heading-2',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 2'))
    }
  },
  {
    id: 'paragraph.heading-3',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 3'))
    }
  },
  {
    id: 'paragraph.heading-4',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 4'))
    }
  },
  {
    id: 'paragraph.heading-5',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 5'))
    }
  },
  {
    id: 'paragraph.heading-6',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'heading 6'))
    }
  },
  {
    id: 'paragraph.upgrade-heading',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'upgrade heading'))
    }
  },
  {
    id: 'paragraph.degrade-heading',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'degrade heading'))
    }
  },
  {
    id: 'paragraph.table',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'table'))
    }
  },
  {
    id: 'paragraph.code-fence',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'pre'))
    }
  },
  {
    id: 'paragraph.quote-block',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'blockquote'))
    }
  },
  {
    id: 'paragraph.math-formula',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'mathblock'))
    }
  },
  {
    id: 'paragraph.html-block',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'html'))
    }
  },
  {
    id: 'paragraph.order-list',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'ol-bullet'))
    }
  },
  {
    id: 'paragraph.bullet-list',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'ul-bullet'))
    }
  },
  {
    id: 'paragraph.task-list',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'ul-task'))
    }
  },
  {
    id: 'paragraph.loose-list-item',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'loose-list-item'))
    }
  },
  {
    id: 'paragraph.paragraph',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'paragraph'))
    }
  },
  {
    id: 'paragraph.reset-paragraph',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'reset-to-paragraph'))
    }
  },
  {
    id: 'paragraph.horizontal-line',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'hr'))
    }
  },
  {
    id: 'paragraph.front-matter',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('paragraph', 'front-matter'))
    }
  },

  // --------------------------------------------------------------------------
  // Format

  // NOTE: Focus editor to restore selection and try to apply the commmand.

  {
    id: 'format.strong',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'strong'))
    }
  },
  {
    id: 'format.emphasis',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'em'))
    }
  },
  {
    id: 'format.underline',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'u'))
    }
  },
  {
    id: 'format.highlight',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'mark'))
    }
  },
  {
    id: 'format.superscript',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'sup'))
    }
  },
  {
    id: 'format.subscript',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'sub'))
    }
  },
  {
    id: 'format.inline-code',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'inline_code'))
    }
  },
  {
    id: 'format.inline-math',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'inline_math'))
    }
  },
  {
    id: 'format.strike',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'del'))
    }
  },
  {
    id: 'format.hyperlink',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'link'))
    }
  },
  {
    id: 'format.image',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'image'))
    }
  },
  {
    id: 'format.clear-format',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('format', 'clear'))
    }
  },

  // --------------------------------------------------------------------------
  // Window

  {
    id: 'window.minimize',
    execute: async () => {
      getCurrentWindow().minimize()
    }
  },
  {
    id: 'window.toggle-always-on-top',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::window-toggle-always-on-top')
    }
  },
  {
    id: 'window.toggle-full-screen',
    execute: async () => {
      const win = getCurrentWindow()
      win.setFullScreen(!win.isFullScreen())
    }
  },

  {
    id: 'file.zoom',
    shortcut: [isOsx ? 'Cmd' : 'Ctrl', 'Scroll'],
    subcommands: [
      {
        id: 'file.zoom-0',
        description: '62.5%',
        value: 0.625
      },
      {
        id: 'file.zoom-1',
        description: '75%',
        value: 0.75
      },
      {
        id: 'file.zoom-2',
        description: '87.5%',
        value: 0.875
      },
      {
        id: 'file.zoom-3',
        description: '100%',
        value: 1.0
      },
      {
        id: 'file.zoom-4',
        description: '112.5%',
        value: 1.125
      },
      {
        id: 'file.zoom-5',
        description: '125%',
        value: 1.25
      },
      {
        id: 'file.zoom-6',
        description: '137.5%',
        value: 1.375
      },
      {
        id: 'file.zoom-7',
        description: '150%',
        value: 1.5
      },
      {
        id: 'file.zoom-8',
        description: '162.5%',
        value: 1.625
      },
      {
        id: 'file.zoom-9',
        description: '175%',
        value: 1.75
      },
      {
        id: 'file.zoom-10',
        description: '187.5%',
        value: 1.875
      },
      {
        id: 'file.zoom-11',
        description: '200%',
        value: 2.0
      }
    ],
    executeSubcommand: async (_, value) => {
      window.electron.ipcRenderer.emit('mt::window-zoom', null, value)
    }
  },

  // --------------------------------------------------------------------------
  // Window

  {
    id: 'window.change-theme',
    subcommands: [
      {
        id: 'window.change-theme-light',
        description: 'Cadmium Light',
        value: 'light'
      },
      {
        id: 'window.change-theme-dark',
        description: 'Dark',
        value: 'dark'
      },
      {
        id: 'window.change-theme-graphite',
        description: 'Graphite',
        value: 'graphite'
      },
      {
        id: 'window.change-theme-material-dark',
        description: 'Material Dark',
        value: 'material-dark'
      },
      {
        id: 'window.change-theme-one-dark',
        description: 'One Dark',
        value: 'one-dark'
      },
      {
        id: 'window.change-theme-ulysses',
        description: 'Ulysses',
        value: 'ulysses'
      }
    ],
    executeSubcommand: async (_, theme) => {
      window.electron.ipcRenderer.send('mt::set-user-preference', { theme })
    }
  },

  // --------------------------------------------------------------------------
  // View

  {
    id: 'view.source-code-mode',
    execute: async () => {
      bus.emit('view:toggle-view-entry', 'sourceCode')
    }
  },
  {
    id: 'view.typewriter-mode',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('view:toggle-view-entry', 'typewriter'))
    }
  },
  {
    id: 'view.focus-mode',
    execute: async () => {
      focusEditorAndExecute(() => bus.emit('view:toggle-view-entry', 'focus'))
    }
  },
  {
    id: 'view.toggle-sidebar',
    execute: async () => {
      bus.emit('view:toggle-layout-entry', 'showSideBar')
    }
  },
  {
    id: 'view.toggle-tabbar',
    execute: async () => {
      bus.emit('view:toggle-layout-entry', 'showTabBar')
    }
  },

  {
    id: 'view.text-direction',
    subcommands: [
      {
        id: 'view.text-direction-ltr',
        description: 'Left to Right',
        value: 'ltr'
      },
      {
        id: 'view.text-direction-rtl',
        description: 'Right to Left',
        value: 'rtl'
      }
    ],
    executeSubcommand: async (_, value) => {
      window.electron.ipcRenderer.send('mt::set-user-preference', { textDirection: value })
    }
  },

  // --------------------------------------------------------------------------
  // MarkText

  {
    id: 'file.preferences',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::open-setting-window')
    }
  },
  {
    id: 'file.quit',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::app-try-quit')
    }
  },
  {
    id: 'docs.user-guide',
    execute: async () => {
      window.electron.shell.openExternal(
        'https://github.com/hubo1989/marktext-next/blob/main/docs/README.md'
      )
    }
  },
  {
    id: 'docs.markdown-syntax',
    execute: async () => {
      window.electron.shell.openExternal(
        'https://github.com/hubo1989/marktext-next/blob/main/docs/MARKDOWN_SYNTAX.md'
      )
    }
  },

  // --------------------------------------------------------------------------
  // Misc

  {
    id: 'tabs.cycleForward',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::tabs-cycle-right', null)
    }
  },
  {
    id: 'tabs.cycleBackward',
    execute: async () => {
      window.electron.ipcRenderer.emit('mt::tabs-cycle-left', null)
    }
  }
]

// --------------------------------------------------------------------------
// etc

if (isUpdatable()) {
  commands.push({
    id: 'file.check-update',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::check-for-update')
    }
  })
}

if (isOsx) {
  commands.push({
    id: 'edit.screenshot',
    execute: async () => {
      window.electron.ipcRenderer.send('mt::make-screenshot')
    }
  })
}

// Function to get commands with updated descriptions
export const getCommandsWithDescriptions = async () => {
  // Create a deep copy of commands to avoid modifying the original
  const commandsCopy = JSON.parse(JSON.stringify(commands))
  
  // Import translation function here to ensure it's available
  const { t } = await import('../i18n')
  
  // Update descriptions for all commands
  const updateDescriptions = (commandList) => {
    for (const item of commandList) {
      const { id, subcommands } = item
      // Always update description for commands with ID, regardless of existing description
      if (id) {
        item.description = getCommandDescriptionById(id)
      }
      
      // Special handling for theme subcommands
      if (id === 'window.change-theme' && subcommands && Array.isArray(subcommands)) {
        for (const subcommand of subcommands) {
          const { value } = subcommand
          if (value === 'light') {
            subcommand.description = t('theme.cadmiumLight')
          } else if (value === 'dark') {
            subcommand.description = t('theme.dark')
          } else if (value === 'graphite') {
            subcommand.description = t('theme.graphiteLight')
          } else if (value === 'material-dark') {
            subcommand.description = t('theme.materialDark')
          } else if (value === 'one-dark') {
            subcommand.description = t('theme.oneDark')
          } else if (value === 'ulysses') {
            subcommand.description = t('theme.ulyssesLight')
          }
        }
      }
      
      // Also update other subcommands descriptions
      if (subcommands && Array.isArray(subcommands)) {
        updateDescriptions(subcommands)
      }
    }
  }
  
  updateDescriptions(commandsCopy)
  return commandsCopy
}

// Complete all command descriptions for initial load.
for (const item of commands) {
  const { id, description } = item
  if (id && !description) {
    item.description = getCommandDescriptionById(id)
  }
}

export default commands
