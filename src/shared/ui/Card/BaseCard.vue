<script setup lang="ts">
defineOptions({
  name: 'BaseCard',
})

defineProps<{
  variant?: 'default' | 'hover'
}>()
</script>

<template>
  <div :class="['card', `card--${variant || 'default'}`]">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as *;

.card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: $spacing-md;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &--hover {
    &:hover {
      transform: translateY(-2px);
      border-color: var(--color-primary);
      box-shadow: var(--shadow-md);
    }
  }
}
</style>
