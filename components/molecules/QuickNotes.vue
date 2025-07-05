<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
          <StickyNote class="text-yellow-600 dark:text-yellow-400" :size="16" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Notas Rápidas</h3>
      </div>
      <BaseButton
        variant="ghost"
        size="sm"
        @click="showAddNote = true"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Plus :size="16" />
      </BaseButton>
    </div>

    <!-- Lista de notas -->
    <div class="space-y-3">
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ note.title }}
              </h4>
              <span 
                v-if="note.priority === 'high'"
                class="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"
              >
                Importante
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ note.content }}
            </p>
            <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(note.createdAt) }}</span>
              <span v-if="note.category">{{ note.category }}</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="editNote(note)"
              class="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label="Editar nota"
            >
              <Edit3 :size="12" />
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="deleteNote(note.id)"
              class="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Eliminar nota"
            >
              <Trash2 :size="12" />
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="improveNote(note)"
              class="text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
              aria-label="Mejorar nota con IA"
            >
              <span class="material-icons" style="font-size:12px">auto_fix_high</span>
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="noteToTasks(note)"
              class="text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              aria-label="Convertir nota en tareas"
            >
              <span class="material-icons" style="font-size:12px">task_alt</span>
            </BaseButton>
          </div>
        </div>
      </div>
      
      <!-- Estado vacío -->
      <div 
        v-if="notes.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <StickyNote class="mx-auto mb-3 text-gray-300 dark:text-gray-600" :size="32" />
        <p class="text-sm font-medium">No hay notas</p>
        <p class="text-xs mt-1">Agrega notas rápidas para recordar ideas importantes</p>
      </div>
    </div>

    <!-- Modal para agregar/editar nota -->
    <div 
      v-if="showAddNote || editingNote"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="closeModal"
      role="dialog"
      aria-modal="true"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
        @click.stop
        role="document"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ editingNote ? 'Editar Nota' : 'Nueva Nota' }}
        </h3>
        
        <form @submit.prevent="saveNote" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              v-model="noteForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Título de la nota"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenido
            </label>
            <textarea
              v-model="noteForm.content"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Escribe tu nota aquí..."
              required
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                v-model="noteForm.category"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sin categoría</option>
                <option value="Estudio">Estudio</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Personal">Personal</option>
                <option value="Ideas">Ideas</option>
                <option value="Recordatorio">Recordatorio</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                v-model="noteForm.priority"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="high">Importante</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <BaseButton
              type="button"
              variant="ghost"
              @click="closeModal"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
            >
              {{ editingNote ? 'Actualizar' : 'Guardar' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de mejora IA -->
    <div v-if="showImprovedModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click="showImprovedModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Nota Mejorada</h3>
        <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{{ improvedContent }}</p>
        <div class="flex justify-end pt-4">
          <BaseButton variant="primary" @click="showImprovedModal = false">Cerrar</BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal de tareas generadas -->
    <div v-if="showTasksModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click="showTasksModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Tareas sugeridas</h3>
        <ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-200">
          <li v-for="task in generatedTasks" :key="task">{{ task }}</li>
        </ul>
        <div class="flex justify-end pt-4">
          <BaseButton variant="primary" @click="showTasksModal = false">Cerrar</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StickyNote, Plus, Edit3, Trash2 } from 'lucide-vue-next'
import { ref, reactive } from 'vue'
import BaseButton from '@components/atoms/BaseButton.vue'

interface Note {
  id: string
  title: string
  content: string
  category?: string
  priority: 'normal' | 'high'
  createdAt: Date
}

interface QuickNotesProps {
  initialNotes?: Note[]
}

const props = withDefaults(defineProps<QuickNotesProps>(), {
  initialNotes: () => []
})

const emit = defineEmits<{
  'update-notes': [notes: Note[]],
  'improve-note': [note: Note],
  'note-to-tasks': [note: Note]
}>()

const notes = ref<Note[]>(props.initialNotes)
const showAddNote = ref(false)
const editingNote = ref<Note | null>(null)

// Variables para IA y tareas sugeridas
const showImprovedModal = ref(false)
const improvedContent = ref('')
const showTasksModal = ref(false)
const generatedTasks = ref<string[]>([])

const noteForm = reactive({
  title: '',
  content: '',
  category: '',
  priority: 'normal' as 'normal' | 'high'
})

// Métodos
const saveNote = () => {
  if (editingNote.value) {
    // Actualizar nota existente
    const index = notes.value.findIndex(note => note.id === editingNote.value!.id)
    if (index !== -1) {
      notes.value[index] = {
        ...editingNote.value,
        title: noteForm.title,
        content: noteForm.content,
        category: noteForm.category || undefined,
        priority: noteForm.priority
      }
    }
  } else {
    // Crear nueva nota
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteForm.title,
      content: noteForm.content,
      category: noteForm.category || undefined,
      priority: noteForm.priority,
      createdAt: new Date()
    }
    notes.value.unshift(newNote)
  }
  
  emit('update-notes', notes.value)
  closeModal()
}

const editNote = (note: Note) => {
  editingNote.value = note
  noteForm.title = note.title
  noteForm.content = note.content
  noteForm.category = note.category || ''
  noteForm.priority = note.priority
}

const deleteNote = (noteId: string) => {
  const index = notes.value.findIndex(note => note.id === noteId)
  if (index !== -1) {
    notes.value.splice(index, 1)
    emit('update-notes', notes.value)
  }
}

const closeModal = () => {
  showAddNote.value = false
  editingNote.value = null
  // Reset form
  noteForm.title = ''
  noteForm.content = ''
  noteForm.category = ''
  noteForm.priority = 'normal'
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'hoy'
  if (diffDays === 2) return 'ayer'
  if (diffDays <= 7) return `hace ${diffDays - 1} días`
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}

// --- IA y tareas sugeridas ---
const improveNote = (note: Note) => {
  // Simulación de mejora con IA
  improvedContent.value = `Mejora IA: ${note.content}\n\n(Ejemplo: resumen, aclaración, reescritura, etc.)`
  showImprovedModal.value = true
  emit('improve-note', note)
}

const noteToTasks = (note: Note) => {
  // Simulación de conversión a tareas
  generatedTasks.value = [
    `Tarea sugerida 1 basada en: ${note.title}`,
    `Tarea sugerida 2 basada en: ${note.content.substring(0, 20)}...`
  ]
  showTasksModal.value = true
  emit('note-to-tasks', note)
}
</script>

<style scoped>
/* Transiciones suaves */
.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}

.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style> 