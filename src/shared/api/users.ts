import { apiInstance } from './base'
import type {
  User,
  UserWithPassword,
  AuthResponse,
  LoginCredentials,
} from '@/entities/user/model/types'
import { passwordUtils } from '@/shared/lib/password'

export interface RegisterData extends LoginCredentials {
  name: string
  role?: 'admin' | 'developer' | 'manager' | 'designer'
}

export const usersApi = {
  async getCurrentUser(): Promise<User> {
    const { data: user } = await apiInstance.get<UserWithPassword>('/me')
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },
  async getAll() {
    const { data } = await apiInstance.get<User[]>('/users')
    return data
  },

  async getUser(id: string | number) {
    const { data: user } = await apiInstance.get<UserWithPassword>(`/users/${id}`)
    return user
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await this.createUser(data)

    return this.login({
      email: data.email,
      password: data.password,
    })
  },

  async createUser(data: RegisterData): Promise<User> {
    const hashedPassword = await passwordUtils.hash(data.password)

    const newUser: Omit<UserWithPassword, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role || 'developer',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const { data: createdUser } = await apiInstance.post<UserWithPassword>('/users', newUser)
      const { password, ...userWithoutPassword } = createdUser
      return userWithoutPassword
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response &&
        'status' in error.response &&
        error.response.status === 400
      ) {
        throw new Error('Пользователь с таким email уже существует')
      }
      throw error
    }
  },

  async updateUser(id: string | number, data: Partial<User>): Promise<User> {
    const { data: updatedUser } = await apiInstance.patch<UserWithPassword>(`/users/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    })

    const { password, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  },

  async deleteUser(id: string | number): Promise<void> {
    await apiInstance.delete(`/users/${id}`)
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const { data: users } = await apiInstance.get<User[]>('/users')
    return users.some((u) => u.email === email)
  },

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const { data: users } = await apiInstance.get<UserWithPassword[]>('/users')
    const user = users.find((u) => u.email === email)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    const hashedPassword = await passwordUtils.hash(newPassword)
    await apiInstance.patch(`/users/${user.id}`, {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    })
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiInstance.post<AuthResponse>('/login', credentials)
    return data
  },
}
