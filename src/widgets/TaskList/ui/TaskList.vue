<script setup lang="ts">
import type { Task } from '@/entities/task/model/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'

interface Props {
  tasks: Task[]
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="task-list" :class="{ 'task-list--loading': loading }">
    <TransitionGroup name="task">
      <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
    </TransitionGroup>

    <div v-if="!loading && tasks.length === 0" class="task-list__empty">
      Нет задач для отображения
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: v.$spacing-md;
  position: relative;

  &--loading {
    opacity: 0.7;
    pointer-events: none;
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: v.$spacing-xl;
    color: v.$text-secondary;
    font-style: italic;
  }
}

.task-enter-active,
.task-leave-active {
  transition: all 0.3s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.task-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
