export type UserRole = 'admin' | 'manager' | 'developer' | 'designer'

export type Permission =
  // Доска
  | 'board.view'
  // Проекты
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.view'
  // Задачи
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'tasks.view'
  | 'tasks.assign'
  | 'tasks.changeStatus'
  // Команда
  | 'team.manage'
  | 'team.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'

// Права доступа по ролям
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
    'tasks.view', 'tasks.changeStatus',
    'team.view'
  ]
}

// Полная модель пользователя с паролем (для БД)
export interface UserWithPassword {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
  createdAt: string
  updatedAt: string
}

// Модель пользователя без пароля (для клиента)
export type User = Omit<UserWithPassword, 'password'>

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}
