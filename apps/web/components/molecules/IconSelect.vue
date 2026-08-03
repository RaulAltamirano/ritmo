<template>
  <div ref="rootRef" class="relative">
    <button
      :id="id"
      type="button"
      class="field-trigger"
      :class="{ 'field-trigger--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span class="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          v-if="selected"
          class="tone-badge"
          :class="toneClass(selected.tone)"
          data-testid="icon-select-trigger-icon"
        >
          <component :is="selected.icon" class="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span
          class="truncate text-sm"
          :class="selected ? 'text-gray-900 dark:text-white' : 'text-gray-400'"
        >
          {{ selected?.label ?? placeholder }}
        </span>
      </span>
      <ChevronDown
        class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="isOpen"
      :id="listboxId"
      role="listbox"
      :aria-labelledby="id"
      class="field-menu"
      @keydown="onListKeydown"
    >
      <li
        v-for="(option, index) in options"
        :key="String(option.value)"
        role="option"
        :aria-selected="option.value === modelValue"
        :data-testid="`icon-select-option-${option.value}`"
        :data-active="index === activeIndex"
        class="field-option"
        :class="{
          'field-option--selected': option.value === modelValue,
          'field-option--active': index === activeIndex,
        }"
        @click="select(option.value)"
        @mouseenter="activeIndex = index"
      >
        <span class="tone-badge" :class="toneClass(option.tone)">
          <component
            :is="option.icon"
            class="h-3.5 w-3.5"
            data-testid="icon-select-option-icon"
            aria-hidden="true"
          />
        </span>
        <span class="flex-1 truncate text-sm font-medium">{{ option.label }}</span>
        <Check
          v-if="option.value === modelValue"
          class="h-4 w-4 shrink-0 text-primary-500"
          aria-hidden="true"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core'
  import { Check, ChevronDown } from 'lucide-vue-next'
  import { computed, nextTick, ref, watch, type Component } from 'vue'

  export type IconSelectTone =
    | 'slate'
    | 'blue'
    | 'cyan'
    | 'emerald'
    | 'amber'
    | 'orange'
    | 'rose'
    | 'violet'
    | 'pink'

  export interface IconSelectOption {
    value: string
    label: string
    icon: Component
    tone?: IconSelectTone
  }

  const props = withDefaults(
    defineProps<{
      id: string
      modelValue?: string
      options: IconSelectOption[]
      placeholder?: string
    }>(),
    {
      modelValue: '',
      placeholder: 'Seleccionar',
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const rootRef = ref<HTMLElement | null>(null)
  const isOpen = ref(false)
  const activeIndex = ref(0)
  const listboxId = computed(() => `${props.id}-listbox`)

  const selected = computed(
    () => props.options.find(option => option.value === props.modelValue) ?? null,
  )

  const toneClass = (tone?: IconSelectTone) => {
    switch (tone) {
      case 'blue':
        return 'tone-badge--blue'
      case 'cyan':
        return 'tone-badge--cyan'
      case 'emerald':
        return 'tone-badge--emerald'
      case 'amber':
        return 'tone-badge--amber'
      case 'orange':
        return 'tone-badge--orange'
      case 'rose':
        return 'tone-badge--rose'
      case 'violet':
        return 'tone-badge--violet'
      case 'pink':
        return 'tone-badge--pink'
      default:
        return 'tone-badge--slate'
    }
  }

  const selectedIndex = () =>
    Math.max(
      0,
      props.options.findIndex(option => option.value === props.modelValue),
    )

  const open = async () => {
    isOpen.value = true
    activeIndex.value = selectedIndex()
    await nextTick()
    const active = rootRef.value?.querySelector<HTMLElement>('[data-active="true"]')
    active?.focus?.()
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    if (isOpen.value) close()
    else void open()
  }

  const select = (value: string) => {
    emit('update:modelValue', value)
    close()
  }

  const moveActive = (delta: number) => {
    const count = props.options.length
    if (!count) return
    activeIndex.value = (activeIndex.value + delta + count) % count
  }

  const onTriggerKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!isOpen.value) void open()
      else if (event.key === 'Enter' || event.key === ' ') {
        select(props.options[activeIndex.value]!.value)
      }
    } else if (event.key === 'Escape') {
      close()
    }
  }

  const onListKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(props.options[activeIndex.value]!.value)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  onClickOutside(rootRef, () => close())

  watch(
    () => props.modelValue,
    () => {
      if (isOpen.value) activeIndex.value = selectedIndex()
    },
  )
</script>

<style scoped>
  .field-trigger {
    @apply flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left outline-none transition-all focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-900/60;
  }

  .field-trigger--open {
    @apply border-primary-500 ring-2 ring-primary-500/30;
  }

  .field-menu {
    @apply absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900;
  }

  .field-option {
    @apply flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-700 transition-colors dark:text-gray-200;
  }

  .field-option--active {
    @apply bg-gray-100 dark:bg-gray-800;
  }

  .field-option--selected {
    @apply text-gray-900 dark:text-white;
  }

  .tone-badge {
    @apply inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg;
  }

  .tone-badge--slate {
    @apply bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300;
  }

  .tone-badge--blue {
    @apply bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300;
  }

  .tone-badge--cyan {
    @apply bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300;
  }

  .tone-badge--emerald {
    @apply bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300;
  }

  .tone-badge--amber {
    @apply bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300;
  }

  .tone-badge--orange {
    @apply bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300;
  }

  .tone-badge--rose {
    @apply bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300;
  }

  .tone-badge--violet {
    @apply bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300;
  }

  .tone-badge--pink {
    @apply bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300;
  }
</style>
