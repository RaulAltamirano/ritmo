<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Estado para controlar si estamos en el cliente
const isClient = ref(false)

// Marcar como cliente después del montaje
onMounted(() => {
  isClient.value = true
})
</script>

<template>
  <div>
    <!-- Contenido del cliente -->
    <div v-if="isClient">
      <slot />
    </div>

    <!-- Fallback mientras se carga -->
    <div v-else>
      <slot name="fallback">
        <div class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-full h-4"></div>
      </slot>
    </div>
  </div>
</template>
