import { resolve, dirname } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import renderer from 'vite-plugin-electron-renderer'
import svgLoader from 'vite-svg-loader'
import postcssPresetEnv from 'postcss-preset-env'
import packageJson from './package.json' with { type: 'json' }
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to other ports
    host: 'localhost',
    // 仅在开发环境启用热更新
    hmr: process.env.NODE_ENV === 'development'
  },
  main: {
    // --> Bundled as CommonJS
    // externalizeDepsPlugin() basically externises all the dependencies from being bundled during build - treating them as runtime dependencies
    // electron-vite still builds the main and preload processes into commonJS
    // hence, we need to "exclude" (in order to NOT externalise) ESonly modules so that they can be converted to commonJS and can be required() afterwards correctly
    plugins: [
      externalizeDepsPlugin({
        exclude: ['electron-store']
      }),
      {
        name: 'enable-remote-debugging',
        configureServer(server) {
          // Only enable remote debugging in development
          if (process.env.NODE_ENV === 'development') {
            process.env.ELECTRON_ENABLE_REMOTE_DEBUGGING = 'true'
          }
        }
      },
      {
        name: 'copy-i18n-files',
        writeBundle() {
          // 复制翻译文件到输出目录
          const fs = require('fs')
          const path = require('path')
          const srcDir = path.join(__dirname, 'src/shared/i18n/locales')
          const destDir = path.join(__dirname, 'out/main/locales')
          
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
          }
          
          const files = fs.readdirSync(srcDir)
          files.forEach(file => {
            if (file.endsWith('.json')) {
              console.log(`Copying ${file} to ${destDir}`)
              // 使用 readFileSync 和 writeFileSync 避免 Unicode 转义
              const content = fs.readFileSync(
                path.join(srcDir, file),
                'utf8'
              )
              fs.writeFileSync(
                path.join(destDir, file),
                content,
                'utf8'
              )
            }
          })
          console.log('Translation files copied successfully')
        }
      }
    ],
    define: {
      MARKTEXT_VERSION: JSON.stringify(packageJson.version),
      MARKTEXT_VERSION_STRING: JSON.stringify(`v${packageJson.version}`)
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main')
      },
      extensions: ['.mjs', '.js', '.json']
    }
  },
  preload: {
    // --> Bundled as CommonJS
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main')
      },
      extensions: ['.mjs', '.js', '.json']
    }
  },
  renderer: {
    // --> Bundled as ES Modules
    assetsInclude: ['**/*.md'],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main')
      },
      extensions: ['.mjs', '.js', '.json', '.vue']
    },
    plugins: [
      vue(),
      svgLoader(),
      renderer({
        nodeIntegration: true
      })
    ],
    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            stage: 0,
            features: { 'nesting-rules': true }
          })
        ]
      }
    },
    optimizeDeps: {
      // We need to externalise fontmanager-redux as it is not a browser compatible module
      // electron-vite will throw an error during the optimisation step when it tries to optimise it
      exclude: ['fontmanager-redux'],
      // Include muya in optimization to avoid resolution issues
      include: ['muya/lib']
    },
    build: {
      rollupOptions: {
        // This is technically not required since rollUp by default does not bundle require() calls
        // But just in case there are any changes in the future
        external: ['fontmanager-redux', 'muya'],
        output: {
          // 简化chunk分割以避免变量冲突
          manualChunks: (id) => {
            // Vue生态系统
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            // Element Plus UI库
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // 编辑器核心
            if (id.includes('codemirror') || id.includes('muya') || id.includes('katex')) {
              return 'editor-core'
            }
            // 工具库
            if (id.includes('axios') || id.includes('dayjs') || id.includes('dompurify')) {
              return 'utils'
            }
            // 第三方库
            if (id.includes('mermaid') || id.includes('prismjs') || id.includes('turndown')) {
              return 'vendor'
            }
            // 节点模块 - 分离以便缓存
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          // 简化chunk命名以避免冲突
          chunkFileNames: 'js/chunk-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        },
        // 调整Tree Shaking配置
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          // 减少激进优化
          annotations: false,
          unknownGlobalSideEffects: false
        }
      },
      // 启用压缩
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
          pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
        }
      },
      // 启用source map（仅开发环境）
      sourcemap: process.env.NODE_ENV === 'development',
      // 生产环境优化
      ...(process.env.NODE_ENV === 'production' && {
        // 禁用热更新相关功能
        watch: false,
        // 优化生产构建
        cssCodeSplit: false,
        reportCompressedSize: false
      })
    }
  }
})
