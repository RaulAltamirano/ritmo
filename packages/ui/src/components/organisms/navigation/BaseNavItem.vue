<template>
  <NuxtLink :to="path" :class="[
    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative group',
    isActive
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800',
  ]" :aria-label="label" :aria-current="isActive ? 'page' : undefined">
    <ClientIcon :icon="icon" :size="16" />
    <span class="text-sm font-medium">{{ label }}</span>

    <!-- Active route indicator -->
    <div v-if="isActive"
      class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full">
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import ClientIcon from '../../atoms/display/ClientIcon.vue'

interface BaseNavItemProps {
  path: string
  label: string
  icon: any
  isActive?: boolean
}

const props = withDefaults(defineProps<BaseNavItemProps>(), {
  isActive: false,
})
</script>
