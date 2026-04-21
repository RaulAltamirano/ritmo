<script setup lang="ts">
import { useTypography } from '../../../composables/useTypography'
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import BaseAlert from '../../atoms/feedback/BaseAlert.vue'
import BaseCheckbox from '../../atoms/forms/BaseCheckbox.vue'
import BaseInput from '../../atoms/forms/BaseInput.vue'
import BaseButton from '../../atoms/interactive/BaseButton.vue'
import BaseCard from '../../atoms/layout/BaseCard.vue'

const props = withDefaults(defineProps<LoginFormProps>(), {
  isLoading: false,
})

const emit = defineEmits<{
  submit: [data: LoginFormData]
  'forgot-password': []
  'sign-up': []
  'fill-demo': []
}>()

// Usar tipografía unificada
const typography = useTypography()

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginFormProps {
  initialData?: Partial<LoginFormData>
  isLoading?: boolean
  generalError?: string
}

// Form state
const form = ref<LoginFormData>({
  email: props.initialData?.email || '',
  password: props.initialData?.password || '',
  rememberMe: props.initialData?.rememberMe || false,
})

const showPassword = ref(false)
const errors = ref<Record<string, string>>({})

// Validation
const isFormValid = computed(() => {
  return form.value.email.trim() && form.value.password.trim()
})

// Watch for prop changes
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      form.value = { ...form.value, ...newData }
    }
  },
  { deep: true },
)

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!form.value.password.trim()) {
    errors.value.password = 'Password is required'
  }
}

const handleSubmit = () => {
  validateForm()

  if (Object.keys(errors.value).length === 0) {
    emit('submit', { ...form.value })
  }
}

// Method to fill demo credentials
const fillDemoCredentials = () => {
  form.value.email = 'demo@ritmo.app'
  form.value.password = 'Demo123!'
  form.value.rememberMe = true
  emit('fill-demo')
}

// Expose method to parent component
defineExpose({
  fillDemoCredentials,
})
</script>

<template>
  <BaseCard variant="simple" padding="lg" class="max-w-md w-full">
    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email Field -->
      <BaseInput v-model="form.email" label="Email address" type="email" placeholder="your@email.com" :required="true"
        :error="errors.email" :disabled="isLoading" />

      <!-- Password Field -->
      <BaseInput v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••" :required="true" :error="errors.password" :disabled="isLoading"
        :right-icon="showPassword ? Eye : EyeOff" @click:right-icon="showPassword = !showPassword" />

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <BaseCheckbox v-model="form.rememberMe" label="Remember me" name="remember-me" />

        <div :class="typography.getBodyTypography('small').value">
          <a href="#" class="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" :class="[
            typography.getBodyTypography('small').value,
          ]" @click.prevent="$emit('forgot-password')">
            Forgot your password?
          </a>
        </div>
      </div>

      <!-- Error Alert -->
      <BaseAlert v-if="generalError" variant="error" :icon="AlertCircle" title="Authentication Error">
        {{ generalError }}
      </BaseAlert>

      <!-- Submit Button -->
      <BaseButton type="submit" variant="primary" size="lg" :loading="isLoading" :disabled="!isFormValid" full-width>
        {{ isLoading ? 'Signing in...' : 'Sign in' }}
      </BaseButton>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400" :class="[
          typography.getBodyTypography('small').value,
        ]">
          Don't have an account?
          <a href="#" class="font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors" :class="[
            typography.getBodyTypography('small').value,
          ]" @click.prevent="$emit('sign-up')">
            Sign up
          </a>
        </p>
      </div>
    </form>
  </BaseCard>
</template>
