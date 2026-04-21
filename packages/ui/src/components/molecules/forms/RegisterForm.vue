<script setup lang="ts">
import { useTypography } from '../../../composables/useTypography'
import { AlertCircle, CheckCircle, Eye, EyeOff, XCircle } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import BaseIcon from '../../atoms/display/BaseIcon.vue'
import BaseAlert from '../../atoms/feedback/BaseAlert.vue'
import BaseCheckbox from '../../atoms/forms/BaseCheckbox.vue'
import BaseInput from '../../atoms/forms/BaseInput.vue'
import BaseButton from '../../atoms/interactive/BaseButton.vue'
import BaseCard from '../../atoms/layout/BaseCard.vue'

const props = withDefaults(defineProps<RegisterFormProps>(), {
  isLoading: false,
})

const emit = defineEmits<{
  submit: [data: RegisterFormData]
  'sign-in': []
  terms: []
  privacy: []
}>()

// Usar tipografía unificada
const typography = useTypography()

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface RegisterFormProps {
  initialData?: Partial<RegisterFormData>
  isLoading?: boolean
  generalError?: string
}

// Form state
const form = ref<RegisterFormData>({
  username: props.initialData?.username || '',
  email: props.initialData?.email || '',
  password: props.initialData?.password || '',
  confirmPassword: props.initialData?.confirmPassword || '',
  acceptTerms: props.initialData?.acceptTerms || false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref<Record<string, string>>({})

// Computed properties
const passwordsMatch = computed(() => {
  return (
    form.value.password === form.value.confirmPassword && form.value.password !== ''
  )
})

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  if (/[^A-Za-z0-9]/.test(password)) strength += 25

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

// Validation
const isFormValid = computed(() => {
  return (
    form.value.username.trim() &&
    form.value.email.trim() &&
    form.value.password.trim() &&
    form.value.confirmPassword.trim() &&
    passwordsMatch.value &&
    form.value.acceptTerms
  )
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

  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
  } else if (!/^[a-zA-Z0-9_-]+$/.test(form.value.username)) {
    errors.value.username =
      'Username can only contain letters, numbers, underscores, and hyphens'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!form.value.password.trim()) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long'
  }

  if (!form.value.confirmPassword.trim()) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (!passwordsMatch.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = 'You must accept the terms and conditions'
  }
}

const handleSubmit = () => {
  validateForm()

  if (Object.keys(errors.value).length === 0) {
    emit('submit', { ...form.value })
  }
}
</script>

<template>
  <BaseCard variant="simple" padding="lg" class="max-w-md w-full">
    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Username Field -->
      <BaseInput v-model="form.username" label="Username" type="text" placeholder="Choose a username" :required="true"
        :error="errors.username" :disabled="isLoading" />

      <!-- Email Field -->
      <BaseInput v-model="form.email" label="Email address" type="email" placeholder="your@email.com" :required="true"
        :error="errors.email" :disabled="isLoading" />

      <!-- Password Field -->
      <BaseInput v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••" :required="true" :error="errors.password" :disabled="isLoading"
        :right-icon="showPassword ? Eye : EyeOff" @click:right-icon="showPassword = !showPassword" />

      <!-- Password Strength Indicator -->
      <div v-if="form.password" class="space-y-2">
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-300" :class="passwordStrengthClass"
              :style="{ width: passwordStrength + '%' }"></div>
          </div>
          <span class="text-gray-500 dark:text-gray-400" :class="[
            typography.getBodyTypography('small').value,
          ]">
            {{ passwordStrengthText }}
          </span>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <BaseInput v-model="form.confirmPassword" label="Confirm password"
        :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" :required="true"
        :error="errors.confirmPassword" :disabled="isLoading" :right-icon="showConfirmPassword ? Eye : EyeOff"
        @click:right-icon="showConfirmPassword = !showConfirmPassword" />

      <!-- Password Match Indicator -->
      <div v-if="form.confirmPassword" class="flex items-center space-x-1">
        <BaseIcon :icon="passwordsMatch ? CheckCircle : XCircle" size="sm"
          :color="passwordsMatch ? 'success' : 'error'" />
        <span :class="[
          typography.getBodyTypography('small').value,
          passwordsMatch
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400',
        ]">
          {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
        </span>
      </div>

      <!-- Terms and Conditions -->
      <BaseCheckbox v-model="form.acceptTerms" name="acceptTerms" label="Accept terms and conditions" :required="true"
        :disabled="isLoading" :error="errors.acceptTerms" />

      <!-- Error Alert -->
      <BaseAlert v-if="generalError" variant="error" :icon="AlertCircle" title="Registration Error">
        {{ generalError }}
      </BaseAlert>

      <!-- Submit Button -->
      <BaseButton type="submit" variant="primary" size="lg" :loading="isLoading" :disabled="!isFormValid" full-width>
        {{ isLoading ? 'Creating account...' : 'Create account' }}
      </BaseButton>

      <!-- Sign In Link -->
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400" :class="[
          typography.getBodyTypography('small').value,
        ]">
          Already have an account?
          <a href="#" class="font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors" :class="[
            typography.getBodyTypography('small').value,
          ]" @click.prevent="$emit('sign-in')">
            Sign in
          </a>
        </p>
      </div>
    </form>
  </BaseCard>
</template>
