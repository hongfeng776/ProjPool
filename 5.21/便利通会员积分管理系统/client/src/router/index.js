import { createRouter, createWebHistory } from 'vue-router'
import auth from '@/utils/auth'
import staffAuth from '@/utils/staffAuth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exchange',
    name: 'Exchange',
    component: () => import('@/views/Exchange.vue')
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('@/views/Points.vue')
  },
  {
    path: '/staff-login',
    name: 'StaffLogin',
    component: () => import('@/views/StaffLogin.vue')
  },
  {
    path: '/staff-panel',
    name: 'StaffPanel',
    component: () => import('@/views/StaffPanel.vue'),
    meta: { requiresStaff: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && auth.isLoggedIn()) {
    next('/profile')
  } else if (to.meta.requiresStaff && !staffAuth.isStaffLoggedIn()) {
    next('/staff-login')
  } else {
    next()
  }
})

export default router
