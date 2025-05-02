import { api } from './axios'
import type { User, AuthResponse, LoginCredentials } from '@/entities/user/model/types'

export interface RegisterData extends LoginCredentials {
  name: string
  role?: 'developer' | 'manager' | 'designer'
}

export const usersApi = {
  async getAll() {
    const { data } = await api.get<User[]>('/users')
    return data
  },

  async getUser(id: string | number) {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: users } = await api.get<User[]>('/users')
    if (users.some((u) => u.email === data.email)) {
      throw new Error('Пользователь с таким email уже существует')
    }

    const newUser: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role || 'developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: createdUser } = await api.post<User>('/users', newUser)
    const accessToken = btoa(JSON.stringify({ userId: createdUser.id, timestamp: Date.now() }))

    return {
      user: createdUser,
      accessToken,
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    // TODO запрос к серверу
    const { data: users } = await api.get<User[]>('/users')
    const user = users.find((u) => u.email === email)

    if (!user) {
      throw new Error('Неверный email или пароль')
    }

    // А-ля проверка пароля
    if (password !== 'password') {
      throw new Error('Неверный email или пароль')
    }

    // Фэйк токен
    const accessToken = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }))

    return {
      user,
      accessToken,
    }
  },
}
