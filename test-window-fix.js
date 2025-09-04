// Simple test to verify window object usage in ES modules
console.log('Testing window object usage...')

// Test 1: Check if window exists
if (typeof window !== 'undefined') {
  console.log('✅ Window object is available')

  // Test 2: Check if we can safely assign to window
  const testKey = '__test_key__'
  window[testKey] = 'test_value'

  if (window[testKey] === 'test_value') {
    console.log('✅ Window object assignment works')
    delete window[testKey]
  } else {
    console.log('❌ Window object assignment failed')
  }
} else {
  console.log('⚠️ Window object is not available (server-side environment)')
}

// Test 3: Check if our performanceService can be imported
try {
  import('./src/renderer/src/services/performanceService.js').then(() => {
    console.log('✅ PerformanceService import successful')
  }).catch(error => {
    console.log('❌ PerformanceService import failed:', error.message)
  })
} catch (error) {
  console.log('❌ PerformanceService import error:', error.message)
}

console.log('Window usage test completed')
