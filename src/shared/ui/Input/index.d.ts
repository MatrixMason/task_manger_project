declare module '@/shared/ui/Input/BaseInput.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    modelValue: string | null
    label?: string
    placeholder?: string
    type?: string
    required?: boolean
    disabled?: boolean
  }>
  export default component
}
