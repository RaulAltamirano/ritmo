<template>
  <div class="space-y-2">
    <div
      class="flex items-end gap-2 rounded-2xl border border-outline bg-surface px-2.5 py-2 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30 dark:bg-surface-raised"
    >
      <textarea
        ref="textareaEl"
        v-model="draft"
        rows="1"
        class="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-1.5 py-2.5 text-sm leading-relaxed text-content placeholder:text-content-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Type your answer…"
        aria-label="Message to AI"
        :disabled="disabled"
        @input="autoResize"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary-500 text-white transition-all duration-200 hover:bg-primary-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        aria-label="Send message"
        :disabled="disabled || !canSend"
        @click="send"
      >
        <ArrowUp :size="18" aria-hidden="true" />
      </button>
    </div>
    <p class="px-1 text-xs text-content-muted">
      Enter to send · Shift+Enter for a new line
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ArrowUp } from 'lucide-vue-next'
  import { computed, nextTick, ref } from 'vue'

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
    }>(),
    { disabled: false },
  )

  const emit = defineEmits<{
    send: [content: string]
  }>()

  const draft = ref('')
  const textareaEl = ref<HTMLTextAreaElement | null>(null)

  const canSend = computed(() => draft.value.trim().length > 0)

  function autoResize() {
    const el = textareaEl.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  async function send() {
    const text = draft.value.trim()
    if (!text || props.disabled) return
    emit('send', text)
    draft.value = ''
    await nextTick()
    autoResize()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }
</script>
