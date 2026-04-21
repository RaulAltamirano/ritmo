import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseButton from '../interactive/BaseButton.vue'
import BaseToast from './BaseToast.vue'

const meta: Meta<typeof BaseToast> = {
  title: 'Atoms/BaseToast',
  component: BaseToast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Sistema de notificaciones toast con múltiples variantes, posiciones, duración automática y accesibilidad completa. Incluye soporte para acciones, iconos y barra de progreso.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Variante visual del toast',
    },
    position: {
      control: { type: 'select' },
      options: [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ],
      description: 'Posición del toast',
    },
    duration: {
      control: { type: 'number' },
      description: 'Duración en milisegundos (0 = infinito)',
    },
    title: {
      control: { type: 'text' },
      description: 'Título del toast',
    },
    message: {
      control: { type: 'text' },
      description: 'Mensaje del toast',
    },
    dismissible: {
      control: { type: 'boolean' },
      description: 'Permite cerrar el toast',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: 'Muestra el icono del toast',
    },
    showProgress: {
      control: { type: 'boolean' },
      description: 'Muestra la barra de progreso',
    },
  },
  args: {
    variant: 'default',
    position: 'top-right',
    duration: 5000,
    title: '',
    message: '',
    dismissible: true,
    showIcon: true,
    showProgress: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Toast de Prueba',
            message: 'Este es un toast de prueba que se muestra correctamente.',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Mostrar Toast
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
}

// Variantes de toast
export const Success: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'success',
            title: 'Operación Exitosa',
            message: 'Los cambios se han guardado correctamente.',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="success">
          Toast de Éxito
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'success',
    title: 'Operación Exitosa',
    message: 'Los cambios se han guardado correctamente.',
  },
}

export const Warning: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'warning',
            title: 'Advertencia',
            message: 'Algunos campos pueden requerir atención.',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="warning">
          Toast de Advertencia
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'warning',
    title: 'Advertencia',
    message: 'Algunos campos pueden requerir atención.',
  },
}

export const Error: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'error',
            title: 'Error',
            message: 'Ha ocurrido un error al procesar la solicitud.',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="error">
          Toast de Error
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'error',
    title: 'Error',
    message: 'Ha ocurrido un error al procesar la solicitud.',
  },
}

export const Info: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Información',
            message: 'Nueva actualización disponible.',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="info">
          Toast Informativo
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'info',
    title: 'Información',
    message: 'Nueva actualización disponible.',
  },
}

// Posiciones
export const Positions: Story = {
  render: () => ({
    components: { BaseToast, BaseButton },
    setup() {
      const positions = [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ]
      const toastRefs = ref({})

      const triggerToast = (position: string) => {
        if (toastRefs.value[position]) {
          toastRefs.value[position].showToast({
            variant: 'info',
            title: 'Toast de Prueba',
            message: 'Este es un toast de prueba en diferentes posiciones.',
            position,
          })
        }
      }

      return { positions, toastRefs, triggerToast }
    },
    template: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <BaseButton 
            v-for="position in positions" 
            :key="position"
            @click="triggerToast(position)"
            variant="primary"
            size="sm"
          >
            {{ position }}
          </BaseButton>
        </div>
        
        <BaseToast 
          v-for="position in positions"
          :key="position"
          :ref="(el) => { if (el) toastRefs[position] = el }"
          :position="position"
        />
      </div>
    `,
  }),
}

// Toast con acciones
export const WithActions: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'warning',
            title: 'Confirmación Requerida',
            message: '¿Estás seguro de que quieres eliminar este elemento?',
            actions: [
              {
                label: 'Cancelar',
                variant: 'secondary',
                onClick: () => console.log('Cancelado'),
              },
              {
                label: 'Eliminar',
                variant: 'error',
                onClick: () => console.log('Eliminado'),
              },
            ],
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Toast con Acciones
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    variant: 'warning',
    title: 'Confirmación Requerida',
    message: '¿Estás seguro de que quieres eliminar este elemento?',
    actions: [
      {
        label: 'Cancelar',
        variant: 'secondary',
        onClick: () => console.log('Cancelado'),
      },
      {
        label: 'Eliminar',
        variant: 'error',
        onClick: () => console.log('Eliminado'),
      },
    ],
  },
}

// Toast sin icono
export const WithoutIcon: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Toast Minimalista',
            message: 'Este toast no tiene icono para un diseño más limpio.',
            showIcon: false,
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Toast Sin Icono
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    showIcon: false,
    title: 'Toast Minimalista',
    message: 'Este toast no tiene icono para un diseño más limpio.',
  },
}

// Toast sin progreso
export const WithoutProgress: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Toast Persistente',
            message:
              'Este toast no tiene barra de progreso y debe cerrarse manualmente.',
            showProgress: false,
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Toast Sin Progreso
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    showProgress: false,
    title: 'Toast Persistente',
    message: 'Este toast no tiene barra de progreso y debe cerrarse manualmente.',
  },
}

// Toast infinito
export const Infinite: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Toast Infinito',
            message: 'Este toast no se cierra automáticamente.',
            autoDismiss: false,
            dismissible: true,
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Toast Infinito
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    duration: 0,
    title: 'Toast Infinito',
    message: 'Este toast no se cierra automáticamente.',
    dismissible: true,
  },
}

// Comparación de variantes
export const AllVariants: Story = {
  render: () => ({
    components: { BaseToast, BaseButton },
    setup() {
      const variants = ['info', 'success', 'warning', 'error']
      const toastRef = ref()

      const triggerToast = (variant: string) => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant,
            title: `Toast ${  variant}`,
            message: `Este es un toast de tipo ${  variant  }.`,
          })
        }
      }

      return { variants, toastRef, triggerToast }
    },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <BaseButton 
            v-for="variant in variants" 
            :key="variant"
            @click="triggerToast(variant)"
            :variant="variant"
            size="sm"
          >
            {{ variant }}
          </BaseButton>
        </div>
        
        <BaseToast ref="toastRef" />
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseToast, BaseButton },
    setup() {
      const toastRef = ref()

      const triggerToast = () => {
        if (toastRef.value) {
          toastRef.value.showToast({
            variant: 'info',
            title: 'Toast Accesible',
            message:
              'Este toast incluye roles ARIA, navegación por teclado y anuncios para screen readers.',
            'aria-label': 'Notificación accesible con navegación por teclado',
            ...args,
          })
        }
      }

      return { args, toastRef, triggerToast }
    },
    template: `
      <div>
        <BaseButton @click="triggerToast" variant="primary">
          Toast Accesible
        </BaseButton>
        
        <BaseToast ref="toastRef" v-bind="args" />
      </div>
    `,
  }),
  args: {
    title: 'Toast Accesible',
    message:
      'Este toast incluye roles ARIA, navegación por teclado y anuncios para screen readers.',
    'aria-label': 'Notificación accesible con navegación por teclado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'button-name', enabled: true },
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
}
