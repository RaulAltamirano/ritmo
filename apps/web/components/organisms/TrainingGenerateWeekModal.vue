<template>
  <BaseModal
    :is-open="isOpen"
    aria-label="Generate training week with AI"
    :show-close-button="false"
    :close-on-backdrop-click="false"
    size="lg"
    @update:is-open="handleOpenUpdate"
  >
    <div class="space-y-6">
      <header class="space-y-3 border-b border-outline pb-5">
        <span class="sr-only">Step {{ currentStep }} of 2</span>
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <p
              class="text-xs font-medium uppercase tracking-[0.18em] text-content-muted"
            >
              Step {{ currentStep }} of 2
            </p>
            <h3 class="text-lg font-semibold text-content">
              {{
                uiPhase === 'chat' ? 'Generate training week' : 'Preview training week'
              }}
            </h3>
            <p class="text-sm text-content-secondary">
              {{
                uiPhase === 'chat'
                  ? 'Tell Ritmo about your experience, schedule, equipment, and goals.'
                  : weekLabel
              }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-content-muted hover:bg-surface-raised hover:text-content"
            aria-label="Close generate training week"
            @click="requestClose"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-950/40"
          role="progressbar"
          :aria-valuenow="currentStep * 50"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="h-full rounded-full bg-primary-500 transition-all"
            :style="{ width: `${currentStep * 50}%` }"
          />
        </div>
      </header>

      <section v-if="uiPhase === 'chat'" class="space-y-3">
        <div class="overflow-hidden rounded-2xl border border-outline bg-canvas/60">
          <div
            class="flex items-center justify-between gap-2 border-b border-outline px-3 py-2.5"
          >
            <span
              class="rounded-full border border-outline bg-surface-raised px-2.5 py-1 text-xs text-content-secondary"
            >
              gpt-4o-mini
            </span>
            <span
              v-if="readyToGenerate"
              class="rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 dark:bg-success-950/50 dark:text-success-300"
            >
              Ready to generate
            </span>
            <span v-else class="text-xs text-content-muted"
              >A few short answers are enough</span
            >
          </div>
          <div class="px-3 py-3">
            <AiChatThread :messages="messages" />
          </div>
          <div class="border-t border-outline bg-surface px-3 py-3">
            <AiChatComposer :disabled="loading" @send="sendMessage" />
          </div>
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400" role="alert">
          {{ error }}
        </p>
      </section>

      <section v-else class="max-h-[55vh] overflow-y-auto">
        <TrainingWeekDraftPreview v-if="draft" :draft="draft" />
      </section>

      <footer
        class="flex items-center justify-between gap-3 border-t border-outline pt-5"
      >
        <BaseButton variant="secondary" size="sm" @click="onSecondaryAction">
          {{ uiPhase === 'chat' ? 'Not now' : 'Back' }}
        </BaseButton>
        <BaseButton
          v-if="uiPhase === 'chat'"
          variant="primary"
          size="sm"
          :disabled="!readyToGenerate || loading"
          :loading="generating"
          aria-label="Generate preview"
          @click="generatePreview"
        >
          Generate preview
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          size="sm"
          :disabled="!draft || loading"
          :loading="applying"
          aria-label="Apply week"
          @click="applyDraft"
        >
          Apply week
        </BaseButton>
      </footer>
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
  import TrainingWeekDraftPreview from '@/components/molecules/TrainingWeekDraftPreview.vue'
  import { useTrainingStore } from '@/stores/training'
  import type { AiChatMessage } from '@/types/generateWeek'
  import type { WeeklyPlan } from '@/types/training'
  import type { TrainingChatMessage } from '@/composables/useTrainingApi'
  import { calendarDayKey, formatWeekLabel, addDays } from '@/utils/planWeek'

  const props = defineProps<{
    isOpen: boolean
    weekStart: Date
  }>()

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    applied: []
  }>()

  const store = useTrainingStore()
  const uiPhase = ref<'chat' | 'preview'>('chat')
  const messages = ref<AiChatMessage[]>([])
  const readyToGenerate = ref(false)
  const generating = ref(false)
  const applying = ref(false)
  const previewGenerated = ref(false)
  const previousWeek = ref<WeeklyPlan | null>(null)
  const draft = computed(() => store.week)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const currentStep = computed(() => (uiPhase.value === 'chat' ? 1 : 2))
  const weekLabel = computed(() =>
    formatWeekLabel(props.weekStart, addDays(props.weekStart, 6)),
  )

  watch(
    () => props.isOpen,
    open => {
      if (!open) return
      uiPhase.value = 'chat'
      messages.value = []
      readyToGenerate.value = false
      previewGenerated.value = false
      previousWeek.value = store.week
    },
  )

  async function sendMessage(content: string) {
    messages.value.push(message('user', content))
    const result = await store.sendChat(apiMessages())
    messages.value.push(message('assistant', result.assistantMessage))
    readyToGenerate.value = result.readyToGenerate && !result.stop
  }

  async function generatePreview() {
    if (!readyToGenerate.value) return
    generating.value = true
    try {
      await store.generateWeek(calendarDayKey(props.weekStart))
      previewGenerated.value = true
      uiPhase.value = 'preview'
    } finally {
      generating.value = false
    }
  }

  async function applyDraft() {
    if (!draft.value) return
    applying.value = true
    try {
      await store.applyWeek(draft.value.id)
      previewGenerated.value = false
      emit('applied')
      emit('update:isOpen', false)
    } finally {
      applying.value = false
    }
  }

  function apiMessages(): TrainingChatMessage[] {
    return messages.value.map(({ role, content }) => ({
      role: role === 'system' ? 'assistant' : role,
      content,
    }))
  }

  function message(role: 'user' | 'assistant', content: string): AiChatMessage {
    return {
      id: `${role}-${Date.now()}-${messages.value.length}`,
      role,
      content,
      createdAt: new Date().toISOString(),
    }
  }

  function onSecondaryAction() {
    if (uiPhase.value === 'preview') uiPhase.value = 'chat'
    else requestClose()
  }

  function handleOpenUpdate(value: boolean) {
    if (value) emit('update:isOpen', true)
    else requestClose()
  }

  function requestClose() {
    if (previewGenerated.value) store.week = previousWeek.value
    emit('update:isOpen', false)
    emit('close')
  }
</script>
