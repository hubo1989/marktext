<template>
  <div class="pref-general">
    <h4>{{ t('preferences.general.title') }}</h4>
    <compound>
      <template #head>
        <h6 class="title">{{ t('preferences.general.autoSave.title') }}</h6>
      </template>
      <template #children>
        <bool
          :description="t('preferences.general.autoSave.description')"
          :bool="autoSave"
          :on-change="(value) => onSelectChange('autoSave', value)"
        ></bool>
        <range
          :description="t('preferences.general.autoSave.delayDescription')"
          :value="autoSaveDelay"
          :min="1000"
          :max="10000"
          unit="ms"
          :step="100"
          :on-change="(value) => onSelectChange('autoSaveDelay', value)"
        ></range>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ t('preferences.general.window.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          v-if="!isOsx"
          :description="t('preferences.general.window.titleBarStyle.title')"
          :notes="t('preferences.general.window.requiresRestart')"
          :value="titleBarStyle"
          :options="getTitleBarStyleOptions()"
          :on-change="(value) => onSelectChange('titleBarStyle', value)"
        ></cur-select>
        <bool
          :description="t('preferences.general.window.hideScrollbars')"
          :bool="hideScrollbar"
          :on-change="(value) => onSelectChange('hideScrollbar', value)"
        ></bool>
        <bool
          :description="t('preferences.general.window.openFilesInNewWindow')"
          :bool="openFilesInNewWindow"
          :on-change="(value) => onSelectChange('openFilesInNewWindow', value)"
        ></bool>
        <bool
          :description="t('preferences.general.window.openFoldersInNewWindow')"
          :bool="openFolderInNewWindow"
          :on-change="(value) => onSelectChange('openFolderInNewWindow', value)"
        ></bool>
        <cur-select
          :description="t('preferences.general.window.zoom')"
          :value="zoom"
          :options="zoomOptions"
          :on-change="(value) => onSelectChange('zoom', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ t('preferences.general.sidebar.title') }}</h6>
      </template>
      <template #children>
        <bool
          :description="t('preferences.general.sidebar.wrapTextInToc')"
          :bool="wordWrapInToc"
          :on-change="(value) => onSelectChange('wordWrapInToc', value)"
        ></bool>

        <text-box
          :description="t('preferences.general.sidebar.excludePatterns')"
          :notes="t('preferences.general.sidebar.excludePatternsNotes')"
          :input="projectPaths.join(',')"
          :on-change="(value) => onSelectChange('treePathExcludePatterns', value.split(','))"
          more="https://github.com/isaacs/minimatch"
        ></text-box>

        <!-- TODO: The description is very bad and the entry isn't used by the editor. -->
        <cur-select
          :description="t('preferences.general.sidebar.fileSortBy.title')"
          :value="fileSortBy"
          :options="getFileSortByOptions()"
          :on-change="(value) => onSelectChange('fileSortBy', value)"
          :disable="true"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ t('preferences.general.startup.title') }}</h6>
      </template>
      <template #children>
        <section class="startup-action-ctrl">
          <el-radio-group v-model="startUpAction" class="startup-radio-group">
            <el-radio label="lastState" class="startup-radio-item">
              <span class="radio-label">{{ t('preferences.general.startup.restoreLastSession') }}</span>
            </el-radio>
            <el-radio label="folder" class="startup-radio-item">
              <div class="radio-content">
                <span class="radio-label">{{ t('preferences.general.startup.openDefaultDirectory') }}</span>
                <span class="radio-value">: {{ defaultDirectoryToOpen }}</span>
                <el-button size="small" @click="selectDefaultDirectoryToOpen" class="select-btn">
                  {{ t('preferences.general.startup.selectFolder') }}
                </el-button>
              </div>
            </el-radio>
            <el-radio label="blank" class="startup-radio-item">
              <span class="radio-label">{{ t('preferences.general.startup.openBlankPage') }}</span>
            </el-radio>
          </el-radio-group>
        </section>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ t('preferences.general.misc.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="t('preferences.general.misc.language.title')"
          :value="language"
          :options="getLanguageOptions()"
          :on-change="(value) => onSelectChange('language', value)"
        ></cur-select>
      </template>
    </compound>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/store/preferences'
import Compound from '../common/compound/index.vue'
import Range from '../common/range/index.vue'
import CurSelect from '../common/select/index.vue'
import Bool from '../common/bool/index.vue'
import textBox from '../common/textBox/index.vue'
import { isOsx } from '@/util'

import { getTitleBarStyleOptions, zoomOptions, getFileSortByOptions, getLanguageOptions } from './config'

const { t } = useI18n()
const preferenceStore = usePreferencesStore()

const {
  autoSave,
  autoSaveDelay,
  titleBarStyle,
  defaultDirectoryToOpen,
  openFilesInNewWindow,
  openFolderInNewWindow,
  treePathExcludePatterns: projectPaths,
  zoom,
  hideScrollbar,
  wordWrapInToc,
  fileSortBy,
  language
} = storeToRefs(preferenceStore)

const startUpAction = computed({
  get: () => preferenceStore.startUpAction,
  set: (value) => {
    const type = 'startUpAction'
    preferenceStore.SET_SINGLE_PREFERENCE({ type, value })
  }
})

const onSelectChange = (type, value) => {
  preferenceStore.SET_SINGLE_PREFERENCE({ type, value })
}

const selectDefaultDirectoryToOpen = () => {
  preferenceStore.SELECT_DEFAULT_DIRECTORY_TO_OPEN()
}
</script>

<style scoped>
.pref-general .startup-action-ctrl {
  font-size: 14px;
  user-select: none;
  color: var(--editorColor);
}

.startup-radio-group {
  width: 100%;
}

.startup-radio-item {
  display: block;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.startup-radio-item:hover {
  background-color: var(--floatBgColor);
}

.radio-label {
  font-weight: 500;
  color: var(--editorColor);
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.radio-value {
  color: var(--editorColor80);
  font-size: 13px;
  flex: 1;
}

.select-btn {
  margin-left: auto;
  min-width: 80px;
}

.pref-general .startup-action-ctrl .el-radio {
  margin-right: 0;
}

.pref-general .startup-action-ctrl .el-radio__input {
  margin-right: 8px;
}

.pref-general .startup-action-ctrl .el-radio__label {
  display: block;
  width: 100%;
}
</style>
