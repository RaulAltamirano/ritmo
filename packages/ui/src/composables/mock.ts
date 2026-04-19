// Mock de composables para Storybook
// Este archivo proporciona implementaciones simuladas de los composables para que funcionen en Storybook

import { ref } from 'vue'

// Mock de useVueUseEnhanced
export const useVueUseEnhanced = (options: any = {}) => {
  const deviceInfo = ref({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    pixelRatio: 1,
    screenSize: { width: 1920, height: 1080 },
  })

  const accessibilityInfo = ref({
    prefersReducedMotion: false,
    isHighContrast: false,
    isOnline: true,
    isIdle: false,
  })

  const performanceInfo = ref({
    renderTime: 16.67,
    memoryUsage: 1024 * 1024 * 50,
  })

  const width = ref(1920)
  const height = ref(1080)
  const isOnline = ref(true)
  const isIdle = ref(false)
  const documentVisibility = ref('visible')
  const timestamp = ref(Date.now())

  return {
    deviceInfo,
    accessibilityInfo,
    performanceInfo,
    width,
    height,
    isOnline,
    isIdle,
    documentVisibility,
    timestamp,
  }
}

// Mock de usePerformance
export const usePerformance = (options: any = {}) => {
  const performanceMetrics = ref({
    cacheHits: 0,
    cacheMisses: 0,
    renderTime: 16.67,
    memoryUsage: 1024 * 1024 * 50,
  })

  const measureRenderTime = async (fn: Function) => {
    const start = performance.now()
    await fn()
    return performance.now() - start
  }

  const clearCache = () => {
    console.log('Cache cleared')
  }

  return {
    performanceMetrics,
    measureRenderTime,
    clearCache,
  }
}

// Mock de useA11y
export const useA11y = (options: any = {}) => {
  const userPreferences = ref({
    reducedMotion: false,
    highContrast: false,
  })

  const announceToScreenReader = (message: string) => {
    console.log('Screen reader:', message)
  }

  const validateColorContrast = (fg: string, bg: string) => {
    return 4.5 // Mock ratio
  }

  const generateAriaId = () => {
    return 'mock-id-' + Math.random().toString(36).substr(2, 9)
  }

  return {
    userPreferences,
    announceToScreenReader,
    validateColorContrast,
    generateAriaId,
  }
}

// Mock de useMotionPreferences
export const useMotionPreferences = (options: any = {}) => {
  const shouldAnimate = ref(true)
  const shouldTransition = ref(true)

  return {
    shouldAnimate,
    shouldTransition,
  }
}

// Mock de useFocusManagement
export const useFocusManagement = (options: any = {}) => {
  const focusTrapActive = ref(false)

  return {
    focusTrapActive,
  }
}

// Mock de useKeyboardNavigation
export const useKeyboardNavigation = (options: any = {}) => {
  const isActive = ref(true)

  return {
    isActive,
  }
}

// Mock de useColors
export const useColors = () => {
  const colorTokens = ref({})
  const semanticColors = ref({})

  return {
    colorTokens,
    semanticColors,
  }
}

// Mock de useTypography
export const useTypography = () => {
  const textStyles = ref({})

  const getTypographyTokens = () => {
    return {}
  }

  return {
    textStyles,
    getTypographyTokens,
  }
}

// Mock de useMouse
export const useMouse = () => {
  const x = ref(0)
  const y = ref(0)

  return {
    x,
    y,
  }
}

// Mock de useClipboard
export const useClipboard = () => {
  const copied = ref(false)
  const isSupported = ref(true)

  const copy = async (text: string) => {
    console.log('Copied:', text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  return {
    copy,
    copied,
    isSupported,
  }
}

// Mock de useKeyModifier
export const useKeyModifier = (key: string) => {
  return ref(false)
}

// Exportar todos los composables como un objeto
export default {
  useVueUseEnhanced,
  usePerformance,
  useA11y,
  useMotionPreferences,
  useFocusManagement,
  useKeyboardNavigation,
  useColors,
  useTypography,
  useMouse,
  useClipboard,
  useKeyModifier,
}
