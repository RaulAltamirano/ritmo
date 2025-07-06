<template>
  <div 
    v-if="modelValue && editingTask"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="$emit('update:modelValue', false)"
  >
    <div 
      class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      @click.stop
    >
      <div class="p-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Editar tarea</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Modifica los detalles de la tarea</p>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input
            v-model="editingTask.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
          
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select
            v-model="editingTask.category"
            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Sin categoría</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Estudio">Estudio</option>
            <option value="Personal">Personal</option>
            <option value="Urgente">Urgente</option>
            <option value="Proyecto">Proyecto</option>
          </select>
        </div>
      </div>

      <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TaskEditModalProps, Task } from '../../types/task'

const props = defineProps<TaskEditModalProps>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [task: Task]
}>()

const editingTask = ref<Task | null>(null)

// Watch for changes in task and update editingTask
watch(() => props.task, (newTask) => {
  if (newTask) {
    editingTask.value = { ...newTask }
  }
}, { immediate: true })

// Watch for modal opening to reset editing task
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.task) {
    editingTask.value = { ...props.task }
  }
})

const handleSave = () => {
  if (editingTask.value) {
    editingTask.value.lastEdited = new Date()
    emit('save', editingTask.value)
    emit('update:modelValue', false)
  }
}
</script> 