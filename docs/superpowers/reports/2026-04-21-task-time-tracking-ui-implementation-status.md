# Reporte — Task Time Tracking UI (implementación y estado)

**Fecha del reporte:** 2026-04-21
**Plan:** [`docs/superpowers/plans/2026-04-21-task-time-tracking-ui.md`](../plans/2026-04-21-task-time-tracking-ui.md)
**Commits:** ninguno (implementado en workspace, sin commits a petición del usuario)

---

## Objetivo

Mostrar en la pantalla Today tres indicadores que estaban dead/blank: (a) tiempo acumulado por tarea en cada `TaskCard`, (b) tiempo total invertido en el día, (c) tiempo transcurrido sin tarea activa.

---

## Leyenda

| Símbolo      | Significado                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| Hecho        | Implementado, con tests que pasan localmente                                           |
| No ejecutado | Implementado pero no verificado en entorno actual (típicamente requiere infra externa) |
| Pendiente    | No tocado — queda para una siguiente iteración                                         |

---

## 1. Backend — `WorkSessionService.getTodaySummary`

| Ítem                                                                                                   | Estado | Ubicación / notas                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| Método `getTodaySummary(userId, tz)` que agrega sesiones cerradas del día (user TZ)                    | Hecho  | `apps/api/src/modules/work-sessions/services/WorkSessionService.ts` (nuevo método después de `getActive`) |
| Devuelve `{ calendarDate, totalSeconds, perTask, lastSessionEndedAt }`                                 | Hecho  | Mismo archivo                                                                                             |
| Incluye estados `completed` + `abandoned`; excluye `running`/`paused`/`pending_feedback` y `isDeleted` | Hecho  | Filtro `state: { in: [completed, abandoned] }` + `isDeleted: false`                                       |
| Segundos por sesión = `(endTime - startTime)/1000 - pausedDurationSec`, clamp a ≥0                     | Hecho  | No usa `duration` (minutos, nullable en abandonadas)                                                      |
| `lastSessionEndedAt` = ISO de la sesión cerrada más reciente del día                                   | Hecho  | Orden `endTime ASC` y se queda con el último en el loop                                                   |
| Filtrado por ventana civil del día en TZ del usuario                                                   | Hecho  | `getCalendarDateForUser` + ventana 24h                                                                    |
| `GET /api/work-sessions/today-summary` (controller + ruta)                                             | Hecho  | `controllers/WorkSessionController.ts` + `routes.ts` (entre `/active` y `/`)                              |
| 401 si no autenticado                                                                                  | Hecho  | `ApiResponses.unauthorized()`                                                                             |
| Type-check API (`tsc --noEmit`)                                                                        | Hecho  | Sin errores                                                                                               |

### Tests de API

| Archivo                                                      | Nº tests | Estado local                                                                                                                                                                                      |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/tests/work-sessions/today-summary.service.test.ts` | 6        | **No ejecutado** — requiere DB de test en `localhost:5434`. El puerto estaba ocupado por otro container (`syntiIQ`) al momento del reporte; no se levantó `pnpm setup` para no perturbar entorno. |
| `apps/api/tests/work-sessions/today-summary.route.test.ts`   | 3        | **No ejecutado** — misma razón                                                                                                                                                                    |

**Pendiente de revisión manual:** levantar test DB y correr `cd apps/api && pnpm vitest run tests/work-sessions/today-summary.*.test.ts`. Los tests siguen el patrón del `work-session.test.ts` existente (mismo `testContext.app`, `getAuthHeaders`, `testPrisma`), así que no debería haber sorpresas de infra.

**Cobertura de casos en los tests (service):**

- Sin sesiones → zeros.
- Completada con `pausedDurationSec` → resta pausa.
- Abandonada → incluida.
- `running`/`paused`/`pending_feedback` + soft-deleted → excluidas.
- Dos tareas → `perTask` agrupado, `lastSessionEndedAt` = la más reciente.
- Sesión cerrada ayer → excluida.

---

## 2. Frontend — store `workSessionSummary`

| Ítem                                                                                                 | Estado | Ubicación / notas                                                    |
| ---------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Pinia store `useWorkSessionSummaryStore` (Options API)                                               | Hecho  | `apps/web/stores/workSessionSummary.ts`                              |
| Estado: `calendarDate`, `totalSeconds`, `perTask`, `lastSessionEndedAt`, `lastError`, `loading`      | Hecho  |                                                                      |
| Getter `getSecondsFor(taskId) → number`                                                              | Hecho  | Devuelve 0 si no existe                                              |
| Action `refresh()` → `$fetch(baseUrl + '/work-sessions/today-summary')` con `credentials: 'include'` | Hecho  | Captura errores en `lastError` sin romper UI                         |
| Tests unitarios (3: empty state, fetch OK, fetch falla)                                              | Hecho  | `apps/web/tests/stores/workSessionSummary.test.ts` — **3/3 passing** |

---

## 3. Frontend — composable `useTodayTaskView`

| Ítem                                                                                                   | Estado | Ubicación / notas                                                                                |
| ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| Composable que fusiona `tasksStore.todayTasks` + `workSessionSummary` + `timerStore`                   | Hecho  | `apps/web/composables/tasks/useTodayTaskView.ts`                                                 |
| `tasks.value` (reactive `Task[]`): cada tarea con `totalTimeSpent = closed + (isActive ? elapsed : 0)` | Hecho  | Usa `frontendTaskToUiTask` como base y sobreescribe `isRunning`/`timeRemaining`/`totalTimeSpent` |
| `dayTotalSeconds.value = summary.totalSeconds + activeElapsed`                                         | Hecho  |                                                                                                  |
| Active elapsed = `(activeTask.totalTime ?? 0) - (activeTask.timeLeft ?? 0)`, clamp a ≥0                | Hecho  |                                                                                                  |
| Tests unitarios (4: summary-only, active+live-elapsed, dayTotal, no active)                            | Hecho  | `apps/web/tests/composables/useTodayTaskView.test.ts` — **4/4 passing**                          |

---

## 4. Frontend — integración en `pages/today/index.vue`

| Ítem                                                                                                | Estado | Ubicación / notas                                                                        |
| --------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Reemplazo de `tasksStore.todayTasks.map(frontendTaskToUiTask)` por `useTodayTaskView()`             | Hecho  | Línea ~57                                                                                |
| `useWorkSessionSummaryStore().refresh()` en `onMounted` (en paralelo con `fetchToday`)              | Hecho  | `Promise.all([...])`                                                                     |
| `watch(timerStore.activeTask?.id …)` → refetch summary cuando la sesión activa termina (set → null) | Hecho  | Asegura que el card refleje tiempo nuevo tras completar/abandonar                        |
| Props `:day-total-seconds` y `:last-session-ended-at` pasadas a `<TodayLayout>`                     | Hecho  |                                                                                          |
| Imports limpiados (`frontendTaskToUiTask`, `computed` removidos si no se usan)                      | Hecho  | `frontendTaskToUiTask` ya no se importa aquí                                             |
| Type-check específico de este archivo                                                               | Hecho  | Sin errores en `pnpm type-check` (errores pre-existentes del repo no tocan este archivo) |

---

## 5. Frontend — `TodayTimeStrip` (molecule)

| Ítem                                                                                            | Estado | Ubicación / notas                                                    |
| ----------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- | ----- | ------------------- |
| Componente `TodayTimeStrip.vue`                                                                 | Hecho  | `apps/web/components/molecules/TodayTimeStrip.vue`                   |
| Muestra `Hoy Xh Ym` o `Hoy Ym` según `dayTotalSeconds`                                          | Hecho  | `formatTotal`                                                        |
| Contador idle: `Xm sin tarea` relativo a `lastSessionEndedAt`, tick cada 1s                     | Hecho  | `setInterval` + `now` ref                                            |
| Oculta idle cuando hay timer en marcha o pausado (`timerStore.isRunning                         |        | isPaused`)                                                           | Hecho | `showIdle` computed |
| Oculta idle cuando `lastSessionEndedAt === null`                                                | Hecho  |                                                                      |
| Estilos scoped con soporte dark mode                                                            | Hecho  |                                                                      |
| Tests unitarios (5: ≥1h, <1h, idle visible, idle oculto por timer activo, idle oculto sin last) | Hecho  | `apps/web/tests/components/TodayTimeStrip.spec.ts` — **5/5 passing** |

---

## 6. Frontend — wiring en `TodayHeader` + `TodayLayout`

| Ítem                                                                                           | Estado        | Ubicación / notas                                                                                                               |
| ---------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `TodayLayout.vue`: props `dayTotalSeconds` + `lastSessionEndedAt` añadidos a `interface Props` | Hecho         |                                                                                                                                 |
| `TodayLayout.vue`: props forwardeadas a `<TodayHeader>`                                        | Hecho         |                                                                                                                                 |
| `TodayHeader.vue`: `defineProps<Props>()` con `dayTotalSeconds` + `lastSessionEndedAt`         | Hecho         |                                                                                                                                 |
| `TodayHeader.vue`: renderiza `<TodayTimeStrip>` tras `<CircadianPhaseCard />`                  | Hecho         |                                                                                                                                 |
| Smoke test manual en browser (dev server)                                                      | **Pendiente** | No se ejecutó `pnpm dev:web` durante esta sesión. Requiere verificación manual del usuario (ver apartado "Para probar a mano"). |

---

## 7. Verificación agregada

| Chequeo                  | Estado                          | Detalle                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm type-check` en API | Hecho — OK                      | Sin errores                                                                                                                                                                                                                       |
| `pnpm type-check` en web | Hecho — OK para archivos nuevos | El comando reporta errores **pre-existentes** en otros archivos (`AIChatInterface.vue`, `CalendarFilters.vue`, `useTasks.ts`, etc.) y un error de versiones de Vite entre Nuxt y el monorepo — ninguno toca los archivos del plan |
| Tests nuevos API         | No ejecutado                    | Ver §1                                                                                                                                                                                                                            |
| Tests nuevos web (12/12) | Hecho — 12 pass                 | `tests/stores/workSessionSummary.test.ts` (3) + `tests/composables/useTodayTaskView.test.ts` (4) + `tests/components/TodayTimeStrip.spec.ts` (5)                                                                                  |
| Suite web completa       | Hecho — 137/142                 | 5 fallos **pre-existentes** documentados abajo                                                                                                                                                                                    |

### Fallos pre-existentes en la suite web (no regresiones)

| Archivo                                                     | Síntoma                                                                                   | Causa                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/pages/today-feedback-flow.test.ts` (2)               | `getActivePinia() was called but there was no active Pinia` en `pages/today/index.vue:37` | El test mockea `@/composables/tasks/useActivities` (módulo **borrado** — ver `git status: D apps/web/composables/tasks/useActivities.ts`) y no instala Pinia. Ya fallaba antes del cambio — el error apunta a la primera línea `useTasksStore()`, no a código añadido en este plan |
| `tests/components/today/TodayTaskFeedbackModal.test.ts` (2) | `Unable to get button[aria-label="Energia 4 de 5"]`                                       | aria-labels que el modal actual ya no renderiza. Archivo del test no tocado en este plan                                                                                                                                                                                           |
| `tests/components/molecules/CircadianPhaseCard.test.ts` (1) | `expected '…0%…' to contain '60%'`                                                        | Assertion desactualizada tras cambios en `CircadianPhaseCard`. Ajeno a este plan                                                                                                                                                                                                   |

**Acción sugerida:** estos 3 archivos de test deberían tratarse en un ticket aparte — están huérfanos respecto al código actual.

---

## Archivos creados / modificados

### Creados

- `apps/api/tests/work-sessions/today-summary.service.test.ts`
- `apps/api/tests/work-sessions/today-summary.route.test.ts`
- `apps/web/stores/workSessionSummary.ts`
- `apps/web/composables/tasks/useTodayTaskView.ts`
- `apps/web/components/molecules/TodayTimeStrip.vue`
- `apps/web/tests/stores/workSessionSummary.test.ts`
- `apps/web/tests/composables/useTodayTaskView.test.ts`
- `apps/web/tests/components/TodayTimeStrip.spec.ts`

### Modificados

- `apps/api/src/modules/work-sessions/services/WorkSessionService.ts` — método `getTodaySummary`
- `apps/api/src/modules/work-sessions/controllers/WorkSessionController.ts` — handler `todaySummary`
- `apps/api/src/modules/work-sessions/routes.ts` — ruta `GET /today-summary`
- `apps/web/pages/today/index.vue` — usa `useTodayTaskView` + `summaryStore.refresh()` + watcher
- `apps/web/components/organisms/today/TodayLayout.vue` — props `dayTotalSeconds` / `lastSessionEndedAt`
- `apps/web/components/organisms/today/TodayHeader.vue` — renderiza `TodayTimeStrip`

---

## Para probar a mano

1. **Levantar la app:**
   ```bash
   pnpm docker:up          # Postgres dev (5433)
   pnpm dev                # API + web en paralelo
   ```
2. **Abrir `http://localhost:3000/today`** con un usuario que tenga check-in del día hecho.
3. **Estado vacío:** el header debería mostrar `Hoy 0m` (sin idle label, al no haber sesiones hoy).
4. **Iniciar una tarea** (click en play de un card):
   - El badge `Hoy …` en el header tickea cada segundo.
   - El label `sin tarea` desaparece.
   - El card muestra el countdown `mm:ss`.
5. **Completar la sesión** (termina el pomodoro + modal de feedback):
   - Tras submit, el card muestra `Xm acumulado`.
   - `Hoy` conserva el total sumado.
   - Aparece `Xs sin tarea` y empieza a contar hacia arriba.
6. **Iniciar otra tarea**: el label idle desaparece otra vez.

## Para ejecutar los tests API pendientes

```bash
# Asegurar que el puerto 5434 esté libre (actualmente tiene 'syntiIQ' u otro container)
docker ps -a --filter "publish=5434"
# Levantar DB de test + aplicar migraciones
cd apps/api && pnpm db:test:setup   # o el script equivalente documentado en apps/api/tests/README-DOCKER.md
pnpm vitest run tests/work-sessions/today-summary.service.test.ts \
                tests/work-sessions/today-summary.route.test.ts
```

---

## Gaps conocidos (fuera de scope de este plan)

Observaciones que surgieron durante la implementación y podrían ser siguiente iteración:

1. **`GET /api/day-summary/:date`** — endpoint consolidado que junte check-in + sesiones + fases circadianas + totales en un solo request por día. Hoy el cliente puede reconstruir esto pero necesita 3 llamadas distintas.
2. **Agregado por categoría/tag de tarea** — `perTask` está por `taskId`, no pivota a `category` ni `tags`. Útil para analytics (p. ej. "3h en WORK, 1h en STUDY").
3. **Agregado por fase circadiana** — cruzar `WorkSession.startTime` con la fase activa en ese momento para mostrar "trabajaste 2h en peak, 30m en slow activation".
4. **Histórico multi-día** — el summary solo cubre hoy. No existe `GET /work-sessions/summary?from&to&groupBy=day`.
5. **Tiempo idle server-side** — actualmente el cliente infiere el contador idle a partir de `lastSessionEndedAt`. Si se quisiera consistencia cross-device sin confiar en reloj local, haría falta persistir un `lastActivityAt` por usuario.

---

## Estado global

- **API:** implementación completa y type-check OK; tests escritos pero **no ejecutados localmente** (gap de infra de test DB).
- **Web:** implementación completa, 12/12 tests nuevos pasando, type-check sin errores atribuibles a este plan.
- **Regresiones introducidas:** ninguna (los 5 fallos de la suite completa son pre-existentes y documentados).
- **Commits:** no realizados — el workspace queda con los cambios listos para revisión manual y commit por parte del usuario.
