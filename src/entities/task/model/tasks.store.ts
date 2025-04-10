import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters, TaskStatus } from './types'
import { tasksApi } from '@/shared/api/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TaskFilters>({})

  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      if (filters.value.status && task.status !== filters.value.status) return false
      if (filters.value.priority && task.priority !== filters.value.priority) return false
      if (filters.value.assignedTo && task.assignedTo !== filters.value.assignedTo) return false
      if (filters.value.projectId && task.projectId !== filters.value.projectId) return false
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        return (
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search)
        )
      }
      return true
    })
  })

  const tasksByStatus = computed(() => {
    const result: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    filteredTasks.value.forEach((task) => {
      result[task.status].push(task)
    })

    return result
  })

  async function fetchTasks() {
    try {
      loading.value = true
      error.value = null
      tasks.value = await tasksApi.getTasks(filters.value)
    } catch (e) {
      error.value = 'Failed to fetch tasks'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    try {
      loading.value = true
      error.value = null
      const updatedTask = await tasksApi.updateTask(taskId, { status: newStatus })
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
    } catch (e) {
      error.value = 'Failed to update task status'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: TaskFilters) {
    filters.value = newFilters
  }

  return {
    tasks,
    loading,
    error,
    filters,
    filteredTasks,
    tasksByStatus,
    fetchTasks,
    updateTaskStatus,
    setFilters,
  }
})
