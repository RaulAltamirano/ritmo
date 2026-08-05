<script setup lang="ts">
  definePageMeta({
    title: 'Dashboard',
    description: 'Redirects to Today',
  })

  await navigateTo('/today', { replace: true })
</script>

<template>
  <div />
</template>
