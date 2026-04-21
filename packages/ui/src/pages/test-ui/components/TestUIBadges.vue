<script setup lang="ts">
  import BaseBadge from '../../../components/atoms/BaseBadge.vue'
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
  >
    <h3
      class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
    >
      Status Badges
    </h3>
    <div class="flex flex-wrap gap-3">
      <BaseBadge variant="default">Default</BaseBadge>
      <BaseBadge variant="primary">Primary</BaseBadge>
      <BaseBadge variant="success">Success</BaseBadge>
      <BaseBadge variant="warning">Warning</BaseBadge>
      <BaseBadge variant="error">Error</BaseBadge>
    </div>
  </div>
</template>
