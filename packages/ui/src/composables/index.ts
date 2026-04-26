// Exportación centralizada de todos los composables del sistema de diseño
// Este archivo facilita la importación y composición de composables

// Composables Core
export { useAtomicDesign } from './useAtomicDesign'
export { useColors } from './useColors'
export { useId } from './useId'
export { usePerformance } from './usePerformance'
export { useTypography } from './useTypography'

// Composables de Accesibilidad
export { useA11y } from './useA11y'
export { useFocusManagement } from './useFocusManagement'
export { useFocusTrap } from './useFocusTrap'
export { useKeyboardNavigation } from './useKeyboardNavigation'
export { useMotionPreferences } from './useMotionPreferences'

// Composables de Componentes
export { useBadge } from './useBadge'
export { useGlobalToast } from './useGlobalToast'
export { useNotifications } from './useNotifications'
export { useToast } from './useToast'

// VueUse Integration
export {
  useButtonBehavior,
  useInputBehavior,
  useModalBehavior,
  useToastBehavior,
  useVueUseEnhanced,
} from './useVueUseEnhanced'
export { useVueUseIntegration } from './useVueUseIntegration'

// VueUse Basic (versión simplificada)
export {
  useButtonBehaviorBasic,
  useInputBehaviorBasic,
  useVueUseBasic,
} from './useVueUseBasic'

// Re-exportar composables individuales de VueUse para uso directo
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
} from './useVueUseEnhanced'
