<template>
  <BaseModal
    :is-open="!!gate.taskSwitchPrompt"
    :title="title"
    aria-label="Cambiar de tarea"
    size="sm"
    :close-on-backdrop-click="true"
    :close-on-escape="!busy"
    @update:is-open="onIsOpenUpdate"
  >
    <div v-if="prompt" class="space-y-4">
      <p class="text-sm text-content-secondary">
        Quedan {{ formatRemaining(prompt.remainingSec) }} en «{{ prompt.fromTaskName }}».
        El preset de «{{ prompt.toTask.name }}» es {{ prompt.mode.minutes }} min.
      </p>
      <p v-if="!prompt.canContinueRemaining" class="text-sm text-content-secondary">
        El tiempo restante no cabe en el bloque de esta tarea.
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <BaseButton variant="ghost" :disabled="busy" @click="cancel"> Cancelar </BaseButton>
        <BaseButton
          v-if="prompt?.canContinueRemaining"
          variant="secondary"
          :disabled="busy"
          @click="choose('remaining')"
        >
          Continuar restante
        </BaseButton>
        <BaseButton
          variant="primary"
          :disabled="busy || !prompt"
          @click="choose('full_preset')"
        >
          Arrancar {{ prompt?.mode.minutes }} min
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { applyRemoteTaskSwitch } from '@/composables/timer/applyRemoteTaskSwitch'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { computed, ref } from 'vue'

  type DurationPolicy = 'remaining' | 'full_preset'

  const gate = useSessionGateStore()
  const busy = ref(false)
  const prompt = computed(() => gate.taskSwitchPrompt)
  const title = computed(() =>
    prompt.value ? `Cambiar a «${prompt.value.toTask.name}»` : 'Cambiar de tarea',
  )

  function formatRemaining(seconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(seconds))
    const minutes = Math.floor(safeSeconds / 60)
    const remainder = safeSeconds % 60
    return `${minutes}:${String(remainder).padStart(2, '0')}`
  }

  function cancel() {
    if (busy.value) return
    gate.closeTaskSwitchPrompt()
  }

  function onIsOpenUpdate(isOpen: boolean) {
    if (!isOpen) cancel()
  }

  async function choose(durationPolicy: DurationPolicy) {
    const currentPrompt = prompt.value
    if (!currentPrompt || busy.value) return

    busy.value = true
    try {
      await applyRemoteTaskSwitch({
        toTask: currentPrompt.toTask,
        mode: currentPrompt.mode,
        durationPolicy,
      })
    } finally {
      busy.value = false
      gate.closeTaskSwitchPrompt()
    }
  }
</script>
