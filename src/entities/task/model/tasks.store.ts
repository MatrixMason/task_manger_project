import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters, TaskStatus } from './types'
import { tasksApi } from '@/shared/api/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TaskFilters>({})
  const selectedUserId = ref<number | null>(null)

  const filteredTasks = computed(() => {
    if (!selectedUserId.value) return tasks.value
    return tasks.value.filter((task) => task.assignedTo === selectedUserId.value)
  })

  /*   const filteredTasks = computed(() => {
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
  }) */

  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    tasks.value.forEach((task) => {
      grouped[task.status].push(task)
    })

    return grouped
  })

  const filteredTasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    filteredTasks.value.forEach((task) => {
      grouped[task.status].push(task)
    })

    return grouped
  })

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      const apiTasks = await tasksApi.getTasks()
      tasks.value = apiTasks.map((task) => ({
        ...task,
        deadline: null,
      }))
      return tasks.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTask(task: Omit<Task, 'id'>, id: string) {
    loading.value = true
    error.value = null

    try {
      const taskWithId = { ...task, id }
      const newTask = await tasksApi.createTask(taskWithId)
      tasks.value.push(newTask)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create task'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    loading.value = true
    error.value = null
    console.log('Store updateTask:', taskId, typeof taskId)

    try {
      const existingTask = tasks.value.find((t) => t.id === taskId)
      if (!existingTask) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      const updatedTask = await tasksApi.updateTask(taskId, {
        ...existingTask,
        ...updates,
      })

      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update task'
      console.error('Error updating task:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    error.value = null

    try {
      await tasksApi.deleteTask(id)
      tasks.value = tasks.value.filter((task) => task.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete task'
      console.error('Error deleting task:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    filters,
    tasksByStatus,
    filteredTasksByStatus,
    selectedUserId,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
})
