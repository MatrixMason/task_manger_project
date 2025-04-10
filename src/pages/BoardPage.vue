<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import KanbanColumn from '@/widgets/KanbanBoard/ui/KanbanColumn.vue'
import type { Task } from '@/shared/api/types'

const tasksStore = useTasksStore()
const showAddTask = ref(false)

const columnTitles = {
  todo: 'К выполнению',
  'in-progress': 'В работе',
  done: 'Готово',
}

function handleTaskClick(task: Task) {
  console.log('Task clicked:', task)
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <div class="board-page">
    <header class="board-page__header">
      <h1>Канбан-доска</h1>
      <button class="btn btn--primary" @click="showAddTask = true">Добавить задачу</button>
    </header>

    <div class="board-page__content">
      <KanbanColumn
        v-for="status in ['todo', 'in-progress', 'done'] as const"
        :key="status"
        :title="columnTitles[status]"
        :tasks="tasksStore.tasksByStatus[status]"
        @task-click="handleTaskClick"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import '@/app/styles/variables';

.board-page {
  padding: $spacing-lg;
  height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h1 {
      color: var(--text-primary);
      margin: 0;
    }
  }

  &__content {
    display: flex;
    gap: $spacing-lg;
    overflow-x: auto;
    padding-bottom: $spacing-md;
    height: calc(100% - 80px); // вычитаем высоту header

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--background-secondary);
      border-radius: $border-radius-sm;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: $border-radius-sm;

      &:hover {
        background: var(--text-secondary);
      }
    }
  }
}

.btn {
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--primary-color-hover);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
