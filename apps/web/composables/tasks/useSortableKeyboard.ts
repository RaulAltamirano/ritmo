import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Task } from '@/types/task'

interface Options {
  items: Ref<Task[]>
  onReorder: (items: Task[]) => void
}

export function useSortableKeyboard({ items, onReorder }: Options) {
  const grabbedId = ref<string | null>(null)
  const snapshots = ref<Task[]>([])
  const announce = ref('')

  const isGrabbed = (id: string) => grabbedId.value === id

  const grab = (id: string) => {
    grabbedId.value = id
    snapshots.value = [...items.value]

    if (items.value.length <= 1) {
      announce.value = 'Task grabbed. No other positions available.'
      return
    }

    const idx = items.value.findIndex(t => t.id === id)
    announce.value = `Task grabbed. Position ${idx + 1} of ${items.value.length}. Use arrow keys to move, Enter to confirm, Escape to cancel.`
  }

  const move = (id: string, direction: 1 | -1) => {
    if (grabbedId.value !== id) return

    const list = [...items.value]
    const idx = list.findIndex(t => t.id === id)
    const next = idx + direction

    if (next < 0 || next >= list.length) return
    ;[list[idx], list[next]] = [list[next], list[idx]]
    items.value = list
    announce.value = `${list[next].name} moved to position ${next + 1} of ${list.length}.`
  }

  const confirm = (id: string) => {
    if (grabbedId.value !== id) return
    onReorder([...items.value])
    grabbedId.value = null
    announce.value = 'Order saved.'
  }

  const cancel = (id: string) => {
    if (grabbedId.value !== id) return
    items.value = [...snapshots.value]
    grabbedId.value = null
    announce.value = 'Reorder cancelled.'
  }

  const onGripKeydown = (id: string, event: KeyboardEvent) => {
    switch (event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault()
        if (grabbedId.value === id) {
          confirm(id)
        } else {
          grab(id)
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        move(id, 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        move(id, -1)
        break
      case 'Escape':
        cancel(id)
        break
    }
  }

  return { onGripKeydown, isGrabbed, grabbedId, announce }
}
