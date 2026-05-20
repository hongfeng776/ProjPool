<template>
  <div class="sales-report">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>销售报表</span>
          <el-button type="primary" size="small" @click="showFilter = !showFilter">
            <el-icon><Setting /></el-icon>
            筛选
          </el-button>
        </div>
      </template>

      <el-collapse-transition>
        <div v-show="showFilter">
          <el-form :inline="true" :model="filters" class="filter-form" label-width="80px">
            <el-form-item label="报表类型">
              <el-radio-group v-model="reportType" @change="loadReport">
                <el-radio label="daily">日报</el-radio>
                <el-radio label="weekly">周报</el-radio>
                <el-radio label="monthly">月报</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="filters.startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="loadReport"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="filters.endDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="loadReport"
              />
            </el-form-item>
            <el-form-item label="门店">
              <el-select v-model="filters.store" placeholder="全部门店" clearable @change="loadReport" style="width: 150px">
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
              <el-select v-model="filters.category" placeholder="全部品类" clearable @change="loadReport" style="width: 150px">
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
              <el-select v-model="filters.paymentMethod" placeholder="全部方式" clearable @change="loadReport" style="width: 150px">
                <el-option label="全部方式" value="" />
                <el-option
                  v-for="method in paymentMethodList"
                  :key="method"
                  :label="method"
                  :value="method"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="客户类型">
              <el-select v-model="filters.customerType" placeholder="全部类型" clearable @change="loadReport" style="width: 150px">
                <el-option label="全部类型" value="" />
                <el-option
                  v-for="type in customerTypeList"
                  :key="type"
                  :label="type"
                  :value="type"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadReport" :loading="loading">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="resetFilters">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>

      <el-row :gutter="20" class="summary-row">
        <el-col :span="6">
          <el-statistic title="总销售额" :value="summary.totalRevenue" suffix="元" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总订单数" :value="summary.totalOrders" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总销量" :value="summary.totalQuantity" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="报表期数" :value="reportData.length" suffix="期" />
        </el-col>
      </el-row>

      <div class="chart-container">
        <div ref="chartRef" class="chart"></div>
      </div>

      <div class="table-actions">
        <el-button type="success" @click="exportReport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <span class="record-count">共 {{ reportData.length }} 条记录</span>
      </div>

      <div class="table-container">
        <el-table :data="reportData" v-loading="loading" border stripe>
          <el-table-column
            :label="dateColumnLabel"
            :prop="dateColumnProp"
            min-width="150"
          />
          <el-table-column
            label="销售额"
            prop="revenue"
            min-width="120"
            sortable
          >
            <template #default="{ row }">
              <span style="color: #409EFF; font-weight: bold;">
                ¥{{ formatNumber(row.revenue) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="订单数"
            prop="orders"
            min-width="100"
            sortable
          />
          <el-table-column
            label="销量"
            prop="quantity"
            min-width="100"
            sortable
          />
          <el-table-column
            label="客单价"
            min-width="120"
          >
            <template #default="{ row }">
              ¥{{ row.orders > 0 ? (row.revenue / row.orders).toFixed(2) : 0 }}
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
import { Search, Download, Setting, RefreshRight } from '@element-plus/icons-vue'
import { dashboardAPI, salesAPI } from '@/api'

const chartRef = ref(null)
const loading = ref(false)
const exporting = ref(false)
const showFilter = ref(true)
const reportType = ref('daily')
const reportData = ref([])
const storeList = ref([])
const categoryList = ref([])
const paymentMethodList = ref([])
const customerTypeList = ref([])

const defaultFilters = {
  startDate: '',
  endDate: '',
  store: '',
  category: '',
  paymentMethod: '',
  customerType: ''
}

const filters = ref({ ...defaultFilters })

const summary = computed(() => {
  return reportData.value.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + (item.revenue || 0),
      totalOrders: acc.totalOrders + (item.orders || 0),
      totalQuantity: acc.totalQuantity + (item.quantity || 0)
    }),
    { totalRevenue: 0, totalOrders: 0, totalQuantity: 0 }
  )
})

const dateColumnLabel = computed(() => {
  const labels = { daily: '日期', weekly: '周次', monthly: '月份' }
  return labels[reportType.value]
})

const dateColumnProp = computed(() => {
  const props = { daily: 'date', weekly: 'week', monthly: 'month' }
  return props[reportType.value]
})

let chart = null

function formatNumber(num) {
  return num ? num.toLocaleString() : 0
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

async function loadCustomerTypes() {
  try {
    const res = await salesAPI.getCustomerTypes()
    if (res.success) {
      customerTypeList.value = res.data
    }
  } catch (error) {
    console.error('加载客户类型失败:', error)
  }
}

function resetFilters() {
  filters.value = { ...defaultFilters }
  loadReport()
}

async function loadReport() {
  loading.value = true
  try {
    const params = {
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      store: filters.value.store,
      category: filters.value.category,
      paymentMethod: filters.value.paymentMethod,
      customerType: filters.value.customerType
    }

    let res
    switch (reportType.value) {
      case 'daily':
        res = await dashboardAPI.getDailyReport(params)
        break
      case 'weekly':
        res = await dashboardAPI.getWeeklyReport(params)
        break
      case 'monthly':
        res = await dashboardAPI.getMonthlyReport(params)
        break
    }

    if (res.success) {
      reportData.value = res.data
      renderChart()
    }
  } catch (error) {
    console.error('加载报表失败:', error)
    ElMessage.error('加载报表失败')
  } finally {
    loading.value = false
  }
}

async function exportReport() {
  if (reportData.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  exporting.value = true
  try {
    const blob = await dashboardAPI.exportSalesReport(reportType.value, filters.value)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    const typeNames = { daily: '日报', weekly: '周报', monthly: '月报' }
    link.setAttribute('download', `销售${typeNames[reportType.value]}_${Date.now()}.xlsx`)
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

function renderChart() {
  if (!chartRef.value) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const data = reportData.value.slice().reverse()
  const xAxisData = data.map(item => {
    if (reportType.value === 'daily') return item.date
    if (reportType.value === 'weekly') return item.week
    return item.month
  })

  if (xAxisData.length === 0) {
    chart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['销售额', '订单数', '销量']
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
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['销售额', '订单数', '销量']
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
      data: xAxisData,
      axisLabel: {
        fontSize: 11,
        rotate: xAxisData.length > 10 ? 30 : 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '数量'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: data.map(item => item.revenue),
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.orders),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '销量',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.quantity),
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }

  chart.setOption(option)
}

function exportReport() {
  ElMessage.info('导出功能开发中...')
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  loadStores()
  loadCategories()
  loadPaymentMethods()
  loadCustomerTypes()
  loadReport()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style scoped>
.sales-report {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.summary-row :deep(.el-statistic__head) {
  color: rgba(255, 255, 255, 0.8);
}

.summary-row :deep(.el-statistic__content) {
  color: #fff;
}

.chart-container {
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 400px;
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
  max-height: 500px;
  overflow-y: auto;
}
</style>
