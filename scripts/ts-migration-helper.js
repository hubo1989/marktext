#!/usr/bin/env node

/**
 * TypeScript迁移帮助脚本
 * 帮助自动化TypeScript迁移过程中的常见任务
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const args = process.argv.slice(2)
const command = args[0]

console.log('🔧 TypeScript Migration Helper')
console.log('==============================\n')

switch (command) {
  case 'analyze':
    analyzeJsFiles()
    break

  case 'convert':
    convertFile(args[1])
    break

  case 'check':
    runTypeCheck()
    break

  case 'stats':
    showMigrationStats()
    break

  case 'help':
  default:
    showHelp()
    break
}

function analyzeJsFiles() {
  console.log('📊 分析JavaScript文件...')

  const srcDir = path.join(__dirname, '..', 'src')
  const jsFiles = []

  function scanDir(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !['node_modules', 'muya', 'dist'].includes(file)) {
        scanDir(filePath)
      } else if (file.endsWith('.js') && !file.endsWith('.config.js')) {
        jsFiles.push(path.relative(srcDir, filePath))
      }
    }
  }

  scanDir(srcDir)

  console.log(`找到 ${jsFiles.length} 个JavaScript文件:\n`)
  jsFiles.forEach((file, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${file}`)
  })

  console.log(`\n💡 建议迁移优先级:`)
  console.log(`   1. 工具函数 (src/renderer/src/util/)`)
  console.log(`   2. 类型定义 (src/renderer/src/types/)`)
  console.log(`   3. Store文件 (src/renderer/src/store/)`)
  console.log(`   4. 组件文件 (src/renderer/src/components/)`)
}

function convertFile(filePath) {
  if (!filePath) {
    console.error('❌ 请提供要转换的文件路径')
    process.exit(1)
  }

  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ 文件不存在: ${fullPath}`)
    process.exit(1)
  }

  if (!fullPath.endsWith('.js')) {
    console.error('❌ 只支持转换 .js 文件')
    process.exit(1)
  }

  console.log(`🔄 转换文件: ${filePath}`)

  // 简单的转换策略
  let content = fs.readFileSync(fullPath, 'utf8')

  // 添加基本的TypeScript转换
  content = content.replace(
    /(function\s+(\w+)\s*\(([^)]*)\))/g,
    'function $2($3): any'
  )

  // 添加基本类型注解
  content = content.replace(
    /(const|let|var)\s+(\w+)\s*=\s*([^;\n]+)/g,
    '$1 $2: any = $3'
  )

  const tsPath = fullPath.replace('.js', '.ts')
  fs.writeFileSync(tsPath, content)

  console.log(`✅ 已创建: ${path.relative(process.cwd(), tsPath)}`)
  console.log(`⚠️  请手动检查和完善类型定义`)
}

function runTypeCheck() {
  console.log('🔍 运行TypeScript类型检查...')

  try {
    execSync('npm run type-check', { stdio: 'inherit' })
    console.log('✅ 类型检查通过')
  } catch (error) {
    console.log('❌ 类型检查失败，请修复错误')
    process.exit(1)
  }
}

function showMigrationStats() {
  console.log('📈 迁移统计...')

  const srcDir = path.join(__dirname, '..', 'src')
  let jsFiles = 0
  let tsFiles = 0
  let vueFiles = 0

  function scanDir(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !['node_modules', 'muya', 'dist'].includes(file)) {
        scanDir(filePath)
      } else {
        if (file.endsWith('.js')) jsFiles++
        if (file.endsWith('.ts')) tsFiles++
        if (file.endsWith('.vue')) vueFiles++
      }
    }
  }

  scanDir(srcDir)

  const total = jsFiles + tsFiles
  const tsPercentage = total > 0 ? ((tsFiles / total) * 100).toFixed(1) : 0

  console.log(`📊 当前状态:`)
  console.log(`   JavaScript文件: ${jsFiles}`)
  console.log(`   TypeScript文件: ${tsFiles}`)
  console.log(`   Vue组件文件: ${vueFiles}`)
  console.log(`   迁移进度: ${tsPercentage}%`)
  console.log(`\n🎯 下一步建议:`)

  if (jsFiles > 0) {
    console.log(`   • 继续转换剩余的 ${jsFiles} 个JS文件`)
  }

  if (vueFiles > 0) {
    console.log(`   • 为Vue组件添加TypeScript支持`)
  }

  console.log(`   • 完善类型定义`)
  console.log(`   • 添加更严格的类型检查`)
}

function showHelp() {
  console.log('📖 TypeScript迁移帮助脚本')
  console.log('')
  console.log('可用命令:')
  console.log('  analyze    - 分析项目中的JavaScript文件')
  console.log('  convert    - 转换指定文件为TypeScript')
  console.log('  check      - 运行TypeScript类型检查')
  console.log('  stats      - 显示迁移统计信息')
  console.log('  help       - 显示此帮助信息')
  console.log('')
  console.log('使用示例:')
  console.log('  node scripts/ts-migration-helper.js analyze')
  console.log('  node scripts/ts-migration-helper.js convert src/util/example.js')
  console.log('  node scripts/ts-migration-helper.js stats')
}

