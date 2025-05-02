import axios from 'axios'
import type { User } from '@/entities/task/model/types'
export const usersApi = {
  async getUsers() {
    const { data } = await axios.get<User[]>('http://localhost:3000/users')
    return data
  },

  async getUser(id: string | number) {
    const { data } = await axios.get<User>(`http://localhost:3000/users/${id}`)
    return data
  },
}
