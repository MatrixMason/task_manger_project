import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '@/pages/BoardPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
/* import TaskDetailsPage from '@/pages/TaskDetailsPage.vue'
import TeamPage from '@/pages/TeamPage.vue' */

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
    /*     {
      path: '/tasks/:id',
      name: 'task-details',
      component: TaskDetailsPage,
    },
    {
      path: '/team',
      name: 'team',
      component: TeamPage,
    }, */
  ],
})

export default router
