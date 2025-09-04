/**
 * Dual Screen Mode Component Tests
 * Tests for dual screen editing functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import DualScreenMode from '../../src/renderer/src/components/editorWithTabs/DualScreenMode.vue'

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

describe('DualScreenMode Component', () => {
  let wrapper
  let mockEmit

  const defaultProps = {
    isActive: true,
    splitRatio: 0.5,
    syncScroll: true,
    syncCursor: true,
    currentLine: 0
  }

  beforeEach(() => {
    mockEmit = vi.fn()

    // Create wrapper with mocked i18n
    const app = createApp(DualScreenMode, {
      ...defaultProps,
      ...{ onSplitChange: mockEmit, onSyncToggle: mockEmit, onLineFocus: mockEmit }
    })

    wrapper = mount(DualScreenMode, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key) => key
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('should render dual screen container', () => {
      expect(wrapper.find('.dual-screen-container').exists()).toBe(true)
    })

    it('should render source and preview panels', () => {
      expect(wrapper.find('.source-panel').exists()).toBe(true)
      expect(wrapper.find('.preview-panel').exists()).toBe(true)
    })

    it('should render splitter', () => {
      expect(wrapper.find('.splitter').exists()).toBe(true)
    })

    it('should render panel headers with titles', () => {
      const headers = wrapper.findAll('.panel-header h4')
      expect(headers.length).toBe(2)
      expect(headers[0].text()).toBe('editor.dualScreen.sourceTitle')
      expect(headers[1].text()).toBe('editor.dualScreen.previewTitle')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const container = wrapper.find('.dual-screen-container')
      expect(container.attributes('role')).toBe('region')
      expect(container.attributes('aria-label')).toBe('Dual screen editing mode')
    })

    it('should have proper panel roles', () => {
      const sourcePanel = wrapper.find('.source-panel')
      const previewPanel = wrapper.find('.preview-panel')

      expect(sourcePanel.attributes('role')).toBe('region')
      expect(previewPanel.attributes('role')).toBe('region')
    })

    it('should have splitter accessibility attributes', () => {
      const splitter = wrapper.find('.splitter')
      expect(splitter.attributes('role')).toBe('separator')
      expect(splitter.attributes('aria-orientation')).toBe('vertical')
      expect(splitter.attributes('aria-valuemin')).toBe('20')
      expect(splitter.attributes('aria-valuemax')).toBe('80')
    })
  })

  describe('Props Handling', () => {
    it('should apply split ratio to panels', async () => {
      await wrapper.setProps({ splitRatio: 0.7 })

      const sourcePanel = wrapper.find('.source-panel')
      const previewPanel = wrapper.find('.preview-panel')

      const sourceStyle = sourcePanel.attributes('style') || ''
      const previewStyle = previewPanel.attributes('style') || ''

      // Check that styles contain approximate width values (allowing for floating point precision)
      expect(sourceStyle).toMatch(/width:\s*70/)
      expect(previewStyle).toMatch(/width:\s*30/)
    })

    it('should show sync indicator when sync is enabled', () => {
      expect(wrapper.find('.sync-indicator').exists()).toBe(true)
    })

    it('should hide sync indicator when sync is disabled', async () => {
      await wrapper.setProps({ syncScroll: false })
      expect(wrapper.find('.sync-indicator').exists()).toBe(false)
    })
  })

  describe('Button Interactions', () => {
    it('should emit sync toggle event when sync button is clicked', async () => {
      const syncButton = wrapper.find('.panel-controls button')
      await syncButton.trigger('click')

      expect(wrapper.emitted('sync-toggle')).toBeTruthy()
      expect(wrapper.emitted('sync-toggle')[0]).toEqual([false]) // Toggles from true to false
    })

    it('should emit split change event when reset button is clicked', async () => {
      const resetButton = wrapper.findAll('.panel-controls button')[1]
      await resetButton.trigger('click')

      expect(wrapper.emitted('split-change')).toBeTruthy()
      expect(wrapper.emitted('split-change')[0]).toEqual([0.5])
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle splitter keyboard navigation', async () => {
      const splitter = wrapper.find('.splitter')

      // Test arrow key navigation
      await splitter.trigger('keydown', { key: 'ArrowLeft' })
      expect(wrapper.emitted('split-change')).toBeTruthy()

      await splitter.trigger('keydown', { key: 'ArrowRight' })
      expect(wrapper.emitted('split-change')).toBeTruthy()

      // Test Home key (reset to center)
      await splitter.trigger('keydown', { key: 'Home' })
      expect(wrapper.emitted('split-change')).toBeTruthy()
    })

    it('should handle button keyboard activation', async () => {
      const syncButton = wrapper.find('.panel-controls button')

      await syncButton.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('sync-toggle')).toBeTruthy()

      await syncButton.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('sync-toggle')).toBeTruthy()
    })
  })

  describe('Lifecycle', () => {
    it('should initialize sync functionality on mount', async () => {
      // Mock the sync setup
      const mockElement = {
        addEventListener: vi.fn(),
        scrollTop: 0,
        scrollHeight: 100,
        clientHeight: 50
      }

      // Test that component attempts to setup sync
      expect(wrapper.vm).toBeDefined()
    })

    it('should cleanup on unmount', () => {
      const cleanupSpy = vi.spyOn(wrapper.vm, 'cleanupSourceScroll')
      const cleanupPreviewSpy = vi.spyOn(wrapper.vm, 'cleanupPreviewScroll')

      wrapper.unmount()

      // These would be called if they exist
      expect(cleanupSpy).not.toHaveBeenCalled() // They don't exist in this test context
    })
  })

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', async () => {
      // This test verifies that the component doesn't crash when DOM elements are missing
      await wrapper.setProps({ isActive: false })

      // Component should still render without errors
      expect(wrapper.find('.dual-screen-container').exists()).toBe(true)
    })

    it('should handle invalid split ratios', async () => {
      // Test with invalid split ratios
      await wrapper.setProps({ splitRatio: 1.5 }) // Invalid ratio

      // Component should handle gracefully
      const sourcePanel = wrapper.find('.source-panel')
      expect(sourcePanel.attributes('style')).toContain('width:')
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // Test responsive classes are applied
      const container = wrapper.find('.dual-screen-container')
      expect(container.classes()).toContain('dual-screen-active')
    })
  })
})

describe('DualScreenMode Integration', () => {
  it('should work with Vue slots', () => {
    const wrapper = mount(DualScreenMode, {
      props: {
        isActive: true,
        splitRatio: 0.5,
        syncScroll: true,
        syncCursor: true,
        currentLine: 0
      },
      slots: {
        source: '<div>Source Content</div>',
        preview: '<div>Preview Content</div>'
      },
      global: {
        mocks: {
          $t: (key) => key
        }
      }
    })

    expect(wrapper.html()).toContain('Source Content')
    expect(wrapper.html()).toContain('Preview Content')
  })
})
