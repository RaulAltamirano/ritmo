<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

interface ClientIconProps {
  name?: string
  icon?: any
  size?: number
}

const props = withDefaults(defineProps<ClientIconProps>(), {
  size: 16,
})

// Función para obtener icono dinámicamente
const getIconComponent = (iconName: string) => {
  if (!iconName) return null

  // Si ya es un componente, devolverlo
  if (typeof iconName === 'object') {
    return iconName
  }

  // Convertir string a componente de Lucide
  // Ejemplos: "monitor" -> "Monitor", "smartphone" -> "Smartphone", "refresh-cw" -> "RefreshCw"
  const iconKey = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  return (LucideIcons as any)[iconKey] || null
}

// Computed para el componente de icono
const iconComponent = computed(() => {
  if (props.icon) {
    return props.icon
  }
  if (props.name) {
    return getIconComponent(props.name)
  }
  return null
})
</script>

<template>
  <component v-if="iconComponent" :is="iconComponent" :size="size" />
  <div
    v-else
    class="bg-gray-300 dark:bg-gray-600 animate-pulse rounded"
    :style="{ width: `${size}px`, height: `${size}px` }"
  ></div>
</template>
