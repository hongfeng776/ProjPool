<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>智联库存</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item v-if="!item.children" :index="item.path">
            <el-icon><component :is="item.meta.icon" /></el-icon>
            <span>{{ item.meta.title }}</span>
          </el-menu-item>
          <el-sub-menu v-else :index="item.path">
            <template #title>
              <el-icon><component :is="item.meta.icon" /></el-icon>
              <span>{{ item.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="resolvePath(item.path, child.path)"
            >
              {{ child.meta.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">智联库存管理系统</div>
        <div class="header-user">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              管理员
            </span>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Goods, User, Warehouse } from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = [
  {
    path: '/dashboard',
    meta: { title: '首页', icon: 'HomeFilled' }
  },
  {
    path: '/product',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      { path: 'list', meta: { title: '商品列表' } },
      { path: 'category', meta: { title: '商品分类' } }
    ]
  },
  {
    path: '/inventory',
    meta: { title: '库存管理', icon: 'Warehouse' },
    children: [
      { path: 'in', meta: { title: '商品入库' } },
      { path: 'out', meta: { title: '商品出库' } },
      { path: 'warning', meta: { title: '库存预警' } },
      { path: 'stocktake', meta: { title: '盘点管理' } },
      { path: 'warehouse', meta: { title: '仓库管理' } },
      { path: 'scan', meta: { title: '扫码出入库' } }
    ]
  }
]

const activeMenu = computed(() => route.path)

const resolvePath = (parent, child) => {
  return `${parent}/${child}`
}
</script>

<style scoped>
.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.header-user {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
