import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Map',
    component: () => import('../views/Map.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
