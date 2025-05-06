export type UserRole = 'admin' | 'manager' | 'developer' | 'designer'

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
