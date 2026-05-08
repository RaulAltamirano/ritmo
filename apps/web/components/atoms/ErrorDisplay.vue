<template>
  <div v-if="error" class="error-display">
    <div
      class="flex rounded-lg border p-4"
      :class="[getErrorBackgroundColor(error.severity || ErrorSeverity.MEDIUM)]"
    >
      <div class="flex-shrink-0">
        <span class="text-lg">{{
          getErrorIcon(error.severity || ErrorSeverity.MEDIUM)
        }}</span>
      </div>

      <div class="ml-3 flex-1">
        <h3
          class="text-sm font-medium"
          :class="[getErrorColor(error.severity || ErrorSeverity.MEDIUM)]"
        >
          {{ error.userMessage || error.message }}
        </h3>

        <!-- Show technical details in development -->
        <div v-if="showTechnicalDetails && error.technicalMessage" class="mt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ error.technicalMessage }}
          </p>
        </div>

        <!-- Show error details if available -->
        <div v-if="error.details && error.details.length > 0" class="mt-2">
          <ul class="list-disc list-inside text-xs text-gray-600 dark:text-gray-300">
            <li v-for="(detail, index) in error.details" :key="index">
              {{ detail.field ? `${detail.field}: ` : '' }}{{ detail.message }}
            </li>
          </ul>
        </div>

        <!-- Show request ID if available -->
        <div v-if="error.requestId" class="mt-2">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            ID de solicitud: {{ error.requestId }}
          </p>
        </div>

        <!-- Show retry button for retryable errors -->
        <div v-if="error.code && isRetryableError(error.code) && onRetry" class="mt-3">
          <button
            @click="handleRetry"
            :disabled="isRetrying"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isRetrying"
              class="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isRetrying ? 'Reintentando...' : 'Reintentar' }}
          </button>
        </div>
      </div>

      <!-- Close button -->
      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          @click="$emit('close')"
          class="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <span class="sr-only">Cerrar</span>
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import {
    ErrorSeverity,
    getErrorBackgroundColor,
    getErrorColor,
    getErrorIcon,
    isRetryableError,
    type EnhancedError,
  } from '@/utils/errorHandler'

  interface Props {
    error: EnhancedError | null
    dismissible?: boolean
    showTechnicalDetails?: boolean
    onRetry?: () => Promise<void> | void
  }

  interface Emits {
    (e: 'close'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    dismissible: false,
    showTechnicalDetails: false,
  })

  const emit = defineEmits<Emits>()

  const isRetrying = ref(false)

  const handleRetry = async () => {
    if (!props.onRetry) return

    try {
      isRetrying.value = true
      await props.onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      isRetrying.value = false
    }
  }
</script>

<style scoped>
  .error-display {
    @apply w-full;
  }

  .error-display .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
