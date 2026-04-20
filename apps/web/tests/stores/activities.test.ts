import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useActivitiesStore } from '@/stores/activities'
import type { Activity } from '@/types/activity'

// Module-level mock functions — shared between test and store so vi.clearAllMocks() resets
// them without breaking the reference used inside the store.
const mockGet = vi.fn()
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

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  title: 'Test activity',
  type: 'TASK',
  priority: 'medium',
  isCompleted: false,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 25,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

describe('useActivitiesStore', () => {
  let store: ReturnType<typeof useActivitiesStore>
  let http: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    del: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    http = { get: mockGet, post: mockPost, put: mockPut, del: mockDel }
    store = useActivitiesStore()
  })

  // ── fetchToday ─────────────────────────────────────────
  describe('fetchToday', () => {
    it('replaces activities on success, clears error, sets loading false', async () => {
      const data = [makeActivity({ id: 'act-1' }), makeActivity({ id: 'act-2' })]
      http.get.mockResolvedValueOnce({ success: true, data })

      await store.fetchToday()

      expect(store.activities).toEqual(data)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('sets error on network failure, leaves activities unchanged', async () => {
      store.activities = [makeActivity()]
      http.get.mockRejectedValueOnce(new Error('Network Error'))

      await store.fetchToday()

      expect(store.activities).toHaveLength(1)
      expect(store.error).toBeTruthy()
      expect(store.loading).toBe(false)
    })

    it('sets error on 401, does not crash', async () => {
      const authError = Object.assign(new Error('Unauthorized'), { status: 401 })
      http.get.mockRejectedValueOnce(authError)

      await expect(store.fetchToday()).resolves.not.toThrow()
      expect(store.error).toBeTruthy()
    })

    it('two concurrent fetchToday calls do not duplicate items', async () => {
      const data = [makeActivity({ id: 'act-1' })]
      http.get.mockResolvedValue({ success: true, data })

      await Promise.all([store.fetchToday(), store.fetchToday()])

      expect(store.activities).toHaveLength(1)
    })
  })

  // ── create ─────────────────────────────────────────────
  describe('create', () => {
    it('pushes returned item to activities and returns success', async () => {
      const created = makeActivity({ id: 'new-1', title: 'New task' })
      http.post.mockResolvedValueOnce({ success: true, data: created })

      const result = await store.create({
        title: 'New task',
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
      })

      expect(store.activities).toContainEqual(created)
      expect(result.success).toBe(true)
    })

    it('returns error and does not modify activities when API fails', async () => {
      http.post.mockRejectedValueOnce(new Error('Server error'))

      const before = [...store.activities]
      const result = await store.create({
        title: 'Task',
        startTime: new Date(),
        priority: 'LOW',
        category: 'WORK',
      })

      expect(store.activities).toEqual(before)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('returns error without calling API when title is empty', async () => {
      const result = await store.create({
        title: '   ',
        startTime: new Date(),
        priority: 'LOW',
        category: 'WORK',
      })

      expect(http.post).not.toHaveBeenCalled()
      expect(result.success).toBe(false)
    })
  })

  // ── update ─────────────────────────────────────────────
  describe('update', () => {
    beforeEach(() => {
      store.activities = [makeActivity({ id: 'act-1', title: 'Original' })]
    })

    it('replaces correct item by id on success', async () => {
      const updated = makeActivity({ id: 'act-1', title: 'Updated' })
      http.put.mockResolvedValueOnce({ success: true, data: updated })

      await store.update('act-1', { title: 'Updated' })

      expect(store.activities[0].title).toBe('Updated')
    })

    it('returns error for unknown id without crashing', async () => {
      const result = await store.update('nonexistent', { title: 'X' })

      expect(result.success).toBe(false)
      expect(http.put).not.toHaveBeenCalled()
    })

    it('reverts to pre-call state when API fails (pessimistic)', async () => {
      http.put.mockRejectedValueOnce(new Error('Server error'))

      const before = store.activities[0].title
      await store.update('act-1', { title: 'Should not stick' })

      expect(store.activities[0].title).toBe(before)
    })
  })

  // ── remove ─────────────────────────────────────────────
  describe('remove', () => {
    beforeEach(() => {
      store.activities = [makeActivity({ id: 'act-1' }), makeActivity({ id: 'act-2' })]
    })

    it('removes item on success', async () => {
      http.del.mockResolvedValueOnce({ success: true, data: {} })

      await store.remove('act-1')

      expect(store.activities.map(a => a.id)).not.toContain('act-1')
      expect(store.activities).toHaveLength(1)
    })

    it('does not crash for unknown id', async () => {
      await expect(store.remove('nonexistent')).resolves.not.toThrow()
      expect(store.activities).toHaveLength(2)
    })

    it('reverts on API failure', async () => {
      http.del.mockRejectedValueOnce(new Error('Server error'))

      await store.remove('act-1')

      expect(store.activities).toHaveLength(2)
    })
  })

  // ── getters ────────────────────────────────────────────
  describe('highPriorityActivities', () => {
    it('includes lowercase "high" activities', () => {
      store.activities = [
        makeActivity({ priority: 'high' }),
        makeActivity({ priority: 'medium' }),
      ]
      expect(store.highPriorityActivities).toHaveLength(1)
    })

    it('includes lowercase "urgent" activities', () => {
      store.activities = [makeActivity({ priority: 'urgent' })]
      expect(store.highPriorityActivities).toHaveLength(1)
    })

    it('excludes "medium" and "low" activities', () => {
      store.activities = [
        makeActivity({ priority: 'medium' }),
        makeActivity({ priority: 'low' }),
      ]
      expect(store.highPriorityActivities).toHaveLength(0)
    })
  })

  describe('todayActivities', () => {
    it('excludes activities from yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      store.activities = [makeActivity({ startTime: yesterday.toISOString() })]
      expect(store.todayActivities).toHaveLength(0)
    })

    it('excludes activities from tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      store.activities = [makeActivity({ startTime: tomorrow.toISOString() })]
      expect(store.todayActivities).toHaveLength(0)
    })

    it('includes activities from today', () => {
      store.activities = [makeActivity({ startTime: new Date().toISOString() })]
      expect(store.todayActivities).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      store.activities = [makeActivity()]
      store.error = 'some error'
      store.loading = true

      store.reset()

      expect(store.activities).toHaveLength(0)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.lastFetched).toBeNull()
    })
  })
})
