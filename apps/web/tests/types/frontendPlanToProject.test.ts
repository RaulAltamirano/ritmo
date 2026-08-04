import { describe, expect, it } from 'vitest'
import {
  frontendPlanToProject,
  projectFormToCreatePayload,
  type FrontendPlan,
} from '@/types/project'

describe('frontendPlanToProject', () => {
  it('maps API plan fields to UI Project', () => {
    const plan: FrontendPlan = {
      id: 'plan_1',
      name: 'Oratoria',
      description: 'Hablar en público',
      status: 'active',
      color: 'teal',
      icon: 'Mic',
      totalTasks: 4,
      pendingTasks: 3,
      progress: 25,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    }

    const project = frontendPlanToProject(plan)
    expect(project.id).toBe('plan_1')
    expect(project.status).toBe('activo')
    expect(project.description).toBe('Hablar en público')
    expect(project.progress).toBe(25)
    expect(project.color).toBe('teal')
    expect(project.createdAt).toBeInstanceOf(Date)
  })

  it('defaults color/icon and empty description', () => {
    const project = frontendPlanToProject({
      id: 'p2',
      name: 'Hábitos',
      status: 'planned',
      totalTasks: 0,
      pendingTasks: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(project.status).toBe('planificado')
    expect(project.description).toBe('')
    expect(project.color).toBe('blue')
    expect(project.icon).toBe('Compass')
  })
})

describe('projectFormToCreatePayload', () => {
  it('maps UI status to API status', () => {
    expect(
      projectFormToCreatePayload({
        name: '  Meta  ',
        description: '  ',
        status: 'activo',
        color: 'green',
      }),
    ).toEqual({
      name: 'Meta',
      description: undefined,
      status: 'active',
      color: 'green',
      icon: 'Compass',
    })
  })
})
