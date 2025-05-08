import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import type { Permission } from '@/entities/user/model/types'
import BoardPage from '@/pages/BoardPage/ui/BoardPage.vue'
import TeamPage from '@/pages/TeamPage/ui/TeamPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import PasswordRecoveryPage from '@/pages/PasswordRecovery/ui/PasswordRecoveryPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredPermissions?: Permission[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: BoardPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/password-recovery',
    name: 'password-recovery',
    component: PasswordRecoveryPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsPage,
    meta: {
      requiresAuth: true,
      requiredPermissions: ['projects.view']
    }
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

  // Проверяем авторизацию
  const isAuthenticated = usersStore.isAuthenticated

  // Если это страница логина
  if (to.name === 'login') {
    if (isAuthenticated) {
      return next('/board')
    }
    return next()
  }

  // Если маршрут не требует авторизации
  if (!to.meta.requiresAuth) {
    return next()
  }

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiredPermissions) {
    const permissions = to.meta.requiredPermissions as Permission[]
    const hasRequiredPermissions = permissions.every(permission => hasPermission(permission))
    
    if (!hasRequiredPermissions) {
      console.warn('Access denied:', { route: to.path, requiredPermissions: permissions })
      return next('/dashboard')
    }
  }

  // Все проверки пройдены
  return next()
})

export default router
