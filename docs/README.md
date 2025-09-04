## 简体中文

<p align="center"><img src="../static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  一个简洁优雅的开源 Markdown 编辑器，专注于速度和可用性。<br>
</div>## 简体中文

<div align="center">
  <a href="/README.md">English</a> | <strong>简体中文</strong> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) 是一个免费开源的 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和 [贡献者们](https://github.com/marktext/marktext/graphs/contributors) 编写。
- 遗憾的是，核心仓库在大约 3 年前就停止维护了，但在我日常使用中仍然存在各种生活质量问题。
- 这个仓库是对我最喜欢的 Markdown 编辑器进行现代化改造的尝试，基于 [Jacob Whall 的分支](https://github.com/jacobwhall/marktext) 进行开发。
- 基于 [@Tkaixiang/marktext](https://github.com/Tkaixiang/marktext) 的现代化改造-迁移至 Vue 3
- 由 Trae AI Claude 4.0 提供多语言支持

### 安装

#### Windows
- 请查看 [发布页面](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)！
- 测试环境：Windows 11

#### Linux
- 请查看 [发布页面](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)！

### 特性
- 实时预览（所见即所得）和简洁的界面，提供无干扰的写作体验。
- 支持 [CommonMark 规范](https://spec.commonmark.org/0.29/)、[GitHub 风格 Markdown 规范](https://github.github.com/gfm/) 和选择性支持 [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。
- Markdown 扩展，如数学表达式（KaTeX）、前言和表情符号。
- 支持段落和内联样式快捷键，提高写作效率。
- 输出 **HTML** 和 **PDF** 文件。
- 多种主题：**Cadmium Light**、**Material Dark** 等。
- 多种编辑模式：**源代码模式(双屏)**、**打字机模式**、**专注模式**。
- 直接从剪贴板粘贴图片。

### 项目优化与国际化

#### 🎯 核心功能优化
- ✅ **现代化 Vue 3 架构**：基于 Composition API 重构，提升开发效率和代码可维护性
- ✅ **增强主题系统**：平滑主题切换，支持深色/浅色模式，CSS 变量动态配置
- ✅ **双屏编辑模式**：实时同步滚动和光标，支持分屏写作和预览
- ✅ **动画框架**：流畅的 UI 过渡效果，60fps 高性能动画
- ✅ **性能优化**：代码分割、懒加载、内存管理和缓存系统
- ✅ **安全增强**：凭证安全存储、API 安全验证、内容安全策略

#### 🌐 完整国际化支持
- ✅ **9种语言支持**：中文简体/繁体、英语、日语、韩语、西班牙语、法语、葡萄牙语、德语
- ✅ **智能语言检测**：自动检测系统语言并设为默认，无需手动配置
- ✅ **实时语言切换**：在偏好设置中即时切换，所有界面元素实时更新
- ✅ **深度本地化**：菜单栏、快捷键、偏好设置、导出功能、错误提示等全部国际化
- ✅ **一致性保证**：所有新功能和组件都支持完整的国际化
- ✅ **扩展性设计**：模块化语言包，支持未来轻松添加新语言

#### 支持的语言
- 🇨🇳 **中文（简体）** - 默认语言
- 🇺🇸 **English** (英语)
- 🇹🇼 **繁體中文** (繁体中文)
- 🇯🇵 **日本語** (日语)
- 🇰🇷 **한국어** (韩语)
- 🇪🇸 **Español** (西班牙语)
- 🇫🇷 **Français** (法语)
- 🇵🇹 **Português** (葡萄牙语)
- 🇩🇪 **Deutsch** (德语)

#### 如何切换语言
1. 打开 **偏好设置**（快捷键：`Cmd/Ctrl + ,`）
2. 在 **通用** 选项卡中找到 **语言** 设置
3. 选择您偏好的语言
4. 语言立即生效，无需重启应用程序

---

