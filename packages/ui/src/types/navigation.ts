// Types for navigation components
export interface NavItem {
  path: string
  label: string
  icon: any
  description?: string
}

export interface BaseNavbarProps {
  ariaLabel?: string
  showMobileMenu?: boolean
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
