import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Dumbbell,
  Menu,
} from 'lucide-vue-next'
import { markRaw, type Component } from 'vue'
import { ROUTES } from './routes'

export interface AppNavDestination {
  key: string
  path: string
  label: string
  icon: Component
}

export interface AppBottomTab {
  key: string
  label: string
  icon: Component
  path?: string
  isMore?: boolean
  isPrincipal?: boolean
}

/** Primary bottom tabs (≤5 including More). Today is center / principal. */
export const PRIMARY_BOTTOM_TABS: AppBottomTab[] = [
  {
    key: 'schedule',
    label: 'Schedule',
    icon: markRaw(Clock),
    path: ROUTES.SCHEDULE,
  },
  {
    key: 'training',
    label: 'Training',
    icon: markRaw(Dumbbell),
    path: ROUTES.TRAINING,
  },
  {
    key: 'today',
    label: 'Today',
    icon: markRaw(Calendar),
    path: ROUTES.TODAY,
    isPrincipal: true,
  },
  {
    key: 'plans',
    label: 'Plans',
    icon: markRaw(Compass),
    path: ROUTES.PROJECTS,
  },
  {
    key: 'more',
    label: 'More',
    icon: markRaw(Menu),
    isMore: true,
  },
]

/** Destinations only reachable via More sheet. */
export const MORE_NAV_ITEMS: AppNavDestination[] = [
  {
    key: 'journal',
    path: ROUTES.JOURNAL,
    label: 'Journal',
    icon: markRaw(BookOpen),
  },
  {
    key: 'analytics',
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: markRaw(BarChart3),
  },
]

export const MORE_SHEET_ID = 'ritmo-more-sheet'

export function resolveBottomActiveKey(path: string): string {
  const primary = PRIMARY_BOTTOM_TABS.find(tab => tab.path && path === tab.path)
  if (primary) return primary.key

  const more = MORE_NAV_ITEMS.find(item => path === item.path)
  if (more) return 'more'

  return ''
}
