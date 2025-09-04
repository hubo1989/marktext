## 简体中文

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="200" height="200"></p>

<h1 align="center">MarkText-next</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  一个简洁优雅的开源 Markdown 编辑器，专注于速度和可用性。<br>
</div>## 简体中文

- [MarkText](https://github.com/marktext/marktext) 是一个免费开源的 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和 [贡献者们](https://github.com/marktext/marktext/graphs/contributors) 编写。
- 遗憾的是，核心仓库在大约 3 年前就停止维护了，但在我日常使用中仍然存在各种生活质量问题。
- 这个仓库是对我最喜欢的 Markdown 编辑器进行现代化改造的尝试，基于 [Jacob Whall 的分支](https://github.com/jacobwhall/marktext) 进行开发。
- 基于 [@Tkaixiang/marktext](https://github.com/Tkaixiang/marktext) 的现代化改造-迁移至 Vue 3
- 由 Trae AI Claude 4.0 提供多语言支持

### 安装

- 请查看 [发布页面](https://github.com/hubo1989/marktext/releases/tag/v0.1.0)！
- 测试环境：Mac OS Sequoia arm64 



### 特性
- 实时预览（所见即所得）和简洁的界面，提供无干扰的写作体验。
- 支持 [CommonMark 规范](https://spec.commonmark.org/0.29/)、[GitHub 风格 Markdown 规范](https://github.github.com/gfm/) 和选择性支持 [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。
- Markdown 扩展，如数学表达式（KaTeX）、前言和表情符号。
- 支持段落和内联样式快捷键，提高写作效率。
- 输出 **HTML** 和 **PDF** 文件。
- 多种主题：**Cadmium Light**、**Material Dark** 等。
- 多种编辑模式：**源代码模式(双屏)**、**打字机模式**、**专注模式**。
- 直接从剪贴板粘贴图片。

- **主要特性:**
  - 🚀 **现代化技术栈**: Vue 3, Pinia, Vite, TypeScript 支持
  - ⚡ **性能优化**: 代码分割、懒加载、树摇优化
  - 🌐 **完整国际化**: 支持 9+ 种语言
  - 🔧 **开发者体验**: ESLint, Prettier, Vitest 集成
  - 🔒 **安全性增强**: 环境特定的配置
  - 📦 **依赖更新**: 所有库的最新稳定版本

# 5. 代码优化和改进

## 5.1 🎯 性能增强

这个分支包含了全面的性能优化：

- **代码分割和懒加载**: 组件被分割成块并按需加载
- **树摇优化**: 未使用的代码会自动从生产构建中移除
- **路由预加载**: 关键路由预加载以实现更快的导航
- **包优化**: 手动分块以实现更好的缓存和加载时间
- **内存管理**: 改进的垃圾回收和内存使用

## 5.2 🏗️ 架构改进

### 现代化技术栈迁移
- **Vue 3**: 从 Vue 2 升级，使用 Composition API
- **Pinia**: 现代状态管理替代 Vuex
- **Vite**: 快速构建工具替代 Webpack
- **TypeScript**: 添加类型安全性和更好的 IDE 支持

### 模块化架构
- **Store 模块化**: 将单一 store 分割为专注的模块
- **组件通信**: 结构化的事件系统用于组件交互
- **监听器管理**: 集中式事件监听器注册
- **插件系统**: 增强的 IPC 通信插件

## 5.3 🌐 国际化 (i18n)

完整的国际化支持：
- **9 种语言**: 英语、简体中文、繁体中文、日语、韩语、法语、德语、西班牙语、葡萄牙语
- **动态加载**: 语言文件按需加载
- **后备系统**: 当翻译缺失时优雅地回退到英语
- **启动选项**: 翻译后的应用程序启动行为选项

## 5.4 🔧 开发体验

### 代码质量工具
- **ESLint**: 配置了现代规则和插件
- **Prettier**: 自动代码格式化
- **Vitest**: 快速单元测试框架
- **TypeScript**: 静态类型检查

### 构建优化
- **环境特定构建**: 开发/生产环境的不同配置
- **Source Maps**: 开发调试支持
- **压缩**: Gzip 和 brotli 压缩
- **CSS 优化**: 自动厂商前缀和最小化

## 5.5 🔒 安全增强

- **HMR 安全**: 生产环境中禁用热模块替换
- **CSP 兼容**: 内容安全策略友好
- **依赖更新**: 所有依赖项的定期安全更新
- **环境隔离**: 不同环境的独立配置

## 5.6 📦 依赖管理

### 主要更新
- **Vue 生态**: Vue 3、Vue Router 4、Pinia
- **构建工具**: Vite、Electron-Vite
- **UI 库**: 支持 Vue 3 的 Element Plus
- **Markdown 处理**: 更新后的 Muya 编辑器核心

### 优化特性
- **包分析**: 详细的包大小报告
- **依赖分析**: 识别未使用的依赖项
- **Peer 依赖**: 正确处理 peer 依赖
- **锁定文件**: 全面的 package-lock.json 以实现可重现构建

## 5.7 🐛 Bug 修复和稳定性

### 核心修复
- **容器引用错误**: 修复事件处理程序中的变量作用域问题
- **内存泄漏**: 改进清理和垃圾回收
- **IPC 通信**: 增强主进程/渲染进程通信
- **错误边界**: 更好的错误处理和用户反馈

### 性能修复
- **渲染优化**: 更快的组件渲染和更新
- **事件处理**: 优化的监听器管理
- **网络请求**: 改进的网络操作错误处理
- **文件操作**: 增强的文件 I/O 性能

- 请查看 [我们的改进详情](#5-代码优化和改进)
### Project Optimizations & Internationalization

#### 🎯 Core Feature Enhancements
- ✅ **Modern Vue 3 Architecture**: Refactored with Composition API to improve development efficiency and code maintainability
- ✅ **Enhanced Theme System**: Smooth theme transitions supporting dark/light modes with dynamic CSS variables
- ✅ **Dual-Screen Editing Mode**: Real-time scroll and cursor synchronization for split-screen writing and preview
- ✅ **Animation Framework**: Fluid UI transitions with 60fps high-performance animations
- ✅ **Performance Optimization**: Code splitting, lazy loading, memory management, and caching systems
- ✅ **Security Enhancements**: Secure credential storage, API security validation, and content security policies

#### 🌐 Comprehensive Internationalization Support
- ✅ **9 Languages Supported**: Simplified/Traditional Chinese, English, Japanese, Korean, Spanish, French, Portuguese, German
- ✅ **Smart Language Detection**: Automatically detects system language and sets as default without manual configuration
- ✅ **Real-time Language Switching**: Instant language switching in preferences, all UI elements update immediately
- ✅ **Deep Localization**: Complete internationalization of menu bars, shortcuts, preferences, export functions, error messages, etc.
- ✅ **Consistency Guarantee**: All new features and components support full internationalization
- ✅ **Extensible Design**: Modular language packs for easy addition of new languages in the future

#### Supported Languages
- 🇨🇳 **Simplified Chinese** - Default language
- 🇺🇸 **English**
- 🇹🇼 **Traditional Chinese** (繁體中文)
- 🇯🇵 **Japanese** (日本語)
- 🇰🇷 **Korean** (한국어)
- 🇪🇸 **Spanish** (Español)
- 🇫🇷 **French** (Français)
- 🇵🇹 **Portuguese** (Português)
- 🇩🇪 **German** (Deutsch)

#### How to Switch Languages
1. Open **Preferences** (Shortcut: `Cmd/Ctrl + ,`)
2. Go to **General** tab and find **Language** settings
3. Select your preferred language
4. Language changes take effect immediately without restarting the application

---
