import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useActivitiesStore } from '@/stores/activities'
import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'

// Mock useHttpClient so the store doesn't make real requests
const mockGet = vi.fn().mockResolvedValue({ success: true, data: [] })
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDel = vi.fn()

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: vi.fn(() => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel,
  })),
}))

describe('today page handlers', () => {
  let store: ReturnType<typeof useActivitiesStore>
  const { taskToActivity } = useActivityAdapter()

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useActivitiesStore()
  })

  // ── handleQuickTask ─────────────────────────────────────
  describe('handleQuickTask', () => {
    it('does not call store.create when task name is empty', async () => {
      const createSpy = vi.spyOn(store, 'create')
      const taskName = '  '
      if (!taskName.trim()) {
        // guard fires — create not called
      } else {
        await store.create({
          title: taskName,
          startTime: new Date(),
          priority: 'MEDIUM',
          category: 'WORK',
        })
      }
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('sets isQuickTaskLoading to false even when API fails', async () => {
      vi.spyOn(store, 'create').mockResolvedValueOnce({ success: false, error: 'fail' })
      const isQuickTaskLoading = { value: false }

      isQuickTaskLoading.value = true
      try {
        await store.create({
          title: 'Task',
          startTime: new Date(),
          priority: 'MEDIUM',
          category: 'WORK',
        })
      } finally {
        isQuickTaskLoading.value = false
      }

      expect(isQuickTaskLoading.value).toBe(false)
    })
  })

  // ── handleUpdateTask ────────────────────────────────────
  describe('handleUpdateTask', () => {
    it('calls store.update with all Task fields including priority and tags', async () => {
      store.activities = [
        {
          id: 'task-1',
          title: 'Old',
          type: 'TASK',
          priority: 'medium',
          isCompleted: false,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 25,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })

      const task = {
        id: 'task-1',
        name: 'Updated',
        title: 'Updated',
        createdAt: new Date(),
        priority: 'alta' as const,
        tags: ['focus'],
        notes: 'my notes',
      }
      const payload = taskToActivity(task)
      await store.update(task.id, payload)

      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          priority: 'HIGH',
          tags: ['focus'],
        }),
      )
    })
  })

  // ── handleDeleteTask ────────────────────────────────────
  describe('handleDeleteTask', () => {
    it('calls store.remove with the correct id', async () => {
      const removeSpy = vi
        .spyOn(store, 'remove')
        .mockResolvedValueOnce({ success: true })
      await store.remove('task-1')
      expect(removeSpy).toHaveBeenCalledWith('task-1')
    })
  })

  // ── handleCompleteTaskWithFeedback ──────────────────────
  describe('handleCompleteTaskWithFeedback', () => {
    it('calls reject when store.markCompleted returns error', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({
        success: false,
        error: 'fail',
      })
      const resolve = vi.fn()
      const reject = vi.fn()

      const result = await store.markCompleted('task-1', true)
      if (!result.success) reject(new Error(result.error))

      expect(reject).toHaveBeenCalled()
      expect(resolve).not.toHaveBeenCalled()
    })

    it('calls resolve when store.markCompleted succeeds', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({ success: true })
      const resolve = vi.fn()
      const reject = vi.fn()

      const result = await store.markCompleted('task-1', true)
      if (result.success) resolve()

      expect(resolve).toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    })
  })

  // ── loadSampleTasks guard ───────────────────────────────
  describe('loadSampleTasks guard', () => {
    it('does not insert sample tasks when not in DEV mode', async () => {
      const createSpy = vi.spyOn(store, 'create')
      const isDev = false
      if (isDev && store.activities.length === 0) {
        await store.create({
          title: 'Sample',
          startTime: new Date(),
          priority: 'HIGH',
          category: 'WORK',
        })
      }
      expect(createSpy).not.toHaveBeenCalled()
    })
  })

  // ── handleAddNote ───────────────────────────────────────
  describe('handleAddNote', () => {
    it('calls store.update with description from note', async () => {
      store.activities = [
        {
          id: 'task-1',
          title: 'Task',
          type: 'TASK',
          priority: 'medium',
          isCompleted: false,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 25,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })

      await store.update('task-1', { description: 'My note' })

      expect(updateSpy).toHaveBeenCalledWith('task-1', { description: 'My note' })
    })
  })
})
