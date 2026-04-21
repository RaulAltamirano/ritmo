import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TaskCard from '../../../../../apps/web/components/molecules/TaskCard.vue'

/** Tarea mínima válida según `apps/web/types/task`. */
function makeTask(partial: Record<string, unknown> = {}) {
  return {
    id: 'task-demo',
    name: 'Nombre interno',
    createdAt: new Date('2026-01-01T12:00:00Z'),
    ...partial,
  }
}

const meta: Meta<typeof TaskCard> = {
  title: 'Apps Web/Molecules/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tarjeta de tarea usada en Today y tableros: prioridad (barra lateral), temporizador, tiempo acumulado y acciones (iniciar/pausar, completar, eliminar). La zona central abre edición (`open-edit`); botones detienen propagación. Rutas de importación relativas permiten documentarla aquí sin duplicar el componente.',
      },
    },
  },
  decorators: [
    story => ({
      components: { story },
      template:
        '<div class="max-w-md min-w-[280px] bg-gray-50 dark:bg-gray-950 p-4 rounded-xl"><story /></div>',
    }),
  ],
  argTypes: {
    showDragHandle: {
      control: 'boolean',
      description: 'Muestra el grip para arrastre (listas reordenables).',
    },
    isDragging: {
      control: 'boolean',
      description: 'Estilo durante drag (sin hover lift).',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Pendiente: Story = {
  name: 'Pendiente',
  args: {
    task: makeTask({
      title: 'Revisar métricas del sprint',
      duration: '25 min',
      priority: 'media',
      totalTimeSpent: 1800,
    }),
    showDragHandle: false,
    isDragging: false,
  },
}

export const EnEjecucion: Story = {
  name: 'En ejecución',
  args: {
    task: makeTask({
      title: 'Deep work bloque mañana',
      duration: '50 min',
      priority: 'alta',
      isRunning: true,
      timeRemaining: 1847,
      totalTimeSpent: 600,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Temporizador visible; acento azul y estado activo.',
      },
    },
  },
}

export const Completada: Story = {
  name: 'Completada',
  args: {
    task: makeTask({
      title: 'Enviar informe',
      completed: true,
      priority: 'baja',
    }),
  },
}

export const ConArrastre: Story = {
  name: 'Con asa de arrastre',
  args: {
    task: makeTask({
      title: 'Ordenar backlog',
      priority: 'alta',
    }),
    showDragHandle: true,
  },
}

export const Arrastrando: Story = {
  name: 'Durante arrastre',
  args: {
    task: makeTask({
      title: 'Arrastrando…',
      priority: 'media',
    }),
    isDragging: true,
    showDragHandle: true,
  },
}

export const TituloLargo: Story = {
  name: 'Título muy largo',
  args: {
    task: makeTask({
      title:
        'Este es un título deliberadamente largo para validar ellipsis y que la tarjeta no rompa el layout en contenedores estrechos ni en modo oscuro',
      duration: '15 min',
      priority: 'media',
    }),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
}

export const SinTitulo: Story = {
  name: 'Sin título (vacío)',
  args: {
    task: makeTask({
      name: '   ',
      title: '',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Debe mostrar “Sin título” y un `aria-label` coherente en la zona editable.',
      },
    },
  },
}

export const TiemposExtremos: Story = {
  name: 'Tiempos extremos / NaN',
  args: {
    task: makeTask({
      title: 'Robustez de formato',
      isRunning: true,
      timeRemaining: Number.NaN,
      totalTimeSpent: Number.NEGATIVE_INFINITY,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Valores no finitos deben degradar a 00:00 y 0m sin romper el render.',
      },
    },
  },
}
