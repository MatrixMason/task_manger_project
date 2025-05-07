import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, LoginCredentials } from './types'
import { usersApi } from '@/shared/api/users'
import type { RegisterData } from '@/shared/api/users'

const TOKEN_KEY = 'auth_token'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null

    try {
      users.value = await usersApi.getAll()
    } catch (e) {
      error.value = 'Не удалось загрузить пользователей'
      console.error(e)
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
      currentUser.value = response.user
      accessToken.value = response.accessToken
      localStorage.setItem(TOKEN_KEY, response.accessToken)
      await getCurrentUser()
    } catch (e) {
      error.value = 'Не удалось авторизоваться'
      console.error(e)
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
      const index = users.value.findIndex(user => user.id === id)
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
      users.value = users.value.filter(user => user.id !== id)
    } catch (e) {
      error.value = 'Не удалось удалить пользователя'
      console.error(e)
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
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    login,
    logout,
    register,
    getCurrentUser
  }
})
