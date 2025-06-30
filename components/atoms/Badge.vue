<template>
  <span 
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      sizeClasses[size]
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md'
})

const variantClasses = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  primary: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
  secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  success: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
  error: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm'
}
</script> 