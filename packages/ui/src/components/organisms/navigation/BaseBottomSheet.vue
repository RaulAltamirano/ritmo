<script setup lang="ts">
  import { useEventListener } from '@vueuse/core'
  import { X } from 'lucide-vue-next'
  import { nextTick, onUnmounted, ref, toValue, watch } from 'vue'
  import { useFocusTrap } from '../../../composables/useFocusTrap'
  import { useId } from '../../../composables/useId'

  interface BaseBottomSheetProps {
    open: boolean
    title?: string
    id?: string
    closeOnEscape?: boolean
    closeOnBackdrop?: boolean
    closeLabel?: string
  }

  const props = withDefaults(defineProps<BaseBottomSheetProps>(), {
    open: false,
    title: 'More',
    id: undefined,
    closeOnEscape: true,
    closeOnBackdrop: true,
    closeLabel: 'Close',
  })

  const emit = defineEmits<{
    'update:open': [value: boolean]
    close: []
  }>()

  const panelRef = ref<HTMLElement>()
  const titleId = useId('bottom-sheet-title', { title: props.title })

  const {
    activate: activateFocusTrap,
    deactivate: deactivateFocusTrap,
    containerRef: focusTrapContainerRef,
  } = useFocusTrap({
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    returnFocusOnDeactivate: true,
    preventScroll: false,
  })

  watch(panelRef, el => {
    if (el) focusTrapContainerRef.value = el
  })

  function setBodyScrollLocked(locked: boolean) {
    if (typeof document === 'undefined') return
    document.body.style.overflow = locked ? 'hidden' : ''
  }

  function handleClose() {
    emit('update:open', false)
    emit('close')
  }

  function onBackdropClick() {
    if (props.closeOnBackdrop) handleClose()
  }

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (props.open && props.closeOnEscape && event.key === 'Escape') {
      event.preventDefault()
      handleClose()
    }
  })

  watch(
    () => props.open,
    async isOpen => {
      if (isOpen) {
        await nextTick()
        if (panelRef.value) activateFocusTrap(panelRef.value)
        setBodyScrollLocked(true)
      } else {
        deactivateFocusTrap()
        setBodyScrollLocked(false)
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    deactivateFocusTrap()
    setBodyScrollLocked(false)
  })
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[10000] flex flex-col justify-end"
  >
    <div
      data-testid="bottom-sheet-backdrop"
      class="absolute inset-0 bg-secondary-950/40 transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-black/55"
      aria-hidden="true"
      @click="onBackdropClick"
    />

    <div
      :id="id"
      ref="panelRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="toValue(titleId)"
      class="ritmo-sheet relative z-10 mx-auto w-full max-w-lg max-h-[70vh] rounded-t-3xl border border-outline/50 bg-surface shadow-[0_-8px_40px_-12px_rgb(0_0_0/0.25)] pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-secondary-900"
      @click.stop
    >
      <div class="flex justify-center pt-3 pb-1" aria-hidden="true">
        <span class="h-1 w-10 rounded-full bg-secondary-300/80 dark:bg-secondary-600" />
      </div>

      <header class="flex items-center justify-between gap-3 px-5 pb-2 pt-1">
        <h2
          :id="toValue(titleId)"
          class="text-[15px] font-semibold tracking-tight text-secondary-900 dark:text-secondary-50"
        >
          {{ title }}
        </h2>
        <button
          type="button"
          class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-secondary-500 transition-colors duration-200 hover:bg-secondary-100 hover:text-secondary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-secondary-400 dark:hover:bg-white/10 dark:hover:text-secondary-100"
          :aria-label="closeLabel"
          @click="handleClose"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div class="overflow-y-auto px-3 pb-4 pt-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .ritmo-sheet {
    animation: ritmo-sheet-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes ritmo-sheet-in {
    from {
      opacity: 0.85;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ritmo-sheet {
      animation: none;
    }
  }
</style>
