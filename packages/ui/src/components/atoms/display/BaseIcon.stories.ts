import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  AlertTriangle,
  Check,
  Download,
  Edit,
  Heart,
  Home,
  Info,
  Mail,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  Settings,
  Share,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-vue-next'
import BaseIcon from './BaseIcon.vue'

const meta: Meta<typeof BaseIcon> = {
  title: 'Atoms/BaseIcon',
  component: BaseIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de icono versátil con múltiples tamaños, colores y accesibilidad. Incluye soporte para iconos de Lucide y navegación por teclado. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    icon: {
      control: false,
      description: 'Componente de icono (Vue component)',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Tamaño del icono',
    },
    color: {
      control: { type: 'select' },
      options: [
        'current',
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'muted',
      ],
      description: 'Color del icono',
    },
    ariaHidden: {
      control: { type: 'boolean' },
      description: 'Ocultar de screen readers',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Etiqueta para accesibilidad',
    },
    role: {
      control: { type: 'text' },
      description: 'Rol ARIA del icono',
    },
  },
  args: {
    size: 'md',
    color: 'current',
    ariaHidden: true,
    ariaLabel: '',
    role: 'img',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseIcon, Heart },
    setup() {
      return { args }
    },
    template: '<BaseIcon v-bind="args" :icon="Heart" />',
  }),
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseIcon, Heart },
    template: `
      <div class="flex items-center gap-4">
        <BaseIcon :icon="Heart" size="xs" />
        <BaseIcon :icon="Heart" size="sm" />
        <BaseIcon :icon="Heart" size="md" />
        <BaseIcon :icon="Heart" size="lg" />
        <BaseIcon :icon="Heart" size="xl" />
        <BaseIcon :icon="Heart" size="2xl" />
      </div>
    `,
  }),
}

// Colores
export const Colors: Story = {
  render: () => ({
    components: { BaseIcon, Heart },
    template: `
      <div class="flex items-center gap-4">
        <BaseIcon :icon="Heart" color="current" />
        <BaseIcon :icon="Heart" color="primary" />
        <BaseIcon :icon="Heart" color="secondary" />
        <BaseIcon :icon="Heart" color="success" />
        <BaseIcon :icon="Heart" color="warning" />
        <BaseIcon :icon="Heart" color="error" />
        <BaseIcon :icon="Heart" color="info" />
        <BaseIcon :icon="Heart" color="muted" />
      </div>
    `,
  }),
}

// Iconos comunes
export const CommonIcons: Story = {
  render: () => ({
    components: {
      BaseIcon,
      Heart,
      Star,
      Check,
      AlertTriangle,
      Info,
      Settings,
      User,
      Mail,
    },
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Heart" color="error" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Heart</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Star" color="warning" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Star</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Check" color="success" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Check</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="AlertTriangle" color="warning" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Alert</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Info" color="info" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Info</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Settings" color="secondary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Settings</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="User" color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">User</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Mail" color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Mail</span>
        </div>
      </div>
    `,
  }),
}

// Iconos de navegación
export const NavigationIcons: Story = {
  render: () => ({
    components: { BaseIcon, Home, Search, Menu, X },
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Home" color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Home</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Search" color="secondary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Search</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Menu" color="secondary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Menu</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="X" color="muted" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Close</span>
        </div>
      </div>
    `,
  }),
}

// Iconos de acciones
export const ActionIcons: Story = {
  render: () => ({
    components: { BaseIcon, Plus, Minus, Edit, Trash2 },
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Plus" color="success" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Add</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Minus" color="error" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Remove</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Edit" color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Edit</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Trash2" color="error" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Delete</span>
        </div>
      </div>
    `,
  }),
}

// Iconos de comunicación
export const CommunicationIcons: Story = {
  render: () => ({
    components: { BaseIcon, Mail, Phone, Share, Download },
    template: `
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Mail" color="primary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Email</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Phone" color="success" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Phone</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Share" color="info" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Share</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseIcon :icon="Download" color="secondary" />
          <span class="text-xs text-gray-600 dark:text-gray-400">Download</span>
        </div>
      </div>
    `,
  }),
}

// Comparación de tamaños y colores
export const SizeAndColorCombinations: Story = {
  render: () => ({
    components: { BaseIcon, Heart, Star },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tamaños</h3>
          <div class="flex items-center gap-4">
            <BaseIcon :icon="Heart" size="xs" color="error" />
            <BaseIcon :icon="Heart" size="sm" color="error" />
            <BaseIcon :icon="Heart" size="md" color="error" />
            <BaseIcon :icon="Heart" size="lg" color="error" />
            <BaseIcon :icon="Heart" size="xl" color="error" />
            <BaseIcon :icon="Heart" size="2xl" color="error" />
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Colores</h3>
          <div class="flex items-center gap-4">
            <BaseIcon :icon="Star" size="lg" color="current" />
            <BaseIcon :icon="Star" size="lg" color="primary" />
            <BaseIcon :icon="Star" size="lg" color="secondary" />
            <BaseIcon :icon="Star" size="lg" color="success" />
            <BaseIcon :icon="Star" size="lg" color="warning" />
            <BaseIcon :icon="Star" size="lg" color="error" />
            <BaseIcon :icon="Star" size="lg" color="info" />
            <BaseIcon :icon="Star" size="lg" color="muted" />
          </div>
        </div>
      </div>
    `,
  }),
}

// Iconos accesibles
export const AccessibleIcons: Story = {
  render: () => ({
    components: { BaseIcon, Heart, Settings, Info },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <BaseIcon 
            :icon="Heart" 
            color="error" 
            :aria-hidden="false"
            aria-label="Me gusta"
            role="button"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Icono accesible con aria-label</span>
        </div>
        
        <div class="flex items-center gap-4">
          <BaseIcon 
            :icon="Settings" 
            color="secondary" 
            :aria-hidden="false"
            aria-label="Configuración"
            role="button"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Icono accesible con role button</span>
        </div>
        
        <div class="flex items-center gap-4">
          <BaseIcon 
            :icon="Info" 
            color="info" 
            :aria-hidden="false"
            aria-label="Información adicional"
            role="img"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Icono accesible con role img</span>
        </div>
      </div>
    `,
  }),
}

// Iconos en contexto
export const InContext: Story = {
  render: () => ({
    components: { BaseIcon, User, Info, Check, AlertTriangle },
    template: `
      <div class="space-y-6">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BaseIcon :icon="User" color="primary" />
          <span class="text-gray-900 dark:text-white">Perfil de Usuario</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <BaseIcon :icon="Info" color="info" />
          <span class="text-blue-900 dark:text-blue-100">Información importante</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <BaseIcon :icon="Check" color="success" />
          <span class="text-green-900 dark:text-green-100">Operación exitosa</span>
        </div>
        
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <BaseIcon :icon="AlertTriangle" color="error" />
          <span class="text-red-900 dark:text-red-100">Error en el sistema</span>
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseIcon, Heart },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <BaseIcon v-bind="args" :icon="Heart" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Icono con navegación por teclado y roles ARIA apropiados
        </p>
      </div>
    `,
  }),
  args: {
    'aria-label': 'Icono de corazón accesible',
    role: 'img',
    ariaHidden: false,
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
