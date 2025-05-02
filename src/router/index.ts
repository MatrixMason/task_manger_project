import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '@/pages/BoardPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { authMiddleware } from './middleware/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardPage,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
  ],
})

router.beforeEach(authMiddleware)

export default router
