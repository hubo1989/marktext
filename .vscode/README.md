# MarkText 调试配置指南

本项目已配置了完整的 VS Code 调试环境，支持 Electron 主进程、渲染进程、预加载脚本等多种调试场景。

## 调试配置说明

### 🔧 基础调试配置

#### 1. Debug Main Process
- **用途**: 调试 Electron 主进程
- **适用场景**: 主进程逻辑、窗口管理、系统集成等
- **启动方式**: F5 选择此配置，或从调试面板选择

#### 2. Debug Renderer Process
- **用途**: 调试 Electron 渲染进程（Vue 应用）
- **适用场景**: Vue 组件、UI 交互、业务逻辑等
- **特点**: 自动附加到渲染进程，支持断点调试

#### 3. Debug All Processes (复合配置)
- **用途**: 同时调试主进程和渲染进程
- **适用场景**: 需要调试进程间通信的场景
- **推荐**: 日常开发首选配置

### 🚀 高级调试配置

#### 4. Debug Preload Script
- **用途**: 调试预加载脚本
- **适用场景**: 预加载脚本、上下文隔离、安全相关代码

#### 5. Debug Production Build
- **用途**: 调试生产构建版本
- **适用场景**: 生产环境问题排查
- **注意**: 需要先运行 `npm run build`

#### 6. Debug Vue DevTools
- **用途**: 启动 Vue 开发工具
- **适用场景**: Vue 组件调试、状态管理等

#### 7. Debug with Hot Reload
- **用途**: 带热重载的调试
- **适用场景**: 开发时需要频繁修改代码的场景
- **特点**: 修改代码后自动重载，无需重启调试

#### 8. Debug with Inspector
- **用途**: 带 Node.js 检查器的调试
- **适用场景**: 需要使用 Node.js 检查器进行深度调试

### 🧪 测试调试配置

#### 9. Debug Unit Tests
- **用途**: 调试单元测试
- **适用场景**: 排查测试失败原因

#### 10. Debug Unit Tests (Watch)
- **用途**: 监听模式调试测试
- **适用场景**: 开发时持续运行测试

#### 11. Debug Specific Test File
- **用途**: 调试特定测试文件
- **适用场景**: 聚焦调试某个具体的测试文件

### 🔨 构建调试配置

#### 12. Debug Build Process
- **用途**: 调试构建过程
- **适用场景**: 排查构建问题、优化构建性能

## 使用建议

### 开发阶段
1. **日常开发**: 使用 `Debug All Processes` 或 `Debug Development Mode`
2. **UI 调试**: 结合 `Debug with Vue DevTools`
3. **性能调试**: 使用 `Debug with Inspector`

### 问题排查
1. **生产问题**: 使用 `Debug Production Build`
2. **构建问题**: 使用 `Debug Build Process`
3. **测试问题**: 使用对应的测试调试配置

### 高级调试
1. **进程通信**: 使用复合配置调试多进程
2. **热重载调试**: 使用 `Debug with Hot Reload`
3. **深度分析**: 使用 `Debug with Inspector`

## 环境变量说明

### 开发环境
```bash
NODE_ENV=development
REMOTE_DEBUGGING_PORT=9222
HOT_RELOAD=true
```

### 生产环境
```bash
NODE_ENV=production
REMOTE_DEBUGGING_PORT=9222
```

## 快捷键

- `F5`: 启动调试
- `F10`: 单步执行
- `F11`: 进入函数
- `Shift+F11`: 跳出函数
- `Ctrl+Shift+F5`: 重启调试
- `Shift+F5`: 停止调试

## 故障排除

### 常见问题
1. **调试器无法附加**: 检查端口 9222 是否被占用
2. **断点不生效**: 确保 source map 已启用
3. **热重载不工作**: 检查 HMR 配置和文件监听

### 调试技巧
1. 使用条件断点: `右键断点 → Edit Breakpoint → Expression`
2. 使用日志断点: `右键断点 → Edit Breakpoint → Log Message`
3. 调试控制台: 在调试时使用 `console.log()` 输出信息

## 性能优化

### 调试时的性能考虑
1. **减少断点数量**: 过多断点会影响性能
2. **使用条件断点**: 只在特定条件下停止
3. **避免在循环中设置断点**: 会严重影响性能

### 内存调试
1. 使用 Chrome DevTools 的 Memory 面板
2. 关注内存泄漏和垃圾回收
3. 使用 Performance 面板分析性能瓶颈

## 最佳实践

1. **分层调试**: 先调试单个进程，再调试多进程通信
2. **逐步深入**: 从简单场景开始，逐步增加复杂度
3. **记录问题**: 在调试过程中记录发现的问题和解决方案
4. **代码审查**: 调试完成后进行代码审查，确保质量

## 相关文档

- [Electron 调试指南](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process)
- [Vue DevTools 文档](https://devtools.vuejs.org/)
- [VS Code 调试文档](https://code.visualstudio.com/docs/editor/debugging)
