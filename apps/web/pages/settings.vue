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
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Apariencia
        </h2>

        <div class="space-y-4">
          <!-- Tema del sistema -->
          <div class="space-y-3">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema del sistema
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Selecciona tu preferencia de tema
              </p>
            </div>

            <!-- Opciones de tema -->
            <div class="grid grid-cols-3 gap-3">
              <!-- Tema claro -->
              <button
                @click="changeTheme('light')"
                class="p-3 rounded-lg border-2 transition-all duration-200"
                :class="[
                  activeTheme === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-outline-strong hover:border-gray-300 dark:hover:border-gray-500',
                ]"
              >
                <div class="text-center">
                  <div
                    class="w-8 h-8 bg-white border border-gray-300 rounded mx-auto mb-2"
                  ></div>
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Claro
                  </p>
                </div>
              </button>

              <!-- Tema oscuro -->
              <button
                @click="changeTheme('dark')"
                class="p-3 rounded-lg border-2 transition-all duration-200"
                :class="[
                  activeTheme === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-outline-strong hover:border-gray-300 dark:hover:border-gray-500',
                ]"
              >
                <div class="text-center">
                  <div
                    class="w-8 h-8 bg-gray-800 border border-gray-600 rounded mx-auto mb-2"
                  ></div>
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Oscuro
                  </p>
                </div>
              </button>

              <!-- Tema del sistema -->
              <button
                @click="changeTheme('system')"
                class="p-3 rounded-lg border-2 transition-all duration-200"
                :class="[
                  activeTheme === 'system'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-outline-strong hover:border-gray-300 dark:hover:border-gray-500',
                ]"
              >
                <div class="text-center">
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-white to-gray-800 border border-gray-300 rounded mx-auto mb-2"
                  ></div>
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Sistema
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Zona horaria -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zona horaria
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Configurar tu zona horaria local
              </p>
            </div>
            <select
              class="px-3 py-2 border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface text-gray-900 dark:text-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/Mexico_City" selected>México (GMT-6)</option>
              <option value="America/New_York">Nueva York (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Europe/London">Londres (GMT+0)</option>
            </select>
          </div>

          <!-- Idioma -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Seleccionar idioma de la interfaz
              </p>
            </div>
            <select
              class="px-3 py-2 border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface text-gray-900 dark:text-white"
            >
              <option value="es" selected>Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Temporizador Pomodoro (presets en cuenta, spec §5.4) -->
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Temporizador Pomodoro
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Foco entre 1 y 240 min (60–14400 s); pausa entre 0 y 60 min. Se sincroniza con
          tu cuenta.
        </p>
        <div class="space-y-4">
          <div
            v-for="(row, idx) in presetEditor"
            :key="row.key"
            class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end border border-outline-strong/60 rounded-lg p-4"
          >
            <div class="sm:col-span-3">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Clave
              </p>
              <p class="font-mono text-sm text-gray-800 dark:text-gray-200">
                {{ row.key }}
              </p>
            </div>
            <label class="sm:col-span-3 block">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
                >Foco (min)</span
              >
              <input
                v-model.number="presetEditor[idx]!.workMin"
                type="number"
                min="1"
                max="240"
                class="mt-1 w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white"
              />
            </label>
            <label class="sm:col-span-3 block">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
                >Pausa (min)</span
              >
              <input
                v-model.number="presetEditor[idx]!.breakMin"
                type="number"
                min="0"
                max="60"
                class="mt-1 w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white"
              />
            </label>
            <label class="sm:col-span-3 block">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
                >Etiqueta</span
              >
              <input
                v-model="presetEditor[idx]!.label"
                type="text"
                maxlength="120"
                class="mt-1 w-full px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white"
              />
            </label>
          </div>
          <p v-if="timerSaveErr" class="text-sm text-red-600 dark:text-red-400">
            {{ timerSaveErr }}
          </p>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            :disabled="timerSaving || presetEditor.length === 0"
            @click="saveTimerPresets"
          >
            {{ timerSaving ? 'Guardando…' : 'Guardar presets' }}
          </button>
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notificaciones
        </h2>

        <div class="space-y-4">
          <!-- Notificaciones por email -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones por email
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Recibir notificaciones importantes por correo
              </p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"
              ></span>
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
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"
              ></span>
            </button>
          </div>

          <!-- Notificaciones SMS -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones SMS
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Recibir alertas críticas por mensaje de texto
              </p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Privacidad -->
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Privacidad
        </h2>

        <div class="space-y-4">
          <!-- Visibilidad del perfil -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visibilidad del perfil
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Quién puede ver tu perfil
              </p>
            </div>
            <select
              class="px-3 py-2 border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface text-gray-900 dark:text-white"
            >
              <option value="private" selected>Privado</option>
              <option value="friends">Solo amigos</option>
              <option value="public">Público</option>
            </select>
          </div>

          <!-- Mostrar email -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mostrar email
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Permitir que otros vean tu dirección de correo
              </p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"
              ></span>
            </button>
          </div>

          <!-- Mostrar última actividad -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mostrar última actividad
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Permitir que otros vean cuándo estuviste activo
              </p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Acciones
        </h2>

        <div class="space-y-4">
          <!-- Exportar datos -->
          <button
            class="w-full flex items-center justify-between p-4 border border-outline-strong rounded-lg hover:bg-surface-raised transition-colors duration-200"
          >
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
          <button
            class="w-full flex items-center justify-between p-4 border border-outline-strong rounded-lg hover:bg-surface-raised transition-colors duration-200"
          >
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
          <button
            class="w-full flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
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
  import { useThemeApi } from '@/composables/shared/useThemeApi'
  import { useTimerStore } from '@/stores/timer'
  import { ChevronRight, Download, RotateCcw, Trash2 } from 'lucide-vue-next'
  import { computed, onMounted, ref } from 'vue'

  // Page meta
  definePageMeta({
    title: 'Settings',
    description: 'Customize your Ritmo experience and adjust system preferences',
  })

  const { $theme } = useNuxtApp()
  const { setTheme, themeState } = $theme || {}

  const activeTheme = computed(() => themeState?.value?.theme ?? 'system')

  const changeTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (setTheme) {
      await setTheme(theme)
    }
  }

  const timerStore = useTimerStore()
  const { getUserPreferences, updateUserPreferences } = useThemeApi()

  type PresetEditorRow = {
    key: string
    workMin: number
    breakMin: number
    label: string
  }
  const presetEditor = ref<PresetEditorRow[]>([])
  const timerSaving = ref(false)
  const timerSaveErr = ref<string | null>(null)

  function rowsFromTimerModes() {
    presetEditor.value = timerStore.timerModes.map(m => ({
      key: m.presetKey ?? m.id.replace(/^preset-/, ''),
      workMin: m.minutes ?? Math.max(1, Math.round(m.time / 60)),
      breakMin: Math.max(0, Math.round((m.breakSec ?? 300) / 60)),
      label: m.name,
    }))
  }

  onMounted(async () => {
    const pref = await getUserPreferences()
    const tp = pref?.preferences?.timerPresets
    if (tp?.presets?.length) {
      presetEditor.value = tp.presets.map(p => ({
        key: p.key,
        workMin: Math.round(p.workSec / 60),
        breakMin: Math.round(p.breakSec / 60),
        label: p.label ?? '',
      }))
    } else {
      rowsFromTimerModes()
    }
  })

  async function saveTimerPresets() {
    timerSaving.value = true
    timerSaveErr.value = null
    try {
      await updateUserPreferences({
        timerPresets: {
          defaultPresetKey: presetEditor.value[0]?.key ?? '25_5',
          presets: presetEditor.value.map(r => ({
            key: r.key,
            workSec: Math.min(14400, Math.max(60, r.workMin * 60)),
            breakSec: Math.min(3600, Math.max(0, r.breakMin * 60)),
            label: r.label.trim() ?? undefined,
          })),
        },
      })
      await timerStore.syncTimerPresetsFromApi()
      rowsFromTimerModes()
    } catch {
      timerSaveErr.value =
        'No se pudieron guardar los presets. Comprueba foco (1–240 min) y pausa (0–60 min).'
    } finally {
      timerSaving.value = false
    }
  }
</script>
