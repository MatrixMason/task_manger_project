import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import type { Permission } from '@/entities/user/model/types'
import BoardPage from '@/pages/BoardPage/ui/BoardPage.vue'
import TeamPage from '@/pages/TeamPage/ui/TeamPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredPermissions?: Permission[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/',
    redirect: '/board'
  },
  {
    path: '/board',
    name: 'board',
    component: BoardPage,
    meta: {
      requiresAuth: true,
      requiredPermissions: ['board.view']
    }
  },
  {
    path: '/team',
    name: 'team',
    component: TeamPage,
    meta: {
      requiresAuth: true,
      requiredPermissions: ['team.view']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const usersStore = useUsersStore()
  const { hasPermission } = usePermissions()

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (to.meta.requiresAuth && !usersStore.isAuthenticated) {
    return next('/login')
  }

  // Если пользователь авторизован и пытается зайти на страницу логина
  if (to.name === 'login' && usersStore.isAuthenticated) {
    return next('/')
  }

  // Проверяем права доступа
  if (to.meta.requiredPermissions) {
    const permissions = to.meta.requiredPermissions as Permission[]
    if (!permissions.every(permission => hasPermission(permission))) {
      // Если нет прав доступа, перенаправляем на проекты
      return next('/projects')
    }
  }

  next()
})

export default router
