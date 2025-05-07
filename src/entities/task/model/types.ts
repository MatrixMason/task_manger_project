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
  id: number
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
  position: number
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

export type TaskFilters = Partial<{
  search: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  projectId: number
  sort: 'deadline' | 'priority' | 'status'
  order: 'asc' | 'desc'
}>
