import { api } from './axios'
import type { User, UserWithPassword, AuthResponse, LoginCredentials } from '@/entities/user/model/types'
import { passwordUtils } from '@/shared/lib/password'

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
    const { data: user } = await api.get<UserWithPassword>(`/users/${id}`)
    return user
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: users } = await api.get<User[]>('/users')
    if (users.some((u) => u.email === data.email)) {
      throw new Error('Пользователь с таким email уже существует')
    }

    // Хешируем пароль перед сохранением
    const hashedPassword = await passwordUtils.hash(data.password)

    const newUser: Omit<UserWithPassword, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role || 'developer',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: createdUser } = await api.post<UserWithPassword>('/users', newUser)
    // Удаляем пароль из ответа
    const { password: _password, ...userWithoutPassword } = createdUser // eslint-disable-line @typescript-eslint/no-unused-vars
    const accessToken = btoa(JSON.stringify({ userId: createdUser.id, timestamp: Date.now() }))

    return {
      user: userWithoutPassword,
      accessToken,
    }
  },

  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data: users } = await api.get<UserWithPassword[]>(`/users?email=${email}`)
    const user = users[0]

    if (!user) {
      throw new Error('Неверный email или пароль')
    }

    // Проверяем пароль, сравнивая его с хешем
    if (!(await passwordUtils.compare(password, user.password))) {
      throw new Error('Неверный email или пароль')
    }

    const accessToken = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }))

    // Удаляем пароль из ответа
    const { password: _password, ...userWithoutPassword } = user // eslint-disable-line @typescript-eslint/no-unused-vars
    return {
      user: userWithoutPassword,
      accessToken
    }
  },
}
