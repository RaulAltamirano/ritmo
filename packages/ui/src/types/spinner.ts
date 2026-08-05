/** Props de spinners de carga; extender desde el componente cuando haga falta */
export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'circular' | 'dots' | string
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'white'
    | 'auto'
    | 'current'
  ariaLabel?: string
}
