<template>
  <div class="upload-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>上传数据文件</span>
            </div>
          </template>
          
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            :limit="1"
            accept=".xlsx,.xls,.csv"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 Excel 文件 (.xlsx, .xls) 和 CSV 文件 (.csv)
              </div>
            </template>
          </el-upload>

          <div class="upload-info" v-if="currentFile">
            <el-alert
              title="文件信息"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>文件名: {{ currentFile.name }}</p>
                <p>文件大小: {{ formatFileSize(currentFile.size) }}</p>
              </template>
            </el-alert>
          </div>

          <div class="upload-actions">
            <el-button type="primary" :loading="uploading" @click="handleUpload">
              <el-icon><Upload /></el-icon>
              开始导入
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </div>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>数据格式说明</span>
            </div>
          </template>
          
          <el-alert
            title="支持的数据列"
            type="success"
            :closable="false"
            show-icon
            style="margin-bottom: 15px;"
          >
            <template #default>
              <ul class="column-list">
                <li><strong>门店名称</strong> / store_name - 门店名称</li>
                <li><strong>销售日期</strong> / sale_date - 销售日期</li>
                <li><strong>商品名称</strong> / product_name - 商品名称</li>
                <li><strong>品类</strong> / category - 商品分类</li>
                <li><strong>数量</strong> / quantity - 销售数量</li>
                <li><strong>单价</strong> / unit_price - 商品单价</li>
                <li><strong>总金额</strong> / total_amount - 销售总金额</li>
                <li><strong>客户类型</strong> / customer_type - 客户类型（可选）</li>
                <li><strong>支付方式</strong> / payment_method - 支付方式（可选）</li>
              </ul>
            </template>
          </el-alert>

          <el-alert
            title="示例数据"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <el-table :data="sampleData" size="small" border>
                <el-table-column prop="store_name" label="门店名称" />
                <el-table-column prop="sale_date" label="销售日期" />
                <el-table-column prop="product_name" label="商品名称" />
                <el-table-column prop="category" label="品类" />
                <el-table-column prop="quantity" label="数量" />
                <el-table-column prop="unit_price" label="单价" />
                <el-table-column prop="total_amount" label="总金额" />
              </el-table>
            </template>
          </el-alert>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>导入历史</span>
              <el-button type="primary" link size="small" @click="loadHistory">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <el-table :data="historyData" v-loading="loading">
            <el-table-column prop="file_name" label="文件名" />
            <el-table-column prop="file_type" label="文件类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.file_type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="record_count" label="导入条数" width="100" align="center" />
            <el-table-column prop="upload_time" label="导入时间" width="180" />
            <el-table-column label="状态" width="100" align="center">
              <template #default>
                <el-tag type="success" size="small">成功</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!loading && historyData.length === 0" description="暂无导入历史" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Upload, Refresh } from '@element-plus/icons-vue'
import { uploadAPI } from '@/api'

const uploadRef = ref(null)
const fileList = ref([])
const currentFile = ref(null)
const uploading = ref(false)
const loading = ref(false)
const historyData = ref([])

const sampleData = [
  {
    store_name: '朝阳门店',
    sale_date: '2024-01-01',
    product_name: 'iPhone 15',
    category: '手机',
    quantity: 5,
    unit_price: 5999,
    total_amount: 29995
  },
  {
    store_name: '海淀门店',
    sale_date: '2024-01-01',
    product_name: 'MacBook Pro',
    category: '电脑',
    quantity: 2,
    unit_price: 12999,
    total_amount: 25998
  }
]

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

function handleFileChange(file, files) {
  currentFile.value = file.raw
}

function handleFileRemove() {
  currentFile.value = null
}

async function handleUpload() {
  if (!currentFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  try {
    const res = await uploadAPI.uploadFile(currentFile.value)
    if (res.success) {
      ElMessage.success(res.message || `成功导入 ${res.count} 条数据`)
      handleClear()
      loadHistory()
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

function handleClear() {
  uploadRef.value?.clearFiles()
  currentFile.value = null
}

async function loadHistory() {
  loading.value = true
  try {
    const res = await uploadAPI.getHistory()
    if (res.success) {
      historyData.value = res.data
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.upload-demo {
  margin-bottom: 20px;
}

.upload-info {
  margin-bottom: 20px;
}

.upload-actions {
  display: flex;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.column-list {
  margin: 0;
  padding-left: 20px;
}

.column-list li {
  line-height: 1.8;
  font-size: 14px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  padding: 40px 0;
}
</style>
