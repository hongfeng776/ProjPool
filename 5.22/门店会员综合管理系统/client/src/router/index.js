import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/member',
    component: Layout,
    redirect: '/member/list',
    meta: { title: '会员管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'MemberList',
        component: () => import('@/views/member/list.vue'),
        meta: { title: '会员列表' }
      },
      {
        path: 'register',
        name: 'MemberRegister',
        component: () => import('@/views/member/register.vue'),
        meta: { title: '会员注册' }
      },
      {
        path: 'points',
        name: 'MemberPoints',
        component: () => import('@/views/member/points.vue'),
        meta: { title: '积分管理' }
      },
      {
        path: 'signin',
        name: 'MemberSignIn',
        component: () => import('@/views/member/signin.vue'),
        meta: { title: '签到中心' }
      },
      {
        path: 'level',
        name: 'MemberLevel',
        component: () => import('@/views/member/level.vue'),
        meta: { title: '会员等级' }
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    redirect: '/product/list',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/product/list.vue'),
        meta: { title: '商品列表' }
      },
      {
        path: 'category',
        name: 'ProductCategory',
        component: () => import('@/views/product/category.vue'),
        meta: { title: '商品分类' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    meta: { title: '订单管理', icon: 'Document' },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表' }
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/index',
    children: [
      {
        path: 'index',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计', icon: 'DataLine' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/setting',
    meta: { title: '系统设置', icon: 'Setting' },
    children: [
      {
        path: 'setting',
        name: 'SystemSetting',
        component: () => import('@/views/system/setting.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 门店会员管理系统` : '门店会员管理系统'
  next()
})

export default router
