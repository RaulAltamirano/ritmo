<template>
  <BaseModal
    :is-open="gate.showDailyCheckin"
    title="Daily check-in"
    aria-label="Daily check-in"
    :close-on-backdrop-click="false"
    :close-on-escape="!saving"
    size="md"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-5">
      <p class="text-sm text-content-secondary">
        Before your first timer, note your energy and stress level for today.
      </p>
      <p
        v-if="saveError"
        role="alert"
        class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ saveError }}
      </p>

      <div class="space-y-3">
        <p class="text-sm font-medium text-content">How's your energy?</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in energyOptions"
            :key="`energy-${option.value}`"
            type="button"
            :aria-label="`Energy ${option.value} of 5, ${option.label}`"
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
        <p class="text-sm font-medium text-content">How's your stress right now?</p>
        <p class="text-xs text-content-secondary">From very calm to very tense.</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
          <button
            v-for="option in stressOptions"
            :key="`stress-${option.value}`"
            type="button"
            :aria-label="`Stress ${option.value} of 5, ${option.label}`"
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
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="saving"
          :disabled="saving"
          @click="onSave"
        >
          Save
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

  /** Aligned with `TodayTaskFeedbackModal` (energy on close) */
  const energyOptions = [
    { value: 1, iconKey: 'battery-low', label: 'Very low' },
    { value: 2, iconKey: 'wind', label: 'Low' },
    { value: 3, iconKey: 'gauge', label: 'Medium' },
    { value: 4, iconKey: 'zap', label: 'High' },
    { value: 5, iconKey: 'flame', label: 'Very high' },
  ] as const

  /** Scale 1 = low stress → 5 = high, with face icons */
  const stressOptions = [
    { value: 1, iconKey: 'smile', label: 'Very low' },
    { value: 2, iconKey: 'laugh', label: 'Low' },
    { value: 3, iconKey: 'meh', label: 'Medium' },
    { value: 4, iconKey: 'frown', label: 'High' },
    { value: 5, iconKey: 'angry', label: 'Very high' },
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

  /** 1–5 grid: layout + `semanticColors.interactiveOption` from design system tokens */
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
          return fetchErrorUserMessage(e, 'Could not save check-in.')
        },
      },
    )
  }
</script>
