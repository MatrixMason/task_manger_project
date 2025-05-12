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
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('Not authenticated')

    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) throw new Error('Invalid token format')

      const payload = JSON.parse(atob(tokenParts[1]))
      if (!payload.userId || !payload.role) throw new Error('Invalid token payload')

      const user = await this.getUser(payload.userId)
      if (!user) throw new Error('User not found')

      // Проверяем, что роль в токене совпадает с ролью в БД
      if (user.role !== payload.role) {
        throw new Error('Role mismatch')
      }

      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Failed to get current user:', error)
      localStorage.removeItem('auth_token')
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
    const { password: _password, ...userWithoutPassword } = createdUser
    const accessToken = btoa(JSON.stringify({ userId: createdUser.id, timestamp: Date.now() }))

    return {
      user: userWithoutPassword,
      accessToken,
    }
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

    const { password: _pwd, ...userWithoutPassword } = user

    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payload = btoa(
      JSON.stringify({
        userId: user.id,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }),
    )
    const signature = btoa('signature')
    const accessToken = `${header}.${payload}.${signature}`

    return {
      user: userWithoutPassword,
      accessToken,
    }
  },
}
