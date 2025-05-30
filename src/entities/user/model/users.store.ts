import { ref, computed } from 'vue'
import { storage } from '@/shared/lib/storage'
import { defineStore } from 'pinia'
import type { User, LoginCredentials } from './types'
import { usersApi } from '@/shared/api/users'
import type { RegisterData } from '@/shared/api/users'

const TOKEN_KEY = 'auth_token'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const accessToken = ref<string | null>(storage.get(TOKEN_KEY))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null

    try {
      const fetchedUsers = await usersApi.getAll()
      users.value = fetchedUsers
      return fetchedUsers
    } catch (e) {
      error.value = 'Не удалось загрузить пользователей'
      console.error(e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function getUserById(id: string | number) {
    return users.value.find((user) => user.id === id)
  }

  async function register(data: RegisterData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await usersApi.register(data)
      currentUser.value = response.user
      accessToken.value = response.accessToken
      localStorage.setItem(TOKEN_KEY, response.accessToken)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка регистрации'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null
    try {
      const response = await usersApi.login(credentials)
      localStorage.setItem(TOKEN_KEY, response.accessToken)
      accessToken.value = response.accessToken
      currentUser.value = response.user
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'Network Error') {
          error.value = 'Не удалось подключиться к серверу'
        } else if (e.message.includes('400')) {
          error.value = 'Неверный email или пароль'
        } else {
          error.value = e.message
        }
      } else {
        error.value = 'Не удалось авторизоваться'
      }
      console.error('Login error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function getCurrentUser() {
    if (!accessToken.value) return

    isLoading.value = true
    error.value = null

    try {
      currentUser.value = await usersApi.getCurrentUser()
    } catch (e) {
      error.value = 'Не удалось загрузить данные пользователя'
      console.error(e)
      logout()
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    currentUser.value = null
    accessToken.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function createUser(data: RegisterData) {
    isLoading.value = true
    error.value = null

    try {
      const newUser = await usersApi.createUser(data)
      users.value.push(newUser)
      return newUser
    } catch (e) {
      error.value = 'Не удалось создать пользователя'
      console.error(e)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(id: string | number, data: Partial<User>) {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await usersApi.updateUser(id, data)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (e) {
      error.value = 'Не удалось обновить пользователя'
      console.error(e)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUser(id: string | number) {
    isLoading.value = true
    error.value = null

    try {
      await usersApi.deleteUser(id)
      users.value = users.value.filter((user) => user.id !== id)
    } catch (e) {
      error.value = 'Не удалось удалить пользователя'
      console.error(e)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailExists(email: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const exists = await usersApi.checkEmailExists(email)
      if (!exists) {
        error.value = 'Пользователь с таким email не найден'
      }
      return exists
    } catch (err: unknown) {
      error.value = 'Ошибка при проверке email'
      console.error('Email check failed:', err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(email: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await usersApi.updatePassword(email, newPassword)
    } catch (err: unknown) {
      error.value = 'Не удалось обновить пароль'
      console.error('Password update failed:', err)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    currentUser,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    fetchUsers,
    getUserById,
    register,
    login,
    getCurrentUser,
    logout,
    createUser,
    updateUser,
    deleteUser,
    checkEmailExists,
    updatePassword,
  }
})
