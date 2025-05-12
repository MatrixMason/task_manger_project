<script setup lang="ts">
import { onMounted } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'info'
  message: string
  duration?: number
  show?: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  show: false
})

const emit = defineEmits<Emits>()

onMounted(() => {
  if (props.show && props.duration > 0) {
    setTimeout(() => {
      emit('update:show', false)
    }, props.duration)
  }
})
</script>

<template>
  <Transition name="notification">
    <div v-if="show" :class="['notification', `notification--${type}`]">
      {{ message }}
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: v.$spacing-md v.$spacing-lg;
  border-radius: v.$border-radius-sm;
  color: white;
  font-size: 0.875rem;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &--success {
    background-color: var(--color-success);
  }

  &--error {
    background-color: var(--color-error);
  }

  &--info {
    background-color: var(--color-info);
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
