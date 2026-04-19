// =====================================================
// CIRCADIAN PHASES CONSTANTS - 2025 BEST PRACTICES
// =====================================================
//
// Este archivo contiene las constantes y configuraciones
// para el sistema de fases circadianas, centralizando
// toda la información necesaria para la aplicación

import {
  CircadianPhaseCategory,
  CircadianPhasePriority,
  CircadianPhaseType,
} from '../../types/circadian'

export const CIRCADIAN_PHASES_CONFIG = {
  // Configuración general del sistema
  SYSTEM: {
    TIMEZONE_DEFAULT: 'UTC',
    DAY_START_HOUR: 5, // 5:00 AM
    DAY_END_HOUR: 23, // 11:00 PM
    PHASE_OVERLAP_MINUTES: 0, // Sin solapamiento
    DEFAULT_DURATION_MINUTES: 120, // 2 horas por defecto
    MIN_PHASE_DURATION_MINUTES: 60, // Mínimo 1 hora
    MAX_PHASE_DURATION_MINUTES: 240, // Máximo 4 horas
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    DEFAULT_TYPE: 'push',
    TYPES: ['push', 'email', 'both', 'none'] as const,
    ADVANCE_WARNING_MINUTES: 15, // Avisar 15 min antes
    REMINDER_INTERVAL_MINUTES: 30, // Recordar cada 30 min
    MAX_DAILY_NOTIFICATIONS: 8, // Máximo 8 notificaciones por día
  },

  // Configuración de métricas
  METRICS: {
    SCORE_MIN: 1,
    SCORE_MAX: 10,
    DEFAULT_PRODUCTIVITY_SCORE: 7.0,
    DEFAULT_FOCUS_SCORE: 7.0,
    DEFAULT_ENERGY_LEVEL: 7.0,
    MIN_SESSIONS_FOR_ACCURACY: 5, // Mínimo 5 sesiones para precisión
    CONFIDENCE_THRESHOLD: 0.7, // Umbral de confianza para recomendaciones
    PRODUCTIVITY_WEIGHT: 0.4, // Peso de productividad en cálculos
    FOCUS_WEIGHT: 0.3, // Peso de enfoque en cálculos
    ENERGY_WEIGHT: 0.3, // Peso de energía en cálculos
  },

  // Configuración de personalización
  PERSONALIZATION: {
    MAX_CUSTOM_HOURS: 2, // Máximo 2 horas de personalización
    MIN_CUSTOM_HOURS: 0.5, // Mínimo 30 minutos de personalización
    MAX_PREFERRED_TASK_TYPES: 10, // Máximo 10 tipos de tareas preferidos
    AUTO_SCHEDULING_THRESHOLD: 0.8, // Umbral para programación automática
    LEARNING_RATE: 0.1, // Tasa de aprendizaje para ajustes automáticos
    ADAPTATION_PERIOD_DAYS: 14, // Período de adaptación en días
  },

  // Configuración de análisis
  ANALYTICS: {
    DEFAULT_ANALYSIS_PERIOD_DAYS: 30,
    MIN_ANALYSIS_PERIOD_DAYS: 7,
    MAX_ANALYSIS_PERIOD_DAYS: 365,
    PATTERN_DETECTION_THRESHOLD: 0.6, // Umbral para detectar patrones
    ANOMALY_DETECTION_SIGMA: 2.0, // Desviación estándar para anomalías
    TREND_ANALYSIS_MIN_POINTS: 10, // Mínimo 10 puntos para análisis de tendencias
    CORRELATION_THRESHOLD: 0.5, // Umbral mínimo de correlación
  },
}

export const PHASE_DEFAULTS = {
  [CircadianPhaseType.SLOW_ACTIVATION]: {
    category: CircadianPhaseCategory.ACTIVATION,
    priority: CircadianPhasePriority.LOW,
    startHour: 5,
    endHour: 7,
    duration: 120,
    name: 'Slow Activation Phase',
    keyword: 'Calm',
    description:
      'Low alertness due to sleep inertia. Cortisol levels begin to rise, but performance is still suboptimal. Best suited for gentle activation tasks.',
    idealFor: 'Meditation, journaling, visualization',
    color: '#fde047',
    icon: 'coffee',
    emoji: '🟡',
    isPremium: false,
    isIntuitive: true,
    scientificReferences: ['PMC10683050'],
    evidenceLevel: 'high',
    sortOrder: 1,
  },
  [CircadianPhaseType.MORNING_FOCUS_PEAK]: {
    category: CircadianPhaseCategory.PERFORMANCE,
    priority: CircadianPhasePriority.CRITICAL,
    startHour: 7,
    endHour: 9,
    duration: 120,
    name: 'Morning Focus Peak',
    keyword: 'Focus',
    description:
      'High attention and short-term memory performance, supported by circadian cortisol peak. Ideal for structured study and detail-oriented tasks.',
    idealFor: 'Technical reading, structured study',
    color: '#4ade80',
    icon: 'sun',
    emoji: '🟢',
    isPremium: true,
    isIntuitive: false,
    scientificReferences: ['Springer2023', 'Circadian rhythm Wiki'],
    evidenceLevel: 'high',
    sortOrder: 2,
  },
  [CircadianPhaseType.COGNITIVE_PEAK]: {
    category: CircadianPhaseCategory.PERFORMANCE,
    priority: CircadianPhasePriority.CRITICAL,
    startHour: 9,
    endHour: 12,
    duration: 180,
    name: 'Cognitive Performance Peak',
    keyword: 'Peak',
    description:
      'Maximum cognitive performance for problem-solving, logic, and deep work. Processing speed and working memory reach high levels.',
    idealFor: 'Programming, logic, deep work',
    color: '#60a5fa',
    icon: 'activity',
    emoji: '🔵',
    isPremium: true,
    isIntuitive: false,
    scientificReferences: ['PMC10683050', 'PubMed38034504'],
    evidenceLevel: 'high',
    sortOrder: 3,
  },
  [CircadianPhaseType.SECOND_PRODUCTIVITY]: {
    category: CircadianPhaseCategory.PERFORMANCE,
    priority: CircadianPhasePriority.HIGH,
    startHour: 13,
    endHour: 15,
    duration: 120,
    name: 'Second Productivity Peak',
    keyword: 'Review',
    description:
      'Second circasemidian peak. If recovered, cognitive performance improves again, especially for review and technical tasks.',
    idealFor: 'Review, technical tasks, recap',
    color: '#38bdf8',
    icon: 'repeat',
    emoji: '🔵',
    isPremium: true,
    isIntuitive: false,
    scientificReferences: ['Circasemidian rhythm Wiki'],
    evidenceLevel: 'medium',
    sortOrder: 4,
  },
  [CircadianPhaseType.CREATIVE_WINDOW]: {
    category: CircadianPhaseCategory.CREATIVE,
    priority: CircadianPhasePriority.MEDIUM,
    startHour: 15,
    endHour: 17,
    duration: 120,
    name: 'Creative/Verbal Window',
    keyword: 'Create',
    description:
      'Verbal fluency and creative thinking increase in the afternoon. Creativity often benefits from reduced inhibition during descending energy.',
    idealFor: 'Writing, design, language output',
    color: '#a78bfa',
    icon: 'pen-tool',
    emoji: '🟣',
    isPremium: false,
    isIntuitive: true,
    scientificReferences: ['GQ2024', 'PubMed38034504'],
    evidenceLevel: 'medium',
    sortOrder: 5,
  },
  [CircadianPhaseType.TRANSITION]: {
    category: CircadianPhaseCategory.REFLECTION,
    priority: CircadianPhasePriority.MEDIUM,
    startHour: 17,
    endHour: 19,
    duration: 120,
    name: 'Transition Phase',
    keyword: 'Reflect',
    description:
      'Energy starts to decline; reflection and memory consolidation become more prominent. Best for journaling and active review.',
    idealFor: 'Consolidation, active review, journaling',
    color: '#fdba74',
    icon: 'book-open',
    emoji: '🟠',
    isPremium: false,
    isIntuitive: true,
    scientificReferences: ['PMC10683050'],
    evidenceLevel: 'high',
    sortOrder: 6,
  },
  [CircadianPhaseType.INTROSPECTIVE]: {
    category: CircadianPhaseCategory.REFLECTION,
    priority: CircadianPhasePriority.LOW,
    startHour: 19,
    endHour: 21,
    duration: 120,
    name: 'Introspective Phase',
    keyword: 'Plan',
    description:
      'Autobiographical memory and emotional integration become dominant. Good for planning and visualization.',
    idealFor: 'Slow reading, visualization, planning',
    color: '#fde047',
    icon: 'moon',
    emoji: '🟡',
    isPremium: false,
    isIntuitive: true,
    scientificReferences: ['Nature2018', 'GQ2024'],
    evidenceLevel: 'medium',
    sortOrder: 7,
  },
  [CircadianPhaseType.SLEEP_PREPARATION]: {
    category: CircadianPhaseCategory.REST,
    priority: CircadianPhasePriority.LOW,
    startHour: 21,
    endHour: 23,
    duration: 120,
    name: 'Sleep Preparation',
    keyword: 'Sleep',
    description:
      'Cortical activity decreases as melatonin rises. Best for winding down and sleep hygiene routines.',
    idealFor: 'Rest routine, sleep hygiene',
    color: '#a3a3a3',
    icon: 'bed',
    emoji: '⚫',
    isPremium: false,
    isIntuitive: false,
    scientificReferences: ['Circadian rhythm Wiki'],
    evidenceLevel: 'high',
    sortOrder: 8,
  },
}

export const TASK_TYPE_MAPPINGS = {
  [CircadianPhaseType.SLOW_ACTIVATION]: {
    primary: ['meditation', 'journaling', 'visualization'],
    secondary: ['light_reading', 'planning', 'reflection'],
    avoid: ['complex_problem_solving', 'technical_work', 'meetings'],
  },
  [CircadianPhaseType.MORNING_FOCUS_PEAK]: {
    primary: ['study', 'technical_reading', 'planning'],
    secondary: ['problem_solving', 'analysis', 'learning'],
    avoid: ['creative_work', 'social_activities', 'routine_tasks'],
  },
  [CircadianPhaseType.COGNITIVE_PEAK]: {
    primary: ['programming', 'problem_solving', 'deep_work'],
    secondary: ['complex_analysis', 'strategic_planning', 'learning'],
    avoid: ['routine_tasks', 'social_activities', 'creative_work'],
  },
  [CircadianPhaseType.SECOND_PRODUCTIVITY]: {
    primary: ['review', 'technical_tasks', 'recap'],
    secondary: ['problem_solving', 'analysis', 'planning'],
    avoid: ['creative_work', 'routine_tasks', 'social_activities'],
  },
  [CircadianPhaseType.CREATIVE_WINDOW]: {
    primary: ['writing', 'design', 'creative_work'],
    secondary: ['brainstorming', 'planning', 'communication'],
    avoid: ['complex_problem_solving', 'technical_work', 'routine_tasks'],
  },
  [CircadianPhaseType.TRANSITION]: {
    primary: ['reflection', 'journaling', 'planning'],
    secondary: ['light_reading', 'review', 'consolidation'],
    avoid: ['complex_problem_solving', 'technical_work', 'creative_work'],
  },
  [CircadianPhaseType.INTROSPECTIVE]: {
    primary: ['planning', 'visualization', 'reading'],
    secondary: ['reflection', 'journaling', 'consolidation'],
    avoid: ['complex_problem_solving', 'technical_work', 'meetings'],
  },
  [CircadianPhaseType.SLEEP_PREPARATION]: {
    primary: ['rest', 'hygiene', 'preparation'],
    secondary: ['light_reading', 'planning', 'reflection'],
    avoid: ['complex_work', 'technical_tasks', 'stimulating_activities'],
  },
}

export const PRODUCTIVITY_SCORES = {
  [CircadianPhasePriority.LOW]: {
    min: 5.0,
    max: 7.5,
    default: 6.0,
    description: 'Baja productividad esperada',
  },
  [CircadianPhasePriority.MEDIUM]: {
    min: 6.0,
    max: 8.5,
    default: 7.5,
    description: 'Productividad moderada',
  },
  [CircadianPhasePriority.HIGH]: {
    min: 7.0,
    max: 9.0,
    default: 8.5,
    description: 'Alta productividad esperada',
  },
  [CircadianPhasePriority.CRITICAL]: {
    min: 8.0,
    max: 10.0,
    default: 9.0,
    description: 'Máxima productividad esperada',
  },
}

export const EVIDENCE_LEVELS = {
  high: {
    score: 1.0,
    description: 'Evidencia sólida de múltiples estudios',
    confidence: 'Alta confianza en las recomendaciones',
  },
  medium: {
    score: 0.7,
    description: 'Evidencia moderada con algunas limitaciones',
    confidence: 'Confianza moderada en las recomendaciones',
  },
  low: {
    score: 0.4,
    description: 'Evidencia preliminar que requiere más investigación',
    confidence: 'Baja confianza en las recomendaciones',
  },
}

export const NOTIFICATION_TEMPLATES = {
  phase_start: {
    title: '🌅 Nueva Fase Circadiana',
    body: 'Es hora de {phase_name}. {ideal_for_description}',
    priority: 'high',
  },
  phase_ending: {
    title: '⏰ Fase Terminando',
    body: '{phase_name} termina en {time_remaining} minutos',
    priority: 'medium',
  },
  productivity_reminder: {
    title: '📈 Recordatorio de Productividad',
    body: 'Aprovecha {phase_name} para {suggested_tasks}',
    priority: 'low',
  },
  phase_recommendation: {
    title: '💡 Recomendación de Fase',
    body: 'Considera cambiar a {phase_name} para {reason}',
    priority: 'medium',
  },
}

export const ERROR_MESSAGES = {
  PHASE_NOT_FOUND: 'Fase circadiana no encontrada',
  INVALID_TIME_RANGE: 'Rango de tiempo inválido para la fase',
  PHASE_OVERLAP: 'Las fases no pueden solaparse',
  INVALID_DURATION: 'Duración de fase inválida',
  USER_NOT_FOUND: 'Usuario no encontrado',
  PREFERENCE_NOT_FOUND: 'Preferencia de fase no encontrada',
  SESSION_CREATION_FAILED: 'Error al crear sesión de fase',
  INVALID_METRICS: 'Métricas de fase inválidas',
}

export const SUCCESS_MESSAGES = {
  PHASE_CREATED: 'Fase circadiana creada exitosamente',
  PHASE_UPDATED: 'Fase circadiana actualizada exitosamente',
  PREFERENCE_SAVED: 'Preferencia de fase guardada',
  SESSION_RECORDED: 'Sesión de fase registrada',
  RECOMMENDATIONS_GENERATED: 'Recomendaciones generadas exitosamente',
  STATS_CALCULATED: 'Estadísticas calculadas exitosamente',
}
