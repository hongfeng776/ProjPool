<template>
  <div class="inventory-warning">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存预警</span>
          <el-tag type="danger" :disable-transitions="true">预警商品: {{ warningCount }}</el-tag>
        </div>
      </template>

      <el-alert
        title="库存预警提醒"
        :description="`当前有 ${warningCount} 个商品库存低于或等于预警阈值，请及时处理！`"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
        show-icon
      />

      <el-table :data="warningProducts" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="商品分类" width="120" />
        <el-table-column prop="price" label="价格(元)" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="当前库存" width="120">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warningStock" label="预警阈值" width="120">
          <template #default="{ row }">
            {{ row.warningStock }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock <= row.warningStock ? 'danger' : 'success'">
              {{ row.stock <= row.warningStock ? '预警' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              设置阈值
            </el-button>
            <el-button size="small" type="success" @click="handleStockIn(row)">
              <el-icon><Plus /></el-icon>
              入库
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="设置预警阈值"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="form.stock" disabled />
        </el-form-item>
        <el-form-item label="预警阈值" prop="warningStock">
          <el-input-number v-model="form.warningStock" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/store/modules/product'
import { Edit, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const productStore = useProductStore()

const warningProducts = computed(() => productStore.warningProducts)
const warningCount = computed(() => productStore.warningCount)

const dialogVisible = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  stock: 0,
  warningStock: 0
})

const handleEdit = (row) => {
  editId.value = row.id
  form.value = {
    name: row.name,
    stock: row.stock,
    warningStock: row.warningStock
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  productStore.updateWarningStock(editId.value, form.value.warningStock)
  ElMessage.success('设置成功！')
  dialogVisible.value = false
}

const handleStockIn = (row) => {
  router.push('/inventory/in')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
