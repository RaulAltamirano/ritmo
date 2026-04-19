// Input component type definitions

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'

export interface InputProps {
  modelValue: string
  label?: string
  type?: InputType
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  ariaLabel?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  autocomplete?: string
  name?: string
  id?: string
}

export interface InputEmits {
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
  clear: []
  validation: [isValid: boolean, errors: string[]]
}
