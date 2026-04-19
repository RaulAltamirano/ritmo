<template>
  <div class="relative">
    <button @click="toggleDropdown" :class="[
      'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      isOpen
        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800',
    ]" :aria-label="ariaLabel" :aria-expanded="isOpen ? 'true' : 'false'">
      <ClientIcon :icon="icon" :size="16" />
      <span class="text-sm font-medium">{{ label }}</span>
      <ClientIcon :icon="ChevronDown" :size="12" class="transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown menu -->
    <div v-if="isOpen"
      class="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
      <slot>
        <!-- Dropdown content will be provided by parent -->
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import ClientIcon from '../../atoms/display/ClientIcon.vue'

interface BaseNavDropdownProps {
  label: string
  icon: any
  isOpen: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseNavDropdownProps>(), {
  ariaLabel: 'Dropdown menu',
})

const emit = defineEmits<{
  toggle: []
}>()

const toggleDropdown = () => {
  emit('toggle')
}
</script>
