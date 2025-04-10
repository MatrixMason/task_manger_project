import { ref } from 'vue'
import type { Task } from '@/shared/api/types'

export function useDragAndDrop() {
  const draggedTask = ref<Task | null>(null)

  function onDragStart(task: Task) {
    draggedTask.value = task
  }

  function onDragEnd() {
    draggedTask.value = null
  }

  function onDrop(status: Task['status']) {
    if (draggedTask.value) {
      // Здесь будет логика обновления статуса задачи
      console.log(`Moving task ${draggedTask.value.id} to ${status}`)
    }
  }

  return {
    draggedTask,
    onDragStart,
    onDragEnd,
    onDrop,
  }
}
