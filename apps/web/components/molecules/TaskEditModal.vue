<template>
  <BaseModal
    :is-open="modelValue && !!editingTask"
    aria-label="Edit task"
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
            Edit task
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Update the task details
          </p>
        </div>

        <button
          type="button"
          class="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close task editor"
          @click="emit('update:modelValue', false)"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <section class="space-y-4" aria-labelledby="task-edit-heading">
        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-name">Name</label>
          <input
            id="task-edit-name"
            v-model="editingTask.name"
            type="text"
            class="field-control"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-category">Category</label>
            <IconSelect
              id="task-edit-category"
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="No category"
            />
          </div>

          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-priority">Priority</label>
            <IconSelect
              id="task-edit-priority"
              v-model="selectedPriority"
              :options="priorityOptions"
              placeholder="Choose priority"
            />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-duration">
              Estimated duration
            </label>
            <IconSelect
              id="task-edit-duration"
              v-model="durationMode"
              :options="durationOptions"
              placeholder="No estimate"
            />
            <div v-if="isFreeDuration" class="pt-1">
              <label class="field-label" for="task-edit-duration-free">
                Custom minutes
              </label>
              <input
                id="task-edit-duration-free"
                v-model="freeMinutes"
                type="number"
                min="1"
                max="480"
                step="1"
                placeholder="e.g. 40"
                class="field-control mt-1.5"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Ritmo focus blocks, or free time that fits you
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="field-label" for="task-edit-due-date">Due date</label>
            <input
              id="task-edit-due-date"
              v-model="dueDateLocal"
              type="datetime-local"
              class="field-control"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-description">Description</label>
          <textarea
            id="task-edit-description"
            v-model="editingTask.notes"
            rows="3"
            placeholder="Optional"
            class="field-control resize-none"
          />
        </div>

        <div class="space-y-1.5">
          <label class="field-label" for="task-edit-tags">Tags</label>
          <input
            id="task-edit-tags"
            v-model="tagsInput"
            type="text"
            placeholder="Comma-separated"
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
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          class="flex-1"
          :disabled="!canSave"
          aria-label="Save task changes"
          @click="handleSave"
        >
          Save changes
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
    { value: '', label: 'No category', icon: CircleOff, tone: 'slate' },
    { value: 'work', label: 'Work', icon: Briefcase, tone: 'blue' },
    { value: 'study', label: 'Study', icon: BookOpen, tone: 'violet' },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell, tone: 'emerald' },
    { value: 'social', label: 'Social', icon: Users, tone: 'cyan' },
    { value: 'personal', label: 'Personal', icon: User, tone: 'slate' },
    { value: 'health', label: 'Health', icon: Heart, tone: 'rose' },
    { value: 'learning', label: 'Learning', icon: GraduationCap, tone: 'amber' },
    { value: 'creative', label: 'Creative', icon: Palette, tone: 'pink' },
    { value: 'other', label: 'Other', icon: MoreHorizontal, tone: 'slate' },
  ]

  const priorityOptions: IconSelectOption[] = [
    { value: 'LOW', label: 'Low', icon: ArrowDown, tone: 'slate' },
    { value: 'MEDIUM', label: 'Medium', icon: Minus, tone: 'blue' },
    { value: 'HIGH', label: 'High', icon: ArrowUp, tone: 'amber' },
    { value: 'URGENT', label: 'Urgent', icon: AlertTriangle, tone: 'orange' },
    { value: 'CRITICAL', label: 'Critical', icon: Flame, tone: 'rose' },
  ]

  const durationOptions = computed<IconSelectOption[]>(() => {
    const choices = getEstimateDurationChoices(DEFAULT_TIMER_PRESETS)
    return [
      { value: '', label: 'No estimate', icon: CircleOff, tone: 'slate' },
      ...choices.map(choice => ({
        value: choice.value,
        label: choice.label,
        icon: Timer,
        tone: (choice.presetKey && presetToneByKey[choice.presetKey]) || 'blue',
      })),
      {
        value: FREE_ESTIMATE_DURATION_VALUE,
        label: 'Free time',
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
    editingTask.value.dueDate = dueDateLocal.value ? new Date(dueDateLocal.value) : null
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
