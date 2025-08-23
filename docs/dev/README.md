# Developer Documentation

## 1. Project Setup

### 1.1 Pre-Requisites

- Python (`>= 3.12`)

- Node.JS (`>= 22`)

- A lot of patience

### 1.2 Linux Specific Pre-requisites (Optional)

- Linux environments require additional dependencies, please see [Linux Specific Pre-reqs](LINUX_DEV.md)

### 1.3 Clone and Install

```bash
git clone https://github.com/Tkaixiang/marktext.git
cd marktext
npm install
```

### 1.4 Run in Development

```bash
$ npm run dev
```

#### 1.4.1 Some Points to Note:

- The `main` and `preload` processes are **NOT** automatically hot-loaded on edit, you need to **reload the development process** on each edit unfortunately
  - The good news is Vite bundles it _really really quickly_ so it shouldnt be too big of a hassle
- Although the `renderer` process is hot-loaded, loss of states can often lead to **weird errors**. I recommend doing a full reload if this happens
- Compile targets:
  - `main` and `preload` still compile to `CommonJS`
  - `renderer` is `ESModules` only (take note when using any legacy `CommonJS` libraries)

### 1.5 Build for Production

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 2. Sub-sections

- [Project architecture](ARCHITECTURE.md)
- [Build instructions](BUILD.md)
- [Debugging](DEBUGGING.md)
- [Interface](INTERFACE.md)
- [Steps to release MarkText](RELEASE.md)
- [Prepare a hotfix](RELEASE_HOTFIX.md)
- [Internal documentation](code/README.md)
