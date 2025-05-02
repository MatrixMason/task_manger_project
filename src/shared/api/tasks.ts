import { api } from './axios'
import type { Task, TaskFilters } from '@/entities/task/model/types'

export const tasksApi = {
  async getTasks(filters?: TaskFilters) {
    const { data } = await api.get<Task[]>('/tasks', { params: filters })
    return data
  },

  async getTaskById(id: number) {
    const { data } = await api.get<Task>(`/tasks/${id}`)
    return data
  },

  async createTask(task: Omit<Task, 'id'> & { id: number }) {
    const { data } = await api.post<Task>('/tasks', task)
    return data
  },

  async updateTask(id: number, task: Partial<Task>) {
    try {
      console.log('API updateTask:', id, typeof id)
      const { data } = await api.put<Task>(`/tasks/${id}`, task)
      return data
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },

  async deleteTask(id: number) {
    await api.delete(`/tasks/${id}`)
  },
}
