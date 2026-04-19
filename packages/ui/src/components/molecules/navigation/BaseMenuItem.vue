<template>
  <button
    :class="[
      'w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none transition-colors duration-150',
      disabled &&
        'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
    ]"
    :disabled="disabled"
    @click="handleClick"
    role="menuitem"
    :aria-disabled="disabled"
  >
    <div class="flex items-center space-x-3">
      <component
        v-if="icon"
        :is="icon"
        :size="16"
        class="text-gray-500 dark:text-gray-400 flex-shrink-0"
      />
      <span class="flex-1">{{ label }}</span>
      <component
        v-if="rightIcon"
        :is="rightIcon"
        :size="14"
        class="text-gray-400 dark:text-gray-500 flex-shrink-0"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'

  interface BaseMenuItemProps {
    label: string
    icon?: Component
    rightIcon?: Component
    disabled?: boolean
  }

  const props = withDefaults(defineProps<BaseMenuItemProps>(), {
    disabled: false,
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', event)
    }
  }
</script>
