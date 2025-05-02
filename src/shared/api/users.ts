import { api } from './axios'
import type { User, AuthResponse } from '@/entities/user/model/types'

export const usersApi = {
  async getUsers() {
    const { data } = await api.get<User[]>('/users')
    return data
  },

  async getUser(id: string | number) {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
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
