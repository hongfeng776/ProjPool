<template>
  <div class="page-container">
    <h2>会员中心</h2>
    
    <div v-if="!auth.state.member" class="not-logged-in">
      <p>请先登录</p>
      <router-link to="/login" class="btn-login">去登录</router-link>
    </div>

    <div v-else class="profile-card">
      <div class="profile-header">
        <div class="avatar">{{ auth.state.member.name.charAt(0) }}</div>
        <div class="user-info">
          <h3>{{ auth.state.member.name }}</h3>
          <p class="phone">{{ auth.state.member.phone }}</p>
          <p class="level">{{ auth.state.member.level }} | 积分：{{ auth.state.member.points }}</p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="profile-form">
        <div class="form-section">
          <h4>基本信息</h4>
          
          <div class="form-group">
            <label>姓名</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入姓名"
              class="form-input"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label>性别</label>
            <div class="gender-options">
              <label class="gender-option">
                <input type="radio" v-model="form.gender" value="男" />
                <span>男</span>
              </label>
              <label class="gender-option">
                <input type="radio" v-model="form.gender" value="女" />
                <span>女</span>
              </label>
              <label class="gender-option">
                <input type="radio" v-model="form.gender" value="保密" />
                <span>保密</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>生日</label>
            <input
              v-model="form.birthday"
              type="date"
              class="form-input"
            />
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存修改' }}
        </button>

        <div v-if="resultMessage" :class="['result-msg', resultSuccess ? 'success' : 'error']">
          {{ resultMessage }}
        </div>
      </form>

      <button class="btn-logout" @click="handleLogout">退出登录</button>

      <div class="record-section">
        <div class="tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'points' }"
            @click="activeTab = 'points'"
          >
            积分记录
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'exchange' }"
            @click="activeTab = 'exchange'"
          >
            兑换记录
          </div>
        </div>

        <div v-if="activeTab === 'points'" class="record-list">
          <div v-if="pointsLogs.length === 0" class="empty-record">
            暂无积分记录
          </div>
          <div v-for="log in pointsLogs" :key="log._id" class="record-item">
            <div class="record-info">
              <span class="record-desc">{{ log.description }}</span>
              <span class="record-time">{{ formatDate(log.createdAt) }}</span>
            </div>
            <span 
              class="record-amount"
              :class="log.type === 'earn' || log.type === 'consume' ? 'positive' : 'negative'"
            >
              {{ log.type === 'earn' || log.type === 'consume' ? '+' : '-' }}{{ log.amount }}
            </span>
          </div>
        </div>

        <div v-if="activeTab === 'exchange'" class="record-list">
          <div v-if="exchangeLogs.length === 0" class="empty-record">
            暂无兑换记录
          </div>
          <div v-for="log in exchangeLogs" :key="log._id" class="record-item">
            <div class="record-info">
              <span class="record-desc">兑换：{{ log.productName || log.itemName }}</span>
              <span class="record-time">{{ formatDate(log.createdAt) }}</span>
            </div>
            <span class="record-amount negative">
              -{{ log.points }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import auth from '@/utils/auth'

const router = useRouter()
const activeTab = ref('points')
const pointsLogs = ref([])
const exchangeLogs = ref([])

const form = reactive({
  name: '',
  gender: '保密',
  birthday: ''
})

const errors = reactive({
  name: ''
})

const submitting = ref(false)
const resultMessage = ref('')
const resultSuccess = ref(false)

onMounted(async () => {
  if (auth.state.member) {
    form.name = auth.state.member.name
    form.gender = auth.state.member.gender || '保密'
    form.birthday = auth.state.member.birthday 
      ? new Date(auth.state.member.birthday).toISOString().split('T')[0]
      : ''
    await loadRecords()
  }
})

const loadRecords = async () => {
  try {
    const [pointsRes, exchangeRes] = await Promise.all([
      axios.get(`/api/points/logs/${auth.state.member._id}`),
      axios.get(`/api/products/exchange-log/${auth.state.member._id}`)
    ])
    if (pointsRes.data.code === 0) {
      pointsLogs.value = pointsRes.data.data || []
    }
    if (exchangeRes.data.code === 0) {
      exchangeLogs.value = exchangeRes.data.data || []
    }
  } catch (error) {
    console.error('加载记录失败:', error)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const validateForm = () => {
  let valid = true
  errors.name = ''

  if (!form.name.trim()) {
    errors.name = '姓名不能为空'
    valid = false
  }

  return valid
}

const handleUpdate = async () => {
  resultMessage.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const res = await axios.put(`/api/members/profile/${auth.state.member._id}`, {
      name: form.name.trim(),
      gender: form.gender,
      birthday: form.birthday || null
    })

    if (res.data.code === 0) {
      resultSuccess.value = true
      resultMessage.value = '保存成功'
      auth.updateMember(res.data.data)
    } else {
      resultSuccess.value = false
      resultMessage.value = res.data.message || '保存失败'
    }
  } catch (error) {
    resultSuccess.value = false
    resultMessage.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.page-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-container h2 {
  margin: 0 0 20px;
  color: #333;
}

.not-logged-in {
  background: white;
  padding: 60px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.not-logged-in p {
  color: #999;
  margin: 0 0 20px;
  font-size: 1rem;
}

.btn-login {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
}

.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 600px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-info h3 {
  margin: 0 0 4px;
  color: #333;
  font-size: 1.25rem;
}

.user-info .phone {
  margin: 0 0 4px;
  color: #666;
  font-size: 0.9rem;
}

.user-info .level {
  margin: 0;
  color: #667eea;
  font-size: 0.9rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section h4 {
  margin: 0 0 20px;
  color: #333;
  font-size: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.gender-option input {
  cursor: pointer;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.85rem;
}

.btn-submit {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-msg {
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.95rem;
}

.result-msg.success {
  background: #d4edda;
  color: #155724;
}

.result-msg.error {
  background: #f8d7da;
  color: #721c24;
}

.btn-logout {
  width: 100%;
  margin-top: 20px;
  padding: 12px 32px;
  background: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-logout:hover {
  background: #fef2f2;
}

.record-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s ease;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab:hover:not(.active) {
  color: #333;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.record-item:hover {
  background: #f0f0f0;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-desc {
  color: #333;
  font-size: 0.95rem;
}

.record-time {
  color: #999;
  font-size: 0.8rem;
}

.record-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.record-amount.positive {
  color: #10b981;
}

.record-amount.negative {
  color: #ef4444;
}

.empty-record {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
}
</style>
