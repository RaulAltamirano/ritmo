// Composable para integración con VueUse - Ritmo UI 2025
// Demuestra cómo usar VueUse en el sistema de diseño

import {
  useActiveElement,
  useAsyncState,
  useBattery,
  useBreakpoints,
  useClipboard,
  useColorMode,
  useCounter,
  useDark,
  useDebounceFn,
  useDevicePixelRatio,
  useDocumentVisibility,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useEyeDropper,
  useFocus,
  useGeolocation,
  useHover,
  useIdle,
  useIntersectionObserver,
  useIntervalFn,
  useKeyModifier,
  useKeyboard,
  useLocalStorage,
  useMediaQuery,
  useMouse,
  useNetwork,
  useNow,
  useOnline,
  usePageFocus,
  usePageLeave,
  usePermission,
  usePointer,
  usePreferredColorScheme,
  usePreferredContrast,
  usePreferredLanguages,
  usePreferredReducedMotion,
  useRafFn,
  useScreenOrientation,
  useScroll,
  useThrottleFn,
  useTimeoutFn,
  useTimestamp,
  useToggle,
  useVModel,
  useDebounceFn as useVueUseDebounceFn,
  useFocusTrap as useVueUseFocusTrap,
  useRafFn as useVueUseRafFn,
  useThrottleFn as useVueUseThrottleFn,
  useTimeoutFn as useVueUseTimeoutFn,
  useWebNotification,
  useWindowFocus,
  useWindowSize,
} from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'

// Tipos para las opciones
export interface VueUseIntegrationOptions {
  // Opciones de performance
  debounceMs?: number
  throttleMs?: number
  timeoutMs?: number

  // Opciones de accesibilidad
  respectMotion?: boolean
  respectContrast?: boolean
  respectColorScheme?: boolean

  // Opciones de comportamiento
  enableHover?: boolean
  enablePointer?: boolean
  enableKeyboard?: boolean
  enableFocus?: boolean
}

// Composable principal para integración
export function useVueUseIntegration(options: VueUseIntegrationOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 100,
    timeoutMs = 5000,
    respectMotion = true,
    respectContrast = true,
    respectColorScheme = true,
    enableHover = true,
    enablePointer = true,
    enableKeyboard = true,
    enableFocus = true,
  } = options

  // Estados reactivos
  const isHovered = ref(false)
  const isPressed = ref(false)
  const isFocused = ref(false)
  const isVisible = ref(false)
  const isOnline = ref(true)
  const isIdle = ref(false)
  const isDark = ref(false)

  // Preferencias del usuario
  const prefersReducedMotion = usePreferredReducedMotion()
  const prefersContrast = usePreferredContrast()
  const prefersColorScheme = usePreferredColorScheme()
  const isOnlineState = useOnline()
  const isIdleState = useIdle()
  const isDarkMode = useDark()

  // Información del dispositivo
  const { width, height } = useWindowSize()
  const { pixelRatio } = useDevicePixelRatio()
  const { isSupported: isGeolocationSupported } = useGeolocation()
  const { isSupported: isBatterySupported } = useBattery()
  const { isSupported: isNotificationSupported } = useWebNotification()

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

  // Funciones de utilidad
  const debouncedFn = useVueUseDebounceFn((fn: Function) => fn(), debounceMs)
  const throttledFn = useVueUseThrottleFn((fn: Function) => fn(), throttleMs)
  const timeoutFn = useVueUseTimeoutFn((fn: Function) => fn(), timeoutMs)

  // Composable para elementos interactivos
  const useInteractiveElement = (elementRef: Ref<HTMLElement | undefined>) => {
    const hover = enableHover ? useHover(elementRef) : { isHovered: ref(false) }
    const pointer = enablePointer ? usePointer() : { x: ref(0), y: ref(0) }
    const focus = enableFocus ? useFocus(elementRef) : { focused: ref(false) }
    const keyboard = enableKeyboard ? useKeyboard() : { isPressed: ref(false) }

    return {
      ...hover,
      ...pointer,
      ...focus,
      ...keyboard,
    }
  }

  // Composable para modales y overlays
  const useModalBehavior = (containerRef: Ref<HTMLElement | undefined>) => {
    const focusTrap = useVueUseFocusTrap(containerRef, {
      escapeDeactivates: true,
      clickOutsideDeactivates: true,
      returnFocusOnDeactivate: true,
    })

    const visibility = useElementVisibility(containerRef)
    const size = useElementSize(containerRef)

    return {
      ...focusTrap,
      visibility,
      size,
    }
  }

  // Composable para scroll y viewport
  const useScrollBehavior = (elementRef?: Ref<HTMLElement | undefined>) => {
    const scroll = useScroll(elementRef)
    const intersection = useIntersectionObserver(elementRef, {
      threshold: 0.1,
      rootMargin: '50px',
    })

    return {
      scroll,
      intersection,
    }
  }

  // Composable para animaciones y transiciones
  const useAnimationBehavior = () => {
    const rafFn = useVueUseRafFn((fn: Function) => fn())

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

  // Composable para formularios
  const useFormBehavior = <T>(initialValue: T) => {
    const vModel = useVModel<T>(ref(initialValue))
    const debouncedValue = ref(initialValue)

    const debouncedUpdate = useVueUseDebounceFn((value: T) => {
      debouncedValue.value = value
    }, debounceMs)

    return {
      vModel,
      debouncedValue,
      debouncedUpdate,
    }
  }

  // Composable para notificaciones
  const useNotificationBehavior = () => {
    const { isSupported, requestPermission, send } = useWebNotification()

    const sendNotification = (title: string, options?: NotificationOptions) => {
      if (isSupported.value) {
        send(title, options)
      }
    }

    return {
      isSupported,
      requestPermission,
      sendNotification,
    }
  }

  // Composable para clipboard
  const useClipboardBehavior = () => {
    const { copy, copied, isSupported } = useClipboard()

    const copyToClipboard = async (text: string) => {
      if (isSupported.value) {
        await copy(text)
      }
    }

    return {
      copyToClipboard,
      copied,
      isSupported,
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
    prefersContrast: prefersContrast.value,
    prefersColorScheme: prefersColorScheme.value,
    isHighContrast: isHighContrast.value,
    isDarkMode: isDarkMode.value,
  }))

  const systemInfo = computed(() => ({
    isOnline: isOnlineState.value,
    isIdle: isIdleState.value,
    isGeolocationSupported: isGeolocationSupported.value,
    isBatterySupported: isBatterySupported.value,
    isNotificationSupported: isNotificationSupported.value,
  }))

  return {
    // Estados básicos
    isHovered,
    isPressed,
    isFocused,
    isVisible,
    isOnline,
    isIdle,
    isDark,

    // Preferencias del usuario
    prefersReducedMotion,
    prefersContrast,
    prefersColorScheme,
    isOnlineState,
    isIdleState,
    isDarkMode,

    // Información del dispositivo
    width,
    height,
    pixelRatio,
    isGeolocationSupported,
    isBatterySupported,
    isNotificationSupported,

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
    useModalBehavior,
    useScrollBehavior,
    useAnimationBehavior,
    useFormBehavior,
    useNotificationBehavior,
    useClipboardBehavior,

    // Información computada
    deviceInfo,
    accessibilityInfo,
    systemInfo,
  }
}

// Exportar composables individuales para uso específico
export {
  useActiveElement,
  useAsyncState,
  useBattery,
  useBreakpoints,
  useClipboard,
  useColorMode,
  useCounter,
  useDark,
  useDebounceFn,
  useDevicePixelRatio,
  useDocumentVisibility,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useEyeDropper,
  useFocus,
  useGeolocation,
  useHover,
  useIdle,
  useIntersectionObserver,
  useIntervalFn,
  useKeyModifier,
  useKeyboard,
  useLocalStorage,
  useMediaQuery,
  useMouse,
  useNetwork,
  useNow,
  useOnline,
  usePageFocus,
  usePageLeave,
  usePermission,
  usePointer,
  usePreferredColorScheme,
  usePreferredContrast,
  usePreferredLanguages,
  usePreferredReducedMotion,
  useRafFn,
  useScreenOrientation,
  useScroll,
  useThrottleFn,
  useTimeoutFn,
  useTimestamp,
  useToggle,
  useVModel,
  useWebNotification,
  useWindowFocus,
  useWindowSize,
}
