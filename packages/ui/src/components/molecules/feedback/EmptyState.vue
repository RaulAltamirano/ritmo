<template>
  <div class="text-center py-8">
    <!-- Icono simple (opcional) -->
    <div v-if="icon" class="mb-4">
      <component
        :is="icon"
        class="text-gray-300 dark:text-gray-600 mx-auto"
        :size="24"
      />
    </div>

    <!-- Contenido -->
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      {{ description }}
    </p>

    <!-- Acción (opcional) -->
    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  interface EmptyStateProps {
    title: string
    description: string
    icon?: any
  }

  defineProps<EmptyStateProps>()
</script>
