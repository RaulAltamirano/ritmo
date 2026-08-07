<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="inline-flex min-h-[40px] max-w-full cursor-pointer items-center gap-2 rounded-full border border-outline bg-surface px-3 py-1.5 text-left text-sm text-content shadow-sm transition-colors duration-200 hover:border-outline-strong hover:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:bg-surface-raised"
      aria-label="Choose AI model"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span
        class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-300"
        aria-hidden="true"
      >
        <Sparkles :size="12" />
      </span>
      <span class="min-w-0 truncate">
        <span class="font-medium">{{ selected?.name ?? 'Select model' }}</span>
        <span
          v-if="selected"
          class="ml-1.5 text-content-muted"
        >
          {{ selected.tag }}
        </span>
      </span>
      <ChevronDown
        class="h-3.5 w-3.5 shrink-0 text-content-muted transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[min(100vw-3rem,18rem)] rounded-2xl border border-outline bg-surface p-2 shadow-lg dark:bg-surface-raised"
    >
      <input
        v-model="query"
        type="search"
        placeholder="Search models"
        aria-label="Search models"
        class="mb-2 w-full rounded-xl border border-outline bg-canvas px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />
      <ul class="max-h-56 space-y-0.5 overflow-y-auto" role="listbox">
        <li v-for="model in filtered" :key="model.id" role="presentation">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-content transition-colors duration-150 hover:bg-surface-overlay focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500"
            :aria-label="`Select ${model.name}`"
            role="option"
            :aria-selected="model.id === modelValue"
            @click="choose(model.id)"
          >
            <span class="min-w-0">
              <span class="font-medium">{{ model.name }}</span>
              <span class="ml-1.5 text-content-muted">{{ model.tag }}</span>
            </span>
            <Check
              v-if="model.id === modelValue"
              class="h-4 w-4 shrink-0 text-primary-500"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Check, ChevronDown, Sparkles } from 'lucide-vue-next'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { STUB_AI_MODELS } from '@/types/generateWeek'

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [id: string]
  }>()

  const open = ref(false)
  const query = ref('')
  const rootEl = ref<HTMLElement | null>(null)

  const selected = computed(() =>
    STUB_AI_MODELS.find(m => m.id === props.modelValue),
  )

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return STUB_AI_MODELS
    return STUB_AI_MODELS.filter(
      m =>
        m.name.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q),
    )
  })

  function choose(id: string) {
    emit('update:modelValue', id)
    open.value = false
    query.value = ''
  }

  function onDocPointerDown(event: MouseEvent) {
    if (!open.value || !rootEl.value) return
    if (!rootEl.value.contains(event.target as Node)) open.value = false
  }

  function onDocKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open.value) open.value = false
  }

  watch(open, value => {
    if (!value) query.value = ''
  })

  onMounted(() => {
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onDocKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocPointerDown)
    document.removeEventListener('keydown', onDocKeydown)
  })
</script>
