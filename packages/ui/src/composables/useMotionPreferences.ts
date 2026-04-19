// Composable para Preferencias de Movimiento - Ritmo UI 2025
// Implementa respeto a prefers-reduced-motion y optimizaciones de accesibilidad

import { computed, ref, onMounted, onUnmounted } from 'vue'

export interface MotionPreferences {
  /** Si las animaciones están permitidas */
  shouldAnimate: boolean
  /** Si las transiciones están permitidas */
  shouldTransition: boolean
  /** Si las transformaciones están permitidas */
  shouldTransform: boolean
  /** Si los efectos de hover están permitidos */
  shouldHover: boolean
  /** Si las microinteracciones están permitidas */
  shouldMicroInteract: boolean
  /** Preferencia del usuario para movimiento reducido */
  prefersReducedMotion: 'no-preference' | 'reduce'
  /** Preferencia del usuario para contraste alto */
  prefersHighContrast: boolean
  /** Preferencia del usuario para modo oscuro */
  prefersDarkMode: boolean
}

export interface MotionPreferencesOptions {
  /** Si debe respetar prefers-reduced-motion */
  respectReducedMotion?: boolean
  /** Si debe respetar prefers-contrast */
  respectHighContrast?: boolean
  /** Si debe respetar prefers-color-scheme */
  respectColorScheme?: boolean
  /** Duración mínima para transiciones */
  minTransitionDuration?: number
  /** Duración máxima para transiciones */
  maxTransitionDuration?: number
}

export function useMotionPreferences(options: MotionPreferencesOptions = {}) {
  const {
    respectReducedMotion = true,
    respectHighContrast = true,
    respectColorScheme = true,
    minTransitionDuration = 0,
    maxTransitionDuration = 300,
  } = options

  // Estado reactivo
  const prefersReducedMotion = ref<'no-preference' | 'reduce'>('no-preference')
  const prefersHighContrast = ref(false)
  const prefersDarkMode = ref(false)

  // Media query listeners
  let reducedMotionQuery: MediaQueryList | null = null
  let highContrastQuery: MediaQueryList | null = null
  let darkModeQuery: MediaQueryList | null = null

  // Computed properties
  const shouldAnimate = computed(() => {
    if (!respectReducedMotion) return true
    return prefersReducedMotion.value === 'no-preference'
  })

  const shouldTransition = computed(() => {
    if (!respectReducedMotion) return true
    return prefersReducedMotion.value === 'no-preference'
  })

  const shouldTransform = computed(() => {
    if (!respectReducedMotion) return true
    return prefersReducedMotion.value === 'no-preference'
  })

  const shouldHover = computed(() => {
    if (!respectReducedMotion) return true
    return prefersReducedMotion.value === 'no-preference'
  })

  const shouldMicroInteract = computed(() => {
    if (!respectReducedMotion) return true
    return prefersReducedMotion.value === 'no-preference'
  })

  // Función para obtener clases de transición optimizadas
  const getTransitionClasses = (baseClasses: string, fallbackClasses?: string) => {
    if (shouldTransition.value) {
      return baseClasses
    }
    return fallbackClasses || ''
  }

  // Función para obtener duración de transición optimizada
  const getTransitionDuration = (duration: number) => {
    if (!shouldTransition.value) return 0

    const clampedDuration = Math.max(
      minTransitionDuration,
      Math.min(duration, maxTransitionDuration),
    )

    return clampedDuration
  }

  // Función para obtener clases de animación optimizadas
  const getAnimationClasses = (baseClasses: string, fallbackClasses?: string) => {
    if (shouldAnimate.value) {
      return baseClasses
    }
    return fallbackClasses || ''
  }

  // Función para obtener clases de transformación optimizadas
  const getTransformClasses = (baseClasses: string, fallbackClasses?: string) => {
    if (shouldTransform.value) {
      return baseClasses
    }
    return fallbackClasses || ''
  }

  // Función para obtener clases de hover optimizadas
  const getHoverClasses = (baseClasses: string, fallbackClasses?: string) => {
    if (shouldHover.value) {
      return baseClasses
    }
    return fallbackClasses || ''
  }

  // Función para obtener estilos de transición optimizados
  const getTransitionStyles = (duration: number, easing: string = 'ease-out') => {
    if (!shouldTransition.value) {
      return { transition: 'none' }
    }

    const optimizedDuration = getTransitionDuration(duration)

    return {
      transition: `all ${optimizedDuration}ms ${easing}`,
    }
  }

  // Función para obtener estilos de animación optimizados
  const getAnimationStyles = (
    name: string,
    duration: number,
    easing: string = 'ease-out',
  ) => {
    if (!shouldAnimate.value) {
      return { animation: 'none' }
    }

    const optimizedDuration = getTransitionDuration(duration)

    return {
      animation: `${name} ${optimizedDuration}ms ${easing}`,
    }
  }

  // Función para obtener estilos de transformación optimizados
  const getTransformStyles = (transform: string) => {
    if (!shouldTransform.value) {
      return { transform: 'none' }
    }

    return { transform }
  }

  // Función para obtener estilos de hover optimizados
  const getHoverStyles = (hoverStyles: Record<string, string>) => {
    if (!shouldHover.value) {
      return {}
    }

    return hoverStyles
  }

  // Función para verificar si el dispositivo soporta hover
  const supportsHover = computed(() => {
    return window.matchMedia('(hover: hover)').matches
  })

  // Función para verificar si el dispositivo es táctil
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Función para obtener clases condicionales basadas en preferencias
  const getConditionalClasses = (
    baseClasses: string,
    reducedClasses?: string,
    highContrastClasses?: string,
    darkModeClasses?: string,
  ) => {
    let classes = baseClasses

    if (respectReducedMotion && prefersReducedMotion.value === 'reduce') {
      classes += ` ${reducedClasses || ''}`
    }

    if (respectHighContrast && prefersHighContrast.value) {
      classes += ` ${highContrastClasses || ''}`
    }

    if (respectColorScheme && prefersDarkMode.value) {
      classes += ` ${darkModeClasses || ''}`
    }

    return classes.trim()
  }

  // Función para obtener estilos condicionales basados en preferencias
  const getConditionalStyles = (
    baseStyles: Record<string, string>,
    reducedStyles?: Record<string, string>,
    highContrastStyles?: Record<string, string>,
    darkModeStyles?: Record<string, string>,
  ) => {
    let styles = { ...baseStyles }

    if (
      respectReducedMotion &&
      prefersReducedMotion.value === 'reduce' &&
      reducedStyles
    ) {
      styles = { ...styles, ...reducedStyles }
    }

    if (respectHighContrast && prefersHighContrast.value && highContrastStyles) {
      styles = { ...styles, ...highContrastStyles }
    }

    if (respectColorScheme && prefersDarkMode.value && darkModeStyles) {
      styles = { ...styles, ...darkModeStyles }
    }

    return styles
  }

  // Setup de media queries
  const setupMediaQueries = () => {
    // Prefers reduced motion
    if (respectReducedMotion) {
      reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = reducedMotionQuery.matches
        ? 'reduce'
        : 'no-preference'

      reducedMotionQuery.addEventListener('change', e => {
        prefersReducedMotion.value = e.matches ? 'reduce' : 'no-preference'
      })
    }

    // Prefers high contrast
    if (respectHighContrast) {
      highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      prefersHighContrast.value = highContrastQuery.matches

      highContrastQuery.addEventListener('change', e => {
        prefersHighContrast.value = e.matches
      })
    }

    // Prefers dark mode
    if (respectColorScheme) {
      darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      prefersDarkMode.value = darkModeQuery.matches

      darkModeQuery.addEventListener('change', e => {
        prefersDarkMode.value = e.matches
      })
    }
  }

  // Cleanup de media queries
  const cleanupMediaQueries = () => {
    if (reducedMotionQuery) {
      reducedMotionQuery.removeEventListener('change', () => {})
    }
    if (highContrastQuery) {
      highContrastQuery.removeEventListener('change', () => {})
    }
    if (darkModeQuery) {
      darkModeQuery.removeEventListener('change', () => {})
    }
  }

  // Lifecycle
  onMounted(() => {
    setupMediaQueries()
  })

  onUnmounted(() => {
    cleanupMediaQueries()
  })

  return {
    // Estado
    prefersReducedMotion: computed(() => prefersReducedMotion.value),
    prefersHighContrast: computed(() => prefersHighContrast.value),
    prefersDarkMode: computed(() => prefersDarkMode.value),

    // Computed properties
    shouldAnimate,
    shouldTransition,
    shouldTransform,
    shouldHover,
    shouldMicroInteract,
    supportsHover,
    isTouchDevice,

    // Funciones de utilidad
    getTransitionClasses,
    getTransitionDuration,
    getAnimationClasses,
    getTransformClasses,
    getHoverClasses,
    getTransitionStyles,
    getAnimationStyles,
    getTransformStyles,
    getHoverStyles,
    getConditionalClasses,
    getConditionalStyles,
  }
}
