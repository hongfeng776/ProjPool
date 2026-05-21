<template>
  <div class="page-container">
    <h2>积分兑换</h2>
    
    <div v-if="!auth.state.member" class="not-logged-in">
      <p>请先登录后兑换商品</p>
      <router-link to="/login" class="btn-login">去登录</router-link>
    </div>

    <div v-else>
      <div class="points-banner">
        <span class="points-label">当前积分</span>
        <span class="points-value">{{ auth.state.member.points }}</span>
      </div>

      <div class="product-grid">
        <div 
          v-for="product in products" 
          :key="product._id" 
          class="product-card"
          :class="{ disabled: auth.state.member.points < product.points || product.stock <= 0 }"
        >
          <div class="product-image">{{ product.image || '🎁' }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <p class="product-points">{{ product.points }} 积分</p>
            <p v-if="product.stock <= 0" class="product-stock">已兑完</p>
          </div>
          <button 
            class="btn-exchange" 
            :disabled="exchangingId === product._id || auth.state.member.points < product.points || product.stock <= 0"
            @click="handleExchange(product)"
          >
            {{ exchangingId === product._id ? '兑换中...' : '立即兑换' }}
          </button>
        </div>
      </div>

      <div v-if="exchangeResult" :class="['result-msg', exchangeSuccess ? 'success' : 'error']">
        {{ exchangeResult }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import auth from '@/utils/auth'

const products = ref([])
const exchangingId = ref(null)
const exchangeResult = ref('')
const exchangeSuccess = ref(false)

onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  try {
    await axios.get('/api/products/init')
    const res = await axios.get('/api/products')
    products.value = res.data.data || []
  } catch (error) {
    console.error('加载商品失败:', error)
  }
}

const handleExchange = async (product) => {
  if (auth.state.member.points < product.points) {
    exchangeResult.value = `积分不足，需要 ${product.points} 积分`
    exchangeSuccess.value = false
    return
  }

  exchangingId.value = product._id
  exchangeResult.value = ''

  try {
    const res = await axios.post('/api/products/exchange', {
      memberId: auth.state.member._id,
      productId: product._id
    })

    if (res.data.code === 0) {
      exchangeSuccess.value = true
      exchangeResult.value = `兑换成功！消耗 ${product.points} 积分`
      auth.updateMember({ points: res.data.data.points })
      await loadProducts()
    } else {
      exchangeSuccess.value = false
      exchangeResult.value = res.data.message || '兑换失败'
    }
  } catch (error) {
    exchangeSuccess.value = false
    exchangeResult.value = error.response?.data?.message || '网络错误，请稍后重试'
  } finally {
    exchangingId.value = null
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.product-card.disabled {
  opacity: 0.6;
}

.product-image {
  font-size: 3rem;
  margin-bottom: 12px;
}

.product-info {
  flex: 1;
  margin-bottom: 16px;
}

.product-name {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #333;
}

.product-desc {
  margin: 0 0 8px;
  color: #888;
  font-size: 0.85rem;
}

.product-points {
  margin: 0;
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
}

.product-stock {
  margin: 4px 0 0;
  color: #e74c3c;
  font-size: 0.85rem;
}

.btn-exchange {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-exchange:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-exchange:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-msg {
  margin-top: 20px;
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
