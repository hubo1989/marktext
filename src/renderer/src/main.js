import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import bootstrapRenderer from './bootstrap'
import axios from './axios'
import pinia from './store'
import { useEditorStore } from './store/editor'
import './assets/symbolIcon'

// Element Plus instead of Element UI for Vue 3
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import en from 'element-plus/es/locale/lang/en'

// I18n translation system
import i18nPlugin from './i18n'

// something is wrong here! \/
import services from './services/index'
import routes from './router'
import { setupRoutePreloading } from './utils/routePreloader'
import Main from './Main.vue'

import './assets/styles/index.css'
import './assets/styles/printService.css'

// -----------------------------------------------

global.marktext = {}
bootstrapRenderer()

// -----------------------------------------------
// Be careful when changing code before this line!

// Create Vue app
const app = createApp(Main)

// Configure Element Plus with locale
app.use(ElementPlus, {
  locale: en
})

const router = createRouter({
  history: createWebHashHistory(),
  // it seems like something might have changed in vue-router? it uses the full "file path" instead of
  // links like /editor if we use the old createWebHistory()
  routes: routes(global.marktext.env.type)
})

// 设置路由预加载
setupRoutePreloading(router)

app.use(router)
app.use(pinia)
app.use(i18nPlugin)

// Initialize editor store modules after pinia is ready
console.log('📦 [MAIN] Initializing editor store...')
const editorStore = useEditorStore()
console.log('📦 [MAIN] Editor store created:', !!editorStore)

// Initialize modules
console.log('📦 [MAIN] Initializing editor store modules...')
editorStore.initializeModules()
console.log('📦 [MAIN] Editor store modules initialized')

// Register bootstrap listener early
console.log('📦 [MAIN] Registering bootstrap listener...')
editorStore.LISTEN_FOR_BOOTSTRAP_WINDOW()
console.log('📦 [MAIN] Bootstrap listener registered')

// Configure axios globally
app.config.globalProperties.$http = axios

// Register services globally
services.forEach((s) => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})

// Mount the app
app.mount('#app')
