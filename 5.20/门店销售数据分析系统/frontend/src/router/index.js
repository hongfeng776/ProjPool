import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据仪表盘', icon: 'DataAnalysis' }
      },
      {
        path: 'sales-report',
        name: 'SalesReport',
        component: () => import('@/views/SalesReport.vue'),
        meta: { title: '销售报表', icon: 'Document' }
      },
      {
        path: 'product-ranking',
        name: 'ProductRanking',
        component: () => import('@/views/ProductRanking.vue'),
        meta: { title: '商品排行', icon: 'Trophy' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { title: '分析报告', icon: 'DataLine' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', icon: 'User', adminOnly: true }
      },
      {
        path: 'upload',
        name: 'Upload',
        component: () => import('@/views/Upload.vue'),
        meta: { title: '数据导入', icon: 'Upload' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  document.title = to.meta.title ? `${to.meta.title} - 门店销售数据分析系统` : '门店销售数据分析系统'
  
  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!userStore.isLoggedIn) {
      next('/login')
    } else if (to.meta.adminOnly && !userStore.isAdmin) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
