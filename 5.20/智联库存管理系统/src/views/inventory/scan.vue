<template>
  <div class="inventory-scan">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>扫码出入库</span>
          <el-radio-group v-model="operateType" size="large">
            <el-radio-button value="in">入库</el-radio-button>
            <el-radio-button value="out">出库</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="scan-section">
            <el-form :model="scanForm" label-width="80px">
              <el-form-item label="选择仓库">
                <el-select
                  v-model="scanForm.warehouseId"
                  placeholder="请选择仓库"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in activeWarehouses"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="商品条码">
                <el-input
                  v-model="scanForm.barcode"
                  placeholder="扫描或输入商品条码"
                  @keyup.enter="handleScan"
                  ref="barcodeInput"
                >
                  <template #append>
                    <el-button @click="handleScan">
                      <el-icon><Search /></el-icon>
                      扫描
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>

            <div v-if="currentProduct" class="product-info">
              <el-alert
                :title="operateType === 'in' ? '入库商品' : '出库商品'"
                type="info"
                :closable="false"
                style="margin-bottom: 15px"
              />
              <el-descriptions :column="1" border>
                <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
                <el-descriptions-item label="商品条码">{{ currentProduct.barcode }}</el-descriptions-item>
                <el-descriptions-item label="当前库存">{{ currentStock }}</el-descriptions-item>
                <el-descriptions-item label="参考价格">¥{{ currentProduct.price.toFixed(2) }}</el-descriptions-item>
              </el-descriptions>

              <el-form :model="operateForm" label-width="80px" style="margin-top: 15px">
                <el-form-item label="数量">
                  <el-input-number
                    v-model="operateForm.quantity"
                    :min="1"
                    :max="operateType === 'out' ? currentStock : 9999"
                    :precision="0"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="单价(元)">
                  <el-input-number
                    v-model="operateForm.price"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input
                    v-model="operateForm.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入备注信息"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleConfirm" style="width: 100%" size="large">
                    {{ operateType === 'in' ? '确认入库' : '确认出库' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-empty v-else description="扫描商品条码后显示商品信息" />
          </div>
        </el-col>

        <el-col :span="16">
          <div class="list-section">
            <h4 style="margin-bottom: 15px">
              {{ operateType === 'in' ? '本次入库记录' : '本次出库记录' }}
            </h4>
            <el-table :data="currentRecords" border stripe size="small">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="barcode" label="商品条码" width="120" />
              <el-table-column prop="productName" label="商品名称" min-width="150" />
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column prop="price" label="单价(元)" width="100">
                <template #default="{ row }">
                  ¥{{ row.price.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="total" label="金额(元)" width="120">
                <template #default="{ row }">
                  ¥{{ row.total.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="120" />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row, $index }">
                  <el-button type="danger" size="small" @click="removeRecord($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="summary" v-if="currentRecords.length > 0">
              <el-statistic title="商品总数" :value="currentRecords.length" style="margin-right: 40px" />
              <el-statistic title="总数量" :value="totalQuantity" style="margin-right: 40px" />
              <el-statistic title="总金额" prefix="¥" :value="totalAmount" :precision="2" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/store/modules/product'
import { useInventoryStore } from '@/store/modules/inventory'
import { useWarehouseStore } from '@/store/modules/warehouse'
import { Search } from '@element-plus/icons-vue'

const productStore = useProductStore()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

const activeWarehouses = computed(() => warehouseStore.activeWarehouses)
const barcodeInput = ref(null)

const operateType = ref('in')
const currentProduct = ref(null)
const currentStock = ref(0)

const scanForm = ref({
  warehouseId: '',
  barcode: ''
})

const operateForm = ref({
  quantity: 1,
  price: 0,
  remark: ''
})

const inRecords = ref([])
const outRecords = ref([])

const currentRecords = computed(() => {
  return operateType.value === 'in' ? inRecords.value : outRecords.value
})

const totalQuantity = computed(() => {
  return currentRecords.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return currentRecords.value.reduce((sum, item) => sum + item.total, 0)
})

watch(operateType, () => {
  currentProduct.value = null
  scanForm.value.barcode = ''
  nextTick(() => {
    barcodeInput.value?.focus()
  })
})

const handleScan = () => {
  if (!scanForm.value.warehouseId) {
    ElMessage.warning('请先选择仓库')
    return
  }

  if (!scanForm.value.barcode) {
    ElMessage.warning('请输入或扫描商品条码')
    return
  }

  const product = productStore.getProductByBarcode(scanForm.value.barcode)
  if (product) {
    currentProduct.value = product
    currentStock.value = productStore.getProductStock(product.id, scanForm.value.warehouseId)
    operateForm.value = {
      quantity: 1,
      price: product.price,
      remark: ''
    }
  } else {
    ElMessage.error('未找到该商品')
    currentProduct.value = null
  }
}

const handleConfirm = () => {
  if (!scanForm.value.warehouseId) {
    ElMessage.warning('请选择仓库')
    return
  }

  if (!currentProduct.value) {
    ElMessage.warning('请先扫描商品')
    return
  }

  if (operateForm.value.quantity <= 0) {
    ElMessage.warning('数量必须大于0')
    return
  }

  if (operateType.value === 'out' && operateForm.value.quantity > currentStock.value) {
    ElMessage.error('库存不足，出库失败')
    return
  }

  const warehouse = warehouseStore.getWarehouseById(scanForm.value.warehouseId)
  const record = {
    warehouseId: scanForm.value.warehouseId,
    warehouseName: warehouse?.name || '',
    productId: currentProduct.value.id,
    productName: currentProduct.value.name,
    barcode: currentProduct.value.barcode,
    quantity: operateForm.value.quantity,
    price: operateForm.value.price,
    total: operateForm.value.quantity * operateForm.value.price,
    remark: operateForm.value.remark
  }

  if (operateType.value === 'in') {
    productStore.stockIn(currentProduct.value.id, scanForm.value.warehouseId, operateForm.value.quantity)
    inventoryStore.addInRecord(record)
    inRecords.value.push(record)
    ElMessage.success('入库成功！')
  } else {
    const success = productStore.stockOut(currentProduct.value.id, scanForm.value.warehouseId, operateForm.value.quantity)
    if (success) {
      inventoryStore.addOutRecord(record)
      outRecords.value.push(record)
      ElMessage.success('出库成功！')
    } else {
      ElMessage.error('库存不足，出库失败！')
      return
    }
  }

  currentStock.value = productStore.getProductStock(currentProduct.value.id, scanForm.value.warehouseId)
  scanForm.value.barcode = ''
  currentProduct.value = null
  nextTick(() => {
    barcodeInput.value?.focus()
  })
}

const removeRecord = (index) => {
  currentRecords.value.splice(index, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scan-section,
.list-section {
  padding: 10px;
}

.product-info {
  margin-top: 20px;
}

.summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
