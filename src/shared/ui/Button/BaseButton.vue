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
  padding: v.$spacing-sm v.$spacing-md;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  box-shadow: var(--shadow-sm);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  // Варианты
  &--primary {
    background: var(--color-primary);
    color: var(--text-on-primary);

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }
  }

  &--secondary {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);

    &:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--color-primary);
      color: var(--color-primary);
      box-shadow: var(--shadow-md);
    }
  }

  &--text {
    background: transparent;
    color: var(--text-primary);
    padding: v.$spacing-xs;
    box-shadow: none;

    &:hover:not(:disabled) {
      color: var(--color-primary);
      background: var(--hover-overlay);
    }

    &:active:not(:disabled) {
      background: var(--active-overlay);
      transform: none;
    }
  }

  &--danger {
    background: var(--color-error);
    color: var(--text-on-primary);
    border-color: transparent;

    &:hover:not(:disabled) {
      background: var(--color-error-hover);
      box-shadow: var(--shadow-md);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
      box-shadow: var(--shadow-sm);
    }
  }

  // Размеры
  &--sm {
    font-size: 0.875rem;
    padding: v.$spacing-xs v.$spacing-sm;
  }

  &--md {
    font-size: 1rem;
  }

  &--lg {
    font-size: 1.125rem;
    padding: v.$spacing-md v.$spacing-lg;
  }

  &--block {
    width: 100%;
    display: flex;
  }
}
</style>
