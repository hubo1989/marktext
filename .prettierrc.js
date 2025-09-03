module.exports = {
  // 代码风格
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',

  // 缩进和换行
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  endOfLine: 'lf',

  // 文件类型
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: ['*.vue'],
      options: {
        parser: 'vue'
      }
    },
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      options: {
        parser: 'babel'
      }
    },
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        parser: 'css'
      }
    }
  ],

  // 插件配置（如果安装了相关插件）
  plugins: []
}

