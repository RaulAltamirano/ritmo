<script setup lang="ts">
  interface BaseNavbarProps {
    ariaLabel?: string
    showMobileMenu?: boolean
  }

  const props = withDefaults(defineProps<BaseNavbarProps>(), {
    ariaLabel: 'Main navigation',
    showMobileMenu: false,
  })
</script>

<template>
  <!-- Main navbar (top) -->
  <nav
    :class="[
      'ritmo-app-nav fixed top-0 left-0 right-0 z-[9999]',
      'border-0 shadow-none outline-none ring-0',
      'antialiased [backface-visibility:hidden] [transform:translate3d(0,0,0)]',
      showMobileMenu ? 'min-h-16' : 'h-16',
    ]"
    role="navigation"
    :aria-label="ariaLabel"
    :style="{ backgroundColor: 'var(--color-canvas)', opacity: 1 }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and brand -->
        <div class="flex items-center space-x-3">
          <slot name="logo">
            <div
              class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">R</span>
            </div>
          </slot>
          <div class="hidden sm:block">
            <slot name="brand">
              <h1 class="text-lg font-bold text-gray-900 dark:text-white">App</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">Your application</p>
            </slot>
          </div>
        </div>

        <!-- Main navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <slot name="nav-items">
            <!-- Default nav items will be provided by parent -->
          </slot>
        </div>

        <!-- Right side actions -->
        <div class="flex items-center space-x-2">
          <slot name="actions">
            <!-- Actions will be provided by parent -->
          </slot>
        </div>
      </div>
    </div>

    <!-- Mobile dropdown menu -->
    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-outline/60 bg-canvas shadow-lg"
    >
      <div class="px-4 py-2 space-y-1">
        <slot name="mobile-menu">
          <!-- Mobile menu content will be provided by parent -->
        </slot>
      </div>
    </div>
  </nav>

  <!-- Spacer for content -->
  <div class="h-16"></div>
</template>

<style scoped>
  /*
   * Opaque bar only: translucent bg + backdrop-filter create a compositor hairline under the header.
   * !important so no utility reintroduces blur or partial opacity.
   */
  .ritmo-app-nav {
    background-color: var(--color-canvas) !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
  }

  /* Smooth animations */
  .transition-all {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced backdrop blur effect */
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* Subtle gradients */
  .bg-gradient-to-br {
    background: linear-gradient(135deg, var(--tw-gradient-stops));
  }

  /* Dropdown animation */
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: all 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
