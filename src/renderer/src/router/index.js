// 动态导入主要页面组件（代码分割）
const App = () => import(/* webpackChunkName: "app" */ '@/pages/app')
const Preference = () => import(/* webpackChunkName: "preference" */ '@/pages/preference')

// 动态导入偏好设置组件（按功能分组）
const General = () => import(/* webpackChunkName: "pref-general" */ '@/prefComponents/general')
const Editor = () => import(/* webpackChunkName: "pref-editor" */ '@/prefComponents/editor')
const Markdown = () => import(/* webpackChunkName: "pref-markdown" */ '@/prefComponents/markdown')
const SpellChecker = () => import(/* webpackChunkName: "pref-spellchecker" */ '@/prefComponents/spellchecker')
const Theme = () => import(/* webpackChunkName: "pref-theme" */ '@/prefComponents/theme')
const Image = () => import(/* webpackChunkName: "pref-image" */ '@/prefComponents/image')
const Keybindings = () => import(/* webpackChunkName: "pref-keybindings" */ '@/prefComponents/keybindings')

const parseSettingsPage = (type) => {
  let pageUrl = '/preference'
  if (/\/spelling$/.test(type)) {
    pageUrl += '/spelling'
  }
  return pageUrl
}

const routes = (type) => [
  {
    path: '/',
    redirect: type === 'editor' ? '/editor' : parseSettingsPage(type)
  },
  {
    path: '/editor',
    component: App,
    meta: {
      // 预加载相关路由
      preload: ['preference']
    }
  },
  {
    path: '/preference',
    component: Preference,
    meta: {
      // 预加载所有子路由组件
      preload: ['general', 'editor', 'markdown', 'spelling', 'theme', 'image', 'keybindings']
    },
    children: [
      {
        path: '',
        component: General,
        meta: {
          preload: ['editor', 'markdown']
        }
      },
      {
        path: 'general',
        component: General,
        name: 'general',
        meta: {
          preload: ['editor', 'markdown']
        }
      },
      {
        path: 'editor',
        component: Editor,
        name: 'editor',
        meta: {
          preload: ['markdown', 'theme']
        }
      },
      {
        path: 'markdown',
        component: Markdown,
        name: 'markdown',
        meta: {
          preload: ['theme', 'image']
        }
      },
      {
        path: 'spelling',
        component: SpellChecker,
        name: 'spelling',
        meta: {
          preload: ['theme']
        }
      },
      {
        path: 'theme',
        component: Theme,
        name: 'theme',
        meta: {
          preload: ['image', 'keybindings']
        }
      },
      {
        path: 'image',
        component: Image,
        name: 'image',
        meta: {
          preload: ['keybindings']
        }
      },
      {
        path: 'keybindings',
        component: Keybindings,
        name: 'keybindings'
      }
    ]
  }
]

export default routes
