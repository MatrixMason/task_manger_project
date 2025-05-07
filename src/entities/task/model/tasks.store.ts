import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority, CreateTaskData } from './types'
import { tasksApi } from '@/shared/api/tasks'

interface TaskFilters {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  assignedTo: string
  projectId: string
}

type TaskFiltersInput = {
  search?: string
  status?: TaskStatus | undefined
  priority?: TaskPriority | undefined
  assignedTo?: string
  projectId?: string
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const filters = ref<TaskFilters>({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    projectId: ''
  })

  const sort = ref<{ field: keyof Task; order: 'asc' | 'desc' } | null>(null)

  const sortTasks = (tasksToSort: Task[]) => {
    if (!sort.value) return tasksToSort

    const { field, order } = sort.value
    const modifier = order === 'asc' ? 1 : -1

    return [...tasksToSort].sort((a, b) => {
      if (field === 'priority') {
        const priorityMap: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 }
        return (priorityMap[b.priority] - priorityMap[a.priority]) * modifier
      }

      if (field === 'title') {
        return a.title.localeCompare(b.title) * modifier
      }

      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * modifier
    })
  }

  const filteredTasks = computed(() => {
    let filtered = tasks.value

    // Применяем фильтры
    if (filters.value.status !== '') {
      filtered = filtered.filter((task) => task.status === filters.value.status)
    }

    if (filters.value.priority !== '') {
      filtered = filtered.filter((task) => task.priority === filters.value.priority)
    }

    if (filters.value.assignedTo !== '') {
      filtered = filtered.filter((task) => task.assignedTo === filters.value.assignedTo)
    }

    if (filters.value.projectId !== '') {
      filtered = filtered.filter((task) => task.projectId.toString() === filters.value.projectId)
    }

    // Применяем поиск
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((task) => {
        const titleMatch = task.title.toLowerCase().includes(query)
        const descriptionMatch = task.description
          ? task.description.toLowerCase().includes(query)
          : false
        return titleMatch || descriptionMatch
      })
    }

    // Применяем сортировку
    return sortTasks(filtered)
  })

  const tasksByStatus = computed(() => {
    return tasks.value.reduce<Record<TaskStatus, Task[]>>(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
      },
      {
        todo: [],
        'in-progress': [],
        done: [],
      },
    )
  })

  const filteredTasksByStatus = computed(() => {
    return filteredTasks.value.reduce<Record<TaskStatus, Task[]>>(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
      },
      {
        todo: [],
        'in-progress': [],
        done: [],
      },
    )
  })

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      const apiTasks = await tasksApi.getTasks()
      tasks.value = apiTasks
      return tasks.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData: CreateTaskData): Promise<Task> {
    loading.value = true
    error.value = null

    try {
      const response = await tasksApi.createTask(taskData)
      tasks.value.push(response)
      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create task'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    loading.value = true
    error.value = null

    try {
      const response = await tasksApi.updateTask(id, taskData)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response
      }
      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update task'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string): Promise<void> {
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

  function setSearchQuery(query: string): void {
    filters.value.search = query || ''
  }

  function setFilters(newFilters: TaskFiltersInput) {
    if (Object.keys(newFilters).length === 0) {
      filters.value = {
        search: '',
        status: '',
        priority: '',
        assignedTo: '',
        projectId: ''
      }
      return
    }

    filters.value = {
      search: newFilters.search ?? filters.value.search,
      status: newFilters.status === undefined ? '' : newFilters.status,
      priority: newFilters.priority === undefined ? '' : newFilters.priority,
      assignedTo: newFilters.assignedTo ?? filters.value.assignedTo,
      projectId: newFilters.projectId ?? filters.value.projectId
    }
  }

  function setFilter(
    key: keyof TaskFilters,
    value: TaskStatus | TaskPriority | string | undefined,
  ): void {
    setFilters({ [key]: value })
  }

  function setSort(field: keyof Task, order: 'asc' | 'desc' | null) {
    sort.value = order ? { field, order } : null
  }

  return {
    tasks,
    loading,
    error,
    tasksByStatus,
    filteredTasks,
    filteredTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
    setSearchQuery,
    setFilter,
    setFilters,
    setSort,
    sort,
    // Экспортируем состояние фильтров и поиска
    searchQuery,
    filters,
  }
})
