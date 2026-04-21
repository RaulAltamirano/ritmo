import DOMPurify from 'dompurify'

/**
 * Utilidades de sanitización para prevenir XSS y ataques de inyección
 * Implementa las mejores prácticas de seguridad de 2025
 */

// Configuración de DOMPurify para máxima seguridad
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [], // No permitir ningún tag HTML
  ALLOWED_ATTR: [], // No permitir ningún atributo
  FORBID_TAGS: [
    'script',
    'object',
    'embed',
    'form',
    'input',
    'textarea',
    'select',
    'button',
  ],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  KEEP_CONTENT: true, // Mantener contenido de texto pero remover tags
  RETURN_DOM: false, // Retornar string en lugar de DOM
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
}

/**
 * Sanitiza texto plano removiendo todo HTML y JavaScript
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    // Primera pasada: remover HTML con DOMPurify
    let sanitized = DOMPurify.sanitize(input, PURIFY_CONFIG)

    // Segunda pasada: remover caracteres potencialmente peligrosos
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')

    // Tercera pasada: trim y normalizar espacios
    sanitized = sanitized.trim().replace(/\s+/g, ' ')

    return sanitized
  } catch (error) {
    console.error('Error sanitizing text:', error)
    return ''
  }
}

/**
 * Sanitiza HTML permitiendo solo tags seguros
 */
export function sanitizeHTML(
  input: string,
  allowedTags: string[] = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    const config = {
      ...PURIFY_CONFIG,
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class', 'id', 'style'],
      ALLOW_DATA_ATTR: false,
    }

    return DOMPurify.sanitize(input, config)
  } catch (error) {
    console.error('Error sanitizing HTML:', error)
    return ''
  }
}

/**
 * Sanitiza nombres de usuario
 */
export function sanitizeUsername(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    let sanitized = sanitizeText(input)

    // Solo permitir letras, números, guiones y guiones bajos
    sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '')

    // Limitar longitud
    sanitized = sanitized.substring(0, 30)

    return sanitized
  } catch (error) {
    console.error('Error sanitizing username:', error)
    return ''
  }
}

/**
 * Sanitiza emails
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    let sanitized = sanitizeText(input)

    // Convertir a minúsculas
    sanitized = sanitized.toLowerCase()

    // Remover espacios
    sanitized = sanitized.replace(/\s/g, '')

    // Validar formato básico de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(sanitized)) {
      return ''
    }

    return sanitized
  } catch (error) {
    console.error('Error sanitizing email:', error)
    return ''
  }
}

/**
 * Sanitiza URLs
 */
export function sanitizeURL(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    const sanitized = sanitizeText(input)

    // Solo permitir URLs HTTP/HTTPS
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return ''
    }

    // Validar formato de URL
    try {
      new URL(sanitized)
      return sanitized
    } catch {
      return ''
    }
  } catch (error) {
    console.error('Error sanitizing URL:', error)
    return ''
  }
}

/**
 * Sanitiza números
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isFinite(input) ? input : null
  }

  if (!input || typeof input !== 'string') {
    return null
  }

  try {
    const sanitized = sanitizeText(input)
    const number = parseFloat(sanitized)

    return isFinite(number) ? number : null
  } catch (error) {
    console.error('Error sanitizing number:', error)
    return null
  }
}

/**
 * Sanitiza objetos completos
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizers: Record<keyof T, (value: any) => any>,
): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (sanitizers[key]) {
      sanitized[key] = sanitizers[key](value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Sanitiza arrays
 */
export function sanitizeArray<T>(arr: T[], sanitizer: (item: T) => T): T[] {
  if (!Array.isArray(arr)) {
    return []
  }

  try {
    return arr.map(item => sanitizer(item)).filter(Boolean)
  } catch (error) {
    console.error('Error sanitizing array:', error)
    return []
  }
}

/**
 * Sanitiza archivos de imagen
 */
export function sanitizeImageFile(file: File): File | null {
  if (!file || !(file instanceof File)) {
    return null
  }

  try {
    // Verificar tipo MIME
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      return null
    }

    // Verificar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return null
    }

    // Verificar nombre del archivo
    const sanitizedName = sanitizeText(file.name)
    if (!sanitizedName) {
      return null
    }

    // Crear nuevo archivo con nombre sanitizado
    return new File([file], sanitizedName, {
      type: file.type,
      lastModified: file.lastModified,
    })
  } catch (error) {
    console.error('Error sanitizing image file:', error)
    return null
  }
}

/**
 * Sanitiza datos de formulario
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value, item =>
        typeof item === 'string' ? sanitizeText(item) : item,
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Función de escape para prevenir inyección de HTML
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Función para verificar si un string contiene contenido malicioso
 */
export function containsMaliciousContent(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<textarea/i,
    /<select/i,
    /<button/i,
  ]

  return maliciousPatterns.some(pattern => pattern.test(input))
}
