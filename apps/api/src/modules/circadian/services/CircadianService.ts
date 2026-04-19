/**
 * 🌅 CIRCADIAN SERVICE - RITMO API 2025
 *
 * Servicio principal para la gestión de fases circadianas
 * Implementa lógica de negocio para determinar fases actuales
 */

import {
  CircadianPhaseDTO,
  GetCurrentPhaseRequestDTO,
  GetPhasesRequestDTO,
  SimplePhasesDTO,
} from '../dto/CircadianDTOs.js'

// ========================================
// CIRCADIAN PHASES DATA
// ========================================

const CIRCADIAN_PHASES: CircadianPhaseDTO[] = [
  {
    id: 'dawn',
    type: 'dawn',
    name: 'Amanecer',
    description: 'Fase de despertar natural y preparación',
    startHour: 5,
    endHour: 7,
    priority: 'high',
    category: 'awakening',
    isPremium: false,
    isIntuitive: true,
    taskRecommendations: [
      'Meditación matutina',
      'Ejercicio ligero',
      'Planificación del día',
      'Hidratación',
    ],
    productivityTips: [
      'Evita pantallas brillantes',
      'Exposición a luz natural',
      'Rutina de despertar gradual',
    ],
    color: '#FFE4B5',
    icon: '🌅',
  },
  {
    id: 'morning',
    type: 'morning',
    name: 'Mañana',
    description: 'Fase de alta energía y concentración',
    startHour: 7,
    endHour: 12,
    priority: 'high',
    category: 'peak',
    isPremium: false,
    isIntuitive: true,
    taskRecommendations: [
      'Tareas complejas',
      'Reuniones importantes',
      'Trabajo creativo',
      'Decisiones críticas',
    ],
    productivityTips: [
      'Aprovecha el pico de cortisol',
      'Evita interrupciones',
      'Trabajo profundo',
    ],
    color: '#FFD700',
    icon: '☀️',
  },
  {
    id: 'afternoon',
    type: 'afternoon',
    name: 'Tarde',
    description: 'Fase de energía moderada y colaboración',
    startHour: 12,
    endHour: 17,
    priority: 'medium',
    category: 'moderate',
    isPremium: false,
    isIntuitive: true,
    taskRecommendations: [
      'Reuniones de equipo',
      'Tareas administrativas',
      'Comunicación',
      'Revisión de trabajo',
    ],
    productivityTips: [
      'Toma descansos regulares',
      'Mantén hidratación',
      'Evita decisiones complejas',
    ],
    color: '#FFA500',
    icon: '🌤️',
  },
  {
    id: 'evening',
    type: 'evening',
    name: 'Atardecer',
    description: 'Fase de transición y reflexión',
    startHour: 17,
    endHour: 20,
    priority: 'medium',
    category: 'transition',
    isPremium: false,
    isIntuitive: true,
    taskRecommendations: [
      'Revisión del día',
      'Planificación del siguiente día',
      'Actividades sociales',
      'Ejercicio moderado',
    ],
    productivityTips: [
      'Evita trabajo intenso',
      'Prepara para el descanso',
      'Reflexión personal',
    ],
    color: '#FF6347',
    icon: '🌅',
  },
  {
    id: 'night',
    type: 'night',
    name: 'Noche',
    description: 'Fase de descanso y recuperación',
    startHour: 20,
    endHour: 5,
    priority: 'high',
    category: 'rest',
    isPremium: false,
    isIntuitive: true,
    taskRecommendations: [
      'Lectura ligera',
      'Meditación',
      'Preparación para dormir',
      'Actividades relajantes',
    ],
    productivityTips: [
      'Evita pantallas azules',
      'Ambiente relajado',
      'Rutina de sueño consistente',
    ],
    color: '#191970',
    icon: '🌙',
  },
]

// ========================================
// CIRCADIAN SERVICE CLASS
// ========================================

export class CircadianService {
  /**
   * Obtiene todas las fases circadianas (versión simple)
   */
  async getAllPhases(request: GetPhasesRequestDTO): Promise<SimplePhasesDTO> {
    try {
      let phases = [...CIRCADIAN_PHASES]

      // Filtrar por categoría si se especifica
      if (request.category) {
        phases = phases.filter(phase => phase.category === request.category)
      }

      // Filtrar por prioridad si se especifica
      if (request.priority) {
        phases = phases.filter(phase => phase.priority === request.priority)
      }

      // Filtrar fases inactivas si no se incluyen
      if (!request.includeInactive) {
        phases = phases.filter(phase => phase.isIntuitive)
      }

      return {
        phases,
      }
    } catch (error) {
      throw new Error(`Error getting all phases: ${error}`)
    }
  }

  /**
   * Determina la fase circadian actual basada en la hora UTC
   */
  async getCurrentPhase(
    request: GetCurrentPhaseRequestDTO,
  ): Promise<CircadianPhaseDTO> {
    try {
      const customTime = request.customTime

      // Determinar la hora actual
      let currentHour: number

      if (customTime) {
        const currentTime = new Date(customTime)
        currentHour = currentTime.getUTCHours()
      } else {
        currentHour = new Date().getUTCHours()
      }

      // Encontrar la fase actual
      const currentPhase = this.findPhaseByHour(currentHour)

      return currentPhase
    } catch (error) {
      throw new Error(`Error getting current phase: ${error}`)
    }
  }

  /**
   * Encuentra la fase correspondiente a una hora específica
   */
  private findPhaseByHour(hour: number): CircadianPhaseDTO {
    // La fase 'night' tiene un rango especial (20-5)
    if (hour >= 20 || hour < 5) {
      return CIRCADIAN_PHASES.find(phase => phase.type === 'night')!
    }

    // Para las demás fases, buscar por rango normal
    for (const phase of CIRCADIAN_PHASES) {
      if (phase.type !== 'night' && hour >= phase.startHour && hour < phase.endHour) {
        return phase
      }
    }

    // Fallback a morning si no se encuentra nada
    return CIRCADIAN_PHASES.find(phase => phase.type === 'morning')!
  }
}
