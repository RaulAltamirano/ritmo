<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="$emit('update:modelValue', false)"
  >
    <div
      class="w-full max-w-lg bg-surface rounded-xl shadow-2xl border border-outline"
      @click.stop
    >
      <div class="p-6 border-b border-outline">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? 'Edit plan' : 'New plan' }}
            </h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{
                isEditing
                  ? 'Update the name, status, or color of this plan.'
                  : 'A plan groups tasks toward one goal: study, exam, habit, or personal target.'
              }}
            </p>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-8 h-8 rounded-lg bg-surface-overlay hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Plan name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Plan name *
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            placeholder="e.g. English B2, Exam 2026, Get fit…"
            class="w-full px-4 py-3 border border-outline-strong rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-surface text-gray-900 dark:text-white"
          />
        </div>

        <!-- Description -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Description
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            placeholder="What you want to achieve and by when (optional)…"
            class="w-full px-4 py-3 border border-outline-strong rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-surface text-gray-900 dark:text-white resize-none"
          ></textarea>
        </div>

        <!-- Status -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Status
          </label>
          <select
            v-model="formData.status"
            class="w-full px-4 py-3 border border-outline-strong rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-surface text-gray-900 dark:text-white"
          >
            <option value="planificado">Planned</option>
            <option value="activo">Active</option>
            <option value="pausado">Paused</option>
            <option value="completado">Completed</option>
          </select>
        </div>

        <!-- Plan color -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Plan color
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              type="button"
              @click="formData.color = color.value"
              class="w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center"
              :class="[
                color.class,
                formData.color === color.value
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-outline-strong hover:scale-105',
              ]"
            >
              <Check
                v-if="formData.color === color.value"
                :size="16"
                class="text-white"
              />
            </button>
          </div>
        </div>
      </form>

      <div class="p-6 border-t border-outline space-y-3">
        <p
          v-if="errorMessage"
          class="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {{ errorMessage }}
        </p>
        <div class="flex space-x-3">
          <button
            type="button"
            :disabled="saving"
            @click="$emit('update:modelValue', false)"
            class="flex-1 py-3 bg-surface-overlay hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="!formData.name.trim() || saving"
            class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
          >
            {{ saving ? 'Saving…' : isEditing ? 'Update' : 'Create plan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { X, Check } from 'lucide-vue-next'
  import type { ProjectModalProps, ProjectFormData } from '@/types/project'

  const props = withDefaults(
    defineProps<
      ProjectModalProps & {
        saving?: boolean
        errorMessage?: string | null
      }
    >(),
    {
      saving: false,
      errorMessage: null,
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [form: ProjectFormData]
  }>()

  const formData = ref<ProjectFormData>({
    name: '',
    description: '',
    status: 'planificado',
    color: 'blue',
  })

  const isEditing = computed(() => !!props.project)

  const colorOptions = [
    { value: 'blue', class: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { value: 'purple', class: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { value: 'green', class: 'bg-gradient-to-br from-green-500 to-green-600' },
    { value: 'red', class: 'bg-gradient-to-br from-red-500 to-red-600' },
    { value: 'yellow', class: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    { value: 'pink', class: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { value: 'indigo', class: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { value: 'teal', class: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { value: 'orange', class: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { value: 'cyan', class: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { value: 'emerald', class: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { value: 'rose', class: 'bg-gradient-to-br from-rose-500 to-rose-600' },
  ]

  watch(
    () => props.project,
    newProject => {
      if (newProject) {
        formData.value = {
          name: newProject.name,
          description: newProject.description,
          status: newProject.status === 'en_progreso' ? 'activo' : newProject.status,
          color: newProject.color,
        }
      } else {
        formData.value = {
          name: '',
          description: '',
          status: 'planificado',
          color: 'blue',
        }
      }
    },
    { immediate: true },
  )

  watch(
    () => props.modelValue,
    isOpen => {
      if (isOpen && !props.project) {
        formData.value = {
          name: '',
          description: '',
          status: 'planificado',
          color: 'blue',
        }
      }
    },
  )

  const handleSubmit = () => {
    if (!formData.value.name.trim() || props.saving) return
    emit('save', {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      status: formData.value.status,
      color: formData.value.color,
    })
  }
</script>
