import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTodayHandlers } from '@/composables/tasks/useTodayHandlers'
import { useActivitiesStore } from '@/stores/activities'

// Module-level mock functions (same pattern as activities.test.ts)
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

const makeFeedback = () => ({
  energyAfter: 3 as const,
  focusScore: 4 as const,
  progressScore: 3 as const,
  mentalDemand: 2 as const,
  timeFit: 'yes' as const,
  mainBlocker: 'none' as const,
})

const makeTask = (overrides = {}) => ({
  id: 'task-1',
  name: 'Test task',
  title: 'Test task',
  createdAt: new Date(),
  priority: 'media' as const,
  completed: false,
  tags: [],
  ...overrides,
})

describe('useTodayHandlers', () => {
  let store: ReturnType<typeof useActivitiesStore>
  let handlers: ReturnType<typeof useTodayHandlers>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useActivitiesStore()
    handlers = useTodayHandlers()
  })

  // ── handleQuickTask ─────────────────────────────────────
  describe('handleQuickTask', () => {
    it('does not call store.create when task name is empty string', async () => {
      const createSpy = vi.spyOn(store, 'create')
      await handlers.handleQuickTask('   ')
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('does not call store.create when task name is only whitespace', async () => {
      const createSpy = vi.spyOn(store, 'create')
      await handlers.handleQuickTask('\t\n')
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('calls store.create with trimmed title for valid name', async () => {
      const createSpy = vi
        .spyOn(store, 'create')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleQuickTask('  My task  ')
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My task' }),
      )
    })

    it('sets isQuickTaskLoading to false after API success', async () => {
      vi.spyOn(store, 'create').mockResolvedValueOnce({ success: true })
      await handlers.handleQuickTask('Task')
      expect(handlers.isQuickTaskLoading.value).toBe(false)
    })

    it('sets isQuickTaskLoading to false after API failure', async () => {
      vi.spyOn(store, 'create').mockResolvedValueOnce({ success: false, error: 'fail' })
      await handlers.handleQuickTask('Task')
      expect(handlers.isQuickTaskLoading.value).toBe(false)
    })
  })

  // ── handleUpdateTask ────────────────────────────────────
  describe('handleUpdateTask', () => {
    beforeEach(() => {
      store.activities = [
        {
          id: 'task-1',
          title: 'Old',
          type: 'TASK',
          priority: 'medium',
          isCompleted: false,
          startTime: new Date().toISOString(),
          duration: 25,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    })

    it('sends priority field mapped from Spanish to uppercase', async () => {
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleUpdateTask(makeTask({ priority: 'alta' }))
      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ priority: 'HIGH' }),
      )
    })

    it('sends tags from the task', async () => {
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleUpdateTask(makeTask({ tags: ['focus', 'deep-work'] }))
      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ tags: ['focus', 'deep-work'] }),
      )
    })
  })

  // ── handleDeleteTask ────────────────────────────────────
  describe('handleDeleteTask', () => {
    it('calls store.remove with the correct id', async () => {
      const removeSpy = vi
        .spyOn(store, 'remove')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleDeleteTask('task-99')
      expect(removeSpy).toHaveBeenCalledWith('task-99')
    })
  })

  // ── handleAddNote ───────────────────────────────────────
  describe('handleAddNote', () => {
    beforeEach(() => {
      store.activities = [
        {
          id: 'task-1',
          title: 'Task',
          type: 'TASK',
          priority: 'medium',
          isCompleted: false,
          startTime: new Date().toISOString(),
          duration: 25,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    })

    it('calls store.update with note as description', async () => {
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleAddNote('task-1', 'My note')
      expect(updateSpy).toHaveBeenCalledWith('task-1', { description: 'My note' })
    })

    it('sends undefined description when note is empty after trim', async () => {
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      await handlers.handleAddNote('task-1', '   ')
      expect(updateSpy).toHaveBeenCalledWith('task-1', { description: undefined })
    })
  })

  // ── handleCompleteTaskWithFeedback ──────────────────────
  describe('handleCompleteTaskWithFeedback', () => {
    it('calls resolve when markCompleted succeeds', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({ success: true })
      vi.spyOn(store, 'update').mockResolvedValueOnce({ success: true })
      const resolve = vi.fn()
      const reject = vi.fn()

      await handlers.handleCompleteTaskWithFeedback(
        makeTask(),
        makeFeedback(),
        resolve,
        reject,
      )

      expect(resolve).toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    })

    it('calls reject when markCompleted returns error', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({
        success: false,
        error: 'API failed',
      })
      const resolve = vi.fn()
      const reject = vi.fn()

      await handlers.handleCompleteTaskWithFeedback(
        makeTask(),
        makeFeedback(),
        resolve,
        reject,
      )

      expect(reject).toHaveBeenCalledWith(expect.any(Error))
      expect(resolve).not.toHaveBeenCalled()
    })

    it('JSON-encodes feedback into the description on success', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({ success: true })
      const updateSpy = vi
        .spyOn(store, 'update')
        .mockResolvedValueOnce({ success: true })
      const resolve = vi.fn()

      await handlers.handleCompleteTaskWithFeedback(
        makeTask(),
        makeFeedback(),
        resolve,
        vi.fn(),
      )

      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          description: expect.stringContaining('"energyAfter":3'),
        }),
      )
    })

    it('still calls resolve even when feedback persistence fails', async () => {
      vi.spyOn(store, 'markCompleted').mockResolvedValueOnce({ success: true })
      vi.spyOn(store, 'update').mockRejectedValueOnce(new Error('Persist failed'))
      const resolve = vi.fn()

      await handlers.handleCompleteTaskWithFeedback(
        makeTask(),
        makeFeedback(),
        resolve,
        vi.fn(),
      )

      expect(resolve).toHaveBeenCalled()
    })
  })
})
