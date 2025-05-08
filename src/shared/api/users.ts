import { apiInstance } from './base'
import type { User, UserWithPassword, AuthResponse, LoginCredentials } from '@/entities/user/model/types'
import { passwordUtils } from '@/shared/lib/password'

export interface RegisterData extends LoginCredentials {
  name: string
  role?: 'admin' | 'developer' | 'manager' | 'designer'
}

export const usersApi = {
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('Not authenticated')

    try {
      // Декодируем токен и получаем данные пользователя
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) throw new Error('Invalid token format')
      
      const payload = JSON.parse(atob(tokenParts[1]))
      if (!payload.userId || !payload.role) throw new Error('Invalid token payload')

      // Получаем пользователя по ID
      const user = await this.getUser(payload.userId)
      if (!user) throw new Error('User not found')

      // Проверяем, что роль в токене совпадает с ролью в БД
      if (user.role !== payload.role) {
        throw new Error('Role mismatch')
      }

      // Удаляем пароль из ответа
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Failed to get current user:', error)
      localStorage.removeItem('auth_token') // Удаляем невалидный токен
      throw new Error('Invalid token')
    }
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
    const { data: users } = await apiInstance.get<User[]>('/users')
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

    const { data: createdUser } = await apiInstance.post<UserWithPassword>('/users', newUser)
    // Удаляем пароль из ответа
    const { password: _password, ...userWithoutPassword } = createdUser // eslint-disable-line @typescript-eslint/no-unused-vars
    const accessToken = btoa(JSON.stringify({ userId: createdUser.id, timestamp: Date.now() }))

    return {
      user: userWithoutPassword,
      accessToken,
    }
  },

  async createUser(data: RegisterData): Promise<User> {
    const { data: users } = await apiInstance.get<User[]>('/users')
    if (users.some((u) => u.email === data.email)) {
      throw new Error('Пользователь с таким email уже существует')
    }

    const hashedPassword = await passwordUtils.hash(data.password)

    const newUser: Omit<UserWithPassword, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role || 'developer',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: createdUser } = await apiInstance.post<UserWithPassword>('/users', newUser)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = createdUser
    return userWithoutPassword
  },

  async updateUser(id: string | number, data: Partial<User>): Promise<User> {
    const { data: updatedUser } = await apiInstance.patch<UserWithPassword>(`/users/${id}`, {
      ...data,
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
    })
  },

  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data: users } = await apiInstance.get<UserWithPassword[]>('/users')
    const user = users.find((u) => u.email === email)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    const isPasswordValid = await passwordUtils.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Неверный пароль')
    }

    // Удаляем пароль из ответа
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user

    // Создаем JWT-подобный токен
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 часа
    }))
    const signature = btoa('signature') // В реальном приложении здесь была бы настоящая подпись
    const accessToken = `${header}.${payload}.${signature}`

    return {
      user: userWithoutPassword,
      accessToken
    }
  },
}
