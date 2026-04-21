// atoms/feedback - Components that provide user feedback and status information
// This file exports all feedback-related atomic components

// Component exports
export { default as BaseAlert } from './BaseAlert.vue'
export { default as BaseBadge } from './BaseBadge.vue'
export { default as BaseToast } from './BaseToast.vue'

// Re-export types
export type { AlertProps } from '../../../types/alert'
export type { BadgeProps } from '../../../types/badge'
export type { ToastProps } from '../../../types/toast'

// Re-export composables
export { useBadge } from '../../../composables/useBadge'
export { useToast } from '../../../composables/useToast'
export { useNotifications } from '../../../composables/useNotifications'
