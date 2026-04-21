<script setup lang="ts">
  import RitmoLogo from '../../../components/atoms/RitmoLogo.vue'
  import DarkModeToggle from '../../../components/molecules/DarkModeToggle.vue'
  import RitmoBrand from '../../../components/molecules/RitmoBrand.vue'
  import ClientOnly from '../../../components/atoms/ClientOnly.vue'
</script>

<template>
  <section id="ritmo-logo" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2
        class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Brand Components
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Components for displaying the Ritmo brand with dark mode support
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- RitmoLogo Component -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          RitmoLogo - Base Component
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Default:</span>
            <RitmoLogo variant="default" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Primary:</span>
            <RitmoLogo variant="primary" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">White:</span>
            <div class="rounded bg-gray-800 p-2 dark:bg-gray-200">
              <RitmoLogo variant="white" />
            </div>
          </div>
        </div>
      </div>

      <!-- RitmoBrand Component -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          RitmoBrand - Logo with Text
        </h3>
        <div class="space-y-4">
          <RitmoBrand variant="default" />
          <RitmoBrand variant="primary" />
          <RitmoBrand :show-tagline="true" />
        </div>
      </div>
    </div>

    <!-- Usage in Header -->
    <div
      class="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20"
    >
      <h3
        class="mb-4 text-xl font-semibold leading-tight tracking-tight text-blue-900 font-display dark:text-blue-100"
      >
        Header Usage Example
      </h3>
      <div class="flex items-center justify-between">
        <RitmoBrand size="lg" variant="primary" :show-tagline="true" />
        <div class="flex items-center space-x-4">
          <span class="text-sm text-blue-700 dark:text-blue-300">v2.0</span>
          <ClientOnly>
            <DarkModeToggle />
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>
