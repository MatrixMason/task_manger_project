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
  background: $background-secondary;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;

  &--hover {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }
}
</style>
