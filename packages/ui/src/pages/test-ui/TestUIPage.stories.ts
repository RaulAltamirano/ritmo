import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TestUIPage from './index.vue'

const meta: Meta<typeof TestUIPage> = {
  title: 'Pages/TestUIPage',
  component: TestUIPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Página completa de demostración que integra todos los componentes de la biblioteca UI. Incluye navegación, ejemplos interactivos y documentación de uso.',
      },
    },
  },
  // Decoradores para proporcionar contexto necesario
  decorators: [
    story => ({
      components: { story },
      template: '<div class="min-h-screen bg-gray-50 dark:bg-gray-900"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Vista completa de la página de prueba con todas las secciones: Components, Typography, States, Icons, Forms, Design System, Brand y Toasts.',
      },
    },
  },
}

// Vista móvil
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Vista optimizada para dispositivos móviles con navegación adaptativa y componentes responsivos.',
      },
    },
  },
}

// Vista tablet
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Vista optimizada para tablets con layout intermedio y componentes adaptados.',
      },
    },
  },
}

// Vista desktop
export const Desktop: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Vista completa para desktop con todas las funcionalidades.',
      },
    },
  },
}
