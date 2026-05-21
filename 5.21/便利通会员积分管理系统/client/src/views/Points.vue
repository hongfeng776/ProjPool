<template>
  <div class="page-container">
    <h2>积分消费</h2>
    
    <div v-if="!auth.state.member" class="not-logged-in">
      <p>请先登录后记录消费</p>
      <router-link to="/login" class="btn-login">去登录</router-link>
    </div>

    <div v-else>
      <div class="points-banner">
        <span class="points-label">当前积分</span>
        <span class="points-value">{{ auth.state.member.points }}</span>
      </div>

      <div class="consume-card">
        <h3>记录消费</h3>
        <p class="tip">消费金额 1:1 累计积分（消费10元 = 获得10积分）</p>
        
        <form @submit.prevent="handleConsume" class="consume-form">
          <div class="form-group">
            <label>消费金额（元）</label>
            <input
              v-model.number="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="请输入消费金额"
              class="form-input"
            />
            <span v-if="errors.amount" class="error-msg">{{ errors.amount }}</span>
          </div>

          <div class="form-group">
            <label>消费说明（可选）</label>
            <input
              v-model="description"
              type="text"
              placeholder="例如：购买日用品"
              class="form-input"
            />
          </div>

          <div class="points-preview">
            <span>预计获得积分：</span>
            <span class="preview-points">+{{ Math.floor(amount || 0) }}</span>
          </div>

          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? '记录中...' : '确认消费' }}
          </button>

          <div v-if="resultMessage" :class="['result-msg', resultSuccess ? 'success' : 'error']">
            {{ resultMessage }}
          </div>
        </form>
      </div>

      <div class="recent-section">
        <h3>最近消费记录</h3>
        <div v-if="consumeLogs.length === 0" class="empty-record">
          暂无消费记录
        </div>
        <div v-else class="record-list">
          <div v-for="log in consumeLogs" :key="log._id" class="record-item">
            <div class="record-info">
              <span class="record-desc">{{ log.description || '消费' }}</span>
              <span class="record-time">{{ formatDate(log.createdAt) }}</span>
            </div>
            <span class="record-amount positive">+{{ log.amount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import auth from '@/utils/auth'

const amount = ref(0)
const description = ref('')
const submitting = ref(false)
const resultMessage = ref('')
const resultSuccess = ref(false)
const consumeLogs = ref([])

const errors = reactive({
  amount: ''
})

onMounted(async () => {
  if (auth.state.member) {
    await loadConsumeLogs()
  }
})

const loadConsumeLogs = async () => {
  try {
    const res = await axios.get(`/api/points/logs/${auth.state.member._id}`)
    if (res.data.code === 0) {
      consumeLogs.value = (res.data.data || []).filter(log => log.type === 'consume' || log.type === 'earn')
    }
  } catch (error) {
    console.error('加载消费记录失败:', error)
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
  errors.amount = ''

  if (!amount.value || amount.value <= 0) {
    errors.amount = '请输入有效的消费金额'
    valid = false
  }

  return valid
}

const handleConsume = async () => {
  resultMessage.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const points = Math.floor(amount.value)
    const res = await axios.post('/api/points/consume', {
      memberId: auth.state.member._id,
      amount: points,
      description: description.value || `消费${amount.value}元`
    })

    if (res.data.code === 0) {
      resultSuccess.value = true
      resultMessage.value = `消费记录成功！获得 ${points} 积分`
      auth.updateMember({ points: res.data.data.points })
      amount.value = 0
      description.value = ''
      await loadConsumeLogs()
    } else {
      resultSuccess.value = false
      resultMessage.value = res.data.message || '记录失败'
    }
  } catch (error) {
    resultSuccess.value = false
    resultMessage.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
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

.points-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 32px;
  border-radius: 12px;
  color: white;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-label {
  font-size: 1rem;
  opacity: 0.9;
}

.points-value {
  font-size: 2rem;
  font-weight: 700;
}

.consume-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.consume-card h3 {
  margin: 0 0 8px;
  color: #333;
}

.tip {
  color: #667eea;
  font-size: 0.9rem;
  margin: 0 0 24px;
}

.consume-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.error-msg {
  color: #e74c3c;
  font-size: 0.85rem;
}

.points-preview {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  text-align: center;
  font-size: 1rem;
  color: #333;
}

.preview-points {
  color: #10b981;
  font-weight: 700;
  font-size: 1.2rem;
  margin-left: 8px;
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

.recent-section h3 {
  margin: 0 0 16px;
  color: #333;
}

.empty-record {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: #999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
</style>
