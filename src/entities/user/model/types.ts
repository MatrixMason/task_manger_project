export type UserRole = 'admin' | 'manager' | 'developer' | 'designer'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}
