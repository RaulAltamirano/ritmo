import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseBadge from './BaseBadge.vue'

const meta: Meta<typeof BaseBadge> = {
  title: 'Atoms/BaseBadge',
  component: BaseBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Badge soft-tint por defecto (pill) alineado al chrome de Ritmo. Usa appearance="solid" solo para énfasis alto. Variantes, tamaños, iconos, contadores y estados clickable/loading.',
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
        'info',
        'neutral',
        'subtle',
      ],
      description: 'Variante visual del badge',
    },
    appearance: {
      control: { type: 'select' },
      options: ['soft', 'solid'],
      description: 'Soft tint (default) o solid fill de alto énfasis',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Tamaño del badge',
    },
    content: {
      control: { type: 'text' },
      description: 'Contenido del badge',
    },
    count: {
      control: { type: 'number' },
      description: 'Contador numérico',
    },
    maxCount: {
      control: { type: 'number' },
      description: 'Máximo valor del contador',
    },
    leftIcon: {
      control: { type: 'text' },
      description: 'Icono izquierdo (nombre o componente)',
    },
    rightIcon: {
      control: { type: 'text' },
      description: 'Icono derecho (nombre o componente)',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Estado de carga',
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Hacer el badge clickeable',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Deshabilitar el badge',
    },
    tag: {
      control: { type: 'select' },
      options: ['span', 'button', 'div'],
      description: 'Elemento HTML base',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Label ARIA para accesibilidad',
    },
  },
  args: {
    variant: 'primary',
    appearance: 'soft',
    size: 'md',
    content: 'Badge',
    clickable: false,
    disabled: false,
    loading: false,
    tag: 'span',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseBadge },
    setup() {
      return { args }
    },
    template: `
      <BaseBadge v-bind="args" />
    `,
  }),
}

// Variantes de color
export const Variants: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Primary" />
        <BaseBadge variant="secondary" content="Secondary" />
        <BaseBadge variant="success" content="Success" />
        <BaseBadge variant="warning" content="Warning" />
        <BaseBadge variant="error" content="Error" />
        <BaseBadge variant="info" content="Info" />
        <BaseBadge variant="neutral" content="Neutral" />
        <BaseBadge variant="subtle" content="Subtle" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Soft tint por defecto — el look canónico en profile y cards.',
      },
    },
  },
}

export const SoftVsSolid: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <BaseBadge variant="info" content="system" />
          <BaseBadge variant="success" content="Active" left-icon="check" />
          <BaseBadge variant="subtle" content="metadata" />
        </div>
        <div class="flex flex-wrap gap-3">
          <BaseBadge appearance="solid" variant="info" content="solid info" />
          <BaseBadge appearance="solid" variant="success" content="solid success" />
          <BaseBadge appearance="solid" variant="error" content="solid error" />
        </div>
      </div>
    `,
  }),
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex items-center gap-3">
        <BaseBadge size="xs" content="XS" />
        <BaseBadge size="sm" content="SM" />
        <BaseBadge size="md" content="MD" />
        <BaseBadge size="lg" content="LG" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Diferentes tamaños disponibles: xs, sm, md, lg.',
      },
    },
  },
}

// Con iconos
export const WithIcons: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Check" left-icon="check" />
        <BaseBadge variant="success" content="Success" right-icon="check" />
        <BaseBadge variant="warning" content="Alert" left-icon="alert" />
        <BaseBadge variant="error" content="Error" right-icon="x" />
        <BaseBadge variant="info" content="Info" left-icon="info" />
        <BaseBadge variant="neutral" content="Star" right-icon="star" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Badges con iconos en diferentes posiciones.',
      },
    },
  },
}

// Con contadores
export const WithCounters: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Messages" :count="5" />
        <BaseBadge variant="success" content="Tasks" :count="12" />
        <BaseBadge variant="warning" content="Alerts" :count="3" />
        <BaseBadge variant="error" content="Errors" :count="1" />
        <BaseBadge variant="info" content="Notifications" :count="99" />
        <BaseBadge variant="neutral" content="Items" :count="150" />
        <BaseBadge variant="subtle" content="Total" :count="1200" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Badges con contadores numéricos. Los números grandes se formatean automáticamente (K, M).',
      },
    },
  },
}

// Contadores con límite máximo
export const CountersWithMax: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Messages" :count="5" :max-count="10" />
        <BaseBadge variant="success" content="Tasks" :count="15" :max-count="10" />
        <BaseBadge variant="warning" content="Alerts" :count="25" :max-count="20" />
        <BaseBadge variant="error" content="Errors" :count="150" :max-count="99" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Badges con contadores que respetan un límite máximo. Valores superiores muestran "max+".',
      },
    },
  },
}

// Estados interactivos
export const Interactive: Story = {
  render: () => ({
    components: { BaseBadge },
    setup() {
      const handleClick = (event: MouseEvent) => {
        console.log('Badge clicked!', event)
      }
      return { handleClick }
    },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Clickable" clickable @click="handleClick" />
        <BaseBadge variant="secondary" content="Disabled" disabled />
        <BaseBadge variant="success" content="Loading" loading />
        <BaseBadge variant="warning" content="Clickable + Count" :count="5" clickable @click="handleClick" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Diferentes estados interactivos: clickeable, deshabilitado, cargando.',
      },
    },
  },
}

// Estados de carga
export const LoadingStates: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge variant="primary" content="Loading" loading />
        <BaseBadge variant="success" content="Processing" loading />
        <BaseBadge variant="warning" content="Saving" loading />
        <BaseBadge variant="error" content="Error" loading />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Badges en estado de carga con spinner animado.',
      },
    },
  },
}

// Combinaciones complejas
export const ComplexCombinations: Story = {
  render: () => ({
    components: { BaseBadge },
    setup() {
      const handleClick = (event: MouseEvent) => {
        console.log('Complex badge clicked!', event)
      }
      return { handleClick }
    },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseBadge 
          variant="primary" 
          content="Messages" 
          left-icon="bell" 
          :count="25" 
          clickable 
          @click="handleClick" 
        />
        <BaseBadge 
          variant="success" 
          content="Completed" 
          right-icon="check" 
          :count="150" 
          clickable 
          @click="handleClick" 
        />
        <BaseBadge 
          variant="warning" 
          content="Pending" 
          left-icon="alert" 
          :count="5" 
          size="lg" 
          clickable 
          @click="handleClick" 
        />
        <BaseBadge 
          variant="error" 
          content="Failed" 
          right-icon="x" 
          :count="2" 
          size="sm" 
          clickable 
          @click="handleClick" 
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Combinaciones complejas con iconos, contadores, diferentes tamaños y estados interactivos.',
      },
    },
  },
}

// Ejemplos de uso real
export const RealWorldExamples: Story = {
  render: () => ({
    components: { BaseBadge },
    setup() {
      const handleNotificationClick = () => {
        console.log('Notifications clicked')
      }
      const handleStatusClick = () => {
        console.log('Status clicked')
      }
      return { handleNotificationClick, handleStatusClick }
    },
    template: `
      <div class="space-y-6">
        <!-- Notificaciones -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Notifications</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="primary" content="Inbox" :count="12" clickable @click="handleNotificationClick" />
            <BaseBadge variant="success" content="Read" :count="45" clickable @click="handleNotificationClick" />
            <BaseBadge variant="warning" content="Unread" :count="3" clickable @click="handleNotificationClick" />
          </div>
        </div>

        <!-- Estados de tareas -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Task Status</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="success" content="Completed" :count="25" clickable @click="handleStatusClick" />
            <BaseBadge variant="warning" content="In Progress" :count="8" clickable @click="handleStatusClick" />
            <BaseBadge variant="error" content="Blocked" :count="2" clickable @click="handleStatusClick" />
            <BaseBadge variant="info" content="Review" :count="5" clickable @click="handleStatusClick" />
          </div>
        </div>

        <!-- Filtros -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Filters</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="subtle" content="All" clickable />
            <BaseBadge variant="primary" content="Active" clickable />
            <BaseBadge variant="secondary" content="Archived" clickable />
            <BaseBadge variant="neutral" content="Draft" clickable />
          </div>
        </div>

        <!-- Estados del sistema -->
        <div>
          <h3 class="text-lg font-semibold mb-3">System Status</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="success" content="Online" left-icon="check" />
            <BaseBadge variant="warning" content="Maintenance" left-icon="alert" />
            <BaseBadge variant="error" content="Offline" left-icon="x" />
            <BaseBadge variant="info" content="Syncing" loading />
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Ejemplos de uso real en aplicaciones: notificaciones, estados de tareas, filtros y estados del sistema.',
      },
    },
  },
}

// Accesibilidad
export const Accessibility: Story = {
  render: () => ({
    components: { BaseBadge },
    setup() {
      const handleClick = (event: MouseEvent) => {
        console.log('Accessible badge clicked!', event)
      }
      return { handleClick }
    },
    template: `
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold mb-3">Keyboard Navigation</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="primary" content="Tab to focus" clickable aria-label="Primary action badge" @click="handleClick" />
            <BaseBadge variant="success" content="Enter to activate" clickable aria-label="Success action badge" @click="handleClick" />
            <BaseBadge variant="warning" content="Space to activate" clickable aria-label="Warning action badge" @click="handleClick" />
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Screen Reader Support</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="primary" content="Messages" :count="5" aria-label="5 unread messages" />
            <BaseBadge variant="success" content="Completed" :count="25" aria-label="25 completed tasks" />
            <BaseBadge variant="error" content="Errors" :count="2" aria-label="2 error notifications" />
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Disabled States</h3>
          <div class="flex flex-wrap gap-2">
            <BaseBadge variant="primary" content="Disabled" disabled />
            <BaseBadge variant="secondary" content="Not Available" disabled />
            <BaseBadge variant="neutral" content="Inactive" disabled />
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Ejemplos de accesibilidad: navegación por teclado, soporte para lectores de pantalla y estados deshabilitados.',
      },
    },
  },
}

// Modo oscuro
export const DarkMode: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="dark p-8 bg-gray-900 min-h-screen">
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-white mb-6">Dark Mode Badges</h2>
          
          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Color Variants</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="primary" content="Primary" />
              <BaseBadge variant="secondary" content="Secondary" />
              <BaseBadge variant="success" content="Success" />
              <BaseBadge variant="warning" content="Warning" />
              <BaseBadge variant="error" content="Error" />
              <BaseBadge variant="info" content="Info" />
              <BaseBadge variant="neutral" content="Neutral" />
              <BaseBadge variant="subtle" content="Subtle" />
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-white mb-3">With Counters</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="primary" content="Messages" :count="12" />
              <BaseBadge variant="success" content="Tasks" :count="25" />
              <BaseBadge variant="warning" content="Alerts" :count="3" />
              <BaseBadge variant="error" content="Errors" :count="1" />
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Interactive States</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="primary" content="Clickable" clickable />
              <BaseBadge variant="secondary" content="Disabled" disabled />
              <BaseBadge variant="success" content="Loading" loading />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Cómo se ven los badges en modo oscuro con colores optimizados.',
      },
    },
  },
}

// Comparación con versión anterior
export const Comparison: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-3">New Design (2025)</h3>
          <div class="flex flex-wrap gap-3">
            <BaseBadge variant="primary" content="Primary" />
            <BaseBadge variant="secondary" content="Secondary" />
            <BaseBadge variant="success" content="Success" />
            <BaseBadge variant="warning" content="Warning" />
            <BaseBadge variant="error" content="Error" />
            <BaseBadge variant="info" content="Info" />
            <BaseBadge variant="neutral" content="Neutral" />
            <BaseBadge variant="subtle" content="Subtle" />
          </div>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-semibold text-gray-800 mb-2">Mejoras implementadas:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• API simplificada con menos props</li>
            <li>• Diseño más minimalista y moderno</li>
            <li>• Mejor accesibilidad por defecto</li>
            <li>• Transiciones más suaves</li>
            <li>• Soporte mejorado para modo oscuro</li>
            <li>• Mejor rendimiento</li>
            <li>• Contadores más inteligentes</li>
            <li>• Iconos más flexibles</li>
          </ul>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Comparación del nuevo diseño con mejoras implementadas.',
      },
    },
  },
}
