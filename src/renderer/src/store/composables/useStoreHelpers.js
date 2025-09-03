/**
 * Store组合函数 - 提供通用的store逻辑
 */

import { ref, computed, watch } from 'vue'

/**
 * 创建异步操作的组合函数
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 选项
 * @returns {Object} 组合函数返回的对象
 */
export function useAsyncOperation(asyncFn, options = {}) {
  const {
    immediate = false,
    onSuccess,
    onError,
    onFinally
  } = options

  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFn(...args)
      data.value = result

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      error.value = err

      if (onError) {
        onError(err)
      }

      throw err
    } finally {
      loading.value = false

      if (onFinally) {
        onFinally()
      }
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  if (immediate) {
    execute()
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    execute,
    reset
  }
}

/**
 * 创建防抖的store操作
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 防抖延迟时间
 * @returns {Function} 防抖后的函数
 */
export function useDebouncedOperation(fn, delay = 300) {
  let timeoutId = null

  const debouncedFn = (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(null, args), delay)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return Object.assign(debouncedFn, { cancel })
}

/**
 * 创建节流的store操作
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 节流间隔时间
 * @returns {Function} 节流后的函数
 */
export function useThrottledOperation(fn, delay = 100) {
  let lastCall = 0
  let timeoutId = null

  const throttledFn = (...args) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(null, args)
    } else {
      // 如果在节流间隔内，安排下一次执行
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(null, args)
        timeoutId = null
      }, delay - (now - lastCall))
    }
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return Object.assign(throttledFn, { cancel })
}

/**
 * 创建缓存的store操作
 * @param {Function} fn - 要缓存的函数
 * @param {Object} options - 缓存选项
 * @returns {Function} 带缓存的函数
 */
export function useCachedOperation(fn, options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5分钟
    maxSize = 100,
    keyFn = JSON.stringify
  } = options

  const cache = new Map()

  const cachedFn = async (...args) => {
    const key = keyFn(args)
    const now = Date.now()

    // 检查缓存
    if (cache.has(key)) {
      const cached = cache.get(key)
      if (now - cached.timestamp < ttl) {
        return cached.value
      } else {
        cache.delete(key)
      }
    }

    // 执行函数
    const result = await fn.apply(null, args)

    // 缓存结果
    cache.set(key, {
      value: result,
      timestamp: now
    })

    // 清理过期缓存
    if (cache.size > maxSize) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    return result
  }

  const clearCache = () => cache.clear()
  const getCacheSize = () => cache.size

  return Object.assign(cachedFn, {
    clearCache,
    getCacheSize,
    cache
  })
}

/**
 * 创建可重试的store操作
 * @param {Function} fn - 要重试的函数
 * @param {Object} options - 重试选项
 * @returns {Function} 可重试的函数
 */
export function useRetryOperation(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    retryIf = () => true
  } = options

  const retryFn = async (...args) => {
    let lastError

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn.apply(null, args)
      } catch (error) {
        lastError = error

        // 检查是否应该重试
        if (attempt === maxRetries || !retryIf(error)) {
          throw error
        }

        // 计算延迟时间
        const delayTime = delay * Math.pow(backoff, attempt)

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delayTime))
      }
    }

    throw lastError
  }

  return retryFn
}

/**
 * 创建store状态同步工具
 * @param {Object} store - Pinia store实例
 * @param {string} key - 本地存储键
 * @param {Object} options - 同步选项
 */
export function useStorePersistence(store, key, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = localStorage
  } = options

  // 从本地存储恢复状态
  const restoreState = () => {
    try {
      const stored = storage.getItem(key)
      if (stored) {
        const parsed = deserialize(stored)
        store.$patch(parsed)
      }
    } catch (error) {
      console.error(`Failed to restore state for ${key}:`, error)
    }
  }

  // 保存状态到本地存储
  const saveState = () => {
    try {
      const state = store.$state
      const serialized = serialize(state)
      storage.setItem(key, serialized)
    } catch (error) {
      console.error(`Failed to save state for ${key}:`, error)
    }
  }

  // 监听store变化并保存
  const stopWatcher = watch(
    () => store.$state,
    () => {
      saveState()
    },
    { deep: true }
  )

  return {
    restoreState,
    saveState,
    stopWatcher
  }
}

