import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseAlert from './BaseAlert.vue'
import BaseButton from '../interactive/BaseButton.vue'

const meta: Meta<typeof BaseAlert> = {
  title: 'Atoms/BaseAlert',
  component: BaseAlert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de alerta versátil para mostrar notificaciones importantes. Incluye múltiples variantes, estados, auto-dismiss y accesibilidad completa.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Variante visual de la alerta',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño de la alerta',
    },
    title: {
      control: { type: 'text' },
      description: 'Título de la alerta',
    },
    message: {
      control: { type: 'text' },
      description: 'Mensaje de la alerta',
    },
    show: {
      control: { type: 'boolean' },
      description: 'Mostrar/ocultar la alerta',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: 'Mostrar el icono de la alerta',
    },
    dismissible: {
      control: { type: 'boolean' },
      description: 'Permite cerrar la alerta',
    },
    autoDismiss: {
      control: { type: 'boolean' },
      description: 'Cerrar automáticamente',
    },
    showProgress: {
      control: { type: 'boolean' },
      description: 'Mostrar barra de progreso',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    title: '',
    message: '',
    show: true,
    showIcon: true,
    dismissible: false,
    autoDismiss: false,
    showProgress: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
}

// Variantes de alerta
export const Success: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
  args: {
    variant: 'success',
    title: 'Operación Exitosa',
    message: 'Los cambios se han guardado correctamente en el sistema.',
  },
}

export const Warning: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
  args: {
    variant: 'warning',
    title: 'Advertencia',
    message: 'Algunos campos pueden requerir atención antes de continuar.',
  },
}

export const Error: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
  args: {
    variant: 'error',
    title: 'Error del Sistema',
    message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  },
}

export const Info: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
  args: {
    variant: 'info',
    title: 'Información Importante',
    message: 'Nueva actualización disponible. Se recomienda reiniciar la aplicación.',
  },
}

// Tamaños
export const Sizes: Story = {
  render: () => ({
    components: { BaseAlert },
    template: `
      <div class="space-y-4">
        <BaseAlert 
          size="sm"
          variant="info"
          title="Alerta Pequeña"
          message="Esta es una alerta de tamaño pequeño."
        />
        
        <BaseAlert 
          size="md"
          variant="warning"
          title="Alerta Mediana"
          message="Esta es una alerta de tamaño mediano (por defecto)."
        />
        
        <BaseAlert 
          size="lg"
          variant="success"
          title="Alerta Grande"
          message="Esta es una alerta de tamaño grande para información importante."
        />
      </div>
    `,
  }),
}

// Alertas con contenido adicional
export const WithContent: Story = {
  render: () => ({
    components: { BaseAlert, BaseButton },
    template: `
      <div class="space-y-4">
        <BaseAlert 
          variant="warning"
          title="Actualización Requerida"
          message="Se requiere una actualización para continuar usando la aplicación."
        >
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" variant="primary">Actualizar Ahora</BaseButton>
            <BaseButton size="sm" variant="ghost">Más Tarde</BaseButton>
          </div>
        </BaseAlert>
        
        <BaseAlert 
          variant="error"
          title="Error de Conexión"
          message="No se pudo establecer conexión con el servidor."
        >
          <div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p class="text-sm text-red-700 dark:text-red-300">
              Detalles técnicos: Error 503 - Servicio no disponible
            </p>
          </div>
        </BaseAlert>
      </div>
    `,
  }),
}

// Alertas dismissibles
export const Dismissible: Story = {
  render: () => ({
    components: { BaseAlert },
    setup() {
      const alerts = ref({
        success: true,
        warning: true,
        error: true,
        info: true,
      })

      const dismissAlert = (variant: string) => {
        alerts.value[variant] = false
        console.log(`Alerta ${  variant  } cerrada`)
      }

      return { alerts, dismissAlert }
    },
    template: `
      <div class="space-y-4">
        <BaseAlert 
          v-if="alerts.success"
          variant="success"
          title="Alerta Cerrable"
          message="Esta alerta se puede cerrar haciendo clic en el botón X."
          :dismissible="true"
          @dismiss="dismissAlert('success')"
        />
        
        <BaseAlert 
          v-if="alerts.warning"
          variant="warning"
          title="Advertencia Cerrable"
          message="Esta alerta de advertencia también se puede cerrar."
          :dismissible="true"
          @dismiss="dismissAlert('warning')"
        />
        
        <BaseAlert 
          v-if="alerts.error"
          variant="error"
          title="Error Cerrable"
          message="Incluso las alertas de error se pueden cerrar."
          :dismissible="true"
          @dismiss="dismissAlert('error')"
        />
        
        <BaseAlert 
          v-if="alerts.info"
          variant="info"
          title="Info Cerrable"
          message="Las alertas informativas también son cerrables."
          :dismissible="true"
          @dismiss="dismissAlert('info')"
        />
      </div>
    `,
  }),
}

// Alertas sin icono
export const WithoutIcon: Story = {
  render: () => ({
    components: { BaseAlert },
    template: `
      <div class="space-y-4">
        <BaseAlert 
          variant="success"
          title="Alerta Sin Icono"
          message="Esta alerta no tiene icono para un diseño más minimalista."
          :show-icon="false"
        />
        
        <BaseAlert 
          variant="warning"
          title="Advertencia Minimalista"
          message="Alerta de advertencia sin icono para un look más limpio."
          :show-icon="false"
        />
      </div>
    `,
  }),
}

// Alertas con auto-dismiss
export const AutoDismiss: Story = {
  render: () => ({
    components: { BaseAlert },
    setup() {
      const showAlert = ref(false)
      const triggerAlert = () => {
        showAlert.value = true
        setTimeout(() => {
          showAlert.value = false
        }, 5000)
      }
      return { showAlert, triggerAlert }
    },
    template: `
      <div>
        <BaseButton @click="triggerAlert" variant="primary">
          Mostrar Alerta Auto-Dismiss
        </BaseButton>
        
        <BaseAlert 
          v-if="showAlert"
          variant="info"
          title="Alerta Temporal"
          message="Esta alerta se cerrará automáticamente en 5 segundos."
          :auto-dismiss="true"
          :show-progress="true"
        />
      </div>
    `,
  }),
}

// Comparación de variantes
export const AllVariants: Story = {
  render: () => ({
    components: { BaseAlert },
    template: `
      <div class="space-y-4">
        <BaseAlert 
          variant="default"
          title="Alerta por Defecto"
          message="Esta es una alerta con el estilo por defecto."
        />
        
        <BaseAlert 
          variant="success"
          title="Alerta de Éxito"
          message="Esta alerta indica una operación exitosa."
        />
        
        <BaseAlert 
          variant="warning"
          title="Alerta de Advertencia"
          message="Esta alerta advierte sobre algo importante."
        />
        
        <BaseAlert 
          variant="error"
          title="Alerta de Error"
          message="Esta alerta indica un error o problema."
        />
        
        <BaseAlert 
          variant="info"
          title="Alerta Informativa"
          message="Esta alerta proporciona información útil."
        />
      </div>
    `,
  }),
}

// Alertas en contexto
export const InContext: Story = {
  render: () => ({
    components: { BaseAlert },
    template: `
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Panel de Control</h2>
          
          <BaseAlert 
            variant="success"
            title="Sistema Operativo"
            message="Todos los servicios están funcionando correctamente."
          />
        </div>
        
        <div>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Configuración</h2>
          
          <BaseAlert 
            variant="warning"
            title="Configuración Pendiente"
            message="Algunas configuraciones requieren tu atención."
          />
        </div>
        
        <div>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Notificaciones</h2>
          
          <BaseAlert 
            variant="info"
            title="Nueva Funcionalidad"
            message="Hemos agregado nuevas características a la aplicación."
          />
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { BaseAlert },
    setup() {
      return { args }
    },
    template: '<BaseAlert v-bind="args" />',
  }),
  args: {
    variant: 'info',
    title: 'Alerta Accesible',
    message:
      'Esta alerta incluye roles ARIA apropiados, navegación por teclado y anuncios para screen readers.',
    role: 'alert',
    'aria-live': 'assertive',
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
