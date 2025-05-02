declare module '@/shared/ui/Select/BaseSelect.vue' {
  import { DefineComponent } from 'vue'

  interface GenericOption {
    [key: string]: string | number | boolean | undefined
  }

  const component: DefineComponent<{
    modelValue: string | number | null
    options: GenericOption[]
    label?: string
    name?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    optionLabel?: string
    optionValue?: string
    clearable?: boolean
  }>
  export default component
}
