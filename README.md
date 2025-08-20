<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Next generation markdown editor 🌙</strong><br>
  A simple and elegant open-source markdown editor that focused on speed and usability.<br>
</div>

<div align="center">
  <!-- Latest Release Version -->
  <a href="https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/tkaixiang/marktext">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/hubo1989/marktext/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/total">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/latest/total">
  </a>
</div>

<div align="center">
  <strong>English</strong> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

## English

- [MarkText](https://github.com/marktext/marktext) is a free and open source markdown editor originally written by [Jocs](https://github.com/Jocs) and [contributors](https://github.com/marktext/marktext/graphs/contributors).
- Sadly, the core repository became unmaintained since about 3 years ago, but various Quality of Life issues remained that I noticed in my daily usage.
- This repository serves as an attempt at modernising my favourite Markdown Editor, and is a fork based off [Jacob Whall's Fork](https://github.com/jacobwhall/marktext)

  - See [my motivation below](#5-motivation)
- You can read more about my motivation below
- Multi-language support powered by Trae AI Claude 4.0

# 1. Installing

> ⚠️ These releases are still in **beta** (since I do not know how much stuff I might have broken during the migration). Please report any bugs in the [issue tracker](https://github.com/Tkaixiang/marktext/issues)

## Windows

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!
- Tested on:

  - `Windows 11`

## Linux

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)
- Tested on:
  - `Ubuntu 24.0.2` (`AppImage` and `.deb` packages)
  - *Would love some help in testing the other Linux packages!*

### Linux Package Managers

##### 1. Arch Linux ![AUR Version](https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin)

- 在 [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) 上可用，感谢 [@kromsam](https://github.com/kromsam)

## MacOS

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)

- I unfortunately do not have an `Apple Developer Account` which is required to create a `Developer ID` to sign the binaries

  - Without signing, all binaries will appear as "Damaged" by default
  - *If you would love to help with this, feel free to reach out!*

### macOS Preferences Fix

- ✅ **Fixed**: macOS version preferences window missing close button issue
  - Preferences window now properly displays close button on macOS
  - Fixed window management related user experience issues


# 2. Screenshots

![](docs/marktext.png?raw=true)

# 3. ✨Features ⭐

- Realtime preview (WYSIWYG) and a clean and simple interface to get a distraction-free writing experience.
- Support [CommonMark Spec](https://spec.commonmark.org/0.29/), [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) and selective support [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Markdown extensions such as math expressions (KaTeX), front matter and emojis.
- Support paragraphs and inline style shortcuts to improve your writing efficiency.
- Output **HTML** and **PDF** files.
- Various themes: **Cadmium Light**, **Material Dark** etc.
- Various editing modes: **Source Code mode**, **Typewriter mode**, **Focus mode**.
- Paste images directly from clipboard.

## 3.1 🌙 Themes🔆

| Cadmium Light                                   | Dark                                          |
| ----------------------------------------------- | --------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                  | Material Dark                                 |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                   | One Dark                                      |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

## 3.2 😸Edit Modes🐶

|    Source Code    |       Typewriter       |       Focus       |
| :----------------: | :--------------------: | :---------------: |
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. Internationalization Support

## 4.1 🌍 Multi-language Support

- ✅ **Complete internationalization**: Support for multiple language interfaces
- ✅ **Smart language detection**: Automatically detects system language and sets as default
- ✅ **Real-time language switching**: Switch interface language in preferences in real-time
- ✅ **Menu bar internationalization**: All menu items and shortcut descriptions support multiple languages
- ✅ **Preferences internationalization**: Preferences window fully supports multiple languages
- ✅ **Export settings internationalization**: Export-related interfaces support multiple languages

### Supported Languages

- 🇺🇸 **English** - Default language
- 🇨🇳 **简体中文 (Simplified Chinese)**
- 🇨🇳 **繁體中文 (Traditional Chinese)**
- 🇰🇷 **한국어 (Korean)**
- 🇯🇵 **日本語 (Japanese)**
- 🇪🇸 **Español (Spanish)**
- 🇫🇷 **Français (French)**
- 🇵🇹 **Português (Portuguese)**
- 🇩🇪 **Deutsch (German)**

### How to Switch Languages

1. Open **Preferences** (Shortcut: `Cmd/Ctrl + ,`)
2. Find **Language** setting in the **General** tab
3. Select your preferred language
4. Language takes effect immediately without restarting the application

---

<div id="english"></div>

## English Version

<div align="center">
  <strong>🔆 Next generation markdown editor 🌙</strong><br>
  A simple and elegant open-source markdown editor that focused on speed and usability.<br>
</div>

- [MarkText](https://github.com/marktext/marktext) is a free and open source markdown editor originally written by [Jocs](https://github.com/Jocs) and [contributors](https://github.com/marktext/marktext/graphs/contributors).
- Sadly, the core repository became unmaintained since about 3 years ago, but various Quality of Life issues remained that I noticed in my daily usage.
- This repository serves as an attempt at modernising my favourite Markdown Editor, and is a fork based off [Jacob Whall&#39;s Fork](https://github.com/jacobwhall/marktext)

  - See [my motivation below](#1-soo-is-this-fork-any-different-from-the-countless-others)
- You can read more about my motivation below

# 1. Installing

> ⚠️ These releases are still in **beta** (since I do not know how much stuff I might have broken during the migration). Please report any bugs in the [issue tracker](https://github.com/Tkaixiang/marktext/issues)

## Windows

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!
- Tested on:

  - `Windows 11`

## Linux

- Simply check out the [Releases Page](https://github.com/Tkaixiang/marktext/releases)
- Tested on:
  - `Ubuntu 24.0.2` (`AppImage` and `.deb` packages)
  - *Would love some help in testing the other Linux packages!*

### Linux Package Managers

##### 1. Arch Linux ![AUR Version](https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin)

- Available on [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) thanks to [@kromsam](https://github.com/kromsam)

## MacOS

- I unfortunately do not have an `Apple Developer Account` which is required to create a `Developer ID` to sign the binaries

  - Without signing, all binaries will appear as "Damaged" by default
  - *If you would love to help with this, feel free to reach out!*

### macOS Preferences Fix

- ✅ **Fixed**: macOS version preferences window missing close button issue
  - Preferences window now properly displays close button on macOS
  - Fixed window management related user experience issues

# 2. Screenshots

![](docs/marktext.png?raw=true)

# 3. ✨Features ⭐

- Realtime preview (WYSIWYG) and a clean and simple interface to get a distraction-free writing experience.
- Support [CommonMark Spec](https://spec.commonmark.org/0.29/), [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) and selective support [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Markdown extensions such as math expressions (KaTeX), front matter and emojis.
- Support paragraphs and inline style shortcuts to improve your writing efficiency.
- Output **HTML** and **PDF** files.
- Various themes: **Cadmium Light**, **Material Dark** etc.
- Various editing modes: **Source Code mode**, **Typewriter mode**, **Focus mode**.
- Paste images directly from clipboard.

## 3.1 🌙 Themes🔆

| Cadmium Light                                   | Dark                                          |
| ----------------------------------------------- | --------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                  | Material Dark                                 |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                   | One Dark                                      |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

## 3.2 😸Edit Modes🐶

|    Source Code    |       Typewriter       |       Focus       |
| :----------------: | :--------------------: | :---------------: |
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. Internationalization Support

## 4.1 🌍 Multi-language Support

- ✅ **Complete internationalization**: Support for Chinese and English interfaces
- ✅ **Smart language detection**: Automatically detects system language and sets as default
- ✅ **Real-time language switching**: Switch interface language in preferences in real-time
- ✅ **Menu bar internationalization**: All menu items and shortcut descriptions support multiple languages
- ✅ **Preferences internationalization**: Preferences window fully supports multiple languages
- ✅ **Export settings internationalization**: Export-related interfaces support multiple languages

### Supported Languages

- 🇨🇳 **Chinese (Simplified)** - Default language
- 🇺🇸 **English**

### How to Switch Languages

1. Open **Preferences** (Shortcut: `Cmd/Ctrl + ,`)
2. Find **Language** setting in the **General** tab
3. Select your preferred language
4. Language takes effect immediately without restarting the application

# 5. Project Motivation

1. I love writing. I have used many markdown editors, yet there is still no editor that can fully satisfy my needs. I don't like being distracted by unnecessary buttons or toolbars during writing, but sometimes I need speed. **MarkText** uses virtual DOM to render pages, which has the characteristics of high efficiency and open source, so that real-time preview and the smooth experience it gives you can be achieved.
2. As mentioned above, **MarkText** will be free and open source forever. We hope that all markdown lovers can contribute their own code and help develop **MarkText** into a popular markdown editor.
3. There are many markdown editors, each with their own merits, but it is still difficult for all markdown users to find a perfect editor. I hope **MarkText** can satisfy the needs of as many markdown users as possible. Although the latest version of **MarkText** is not yet perfect, we will try our best to make it as perfect as possible.

# 6. Contributing

**MarkText** is in full development, please make sure to read the [Contributing Guide](CONTRIBUTING.md) before making a PR. Want to add some features to **MarkText**? Please refer to [TODO LIST](https://github.com/marktext/marktext/blob/master/.github/TODOLIST.md) and open issues.

## Differences from Original MarkText

This project is based on further development of [Jacob Whall](https://github.com/jacobwhall/marktext)'s MarkText fork, with main improvements including:

### Technical Architecture Upgrade
- 🔄 **Build Tool Modernization**: Using `electron-vite` to replace the original `Babel + Webpack` build system
- ⚡ **Development Experience Optimization**: Faster hot reload and build speed
- 🎯 **Vue3 Ecosystem Migration**: Migrated from Vue2 to Vue3, using `Pinia` to replace `Vuex` for state management
- 📦 **Library Updates**: All libraries updated to their latest possible versions
- 🔧 **ESModules Support**: The `renderer` process is now fully **`ESModules` only**

## 1. Soo is this fork any different from the countless others?

- A main gripe I had when looking into `marktext` was that the development framework + environment was aging badly and took forever to compile

  - Most libraries were outdated and some couldn't even be installed with modern versions of Node.JS/Python
- Hence, this fork is kind of a major "re-write" that makes use of [electron-vite](https://electron-vite.org/) instead of the old `Babel + Webpack` setup

  - The goal here is to give `marktext` a **fresh start** using **modern frameworks and libraries as much as possible**
  - Everything has also been migrated to `Vue3` and `Pinia` with all libraries updated to their latest possible versions
- The `main` and `preload` processes are still compiled to `CommonJS`, but the `renderer` is now fully **`ESModules` only** (_which posed some interesting issues during migration_)

## 2. That's cool! How can I help?

- Any form of:

  1. Testing for bugs (Bug-Reports)
  2. Pull Requests

  Are more than welcome!
- You can find a basic list of commands for getting around this repo below, but otherwise - the file structure should be **very similar to the original marktext**

## 3. Project Setup

### Prerequisites

Before getting started, please ensure you have the following software installed on your computer:

- [Node.js](https://nodejs.org/) (>= 16.x, latest LTS version recommended)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Tkaixiang/marktext.git
cd marktext

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build application
npm run build

# Build Windows version
npm run build:win

# Build macOS version
npm run build:mac

# Build Linux version
npm run build:linux
```

---

## 简体中文

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  一个简洁优雅的开源 Markdown 编辑器，专注于速度和可用性。<br>
</div>## 简体中文

<div align="center">
  <a href="#english">English</a> | <strong>简体中文</strong> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) 是一个免费开源的 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和 [贡献者们](https://github.com/marktext/marktext/graphs/contributors) 编写。
- 遗憾的是，核心仓库在大约 3 年前就停止维护了，但在我日常使用中仍然存在各种生活质量问题。
- 这个仓库是对我最喜欢的 Markdown 编辑器进行现代化改造的尝试，基于 [Jacob Whall 的分支](https://github.com/jacobwhall/marktext) 进行开发。
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
- 多种编辑模式：**源代码模式**、**打字机模式**、**专注模式**。
- 直接从剪贴板粘贴图片。

### 国际化支持
- ✅ **完整国际化**：支持中文和英文界面
- ✅ **智能语言检测**：自动检测系统语言并设为默认
- ✅ **实时语言切换**：在偏好设置中实时切换界面语言
- ✅ **菜单栏国际化**：所有菜单项和快捷键描述支持多语言
- ✅ **偏好设置国际化**：偏好设置窗口完全支持多语言
- ✅ **导出设置国际化**：导出相关界面支持多语言

#### 支持的语言
- 🇨🇳 **中文（简体）** - 默认语言
- 🇺🇸 **英语**

#### 如何切换语言
1. 打开 **偏好设置**（快捷键：`Cmd/Ctrl + ,`）
2. 在 **通用** 选项卡中找到 **语言** 设置
3. 选择您偏好的语言
4. 语言立即生效，无需重启应用程序

---

## 繁體中文

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 編輯器 🌙</strong><br>
  一個簡潔優雅的開源 Markdown 編輯器，專注於速度和可用性。<br>
</div>## 繁體中文

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <strong>繁體中文</strong> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) 是一個免費開源的 Markdown 編輯器，最初由 [Jocs](https://github.com/Jocs) 和 [貢獻者們](https://github.com/marktext/marktext/graphs/contributors) 編寫。
- 遺憾的是，核心倉庫在大約 3 年前就停止維護了，但在我日常使用中仍然存在各種生活品質問題。
- 這個倉庫是對我最喜歡的 Markdown 編輯器進行現代化改造的嘗試，基於 [Jacob Whall 的分支](https://github.com/jacobwhall/marktext) 進行開發。
- 由 Trae AI Claude 4.0 提供多語言支援

### 安裝

#### Windows
- 請查看 [發布頁面](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)！
- 測試環境：Windows 11

#### Linux
- 請查看 [發布頁面](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)！

### 特性
- 即時預覽（所見即所得）和簡潔的介面，提供無干擾的寫作體驗。
- 支援 [CommonMark 規範](https://spec.commonmark.org/0.29/)、[GitHub 風格 Markdown 規範](https://github.github.com/gfm/) 和選擇性支援 [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。
- Markdown 擴展，如數學表達式（KaTeX）、前言和表情符號。
- 支援段落和內聯樣式快捷鍵，提高寫作效率。
- 輸出 **HTML** 和 **PDF** 檔案。
- 多種主題：**Cadmium Light**、**Material Dark** 等。
- 多種編輯模式：**原始碼模式**、**打字機模式**、**專注模式**。
- 直接從剪貼簿貼上圖片。

### 國際化支援
- ✅ **完整國際化**：支援中文和英文介面
- ✅ **智慧語言檢測**：自動檢測系統語言並設為預設
- ✅ **即時語言切換**：在偏好設定中即時切換介面語言
- ✅ **選單列國際化**：所有選單項目和快捷鍵描述支援多語言
- ✅ **偏好設定國際化**：偏好設定視窗完全支援多語言
- ✅ **匯出設定國際化**：匯出相關介面支援多語言

#### 支援的語言
- 🇨🇳 **中文（簡體）** - 預設語言
- 🇺🇸 **英語**

#### 如何切換語言
1. 開啟 **偏好設定**（快捷鍵：`Cmd/Ctrl + ,`）
2. 在 **一般** 選項卡中找到 **語言** 設定
3. 選擇您偏好的語言
4. 語言立即生效，無需重新啟動應用程式

---

## 한국어

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 차세대 마크다운 에디터 🌙</strong><br>
  속도와 사용성에 중점을 둔 간단하고 우아한 오픈소스 마크다운 에디터입니다.<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <strong>한국어</strong> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext)는 [Jocs](https://github.com/Jocs)와 [기여자들](https://github.com/marktext/marktext/graphs/contributors)이 처음 작성한 무료 오픈소스 마크다운 에디터입니다.
- 안타깝게도 핵심 저장소는 약 3년 전부터 유지보수가 중단되었지만, 일상적인 사용에서 여전히 다양한 품질 문제가 남아있었습니다.
- 이 저장소는 제가 가장 좋아하는 마크다운 에디터를 현대화하려는 시도이며, [Jacob Whall의 포크](https://github.com/jacobwhall/marktext)를 기반으로 개발되었습니다.
- Trae AI Claude 4.0에서 제공하는 다국어 지원

### 설치

#### Windows
- [릴리스 페이지](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)를 확인하세요!
- 테스트 환경: Windows 11

#### Linux
- [릴리스 페이지](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)를 확인하세요!

### 기능
- 실시간 미리보기(WYSIWYG)와 깔끔하고 간단한 인터페이스로 방해받지 않는 글쓰기 경험을 제공합니다.
- [CommonMark 사양](https://spec.commonmark.org/0.29/), [GitHub 플레이버드 마크다운 사양](https://github.github.com/gfm/) 및 선택적 [Pandoc 마크다운](https://pandoc.org/MANUAL.html#pandocs-markdown) 지원.
- 수학 표현식(KaTeX), 프론트 매터, 이모지와 같은 마크다운 확장 기능.
- 글쓰기 효율성을 높이는 단락 및 인라인 스타일 단축키 지원.
- **HTML** 및 **PDF** 파일 출력.
- 다양한 테마: **Cadmium Light**, **Material Dark** 등.
- 다양한 편집 모드: **소스 코드 모드**, **타이프라이터 모드**, **포커스 모드**.
- 클립보드에서 직접 이미지 붙여넣기.

---

## 日本語

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 次世代マークダウンエディタ 🌙</strong><br>
  スピードと使いやすさに焦点を当てたシンプルでエレガントなオープンソースマークダウンエディタ。<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <strong>日本語</strong> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext)は、[Jocs](https://github.com/Jocs)と[貢献者たち](https://github.com/marktext/marktext/graphs/contributors)によって最初に書かれた無料のオープンソースマークダウンエディタです。
- 残念ながら、コアリポジトリは約3年前からメンテナンスされなくなりましたが、日常的な使用で気づいた様々な品質の問題が残っていました。
- このリポジトリは、私のお気に入りのマークダウンエディタを現代化する試みであり、[Jacob Whallのフォーク](https://github.com/jacobwhall/marktext)をベースに開発されています。
- Trae AI Claude 4.0による多言語サポート

### インストール

#### Windows
- [リリースページ](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)をご確認ください！
- テスト環境：Windows 11

#### Linux
- [リリースページ](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)をご確認ください！

### 機能
- リアルタイムプレビュー（WYSIWYG）とクリーンでシンプルなインターフェースで、集中できる執筆体験を提供します。
- [CommonMark仕様](https://spec.commonmark.org/0.29/)、[GitHub Flavored Markdown仕様](https://github.github.com/gfm/)、および選択的な[Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)をサポート。
- 数式（KaTeX）、フロントマター、絵文字などのマークダウン拡張機能。
- 執筆効率を向上させる段落とインラインスタイルのショートカットをサポート。
- **HTML**および**PDF**ファイルの出力。
- 様々なテーマ：**Cadmium Light**、**Material Dark**など。
- 様々な編集モード：**ソースコードモード**、**タイプライターモード**、**フォーカスモード**。
- クリップボードから直接画像を貼り付け。

---

## Español

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Editor de markdown de próxima generación 🌙</strong><br>
  Un editor de markdown de código abierto simple y elegante que se enfoca en la velocidad y usabilidad.<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <strong>Español</strong> | <a href="#français">Français</a> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) es un editor de markdown gratuito y de código abierto escrito originalmente por [Jocs](https://github.com/Jocs) y [colaboradores](https://github.com/marktext/marktext/graphs/contributors).
- Lamentablemente, el repositorio principal dejó de mantenerse hace aproximadamente 3 años, pero varios problemas de calidad de vida permanecieron que noté en mi uso diario.
- Este repositorio sirve como un intento de modernizar mi editor de Markdown favorito, y es un fork basado en [el Fork de Jacob Whall](https://github.com/jacobwhall/marktext).
- Soporte multiidioma proporcionado por Trae AI Claude 4.0

### Instalación

#### Windows
- ¡Simplemente consulta la [Página de Lanzamientos](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!
- Probado en: Windows 11

#### Linux
- ¡Simplemente consulta la [Página de Lanzamientos](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!

### Características
- Vista previa en tiempo real (WYSIWYG) e interfaz limpia y simple para obtener una experiencia de escritura sin distracciones.
- Soporte para [Especificación CommonMark](https://spec.commonmark.org/0.29/), [Especificación GitHub Flavored Markdown](https://github.github.com/gfm/) y soporte selectivo para [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Extensiones de markdown como expresiones matemáticas (KaTeX), front matter y emojis.
- Soporte para atajos de párrafo y estilo en línea para mejorar tu eficiencia de escritura.
- Salida de archivos **HTML** y **PDF**.
- Varios temas: **Cadmium Light**, **Material Dark**, etc.
- Varios modos de edición: **Modo de código fuente**, **Modo máquina de escribir**, **Modo enfoque**.
- Pegar imágenes directamente desde el portapapeles.

---

## Français

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Éditeur markdown de nouvelle génération 🌙</strong><br>
  Un éditeur markdown open source simple et élégant qui se concentre sur la vitesse et l'utilisabilité.<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <strong>Français</strong> | <a href="#português">Português</a> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) est un éditeur markdown gratuit et open source écrit à l'origine par [Jocs](https://github.com/Jocs) et [les contributeurs](https://github.com/marktext/marktext/graphs/contributors).
- Malheureusement, le dépôt principal n'est plus maintenu depuis environ 3 ans, mais divers problèmes de qualité de vie sont restés que j'ai remarqués dans mon usage quotidien.
- Ce dépôt sert de tentative de modernisation de mon éditeur Markdown préféré, et est un fork basé sur [le Fork de Jacob Whall](https://github.com/jacobwhall/marktext).
- Support multilingue fourni par Trae AI Claude 4.0

### Installation

#### Windows
- Consultez simplement la [Page des Versions](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL) !
- Testé sur : Windows 11

#### Linux
- Consultez simplement la [Page des Versions](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL) !

### Fonctionnalités
- Aperçu en temps réel (WYSIWYG) et interface propre et simple pour une expérience d'écriture sans distraction.
- Support de la [Spécification CommonMark](https://spec.commonmark.org/0.29/), [Spécification GitHub Flavored Markdown](https://github.github.com/gfm/) et support sélectif de [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Extensions markdown telles que les expressions mathématiques (KaTeX), front matter et emojis.
- Support des raccourcis de paragraphe et de style en ligne pour améliorer votre efficacité d'écriture.
- Sortie de fichiers **HTML** et **PDF**.
- Divers thèmes : **Cadmium Light**, **Material Dark**, etc.
- Divers modes d'édition : **Mode code source**, **Mode machine à écrire**, **Mode focus**.
- Coller des images directement depuis le presse-papiers.

---

## Português

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Editor de markdown de próxima geração 🌙</strong><br>
  Um editor de markdown open source simples e elegante que foca na velocidade e usabilidade.<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <strong>Português</strong> | <a href="#deutsch">Deutsch</a>
</div>

---

- [MarkText](https://github.com/marktext/marktext) é um editor de markdown gratuito e open source escrito originalmente por [Jocs](https://github.com/Jocs) e [colaboradores](https://github.com/marktext/marktext/graphs/contributors).
- Infelizmente, o repositório principal não é mais mantido há cerca de 3 anos, mas vários problemas de qualidade de vida permaneceram que notei no meu uso diário.
- Este repositório serve como uma tentativa de modernizar meu editor Markdown favorito, e é um fork baseado no [Fork do Jacob Whall](https://github.com/jacobwhall/marktext).
- Suporte multilíngue fornecido pelo Trae AI Claude 4.0

### Instalação

#### Windows
- Simplesmente confira a [Página de Lançamentos](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!
- Testado em: Windows 11

#### Linux
- Simplesmente confira a [Página de Lançamentos](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!

### Características
- Visualização em tempo real (WYSIWYG) e interface limpa e simples para uma experiência de escrita sem distrações.
- Suporte para [Especificação CommonMark](https://spec.commonmark.org/0.29/), [Especificação GitHub Flavored Markdown](https://github.github.com/gfm/) e suporte seletivo para [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Extensões markdown como expressões matemáticas (KaTeX), front matter e emojis.
- Suporte para atalhos de parágrafo e estilo inline para melhorar sua eficiência de escrita.
- Saída de arquivos **HTML** e **PDF**.
- Vários temas: **Cadmium Light**, **Material Dark**, etc.
- Vários modos de edição: **Modo código fonte**, **Modo máquina de escrever**, **Modo foco**.
- Colar imagens diretamente da área de transferência.

---

## Deutsch

<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Markdown-Editor der nächsten Generation 🌙</strong><br>
  Ein einfacher und eleganter Open-Source-Markdown-Editor, der sich auf Geschwindigkeit und Benutzerfreundlichkeit konzentriert.<br>
</div>

<div align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#한국어">한국어</a> | <a href="#日本語">日本語</a> | <a href="#español">Español</a> | <a href="#français">Français</a> | <a href="#português">Português</a> | <strong>Deutsch</strong>
</div>

---

- [MarkText](https://github.com/marktext/marktext) ist ein kostenloser und Open-Source-Markdown-Editor, der ursprünglich von [Jocs](https://github.com/Jocs) und [Mitwirkenden](https://github.com/marktext/marktext/graphs/contributors) geschrieben wurde.
- Leider wird das Kern-Repository seit etwa 3 Jahren nicht mehr gepflegt, aber verschiedene Lebensqualitätsprobleme blieben bestehen, die mir bei meiner täglichen Nutzung auffielen.
- Dieses Repository dient als Versuch, meinen Lieblings-Markdown-Editor zu modernisieren, und ist ein Fork basierend auf [Jacob Whalls Fork](https://github.com/jacobwhall/marktext).
- Mehrsprachige Unterstützung bereitgestellt von Trae AI Claude 4.0

### Installation

#### Windows
- Schauen Sie einfach auf die [Release-Seite](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!
- Getestet auf: Windows 11

#### Linux
- Schauen Sie einfach auf die [Release-Seite](https://github.com/hubo1989/marktext/releases/tag/v0.18.3-multiL)!

### Funktionen
- Echtzeit-Vorschau (WYSIWYG) und saubere, einfache Benutzeroberfläche für ein ablenkungsfreies Schreiberlebnis.
- Unterstützung für [CommonMark-Spezifikation](https://spec.commonmark.org/0.29/), [GitHub Flavored Markdown-Spezifikation](https://github.github.com/gfm/) und selektive Unterstützung für [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Markdown-Erweiterungen wie mathematische Ausdrücke (KaTeX), Front Matter und Emojis.
- Unterstützung für Absatz- und Inline-Stil-Shortcuts zur Verbesserung Ihrer Schreibeffizienz.
- Ausgabe von **HTML**- und **PDF**-Dateien.
- Verschiedene Themes: **Cadmium Light**, **Material Dark**, etc.
- Verschiedene Bearbeitungsmodi: **Quellcode-Modus**, **Schreibmaschinen-Modus**, **Fokus-Modus**.
- Bilder direkt aus der Zwischenablage einfügen.
