<script setup lang="ts">
defineProps<{
  modelValue: string | null
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">{{ label }}</label>
    <input
      :value="modelValue"
      class="base-input__field"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="($event) => emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
  }

  &__field {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: v.$border-radius-sm;
    font-size: 1rem;
    font-family: inherit;
    color: var(--text-color);
    background-color: #f8fafc;
    transition: all 0.2s ease;
    height: 42px;

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

    &[type='datetime-local'] {
      height: 42px;
      font-family: inherit;

      &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        padding: 0.25rem;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
  }

  &__field {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    color: var(--text-color);
    background-color: var(--background-color);
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--primary-color-light);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-color-light);
    }

    &:disabled {
      background-color: var(--background-color-light);
      cursor: not-allowed;
    }
  }
}
</style>
