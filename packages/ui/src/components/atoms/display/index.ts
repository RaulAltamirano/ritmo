// atoms/display - Visual and display components
// This file exports all display-related atomic components

// Component exports
export { default as BaseIcon } from './BaseIcon.vue'
export { default as BaseLoadingSpinner } from './BaseLoadingSpinner.vue'
export { default as BaseSpinner } from './BaseSpinner.vue'
export { default as ClientIcon } from './ClientIcon.vue'
export { default as ClientOnly } from './ClientOnly.vue'
export { default as RitmoLogo } from './RitmoLogo.vue'

// Re-export types
export type { IconProps } from '@/types/icon'
export type { LogoProps } from '@/types/logo'
export type { SpinnerProps } from '@/types/spinner'

// Re-export composables
// TODO: Implement missing composables
// export { useIcon } from '@/composables/useIcon'
// export { useLogo } from '@/composables/useLogo'
// export { useSpinner } from '@/composables/useSpinner'

// Re-export stories for development
export { default as BaseIconStories } from './BaseIcon.stories'
export { default as BaseLoadingSpinnerStories } from './BaseLoadingSpinner.stories'
export { default as ClientOnlyStories } from './ClientOnly.stories'
export { default as RitmoLogoStories } from './RitmoLogo.stories'
