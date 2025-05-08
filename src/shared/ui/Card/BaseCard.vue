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
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: $spacing-md;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  
  .dark & {
    background: rgb(30, 33, 43);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &--hover {
    &:hover {
      transform: translateY(-2px);
      border-color: var(--color-primary);
      
      .dark & {
        border-color: var(--color-primary);
      }
    }
  }
}
</style>
