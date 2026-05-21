<template>
  <div class="page-container">
    <div class="page-header">
      <h2>员工管理面板</h2>
      <div class="header-info">
        <span class="staff-name">{{ staffAuth.state.staff?.name }}</span>
        <span class="staff-role" :class="staffAuth.state.staff?.role">
          {{ staffAuth.state.staff?.role === 'admin' ? '管理员' : '普通员工' }}
        </span>
        <button class="btn-logout" @click="handleLogout">退出</button>
      </div>
    </div>

    <div v-if="!staffAuth.isStaffLoggedIn()" class="not-logged-in">
      <p>请先登录</p>
      <router-link to="/staff-login" class="btn-login">去登录</router-link>
    </div>

    <div v-else>
      <div class="panel-section">
        <h3>会员列表</h3>
        <div v-if="members.length === 0" class="empty-state">
          <p>暂无会员数据</p>
        </div>
        <div v-else class="member-list">
          <div v-for="member in members" :key="member._id" class="member-card">
            <div class="member-info">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-phone">{{ member.phone }}</div>
              <div class="member-level">{{ member.level }}</div>
            </div>
            <div class="member-points">
              <span class="points-label">积分</span>
              <span class="points-value">{{ member.points }}</span>
            </div>
            
            <div v-if="staffAuth.isAdmin()" class="member-actions">
              <button class="btn-adjust" @click="showAdjustModal(member)">调整积分</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedMember" class="modal-overlay" @click.self="closeAdjustModal">
        <div class="modal">
          <h3>调整积分 - {{ selectedMember.name }}</h3>
          <p class="current-points">当前积分: {{ selectedMember.points }}</p>
          <div class="form-group">
            <label>调整方式</label>
            <select v-model="adjustType" class="form-input">
              <option value="add">增加积分</option>
              <option value="subtract">扣减积分</option>
            </select>
          </div>
          <div class="form-group">
            <label>积分数值</label>
            <input
              v-model.number="adjustAmount"
              type="number"
              min="1"
              placeholder="请输入积分数量"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>备注（可选）</label>
            <input
              v-model="adjustDescription"
              type="text"
              placeholder="请输入备注说明"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeAdjustModal">取消</button>
            <button class="btn-confirm" :disabled="adjusting" @click="handleAdjust">
              {{ adjusting ? '调整中...' : '确认调整' }}
            </button>
          </div>
          <div v-if="adjustResult" :class="['result-msg', adjustSuccess ? 'success' : 'error']">
            {{ adjustResult }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import staffAuth from '@/utils/staffAuth'

const router = useRouter()
const members = ref([])
const selectedMember = ref(null)
const adjustType = ref('add')
const adjustAmount = ref(10)
const adjustDescription = ref('')
const adjusting = ref(false)
const adjustResult = ref('')
const adjustSuccess = ref(false)

onMounted(async () => {
  if (staffAuth.isStaffLoggedIn()) {
    await loadMembers()
  }
})

const loadMembers = async () => {
  try {
    const res = await axios.get('/api/staff/members', {
      headers: { 'x-staff-id': staffAuth.state.staff._id }
    })
    if (res.data.code === 0) {
      members.value = res.data.data || []
    }
  } catch (error) {
    console.error('加载会员列表失败:', error)
  }
}

const showAdjustModal = (member) => {
  selectedMember.value = { ...member }
  adjustType.value = 'add'
  adjustAmount.value = 10
  adjustDescription.value = ''
  adjustResult.value = ''
}

const closeAdjustModal = () => {
  selectedMember.value = null
  adjustResult.value = ''
}

const handleAdjust = async () => {
  if (!adjustAmount.value || adjustAmount.value <= 0) {
    adjustSuccess.value = false
    adjustResult.value = '请输入有效的积分数值'
    return
  }

  adjusting.value = true
  adjustResult.value = ''

  try {
    const points = adjustType.value === 'add' ? adjustAmount.value : -adjustAmount.value
    const res = await axios.put(
      `/api/staff/members/${selectedMember.value._id}/points`,
      { points, description: adjustDescription.value },
      { headers: { 'x-staff-id': staffAuth.state.staff._id } }
    )

    if (res.data.code === 0) {
      adjustSuccess.value = true
      adjustResult.value = `调整成功！当前积分: ${res.data.data.points}`
      await loadMembers()
      selectedMember.value.points = res.data.data.points
    } else {
      adjustSuccess.value = false
      adjustResult.value = res.data.message || '调整失败'
    }
  } catch (error) {
    adjustSuccess.value = false
    adjustResult.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    adjusting.value = false
  }
}

const handleLogout = () => {
  staffAuth.logout()
  router.push('/staff-login')
}
</script>

<style scoped>
.page-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staff-name {
  font-weight: 500;
  color: #333;
}

.staff-role {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.staff-role.admin {
  background: #fef3c7;
  color: #d97706;
}

.staff-role.staff {
  background: #dbeafe;
  color: #2563eb;
}

.btn-logout {
  padding: 8px 16px;
  background: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-logout:hover {
  background: #fef2f2;
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

.panel-section h3 {
  margin: 0 0 16px;
  color: #333;
}

.empty-state {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: #999;
}

.member-list {
  display: grid;
  gap: 16px;
}

.member-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.member-phone {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.member-level {
  color: #667eea;
  font-size: 0.85rem;
}

.member-points {
  text-align: center;
  padding: 0 20px;
}

.points-label {
  display: block;
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.points-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.btn-adjust {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-adjust:hover {
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
}

.modal h3 {
  margin: 0 0 16px;
  color: #333;
}

.current-points {
  color: #667eea;
  font-size: 1.1rem;
  margin: 0 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-confirm {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-msg {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.result-msg.success {
  background: #d4edda;
  color: #155724;
}

.result-msg.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
