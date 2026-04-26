<script setup lang="ts">
  import { useId } from '../../../composables/useId'
  import { computed, onMounted, onUnmounted, ref } from 'vue'

  const props = withDefaults(
    defineProps<{
      /**
       * Si true, el estado y el DOM/LS los controla el padre (p. ej. `useTheme`).
       * Usa `v-model` / `modelValue` y no escribe `theme` ni `theme-mode`.
       */
      controlled?: boolean
      /** V-model: modo oscuro activo (solo con `controlled`) */
      modelValue?: boolean
    }>(),
    { controlled: false, modelValue: false },
  )

  const emit = defineEmits<{
    toggle: [isDark: boolean]
    'update:modelValue': [isDark: boolean]
  }>()

  const internalDark = ref(false)
  const isDark = computed({
    get: () => (props.controlled ? props.modelValue : internalDark.value),
    set: (v: boolean) => {
      if (!props.controlled) {
        internalDark.value = v
      }
    },
  })
  const isLoading = ref(false)
  const isFocused = ref(false)
  const toggleId = useId('theme-toggle')
  const toggleButton = ref<HTMLButtonElement | null>(null)
  let mediaQuery: MediaQueryList | null = null

  const ariaLabel = computed(() => {
    return isDark.value ? 'Switch to light mode' : 'Switch to dark mode'
  })

  const getInitialDarkMode = (): boolean => {
    if (typeof globalThis.window === 'undefined') return false

    const stored = localStorage.getItem('theme')
    if (stored !== null) {
      return stored === 'dark'
    }

    return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const applyDarkMode = (dark: boolean) => {
    if (props.controlled) return
    if (typeof document === 'undefined') return

    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const applyAndEmitTheme = (dark: boolean) => {
    isDark.value = dark
    applyDarkMode(dark)
    emit('toggle', dark)
  }

  const toggleDarkMode = () => {
    if (isLoading.value) return
    if (props.controlled) {
      const next = !isDark.value
      emit('update:modelValue', next)
      emit('toggle', next)
      return
    }
    applyAndEmitTheme(!isDark.value)
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      toggleButton.value?.blur()
    }
  }

  const handleFocus = () => {
    isFocused.value = true
  }

  const handleBlur = () => {
    isFocused.value = false
  }

  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    if (props.controlled) return
    const stored = localStorage.getItem('theme')
    if (stored === null) {
      applyAndEmitTheme(event.matches)
    }
  }

  onMounted(() => {
    if (!props.controlled) {
      applyAndEmitTheme(getInitialDarkMode())
    }
    if (typeof globalThis.window === 'undefined' || props.controlled) return

    mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
  })

  defineExpose({
    toggleDarkMode,
    setTheme: (dark: boolean) => {
      if (props.controlled) {
        emit('update:modelValue', dark)
      } else {
        applyAndEmitTheme(dark)
      }
    },
    setLoading,
    getCurrentTheme: () => (isDark.value ? 'dark' : 'light'),
  })
</script>

<template>
  <button
    :id="toggleId"
    ref="toggleButton"
    type="button"
    role="switch"
    :aria-label="ariaLabel"
    :aria-checked="isDark"
    :aria-describedby="`${toggleId}-description`"
    :aria-busy="isLoading"
    :data-theme-toggle="true"
    class="switch relative inline-block h-6 w-12 rounded-full shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
    :class="[
      isDark ? 'bg-blue-500' : 'bg-gray-300',
      isLoading ? 'cursor-wait' : 'cursor-pointer',
      { 'ring-2 ring-primary-500 ring-offset-1': isFocused },
    ]"
    @click="toggleDarkMode"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span
      class="slider-handle absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300"
      :class="[isDark ? 'left-7' : 'left-1']"
      aria-hidden="true"
    />

    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
      />
    </div>

    <span :id="`${toggleId}-description`" class="sr-only">
      {{
        isDark
          ? 'Currently in dark mode. Click to switch to light mode.'
          : 'Currently in light mode. Click to switch to dark mode.'
      }}
    </span>
  </button>
</template>

<style scoped>
  /* Simple switch styles */
  .switch {
    border-radius: 15px;
  }

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
