<template>
  <BaseModal
    :is-open="modelValue"
    title="Notas de la tarea"
    aria-label="Notas de la tarea"
    size="sm"
    backdrop="blur"
    @update:is-open="emit('update:modelValue', $event)"
  >
    <template #header="{ titleId }">
      <div class="min-w-0">
        <h2
          :id="titleId"
          class="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Notas de la tarea
        </h2>
        <p class="mt-1 text-sm text-content-secondary">{{ taskTitle }}</p>
      </div>
    </template>

    <textarea
      v-model="noteText"
      placeholder="Escribe tus notas aquí..."
      class="h-32 w-full resize-none rounded-lg border border-outline-strong bg-surface px-3 py-2 text-gray-900 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:text-white"
    />

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
  import type { TaskNoteModalProps } from '@/types/task'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { ref, watch } from 'vue'

  const props = defineProps<TaskNoteModalProps>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [note: string]
  }>()

  const noteText = ref('')

  watch(
    () => props.initialNote,
    newNote => {
      noteText.value = newNote ?? ''
    },
    { immediate: true },
  )

  watch(
    () => props.modelValue,
    isOpen => {
      if (isOpen) {
        noteText.value = props.initialNote ?? ''
      }
    },
  )

  const handleSave = () => {
    if (noteText.value.trim()) {
      emit('save', noteText.value.trim())
      emit('update:modelValue', false)
    }
  }
</script>
