<script setup lang="ts">
  import BaseAlert from '../../../components/atoms/BaseAlert.vue'
  import BaseSkeleton from '../../../components/atoms/BaseSkeleton.vue'
  import BaseSpinner from '../../../components/atoms/BaseSpinner.vue'
</script>

<template>
  <section id="states" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2
        class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        State & Feedback Components
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Components for displaying different application states
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Skeletons -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Loading Skeletons
        </h3>
        <div class="space-y-4">
          <div class="space-y-3">
            <BaseSkeleton variant="text" size="sm" />
            <BaseSkeleton variant="text" size="md" />
            <BaseSkeleton variant="text" size="lg" />
          </div>
          <div class="flex space-x-4">
            <BaseSkeleton variant="circular" size="sm" />
            <BaseSkeleton variant="circular" size="md" />
            <BaseSkeleton variant="circular" size="lg" />
          </div>
          <div class="flex space-x-4">
            <BaseSkeleton variant="avatar" />
            <BaseSkeleton variant="button" />
            <BaseSkeleton variant="card" />
          </div>
          <div class="space-y-3">
            <BaseSkeleton variant="paragraph" />
            <BaseSkeleton variant="table" />
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Alert System
        </h3>
        <div class="space-y-4">
          <BaseAlert variant="info" title="Information" dismissible>
            This is an informational alert with important details.
          </BaseAlert>
          <BaseAlert variant="success" title="Success">
            Operation completed successfully!
          </BaseAlert>
          <BaseAlert variant="warning" title="Warning">
            Please review your input before continuing.
          </BaseAlert>
          <BaseAlert variant="error" title="Error">
            An error has occurred. Please try again.
          </BaseAlert>
        </div>
      </div>
    </div>

    <!-- Loading indicators -->
    <div
      class="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3
        class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Loading Indicators
      </h3>
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Circular</h4>
          <div class="flex justify-center space-x-4">
            <BaseSpinner size="sm" variant="circular" />
            <BaseSpinner size="md" variant="circular" />
            <BaseSpinner size="lg" variant="circular" />
          </div>
        </div>
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Dots</h4>
          <div class="flex justify-center space-x-4">
            <BaseSpinner size="sm" variant="dots" />
            <BaseSpinner size="md" variant="dots" />
            <BaseSpinner size="lg" variant="dots" />
          </div>
        </div>
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Bars</h4>
          <div class="flex justify-center space-x-4">
            <BaseSpinner size="sm" variant="bars" />
            <BaseSpinner size="md" variant="bars" />
            <BaseSpinner size="lg" variant="bars" />
          </div>
        </div>
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Pulse</h4>
          <div class="flex justify-center space-x-4">
            <BaseSpinner size="sm" variant="pulse" />
            <BaseSpinner size="md" variant="pulse" />
            <BaseSpinner size="lg" variant="pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading with text -->
    <div
      class="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3
        class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Loading with Context
      </h3>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Loading...</h4>
          <div
            class="inline-flex flex-col items-center justify-center animate-content-float space-y-4"
            role="status"
            aria-label="Loading content"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g class="transition-all duration-300 ease-out">
                  <rect
                    x="10"
                    y="22"
                    width="3"
                    height="8"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0s"
                  ></rect>
                  <rect
                    x="17"
                    y="16"
                    width="3"
                    height="14"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.15s"
                  ></rect>
                  <rect
                    x="24"
                    y="20"
                    width="3"
                    height="10"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.3s"
                  ></rect>
                  <rect
                    x="31"
                    y="12"
                    width="3"
                    height="18"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.45s"
                  ></rect>
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">
            Processing...
          </h4>
          <div
            class="inline-flex flex-col items-center justify-center animate-content-float space-y-4"
            role="status"
            aria-label="Loading content"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g class="transition-all duration-300 ease-out">
                  <rect
                    x="10"
                    y="22"
                    width="3"
                    height="8"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.15s"
                  ></rect>
                  <rect
                    x="17"
                    y="16"
                    width="3"
                    height="14"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.15s"
                  ></rect>
                  <rect
                    x="24"
                    y="20"
                    width="3"
                    height="10"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.3s"
                  ></rect>
                  <rect
                    x="31"
                    y="12"
                    width="3"
                    height="18"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.45s"
                  ></rect>
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div class="text-center">
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">Saving...</h4>
          <div
            class="inline-flex flex-col items-center justify-center animate-content-float space-y-4"
            role="status"
            aria-label="Loading content"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g class="transition-all duration-300 ease-out">
                  <rect
                    x="10"
                    y="22"
                    width="3"
                    height="8"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0s"
                  ></rect>
                  <rect
                    x="17"
                    y="16"
                    width="3"
                    height="14"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.15s"
                  ></rect>
                  <rect
                    x="24"
                    y="20"
                    width="3"
                    height="10"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.3s"
                  ></rect>
                  <rect
                    x="31"
                    y="12"
                    width="3"
                    height="18"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.45s"
                  ></rect>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LoadingScreen Component Examples -->
    <div
      class="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3
        class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        LoadingScreen Component
      </h3>
      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Advanced loading states with animated Ritmo logo and smooth transitions
        </p>

        <!-- LoadingScreen Variants -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Full Screen Loading -->
          <div
            class="text-center p-6 border border-gray-200 rounded-lg dark:border-gray-600"
          >
            <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">
              Full Screen
            </h4>
            <div
              class="inline-flex flex-col items-center justify-center animate-content-float space-y-4"
              role="status"
              aria-label="Loading content"
            >
              <div class="flex items-center justify-center">
                <svg
                  class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                  width="48"
                  height="48"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <g class="transition-all duration-300 ease-out">
                    <rect
                      x="10"
                      y="22"
                      width="3"
                      height="8"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0s"
                    ></rect>
                    <rect
                      x="17"
                      y="16"
                      width="3"
                      height="14"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.15s"
                    ></rect>
                    <rect
                      x="24"
                      y="20"
                      width="3"
                      height="10"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.3s"
                    ></rect>
                    <rect
                      x="31"
                      y="12"
                      width="3"
                      height="18"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.45s"
                    ></rect>
                  </g>
                </svg>
              </div>
              <p
                class="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide"
              >
                Loading...
              </p>
            </div>
          </div>

          <!-- Inline Loading -->
          <div
            class="text-center p-6 border border-gray-200 rounded-lg dark:border-gray-600"
          >
            <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">
              Inline Loading
            </h4>
            <div
              class="inline-flex flex-col items-center justify-center animate-content-float space-y-3"
              role="status"
              aria-label="Loading content"
            >
              <div class="flex items-center justify-center">
                <svg
                  class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <g class="transition-all duration-300 ease-out">
                    <rect
                      x="10"
                      y="22"
                      width="3"
                      height="8"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0s"
                    ></rect>
                    <rect
                      x="17"
                      y="16"
                      width="3"
                      height="14"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.15s"
                    ></rect>
                    <rect
                      x="24"
                      y="20"
                      width="3"
                      height="10"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.3s"
                    ></rect>
                    <rect
                      x="31"
                      y="12"
                      width="3"
                      height="18"
                      rx="1.5"
                      class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                      fill="currentColor"
                      style="animation-delay: 0.45s"
                    ></rect>
                  </g>
                </svg>
              </div>
              <p
                class="text-xs font-medium text-gray-600 dark:text-gray-400 tracking-wide"
              >
                Processing...
              </p>
            </div>
          </div>
        </div>

        <!-- Loading with Button -->
        <div
          class="text-center p-6 border border-gray-200 rounded-lg dark:border-gray-600"
        >
          <h4 class="mb-4 font-medium text-gray-700 dark:text-gray-300">
            Loading with Button
          </h4>
          <div
            class="inline-flex flex-col items-center justify-center animate-content-float space-y-4"
            role="status"
            aria-label="Loading content"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-primary-600 dark:text-primary-400 transition-all duration-300 ease-out will-change-transform"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g class="transition-all duration-300 ease-out">
                  <rect
                    x="10"
                    y="22"
                    width="3"
                    height="8"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0s"
                  ></rect>
                  <rect
                    x="17"
                    y="16"
                    width="3"
                    height="14"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.15s"
                  ></rect>
                  <rect
                    x="24"
                    y="20"
                    width="3"
                    height="10"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.3s"
                  ></rect>
                  <rect
                    x="31"
                    y="12"
                    width="3"
                    height="18"
                    rx="1.5"
                    class="fill-current transition-all duration-300 ease-out origin-bottom animate-bar-pulse"
                    fill="currentColor"
                    style="animation-delay: 0.45s"
                  ></rect>
                </g>
              </svg>
            </div>
            <p
              class="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide"
            >
              Saving changes...
            </p>
            <button
              class="inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation px-3 py-1.5 text-sm min-h-[32px] bg-primary-600 dark:bg-primary-500 text-white border-primary-600 dark:border-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 focus:ring-primary-500 rounded-lg shadow-sm opacity-90 animate-button-pulse"
              disabled
              type="button"
            >
              <div
                class="flex items-center justify-center transition-opacity duration-200 opacity-100"
              >
                <span class="" data-content="true">Processing...</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
