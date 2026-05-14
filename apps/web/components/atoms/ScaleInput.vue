<template>
  <label class="block" :for="fieldId">
    <span class="font-medium text-content">{{ label }}</span>
    <input
      :id="fieldId"
      :value="modelValue"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="mt-1 w-full"
      @input="onInput"
    />
    <span class="text-xs text-content-secondary">{{ modelValue }}</span>
  </label>
</template>

<script setup lang="ts">
  import { useId, computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      modelValue: number
      label: string
      min?: number
      max?: number
      step?: number
      id?: string
    }>(),
    {
      min: 1,
      max: 5,
      step: 1,
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [v: number]
  }>()

  const autoId = useId()
  const fieldId = computed(() => props.id ?? autoId)

  function onInput(e: Event) {
    const v = Number((e.target as HTMLInputElement).value)
    if (!Number.isNaN(v)) emit('update:modelValue', v)
  }
</script>
