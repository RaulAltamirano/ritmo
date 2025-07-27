<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header de la página -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Configuración
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Personaliza tu experiencia y ajusta las preferencias del sistema
      </p>
    </div>

    <!-- Configuraciones -->
    <div class="space-y-6">
      <!-- Apariencia -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Apariencia
        </h2>
        
        <div class="space-y-4">
          <!-- Modo oscuro -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Modo oscuro
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Cambiar entre tema claro y oscuro
              </p>
            </div>
            <button
              @click="toggleDarkMode"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="isDark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="isDark ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <!-- Tamaño de fuente -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tamaño de fuente
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ajustar el tamaño del texto
              </p>
            </div>
            <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="small">Pequeño</option>
              <option value="medium" selected>Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notificaciones
        </h2>
        
        <div class="space-y-4">
          <!-- Email notifications -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Email notifications</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receive reminders and updates by email</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
            </button>
          </div>

          <!-- Notificaciones push -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones push
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Recibir notificaciones en tiempo real
              </p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"></span>
            </button>
          </div>

          <!-- Recordatorios de tareas -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recordatorios de tareas
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Alertas para tareas pendientes
              </p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Productividad -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Productividad
        </h2>
        
        <div class="space-y-4">
          <!-- Default session time -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Default session time</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Set the default duration for work sessions</p>
            </div>
            <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="15">15 minutes</option>
              <option value="25" selected>25 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <!-- Pausas automáticas -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pausas automáticas
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Tomar descansos automáticos entre sesiones
              </p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
            </button>
          </div>

          <!-- Sonidos de notificación -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sonidos de notificación
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Reproducir sonidos para alertas
              </p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Privacidad y seguridad -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Privacidad y seguridad
        </h2>
        
        <div class="space-y-4">
          <!-- Auto logout -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Auto logout</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Automatically log out after 30 minutes of inactivity</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
            </button>
          </div>

          <!-- Sincronización de datos -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sincronización de datos
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Mantener datos sincronizados entre dispositivos
              </p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Acciones
        </h2>
        
        <div class="space-y-4">
          <!-- Exportar datos -->
          <button class="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <div class="flex items-center space-x-3">
              <Download class="text-gray-500 dark:text-gray-400" :size="20" />
              <div class="text-left">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exportar datos
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Descargar todos tus datos en formato JSON
                </p>
              </div>
            </div>
            <ChevronRight class="text-gray-400" :size="16" />
          </button>

          <!-- Limpiar caché -->
          <button class="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <div class="flex items-center space-x-3">
              <Trash2 class="text-gray-500 dark:text-gray-400" :size="20" />
              <div class="text-left">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Limpiar caché
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Eliminar datos temporales almacenados
                </p>
              </div>
            </div>
            <ChevronRight class="text-gray-400" :size="16" />
          </button>

          <!-- Restablecer configuración -->
          <button class="w-full flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
            <div class="flex items-center space-x-3">
              <RotateCcw class="text-red-500" :size="20" />
              <div class="text-left">
                <p class="text-sm font-medium text-red-700 dark:text-red-400">
                  Restablecer configuración
                </p>
                <p class="text-sm text-red-500 dark:text-red-400">
                  Volver a la configuración predeterminada
                </p>
              </div>
            </div>
            <ChevronRight class="text-red-400" :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, ChevronRight, Trash2, RotateCcw } from 'lucide-vue-next'

// Meta tags para la página
useHead({
  title: 'Configuración',
  meta: [
    { name: 'description', content: 'Personaliza tu experiencia y ajusta las preferencias del sistema' }
  ]
})

// Estado del modo oscuro
const isDark = ref(false)

// Detectar modo oscuro inicial
onMounted(() => {
  if (!process.client) return
  isDark.value = document.documentElement.classList.contains('dark')
})

// Toggle del modo oscuro
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script> 