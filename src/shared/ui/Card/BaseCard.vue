<script setup lang="ts">
defineOptions({
  name: 'BaseCard'
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
@import '@/app/styles/variables';

.card {
  background: var(--background-secondary);
  border-radius: $border-radius-md;
  padding: $spacing-md;
  box-shadow: var(--shadow-sm);

  &--hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }
}
</style>
