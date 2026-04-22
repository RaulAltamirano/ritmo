# Reporte — Registro diario de sesión (implementación y estado)

**Fecha del reporte:** 2026-04-21  
**Última actualización de este documento:** 2026-04-22 (hardening: idempotencia concurrente en `complete`, filtros `from/to` por día civil en TZ de usuario, guardas de coherencia local/remota y contrato estricto de alta remota en cliente).  
**Referencias:** plan de implementación en Cursor (`registro-diario-sesion` — YAML de tareas posiblemente desactualizado respecto al código), [Especificación de diseño](../specs/2026-04-21-registro-diario-sesion-design.md).

---

## Leyenda

| Símbolo   | Significado                                          |
| --------- | ---------------------------------------------------- |
| Hecho     | Implementado y alineado con plan/spec en lo esencial |
| Parcial   | Implementado con matices o gaps documentados         |
| Pendiente | No implementado o no verificado en CI/entorno        |

---

## 1. Datos y Prisma

| Ítem                                                                                                                        | Estado    | Ubicación / notas                                          |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------- |
| Modelo `DailyCheckin` + `@@unique([userId, calendarDate])`                                                                  | Hecho     | `apps/api/prisma/models/business.prisma`                   |
| Enums de sesión de trabajo (`WorkSessionState`, `WorkSessionTimerMode`, `WorkSessionTimeFit`, `WorkSessionFrictionBlocker`) | Hecho     | `apps/api/prisma/models/enums.prisma`                      |
| `WorkSession` extendido (estado, timer, métricas, `dailyCheckinId`, `presetKey`, etc.)                                      | Hecho     | `apps/api/prisma/models/business.prisma`                   |
| Tabla `WorkSessionIdempotency`                                                                                              | Hecho     | Mismo archivo                                              |
| `UserPreferences.timerPresets` (JSON)                                                                                       | Hecho     | `apps/api/prisma/models/user.prisma`                       |
| Migraciones aplicadas en todos los entornos                                                                                 | Pendiente | Depende de operación: `prisma migrate` en dev/staging/prod |

---

## 2. Dominio y utilidades (API)

| Ítem                                 | Estado | Ubicación / notas                                               |
| ------------------------------------ | ------ | --------------------------------------------------------------- |
| `getCalendarDateForUser` + Luxon     | Hecho  | `apps/api/src/core/utils/calendarDate.ts`                       |
| Tests unitarios calendario           | Hecho  | `apps/api/src/core/utils/calendarDate.unit.test.ts`             |
| Validación ±1 día en upsert check-in | Hecho  | `apps/api/src/modules/checkins/services/DailyCheckinService.ts` |

---

## 3. API REST

| Ítem                                                                        | Estado | Ubicación / notas                                                                                         |
| --------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `GET` / `PUT` `/api/checkins/daily/:calendarDate`                           | Hecho  | `apps/api/src/modules/checkins/`                                                                          |
| `POST /api/work-sessions` (incl. `taskId`, `timerMode`, etc.)               | Hecho  | `apps/api/src/modules/work-sessions/`                                                                     |
| `412` sin check-in (`checkin_required`) + flag `FEATURE_DAILY_CHECKIN_GATE` | Hecho  | `WorkSessionService`                                                                                      |
| `409` bloque activo con `{ activeSessionId, state }`                        | Hecho  |                                                                                                           |
| `GET /work-sessions/active`                                                 | Hecho  |                                                                                                           |
| `GET /work-sessions` (listado, filtros, cursor)                             | Hecho  |                                                                                                           |
| `PATCH /work-sessions/:id` (heartbeat, estado, pausa acumulada)             | Hecho  |                                                                                                           |
| Rate limit 20/h en `POST`, 6/min en `PATCH`                                 | Hecho  | `work-sessions/routes.ts`                                                                                 |
| `POST …/complete` con header `Idempotency-Key` e idempotencia               | Hecho  | `WorkSessionService.complete` con claim transaccional de key y manejo de colisión `P2002`                 |
| `POST …/abandon` (idempotente en estados finales ya alcanzados)             | Hecho  |                                                                                                           |
| CORS: header `Idempotency-Key` permitido                                    | Hecho  | `apps/api/src/server.ts`, `apps/api/src/app.ts`                                                           |
| Histórico `from`/`to` como rango por día civil en TZ usuario                | Hecho  | `WorkSessionService.list` convierte límites `from`/`to` desde TZ usuario a rango UTC de inicio/fin de día |

---

## 4. Jobs y mantenimiento

| Ítem                                     | Estado | Ubicación / notas                                          |
| ---------------------------------------- | ------ | ---------------------------------------------------------- |
| Job abandono solo `running` / `paused`   | Hecho  | `apps/api/src/jobs/maintenance/workSessionStaleAbandon.ts` |
| Umbral `min(2 × targetDurationSec, 6 h)` | Hecho  | Documentado en cabecera del job                            |
| `pending_feedback` no auto-abandonado    | Hecho  |                                                            |
| Registro periódico (~5 min)              | Hecho  | `apps/api/src/jobs/maintenance/sessionJobManager.ts`       |

---

## 5. Cliente web (Nuxt / Pinia / Vue)

| Ítem                                                                            | Estado    | Ubicación / notas                                                                                                                   |
| ------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Gate check-in antes del primer bloque remoto                                    | Hecho     | `useRemoteWorkSession.ts`, `DailyCheckinModal.vue`, `sessionGate` store                                                             |
| Store `sessionGate`: estado `conflict` + `openConflict` / `closeConflict` (409) | Hecho     | `apps/web/stores/sessionGate.ts` (alineado con `ActiveSessionConflictModal` y `useRemoteWorkSession`)                               |
| Parseo unificado de errores `$fetch` / envelope API                             | Hecho     | `apps/web/utils/parseFetchError.ts`; uso en `useRemoteWorkSession` y modales de check-in / reflexión / conflicto                    |
| Contrato estricto en alta remota (`POST /work-sessions` debe devolver `id`)     | Hecho     | `useRemoteWorkSession` falla explícitamente con `WORK_SESSION_CREATE_INVALID_RESPONSE` si falta `data.id`                           |
| Mensajes de error en UI (check-in, reflexión, abandono en conflicto)            | Hecho     | `DailyCheckinModal.vue`, `WorkBlockFeedbackModal.vue`, `ActiveSessionConflictModal.vue`                                             |
| Restaurar sesión activa: lectura post-hidratar sin estrechamiento TS incorrecto | Hecho     | `useActiveWorkSessionRestore.ts` (`timer.$state.activeTask` tras `hydrateFromActiveRemoteSession`)                                  |
| Fecha civil con `User.timezone` (no solo UTC)                                   | Hecho     | `apps/web/utils/civilDate.ts`, uso en `useRemoteWorkSession` y `DailyCheckinModal`                                                  |
| Tests unitarios fecha civil (web)                                               | Hecho     | `apps/web/utils/civilDate.spec.ts`                                                                                                  |
| `POST` bloque + heartbeat remoto                                                | Hecho     | `apps/web/stores/timer.ts`                                                                                                          |
| Coherencia local/remota al cambiar tarea con sesión remota activa               | Hecho     | `timer.startTask` bloquea el cambio local de tarea si existe `remoteWorkSessionId`                                                  |
| Heartbeat ~60 s con jitter ~55–65 s                                             | Hecho     | `timer.ts` (`setTimeout` encadenado)                                                                                                |
| Fin countdown → `pending_feedback` en API + modal reflexión                     | Hecho     | `onTimerNaturalFinished`, `WorkBlockFeedbackModal.vue`                                                                              |
| `409` → conflicto con resolución (modal + pending start)                        | Hecho     | `useRemoteWorkSession.ts`, `ActiveSessionConflictModal.vue`, `sessionGate` (`conflict`)                                             |
| Restaurar bloque activo tras autenticación                                      | Hecho     | `useActiveWorkSessionRestore.ts`, `plugins/auth.client.ts`, y tras login/register en `stores/auth.ts`                               |
| Modal “Abandonar” llama `POST …/abandon`                                        | Hecho     | `WorkBlockFeedbackModal.vue`                                                                                                        |
| Presets por defecto 25/5 · 52/17 · 90/20 (módulo compartido)                    | Parcial   | `apps/web/composables/timer/timerPresets.ts`; unificación en `TaskList`/`TaskItem` no auditada en este reporte                      |
| Preferencias `timerPresets` persistidas vía API                                 | Hecho     | `UserService`, DTOs, validador Zod (`timerPresets.dto.ts`)                                                                          |
| Flag `NUXT_PUBLIC_TIMER_REFLECTION_REQUIRED=false`                              | Parcial   | Al terminar el countdown: abandona sin modal (no equivale a “completed con métricas null” del spec sin cambio de API)               |
| `activityId` snapshot en `WorkSession` al crear                                 | Pendiente | El modelo de negocio actual de `Task` no expone `activityId` en el mismo sentido que el spec histórico; no hay snapshot en creación |

---

## 6. Tests y calidad

| Ítem                                             | Estado    | Notas                                                                                                                 |
| ------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------- |
| Archivos de test API (check-ins, work-sessions)  | Hecho     | `apps/api/tests/checkins/`, `apps/api/tests/work-sessions/`                                                           |
| Tests unitarios web de hardening en timer remoto | Hecho     | `apps/web/tests/composables/useRemoteWorkSession.test.ts`, `apps/web/tests/stores/timer.remote-session-guard.test.ts` |
| Ejecución verde en CI / DB de test local         | Pendiente | Requiere credenciales y Postgres de test configurados                                                                 |
| `nuxt typecheck` en monorepo web                 | Pendiente | Puede fallar por conflicto de versiones de Vite entre paquetes (ajeno a esta feature)                                 |

---

## 7. Desviaciones respecto al documento de diseño (§5.3)

| Tema                                                                                                            | Estado  |
| --------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Modal de reflexión: el diseño MVP citaba 3 campos obligatorios + 2 opcionales con enums de bloqueador concretos | Parcial | La implementación actual incluye también foco percibido, progreso percibido, `timeFit` y un conjunto de valores de bloqueador alineado al enum Prisma actual |

---

## 8. Resumen ejecutivo

- **Backend:** MVP de persistencia de check-in diario, bloques de trabajo, concurrencia, idempotencia de cierre, límites de tasa, CORS, job de abandono y **presets en `UserPreferences`** — **Hecho**. _2026-04-22:_ hardening de idempotencia concurrente en `complete` y filtros de histórico `from/to` por día civil en TZ de usuario.
- **Frontend:** Flujo completo de gate, sincronización remota, conflicto, reflexión con abandono explícito, restauración tras sesión y **fecha civil por timezone** — **Hecho**. _2026-04-22:_ contrato estricto de respuesta al crear sesión remota (`id` obligatorio) y bloqueo de cambio local de tarea con sesión remota activa.
- **Operación:** pendiente validar **migraciones** y **tests de integración** con base de datos real de test/CI.

---

## 9. Archivos clave (índice rápido)

| Área                               | Rutas                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Prisma                             | `apps/api/prisma/models/business.prisma`, `enums.prisma`, `user.prisma`                                                            |
| Check-ins API                      | `apps/api/src/modules/checkins/`                                                                                                   |
| Work sessions API                  | `apps/api/src/modules/work-sessions/`                                                                                              |
| Calendario (API)                   | `apps/api/src/core/utils/calendarDate.ts`                                                                                          |
| Job abandono                       | `apps/api/src/jobs/maintenance/workSessionStaleAbandon.ts`                                                                         |
| Presets usuario (API)              | `apps/api/src/modules/users/timerPresets.dto.ts`, `UserService.ts`, `dto/UserDTOs.ts`, `api/validators/validation.system.ts`       |
| Cliente timer / gate               | `apps/web/stores/timer.ts`, `stores/sessionGate.ts`, `composables/timer/useRemoteWorkSession.ts`, `useActiveWorkSessionRestore.ts` |
| Tests web (hardening timer remoto) | `apps/web/tests/composables/useRemoteWorkSession.test.ts`, `apps/web/tests/stores/timer.remote-session-guard.test.ts`              |
| UI                                 | `DailyCheckinModal.vue`, `WorkBlockFeedbackModal.vue`, `ActiveSessionConflictModal.vue`, `layouts/default.vue`                     |
| Config cliente                     | `apps/web/config/environment.ts` (objeto `timer`)                                                                                  |
| Fecha civil cliente                | `apps/web/utils/civilDate.ts`                                                                                                      |
| Errores HTTP / API en cliente      | `apps/web/utils/parseFetchError.ts`                                                                                                |

---

_Fin del reporte._
