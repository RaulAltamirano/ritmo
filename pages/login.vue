<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <img src="/logo-ritmo.svg" alt="Ritmo Logo" class="mx-auto h-16 w-16" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your Ritmo account
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              :disabled="isLoading"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                :disabled="isLoading"
                class="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Eye v-if="showPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <NuxtLink 
              to="/forgot-password" 
              class="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Forgot your password?
            </NuxtLink>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <AlertCircle class="h-5 w-5 text-red-400 mt-0.5" />
            <div class="ml-3">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- Demo Credentials -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Info class="h-4 w-4 mr-2 text-gray-500" />
            Demo credentials:
          </h4>
          <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Email:</strong> demo@ritmo.app</p>
            <p><strong>Password:</strong> Demo123!</p>
          </div>
          <button
            type="button"
            @click="fillDemoCredentials"
            class="mt-2 text-xs text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
          >
            Use demo credentials
          </button>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <NuxtLink 
              to="/register" 
              class="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Sign up here
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-vue-next'
import type { LoginCredentials } from '../types/auth'

// Use custom layout (no default Nuxt layout)
definePageMeta({
  layout: false,
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Sign In - Ritmo',
  meta: [
    { name: 'description', content: 'Sign in to your Ritmo account and access your smart agenda' }
  ]
})

// Auth composable
const { login, isLoading, error, clearError } = useAuth()

// Form state
const form = ref<LoginCredentials>({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return form.value.email.trim() !== '' && 
         form.value.password.trim() !== '' &&
         form.value.email.includes('@')
})

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  clearError()
  
  try {
    await login({
      email: form.value.email.trim(),
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
    
    // Navigate to dashboard on success
    await navigateTo('/dashboard', { replace: true })
  } catch (err: any) {
    console.error('Login error:', err)
    // Error is handled by the auth store
  }
}

const fillDemoCredentials = () => {
  form.value.email = 'demo@ritmo.app'
  form.value.password = 'Demo123!'
  form.value.rememberMe = true
}

// Clear error when component mounts
onMounted(() => {
  clearError()
})
</script> 