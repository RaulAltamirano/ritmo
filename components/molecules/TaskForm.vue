<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Título de la tarea -->
    <div>
      <label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">
        Título de la tarea *
      </label>
      <input
        id="task-title"
        v-model="form.title"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        placeholder="¿Qué necesitas hacer?"
        :aria-describedby="errors.title ? 'title-error' : undefined"
      />
      <p 
        v-if="errors.title" 
        id="title-error" 
        class="mt-1 text-sm text-red-600"
      >
        {{ errors.title }}
      </p>
    </div>

    <!-- Duración -->
    <div>
      <label for="task-duration" class="block text-sm font-medium text-gray-700 mb-1">
        Duración *
      </label>
      <select
        id="task-duration"
        v-model="form.duration"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      >
        <option value="15">15 minutos</option>
        <option value="25">25 minutos (Pomodoro)</option>
        <option value="30">30 minutos</option>
        <option value="45">45 minutos</option>
        <option value="60">1 hora</option>
        <option value="90">1.5 horas</option>
        <option value="120">2 horas</option>
      </select>
    </div>

    <!-- Categoría -->
    <div>
      <label for="task-category" class="block text-sm font-medium text-gray-700 mb-1">
        Categoría
      </label>
      <select
        id="task-category"
        v-model="form.category"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      >
        <option value="">Sin categoría</option>
        <option value="Estudio">Estudio</option>
        <option value="Trabajo">Trabajo</option>
        <option value="Personal">Personal</option>
        <option value="Salud">Salud</option>
      </select>
    </div>

    <!-- Prioridad -->
    <div>
      <label for="task-priority" class="block text-sm font-medium text-gray-700 mb-1">
        Prioridad
      </label>
      <select
        id="task-priority"
        v-model="form.priority"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      >
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>
    </div>

    <!-- Descripción -->
    <div>
      <label for="task-description" class="block text-sm font-medium text-gray-700 mb-1">
        Descripción (opcional)
      </label>
      <textarea
        id="task-description"
        v-model="form.description"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
        placeholder="Agrega detalles adicionales..."
      ></textarea>
    </div>

    <!-- Fecha límite -->
    <div>
      <label for="task-deadline" class="block text-sm font-medium text-gray-700 mb-1">
        Fecha límite (opcional)
      </label>
      <input
        id="task-deadline"
        v-model="form.deadline"
        type="datetime-local"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
    </div>

    <!-- Botones -->
    <div class="flex space-x-3 pt-4">
      <Button 
        type="button" 
        variant="secondary" 
        @click="$emit('cancel')"
        class="flex-1"
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        variant="primary"
        :disabled="isSubmitting"
        class="flex-1"
      >
        <Icon 
          v-if="isSubmitting" 
          name="timer" 
          size="sm" 
          class="mr-2 animate-spin" 
        />
        {{ isEditing ? 'Actualizar' : 'Crear' }} Tarea
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
interface TaskFormData {
  title: string
  duration: string
  category: string
  priority: 'low' | 'medium' | 'high'
  description: string
  deadline: string
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>
  isEditing?: boolean
}

const props = withDefaults(defineProps<TaskFormProps>(), {
  isEditing: false
})

const emit = defineEmits<{
  'submit': [data: TaskFormData]
  'cancel': []
}>()

const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<TaskFormData>({
  title: props.initialData?.title || '',
  duration: props.initialData?.duration || '30',
  category: props.initialData?.category || '',
  priority: props.initialData?.priority || 'medium',
  description: props.initialData?.description || '',
  deadline: props.initialData?.deadline || ''
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'El título es requerido'
  }
  
  if (form.value.title.length > 100) {
    errors.value.title = 'El título no puede tener más de 100 caracteres'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    await emit('submit', { ...form.value })
  } finally {
    isSubmitting.value = false
  }
}
</script> 