# Spec: Plan Semanal Adaptativo

**Versión:** 1.0  
**Fecha:** 2026-04-22  
**Estado:** Draft

---

## 1. Resumen

El Plan Semanal Adaptativo transforma una meta a largo plazo (ej. "Inglés B2 en 8 meses") en sesiones de estudio distribuidas semana a semana. El sistema ajusta la carga automáticamente mediante dos mecanismos:

- **Umbrales automáticos**: detecta métricas bajas en tiempo real y propone ajustes
- **Check-in dominical**: el usuario evalúa su semana y confirma (o rechaza) los cambios propuestos

El usuario ve su plan como una **lista de sesiones por día**, con topic, hora sugerida y tipo de timer.

---

## 2. Entradas del usuario al crear un objetivo

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Nombre del objetivo ("Aprender Inglés B2") |
| `subject` | string | Materia / área de estudio |
| `targetDate` | date | Fecha límite del objetivo |
| `weeklyHoursCommitment` | float | Horas por semana que puede comprometer |
| `availableDays` | int[] | Días disponibles: 0=Dom … 6=Sáb |
| `preferredTimerType` | enum | `POMODORO` (25 min) · `ULTRADIANO` (90 min) · `FREE` (45 min) |

**Nota:** el `chronotype` se toma del perfil del usuario (configurado en onboarding). Se usa para sugerir horarios, pero no es input directo del plan.

---

## 3. Modelo de datos

### 3.1 Goal

```
Goal
├── id            UUID PK
├── userId        UUID FK
├── title         String
├── subject       String
├── description   String?
├── targetDate    DateTime
├── weeklyHoursCommitment  Float
├── availableDays Int[]          -- [1,3,5] = Lun, Mié, Vie
├── preferredTimerType  TimerType
├── status        GoalStatus     -- ACTIVE | COMPLETED | PAUSED | ABANDONED
├── currentWeekNumber  Int       -- semana actual del plan
├── totalWeeks    Int            -- calculado al crear: ceil(días / 7)
├── createdAt     DateTime
└── updatedAt     DateTime
```

### 3.2 WeeklyPlan

```
WeeklyPlan
├── id                    UUID PK
├── goalId                UUID FK
├── userId                UUID FK
├── weekNumber            Int            -- 1, 2, 3...
├── weekStartDate         DateTime       -- siempre lunes
├── weekEndDate           DateTime       -- siempre domingo
├── plannedSessions       Json           -- Array<PlannedSession>
├── totalPlannedMinutes   Int
├── totalCompletedMinutes Int            -- se actualiza al completar sesiones
├── completionRate        Float          -- 0-100, recalculado automáticamente
├── status                WeeklyPlanStatus  -- ACTIVE | COMPLETED | FAILED | RECOVERY
├── adjustmentApplied     AdjustmentType?   -- qué ajuste se aplicó esta semana
├── adjustmentReason      String?
├── notes                 String?
├── createdAt             DateTime
└── updatedAt             DateTime
```

### 3.3 PlannedSession (JSON embebido en WeeklyPlan)

```typescript
interface PlannedSession {
  id:              string       // uuid local (no FK, es JSON)
  dayOfWeek:       number       // 0=Dom … 6=Sáb
  scheduledTime:   string       // "09:00"
  topic:           string       // "Vocabulario unidad 3"
  durationMinutes: number
  timerType:       TimerType
  sessionOrder:    number       // orden dentro del día (1, 2...)
}
```

### 3.4 WeeklyCheckIn

```
WeeklyCheckIn
├── id                  UUID PK
├── weeklyPlanId        UUID FK @unique
├── userId              UUID FK
├── overallRating       Int          -- 1-5 ("¿Cómo fue tu semana?")
├── completionPercent   Float        -- 0-100 (autoreportado o calculado)
├── contentDifficulty   Int          -- 1-5
├── energyAvg           Float        -- promedio energía de la semana (1-5)
├── challenges          String?      -- texto libre opcional
├── suggestedAdjustment AdjustmentType?  -- generado por el sistema
├── adjustmentConfirmed Boolean      -- el usuario aprobó el ajuste
└── completedAt         DateTime
```

### 3.5 Enums

```
enum GoalStatus        { ACTIVE COMPLETED PAUSED ABANDONED }
enum WeeklyPlanStatus  { ACTIVE COMPLETED FAILED RECOVERY }
enum TimerType         { POMODORO ULTRADIANO FREE }
enum Chronotype        { MORNING INTERMEDIATE EVENING }
enum AdjustmentType    {
  NONE           -- sin cambio
  REDUCE_LOAD    -- reducir carga 20%
  INCREASE_LOAD  -- aumentar carga 10%
  RECOVERY_WEEK  -- semana ligera 50%, solo repaso
  REBALANCE      -- redistribuir sesiones a días/horas de mayor energía
}
```

---

## 4. Algoritmo de generación del plan semanal

### 4.1 Inputs del algoritmo

```
goal: Goal
user: User (para chronotype)
weekNumber: number
previousPlan?: WeeklyPlan   -- undefined solo en semana 1
checkIn?: WeeklyCheckIn     -- resultado del check-in dominical
```

### 4.2 Paso 1 — Calcular carga de la semana

```
sessionMinutes =
  POMODORO   → 25
  ULTRADIANO → 90
  FREE       → 45

targetMinutes = goal.weeklyHoursCommitment * 60

// Aplicar ajuste según desempeño previo
if previousPlan.completionRate < 50  → adjustedMinutes = targetMinutes * 0.50  (RECOVERY_WEEK)
if previousPlan.completionRate < 75  → adjustedMinutes = targetMinutes * 0.80  (REDUCE_LOAD)
if previousPlan.completionRate > 95  → adjustedMinutes = targetMinutes * 1.10  (INCREASE_LOAD)
else                                 → adjustedMinutes = targetMinutes          (NONE)

totalSessions = ceil(adjustedMinutes / sessionMinutes)
```

### 4.3 Paso 2 — Distribuir sesiones en días disponibles

```
availableDays = goal.availableDays.sort()  -- [1, 3, 5]
sessionsPerDay = distributeEvenly(totalSessions, availableDays.length)

// distributeEvenly: reparte lo más equitativo posible
// ej: 7 sesiones en 3 días → [3, 2, 2]
// límite máximo: 3 sesiones por día (hardcoded Phase 1)
```

### 4.4 Paso 3 — Asignar horarios según cronotipo

```
MORNING:      slots = ['07:00', '08:00', '09:00', '10:00', '16:00', '17:00']
INTERMEDIATE: slots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']
EVENING:      slots = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

// Si hay 2 sesiones en el mismo día, se usan slots[0] y slots[1]
// Con descanso implícito de al menos 90 min entre sesiones
```

### 4.5 Paso 4 — Asignar tópicos (Interleaving básico)

```
// En Phase 1: el usuario define el subject del goal (ej. "Inglés")
// El sistema asigna tópicos rotando entre categorías predefinidas por subject
// o usando el nombre del subject si no hay categorías

topics = getTopicsForSubject(goal.subject)
// fallback: ["Teoría", "Práctica", "Repaso"] si no hay categorías

// Rotación circular entre topics + priorizar los de menor retención
// (retención medida por miniTestScore de sesiones anteriores)
topic = topics[sessionGlobalIndex % topics.length]
```

### 4.6 Output: objeto WeeklyPlan listo para insertar en DB

---

## 5. Feedback loop

### 5.1 Umbrales automáticos (se evalúan al completar cada sesión)

| Condición | Ventana | Ajuste sugerido |
|---|---|---|
| `energyBefore` < 3 por 2 días consecutivos | últimas 48h | `REDUCE_LOAD` |
| `miniTestScore` < 60% por 2 sesiones | últimas 2 sesiones | `REBALANCE` + más repaso |
| 3 sesiones con status `SKIPPED` | últimos 7 días | `RECOVERY_WEEK` |
| `rpeCognitive` > 8 por 2 días seguidos | últimas 48h | `REDUCE_LOAD` |

Cuando se dispara un umbral:
1. Se crea una alerta en base de datos (`ThresholdAlert`)
2. Se muestra al usuario un **banner no bloqueante** con la sugerencia
3. El usuario puede: **Aceptar** · **Posponer** · **Ignorar**
4. Si acepta → el plan de mañana en adelante se recalcula con el ajuste

### 5.2 Check-in dominical (manual)

**Cuándo:** domingo, primera vez que el usuario abre la app.  
**Flujo:**

```
1. Modal con 5 preguntas (sliders / selects, sin texto libre obligatorio):
   Q1: "¿Cómo fue tu semana en general?" (1-5)
   Q2: "¿Cuántas sesiones completaste?" (automático: calcula % del plan)
   Q3: "¿Qué tan difícil fue el contenido?" (1-5)
   Q4: "¿Cómo estuvo tu energía esta semana?" (1-5)
   Q5: "¿Algo específico que quieras comentar?" (texto, opcional)

2. El sistema cruza las respuestas con las métricas reales de la semana
   y genera un AdjustmentType sugerido

3. Se muestra al usuario:
   "Para la próxima semana te recomendamos [descripción del ajuste]"
   → Botones: [Aplicar] [Ajustar manualmente] [Mantener igual]

4. El lunes a las 00:00 (o al abrir la app) se genera el nuevo WeeklyPlan
   usando el ajuste confirmado (o NONE si no se confirmó)
```

### 5.3 Generación automática del lunes

- Si el usuario hizo check-in → usa `checkIn.adjustmentConfirmed` y el `adjustmentApplied`
- Si no hizo check-in → usa `previousPlan.completionRate` para auto-calcular el ajuste
- El nuevo plan siempre se genera con `status = ACTIVE`
- El plan anterior pasa a `COMPLETED` o `FAILED` según completionRate

---

## 6. Vista del usuario (lista por día)

```
┌─────────────────────────────────────────────┐
│  Semana 3 · 22–28 Abr  ░░░░░░░░░░  40%      │
│  Meta: Inglés B2 · 6 semanas restantes       │
└─────────────────────────────────────────────┘

Lunes 22 de abril
  ✅  09:00  Vocabulario unidad 3      25 min  🍅
  ○   17:00  Repaso SRS                15 min  📚

Miércoles 24 de abril
  ○   09:00  Gramática — Present Perfect  25 min  🍅
  ○   10:00  Lectura comprensiva          25 min  🍅

Viernes 26 de abril
  ○   09:00  Vocabulario unidad 4      25 min  🍅
  ○   17:00  Mini-test semanal         20 min  ✏️

──────────────────────────────────────────────
  Total planeado: 135 min  ·  Completado: 25 min
```

**Interacciones:**
- Tap en sesión → abre la sesión activa con timer
- Tap en check-in pendiente → abre modal check-in dominical
- Badge de alerta si hay umbral activado pendiente de confirmar

---

## 7. API Endpoints

### Goals

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/goals` | Lista todos los objetivos del usuario |
| `POST` | `/api/goals` | Crea objetivo + genera WeeklyPlan semana 1 |
| `GET` | `/api/goals/:id` | Detalle del objetivo |
| `PATCH` | `/api/goals/:id` | Actualiza objetivo (status, descripción) |
| `DELETE` | `/api/goals/:id` | Elimina objetivo y sus planes |

### Weekly Plans

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/goals/:goalId/plans` | Historial de planes del objetivo |
| `GET` | `/api/goals/:goalId/plans/current` | Plan activo de la semana en curso |
| `POST` | `/api/goals/:goalId/plans/generate` | Fuerza regeneración del plan (con body: ajuste) |
| `PATCH` | `/api/plans/:id` | Actualiza notas o ajuste aplicado |

### Check-in

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/plans/:planId/checkin` | Registra check-in dominical |
| `GET` | `/api/plans/:planId/checkin` | Obtiene check-in si existe |

### Threshold Alerts

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/alerts/active` | Alertas activas pendientes de respuesta |
| `PATCH` | `/api/alerts/:id` | Responde a una alerta (accept / dismiss / postpone) |

---

## 8. Reglas de negocio

1. Solo puede haber **un WeeklyPlan ACTIVE** por goal a la vez.
2. No se puede crear un nuevo plan si el actual tiene `status = ACTIVE` y no ha llegado su `weekEndDate` (salvo forzar con `/generate`).
3. Un plan pasa a `FAILED` si `completionRate < 40%` al llegar el domingo.
4. La semana de recuperación (`RECOVERY_WEEK`) siempre reduce la carga al 50% y **solo incluye sesiones de repaso** (no material nuevo).
5. `totalWeeks` se calcula al crear el goal: `ceil(daysBetween(now, targetDate) / 7)`.
6. `currentWeekNumber` se incrementa cada lunes automáticamente.
7. El campo `completionRate` se recalcula cada vez que una `DailySession` cambia de status.

---

## 9. Consideraciones de escalabilidad (Phase 1)

- El algoritmo de generación es **síncrono** y corre en la API route (Nitro). Tiempo estimado < 50ms.
- Los `plannedSessions` se guardan como JSON (no tabla separada) porque en Phase 1 no hay necesidad de queries complejas sobre sesiones planeadas individuales.
- Si en fases futuras se necesita filtrar/indexar sesiones planeadas, se migra a tabla `PlannedSession` separada.

---

## 10. Fuera de alcance en Phase 1

- Interleaving basado en curvas de olvido individuales (solo rotación circular)
- Notificaciones push (solo alertas en UI)
- Integración con calendario externo (Google Cal, etc.)
- Múltiples goals activos en paralelo (solo 1 goal ACTIVE a la vez)
- Generación automática de tópicos con IA
