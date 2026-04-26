import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RitmoBrand from './RitmoBrand.vue'

const meta: Meta<typeof RitmoBrand> = {
  title: 'Molecules/RitmoBrand',
  component: RitmoBrand,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de marca Ritmo que combina el logo con texto y tagline. Incluye diferentes tamaños, variantes de color y opciones de visualización. Ideal para headers, footers y branding general.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del componente',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'monochrome', 'white'],
      description: 'Variante de color',
    },
    showText: {
      control: { type: 'boolean' },
      description: 'Mostrar texto de la marca',
    },
    showTagline: {
      control: { type: 'boolean' },
      description: 'Mostrar tagline',
    },
    brandName: {
      control: { type: 'text' },
      description: 'Nombre de la marca',
    },
    tagline: {
      control: { type: 'text' },
      description: 'Tagline de la marca',
    },
  },
  args: {
    size: 'md',
    variant: 'default',
    showText: true,
    showTagline: false,
    brandName: 'Ritmo',
    tagline: 'Smart Time Management',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { RitmoBrand },
    setup() {
      return { args }
    },
    template: `
      <RitmoBrand v-bind="args" />
    `,
  }),
}

// Diferentes tamaños
export const Sizes: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <RitmoBrand size="sm" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Small</p>
        </div>
        <div class="text-center">
          <RitmoBrand size="md" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Medium</p>
        </div>
        <div class="text-center">
          <RitmoBrand size="lg" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Large</p>
        </div>
        <div class="text-center">
          <RitmoBrand size="xl" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Extra Large</p>
        </div>
      </div>
    `,
  }),
}

// Diferentes variantes
export const Variants: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <RitmoBrand variant="default" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Default</p>
        </div>
        <div class="text-center">
          <RitmoBrand variant="primary" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Primary</p>
        </div>
        <div class="text-center">
          <RitmoBrand variant="monochrome" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Monochrome</p>
        </div>
        <div class="text-center bg-gray-900 p-4 rounded-lg">
          <RitmoBrand variant="white" />
          <p class="text-sm text-gray-400 mt-2">White (on dark background)</p>
        </div>
      </div>
    `,
  }),
}

// Con tagline
export const WithTagline: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <RitmoBrand size="lg" :show-tagline="true" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">With Tagline</p>
        </div>
        <div class="text-center">
          <RitmoBrand size="lg" :show-tagline="true" tagline="Gestión Inteligente del Tiempo" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Custom Tagline</p>
        </div>
      </div>
    `,
  }),
}

// Solo logo
export const LogoOnly: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <RitmoBrand :show-text="false" size="lg" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Logo Only</p>
        </div>
        <div class="text-center">
          <RitmoBrand :show-text="false" size="xl" variant="primary" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Large Primary Logo</p>
        </div>
      </div>
    `,
  }),
}

// En header
export const InHeader: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="w-full max-w-6xl mx-auto">
        <header class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <RitmoBrand size="lg" />
          
          <nav class="hidden md:flex space-x-6">
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Inicio</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Productos</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contacto</a>
          </nav>
          
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Iniciar Sesión
          </button>
        </header>
      </div>
    `,
  }),
}

// En footer
export const InFooter: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="w-full max-w-6xl mx-auto">
        <footer class="bg-gray-900 text-white p-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-4">
              <RitmoBrand variant="white" :show-tagline="true" />
              <p class="text-gray-400 text-sm">
                La plataforma definitiva para gestionar tu tiempo de manera inteligente.
              </p>
            </div>
            
            <div>
              <h3 class="font-semibold mb-4">Producto</h3>
              <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="#" class="hover:text-white">Características</a></li>
                <li><a href="#" class="hover:text-white">Precios</a></li>
                <li><a href="#" class="hover:text-white">Integraciones</a></li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold mb-4">Soporte</h3>
              <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="#" class="hover:text-white">Documentación</a></li>
                <li><a href="#" class="hover:text-white">Contacto</a></li>
                <li><a href="#" class="hover:text-white">Estado</a></li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold mb-4">Empresa</h3>
              <ul class="space-y-2 text-gray-400 text-sm">
                <li><a href="#" class="hover:text-white">Acerca de</a></li>
                <li><a href="#" class="hover:text-white">Blog</a></li>
                <li><a href="#" class="hover:text-white">Carreras</a></li>
              </ul>
            </div>
          </div>
          
          <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Ritmo. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    `,
  }),
}

// En card de producto
export const InProductCard: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="max-w-sm mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div class="text-center mb-6">
            <RitmoBrand size="lg" variant="primary" :show-tagline="true" />
          </div>
          
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestión Inteligente del Tiempo
          </h3>
          
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Optimiza tu productividad con herramientas inteligentes de gestión del tiempo.
          </p>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Análisis automático</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Reportes detallados</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Integración completa</span>
            </div>
          </div>
          
          <button class="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Comenzar Gratis
          </button>
        </div>
      </div>
    `,
  }),
}

// Comparación de variantes
export const VariantComparison: Story = {
  render: () => ({
    components: { RitmoBrand },
    template: `
      <div class="space-y-8">
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Tema Claro</h3>
            <div class="space-y-4">
              <RitmoBrand variant="default" />
              <RitmoBrand variant="primary" />
              <RitmoBrand variant="monochrome" />
            </div>
          </div>
          
          <div class="bg-gray-900 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-4">Tema Oscuro</h3>
            <div class="space-y-4">
              <RitmoBrand variant="default" />
              <RitmoBrand variant="primary" />
              <RitmoBrand variant="white" />
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
            Características del Componente
          </h4>
          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Responsive y escalable</li>
            <li>• Soporte para temas claro/oscuro</li>
            <li>• Múltiples variantes de color</li>
            <li>• Tagline opcional</li>
            <li>• Transiciones suaves</li>
            <li>• Accesibilidad completa</li>
          </ul>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { RitmoBrand },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-6">
        <RitmoBrand v-bind="args" />
        
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Características de Accesibilidad
          </h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Logo con aria-label descriptivo</li>
            <li>• Estructura semántica apropiada</li>
            <li>• Contraste de colores adecuado</li>
            <li>• Soporte para lectores de pantalla</li>
            <li>• Navegación por teclado</li>
            <li>• Reducción de movimiento</li>
          </ul>
        </div>
      </div>
    `,
  }),
  args: {
    size: 'lg',
    variant: 'primary',
    showTagline: true,
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
