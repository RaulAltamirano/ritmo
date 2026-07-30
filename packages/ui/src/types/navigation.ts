import type { Component } from 'vue'

// Types for navigation components
export interface NavItem {
  path: string
  label: string
  icon: any
  description?: string
}

export interface BottomNavItem {
  key: string
  label: string
  icon: Component
  path?: string
  isMore?: boolean
  isPrincipal?: boolean
}

export interface BaseNavbarProps {
  ariaLabel?: string
}

export interface BaseBottomNavProps {
  items: BottomNavItem[]
  activeKey?: string
  moreExpanded?: boolean
  moreControlsId?: string
  ariaLabel?: string
}

export interface BaseBottomSheetProps {
  open: boolean
  title?: string
  id?: string
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  closeLabel?: string
}

export interface BaseNavItemProps {
  path: string
  label: string
  icon: any
  isActive?: boolean
}

export interface BaseNavDropdownProps {
  label: string
  icon: any
  isOpen: boolean
  ariaLabel?: string
}
