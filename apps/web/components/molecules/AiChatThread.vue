<template>
  <div
    ref="scroller"
    class="gw-chat-thread max-h-[min(22rem,45vh)] space-y-4 overflow-y-auto overscroll-contain px-1 py-1"
    role="log"
    aria-live="polite"
    aria-relevant="additions"
    tabindex="0"
  >
    <div
      v-for="message in visibleMessages"
      :key="message.id"
      class="gw-msg flex gap-2.5"
      :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
    >
      <div
        v-if="message.role === 'assistant'"
        class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-600 dark:bg-primary-400/15 dark:text-primary-300"
        aria-hidden="true"
      >
        <Sparkles :size="14" />
      </div>

      <div
        class="min-w-0 max-w-[min(100%,20rem)] sm:max-w-[85%]"
        :class="message.role === 'user' ? 'items-end' : 'items-start'"
      >
        <p
          class="mb-1 px-0.5 text-[11px] font-medium uppercase tracking-wide text-content-muted"
        >
          {{ message.role === 'user' ? 'You' : 'Ritmo AI' }}
        </p>
        <div
          class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm transition-colors duration-200"
          :class="
            message.role === 'user'
              ? 'rounded-br-md bg-primary-500 text-white'
              : 'rounded-bl-md border border-outline bg-surface-raised text-content'
          "
        >
          {{ message.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Sparkles } from 'lucide-vue-next'
  import { computed, nextTick, ref, watch } from 'vue'
  import type { AiChatMessage } from '@/types/generateWeek'

  const props = defineProps<{
    messages: AiChatMessage[]
  }>()

  const scroller = ref<HTMLElement | null>(null)

  const visibleMessages = computed(() =>
    props.messages.filter(m => m.role !== 'system'),
  )

  async function scrollToBottom() {
    await nextTick()
    const el = scroller.value
    if (!el) return
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      return
    }
    el.scrollTop = el.scrollHeight
  }

  watch(
    () => visibleMessages.value.length,
    () => {
      void scrollToBottom()
    },
    { flush: 'post' },
  )
</script>

<style scoped>
  .gw-chat-thread {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--color-border-strong) 80%, transparent)
      transparent;
  }

  .gw-chat-thread:focus {
    outline: none;
  }

  .gw-chat-thread:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-brand) 55%, transparent);
    outline-offset: 2px;
    border-radius: 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .gw-chat-thread {
      scroll-behavior: auto;
    }
  }
</style>
