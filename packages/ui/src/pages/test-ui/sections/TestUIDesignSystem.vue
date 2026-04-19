<template>
  <section id="tokens" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2
        class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Design System
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Design tokens for maintaining consistency
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Colors -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Color Palette
        </h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <div
              class="h-8 w-8 rounded border border-gray-200 bg-primary-500 dark:border-gray-700"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">primary-500</span>
          </div>
          <div class="flex items-center space-x-3">
            <div
              class="h-8 w-8 rounded border border-gray-200 bg-success-500 dark:border-gray-700"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">success-500</span>
          </div>
          <div class="flex items-center space-x-3">
            <div
              class="h-8 w-8 rounded border border-gray-200 bg-warning-500 dark:border-gray-700"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">warning-500</span>
          </div>
        </div>
      </div>

      <!-- Spacing -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Spacing System
        </h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-4">
            <div class="h-4 w-4 rounded bg-primary-500"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">4px (1)</span>
          </div>
          <div class="flex items-center space-x-4">
            <div class="h-8 w-8 rounded bg-primary-500"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">16px (4)</span>
          </div>
          <div class="flex items-center space-x-4">
            <div class="h-12 w-12 rounded bg-primary-500"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">48px (12)</span>
          </div>
        </div>
      </div>

      <!-- Toast Examples -->
      <div
        id="toasts"
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Toast System
        </h3>
        <div class="space-y-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Click on any button below to see different toast variants and their
            capabilities
          </p>

          <!-- Basic Toast Variants -->
          <div>
            <h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300">
              Basic Variants
            </h4>
            <div class="flex flex-wrap gap-2">
              <button
                @click="showBasicToast('info')"
                class="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Info Toast
              </button>
              <button
                @click="showBasicToast('success')"
                class="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Success Toast
              </button>
              <button
                @click="showBasicToast('warning')"
                class="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Warning Toast
              </button>
              <button
                @click="showBasicToast('error')"
                class="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Error Toast
              </button>
            </div>
          </div>

          <!-- Toast with Actions -->
          <div>
            <h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300">
              Interactive Toasts
            </h4>
            <div class="flex flex-wrap gap-2">
              <button
                @click="showToastWithActions('update')"
                class="rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Update Available
              </button>
              <button
                @click="showToastWithActions('connection')"
                class="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Connection Error
              </button>
              <button
                @click="showToastWithActions('session')"
                class="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Session Warning
              </button>
            </div>
          </div>

          <!-- Custom Duration Toasts -->
          <div>
            <h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300">
              Custom Duration
            </h4>
            <div class="flex flex-wrap gap-2">
              <button
                @click="showCustomDurationToast('short')"
                class="rounded-lg bg-gray-500 px-3 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Quick (2s)
              </button>
              <button
                @click="showCustomDurationToast('long')"
                class="rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Persistent (15s)
              </button>
              <button
                @click="showCustomDurationToast('infinite')"
                class="rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Manual Close
              </button>
            </div>
          </div>

          <!-- Success Toast Example -->
          <div>
            <h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300">
              Success Example
            </h4>
            <button
              @click="handleLogin"
              class="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Test Success Toast
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  // Props para recibir la referencia del toast desde el componente padre
  interface Props {
    toastRef?: any
  }

  const props = defineProps<Props>()

  interface ToastActions {
    key: string
    label: string
    variant: string
    onClick: () => void
  }

  // Function to show different types of toasts
  const showBasicToast = (variant: string) => {
    if (props.toastRef?.value?.show) {
      props.toastRef.value.show(`This is a ${variant} toast.`, {
        variant: variant as 'info' | 'success' | 'warning' | 'error',
        title: variant.charAt(0).toUpperCase() + variant.slice(1),
        duration: 5000,
      })
    } else {
      console.log(`Toast system not available. Would show ${variant} toast.`)
    }
  }

  const showToastWithActions = (type: string) => {
    if (props.toastRef?.value?.show) {
      let title = type.charAt(0).toUpperCase() + type.slice(1)
      let message = `This is a ${type} toast with actions.`
      let duration = 5000
      let actions: any[] = []

      if (type === 'update') {
        title = 'Update Available'
        message = 'A new update is available for your application.'
        duration = 8000
        actions = [
          {
            key: 'update-now',
            label: 'Update Now',
            variant: 'primary',
            onClick: () => {
              console.log('Starting update...')
              props.toastRef?.value?.show('Update started...', {
                variant: 'success',
                title: 'Progress',
                duration: 3000,
              })
            },
          },
          {
            key: 'remind-later',
            label: 'Remind Later',
            variant: 'secondary',
            onClick: () => {
              console.log('Reminder scheduled')
            },
          },
        ]
      } else if (type === 'connection') {
        title = 'Connection Error'
        message = 'Could not connect to the server. Please check your network.'
        duration = 10000
        actions = [
          {
            key: 'retry',
            label: 'Retry',
            variant: 'primary',
            onClick: () => {
              console.log('Retrying connection...')
              props.toastRef?.value?.show('Retrying connection...', {
                variant: 'info',
                title: 'Connecting',
                duration: 3000,
              })
            },
          },
          {
            key: 'report',
            label: 'Report',
            variant: 'destructive',
            onClick: () => {
              console.log('Reporting error...')
            },
          },
        ]
      } else if (type === 'session') {
        title = 'Session Warning'
        message = 'Your session will expire in 5 minutes. Please save your work.'
        duration = 12000
        actions = [
          {
            key: 'extend',
            label: 'Extend Session',
            variant: 'primary',
            onClick: () => {
              console.log('Extending session...')
              props.toastRef?.value?.show('Session extended successfully', {
                variant: 'success',
                title: 'Session',
                duration: 3000,
              })
            },
          },
          {
            key: 'logout',
            label: 'Logout',
            variant: 'destructive',
            onClick: () => {
              console.log('Logging out...')
            },
          },
        ]
      }

      props.toastRef.value.show(message, {
        variant: type as 'info' | 'success' | 'warning' | 'error',
        title: title,
        duration: duration,
        actions: actions,
      })
    } else {
      console.log(`Toast system not available. Would show ${type} toast with actions.`)
    }
  }

  const showCustomDurationToast = (durationType: string) => {
    if (props.toastRef?.value?.show) {
      let duration: number = 5000 // Default duration
      let message: string = 'Toast message'
      let title: string = 'Toast'

      if (durationType === 'short') {
        duration = 2000
        message = 'This toast will close in 2 seconds.'
        title = 'Quick Toast'
      } else if (durationType === 'long') {
        duration = 15000
        message = 'This toast will close in 15 seconds.'
        title = 'Persistent Toast'
      } else if (durationType === 'infinite') {
        duration = 0 // Infinite duration
        message = 'This toast will not close automatically. Click the close button.'
        title = 'Manual Close Toast'
      }

      props.toastRef.value.show(message, {
        variant: 'info',
        title: title,
        duration: duration,
      })
    } else {
      console.log(
        `Toast system not available. Would show ${durationType} duration toast.`,
      )
    }
  }

  const handleLogin = () => {
    if (props.toastRef?.value?.show) {
      // Success toast with action buttons (example)
      props.toastRef.value.show('Action completed successfully!', {
        variant: 'success',
        title: 'Success',
        duration: 5000,
        actions: [
          {
            key: 'view-profile',
            label: 'View Profile',
            variant: 'primary',
            onClick: () => {
              console.log('Navigating to profile...')
              // Here you could navigate to the profile
            },
          },
          {
            key: 'dismiss',
            label: 'Close',
            variant: 'ghost',
            onClick: () => {
              console.log('Toast closed by user')
            },
          },
        ],
      })
    } else {
      console.log('Toast system not available. Would show success toast.')
    }
  }
</script>
