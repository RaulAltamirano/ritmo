<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../../../components/atoms/BaseButton.vue'
import { usePerformance, useVueUseEnhanced } from '../../../composables'

// Composables
const {
  performanceMetrics,
  measureRenderTime,
  clearCache: clearPerformanceCache,
} = usePerformance({
  enableMemoization: true,
  cacheSize: 100,
})

const { deviceInfo, accessibilityInfo } = useVueUseEnhanced({
  respectMotion: true,
  respectContrast: true,
  respectColorScheme: true,
})

// State
const isMeasuring = ref(false)

// Computed
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Methods
const measurePerformance = async () => {
  isMeasuring.value = true

  try {
    await measureRenderTime(() => {
      // Simulate some work
      const start = performance.now()
      while (performance.now() - start < 100) {
        // Busy wait for 100ms
      }
    })

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Performance measurement completed!')
    }
  } catch (error) {
    console.error('Performance measurement failed:', error)

    // Show error toast
    if (window.$toast) {
      window.$toast.error('Performance measurement failed')
    }
  } finally {
    isMeasuring.value = false
  }
}

const clearCache = () => {
  clearPerformanceCache()

  // Show success toast
  if (window.$toast) {
    window.$toast.success('Cache cleared successfully!')
  }
}

const exportMetrics = () => {
  const metrics = {
    performance: performanceMetrics.value,
    device: deviceInfo.value,
    accessibility: accessibilityInfo.value,
    timestamp: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(metrics, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  // Show success toast
  if (window.$toast) {
    window.$toast.success('Metrics exported successfully!')
  }
}
</script>

<template>
  <section id="performance" class="mb-12">
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 p-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="text-2xl">⚡</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Metrics
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Métricas de rendimiento en tiempo real
          </p>
        </div>
      </div>

      <!-- Performance Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Cache Performance -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">
                Cache Hits
              </p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {{ performanceMetrics.cacheHits }}
              </p>
            </div>
            <div class="text-blue-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Cache Misses -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-700 dark:text-orange-300">
                Cache Misses
              </p>
              <p class="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {{ performanceMetrics.cacheMisses }}
              </p>
            </div>
            <div class="text-orange-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Render Time -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700 dark:text-green-300">
                Render Time
              </p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">
                {{ performanceMetrics.renderTime.toFixed(2) }}ms
              </p>
            </div>
            <div class="text-green-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-700 dark:text-purple-300">
                Memory
              </p>
              <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {{ formatBytes(performanceMetrics.memoryUsage) }}
              </p>
            </div>
            <div class="text-purple-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Device Info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Device Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Device Information
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Screen Size:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ deviceInfo.screenSize.width }}x{{
                deviceInfo.screenSize.height
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Device Type:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{
                  deviceInfo.isMobile
                    ? 'Mobile'
                    : deviceInfo.isTablet
                      ? 'Tablet'
                      : 'Desktop'
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Touch Device:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                deviceInfo.isTouch ? 'Yes' : 'No'
                }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Pixel Ratio:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ deviceInfo.pixelRatio.toFixed(2) }}x</span>
            </div>
          </div>
        </div>

        <!-- Accessibility Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Accessibility
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Reduced Motion:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                accessibilityInfo.prefersReducedMotion ? 'Yes' : 'No'
                }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">High Contrast:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                accessibilityInfo.isHighContrast ? 'Yes' : 'No'
                }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Online Status:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                accessibilityInfo.isOnline ? 'Online' : 'Offline'
                }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Idle Status:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{
                accessibilityInfo.isIdle ? 'Idle' : 'Active'
                }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Actions -->
      <div class="mt-6 flex flex-wrap gap-3">
        <BaseButton variant="primary" size="sm" @click="measurePerformance" :loading="isMeasuring">
          Measure Performance
        </BaseButton>

        <BaseButton variant="secondary" size="sm" @click="clearCache">
          Clear Cache
        </BaseButton>

        <BaseButton variant="outline" size="sm" @click="exportMetrics">
          Export Metrics
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom styles for performance component */
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
