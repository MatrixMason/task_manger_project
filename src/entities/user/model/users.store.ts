import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/entities/task/model/types'
import { usersApi } from '@/shared/api/users'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null

    try {
      users.value = await usersApi.getUsers()
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

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    getUserById,
  }
})
