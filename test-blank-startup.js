// Test script to verify blank file startup fix
const { spawn } = require('child_process')
const path = require('path')

console.log('🧪 Testing MarkText blank file startup...')

// Kill any existing MarkText processes
const killExisting = spawn('pkill', ['-f', 'marktext'], { stdio: 'inherit' })

killExisting.on('close', () => {
  console.log('✅ Killed existing MarkText processes')

  // Start MarkText in development mode
  const marktextProcess = spawn('npm', ['start'], {
    cwd: '/Users/hubo/mycode/marktext',
    stdio: ['inherit', 'pipe', 'pipe']
  })

  let outputBuffer = ''

  marktextProcess.stdout.on('data', (data) => {
    const output = data.toString()
    outputBuffer += output
    console.log('📝 STDOUT:', output.trim())

    // Look for bootstrap messages
    if (output.includes('BOOTSTRAP MESSAGE RECEIVED')) {
      console.log('🎯 Bootstrap message detected!')
    }

    if (output.includes('Creating blank file for blank startup')) {
      console.log('✅ Blank file creation detected!')
    }

    if (output.includes('NEW_UNTITLED_TAB')) {
      console.log('✅ New untitled tab creation detected!')
    }
  })

  marktextProcess.stderr.on('data', (data) => {
    console.log('❌ STDERR:', data.toString().trim())
  })

  marktextProcess.on('close', (code) => {
    console.log(`📊 MarkText process exited with code ${code}`)
    console.log('🧪 Test completed')
  })

  // Wait for startup and then kill the process
  setTimeout(() => {
    console.log('⏰ Timeout reached, killing test process...')
    marktextProcess.kill()
  }, 10000)
})
