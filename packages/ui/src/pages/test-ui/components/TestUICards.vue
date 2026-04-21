<script setup lang="ts">
  import BaseCard from '../../../components/atoms/BaseCard.vue'
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
  >
    <h3
      class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
    >
      Cards
    </h3>
    <div class="space-y-4">
      <BaseCard variant="elevated" title="Elevated Card" subtitle="Basic variant">
        <p class="text-productivity text-gray-600 dark:text-gray-300">
          Clean design with subtle borders and shadows.
        </p>
      </BaseCard>
      <BaseCard variant="elevated" title="Elevated Card" subtitle="With shadow">
        <p class="text-productivity text-gray-600 dark:text-gray-300">
          Prominent shadow for elevated content hierarchy.
        </p>
      </BaseCard>
      <BaseCard variant="minimalist" title="Minimalist Card" subtitle="Clean design">
        <p class="text-productivity text-gray-600 dark:text-gray-300">
          Defined borders for minimalist design approach.
        </p>
      </BaseCard>
      <BaseCard
        variant="glassmorphism"
        title="Glassmorphism Card"
        subtitle="Glassmorphism effect"
      >
        <p class="text-productivity text-gray-600 dark:text-gray-300">
          Modern glass effect with backdrop blur and transparency.
        </p>
      </BaseCard>
    </div>
  </div>
</template>
