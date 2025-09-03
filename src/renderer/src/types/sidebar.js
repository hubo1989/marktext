/**
 * 侧边栏组件通信类型定义
 * 用于替代事件总线的结构化通信方案
 */

/**
 * 侧边栏操作类型枚举
 */
export const SIDEBAR_ACTIONS = {
  CREATE_FILE: 'CREATE_FILE',
  CREATE_FOLDER: 'CREATE_FOLDER',
  RENAME_ITEM: 'RENAME_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  SELECT_ITEM: 'SELECT_ITEM',
  EXPAND_ITEM: 'EXPAND_ITEM',
  COLLAPSE_ITEM: 'COLLAPSE_ITEM',
  REFRESH_TREE: 'REFRESH_TREE',
  TOGGLE_OPENED_FILES: 'TOGGLE_OPENED_FILES'
}

/**
 * 侧边栏事件类型枚举
 */
export const SIDEBAR_EVENTS = {
  ITEM_CREATED: 'ITEM_CREATED',
  ITEM_RENAMED: 'ITEM_RENAMED',
  ITEM_DELETED: 'ITEM_DELETED',
  ITEM_SELECTED: 'ITEM_SELECTED',
  TREE_REFRESHED: 'TREE_REFRESHED',
  INPUT_FOCUS_REQUESTED: 'INPUT_FOCUS_REQUESTED'
}

/**
 * 文件树项目类型定义
 * @typedef {Object} TreeItem
 * @property {string} id - 项目唯一标识
 * @property {string} name - 项目名称
 * @property {string} path - 项目路径
 * @property {'file'|'folder'} type - 项目类型
 * @property {boolean} isExpanded - 是否展开（文件夹）
 * @property {TreeItem[]} children - 子项目（文件夹）
 * @property {boolean} isActive - 是否激活
 */

/**
 * 侧边栏操作参数类型
 * @typedef {Object} SidebarAction
 * @property {string} type - 操作类型
 * @property {Object} payload - 操作参数
 * @property {Function} [callback] - 操作完成回调
 */

/**
 * 侧边栏通信接口
 * @typedef {Object} SidebarCommunication
 * @property {Function} emitAction - 发送操作
 * @property {Function} onAction - 监听操作
 * @property {Function} offAction - 取消监听操作
 */
