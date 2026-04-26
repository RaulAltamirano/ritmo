<script setup lang="ts">
  import { ref } from 'vue'
  import BaseButton from '../../../components/atoms/BaseButton.vue'

  // Loading states for interactive buttons
  const loadingStates = ref({
    primary: false,
    secondary: false,
    success: false,
  })

  // Handlers
  const toggleLoading = (type: keyof typeof loadingStates.value) => {
    loadingStates.value[type] = true
    // Simulate loading for 2 seconds
    setTimeout(() => {
      loadingStates.value[type] = false
    }, 2000)
  }
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
  >
    <h3
      class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
    >
      Buttons
    </h3>
    <div class="space-y-4">
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="success">Success</BaseButton>
        <BaseButton variant="error">Error</BaseButton>
        <BaseButton variant="warning">Warning</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <BaseButton size="sm">Small</BaseButton>
        <BaseButton size="md">Medium</BaseButton>
        <BaseButton size="lg">Large</BaseButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <BaseButton loading variant="primary">Loading</BaseButton>
        <BaseButton loading variant="success" size="sm">Loading</BaseButton>
        <BaseButton disabled>Disabled</BaseButton>
        <BaseButton variant="outline">Outline</BaseButton>
        <BaseButton variant="link">Link</BaseButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <BaseButton
          :loading="loadingStates.primary"
          variant="primary"
          @click="toggleLoading('primary')"
        >
          {{ loadingStates.primary ? 'Loading...' : 'Click to Load' }}
        </BaseButton>
        <BaseButton
          :loading="loadingStates.secondary"
          variant="secondary"
          @click="toggleLoading('secondary')"
        >
          {{ loadingStates.secondary ? 'Processing...' : 'Process Data' }}
        </BaseButton>
        <BaseButton
          :loading="loadingStates.success"
          variant="success"
          @click="toggleLoading('success')"
        >
          {{ loadingStates.success ? 'Saving...' : 'Save Changes' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
