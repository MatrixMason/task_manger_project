<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="base-textarea">
    <label v-if="label" class="base-textarea__label">{{ label }}</label>
    <textarea
      :value="modelValue"
      class="base-textarea__field"
      v-bind="$attrs"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="($event) => emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.base-textarea {
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
    min-height: 100px;
    resize: vertical;
    line-height: 1.5;

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
  }
}
.base-textarea {
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
    min-height: 100px;
    resize: vertical;

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
