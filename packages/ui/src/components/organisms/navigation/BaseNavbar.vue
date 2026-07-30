<script setup lang="ts">
  interface BaseNavbarProps {
    ariaLabel?: string
  }

  withDefaults(defineProps<BaseNavbarProps>(), {
    ariaLabel: 'Account',
  })
</script>

<template>
  <nav
    class="ritmo-app-nav fixed top-0 left-0 right-0 z-[9999] h-14 antialiased [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <div
      class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <slot name="logo">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-600"
          >
            <span class="text-sm font-bold text-white">R</span>
          </div>
        </slot>
        <div class="hidden min-w-0 sm:block">
          <slot name="brand">
            <h1
              class="text-[15px] font-semibold tracking-tight text-secondary-900 dark:text-secondary-50"
            >
              App
            </h1>
          </slot>
        </div>
      </div>

      <div class="flex items-center gap-0.5 sm:gap-1">
        <slot name="actions" />
      </div>
    </div>
  </nav>

  <div class="h-14" aria-hidden="true" />
</template>

<style scoped>
  .ritmo-app-nav {
    background-color: color-mix(in srgb, var(--color-canvas) 94%, transparent);
    border-bottom: 1px solid var(--color-border);
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
  }
</style>
