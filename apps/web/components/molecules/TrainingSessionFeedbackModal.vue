<template>
  <BaseModal
    :is-open="isOpen"
    size="lg"
    :show-close-button="false"
    :close-on-backdrop-click="false"
    :close-on-escape="true"
    aria-label="Session check"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-6">
      <div class="space-y-3 border-b border-gray-200 pb-5 dark:border-gray-800">
        <span class="sr-only">Step {{ currentStep }} of 2</span>
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <p
              class="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500"
            >
              Step {{ currentStep }} of 2
            </p>
            <h3
              :id="stepHeadingId"
              class="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {{ stepTitle }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ sessionName }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close session check"
            @click="handleSkip"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-950/40"
        >
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 motion-reduce:transition-none dark:from-primary-400 dark:to-primary-500"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>
      <section
        v-if="currentStep === 1"
        class="space-y-6"
        :aria-labelledby="stepHeadingId"
      >
        <div v-for="question in stepOneQuestions" :key="question.key" class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ question.text }}
          </p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <button
              v-for="option in question.options"
              :key="option.value"
              type="button"
              :aria-label="`${question.ariaPrefix} ${option.value} of 5`"
              :class="selectCardClasses(getAnswer(question.key) === option.value)"
              @click="setAnswer(question.key, option.value)"
            >
              <component
                :is="resolveOptionIcon(option.iconKey)"
                class="h-5 w-5 shrink-0 text-current opacity-80"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-current">{{ option.label }}</span>
            </button>
          </div>
        </div>
      </section>
      <section v-else class="space-y-6" :aria-labelledby="stepHeadingId">
        <div
          v-if="phase === 'end' && startOption && startStrength"
          class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300"
        >
          <component
            :is="resolveOptionIcon(startOption.iconKey)"
            class="h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <span>You started at {{ strengthLabel(startStrength) }}</span>
        </div>
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{
              phase === 'end'
                ? 'How much force do you have now?'
                : 'How much force do you have right now?'
            }}
          </p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <button
              v-for="option in energyScaleOptions"
              :key="option.value"
              type="button"
              :aria-label="`Force ${option.value} of 5`"
              :class="selectCardClasses(strength === option.value)"
              @click="strength = option.value"
            >
              <component
                :is="resolveOptionIcon(option.iconKey)"
                class="h-5 w-5 shrink-0 text-current opacity-80"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-current">{{ option.label }}</span>
            </button>
          </div>
        </div>
      </section>
      <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
        <BaseButton variant="secondary" size="sm" @click="handleSkip">
          Not now
        </BaseButton>
        <div class="flex gap-3">
          <BaseButton
            v-if="currentStep === 2"
            variant="secondary"
            size="sm"
            aria-label="Go back to previous step"
            @click="currentStep = 1"
          >
            Back
          </BaseButton>
          <BaseButton
            v-if="currentStep === 1"
            variant="primary"
            size="sm"
            aria-label="Continue to step 2"
            :disabled="!isCurrentStepValid()"
            @click="currentStep = 2"
          >
            Continue
          </BaseButton>
          <BaseButton
            v-else
            variant="primary"
            size="sm"
            :aria-label="saveLabel"
            :disabled="!isCurrentStepValid()"
            @click="handleSubmit"
          >
            {{ saveLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import type {
    TrainingCheckScale,
    TrainingSessionFeedbackSubmit,
  } from '@/types/training'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { getInteractiveOptionClasses } from '@/utils/designSystem'
  import { strengthLabel } from '~/utils/trainingSessionCheck'
  import {
    energyScaleOptions,
    painScaleOptions,
  } from '@/utils/trainingSessionCheckOptions'
  import {
    AlertCircle,
    BatteryLow,
    Flame,
    Gauge,
    Sparkles,
    Wind,
    X,
    Zap,
  } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  interface Props {
    isOpen: boolean
    phase: 'start' | 'end'
    sessionName: string
    startStrength?: TrainingCheckScale | null
  }

  type AnswerKey = 'first' | 'second'

  const props = withDefaults(defineProps<Props>(), { startStrength: null })
  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    skip: []
    submit: [feedback: TrainingSessionFeedbackSubmit]
  }>()

  const stepHeadingId = 'training-session-feedback-step-heading'
  const currentStep = ref<1 | 2>(1)
  const firstAnswer = ref<TrainingCheckScale | null>(null)
  const secondAnswer = ref<TrainingCheckScale | null>(null)
  const strength = ref<TrainingCheckScale | null>(null)

  const iconMap = {
    'battery-low': BatteryLow,
    wind: Wind,
    gauge: Gauge,
    zap: Zap,
    flame: Flame,
    sparkles: Sparkles,
    'alert-circle': AlertCircle,
  } as const

  const stepTitle = computed(() => {
    if (currentStep.value === 2) {
      return props.phase === 'start' ? 'How strong do you feel' : 'Your strength at wrap-up'
    }
    return props.phase === 'start' ? 'Ready to train' : 'How the session felt'
  })
  const saveLabel = computed(() =>
    props.phase === 'start' ? 'Save check-in' : 'Save wrap-up',
  )
  const progressPercent = computed(() => (currentStep.value / 2) * 100)
  const startOption = computed(() =>
    energyScaleOptions.find(option => option.value === props.startStrength),
  )
  const stepOneQuestions = computed(() =>
    props.phase === 'start'
      ? [
          {
            key: 'first' as const,
            text: 'How prepared do you feel?',
            ariaPrefix: 'Preparation',
            options: energyScaleOptions,
          },
          {
            key: 'second' as const,
            text: 'How motivated are you?',
            ariaPrefix: 'Motivation',
            options: energyScaleOptions,
          },
        ]
      : [
          {
            key: 'first' as const,
            text: 'How much fatigue do you have now?',
            ariaPrefix: 'Fatigue',
            options: energyScaleOptions,
          },
          {
            key: 'second' as const,
            text: 'How much pain do you have now?',
            ariaPrefix: 'Pain',
            options: painScaleOptions,
          },
        ],
  )

  const resolveOptionIcon = (key: string) =>
    iconMap[key as keyof typeof iconMap] || AlertCircle
  const selectCardClasses = (selected: boolean) =>
    [
      'flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-4 py-4 text-center transition-all duration-200',
      getInteractiveOptionClasses(selected),
    ].join(' ')
  const getAnswer = (key: AnswerKey) =>
    key === 'first' ? firstAnswer.value : secondAnswer.value
  const setAnswer = (key: AnswerKey, value: TrainingCheckScale) => {
    if (key === 'first') firstAnswer.value = value
    else secondAnswer.value = value
  }
  const isCurrentStepValid = () =>
    currentStep.value === 1
      ? firstAnswer.value !== null && secondAnswer.value !== null
      : strength.value !== null
  const resetState = () => {
    currentStep.value = 1
    firstAnswer.value = null
    secondAnswer.value = null
    strength.value = null
  }
  const handleSkip = () => {
    emit('skip')
    emit('update:isOpen', false)
  }
  const handleIsOpenUpdate = (value: boolean) => emit('update:isOpen', value)
  const handleSubmit = () => {
    if (!firstAnswer.value || !secondAnswer.value || !strength.value) return
    const check =
      props.phase === 'start'
        ? {
            preparation: firstAnswer.value,
            motivation: secondAnswer.value,
            strength: strength.value,
          }
        : {
            fatigue: firstAnswer.value,
            pain: secondAnswer.value,
            strength: strength.value,
          }
    emit('submit', { phase: props.phase, check } as TrainingSessionFeedbackSubmit)
  }

  watch(() => props.isOpen, isOpen => isOpen && resetState())
</script>
