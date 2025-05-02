import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from './types'
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

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await usersApi.login(email, password)
      currentUser.value = response.user
      accessToken.value = response.accessToken
      localStorage.setItem(TOKEN_KEY, response.accessToken)
    } catch (e) {
      error.value = 'Не удалось авторизоваться'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    currentUser.value = null
    accessToken.value = null
    localStorage.removeItem(TOKEN_KEY)
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
    login,
    logout,
    register,
  }
})
