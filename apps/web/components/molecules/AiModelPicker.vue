<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      aria-label="Choose AI model"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="truncate">
        {{ selected?.name ?? 'Select model' }}
        <span
          v-if="selected"
          class="ml-1 text-gray-400 dark:text-gray-500"
        >
          {{ selected.tag }}
        </span>
      </span>
      <ChevronDown class="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      role="listbox"
    >
      <input
        v-model="query"
        type="search"
        placeholder="Search models"
        class="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
      />
      <ul class="max-h-56 space-y-0.5 overflow-y-auto">
        <li v-for="model in filtered" :key="model.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
            :aria-label="`Select ${model.name}`"
            role="option"
            :aria-selected="model.id === modelValue"
            @click="choose(model.id)"
          >
            <span>
              {{ model.name }}
              <span class="ml-1 text-gray-400 dark:text-gray-500">{{
                model.tag
              }}</span>
            </span>
            <Check
              v-if="model.id === modelValue"
              class="h-4 w-4 text-primary-500"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Check, ChevronDown } from 'lucide-vue-next'
  import { computed, ref } from 'vue'
  import { STUB_AI_MODELS } from '@/types/generateWeek'

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [id: string]
  }>()

  const open = ref(false)
  const query = ref('')

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
</script>
