# 产品需求文档 (PRD) - 图片上传功能升级

## 1. 产品概述

### 1.1 背景
MarkText 当前支持多种图片上传方式，但存在一些过时的上传器（如GitHub上传器）。需要移除弃用的功能，并添加微信公众号图床支持，提升图片上传的实用性和稳定性。

### 1.2 目标
- 移除弃用的GitHub上传器
- 集成微信公众号图床
- 优化图片上传体验
- 提升上传成功率

## 2. 用户需求分析

### 2.1 用户痛点
- GitHub上传器经常失败或受限
- 缺少国内常用的图床支持
- 上传配置复杂
- 上传进度不明确

### 2.2 用户价值
- 更稳定的图片上传体验
- 支持微信公众号生态
- 简化的配置流程
- 更好的上传反馈

## 3. 功能需求

### 3.1 核心功能

#### 3.1.1 微信公众号图床集成
1. **配置管理**
   - AppID 和 AppSecret 配置界面
   - 配置验证和测试功能
   - 安全的密钥存储

2. **上传功能**
   - 自动获取Access Token
   - 图片上传到微信媒体资源
   - 支持多种图片格式
   - 上传进度显示

3. **路径管理**
   - 默认上传路径配置 (/marktext)
   - 自定义路径支持
   - 路径冲突处理

#### 3.1.2 GitHub上传器移除
1. **清理工作**
   - 移除GitHub相关配置项
   - 清理相关代码和依赖
   - 更新用户界面

2. **过渡方案**
   - 提供数据迁移提示
   - 替代方案推荐

### 3.2 非功能需求
- 上传成功率 > 95%
- 平均上传时间 < 3秒
- 支持并发上传
- 错误处理完善

## 4. 技术实现方案

### 4.1 技术栈
- 微信公众号API
- Node.js HTTP客户端
- 图片处理库
- 配置管理系统

### 4.2 微信公众号API集成

#### 4.2.1 Access Token管理
```javascript
// 获取Access Token
const getAccessToken = async (appId, appSecret) => {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
  const data = await response.json()
  return data.access_token
}
```

#### 4.2.2 图片上传
```javascript
// 上传图片到微信媒体资源
const uploadImage = async (accessToken, imageBuffer, filename) => {
  const formData = new FormData()
  formData.append('media', new Blob([imageBuffer]), filename)

  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=image`, {
    method: 'POST',
    body: formData
  })

  const result = await response.json()
  return result
}
```

### 4.3 配置界面设计

#### 4.3.1 配置表单
- AppID 输入框
- AppSecret 密码框
- 测试连接按钮
- 保存配置按钮

#### 4.3.2 状态显示
- 配置状态指示器
- 最后测试时间
- 错误信息显示

### 4.4 实现步骤

#### Phase 1: 基础架构搭建 (2天)
1. 创建微信API客户端
2. 实现Access Token管理
3. 设计配置存储方案

#### Phase 2: 核心功能实现 (3天)
1. 实现图片上传逻辑
2. 开发配置管理界面
3. 集成错误处理机制

#### Phase 3: 测试和优化 (2天)
1. 功能测试和边界测试
2. 性能优化
3. 用户体验优化

## 5. API设计

### 5.1 配置相关API
```typescript
interface WeChatConfig {
  appId: string
  appSecret: string
  defaultPath: string
  enabled: boolean
}

interface UploadResult {
  success: boolean
  url?: string
  mediaId?: string
  error?: string
}
```

### 5.2 上传服务API
```javascript
// 上传服务类
class WeChatImageUploader {
  constructor(config: WeChatConfig)

  async testConnection(): Promise<boolean>

  async uploadImage(imageBuffer: Buffer, filename: string): Promise<UploadResult>

  async getMediaUrl(mediaId: string): Promise<string>
}
```

## 6. 用户界面设计

### 6.1 配置页面
```
┌─ 微信公众号图床配置 ──────────────────────────────┐
│ AppID:     [____________________]                  │
│ AppSecret: [____________________] [👁️]             │
│ 默认路径:  [/marktext]                             │
│                                                    │
│ [测试连接] [保存配置]                              │
│                                                    │
│ 状态: ✅ 已连接 (最后测试: 2024-01-15 14:30)     │
└─────────────────────────────────────────────────────┘
```

### 6.2 上传进度
```
上传进度: ████████░░░░ 80%
正在上传: screenshot.png
预计剩余时间: 2秒
```

## 7. 安全考虑

### 7.1 密钥安全
- AppSecret加密存储
- 内存中的临时清理
- 安全的配置传输

### 7.2 API调用安全
- 请求频率限制
- 错误重试机制
- 超时处理

## 8. 风险评估

### 8.1 技术风险
- 微信API调用限制
- 网络连接问题
- 图片格式兼容性

### 8.2 业务风险
- 配置复杂性
- 用户学习成本
- 服务稳定性依赖

## 9. 里程碑计划

### Week 1: 基础架构
- [ ] 微信API集成
- [ ] 配置管理系统
- [ ] 基础上传功能

### Week 2: 功能完善
- [ ] 错误处理机制
- [ ] 配置界面开发
- [ ] 测试和调试

### Week 3: 优化和发布
- [ ] 性能优化
- [ ] 用户文档
- [ ] 发布上线

## 10. 验收标准

### 10.1 功能验收
- [ ] 微信公众号配置成功
- [ ] 图片上传功能正常
- [ ] 错误处理完善
- [ ] 配置界面友好

### 10.2 性能验收
- [ ] 上传成功率 > 95%
- [ ] 平均上传时间 < 3秒
- [ ] 支持最大5MB图片
- [ ] 并发上传支持

### 10.3 用户体验验收
- [ ] 配置流程简单直观
- [ ] 上传进度清晰可见
- [ ] 错误提示明确易懂
- [ ] 界面响应及时
