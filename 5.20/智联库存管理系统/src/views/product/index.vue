<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="商品名称"
          style="width: 200px; margin-right: 10px"
          clearable
        />
        <el-select
          v-model="searchForm.category"
          placeholder="商品分类"
          style="width: 150px; margin-right: 10px"
          clearable
        >
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.name"
          />
        </el-select>
        <el-select
          v-model="searchForm.status"
          placeholder="商品状态"
          style="width: 120px; margin-right: 10px"
          clearable
        >
          <el-option label="在售" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <el-table :data="filteredProductList" border style="margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="商品分类" width="120" />
        <el-table-column prop="price" label="价格(元)" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="各仓库库存" width="300">
          <template #default="{ row }">
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
              <el-tag
                v-for="wh in warehouses"
                :key="wh.id"
                size="small"
                :type="getStockByWarehouse(row.id, wh.id) < 50 ? 'danger' : getStockByWarehouse(row.id, wh.id) < 100 ? 'warning' : 'success'"
              >
                {{ wh.name }}: {{ getStockByWarehouse(row.id, wh.id) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品条码">
          <el-input v-model="form.barcode" placeholder="请输入商品条码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">在售</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/store/modules/product'
import { useWarehouseStore } from '@/store/modules/warehouse'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

const productStore = useProductStore()
const warehouseStore = useWarehouseStore()

const searchForm = ref({
  name: '',
  category: '',
  status: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  category: '',
  price: 0,
  status: 1,
  barcode: ''
})

const categories = computed(() => productStore.categories)
const warehouses = computed(() => warehouseStore.warehouses)

const getStockByWarehouse = (productId, warehouseId) => {
  return productStore.getProductStock(productId, warehouseId)
}

const filteredProductList = computed(() => {
  let list = [...productStore.productList]
  
  if (searchForm.value.name) {
    list = list.filter(item => item.name.includes(searchForm.value.name))
  }
  if (searchForm.value.category) {
    list = list.filter(item => item.category === searchForm.value.category)
  }
  if (searchForm.value.status !== '') {
    list = list.filter(item => item.status === searchForm.value.status)
  }
  
  return list
})

const handleSearch = () => {
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    category: '',
    status: ''
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    productStore.deleteProduct(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!form.value.name || !form.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (isEdit.value) {
    productStore.updateProduct(editId.value, form.value)
    ElMessage.success('编辑成功')
  } else {
    productStore.addProduct(form.value)
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
