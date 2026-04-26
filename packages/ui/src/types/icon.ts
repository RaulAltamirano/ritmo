import type { Component } from 'vue'

/** Props públicas de iconos; alinear con `BaseIcon` cuando se estabilice la API */
export interface IconProps {
  icon?: Component
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: string
  ariaHidden?: boolean
  ariaLabel?: string
  role?: string
}
