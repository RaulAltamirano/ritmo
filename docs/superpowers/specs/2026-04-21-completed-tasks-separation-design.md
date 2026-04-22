# Completed Tasks Separation — Design Spec

**Date:** 2026-04-21
**Scope:** `apps/web/components/molecules/TaskList.vue`

## Problem

Completed and pending tasks are rendered in the same flat list. Completed tasks get visual treatment (`opacity-60`, `line-through`) but remain mixed in with active work, which is visually noisy.

## Goal

Show completed tasks in a separate static section below all pending tasks, divided by a clearly labeled separator. Pending tasks retain all existing behavior including drag & drop reorder.

## Approach

Split `displayTasks` into two computed arrays inside `TaskList.vue`. No changes to the component's public interface (props/emits), no changes to parent components.

## Data Layer

Two computed refs derived from `displayTasks`:

- **`pendingTasks`** — items where `!task.completed`, preserving user-set order from `displayTasks`.
- **`completedTasks`** — items where `task.completed`, in arrival order (no manual reorder).

The header task counter shows only `pendingTasks.length`.

## Template Structure

```
<TaskFilters + counter (pendingTasks.length)>

<ul> — pending tasks (drag & drop enabled, uses pendingTasks)
  <insert indicators>
  <TaskCard per pending task>
</ul>

<EmptyState> — only when BOTH pendingTasks and completedTasks are empty

<div class="completed-divider"> — only when completedTasks.length > 0
  label: "Completadas (N)"
  horizontal line

<ul> — completed tasks (no drag, uses completedTasks)
  <TaskCard per completed task>
</ul>
```

## Drag & Drop

Drag indices map to `pendingTasks` only. `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` are unchanged. `canDrag` (`!selectedCategory`) applies only to the pending list. The completed list has no draggable attributes.

## Edge Cases

| State                      | Behavior                                                      |
| -------------------------- | ------------------------------------------------------------- |
| Only pending tasks         | Normal list, no divider                                       |
| Only completed tasks       | Divider + completed list, no EmptyState                       |
| Both pending and completed | Both lists with divider between                               |
| No tasks at all            | EmptyState only                                               |
| Category filter active     | Both lists respect the active filter; drag disabled           |
| Task just completed        | Moves from pending to completed reactively via existing watch |

## Files Changed

- `apps/web/components/molecules/TaskList.vue` — only file modified
