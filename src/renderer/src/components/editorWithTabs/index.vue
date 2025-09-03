<template>
  <div
    class="editor-with-tabs"
    :style="{ 'max-width': showSideBar ? `calc(100vw - ${sideBarWidth}px)` : '100vw' }"
  >
    <tabs v-show="showTabBar"></tabs>
    <div class="container">
      <!-- Dual Screen Mode -->
      <dual-screen-mode
        v-if="isDualScreenActive"
        :is-active="isDualScreenActive"
        :split-ratio="dualScreenSplitRatio"
        :sync-scroll="dualScreenSyncScroll"
        :sync-cursor="dualScreenSyncCursor"
        :current-line="currentLine"
        @split-change="handleSplitChange"
        @sync-toggle="handleSyncToggle"
        @line-focus="handleLineFocus"
      >
        <template #source>
          <source-code
            :markdown="markdown"
            :muyaIndexCursor="muyaIndexCursor"
            :text-direction="textDirection"
          ></source-code>
        </template>
        <template #preview>
          <source-code
            :markdown="markdown"
            :muyaIndexCursor="muyaIndexCursor"
            :text-direction="textDirection"
          ></source-code>
        </template>
      </dual-screen-mode>

      <!-- Single Screen Mode -->
      <template v-else>
        <editor
          v-if="!sourceCode"
          :markdown="markdown"
          :cursor="cursor"
          :text-direction="textDirection"
          :platform="platform"
        ></editor>
        <source-code
          v-else
          :markdown="markdown"
          :muyaIndexCursor="muyaIndexCursor"
          :text-direction="textDirection"
        ></source-code>
      </template>
    </div>
    <tab-notifications></tab-notifications>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLayoutStore } from '@/store/layout'
import { usePreferencesStore } from '@/store/preferences'
import { storeToRefs } from 'pinia'
import Tabs from './tabs.vue'
import Editor from './editor.vue'
import SourceCode from './sourceCode.vue'
import TabNotifications from './notifications.vue'
import DualScreenMode from './DualScreenMode.vue'

const props = defineProps({
  markdown: {
    type: String,
    required: true
  },
  cursor: {
    validator(value) {
      return typeof value === 'object'
    },
    required: true
  },
  muyaIndexCursor: {
    type: Object
  },
  sourceCode: {
    type: Boolean,
    required: true
  },
  showTabBar: {
    type: Boolean,
    required: true
  },
  textDirection: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  }
})

const layoutStore = useLayoutStore()
const preferencesStore = usePreferencesStore()

const { showSideBar, sideBarWidth } = storeToRefs(layoutStore)
const {
  dualScreenMode,
  dualScreenSplitRatio,
  dualScreenSyncScroll,
  dualScreenSyncCursor
} = storeToRefs(preferencesStore)

// Computed
const isDualScreenActive = computed(() => {
  return props.sourceCode && dualScreenMode.value === 'enabled'
})

const currentLine = ref(0)

// Methods
const handleSplitChange = (newRatio) => {
  preferencesStore.SET_SINGLE_PREFERENCE({
    type: 'dualScreenSplitRatio',
    value: newRatio
  })
}

const handleSyncToggle = (enabled) => {
  preferencesStore.SET_SINGLE_PREFERENCE({
    type: 'dualScreenSyncScroll',
    value: enabled
  })
  preferencesStore.SET_SINGLE_PREFERENCE({
    type: 'dualScreenSyncCursor',
    value: enabled
  })
}

const handleLineFocus = (lineNumber) => {
  currentLine.value = lineNumber
  // 这里可以添加聚焦到特定行的逻辑
}
</script>

<style scoped>
.editor-with-tabs {
  position: relative;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  overflow: hidden;
  background: var(--editorBgColor);
  & > .container {
    flex: 1;
    overflow: hidden;
  }
}
</style>
