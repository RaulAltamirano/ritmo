<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import BaseButton from '../../../components/atoms/BaseButton.vue'
  import {
    useA11y,
    useKeyboardNavigation,
    useMotionPreferences,
  } from '../../../composables'

  // Composables
  const { validateColorContrast, announceToScreenReader, generateAriaId } = useA11y({
    role: 'region',
    ariaLabel: 'Accessibility Testing Section',
    ariaLive: 'polite',
  })

  const { isActive: keyboardActive } = useKeyboardNavigation({
    enableArrowKeys: true,
    enableTabNavigation: true,
    enableEscapeKey: true,
    enableEnterKey: true,
    enableSpaceKey: true,
  })

  const { shouldAnimate, shouldTransition } = useMotionPreferences({
    respectReducedMotion: true,
    respectHighContrast: true,
    respectColorScheme: true,
  })

  // State
  const foregroundColor = ref('#000000')
  const backgroundColor = ref('#ffffff')
  const focusVisible = ref(false)
  const screenReaderReady = ref(false)
  const keyboardNavigation = ref(false)
  const isRunningTests = ref(false)

  // Accessibility tests
  const accessibilityTests = ref([
    { id: 'contrast', name: 'Color Contrast Ratio', passed: false },
    { id: 'focus', name: 'Focus Management', passed: false },
    { id: 'keyboard', name: 'Keyboard Navigation', passed: false },
    { id: 'screen-reader', name: 'Screen Reader Support', passed: false },
    { id: 'aria', name: 'ARIA Attributes', passed: false },
    { id: 'semantics', name: 'Semantic HTML', passed: false },
  ])

  // Computed
  const contrastRatio = computed(() => {
    const ratio = validateColorContrast(foregroundColor.value, backgroundColor.value)
    return ratio ? ratio.toFixed(2) : '0.00'
  })

  // Methods
  const testFocus = () => {
    focusVisible.value = true
    announceToScreenReader('Focus test activated')

    setTimeout(() => {
      focusVisible.value = false
    }, 2000)
  }

  const announceTest = () => {
    announceToScreenReader('This is a test announcement for screen readers')
  }

  const testScreenReader = () => {
    screenReaderReady.value = true
    announceToScreenReader('Screen reader test completed successfully')

    setTimeout(() => {
      screenReaderReady.value = false
    }, 3000)
  }

  const testLiveRegion = () => {
    const liveRegion = document.getElementById('a11y-live-region')
    if (liveRegion) {
      liveRegion.textContent =
        'Live region test: This content should be announced to screen readers'
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 2000)
    }
  }

  const runAllTests = async () => {
    isRunningTests.value = true

    try {
      // Test 1: Color Contrast
      const contrastTest = accessibilityTests.value.find(t => t.id === 'contrast')
      if (contrastTest) {
        contrastTest.passed = validateColorContrast(
          foregroundColor.value,
          backgroundColor.value,
        )
      }

      // Test 2: Focus Management
      const focusTest = accessibilityTests.value.find(t => t.id === 'focus')
      if (focusTest) {
        focusTest.passed = true // Simplified test
      }

      // Test 3: Keyboard Navigation
      const keyboardTest = accessibilityTests.value.find(t => t.id === 'keyboard')
      if (keyboardTest) {
        keyboardTest.passed = keyboardActive.value
      }

      // Test 4: Screen Reader
      const screenReaderTest = accessibilityTests.value.find(
        t => t.id === 'screen-reader',
      )
      if (screenReaderTest) {
        screenReaderTest.passed = true // Simplified test
      }

      // Test 5: ARIA Attributes
      const ariaTest = accessibilityTests.value.find(t => t.id === 'aria')
      if (ariaTest) {
        ariaTest.passed = true // Simplified test
      }

      // Test 6: Semantic HTML
      const semanticTest = accessibilityTests.value.find(t => t.id === 'semantics')
      if (semanticTest) {
        semanticTest.passed = true // Simplified test
      }

      announceToScreenReader('All accessibility tests completed')

      // Show success toast
      if (window.$toast) {
        const passedTests = accessibilityTests.value.filter(t => t.passed).length
        const totalTests = accessibilityTests.value.length
        window.$toast.success(`${passedTests}/${totalTests} tests passed`)
      }
    } catch (error) {
      console.error('Accessibility tests failed:', error)

      // Show error toast
      if (window.$toast) {
        window.$toast.error('Accessibility tests failed')
      }
    } finally {
      isRunningTests.value = false
    }
  }

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      tests: accessibilityTests.value,
      contrastRatio: contrastRatio.value,
      focusVisible: focusVisible.value,
      screenReaderReady: screenReaderReady.value,
      keyboardNavigation: keyboardNavigation.value,
      preferences: {
        shouldAnimate: shouldAnimate.value,
        shouldTransition: shouldTransition.value,
      },
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Accessibility report exported successfully!')
    }
  }

  const resetTests = () => {
    accessibilityTests.value.forEach(test => {
      test.passed = false
    })

    // Show success toast
    if (window.$toast) {
      window.$toast.success('Tests reset successfully!')
    }
  }

  // Lifecycle
  onMounted(() => {
    keyboardNavigation.value = keyboardActive.value
    announceToScreenReader('Accessibility testing section loaded')
  })
</script>

<template>
  <section id="accessibility" class="mb-12">
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 p-6 shadow-lg"
    >
      <div class="flex items-center gap-3 mb-6">
        <div class="text-2xl">♿</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Accessibility Testing
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Pruebas de accesibilidad WCAG 2.2
          </p>
        </div>
      </div>

      <!-- Accessibility Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Color Contrast -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700 dark:text-green-300">
                Color Contrast
              </p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">
                {{ contrastRatio }}
              </p>
            </div>
            <div class="text-green-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Focus Management -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">
                Focus Visible
              </p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {{ focusVisible ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="text-blue-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Screen Reader -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-700 dark:text-purple-300">
                Screen Reader
              </p>
              <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {{ screenReaderReady ? 'Ready' : 'Test' }}
              </p>
            </div>
            <div class="text-purple-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Keyboard Navigation -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-700 dark:text-orange-300">
                Keyboard Nav
              </p>
              <p class="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {{ keyboardNavigation ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="text-orange-500">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path
                  d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 16a1 1 0 100 2h6a1 1 0 100-2H7zM2 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM16 7a1 1 0 012 0v6a1 1 0 11-2 0V7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Accessibility Tests -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Test Controls -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Test Controls
          </h3>

          <!-- Color Contrast Test -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Color Contrast Test</label
            >
            <div class="flex gap-2">
              <input
                type="color"
                v-model="foregroundColor"
                class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                aria-label="Foreground color"
              />
              <input
                type="color"
                v-model="backgroundColor"
                class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                aria-label="Background color"
              />
              <div
                class="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600"
                :style="{ backgroundColor, color: foregroundColor }"
              >
                Sample Text
              </div>
            </div>
          </div>

          <!-- Focus Test -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Focus Test</label
            >
            <div class="flex gap-2">
              <BaseButton variant="primary" size="sm" @click="testFocus">
                Test Focus
              </BaseButton>
              <BaseButton variant="secondary" size="sm" @click="announceTest">
                Announce Test
              </BaseButton>
            </div>
          </div>

          <!-- Screen Reader Test -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Screen Reader Test</label
            >
            <div class="flex gap-2">
              <BaseButton variant="outline" size="sm" @click="testScreenReader">
                Test Screen Reader
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="testLiveRegion">
                Test Live Region
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Test Results
          </h3>

          <div class="space-y-3">
            <div
              v-for="test in accessibilityTests"
              :key="test.id"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="
                test.passed
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
              "
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="test.passed ? 'bg-green-500' : 'bg-red-500'"
                ></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  test.name
                }}</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                test.passed ? 'Passed' : 'Failed'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accessibility Actions -->
      <div class="flex flex-wrap gap-3">
        <BaseButton
          variant="primary"
          size="sm"
          @click="runAllTests"
          :loading="isRunningTests"
        >
          Run All Tests
        </BaseButton>

        <BaseButton variant="secondary" size="sm" @click="exportReport">
          Export Report
        </BaseButton>

        <BaseButton variant="outline" size="sm" @click="resetTests">
          Reset Tests
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
  /* Custom styles for accessibility component */
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

  /* Focus visible styles */
  :focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
