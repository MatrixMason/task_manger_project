export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface User {
  id: string | number
  name: string
  email: string
  role: string
}

export interface TaskAttachment {
  id: string | number
  name: string
  type: string
  size: number
  content: string // base64
}

export interface Task {
  id: string | number
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
  createdBy: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string | null
  projectId?: string | number
  deadline?: string | null
  attachments?: File[]
  createdBy: string
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
