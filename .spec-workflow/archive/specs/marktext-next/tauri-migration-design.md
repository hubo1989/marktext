# Tauri Migration Design Document

## Architecture Overview

### Current Electron Architecture
```
Electron App Architecture
├── Main Process (Node.js)
│   ├── Window Management
│   ├── File System Operations
│   ├── IPC Communication
│   └── Native APIs
├── Renderer Process (Chromium)
│   ├── Vue 3 Application
│   ├── UI Components
│   └── Web APIs
└── Shared Modules
    ├── Utilities
    ├── Configuration
    └── Data Models
```

### Target Tauri Architecture
```
Tauri App Architecture
├── Core Process (Rust)
│   ├── Window Management
│   ├── File System Operations
│   ├── Command Handlers
│   └── Native APIs
├── WebView (System WebView)
│   ├── Vue 3 Application
│   ├── UI Components
│   └── JavaScript APIs
└── Shared Modules
    ├── Rust Crates
    ├── TypeScript Types
    └── Data Models
```

## Component Design

### 1. Core Application Structure

#### Main Entry Point (Rust)
```rust
// src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            file_operations::read_file,
            file_operations::write_file,
            file_operations::list_directory,
            window_management::create_window,
            window_management::close_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### Frontend Application (Vue 3)
```typescript
// src/main.ts (保持不变)
import { createApp } from 'vue'
import App from './App.vue'
import { invoke } from '@tauri-apps/api/tauri'

const app = createApp(App)

// Tauri API integration
app.config.globalProperties.$tauri = { invoke }

app.mount('#app')
```

### 2. File System Operations Module

#### Rust Implementation
```rust
// src-tauri/src/commands/file_operations.rs
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_directory: bool,
    pub modified: String,
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let dir_path = Path::new(&path);
    let mut files = Vec::new();

    for entry in fs::read_dir(dir_path)
        .map_err(|e| format!("Failed to read directory: {}", e))?
    {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to get metadata: {}", e))?;

        files.push(FileInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            size: metadata.len(),
            is_directory: metadata.is_dir(),
            modified: metadata.modified()
                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                .duration_since(std::time::SystemTime::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
                .to_string(),
        });
    }

    Ok(files)
}
```

#### TypeScript Integration
```typescript
// src/services/fileService.ts
import { invoke } from '@tauri-apps/api/tauri'

export interface FileInfo {
  name: string
  path: string
  size: number
  isDirectory: boolean
  modified: string
}

export class FileService {
  static async readFile(path: string): Promise<string> {
    return await invoke('read_file', { path })
  }

  static async writeFile(path: string, content: string): Promise<void> {
    return await invoke('write_file', { path, content })
  }

  static async listDirectory(path: string): Promise<FileInfo[]> {
    return await invoke('list_directory', { path })
  }
}
```

### 3. Window Management Module

#### Rust Implementation
```rust
// src-tauri/src/commands/window_management.rs
use tauri::{Window, Manager};

#[tauri::command]
pub async fn create_window(
    app: tauri::AppHandle,
    title: String,
    url: String,
    width: f64,
    height: f64
) -> Result<(), String> {
    let window = tauri::WindowBuilder::new(&app, title, tauri::WindowUrl::App(url.into()))
        .inner_size(width, height)
        .build()
        .map_err(|e| format!("Failed to create window: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| format!("Failed to close window: {}", e))
}

#[tauri::command]
pub async fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| format!("Failed to minimize window: {}", e))
}

#[tauri::command]
pub async fn maximize_window(window: Window) -> Result<(), String> {
    window.maximize().map_err(|e| format!("Failed to maximize window: {}", e))
}
```

#### Vue Component Integration
```vue
<!-- src/components/WindowControls.vue -->
<template>
  <div class="window-controls">
    <button @click="minimizeWindow" class="control-button minimize">_</button>
    <button @click="maximizeWindow" class="control-button maximize">□</button>
    <button @click="closeWindow" class="control-button close">×</button>
  </div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'

const minimizeWindow = async () => {
  await invoke('minimize_window')
}

const maximizeWindow = async () => {
  await invoke('maximize_window')
}

const closeWindow = async () => {
  await invoke('close_window')
}
</script>
```

### 4. Configuration Management

#### Rust Implementation
```rust
// src-tauri/src/commands/config.rs
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::api::path;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub theme: String,
    pub font_size: u32,
    pub auto_save: bool,
    pub language: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            font_size: 14,
            auto_save: true,
            language: "en".to_string(),
        }
    }
}

#[tauri::command]
pub async fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        let default_config = AppConfig::default();
        save_config_internal(&default_config)?;
        return Ok(default_config);
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))
}

#[tauri::command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
    save_config_internal(&config)
}

fn save_config_internal(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path()?;
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    // Ensure config directory exists
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write config: {}", e))
}

fn get_config_path() -> Result<PathBuf, String> {
    let app_dir = path::app_config_dir(&tauri::Config::default())
        .ok_or("Failed to get app config directory")?;

    Ok(app_dir.join("config.json"))
}
```

#### TypeScript Integration
```typescript
// src/services/configService.ts
import { invoke } from '@tauri-apps/api/tauri'

export interface AppConfig {
  theme: string
  fontSize: number
  autoSave: boolean
  language: string
}

export class ConfigService {
  static async loadConfig(): Promise<AppConfig> {
    return await invoke('load_config')
  }

  static async saveConfig(config: AppConfig): Promise<void> {
    return await invoke('save_config', { config })
  }

  static async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    const current = await this.loadConfig()
    const updated = { ...current, ...updates }
    await this.saveConfig(updated)
  }
}
```

### 5. Plugin Architecture

#### Core Plugin System
```rust
// src-tauri/src/plugins/mod.rs
pub mod filesystem;
pub mod notifications;
pub mod clipboard;

use tauri::{plugin::Plugin, AppHandle, Runtime};

pub struct MarkTextPlugins;

impl<R: Runtime> Plugin<R> for MarkTextPlugins {
    fn name(&self) -> &'static str {
        "marktext-plugins"
    }

    fn initialize(&mut self, app: &AppHandle<R>, _: serde_json::Value) -> tauri::plugin::Result<()> {
        // Initialize all plugins
        filesystem::init(app)?;
        notifications::init(app)?;
        clipboard::init(app)?;
        Ok(())
    }
}
```

#### Plugin Interface Definition
```rust
// src-tauri/src/plugins/filesystem.rs
use tauri::{AppHandle, Runtime};

pub fn init<R: Runtime>(app: &AppHandle<R>) -> tauri::plugin::Result<()> {
    // Plugin initialization logic
    Ok(())
}

// Plugin-specific commands
#[tauri::command]
pub async fn watch_file(path: String) -> Result<(), String> {
    // File watching implementation
    Ok(())
}

#[tauri::command]
pub async fn unwatch_file(path: String) -> Result<(), String> {
    // Stop watching file
    Ok(())
}
```

## Security Design

### 1. Command Validation
```rust
// src-tauri/src/validation.rs
use std::path::Path;

pub fn validate_file_path(path: &str) -> Result<(), String> {
    let path_obj = Path::new(path);

    // Prevent directory traversal
    if path_obj.components().any(|c| c.as_os_str() == "..") {
        return Err("Directory traversal not allowed".to_string());
    }

    // Validate path length
    if path.len() > 4096 {
        return Err("Path too long".to_string());
    }

    // Additional security checks
    if path.contains('\0') {
        return Err("Null bytes not allowed in path".to_string());
    }

    Ok(())
}
```

### 2. Content Security Policy
```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    }
  }
}
```

## Error Handling Design

### 1. Unified Error Types
```rust
// src-tauri/src/error.rs
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum AppError {
    FileNotFound(String),
    PermissionDenied(String),
    InvalidPath(String),
    NetworkError(String),
    ConfigError(String),
    Unknown(String),
}

impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        match error.kind() {
            std::io::ErrorKind::NotFound => AppError::FileNotFound(error.to_string()),
            std::io::ErrorKind::PermissionDenied => AppError::PermissionDenied(error.to_string()),
            _ => AppError::Unknown(error.to_string()),
        }
    }
}
```

### 2. Error Handling in Commands
```rust
// Example command with error handling
#[tauri::command]
pub async fn safe_read_file(path: String) -> Result<String, AppError> {
    // Validate input
    validate_file_path(&path)?;

    // Attempt file operation
    let content = tokio::fs::read_to_string(&path).await?;

    Ok(content)
}
```

## Testing Strategy

### 1. Unit Testing (Rust)
```rust
// src-tauri/src/commands/file_operations.rs
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_read_file_success() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        std::fs::write(&file_path, "test content").unwrap();

        let result = tokio::spawn(async move {
            read_file(file_path.to_string_lossy().to_string()).await
        });

        assert!(result.is_ok());
        assert_eq!(result.unwrap().unwrap(), "test content");
    }

    #[test]
    fn test_read_file_not_found() {
        let result = tokio::spawn(async {
            read_file("/nonexistent/file.txt".to_string()).await
        });

        assert!(result.is_ok());
        assert!(result.unwrap().is_err());
    }
}
```

### 2. Integration Testing
```typescript
// src/__tests__/fileService.test.ts
import { FileService } from '../services/fileService'

describe('FileService', () => {
  it('should read file content', async () => {
    const content = await FileService.readFile('/path/to/test.md')
    expect(content).toBe('# Test Markdown')
  })

  it('should write file content', async () => {
    await FileService.writeFile('/path/to/test.md', '# New Content')
    const content = await FileService.readFile('/path/to/test.md')
    expect(content).toBe('# New Content')
  })
})
```

## Performance Optimization

### 1. Memory Management
```rust
// src-tauri/src/memory.rs
use std::sync::Arc;

pub struct MemoryManager {
    cache: Arc<dashmap::DashMap<String, Vec<u8>>>,
    max_cache_size: usize,
}

impl MemoryManager {
    pub fn new(max_cache_size: usize) -> Self {
        Self {
            cache: Arc::new(dashmap::DashMap::new()),
            max_cache_size,
        }
    }

    pub fn store(&self, key: String, data: Vec<u8>) {
        // Implement LRU cache eviction
        if self.cache.len() >= self.max_cache_size {
            // Remove oldest entries
            let keys_to_remove: Vec<String> = self.cache
                .iter()
                .take(self.max_cache_size / 10)
                .map(|entry| entry.key().clone())
                .collect();

            for key in keys_to_remove {
                self.cache.remove(&key);
            }
        }

        self.cache.insert(key, data);
    }
}
```

### 2. Async Processing
```rust
// src-tauri/src/async_processor.rs
use tokio::sync::mpsc;
use std::sync::Arc;

pub struct AsyncProcessor {
    sender: mpsc::Sender<ProcessRequest>,
}

pub struct ProcessRequest {
    pub id: String,
    pub data: Vec<u8>,
    pub callback: Box<dyn FnOnce(ProcessResult) + Send>,
}

pub struct ProcessResult {
    pub id: String,
    pub success: bool,
    pub data: Option<Vec<u8>>,
    pub error: Option<String>,
}

impl AsyncProcessor {
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::channel(100);

        tokio::spawn(async move {
            Self::process_requests(receiver).await;
        });

        Self { sender }
    }

    async fn process_requests(mut receiver: mpsc::Receiver<ProcessRequest>) {
        while let Some(request) = receiver.recv().await {
            // Process request asynchronously
            let result = Self::process_single_request(request.data).await;

            // Call callback with result
            (request.callback)(ProcessResult {
                id: request.id,
                success: result.is_ok(),
                data: result.ok(),
                error: result.err().map(|e| e.to_string()),
            });
        }
    }

    async fn process_single_request(data: Vec<u8>) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        // Heavy processing logic here
        // This runs on a background thread without blocking the UI
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        Ok(data)
    }
}
```

## Deployment Strategy

### 1. Build Configuration
```toml
# src-tauri/Cargo.toml
[package]
name = "marktext-next"
version = "0.1.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.6", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }

[target."cfg(target_os = \"windows\")".dependencies]
winapi = "0.3"

[target."cfg(target_os = \"macos\")".dependencies]
objc = "0.2"
```

### 2. CI/CD Pipeline
```yaml
# .github/workflows/tauri-release.yml
name: 'Release Tauri App'

on:
  push:
    tags:
      - 'v*'

jobs:
  release-tauri:
    permissions:
      contents: write
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install dependencies (ubuntu only)
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Rust setup
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: './src-tauri -> target'

      - name: Install frontend dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'MarkText Next ${{ github.ref_name }}'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
```

This design document provides a comprehensive blueprint for migrating MarkText Next from Electron to Tauri, ensuring performance improvements while maintaining all existing functionality.
