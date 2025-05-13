<script setup lang="ts">
import type { Task, TaskStatus } from '@/entities/task/model/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'
import { useDraggable } from '@/features/DragAndDrop/lib/useDraggable'

const props = defineProps<{
  title: string
  tasks: Task[]
  status: TaskStatus
}>()

const emit = defineEmits<{
  (e: 'taskClick', task: Task): void
  (e: 'taskDelete', taskId: number): void
  (e: 'moveTask', data: { taskId: string; status: TaskStatus; position: number }): void
}>()

const { dragState, handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave } = useDraggable()

function handleTaskDelete(taskId: number) {
  emit('taskDelete', taskId)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const element = event.currentTarget as HTMLElement
  element.classList.remove('drag-over')

  if (!event.dataTransfer) return

  try {
    const { taskId, sourceStatus } = JSON.parse(
      event.dataTransfer.getData('text/plain')
    )

    if (sourceStatus === props.status) return

    const targetPosition = props.tasks.length
    emit('moveTask', { taskId, status: props.status, position: targetPosition })
  } catch (e) {
    console.error('Failed to process drop:', e)
  }
}
</script>

<template>
  <div
    class="kanban-column"
    :class="{ 'drag-over': dragState.isDragging }"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <h2 class="kanban-column__title">{{ title }}</h2>
    <div class="kanban-column__content">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        draggable="true"
        :class="{ 'dragging': dragState.draggedTask?.id === task.id }"
        @dragstart="handleDragStart($event, task, status)"
        @dragend="handleDragEnd"
        @click="$emit('taskClick', task)"
        @delete="handleTaskDelete"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kanban-column {
  background: var(--background-color);
  border-radius: 8px;
  padding: 1rem;
  min-width: 300px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &.drag-over {
    background-color: var(--bg-hover);
    border-color: var(--color-primary);
  }

  .kanban-column__title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  &__content {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    :deep(.task-card) {
      cursor: move;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &.dragging {
        opacity: 0.5;
        transform: translateY(-2px);
        scale: 1.02;
        box-shadow: var(--shadow-lg);
      }
    }
  }
}
</style>
