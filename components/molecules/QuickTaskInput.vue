<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <form @submit.prevent="handleSubmit" class="flex items-center space-x-3">
      <div class="flex-1 relative">
        <input
          ref="inputRef"
          v-model="taskName"
          type="text"
          :placeholder="placeholder"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10"
          :disabled="isLoading"
          @keydown.esc="clearInput"
        />
        <button
          v-if="taskName"
          type="button"
          @click="clearInput"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Limpiar input"
        >
          <X :size="16" />
        </button>
      </div>
      <BaseButton
        type="submit"
        variant="outline"
        :disabled="!taskName.trim() || isLoading"
        class="flex items-center space-x-2 whitespace-nowrap"
      >
        <Plus v-if="!isLoading" :size="16" />
        <div v-else class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span>{{ isLoading ? 'Creando...' : 'Crear' }}</span>
      </BaseButton>
    </form>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center space-x-1">
      <Lightbulb :size="12" />
      <span>Tarea rápida: Solo nombre, 25 min estimados, prioridad media</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Plus, X, Lightbulb } from 'lucide-vue-next'
import BaseButton from '../atoms/BaseButton.vue'

interface QuickTaskInputProps {
  placeholder?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<QuickTaskInputProps>(), {
  placeholder: '¿Qué necesitas hacer? (Enter para crear tarea rápida)',
  isLoading: false
})

const emit = defineEmits<{
  'create-task': [name: string]
}>()

const taskName = ref('')
const inputRef = ref<HTMLInputElement>()

const handleSubmit = () => {
  if (!taskName.value.trim() || props.isLoading) return
  
  emit('create-task', taskName.value.trim())
  clearInput()
}

const clearInput = () => {
  taskName.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Exponer método para limpiar desde el padre
defineExpose({
  clear: clearInput,
  focus: () => inputRef.value?.focus()
})
</script> 