/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

// 全局类型声明
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on(channel: string, listener: (...args: any[]) => void): void
        off(channel: string, listener: (...args: any[]) => void): void
        send(channel: string, ...args: any[]): void
        sendSync(channel: string, ...args: any[]): any
        once(channel: string, listener: (...args: any[]) => void): void
        removeListener(channel: string, listener: (...args: any[]) => void): void
        removeAllListeners(channel?: string): void
      }
      process: {
        platform: 'darwin' | 'win32' | 'linux'
        env: {
          MARKTEXT_VERSION_STRING?: string
          MARKTEXT_VERSION?: string
          NODE_ENV?: string
        }
      }
      clipboard: {
        writeText(text: string): void
        readText(): string
      }
      shell: {
        showItemInFolder(path: string): void
        openExternal(url: string): Promise<void>
      }
      webFrame: {
        setZoomFactor(factor: number): void
      }
    }
    fileUtils: {
      isSamePathSync(path1: string, path2: string): boolean
    }
    path: {
      join(...paths: string[]): string
      dirname(path: string): string
      basename(path: string, ext?: string): string
      extname(path: string): string
    }
    fs: {
      existsSync(path: string): boolean
      mkdirSync(path: string, options?: any): void
      readFileSync(path: string, encoding?: string): string | Buffer
      writeFileSync(path: string, data: string | Buffer, encoding?: string): void
      readdirSync(path: string): string[]
    }
    DIRNAME: string
    marktext: {
      env: {
        type: string
        windowId: string
      }
      initialState: any
    }
  }

  // 工具函数类型
  const t: (key: string, options?: any) => string
  const isOsx: boolean
}

// Vue组件props类型工具
type ExtractPropTypes<T> = T extends { props: infer P }
  ? { [K in keyof P]: P[K] extends { type: infer T; default?: infer D } ? T : P[K] }
  : {}

// 模块声明
declare module 'muya/lib'
declare module 'muya/lib/ui/*'
declare module 'view-image'
declare module 'fontmanager-redux'
declare module '@marktext/file-icons'
declare module 'joplin-turndown-plugin-gfm'
declare module 'vite-plugin-prismjs'
declare module 'webfontloader'
declare module 'github-markdown-css'

