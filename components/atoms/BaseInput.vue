<template>
  <div class="relative">
    <label 
      v-if="label" 
      :for="inputId" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <component 
        v-if="leftIcon" 
        :is="leftIcon" 
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        :size="20"
      />
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-label="ariaLabel || label"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        :class="[
          'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
          leftIcon ? 'pl-10' : 'pl-3',
          rightIcon ? 'pr-10' : 'pr-3',
          'py-2.5',
          error 
            ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <component 
        v-if="rightIcon" 
        :is="rightIcon" 
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        :size="20"
      />
    </div>
    
    <p 
      v-if="error" 
      :id="`${inputId}-error`"
      class="mt-1 text-sm text-error-600"
      role="alert"
    >
      {{ error }}
    </p>
    
    <p 
      v-else-if="hint" 
      class="mt-1 text-sm text-gray-500"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface BaseInputProps {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  leftIcon?: Component
  rightIcon?: Component
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script> 