import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import BaseCard from './BaseCard.vue'

const meta: Meta<typeof BaseCard> = {
  title: 'Atoms/BaseCard',
  component: BaseCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de tarjeta moderno 2025 con 5 variantes principales (simple, neumorphic, glassmorphism, minimalist, elevated), estados interactivos y funcionalidades avanzadas. Incluye soporte para header, footer, loading states, y accesibilidad completa con transiciones suaves y efectos modernos. La variante "simple" es ideal para formularios sin animaciones hover molestas.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['simple', 'neumorphic', 'glassmorphism', 'minimalist', 'elevated'],
      description: 'Variante visual moderna de la tarjeta',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño de la tarjeta',
    },
    title: {
      control: { type: 'text' },
      description: 'Título de la tarjeta',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Subtítulo de la tarjeta',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Estado de carga',
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Hace la tarjeta clickeable',
    },
    hoverable: {
      control: { type: 'boolean' },
      description: 'Efectos de hover',
    },
    dismissible: {
      control: { type: 'boolean' },
      description: 'Permite cerrar la tarjeta',
    },
  },
  args: {
    variant: 'simple',
    size: 'md',
    title: '',
    subtitle: '',
    loading: false,
    clickable: false,
    hoverable: false,
    dismissible: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Esta es una tarjeta moderna con contenido de ejemplo. Las tarjetas son componentes versátiles que pueden contener cualquier tipo de contenido con efectos visuales avanzados.
        </p>
      </BaseCard>
    `,
  }),
}

// Variantes de tarjeta modernas
export const Simple: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta simple sin animaciones hover molestas. Ideal para formularios y contenido que necesita ser minimalista y eficiente.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'simple',
    title: 'Tarjeta Simple',
    subtitle: 'Sin animaciones hover',
  },
}

export const Neumorphic: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta neumórfica con efecto "pressed into surface" que crea una sensación de profundidad sutil mediante sombras internas y externas.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'neumorphic',
    title: 'Tarjeta Neumórfica',
    subtitle: 'Efecto soft UI',
  },
}

export const Glassmorphism: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta con efecto glassmorphism moderno, fondo semi-transparente con backdrop blur para crear un efecto de cristal esmerilado.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'glassmorphism',
    title: 'Tarjeta Glassmorphism',
    subtitle: 'Efecto cristal esmerilado',
  },
}

export const Minimalist: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta minimalista sin bordes ni sombras, con efectos hover sutiles. Ideal para contenido que debe destacar por sí mismo.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'minimalist',
    title: 'Tarjeta Minimalista',
    subtitle: 'Diseño limpio y simple',
  },
}

export const Elevated: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta elevada con sombras pronunciadas y efecto de elevación al hover. Perfecta para contenido principal que necesita destacar.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'elevated',
    title: 'Tarjeta Elevada',
    subtitle: 'Con sombra pronunciada',
  },
}

export const Interactive: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      const handleClick = () => {
        console.log('Tarjeta clickeada!')
      }
      return { args, handleClick }
    },
    template: `
      <BaseCard v-bind="args" @click="handleClick">
        <p>
          Tarjeta interactiva que responde a clicks y hover con transiciones suaves y efectos modernos.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    variant: 'elevated',
    clickable: true,
    hoverable: true,
    title: 'Tarjeta Interactiva',
    subtitle: 'Click para interactuar',
  },
}

// Estados de la tarjeta
export const Loading: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Contenido que se mostrará cuando termine la carga.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    loading: true,
    title: 'Cargando Contenido',
    subtitle: 'Por favor espera...',
  },
}

// Tarjeta con slots
export const WithSlots: Story = {
  render: args => ({
    components: { BaseCard, BaseButton, BaseBadge },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Título Personalizado</h3>
              <p class="text-sm">Subtítulo personalizado</p>
            </div>
            <BaseBadge variant="success" content="Nuevo" />
          </div>
        </template>
        
        <p class="mb-4">
          Contenido principal de la tarjeta con slots personalizados para header y footer.
        </p>
        
        <template #footer>
          <div class="flex items-center justify-between">
            <BaseButton variant="ghost" size="sm">Cancelar</BaseButton>
            <BaseButton variant="primary" size="sm">Confirmar</BaseButton>
          </div>
        </template>
      </BaseCard>
    `,
  }),
  args: {
    title: '',
    subtitle: '',
  },
}

// Tarjeta dismissible
export const Dismissible: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      const isVisible = ref(true)
      const handleDismiss = () => {
        isVisible.value = false
        console.log('Tarjeta cerrada')
      }
      return { args, isVisible, handleDismiss }
    },
    template: `
      <BaseCard v-if="isVisible" v-bind="args" @dismiss="handleDismiss">
        <p>
          Esta tarjeta se puede cerrar haciendo clic en el botón X. Útil para notificaciones o contenido temporal.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    dismissible: true,
    title: 'Tarjeta Cerrable',
    subtitle: 'Haz clic en X para cerrar',
  },
}

// Comparación de tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseCard },
    template: `
      <div class="space-y-4">
        <BaseCard size="sm" title="Tamaño Pequeño">
          <p>Tarjeta pequeña para contenido compacto con padding reducido y border radius moderno.</p>
        </BaseCard>
        
        <BaseCard size="md" title="Tamaño Mediano">
          <p>Tarjeta mediana, tamaño por defecto con padding estándar y border radius xl.</p>
        </BaseCard>
        
        <BaseCard size="lg" title="Tamaño Grande">
          <p>Tarjeta grande para contenido extenso con padding amplio y border radius 3xl.</p>
        </BaseCard>
      </div>
    `,
  }),
}

// Todas las variantes modernas
export const AllVariants: Story = {
  render: () => ({
    components: { BaseCard },
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <BaseCard variant="simple" title="Simple" subtitle="Sin animaciones hover">
          <p>Tarjeta simple sin animaciones hover molestas. Ideal para formularios y contenido minimalista.</p>
        </BaseCard>
        
        <BaseCard variant="neumorphic" title="Neumorphic" subtitle="Soft UI design">
          <p>Tarjeta neumórfica con efecto "pressed into surface" mediante sombras internas y externas.</p>
        </BaseCard>
        
        <BaseCard variant="glassmorphism" title="Glassmorphism" subtitle="Cristal esmerilado">
          <p>Tarjeta con efecto glassmorphism moderno, fondo semi-transparente con backdrop blur.</p>
        </BaseCard>
        
        <BaseCard variant="minimalist" title="Minimalist" subtitle="Diseño limpio">
          <p>Tarjeta minimalista sin bordes ni sombras, con efectos hover sutiles para contenido que debe destacar.</p>
        </BaseCard>
        
        <BaseCard variant="elevated" title="Elevated" subtitle="Sombra pronunciada">
          <p>Tarjeta elevada con sombras pronunciadas y efecto de elevación al hover para contenido principal.</p>
        </BaseCard>
        
        <BaseCard variant="elevated" title="Interactive" subtitle="Clickeable" clickable hoverable>
          <p>Tarjeta interactiva que responde a clicks y hover con transiciones suaves y efectos modernos.</p>
        </BaseCard>
      </div>
    `,
  }),
}

export const Transitions: Story = {
  render: () => ({
    components: { BaseCard },
    template: `
      <div class="space-y-4">
        <BaseCard variant="neumorphic" title="Neumorphic con Transiciones" hoverable>
          <p>Tarjeta neumórfica con transiciones suaves de sombra al hover.</p>
        </BaseCard>
        
        <BaseCard variant="glassmorphism" title="Glassmorphism con Transiciones" hoverable>
          <p>Tarjeta glassmorphism con transiciones de opacidad y backdrop blur.</p>
        </BaseCard>
        
        <BaseCard variant="minimalist" title="Minimalist con Transiciones" hoverable>
          <p>Tarjeta minimalista con transiciones sutiles de fondo al hover.</p>
        </BaseCard>
        
        <BaseCard variant="elevated" title="Elevated con Transiciones" hoverable>
          <p>Tarjeta elevada con transiciones de sombra y transformación al hover.</p>
        </BaseCard>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Demuestra las transiciones suaves y efectos hover modernos de cada variante del componente BaseCard.',
      },
    },
  },
}

export const DarkMode: Story = {
  render: () => ({
    components: { BaseCard },
    template: `
      <div class="dark p-8 bg-gray-900 min-h-screen">
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-white mb-6">Dark Mode Cards</h2>
          
          <BaseCard variant="neumorphic" title="Neumorphic Dark" subtitle="Soft UI in dark mode">
            <p>
              Tarjeta neumórfica optimizada para dark mode con tokens de colores semánticos.
            </p>
          </BaseCard>
          
          <BaseCard variant="glassmorphism" title="Glassmorphism Dark" subtitle="Cristal esmerilado">
            <p>
              Efecto glassmorphism con backdrop blur y transparencia optimizada para dark mode.
            </p>
          </BaseCard>
          
          <BaseCard variant="minimalist" title="Minimalist Dark" subtitle="Diseño limpio">
            <p>
              Tarjeta minimalista sin bordes ni sombras, perfecta para contenido que debe destacar.
            </p>
          </BaseCard>
          
          <BaseCard variant="elevated" title="Elevated Dark" subtitle="Sombra pronunciada">
            <p>
              Tarjeta elevada con sombras pronunciadas y efecto de elevación al hover.
            </p>
          </BaseCard>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Demuestra cómo se ven las tarjetas en modo oscuro usando tokens de colores semánticos.',
      },
    },
  },
}

export const Accessibility: Story = {
  render: args => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>
          Tarjeta con accesibilidad completa, incluyendo roles ARIA, navegación por teclado y anuncios para screen readers.
        </p>
      </BaseCard>
    `,
  }),
  args: {
    clickable: true,
    ariaLabel: 'Tarjeta accesible con navegación por teclado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'button-name', enabled: true },
          { id: 'color-contrast', enabled: true },
          { id: 'heading-order', enabled: true },
        ],
      },
    },
  },
}
