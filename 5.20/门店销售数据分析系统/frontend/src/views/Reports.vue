<template>
  <div class="reports-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>分析报告</span>
          <el-button type="primary" @click="showGeneratePanel = true">
            <el-icon><DocumentAdd /></el-icon>
            生成报告
          </el-button>
        </div>
      </template>

      <div v-show="showGeneratePanel" class="generate-panel">
        <el-form :inline="true" :model="generateForm" label-width="80px">
          <el-form-item label="报告名称">
            <el-input v-model="generateForm.reportName" placeholder="自动生成" style="width: 200px" />
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="generateForm.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="generateForm.endDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateReport" :loading="generating">
              开始生成
            </el-button>
            <el-button @click="showGeneratePanel = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="reportList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="report_name" label="报告名称" min-width="200" />
        <el-table-column prop="report_type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">销售分析</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日期范围" width="220">
          <template #default="{ row }">
            {{ row.start_date }} ~ {{ row.end_date }}
          </template>
        </el-table-column>
        <el-table-column prop="creator_name" label="创建人" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewReport(row)">
              查看
            </el-button>
            <el-button type="success" size="small" link @click="exportReport(row)">
              导出
            </el-button>
            <el-button
              v-if="userStore.isAdmin"
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadReports"
        @current-change="loadReports"
        class="pagination"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="报告详情" width="900px" class="report-detail-dialog">
      <div v-if="currentReport" class="report-content">
        <div class="report-header">
          <h3>{{ currentReport.report_name }}</h3>
          <p class="report-meta">
            生成时间: {{ currentReport.created_at }} |
            生成者: {{ currentReport.creator_name }}
          </p>
        </div>

        <div class="summary-section">
          <h4>核心指标</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic
                title="总订单数"
                :value="reportData.summary?.totalOrders || 0"
                suffix="单"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic
                title="总销售额"
                :value="reportData.summary?.totalRevenue || 0"
                prefix="¥"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic
                title="总销量"
                :value="reportData.summary?.totalQuantity || 0"
                suffix="件"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic
                title="平均客单价"
                :value="reportData.summary?.avgOrderValue || 0"
                prefix="¥"
              />
            </el-col>
          </el-row>
        </div>

        <el-row :gutter="20" class="chart-section">
          <el-col :span="12">
            <div class="chart-box">
              <h4>门店销售排行</h4>
              <div ref="storeChartRef" class="chart"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-box">
              <h4>品类销售分布</h4>
              <div ref="categoryChartRef" class="chart"></div>
            </div>
          </el-col>
        </el-row>

        <div class="chart-section">
          <div class="chart-box">
            <h4>热销商品 TOP10</h4>
            <div ref="productChartRef" class="chart"></div>
          </div>
        </div>

        <div class="recommendations-section">
          <h4>智能分析建议</h4>
          <el-empty v-if="!reportData.recommendations || reportData.recommendations.length === 0" description="暂无分析建议" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(item, index) in reportData.recommendations"
              :key="index"
              :type="getRecommendationType(item.type)"
              placement="top"
            >
              <el-card shadow="hover" size="small">
                <template #header>
                  <div class="item-header">
                    <span class="item-title">{{ item.title }}</span>
                  </div>
                </template>
                {{ item.content }}
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportReport(currentReport)">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentAdd, Download } from '@element-plus/icons-vue'
import { reportsAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const generating = ref(false)
const showGeneratePanel = ref(false)
const detailVisible = ref(false)
const currentReport = ref(null)
const reportList = ref([])
const reportData = ref({})

const storeChartRef = ref(null)
const categoryChartRef = ref(null)
const productChartRef = ref(null)

let storeChart = null
let categoryChart = null
let productChart = null

const generateForm = reactive({
  reportName: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

async function loadReports() {
  loading.value = true
  try {
    const res = await reportsAPI.getList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    if (res.success) {
      reportList.value = res.data
      pagination.total = res.pagination.total
    }
  } catch (error) {
    console.error('加载报告列表失败:', error)
  } finally {
    loading.value = false
  }
}

async function generateReport() {
  if (!generateForm.startDate || !generateForm.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }

  generating.value = true
  try {
    const res = await reportsAPI.generate(generateForm)
    if (res.success) {
      ElMessage.success('报告生成成功')
      showGeneratePanel.value = false
      loadReports()
    }
  } catch (error) {
    console.error('生成报告失败:', error)
  } finally {
    generating.value = false
  }
}

async function viewReport(row) {
  try {
    const res = await reportsAPI.getDetail(row.id)
    if (res.success) {
      currentReport.value = res.data
      reportData.value = res.data.content
      detailVisible.value = true
      await nextTick()
      renderCharts()
    }
  } catch (error) {
    console.error('加载报告详情失败:', error)
  }
}

function renderCharts() {
  renderStoreChart()
  renderCategoryChart()
  renderProductChart()
}

function renderStoreChart() {
  if (!storeChartRef.value) return

  if (!storeChart) {
    storeChart = echarts.init(storeChartRef.value)
  }

  const data = reportData.value.storeSales || []
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: data.map(item => item.store),
      axisLabel: { fontSize: 11 }
    },
    series: [{
      name: '销售额',
      type: 'bar',
      data: data.map(item => item.revenue),
      itemStyle: { color: '#409EFF' },
      label: { show: true, position: 'right', fontSize: 11 }
    }]
  }

  storeChart.setOption(option)
}

function renderCategoryChart() {
  if (!categoryChartRef.value) return

  if (!categoryChart) {
    categoryChart = echarts.init(categoryChartRef.value)
  }

  const data = reportData.value.categorySales || []
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      name: '销售额',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: data.map(item => ({ name: item.name, value: item.value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }

  categoryChart.setOption(option)
}

function renderProductChart() {
  if (!productChartRef.value) return

  if (!productChart) {
    productChart = echarts.init(productChartRef.value)
  }

  const data = reportData.value.topProducts || []
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name).reverse(),
      axisLabel: { fontSize: 11, width: 100, overflow: 'truncate' }
    },
    series: [{
      name: '销售额',
      type: 'bar',
      data: data.map(item => item.revenue).reverse(),
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }]) },
      label: { show: true, position: 'right', fontSize: 11 }
    }]
  }

  productChart.setOption(option)
}

function getRecommendationType(type) {
  const typeMap = { store: 'primary', category: 'success', product: 'warning', general: 'info' }
  return typeMap[type] || 'info'
}

async function exportReport(row) {
  if (!row) return
  try {
    const blob = await reportsAPI.export(row.id)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${row.report_name}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除报告「${row.report_name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await reportsAPI.delete(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      loadReports()
    }
  } catch {
    // 取消删除
  }
}

function disposeCharts() {
  storeChart?.dispose()
  categoryChart?.dispose()
  productChart?.dispose()
}

onUnmounted(() => {
  disposeCharts()
})

loadReports()
</script>

<style scoped>
.reports-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.generate-panel {
  padding: 20px;
  margin-bottom: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.report-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 10px;
}

.report-header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.report-header h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.report-meta {
  font-size: 14px;
  color: #999;
}

.summary-section,
.chart-section,
.recommendations-section {
  margin-bottom: 30px;
}

.summary-section h4,
.recommendations-section h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
}

.chart-box {
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
}

.chart-box h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
}

.chart {
  width: 100%;
  height: 300px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-weight: bold;
  font-size: 14px;
}
</style>
