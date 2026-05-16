<template>
  <BaseModal
    :is-open="!!gate.conflict"
    aria-label="Bloque activo sin cerrar"
    :show-close-button="false"
    :close-on-backdrop-click="false"
    :close-on-escape="!busy"
    size="sm"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-6">
      <div class="space-y-3 border-b border-gray-200 pb-5 dark:border-gray-800">
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40"
          >
            <AlertTriangle
              class="h-5 w-5 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1">
            <p
              class="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500"
            >
              Conflicto
            </p>
            <h3
              :id="headingId"
              class="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Bloque activo sin cerrar
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tienes un bloque
              <span class="font-medium text-gray-900 dark:text-white">{{
                stateLabel
              }}</span
              >. Resuélvelo antes de iniciar otro.
            </p>
          </div>
        </div>
      </div>

      <section class="space-y-3" :aria-labelledby="headingId">
        <BaseButton
          variant="primary"
          size="sm"
          full-width
          :disabled="busy"
          aria-label="Completar reflexión del bloque anterior"
          @click="completeBlock"
        >
          Completar reflexión del bloque anterior
        </BaseButton>
        <BaseButton
          variant="outline"
          size="sm"
          full-width
          :loading="busy"
          :disabled="busy"
          aria-label="Abandonar bloque y empezar uno nuevo"
          @click="abandonAndStart"
        >
          Abandonar y empezar nuevo
        </BaseButton>
      </section>

      <p
        v-if="error"
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
        <BaseButton variant="ghost" size="sm" :disabled="busy" @click="cancel">
          Cancelar
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { useAsyncAction } from '@/composables/useAsyncAction'
  import { runPendingWorkSessionStartIfAny } from '@/composables/usePendingWorkSessionStart'
  import { abandonWorkSession } from '@/services/workSessionsApi'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { fetchErrorUserMessage } from '@/utils/parseFetchError'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { AlertTriangle } from 'lucide-vue-next'
  import { computed } from 'vue'

  const headingId = 'active-session-conflict-heading'

  const gate = useSessionGateStore()
  const { busy, error, run } = useAsyncAction()

  const stateLabel = computed(() => {
    const s = gate.conflict?.state
    if (s === 'running') return 'en marcha'
    if (s === 'paused') return 'pausado'
    if (s === 'pending_feedback') return 'pendiente de reflexión'
    return 'activo'
  })

  function handleIsOpenUpdate(value: boolean) {
    if (busy.value && !value) return
    if (!value) cancel()
  }

  async function completeBlock() {
    if (!gate.conflict) return
    const id = gate.conflict.activeSessionId
    gate.closeConflict()
    gate.openFeedback(id)
  }

  async function abandonAndStart() {
    if (!gate.conflict) return
    await run(
      async () => {
        await abandonWorkSession(gate.conflict!.activeSessionId)
        gate.closeConflict()
        await runPendingWorkSessionStartIfAny('afterConflictAbandon')
      },
      {
        mapError: e => {
          if (e instanceof Error && e.message === 'CHECKIN_REQUIRED') return null
          return fetchErrorUserMessage(e, 'No pudimos abandonar el bloque. Reintenta.')
        },
      },
    )
  }

  function cancel() {
    gate.clearPendingStart()
    gate.closeConflict()
  }
</script>
