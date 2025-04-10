import { api } from './axios'
import type { Project } from '@/entities/project/model/types'

export const projectsApi = {
  async getProjects() {
    const { data } = await api.get<Project[]>('/projects')
    return data
  },

  async getProjectById(id: number) {
    const { data } = await api.get<Project>(`/projects/${id}`)
    return data
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data } = await api.post<Project>('/projects', project)
    return data
  },

  async updateProject(id: number, project: Partial<Project>) {
    const { data } = await api.patch<Project>(`/projects/${id}`, project)
    return data
  },

  async deleteProject(id: number) {
    await api.delete(`/projects/${id}`)
  },
}
