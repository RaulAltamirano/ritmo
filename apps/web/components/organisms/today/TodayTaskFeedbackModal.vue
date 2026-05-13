<template>
  <BaseModal
    :is-open="isOpen"
    aria-label="Feedback al terminar la tarea"
    :show-close-button="false"
    :close-on-backdrop-click="false"
    :close-on-escape="!loading"
    size="lg"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-6">
      <div class="space-y-3 border-b border-gray-200 pb-5 dark:border-gray-800">
        <span class="sr-only">Paso {{ currentStep }} de 3</span>

        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <p
              class="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500"
            >
              Paso {{ currentStep }} de 3
            </p>
            <h3
              :id="stepHeadingId"
              class="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {{ stepTitle }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ task?.title || task?.name }}
            </p>
          </div>

          <button
            type="button"
            class="p-2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-300"
            aria-label="Cerrar feedback post tarea"
            :disabled="loading"
            @click="handleRequestClose(false)"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div
          class="h-1.5 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-950/40"
        >
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 dark:from-primary-400 dark:to-primary-500"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <section
        v-if="currentStep === 1"
        class="space-y-6"
        :aria-labelledby="stepHeadingId"
      >
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            ¿Con cuánta energía terminas?
          </p>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <button
              v-for="option in energyOptions"
              :key="option.value"
              type="button"
              :aria-label="`Energía ${option.value} de 5`"
              :class="selectCardClasses(energyAfter === option.value)"
              @click="energyAfter = option.value"
            >
              <component
                :is="resolveOptionIcon(option.iconKey)"
                class="h-5 w-5 shrink-0 text-current opacity-80"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-current">
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            ¿Esta tarea encajó bien con este momento del día?
          </p>

          <div class="grid gap-3 sm:grid-cols-3">
            <button
              v-for="option in timeFitOptions"
              :key="option.value"
              type="button"
              :aria-label="`Momento del día: ${option.ariaLabel}`"
              :class="selectCardClasses(timeFit === option.value)"
              @click="timeFit = option.value"
            >
              <component
                :is="resolveOptionIcon(option.iconKey)"
                class="h-5 w-5 shrink-0 text-current opacity-80"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-current">
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section
        v-else-if="currentStep === 2"
        class="space-y-6"
        :aria-labelledby="stepHeadingId"
      >
        <div
          v-for="metric in ratingMetrics"
          :key="metric.key"
          class="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/60"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ metric.label }}
            </p>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              {{ getMetricValue(metric.key) ?? 'Sin respuesta' }}
            </span>
          </div>

          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="value in 5"
              :key="value"
              type="button"
              :aria-label="`${metric.ariaPrefix} ${value} de 5`"
              :class="ratingButtonClasses(getMetricValue(metric.key) === value)"
              @click="setMetricValue(metric.key, value as 1 | 2 | 3 | 4 | 5)"
            >
              <component
                :is="
                  resolveOptionIcon(
                    getRatingOption(metric.key, value as 1 | 2 | 3 | 4 | 5).iconKey,
                  )
                "
                class="h-4 w-4 shrink-0 text-current"
                aria-hidden="true"
              />
              <span class="text-[11px] font-medium leading-tight text-current">
                {{ getRatingOption(metric.key, value as 1 | 2 | 3 | 4 | 5).label }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section v-else class="space-y-6" :aria-labelledby="stepHeadingId">
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            ¿Qué fue lo que más afectó tu rendimiento?
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="option in blockerOptions"
              :key="option.value"
              type="button"
              :aria-label="`Bloqueador ${option.ariaLabel}`"
              :class="selectCardClasses(mainBlocker === option.value)"
              @click="mainBlocker = option.value"
            >
              <component
                :is="resolveOptionIcon(option.iconKey)"
                class="h-5 w-5 shrink-0 text-current opacity-80"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-current">
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300"
        >
          Este check-out le ayuda a Ritmo a recomendar mejores momentos y tipos de tarea
          para ti.
        </div>
      </section>

      <p
        v-if="error"
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="loading"
          @click="handleRequestClose(false)"
        >
          Ahora no
        </BaseButton>

        <div class="flex gap-3">
          <BaseButton
            v-if="currentStep > 1"
            variant="secondary"
            size="sm"
            aria-label="Volver al paso anterior"
            :disabled="loading"
            @click="currentStep -= 1"
          >
            Atrás
          </BaseButton>

          <BaseButton
            v-if="currentStep < 3"
            variant="primary"
            size="sm"
            :disabled="!isCurrentStepValid || loading"
            :aria-label="
              currentStep === 1 ? 'Continuar al paso 2' : 'Continuar al paso 3'
            "
            @click="currentStep += 1"
          >
            Continuar
          </BaseButton>

          <BaseButton
            v-else
            variant="primary"
            size="sm"
            :loading="loading"
            :disabled="!isSubmitValid || loading"
            aria-label="Enviar feedback de cierre"
            @click="handleSubmit"
          >
            Guardar feedback
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import type { Task, TaskCompletionFeedback } from '@/types/task'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { getInteractiveOptionClasses } from '@/utils/designSystem'
  import {
    AlertCircle,
    BatteryLow,
    Brain,
    Flame,
    Gauge,
    Headset,
    Moon,
    Smartphone,
    Sparkles,
    Sun,
    ThumbsDown,
    ThumbsUp,
    Wind,
    X,
    Zap,
  } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  /** Encabezado de paso: usado por regiones para aria-labelledby */
  const stepHeadingId = 'today-task-feedback-step-heading'

  interface Props {
    isOpen: boolean
    task: Task | null
    loading?: boolean
    error?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    error: null,
  })

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    submit: [feedback: TaskCompletionFeedback]
  }>()

  const currentStep = ref<1 | 2 | 3>(1)
  const energyAfter = ref<TaskCompletionFeedback['energyAfter'] | null>(null)
  const focusScore = ref<TaskCompletionFeedback['focusScore'] | null>(null)
  const progressScore = ref<TaskCompletionFeedback['progressScore'] | null>(null)
  const mentalDemand = ref<TaskCompletionFeedback['mentalDemand'] | null>(null)
  const timeFit = ref<TaskCompletionFeedback['timeFit'] | null>(null)
  const mainBlocker = ref<TaskCompletionFeedback['mainBlocker'] | null>(null)

  const energyOptions = [
    { value: 1, iconKey: 'battery-low', label: 'Muy baja' },
    { value: 2, iconKey: 'wind', label: 'Baja' },
    { value: 3, iconKey: 'gauge', label: 'Media' },
    { value: 4, iconKey: 'zap', label: 'Alta' },
    { value: 5, iconKey: 'flame', label: 'Muy alta' },
  ] as const

  const timeFitOptions = [
    { value: 'yes', iconKey: 'thumbs-up', label: 'Sí', ariaLabel: 'sí' },
    {
      value: 'mixed',
      iconKey: 'circle-help',
      label: 'Más o menos',
      ariaLabel: 'más o menos',
    },
    { value: 'no', iconKey: 'thumbs-down', label: 'No', ariaLabel: 'no' },
  ] as const

  const blockerOptions = [
    {
      value: 'fatigue',
      iconKey: 'moon',
      label: 'Cansancio',
      ariaLabel: 'cansancio',
    },
    {
      value: 'distractions',
      iconKey: 'smartphone',
      label: 'Distracciones',
      ariaLabel: 'distracciones',
    },
    {
      value: 'clarity',
      iconKey: 'circle-help',
      label: 'Falta de claridad',
      ariaLabel: 'falta de claridad',
    },
    {
      value: 'difficulty',
      iconKey: 'brain',
      label: 'Dificultad',
      ariaLabel: 'dificultad',
    },
    {
      value: 'motivation',
      iconKey: 'battery-low',
      label: 'Baja motivación',
      ariaLabel: 'baja motivación',
    },
    { value: 'environment', iconKey: 'wind', label: 'Entorno', ariaLabel: 'entorno' },
    { value: 'none', iconKey: 'sparkles', label: 'Ninguno', ariaLabel: 'ninguno' },
  ] as const

  const ratingMetrics = [
    {
      key: 'focusScore',
      label: '¿Qué tan concentrado estuviste?',
      ariaPrefix: 'Enfoque',
    },
    {
      key: 'progressScore',
      label: '¿Cuánto avanzaste de verdad?',
      ariaPrefix: 'Progreso',
    },
    {
      key: 'mentalDemand',
      label: '¿Qué tan demandante fue?',
      ariaPrefix: 'Carga mental',
    },
  ] as const

  const ratingOptions = {
    focusScore: [
      { value: 1, iconKey: 'battery-low', label: 'Muy bajo' },
      { value: 2, iconKey: 'wind', label: 'Bajo' },
      { value: 3, iconKey: 'gauge', label: 'Medio' },
      { value: 4, iconKey: 'zap', label: 'Alto' },
      { value: 5, iconKey: 'flame', label: 'Total' },
    ],
    progressScore: [
      { value: 1, iconKey: 'battery-low', label: 'Poco' },
      { value: 2, iconKey: 'gauge', label: 'Algo' },
      { value: 3, iconKey: 'sun', label: 'Bien' },
      { value: 4, iconKey: 'zap', label: 'Mucho' },
      { value: 5, iconKey: 'sparkles', label: 'Max' },
    ],
    mentalDemand: [
      { value: 1, iconKey: 'moon', label: 'Ligera' },
      { value: 2, iconKey: 'gauge', label: 'Suave' },
      { value: 3, iconKey: 'circle-help', label: 'Media' },
      { value: 4, iconKey: 'brain', label: 'Alta' },
      { value: 5, iconKey: 'flame', label: 'Intensa' },
    ],
  } as const

  const progressPercent = computed(() => (currentStep.value / 3) * 100)

  const iconMap = {
    'battery-low': BatteryLow,
    wind: Wind,
    gauge: Gauge,
    zap: Zap,
    flame: Flame,
    'thumbs-up': ThumbsUp,
    'thumbs-down': ThumbsDown,
    'circle-help': AlertCircle,
    moon: Moon,
    smartphone: Smartphone,
    brain: Brain,
    sparkles: Sparkles,
    sun: Sun,
    headset: Headset,
  } as const

  const resolveOptionIcon = (iconKey: string) => {
    return iconMap[iconKey as keyof typeof iconMap] || AlertCircle
  }

  const stepTitle = computed(() => {
    if (currentStep.value === 1) return 'Tu energía al cerrar'
    if (currentStep.value === 2) return 'Cómo se sintió la sesión'
    return 'Último detalle y listo'
  })

  const isCurrentStepValid = computed(() => {
    if (currentStep.value === 1) {
      return Boolean(energyAfter.value && timeFit.value)
    }

    if (currentStep.value === 2) {
      return Boolean(focusScore.value && progressScore.value && mentalDemand.value)
    }

    return Boolean(mainBlocker.value)
  })

  const isSubmitValid = computed(() =>
    Boolean(
      energyAfter.value &&
        focusScore.value &&
        progressScore.value &&
        mentalDemand.value &&
        timeFit.value &&
        mainBlocker.value,
    ),
  )

  const selectCardClasses = (isSelected: boolean) =>
    [
      'flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-4 py-4 text-center transition-all duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  const ratingButtonClasses = (isSelected: boolean) =>
    [
      'flex h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-sm transition-all duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  const resetState = () => {
    currentStep.value = 1
    energyAfter.value = null
    focusScore.value = null
    progressScore.value = null
    mentalDemand.value = null
    timeFit.value = null
    mainBlocker.value = null
  }

  /** Sincroniza con BaseModal sin duplicar `close` (BaseModal ya emite update + close). */
  const handleIsOpenUpdate = (value: boolean) => {
    if (props.loading && !value) return
    emit('update:isOpen', value)
    if (!value) {
      emit('close')
    }
  }

  const handleRequestClose = (value = false) => {
    handleIsOpenUpdate(value)
  }

  const getMetricValue = (metric: (typeof ratingMetrics)[number]['key']) => {
    if (metric === 'focusScore') return focusScore.value
    if (metric === 'progressScore') return progressScore.value
    return mentalDemand.value
  }

  const getRatingOption = (
    metric: (typeof ratingMetrics)[number]['key'],
    value: 1 | 2 | 3 | 4 | 5,
  ) => {
    return (
      ratingOptions[metric].find(option => option.value === value) ??
      ratingOptions[metric][2]
    )
  }

  const setMetricValue = (
    metric: (typeof ratingMetrics)[number]['key'],
    value: 1 | 2 | 3 | 4 | 5,
  ) => {
    if (metric === 'focusScore') {
      focusScore.value = value
      return
    }

    if (metric === 'progressScore') {
      progressScore.value = value
      return
    }

    mentalDemand.value = value
  }

  const handleSubmit = () => {
    if (!isSubmitValid.value) return

    emit('submit', {
      energyAfter: energyAfter.value!,
      focusScore: focusScore.value!,
      progressScore: progressScore.value!,
      mentalDemand: mentalDemand.value!,
      timeFit: timeFit.value!,
      mainBlocker: mainBlocker.value!,
    })
  }

  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        resetState()
      }
    },
  )
</script>
