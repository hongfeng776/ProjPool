<template>
  <div class="page-container">
    <h2>会员注册</h2>
    <div class="register-card">
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>姓名</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="请输入会员姓名"
            class="form-input"
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>手机号</label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="请输入11位手机号码"
            maxlength="11"
            class="form-input"
          />
          <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            class="form-input"
          />
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="form-input"
          />
          <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? '注册中...' : '立即注册' }}
        </button>

        <div v-if="resultMessage" :class="['result-msg', resultSuccess ? 'success' : 'error']">
          {{ resultMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'

const form = reactive({
  name: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const submitting = ref(false)
const resultMessage = ref('')
const resultSuccess = ref(false)

const validatePhone = (phone) => {
  if (!phone) {
    return '手机号不能为空'
  }
  if (!/^\d+$/.test(phone)) {
    return '手机号必须是纯数字'
  }
  if (phone.length !== 11) {
    return `手机号长度必须为11位，当前${phone.length}位`
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return '手机号格式不正确，请输入正确的11位手机号'
  }
  return ''
}

const validateForm = () => {
  let valid = true
  errors.name = ''
  errors.phone = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.name.trim()) {
    errors.name = '姓名不能为空'
    valid = false
  }

  const phoneError = validatePhone(form.phone.trim())
  if (phoneError) {
    errors.phone = phoneError
    valid = false
  }

  if (!form.password) {
    errors.password = '密码不能为空'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    valid = false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    valid = false
  }

  return valid
}

const handleRegister = async () => {
  resultMessage.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const res = await axios.post('/api/members', {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password
    })

    if (res.data.code === 0) {
      resultSuccess.value = true
      resultMessage.value = '注册成功！'
      form.name = ''
      form.phone = ''
    } else {
      resultSuccess.value = false
      resultMessage.value = res.data.message || '注册失败'
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

.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 500px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
</style>
