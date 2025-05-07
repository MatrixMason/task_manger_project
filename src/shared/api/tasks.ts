import { api } from './axios'
import type { Task, TaskFilters, TaskStatus, TaskAttachment } from '@/entities/task/model/types'

interface CreateTaskData {
  attachments?: File[]
  // Add other properties as needed
}

interface UpdatePositionData {
  taskId: number
  status: TaskStatus
  position: number
}

export const tasksApi = {
  async getTasks(filters?: TaskFilters) {
    const { data } = await api.get<Task[]>('/tasks', { params: filters })
    return data
  },

  async getTaskById(id: number) {
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

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error(`Invalid task ID: ${id}`)
      }
      console.log('API updateTask:', { id, task })
      
      // Convert files to base64 if present
      const taskData = { ...task }
      if (taskData.attachments?.length) {
        const convertedAttachments = await Promise.all(
          taskData.attachments.map(async (attachment: File | TaskAttachment) => {
            if (attachment instanceof File) {
              const reader = new FileReader()
              const base64Content = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string)
                reader.readAsDataURL(attachment)
              })
              
              return {
                id: crypto.randomUUID(),
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
                content: base64Content
              } as TaskAttachment
            }
            return attachment
          })
        )
        taskData.attachments = convertedAttachments
      }

      const response = await api.patch<Task>(`/tasks/${id}`, taskData)
      if (!response?.data) {
        throw new Error('No data received from server')
      }
      return response.data
    } catch (error) {
      console.error('Failed to update task:', error)
      if (error instanceof Error) {
        throw error
      } else if (typeof error === 'object' && error !== null) {
        throw new Error(JSON.stringify(error))
      } else {
        throw new Error('Failed to update task: Unknown error')
      }
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

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
