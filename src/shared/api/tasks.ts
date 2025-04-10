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

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data } = await api.post<Task>('/tasks', task)
    return data
  },

  async updateTask(id: number, task: Partial<Task>) {
    const { data } = await api.patch<Task>(`/tasks/${id}`, task)
    return data
  },

  async deleteTask(id: number) {
    await api.delete(`/tasks/${id}`)
  },
}
