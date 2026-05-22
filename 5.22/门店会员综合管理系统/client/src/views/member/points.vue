<template>
  <div class="points-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Coin /></el-icon>
              <span>积分变动</span>
            </div>
          </template>
          <el-form
            ref="formRef"
            :model="pointForm"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="会员手机号" prop="memberPhone">
              <el-input
                v-model="pointForm.memberPhone"
                placeholder="请输入会员手机号"
                clearable
                @blur="loadMemberInfo"
              />
              <el-button type="primary" link @click="loadMemberInfo">查询会员</el-button>
            </el-form-item>
            <el-form-item v-if="memberInfo.name" label="会员姓名">
              <span>{{ memberInfo.name }}</span>
            </el-form-item>
            <el-form-item v-if="memberInfo.points !== null" label="当前积分">
              <el-tag type="primary" size="large">{{ memberInfo.points }}</el-tag>
            </el-form-item>
            <el-form-item label="变动类型" prop="type">
              <el-radio-group v-model="pointForm.type">
                <el-radio value="earn">增加积分</el-radio>
                <el-radio value="consume">抵扣积分</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="变动原因" prop="typeName">
              <el-select v-model="pointForm.typeName" placeholder="请选择变动原因">
                <el-option v-if="pointForm.type === 'earn'" label="消费赠送" value="消费赠送" />
                <el-option v-if="pointForm.type === 'earn'" label="活动奖励" value="活动奖励" />
                <el-option v-if="pointForm.type === 'earn'" label="积分调整" value="积分调整" />
                <el-option v-if="pointForm.type === 'consume'" label="消费抵扣" value="消费抵扣" />
                <el-option v-if="pointForm.type === 'consume'" label="礼品兑换" value="礼品兑换" />
                <el-option v-if="pointForm.type === 'consume'" label="积分调整" value="积分调整" />
              </el-select>
            </el-form-item>
            <el-form-item label="变动积分" prop="points">
              <el-input-number
                v-model="pointForm.points"
                :min="1"
                :max="100000"
                placeholder="请输入积分数值"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注说明">
              <el-input
                v-model="pointForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入备注说明（可选）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading" :disabled="!memberInfo._id">
                确认提交
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>积分变动记录</span>
            </div>
          </template>
          <el-table :data="recordList" v-loading="loadingRecords">
            <el-table-column prop="typeName" label="类型" width="100" />
            <el-table-column prop="points" label="变动积分" width="100">
              <template #default="{ row }">
                <span :class="row.type === 'consume' ? 'text-red' : 'text-green'">
                  {{ row.type === 'consume' ? '-' : '+' }}{{ row.points }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balanceAfter" label="变动后" width="100" />
            <el-table-column prop="description" label="备注" show-overflow-tooltip />
            <el-table-column prop="operator" label="操作人" width="80" />
            <el-table-column prop="createdAt" label="时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Coin, List } from '@element-plus/icons-vue'
import request from '@/utils/request'

const formRef = ref(null)
const loading = ref(false)
const loadingRecords = ref(false)

const memberInfo = ref({
  name: '',
  points: null,
  _id: ''
})

const pointForm = reactive({
  memberPhone: '',
  type: 'earn',
  typeName: '',
  points: 10,
  description: ''
})

const rules = {
  memberPhone: [
    { required: true, message: '请输入会员手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择变动类型', trigger: 'change' }
  ],
  typeName: [
    { required: true, message: '请选择变动原因', trigger: 'change' }
  ],
  points: [
    { required: true, message: '请输入积分数值', trigger: 'blur' }
  ]
}

const recordList = ref([])

const loadMemberInfo = async () => {
  if (!pointForm.memberPhone) return

  try {
    const res = await request.get('/members/list', {
      params: { phone: pointForm.memberPhone }
    })
    if (res.code === 200 && res.data && res.data.list) {
      const member = res.data.list.find(m => m.phone === pointForm.memberPhone)
      if (member) {
        memberInfo.value = member
        loadPointRecords(member._id)
      } else {
        ElMessage.warning('未找到该会员')
        memberInfo.value = { name: '', points: null, _id: '' }
        recordList.value = []
      }
    }
  } catch (error) {
    ElMessage.error('查询会员信息失败')
  }
}

const loadPointRecords = async (memberId) => {
  if (!memberId) return

  loadingRecords.value = true
  try {
    const res = await request.get(`/members/${memberId}/points/records`)
    if (res.code === 200) {
      recordList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载积分记录失败:', error)
  } finally {
    loadingRecords.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (!memberInfo.value._id) {
    ElMessage.warning('请先查询会员信息')
    return
  }

  loading.value = true
  try {
    const apiPath = pointForm.type === 'earn' ? 'add' : 'consume'
    const res = await request.post(`/members/${memberInfo.value._id}/points/${apiPath}`, {
      points: pointForm.points,
      type: pointForm.type,
      typeName: pointForm.typeName,
      description: pointForm.description,
      operator: '管理员'
    })

    if (res.code === 200) {
      ElMessage.success(res.message || '操作成功')
      memberInfo.value.points = res.data.balanceAfter
      loadPointRecords(memberInfo.value._id)
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('积分变动失败:', error)
    ElMessage.error(error?.message || '操作失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  memberInfo.value = { name: '', points: null, _id: '' }
  recordList.value = []
  pointForm.points = 10
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
</script>

<style lang="scss" scoped>
.points-container {
  padding: 20px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
  }

  .text-red {
    color: #f56c6c;
    font-weight: bold;
  }

  .text-green {
    color: #67c23a;
    font-weight: bold;
  }
}
</style>
