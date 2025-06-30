<template>
  <div
    :class="[
      'rounded-xl border transition-all duration-200',
      variantClasses[variant],
      paddingClasses[padding],
      hover && 'hover:shadow-medium cursor-pointer',
      fullHeight && 'h-full'
    ]"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface BaseCardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  fullHeight?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseCardProps>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  fullHeight: false
})

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-soft',
  elevated: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-medium',
  outlined: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-none',
  ghost: 'bg-transparent border-transparent shadow-none'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
}
</script> 