export interface ModalProps {
  isOpen: boolean
  title?: string
  showCloseButton?: boolean
  closeButtonLabel?: string
  closeButtonStyle?: 'minimal' | 'subtle' | 'floating'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  backdrop?: 'blur' | 'dark' | 'light' | 'none'
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  preventScroll?: boolean
  returnFocusOnClose?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
}

export type ModalEmits = {
  'update:isOpen': [value: boolean]
  close: []
  open: []
}
