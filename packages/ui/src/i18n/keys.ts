// Claves de i18n para Ritmo UI Components
// Este archivo centraliza todas las traducciones necesarias

export const i18nKeys = {
  // Botones
  button: {
    loading: 'Cargando...',
    submit: 'Enviar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    search: 'Buscar',
    clear: 'Limpiar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
  },

  // Inputs
  input: {
    error: {
      required: 'Este campo es requerido',
      invalid: 'Valor inválido',
      email: 'Email inválido',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      pattern: 'Formato inválido',
      number: 'Debe ser un número',
      url: 'URL inválida',
      phone: 'Teléfono inválido',
    },
    hint: {
      password: 'Mínimo 8 caracteres',
      email: 'ejemplo@correo.com',
      phone: '+1 (555) 123-4567',
      url: 'https://ejemplo.com',
    },
    placeholder: {
      search: 'Buscar...',
      email: 'tu@email.com',
      password: 'Tu contraseña',
      name: 'Tu nombre',
      phone: 'Tu teléfono',
    },
  },

  // Modales
  modal: {
    opened: 'Modal abierto',
    closed: 'Modal cerrado',
    close: 'Cerrar modal',
    confirm: 'Confirmar acción',
    cancel: 'Cancelar acción',
  },

  // Notificaciones
  notification: {
    success: 'Operación exitosa',
    error: 'Error en la operación',
    warning: 'Advertencia',
    info: 'Información',
    loading: 'Procesando...',
  },

  // Formularios
  form: {
    required: 'Campo requerido',
    invalid: 'Campo inválido',
    submit: 'Enviar formulario',
    reset: 'Reiniciar formulario',
    saving: 'Guardando...',
    saved: 'Guardado exitosamente',
  },

  // Navegación
  navigation: {
    home: 'Inicio',
    menu: 'Menú',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    register: 'Registrarse',
  },

  // Estados
  status: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    empty: 'Sin datos',
    noResults: 'No se encontraron resultados',
  },

  // Accesibilidad
  a11y: {
    close: 'Cerrar',
    open: 'Abrir',
    expand: 'Expandir',
    collapse: 'Colapsar',
    next: 'Siguiente',
    previous: 'Anterior',
    first: 'Primero',
    last: 'Último',
    loading: 'Cargando',
    error: 'Error',
    success: 'Éxito',
    required: 'Requerido',
    optional: 'Opcional',
  },

  // Tiempo
  time: {
    seconds: 'segundos',
    minutes: 'minutos',
    hours: 'horas',
    days: 'días',
    weeks: 'semanas',
    months: 'meses',
    years: 'años',
    ago: 'hace',
    in: 'en',
    now: 'ahora',
    today: 'hoy',
    yesterday: 'ayer',
    tomorrow: 'mañana',
  },

  // Números
  numbers: {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
  },

  // Meses
  months: {
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
  },

  // Días de la semana
  weekdays: {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  },
}

// Función helper para obtener traducciones con parámetros
export const translate = (key: string, params?: Record<string, any>): string => {
  const keys = key.split('.')
  let value: any = i18nKeys

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Fallback a la clave si no se encuentra
    }
  }

  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? String(params[param]) : match
    })
  }

  return value ?? key
}

// Exportar tipos para TypeScript
export type I18nKey = keyof typeof i18nKeys
export type TranslationParams = Record<string, any>
