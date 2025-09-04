# Design Document

## Introduction

This design document outlines the technical implementation strategy for MarkText-Next, providing detailed specifications for system architecture, user interface design, API integration, performance optimization, and security measures. The design is based on the requirements document and aims to create a modern, performant, and user-friendly Markdown editing environment.

## System Architecture

### Overview

MarkText-Next follows a layered architecture with clear separation of concerns:

```
┌─────────────────┐
│   Presentation  │ ← Vue.js Components, UI Logic
├─────────────────┤
│   Application   │ ← State Management, Business Logic
├─────────────────┤
│     Domain      │ ← Core Business Rules, Services
├─────────────────┤
│ Infrastructure  │ ← External APIs, File System, Storage
└─────────────────┘
```

### Component Architecture

#### Core Components

1. **EditorWithTabs** - Main editor container with tab management
2. **DualScreenMode** - Dual-screen layout for source code editing
3. **SideBar** - File navigation and project structure
4. **TitleBar** - Application header with controls
5. **Preferences** - Settings management interface

#### Service Layer

- **WeChatService** - WeChat Official Account integration
- **ExportService** - Multi-platform content export
- **ThemeService** - Theme management and transitions
- **AnimationService** - UI animation coordination

### Data Flow Architecture

```
User Input → Component → Store Action → Service → API/Storage
      ↓           ↓          ↓         ↓        ↓
   UI Update ← State ← Mutation ← Response ← Result
```

## User Interface Design

### Main Application Layout

```
┌─────────────────────────────────────────────────┐
│ Title Bar (32px)                               │
├─────────────────┬───────────────────────────────┤
│ Side Bar        │ Editor Area                   │
│ (Collapsible)   │                               │
│                 │ ┌─────────────────────────┐   │
│                 │ │ Editor with Tabs        │   │
│                 │ │                         │   │
│                 │ │ [Source] [Preview]      │   │
│                 │ └─────────────────────────┘   │
└─────────────────┴───────────────────────────────┘
```

### Dual-Screen Mode Layout

```
┌─────────────────────────────────────────────────┐
│ Title Bar                                       │
├─────────────────┬───────────────────────────────┤
│ Side Bar        │ Source Code     │ Preview     │
│                 │                 │             │
│                 │                 │             │
│                 │                 │             │
└─────────────────┴─────────────────┴─────────────┘
```

### Preferences Interface

#### General Settings
- Startup behavior (Folder/Last State/Blank)
- Language selection
- Auto-save configuration

#### Editor Settings
- Font family and size
- Line height and width
- Dual-screen mode (Disabled/Enabled)
- Sync options (Scroll, Cursor)

#### Image Settings
- Upload service selection (PicGo, WeChat)
- WeChat configuration (App ID, App Secret)
- Default upload path

## API Design

### WeChat Official Account Integration

#### Authentication Flow

```javascript
// 1. Configuration
const wechatConfig = {
  appId: 'wx1234567890',
  appSecret: 'secret-key',
  defaultPath: '/marktext'
}

// 2. Token Management
const tokenManager = {
  getAccessToken: async () => {
    // Check cache first
    const cached = await storage.get('wechat_token')
    if (cached && !isExpired(cached)) {
      return cached.access_token
    }
    // Request new token
    const response = await api.getToken(wechatConfig)
    await storage.set('wechat_token', response)
    return response.access_token
  }
}
```

#### Image Upload API

```javascript
// Upload Interface
interface WeChatUploadResult {
  url: string
  mediaId: string
  success: boolean
  error?: string
}

// Service Implementation
class WeChatImageService {
  async uploadImage(file: File): Promise<WeChatUploadResult> {
    const token = await this.getAccessToken()
    const formData = new FormData()
    formData.append('media', file)

    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`,
      {
        method: 'POST',
        body: formData
      }
    )

    return this.processUploadResponse(response)
  }
}
```

### Export Services

#### Confluence Export

```javascript
class ConfluenceExporter {
  convertToConfluence(markdown: string): string {
    return markdown
      .replace(/^# (.+)$/gm, 'h1. $1')
      .replace(/^## (.+)$/gm, 'h2. $1')
      .replace(/\*\*(.+?)\*\*/g, '*$1*')
      .replace(/\*(.+?)\*/g, '_$1_')
      .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '{code:$1}$2{code}')
  }
}
```

## Animation and Transition Design

### CSS Variables for Animation

```css
:root {
  /* Timing Functions */
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);

  /* Duration Scale */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### Component Transition Classes

```css
/* Panel Transitions */
.panel-enter-active {
  transition: transform var(--duration-normal) var(--easing-standard);
}

.panel-enter-from {
  transform: translateX(-100%);
}

.panel-enter-to {
  transform: translateX(0);
}

/* Theme Transitions */
.theme-transition {
  transition: background-color var(--duration-normal) var(--easing-standard),
              color var(--duration-normal) var(--easing-standard),
              border-color var(--duration-normal) var(--easing-standard);
}
```

### JavaScript Animation Controller

```javascript
class AnimationController {
  async animateThemeChange(newTheme) {
    // Pre-animation preparation
    this.prepareThemeTransition()

    // Apply new theme
    await this.applyTheme(newTheme)

    // Animate transitions
    await this.animateElements()
  }

  async animateLayoutChange(layout) {
    const duration = layout === 'dual-screen' ? 500 : 300
    await this.animatePanels(duration)
  }
}
```

## Performance Optimization

### Bundle Optimization

#### Code Splitting Strategy

```javascript
// Dynamic imports for major features
const DualScreenMode = defineAsyncComponent(() =>
  import('./components/DualScreenMode.vue')
)

const WeChatService = defineAsyncComponent(() =>
  import('./services/WeChatService')
)
```

#### Bundle Analysis Configuration

```javascript
// electron.vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'editor': ['muya', 'codemirror'],
          'ui': ['element-plus', 'floating-vue'],
          'utils': ['lodash', 'dayjs']
        }
      }
    }
  }
}
```

### Caching Strategy

#### Multi-Level Caching

```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.fileCache = new FileCache()
    this.apiCache = new APICache()
  }

  async get(key) {
    // Memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }

    // File cache
    const fileData = await this.fileCache.get(key)
    if (fileData) {
      this.memoryCache.set(key, fileData)
      return fileData
    }

    // API cache
    return await this.apiCache.get(key)
  }
}
```

### Memory Management

#### Component Cleanup

```javascript
export default {
  setup() {
    const cleanup = []

    onMounted(() => {
      // Setup listeners
      const listener = setupEventListener()
      cleanup.push(listener)
    })

    onBeforeUnmount(() => {
      // Cleanup all resources
      cleanup.forEach(clean => clean())
    })
  }
}
```

## Security Design

### Credential Storage

#### Secure Storage Implementation

```javascript
class SecureStorage {
  constructor() {
    this.keytar = require('keytar')
    this.serviceName = 'MarkText'
  }

  async storeCredential(service, credential) {
    const encrypted = await this.encryptCredential(credential)
    await this.keytar.setPassword(this.serviceName, service, encrypted)
  }

  async getCredential(service) {
    const encrypted = await this.keytar.getPassword(this.serviceName, service)
    return encrypted ? this.decryptCredential(encrypted) : null
  }

  private async encryptCredential(credential) {
    // Use system keychain for encryption
    return JSON.stringify(credential)
  }
}
```

### API Security

#### Request Signing and Validation

```javascript
class SecureAPIClient {
  async makeRequest(endpoint, data) {
    const timestamp = Date.now()
    const signature = this.generateSignature(endpoint, data, timestamp)

    const headers = {
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'X-API-Key': this.apiKey
    }

    return await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
  }

  private generateSignature(endpoint, data, timestamp) {
    const payload = `${endpoint}${JSON.stringify(data)}${timestamp}`
    return crypto.createHmac('sha256', this.secretKey)
                   .update(payload)
                   .digest('hex')
  }
}
```

### Content Security

#### Input Validation and Sanitization

```javascript
class ContentValidator {
  validateMarkdown(content) {
    // Check for malicious content
    if (this.containsMaliciousPatterns(content)) {
      throw new Error('Content contains potentially malicious patterns')
    }

    // Sanitize HTML content
    return this.sanitizeContent(content)
  }

  private containsMaliciousPatterns(content) {
    const patterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ]

    return patterns.some(pattern => pattern.test(content))
  }
}
```

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Set up enhanced theme system
- [ ] Implement animation framework
- [ ] Create dual-screen component structure

### Phase 2: Feature Integration (Week 3-4)
- [ ] Integrate WeChat API services
- [ ] Implement export functionality
- [ ] Add performance optimizations

### Phase 3: UI/UX Enhancement (Week 5-6)
- [ ] Polish animations and transitions
- [ ] Implement accessibility features
- [ ] Add error handling and user feedback

### Phase 4: Testing and Optimization (Week 7-8)
- [ ] Comprehensive testing
- [ ] Performance benchmarking
- [ ] Security audit and hardening

## Success Metrics

### Performance Metrics
- Application startup time: < 3 seconds
- Memory usage: < 200MB under normal operation
- UI response time: < 100ms for all interactions

### User Experience Metrics
- Theme transition smoothness: No jarring effects
- Dual-screen sync accuracy: < 50ms lag
- Image upload success rate: > 95%

### Security Metrics
- Zero credential leaks in testing
- All API communications encrypted
- Input validation coverage: 100%

This design document provides the technical foundation for implementing MarkText-Next with modern architecture, excellent performance, and robust security measures.