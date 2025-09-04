/**
 * Vue Composable for Animation Service
 * Provides reactive animation utilities for Vue components
 */

import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import animationService from '../services/animationService.js'

export function useAnimation() {
  const isAnimating = ref(false)
  const activeAnimations = ref(0)
  const cleanupFunctions = ref([])

  // Animation lifecycle tracking
  const trackAnimation = (promise) => {
    activeAnimations.value++
    isAnimating.value = true

    return promise
      .finally(() => {
        activeAnimations.value--
        if (activeAnimations.value === 0) {
          isAnimating.value = false
        }
      })
  }

  // Component entrance animation
  const animateIn = async (element, animation = 'fadeIn', options = {}) => {
    if (!element) return

    await nextTick() // Wait for DOM update

    return trackAnimation(
      animationService.animateIn(element, animation, {
        ...options,
        onStart: () => {
          options.onStart?.()
        },
        onComplete: () => {
          options.onComplete?.()
        }
      })
    )
  }

  // Component exit animation
  const animateOut = async (element, animation = 'fadeOut', options = {}) => {
    if (!element) return

    return trackAnimation(
      animationService.animateOut(element, animation, {
        ...options,
        onStart: () => {
          options.onStart?.()
        },
        onComplete: () => {
          options.onComplete?.()
        }
      })
    )
  }

  // Sequence animation
  const animateSequence = async (elements, animation = 'fadeIn', options = {}) => {
    if (!elements?.length) return

    await nextTick()

    return trackAnimation(
      animationService.animateSequence(elements, animation, {
        ...options,
        onElementStart: (element) => {
          options.onElementStart?.(element)
        },
        onElementComplete: (element) => {
          options.onElementComplete?.(element)
        },
        onSequenceComplete: () => {
          options.onSequenceComplete?.()
        }
      })
    )
  }

  // Parallel animation
  const animateParallel = async (elements, animation = 'fadeIn', options = {}) => {
    if (!elements?.length) return

    await nextTick()

    return trackAnimation(
      animationService.animateParallel(elements, animation, {
        ...options,
        onComplete: () => {
          options.onComplete?.()
        }
      })
    )
  }

  // Page transition
  const pageTransition = async (fromElement, toElement, options = {}) => {
    return trackAnimation(
      animationService.pageTransition(fromElement, toElement, options)
    )
  }

  // Modal transition
  const modalTransition = async (modalElement, isOpening = true, options = {}) => {
    if (!modalElement) return

    await nextTick()

    return trackAnimation(
      animationService.modalTransition(modalElement, isOpening, options)
    )
  }

  // Loading animation
  const loadingAnimation = async (element, isLoading = true, options = {}) => {
    if (!element) return

    return trackAnimation(
      animationService.loadingTransition(element, isLoading, options)
    )
  }

  // Add hover effect
  const addHoverEffect = (element, effect = 'lift', options = {}) => {
    if (!element) return

    const cleanup = animationService.addHoverEffect(element, effect, options)
    cleanupFunctions.value.push(cleanup)

    return cleanup
  }

  // Stagger animation for lists
  const staggerList = async (listElement, itemSelector, animation = 'slideInBottom', options = {}) => {
    if (!listElement) return

    await nextTick()

    const items = listElement.querySelectorAll(itemSelector)
    if (!items.length) return

    return animateSequence(Array.from(items), animation, {
      stagger: options.stagger || 50,
      ...options
    })
  }

  // Auto-animate on mount
  const autoAnimate = (animation = 'fadeIn', options = {}) => {
    let elementRef = null

    onMounted(async () => {
      if (elementRef) {
        await animateIn(elementRef, animation, options)
      }
    })

    const setElement = (el) => {
      elementRef = el
    }

    return {
      elementRef: setElement
    }
  }

  // Create transition for Vue
  const createTransition = (name, options = {}) => {
    return animationService.createTransition(name, options)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    // Run all cleanup functions
    cleanupFunctions.value.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.warn('Animation cleanup error:', error)
      }
    })
    cleanupFunctions.value = []
  })

  return {
    // Reactive state
    isAnimating,
    activeAnimations,

    // Animation methods
    animateIn,
    animateOut,
    animateSequence,
    animateParallel,
    pageTransition,
    modalTransition,
    loadingAnimation,
    addHoverEffect,
    staggerList,

    // Utilities
    autoAnimate,
    createTransition,

    // Service access
    animationService
  }
}

// Specific composables for common patterns

/**
 * List animation composable
 */
export function useListAnimation() {
  const { animateSequence, staggerList } = useAnimation()

  const animateListEntrance = async (listElement, options = {}) => {
    return staggerList(listElement, '> *', 'slideInBottom', {
      stagger: 50,
      ...options
    })
  }

  const animateListUpdate = async (newItems, oldItems, options = {}) => {
    // Animate new items in
    if (newItems?.length > (oldItems?.length || 0)) {
      const newElements = newItems.slice(oldItems?.length || 0)
      return animateSequence(newElements, 'scaleIn', options)
    }
  }

  return {
    animateListEntrance,
    animateListUpdate
  }
}

/**
 * Modal animation composable
 */
export function useModalAnimation() {
  const { modalTransition } = useAnimation()

  const animateModalOpen = async (modalElement, options = {}) => {
    return modalTransition(modalElement, true, {
      duration: 'var(--duration-normal)',
      ...options
    })
  }

  const animateModalClose = async (modalElement, options = {}) => {
    return modalTransition(modalElement, false, {
      duration: 'var(--duration-fast)',
      ...options
    })
  }

  return {
    animateModalOpen,
    animateModalClose
  }
}

/**
 * Page transition composable
 */
export function usePageTransition() {
  const { pageTransition } = useAnimation()

  const navigateWithAnimation = async (fromPage, toPage, direction = 'forward') => {
    const outAnimation = direction === 'forward' ? 'slideOutLeft' : 'slideOutRight'
    const inAnimation = direction === 'forward' ? 'slideInRight' : 'slideInLeft'

    return pageTransition(fromPage, toPage, {
      outAnimation,
      inAnimation,
      duration: 300
    })
  }

  return {
    navigateWithAnimation
  }
}
