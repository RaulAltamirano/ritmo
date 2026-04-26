import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseLoadingSpinner from './BaseLoadingSpinner.vue'

const meta: Meta<typeof BaseLoadingSpinner> = {
  title: 'Atoms/BaseLoadingSpinner',
  component: BaseLoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de loading spinner personalizado con logo de Ritmo animado. Incluye múltiples tamaños, variantes y texto de carga. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Tamaño del spinner',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal', 'with-text'],
      description: 'Variante del spinner',
    },
    loadingText: {
      control: { type: 'text' },
      description: 'Texto de carga',
    },
    showText: {
      control: { type: 'boolean' },
      description: 'Mostrar texto de carga',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Etiqueta para accesibilidad',
    },
  },
  args: {
    size: 'md',
    variant: 'default',
    loadingText: 'Cargando...',
    showText: true,
    ariaLabel: 'Cargando contenido',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseLoadingSpinner },
    setup() {
      return { args }
    },
    template: '<BaseLoadingSpinner v-bind="args" />',
  }),
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="flex items-center gap-8">
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="xs" />
          <span class="text-xs text-gray-600 dark:text-gray-400">xs</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="sm" />
          <span class="text-xs text-gray-600 dark:text-gray-400">sm</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="md" />
          <span class="text-xs text-gray-600 dark:text-gray-400">md</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="lg" />
          <span class="text-xs text-gray-600 dark:text-gray-400">lg</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="xl" />
          <span class="text-xs text-gray-600 dark:text-gray-400">xl</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseLoadingSpinner size="2xl" />
          <span class="text-xs text-gray-600 dark:text-gray-400">2xl</span>
        </div>
      </div>
    `,
  }),
}

// Variantes
export const Variants: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-8">
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner variant="default" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Default</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner variant="minimal" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Minimal</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner variant="with-text" />
          <span class="text-sm text-gray-600 dark:text-gray-400">With Text</span>
        </div>
      </div>
    `,
  }),
}

// Textos personalizados
export const CustomTexts: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner loading-text="Inicializando aplicación..." />
          <span class="text-sm text-gray-600 dark:text-gray-400">Inicialización</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner loading-text="Sincronizando datos..." />
          <span class="text-sm text-gray-600 dark:text-gray-400">Sincronización</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner loading-text="Procesando información..." />
          <span class="text-sm text-gray-600 dark:text-gray-400">Procesamiento</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner loading-text="Conectando al servidor..." />
          <span class="text-sm text-gray-600 dark:text-gray-400">Conexión</span>
        </div>
      </div>
    `,
  }),
}

// Sin texto
export const WithoutText: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner :show-text="false" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Sin texto</span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner variant="minimal" :show-text="false" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Minimal sin texto</span>
        </div>
      </div>
    `,
  }),
}

// Comparación de tamaños
export const SizeComparison: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Con Texto</h3>
          <div class="flex items-center gap-8">
            <BaseLoadingSpinner size="xs" />
            <BaseLoadingSpinner size="sm" />
            <BaseLoadingSpinner size="md" />
            <BaseLoadingSpinner size="lg" />
            <BaseLoadingSpinner size="xl" />
            <BaseLoadingSpinner size="2xl" />
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sin Texto</h3>
          <div class="flex items-center gap-8">
            <BaseLoadingSpinner size="xs" :show-text="false" />
            <BaseLoadingSpinner size="sm" :show-text="false" />
            <BaseLoadingSpinner size="md" :show-text="false" />
            <BaseLoadingSpinner size="lg" :show-text="false" />
            <BaseLoadingSpinner size="xl" :show-text="false" />
            <BaseLoadingSpinner size="2xl" :show-text="false" />
          </div>
        </div>
      </div>
    `,
  }),
}

// Loading spinner en contexto
export const InContext: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BaseLoadingSpinner size="lg" loading-text="Cargando dashboard..." />
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
            Preparando tu experiencia personalizada
          </p>
        </div>
        
        <div class="flex flex-col items-center gap-4 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <BaseLoadingSpinner size="lg" loading-text="Sincronizando..." />
          <p class="text-sm text-blue-600 dark:text-blue-400 text-center">
            Actualizando datos en tiempo real
          </p>
        </div>
        
        <div class="flex flex-col items-center gap-4 p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <BaseLoadingSpinner size="lg" loading-text="Procesando..." />
          <p class="text-sm text-green-600 dark:text-green-400 text-center">
            Aplicando cambios al sistema
          </p>
        </div>
      </div>
    `,
  }),
}

// Loading spinner en pantalla completa
export const FullScreen: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div class="flex flex-col items-center gap-6">
          <BaseLoadingSpinner size="2xl" loading-text="Cargando Ritmo..." />
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Preparando tu experiencia de productividad personalizada
          </p>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'fullscreen',
  },
}

// Loading spinner en cards
export const InCards: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <BaseLoadingSpinner size="md" loading-text="Cargando perfil..." />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Perfil de Usuario</h3>
          </div>
        </div>
        
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <BaseLoadingSpinner size="md" loading-text="Cargando estadísticas..." />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas</h3>
          </div>
        </div>
        
        <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center gap-4">
            <BaseLoadingSpinner size="md" loading-text="Cargando actividades..." />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actividades</h3>
          </div>
        </div>
      </div>
    `,
  }),
}

// Loading spinner accesible
export const Accessible: Story = {
  render: () => ({
    components: { BaseLoadingSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner 
            size="lg" 
            loading-text="Cargando contenido principal"
            aria-label="Cargando contenido principal de la aplicación"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner con aria-label descriptivo
          </span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner 
            size="lg" 
            loading-text="Sincronizando datos"
            aria-label="Sincronizando datos con el servidor"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner con aria-label específico
          </span>
        </div>
        
        <div class="flex flex-col items-center gap-4">
          <BaseLoadingSpinner 
            size="lg" 
            loading-text="Procesando formulario"
            aria-label="Procesando formulario de registro"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Spinner con aria-label detallado
          </span>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseLoadingSpinner },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <BaseLoadingSpinner v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Loading spinner con roles ARIA apropiados y navegación por teclado
        </p>
      </div>
    `,
  }),
  args: {
    'aria-label': 'Loading spinner accesible con navegación por teclado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
