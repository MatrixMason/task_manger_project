declare module '@/shared/ui/Textarea/BaseTextarea.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    modelValue: string
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
  }>
  export default component
}
