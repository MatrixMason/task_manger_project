<![CDATA[<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import KanbanColumn from './KanbanColumn.vue'
import type { Task, TaskStatus } from '@/entities/task/model/types'

const tasksStore = useTasksStore()
const { tasksByStatus } = storeToRefs(tasksStore)

const columns = [
  { id: 'todo', title: 'К выполнению' },
  { id: 'in-progress', title: 'В работе' },
  { id: 'done', title: 'Готово' }
]

function handleTaskClick(task: Task) {
  // TODO: Открыть модальное окно с деталями задачи
  console.log('Task clicked:', task)
}

function handleTaskDelete(taskId: number) {
  tasksStore.deleteTask(taskId.toString())
}

function handleMoveTask({ taskId, status, position }: { taskId: string; status: TaskStatus; position: number }) {
  tasksStore.moveTask(taskId, status, position)
}
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :title="column.title"
      :status="column.id as TaskStatus"
      :tasks="tasksByStatus[column.id as TaskStatus]"
      @task-click="handleTaskClick"
      @task-delete="handleTaskDelete"
      @move-task="handleMoveTask"
    />
  </div>
</template>

<style lang="scss" scoped>
.kanban-board {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  min-height: calc(100vh - 64px); // Высота экрана минус высота хедера
  overflow-x: auto;
}
</style>]]>
