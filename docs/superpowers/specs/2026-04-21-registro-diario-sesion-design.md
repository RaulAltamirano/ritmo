# Diseño — Registro diario de sesión (Fase 1, ítem 1 · MVP parcial)

**Fecha:** 2026-04-21  
**Última revisión:** 2026-04-21 — **tercera auditoría: decisión focus_time cerrada (calcular en queries), numeración §19 corregida**  
**Estado:** Listo para plan de implementación (tras revisión humana final)  
**Alcance:** Sesión de trabajo centrada en **tareas**, métricas entrada/salida, timer Pomodoro/ultradiano. **Fuera de alcance:** sueño, SRS, plan semanal.

---

## 1. Contexto en Ritmo

### 1.1 Estado actual (verificado en repo, 2026-04-21)

- **No existe** en el codebase actual ningún componente ni tipo llamado `TodayTaskFeedbackModal`, `TaskCompletionFeedback`, `useTodayHandlers`, `handleCompleteTaskWithFeedback`, ni campos de feedback tipo `mentalDemand`, `energyAfter`, `timeFit`, `mainBlocker`, etc. **No hay migración desde `description`:** esa narrativa era **incorrecta** y se elimina.
- **`apps/web/stores/timer.ts`:** el timer es **solo cliente** — estado en memoria (Pinia), preferencias vía `secureStorage` (`secureSet` / `secureGet`). Gestiona cuenta atrás, pausa acumulada (`totalPausedTime`), tarea activa genérica (`id`, `name`, …) y resumen diario **local** (`dailyStats`). **No** envía métricas al servidor ni serializa feedback.
- **Consecuencia:** el MVP debe **construir de cero** el **modal unificado de reflexión** (RPE, fricción, energía post-bloque, etc.) y el **contrato API** para persistir bloques; no hay “reutilizar modal existente” ni “compatibilidad con tipos Vue actuales” para esos campos.

### 1.2 Inventario Prisma relevante (`apps/api/prisma/models/business.prisma`)

- **`Activity`:** contenedor (tipo, ventana temporal, etc.). Relación `tasks Task[]`, `sessions WorkSession[]`.
- **`Task`:** puede colgar de `Activity` opcionalmente (`activityId String?`). Tiene `sessions WorkSession[]`.
- **`WorkSession`** → tabla `work_sessions`:
  - `activityId String?`, `taskId String?`, `circadianPhaseId String?`
  - `startTime`, `endTime`, `duration` (minutos)
  - `focusScore Int?`, `productivityScore Int?` (comentario en schema: 1–10), `notes`
  - **Ya cubre tracking de tiempo y métricas escasas**; solapa conceptualmente con una tabla nueva "`work_blocks`".
- **`User`** incluye `timezone String @default("UTC")` — base para anclar "día civil" del check-in.

### 1.3 Colisión de nombres “session”

En dominio ya existen:

| Nombre                     | Rol                                |
| -------------------------- | ---------------------------------- |
| `user_sessions` (JWT)      | Auth (`SessionService`, seguridad) |
| `work_sessions`            | Bloques de trabajo (`WorkSession`) |
| `circadian_phase_sessions` | Dominio circadiano                 |

Por tanto **no** se introduce el nombre `daily_sessions` para el check-in matinal. En este documento se usa `daily_checkins` (tabla/modelo `DailyCheckin`) para "energía/estrés antes del primer timer". Servicios tipo `DailyCheckinService` para no chocar con `SessionService` de auth.

### 1.4 Problema a resolver

Persistir **check-in diario** + **bloques de timer** con feedback rico en PostgreSQL, alineado al modelo existente `WorkSession`, con reglas claras de **zona horaria**, **estados**, **concurrencia** y **sincronización cliente–servidor**.

---

## 2. Investigación breve (timers / segundo cerebro)

| Tema                            | Síntesis                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| **Pomodoro / ultradian / BRAC** | Igual que antes — presets configurables; evidencia en §19. |
| **Obsidian embebido**           | Fuera de alcance.                                          |

---

## 3. Decisiones de producto (cerradas)

| Decisión                        | Detalle                                                                                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sueño                           | Fuera de alcance en esta iteración.                                                                                                                                                |
| **Check-in (energía + estrés)** | Obligatorio **antes del primer timer** del día civil del usuario (ver §12).                                                                                                        |
| **Granularidad del timer**      | Cada bloque debe referenciar una `Task` concreta (`taskId` **NOT NULL**). Para trabajo genérico el usuario crea una tarea placeholder (ej. "Deep work — misc").                    |
| **Modal de reflexión**          | **Un único formulario** al cerrar bloque (y, si aplica, al marcar la tarea completada en el mismo instante — un solo submit). **Greenfield:** no existe modal previo que fusionar. |
| **Naming check-in**             | Tabla/concepto `daily_checkins`, no `daily_sessions`.                                                                                                                              |

### 3.1 Presets por defecto — ver §19

**25/5**, **52/17**, **90/20**, editables en ajustes.

---

## 4. Conceptos del modelo mental

| Término               | Definición                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Día civil**         | Fecha derivada de `User.timezone` (no del reloj del servidor ni solo del navegador sin validar).                                                                                      |
| `DailyCheckin`        | Un registro por **(user_id, calendar_date)** con energía y estrés de **entrada**; gate para iniciar timer. Ver §12 sobre re-entrada / upsert.                                         |
| **Bloque de trabajo** | Representación persistida preferente: **extensión de `WorkSession`** (ver §13), no una segunda tabla paralela salvo que el plan decida explícitamente lo contrario con justificación. |

---

## 5. Métricas

### 5.1 Entrada (check-in diario)

| Métrica | Escala   |
| ------- | -------- |
| Energía | 1–5      |
| Estrés  | 1–5      |
| Sueño   | Excluido |

### 5.2 Durante el bloque (persistencia servidor)

| Campo                    | Descripción                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `timer_mode`             | enum familia conceptual: `pomodoro` \| `ultradian` \| `custom`                                                         |
| `preset_key`             | string nullable: `"25_5"`, `"52_17"`, `"90_20"` o `null` si es custom puro. Permite agrupar analytics sin perder modo. |
| `target_duration_sec`    | Objetivo del countdown de trabajo (no incluye descanso).                                                               |
| `break_duration_sec`     | Descanso asociado al preset/custom (opcional en persistencia si no se registra la pausa formal).                       |
| `state`                  | enum §8.1 (`running` / `paused` / `pending_feedback` / `completed` / `abandoned`)                                      |
| `started_at`, `ended_at` | UTC                                                                                                                    |
| `paused_duration_sec`    | Total pausas acumuladas                                                                                                |
| `last_client_seen_at`    | UTC; actualizado por heartbeat (§10) para política de huérfanos (§8).                                                  |

**Tiempo de foco (decisión cerrada):** **calcular en queries** como `ended_at - started_at - paused_duration_sec`. No se persiste como columna redundante. Si el rendimiento de informes lo requiere en el futuro, se añade una columna `GENERATED ALWAYS … STORED` en una migración separada con justificación explícita.

### 5.3 Salida (modal único — **greenfield**)

**Alcance MVP del modal.** Tres campos **obligatorios** (core de la reflexión) y dos **opcionales** (cualitativos). Se deja fuera de MVP cualquier métrica redundante con las ya existentes para no duplicar señal.

| Métrica                  | Obligatorio | Escala / tipo                                                                             | Notas                                                           |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **RPE cognitivo**        | Sí          | 1–5 (Likert)                                                                              | Exigencia mental del bloque.                                    |
| **Fricción**             | Sí          | 1–5 (Likert)                                                                              | Cuánta fricción sintió el bloque.                               |
| **Energía post-bloque**  | Sí          | 1–5 (Likert)                                                                              | Permite calcular delta vs `DailyCheckin.energy_in` en análisis. |
| **Bloqueador principal** | No          | enum categórico (`interruptions`, `unclear_task`, `tooling`, `fatigue`, `other`) o `null` | Complemento cualitativo a fricción.                             |
| **Nota libre**           | No          | `text` (≤ 500 chars)                                                                      | Reflexión opcional; cliente valida longitud.                    |

**Fuera de MVP (no añadir al modal):** `focus` y `progress` percibidos (duplican `WorkSession.focusScore` / `productivityScore` ya existentes y añaden ruido sin validación); ajuste temporal subjetivo (derivable de `target_duration_sec` vs `actual_focus_sec`).

**Decisión de escalas (cerrada).** Todas las columnas **nuevas** creadas para este MVP son **1–5**. **No se migra** el tipo de las columnas existentes de `WorkSession` (`focusScore`, `productivityScore`, comentario 1–10) para evitar backfill de datos y conversiones ambiguas. Quedan como está y **no se usan en el modal MVP**. En §16 queda registrado para evitar drift.

Columnas nuevas sugeridas para `WorkSession` (ver §13):

- `rpe_cognitive SMALLINT NULL CHECK (BETWEEN 1 AND 5)`
- `friction_score SMALLINT NULL CHECK (BETWEEN 1 AND 5)`
- `energy_after SMALLINT NULL CHECK (BETWEEN 1 AND 5)`
- `main_blocker VARCHAR(32) NULL` (enum aplicacional)
- `reflection_note TEXT NULL`

### 5.4 Presets del usuario (persistencia)

Los presets editables de §3.1 viven en `UserPreferences` (que hoy ya usa columnas `Json?` para `notificationSettings`, `privacySettings`, `accessibilitySettings`). Añadir una columna análoga evita tabla nueva:

- `UserPreferences.timerPresets Json?` con forma:

```json
{
  "defaultPresetKey": "25_5",
  "presets": [
    { "key": "25_5", "workSec": 1500, "breakSec": 300, "label": "Pomodoro clásico" },
    { "key": "52_17", "workSec": 3120, "breakSec": 1020, "label": "Bloque medio" },
    { "key": "90_20", "workSec": 5400, "breakSec": 1200, "label": "Bloque largo" }
  ]
}
```

- **Seed por defecto:** si un usuario no tiene `timerPresets`, el backend devuelve los tres valores predeterminados al leer (sin escribir fila).
- **Validación servidor:** `workSec` y `breakSec` en rangos razonables (ej. 60 ≤ work ≤ 14400; 0 ≤ break ≤ 3600).
- **Custom puro.** El timer puede iniciarse con valores ad-hoc sin escribir en `timerPresets`; en ese caso el `WorkSession` se guarda con `timer_mode = 'custom'` y `preset_key = null`.

---

## 6. Flujos UX (alto nivel)

1. **Gate check-in:** Si no hay `DailyCheckin` válido para el **día civil** actual del usuario → formulario corto (energía, estrés) → `PUT`/`POST` check-in.
2. **Inicio de bloque:** Usuario selecciona **siempre una `Task`** + preset → `POST` crea `WorkSession` (o recurso equivalente) en estado `running`, con `taskId` obligatorio.
3. **Pausa / reanudar:** `PATCH` + sincronización (§10).
4. **Cierre:** Timer completo o stop manual → **modal obligatorio** de reflexión (§5.3, política §11) → `POST …/complete` idempotente.
5. **Completar tarea:** Si el mismo gesto cierra el bloque y completa la tarea, **un solo submit**.

---

## 7. Zona horaria y `calendar_date`

| Regla                     | Detalle                                                                                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fuente de verdad TZ**   | `User.timezone` (IANA). Si el cliente envía una fecha sin TZ, el servidor normaliza usando este campo.                                                                                                                                                               |
| **Cálculo de “hoy”**      | Servidor calcula `calendar_date` para el usuario como **fecha local en `User.timezone`** al momento del check-in o del primer `POST` bloque del día (documentar función única en backend para evitar drift).                                                         |
| **Cliente puede enviar**  | `calendar_date` opcional como hint; servidor **valida** coherencia con TZ del usuario (rechazar si difiere >1 día del resultado esperado salvo política explícita).                                                                                                  |
| **Medianoche**            | El día “cambia” según TZ del usuario, no UTC.                                                                                                                                                                                                                        |
| **Viajes / cambio de TZ** | Al actualizar `User.timezone`, el próximo check-in usa el nuevo TZ; no reescribir histórico. Edge cases (dos check-ins “el mismo día” según dos TZ) mitigados por **siempre** anclar a `User.timezone` vigente al evento + `created_at` UTC en filas para auditoría. |

---

## 8. Estados del bloque y políticas operativas

### 8.1 Enum de estado (añadir a modelo persistido)

| Estado             | Significado                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `running`          | Timer activo                                                                  |
| `paused`           | Timer pausado                                                                 |
| `pending_feedback` | Tiempo agotado o usuario paró; falta enviar reflexión (§11)                   |
| `completed`        | Cerrado con reflexión enviada                                                 |
| `abandoned`        | Cerrado sin reflexión por timeout servidor o `POST /abandon` explícito (§8.4) |

### 8.2 Huérfanos y timeout

- El timer vive en cliente: si el usuario cierra el navegador con bloque `running`, el servidor debe poder **cerrar o marcar** tras política (ej. sin heartbeat > **2 × target_duration_sec** → `abandoned`; los `pending_feedback` requieren acción explícita, §8.4).
- Heartbeat definido en §10.

### 8.3 Un solo bloque activo por usuario

**Decisión (cerrada):** `POST` nuevo bloque mientras existe otro en `running` / `paused` / `pending_feedback` responde **`409 Conflict`** con cuerpo que incluye el `id` del bloque conflictivo y su `state`. La UI debe forzar al usuario a **resolver explícitamente** (completar reflexión, marcar abandonado o reanudar) antes de arrancar otro bloque. **No** se auto-cierra el anterior de forma silenciosa.

### 8.4 Transición a `abandoned` (usuario y servidor)

Hay dos vías para que un bloque llegue a `abandoned`:

- **Usuario explícito.** `POST /work-sessions/:id/abandon` — válido desde `running`, `paused` o `pending_feedback`. Cierra el bloque sin feedback; la UI lo ofrece como escape del conflicto §8.3 y del modal §11.
- **Job servidor (huérfanos).** Un job periódico (sugerido cada 5 min) marca `abandoned` cualquier bloque donde `state IN ('running','paused')` y `NOW() - last_client_seen_at > 2 × target_duration_sec` **con un tope absoluto** (ej. `max 6h`) para evitar “abandonos eternos” en presets largos. Los bloques en `pending_feedback` no se auto-abandonan por el job: requieren acción explícita del usuario para no perder reflexión latente; la UI debe mostrarlos con claridad al siguiente login.

**Analítica:** los `abandoned` **no** cuentan en KPIs de “tiempo de foco”; sí aparecen en tasa de abandono (§17). Cliente nunca debe poder pasar un bloque directamente a `completed` si no envió feedback: esa transición es responsabilidad de `POST /work-sessions/:id/complete`.

---

## 9. API (REST · boceto)

Rutas ilustrativas (ajustar prefijo al router real):

| Método  | Ruta                                                     | Descripción                                                                                                                                                                                                                                                                       |
| ------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUT`   | `/checkins/daily/:calendarDate`                          | Upsert `DailyCheckin` (energía, estrés). Idempotente por fecha. Servidor valida que `calendarDate` coincide con `User.timezone` (§7).                                                                                                                                             |
| `GET`   | `/checkins/daily/:calendarDate`                          | Lee el check-in de esa fecha (o `404` si no existe).                                                                                                                                                                                                                              |
| `GET`   | `/work-sessions/active`                                  | Bloque activo del usuario (cualquier `state` distinto de `completed`/`abandoned`). Para restaurar tras recarga.                                                                                                                                                                   |
| `GET`   | `/work-sessions?from=&to=&taskId=&state=&cursor=&limit=` | Histórico paginado por usuario y rango (cumple criterio §15 "consultables por usuario y fecha"). `from`/`to` como `calendar_date` en TZ del usuario.                                                                                                                              |
| `POST`  | `/work-sessions`                                         | Inicia bloque. Body: **`taskId` requerido**, `timer_mode`, `preset_key?`, `target_duration_sec`, `break_duration_sec?`. **El servidor infiere** `dailyCheckinId` a partir de `User.timezone` + fecha; si no hay check-in → `412 Precondition Failed` con code `checkin_required`. |
| `PATCH` | `/work-sessions/:id`                                     | Heartbeat + pausa/reanudar. Body: `action: "heartbeat"\|"pause"\|"resume"` y `client_seen_at`. Servidor actualiza `last_client_seen_at`, `paused_duration_sec`, `state`.                                                                                                          |
| `POST`  | `/work-sessions/:id/complete`                            | Cierra con métricas §5.3. **Idempotente** vía header `Idempotency-Key` (UUID por intento). Segundo POST con misma clave devuelve `200` con mismo cuerpo sin duplicar.                                                                                                             |
| `POST`  | `/work-sessions/:id/abandon`                             | Marca el bloque como `abandoned` (§8.4). Válido desde `running`/`paused`/`pending_feedback`. Idempotente.                                                                                                                                                                         |

**Códigos de error específicos del dominio:**

- `409 Conflict` — ya existe un bloque activo (§8.3); cuerpo incluye `{ activeSessionId, state }`.
- `412 Precondition Failed` — falta `DailyCheckin` del día; cuerpo `{ code: "checkin_required", calendarDate }`.
- `422 Unprocessable Entity` — validación de DTO (escalas fuera de 1–5, `target_duration_sec` fuera de rango, etc.).

Autenticación: igual que el resto de `apps/api` (JWT).

---

## 10. Sincronización cliente ↔ servidor

| Tema                           | Decisión propuesta para el plan                                                                                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Heartbeat**                  | `PATCH` con `action: "heartbeat"` cada **60 s** (± 5 s de jitter) mientras `running`/`paused`. Si la red falla, reintentos exponenciales hasta 3 intentos; cliente no considera el bloque perdido en local, servidor aplica política §8.4 si el gap supera el umbral.   |
| **Idempotencia de `complete`** | Header `Idempotency-Key` (UUID por intento). Servidor persiste pareja `(user_id, idempotency_key) → response_body` durante 24 h. Segundo POST con misma clave devuelve `200` con mismo cuerpo sin duplicar métricas.                                                    |
| **Rate-limit**                 | Global por usuario sobre `PATCH /work-sessions/:id`: **máx 6 req/min** (permite heartbeat 1/min + pausas/reanudar manuales + retries). `POST /work-sessions` limitado a **max 20/hora/usuario** para evitar spam. Heartbeat forma parte del presupuesto; no se excluye. |
| **Recarga de página**          | `GET /work-sessions/active` restaura estado; si servidor marcó `abandoned`, UI muestra recuperación honesta con call-to-action para iniciar bloque nuevo.                                                                                                               |
| **Offline-first**              | **Fuera de MVP.** El cliente muestra aviso "requiere conectividad" si falla `POST`/`complete`; el timer sigue contando en local pero no persiste. Cola offline → fase 2.                                                                                                |

---

## 11. Fin del countdown vs modal de reflexión

El cliente hoy puede **autocompletar** al llegar `timeLeft === 0`. Con reflexión obligatoria, hace falta una regla explícita:

| Opción                   | Comportamiento                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Modal bloqueante** | No se descarta el modal hasta enviar o política de “más tarde” acotada.                                                                              |
| **B — pending_feedback** | Al terminar tiempo → estado `pending_feedback`; UI obliga modal antes de nuevo timer; pueden existir recordatorios. **(Recomendado como base MVP.)** |
| **C — Nulls + cola**     | Marcar `completed` con métricas null y encolar “rellena reflexión” — **riesgo** de datos incompletos en analytics.                                   |

**Recomendación:** **B** — estado `pending_feedback` hasta `complete` exitoso; bloquear **nuevo** `POST /work-sessions` hasta resolver (o `abandoned` explícito).

---

## 12. Check-in diario: upsert vs serie intra-día

| Opción                                                  | Uso                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Una fila por día (`UNIQUE user_id + calendar_date`)** | `PUT` **upsert**: el usuario **puede actualizar** energía/estrés a las 15:00 si ya hizo check-in a las 09:00 — **se sobrescribe** el valor (historial intra-día no conservado). |
| **Serie intra-día**                                     | Tabla `daily_checkin_entries` 1:N con timestamp; la fila "actual" para el gate es la última del día o la primera según regla de producto.                                       |

**Decisión para MVP (recomendada):** **upsert en una fila por día** — más simple; si en el futuro se necesita evolución intra-día, migrar a entradas 1:N sin cambiar el concepto de “día civil”.

---

## 13. Decisión de modelo: `WorkSession` vs tabla nueva

### 13.1 Solapamiento

`WorkSession` ya tiene tiempo, `taskId`/`activityId`, scores y notas. Crear una tabla paralela `work_blocks` solaparía en casi todas sus columnas (time tracking, scores, FKs a `Task`/`Activity`/`CircadianPhase`) y obligaría a duplicar servicios y migraciones.

### 13.2 Opciones

| Opción                             | Pros                                                   | Contras                                                               |
| ---------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| **Extender `WorkSession`**         | Una fuente de verdad; informes unificados; menos JOINs | Migración acumulativa; convivir con filas históricas sin `timer_mode` |
| **Nueva tabla + deprecar gradual** | Esquema limpio “solo nuevo mundo”                      | Duplicidad, sync, confusión                                           |
| **Solo nueva tabla**               | Aísla MVP                                              | Datos legacy en `work_sessions` huérfanos                             |

**Recomendación para el plan:** **Extender `WorkSession`** con columnas nuevas (estado, `timer_mode`, `target_duration_sec`, `paused_duration_sec`, métricas de fricción/RPE, `dailyCheckinId`, etc.) y **no** introducir `work_blocks` salvo revisión arquitectónica explícita.

### 13.3 `activity_id` vs `task_id`

- Narrativa producto: “trabajo sobre una **tarea**”.
- **Decisión:** `taskId` **obligatorio (NOT NULL)** en cada bloque nuevo. `activityId` opcional, **denormalizado como snapshot** al crear el bloque (`WorkSession.activityId = Task.activityId` en ese instante) para facilitar queries por proyecto/contenedor sin JOIN adicional.
- **Política de staleness (cerrada):** el `activityId` del `WorkSession` **no se re-sincroniza** si la `Task` padre se reasigna después a otra `Activity`. Es un snapshot histórico; eso preserva la narrativa "en qué proyecto estaba trabajando cuando hice este bloque". Documentar este comportamiento en el servicio.

**No** usar solo `activityId` sin `taskId` para el flujo del timer del MVP.

---

## 14. Enfoques de implementación y recomendación

| Enfoque                                                      | Evaluación                          |
| ------------------------------------------------------------ | ----------------------------------- |
| Persistir solo en cliente                                    | **Rechazado** para MVP de analytics |
| Nueva tabla duplicada                                        | Evitar salvo necesidad              |
| **Extender Prisma `WorkSession` + `DailyCheckin` + APIs §9** | **Recomendado**                     |

Se elimina la referencia a “migración desde description”: **no aplica.**

---

## 15. Criterios de aceptación (MVP)

**Datos y modelo**

- Documentación y código **no citan** componentes de feedback inexistentes.
- `WorkSession` extendido con columnas nuevas (§5.2, §5.3): `timer_mode`, `preset_key`, `target_duration_sec`, `break_duration_sec`, `paused_duration_sec`, `state`, `last_client_seen_at`, `rpe_cognitive`, `friction_score`, `energy_after`, `main_blocker`, `reflection_note`, `dailyCheckinId`.
- Cada bloque persistido tiene `taskId NOT NULL`. `activityId` se guarda como snapshot al crear (§13.3).
- Modelo `DailyCheckin` con `UNIQUE(user_id, calendar_date)`; upsert vía `PUT`.
- `UserPreferences.timerPresets Json?` poblable; backend devuelve defaults si es `null`.

**Flujo y gate**

- Sin `DailyCheckin` para el día civil (TZ usuario), `POST /work-sessions` responde `412 checkin_required`.
- Con otro bloque activo, `POST /work-sessions` responde `409 Conflict` con `{ activeSessionId, state }`.
- Presets **25/5**, **52/17**, **90/20** disponibles y editables desde `UserPreferences.timerPresets`.
- Modal de reflexión **construido** (greenfield) con los 3 campos obligatorios de §5.3 y 2 opcionales.
- Bloque queda en `pending_feedback` al expirar countdown o al parar manualmente; **no** se puede iniciar un nuevo bloque hasta resolver (completar o `abandon`).

**Estados y huérfanos**

- Enum `state` con los 5 valores de §8.1 aplicado y validado en servidor.
- Job servidor transiciona a `abandoned` bloques en `running`/`paused` sin heartbeat > `2 × target_duration_sec` (tope absoluto 6 h). Los `pending_feedback` no se auto-abandonan.
- Endpoint `POST /work-sessions/:id/abandon` funciona y es idempotente.

**Sincronización**

- Heartbeat `PATCH` cada ~60 s actualiza `last_client_seen_at` en DB (verificable en tests de integración).
- `POST /work-sessions/:id/complete` es **idempotente**: doble POST con mismo `Idempotency-Key` devuelve `200` con idéntico body y no duplica métricas.
- Rate-limit §10 aplicado y probado (integración).

**Zona horaria**

- `calendar_date` se calcula **en servidor** con `User.timezone` (ningún endpoint confía ciegamente en el cliente).
- Test cubre cambio de `User.timezone` sin reescritura de histórico.

**API / consulta**

- `GET /work-sessions?from=&to=&taskId=&state=` devuelve histórico paginado del usuario (cumple "datos consultables por usuario y fecha").
- `GET /work-sessions/active` devuelve el bloque activo o `null` (no 404).
- `GET /checkins/daily/:calendarDate` devuelve el check-in o `404`.

**Cliente (`stores/timer.ts`)**

- El store sincroniza con backend: en `startTask` hace `POST`, al pausar/reanudar hace `PATCH`, al completar hace `POST .../complete`.
- Al montar, `GET /work-sessions/active` restaura estado si había uno en curso o `pending_feedback` (muestra modal).

---

## 16. Registro de decisiones explícitas (histórico)

| Tema                               | Decisión                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Check-in antes del timer           | Obligatorio (gate servidor: `412 checkin_required`)                                                   |
| Tarea antes del timer              | `taskId` **NOT NULL**                                                                                 |
| `activityId`                       | Snapshot denormalizado al crear el bloque; no se re-sincroniza                                        |
| Nombre tabla check-in              | `daily_checkins` (evita colisión con `user_sessions` / `work_sessions`)                               |
| Modal                              | Unificado; **greenfield**; 3 obligatorios (RPE, fricción, energía post) + 2 opcionales                |
| `WorkSession` vs tabla nueva       | **Extender `WorkSession`**; columnas nuevas todas nullable                                            |
| Escalas métricas nuevas            | **1–5** en todas las columnas nuevas; **no** migrar `focusScore`/`productivityScore` existentes       |
| Escalas de columnas existentes     | `WorkSession.focusScore` y `productivityScore` siguen 1–10; **fuera del modal MVP**                   |
| `timer_mode` + `preset_key`        | Dos columnas: familia conceptual (`pomodoro`/`ultradian`/`custom`) + clave de preset concreta         |
| Persistencia de presets            | `UserPreferences.timerPresets Json?`; backend sirve defaults si es `null`                             |
| Concurrencia `POST /work-sessions` | **`409 Conflict`** si hay otro bloque activo; UI fuerza resolución explícita (no auto-cierre)         |
| Cierre de countdown (§11)          | Opción **B** — estado `pending_feedback` hasta `complete` o `abandon`                                 |
| Transición a `abandoned`           | (a) `POST /work-sessions/:id/abandon` usuario explícito; (b) job servidor tras `2 × target` (max 6 h) |
| Fuente de `dailyCheckinId`         | **Servidor** lo infiere a partir de `User.timezone` + fecha; cliente no lo envía                      |
| Zona horaria                       | `calendar_date` calculado server-side con `User.timezone`                                             |
| Heartbeat                          | `PATCH` cada ~60 s; idempotencia `complete` vía `Idempotency-Key`                                     |
| Offline-first                      | Fuera de MVP                                                                                          |
| Feature flags / rollback           | `FEATURE_DAILY_CHECKIN_GATE` + `ui.timer.reflectionModalRequired` (§17.2)                             |

### 16.1 Desviaciones aceptadas durante implementación (2026-04-21)

Registradas al cierre de la primera pasada de implementación para evitar drift silencioso:

| Tema                                   | Decisión spec                                                      | Implementación                                                                                                                                   | Justificación                                                                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Columna `reflection_note`              | Columna nueva `TEXT NULL` en `WorkSession`                         | Se reutiliza la columna existente `WorkSession.notes` (ya `TEXT NULL`) para la nota libre del modal, con validación cliente/servidor ≤ 500 chars | Evita una migración adicional; la semántica es equivalente (nota libre del bloque) y `notes` ya está indexada en los informes legacy                                                                    |
| Valores del enum `frictionBlocker`     | Propuestos: `interruptions, unclear_task, tooling, fatigue, other` | Implementados: `fatigue, distractions, clarity, difficulty, motivation, environment, none`                                                       | Más granularidad para analytics; `none` se mapea a `null` en el DTO (el cliente envía `undefined` cuando elige "Ninguno"). Al ser enum nativo Postgres requeriría migración destructiva para re-alinear |
| Nombre de columna para `main_blocker`  | Propuesto: `main_blocker VARCHAR(32) NULL (enum aplicacional)`     | Implementado: columna `frictionBlocker` usando enum nativo `WorkSessionFrictionBlocker`                                                          | El nombre `frictionBlocker` refuerza la conexión con la métrica `frictionScore`; el enum nativo da validación a nivel DB                                                                                |
| `perceivedFocus` / `perceivedProgress` | Fuera de MVP (§5.3)                                                | Columnas añadidas a `WorkSession` pero **opcionales en el DTO** y **no expuestas en el modal MVP**                                               | Permiten instrumentación futura sin tocar el esquema; al ser opcionales no contaminan la señal del MVP                                                                                                  |

---

## 17. KPIs de producto y rollback

### 17.1 KPIs mínimos para validar el MVP

Instrumentar desde el día 1 (tabla `analytics_events` o equivalente ya existente; si no existe, dejar pendiente pero **registrar** qué métricas quiere producto):

| KPI                                  | Definición                                                              | Umbral de alerta (sugerido)        |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------- |
| **Adopción check-in**                | % días con `DailyCheckin` creado / días con ≥ 1 intento de abrir timer. | < 60 % → revisar fricción del gate |
| **Bloques completados con feedback** | `completed` / (`completed + abandoned + pending_feedback > 24 h`).      | < 50 % → revisar modal             |
| **Tasa de abandono**                 | `abandoned` / total bloques del día.                                    | > 30 % → revisar heartbeat/UX      |
| **Distribución de RPE y fricción**   | Histograma 1–5 semanal por usuario.                                     | (Observacional)                    |
| **Preset más usado**                 | `preset_key` agregado.                                                  | (Observacional)                    |
| **Gap a `pending_feedback`**         | Tiempo mediano entre `ended_at` y `complete`.                           | > 30 min → recordatorio agresivo   |

### 17.2 Rollback / feature-flag

- **Flag global** `FEATURE_DAILY_CHECKIN_GATE` (env var o tabla `feature_flags`): si `false`, el endpoint `POST /work-sessions` **no** aplica el 412 por falta de check-in (degrada a modo "sin gate"). Permite rollback sin migrar schema.
- **Flag UI** `ui.timer.reflectionModalRequired`: si `false`, el modal es skippable y el bloque pasa directamente a `completed` con métricas `null`. Útil si producto descubre que el modal obligatorio tumba la tasa de completado.
- **Migración reversible:** las columnas añadidas a `WorkSession` son **todas nullable**; un rollback de código deja datos huérfanos pero no rompe filas existentes.
- **Datos intocables en rollback:** `DailyCheckin` es una tabla nueva; dropearla es seguro si se decide dar marcha atrás completamente.

---

## 18. Próximo paso

Skill **writing-plans**: plan por tareas (migración Prisma, servicios `DailyCheckin` / `WorkSession`, endpoints, Pinia sync, UI modal, feature flags, tests, KPIs).

---

## 19. Investigación: tiempos de estudio/trabajo y evidencia

**Aviso metodológico:** No existe un único par “trabajo/descanso” óptimo para todas las personas y tareas. Los presets son **heurísticas** combinando literatura y patrones de uso; Ritmo debe mantenerlos **configurables** y, donde corresponda, **transparentes** sobre el tipo de evidencia (RCT vs observacional vs marco teórico).

### 19.1 Micro‑pausas y bienestar vs rendimiento inmediato

- **Albulescu et al. (2022)** — revisión sistemática y meta‑análisis sobre _micro‑breaks_: efectos **pequeños pero significativos** en **vigor** (d ≈ 0.36) y **fatiga** (d ≈ 0.35); el efecto agregado sobre **rendimiento global** no fue significativo en el conjunto (d ≈ 0.16, p = 0.116). Los autores subrayan moderadores (tipo de tarea, duración). Definición operativa de micro‑pausa en el paper: interrupciones breves **≤ 10 minutos**.
  - Publicación: [PLOS ONE, DOI 10.1371/journal.pone.0272460](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460)
  - **Implicación para Ritmo:** los ciclos **25/5** encajan en “pausas frecuentes cortas”; para **bloques muy cognitivamente demandantes**, la misma literatura sugiere que pueden hacer falta **pausas más largas** que el típico micro‑break — de ahí que el preset **90/20** no use un descanso de solo 5 min.

### 19.2 Técnica Pomodoro y trabajo por intervalos (educación / fatiga percibida)

- Revisión de alcance (**scoping review**, 2025) sobre literatura del Pomodoro en contextos educativos: sintetiza estudios donde intervalos estructurados tipo **24/6** o **12/3** se comparan con pausas a libre elección; en un subconjunto de RCTs reportan **menor fatiga** y mejores indicadores de atención/motivación frente a control. La revisión también advierte heterogeneidad y necesidad de más RCT de largo plazo.
  - [BMC Medical Education, DOI 10.1186/s12909-025-08001-0](https://bmcmededuc.biomedcentral.com/article/10.1186/s12909-025-08001-0)
  - **Implicación:** el preset **25/5** es la referencia cultural del Pomodoro y está **respaldada por líneas de investigación sobre intervalos estructurados y carga cognitiva**, no por un único número “mágico” de 25.

### 19.3 Decremento de vigilancia (atención sostenida)

- En tareas de **vigilancia** sostenida, la literatura clásica muestra **deterioro de rendimiento con el tiempo en tarea** (tiempos de reacción, sensibilidad), con matices según el tipo de tarea. Sirve como **marco**: los bloques largos sin pausa no son neutrales.
  - Ejemplo de revisión/corpus: decremento de vigilancia y tarea — p. ej. trabajo en _Frontiers in Psychology_ sobre magnitud según requisitos de tarea ([10.3389/fpsyg.2018.01504](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.01504/full)).

### 19.4 Descansos de distinta duración (laboratorio)

- **Lim & Kwok (2016)** manipularon **duración de pausa** (p. ej. 1, 5, 10 min) en un paradigma de atención sostenida; los hallazgos ilustran **trade‑offs** entre recuperación y coste temporal (no son todos “más largo = siempre mejor”).
  - [Human Factors, DOI 10.1177/0018720815617395](https://journals.sagepub.com/doi/10.1177/0018720815617395)

### 19.5 Ciclo ultradiano / BRAC (marco biológico, no cronómetro personal)

- El **Basic Rest–Activity Cycle** propone oscilaciones de orden **~90 min** en alerta/descanso durante la vigilia (debate y variabilidad individual). Es un **marco conceptual** útil para etiquetar “bloque largo”, no una prescripción médica.
  - Resumen accesible: [Wikipedia — Basic rest–activity cycle](https://en.wikipedia.org/wiki/Basic_rest%E2%80%93activity_cycle).

### 19.6 Regla 52/17 y variantes (patrones observacionales)

- **DeskTime** publicó que el **10% más productivo** en su muestra mostró patrones tipo **52 min trabajo / 17 min pausa** (2014); una actualización posterior (2021) observó ratios distintos (p. ej. más minutos continuos), atribuyendo cambios en parte al contexto laboral remoto. Son estudios **observacionales de producto**, no RCT: sirven como **preset opcional “estilo estudios de uso real”**, no como ciencia causal del “óptimo”.
  - [DeskTime — overview de hallazgos](https://desktime.medium.com/desktimes-productivity-research-an-overview-of-our-finds-throughout-the-years-442a90cae895)

### 19.7 Estudio eficiente para **retención** (complemento: no sustituye elección de bloque)

- La **práctica distribuida** (_spacing_) mejora retención respecto al estudio masivo en una misma sesión; el intervalo óptimo entre sesiones depende del intervalo hasta el examen (**Cepeda et al.**, síntesis amplia sobre espaciado).
  - [Psychological Science / material relacionado](https://escholarship.org/uc/item/0kp5q19x)
  - **Implicación:** Ritmo puede mencionar en ayuda/educación que “varias sesiones repartidas” mejoran memoria a largo plazo; eso es **ortogonal** a si el bloque individual dura 25 o 90 minutos.

### 19.8 Tabla resumen para marketing interno / tooltips

| Preset | Base de respaldo                                                                  | Mensaje honesto en UI                                                                                        |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 25/5   | Pomodoro estándar + RCTs/revisiones sobre intervalos estructurados + micro‑pausas | “Ciclos cortos con pausas frecuentes; muy estudiados para fatiga percibida y gestión de atención.”           |
| 52/17  | Patrones observacionales en usuarios de seguimiento de tiempo                     | “Patrón observado en trabajadores muy productivos en un gran dataset; no garantiza el mismo efecto para ti.” |
| 90/20  | BRAC / bloques largos + pausas más largas coherentes con tareas muy exigentes     | “Bloque profundo con pausa más larga; útil si las micro‑pausas de 5 min no te recuperan.”                    |

---

## 20. Referencias enlazadas (lista compacta)

1. Albulescu P, et al. (2022). Micro‑breaks meta‑analysis. _PLOS ONE_. [DOI 10.1371/journal.pone.0272460](https://doi.org/10.1371/journal.pone.0272460)
2. Scoping review Pomodoro / educación (2025). _BMC Medical Education_. [DOI 10.1186/s12909-025-08001-0](https://doi.org/10.1186/s12909-025-08001-0)
3. Lim J, Kwok K. (2016). Break length y atención. _Human Factors_. [DOI 10.1177/0018720815617395](https://doi.org/10.1177/0018720815617395)
4. Cepeda NJ, et al. Spacing effects / práctica distribuida (síntesis 2008). Material UC: [escholarship](https://escholarship.org/uc/item/0kp5q19x)
5. DeskTime productivity research (observacional). [Medium overview](https://desktime.medium.com/desktimes-productivity-research-an-overview-of-our-finds-throughout-the-years-442a90cae895)
6. BRAC / ultradian — contexto: [Wikipedia BRAC](https://en.wikipedia.org/wiki/Basic_rest%E2%80%93activity_cycle)
