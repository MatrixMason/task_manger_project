export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface TaskAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // base64
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string | null
  projectId: number
  createdAt: string
  updatedAt: string
  deadline: string | null
  assignee?: User
  attachments?: TaskAttachment[]
  completed: boolean
}

export interface CreateTaskData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string | null
  projectId?: number
  deadline?: string | null
  attachments?: File[]
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: number
  projectId?: number
  search?: string
  sort?: 'deadline' | 'priority' | 'status'
  order?: 'asc' | 'desc'
}
