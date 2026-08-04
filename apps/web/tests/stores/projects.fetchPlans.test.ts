import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const get = vi.fn()
const post = vi.fn()

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: () => ({
    get,
    post,
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  }),
}))

describe('projects store fetchPlans', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    get.mockReset()
    post.mockReset()
  })

  it('loads plans from GET /plans into projects', async () => {
    get.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc',
          name: 'Inglés B2',
          status: 'active',
          totalTasks: 2,
          pendingTasks: 1,
          progress: 50,
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    })

    const { useProjectsStore } = await import('@/stores/projects')
    const store = useProjectsStore()
    const result = await store.fetchPlans()

    expect(result.success).toBe(true)
    expect(get).toHaveBeenCalledWith('/plans')
    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]?.name).toBe('Inglés B2')
    expect(store.projects[0]?.status).toBe('activo')
    expect(store.error).toBeNull()
  })

  it('sets error when request fails', async () => {
    get.mockRejectedValue({ userMessage: 'Not signed in' })

    const { useProjectsStore } = await import('@/stores/projects')
    const store = useProjectsStore()
    const result = await store.fetchPlans()

    expect(result.success).toBe(false)
    expect(store.error).toBe('Not signed in')
    expect(store.projects).toHaveLength(0)
  })
})

describe('projects store createPlan', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    get.mockReset()
    post.mockReset()
  })

  it('posts to /plans and prepends the new project', async () => {
    post.mockResolvedValue({
      success: true,
      data: {
        id: 'new-1',
        name: 'Oratoria',
        description: 'Hablar en público',
        status: 'planned',
        color: 'blue',
        totalTasks: 0,
        pendingTasks: 0,
        progress: 0,
        createdAt: '2026-08-03T00:00:00.000Z',
        updatedAt: '2026-08-03T00:00:00.000Z',
      },
    })

    const { useProjectsStore } = await import('@/stores/projects')
    const store = useProjectsStore()
    const result = await store.createPlan({
      name: 'Oratoria',
      description: 'Hablar en público',
      status: 'planificado',
      color: 'blue',
    })

    expect(result.success).toBe(true)
    expect(post).toHaveBeenCalledWith('/plans', {
      name: 'Oratoria',
      description: 'Hablar en público',
      status: 'planned',
      color: 'blue',
      icon: 'Compass',
    })
    expect(store.projects[0]?.id).toBe('new-1')
    expect(store.projects[0]?.status).toBe('planificado')
  })

  it('rejects empty name without calling the API', async () => {
    const { useProjectsStore } = await import('@/stores/projects')
    const store = useProjectsStore()
    const result = await store.createPlan({
      name: '   ',
      description: '',
      status: 'activo',
      color: 'blue',
    })
    expect(result.success).toBe(false)
    expect(post).not.toHaveBeenCalled()
  })
})
