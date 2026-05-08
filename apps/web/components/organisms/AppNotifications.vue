<template>
  <ClientOnly>
    <!-- Toast notifications -->
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-[10000] flex flex-col items-center gap-2 p-4 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="notify">
        <div
          v-for="msg in state.messages"
          :key="msg.id"
          class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg"
          :class="toneClasses(msg.type)"
          role="status"
        >
          <div class="flex items-start gap-3 p-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold">{{ msg.title }}</p>
              <p v-if="msg.message" class="mt-1 text-sm opacity-90">
                {{ msg.message }}
              </p>
            </div>
            <button
              type="button"
              class="ml-2 shrink-0 rounded p-1 text-current opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
              aria-label="Cerrar notificación"
              @click="dismiss(msg.id)"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Confirmation dialog -->
    <Transition name="notify-confirm">
      <div
        v-if="state.confirm"
        class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="resolveConfirm(false)"
        @keydown.esc="resolveConfirm(false)"
      >
        <div
          class="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ state.confirm.title }}
          </h3>
          <p
            v-if="state.confirm.message"
            class="mt-2 text-sm text-gray-600 dark:text-gray-300"
          >
            {{ state.confirm.message }}
          </p>
          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-200 dark:hover:bg-gray-700"
              @click="resolveConfirm(false)"
            >
              {{ state.confirm.cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              @click="resolveConfirm(true)"
            >
              {{ state.confirm.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { useNotify, type NotifyType } from '@/composables/shared/useNotify'

  const { state, dismiss, resolveConfirm } = useNotify()

  const toneClasses = (type: NotifyType): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200'
      default:
        return 'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
    }
  }
</script>

<style scoped>
  .notify-enter-active,
  .notify-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .notify-enter-from,
  .notify-leave-to {
    transform: translateY(-8px);
    opacity: 0;
  }

  .notify-confirm-enter-active,
  .notify-confirm-leave-active {
    transition: opacity 0.2s ease;
  }
  .notify-confirm-enter-from,
  .notify-confirm-leave-to {
    opacity: 0;
  }
</style>
