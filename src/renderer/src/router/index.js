// 直接使用 Vue 的 defineAsyncComponent
import { defineAsyncComponent } from 'vue'

// 创建异步组件包装器
const App = defineAsyncComponent(() =>
  import(/* webpackChunkName: "app" */ '@/pages/app')
)

const Preference = defineAsyncComponent(() =>
  import(/* webpackChunkName: "preference" */ '@/pages/preference')
)

const General = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-general" */ '@/prefComponents/general')
)

const Editor = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-editor" */ '@/prefComponents/editor')
)

const Markdown = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-markdown" */ '@/prefComponents/markdown')
)

const SpellChecker = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-spellchecker" */ '@/prefComponents/spellchecker')
)

const Theme = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-theme" */ '@/prefComponents/theme')
)

const Image = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-image" */ '@/prefComponents/image')
)

const Keybindings = defineAsyncComponent(() =>
  import(/* webpackChunkName: "pref-keybindings" */ '@/prefComponents/keybindings')
)

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
