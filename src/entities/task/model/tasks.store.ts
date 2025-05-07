import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { tasksApi } from '@/shared/api/tasks'
import type { Task, TaskStatus, TaskPriority, TaskFilters, CreateTaskData } from './types'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const selectedTaskId = ref<number | null>(null)

  const filters = ref<TaskFilters>({
    search: '',
    status: undefined,
    priority: undefined,
    assignedTo: '',
    projectId: undefined,
    sort: undefined,
    order: 'asc'
  })

  const filteredTasks = computed(() => {
    let filtered = tasks.value

    // Filter by search
    if (filters.value.search) {
      const searchQuery = filters.value.search.toLowerCase()
      filtered = filtered.filter((task: Task) =>
        task.title.toLowerCase().includes(searchQuery) ||
        task.description?.toLowerCase().includes(searchQuery)
      )
    }

    // Filter by status
    if (filters.value.status) {
      filtered = filtered.filter((task: Task) => task.status === filters.value.status)
    }

    // Filter by priority
    if (filters.value.priority) {
      filtered = filtered.filter((task: Task) => task.priority === filters.value.priority)
    }

    // Filter by assignee
    if (filters.value.assignedTo) {
      filtered = filtered.filter((task: Task) => task.assignedTo === filters.value.assignedTo)
    }

    // Filter by project
    if (filters.value.projectId) {
      filtered = filtered.filter((task: Task) => task.projectId === filters.value.projectId)
    }

    // Sort
    if (filters.value.sort) {
      const sortOrder = filters.value.order === 'desc' ? -1 : 1
      filtered = [...filtered].sort((a: Task, b: Task) => {
        if (filters.value.sort === 'deadline') {
          if (!a.deadline) return sortOrder
          if (!b.deadline) return -sortOrder
          return sortOrder * (new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        }
        if (filters.value.sort === 'priority') {
          const priorities: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 }
          return sortOrder * (priorities[b.priority] - priorities[a.priority])
        }
        if (filters.value.sort === 'status') {
          const statuses: Record<TaskStatus, number> = { todo: 0, 'in-progress': 1, done: 2 }
          return sortOrder * (statuses[b.status] - statuses[a.status])
        }
        return 0
      })
    }

    return filtered
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
      { todo: [], 'in-progress': [], done: [] }
    )
  })

  const selectedTask = computed(() => {
    if (!selectedTaskId.value) return undefined
    return tasks.value.find(task => task.id === selectedTaskId.value)
  })

  async function moveTask(taskId: string | number, newStatus: TaskStatus, position: number) {
    const taskIdNum = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId
    const task = tasks.value.find(t => t.id === taskIdNum)
    if (!task) return

    const prevStatus = task.status
    const prevPosition = task.position

    // Optimistic update
    task.status = newStatus
    task.position = position

    // Update positions of other tasks
    const tasksToUpdate = tasks.value
      .filter(t => t.id !== taskIdNum && t.status === newStatus)
      .sort((a, b) => a.position - b.position)

    const updates = tasksToUpdate.map((task, index) => ({
      taskId: task.id,
      status: task.status,
      position: index + 1
    }))

    updates.push({
      taskId: taskIdNum,
      status: newStatus,
      position
    })

    try {
      // Update positions in the backend
      await tasksApi.updatePositions(updates)
      
      // After successful update, refetch tasks to ensure store is in sync
      await fetchTasks()
    } catch (e) {
      // Rollback changes on error
      task.status = prevStatus
      task.position = prevPosition
      throw e
    }
  }

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      const cleanFilters: Partial<TaskFilters> = {}
      
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          const filterKey = key as keyof TaskFilters
          if (filterKey === 'projectId') {
            const parsedValue = typeof value === 'string' ? parseInt(value, 10) : value
            if (!isNaN(parsedValue)) {
              cleanFilters[filterKey] = parsedValue
            }
          } else if (filterKey === 'status' && typeof value === 'string') {
            cleanFilters[filterKey] = value as TaskStatus
          } else if (filterKey === 'priority' && typeof value === 'string') {
            cleanFilters[filterKey] = value as TaskPriority
          } else if (filterKey === 'assignedTo' && typeof value === 'string') {
            cleanFilters[filterKey] = value
          } else if (filterKey === 'search' && typeof value === 'string') {
            cleanFilters[filterKey] = value
          }
        }
      })

      tasks.value = await tasksApi.getTasks(cleanFilters)
    } catch (e) {
      error.value = e as Error
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: CreateTaskData) {
    loading.value = true
    error.value = null

    try {
      const newTask = await tasksApi.createTask(data)
      tasks.value.push(newTask)
    } catch (e) {
      error.value = e as Error
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: number | string, data: Partial<Task>): Promise<Task> {
    loading.value = true
    error.value = null

    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) {
        throw new Error('Task not found')
      }

      const updatedTask = await tasksApi.updateTask(Number(taskId), data)

      // Replace the entire task object to ensure reactivity
      tasks.value[taskIndex] = { ...updatedTask }

      return updatedTask
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  async function deleteTask(taskId: number) {
    loading.value = true
    error.value = null

    try {
      await tasksApi.deleteTask(taskId)
      tasks.value = tasks.value.filter(task => task.id !== taskId)
    } catch (e) {
      error.value = e as Error
      throw error.value
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<TaskFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      status: undefined,
      priority: undefined,
      assignedTo: '',
      projectId: undefined,
      sort: undefined,
      order: undefined
    }
  }

  function sortTasks(field: 'deadline' | 'priority' | 'status', order: 'asc' | 'desc') {
    setFilters({
      sort: field,
      order
    })
  }

  return {
    tasks,
    loading,
    error,
    filters,
    filteredTasksByStatus,
    selectedTask,
    selectedTaskId,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    resetFilters,
    sortTasks,
    moveTask,
  }
})
