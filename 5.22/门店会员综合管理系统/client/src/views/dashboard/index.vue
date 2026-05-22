<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in stats" :key="item.title">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="28" color="#fff"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card title="快捷入口">
          <div class="quick-entry">
            <div class="entry-item" v-for="item in quickEntries" :key="item.name" @click="handleEntryClick(item)">
              <el-icon :size="32" color="#409EFF"><component :is="item.icon" /></el-icon>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="系统公告">
          <el-timeline>
            <el-timeline-item
              v-for="item in notices"
              :key="item.id"
              :timestamp="item.time"
              placement="top"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleEntryClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const stats = ref([
  { title: '会员总数', value: '0', icon: 'User', color: '#409EFF' },
  { title: '今日订单', value: '0', icon: 'Document', color: '#67C23A' },
  { title: '今日营收', value: '¥0', icon: 'Money', color: '#E6A23C' },
  { title: '商品总数', value: '0', icon: 'Goods', color: '#F56C6C' }
])

const quickEntries = ref([
  { name: '会员注册', icon: 'UserPlus', path: '/member/register' },
  { name: '会员列表', icon: 'User', path: '/member/list' },
  { name: '会员充值', icon: 'Wallet' },
  { name: '消费结算', icon: 'ShoppingCart' },
  { name: '商品管理', icon: 'GoodsFilled', path: '/product/list' }
])

const notices = ref([
  { id: 1, content: '欢迎使用门店会员综合管理系统', time: '2024-01-01 09:00:00' },
  { id: 2, content: '系统基础框架已搭建完成', time: '2024-01-01 08:00:00' }
])
</script>

<style lang="scss" scoped>
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-title {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.quick-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px 0;

  .entry-item {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 15px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: #ecf5ff;
    }

    span {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
