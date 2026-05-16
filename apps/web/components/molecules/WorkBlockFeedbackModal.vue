<template>
  <BaseModal
    :is-open="gate.showFeedback && !!gate.feedbackWorkSessionId"
    title="Reflexión del bloque"
    aria-label="Reflexión del bloque"
    :close-on-backdrop-click="false"
    :close-on-escape="!submitBusy && !abandonBusy"
    size="sm"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-3 text-sm">
      <p class="text-content-secondary">
        Valora el bloque en curso (1 = bajo, 5 = alto).
      </p>
      <ScaleInput v-model="form.rpeCognitive" label="RPE cognitivo" id="rpe" />
      <ScaleInput v-model="form.frictionScore" label="Fricción" id="friction" />
      <ScaleInput v-model="form.energyAfter" label="Energía al terminar" id="energy" />
      <label class="block">
        <span class="font-medium text-content">Bloqueador (opcional)</span>
        <select
          v-model="form.mainBlocker"
          class="mt-1 w-full rounded border border-outline bg-canvas px-2 py-1.5"
        >
          <option value="none">Ninguno</option>
          <option value="fatigue">Fatiga</option>
          <option value="distractions">Distracciones</option>
          <option value="clarity">Claridad</option>
          <option value="difficulty">Dificultad</option>
          <option value="motivation">Motivación</option>
          <option value="environment">Entorno</option>
        </select>
      </label>
      <label class="block">
        <span class="font-medium text-content">Nota libre (opcional)</span>
        <textarea
          id="reflection-notes"
          v-model="form.notes"
          maxlength="500"
          rows="3"
          class="mt-1 w-full rounded border border-outline bg-canvas px-2 py-1.5"
          placeholder="Breve reflexión sobre el bloque…"
          aria-describedby="reflection-notes-count"
        />
        <span
          id="reflection-notes-count"
          class="mt-0.5 block text-xs text-content-secondary"
        >
          {{ form.notes.length }}/500
        </span>
      </label>
      <p
        v-if="submitErr"
        role="alert"
        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ submitErr }}
      </p>
      <p
        v-if="abandonErr"
        role="alert"
        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ abandonErr }}
      </p>
    </div>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="submitBusy || abandonBusy"
          aria-label="Abandonar bloque sin enviar reflexión"
          @click="onSkip"
        >
          Abandonar
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="submitBusy"
          :disabled="submitBusy || abandonBusy"
          @click="onSubmit"
        >
          Enviar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import ScaleInput from '@/components/atoms/ScaleInput.vue'
  import { useAsyncAction } from '@/composables/useAsyncAction'
  import { abandonWorkSession, completeWorkSession } from '@/services/workSessionsApi'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { useTimerStore } from '@/stores/timer'
  import { newIdempotencyKey } from '@/utils/idempotency'
  import { fetchErrorUserMessage } from '@/utils/parseFetchError'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { reactive, watch } from 'vue'

  const gate = useSessionGateStore()
  const timerStore = useTimerStore()
  const { busy: submitBusy, error: submitErr, run: runSubmit } = useAsyncAction()
  const { busy: abandonBusy, error: abandonErr, run: runAbandon } = useAsyncAction()

  const form = reactive({
    rpeCognitive: 3,
    frictionScore: 3,
    energyAfter: 3,
    mainBlocker: 'none',
    notes: '',
  })

  function resetForm() {
    form.rpeCognitive = 3
    form.frictionScore = 3
    form.energyAfter = 3
    form.mainBlocker = 'none'
    form.notes = ''
  }

  watch(
    () => gate.showFeedback,
    open => {
      if (open) {
        resetForm()
        submitErr.value = null
        abandonErr.value = null
      }
    },
  )

  function handleIsOpenUpdate(value: boolean) {
    if (submitBusy.value && !value) return
    if (abandonBusy.value && !value) return
  }

  async function onSubmit() {
    const id = gate.feedbackWorkSessionId
    if (!id) return
    const trimmed = form.notes.trim()
    await runSubmit(
      async () => {
        await completeWorkSession(
          id,
          { 'Idempotency-Key': newIdempotencyKey() },
          {
            rpeCognitive: form.rpeCognitive,
            frictionScore: form.frictionScore,
            frictionBlocker: form.mainBlocker === 'none' ? undefined : form.mainBlocker,
            energyAfter: form.energyAfter,
            ...(trimmed.length > 0 ? { notes: trimmed } : {}),
          },
        )
        timerStore.closeTimer()
        gate.closeFeedback()
      },
      {
        mapError: e => fetchErrorUserMessage(e, 'No se pudo enviar la reflexión.'),
      },
    )
  }

  async function onSkip() {
    const id = gate.feedbackWorkSessionId
    if (!id) return
    await runAbandon(
      async () => {
        await abandonWorkSession(id)
        timerStore.closeTimer()
        gate.closeFeedback()
      },
      {
        mapError: e =>
          fetchErrorUserMessage(
            e,
            'No se pudo abandonar. Reintenta o revisa la conexión.',
          ),
      },
    )
  }
</script>
