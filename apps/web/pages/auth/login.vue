<template>
  <div
    class="min-h-screen bg-canvas flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <RitmoLogo class="mx-auto h-16 w-16 text-gray-900 dark:text-white" />
        <h2
          class="mt-6 text-gray-900 dark:text-white"
          :class="[typography.getDisplayTypography('medium').value]"
        >
          Welcome back
        </h2>
        <p
          class="mt-2 text-gray-600 dark:text-gray-400"
          :class="[typography.getBodyTypography('large').value]"
        >
          Sign in to your Ritmo account
        </p>

        <!-- Redirect Message -->
        <BaseAlert
          v-if="$route.query.reason === 'authentication_required'"
          variant="info"
          title="Authentication Required"
          class="mt-4"
        >
          You need to sign in to access that page
        </BaseAlert>

        <!-- Error Boundary -->
        <BaseAlert
          v-if="authError"
          variant="error"
          title="Authentication Error"
          class="mt-4"
        >
          {{ authError }}
          <template #actions>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="retryAuth"
              :loading="isRetrying"
            >
              Try Again
            </BaseButton>
          </template>
        </BaseAlert>
      </div>

      <!-- Login Form -->
      <LoginForm
        :is-loading="isLoading"
        :general-error="error"
        @submit="handleLogin"
        @forgot-password="handleForgotPassword"
        @sign-up="handleSignUp"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTypography } from '@ritmo/ui'
  import RitmoLogo from '@ritmo/ui/components/atoms/display/RitmoLogo.vue'
  import BaseAlert from '@ritmo/ui/components/atoms/feedback/BaseAlert.vue'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import LoginForm from '@ritmo/ui/components/molecules/forms/LoginForm.vue'
  import { onMounted, ref } from 'vue'

  // Use custom layout (no default Nuxt layout)
  definePageMeta({
    layout: false,
  })

  // Page meta
  useHead({
    title: 'Sign In - Ritmo',
    meta: [
      {
        name: 'description',
        content: 'Sign in to your Ritmo account and access your smart agenda',
      },
    ],
  })

  // Typography composable
  const typography = useTypography()

  // Auth composable
  const { login, isLoading, error } = useAuth()

  // Error boundary state
  const authError = ref<string | null>(null)
  const isRetrying = ref(false)

  // Methods
  const handleLogin = async (formData: {
    email: string
    password: string
    rememberMe: boolean
  }) => {
    try {
      authError.value = null // Clear previous errors

      await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      })

      // Check if there's a redirect URL from the query parameters
      const route = useRoute()
      const redirectUrl = route.query.redirect as string

      // Navigate to redirect URL or dashboard on success
      if (redirectUrl && redirectUrl !== '/auth/login') {
        await navigateTo(redirectUrl, { replace: true })
      } else {
        await navigateTo('/dashboard', { replace: true })
      }
    } catch (err: any) {
      // Handle authentication errors with error boundary
      authError.value = err?.message ?? 'Authentication failed. Please try again.'
      console.error('Login error:', err)
    }
  }

  const handleForgotPassword = () => {
    navigateTo('/forgot-password')
  }

  const handleSignUp = () => {
    navigateTo('/register')
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
