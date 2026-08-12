<template>
  <div
    role="radiogroup"
    aria-label="Load unit"
    class="inline-flex items-center gap-1"
  >
    <button
      v-for="option in OPTIONS"
      :id="id ? `${id}-${option.value}` : undefined"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value ? 'true' : 'false'"
      :aria-label="option.ariaLabel"
      class="min-h-11 min-w-11 cursor-pointer rounded-md border text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      :class="
        modelValue === option.value
          ? 'border-brand bg-brand-subtle text-brand-text'
          : 'border-outline text-content-secondary'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { LoadUnit } from '~/types/training'

  const OPTIONS: { value: LoadUnit; label: string; ariaLabel: string }[] = [
    { value: 'kg', label: 'kg', ariaLabel: 'Kilograms' },
    { value: 'lbs', label: 'lbs', ariaLabel: 'Pounds' },
    { value: 'plates', label: 'P', ariaLabel: 'Plates' },
    { value: 'bw', label: 'BW', ariaLabel: 'Bodyweight' },
  ]

  defineProps<{
    modelValue: LoadUnit
    id?: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: LoadUnit]
  }>()
</script>
