/**
 * Animation Service for Vue Components
 * Provides component-level animation coordination and management
 */

import { nextTick } from 'vue'

class AnimationService {
  constructor() {
    this.activeAnimations = new Map()
    this.animationQueue = []
    this.isProcessing = false
  }

  /**
   * Animate component entrance
   */
  async animateIn(element, animation = 'fadeIn', options = {}) {
    const {
      duration = 'var(--duration-normal)',
      delay = 0,
      easing = 'var(--easing-standard)',
      onStart,
      onComplete
    } = options

    return this.animateElement(element, animation, {
      duration,
      delay,
      easing,
      direction: 'normal',
      onStart,
      onComplete
    })
  }

  /**
   * Animate component exit
   */
  async animateOut(element, animation = 'fadeOut', options = {}) {
    const {
      duration = 'var(--duration-fast)',
      delay = 0,
      easing = 'var(--easing-accelerate)',
      onStart,
      onComplete
    } = options

    return this.animateElement(element, animation, {
      duration,
      delay,
      easing,
      direction: 'normal',
      onStart,
      onComplete
    })
  }

  /**
   * Animate element with custom animation
   */
  async animateElement(element, animationName, options = {}) {
    if (!element) return Promise.resolve()

    const animationId = this.generateAnimationId()
    this.activeAnimations.set(animationId, { element, animationName, options })

    return new Promise((resolve, reject) => {
      try {
        // Apply animation class
        element.classList.add(`animate-${animationName.toLowerCase()}`)

        // Set custom properties if provided
        if (options.duration) {
          element.style.setProperty('--animation-duration', options.duration)
        }
        if (options.delay) {
          element.style.setProperty('--animation-delay', `${options.delay}ms`)
        }
        if (options.easing) {
          element.style.setProperty('--animation-easing', options.easing)
        }

        // Call onStart callback
        if (options.onStart) {
          options.onStart(element)
        }

        // Listen for animation end
        const handleAnimationEnd = (event) => {
          if (event.target === element) {
            element.removeEventListener('animationend', handleAnimationEnd)
            element.classList.remove(`animate-${animationName.toLowerCase()}`)

            // Reset custom properties
            element.style.removeProperty('--animation-duration')
            element.style.removeProperty('--animation-delay')
            element.style.removeProperty('--animation-easing')

            this.activeAnimations.delete(animationId)

            // Call onComplete callback
            if (options.onComplete) {
              options.onComplete(element)
            }

            resolve()
          }
        }

        element.addEventListener('animationend', handleAnimationEnd)

        // Fallback for animations that don't fire animationend
        setTimeout(() => {
          if (this.activeAnimations.has(animationId)) {
            handleAnimationEnd({ target: element })
          }
        }, 1000)

      } catch (error) {
        this.activeAnimations.delete(animationId)
        reject(error)
      }
    })
  }

  /**
   * Animate multiple elements in sequence
   */
  async animateSequence(elements, animation = 'fadeIn', options = {}) {
    const {
      stagger = 100,
      onElementStart,
      onElementComplete,
      onSequenceComplete
    } = options

    const promises = []

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const delay = i * stagger

      const promise = this.animateIn(element, animation, {
        delay,
        onStart: onElementStart,
        onComplete: onElementComplete
      })

      promises.push(promise)
    }

    try {
      await Promise.all(promises)
      if (onSequenceComplete) {
        onSequenceComplete()
      }
    } catch (error) {
      console.error('Animation sequence failed:', error)
      throw error
    }
  }

  /**
   * Animate multiple elements simultaneously
   */
  async animateParallel(elements, animation = 'fadeIn', options = {}) {
    const promises = elements.map(element =>
      this.animateIn(element, animation, options)
    )

    try {
      await Promise.all(promises)
      if (options.onComplete) {
        options.onComplete()
      }
    } catch (error) {
      console.error('Parallel animation failed:', error)
      throw error
    }
  }

  /**
   * Create transition for Vue component
   */
  createTransition(name, options = {}) {
    const {
      enterClass = `animate-${name}-enter`,
      leaveClass = `animate-${name}-leave`,
      duration = 300
    } = options

    return {
      enter(el, done) {
        el.classList.add(enterClass)
        setTimeout(done, duration)
      },
      leave(el, done) {
        el.classList.add(leaveClass)
        setTimeout(() => {
          el.classList.remove(leaveClass)
          done()
        }, duration)
      }
    }
  }

  /**
   * Page transition animation
   */
  async pageTransition(fromElement, toElement, options = {}) {
    const {
      outAnimation = 'slideOutLeft',
      inAnimation = 'slideInRight',
      duration = 300
    } = options

    // Animate out current page
    if (fromElement) {
      await this.animateOut(fromElement, outAnimation, { duration })
    }

    // Animate in new page
    if (toElement) {
      await this.animateIn(toElement, inAnimation, { duration })
    }
  }

  /**
   * Modal/Dialog animation
   */
  async modalTransition(modalElement, isOpening = true, options = {}) {
    const animation = isOpening ? 'scaleIn' : 'scaleOut'
    const duration = isOpening ? 'var(--duration-normal)' : 'var(--duration-fast)'

    return this.animateElement(modalElement, animation, {
      duration,
      ...options
    })
  }

  /**
   * Loading state animation
   */
  async loadingTransition(element, isLoading = true, options = {}) {
    const animation = isLoading ? 'pulse' : 'fadeIn'

    if (isLoading) {
      // Continuous pulse animation
      element.classList.add('animate-pulse')
      return Promise.resolve()
    } else {
      // Fade in when loading completes
      element.classList.remove('animate-pulse')
      return this.animateIn(element, animation, options)
    }
  }

  /**
   * Hover effect animation
   */
  addHoverEffect(element, effect = 'lift', options = {}) {
    const {
      scale = 1.05,
      lift = -2,
      glow = true,
      duration = 'var(--duration-fast)'
    } = options

    element.classList.add('transition-transform')

    const handleMouseEnter = () => {
      switch (effect) {
        case 'lift':
          element.style.transform = `translateY(${lift}px)`
          break
        case 'scale':
          element.style.transform = `scale(${scale})`
          break
        case 'glow':
          if (glow) {
            element.style.boxShadow = 'var(--shadow-lg)'
          }
          break
      }
    }

    const handleMouseLeave = () => {
      element.style.transform = ''
      if (glow) {
        element.style.boxShadow = ''
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  /**
   * Stop all active animations
   */
  stopAllAnimations() {
    for (const [id, animation] of this.activeAnimations) {
      if (animation.element) {
        animation.element.classList.remove(`animate-${animation.animationName.toLowerCase()}`)
        animation.element.style.removeProperty('--animation-duration')
        animation.element.style.removeProperty('--animation-delay')
        animation.element.style.removeProperty('--animation-easing')
      }
    }

    this.activeAnimations.clear()
    this.animationQueue = []
    this.isProcessing = false
  }

  /**
   * Check if animations are supported
   */
  areAnimationsSupported() {
    return window.getComputedStyle(document.body).animation !== undefined
  }

  /**
   * Respect reduced motion preference
   */
  respectsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Generate unique animation ID
   */
  generateAnimationId() {
    return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get active animations count
   */
  getActiveAnimationsCount() {
    return this.activeAnimations.size
  }

  /**
   * Vue composable for component animations
   */
  useComponentAnimation() {
    return {
      animateIn: (element, animation, options) =>
        this.animateIn(element, animation, options),

      animateOut: (element, animation, options) =>
        this.animateOut(element, animation, options),

      animateSequence: (elements, animation, options) =>
        this.animateSequence(elements, animation, options),

      animateParallel: (elements, animation, options) =>
        this.animateParallel(elements, animation, options)
    }
  }
}

// Export singleton instance
export default new AnimationService()
