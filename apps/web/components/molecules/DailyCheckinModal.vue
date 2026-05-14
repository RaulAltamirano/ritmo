<template>
  <BaseModal
    :is-open="gate.showDailyCheckin"
    title="Check-in del día"
    aria-label="Check-in del día"
    :close-on-backdrop-click="false"
    :close-on-escape="!saving"
    size="md"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-5">
      <p class="text-sm text-content-secondary">
        Antes del primer timer, indica con qué energía y nivel de estrés empezarás hoy.
      </p>
      <p
        v-if="saveError"
        role="alert"
        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ saveError }}
      </p>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">¿Cómo llegas de energía?</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in energyOptions"
            :key="`energy-${option.value}`"
            type="button"
            :aria-label="`Energía ${option.value} de 5, ${option.label}`"
            :class="optionButtonClasses(energy === option.value)"
            @click="energy = option.value"
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
        <p class="text-sm font-medium text-content">¿Cómo va tu estrés ahora?</p>
        <p class="text-xs text-content-secondary">De muy tranquilo a muy tenso.</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in stressOptions"
            :key="`stress-${option.value}`"
            type="button"
            :aria-label="`Estrés ${option.value} de 5, ${option.label}`"
            :class="optionButtonClasses(stress === option.value)"
            @click="stress = option.value"
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
    </div>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <BaseButton variant="ghost" size="sm" :disabled="saving" @click="onCancel">
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="saving"
          :disabled="saving"
          @click="onSave"
        >
          Guardar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { useAsyncAction } from '@/composables/useAsyncAction'
  import { runPendingWorkSessionStartIfAny } from '@/composables/usePendingWorkSessionStart'
  import { putDailyCheckin } from '@/services/checkinsApi'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { fetchErrorUserMessage } from '@/utils/parseFetchError'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { getInteractiveOptionClasses } from '@/utils/designSystem'
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
  import { ref, watch } from 'vue'

  const gate = useSessionGateStore()
  const { busy: saving, error: saveError, run } = useAsyncAction()

  const energy = ref(3)
  const stress = ref(3)

  /** Alineado con `TodayTaskFeedbackModal` (energía al cerrar) */
  const energyOptions = [
    { value: 1, iconKey: 'battery-low', label: 'Muy baja' },
    { value: 2, iconKey: 'wind', label: 'Baja' },
    { value: 3, iconKey: 'gauge', label: 'Media' },
    { value: 4, iconKey: 'zap', label: 'Alta' },
    { value: 5, iconKey: 'flame', label: 'Muy alta' },
  ] as const

  /** Escala 1 = bajo estrés → 5 = alto, con “caras” (iconos) */
  const stressOptions = [
    { value: 1, iconKey: 'smile', label: 'Muy bajo' },
    { value: 2, iconKey: 'laugh', label: 'Bajo' },
    { value: 3, iconKey: 'meh', label: 'Medio' },
    { value: 4, iconKey: 'frown', label: 'Alto' },
    { value: 5, iconKey: 'angry', label: 'Muy alto' },
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

  /** Rejilla 1–5: layout + `semanticColors.interactiveOption` del design system (tokens) */
  const optionButtonClasses = (isSelected: boolean) =>
    [
      'flex h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-sm duration-200',
      getInteractiveOptionClasses(isSelected),
    ].join(' ')

  watch(
    () => gate.showDailyCheckin,
    open => {
      if (open) {
        energy.value = 3
        stress.value = 3
        saveError.value = null
      }
    },
  )

  function onCancel() {
    gate.closeDailyCheckin()
  }

  function handleIsOpenUpdate(value: boolean) {
    if (saving.value && !value) return
    if (!value) onCancel()
  }

  async function onSave() {
    await run(
      async () => {
        await putDailyCheckin({ energy: energy.value, stress: stress.value })
        gate.closeDailyCheckin()
        await runPendingWorkSessionStartIfAny('afterDailyCheckin')
      },
      {
        mapError: e => {
          if (e instanceof Error && e.message === 'CHECKIN_REQUIRED') return null
          return fetchErrorUserMessage(e, 'No se pudo completar el guardado.')
        },
      },
    )
  }
</script>
