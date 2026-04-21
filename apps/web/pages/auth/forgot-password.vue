<template>
  <div class="min-h-screen bg-canvas flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <RitmoLogo class="mx-auto h-16 w-16 text-gray-900 dark:text-white" />
        <h2 :class="[
          typography.getDisplayTypography('medium').value,
          'mt-6 text-gray-900 dark:text-white',
        ]">
          Reset your password
        </h2>
        <p :class="[
          typography.getBodyTypography('large').value,
          'mt-2 text-gray-600 dark:text-gray-400',
        ]">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <!-- Forgot Password Form -->
      <BaseCard variant="elevated" padding="lg" class="max-w-md w-full">
        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <!-- Email Field -->
          <BaseInput v-model="form.email" label="Email address" type="email" placeholder="your@email.com"
            :required="true" :error="fieldErrors.email" :disabled="isLoading" :left-icon="Mail" />

          <!-- Success Alert -->
          <BaseAlert v-if="success" variant="success" :icon="CheckCircle" title="Reset Link Sent">
            {{ success }}
          </BaseAlert>

          <!-- Error Alert -->
          <BaseAlert v-if="error" variant="error" :icon="AlertCircle" title="Error">
            {{ error }}
          </BaseAlert>

          <!-- Submit Button -->
          <BaseButton type="submit" variant="primary" size="lg" :loading="isLoading" :disabled="!isFormValid"
            :icon="Mail" full-width>
            {{ isLoading ? 'Sending...' : 'Send reset link' }}
          </BaseButton>

          <!-- Back to Login -->
          <div class="text-center">
            <BaseButton variant="ghost" size="sm" :icon="ArrowLeft" @click="navigateTo('/auth/login')">
              Back to login
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTypography } from '@ritmo/ui'
import RitmoLogo from '@ritmo/ui/components/atoms/display/RitmoLogo.vue'
import BaseAlert from '@ritmo/ui/components/atoms/feedback/BaseAlert.vue'
import BaseInput from '@ritmo/ui/components/atoms/forms/BaseInput.vue'
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'

// Use custom layout (no default Nuxt layout)
definePageMeta({
  layout: false,
})

// Page meta
useHead({
  title: 'Forgot Password - Ritmo',
  meta: [
    {
      name: 'description',
      content: 'Reset your Ritmo account password',
    },
  ],
})

// Typography composable
const typography = useTypography()

// Form state
const form = reactive({
  email: '',
})

// UI state
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Field validation
const fieldErrors = reactive<Record<string, string>>({})

// Form validation
const isFormValid = computed(() => {
  return form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
})

// Methods
const clearErrors = () => {
  error.value = ''
  fieldErrors.email = ''
}

const validateForm = (): boolean => {
  clearErrors()

  if (!form.email.trim()) {
    fieldErrors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

const handleForgotPassword = async () => {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    // TODO: Implement forgot password API call
    // const response = await $fetch('/api/auth/forgot-password', {
    //   method: 'POST',
    //   body: { email: form.email }
    // })

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 1000))

    success.value =
      "If an account with that email exists, we've sent you a password reset link."
    form.email = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
