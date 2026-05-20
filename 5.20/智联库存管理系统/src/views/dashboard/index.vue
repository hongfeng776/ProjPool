<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon :size="30"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalProducts }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="goToWarning">
          <div class="stat-content">
            <div class="stat-icon" :style="warningCount > 0 ? 'background: #F56C6C' : 'background: #67C23A'">
              <el-icon :size="30"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ warningCount }}</div>
              <div class="stat-label">预警商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C">
              <el-icon :size="30"><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ todayInCount }}</div>
              <div class="stat-label">今日入库</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A">
              <el-icon :size="30"><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ todayOutCount }}</div>
              <div class="stat-label">今日出库</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="goToWarehouse">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon :size="30"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalWarehouses }}</div>
              <div class="stat-label">仓库数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goToProductList">
              <el-icon><Goods /></el-icon>
              商品列表
            </el-button>
            <el-button type="success" @click="goToAddProduct">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
            <el-button type="warning" @click="goToStockIn">
              <el-icon><Upload /></el-icon>
              商品入库
            </el-button>
            <el-button type="danger" @click="goToStockOut">
              <el-icon><Download /></el-icon>
              商品出库
            </el-button>
            <el-button type="info" @click="goToScan">
              <el-icon><Scan /></el-icon>
              扫码出入库
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统名称">智联库存管理系统</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="当前用户">管理员</el-descriptions-item>
            <el-descriptions-item label="登录时间">{{ loginTime }}</el-descriptions-item>
            <el-descriptions-item label="累计入库">{{ totalInCount }}</el-descriptions-item>
            <el-descriptions-item label="累计出库">{{ totalOutCount }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/store/modules/product'
import { useInventoryStore } from '@/store/modules/inventory'
import { useStocktakeStore } from '@/store/modules/stocktake'
import { useWarehouseStore } from '@/store/modules/warehouse'
import { Goods, Warning, Plus, Upload, Download, Scan, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const productStore = useProductStore()
const inventoryStore = useInventoryStore()
const stocktakeStore = useStocktakeStore()
const warehouseStore = useWarehouseStore()

const totalProducts = computed(() => productStore.productList.length)
const warningCount = computed(() => productStore.warningCount)
const todayInCount = computed(() => inventoryStore.todayInCount)
const todayOutCount = computed(() => inventoryStore.todayOutCount)
const totalWarehouses = computed(() => warehouseStore.warehouses.length)

const loginTime = new Date().toLocaleString()

const goToProductList = () => {
  router.push('/product/list')
}

const goToAddProduct = () => {
  router.push('/product/list')
}

const goToWarning = () => {
  router.push('/inventory/warning')
}

const goToStockIn = () => {
  router.push('/inventory/in')
}

const goToStockOut = () => {
  router.push('/inventory/out')
}

const goToWarehouse = () => {
  router.push('/inventory/warehouse')
}

const goToScan = () => {
  router.push('/inventory/scan')
}
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  font-weight: 500;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  justify-content: flex-start;
}
</style>
