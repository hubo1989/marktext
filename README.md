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

- 请查看 [发布页面](https://github.com/hubo1989/marktext/releases/tag/v0.1)！
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
