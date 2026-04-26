<script setup lang="ts">
  import { ref } from 'vue'
  import BaseButton from '../../../components/atoms/BaseButton.vue'
  import {
    useA11y,
    useColors,
    useFocusManagement,
    useKeyboardNavigation,
    useMotionPreferences,
    usePerformance,
    useTypography,
    useVueUseEnhanced,
  } from '../../../composables'

  // Composables
  const { colorTokens, semanticColors } = useColors()
  const { textStyles, getTypographyTokens } = useTypography()
  const { performanceMetrics, measureRenderTime, clearCache } = usePerformance({
    enableMemoization: true,
    cacheSize: 100,
  })
  const { userPreferences, announceToScreenReader } = useA11y({
    role: 'region',
    ariaLabel: 'Composables Showcase',
    ariaLive: 'polite',
  })
  const { shouldAnimate, shouldTransition } = useMotionPreferences({
    respectReducedMotion: true,
    respectHighContrast: true,
    respectColorScheme: true,
  })
  const { focusTrapActive } = useFocusManagement({
    trapFocus: true,
    returnFocus: true,
  })
  const { isActive: keyboardActive } = useKeyboardNavigation({
    enableArrowKeys: true,
    enableTabNavigation: true,
    enableEscapeKey: true,
    enableEnterKey: true,
    enableSpaceKey: true,
  })
  const { deviceInfo, accessibilityInfo } = useVueUseEnhanced({
    respectMotion: true,
    respectContrast: true,
    respectColorScheme: true,
  })

  // State
  const currentTheme = ref('auto')
  const isTestingPerformance = ref(false)

  // Methods
  const setTheme = (theme: string) => {
    currentTheme.value = theme
    announceToScreenReader(`Theme changed to ${theme}`)

    // Show success toast
    if (window.$toast) {
      window.$toast.success(`Theme set to ${theme}`)
    }
  }

  const testPerformance = async () => {
    isTestingPerformance.value = true

    try {
      await measureRenderTime(() => {
        // Simulate some work
        const start = performance.now()
        while (performance.now() - start < 50) {
          // Busy wait for 50ms
        }
      })

      // Show success toast
      if (window.$toast) {
        window.$toast.success('Performance test completed!')
      }
    } catch (error) {
      console.error('Performance test failed:', error)

      // Show error toast
      if (window.$toast) {
        window.$toast.error('Performance test failed')
      }
    } finally {
      isTestingPerformance.value = false
    }
  }

  const handleClearCache = () => {
    clearCache()

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Cache cleared successfully!')
    }
  }

  const exportComposablesData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      theme: currentTheme.value,
      colors: {
        tokens: colorTokens.value,
        semantic: semanticColors.value,
      },
      typography: {
        styles: textStyles.value,
        tokens: getTypographyTokens(),
      },
      performance: performanceMetrics.value,
      accessibility: {
        preferences: userPreferences.value,
        device: deviceInfo.value,
        accessibility: accessibilityInfo.value,
      },
      motion: {
        shouldAnimate: shouldAnimate.value,
        shouldTransition: shouldTransition.value,
      },
      focus: {
        trapActive: focusTrapActive.value,
        keyboardActive: keyboardActive.value,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `composables-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Composables data exported successfully!')
    }
  }

  const showComposablesInfo = () => {
    const info = `
      Available Composables:
      • useColors - Sistema de colores semánticos
      • useTypography - Sistema de tipografía unificado
      • usePerformance - Optimizaciones de rendimiento
      • useA11y - Accesibilidad WCAG 2.2
      • useMotionPreferences - Preferencias de movimiento
      • useFocusManagement - Gestión de focus
      • useKeyboardNavigation - Navegación por teclado
      • useVueUseEnhanced - Integración VueUse
    `

    console.log('Composables Info:', info)

    // Show info toast
    if (window.$toast) {
      window.$toast.info('Composables info logged to console')
    }
  }

  const resetComposables = () => {
    currentTheme.value = 'auto'

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Composables reset successfully!')
    }
  }
</script>

<template>
  <section id="composables" class="mb-12">
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 p-6 shadow-lg"
    >
      <div class="flex items-center gap-3 mb-6">
        <div class="text-2xl">⚙️</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Composables Showcase
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Demostración de composables especializados
          </p>
        </div>
      </div>

      <!-- Composables Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <!-- Colors Composable -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">🎨</div>
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Colors
            </h3>
          </div>
          <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Sistema de colores semánticos
          </p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs text-blue-600 dark:text-blue-400">Primary:</span>
              <div class="w-4 h-4 rounded bg-blue-500"></div>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-blue-600 dark:text-blue-400">Success:</span>
              <div class="w-4 h-4 rounded bg-green-500"></div>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-blue-600 dark:text-blue-400">Warning:</span>
              <div class="w-4 h-4 rounded bg-yellow-500"></div>
            </div>
          </div>
        </div>

        <!-- Typography Composable -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">📝</div>
            <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">
              Typography
            </h3>
          </div>
          <p class="text-sm text-green-700 dark:text-green-300 mb-3">
            Sistema de tipografía unificado
          </p>
          <div class="space-y-1">
            <p class="text-xs font-bold text-green-800 dark:text-green-200">
              Heading 1
            </p>
            <p class="text-xs text-green-700 dark:text-green-300">Body Text</p>
            <p class="text-xs text-green-600 dark:text-green-400">Caption</p>
          </div>
        </div>

        <!-- Performance Composable -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">⚡</div>
            <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Performance
            </h3>
          </div>
          <p class="text-sm text-purple-700 dark:text-purple-300 mb-3">
            Optimizaciones avanzadas
          </p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs text-purple-600 dark:text-purple-400"
                >Cache Hits:</span
              >
              <span class="text-xs font-medium text-purple-800 dark:text-purple-200">{{
                performanceMetrics.cacheHits
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-purple-600 dark:text-purple-400"
                >Render Time:</span
              >
              <span class="text-xs font-medium text-purple-800 dark:text-purple-200"
                >{{ performanceMetrics.renderTime.toFixed(1) }}ms</span
              >
            </div>
          </div>
        </div>

        <!-- A11y Composable -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">♿</div>
            <h3 class="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Accessibility
            </h3>
          </div>
          <p class="text-sm text-orange-700 dark:text-orange-300 mb-3">
            WCAG 2.2 compliance
          </p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs text-orange-600 dark:text-orange-400"
                >Reduced Motion:</span
              >
              <span class="text-xs font-medium text-orange-800 dark:text-orange-200">{{
                accessibilityInfo.prefersReducedMotion ? 'Yes' : 'No'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-orange-600 dark:text-orange-400"
                >High Contrast:</span
              >
              <span class="text-xs font-medium text-orange-800 dark:text-orange-200">{{
                accessibilityInfo.isHighContrast ? 'Yes' : 'No'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Motion Preferences -->
        <div
          class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">🔄</div>
            <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">Motion</h3>
          </div>
          <p class="text-sm text-red-700 dark:text-red-300 mb-3">
            Preferencias de movimiento
          </p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs text-red-600 dark:text-red-400"
                >Should Animate:</span
              >
              <span class="text-xs font-medium text-red-800 dark:text-red-200">{{
                shouldAnimate ? 'Yes' : 'No'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-red-600 dark:text-red-400"
                >Should Transition:</span
              >
              <span class="text-xs font-medium text-red-800 dark:text-red-200">{{
                shouldTransition ? 'Yes' : 'No'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Focus Management -->
        <div
          class="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4 border border-indigo-200/50 dark:border-indigo-700/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="text-xl">🎯</div>
            <h3 class="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              Focus
            </h3>
          </div>
          <p class="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
            Gestión de focus avanzada
          </p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs text-indigo-600 dark:text-indigo-400"
                >Focus Trap:</span
              >
              <span class="text-xs font-medium text-indigo-800 dark:text-indigo-200"
                >Active</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-indigo-600 dark:text-indigo-400"
                >Keyboard Nav:</span
              >
              <span class="text-xs font-medium text-indigo-800 dark:text-indigo-200"
                >Enabled</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Composable Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Interactive Demo -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Interactive Demo
          </h3>

          <!-- Color Picker -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Color Theme</label
            >
            <div class="flex gap-2">
              <BaseButton
                variant="primary"
                size="sm"
                @click="setTheme('light')"
                :class="{ 'ring-2 ring-blue-500': currentTheme === 'light' }"
              >
                Light
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                @click="setTheme('dark')"
                :class="{ 'ring-2 ring-blue-500': currentTheme === 'dark' }"
              >
                Dark
              </BaseButton>
              <BaseButton
                variant="outline"
                size="sm"
                @click="setTheme('auto')"
                :class="{ 'ring-2 ring-blue-500': currentTheme === 'auto' }"
              >
                Auto
              </BaseButton>
            </div>
          </div>

          <!-- Typography Scale -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Typography Scale</label
            >
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-900 dark:text-white">Heading 1</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">Body Text</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Caption</p>
            </div>
          </div>

          <!-- Performance Test -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Performance Test</label
            >
            <div class="flex gap-2">
              <BaseButton
                variant="primary"
                size="sm"
                @click="testPerformance"
                :loading="isTestingPerformance"
              >
                Test Performance
              </BaseButton>
              <BaseButton variant="secondary" size="sm" @click="handleClearCache">
                Clear Cache
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Composable Info -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Composable Information
          </h3>

          <div class="space-y-3">
            <div
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Available Composables
              </h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <span class="text-gray-600 dark:text-gray-400">• useColors</span>
                <span class="text-gray-600 dark:text-gray-400">• useTypography</span>
                <span class="text-gray-600 dark:text-gray-400">• usePerformance</span>
                <span class="text-gray-600 dark:text-gray-400">• useA11y</span>
                <span class="text-gray-600 dark:text-gray-400"
                  >• useMotionPreferences</span
                >
                <span class="text-gray-600 dark:text-gray-400"
                  >• useFocusManagement</span
                >
                <span class="text-gray-600 dark:text-gray-400"
                  >• useKeyboardNavigation</span
                >
                <span class="text-gray-600 dark:text-gray-400"
                  >• useVueUseEnhanced</span
                >
              </div>
            </div>

            <div
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Features
              </h4>
              <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p>• TypeScript support</p>
                <p>• WCAG 2.2 compliance</p>
                <p>• Performance optimization</p>
                <p>• VueUse integration</p>
                <p>• Motion preferences</p>
                <p>• Focus management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Composable Actions -->
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="primary" size="sm" @click="exportComposablesData">
          Export Data
        </BaseButton>

        <BaseButton variant="secondary" size="sm" @click="showComposablesInfo">
          Show Info
        </BaseButton>

        <BaseButton variant="outline" size="sm" @click="resetComposables">
          Reset
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
  /* Custom styles for composables component */
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
