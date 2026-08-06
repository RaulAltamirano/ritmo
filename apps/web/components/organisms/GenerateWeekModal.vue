<template>
  <BaseModal
    :is-open="isOpen"
    aria-label="Generate weekly plan with AI"
    :show-close-button="false"
    :close-on-backdrop-click="false"
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
            class="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close generate week"
            @click="requestClose"
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
        v-if="uiPhase === 'chat'"
        class="space-y-4"
        :aria-labelledby="stepHeadingId"
      >
        <AiModelPicker v-model="selectedModelId" />
        <AiChatThread :messages="messages" />
        <AiChatComposer
          :disabled="generating"
          @send="sendUserMessage"
        />
        <p
          v-if="error"
          class="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {{ error }}
        </p>
      </section>

      <section
        v-else
        class="space-y-4"
        :aria-labelledby="stepHeadingId"
      >
        <WeekDraftPreview v-if="draft" :draft="draft" />
        <p
          v-else
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Nothing to apply
        </p>
      </section>

      <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
        <BaseButton
          v-if="uiPhase === 'chat'"
          variant="secondary"
          size="sm"
          aria-label="Not now"
          @click="requestClose"
        >
          Not now
        </BaseButton>
        <BaseButton
          v-else
          variant="secondary"
          size="sm"
          aria-label="Back to chat"
          @click="uiPhase = 'chat'"
        >
          Back
        </BaseButton>

        <BaseButton
          v-if="uiPhase === 'chat'"
          variant="primary"
          size="sm"
          :disabled="!readyToPreview || generating"
          :loading="generating"
          aria-label="Generate preview"
          @click="onGeneratePreview"
        >
          Generate preview
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          size="sm"
          :disabled="!canApply"
          aria-label="Apply week"
          @click="onApply"
        >
          Apply week
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { X } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'
  import AiChatComposer from '@/components/molecules/AiChatComposer.vue'
  import AiChatThread from '@/components/molecules/AiChatThread.vue'
  import AiModelPicker from '@/components/molecules/AiModelPicker.vue'
  import WeekDraftPreview from '@/components/molecules/WeekDraftPreview.vue'
  import { useGenerateWeekChat } from '@/composables/useGenerateWeekChat'
  import {
    DEFAULT_STUB_MODEL_ID,
    type WeekDraft,
  } from '@/types/generateWeek'
  import { addDays, calendarDayKey, formatWeekLabel } from '@/utils/planWeek'

  const stepHeadingId = 'generate-week-step-heading'

  const props = defineProps<{
    isOpen: boolean
    planName: string
    planId: string
    weekStart: Date
    minutesPerSession?: number
    daysPerWeek?: number
  }>()

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    apply: [draft: WeekDraft]
  }>()

  const uiPhase = ref<'chat' | 'preview'>('chat')
  const selectedModelId = ref(DEFAULT_STUB_MODEL_ID)

  const {
    messages,
    readyToPreview,
    draft,
    phase,
    error,
    sendUserMessage,
    generatePreview,
    reset,
  } = useGenerateWeekChat(() => ({
    planName: props.planName,
    weekStart: calendarDayKey(props.weekStart),
    minutesPerSession: props.minutesPerSession,
    daysPerWeek: props.daysPerWeek,
  }))

  const generating = computed(() => phase.value === 'generatingPreview')
  const currentStep = computed(() => (uiPhase.value === 'chat' ? 1 : 2))
  const progressPercent = computed(() => (currentStep.value / 2) * 100)

  const stepTitle = computed(() =>
    uiPhase.value === 'chat' ? 'Generate week' : 'Preview week',
  )

  const weekLabel = computed(() =>
    formatWeekLabel(props.weekStart, addDays(props.weekStart, 6)),
  )

  const stepSubtitle = computed(() =>
    uiPhase.value === 'chat'
      ? 'Answer a few questions so AI can draft this week.'
      : weekLabel.value,
  )

  const canApply = computed(
    () => Boolean(draft.value && draft.value.sessions.length > 0),
  )

  // Reserved for future provider context / telemetry.
  void props.planId

  watch(
    () => props.isOpen,
    open => {
      if (!open) return
      selectedModelId.value = DEFAULT_STUB_MODEL_ID
      uiPhase.value = 'chat'
      reset()
    },
  )

  function handleIsOpenUpdate(value: boolean) {
    if (!value) requestClose()
    else emit('update:isOpen', true)
  }

  function requestClose() {
    emit('update:isOpen', false)
    emit('close')
  }

  async function onGeneratePreview() {
    await generatePreview()
    if (phase.value === 'preview') uiPhase.value = 'preview'
  }

  function onApply() {
    if (!draft.value || draft.value.sessions.length === 0) return
    emit('apply', draft.value)
  }
</script>
