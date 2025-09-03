/**
 * IPC 通信辅助工具
 * 提供安全的 IPC 发送方法，避免 EPIPE 错误
 */

import { BrowserWindow } from 'electron'

/**
 * 安全地发送 IPC 消息到渲染进程
 * @param {BrowserWindow} win - 目标窗口
 * @param {string} channel - IPC 通道
 * @param {any} data - 要发送的数据
 * @returns {boolean} 是否发送成功
 */
export function safeSend(win, channel, data) {
  if (!win || win.isDestroyed()) {
    console.warn(`Cannot send IPC message to destroyed window: ${channel}`)
    return false
  }

  try {
    win.webContents.send(channel, data)
    return true
  } catch (error) {
    if (error.code === 'EPIPE') {
      console.warn(`EPIPE error when sending IPC message: ${channel}`)
    } else {
      console.error(`Error sending IPC message ${channel}:`, error)
    }
    return false
  }
}

/**
 * 安全地发送 IPC 消息到所有窗口
 * @param {string} channel - IPC 通道
 * @param {any} data - 要发送的数据
 * @returns {number} 成功发送的窗口数量
 */
export function safeSendToAll(channel, data) {
  const windows = BrowserWindow.getAllWindows()
  let successCount = 0

  windows.forEach(win => {
    if (safeSend(win, channel, data)) {
      successCount++
    }
  })

  return successCount
}

/**
 * 安全地发送 IPC 消息到主窗口
 * @param {string} channel - IPC 通道
 * @param {any} data - 要发送的数据
 * @returns {boolean} 是否发送成功
 */
export function safeSendToMain(channel, data) {
  const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  return safeSend(mainWindow, channel, data)
}

/**
 * 检查窗口是否有效且未销毁
 * @param {BrowserWindow} win - 要检查的窗口
 * @returns {boolean} 窗口是否有效
 */
export function isWindowValid(win) {
  return win && !win.isDestroyed()
}
