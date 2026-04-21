<script setup lang="ts">
import { Lightbulb, Plus, X } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'
import BaseButton from '../../atoms/interactive/BaseButton.vue'
import BaseCard from '../../atoms/layout/BaseCard.vue'

interface QuickInputProps {
  placeholder?: string
  isLoading?: boolean
  submitText?: string
  loadingText?: string
  hint?: string
}

const props = withDefaults(defineProps<QuickInputProps>(), {
  placeholder: 'Enter text...',
  isLoading: false,
  submitText: 'Submit',
  loadingText: 'Loading...',
  hint: '',
})

const emit = defineEmits<{
  submit: [value: string]
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

const handleSubmit = () => {
  if (!inputValue.value.trim() || props.isLoading) return

  emit('submit', inputValue.value.trim())
  clearInput()
}

const clearInput = () => {
  inputValue.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Expose methods for parent
defineExpose({
  clear: clearInput,
  focus: () => inputRef.value?.focus(),
  value: inputValue,
})
</script>

<template>
  <BaseCard variant="elevated" padding="sm" class="sm:p-4">
    <form @submit.prevent="handleSubmit"
      class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
      <div class="flex-1 relative">
        <input ref="inputRef" v-model="inputValue" type="text" :placeholder="placeholder"
          class="w-full px-3 py-3 sm:py-2 border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10 text-base sm:text-sm"
          :disabled="isLoading" @keydown.esc="clearInput" />
        <button v-if="inputValue" type="button" @click="clearInput"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          aria-label="Clear input">
          <X :size="16" />
        </button>
      </div>
      <BaseButton type="submit" variant="outline" :disabled="!inputValue.trim() || isLoading"
        :icon="!isLoading ? Plus : undefined" :loading="isLoading"
        class="flex items-center justify-center space-x-2 whitespace-nowrap py-3 sm:py-2 w-full sm:w-auto">
        <span class="text-base sm:text-sm">{{
          isLoading ? loadingText : submitText
          }}</span>
      </BaseButton>
    </form>
    <p v-if="hint" class="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-2 flex items-center space-x-1">
      <Lightbulb :size="12" />
      <span>{{ hint }}</span>
    </p>
  </BaseCard>
</template>
