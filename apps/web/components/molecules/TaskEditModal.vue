<template>
  <BaseModal
    :is-open="modelValue && !!editingTask"
    aria-label="Editar tarea"
    :show-close-button="false"
    size="md"
    backdrop="blur"
    @update:is-open="emit('update:modelValue', $event)"
  >
    <div v-if="editingTask" class="space-y-5">
      <div
        class="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800"
      >
        <div class="space-y-1">
          <h3
            id="task-edit-heading"
            class="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Editar tarea
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Modifica los detalles de la tarea
          </p>
        </div>

        <button
          type="button"
          class="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Cerrar edición de tarea"
          @click="emit('update:modelValue', false)"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <section class="space-y-4" aria-labelledby="task-edit-heading">
        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-name">Nombre</label>
          <input
            id="task-edit-name"
            v-model="editingTask.name"
            type="text"
            class="field-control"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-category">Categoría</label>
            <IconSelect
              id="task-edit-category"
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="Sin categoría"
            />
          </div>

          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-priority">Prioridad</label>
            <IconSelect
              id="task-edit-priority"
              v-model="selectedPriority"
              :options="priorityOptions"
              placeholder="Elegir prioridad"
            />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-duration">
              Duración estimada
            </label>
            <IconSelect
              id="task-edit-duration"
              v-model="durationMode"
              :options="durationOptions"
              placeholder="Sin estimar"
            />
            <div v-if="isFreeDuration" class="pt-1">
              <label class="field-label" for="task-edit-duration-free">
                Minutos libres
              </label>
              <input
                id="task-edit-duration-free"
                v-model="freeMinutes"
                type="number"
                min="1"
                max="480"
                step="1"
                placeholder="Ej. 40"
                class="field-control mt-1.5"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Bloques de foco de Ritmo, o tiempo libre a tu medida
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-due-date">Fecha límite</label>
            <input
              id="task-edit-due-date"
              v-model="dueDateLocal"
              type="datetime-local"
              class="field-control"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-description">Descripción</label>
          <textarea
            id="task-edit-description"
            v-model="editingTask.notes"
            rows="3"
            placeholder="Opcional"
            class="field-control resize-none"
          />
        </div>

        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-tags">Etiquetas</label>
          <input
            id="task-edit-tags"
            v-model="tagsInput"
            type="text"
            placeholder="Separadas por coma"
            class="field-control"
          />
        </div>
      </section>

      <div class="flex w-full gap-3 pt-1">
        <BaseButton
          variant="secondary"
          size="sm"
          class="flex-1"
          @click="emit('update:modelValue', false)"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          class="flex-1"
          :disabled="!canSave"
          aria-label="Guardar cambios de la tarea"
          @click="handleSave"
        >
          Guardar cambios
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import IconSelect, {
    type IconSelectOption,
    type IconSelectTone,
  } from '@/components/molecules/IconSelect.vue'
  import {
    DEFAULT_TIMER_PRESETS,
    FREE_ESTIMATE_DURATION_VALUE,
    getEstimateDurationChoices,
  } from '@/composables/timer/timerPresets'
  import type { Task, TaskEditModalProps, TaskPriority } from '@/types/task'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BookOpen,
    Briefcase,
    CircleOff,
    Clock,
    Dumbbell,
    Flame,
    GraduationCap,
    Heart,
    Minus,
    MoreHorizontal,
    Palette,
    Timer,
    User,
    Users,
    X,
  } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<TaskEditModalProps>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [task: Task]
  }>()

  const editingTask = ref<Task | null>(null)
  const tagsInput = ref('')
  const dueDateLocal = ref('')
  const durationMode = ref('')
  const freeMinutes = ref('')

  const presetToneByKey: Record<string, IconSelectTone> = {
    '25_5': 'blue',
    '52_17': 'amber',
    '90_20': 'violet',
  }

  const categoryOptions: IconSelectOption[] = [
    { value: '', label: 'Sin categoría', icon: CircleOff, tone: 'slate' },
    { value: 'work', label: 'Trabajo', icon: Briefcase, tone: 'blue' },
    { value: 'study', label: 'Estudio', icon: BookOpen, tone: 'violet' },
    { value: 'exercise', label: 'Ejercicio', icon: Dumbbell, tone: 'emerald' },
    { value: 'social', label: 'Social', icon: Users, tone: 'cyan' },
    { value: 'personal', label: 'Personal', icon: User, tone: 'slate' },
    { value: 'health', label: 'Salud', icon: Heart, tone: 'rose' },
    { value: 'learning', label: 'Aprendizaje', icon: GraduationCap, tone: 'amber' },
    { value: 'creative', label: 'Creativo', icon: Palette, tone: 'pink' },
    { value: 'other', label: 'Otro', icon: MoreHorizontal, tone: 'slate' },
  ]

  const priorityOptions: IconSelectOption[] = [
    { value: 'LOW', label: 'Baja', icon: ArrowDown, tone: 'slate' },
    { value: 'MEDIUM', label: 'Media', icon: Minus, tone: 'blue' },
    { value: 'HIGH', label: 'Alta', icon: ArrowUp, tone: 'amber' },
    { value: 'URGENT', label: 'Urgente', icon: AlertTriangle, tone: 'orange' },
    { value: 'CRITICAL', label: 'Crítica', icon: Flame, tone: 'rose' },
  ]

  const durationOptions = computed<IconSelectOption[]>(() => {
    const choices = getEstimateDurationChoices(DEFAULT_TIMER_PRESETS)
    return [
      { value: '', label: 'Sin estimar', icon: CircleOff, tone: 'slate' },
      ...choices.map(choice => ({
        value: choice.value,
        label: choice.label,
        icon: Timer,
        tone: (choice.presetKey && presetToneByKey[choice.presetKey]) || 'blue',
      })),
      {
        value: FREE_ESTIMATE_DURATION_VALUE,
        label: 'Tiempo libre',
        icon: Clock,
        tone: 'cyan',
      },
    ]
  })

  const isFreeDuration = computed(
    () => durationMode.value === FREE_ESTIMATE_DURATION_VALUE,
  )

  const visualFromApi: Record<TaskPriority, 'alta' | 'media' | 'baja'> = {
    LOW: 'baja',
    MEDIUM: 'media',
    HIGH: 'alta',
    URGENT: 'alta',
    CRITICAL: 'alta',
  }

  const visualToApi: Record<'alta' | 'media' | 'baja', TaskPriority> = {
    baja: 'LOW',
    media: 'MEDIUM',
    alta: 'HIGH',
  }

  const selectedCategory = computed({
    get: () => editingTask.value?.category ?? '',
    set: (value: string) => {
      if (!editingTask.value) return
      editingTask.value.category = value || undefined
    },
  })

  const selectedPriority = computed({
    get: (): string =>
      editingTask.value?.apiPriority ??
      visualToApi[editingTask.value?.priority ?? 'media'] ??
      'MEDIUM',
    set: (value: string) => {
      if (!editingTask.value) return
      const priority = value as TaskPriority
      editingTask.value.apiPriority = priority
      editingTask.value.priority = visualFromApi[priority]
    },
  })

  const canonicalValues = new Set(
    getEstimateDurationChoices(DEFAULT_TIMER_PRESETS).map(c => c.value),
  )

  const resolveDurationMode = (estimatedTime?: string) => {
    if (!estimatedTime) {
      durationMode.value = ''
      freeMinutes.value = ''
      return
    }
    if (canonicalValues.has(estimatedTime)) {
      durationMode.value = estimatedTime
      freeMinutes.value = ''
      return
    }
    durationMode.value = FREE_ESTIMATE_DURATION_VALUE
    freeMinutes.value = estimatedTime
  }

  const freeMinutesValid = computed(() => {
    const n = Number(freeMinutes.value)
    return Number.isInteger(n) && n >= 1 && n <= 480
  })

  const canSave = computed(() => {
    if (!editingTask.value?.name?.trim()) return false
    if (isFreeDuration.value && !freeMinutesValid.value) return false
    return true
  })

  const toDatetimeLocal = (date?: Date | null) => {
    if (!date || Number.isNaN(date.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const syncFromTask = (task: Task) => {
    editingTask.value = {
      ...task,
      notes: task.notes ?? task.description ?? '',
      tags: [...(task.tags ?? [])],
    }
    tagsInput.value = (task.tags ?? []).join(', ')
    dueDateLocal.value = toDatetimeLocal(task.dueDate)
    resolveDurationMode(task.estimatedTime)
  }

  watch(
    () => props.task,
    newTask => {
      if (newTask) syncFromTask(newTask)
    },
    { immediate: true },
  )

  watch(
    () => props.modelValue,
    isOpen => {
      if (isOpen && props.task) syncFromTask(props.task)
    },
  )

  const parseTags = (raw: string): string[] =>
    raw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

  const applyEstimatedTime = () => {
    if (!editingTask.value) return
    if (durationMode.value === '') {
      editingTask.value.estimatedTime = undefined
      editingTask.value.duration = undefined
      return
    }
    if (durationMode.value === FREE_ESTIMATE_DURATION_VALUE) {
      const minutes = String(Number(freeMinutes.value))
      editingTask.value.estimatedTime = minutes
      editingTask.value.duration = `${minutes}m`
      return
    }
    editingTask.value.estimatedTime = durationMode.value
    editingTask.value.duration = `${durationMode.value}m`
  }

  const handleSave = () => {
    if (!editingTask.value || !canSave.value) return

    applyEstimatedTime()
    editingTask.value.tags = parseTags(tagsInput.value)
    editingTask.value.hasNotes = !!editingTask.value.notes?.trim()
    editingTask.value.description = editingTask.value.notes
    editingTask.value.dueDate = dueDateLocal.value
      ? new Date(dueDateLocal.value)
      : null
    editingTask.value.lastEdited = new Date()

    emit('save', editingTask.value)
    emit('update:modelValue', false)
  }
</script>

<style scoped>
  .field-label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  .field-control {
    @apply w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white;
  }
</style>
