import type { NavigationGuard } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'

export const authMiddleware: NavigationGuard = (to) => {
  const usersStore = useUsersStore()

  const publicRoutes = ['/login', '/register']

  if (publicRoutes.includes(to.path)) {
    if (usersStore.isAuthenticated) {
      return '/projects'
    }
    return true
  }

  if (!usersStore.isAuthenticated) {
    return '/login'
  }

  return true
}
