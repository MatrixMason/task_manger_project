import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '@/pages/BoardPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardPage
    }
  ]
})

export default router
