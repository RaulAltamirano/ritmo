<template>
  <div
    v-if="recovery.showServerAbandonedBanner"
    role="status"
    class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/50 dark:text-amber-100"
  >
    <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
      <p class="min-w-0 flex-1">
        Tu bloque anterior fue abandonado automáticamente por inactividad (sin señal en
        el servidor). Puedes iniciar un bloque nuevo cuando quieras.
      </p>
      <button
        type="button"
        class="shrink-0 rounded-md border border-amber-300 bg-canvas px-3 py-1.5 font-medium text-content hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
        @click="onDismiss"
      >
        Entendido
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useWorkSessionRecoveryStore } from '@/stores/workSessionRecovery'
  import { clearLastTrackedWorkSessionId } from '@/utils/lastTrackedWorkSession'

  const recovery = useWorkSessionRecoveryStore()

  function onDismiss() {
    recovery.dismissServerAbandonedBanner()
    clearLastTrackedWorkSessionId()
  }
</script>
