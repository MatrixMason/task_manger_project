import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Task, TaskStatus, TaskPriority } from './types'
import { tasksApi } from '@/shared/api/tasks'
import { saveToLocalStorage, loadFromLocalStorage } from '@/shared/lib/local-storage'

interface TaskFilters {
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: number
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedUserId = ref<number | null>(loadFromLocalStorage('taskboard_selected_user', null))
  const sort = ref<{ field: 'createdAt' | 'priority' | 'title'; order: 'asc' | 'desc' } | null>(
    loadFromLocalStorage('taskboard_sort', null),
  )
  const filters = ref<TaskFilters>(
    loadFromLocalStorage('taskboard_filters', {
      search: '',
      status: undefined,
      priority: undefined,
      projectId: undefined,
    }),
  )

  const sortTasks = (tasksToSort: Task[]) => {
    if (!sort.value) return tasksToSort

    const { field, order } = sort.value
    const modifier = order === 'asc' ? 1 : -1

    return [...tasksToSort].sort((a, b) => {
      if (field === 'priority') {
        const priorityMap = { low: 0, medium: 1, high: 2 }
        return (priorityMap[b.priority] - priorityMap[a.priority]) * modifier
      }

      if (field === 'title') {
        return a.title.localeCompare(b.title) * modifier
      }

      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * modifier
    })
  }

  const filteredTasks = computed(() => {
    const filtered = tasks.value.filter((task) => {
      if (
        filters.value.search &&
        !(
          task.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      ) {
        return false
      }

      if (filters.value.status && task.status !== filters.value.status) {
        return false
      }

      if (filters.value.priority && task.priority !== filters.value.priority) {
        return false
      }

      if (filters.value.projectId && task.projectId !== filters.value.projectId) {
        return false
      }

      if (selectedUserId.value !== null && task.assignedTo !== selectedUserId.value) {
        return false
      }

      return true
    })

    return sortTasks(filtered)
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

  function setFilters(newFilters: TaskFilters) {
    filters.value = newFilters
  }

  // Сохраняем фильтры при изменении
  watch(
    () => filters.value,
    (newFilters) => {
      saveToLocalStorage('taskboard_filters', newFilters)
    },
    { deep: true },
  )

  // Сохраняем выбранного пользователя при изменении
  watch(
    () => selectedUserId.value,
    (newUserId) => {
      saveToLocalStorage('taskboard_selected_user', newUserId)
    },
  )

  // Сохраняем сортировку при изменении
  watch(
    () => sort.value,
    (newSort) => {
      saveToLocalStorage('taskboard_sort', newSort)
    },
  )

  return {
    tasks,
    loading,
    error,
    filters,
    selectedUserId,
    filteredTasks,
    tasksByStatus,
    filteredTasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    sort,
  }
})
