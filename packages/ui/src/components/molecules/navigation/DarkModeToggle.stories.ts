import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import DarkModeToggle from './DarkModeToggle.vue'

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Molecules/DarkModeToggle',
  component: DarkModeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de alternancia de modo oscuro/claro con accesibilidad completa. Incluye soporte para preferencias del sistema, navegación por teclado, anuncios para lectores de pantalla y transiciones suaves.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <DarkModeToggle />
    `,
  }),
}

// En contexto de header
export const InHeader: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="w-full max-w-4xl mx-auto">
        <header class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Mi Aplicación</h1>
            <nav class="hidden md:flex space-x-6">
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Inicio</a>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Productos</a>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contacto</a>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <DarkModeToggle />
            <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Iniciar Sesión
            </button>
          </div>
        </header>
      </div>
    `,
  }),
}

// En sidebar
export const InSidebar: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="flex h-64">
        <aside class="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Configuración</h2>
            <nav class="space-y-2">
              <a href="#" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Perfil</a>
              <a href="#" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Notificaciones</a>
              <a href="#" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Seguridad</a>
            </nav>
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Tema</span>
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </aside>
        <main class="flex-1 p-4 bg-white dark:bg-gray-900">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contenido Principal</h1>
          <p class="text-gray-600 dark:text-gray-300 mt-4">
            Este es el contenido principal que se adapta al tema seleccionado.
          </p>
        </main>
      </div>
    `,
  }),
}

// En card de configuración
export const InSettingsCard: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="max-w-md mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuración de Apariencia
          </h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">Modo Oscuro</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Cambia entre tema claro y oscuro
                </p>
              </div>
              <DarkModeToggle />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">Tamaño de Fuente</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Ajusta el tamaño del texto
                </p>
              </div>
              <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Pequeño</option>
                <option>Mediano</option>
                <option>Grande</option>
              </select>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">Reducir Movimiento</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Desactiva las animaciones
                </p>
              </div>
              <input type="checkbox" class="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600">
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// Estados de interacción
export const InteractionStates: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estados de Interacción
          </h3>
          <div class="flex justify-center space-x-4">
            <div class="text-center">
              <DarkModeToggle />
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Normal</p>
            </div>
            <div class="text-center">
              <DarkModeToggle />
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Hover</p>
            </div>
            <div class="text-center">
              <DarkModeToggle />
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Focus</p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estados de Carga
          </h3>
          <div class="flex justify-center space-x-4">
            <div class="text-center">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div class="w-4 h-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Cargando</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// Comparación de temas
export const ThemeComparison: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="space-y-8">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Comparación de Temas
          </h3>
          <DarkModeToggle />
        </div>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-2">Tema Claro</h4>
            <p class="text-gray-600 text-sm">
              Colores claros y legibles para uso diurno
            </p>
          </div>
          
          <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 class="font-semibold text-white mb-2">Tema Oscuro</h4>
            <p class="text-gray-300 text-sm">
              Colores oscuros para reducir la fatiga visual
            </p>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
            Características de Accesibilidad
          </h4>
          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Navegación por teclado (Enter, Espacio, Escape)</li>
            <li>• Anuncios para lectores de pantalla</li>
            <li>• Soporte para preferencias del sistema</li>
            <li>• Indicadores de focus visibles</li>
            <li>• Soporte para modo alto contraste</li>
            <li>• Reducción de movimiento</li>
          </ul>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="space-y-6">
        <div class="text-center">
          <DarkModeToggle />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Usa Tab para navegar y Enter/Espacio para activar
          </p>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Características de Accesibilidad
          </h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• aria-label dinámico según el estado actual</li>
            <li>• aria-pressed para indicar el estado</li>
            <li>• Descripción para lectores de pantalla</li>
            <li>• Navegación completa por teclado</li>
            <li>• Anuncios de cambios de estado</li>
            <li>• Soporte para preferencias del sistema</li>
          </ul>
        </div>
      </div>
    `,
  }),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
