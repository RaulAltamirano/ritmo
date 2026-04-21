<script setup lang="ts">
  import { ref } from 'vue'
  import LoginForm from '../components/molecules/LoginForm.vue'

  // Example state
  const isLoading = ref(false)
  const error = ref('')

  // Example handlers
  const handleLogin = async (data: {
    email: string
    password: string
    rememberMe: boolean
  }) => {
    // Login attempt

    isLoading.value = true
    error.value = ''

    // Simulate API call
    setTimeout(() => {
      if (data.email === 'demo@ritmo.app' && data.password === 'Demo123!') {
        // Login successful
        // Navigate to dashboard or show success
      } else {
        error.value = 'Invalid email or password'
      }
      isLoading.value = false
    }, 2000)
  }

  const handleForgotPassword = () => {
    // Forgot password clicked
    // Navigate to forgot password page
  }

  const handleSignUp = () => {
    // Sign up clicked
    // Navigate to sign up page
  }
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <LoginForm
      :is-loading="isLoading"
      :general-error="error"
      @submit="handleLogin"
      @forgot-password="handleForgotPassword"
      @sign-up="handleSignUp"
    />
  </div>
</template>
