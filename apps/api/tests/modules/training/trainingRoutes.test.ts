import { describe, expect, it } from 'vitest'

import trainingRouter from '../../../src/modules/training/routes.js'

type RouteLayer = {
  route?: {
    path: string
    stack: unknown[]
  }
}

describe('training routes', () => {
  it('rate limits only chat and week generation routes', () => {
    const routes = (trainingRouter as unknown as { stack: RouteLayer[] }).stack
      .filter(layer => layer.route)
      .map(layer => layer.route!)
    const handlerCount = (path: string) =>
      routes.find(route => route.path === path)?.stack.length

    expect(handlerCount('/chat')).toBe(2)
    expect(handlerCount('/weeks/generate')).toBe(2)
    expect(handlerCount('/weeks/:id/apply')).toBe(1)
    expect(handlerCount('/logs')).toBe(1)
  })
})
