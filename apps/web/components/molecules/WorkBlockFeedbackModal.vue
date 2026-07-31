<template>
  <BaseModal
    :is-open="gate.showFeedback && !!gate.feedbackWorkSessionId"
    title="Reflexión del bloque"
    aria-label="Reflexión del bloque"
    :close-on-backdrop-click="false"
    :close-on-escape="!submitBusy && !abandonBusy"
    size="md"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-5">
      <p class="text-sm text-content-secondary">
        Valora el bloque en curso (1 = bajo, 5 = alto).
      </p>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">RPE cognitivo</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in intensityOptions"
            :key="`rpe-${option.value}`"
            type="button"
            :aria-label="`RPE cognitivo ${option.value} de 5, ${option.label}`"
            :class="optionButtonClasses(form.rpeCognitive === option.value)"
            @click="form.rpeCognitive = option.value"
          >
            <component
              :is="resolveOptionIcon(option.iconKey)"
              class="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span class="text-[11px] font-medium leading-tight text-current">
              {{ option.label }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">Fricción</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in intensityOptions"
            :key="`friction-${option.value}`"
            type="button"
            :aria-label="`Fricción ${option.value} de 5, ${option.label}`"
            :class="optionButtonClasses(form.frictionScore === option.value)"
            @click="form.frictionScore = option.value"
          >
            <component
              :is="resolveOptionIcon(option.iconKey)"
              class="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span class="text-[11px] font-medium leading-tight text-current">
              {{ option.label }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">Energía al terminar</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in energyOptions"
            :key="`energy-${option.value}`"
            type="button"
            :aria-label="`Energía ${option.value} de 5, ${option.label}`"
            :class="optionButtonClasses(form.energyAfter === option.value)"
            @click="form.energyAfter = option.value"
          >
            <component
              :is="resolveOptionIcon(option.iconKey)"
              class="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span class="text-[11px] font-medium leading-tight text-current">
              {{ option.label }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">Bloqueador (opcional)</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in blockerOptions"
            :key="`blocker-${option.value}`"
            type="button"
            :aria-pressed="form.mainBlocker === option.value"
            :class="chipClasses(form.mainBlocker === option.value)"
            @click="form.mainBlocker = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-content">Nota libre (opcional)</span>
        <textarea
          id="reflection-notes"
          v-model="form.notes"
          maxlength="500"
          rows="3"
          class="mt-1 w-full rounded-lg border border-outline bg-canvas px-3 py-2 text-sm"
          placeholder="Breve reflexión sobre el bloque…"
          aria-describedby="reflection-notes-count"
        />
        <span
          id="reflection-notes-count"
          class="block text-xs text-content-secondary"
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
  import { useAsyncAction } from '@/composables/useAsyncAction'
  import { abandonWorkSession, completeWorkSession } from '@/services/workSessionsApi'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { useTimerStore } from '@/stores/timer'
  import { getInteractiveOptionClasses } from '@/utils/designSystem'
  import { newIdempotencyKey } from '@/utils/idempotency'
  import { fetchErrorUserMessage } from '@/utils/parseFetchError'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import {
    Angry,
    BatteryLow,
    Frown,
    Flame,
    Gauge,
    Laugh,
    Meh,
    Smile,
    Wind,
    Zap,
  } from 'lucide-vue-next'
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

  /** Alineado con `DailyCheckinModal.energyOptions` (energía al terminar) */
  const energyOptions = [
    { value: 1, iconKey: 'battery-low', label: 'Muy baja' },
    { value: 2, iconKey: 'wind', label: 'Baja' },
    { value: 3, iconKey: 'gauge', label: 'Media' },
    { value: 4, iconKey: 'zap', label: 'Alta' },
    { value: 5, iconKey: 'flame', label: 'Muy alta' },
  ] as const

  /** Escala 1 = muy bajo → 5 = muy alto, con “caras” (iconos) para RPE y Fricción */
  const intensityOptions = [
    { value: 1, iconKey: 'smile', label: 'Muy bajo' },
    { value: 2, iconKey: 'laugh', label: 'Bajo' },
    { value: 3, iconKey: 'meh', label: 'Medio' },
    { value: 4, iconKey: 'frown', label: 'Alto' },
    { value: 5, iconKey: 'angry', label: 'Muy alto' },
  ] as const

  /** Valores de enum sin cambios respecto al `<select>` original */
  const blockerOptions = [
    { value: 'none', label: 'Ninguno' },
    { value: 'fatigue', label: 'Fatiga' },
    { value: 'distractions', label: 'Distracciones' },
    { value: 'clarity', label: 'Claridad' },
    { value: 'difficulty', label: 'Dificultad' },
    { value: 'motivation', label: 'Motivación' },
    { value: 'environment', label: 'Entorno' },
  ] as const

  const iconMap = {
    'battery-low': BatteryLow,
    wind: Wind,
    gauge: Gauge,
    zap: Zap,
    flame: Flame,
    smile: Smile,
    laugh: Laugh,
    meh: Meh,
    frown: Frown,
    angry: Angry,
  } as const

  const resolveOptionIcon = (iconKey: string) => {
    return iconMap[iconKey as keyof typeof iconMap] || Gauge
  }

  /** Rejilla 1–5: layout + tokens `interactiveOption` del design system */
  const optionButtonClasses = (isSelected: boolean) =>
    [
      'flex h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-sm duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  /** Chip compacto para el bloqueador opcional */
  const chipClasses = (isSelected: boolean) =>
    [
      'rounded-xl px-3 py-2 text-xs font-medium duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

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
