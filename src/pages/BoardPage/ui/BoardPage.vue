<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import KanbanColumn from '@/widgets/KanbanBoard/ui/KanbanColumn.vue'
import TaskFilters from '@/features/TaskFilters/ui/TaskFilters.vue'
import TaskSort from '@/features/TaskSort/ui/TaskSort.vue'
import type { Task } from '@/entities/task/model/types'
import TaskFormModal from '@/features/TaskForm/ui/TaskFormModal.vue'

const tasksStore = useTasksStore()
const { loading, error } = storeToRefs(tasksStore)
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

async function handleTaskSaved() {
  // Refresh tasks list after save
  await tasksStore.fetchTasks()

  // Close the form
  showTaskForm.value = false
  selectedTask.value = undefined
  showAddTask.value = false
}

async function handleTaskDelete(taskId: number) {
  console.log('Task deleted:', taskId)
}

async function handleMoveTask(data: { taskId: string; status: Task['status']; position: number }) {
  try {
    // Update task status in the store without full refresh
    await tasksStore.updateTask(data.taskId, { status: data.status }, false)
  } catch (error) {
    console.error('Failed to move task:', error)
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <div class="board-page">
    <header class="board-page__header">
      <div class="board-page__title">
        <h1>Канбан-доска. Задачи</h1>
      </div>
      <div class="board-page__controls">
        <div class="board-page__filters">
          <TaskFilters
            @filter="
              (filters) =>
                tasksStore.setFilters({
                  ...filters,
                  projectId: filters.projectId ? Number(filters.projectId) : undefined,
                })
            "
          />
          <TaskSort @sort="(sort) => tasksStore.sortTasks(sort.field, sort.order)" />
        </div>
        <button class="btn btn--primary" @click="showAddTask = true">Добавить задачу</button>
      </div>
    </header>

    <!-- Отображаем ошибку -->
    <div v-if="error" class="board-page__error">
      {{ error }}
    </div>

    <!-- Отображаем состояние загрузки -->
    <div v-if="loading" class="board-page__loading">Загрузка...</div>
    <div v-if="loading" class="board-page__loading">Загрузка задач...</div>
    <div v-else-if="error" class="board-page__error">
      {{ error }}
    </div>
    <div v-else class="board">
      <KanbanColumn
        v-for="status in ['todo', 'in-progress', 'done'] as const"
        :key="status"
        :title="columnTitles[status]"
        :status="status"
        :tasks="tasksStore.filteredTasksByStatus[status]"
        @task-click="handleTaskClick"
        @task-delete="handleTaskDelete"
        @move-task="handleMoveTask"
      />
    </div>

    <TaskFormModal v-model:show="showTaskForm" :task="selectedTask" @saved="handleTaskSaved" />
    <TaskFormModal v-model:show="showAddTask" @saved="handleTaskSaved" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.board-page {
  padding: 20px;

  &__header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .board-page__title {
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  &__controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__filters {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 20px;
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
