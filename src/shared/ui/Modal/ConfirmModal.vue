<script setup lang="ts">
import BaseModal from './BaseModal.vue'


interface Props {
  show?: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

withDefaults(defineProps<Props>(), {
  show: false,
  title: 'Подтверждение',
  message: 'Вы уверены?',
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена'
})

const emit = defineEmits<Emits>()

function handleConfirm() {
  emit('confirm')
  emit('update:show', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:show', false)
}
</script>

<template>
  <BaseModal :show="show" title="" @update:show="(value) => emit('update:show', value)">
    <div class="confirm-modal">
      <h3 class="confirm-modal__title">{{ title }}</h3>
      <p class="confirm-modal__message">{{ message }}</p>
      <div class="confirm-modal__actions">
        <button class="btn btn--secondary" @click="handleCancel">
          {{ cancelLabel }}
        </button>
        <button class="btn btn--danger" @click="handleConfirm">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/app/styles/variables' as v;

.confirm-modal {
  padding: v.$spacing-lg;

  &__title {
    margin: 0 0 v.$spacing-md;
    font-size: 1.25rem;
    color: v.$text-primary;
  }

  &__message {
    margin: 0 0 v.$spacing-lg;
    color: v.$text-secondary;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: v.$spacing-md;

    .btn {
      padding: v.$spacing-sm v.$spacing-md;
      border: none;
      border-radius: v.$border-radius-sm;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;

      &--secondary {
        background: v.$background-secondary;
        color: v.$text-primary;

        &:hover {
          background: color.adjust(v.$background-secondary, $lightness: -5%);
        }
      }

      &--danger {
        background: v.$error-color;
        color: white;

        &:hover {
          background: v.$error-color-hover;
        }
      }
    }
  }
}
</style>
