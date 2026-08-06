<template>
  <div class="flex items-end gap-2">
    <textarea
      v-model="draft"
      rows="2"
      class="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      placeholder="Type your answer…"
      :disabled="disabled"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Send message"
      :disabled="disabled || !canSend"
      @click="send"
    >
      Send
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

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

  const canSend = computed(() => draft.value.trim().length > 0)

  function send() {
    const text = draft.value.trim()
    if (!text || props.disabled) return
    emit('send', text)
    draft.value = ''
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }
</script>
