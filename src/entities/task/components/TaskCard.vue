<script setup lang="ts">
import type { Task } from '@/entities/task/model/types'
import BaseCard from '@/shared/ui/Card/BaseCard.vue'
import { formatDate } from '@/shared/lib/dates/format'

defineOptions({
  name: 'TaskCard',
})

defineProps<{
  task: Task
}>()
</script>

<template>
  <div class="task-card" :data-status="task.status">
    <BaseCard variant="hover">
      <div class="task-card__header">
        <h3>{{ task.title }}</h3>
        <span :class="['task-card__priority', `task-card__priority--${task.priority}`]">
          {{ task.priority }}
        </span>
      </div>
      <p class="task-card__description">{{ task.description }}</p>
      <div class="task-card__footer">
        <span class="task-card__status">{{ task.status }}</span>
        <span class="task-card__date">{{ formatDate(task.createdAt) }}</span>
      </div>
    </BaseCard>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.task-card {
  :deep(.card) {
    border: 1px solid $border-color;
    transition: all 0.2s ease;
  }

  &[data-status='todo'] :deep(.card) {
    box-shadow:
      -4px 0 0 $error-color,
      $shadow-sm;
  }

  &[data-status='in-progress'] :deep(.card) {
    box-shadow:
      -4px 0 0 $warning-color,
      $shadow-sm;
  }

  &[data-status='done'] :deep(.card) {
    box-shadow:
      -4px 0 0 $success-color,
      $shadow-sm;
  }

  &:hover {
    :deep(.card) {
      &[data-status='todo'] {
        box-shadow:
          -4px 0 0 $error-color,
          $shadow-md;
      }

      &[data-status='in-progress'] {
        box-shadow:
          -4px 0 0 $warning-color,
          $shadow-md;
      }

      &[data-status='done'] {
        box-shadow:
          -4px 0 0 $success-color,
          $shadow-md;
      }
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-sm;

    h3 {
      margin: 0;
    }
  }

  &__description {
    color: $text-secondary;
    margin-bottom: $spacing-md;
    font-size: 0.9rem;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__priority {
    padding: 2px 6px;
    border-radius: $border-radius-sm;
    font-size: 0.8rem;
    text-transform: capitalize;

    &--high {
      background: $error-color;
      color: white;
    }

    &--medium {
      background: $secondary-color;
      color: white;
    }

    &--low {
      background: $success-color;
      color: white;
    }
  }

  &__status {
    color: $text-secondary;
    text-transform: capitalize;
  }

  &__date {
    font-size: 0.8rem;
    color: $text-secondary;
  }
}
</style>
