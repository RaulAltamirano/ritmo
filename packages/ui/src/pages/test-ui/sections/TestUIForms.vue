<script setup lang="ts">
import { ref } from 'vue'
import BaseBadge from '../../../components/atoms/BaseBadge.vue'
import BaseButton from '../../../components/atoms/BaseButton.vue'
import BaseCheckbox from '../../../components/atoms/BaseCheckbox.vue'

// Test data
const testCheckboxes = ref({
  terms: false,
  newsletter: false,
  marketing: false,
  disabled: false,
  checked: true,
})

// Handlers
const handleLogin = () => {
  // This would be handled by the parent component
  console.log('Login button clicked')
}
</script>

<template>
  <section id="forms" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2 class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white">
        Form Components
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Components for building productive forms
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Checkboxes -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white">
          Checkbox System
        </h3>
        <div class="space-y-4">
          <BaseCheckbox v-model="testCheckboxes.terms" label="I accept the terms and conditions"
            description="Please read and accept our terms of service" required />
          <BaseCheckbox v-model="testCheckboxes.newsletter" label="Subscribe to newsletter"
            description="Receive updates about new features" />
          <BaseCheckbox v-model="testCheckboxes.marketing" label="Allow marketing"
            description="Receive offers and promotions" />
          <BaseCheckbox v-model="testCheckboxes.disabled" label="Disabled option"
            description="This option is not available" disabled />
          <BaseCheckbox v-model="testCheckboxes.checked" label="Option checked by default"
            description="This option comes pre-checked" />
        </div>
      </div>

      <!-- Component usage example -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white">
          Usage Examples
        </h3>
        <div class="space-y-4">
          <p class="text-productivity text-gray-600 dark:text-gray-300">
            Here you can see examples of how to use components in different contexts.
          </p>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="primary">Example</BaseBadge>
            <BaseBadge variant="success">Component</BaseBadge>
            <BaseBadge variant="info">Usage</BaseBadge>
          </div>
          <BaseButton variant="primary" size="sm" @click="handleLogin">
            Test Success Toast
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
