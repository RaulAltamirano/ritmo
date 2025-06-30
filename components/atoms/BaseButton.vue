<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : ''
    ]"
    :disabled="disabled"
    :type="type"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <component 
      v-if="icon && !iconRight" 
      :is="icon" 
      :class="['mr-2', iconClasses]" 
      :size="iconSize"
    />
    <slot />
    <component 
      v-if="icon && iconRight" 
      :is="icon" 
      :class="['ml-2', iconClasses]" 
      :size="iconSize"
    />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'destructive' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: Component
  iconRight?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
  iconRight: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
}

const variantClasses = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
  success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500',
  warning: 'bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500',
  error: 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500',
  destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
  outline: 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500'
}

const iconClasses = 'flex-shrink-0'
const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 14
    case 'sm': return 16
    case 'md': return 18
    case 'lg': return 20
    case 'xl': return 24
    default: return 18
  }
})
</script> 