// molecules/layout - Layout-related molecule components
// This file exports all layout-related molecule components

// Component exports
export { default as PageHeader } from './PageHeader.vue'
export { default as PhaseImageCard } from './PhaseImageCard.vue'
export { default as PhaseInfoIcon } from './PhaseInfoIcon.vue'

// Re-export types
export type { PageHeaderProps } from '@/types/page-header'
export type { PhaseImageCardProps } from '@/types/phase-image-card'
export type { PhaseInfoIconProps } from '@/types/phase-info-icon'

// Re-export composables
// TODO: Implement missing composables
// export { usePageHeader } from '@/composables/usePageHeader'
// export { usePhaseImageCard } from '@/composables/usePhaseImageCard'
// export { usePhaseInfoIcon } from '@/composables/usePhaseInfoIcon'
