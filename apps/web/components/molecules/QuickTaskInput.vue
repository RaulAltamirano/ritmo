<template>
  <QuickInput
    placeholder="¿Qué necesitas hacer? (Enter para crear tarea rápida)"
    submit-text="Crear"
    loading-text="Creando..."
    hint="Tarea rápida: Solo nombre, 25 min estimados, prioridad media"
    :is-loading="isLoading"
    @submit="handleTaskSubmit"
  />
</template>

<script setup lang="ts">
  import QuickInput from '@ritmo/ui/components/molecules/forms/QuickInput.vue';

  interface QuickTaskInputProps {
    isLoading?: boolean
  }

  const props = withDefaults(defineProps<QuickTaskInputProps>(), {
    isLoading: false,
  })

  const emit = defineEmits<{
    'create-task': [name: string]
  }>()

  const handleTaskSubmit = (taskName: string) => {
    emit('create-task', taskName)
  }

  // Expose methods for parent compatibility
  defineExpose({
    clear: () => {}, // Will be handled by QuickInput
    focus: () => {}, // Will be handled by QuickInput
  })
</script>
