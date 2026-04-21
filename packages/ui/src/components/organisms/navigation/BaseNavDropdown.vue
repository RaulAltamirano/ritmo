<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import type { Component } from 'vue'
import ClientIcon from '../../atoms/display/ClientIcon.vue'

interface BaseNavDropdownProps {
  label: string
  icon: Component
  isOpen: boolean
  ariaLabel?: string
}

withDefaults(defineProps<BaseNavDropdownProps>(), {
  ariaLabel: 'Dropdown menu',
})

const emit = defineEmits<{
  toggle: []
}>()

const toggleDropdown = () => {
  emit('toggle')
}
</script>

<template>
  <div class="relative">
    <button class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      :class="[
        isOpen
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-raised',
      ]" @click="toggleDropdown" :aria-label="ariaLabel" :aria-expanded="isOpen ? 'true' : 'false'" aria-haspopup="menu">
      <ClientIcon :icon="icon" :size="16" />
      <span class="text-sm font-medium">{{ label }}</span>
      <ClientIcon :icon="ChevronDown" :size="12" class="transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown menu -->
    <div v-if="isOpen"
      class="absolute top-full right-0 mt-1 w-56 bg-surface rounded-lg shadow-lg border border-outline py-2 z-50">
      <slot>
        <!-- Dropdown content will be provided by parent -->
      </slot>
    </div>
  </div>
</template>
