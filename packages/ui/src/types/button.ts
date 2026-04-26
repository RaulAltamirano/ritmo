// Button component type definitions
// Updated to use the new unified variant system

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'outline'
  | 'minimal'
  | 'info'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  icon?: any
  iconRight?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
  pressed?: boolean
  expanded?: boolean
  onClick?: (event: MouseEvent) => void
}

export interface ButtonEmits {
  click: [event: MouseEvent | KeyboardEvent]
  arrowRight: [event: KeyboardEvent]
  arrowLeft: [event: KeyboardEvent]
  pointerDown: [event: PointerEvent]
  pointerUp: [event: PointerEvent]
}
