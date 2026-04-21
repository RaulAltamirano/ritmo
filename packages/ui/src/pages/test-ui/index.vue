<script setup lang="ts">
  import { ref } from 'vue'
  import BaseToast from '../../components/atoms/BaseToast.vue'
  import ClientOnly from '../../components/atoms/ClientOnly.vue'
  import TestUIBanner from './components/TestUIBanner.vue'
  import TestUIHeader from './components/TestUIHeader.vue'
  import TestUIIcons from './components/TestUIIcons.vue'
  import TestUIBrand from './sections/TestUIBrand.vue'
  import TestUIComponents from './sections/TestUIComponents.vue'
  import TestUIDesignSystem from './sections/TestUIDesignSystem.vue'
  import TestUIForms from './sections/TestUIForms.vue'
  import TestUIStates from './sections/TestUIStates.vue'
  import TestUITypography from './sections/TestUITypography.vue'

  // References
  const toastRef = ref()

  // Navigation sections with enhanced metadata
  const sections = [
    {
      id: 'components',
      name: 'Components',
      icon: '🧩',
      description: 'Componentes base del sistema de diseño',
    },
    {
      id: 'typography',
      name: 'Typography',
      icon: '📝',
      description: 'Sistema de tipografía y tokens',
    },
    {
      id: 'states',
      name: 'States',
      icon: '🔄',
      description: 'Estados interactivos y animaciones',
    },
    {
      id: 'icons',
      name: 'Icon System',
      icon: '🎨',
      description: 'Sistema de iconos y símbolos',
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: '📋',
      description: 'Componentes de formulario',
    },
    {
      id: 'tokens',
      name: 'Design System',
      icon: '🎯',
      description: 'Tokens y sistema de diseño',
    },
    {
      id: 'ritmo-logo',
      name: 'Brand',
      icon: '🏷️',
      description: 'Componentes de marca',
    },
    {
      id: 'toasts',
      name: 'Toasts',
      icon: '🍞',
      description: 'Sistema de notificaciones',
    },
  ]

  // Handle section change with accessibility
  const handleSectionChange = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      console.log(`Navegando a la sección: ${section.name}`)
    }
  }

  // Expose toast ref for child components
  defineExpose({
    toastRef,
  })
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
  >
    <!-- Header with navigation -->
    <TestUIHeader :sections="sections" @section-change="handleSectionChange" />

    <!-- Main content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Informational banner -->
      <TestUIBanner />

      <!-- Core Components -->
      <TestUIComponents />

      <!-- Typography System -->
      <TestUITypography />

      <!-- State Components -->
      <TestUIStates />

      <!-- Icon System -->
      <TestUIIcons />

      <!-- Forms -->
      <TestUIForms />

      <!-- Design System -->
      <TestUIDesignSystem :toast-ref="toastRef" />

      <!-- Brand Components -->
      <TestUIBrand />
    </main>

    <!-- Toast Container -->
    <ClientOnly>
      <BaseToast ref="toastRef" />
    </ClientOnly>

    <!-- Accessibility Live Region -->
    <div id="a11y-live-region" aria-live="polite" aria-atomic="true" class="sr-only" />
  </div>
</template>

<style scoped>
  /* Custom styles for test page */
  .min-h-screen {
    min-height: 100vh;
  }

  /* Smooth scrolling for navigation */
  html {
    scroll-behavior: smooth;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .bg-gradient-to-br {
      background: linear-gradient(to bottom right, #000000, #ffffff) !important;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .bg-gradient-to-br {
      background: #f9fafb !important;
    }

    html {
      scroll-behavior: auto;
    }
  }

  /* Print styles */
  @media print {
    .min-h-screen {
      min-height: auto;
    }

    .bg-gradient-to-br {
      background: #ffffff !important;
    }
  }
</style>
