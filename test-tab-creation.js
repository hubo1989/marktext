const { spawn } = require('child_process');
const path = require('path');

// 启动应用程序并等待一段时间
console.log('Starting MarkText...');

const app = spawn('npm', ['start'], {
  cwd: '/Users/hubo/mycode/marktext',
  detached: true,
  stdio: 'inherit'
});

// 等待应用程序启动
setTimeout(() => {
  console.log('MarkText should be running now...');
  console.log('Please check if a tab is displayed in the editor.');

  // 10秒后自动停止
  setTimeout(() => {
    console.log('Stopping MarkText...');
    try {
      if (process.platform === 'darwin') {
        spawn('pkill', ['-f', 'electron-vite preview']);
      } else {
        spawn('pkill', ['-f', 'marktext']);
      }
    } catch (e) {
      console.log('Could not stop process automatically');
    }
  }, 10000);
}, 5000);
