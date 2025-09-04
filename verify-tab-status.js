const { spawn } = require('child_process');

// 简单验证脚本
console.log('MarkText应用程序状态验证:');

// 检查进程
const checkProcess = spawn('ps', ['aux'], { stdio: 'pipe' });
let output = '';

checkProcess.stdout.on('data', (data) => {
  output += data.toString();
});

checkProcess.on('close', () => {
  const hasMarkText = output.includes('electron-vite preview') || output.includes('marktext');

  if (hasMarkText) {
    console.log('✅ MarkText 进程正在运行');
    console.log('');
    console.log('请手动验证:');
    console.log('1. 编辑器界面是否显示');
    console.log('2. 是否有空白tab页打开');
    console.log('3. 是否可以正常编辑内容');
    console.log('');
    console.log('如果仍有问题，请截图并提供更多详细信息。');
  } else {
    console.log('❌ MarkText 进程未找到');
  }
});
