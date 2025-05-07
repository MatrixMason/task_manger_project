<script setup lang="ts">
type OptionValue = string | number | null | undefined

interface GenericOption {
  value: OptionValue
  label: string
  [key: string]: OptionValue | string
}

const props = defineProps<{
  modelValue: OptionValue
  options: GenericOption[]
  label?: string
  name?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  optionLabel?: string
  optionValue?: string
  clearable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: OptionValue]
}>()

function getValue(option: GenericOption): OptionValue {
  if (props.optionValue) {
    const value = option[props.optionValue] as string | number | null
    return value === '' ? null : value
  }
  return option.value
}

function getLabel(option: GenericOption): string {
  if (props.optionLabel) {
    return String(option[props.optionLabel])
  }
  return option.label
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', value === '' ? null : value)
}
</script>

<template>
  <div class="base-select">
    <label v-if="label" class="base-select__label" :for="name">{{ label }}</label>
    <select
      :id="name"
      :name="name"
      :value="modelValue ?? ''"
      class="base-select__input"
      :disabled="disabled"
      @change="handleChange"
    >
      <option v-if="placeholder || clearable" value="">
        {{ placeholder || 'Выберите значение' }}
      </option>
      <option
        v-for="option in options"
        :key="String(getValue(option))"
        :value="getValue(option) === null ? '' : getValue(option)"
      >
        {{ getLabel(option) }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.base-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
  }

  &__input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: v.$border-radius-sm;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-family: inherit;
    color: var(--text-color);
    background-color: #f8fafc;
    transition: all 0.2s ease;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    padding-right: 32px;
    height: 36px;

    &::placeholder {
      color: var(--text-secondary);
      font-family: inherit;
    }

    &:hover {
      border-color: var(--primary-color-light);
      background-color: #f1f5f9;
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-light);
      background-color: #fff;
    }

    &:disabled {
      background-color: var(--background-color-light);
      cursor: not-allowed;
      opacity: 0.7;
    }

    option {
      padding: 8px 12px;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-family: inherit;
    }
  }
}
</style>
