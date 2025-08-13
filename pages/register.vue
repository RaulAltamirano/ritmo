<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <img src="/logo-ritmo.svg" alt="Ritmo Logo" class="mx-auto h-16 w-16" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Join Ritmo
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create your account and start organizing your time
        </p>
      </div>

      <!-- Registration Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full name
            </label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              :disabled="isLoading"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Your full name"
            />
          </div>

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
            <!-- Password strength indicator -->
            <div v-if="form.password" class="mt-2">
              <div class="flex items-center space-x-2">
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrength + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                :disabled="isLoading"
                class="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Eye v-if="showConfirmPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
            <!-- Password match indicator -->
            <div v-if="form.confirmPassword" class="mt-1">
              <div class="flex items-center space-x-1">
                <CheckCircle v-if="passwordsMatch" class="h-4 w-4 text-green-500" />
                <XCircle v-else class="h-4 w-4 text-red-500" />
                <span class="text-xs" :class="passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="acceptTerms"
              v-model="form.acceptTerms"
              name="acceptTerms"
              type="checkbox"
              required
              :disabled="isLoading"
              class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="acceptTerms" class="text-gray-700 dark:text-gray-300">
              I accept the 
              <a href="#" class="text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 font-medium">
                terms and conditions
              </a>
              and 
              <a href="#" class="text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 font-medium">
                privacy policy
              </a>
            </label>
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
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <NuxtLink 
              to="/login" 
              class="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Sign in here
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff, AlertCircle, CheckCircle, XCircle } from 'lucide-vue-next'
import type { RegisterCredentials } from '../types/auth'

// Use custom layout (no default Nuxt layout)
definePageMeta({
  layout: false,
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Sign Up - Ritmo',
  meta: [
    { name: 'description', content: 'Create your Ritmo account and start organizing your time intelligently' }
  ]
})

// Auth composable
const { register, isLoading, error, clearError } = useAuth()

// Form state
const form = ref<RegisterCredentials & { confirmPassword: string }>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed properties
const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword && form.value.password !== ''
})

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  
  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 25) return 'bg-red-500'
  if (passwordStrength.value <= 50) return 'bg-orange-500'
  if (passwordStrength.value <= 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 25) return 'Weak'
  if (passwordStrength.value <= 50) return 'Fair'
  if (passwordStrength.value <= 75) return 'Good'
  return 'Strong'
})

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.email.trim() !== '' && 
         form.value.email.includes('@') &&
         form.value.password.trim() !== '' &&
         passwordsMatch.value &&
         form.value.acceptTerms &&
         passwordStrength.value >= 75
})

// Methods
const handleRegister = async () => {
  if (!isFormValid.value) return
  
  clearError()
  
  try {
    await register({
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      acceptTerms: form.value.acceptTerms
    })
    
    // Navigate to dashboard on success
    await navigateTo('/dashboard', { replace: true })
  } catch (err: any) {
    console.error('Registration error:', err)
    // Error is handled by the auth store
  }
}

// Clear error when component mounts
onMounted(() => {
  clearError()
})
</script> 