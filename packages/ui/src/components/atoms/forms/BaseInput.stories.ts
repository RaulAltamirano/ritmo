import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Eye, Mail, Search as SearchIcon, User } from 'lucide-vue-next'
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

const meta: Meta<typeof BaseInput> = {
  title: 'Design System/Atoms/Forms/BaseInput',
  component: BaseInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de input versátil con validación, estados de error, iconos y accesibilidad completa. Incluye soporte para diferentes tipos, máscaras y navegación por teclado. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'time',
        'datetime-local',
      ],
      description: 'Tipo de entrada HTML',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Texto de placeholder',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Estado deshabilitado',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Campo requerido',
    },
    clearable: {
      control: { type: 'boolean' },
      description: 'Mostrar botón de limpiar',
    },
    leftIcon: {
      control: false,
      description: 'Icono izquierdo (componente Vue)',
    },
    rightIcon: {
      control: false,
      description: 'Icono derecho (componente Vue)',
    },
    label: {
      control: { type: 'text' },
      description: 'Etiqueta del campo',
    },
    hint: {
      control: { type: 'text' },
      description: 'Texto de ayuda',
    },
    error: {
      control: { type: 'text' },
      description: 'Mensaje de error',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Escribe algo aquí...',
    disabled: false,
    required: false,
    clearable: false,
    leftIcon: undefined,
    rightIcon: undefined,
    label: '',
    hint: '',
    error: '',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {},
}

// Tipos de entrada
export const Text: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'text',
    placeholder: 'Texto simple',
  },
}

export const Email: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'email',
    placeholder: 'correo@ejemplo.com',
  },
}

export const Password: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'password',
    placeholder: 'Contraseña',
  },
}

export const Number: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'number',
    placeholder: '123',
  },
}

export const Tel: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
  },
}

export const URL: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'url',
    placeholder: 'https://ejemplo.com',
  },
}

export const SearchInput: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'search',
    placeholder: 'Buscar...',
  },
}

export const Date: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    type: 'date',
  },
}

export const Time: Story = {
  args: {
    type: 'time',
  },
}

export const DateTimeLocal: Story = {
  args: {
    type: 'datetime-local',
  },
}

// Estados
export const Success: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    hint: 'Campo válido',
  },
}

export const Warning: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    hint: 'Advertencia: formato no estándar',
  },
}

export const Error: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    error: 'Este campo es requerido',
  },
}

// Tamaños (usando clases CSS personalizadas)
export const Small: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" class="text-sm px-2 py-1" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Input pequeño',
  },
}

export const Medium: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" class="text-base px-3 py-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Input mediano',
  },
}

export const Large: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" class="text-lg px-4 py-3" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Input grande',
  },
}

// Estados
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Campo deshabilitado',
  },
}

export const Readonly: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('Valor fijo')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Campo de solo lectura',
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'Campo requerido *',
  },
}

// Con iconos
export const WithLeftIcon: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Buscar usuarios...',
    leftIcon: SearchIcon,
  },
}

export const WithRightIcon: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Ver contraseña',
    rightIcon: Eye,
  },
}

export const WithBothIcons: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Usuario verificado',
    leftIcon: User,
    rightIcon: Mail,
  },
}

// Con etiqueta y texto de ayuda
export const WithLabel: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Nombre completo',
    placeholder: 'Ingresa tu nombre completo',
  },
}

export const WithHelperText: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Contraseña',
    hint: 'Mínimo 8 caracteres, incluir mayúsculas y números',
  },
}

export const WithErrorMessage: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Email',
    error: 'Formato de email inválido',
  },
}

// Con botón de limpiar
export const Clearable: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    clearable: true,
    placeholder: 'Escribe y limpia',
  },
}

// Combinaciones complejas
export const CompleteForm: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Dirección de email',
    type: 'email',
    hint: 'Email verificado correctamente',
    placeholder: 'tu@email.com',
  },
}

export const PasswordWithValidation: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Nueva contraseña',
    type: 'password',
    hint: 'Falta incluir un número',
    placeholder: '••••••••',
  },
}

// Interactivo
export const Interactive: Story = {
  args: {
    placeholder: 'Escribe algo para probar la interactividad',
  },
  parameters: {
    interactions: {
      disable: false,
    },
  },
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="space-y-4">
        <BaseInput v-model="value" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Valor: {{ value ?? '(vacío)' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Campo accesible',
    required: true,
    hint: 'Este campo es obligatorio para continuar',
    placeholder: 'Ingresa tu información aquí',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: true },
          { id: 'form-field-multiple-labels', enabled: true },
          { id: 'aria-required-attr', enabled: true },
          { id: 'aria-describedby', enabled: true },
          { id: 'color-contrast', enabled: true },
          { id: 'aria-valid-attr-value', enabled: true },
          { id: 'aria-input-field-name', enabled: true },
        ],
      },
    },
  },
}
