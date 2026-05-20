<template>
  <div class="inventory-out">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品出库</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Minus /></el-icon>
            新建出库
          </el-button>
        </div>
      </template>

      <el-table :data="outRecords" border stripe>
        <el-table-column prop="id" label="单号" width="100" />
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="quantity" label="出库数量" width="120" />
        <el-table-column prop="price" label="出库单价(元)" width="130">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总金额(元)" width="150">
          <template #default="{ row }">
            ¥{{ row.total.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="createTime" label="出库时间" width="180" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="商品出库"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="选择仓库" prop="warehouseId">
          <el-select
            v-model="form.warehouseId"
            placeholder="请选择仓库"
            style="width: 100%"
            @change="handleWarehouseChange"
          >
            <el-option
              v-for="item in activeWarehouses"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择商品" prop="productId">
          <el-select
            v-model="form.productId"
            placeholder="请选择商品"
            style="width: 100%"
            @change="handleProductChange"
            :disabled="!form.warehouseId"
          >
            <el-option
              v-for="item in availableProducts"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="form.productName" disabled placeholder="选择商品后自动填充" />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentStock" disabled placeholder="选择商品后自动显示" />
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :max="form.productId ? currentStock : 99999"
            :disabled="!form.productId"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="出库单价(元)" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :disabled="!form.productId"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预估总金额">
          <el-input :value="form.quantity * form.price" disabled prefix="¥" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认出库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useInventoryStore } from '@/store/modules/inventory'
import { useProductStore } from '@/store/modules/product'
import { useWarehouseStore } from '@/store/modules/warehouse'
import { Minus } from '@element-plus/icons-vue'

const inventoryStore = useInventoryStore()
const productStore = useProductStore()
const warehouseStore = useWarehouseStore()

const outRecords = computed(() => inventoryStore.outRecords)
const activeWarehouses = computed(() => warehouseStore.activeWarehouses)

const availableProducts = computed(() => {
  return productStore.productList.filter(item => item.status === 1)
})

const dialogVisible = ref(false)
const formRef = ref(null)
const currentStock = ref(0)

const form = ref({
  warehouseId: '',
  warehouseName: '',
  productId: '',
  productName: '',
  quantity: 1,
  price: 0,
  remark: ''
})

const rules = {
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '出库数量不能小于1', trigger: 'blur' }
  ],
  price: [{ required: true, message: '请输入出库单价', trigger: 'blur' }]
}

const handleWarehouseChange = (warehouseId) => {
  const warehouse = warehouseStore.getWarehouseById(warehouseId)
  if (warehouse) {
    form.value.warehouseName = warehouse.name
    if (form.value.productId) {
      currentStock.value = productStore.getProductStock(form.value.productId, warehouseId)
    }
  }
}

const handleProductChange = (productId) => {
  const product = productStore.getProductById(productId)
  if (product) {
    form.value.productName = product.name
    form.value.price = product.price
    currentStock.value = productStore.getProductStock(productId, form.value.warehouseId)
    if (form.value.quantity > currentStock.value) {
      form.value.quantity = currentStock.value
    }
  }
}

const handleAdd = () => {
  form.value = {
    warehouseId: '',
    warehouseName: '',
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
    remark: ''
  }
  currentStock.value = 0
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const success = productStore.stockOut(form.value.productId, form.value.warehouseId, form.value.quantity)
      if (success) {
        inventoryStore.addOutRecord({
          warehouseId: form.value.warehouseId,
          warehouseName: form.value.warehouseName,
          productId: form.value.productId,
          productName: form.value.productName,
          quantity: form.value.quantity,
          price: form.value.price,
          remark: form.value.remark
        })
        ElMessage.success('出库成功！')
        dialogVisible.value = false
      } else {
        ElMessage.error('库存不足，出库失败！')
      }
    }
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
