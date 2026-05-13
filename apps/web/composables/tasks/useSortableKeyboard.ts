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
      announce.value = 'Tarea agarrada. No hay otras posiciones disponibles.'
      return
    }

    const idx = items.value.findIndex(t => t.id === id)
    announce.value = `Tarea agarrada. Posición ${idx + 1} de ${items.value.length}. Usa las flechas para mover, Enter para confirmar, Escape para cancelar.`
  }

  const move = (id: string, direction: 1 | -1) => {
    if (grabbedId.value !== id) return

    const list = [...items.value]
    const idx = list.findIndex(t => t.id === id)
    const next = idx + direction

    if (next < 0 || next >= list.length) return
    ;[list[idx], list[next]] = [list[next], list[idx]]
    items.value = list
    announce.value = `${list[next].name} movida a la posición ${next + 1} de ${list.length}.`
  }

  const confirm = (id: string) => {
    if (grabbedId.value !== id) return
    onReorder([...items.value])
    grabbedId.value = null
    announce.value = 'Orden guardado.'
  }

  const cancel = (id: string) => {
    if (grabbedId.value !== id) return
    items.value = [...snapshots.value]
    grabbedId.value = null
    announce.value = 'Reordenamiento cancelado.'
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
