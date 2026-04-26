import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseCheckbox from './BaseCheckbox.vue'

const meta: Meta<typeof BaseCheckbox> = {
  title: 'Atoms/BaseCheckbox',
  component: BaseCheckbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de checkbox versátil con estados checked, unchecked e indeterminate. Incluye validación, accesibilidad completa y soporte para navegación por teclado. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    modelValue: {
      control: { type: 'boolean' },
      description: 'Valor del checkbox (v-model)',
    },
    label: {
      control: { type: 'text' },
      description: 'Etiqueta del checkbox',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Estado deshabilitado',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Campo requerido',
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Estado indeterminado',
    },
    error: {
      control: { type: 'text' },
      description: 'Mensaje de error',
    },
    hint: {
      control: { type: 'text' },
      description: 'Texto de ayuda',
    },
    name: {
      control: { type: 'text' },
      description: 'Nombre del campo',
    },
    value: {
      control: { type: 'text' },
      description: 'Valor del checkbox',
    },
  },
  args: {
    modelValue: false,
    label: '',
    disabled: false,
    required: false,
    indeterminate: false,
    error: '',
    hint: '',
    name: 'checkbox',
    value: 'value',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(args.modelValue)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
}

// Estados básicos
export const Checked: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(true)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox Marcado',
    modelValue: true,
  },
}

export const Unchecked: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox Desmarcado',
  },
}

export const Indeterminate: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: Indeterminado
        </p>
        </div>
    `,
  }),
  args: {
    label: 'Checkbox Indeterminado',
    indeterminate: true,
  },
}

// Estados de validación
export const WithError: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox con Error',
    error: 'Este campo es requerido',
  },
}

export const WithHint: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox con Ayuda',
    hint: 'Marca esta casilla para recibir notificaciones por email',
  },
}

export const Required: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox Requerido',
    required: true,
  },
}

// Estados interactivos
export const Disabled: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
        <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
        </div>
    `,
  }),
  args: {
    label: 'Checkbox Deshabilitado',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(true)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox Deshabilitado y Marcado',
    disabled: true,
    modelValue: true,
  },
}

// Múltiples checkboxes
export const Multiple: Story = {
  render: () => ({
    components: { BaseCheckbox },
    setup() {
      const options = ref([
        { id: 'option1', label: 'Opción 1', checked: false },
        { id: 'option2', label: 'Opción 2', checked: true },
        { id: 'option3', label: 'Opción 3', checked: false },
        { id: 'option4', label: 'Opción 4', checked: false },
      ])

      const toggleOption = (index: number) => {
        options.value[index].checked = !options.value[index].checked
      }

      return { options, toggleOption }
    },
    template: `
      <div class="space-y-3">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Selecciona tus preferencias
        </h3>
        
          <BaseCheckbox 
          v-for="(option, index) in options"
          :key="option.id"
          :model-value="option.checked"
          :label="option.label"
          @update:model-value="toggleOption(index)"
        />
        
        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Opciones seleccionadas: {{ options.filter(o => o.checked).map(o => o.label).join(', ') ?? 'Ninguna' }}
          </p>
        </div>
      </div>
    `,
  }),
}

// Checkbox con slot
export const WithSlot: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
      <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Contenido personalizado en el slot
          </span>
        </BaseCheckbox>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox con Slot',
  },
}

// Comparación de estados
export const AllStates: Story = {
  render: () => ({
    components: { BaseCheckbox },
    setup() {
      const states = ref({
        unchecked: false,
        checked: true,
        indeterminate: false,
        disabled: false,
        error: false,
      })

      return { states }
    },
    template: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Todos los Estados
        </h3>
        
        <BaseCheckbox 
          v-model="states.unchecked"
          label="Checkbox Normal"
        />
        
            <BaseCheckbox 
          v-model="states.checked"
          label="Checkbox Marcado"
        />
            
            <BaseCheckbox 
          v-model="states.indeterminate"
          label="Checkbox Indeterminado"
          :indeterminate="true"
            />
          
              <BaseCheckbox 
          v-model="states.disabled"
          label="Checkbox Deshabilitado"
          :disabled="true"
        />
        
        <BaseCheckbox 
          v-model="states.error"
          label="Checkbox con Error"
          error="Este campo tiene un error"
        />
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: `
        <div class="space-y-4">
        <BaseCheckbox v-model="checked" v-bind="args" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Estado: {{ checked ? 'Checked' : 'Unchecked' }}
        </p>
      </div>
    `,
  }),
  args: {
    label: 'Checkbox Accesible',
    'aria-label': 'Checkbox con navegación por teclado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'checkboxgroup', enabled: true },
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
