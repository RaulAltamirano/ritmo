import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseSkeleton from './BaseSkeleton.vue'

const meta: Meta<typeof BaseSkeleton> = {
  title: 'Components/Atoms/BaseSkeleton',
  component: BaseSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Componente de skeleton para mostrar estados de carga. Incluye múltiples variantes, animaciones y accesibilidad completa. Compatible con WCAG 2.1 AA y screen readers.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'text', 'circular', 'rectangular'],
      description: 'Tipo de esqueleto a mostrar',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del esqueleto',
    },
    rounded: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Radio de bordes redondeados',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseSkeleton },
    setup() {
      return { args }
    },
    template: '<BaseSkeleton v-bind="args" />',
  }),
  args: {
    variant: 'default',
    size: 'md',
    rounded: 'md',
  },
}

// Variantes
export const Text: Story = {
  render: args => ({
    components: { BaseSkeleton },
    setup() {
      return { args }
    },
    template: '<BaseSkeleton v-bind="args" />',
  }),
  args: {
    variant: 'text',
    size: 'md',
    rounded: 'md',
  },
}

export const Circular: Story = {
  render: args => ({
    components: { BaseSkeleton },
    setup() {
      return { args }
    },
    template: '<BaseSkeleton v-bind="args" />',
  }),
  args: {
    variant: 'circular',
    size: 'md',
    rounded: 'full',
  },
}

export const Rectangular: Story = {
  render: args => ({
    components: { BaseSkeleton },
    setup() {
      return { args }
    },
    template: '<BaseSkeleton v-bind="args" />',
  }),
  args: {
    variant: 'rectangular',
    size: 'md',
    rounded: 'md',
  },
}
