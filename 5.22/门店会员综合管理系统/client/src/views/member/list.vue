<template>
  <div class="member-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><User /></el-icon>
            <span>会员列表</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="success" @click="handleExport('members')">
              <el-icon><Download /></el-icon>
              导出会员
            </el-button>
            <el-button type="warning" @click="handleExport('points')">
              <el-icon><Download /></el-icon>
              导出积分记录
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="会员姓名">
            <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="会员等级">
            <el-select v-model="searchForm.level" placeholder="请选择等级" clearable style="width: 130px">
              <el-option v-for="level in levelOptions" :key="level.name" :label="level.name" :value="level.name" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="level" label="会员等级" width="110">
          <template #default="{ row }">
            <el-tag :color="getLevelColor(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="当前积分" width="100" sortable />
        <el-table-column prop="balance" label="账户余额" width="100" sortable />
        <el-table-column label="到期状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isExpired" type="danger">已过期</el-tag>
            <el-tag v-else-if="row.isExpiringSoon" type="warning">{{ row.daysToExpire }}天后到期</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link size="small" @click="handlePoints(row)">积分</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑会员" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="editForm.level">
            <el-option v-for="level in levelOptions" :key="level.name" :label="level.name" :value="level.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期日期">
          <el-date-picker v-model="editForm.expireDate" type="date" placeholder="选择到期日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Refresh, Download } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const levelOptions = ref([])
const editDialogVisible = ref(false)
const editFormRef = ref(null)

const searchForm = reactive({
  name: '',
  phone: '',
  level: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const editForm = reactive({
  _id: '',
  name: '',
  phone: '',
  level: '普通会员',
  expireDate: '',
  status: 1,
  remark: ''
})

const editRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const getLevelColor = (levelName) => {
  const level = levelOptions.value.find(l => l.name === levelName)
  return level?.color || '#909399'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadLevelOptions = async () => {
  try {
    const res = await request.get('/members/levels/config')
    if (res.code === 200) {
      levelOptions.value = res.data
    }
  } catch (error) {
    console.error('加载等级配置失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/members/list', {
      params: {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })
    if (res.code === 200) {
      tableData.value = res.data.list.map(m => ({
        ...m,
        daysToExpire: getDaysToExpire(m.expireDate),
        isExpired: checkExpired(m.expireDate),
        isExpiringSoon: checkExpiringSoon(m.expireDate)
      }))
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载会员列表失败')
  } finally {
    loading.value = false
  }
}

const getDaysToExpire = (expireDate) => {
  if (!expireDate) return null
  const now = new Date()
  const expireTime = new Date(expireDate)
  const diffTime = expireTime - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const checkExpired = (expireDate) => {
  if (!expireDate) return false
  return new Date() > new Date(expireDate)
}

const checkExpiringSoon = (expireDate, days = 7) => {
  if (!expireDate) return false
  const daysToExpire = getDaysToExpire(expireDate)
  return daysToExpire > 0 && daysToExpire <= days
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.level = ''
  pagination.page = 1
  loadData()
}

const handleRefresh = () => {
  loadData()
}

const handleEdit = (row) => {
  editForm._id = row._id
  editForm.name = row.name
  editForm.phone = row.phone
  editForm.level = row.level
  editForm.expireDate = row.expireDate || ''
  editForm.status = row.status
  editForm.remark = row.remark || ''
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const res = await request.put(`/members/${editForm._id}`, editForm)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handlePoints = (row) => {
  router.push({ path: '/member/points', query: { phone: row.phone } })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除会员 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.delete(`/members/${row._id}`)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error(error?.message || '删除失败')
    }
  }).catch(() => {})
}

const handleExport = async (type) => {
  try {
    const res = await request.get('/members/export', {
      params: {
        type,
        memberPhone: searchForm.phone
      }
    })
    if (res.code === 200) {
      const data = res.data.data
      if (data.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
      }
      exportToCSV(data, type)
    } else {
      ElMessage.error(res.message || '导出失败')
    }
  } catch (error) {
    ElMessage.error(error?.message || '导出失败')
  }
}

const exportToCSV = (data, type) => {
  let headers = []
  let rows = []

  if (type === 'members') {
    headers = ['姓名', '手机号', '会员等级', '当前积分', '账户余额', '注册时间', '到期日期', '状态']
    rows = data.map(m => [
      m.name,
      m.phone,
      m.level,
      m.points || 0,
      m.balance || 0,
      formatDate(m.createdAt),
      m.expireDate ? new Date(m.expireDate).toLocaleDateString() : '',
      m.status === 1 ? '正常' : '禁用'
    ])
  } else if (type === 'points') {
    headers = ['会员姓名', '会员手机号', '变动类型', '变动积分', '变动后余额', '描述', '操作人', '时间']
    rows = data.map(r => [
      r.memberName,
      r.memberPhone,
      r.typeName,
      r.type === 'consume' ? `-${r.points}` : `+${r.points}`,
      r.balanceAfter,
      r.description || '',
      r.operator || '',
      formatDate(r.createdAt)
    ])
  }

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${type === 'members' ? '会员数据' : '积分记录'}_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadLevelOptions()
  loadData()
})
</script>

<style lang="scss" scoped>
.member-list-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
