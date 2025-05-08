export type UserRole = 'admin' | 'manager' | 'developer' | 'designer'

export type Permission =
  | 'board.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'tasks.view'
  | 'tasks.assign'
  | 'tasks.changeStatus'
  | 'team.manage'
  | 'team.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'

export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'board.view',
    'projects.create', 'projects.edit', 'projects.delete', 'projects.view',
    'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.view', 'tasks.assign', 'tasks.changeStatus',
    'team.manage', 'team.view', 'users.create', 'users.edit', 'users.delete'
  ],
  manager: [
    'board.view',
    'projects.create', 'projects.edit', 'projects.view',
    'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.view', 'tasks.assign', 'tasks.changeStatus',
    'team.view'
  ],
  developer: [
    'board.view',
    'projects.view',
    'tasks.create', 'tasks.edit', 'tasks.view', 'tasks.changeStatus',
    'team.view'
  ],
  designer: [
    'board.view',
    'projects.view',
    'tasks.create', 'tasks.view', 'tasks.changeStatus',
    'team.view'
  ]
}

export interface UserWithPassword {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
  createdAt: string
  updatedAt: string
}

export type User = Omit<UserWithPassword, 'password'>

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}
