<template>
  <div class="kanban-column">
    <h2 class="kanban-column__title">{{ title }}</h2>
    <div class="kanban-column__content">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('taskClick', task)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/shared/api/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'

defineProps<{
  title: string
  tasks: Task[]
}>()

defineEmits<{
  (e: 'taskClick', task: Task): void
}>()
</script>

<style lang="scss" scoped>
.kanban-column {
  background: var(--background-color);
  border-radius: 8px;
  padding: 1rem;
  min-width: 300px;

  &__title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  &__content {
    min-height: 200px;
  }
}
</style>
