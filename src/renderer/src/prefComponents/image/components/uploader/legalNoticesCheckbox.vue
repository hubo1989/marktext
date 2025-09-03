<template>
  <div class="pref-cb-legal-notices">
    <el-checkbox v-model="localAgreed" @change="handleChange"></el-checkbox>
    <span>
      {{ t('preferences.image.uploader.legalNotices.byUsing', { name: uploaderService.name }) }}
      <span class="link" @click="openUrl(uploaderService.privacyUrl)">{{ t('preferences.image.uploader.legalNotices.privacyStatement') }}</span>
      {{ t('preferences.image.uploader.legalNotices.and') }}
      <span class="link" @click="openUrl(uploaderService.tosUrl)">{{ t('preferences.image.uploader.legalNotices.termsOfService') }}</span>.
      <span v-if="!uploaderService.isGdprCompliant"
        >{{ t('preferences.image.uploader.legalNotices.gdprWarning') }}</span
      >
    </span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  uploaderService: Object
})

const emit = defineEmits(['update:agreed'])

// 本地状态
const localAgreed = ref(false)

// 监听props变化，同步本地状态
watch(() => props.uploaderService?.agreedToLegalNotices, (newValue) => {
  localAgreed.value = newValue || false
}, { immediate: true })

// 处理复选框变化
const handleChange = (value) => {
  localAgreed.value = value
  // 直接修改service对象的属性（与原实现保持一致）
  if (props.uploaderService) {
    props.uploaderService.agreedToLegalNotices = value
  }
  // 发射事件供父组件监听
  emit('update:agreed', value)
}

const openUrl = (link) => {
  if (link) {
    window.electron.shell.openExternal(link)
  }
}

// 初始化时设置本地状态
onMounted(() => {
  if (props.uploaderService) {
    localAgreed.value = props.uploaderService.agreedToLegalNotices || false
  }
})
</script>

<style>
.pref-cb-legal-notices {
  border: 1px solid transparent;
  padding: 3px 5px;
  & .el-checkbox {
    margin-right: 0;
  }
}
</style>
