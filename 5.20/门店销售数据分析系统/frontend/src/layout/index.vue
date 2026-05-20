<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <el-icon :size="24" color="#409EFF"><DataAnalysis /></el-icon>
        <span class="logo-text">销售分析系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item
          v-for="route in filteredMenuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">门店销售数据分析系统</div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.userInfo?.username || userStore.userInfo?.realName || '用户' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, Document, Trophy, DataLine, Upload, User, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const menuRoutes = [
  { path: '/dashboard', meta: { title: '数据仪表盘', icon: 'DataAnalysis' } },
  { path: '/sales-report', meta: { title: '销售报表', icon: 'Document' } },
  { path: '/product-ranking', meta: { title: '商品排行', icon: 'Trophy' } },
  { path: '/reports', meta: { title: '分析报告', icon: 'DataLine' } },
  { path: '/users', meta: { title: '用户管理', icon: 'User', adminOnly: true } },
  { path: '/upload', meta: { title: '数据导入', icon: 'Upload' } }
]

const filteredMenuRoutes = computed(() => {
  return menuRoutes.filter(route => {
    if (route.meta.adminOnly && !userStore.isAdmin) {
      return false
    }
    return true
  })
})

async function handleDropdownCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch {
      // 取消退出
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #2b3a4a;
}

.logo-text {
  margin-left: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
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
  font-weight: bold;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  cursor: pointer;
  padding: 0 15px;
  height: 100%;
  transition: color 0.3s;
}

.user-info:hover {
  color: #409EFF;
}

.main-content {
  background-color: #f5f7fa;
  overflow-y: auto;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
