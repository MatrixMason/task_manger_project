import { createRouter, createWebHistory } from 'vue-router'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import { authMiddleware } from './middleware/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/projects'
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('@/pages/BoardPage.vue'),
      beforeEnter: authMiddleware,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsPage,
      beforeEnter: authMiddleware,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/projects'
    },
  ],
})

router.beforeEach(authMiddleware)

export default router
