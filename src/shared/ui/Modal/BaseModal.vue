<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import BaseButton from '../Button/BaseButton.vue'

defineOptions({
  name: 'BaseModal',
})

const props = defineProps<{
  title: string
  show: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:show', value: boolean): void
}>()

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    emit('update:show', false)
    emit('close')
  }
}

function toggleBodyScroll(disable: boolean) {
  if (disable) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  toggleBodyScroll(false)
})

watch(
  () => props.show,
  (newValue) => {
    toggleBodyScroll(newValue)
  },
)
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-wrapper">
      <div class="modal-overlay" @click="($emit('update:show', false), $emit('close'))" />

      <div class="modal" :class="size && `modal--${size}`">
        <header class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <BaseButton
            variant="secondary"
            size="sm"
            class="modal__close"
            @click="($emit('update:show', false), $emit('close'))"
          >
            ✕
          </BaseButton>
        </header>

        <div class="modal__content">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v.$z-index-modal;
}

.modal-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--bg-overlay);
}

.modal {
  position: relative;
  background: var(--bg-primary);
  border-radius: v.$border-radius-lg;
  box-shadow: v.$shadow-lg;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: v.$spacing-md;

  &--sm {
    width: 100%;
    max-width: 400px;
  }

  &--md {
    width: 100%;
    max-width: 600px;
  }

  &--lg {
    width: 100%;
    max-width: 800px;
  }

  &__header {
    padding: v.$spacing-md;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .base-modal__title {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__content {
    padding: v.$spacing-md;
    overflow-y: auto;
  }

  &__footer {
    padding: v.$spacing-md;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: v.$spacing-sm;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal {
    transform: translateY(20px);
  }
}
</style>
