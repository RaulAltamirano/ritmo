// Composable básico para VueUse - Ritmo UI 2025
// Versión simplificada con solo composables básicos y probados

import {
  useClipboard,
  useDebounceFn,
  useElementHover,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useFocus,
  useKeyModifier,
  useLocalStorage,
  useMediaQuery,
  usePreferredReducedMotion,
  useThrottleFn,
  useTimeoutFn,
  useVModel,
  useWindowSize,
} from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'

// Tipos para las opciones
export interface VueUseBasicOptions {
  // Performance
  debounceMs?: number
  throttleMs?: number
  timeoutMs?: number

  // Accesibilidad
  respectMotion?: boolean

  // Comportamiento
  enableHover?: boolean
  enableFocus?: boolean
  enableKeyboard?: boolean
  enableClipboard?: boolean
}

// Composable principal simplificado
export function useVueUseBasic(options: VueUseBasicOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 100,
    timeoutMs = 5000,
    enableHover = true,
    enableFocus = true,
    enableKeyboard = true,
    enableClipboard = true,
  } = options

  // Estados reactivos básicos
  const isHovered = ref(false)
  const isFocused = ref(false)
  const isVisible = ref(false)

  // Preferencias del usuario
  const prefersReducedMotion = usePreferredReducedMotion()

  // Información del dispositivo
  const { width, height } = useWindowSize()

  // Media queries básicas
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isTouch = useMediaQuery('(pointer: coarse)')

  // Funciones de utilidad básicas
  const debouncedFn = useDebounceFn(() => {}, debounceMs)
  const throttledFn = useThrottleFn(() => {}, throttleMs)
  const timeoutFn = useTimeoutFn(() => {}, timeoutMs)

  // Composable para elementos interactivos básicos
  const useInteractiveElement = (elementRef: Ref<HTMLElement | undefined>) => {
    const isHovered = enableHover ? useElementHover(elementRef) : ref(false)
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
      isHovered,
      ...focus,
      ...keyboard,
    }
  }

  // Composable para formularios básicos
  const useFormBehavior = <T>(initialValue: T) => {
    const vModel = ref(initialValue) as Ref<T>
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

  // Composable para visibilidad básica
  const useVisibilityBehavior = (elementRef?: Ref<HTMLElement | undefined>) => {
    const visibility = useElementVisibility(elementRef)
    const size = useElementSize(elementRef)

    return {
      visibility,
      size,
    }
  }

  // Composable para persistencia básica
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

  // Estados computados básicos
  const deviceInfo = computed(() => ({
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    isTouch: isTouch.value,
    screenSize: { width: width.value, height: height.value },
  }))

  const accessibilityInfo = computed(() => ({
    prefersReducedMotion: prefersReducedMotion.value,
  }))

  return {
    // Estados básicos
    isHovered,
    isFocused,
    isVisible,

    // Preferencias del usuario
    prefersReducedMotion,

    // Información del dispositivo
    width,
    height,

    // Media queries
    isMobile,
    isTablet,
    isDesktop,
    isTouch,

    // Funciones de utilidad
    debouncedFn,
    throttledFn,
    timeoutFn,

    // Composables especializados
    useInteractiveElement,
    useFormBehavior,
    useVisibilityBehavior,
    usePersistenceBehavior,

    // Información computada
    deviceInfo,
    accessibilityInfo,
  }
}

// Composables individuales básicos
export function useButtonBehaviorBasic(elementRef: Ref<HTMLElement | undefined>) {
  const isHovered = useElementHover(elementRef)
  const { focused } = useFocus(elementRef)
  const prefersReducedMotion = usePreferredReducedMotion()
  const isShiftPressed = useKeyModifier('Shift')

  const buttonState = computed(() => ({
    isHovered: isHovered.value,
    isFocused: focused.value,
    isShiftPressed: isShiftPressed.value,
    prefersReducedMotion: prefersReducedMotion.value,
  }))

  return {
    isHovered,
    focused,
    prefersReducedMotion,
    isShiftPressed,
    buttonState,
  }
}

export function useInputBehaviorBasic<T>(initialValue: T) {
  const vModel = ref(initialValue) as Ref<T>
  const { focused } = useFocus(ref<HTMLInputElement>())
  const { copy, copied, isSupported: isClipboardSupported } = useClipboard()
  const prefersReducedMotion = usePreferredReducedMotion()

  const debouncedValidation = useDebounceFn((_value: string) => {
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

// Exportar composables básicos
export {
  useClipboard,
  useDebounceFn,
  useElementHover,
  useElementSize,
  useElementVisibility,
  useEventListener,
  useFocus,
  useKeyModifier,
  useLocalStorage,
  useMediaQuery,
  usePreferredReducedMotion,
  useThrottleFn,
  useTimeoutFn,
  useVModel,
  useWindowSize,
}
