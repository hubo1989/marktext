import * as contextMenu from './actions'
import { t } from '../../i18n'

// NOTE: This are mutable fields that may change at runtime.

export const SEPARATOR = {
  type: 'separator'
}

// 使用函数形式避免模块加载时调用翻译函数
export const getCLOSE_THIS = () => ({
  label: t('contextMenu.tabs.close'),
  id: 'closeThisTab',
  click (menuItem, browserWindow) {
    contextMenu.closeThis(menuItem._tabId)
  }
})

export const getCLOSE_OTHERS = () => ({
  label: t('contextMenu.tabs.closeOthers'),
  id: 'closeOtherTabs',
  click (menuItem, browserWindow) {
    contextMenu.closeOthers(menuItem._tabId)
  }
})

export const getCLOSE_SAVED = () => ({
  label: t('contextMenu.tabs.closeSavedTabs'),
  id: 'closeSavedTabs',
  click (menuItem, browserWindow) {
    contextMenu.closeSaved()
  }
})

export const getCLOSE_ALL = () => ({
  label: t('contextMenu.tabs.closeAllTabs'),
  id: 'closeAllTabs',
  click (menuItem, browserWindow) {
    contextMenu.closeAll()
  }
})

export const getRENAME = () => ({
  label: t('contextMenu.tabs.rename'),
  id: 'renameFile',
  click (menuItem, browserWindow) {
    contextMenu.rename(menuItem._tabId)
  }
})

export const getCOPY_PATH = () => ({
  label: t('contextMenu.tabs.copyPath'),
  id: 'copyPath',
  click (menuItem, browserWindow) {
    contextMenu.copyPath(menuItem._tabId)
  }
})

export const getSHOW_IN_FOLDER = () => ({
  label: t('contextMenu.tabs.showInFolder'),
  id: 'showInFolder',
  click (menuItem, browserWindow) {
    contextMenu.showInFolder(menuItem._tabId)
  }
})

// 为了向后兼容，保留原有的导出
export const CLOSE_THIS = getCLOSE_THIS()
export const CLOSE_OTHERS = getCLOSE_OTHERS()
export const CLOSE_SAVED = getCLOSE_SAVED()
export const CLOSE_ALL = getCLOSE_ALL()
export const RENAME = getRENAME()
export const COPY_PATH = getCOPY_PATH()
export const SHOW_IN_FOLDER = getSHOW_IN_FOLDER()
