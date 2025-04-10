import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '@/pages/BoardPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'

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
  ],
})

export default router
