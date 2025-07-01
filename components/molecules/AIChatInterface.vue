<template>
  <div class="ai-chat-interface bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-soft">
    <!-- Header minimalista -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center space-x-3">
        <img src="/logo-ritmo.svg" alt="Ritmo" class="w-8 h-8 rounded-full shadow" />
        <div>
          <span class="font-bold text-lg text-primary-700 dark:text-primary-400">Ritmo Asistente</span>
          <div class="text-xs text-gray-400 dark:text-gray-500 font-medium leading-tight">Milo</div>
        </div>
      </div>
      <button @click="toggleMenu" class="icon-btn text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
        <MoreVertical :size="22" />
      </button>
      <transition name="fade">
        <div v-if="showMenu" class="absolute right-4 top-16 z-20 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
          <button @click="clearChat" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Limpiar conversación</button>
          <button @click="toggleSuggestions" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Sugerencias IA</button>
        </div>
      </transition>
    </div>

    <!-- Mensajes del chat -->
    <transition-group name="chat-fade" tag="div" ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Mensaje de bienvenida -->
      <div v-if="messages.length === 0" key="welcome" class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot class="text-primary-600 dark:text-primary-400" :size="28" />
        </div>
        <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">¡Hola! Soy tu asistente Ritmo</h4>
        <p class="text-base text-gray-500 dark:text-gray-400 mb-6">Te ayudo a organizar tu tiempo, crear tareas y optimizar tu día.</p>
        <div class="flex flex-col gap-2 max-w-xs mx-auto">
          <button v-for="suggestion in quickSuggestions.slice(0,3)" :key="suggestion.id" @click="sendMessage(suggestion.text)" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
            <Lightbulb :size="16" class="text-primary-400" />
            {{ suggestion.text }}
          </button>
        </div>
      </div>

      <!-- Mensajes -->
      <div v-for="message in messages" :key="message.id" :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
        <transition name="bubble-fade">
          <div :class="bubbleClass(message)">
            <div class="flex items-start space-x-2">
              <div v-if="message.role === 'assistant'" class="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot class="text-white" :size="12" />
              </div>
              <div class="flex-1">
                <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                <div v-if="message.role === 'assistant' && message.actions" class="mt-3 space-y-2">
                  <button v-for="action in message.actions" :key="action.id" @click="handleAction(action)" class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40">
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
            <div :class="['text-xs mt-2', message.role === 'user' ? 'text-primary-300 dark:text-primary-200' : 'text-gray-500 dark:text-gray-400']">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </transition>
      </div>

      <!-- Indicador de escritura -->
      <transition name="fade">
        <div v-if="isTyping" key="typing" class="flex justify-start">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Bot class="text-white" :size="12" />
              </div>
              <div class="flex space-x-1">
                <span v-for="n in 3" :key="n" class="dot"></span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </transition-group>

    <!-- Sugerencias IA -->
    <transition name="slide-fade">
      <div v-if="showSuggestions" class="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/60">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Sugerencias IA</h4>
        <div class="flex flex-col gap-2">
          <button v-for="suggestion in aiSuggestions.slice(0,3)" :key="suggestion.id" @click="sendMessage(suggestion.text)" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
            <Lightbulb :size="14" class="text-primary-400" />
            {{ suggestion.text }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Input de mensaje -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-800">
      <form @submit.prevent="sendMessage" class="flex items-end gap-3">
        <div class="flex-1 relative">
          <textarea
            v-model="inputMessage"
            rows="1"
            placeholder="Escribe tu mensaje..."
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-[44px]"
            @keydown.enter.prevent="handleEnterKey"
            @input="autoResize"
            ref="messageInput"
            aria-label="Mensaje"
          ></textarea>
        </div>
        <button type="submit" :disabled="!inputMessage.trim() || isTyping" class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500">
          <Send :size="20" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Bot, Send, Lightbulb, MoreVertical } from 'lucide-vue-next'
import type { ChatMessage } from '~/types/calendar'

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

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const showSuggestions = ref(false)
const showMenu = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

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

const sendMessage = async (content?: string) => {
  const messageContent = content || inputMessage.value.trim()
  if (!messageContent) return
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
  await simulateAIResponse(messageContent)
}

const simulateAIResponse = async (userMessage: string) => {
  isTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
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
  if (event.shiftKey) return
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
  showMenu.value = false
}

const toggleSuggestions = () => {
  showSuggestions.value = !showSuggestions.value
  showMenu.value = false
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const bubbleClass = (message: ChatMessage) => {
  return [
    'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200',
    message.role === 'user'
      ? 'bg-primary-600 text-white ml-auto'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-auto'
  ]
}

watch(() => props.initialContext, (context) => {
  if (context && messages.value.length === 0) {
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
  min-height: 480px;
  position: relative;
}

/* Animaciones de burbujas y fade */
.chat-fade-enter-active, .chat-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
}
.chat-fade-enter-from, .chat-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.bubble-fade-enter-active, .bubble-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}
.bubble-fade-enter-from, .bubble-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Indicador de escritura (tres puntos) */
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin: 0 2px;
  background: #a3a3a3;
  border-radius: 50%;
  animation: dot-bounce 1.2s infinite both;
}
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* Scrollbar minimalista */
.flex-1::-webkit-scrollbar {
  width: 6px;
}
.flex-1::-webkit-scrollbar-thumb {
  background: rgba(156,163,175,0.3);
  border-radius: 3px;
}
.flex-1::-webkit-scrollbar-thumb:hover {
  background: rgba(156,163,175,0.5);
}

@media (max-width: 768px) {
  .ai-chat-interface {
    min-height: 380px;
  }
}
</style> 