<template>
  <svg
    :class="iconClass"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="ariaLabel"
    role="img"
  >
    <!-- Clock icon -->
    <path
      v-if="name === 'clock'"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill="currentColor"
    />

    <!-- Refresh icon -->
    <path
      v-else-if="name === 'refresh-cw'"
      d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Loader/Spinner icon -->
    <path
      v-else-if="name === 'loader'"
      d="M21 12a9 9 0 11-6.219-8.56"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- X/Close icon -->
    <path
      v-else-if="name === 'x'"
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Timer icon -->
    <path
      v-else-if="name === 'timer'"
      d="M10 2h4a2 2 0 0 1 2 2v2H8V4a2 2 0 0 1 2-2zM4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Monitor icon -->
    <path
      v-else-if="name === 'monitor'"
      d="M22 12h-4l-3 9L9 3l-3 9H2"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Eye icon -->
    <path
      v-else-if="name === 'eye'"
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Eye off icon -->
    <path
      v-else-if="name === 'eye-off'"
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24m-1.07-1.07a3 3 0 0 0-4.24 4.24"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Alert circle icon -->
    <path
      v-else-if="name === 'alert-circle'"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      fill="currentColor"
    />

    <!-- Check circle icon -->
    <path
      v-else-if="name === 'check-circle'"
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Default fallback -->
    <path
      v-else
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill="currentColor"
    />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    name: string
    size?: number | string
    class?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 24,
    class: '',
    ariaLabel: undefined,
  })

  // Computed properties
  const iconClass = computed(() => {
    const baseClass = 'icon'
    return props.class ? `${baseClass} ${props.class}` : baseClass
  })

  const viewBox = computed(() => {
    // Ajustar viewBox según el icono
    if (
      ['refresh-cw', 'loader', 'x', 'timer', 'monitor', 'eye', 'eye-off'].includes(
        props.name,
      )
    ) {
      return '0 0 24 24'
    }
    return '0 0 24 24'
  })
</script>

<style scoped>
  .icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }

  /* Animación para loader/spinner */
  .icon[name='loader'] {
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
