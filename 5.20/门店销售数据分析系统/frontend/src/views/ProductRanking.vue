<template>
  <div class="product-ranking">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商品销量排行</span>
        </div>
      </template>

      <el-form :inline="true" :model="filters" class="filter-form" label-width="80px">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filters.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadRanking"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filters.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadRanking"
          />
        </el-form-item>
        <el-form-item label="门店">
          <el-select v-model="filters.store" placeholder="全部门店" clearable @change="loadRanking" style="width: 150px">
            <el-option label="全部门店" value="" />
            <el-option
              v-for="store in storeList"
              :key="store"
              :label="store"
              :value="store"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品类">
          <el-select v-model="filters.category" placeholder="全部品类" clearable @change="loadRanking" style="width: 150px">
            <el-option label="全部品类" value="" />
            <el-option
              v-for="cat in categoryList"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="filters.paymentMethod" placeholder="全部方式" clearable @change="loadRanking" style="width: 150px">
            <el-option label="全部方式" value="" />
            <el-option
              v-for="method in paymentMethodList"
              :key="method"
              :label="method"
              :value="method"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排行数量">
          <el-select v-model="filters.limit" @change="loadRanking" style="width: 120px">
            <el-option :value="10" label="TOP 10" />
            <el-option :value="20" label="TOP 20" />
            <el-option :value="50" label="TOP 50" />
            <el-option :value="100" label="TOP 100" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRanking" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="20" class="summary-row">
        <el-col :span="6">
          <el-statistic title="商品总数" :value="rankingData.length" suffix="个" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总销量" :value="summary.totalQuantity" suffix="件" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总销售额" :value="summary.totalRevenue" suffix="元" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总订单数" :value="summary.totalOrders" suffix="单" />
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="barChartRef" class="chart"></div>
        </el-col>
        <el-col :span="12">
          <div ref="pieChartRef" class="chart"></div>
        </el-col>
      </el-row>

      <div class="table-actions">
        <el-button type="success" @click="exportReport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <span class="record-count">共 {{ rankingData.length }} 条记录</span>
      </div>

      <div class="table-container">
        <el-table :data="rankingData" v-loading="loading" border stripe row-key="name">
          <el-table-column label="排名" width="80" align="center" fixed="left">
            <template #default="{ $index }">
              <el-tag
                :type="getRankType($index)"
                size="small"
                :effect="getRankEffect($index)"
              >
                {{ $index + 1 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="name" min-width="200" fixed="left" />
          <el-table-column label="品类" prop="category" width="120" />
          <el-table-column
            label="总销量"
            prop="totalQuantity"
            width="120"
            sortable
            align="center"
          >
            <template #default="{ row }">
              <span style="color: #409EFF; font-weight: bold;">
                {{ formatNumber(row.totalQuantity) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="总销售额"
            prop="totalRevenue"
            width="150"
            sortable
            align="center"
          >
            <template #default="{ row }">
              <span style="color: #67C23A; font-weight: bold;">
                ¥{{ formatNumber(row.totalRevenue) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="订单数"
            prop="orderCount"
            width="100"
            sortable
            align="center"
          />
          <el-table-column
            label="平均单价"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              ¥{{ row.totalQuantity > 0 ? (row.totalRevenue / row.totalQuantity).toFixed(2) : 0 }}
            </template>
          </el-table-column>
          <el-table-column
            label="销量占比"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              <el-progress
                :percentage="getQuantityPercentage(row.totalQuantity)"
                :show-text="true"
                color="#409EFF"
                :stroke-width="10"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Search, Download, RefreshRight } from '@element-plus/icons-vue'
import { dashboardAPI, salesAPI } from '@/api'

const barChartRef = ref(null)
const pieChartRef = ref(null)
const loading = ref(false)
const exporting = ref(false)
const rankingData = ref([])
const storeList = ref([])
const categoryList = ref([])
const paymentMethodList = ref([])

const defaultFilters = {
  startDate: '',
  endDate: '',
  store: '',
  category: '',
  paymentMethod: '',
  limit: 20
}

const filters = ref({ ...defaultFilters })

const summary = computed(() => {
  return rankingData.value.reduce(
    (acc, item) => ({
      totalQuantity: acc.totalQuantity + (item.totalQuantity || 0),
      totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
      totalOrders: acc.totalOrders + (item.orderCount || 0)
    }),
    { totalQuantity: 0, totalRevenue: 0, totalOrders: 0 }
  )
})

let barChart = null
let pieChart = null

function formatNumber(num) {
  return num ? num.toLocaleString() : 0
}

function getRankType(index) {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
}

function getRankEffect(index) {
  if (index < 3) return 'dark'
  return 'light'
}

function getQuantityPercentage(quantity) {
  if (summary.value.totalQuantity === 0) return 0
  return Math.round((quantity / summary.value.totalQuantity) * 100)
}

async function loadStores() {
  try {
    const res = await salesAPI.getStores()
    if (res.success) {
      storeList.value = res.data
    }
  } catch (error) {
    console.error('加载门店列表失败:', error)
  }
}

async function loadCategories() {
  try {
    const res = await salesAPI.getCategories()
    if (res.success) {
      categoryList.value = res.data
    }
  } catch (error) {
    console.error('加载品类列表失败:', error)
  }
}

async function loadPaymentMethods() {
  try {
    const res = await salesAPI.getPaymentMethods()
    if (res.success) {
      paymentMethodList.value = res.data
    }
  } catch (error) {
    console.error('加载支付方式失败:', error)
  }
}

function resetFilters() {
  filters.value = { ...defaultFilters }
  loadRanking()
}

async function exportReport() {
  if (rankingData.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  exporting.value = true
  try {
    const blob = await dashboardAPI.exportSalesReport('ranking', filters.value)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `商品销量排行_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

async function loadRanking() {
  loading.value = true
  try {
    const res = await dashboardAPI.getProductRanking(filters.value)
    if (res.success) {
      rankingData.value = res.data
      renderBarChart()
      renderPieChart()
    }
  } catch (error) {
    console.error('加载商品排行失败:', error)
    ElMessage.error('加载商品排行失败')
  } finally {
    loading.value = false
  }
}

function renderBarChart() {
  if (!barChartRef.value) return

  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }

  const top10 = rankingData.value.slice(0, 10).reverse()

  if (top10.length === 0) {
    barChart.setOption({
      title: {
        text: '销量TOP10商品',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          color: '#999'
        }
      }
    })
    return
  }

  const option = {
    title: {
      text: '销量TOP10商品',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}<br/>销量: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '销量',
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'category',
      data: top10.map(item => item.name),
      axisLabel: {
        fontSize: 11,
        interval: 0,
        width: 120,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: top10.map(item => item.totalQuantity),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          fontSize: 11
        }
      }
    ]
  }

  barChart.setOption(option)
}

function renderPieChart() {
  if (!pieChartRef.value) return

  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }

  const top10 = rankingData.value.slice(0, 10)
  const otherTotal = rankingData.value.slice(10).reduce((sum, item) => sum + item.totalRevenue, 0)

  const pieData = top10.map(item => ({
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    value: item.totalRevenue
  }))

  if (otherTotal > 0) {
    pieData.push({ name: '其他', value: otherTotal })
  }

  if (pieData.length === 0) {
    pieChart.setOption({
      title: {
        text: '销售额占比分布',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          color: '#999'
        }
      }
    })
    return
  }

  const option = {
    title: {
      text: '销售额占比分布',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { fontSize: 11 },
      type: 'scroll',
      height: 250
    },
    series: [
      {
        name: '销售额',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 11,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: pieData
      }
    ]
  }

  pieChart.setOption(option)
}

function handleResize() {
  barChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  loadStores()
  loadCategories()
  loadPaymentMethods()
  loadRanking()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.product-ranking {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.filter-form {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.summary-row {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 8px;
}

.summary-row :deep(.el-statistic__head) {
  color: rgba(255, 255, 255, 0.8);
}

.summary-row :deep(.el-statistic__content) {
  color: #fff;
}

.chart {
  width: 100%;
  height: 350px;
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.record-count {
  color: #909399;
  font-size: 14px;
}

.table-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
