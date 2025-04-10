<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  block?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    class="btn"
    :class="[variant && `btn--${variant}`, { 'btn--block': block }]"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.btn {
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: filter 0.2s;

  &--block {
    width: 100%;
    display: block;
  }

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }

  &--secondary {
    background: var(--secondary-color);
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }

  &--danger {
    background: var(--error-color);
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
