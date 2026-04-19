<template>
  <label
    ref="toggleButton"
    :class="[
      'switch relative inline-block w-12 h-6 rounded-full shadow-md cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1',
      { 'ring-2 ring-primary-500 ring-offset-1': isFocused },
    ]"
    :aria-label="ariaLabel"
    :aria-pressed="isDark"
    :aria-describedby="`${toggleId}-description`"
    :data-theme-toggle="true"
    @click="toggleDarkMode"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Hidden checkbox for accessibility -->
    <input
      :checked="isDark"
      type="checkbox"
      class="opacity-0 w-0 h-0"
      :aria-label="ariaLabel"
      @change="toggleDarkMode"
    />

    <!-- The slider -->
    <span
      :class="[
        'slider absolute top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 cursor-pointer',
        isDark ? 'bg-blue-500' : 'bg-gray-300',
      ]"
    >
      <!-- The slider handle -->
      <span
        :class="[
          'slider-handle absolute h-4 w-4 rounded-full transition-all duration-300',
          isDark ? 'left-6 bg-white shadow-md' : 'left-1 bg-white shadow-md',
        ]"
      ></span>
    </span>

    <!-- Loading indicator -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center z-10"
      :aria-hidden="true"
    >
      <div
        class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
        role="status"
        aria-label="Loading theme change"
      ></div>
    </div>

    <!-- Screen reader description -->
    <span :id="`${toggleId}-description`" class="sr-only">
      {{
        isDark
          ? 'Currently in dark mode. Click to switch to light mode.'
          : 'Currently in light mode. Click to switch to dark mode.'
      }}
    </span>
  </label>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  const emit = defineEmits<{
    toggle: [isDark: boolean]
  }>()

  // State management
  const isDark = ref(false)
  const isLoading = ref(false)
  const isFocused = ref(false)
  const toggleId = ref(`theme-toggle-${Math.random().toString(36).substr(2, 9)}`)
  const toggleButton = ref<HTMLLabelElement | null>(null)

  // Computed properties
  const ariaLabel = computed(() => {
    return isDark.value ? 'Switch to light mode' : 'Switch to dark mode'
  })

  // Theme management
  const getInitialDarkMode = (): boolean => {
    if (typeof window === 'undefined') return false

    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored !== null) {
      return stored === 'dark'
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const applyDarkMode = (dark: boolean) => {
    if (typeof document === 'undefined') return

    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // Store preference
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  // Toggle function
  const toggleDarkMode = async () => {
    if (isLoading.value) return

    // Update state immediately for smooth transition
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)

    emit('toggle', isDark.value)
  }

  // Method for external loading control
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Keyboard navigation
  const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        toggleDarkMode()
        break
      case 'Escape':
        event.preventDefault()
        toggleButton.value?.blur()
        break
    }
  }

  // Focus management
  const handleFocus = () => {
    isFocused.value = true
  }

  const handleBlur = () => {
    isFocused.value = false
  }

  // System preference watcher
  const watchSystemPreference = () => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is stored
      const stored = localStorage.getItem('theme')
      if (stored === null) {
        isDark.value = e.matches
        applyDarkMode(isDark.value)
        emit('toggle', isDark.value)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  // Initialize on mount
  onMounted(() => {
    isDark.value = getInitialDarkMode()
    applyDarkMode(isDark.value)
    emit('toggle', isDark.value)

    // Watch for system changes
    const cleanup = watchSystemPreference()

    // Cleanup on unmount
    return cleanup
  })

  // Watch for external changes
  watch(
    isDark,
    newValue => {
      applyDarkMode(newValue)
    },
    { immediate: false },
  )

  // Expose methods for external control
  defineExpose({
    toggleDarkMode,
    setTheme: (dark: boolean) => {
      isDark.value = dark
      applyDarkMode(dark)
      emit('toggle', dark)
    },
    setLoading,
    getCurrentTheme: () => (isDark.value ? 'dark' : 'light'),
  })
</script>

<style scoped>
  /* Simple switch styles */
  .switch {
    font-size: 14px;
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 1.5rem;
    border-radius: 15px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.3s;
    border-radius: 15px;
  }

  /* The slider handle */
  .slider-handle {
    position: absolute;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    transition: 0.3s;
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .slider,
    .slider-handle {
      transition: none;
    }

    .animate-spin {
      animation: none;
    }
  }
</style>
