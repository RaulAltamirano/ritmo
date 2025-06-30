<template>
  <div class="ai-chat-interface bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
    <!-- Header del chat -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot class="text-white" :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Asistente IA
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ isTyping ? 'Escribiendo...' : 'Disponible' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <BaseButton
            variant="ghost"
            size="sm"
            @click="clearChat"
            aria-label="Limpiar conversación"
          >
            <Trash2 :size="16" />
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            @click="toggleSuggestions"
            aria-label="Mostrar sugerencias"
          >
            <Lightbulb :size="16" />
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Mensajes del chat -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <!-- Mensaje de bienvenida -->
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot class="text-blue-600 dark:text-blue-400" :size="24" />
        </div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          ¡Hola! Soy tu asistente de horarios
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Puedo ayudarte a crear tareas, organizar tu tiempo y responder preguntas sobre tu horario.
        </p>
        
        <!-- Sugerencias rápidas -->
        <div class="grid grid-cols-1 gap-2 max-w-sm mx-auto">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion.id"
            @click="sendMessage(suggestion.text)"
            class="text-left p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
          >
            {{ suggestion.text }}
          </button>
        </div>
      </div>

      <!-- Mensajes -->
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div 
          :class="[
            'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl',
            message.role === 'user' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          ]"
        >
          <div class="flex items-start space-x-2">
            <div 
              v-if="message.role === 'assistant'"
              class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <Bot class="text-white" :size="12" />
            </div>
            
            <div class="flex-1">
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              
              <!-- Acciones para mensajes del asistente -->
              <div 
                v-if="message.role === 'assistant' && message.actions"
                class="mt-3 space-y-2"
              >
                <button
                  v-for="action in message.actions"
                  :key="action.id"
                  @click="handleAction(action)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    action.type === 'task' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  ]"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
          
          <div 
            :class="[
              'text-xs mt-2',
              message.role === 'user' 
                ? 'text-primary-100' 
                : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Indicador de escritura -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot class="text-white" :size="12" />
            </div>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de sugerencias -->
    <div 
      v-if="showSuggestions"
      class="border-t border-gray-200 dark:border-gray-700 p-4"
    >
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Sugerencias
      </h4>
      <div class="grid grid-cols-1 gap-2">
        <button
          v-for="suggestion in aiSuggestions"
          :key="suggestion.id"
          @click="sendMessage(suggestion.text)"
          class="text-left p-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
        >
          {{ suggestion.text }}
        </button>
      </div>
    </div>

    <!-- Input de mensaje -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <form @submit.prevent="sendMessage" class="flex items-end space-x-3">
        <div class="flex-1 relative">
          <textarea
            v-model="inputMessage"
            rows="1"
            placeholder="Escribe tu mensaje..."
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            @keydown.enter.prevent="handleEnterKey"
            @input="autoResize"
            ref="messageInput"
            aria-label="Mensaje"
          ></textarea>
          
          <!-- Botones de acción rápida -->
          <div class="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              @click="addQuickTask"
              class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center transition-colors"
              aria-label="Agregar tarea rápida"
            >
              <Plus :size="12" />
            </button>
            <button
              type="button"
              @click="addQuickNote"
              class="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center transition-colors"
              aria-label="Agregar nota"
            >
              <StickyNote :size="12" />
            </button>
          </div>
        </div>
        
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="!inputMessage.trim() || isTyping"
          aria-label="Enviar mensaje"
        >
          <Send :size="16" />
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { 
  Bot, 
  Send, 
  Trash2, 
  Lightbulb, 
  Plus, 
  StickyNote 
} from 'lucide-vue-next'
import type { ChatMessage } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'

interface AIChatInterfaceProps {
  scheduleId?: string
  initialContext?: string
}

const props = withDefaults(defineProps<AIChatInterfaceProps>(), {
  scheduleId: '',
  initialContext: ''
})

const emit = defineEmits<{
  'create-task': [taskData: any]
  'add-note': [note: string]
  'update-schedule': [scheduleData: any]
}>()

// Estado
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const showSuggestions = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

// Sugerencias rápidas
const quickSuggestions = [
  { id: 1, text: '¿Qué tareas tengo pendientes para hoy?' },
  { id: 2, text: 'Crea una tarea para revisar el proyecto' },
  { id: 3, text: '¿Cómo puedo optimizar mi horario?' },
  { id: 4, text: 'Muéstrame un resumen de la semana' }
]

const aiSuggestions = [
  { id: 1, text: 'Analiza mi productividad de esta semana' },
  { id: 2, text: 'Sugiere mejoras para mi horario' },
  { id: 3, text: 'Crea un plan de estudio para mañana' },
  { id: 4, text: '¿Cuánto tiempo he dedicado a cada proyecto?' }
]

// Métodos
const sendMessage = async (content?: string) => {
  const messageContent = content || inputMessage.value.trim()
  if (!messageContent) return

  // Agregar mensaje del usuario
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content: messageContent,
    role: 'user',
    timestamp: new Date(),
    scheduleId: props.scheduleId
  }
  
  messages.value.push(userMessage)
  inputMessage.value = ''
  autoResize()
  
  await nextTick()
  scrollToBottom()
  
  // Simular respuesta de IA
  await simulateAIResponse(messageContent)
}

const simulateAIResponse = async (userMessage: string) => {
  isTyping.value = true
  
  // Simular delay de escritura
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Generar respuesta basada en el mensaje
  const response = generateAIResponse(userMessage)
  
  const aiMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    content: response.content,
    role: 'assistant',
    timestamp: new Date(),
    scheduleId: props.scheduleId,
    actions: response.actions
  }
  
  messages.value.push(aiMessage)
  isTyping.value = false
  
  await nextTick()
  scrollToBottom()
}

const generateAIResponse = (userMessage: string) => {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('tarea') || lowerMessage.includes('crea')) {
    return {
      content: 'Perfecto, puedo ayudarte a crear una tarea. ¿Qué tipo de tarea necesitas?',
      actions: [
        { id: 1, type: 'task', label: 'Crear tarea de trabajo' },
        { id: 2, type: 'task', label: 'Crear tarea de estudio' },
        { id: 3, type: 'task', label: 'Crear tarea personal' }
      ]
    }
  }
  
  if (lowerMessage.includes('horario') || lowerMessage.includes('optimizar')) {
    return {
      content: 'Basándome en tu horario actual, te sugiero algunas optimizaciones:\n\n• Agrupa tareas similares\n• Reserva tiempo para descansos\n• Prioriza las tareas más importantes',
      actions: [
        { id: 1, type: 'schedule', label: 'Aplicar optimizaciones' },
        { id: 2, type: 'schedule', label: 'Ver análisis detallado' }
      ]
    }
  }
  
  if (lowerMessage.includes('pendiente') || lowerMessage.includes('hoy')) {
    return {
      content: 'Para hoy tienes 3 tareas pendientes:\n\n1. Revisar documentación del proyecto\n2. Preparar presentación\n3. Reunión con el equipo\n\n¿Te gustaría que te ayude a organizarlas?',
      actions: [
        { id: 1, type: 'task', label: 'Ver todas las tareas' },
        { id: 2, type: 'schedule', label: 'Reorganizar horario' }
      ]
    }
  }
  
  return {
    content: 'Entiendo tu consulta. ¿En qué puedo ayudarte específicamente con tu horario o tareas?',
    actions: [
      { id: 1, type: 'task', label: 'Crear nueva tarea' },
      { id: 2, type: 'schedule', label: 'Ver horario' }
    ]
  }
}

const handleAction = (action: any) => {
  switch (action.type) {
    case 'task':
      emit('create-task', { type: action.label.toLowerCase() })
      break
    case 'schedule':
      emit('update-schedule', { action: action.label.toLowerCase() })
      break
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    // Permitir nueva línea con Shift+Enter
    return
  }
  sendMessage()
}

const autoResize = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = `${messageInput.value.scrollHeight}px`
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const clearChat = () => {
  messages.value = []
}

const toggleSuggestions = () => {
  showSuggestions.value = !showSuggestions.value
}

const addQuickTask = () => {
  emit('create-task', { type: 'quick' })
}

const addQuickNote = () => {
  emit('add-note', 'Nota rápida')
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleScroll = () => {
  // Implementar lógica de scroll si es necesario
}

// Watch para inicializar con contexto
watch(() => props.initialContext, (context) => {
  if (context && messages.value.length === 0) {
    // Agregar mensaje de contexto inicial
    const contextMessage: ChatMessage = {
      id: 'context',
      content: context,
      role: 'assistant',
      timestamp: new Date(),
      scheduleId: props.scheduleId
    }
    messages.value.push(contextMessage)
  }
}, { immediate: true })
</script>

<style scoped>
.ai-chat-interface {
  min-height: 500px;
}

/* Animaciones personalizadas */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .ai-chat-interface {
    min-height: 400px;
  }
}
</style> 