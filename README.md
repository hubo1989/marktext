<p align="center"><img src="static/logo-small.png" alt="MarkText Next" width="100" height="100"></p>

<h1 align="center">MarkText Next</h1>

<div align="center">
  <strong>🔆 Next Generation Markdown Editor 🌙</strong><br>
  A modern, elegant open-source markdown editor focused on speed, usability, and developer experience.<br>
  <br>
  [<img src="https://img.shields.io/badge/中文-README-blue.svg" alt="中文">](README-zh-CN.md)
</div>

<div align="center">
  <!-- Latest Release Version -->
  <a href="https://github.com/hubo1989/marktext/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/hubo1989/marktext">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/hubo1989/marktext/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/hubo1989/marktext/total">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/hubo1989/marktext/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/hubo1989/marktext/latest/total">
  </a>
</div>

- [MarkText Next](https://github.com/hubo1989/marktext-next) is a free and open source markdown editor originally written by [Jocs](https://github.com/Jocs) and [contributors](https://github.com/marktext/marktext/graphs/contributors).

- **Enhanced Fork**: This repository [hubo1989/marktext-next](https://github.com/hubo1989/marktext-next) provides comprehensive improvements and modernizations to the original MarkText editor.

- **Key Features:**
  - 🚀 **Modern Tech Stack**: Vue 3, Pinia, Vite, TypeScript support
  - ⚡ **Performance Optimized**: Code splitting, lazy loading, tree shaking
  - 🌐 **Full Internationalization**: 9+ languages supported
  - 🔧 **Developer Experience**: ESLint, Prettier, Vitest integration
  - 🔒 **Security Enhanced**: Environment-specific configurations
  - 📦 **Up-to-date Dependencies**: Latest stable versions of all libraries

- This enhanced fork includes major code optimizations, dependency updates, and improved user experience while maintaining full compatibility with the original MarkText.

- See [our improvements below](#5-code-optimizations-and-improvements)

# 1. Installing

> ⚠️ These releases are still in **beta** (since I do not know how much stuff I might have broken during the migration). Please report any bugs in the [issue tracker](https://github.com/hubo1989/marktext/issues)

## Windows

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext-next/releases)!

- Tested on:

  - `Windows 11`

## Linux

- Simply check out the [Releases Page](https://github.com/hubo1989/marktext-next/releases)
- Tested on:
  - `Ubuntu 24.0.2` (`AppImage` and `.deb` packages)
  - _Would love some help in testing the other Linux packages!_

### Linux Package Managers

##### 1. Arch Linux ![AUR Version](<https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin%3E>)

- Available on [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) thanks to [@kromsam](https://github.com/kromsam)

## MacOS

> ⚠️ MacOS releases will show a "`MarkText is damaged and can't be opened`" due to a **lack of notorisation**.
> Please see [this fix here](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300) (which also applies to any other app that lacks a Developer Account signing)

- Available on the [Releases Page](https://github.com/hubo1989/marktext-next/releases)

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

| Cadmium Light                                     | Dark                                            |
| ------------------------------------------------- | ----------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                    | Material Dark                                   |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                     | One Dark                                        |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

## 3.2 😸Edit Modes🐶

|     Source Code      |        Typewriter        |        Focus        |
| :------------------: | :----------------------: | :-----------------: |
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. Motivation

## 1. Soo is this fork any different from the countless others?

- A main gripe I had when looking into `marktext` was that the development framework + environment was aging badly and took forever to compile

  - Most libaries were outdated and some couldn't even be installed with modern versions of Node.JS/Python

- Hence, this fork is kind of a major "re-write" that makes use of [electron-vite](https://electron-vite.org/) instead of the old `Babel + Webpack` setup

  - The goal here is to give `marktext-next` a **fresh start** using **modern frameworks and libraries as much as possible**
  - Everything has also been migrated to `Vue3` and `Pinia` with all libraries updated to their latest possible versions

- The `main` and `preload` processes are still compiled to `CommonJS`, but the `renderer` is now fully **`ESModules` only** (_which posed some interesting issues during migration_)

## 2. That's cool! How can I help?

- Any form of:

  1. Testing for bugs (Bug-Reports)
  2. Pull Requests

  Are more than welcome!

- You can find a basic list of commands for getting around this repo below, but otherwise - the file structure should be **very similar to the original marktext-next**

# 5. Code Optimizations and Improvements

## 5.1 🎯 Performance Enhancements

This fork includes comprehensive performance optimizations:

- **Code Splitting & Lazy Loading**: Components are split into chunks and loaded on-demand
- **Tree Shaking**: Unused code is automatically removed from production builds
- **Route Preloading**: Critical routes are preloaded for faster navigation
- **Bundle Optimization**: Manual chunking for better caching and loading times
- **Memory Management**: Improved garbage collection and memory usage

## 5.2 🏗️ Architecture Improvements

### Modern Tech Stack Migration
- **Vue 3**: Upgraded from Vue 2 with Composition API
- **Pinia**: Modern state management replacing Vuex
- **Vite**: Fast build tool replacing Webpack
- **TypeScript**: Added type safety and better IDE support

### Modular Architecture
- **Store Modularization**: Split monolithic store into focused modules
- **Component Communication**: Structured event system for component interaction
- **Listener Management**: Centralized event listener registration
- **Plugin System**: Enhanced IPC communication plugins

## 5.3 🌐 Internationalization (i18n)

Complete internationalization support with:
- **9 Languages**: English, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, French, German, Spanish, Portuguese
- **Dynamic Loading**: Language files loaded on-demand
- **Fallback System**: Graceful fallback to English when translations are missing
- **Startup Options**: Translated application startup behavior options

## 5.4 🔧 Development Experience

### Code Quality Tools
- **ESLint**: Configured with modern rules and plugins
- **Prettier**: Automated code formatting
- **Vitest**: Fast unit testing framework
- **TypeScript**: Static type checking

### Build Optimization
- **Environment-specific Builds**: Different configurations for dev/prod
- **Source Maps**: Development debugging support
- **Compression**: Gzip and brotli compression
- **CSS Optimization**: Automatic vendor prefixing and minification

## 5.5 🔒 Security Enhancements

- **HMR Security**: Hot Module Replacement disabled in production
- **CSP Compliance**: Content Security Policy friendly
- **Dependency Updates**: Regular security updates for all dependencies
- **Environment Isolation**: Separate configurations for different environments

## 5.6 📦 Dependency Management

### Major Updates
- **Vue Ecosystem**: Vue 3, Vue Router 4, Pinia
- **Build Tools**: Vite, Electron-Vite
- **UI Libraries**: Element Plus with Vue 3 support
- **Markdown Processing**: Updated Muya editor core

### Optimization Features
- **Bundle Analysis**: Detailed bundle size reports
- **Dependency Analysis**: Identification of unused dependencies
- **Peer Dependencies**: Proper handling of peer dependencies
- **Lock File**: Comprehensive package-lock.json for reproducible builds

## 5.7 🐛 Bug Fixes & Stability

### Core Fixes
- **Container Reference Errors**: Fixed variable scope issues in event handlers
- **Memory Leaks**: Improved cleanup and garbage collection
- **IPC Communication**: Enhanced main/renderer process communication
- **Error Boundaries**: Better error handling and user feedback

### Performance Fixes
- **Rendering Optimization**: Faster component rendering and updates
- **Event Handling**: Optimized event listener management
- **Network Requests**: Improved error handling for network operations
- **File Operations**: Enhanced file I/O performance

## 5.8 🚀 Future Roadmap

- **PWA Support**: Progressive Web App capabilities
- **Plugin System**: Extensible plugin architecture
- **Cloud Sync**: Optional cloud synchronization
- **Advanced Themes**: More customization options
- **Collaboration**: Real-time collaboration features

# 6. Project Setup

- See [Developer Documentation](docs/dev/README.md)
