#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * MarkText 原生模块检查和修复脚本
 * 用于检查和修复所有原生模块的编译状态
 */

const NATIVE_PACKAGES = [
  'ced',
  'keytar',
  'fontmanager-redux'
];

const NODE_MODULES_DIR = path.join(__dirname, 'node_modules');

function checkNativeModule(packageName) {
  console.log(`\n🔍 检查包: ${packageName}`);

  const packageDir = path.join(NODE_MODULES_DIR, packageName);
  const buildDir = path.join(packageDir, 'build');
  const releaseDir = path.join(buildDir, 'Release');

  // 检查包是否存在
  if (!fs.existsSync(packageDir)) {
    console.log(`❌ 包 ${packageName} 不存在`);
    return false;
  }

  // 检查是否有binding.gyp文件（表明是原生模块）
  const bindingGyp = path.join(packageDir, 'binding.gyp');
  if (!fs.existsSync(bindingGyp)) {
    console.log(`ℹ️ 包 ${packageName} 不是原生模块`);
    return true; // 不是原生模块，算成功
  }

  // 检查build目录
  if (!fs.existsSync(buildDir)) {
    console.log(`❌ 包 ${packageName} 没有build目录`);
    return false;
  }

  // 检查Release目录
  if (!fs.existsSync(releaseDir)) {
    console.log(`❌ 包 ${packageName} 没有Release目录`);
    return false;
  }

  // 检查.node文件
  const nodeFiles = fs.readdirSync(releaseDir).filter(file => file.endsWith('.node'));
  if (nodeFiles.length === 0) {
    console.log(`❌ 包 ${packageName} 没有找到.node文件`);
    return false;
  }

  console.log(`✅ 包 ${packageName} 编译状态正常 (${nodeFiles.length} 个.node文件)`);
  return true;
}

function rebuildNativeModule(packageName) {
  console.log(`\n🔨 重新编译包: ${packageName}`);

  try {
    execSync(`npm rebuild ${packageName}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✅ 包 ${packageName} 重新编译成功`);
    return true;
  } catch (error) {
    console.log(`❌ 包 ${packageName} 重新编译失败: ${error.message}`);
    return false;
  }
}

function checkAllNativeModules() {
  console.log('🚀 开始检查所有原生模块...\n');

  let allGood = true;
  const failedPackages = [];

  for (const packageName of NATIVE_PACKAGES) {
    const isGood = checkNativeModule(packageName);
    if (!isGood) {
      allGood = false;
      failedPackages.push(packageName);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('🎉 所有原生模块状态正常！');
  } else {
    console.log('⚠️ 发现有问题的原生模块，正在自动修复...\n');

    for (const packageName of failedPackages) {
      const success = rebuildNativeModule(packageName);
      if (success) {
        // 重新检查
        const recheckResult = checkNativeModule(packageName);
        if (!recheckResult) {
          console.log(`❌ 包 ${packageName} 修复后仍有问题`);
          allGood = false;
        }
      } else {
        allGood = false;
      }
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('🎉 所有原生模块问题已解决！');
    console.log('您现在可以运行: npm start');
  } else {
    console.log('❌ 还有未解决的原生模块问题');
    console.log('建议步骤:');
    console.log('1. 确保已安装 Xcode Command Line Tools');
    console.log('2. 运行: npm run clean-install');
    console.log('3. 如果仍有问题，请检查 Python 版本 (推荐 3.9+)');
  }

  return allGood;
}

function cleanInstall() {
  console.log('🧹 执行清理重新安装...');

  try {
    // 删除 node_modules 和 package-lock.json
    if (fs.existsSync(NODE_MODULES_DIR)) {
      execSync('rm -rf node_modules', { stdio: 'inherit', cwd: __dirname });
    }
    if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
      execSync('rm package-lock.json', { stdio: 'inherit', cwd: __dirname });
    }

    // 重新安装
    console.log('📦 重新安装依赖...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });

    console.log('✅ 清理重新安装完成');
    return true;
  } catch (error) {
    console.log(`❌ 清理重新安装失败: ${error.message}`);
    return false;
  }
}

// 主执行逻辑
const command = process.argv[2];

if (command === 'clean') {
  cleanInstall();
  checkAllNativeModules();
} else if (command === 'rebuild-all') {
  console.log('🔨 重新编译所有原生模块...');
  for (const packageName of NATIVE_PACKAGES) {
    rebuildNativeModule(packageName);
  }
  checkAllNativeModules();
} else {
  // 默认执行检查和自动修复
  checkAllNativeModules();
}

console.log('\n📋 使用方法:');
console.log('node fix-native-modules.js          # 检查并自动修复');
console.log('node fix-native-modules.js clean    # 清理重新安装');
console.log('node fix-native-modules.js rebuild-all  # 重新编译所有模块');
