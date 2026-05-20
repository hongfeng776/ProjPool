<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatNumber(summary.totalRevenue) }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon orders">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(summary.totalOrders) }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stores">
              <el-icon :size="30"><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.storeCount }}</div>
              <div class="stat-label">门店数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon products">
              <el-icon :size="30"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.productCount }}</div>
              <div class="stat-label">商品数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>门店销售排行</span>
            </div>
          </template>
          <div ref="storeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>品类销售占比</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热销商品TOP10</span>
            </div>
          </template>
          <div ref="productChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Money, Document, Shop, Goods } from '@element-plus/icons-vue'
import { dashboardAPI } from '@/api'

const trendChartRef = ref(null)
const storeChartRef = ref(null)
const categoryChartRef = ref(null)
const productChartRef = ref(null)

const summary = ref({
  totalRevenue: 0,
  totalOrders: 0,
  storeCount: 0,
  productCount: 0,
  totalQuantity: 0
})

let trendChart = null
let storeChart = null
let categoryChart = null
let productChart = null

function formatNumber(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

async function loadSummary() {
  try {
    const res = await dashboardAPI.getSummary()
    if (res.success) {
      summary.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

async function loadTrendChart() {
  try {
    const res = await dashboardAPI.getSalesByDate(30)
    if (res.success && res.data.length > 0) {
      const dates = res.data.map(item => item.date)
      const revenues = res.data.map(item => item.revenue)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>销售额: ¥{c}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            data: revenues,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            lineStyle: {
              color: '#409EFF',
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
      trendChart.setOption(option)
    }
  } catch (error) {
    console.error('加载趋势图表失败:', error)
  }
}

async function loadStoreChart() {
  try {
    const res = await dashboardAPI.getSalesByStore()
    if (res.success && res.data.length > 0) {
      const stores = res.data.map(item => item.store).reverse()
      const revenues = res.data.map(item => item.revenue).reverse()
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>销售额: ¥{c}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        yAxis: {
          type: 'category',
          data: stores
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: revenues,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#67C23A' },
                { offset: 1, color: '#95D475' }
              ])
            }
          }
        ]
      }
      storeChart.setOption(option)
    }
  } catch (error) {
    console.error('加载门店图表失败:', error)
  }
}

async function loadCategoryChart() {
  try {
    const res = await dashboardAPI.getSalesByCategory()
    if (res.success && res.data.length > 0) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '品类销售',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: res.data
          }
        ]
      }
      categoryChart.setOption(option)
    }
  } catch (error) {
    console.error('加载品类图表失败:', error)
  }
}

async function loadProductChart() {
  try {
    const res = await dashboardAPI.getTopProducts(10)
    if (res.success && res.data.length > 0) {
      const products = res.data.map(item => item.name).reverse()
      const revenues = res.data.map(item => item.revenue).reverse()
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>销售额: ¥{c}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        yAxis: {
          type: 'category',
          data: products
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: revenues,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#E6A23C' },
                { offset: 1, color: '#F3D19E' }
              ])
            }
          }
        ]
      }
      productChart.setOption(option)
    }
  } catch (error) {
    console.error('加载商品图表失败:', error)
  }
}

function initCharts() {
  trendChart = echarts.init(trendChartRef.value)
  storeChart = echarts.init(storeChartRef.value)
  categoryChart = echarts.init(categoryChartRef.value)
  productChart = echarts.init(productChartRef.value)
}

function handleResize() {
  trendChart?.resize()
  storeChart?.resize()
  categoryChart?.resize()
  productChart?.resize()
}

onMounted(() => {
  initCharts()
  loadSummary()
  loadTrendChart()
  loadStoreChart()
  loadCategoryChart()
  loadProductChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  storeChart?.dispose()
  categoryChart?.dispose()
  productChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-icon.stores {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-icon.products {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
