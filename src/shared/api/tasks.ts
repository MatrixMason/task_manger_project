import { api } from './axios'
import type { Task, TaskFilters } from '@/entities/task/model/types'

interface CreateTaskData {
  attachments?: File[]
  // Add other properties as needed
}

interface UpdatePositionData {
  taskId: string
  status: string
  position: number
}

export const tasksApi = {
  async getTasks(filters?: TaskFilters) {
    const { data } = await api.get<Task[]>('/tasks', { params: filters })
    return data
  },

  async getTaskById(id: string) {
    const { data } = await api.get<Task>(`/tasks/${id}`)
    return data
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const attachmentPromises = data.attachments?.map(async file => {
      // Convert file to base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }) || []

    const attachments = await Promise.all(attachmentPromises)
    const now = new Date().toISOString()

    const taskData = {
      ...data,
      completed: false,
      createdAt: now,
      updatedAt: now,
      attachments: attachments.map((base64, index) => ({
        id: crypto.randomUUID(),
        name: data.attachments![index].name,
        type: data.attachments![index].type,
        size: data.attachments![index].size,
        content: base64
      }))
    }

    const response = await api.post('/tasks', taskData)
    return response.data
  },

  async updateTask(id: string, task: Partial<Task>) {
    try {
      console.log('API updateTask:', id, typeof id)
      const { data } = await api.patch<Task>(`/tasks/${id}`, task)
      return data
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },

  async updatePositions(updates: UpdatePositionData[]): Promise<void> {
    // Обновляем каждую задачу по отдельности
    await Promise.all(
      updates.map(({ taskId, status, position }) =>
        api.patch(`/tasks/${taskId}`, { status, position })
      )
    )
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
