<template>
  <div v-if="showAnimation" class="cli-startup-overlay" @click="skipAnimation">
    <div class="cli-terminal">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="terminal-button close"></span>
          <span class="terminal-button minimize"></span>
          <span class="terminal-button maximize"></span>
        </div>
        <div class="terminal-title">MarkText - Initializing...</div>
      </div>
      <div class="terminal-body">
        <div class="terminal-content">
          <div
            v-for="(line, index) in displayedLines"
            :key="index"
            class="terminal-line"
            :class="{ 'current-line': index === currentLineIndex }"
          >
            <span class="terminal-prompt">{{ line.prompt }}</span>
            <span class="terminal-command">{{ line.command }}</span>
            <span v-if="line.output" class="terminal-output">{{ line.output }}</span>
            <span v-if="index === currentLineIndex && !line.completed" class="cursor">█</span>
          </div>
        </div>
      </div>
    </div>
    <div class="skip-hint">
      <span>{{ t('startup.skipHint') || 'Click anywhere to skip' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  duration: {
    type: Number,
    default: 3000
  }
})

// Emits
const emit = defineEmits(['complete', 'skip'])

// Composables
const { t } = useI18n()

// Reactive data
const showAnimation = ref(true)
const currentLineIndex = ref(0)
const displayedLines = ref([])

// CLI commands sequence
const cliCommands = [
  {
    prompt: '$',
    command: 'marktext --version',
    output: 'MarkText v1.0.0',
    delay: 300
  },
  {
    prompt: '$',
    command: 'marktext --check-deps',
    output: '✓ Vue 3.3.0\n✓ Electron 25.0.0\n✓ Node.js 18.0.0',
    delay: 500
  },
  {
    prompt: '$',
    command: 'marktext --load-themes',
    output: 'Loading themes... [light, dark, graphite, material-dark, ulysses, one-dark]',
    delay: 400
  },
  {
    prompt: '$',
    command: 'marktext --init-plugins',
    output: 'Initializing plugins... [editor, markdown, image-uploader, dual-screen]',
    delay: 400
  },
  {
    prompt: '$',
    command: 'marktext --check-updates',
    output: 'Checking for updates... No updates available',
    delay: 300
  },
  {
    prompt: '$',
    command: 'marktext --start',
    output: 'Starting MarkText...',
    delay: 200
  }
]

// Methods
const startAnimation = () => {
  let totalDelay = 0

  cliCommands.forEach((cmd, index) => {
    setTimeout(() => {
      displayedLines.value.push({ ...cmd, completed: false })
      currentLineIndex.value = index

      // Simulate typing effect
      setTimeout(() => {
        const line = displayedLines.value[index]
        if (line) {
          line.completed = true
        }
      }, cmd.command.length * 50)
    }, totalDelay)

    totalDelay += cmd.delay
  })

  // Auto complete after all commands
  setTimeout(() => {
    completeAnimation()
  }, totalDelay + 500)
}

const completeAnimation = () => {
  showAnimation.value = false
  emit('complete')
}

const skipAnimation = () => {
  showAnimation.value = false
  emit('skip')
}

// Keyboard shortcut to skip
const handleKeyPress = (event) => {
  if (event.key === 'Escape' || event.key === ' ') {
    skipAnimation()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  startAnimation()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.cli-startup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.cli-terminal {
  width: 800px;
  max-width: 90vw;
  height: 500px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: terminal-appear 0.5s ease-out;
}

@keyframes terminal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.terminal-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.terminal-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.terminal-button.close {
  background: #ff5f57;
}

.terminal-button.minimize {
  background: #ffbd2e;
}

.terminal-button.maximize {
  background: #28ca42;
}

.terminal-button:hover {
  opacity: 0.8;
}

.terminal-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.terminal-body {
  padding: 20px;
  height: calc(100% - 60px);
  overflow: hidden;
}

.terminal-content {
  color: #e6e6e6;
  font-size: 14px;
  line-height: 1.5;
  height: 100%;
  overflow-y: auto;
}

.terminal-line {
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-prompt {
  color: #4ade80;
  margin-right: 8px;
}

.terminal-command {
  color: #60a5fa;
}

.terminal-output {
  color: #e6e6e6;
  display: block;
  margin-top: 4px;
  margin-left: 16px;
}

.current-line .cursor {
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.skip-hint {
  position: absolute;
  bottom: 40px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-align: center;
  animation: fade-in-out 2s ease-in-out infinite;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .cli-terminal {
    width: 95vw;
    height: 400px;
  }

  .terminal-content {
    font-size: 12px;
  }

  .terminal-body {
    padding: 16px;
  }
}
</style>
