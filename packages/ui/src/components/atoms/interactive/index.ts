// atoms/interactive - Interactive elements and controls
// This file exports all interactive atomic components

// Component exports
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as BaseTooltip } from './BaseTooltip.vue'

// Re-export types
export type { ButtonProps } from '@/types/button'
export type { ModalProps } from '@/types/modal'
export type { TooltipProps } from '@/types/tooltip'

// Re-export composables
export { useFocusTrap } from '@/composables/useFocusTrap'
// TODO: Implement missing composables
// export { useModal } from '@/composables/useModal'
// export { useTooltip } from '@/composables/useTooltip'

// Re-export stories for development
export { default as BaseButtonStories } from './BaseButton.stories'
export { default as BaseModalStories } from './BaseModal.stories'
