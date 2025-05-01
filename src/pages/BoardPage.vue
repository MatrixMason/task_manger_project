<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import KanbanColumn from '@/widgets/KanbanBoard/ui/KanbanColumn.vue'
import type { Task } from '@/shared/api/types'
import TaskFormModal from '@/features/TaskForm/ui/TaskFormModal.vue'

const tasksStore = useTasksStore()
const showAddTask = ref(false)
const showTaskForm = ref(false)
const selectedTask = ref<Task | undefined>()

const columnTitles = {
  todo: 'К выполнению',
  'in-progress': 'В работе',
  done: 'Готово',
}

function handleTaskClick(task: Task) {
  console.log('Task clicked:', task)
  selectedTask.value = task
  showTaskForm.value = true
}

function handleTaskSaved() {
  tasksStore.fetchTasks()
  showTaskForm.value = false
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <div class="board-page">
    <header class="board-page__header">
      <h1>Канбан-доска. Задачи</h1>
      <button class="btn btn--primary" @click="showAddTask = true">Добавить задачу</button>
    </header>
    <div v-if="tasksStore.loading" class="board-page__loading">Загрузка задач...</div>
    <div v-else-if="tasksStore.error" class="board-page__error">
      {{ tasksStore.error }}
    </div>
    <div v-else class="board">
      <KanbanColumn
        v-for="status in ['todo', 'in-progress', 'done'] as const"
        :key="status"
        :title="columnTitles[status]"
        :tasks="tasksStore.tasksByStatus[status]"
        @task-click="handleTaskClick"
      />
    </div>

    <TaskFormModal v-model:show="showTaskForm" :task="selectedTask" @saved="handleTaskSaved" />
    <TaskFormModal v-model:show="showAddTask" @saved="handleTaskSaved" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.board-page {
  padding: $spacing-lg;
  height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h1 {
      color: $text-primary;
      margin: 0;
    }
  }
  &__loading,
  &__error {
    text-align: center;
    padding: v.$spacing-xl;
    color: v.$text-secondary;
  }

  &__error {
    color: v.$error-color;
  }

  &__content {
    display: flex;
    gap: $spacing-lg;
    overflow-x: auto;
    padding-bottom: $spacing-md;
    height: calc(100% - 80px);

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: $background-secondary;
      border-radius: $border-radius-sm;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color;
      border-radius: $border-radius-sm;

      &:hover {
        background: $text-secondary;
      }
    }
  }
}

.board {
  display: flex;
  gap: v.$spacing-lg;
  height: calc(100% - 80px);
  overflow-x: auto;
  padding-bottom: v.$spacing-md;
}
.btn {
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &--primary {
    background: $primary-color;
    color: white;

    &:hover {
      background: $primary-color-hover;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
