import { defineNuxtPlugin } from '#app'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

export default defineNuxtPlugin((nuxtApp) => {
  // Registrar FullCalendar como componente global
  nuxtApp.vueApp.component('FullCalendar', FullCalendar)
  
  // Configurar plugins de FullCalendar
  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]
  
  // Hacer plugins disponibles globalmente si es necesario
  nuxtApp.provide('fullcalendarPlugins', plugins)
}) 