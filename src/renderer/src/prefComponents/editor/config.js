import { ENCODING_NAME_MAP } from 'common/encoding'
import { t } from '../../i18n'

export const tabSizeOptions = [{
  label: '1',
  value: 1
}, {
  label: '2',
  value: 2
}, {
  label: '3',
  value: 3
}, {
  label: '4',
  value: 4
}]

export const getEndOfLineOptions = () => [{
  label: t('preferences.editor.fileRepresentation.endOfLine.default'),
  value: 'default'
}, {
  label: t('preferences.editor.fileRepresentation.endOfLine.crlf'),
  value: 'crlf'
}, {
  label: t('preferences.editor.fileRepresentation.endOfLine.lf'),
  value: 'lf'
}]

export const getTrimTrailingNewlineOptions = () => [{
  label: t('preferences.editor.fileRepresentation.trailingNewlines.trimAll'),
  value: 0
}, {
  label: t('preferences.editor.fileRepresentation.trailingNewlines.ensureOne'),
  value: 1
}, {
  label: t('preferences.editor.fileRepresentation.trailingNewlines.preserve'),
  value: 2
}, {
  label: t('preferences.editor.fileRepresentation.trailingNewlines.doNothing'),
  value: 3
}]

export const getTextDirectionOptions = () => [{
  label: t('preferences.editor.misc.textDirection.ltr'),
  value: 'ltr'
}, {
  label: t('preferences.editor.misc.textDirection.rtl'),
  value: 'rtl'
}]

export const getDualScreenModeOptions = () => [{
  label: t('preferences.editor.misc.dualScreenMode.disabled'),
  value: 'disabled'
}, {
  label: t('preferences.editor.misc.dualScreenMode.enabled'),
  value: 'enabled'
}, {
  label: t('preferences.editor.misc.dualScreenMode.auto'),
  value: 'auto'
}]

export const getDualScreenSplitRatioOptions = () => [{
  label: '30% / 70%',
  value: 0.3
}, {
  label: '40% / 60%',
  value: 0.4
}, {
  label: '50% / 50%',
  value: 0.5
}, {
  label: '60% / 40%',
  value: 0.6
}, {
  label: '70% / 30%',
  value: 0.7
}]

let defaultEncodingOptions = null
export const getDefaultEncodingOptions = () => {
  if (defaultEncodingOptions) {
    return defaultEncodingOptions
  }

  defaultEncodingOptions = []
  for (const [value, label] of Object.entries(ENCODING_NAME_MAP)) {
    defaultEncodingOptions.push({ label, value })
  }
  return defaultEncodingOptions
}
