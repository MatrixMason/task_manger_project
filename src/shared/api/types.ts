export interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo: number
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
}

export interface User {
  id: number
  name: string
  email: string
  role: 'developer' | 'manager' | 'admin'
}
