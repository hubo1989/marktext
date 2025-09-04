# CLAUDE.md

该文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 命令

### 开发
- `npm run dev`: 以开发模式启动应用，并开启热重载。
- `npm start`: 以预览模式启动应用。

### 构建
- `npm run build`: 为生产环境构建应用。
- `npm run build:unpack`: 构建并解包应用。
- `npm run build:win`: 构建 Windows 平台的应用。
- `npm run build:mac`: 构建 macOS 平台的应用。
- `npm run build:linux`: 构建 Linux 平台的应用。
- `npm run build:release`: 为所有平台构建应用。

### 代码检查与格式化
- `npm run format`: 使用 Prettier 格式化代码。
- `npm run lint`: 使用 ESLint 进行代码检查。
- `npm run lint:fix`: 使用 ESLint 检查并修复可修复的问题。
- `npm run format:check`: 检查代码格式。
- `npm run code:check`: 检查代码的 lint 问题和格式。
- `npm run code:fix`: 修复 lint 问题和格式问题。

### 测试
- `npm test`: 使用 Vitest 运行测试。
- `npm run test:ui`: 启动 Vitest UI 界面运行测试。
- `npm run test:run`: 运行一次测试。
- `npm run test:coverage`: 运行测试并生成覆盖率报告。
- `npm run test:watch`: 以观察者模式运行测试。

### TypeScript 类型检查
- `npm run type-check`: 运行 TypeScript 类型检查。
- `npm run type-check:watch`: 以观察者模式运行 TypeScript 类型检查。
- `npm run build:types`: 生成项目的类型声明文件。

## 高层代码架构

这是一个基于 Electron 和 Vue.js 构建的 Markdown 编辑器。应用分为三个主要部分：`main`（主进程）、`preload`（预加载脚本）和 `renderer`（渲染器进程）。

### 主进程 (`src/main`)
- 主进程负责创建和管理窗口、处理应用生命周期事件以及与渲染器进程通信。
- 主进程的入口文件是 `src/main/app/index.js`。
- `App` 类负责初始化应用、处理命令行参数和管理窗口。
- `WindowManager` 类负责管理应用的窗口。
- `EditorWindow` 和 `SettingWindow` 类分别负责创建和管理编辑器窗口和设置窗口。

### 预加载脚本 (`src/preload`)
- 预加载脚本用于以安全的方式向渲染器进程暴露 Node.js API。
- 预加载脚本的入口文件是 `src/preload/index.js`。

### 渲染器进程 (`src/renderer`)
- 渲染器进程负责渲染应用的 UI。
- 渲染器进程的入口文件是 `src/renderer/src/main.js`。
- 该应用使用 Vue.js 构建，主组件是 `src/renderer/src/pages/app.vue`。
- 应用使用 Pinia 进行状态管理，store 文件位于 `src/renderer/src/store`。
- 应用使用 Vue Router 进行路由管理。

### 共享代码 (`src/shared`)
- 这部分代码由主进程和渲染器进程共用。
- 国际化（i18n）文件位于 `src/shared/i18n/locales`。
