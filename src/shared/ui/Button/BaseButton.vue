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
@import '@/app/styles/variables';

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  gap: $spacing-xs;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--sm {
    padding: $spacing-xs $spacing-sm;
    font-size: 0.875rem;
  }

  &--md {
    padding: $spacing-sm $spacing-md;
    font-size: 1rem;
  }

  &--lg {
    padding: $spacing-md $spacing-lg;
    font-size: 1.125rem;
  }

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--primary-color-hover);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &--secondary {
    background: var(--secondary-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--secondary-color-hover);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
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
