<template>
  <section id="vueuse" class="mb-12">
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 p-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="text-2xl">🔧</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            VueUse Integration
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Demostración de integración con VueUse
          </p>
        </div>
      </div>

      <!-- VueUse Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Window Size -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">
                Window Size
              </p>
              <p class="text-lg font-bold text-blue-900 dark:text-blue-100">
                {{ width }}x{{ height }}
              </p>
            </div>
            <div class="text-blue-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Online Status -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700 dark:text-green-300">
                Online Status
              </p>
              <p class="text-lg font-bold text-green-900 dark:text-green-100">
                {{ isOnline ? 'Online' : 'Offline' }}
              </p>
            </div>
            <div class="text-green-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Idle Status -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-700 dark:text-orange-300">
                Idle Status
              </p>
              <p class="text-lg font-bold text-orange-900 dark:text-orange-100">
                {{ isIdle ? 'Idle' : 'Active' }}
              </p>
            </div>
            <div class="text-orange-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Document Visibility -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-700 dark:text-purple-300">
                Document
              </p>
              <p class="text-lg font-bold text-purple-900 dark:text-purple-100">
                {{ documentVisibility }}
              </p>
            </div>
            <div class="text-purple-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  d="M4 5a2 2 0 012-2 1 1 0 001-1 1 1 0 00-1-1 2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 1 1 0 00-1 1 1 1 0 001 1 2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- VueUse Features -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Interactive Elements -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Interactive Elements
          </h3>

          <!-- Mouse Position -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mouse Position</label>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                X: {{ mouseX }}, Y: {{ mouseY }}
              </p>
            </div>
          </div>

          <!-- Keyboard Modifiers -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Modifiers</label>
            <div class="flex gap-2">
              <BaseBadge :variant="isShiftPressed ? 'primary' : 'neutral'" size="sm">
                Shift
              </BaseBadge>
              <BaseBadge :variant="isCtrlPressed ? 'primary' : 'neutral'" size="sm">
                Ctrl
              </BaseBadge>
              <BaseBadge :variant="isAltPressed ? 'primary' : 'neutral'" size="sm">
                Alt
              </BaseBadge>
            </div>
          </div>

          <!-- Clipboard -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Clipboard</label>
            <div class="flex gap-2">
              <BaseInput v-model="clipboardText" placeholder="Text to copy" size="sm" />
              <BaseButton variant="secondary" size="sm" @click="copyToClipboard" :loading="isCopying">
                Copy
              </BaseButton>
            </div>
            <p v-if="copied" class="text-sm text-green-600 dark:text-green-400">
              ✓ Copied to clipboard!
            </p>
          </div>
        </div>

        <!-- Device & Preferences -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Device & Preferences
          </h3>

          <!-- Device Info -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Device Type</label>
            <div class="flex gap-2">
              <BaseBadge :variant="deviceInfo.isMobile ? 'primary' : 'neutral'" size="sm">
                Mobile
              </BaseBadge>
              <BaseBadge :variant="deviceInfo.isTablet ? 'primary' : 'neutral'" size="sm">
                Tablet
              </BaseBadge>
              <BaseBadge :variant="deviceInfo.isDesktop ? 'primary' : 'neutral'" size="sm">
                Desktop
              </BaseBadge>
            </div>
          </div>

          <!-- Touch Support -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Touch Support</label>
            <div class="flex gap-2">
              <BaseBadge :variant="deviceInfo.isTouch ? 'success' : 'neutral'" size="sm">
                {{ deviceInfo.isTouch ? 'Touch Device' : 'Mouse Device' }}
              </BaseBadge>
            </div>
          </div>

          <!-- Pixel Ratio -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Pixel Ratio</label>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ deviceInfo.pixelRatio.toFixed(2) }}x
              </p>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</label>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatTimestamp(timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- VueUse Actions -->
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="primary" size="sm" @click="testVueUseFeatures" :loading="isTesting">
          Test VueUse Features
        </BaseButton>

        <BaseButton variant="secondary" size="sm" @click="exportVueUseData">
          Export Data
        </BaseButton>

        <BaseButton variant="outline" size="sm" @click="resetVueUseData">
          Reset Data
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseBadge from '../../../components/atoms/BaseBadge.vue'
import BaseButton from '../../../components/atoms/BaseButton.vue'
import BaseInput from '../../../components/atoms/BaseInput.vue'
import {
  useClipboard,
  useKeyModifier,
  useMouse,
  useVueUseEnhanced,
} from '../../../composables'

// Composables
const {
  deviceInfo,
  accessibilityInfo,
  performanceInfo,
  width,
  height,
  isOnline,
  isIdle,
  documentVisibility,
  timestamp,
} = useVueUseEnhanced({
  respectMotion: true,
  respectContrast: true,
  respectColorScheme: true,
})

const { x: mouseX, y: mouseY } = useMouse()
const { copy, copied, isSupported: isClipboardSupported } = useClipboard()
const isShiftPressed = useKeyModifier('Shift')
const isCtrlPressed = useKeyModifier('Control')
const isAltPressed = useKeyModifier('Alt')

// State
const clipboardText = ref('Hello from VueUse!')
const isCopying = ref(false)
const isTesting = ref(false)

// Methods
const copyToClipboard = async () => {
  if (!isClipboardSupported.value) {
    console.warn('Clipboard not supported')
    return
  }

  isCopying.value = true
  try {
    await copy(clipboardText.value)

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Text copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to copy:', error)

    // Show error toast
    if (window.$toast) {
      window.$toast.error('Failed to copy text')
    }
  } finally {
    isCopying.value = false
  }
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const testVueUseFeatures = async () => {
  isTesting.value = true

  try {
    // Test various VueUse features
    console.log('Testing VueUse features...')

    // Simulate some testing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Show success toast
    if (window.$toast) {
      window.$toast.success('VueUse features tested successfully!')
    }
  } catch (error) {
    console.error('VueUse testing failed:', error)

    // Show error toast
    if (window.$toast) {
      window.$toast.error('VueUse testing failed')
    }
  } finally {
    isTesting.value = false
  }
}

const exportVueUseData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    device: deviceInfo.value,
    accessibility: accessibilityInfo.value,
    performance: performanceInfo.value,
    window: {
      width: width.value,
      height: height.value,
    },
    status: {
      isOnline: isOnline.value,
      isIdle: isIdle.value,
      documentVisibility: documentVisibility.value,
    },
    mouse: {
      x: mouseX.value,
      y: mouseY.value,
    },
    keyboard: {
      shift: isShiftPressed.value,
      ctrl: isCtrlPressed.value,
      alt: isAltPressed.value,
    },
    clipboard: {
      isSupported: isClipboardSupported.value,
      copied: copied.value,
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vueuse-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  // Show success toast
  if (window.$toast) {
    window.$toast.success('VueUse data exported successfully!')
  }
}

const resetVueUseData = () => {
  clipboardText.value = 'Hello from VueUse!'

  // Show success toast
  if (window.$toast) {
    window.$toast.success('VueUse data reset successfully!')
  }
}
</script>

<style scoped>
/* Custom styles for VueUse component */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-gradient-to-br {
    background: #ffffff !important;
    border: 2px solid #000000 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bg-gradient-to-br {
    background: #f9fafb !important;
  }
}
</style>
