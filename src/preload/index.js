import { contextBridge, shell, clipboard } from 'electron'
import fs from 'fs-extra'
import { isFile, isDirectory, ensureDirSync } from 'common/filesystem'
import { electronAPI } from '@electron-toolkit/preload'
import {
  isChildOfDirectory,
  hasMarkdownExtension,
  MARKDOWN_INCLUSIONS,
  isSamePathSync,
  isImageFile
} from 'common/filesystem/paths'
import { rgPath } from '@vscode/ripgrep'
import path from 'path'
import commandExists from 'command-exists'

const customElectronAPI = {
  shell,
  clipboard,
  process: {
    platform: process.platform,
    env: {
      MARKTEXT_VERSION_STRING: process.env.MARKTEXT_VERSION_STRING || '0.17.1'
    }
  },
  logToConsole: (message) => {
    console.log(message)
    // log.info(message) // 注释掉因为 log 未定义
  },
  writeLogFile: async (filename, content) => {
    try {
      const logPath = path.join(process.cwd(), filename)
      await fs.writeFile(logPath, content, 'utf8')
      // log.info(`Log file written to: ${logPath}`) // 注释掉因为 log 未定义
      return logPath
    } catch (error) {
      // log.error('Error writing log file:', error) // 注释掉因为 log 未定义
      throw error
    }
  }
}

const fileUtilsAPI = {
  isFile: (path) => isFile(path),
  isDirectory: (path) => isDirectory(path),
  emptyDir: (path) => fs.emptyDir(path),
  copy: (src, dest) => fs.copy(src, dest),
  ensureDir: (path) => fs.ensureDir(path),
  outputFile: (path, data) => fs.outputFile(path, data),
  move: (src, dest) => fs.move(src, dest),
  stat: (path) => fs.stat(path),
  writeFile: (path, data) => fs.writeFile(path, data),
  readFile: (path) => fs.readFile(path),
  ensureDirSync: (path) => ensureDirSync(path),
  pathExistsSync: (path) => fs.pathExistsSync(path),
  isChildOfDirectory: (dir, child) => isChildOfDirectory(dir, child),
  hasMarkdownExtension: (filename) => hasMarkdownExtension(filename),
  MARKDOWN_INCLUSIONS: MARKDOWN_INCLUSIONS,
  isSamePathSync: (pathA, pathB) => isSamePathSync(pathA, pathB),
  isImageFile: (filepath) => isImageFile(filepath)
}

const commandAPI = {
  exists: (command) => {
    try {
      return commandExists.sync(command)
    } catch (error) {
      console.error('Error checking command existence:', error)
      return false
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ...customElectronAPI
    })
    contextBridge.exposeInMainWorld('electronAPI', {
      ...electronAPI,
      ...customElectronAPI
    })
    contextBridge.exposeInMainWorld('rgPath', rgPath)
    contextBridge.exposeInMainWorld('fileUtils', fileUtilsAPI)
    contextBridge.exposeInMainWorld('path', path)
    contextBridge.exposeInMainWorld('commandExists', commandAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = { ...electronAPI, ...customElectronAPI }
  window.electronAPI = { ...electronAPI, ...customElectronAPI }
  window.rgPath = rgPath
  window.fileUtils = fileUtilsAPI
  window.path = path
  window.commandExists = commandAPI
}
