// Composable especializado para integración VueUse - Ritmo UI 2025
// Combina VueUse con las mejores prácticas del sistema de diseño

import {
  useActiveElement,
  useBreakpoints,
  useClipboard,
  useDebounceFn,
  useDevicePixelRatio,
  useDocumentVisibility,
  useElementHover,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useFocus,
  useIdle,
  useIntersectionObserver,
  useIntervalFn,
  useKeyModifier,
  useLocalStorage,
  useMediaQuery,
  useNow,
  useOnline,
  usePageLeave,
  usePreferredReducedMotion,
  useRafFn,
  useThrottleFn,
  useTimeoutFn,
  useTimestamp,
  useVModel,
  useWindowFocus,
  useWindowSize,
} from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'

// Tipos para las opciones
export interface VueUseEnhancedOptions {
  // Performance
  debounceMs?: number
  throttleMs?: number
  timeoutMs?: number

  // Accesibilidad
  respectMotion?: boolean
  respectContrast?: boolean
  respectColorScheme?: boolean

  // Comportamiento
  enableHover?: boolean
  enableFocus?: boolean
  enableKeyboard?: boolean
  enableClipboard?: boolean
}

// Composable principal para componentes interactivos
export function useVueUseEnhanced(options: VueUseEnhancedOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 100,
    timeoutMs = 5000,
    respectMotion = true,
    respectContrast = true,
    respectColorScheme = true,
    enableHover = true,
    enableFocus = true,
    enableKeyboard = true,
    enableClipboard = true,
  } = options

  // Estados reactivos
  const isHovered = ref(false)
  const isFocused = ref(false)
  const isPressed = ref(false)
  const isVisible = ref(false)
  const isOnline = ref(true)
  const isIdle = ref(false)

  // Preferencias del usuario
  const prefersReducedMotion = usePreferredReducedMotion()
  const isOnlineState = useOnline()
  const isIdleState = useIdle()
  const activeElement = useActiveElement()
  const documentVisibility = useDocumentVisibility()
  const windowFocus = useWindowFocus()

  // Información del dispositivo
  const { width, height } = useWindowSize()
  const { pixelRatio } = useDevicePixelRatio()
  const timestamp = useTimestamp()

  // Breakpoints responsivos
  const breakpoints = useBreakpoints({
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  })

  // Media queries útiles
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isTouch = useMediaQuery('(pointer: coarse)')
  const isHighContrast = useMediaQuery('(prefers-contrast: high)')

  // Funciones de utilidad optimizadas
  const debouncedFn = useDebounceFn((fn: Function) => fn(), debounceMs)
  const throttledFn = useThrottleFn((fn: Function) => fn(), throttleMs)
  const timeoutFn = useTimeoutFn((fn: Function) => fn(), timeoutMs)

  // Composable para elementos interactivos
  const useInteractiveElement = (elementRef: Ref<HTMLElement | undefined>) => {
    const hover = enableHover ? useElementHover(elementRef) : { isHovered: ref(false) }
    const focus = enableFocus ? useFocus(elementRef) : { focused: ref(false) }
    const keyboard = enableKeyboard
      ? {
          isShiftPressed: useKeyModifier('Shift'),
          isCtrlPressed: useKeyModifier('Control'),
          isAltPressed: useKeyModifier('Alt'),
        }
      : {
          isShiftPressed: ref(false),
          isCtrlPressed: ref(false),
          isAltPressed: ref(false),
        }

    return {
      ...hover,
      ...focus,
      ...keyboard,
    }
  }

  // Composable para formularios
  const useFormBehavior = <T>(initialValue: T) => {
    const modelValue = ref(initialValue)
    const vModel = useVModel(modelValue)
    const debouncedValue = ref(initialValue)

    const debouncedUpdate = useDebounceFn((value: T) => {
      debouncedValue.value = value
    }, debounceMs)

    const clipboard = enableClipboard
      ? useClipboard()
      : {
          copy: async () => {},
          copied: ref(false),
          isSupported: ref(false),
        }

    return {
      vModel,
      debouncedValue,
      debouncedUpdate,
      clipboard,
    }
  }

  // Composable para animaciones
  const useAnimationBehavior = () => {
    const rafFn = useRafFn(({ timestamp }) => {
      // Lógica de animación aquí
    })

    const shouldAnimate = computed(() => {
      if (!respectMotion) return true
      return !prefersReducedMotion.value
    })

    const animationConfig = computed(() => ({
      duration: shouldAnimate.value ? 300 : 0,
      easing: shouldAnimate.value ? 'ease-out' : 'linear',
    }))

    return {
      rafFn,
      shouldAnimate,
      animationConfig,
    }
  }

  // Composable para visibilidad
  const useVisibilityBehavior = (elementRef?: Ref<HTMLElement | undefined>) => {
    const visibility = useElementVisibility(elementRef)
    const size = useElementSize(elementRef)
    const intersection = useIntersectionObserver(
      elementRef,
      ([entry]) => {
        // Lógica de intersección aquí
      },
      { threshold: 0.1, rootMargin: '50px' },
    )

    return {
      visibility,
      size,
      intersection,
    }
  }

  // Composable para persistencia
  const usePersistenceBehavior = <T>(key: string, defaultValue: T) => {
    const storage = useLocalStorage(key, defaultValue)

    return {
      value: storage,
      setValue: (value: T) => {
        storage.value = value
      },
      clear: () => {
        storage.value = defaultValue
      },
    }
  }

  // Estados computados útiles
  const deviceInfo = computed(() => ({
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    isTouch: isTouch.value,
    pixelRatio: pixelRatio.value,
    screenSize: { width: width.value, height: height.value },
  }))

  const accessibilityInfo = computed(() => ({
    prefersReducedMotion: prefersReducedMotion.value,
    isHighContrast: isHighContrast.value,
    isOnline: isOnlineState.value,
    isIdle: isIdleState.idle,
    documentVisibility: documentVisibility.value,
    windowFocus: windowFocus.value,
  }))

  const performanceInfo = computed(() => ({
    timestamp: timestamp.value,
    isOnline: isOnlineState.value,
    isIdle: isIdleState.idle,
  }))

  return {
    // Estados básicos
    isHovered,
    isFocused,
    isPressed,
    isVisible,
    isOnline,
    isIdle,

    // Preferencias del usuario
    prefersReducedMotion,
    isOnlineState,
    isIdleState,
    activeElement,
    documentVisibility,
    windowFocus,

    // Información del dispositivo
    width,
    height,
    pixelRatio,
    timestamp,

    // Breakpoints y media queries
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isHighContrast,

    // Funciones de utilidad
    debouncedFn,
    throttledFn,
    timeoutFn,

    // Composables especializados
    useInteractiveElement,
    useFormBehavior,
    useAnimationBehavior,
    useVisibilityBehavior,
    usePersistenceBehavior,

    // Información computada
    deviceInfo,
    accessibilityInfo,
    performanceInfo,
  }
}

// Composables individuales para uso específico
export function useButtonBehavior(elementRef: Ref<HTMLElement | undefined>) {
  const isHovered = useElementHover(elementRef)
  const { focused } = useFocus(elementRef)
  const prefersReducedMotion = usePreferredReducedMotion()
  const isShiftPressed = useKeyModifier('Shift')
  const isCtrlPressed = useKeyModifier('Control')
  const isAltPressed = useKeyModifier('Alt')

  const buttonState = computed(() => ({
    isHovered: isHovered.value,
    isFocused: focused.value,
    isShiftPressed: isShiftPressed.value,
    isCtrlPressed: isCtrlPressed.value,
    isAltPressed: isAltPressed.value,
    prefersReducedMotion: prefersReducedMotion.value,
  }))

  return {
    isHovered,
    focused,
    prefersReducedMotion,
    isShiftPressed,
    isCtrlPressed,
    isAltPressed,
    buttonState,
  }
}

export function useInputBehavior<T>(initialValue: T) {
  const modelValue = ref(initialValue)
  const vModel = useVModel(modelValue)
  const { focused } = useFocus(ref<HTMLInputElement>())
  const { copy, copied, isSupported: isClipboardSupported } = useClipboard()
  const prefersReducedMotion = usePreferredReducedMotion()

  const debouncedValidation = useDebounceFn((value: string) => {
    // Validación personalizada aquí
  }, 300)

  const inputState = computed(() => ({
    value: vModel.value,
    isFocused: focused.value,
    prefersReducedMotion: prefersReducedMotion.value,
  }))

  return {
    vModel,
    focused,
    copy,
    copied,
    isClipboardSupported,
    prefersReducedMotion,
    debouncedValidation,
    inputState,
  }
}

export function useModalBehavior(containerRef: Ref<HTMLElement | undefined>) {
  const prefersReducedMotion = usePreferredReducedMotion()
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const isVisible = useElementVisibility(containerRef)
  const { width: modalWidth, height: modalHeight } = useElementSize(containerRef)

  const modalState = computed(() => ({
    isVisible: isVisible.value,
    windowSize: { width: windowWidth.value, height: windowHeight.value },
    modalSize: { width: modalWidth.value, height: modalHeight.value },
    prefersReducedMotion: prefersReducedMotion.value,
  }))

  return {
    prefersReducedMotion,
    windowWidth,
    windowHeight,
    isVisible,
    modalWidth,
    modalHeight,
    modalState,
  }
}

export function useToastBehavior() {
  const { start, stop } = useTimeoutFn(() => {
    // Auto-hide logic
  }, 5000)

  const prefersReducedMotion = usePreferredReducedMotion()
  const userPreferences = useLocalStorage('toast-preferences', {
    position: 'top-right',
    duration: 5000,
    sound: true,
  })

  const toastState = computed(() => ({
    prefersReducedMotion: prefersReducedMotion.value,
    userPreferences: userPreferences.value,
  }))

  return {
    start,
    stop,
    prefersReducedMotion,
    userPreferences,
    toastState,
  }
}

// Exportar composables individuales
export {
  useActiveElement,
  useBreakpoints,
  useClipboard,
  useDebounceFn,
  useDevicePixelRatio,
  useDocumentVisibility,
  useElementHover,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useFocus,
  useIdle,
  useIntersectionObserver,
  useIntervalFn,
  useKeyModifier,
  useLocalStorage,
  useMediaQuery,
  useNow,
  useOnline,
  usePageLeave,
  usePreferredReducedMotion,
  useRafFn,
  useThrottleFn,
  useTimeoutFn,
  useTimestamp,
  useVModel,
  useWindowFocus,
  useWindowSize,
}
