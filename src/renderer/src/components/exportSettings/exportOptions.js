import { t } from '@/i18n'

export const getPageSizeList = () => [
  {
    label: t('exportSettings.options.pageSizes.a3'),
    value: 'A3'
  }, {
    label: t('exportSettings.options.pageSizes.a4'),
    value: 'A4'
  }, {
    label: t('exportSettings.options.pageSizes.a5'),
    value: 'A5'
  }, {
    label: t('exportSettings.options.pageSizes.legal'),
    value: 'Legal'
  }, {
    label: t('exportSettings.options.pageSizes.letter'),
    value: 'Letter'
  }, {
    label: t('exportSettings.options.pageSizes.tabloid'),
    value: 'Tabloid'
  }, {
    label: t('exportSettings.options.pageSizes.custom'),
    value: 'custom'
  }
]

export const getHeaderFooterTypes = () => [
  {
    label: t('exportSettings.options.headerFooterTypes.none'),
    value: 0
  }, {
    label: t('exportSettings.options.headerFooterTypes.singleCell'),
    value: 1
  }, {
    label: t('exportSettings.options.headerFooterTypes.threeCells'),
    value: 2
  }
]

export const getHeaderFooterStyles = () => [
  {
    label: t('exportSettings.options.headerFooterStyles.default'),
    value: 0
  }, {
    label: t('exportSettings.options.headerFooterStyles.simple'),
    value: 1
  }, {
    label: t('exportSettings.options.headerFooterStyles.styled'),
    value: 2
  }
]

export const getExportThemeList = () => [{
  label: t('exportSettings.options.themes.academic'),
  value: 'academic'
}, {
  label: t('exportSettings.options.themes.default'),
  value: 'default'
}, {
  label: t('exportSettings.options.themes.liber'),
  value: 'liber'
}]

// 为了向后兼容，保留原有的导出
export const pageSizeList = getPageSizeList()
export const headerFooterTypes = getHeaderFooterTypes()
export const headerFooterStyles = getHeaderFooterStyles()
export const exportThemeList = getExportThemeList()
