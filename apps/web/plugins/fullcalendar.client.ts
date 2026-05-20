import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'

export default defineNuxtPlugin((nuxtApp: any) => {
  // Registrar FullCalendar como componente global
  nuxtApp.vueApp.component('FullCalendar', FullCalendar)

  // Hacer plugins disponibles globalmente
  nuxtApp.provide('fullcalendarPlugins', [dayGridPlugin, timeGridPlugin, listPlugin])

  // Configuración por defecto - se aplicará a cada instancia del componente
  nuxtApp.provide('fullcalendarDefaultOptions', {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    locale: 'es',
    timeZone: 'local',
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    nowIndicator: true,
  })
})
