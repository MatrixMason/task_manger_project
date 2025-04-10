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
