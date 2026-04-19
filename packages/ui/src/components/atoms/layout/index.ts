// atoms/layout - Layout and structural components
// This file exports all layout-related atomic components

// Component exports
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseSkeleton } from './BaseSkeleton.vue'

// Re-export types
export type { CardProps } from '@/types/card'
export type { SkeletonProps } from '@/types/skeleton'

// Re-export composables
// TODO: Implement missing composables
// export { useLayout } from '@/composables/useLayout'
// export { useSkeleton } from '@/composables/useSkeleton'

// Re-export stories for development
export { default as BaseCardStories } from './BaseCard.stories'
export { default as BaseSkeletonStories } from './BaseSkeleton.stories'
