<template>
  <div class="signin-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="signin-card">
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>每日签到</span>
            </div>
          </template>
          <div class="signin-content">
            <el-form
              ref="formRef"
              :model="signinForm"
              :rules="rules"
              label-width="100px"
            >
              <el-form-item label="会员手机号" prop="memberPhone">
                <el-input
                  v-model="signinForm.memberPhone"
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
              <el-form-item label="签到积分">
                <el-select v-model="signinForm.points" placeholder="请选择签到积分">
                  <el-option :label="10 + ' 积分'" :value="10" />
                  <el-option :label="20 + ' 积分'" :value="20" />
                  <el-option :label="30 + ' 积分'" :value="30" />
                  <el-option :label="50 + ' 积分'" :value="50" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="success"
                  size="large"
                  @click="handleSignIn"
                  :loading="loading"
                  :disabled="!memberInfo._id"
                  class="signin-btn"
                >
                  <el-icon><Promotion /></el-icon>
                  立即签到
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>签到记录</span>
            </div>
          </template>
          <el-table :data="recordList" v-loading="loadingRecords">
            <el-table-column prop="typeName" label="类型" width="100" />
            <el-table-column prop="points" label="获得积分" width="100">
              <template #default="{ row }">
                <span class="text-green">+{{ row.points }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="balanceAfter" label="签到后积分" width="120" />
            <el-table-column prop="description" label="备注" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="签到时间" width="160">
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
import { Calendar, Trophy, Promotion } from '@element-plus/icons-vue'
import request from '@/utils/request'

const formRef = ref(null)
const loading = ref(false)
const loadingRecords = ref(false)

const memberInfo = ref({
  name: '',
  points: null,
  _id: ''
})

const signinForm = reactive({
  memberPhone: '',
  points: 10
})

const rules = {
  memberPhone: [
    { required: true, message: '请输入会员手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const recordList = ref([])

const loadMemberInfo = async () => {
  if (!signinForm.memberPhone) return

  try {
    const res = await request.get('/members/list', {
      params: { phone: signinForm.memberPhone }
    })
    if (res.code === 200 && res.data && res.data.list) {
      const member = res.data.list.find(m => m.phone === signinForm.memberPhone)
      if (member) {
        memberInfo.value = member
        loadSignInRecords(member._id)
      } else {
        ElMessage.warning('未找到该会员，请先注册')
        memberInfo.value = { name: '', points: null, _id: '' }
        recordList.value = []
      }
    }
  } catch (error) {
    ElMessage.error('查询会员信息失败')
  }
}

const loadSignInRecords = async (memberId) => {
  if (!memberId) return

  loadingRecords.value = true
  try {
    const res = await request.get(`/members/${memberId}/points/records`)
    if (res.code === 200) {
      recordList.value = (res.data.list || []).filter(r => r.type === 'signin')
    }
  } catch (error) {
    console.error('加载签到记录失败:', error)
  } finally {
    loadingRecords.value = false
  }
}

const handleSignIn = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (!memberInfo.value._id) {
    ElMessage.warning('请先查询会员信息')
    return
  }

  loading.value = true
  try {
    const res = await request.post(`/members/signin/${memberInfo.value._id}`, {
      points: signinForm.points
    })

    if (res.code === 200) {
      ElMessage.success(res.message || '签到成功')
      memberInfo.value.points = res.data.balanceAfter
      loadSignInRecords(memberInfo.value._id)
    } else {
      ElMessage.error(res.message || '签到失败')
    }
  } catch (error) {
    console.error('签到失败:', error)
    ElMessage.error(error?.message || '签到失败，请稍后重试')
  } finally {
    loading.value = false
  }
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
.signin-container {
  padding: 20px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
  }

  .signin-card {
    .signin-content {
      padding: 20px 0;

      .signin-btn {
        width: 100%;
        height: 50px;
        font-size: 18px;
      }
    }
  }

  .text-green {
    color: #67c23a;
    font-weight: bold;
  }
}
</style>
