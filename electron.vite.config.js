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
    hmr: process.env.NODE_ENV === 'development',
    // CSP headers to allow SharedWorker
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' blob:; worker-src 'self' blob:; connect-src 'self' ws: wss: http: https:;"
    }
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
      exclude: ['fontmanager-redux', 'cytoscape'],
      // Include muya in optimization to avoid resolution issues
      include: ['muya/lib'],
      // Handle ESM modules that need special treatment
      esbuildOptions: {
        // Allow dynamic imports of ESM modules
        format: 'esm',
        target: 'esnext'
      }
    },
    build: {
      rollupOptions: {
        // This is technically not required since rollUp by default does not bundle require() calls
        // But just in case there are any changes in the future
        external: ['fontmanager-redux', 'muya', 'mermaid', 'cytoscape'],
        output: {
          // 完全使用默认chunk策略，避免手动分割导致的变量冲突
          // 移除所有manualChunks配置
          chunkFileNames: 'js/chunk-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        },
        // 最小化Tree Shaking以避免变量作用域问题
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          // 禁用所有可能导致问题的优化
          annotations: false,
          unknownGlobalSideEffects: false,
          tryCatchDeoptimization: false,
          // 禁用更激进的优化
          correctVarValueUndefined: false,
          pure_getters: false
        }
      },
      // 启用压缩，但减少优化以避免变量作用域问题
      minify: 'terser',
      terserOptions: {
        compress: {
          // 减少压缩优化以避免变量作用域问题
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
          pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          // 禁用可能导致问题的优化
          collapse_vars: false,
          reduce_vars: false,
          pure_getters: false
        },
        mangle: {
          // 减少变量名混淆以避免作用域问题
          toplevel: false
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
