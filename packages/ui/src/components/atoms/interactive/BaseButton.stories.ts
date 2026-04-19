import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseButton from './BaseButton.vue'

const meta: Meta<typeof BaseButton> = {
  title: 'Design System/Atoms/Interactive/BaseButton',
  component: BaseButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de botón versátil con múltiples variantes, tamaños, estados y accesibilidad completa. Incluye soporte para iconos, loading states y micro-interacciones. Compatible con WCAG 2.1 AA y navegación por teclado.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'ghost',
        'outline',
      ],
      description: 'Variante visual del botón',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del botón',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Estado deshabilitado del botón',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Estado de carga con spinner',
    },
    loadingVariant: {
      control: { type: 'select' },
      options: ['circular', 'dots'],
      description: 'Tipo de spinner para el estado de carga',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Botón de ancho completo',
    },
    iconRight: {
      control: { type: 'boolean' },
      description: 'Posición del icono: false = izquierda, true = derecha',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
        category: 'Icon',
      },
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    loadingVariant: 'circular',
    fullWidth: false,
    iconRight: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Principal</BaseButton>',
  }),
}

// Variantes de color
export const Primary: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Primario</BaseButton>',
  }),
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Secundario</BaseButton>',
  }),
  args: {
    variant: 'secondary',
  },
}

export const Success: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón de Éxito</BaseButton>',
  }),
  args: {
    variant: 'success',
  },
}

export const Warning: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón de Advertencia</BaseButton>',
  }),
  args: {
    variant: 'warning',
  },
}

export const Error: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón de Error</BaseButton>',
  }),
  args: {
    variant: 'error',
  },
}

export const Ghost: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Fantasma</BaseButton>',
  }),
  args: {
    variant: 'ghost',
  },
}

export const Outline: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Contorno</BaseButton>',
  }),
  args: {
    variant: 'outline',
  },
}

// Tamaños
export const ExtraSmall: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">XS</BaseButton>',
  }),
  args: {
    size: 'xs',
  },
}

export const Small: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Small</BaseButton>',
  }),
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Medium</BaseButton>',
  }),
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Large</BaseButton>',
  }),
  args: {
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Extra Large</BaseButton>',
  }),
  args: {
    size: 'xl',
  },
}

// Estados
export const Disabled: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Deshabilitado</BaseButton>',
  }),
  args: {
    disabled: true,
  },
}

export const Loading: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Cargando...</BaseButton>',
  }),
  args: {
    loading: true,
    loadingVariant: 'circular',
  },
}

export const LoadingWithDots: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Procesando...</BaseButton>',
  }),
  args: {
    loading: true,
    loadingVariant: 'dots',
  },
}

export const LoadingWithText: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Procesando...</BaseButton>',
  }),
  args: {
    loading: true,
    loadingVariant: 'circular',
  },
}

// Con iconos
export const WithLeftIcon: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Agregar Item</BaseButton>',
  }),
  args: {
    iconRight: false,
  },
}

export const WithRightIcon: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Continuar</BaseButton>',
  }),
  args: {
    iconRight: true,
  },
}

export const IconOnly: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args" aria-label="Configuración"></BaseButton>',
  }),
  args: {
    iconRight: false,
  },
}

// Ancho completo
export const FullWidth: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón de Ancho Completo</BaseButton>',
  }),
  args: {
    fullWidth: true,
  },
}

// Combinaciones
export const LargeSuccessWithIcon: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Confirmar Acción</BaseButton>',
  }),
  args: {
    variant: 'success',
    size: 'lg',
    iconRight: false,
  },
}

export const SmallWarningLoading: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Guardando...</BaseButton>',
  }),
  args: {
    variant: 'warning',
    size: 'sm',
    loading: true,
  },
}

// Interactivo
export const Interactive: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Haz clic aquí</BaseButton>',
  }),
  args: {},
  parameters: {
    interactions: {
      disable: false,
    },
  },
  // Play function para testing automatizado de accesibilidad e interacciones
  play: async ({ canvasElement, args }) => {
    // Simulación de testing library - se activará cuando @storybook/test esté disponible
    const canvas = canvasElement
    const button = canvas.querySelector('button')

    if (button) {
      // Test de accesibilidad básica
      console.log('Button found:', button)
      console.log('Button role:', button.getAttribute('role'))

      // Test de interacción
      const clickEvent = new Event('click', { bubbles: true })
      button.dispatchEvent(clickEvent)

      // Test de keyboard navigation
      button.focus()
      console.log('Button focused:', document.activeElement === button)

      // Test de Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      button.dispatchEvent(enterEvent)

      // Test de Space key
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      })
      button.dispatchEvent(spaceEvent)
    }
  },
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Botón Accesible</BaseButton>',
  }),
  args: {
    ariaLabel: 'Botón para realizar acción principal',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
}

// Comparación de variantes de loading
export const LoadingVariants: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Loading Circular (por defecto)</h3>
          <div class="flex items-center gap-4">
            <BaseButton loading loadingVariant="circular" variant="primary">Cargando...</BaseButton>
            <BaseButton loading loadingVariant="circular" variant="success" size="lg">Procesando...</BaseButton>
            <BaseButton loading loadingVariant="circular" variant="ghost">Guardando...</BaseButton>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Loading Dots</h3>
          <div class="flex items-center gap-4">
            <BaseButton loading loadingVariant="dots" variant="primary">Cargando...</BaseButton>
            <BaseButton loading loadingVariant="dots" variant="success" size="lg">Procesando...</BaseButton>
            <BaseButton loading loadingVariant="dots" variant="ghost">Guardando...</BaseButton>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Comparación de Tamaños</h3>
          <div class="flex items-center gap-4">
            <BaseButton loading loadingVariant="circular" size="sm">XS</BaseButton>
            <BaseButton loading loadingVariant="circular" size="md">MD</BaseButton>
            <BaseButton loading loadingVariant="dots" size="lg">LG</BaseButton>
            <BaseButton loading loadingVariant="circular" size="xl">XL</BaseButton>
          </div>
        </div>
      </div>
    `,
  }),
}

// Dark Mode
export const DarkMode: Story = {
  render: () => ({
    components: { BaseButton },
    setup() {
      return { Check, AlertTriangle, Heart, Star, Settings }
    },
    template: `
      <div class="dark p-8 bg-gray-900 min-h-screen">
        <div class="space-y-8">
          <h2 class="text-2xl font-bold text-white mb-6">Dark Mode Buttons</h2>
          
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-white">Variantes Principales</h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton variant="primary">Primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="success">Success</BaseButton>
              <BaseButton variant="warning">Warning</BaseButton>
              <BaseButton variant="error">Error</BaseButton>
              <BaseButton variant="info">Info</BaseButton>
              <BaseButton variant="ghost">Ghost</BaseButton>
              <BaseButton variant="outline">Outline</BaseButton>
            </div>
          </div>
          
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-white">Con Iconos</h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton variant="primary" :icon="Check">Confirmar</BaseButton>
              <BaseButton variant="success" :icon="Heart">Favorito</BaseButton>
              <BaseButton variant="warning" :icon="AlertTriangle">Alerta</BaseButton>
              <BaseButton variant="ghost" :icon="Settings">Configurar</BaseButton>
            </div>
          </div>
          
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-white">Estados de Carga</h3>
            <div class="flex flex-wrap gap-4">
              <BaseButton variant="primary" loading>Cargando...</BaseButton>
              <BaseButton variant="success" loading loadingVariant="dots">Procesando...</BaseButton>
              <BaseButton variant="ghost" loading>Guardando...</BaseButton>
            </div>
          </div>
          
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-white">Tamaños</h3>
            <div class="flex items-center gap-4">
              <BaseButton size="xs">XS</BaseButton>
              <BaseButton size="sm">SM</BaseButton>
              <BaseButton size="md">MD</BaseButton>
              <BaseButton size="lg">LG</BaseButton>
              <BaseButton size="xl">XL</BaseButton>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Demuestra cómo se ven los botones en modo oscuro con todos los colores optimizados.',
      },
    },
  },
}
