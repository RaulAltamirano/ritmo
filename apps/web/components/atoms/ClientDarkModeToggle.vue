<template>
  <ClientOnly>
    <DarkModeToggle
      @toggle="handleDarkModeToggle"
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-raised transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Toggle dark mode"
    />
    <template #fallback>
      <div
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-raised transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <div class="w-6 h-6 bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
  import DarkModeToggle from '@ritmo/ui/components/molecules/navigation/DarkModeToggle.vue'

  const emit = defineEmits<{
    'toggle-dark-mode': []
  }>()

  const handleDarkModeToggle = (isDarkMode: boolean) => {
    emit('toggle-dark-mode')
  }
</script>
