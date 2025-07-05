<template>
  <div 
    v-if="modelValue"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="$emit('update:modelValue', false)"
  >
    <div 
      class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      @click.stop
    >
      <div class="p-6 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
            </h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ isEditing ? 'Modifica los detalles del proyecto' : 'Crea un nuevo proyecto para organizar tus tareas' }}
            </p>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Nombre del proyecto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Proyecto *
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            placeholder="Ej: Aplicación Web"
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            placeholder="Describe brevemente el proyecto..."
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          ></textarea>
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            v-model="formData.status"
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="planificado">Planificado</option>
            <option value="en_progreso">En Progreso</option>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        <!-- Color del proyecto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color del Proyecto
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
                  : 'border-gray-200 dark:border-gray-600 hover:scale-105'
              ]"
            >
              <Check v-if="formData.color === color.value" :size="16" class="text-white" />
            </button>
          </div>
        </div>
      </form>

      <div class="p-6 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="!formData.name.trim()"
          class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
        >
          {{ isEditing ? 'Actualizar' : 'Crear Proyecto' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'
import type { ProjectModalProps, Project, ProjectFormData } from '../../types/project'

const props = defineProps<ProjectModalProps>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [project: Project]
}>()

const formData = ref<ProjectFormData>({
  name: '',
  description: '',
  status: 'planificado',
  color: 'blue'
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
  { value: 'rose', class: 'bg-gradient-to-br from-rose-500 to-rose-600' }
]

// Watch for changes in project and update formData
watch(() => props.project, (newProject) => {
  if (newProject) {
    formData.value = {
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      color: newProject.color
    }
  } else {
    // Reset form for new project
    formData.value = {
      name: '',
      description: '',
      status: 'planificado',
      color: 'blue'
    }
  }
}, { immediate: true })

// Watch for modal opening to reset form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.project) {
    formData.value = {
      name: '',
      description: '',
      status: 'planificado',
      color: 'blue'
    }
  }
})

const handleSubmit = () => {
  if (!formData.value.name.trim()) return

  const projectData: Project = {
    id: props.project?.id || '',
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
    status: formData.value.status,
    progress: props.project?.progress || 0,
    pendingTasks: props.project?.pendingTasks || 0,
    totalTasks: props.project?.totalTasks || 0,
    createdAt: props.project?.createdAt || new Date(),
    updatedAt: new Date(),
    color: formData.value.color,
    icon: 'FolderOpen'
  }

  emit('save', projectData)
  emit('update:modelValue', false)
}
</script> 