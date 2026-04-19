import './styles/fonts.css'
import './styles/index.css'
import './styles/tokens.css'

// Solo exportar composables y tipos, NO componentes Vue
// Los componentes se importarán directamente en las aplicaciones

// Composables - Reusable logic
// export { useFocusTrap } from './composables/useFocusTrap'
export { useA11y } from './composables/useA11y'
export { useAtomicDesign } from './composables/useAtomicDesign'
export { useColors } from './composables/useColors'
export { useGlobalToast } from './composables/useGlobalToast'
export {
  generateContentId,
  generateId,
  generatePropsId,
  generateTimestampId,
  useId,
} from './composables/useId'
export { useMotionPreferences } from './composables/useMotionPreferences'
export { useNotifications } from './composables/useNotifications'
export { useToast } from './composables/useToast'
export { useTypography } from './composables/useTypography'

// Types - TypeScript interfaces
export type { BaseActionMenuProps, BaseMenuItemProps } from './types/action-menu'
export type { ButtonSize, ButtonVariant } from './types/button'
export type { EmptyStateProps } from './types/empty-state'
export type { InputProps } from './types/input'
export type {
  BaseNavDropdownProps,
  BaseNavItemProps,
  BaseNavbarProps,
  NavItem,
} from './types/navigation'
export type { Breadcrumb, PageHeaderProps, PhaseData } from './types/page-header'
export type { QuickInputProps } from './types/quick-input'
