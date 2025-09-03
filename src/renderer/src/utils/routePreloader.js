/**
 * 路由预加载工具
 * 优化用户体验，通过预加载可能访问的路由组件
 */

const preloadedComponents = new Set()
const preloadPromises = new Map()

/**
 * 预加载路由组件
 * @param {Array<string>} routeNames - 要预加载的路由名称数组
 * @param {number} delay - 延迟预加载的时间（毫秒）
 */
export function preloadRoutes(routeNames, delay = 100) {
  if (!routeNames || routeNames.length === 0) return

  setTimeout(() => {
    routeNames.forEach(routeName => {
      if (!preloadedComponents.has(routeName) && !preloadPromises.has(routeName)) {
        preloadRoute(routeName)
      }
    })
  }, delay)
}

/**
 * 预加载单个路由组件
 * @param {string} routeName - 路由名称
 * @returns {Promise} 预加载完成的Promise
 */
function preloadRoute(routeName) {
  if (preloadPromises.has(routeName)) {
    return preloadPromises.get(routeName)
  }

  const preloadPromise = new Promise((resolve, reject) => {
    try {
      // 这里可以根据路由名称动态导入对应的组件
      // 由于我们已经在路由配置中使用了动态导入，这里可以根据需要扩展
      switch (routeName) {
        case 'preference':
          import(/* webpackChunkName: "preference" */ '@/pages/preference')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'general':
          import(/* webpackChunkName: "pref-general" */ '@/prefComponents/general')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'editor':
          import(/* webpackChunkName: "pref-editor" */ '@/prefComponents/editor')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'markdown':
          import(/* webpackChunkName: "pref-markdown" */ '@/prefComponents/markdown')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'spelling':
          import(/* webpackChunkName: "pref-spellchecker" */ '@/prefComponents/spellchecker')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'theme':
          import(/* webpackChunkName: "pref-theme" */ '@/prefComponents/theme')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'image':
          import(/* webpackChunkName: "pref-image" */ '@/prefComponents/image')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        case 'keybindings':
          import(/* webpackChunkName: "pref-keybindings" */ '@/prefComponents/keybindings')
            .then(() => {
              preloadedComponents.add(routeName)
              resolve()
            })
            .catch(reject)
          break
        default:
          resolve() // 对于未知路由，直接resolve
      }
    } catch (error) {
      reject(error)
    }
  })

  preloadPromises.set(routeName, preloadPromise)
  return preloadPromise
}

/**
 * Vue Router 路由守卫，用于自动预加载
 * @param {Object} router - Vue Router实例
 */
export function setupRoutePreloading(router) {
  router.beforeEach((to, from, next) => {
    // 预加载目标路由可能需要的组件
    if (to.meta && to.meta.preload) {
      preloadRoutes(to.meta.preload, 50)
    }

    // 预加载父路由的兄弟路由
    if (to.matched.length > 0) {
      const parentRoute = to.matched[to.matched.length - 1]
      if (parentRoute.children) {
        const siblingRoutes = parentRoute.children
          .filter(child => child.name && child.name !== to.name)
          .map(child => child.name)
        preloadRoutes(siblingRoutes, 200)
      }
    }

    next()
  })

  // 监听路由变化，预加载可能的用户行为
  let preloadTimeout
  router.afterEach((to, from) => {
    // 清除之前的预加载定时器
    if (preloadTimeout) {
      clearTimeout(preloadTimeout)
    }

    // 延迟预加载其他可能访问的路由
    preloadTimeout = setTimeout(() => {
      // 基于当前路由推测用户可能访问的其他路由
      const predictiveRoutes = getPredictiveRoutes(to.name)
      if (predictiveRoutes.length > 0) {
        preloadRoutes(predictiveRoutes, 1000)
      }
    }, 1000)
  })
}

/**
 * 根据当前路由预测用户可能访问的其他路由
 * @param {string} currentRouteName - 当前路由名称
 * @returns {Array<string>} 预测的路由名称数组
 */
function getPredictiveRoutes(currentRouteName) {
  const predictions = {
    'editor': ['preference', 'general'],
    'general': ['editor', 'markdown'],
    'editor': ['markdown', 'theme'],
    'markdown': ['theme', 'image'],
    'theme': ['image', 'keybindings'],
    'image': ['keybindings'],
    'spelling': ['theme']
  }

  return predictions[currentRouteName] || []
}

/**
 * 获取预加载统计信息
 * @returns {Object} 统计信息
 */
export function getPreloadStats() {
  return {
    preloadedComponents: Array.from(preloadedComponents),
    pendingPreloads: Array.from(preloadPromises.keys()).filter(
      key => !preloadedComponents.has(key)
    ),
    totalPreloaded: preloadedComponents.size,
    totalPending: preloadPromises.size - preloadedComponents.size
  }
}

// 开发环境调试工具
if (process.env.NODE_ENV === 'development') {
  window.__routePreloadStats = getPreloadStats
}

