import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout'),
    redirect: { name: 'Main' },
    children: [
      {
        path: 'main',
        name: 'Main',
        component: () => import('@/views/main')
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: process.env.IS_ELECTRON ? 'hash' : 'history'
})

export default router
