import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [

  {
    path: '/',
    name: 'layout',
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/pages/home.vue'),
      },
    ],
    component: () => import('@/components/MainLayout.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
