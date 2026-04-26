export interface DarkModeToggleProps {
  /** Si true, estado vía `v-model` / `modelValue`; no escribe `localStorage`. */
  controlled?: boolean
  modelValue?: boolean
}
