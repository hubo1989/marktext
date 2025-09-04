# MarkText 原生模块管理指南

## 概述

MarkText 使用了几个原生 Node.js 模块，这些模块需要编译才能正常工作。本指南介绍如何管理和维护这些原生模块。

## 原生模块列表

MarkText 使用以下原生模块：

1. **ced** - 字符编码检测库
2. **keytar** - 安全凭据存储库
3. **fontmanager-redux** - 字体管理库

## 常见问题

### 启动时出现 "Cannot find module '../build/Release/xxx.node'" 错误

这通常表示某个原生模块没有正确编译。解决方案：

#### 方法1：自动检查和修复（推荐）
```bash
npm run native:check
```

#### 方法2：清理重新安装
```bash
npm run native:clean
```

#### 方法3：手动重新编译
```bash
npm run native:rebuild
```

### 编译失败的常见原因

1. **缺少 Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Python 版本问题**
   - 推荐使用 Python 3.9+
   - 检查当前 Python 版本：
   ```bash
   python3 --version
   ```

3. **node-gyp 问题**
   - 清理 node-gyp 缓存：
   ```bash
   npm config set node_gyp $(npm config get prefix)/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js
   ```

## 故障排除步骤

### 步骤1：检查原生模块状态
```bash
npm run native:check
```

### 步骤2：如果有问题，尝试重新编译
```bash
npm run native:rebuild
```

### 步骤3：如果重新编译失败，清理重新安装
```bash
npm run native:clean
```

### 步骤4：检查系统依赖
```bash
# macOS
xcode-select -p
brew install python3

# 检查 node-gyp
which node-gyp
node-gyp --version
```

## 原生模块管理脚本

项目包含一个自动化脚本 `fix-native-modules.js`，它提供以下功能：

### 基本使用
```bash
# 检查所有原生模块状态并自动修复
node fix-native-modules.js

# 或使用 npm 脚本
npm run native:check
```

### 高级选项
```bash
# 清理 node_modules 并重新安装
node fix-native-modules.js clean
npm run native:clean

# 强制重新编译所有原生模块
node fix-native-modules.js rebuild-all
npm run native:rebuild
```

## 脚本功能说明

### 检查功能
- 检测所有原生模块是否存在
- 验证 build/Release 目录
- 检查 .node 文件是否存在
- 报告编译状态

### 修复功能
- 自动重新编译失败的模块
- 提供详细的错误信息
- 验证修复结果

### 清理功能
- 删除 node_modules
- 删除 package-lock.json
- 重新安装所有依赖
- 重新编译所有原生模块

## 开发环境设置

### macOS
```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 安装 Python 3
brew install python3

# 设置 Python 路径
export PYTHON=/usr/local/bin/python3
npm config set python /usr/local/bin/python3
```

### Windows
```bash
# 安装 Visual Studio Build Tools
npm install --global windows-build-tools

# 或安装 Visual Studio 2019+ (推荐)
# 下载并安装 Visual Studio Build Tools
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

## 预防措施

### 1. 定期检查
在进行以下操作后，建议运行原生模块检查：
- 更新 Node.js 版本
- 更新 macOS 系统
- 安装新的系统软件
- 切换不同的开发环境

### 2. 备份策略
```bash
# 创建 node_modules 备份
tar -czf node_modules_backup.tar.gz node_modules

# 恢复备份
tar -xzf node_modules_backup.tar.gz
```

## 技术细节

### 原生模块编译过程
1. **binding.gyp**: 定义编译配置
2. **node-gyp**: 编译工具
3. **.node 文件**: 编译后的原生模块
4. **bindings**: Node.js 原生模块加载器

### 常见编译错误
- **MSBUILD**: Windows 编译错误
- **clang**: macOS 编译错误
- **gcc**: Linux 编译错误

## 支持

如果遇到无法解决的问题，请：

1. 运行 `npm run native:check` 并提供输出
2. 提供系统信息：`uname -a`
3. 提供 Node.js 版本：`node --version`
4. 提供 npm 版本：`npm --version`

## 快速参考

```bash
# 检查原生模块状态
npm run native:check

# 清理重新安装
npm run native:clean

# 强制重新编译
npm run native:rebuild

# 直接运行脚本
node fix-native-modules.js
node fix-native-modules.js clean
node fix-native-modules.js rebuild-all
```
