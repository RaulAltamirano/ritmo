// atoms - Basic building blocks of the design system
// This file exports all atomic components organized by category

// Forms category
export * from './forms'

// Feedback category
export * from './feedback'

// Layout category
export * from './layout'

// Interactive category
export * from './interactive'

// Display category
export * from './display'

// Re-export all composables
export { useFocusManagement } from '../../composables/useFocusManagement'
export { useFocusTrap } from '../../composables/useFocusTrap'
export { useA11y } from '../../composables/useA11y'
export { useAtomicDesign } from '../../composables/useAtomicDesign'
export { useColors } from '../../composables/useColors'
export { useId } from '../../composables/useId'
export { useMotionPreferences } from '../../composables/useMotionPreferences'
export { useTypography } from '../../composables/useTypography'

// Re-export all types
export type {
  AtomicColor,
  AtomicSize,
  AtomicState,
} from '@/composables/useAtomicDesign'
