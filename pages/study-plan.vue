<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader
      title="Study Plan"
      subtitle="Manage and organize your academic journey"
      size="lg"
    />
    
    <!-- Content will be added here -->
    <div class="mt-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p class="text-gray-600 dark:text-gray-400 text-center">
          Study Plan content will be implemented here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Study Plan',
  description: 'Manage and organize your academic journey',
  requiresAuth: true
})
</script> 