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
    path: '/product',
    component: Layout,
    redirect: '/product/list',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/product/index.vue'),
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
    path: '/inventory',
    component: Layout,
    redirect: '/inventory/in',
    meta: { title: '库存管理', icon: 'Warehouse' },
    children: [
      {
        path: 'in',
        name: 'InventoryIn',
        component: () => import('@/views/inventory/in.vue'),
        meta: { title: '商品入库' }
      },
      {
        path: 'out',
        name: 'InventoryOut',
        component: () => import('@/views/inventory/out.vue'),
        meta: { title: '商品出库' }
      },
      {
        path: 'warning',
        name: 'InventoryWarning',
        component: () => import('@/views/inventory/warning.vue'),
        meta: { title: '库存预警' }
      },
      {
            path: 'stocktake',
            name: 'Stocktake',
            component: () => import('@/views/inventory/stocktake.vue'),
            meta: { title: '盘点管理' }
          },
          {
            path: 'warehouse',
            name: 'Warehouse',
            component: () => import('@/views/inventory/warehouse.vue'),
            meta: { title: '仓库管理' }
          },
          {
            path: 'scan',
            name: 'Scan',
            component: () => import('@/views/inventory/scan.vue'),
            meta: { title: '扫码出入库' }
          }
        ]
      }
    ]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
