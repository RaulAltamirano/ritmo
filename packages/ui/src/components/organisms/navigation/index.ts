// organisms/navigation - Complete navigation systems and menus
// This file exports all navigation-related organism components

// Component exports
export { default as BaseNavDropdown } from './BaseNavDropdown.vue'
export { default as BaseNavItem } from './BaseNavItem.vue'
export { default as BaseNavbar } from './BaseNavbar.vue'

// Re-export types
export type {
  BaseNavDropdownProps,
  BaseNavItemProps,
  BaseNavbarProps,
  NavItem,
} from '@/types/navigation'

// Re-export composables
// TODO: Implement missing composables
// export { useMobileMenu } from '@/composables/useMobileMenu'
// export { useNavigation } from '@/composables/useNavigation'
// export { useSidebar } from '@/composables/useSidebar'
