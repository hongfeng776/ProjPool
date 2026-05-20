<template>
  <div class="stocktake">
    <el-card v-if="!currentStocktake">
      <template #header>
        <div class="card-header">
          <span>盘点管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建盘点
          </el-button>
        </div>
      </template>

      <el-table :data="stocktakeRecords" border stripe>
        <el-table-column prop="orderNo" label="盘点单号" width="180" />
        <el-table-column prop="title" label="盘点标题" min-width="150" />
        <el-table-column prop="totalCount" label="商品总数" width="100" />
        <el-table-column prop="normalCount" label="正常" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 2" type="success">{{ row.normalCount }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitCount" label="盘盈" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 2" type="warning">{{ row.profitCount }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lossCount" label="盘亏" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 2" type="danger">{{ row.lossCount }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'info' : row.status === 1 ? 'warning' : 'success'">
              {{ row.status === 0 ? '待开始' : row.status === 1 ? '进行中' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 2" size="small" type="primary" @click="handleEnter(row)">
              <el-icon><Edit /></el-icon>
              进入盘点
            </el-button>
            <el-button v-else size="small" type="info" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else>
      <template #header>
        <div class="card-header">
          <div>
            <el-button @click="handleBack" style="margin-right: 10px">
              <el-icon><Back /></el-icon>
              返回
            </el-button>
            <span>{{ viewMode ? '查看盘点详情' : '进行盘点' }} - {{ currentStocktake.title }}</span>
          </div>
          <el-button v-if="!viewMode" type="success" @click="handleFinish">
            <el-icon><Check /></el-icon>
            完成盘点
          </el-button>
        </div>
      </template>

      <el-descriptions :column="4" border style="margin-bottom: 20px">
        <el-descriptions-item label="盘点单号">{{ currentStocktake.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="盘点标题">{{ currentStocktake.title }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ currentStocktake.operator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentStocktake.createTime }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="currentStocktake.details" border stripe>
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="systemStock" label="系统库存" width="120" align="center" />
        <el-table-column v-if="!viewMode" prop="actualStock" label="实际库存" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.actualStock"
              :min="0"
              :precision="0"
              @change="calcDiff(row)"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column v-else prop="actualStock" label="实际库存" width="120" align="center" />
        <el-table-column prop="diff" label="盈亏数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.diff > 0" type="warning">+{{ row.diff }}</el-tag>
            <el-tag v-else-if="row.diff < 0" type="danger">{{ row.diff }}</el-tag>
            <el-tag v-else type="success">0</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="盈亏状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.diff > 0" type="warning">盘盈</el-tag>
            <el-tag v-else-if="row.diff < 0" type="danger">盘亏</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新建盘点" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="盘点标题">
          <el-input v-model="createForm.title" placeholder="请输入盘点标题" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSubmit">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStocktakeStore } from '@/store/modules/stocktake'
import { useProductStore } from '@/store/modules/product'
import { Plus, Edit, View, Back, Check } from '@element-plus/icons-vue'

const stocktakeStore = useStocktakeStore()
const productStore = useProductStore()

const stocktakeRecords = computed(() => stocktakeStore.stocktakeRecords)
const currentStocktake = ref(null)
const viewMode = ref(false)
const createDialogVisible = ref(false)

const createForm = ref({
  title: '',
  remark: ''
})

const calcDiff = (row) => {
  row.diff = row.actualStock - row.systemStock
}

const handleCreate = () => {
  createForm.value = {
    title: '',
    remark: ''
  }
  createDialogVisible.value = true
}

const handleCreateSubmit = () => {
  if (!createForm.value.title) {
    ElMessage.warning('请输入盘点标题')
    return
  }

  const details = productStore.productList
    .filter(item => item.status === 1)
    .map(item => ({
      productId: item.id,
      productName: item.name,
      systemStock: item.stock,
      actualStock: item.stock,
      diff: 0,
      status: 0
    }))

  const newStocktake = {
    title: createForm.value.title,
    remark: createForm.value.remark,
    details,
    totalCount: details.length
  }

  stocktakeStore.addStocktake(newStocktake)
  ElMessage.success('创建成功！')
  createDialogVisible.value = false
}

const handleEnter = (row) => {
  currentStocktake.value = { ...row }
  viewMode.value = false
}

const handleView = (row) => {
  currentStocktake.value = { ...row }
  viewMode.value = true
}

const handleBack = () => {
  currentStocktake.value = null
  viewMode.value = false
}

const handleFinish = () => {
  ElMessageBox.confirm('确定完成本次盘点吗？完成后将无法修改盘点数据。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    currentStocktake.value.details.forEach(item => {
      if (item.diff !== 0) {
        const product = productStore.getProductById(item.productId)
        if (product) {
          product.stock = item.actualStock
        }
      }
    })

    stocktakeStore.finishStocktake(currentStocktake.value.id)
    ElMessage.success('盘点完成！')
    currentStocktake.value = null
  }).catch(() => {})
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
