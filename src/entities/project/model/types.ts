export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  teamMembers: number[]
}
