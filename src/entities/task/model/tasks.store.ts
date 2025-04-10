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

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      tasks.value = await tasksApi.getTasks()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', e)
    } finally {
      loading.value = false
    }
  }

  async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null

    try {
      const newTask = await tasksApi.createTask(task)
      tasks.value.push(newTask)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create task'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: number, updates: Partial<Task>) {
    loading.value = true
    error.value = null

    try {
      const updatedTask = await tasksApi.updateTask(id, updates)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update task'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    filters,
    filteredTasks,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
  }
})
