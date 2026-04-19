import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import ClientOnly from './ClientOnly.vue'

const meta: Meta<typeof ClientOnly> = {
  title: 'Atoms/ClientOnly',
  component: ClientOnly,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente ClientOnly para renderizar contenido solo en el lado del cliente. Útil para componentes que dependen del navegador o APIs del cliente. Compatible con SSR.',
      },
    },
  },
  argTypes: {
    fallback: {
      control: { type: 'text' },
      description: 'Contenido de fallback mientras se carga',
    },
  },
  args: {
    fallback: 'Cargando...',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { ClientOnly },
    setup() {
      return { args }
    },
    template: `
      <ClientOnly v-bind="args">
        <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p class="text-green-800 dark:text-green-200">
            Este contenido solo se renderiza en el cliente
          </p>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con contenido dinámico
export const WithDynamicContent: Story = {
  render: () => ({
    components: { ClientOnly },
    setup() {
      const clientTime = ref('')
      const clientInfo = ref('')

      // Simular contenido que solo está disponible en el cliente
      const updateClientInfo = () => {
        clientTime.value = new Date().toLocaleTimeString()
        clientInfo.value = 'User Agent: ' + navigator.userAgent.substring(0, 50) + '...'
      }

      // Actualizar cada segundo
      setInterval(updateClientInfo, 1000)
      updateClientInfo()

      return { clientTime, clientInfo }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Información del Cliente
            </h3>
            <p class="text-blue-800 dark:text-blue-200">
              Hora actual: {{ clientTime }}
            </p>
            <p class="text-blue-800 dark:text-blue-200 text-sm">
              {{ clientInfo }}
            </p>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con componentes interactivos
export const WithInteractiveComponents: Story = {
  render: () => ({
    components: { ClientOnly, BaseButton },
    setup() {
      const count = ref(0)
      const increment = () => count.value++

      return { count, increment }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 class="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Componente Interactivo
            </h3>
            <p class="text-purple-800 dark:text-purple-200 mb-4">
              Contador: {{ count }}
            </p>
            <BaseButton @click="increment" variant="primary" size="sm">
              Incrementar
            </BaseButton>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con APIs del navegador
export const WithBrowserAPIs: Story = {
  render: () => ({
    components: { ClientOnly },
    setup() {
      const screenInfo = ref('')
      const windowInfo = ref('')
      const locationInfo = ref('')

      // Información que solo está disponible en el cliente
      const updateBrowserInfo = () => {
        screenInfo.value = 'Pantalla: ' + screen.width + 'x' + screen.height
        windowInfo.value = 'Ventana: ' + window.innerWidth + 'x' + window.innerHeight
        locationInfo.value = 'URL: ' + window.location.href
      }

      // Actualizar al montar
      updateBrowserInfo()

      return { screenInfo, windowInfo, locationInfo }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 class="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              APIs del Navegador
            </h3>
            <div class="space-y-2 text-sm">
              <p class="text-orange-800 dark:text-orange-200">{{ screenInfo }}</p>
              <p class="text-orange-800 dark:text-orange-200">{{ windowInfo }}</p>
              <p class="text-orange-800 dark:text-orange-200">{{ locationInfo }}</p>
            </div>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con localStorage
export const WithLocalStorage: Story = {
  render: () => ({
    components: { ClientOnly },
    setup() {
      const storedValue = ref('')
      const inputValue = ref('')

      const saveToStorage = () => {
        localStorage.setItem('storybook-demo', inputValue.value)
        loadFromStorage()
      }

      const loadFromStorage = () => {
        storedValue.value =
          localStorage.getItem('storybook-demo') || 'No hay valor guardado'
      }

      const clearStorage = () => {
        localStorage.removeItem('storybook-demo')
        loadFromStorage()
      }

      // Cargar valor inicial
      loadFromStorage()

      return {
        storedValue,
        inputValue,
        saveToStorage,
        loadFromStorage,
        clearStorage,
      }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h3 class="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              localStorage Demo
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-indigo-800 dark:text-indigo-200 mb-1">
                  Valor guardado:
                </label>
                <p class="text-indigo-800 dark:text-indigo-200 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {{ storedValue }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-indigo-800 dark:text-indigo-200 mb-1">
                  Nuevo valor:
                </label>
                <input 
                  v-model="inputValue"
                  type="text"
                  class="w-full px-3 py-2 border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-indigo-900 dark:text-indigo-100"
                  placeholder="Escribe algo..."
                />
              </div>
              <div class="flex gap-2">
                <BaseButton @click="saveToStorage" variant="primary" size="sm">
                  Guardar
                </BaseButton>
                <BaseButton @click="clearStorage" variant="secondary" size="sm">
                  Limpiar
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con geolocalización
export const WithGeolocation: Story = {
  render: () => ({
    components: { ClientOnly },
    setup() {
      const location = ref('')
      const error = ref('')
      const loading = ref(false)

      const getLocation = () => {
        loading.value = true
        error.value = ''

        if (!navigator.geolocation) {
          error.value = 'Geolocalización no soportada'
          loading.value = false
          return
        }

        navigator.geolocation.getCurrentPosition(
          position => {
            location.value =
              'Lat: ' +
              position.coords.latitude.toFixed(4) +
              ', Lon: ' +
              position.coords.longitude.toFixed(4)
            loading.value = false
          },
          err => {
            error.value = 'Error: ' + err.message
            loading.value = false
          },
        )
      }

      return { location, error, loading, getLocation }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <h3 class="font-semibold text-teal-900 dark:text-teal-100 mb-2">
              Geolocalización
            </h3>
            <div class="space-y-3">
              <BaseButton @click="getLocation" variant="primary" size="sm" :disabled="loading">
                {{ loading ? 'Obteniendo...' : 'Obtener Ubicación' }}
              </BaseButton>
              <div v-if="location" class="text-sm">
                <p class="text-teal-800 dark:text-teal-200">
                  Ubicación: {{ location }}
                </p>
              </div>
              <div v-if="error" class="text-sm">
                <p class="text-red-600 dark:text-red-400">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Con Web APIs
export const WithWebAPIs: Story = {
  render: () => ({
    components: { ClientOnly },
    setup() {
      const clipboardText = ref('')
      const notificationSupported = ref(false)
      const notificationPermission = ref('')

      const checkAPIs = () => {
        notificationSupported.value = 'Notification' in window
        notificationPermission.value = notificationSupported.value
          ? Notification.permission
          : 'No soportado'
      }

      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText('Texto copiado desde Storybook!')
          clipboardText.value = 'Texto copiado exitosamente!'
          setTimeout(() => {
            clipboardText.value = ''
          }, 2000)
        } catch (err) {
          clipboardText.value = 'Error al copiar al portapapeles'
        }
      }

      const requestNotification = () => {
        if (notificationSupported.value) {
          Notification.requestPermission().then(permission => {
            notificationPermission.value = permission
          })
        }
      }

      // Verificar APIs al montar
      checkAPIs()

      return {
        clipboardText,
        notificationSupported,
        notificationPermission,
        copyToClipboard,
        requestNotification,
      }
    },
    template: `
      <ClientOnly>
        <div class="space-y-4">
          <div class="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <h3 class="font-semibold text-pink-900 dark:text-pink-100 mb-2">
              Web APIs
            </h3>
            <div class="space-y-3">
              <div>
                <BaseButton @click="copyToClipboard" variant="primary" size="sm">
                  Copiar al Portapapeles
                </BaseButton>
                <p v-if="clipboardText" class="text-sm text-pink-800 dark:text-pink-200 mt-1">
                  {{ clipboardText }}
                </p>
              </div>
              <div>
                <p class="text-sm text-pink-800 dark:text-pink-200">
                  Notificaciones: {{ notificationSupported ? 'Soportado' : 'No soportado' }}
                </p>
                <p class="text-sm text-pink-800 dark:text-pink-200">
                  Permiso: {{ notificationPermission }}
                </p>
                <BaseButton 
                  v-if="notificationSupported" 
                  @click="requestNotification" 
                  variant="secondary" 
                  size="sm"
                >
                  Solicitar Permiso
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: args => ({
    components: { ClientOnly },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <ClientOnly v-bind="args">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300">
              Contenido del cliente con accesibilidad completa
            </p>
          </div>
        </ClientOnly>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Componente ClientOnly con roles ARIA apropiados y navegación por teclado
        </p>
      </div>
    `,
  }),
  args: {
    fallback: 'Cargando contenido del cliente...',
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
