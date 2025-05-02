<script setup lang="ts">
defineOptions({
  name: 'BaseButton',
})

defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    class="button"
    :class="[
      variant && `button--${variant}`,
      size && `button--${size}`,
      { 'button--block': block },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: v.$border-radius-md;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  gap: v.$spacing-xs;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--sm {
    padding: v.$spacing-xs v.$spacing-sm;
    font-size: 0.875rem;
  }

  &--md {
    padding: v.$spacing-sm v.$spacing-md;
    font-size: 1rem;
  }

  &--lg {
    padding: v.$spacing-md v.$spacing-lg;
    font-size: 1.125rem;
  }

  &--primary {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 2px solid var(--primary-color);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: white;
      color: var(--primary-color);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &--secondary {
    background: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      background: var(--background-color-hover);
      border-color: var(--border-color-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }

  &--danger {
    background: var(--error-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--error-color-hover);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &--block {
    width: 100%;
    display: flex;
  }
}
</style>
