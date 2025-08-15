export default defineNuxtPlugin(() => {
  const { showModal } = useDaySummaryModal()

  // Escuchar el evento para mostrar el modal
  if (process.client) {
    window.addEventListener('show-day-summary', (event: any) => {
      showModal()
    })
  }
}) 