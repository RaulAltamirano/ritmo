<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <RitmoLogo class="mx-auto h-16 w-16 text-gray-900 dark:text-white" />
        <h2 :class="[
          typography.getDisplayTypography('medium').value,
          'mt-6 text-gray-900 dark:text-white',
        ]">
          Join Ritmo
        </h2>
        <p :class="[
          typography.getBodyTypography('large').value,
          'mt-2 text-gray-600 dark:text-gray-400',
        ]">
          Create your account and start organizing your time
        </p>

        <!-- Error Boundary -->
        <BaseAlert v-if="authError" variant="error" title="Registration Error" class="mt-4">
          {{ authError }}
          <template #actions>
            <BaseButton variant="secondary" size="sm" @click="retryAuth" :loading="isRetrying">
              Try Again
            </BaseButton>
          </template>
        </BaseAlert>
      </div>

      <!-- Registration Form -->
      <RegisterForm :is-loading="isLoading" :general-error="error" @submit="handleRegister" @sign-in="handleSignIn"
        @terms="handleTerms" @privacy="handlePrivacy" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTypography } from '@ritmo/ui'
import RitmoLogo from '@ritmo/ui/components/atoms/display/RitmoLogo.vue'
import BaseAlert from '@ritmo/ui/components/atoms/feedback/BaseAlert.vue'
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import RegisterForm from '@ritmo/ui/components/molecules/forms/RegisterForm.vue'
import { onMounted, ref } from 'vue'

// Use custom layout (no default Nuxt layout)
definePageMeta({
  layout: false,
})

// Page meta
useHead({
  title: 'Sign Up - Ritmo',
  meta: [
    {
      name: 'description',
      content:
        'Create your Ritmo account and start organizing your time intelligently',
    },
  ],
})

// Typography composable
const typography = useTypography()

// Auth composable
const { register, isLoading, error } = useAuth()

// Error boundary state
const authError = ref<string | null>(null)
const isRetrying = ref(false)

// Methods
const handleRegister = async (formData: {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}) => {
  try {
    authError.value = null // Clear previous errors

    await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      acceptTerms: formData.acceptTerms,
    })

    // Navigate to dashboard on success
    await navigateTo('/dashboard', { replace: true })
  } catch (err: any) {
    // Handle registration errors with error boundary
    authError.value = err?.message || 'Registration failed. Please try again.'
    console.error('Registration error:', err)
  }
}

const handleSignIn = () => {
  navigateTo('/auth/login')
}

const handleTerms = () => {
  // Handle terms and conditions link
  console.log('Terms and conditions clicked')
  // You can navigate to a terms page or open a modal
}

const handlePrivacy = () => {
  // Handle privacy policy link
  console.log('Privacy policy clicked')
  // You can navigate to a privacy page or open a modal
}

const retryAuth = async () => {
  isRetrying.value = true
  authError.value = null

  try {
    // Re-initialize auth state
    const { initAuth } = useAuth()
    await initAuth()
  } catch (err: any) {
    authError.value = 'Failed to retry authentication. Please refresh the page.'
  } finally {
    isRetrying.value = false
  }
}

// Clear error when component mounts
onMounted(() => {
  authError.value = null
})
</script>
