<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  一个简单而优雅的开源 Markdown 编辑器，专注于速度和可用性。<br>
  <br>
  [<img src="https://img.shields.io/badge/English-README-blue.svg" alt="English">](README.md)
</div>

<div align="center">
  <!-- Latest Release Version -->
  <a href="https://github.com/hubo1989/marktext-next/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/hubo1989/marktext-next">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/hubo1989/marktext-next/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/hubo1989/marktext-next/total">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/hubo1989/marktext-next/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/hubo1989/marktext-next/latest/total">
  </a>
</div>

- [MarkText](https://github.com/marktext/marktext) 是一个免费的开源 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和 [贡献者](https://github.com/marktext/marktext/graphs/contributors) 编写。

- **增强版分支**: 本仓库 [hubo1989/marktext-next](https://github.com/hubo1989/marktext-next) 为原始 MarkText 编辑器提供了全面的改进和现代化。

- **主要特性:**
  - 🚀 **现代化技术栈**: Vue 3, Pinia, Vite, TypeScript 支持
  - ⚡ **性能优化**: 代码分割、懒加载、树摇优化
  - 🌐 **完整国际化**: 支持 9+ 种语言
  - 🔧 **开发者体验**: ESLint, Prettier, Vitest 集成
  - 🔒 **安全性增强**: 环境特定的配置
  - 📦 **依赖更新**: 所有库的最新稳定版本

- 这个增强版分支包含了主要的代码优化、依赖更新和改进的用户体验，同时保持与原始 MarkText 的完全兼容性。

- 请查看 [我们的改进详情](#5-代码优化和改进)

# 1. 安装

> ⚠️ 这些版本仍然是 **beta 版**（因为我不知道迁移过程中破坏了什么）。请在 [issue tracker](https://github.com/hubo1989/marktext-next/issues) 中报告任何 bug

## Windows

- 只需查看 [Releases Page](https://github.com/hubo1989/marktext-next/releases)！

- 测试环境:

  - `Windows 11`

## Linux

- 只需查看 [Releases Page](https://github.com/hubo1989/marktext-next/releases)
- 测试环境:
  - `Ubuntu 24.0.2` (`AppImage` 和 `.deb` 包)
  - _希望有人帮助测试其他 Linux 包！_

### Linux 包管理器

##### 1. Arch Linux ![AUR Version](<https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin%>)

- 感谢 [@kromsam](https://github.com/kromsam) 在 [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) 上提供

## MacOS

> ⚠️ MacOS 版本会显示 "`MarkText 已损坏且无法打开`" 这是由于 **缺少公证** 的原因。
> 请查看 [此修复方法](https://github.com/hubo1989/marktext-next/issues/3004#issuecomment-1038207300)（这也适用于任何缺少开发者账户签名的应用）

- 可在 [Releases Page](https://github.com/hubo1989/marktext-next/releases) 获取

# 2. 截图

![](docs/marktext.png?raw=true)

# 3. ✨ 特性 ⭐

- 实时预览（所见即所得）和简洁的界面，让您在写作时获得无干扰的体验。
- 支持 [CommonMark Spec](https://spec.commonmark.org/0.29/)、[GitHub Flavored Markdown Spec](https://github.github.com/gfm/) 和对 [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown) 的选择性支持。
- Markdown 扩展如数学表达式（KaTeX）、front matter 和表情符号。
- 支持段落和内联样式快捷键来提高您的写作效率。
- 输出 **HTML** 和 **PDF** 文件。
- 各种主题：**Cadmium Light**、**Material Dark** 等。
- 各种编辑模式：**源码模式**、**打字机模式**、**专注模式**。
- 直接从剪贴板粘贴图片。

## 3.1 🌙 主题 🔆

| Cadmium Light                                     | Dark                                            |
| ------------------------------------------------- | ----------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                    | Material Dark                                   |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                     | One Dark                                        |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

## 3.2 😸 编辑模式 🐶

|     源码代码      |        打字机        |        专注        |
| :------------------: | :----------------------: | :-----------------: |
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. 动机

## 1. 这个分支与其他众多分支有什么不同？

- 查看 `marktext` 时，我对开发框架 + 环境的老化程度感到不满，并且编译起来非常慢

  - 大多数库都已经过时，有些甚至无法在现代版本的 Node.JS/Python 上安装

- 因此，这个分支有点像一个主要的"重写"，它使用了 [electron-vite](https://electron-vite.org/) 而不是旧的 `Babel + Webpack` 设置

  - 目标是为 `marktext` 提供一个 **新鲜的开始**，尽可能使用 **现代框架和库**
  - 一切都已经迁移到 `Vue3` 和 `Pinia`，所有库都更新到其最新可能的版本

- `main` 和 `preload` 进程仍然编译为 `CommonJS`，但是 `renderer` 现在是完全的 **`ESModules` 唯一**（_这在迁移过程中产生了有趣的问题_）

## 2. 这很酷！我怎么能帮忙？

- 任何形式的帮助都非常欢迎：

  1. 测试 bug（Bug 报告）
  2. Pull Requests

- 您可以在下面找到获取这个仓库的基本命令列表，但除此之外，文件结构应该与原始 marktext **非常相似**

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

## 5.8 🚀 未来路线图

- **PWA 支持**: 渐进式 Web 应用功能
- **插件系统**: 可扩展的插件架构
- **云同步**: 可选的云同步功能
- **高级主题**: 更多自定义选项
- **协作**: 实时协作功能

# 6. 项目设置

- 查看 [开发者文档](docs/dev/README.md)
