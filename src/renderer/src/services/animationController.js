/**
 * Animation Controller
 * Coordinates and manages complex animation sequences and performance optimization
 */

import animationService from './animationService.js'

class AnimationController {
  constructor() {
    this.queues = new Map()
    this.activeSequences = new Map()
    this.performanceMode = this.detectPerformanceMode()
    this.isEnabled = true
    this.rafId = null
    this.lastFrameTime = 0
  }

  /**
   * Detect optimal performance mode
   */
  detectPerformanceMode() {
    // Check device capabilities
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection

    const isSlowConnection = connection &&
                            (connection.effectiveType === 'slow-2g' ||
                             connection.effectiveType === '2g')

    const isLowEndDevice = navigator.hardwareConcurrency <= 2
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return 'reduced'
    if (isSlowConnection || isLowEndDevice) return 'low'
    return 'high'
  }

  /**
   * Create animation queue
   */
  createQueue(queueName, options = {}) {
    const queue = {
      name: queueName,
      animations: [],
      isRunning: false,
      options: {
        concurrent: false,
        maxConcurrent: 3,
        stagger: 0,
        ...options
      }
    }

    this.queues.set(queueName, queue)
    return queue
  }

  /**
   * Add animation to queue
   */
  addToQueue(queueName, animation) {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`)
    }

    queue.animations.push({
      id: this.generateId(),
      ...animation,
      status: 'pending'
    })

    // Auto-start if not running
    if (!queue.isRunning) {
      this.processQueue(queueName)
    }
  }

  /**
   * Process animation queue
   */
  async processQueue(queueName) {
    const queue = this.queues.get(queueName)
    if (!queue || queue.isRunning) return

    queue.isRunning = true

    try {
      const { concurrent, maxConcurrent, stagger } = queue.options

      if (concurrent) {
        // Process animations concurrently with limit
        await this.processConcurrent(queue, maxConcurrent)
      } else {
        // Process animations sequentially with stagger
        await this.processSequential(queue, stagger)
      }
    } finally {
      queue.isRunning = false
    }
  }

  /**
   * Process animations concurrently
   */
  async processConcurrent(queue, maxConcurrent) {
    const chunks = this.chunkArray(queue.animations, maxConcurrent)

    for (const chunk of chunks) {
      const promises = chunk
        .filter(anim => anim.status === 'pending')
        .map(async (animation) => {
          animation.status = 'running'
          try {
            await this.executeAnimation(animation)
            animation.status = 'completed'
          } catch (error) {
            animation.status = 'failed'
            animation.error = error
          }
        })

      await Promise.all(promises)
    }
  }

  /**
   * Process animations sequentially
   */
  async processSequential(queue, stagger) {
    for (const animation of queue.animations) {
      if (animation.status !== 'pending') continue

      animation.status = 'running'
      try {
        await this.executeAnimation(animation)
        animation.status = 'completed'

        // Apply stagger delay
        if (stagger > 0) {
          await this.delay(stagger)
        }
      } catch (error) {
        animation.status = 'failed'
        animation.error = error
      }
    }
  }

  /**
   * Execute individual animation
   */
  async executeAnimation(animation) {
    const {
      type,
      element,
      animation: animationName,
      options = {}
    } = animation

    // Skip if animations disabled
    if (!this.isEnabled) return

    // Adjust for performance mode
    const adjustedOptions = this.adjustForPerformance(options)

    switch (type) {
      case 'in':
        return animationService.animateIn(element, animationName, adjustedOptions)
      case 'out':
        return animationService.animateOut(element, animationName, adjustedOptions)
      case 'custom':
        return animationService.animateElement(element, animationName, adjustedOptions)
      default:
        throw new Error(`Unknown animation type: ${type}`)
    }
  }

  /**
   * Adjust animation options based on performance mode
   */
  adjustForPerformance(options) {
    const adjusted = { ...options }

    switch (this.performanceMode) {
      case 'reduced':
        // Disable all animations
        adjusted.duration = '0ms'
        break
      case 'low':
        // Reduce duration and complexity
        adjusted.duration = options.duration ?
          this.reduceDuration(options.duration) : '200ms'
        break
      case 'high':
        // Use full animations
        break
    }

    return adjusted
  }

  /**
   * Reduce animation duration for performance
   */
  reduceDuration(duration) {
    if (typeof duration === 'string') {
      const match = duration.match(/(\d+)ms/)
      if (match) {
        return `${Math.max(100, parseInt(match[1]) * 0.6)}ms`
      }
    }
    return '200ms'
  }

  /**
   * Create complex animation sequence
   */
  createSequence(sequenceName, steps) {
    const sequence = {
      name: sequenceName,
      steps,
      status: 'ready',
      progress: 0
    }

    this.activeSequences.set(sequenceName, sequence)
    return sequence
  }

  /**
   * Play animation sequence
   */
  async playSequence(sequenceName, options = {}) {
    const sequence = this.activeSequences.get(sequenceName)
    if (!sequence) {
      throw new Error(`Sequence '${sequenceName}' not found`)
    }

    sequence.status = 'running'
    sequence.progress = 0

    try {
      for (let i = 0; i < sequence.steps.length; i++) {
        const step = sequence.steps[i]

        // Execute step
        await this.executeStep(step, options)

        // Update progress
        sequence.progress = (i + 1) / sequence.steps.length

        // Call progress callback
        if (options.onProgress) {
          options.onProgress(sequence.progress)
        }
      }

      sequence.status = 'completed'
      if (options.onComplete) {
        options.onComplete()
      }

    } catch (error) {
      sequence.status = 'failed'
      sequence.error = error
      if (options.onError) {
        options.onError(error)
      }
      throw error
    }
  }

  /**
   * Execute sequence step
   */
  async executeStep(step, options) {
    const { type, ...stepOptions } = step

    switch (type) {
      case 'queue':
        return this.processQueue(step.queueName)
      case 'animation':
        return this.executeAnimation(step)
      case 'delay':
        return this.delay(step.duration)
      case 'parallel':
        return Promise.all(
          step.animations.map(anim => this.executeAnimation(anim))
        )
      default:
        throw new Error(`Unknown step type: ${type}`)
    }
  }

  /**
   * Performance monitoring
   */
  startPerformanceMonitoring() {
    const monitorFrame = (currentTime) => {
      const deltaTime = currentTime - this.lastFrameTime

      // Check for frame drops (assuming 60fps)
      if (deltaTime > 16.67 * 2) {
        console.warn('Animation frame drop detected:', deltaTime)
      }

      this.lastFrameTime = currentTime
      this.rafId = requestAnimationFrame(monitorFrame)
    }

    this.rafId = requestAnimationFrame(monitorFrame)
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * Enable/disable animations globally
   */
  setEnabled(enabled) {
    this.isEnabled = enabled

    if (!enabled) {
      // Cancel all active animations
      this.cancelAll()
    }
  }

  /**
   * Cancel all active animations and sequences
   */
  cancelAll() {
    // Cancel queues
    for (const [name, queue] of this.queues) {
      queue.animations = queue.animations.filter(anim =>
        anim.status === 'completed' || anim.status === 'failed'
      )
      queue.isRunning = false
    }

    // Cancel sequences
    for (const [name, sequence] of this.activeSequences) {
      if (sequence.status === 'running') {
        sequence.status = 'cancelled'
      }
    }

    // Cancel service animations
    animationService.stopAllAnimations()
  }

  /**
   * Get controller status
   */
  getStatus() {
    return {
      queues: Array.from(this.queues.entries()).map(([name, queue]) => ({
        name,
        animationCount: queue.animations.length,
        isRunning: queue.isRunning
      })),
      sequences: Array.from(this.activeSequences.entries()).map(([name, sequence]) => ({
        name,
        status: sequence.status,
        progress: sequence.progress
      })),
      performanceMode: this.performanceMode,
      isEnabled: this.isEnabled
    }
  }

  /**
   * Utility methods
   */
  generateId() {
    return `anim_ctrl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Initialize the animation controller
   */
  initialize() {
    console.log('🎨 [AnimationController] Initializing animation controller')

    // Set up performance monitoring
    this.setupPerformanceMonitoring()

    // Set up reduced motion listener
    this.setupReducedMotionListener()

    // Load preset sequences
    this.loadPresetSequences()

    // Start performance monitoring
    this.startPerformanceMonitoring()

    console.log('✅ [AnimationController] Animation controller initialized successfully')
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor animation performance
    this.performanceStats = {
      totalAnimations: 0,
      failedAnimations: 0,
      averageDuration: 0,
      frameDrops: 0
    }
  }

  /**
   * Set up reduced motion listener
   */
  setupReducedMotionListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', (event) => {
      console.log('🎨 [AnimationController] Reduced motion preference changed:', event.matches)

      if (event.matches) {
        this.performanceMode = 'reduced'
        this.setEnabled(false)
      } else {
        this.performanceMode = this.detectPerformanceMode()
        this.setEnabled(true)
      }
    })

    // Apply initial preference
    if (mediaQuery.matches) {
      this.performanceMode = 'reduced'
      this.setEnabled(false)
    }
  }

  /**
   * Load preset sequences
   */
  loadPresetSequences() {
    const presets = this.getPresetSequences()

    // Create queues for preset sequences
    Object.keys(presets).forEach(sequenceName => {
      this.createSequence(sequenceName, presets[sequenceName])
    })
  }

  /**
   * Preset sequences for common UI patterns
   */
  getPresetSequences() {
    return {
      pageLoad: [
        { type: 'animation', element: '.header', animation: 'slideInTop', options: { delay: 0 } },
        { type: 'animation', element: '.sidebar', animation: 'slideInLeft', options: { delay: 100 } },
        { type: 'animation', element: '.main-content', animation: 'fadeIn', options: { delay: 200 } },
        { type: 'animation', element: '.footer', animation: 'slideInBottom', options: { delay: 300 } }
      ],

      modalOpen: [
        { type: 'animation', element: '.modal-backdrop', animation: 'fadeIn', options: { duration: '200ms' } },
        { type: 'delay', duration: 50 },
        { type: 'animation', element: '.modal-content', animation: 'scaleIn', options: { duration: '300ms' } }
      ],

      listLoad: [
        { type: 'parallel', animations: [
          { element: '.list-item:nth-child(1)', animation: 'slideInBottom', options: { delay: 0 } },
          { element: '.list-item:nth-child(2)', animation: 'slideInBottom', options: { delay: 50 } },
          { element: '.list-item:nth-child(3)', animation: 'slideInBottom', options: { delay: 100 } }
        ]}
      ]
    }
  }
}

// Export singleton instance
export default new AnimationController()
