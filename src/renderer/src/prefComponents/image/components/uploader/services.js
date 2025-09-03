// TODO: Remove information from other vue source files into this file.
import { t } from '../../../../i18n'

export const isValidService = name => {
  return name !== 'none' && getServices().hasOwnProperty(name)
}

const getServices = () => ({
  // Dummy service used to opt-in real services.
  none: {
    name: t('preferences.image.uploader.services.none'),
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',

    // Set to true to always allow to change to this dummy service
    agreedToLegalNotices: true
  },

  // Real services
  picgo: {
    name: t('preferences.image.uploader.services.picgo'),
    isGdprCompliant: false,
    privacyUrl: '',
    tosUrl: 'https://github.com/PicGo/PicGo-Core',

    // Currently a non-persistent value
    agreedToLegalNotices: true
  },



  cliScript: {
    name: t('preferences.image.uploader.services.cliScript'),
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',
    agreedToLegalNotices: true
  },

  wechatOfficial: {
    name: t('preferences.image.uploader.wechatOfficial'),
    isGdprCompliant: true,
    privacyUrl: 'https://mp.weixin.qq.com/cgi-bin/privacy',
    tosUrl: 'https://mp.weixin.qq.com/cgi-bin/notice',
    agreedToLegalNotices: false
  }
})

export { getServices }
export default getServices
