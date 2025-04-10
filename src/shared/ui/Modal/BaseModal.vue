<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

defineOptions({
  name: 'BaseModal'
})
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal__header">
        <h2>{{ title }}</h2>
        <button class="modal__close" @click="$emit('close')">&times;</button>
      </header>
      <div class="modal__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
}

.modal {
  background: white;
  border-radius: $border-radius-md;
  width: 100%;
  max-width: 500px;
  box-shadow: $shadow-lg;

  &__header {
    padding: $spacing-md;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__content {
    padding: $spacing-md;
  }

  &__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);

    &:hover {
      color: var(--text-primary);
    }
  }
}
</style>
