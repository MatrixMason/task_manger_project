import { api } from './axios'
import type { Task, TaskFilters } from '@/entities/task/model/types'

export const tasksApi = {
  async getTasks(filters?: TaskFilters) {
    const { data } = await api.get<Task[]>('/tasks', { params: filters })
    return data
  },

  async getTaskById(id: string) {
    const { data } = await api.get<Task>(`/tasks/${id}`)
    return data
  },

  async createTask(task: Omit<Task, 'id'> & { id: string }) {
    const { data } = await api.post<Task>('/tasks', task)
    return data
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

  async deleteTask(id: string) {
    await api.delete(`/tasks/${id}`)
  },
}
