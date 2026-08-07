<template>
  <div
    class="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-950/40"
    role="log"
    aria-live="polite"
  >
    <div
      v-for="message in visibleMessages"
      :key="message.id"
      class="flex"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[85%] rounded-2xl px-3 py-2 text-sm"
        :class="
          message.role === 'user'
            ? 'bg-primary-500 text-white'
            : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'
        "
      >
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AiChatMessage } from '@/types/generateWeek'

  const props = defineProps<{
    messages: AiChatMessage[]
  }>()

  const visibleMessages = computed(() =>
    props.messages.filter(m => m.role !== 'system'),
  )
</script>
