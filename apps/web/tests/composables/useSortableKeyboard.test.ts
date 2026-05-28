import { ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useSortableKeyboard } from '@/composables/tasks/useSortableKeyboard'
import type { Task } from '@/types/task'

const makeTask = (id: string, name: string): Task => ({
  id,
  name,
  createdAt: new Date(),
  completed: false,
})

const key = (code: string): KeyboardEvent =>
  new KeyboardEvent('keydown', { code, bubbles: true })

describe('useSortableKeyboard', () => {
  it('grabbing an item sets it as grabbed', () => {
    const items = ref([makeTask('a', 'Task A'), makeTask('b', 'Task B')])
    const { onGripKeydown, isGrabbed } = useSortableKeyboard({
      items,
      onReorder: vi.fn(),
    })

    onGripKeydown('a', key('Space'))

    expect(isGrabbed('a')).toBe(true)
    expect(isGrabbed('b')).toBe(false)
  })

  it('ArrowDown while grabbed moves item one position down and updates announce', () => {
    const items = ref([
      makeTask('a', 'Task A'),
      makeTask('b', 'Task B'),
      makeTask('c', 'Task C'),
    ])
    const onReorder = vi.fn()
    const { onGripKeydown, isGrabbed, announce } = useSortableKeyboard({
      items,
      onReorder,
    })

    onGripKeydown('a', key('Space')) // grab Task A (index 0)
    onGripKeydown('a', key('ArrowDown')) // move to index 1

    expect(items.value[0].id).toBe('b')
    expect(items.value[1].id).toBe('a')
    expect(items.value[2].id).toBe('c')
    expect(announce.value).toContain('Task A')
    expect(announce.value).toContain('2')
    expect(isGrabbed('a')).toBe(true) // still grabbed
    expect(onReorder).not.toHaveBeenCalled() // not confirmed yet
  })

  it('ArrowUp while grabbed moves item one position up', () => {
    const items = ref([
      makeTask('a', 'Task A'),
      makeTask('b', 'Task B'),
      makeTask('c', 'Task C'),
    ])
    const { onGripKeydown } = useSortableKeyboard({ items, onReorder: vi.fn() })

    onGripKeydown('c', key('Space')) // grab Task C (index 2)
    onGripKeydown('c', key('ArrowUp')) // move to index 1

    expect(items.value[0].id).toBe('a')
    expect(items.value[1].id).toBe('c')
    expect(items.value[2].id).toBe('b')
  })

  it('ArrowDown does nothing when item is already last', () => {
    const items = ref([makeTask('a', 'Task A'), makeTask('b', 'Task B')])
    const { onGripKeydown } = useSortableKeyboard({ items, onReorder: vi.fn() })

    onGripKeydown('b', key('Space'))
    onGripKeydown('b', key('ArrowDown'))

    expect(items.value[0].id).toBe('a')
    expect(items.value[1].id).toBe('b')
  })

  it('ArrowUp does nothing when item is already first', () => {
    const items = ref([makeTask('a', 'Task A'), makeTask('b', 'Task B')])
    const { onGripKeydown } = useSortableKeyboard({ items, onReorder: vi.fn() })

    onGripKeydown('a', key('Space'))
    onGripKeydown('a', key('ArrowUp'))

    expect(items.value[0].id).toBe('a')
    expect(items.value[1].id).toBe('b')
  })

  it('Enter confirms and calls onReorder with current order', () => {
    const items = ref([makeTask('a', 'Task A'), makeTask('b', 'Task B')])
    const onReorder = vi.fn()
    const { onGripKeydown, isGrabbed } = useSortableKeyboard({ items, onReorder })

    onGripKeydown('a', key('Space'))
    onGripKeydown('a', key('ArrowDown'))
    onGripKeydown('a', key('Enter')) // confirm

    expect(onReorder).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'b' }),
      expect.objectContaining({ id: 'a' }),
    ])
    expect(isGrabbed('a')).toBe(false)
  })

  it('Escape cancels and restores original order', () => {
    const items = ref([
      makeTask('a', 'Task A'),
      makeTask('b', 'Task B'),
      makeTask('c', 'Task C'),
    ])
    const onReorder = vi.fn()
    const { onGripKeydown, isGrabbed } = useSortableKeyboard({ items, onReorder })

    onGripKeydown('a', key('Space'))
    onGripKeydown('a', key('ArrowDown'))
    onGripKeydown('a', key('Escape')) // cancel

    expect(items.value[0].id).toBe('a')
    expect(items.value[1].id).toBe('b')
    expect(items.value[2].id).toBe('c')
    expect(onReorder).not.toHaveBeenCalled()
    expect(isGrabbed('a')).toBe(false)
  })

  it('does nothing when not grabbed', () => {
    const items = ref([makeTask('a', 'Task A'), makeTask('b', 'Task B')])
    const onReorder = vi.fn()
    const { onGripKeydown } = useSortableKeyboard({ items, onReorder })

    onGripKeydown('a', key('ArrowDown'))

    expect(items.value[0].id).toBe('a')
    expect(onReorder).not.toHaveBeenCalled()
  })

  it('announce says no positions available when list has one item', () => {
    const items = ref([makeTask('a', 'Task A')])
    const { onGripKeydown, announce } = useSortableKeyboard({
      items,
      onReorder: vi.fn(),
    })

    onGripKeydown('a', key('Space'))

    expect(announce.value.toLowerCase()).toContain('no hay')
  })
})
