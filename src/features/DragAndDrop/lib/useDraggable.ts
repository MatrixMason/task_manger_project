import { ref } from 'vue'
import type { Task } from '@/entities/task/model/types'

interface DragState {
  isDragging: boolean
  draggedTask: Task | null
  sourceStatus: string | null
}

export function useDraggable() {
  const dragState = ref<DragState>({
    isDragging: false,
    draggedTask: null,
    sourceStatus: null,
  })

  function handleDragStart(event: DragEvent, task: Task, status: string) {
    if (!event.dataTransfer) return

    dragState.value = {
      isDragging: true,
      draggedTask: task,
      sourceStatus: status,
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        taskId: task.id,
        sourceStatus: status,
      }),
    )

    const element = event.target as HTMLElement
    element.classList.add('dragging')
  }

  function handleDragEnd(event: DragEvent) {
    dragState.value = {
      isDragging: false,
      draggedTask: null,
      sourceStatus: null,
    }

    const element = event.target as HTMLElement
    element.classList.remove('dragging')
  }

  function handleDragOver(event: DragEvent) {
    if (!event.dataTransfer) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault()
    const element = event.currentTarget as HTMLElement
    element.classList.add('drag-over')
  }

  function handleDragLeave(event: DragEvent) {
    const element = event.currentTarget as HTMLElement
    element.classList.remove('drag-over')
  }

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  }
}
