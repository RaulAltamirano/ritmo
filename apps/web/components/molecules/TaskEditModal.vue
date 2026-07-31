<template>
  <BaseModal
    :is-open="modelValue && !!editingTask"
    title="Editar tarea"
    aria-label="Editar tarea"
    size="sm"
    backdrop="blur"
    @update:is-open="emit('update:modelValue', $event)"
  >
    <template #header="{ titleId }">
      <div class="min-w-0">
        <h2 :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Editar tarea
        </h2>
        <p class="mt-1 text-sm text-content-secondary">
          Modifica los detalles de la tarea
        </p>
      </div>
    </template>

    <div v-if="editingTask" class="space-y-4">
      <div>
        <label
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          for="task-edit-name"
        >
          Nombre
        </label>
        <input
          id="task-edit-name"
          v-model="editingTask.name"
          type="text"
          class="w-full rounded-lg border border-outline-strong bg-surface px-3 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      <div>
        <label
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          for="task-edit-category"
        >
          Categoría
        </label>
        <select
          id="task-edit-category"
          v-model="editingTask.category"
          class="w-full rounded-lg border border-outline-strong bg-surface px-3 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="">Sin categoría</option>
          <option value="work">Trabajo</option>
          <option value="study">Estudio</option>
          <option value="exercise">Ejercicio</option>
          <option value="social">Social</option>
          <option value="personal">Personal</option>
          <option value="health">Salud</option>
          <option value="learning">Aprendizaje</option>
          <option value="creative">Creativo</option>
          <option value="other">Otro</option>
        </select>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full gap-3">
        <BaseButton
          variant="outline"
          class="flex-1"
          @click="emit('update:modelValue', false)"
        >
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" class="flex-1" @click="handleSave">
          Guardar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import type { Task, TaskEditModalProps } from '@/types/task'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { ref, watch } from 'vue'

  const props = defineProps<TaskEditModalProps>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [task: Task]
  }>()

  const editingTask = ref<Task | null>(null)

  watch(
    () => props.task,
    newTask => {
      if (newTask) {
        editingTask.value = { ...newTask }
      }
    },
    { immediate: true },
  )

  watch(
    () => props.modelValue,
    isOpen => {
      if (isOpen && props.task) {
        editingTask.value = { ...props.task }
      }
    },
  )

  const handleSave = () => {
    if (editingTask.value) {
      editingTask.value.lastEdited = new Date()
      emit('save', editingTask.value)
      emit('update:modelValue', false)
    }
  }
</script>
