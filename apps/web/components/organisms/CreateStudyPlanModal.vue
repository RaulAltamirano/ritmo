<template>
  <BaseModal
    :is-open="isOpen"
    aria-label="Create study plan outline"
    :show-close-button="false"
    :close-on-backdrop-click="false"
    :close-on-escape="!loading"
    size="lg"
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
              {{ stepSubtitle }}
            </p>
          </div>

          <button
            type="button"
            class="p-2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-300"
            aria-label="Close study plan intake"
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
        class="space-y-5"
        :aria-labelledby="stepHeadingId"
      >
        <label class="block space-y-2" for="study-plan-goal">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            What skill or knowledge are you building?
          </span>
          <input
            id="study-plan-goal"
            v-model="goal"
            type="text"
            maxlength="80"
            required
            class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="e.g. English B2, Conversational Japanese…"
            aria-describedby="study-plan-goal-hint"
          />
        </label>
        <p id="study-plan-goal-hint" class="text-sm text-gray-500 dark:text-gray-400">
          This becomes your plan name. Learning type is inferred from the goal later.
        </p>

        <label class="block space-y-2" for="study-plan-description">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            Description
          </span>
          <textarea
            id="study-plan-description"
            v-model="description"
            rows="3"
            maxlength="500"
            class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="What you want to achieve and by when (optional)…"
          />
        </label>

        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Plan color</p>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              type="button"
              :aria-label="`Plan color: ${option.value}`"
              :aria-pressed="color === option.value"
              class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all duration-200"
              :class="[
                option.class,
                color === option.value
                  ? 'scale-110 border-gray-900 dark:border-white'
                  : 'border-outline-strong hover:scale-105',
              ]"
              @click="color = option.value"
            >
              <Check
                v-if="color === option.value"
                :size="16"
                class="text-white"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      <section v-else class="space-y-6" :aria-labelledby="stepHeadingId">
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Days per week</p>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
            <button
              v-for="day in daysOptions"
              :key="day"
              type="button"
              :aria-pressed="daysPerWeek === day"
              :aria-label="`Days per week: ${day}`"
              :class="ratingButtonClasses(daysPerWeek === day)"
              @click="daysPerWeek = day"
            >
              <span class="text-sm font-semibold text-current">{{ day }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            Minutes per session
          </p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              v-for="minutes in minutePresets"
              :key="minutes"
              type="button"
              :aria-pressed="minutesPerSession === minutes"
              :aria-label="`Session length: ${minutes} minutes`"
              :class="selectCardClasses(minutesPerSession === minutes)"
              @click="minutesPerSession = minutes"
            >
              <span class="text-sm font-medium text-current">{{ minutes }} min</span>
            </button>
          </div>
          <label class="block space-y-1" for="study-plan-custom-minutes">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Or custom (15–180)
            </span>
            <input
              id="study-plan-custom-minutes"
              v-model.number="customMinutes"
              type="number"
              min="15"
              max="180"
              class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-[12rem]"
              @change="applyCustomMinutes"
            />
          </label>
        </div>

        <label class="block space-y-2" for="study-plan-target-date">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            Target date (optional)
          </span>
          <input
            id="study-plan-target-date"
            v-model="targetDate"
            type="date"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-xs"
          />
        </label>
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
          Not now
        </BaseButton>

        <div class="flex gap-3">
          <BaseButton
            v-if="currentStep > 1"
            variant="secondary"
            size="sm"
            aria-label="Back to previous step"
            :disabled="loading"
            @click="currentStep -= 1"
          >
            Back
          </BaseButton>

          <BaseButton
            v-if="currentStep < 2"
            variant="primary"
            size="sm"
            :disabled="!isCurrentStepValid || loading"
            aria-label="Continue to step 2"
            @click="currentStep += 1"
          >
            Continue
          </BaseButton>

          <BaseButton
            v-else
            variant="primary"
            size="sm"
            :loading="loading"
            :disabled="!isSubmitValid || loading"
            aria-label="Create outline"
            @click="handleSubmit"
          >
            Create outline
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import type { StudyPlanIntake } from '@/types/studyPlan'
  import {
    STUDY_DAYS_PER_WEEK_OPTIONS,
    STUDY_PLAN_COLOR_OPTIONS,
    STUDY_SESSION_MINUTE_PRESETS,
  } from '@/types/studyPlan'
  import { getInteractiveOptionClasses } from '@/utils/designSystem'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { Check, X } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  const stepHeadingId = 'create-study-plan-step-heading'

  interface Props {
    isOpen: boolean
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
    submit: [intake: StudyPlanIntake]
  }>()

  const currentStep = ref<1 | 2>(1)
  const goal = ref('')
  const description = ref('')
  const color = ref('blue')
  const daysPerWeek = ref<number | null>(null)
  const minutesPerSession = ref<number | null>(null)
  const customMinutes = ref<number | null>(null)
  const targetDate = ref('')

  const colorOptions = STUDY_PLAN_COLOR_OPTIONS
  const daysOptions = STUDY_DAYS_PER_WEEK_OPTIONS
  const minutePresets = STUDY_SESSION_MINUTE_PRESETS

  const progressPercent = computed(() => (currentStep.value / 2) * 100)

  const stepTitle = computed(() =>
    currentStep.value === 1 ? 'Goal & look' : 'Your study rhythm',
  )

  const stepSubtitle = computed(() =>
    currentStep.value === 1
      ? 'Name your plan and pick a color.'
      : 'How often and how long you can study each week.',
  )

  const isCurrentStepValid = computed(() => {
    if (currentStep.value === 1) return goal.value.trim().length > 0
    return Boolean(daysPerWeek.value && minutesPerSession.value)
  })

  const isSubmitValid = computed(
    () =>
      goal.value.trim().length > 0 &&
      daysPerWeek.value !== null &&
      minutesPerSession.value !== null,
  )

  const selectCardClasses = (isSelected: boolean) =>
    [
      'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl px-4 py-4 text-center transition-all duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  const ratingButtonClasses = (isSelected: boolean) =>
    [
      'flex h-12 items-center justify-center rounded-xl text-sm transition-all duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  const applyCustomMinutes = () => {
    const value = customMinutes.value
    if (typeof value !== 'number' || Number.isNaN(value)) return
    const clamped = Math.min(180, Math.max(15, Math.round(value)))
    customMinutes.value = clamped
    minutesPerSession.value = clamped
  }

  const resetState = () => {
    currentStep.value = 1
    goal.value = ''
    description.value = ''
    color.value = 'blue'
    daysPerWeek.value = null
    minutesPerSession.value = null
    customMinutes.value = null
    targetDate.value = ''
  }

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

  const handleSubmit = () => {
    if (
      !isSubmitValid.value ||
      daysPerWeek.value === null ||
      minutesPerSession.value === null
    ) {
      return
    }

    const trimmedDate = targetDate.value.trim()
    emit('submit', {
      goal: goal.value.trim(),
      description: description.value.trim(),
      color: color.value,
      daysPerWeek: daysPerWeek.value,
      minutesPerSession: minutesPerSession.value,
      targetDate: trimmedDate.length > 0 ? trimmedDate : null,
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
