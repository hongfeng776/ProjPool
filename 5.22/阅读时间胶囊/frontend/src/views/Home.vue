<template>
  <div class="home">
    <div class="container">
      <div class="hero">
        <h2 class="hero-title">📚 阅读时间胶囊</h2>
        <p class="hero-subtitle">记录每一次阅读，珍藏每一份感动</p>
      </div>

      <div v-if="unlockingSoon.length > 0" class="reminder-banner">
        <div class="reminder-icon">⏰</div>
        <div class="reminder-content">
          <h3 class="reminder-title">即将解锁的时间胶囊</h3>
          <div class="reminder-list">
            <div v-for="capsule in unlockingSoon" :key="capsule.id" class="reminder-item">
              <span class="reminder-capsule-title">{{ capsule.title }}</span>
              <span class="reminder-countdown" :class="{ urgent: getDaysUntilUnlock(capsule.openDate) <= 1 }">
                {{ getCountdownText(capsule.openDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalBooks }}</div>
            <div class="stat-label">书籍总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalDuration }}</div>
            <div class="stat-label">阅读分钟</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPages }}</div>
            <div class="stat-label">阅读页数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💊</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCapsules }}</div>
            <div class="stat-label">时间胶囊</div>
          </div>
        </div>
      </div>

      <div v-if="readingBooks.length > 0" class="progress-overview">
        <h3 class="section-title">📊 阅读进度概览</h3>
        <div class="progress-overview-cards">
          <div v-for="book in readingBooks" :key="book.id" class="progress-overview-card">
            <img :src="book.cover" :alt="book.title" class="progress-book-cover">
            <div class="progress-overview-info">
              <h4 class="progress-book-title">{{ book.title }}</h4>
              <div class="circular-progress">
                <svg class="progress-ring" width="80" height="80">
                  <circle class="progress-ring-bg" cx="40" cy="40" r="35"></circle>
                  <circle 
                    class="progress-ring-circle" 
                    cx="40" cy="40" r="35"
                    :style="{ strokeDasharray: 220, strokeDashoffset: 220 - (220 * getProgressPercent(book)) / 100 }"
                  ></circle>
                </svg>
                <div class="progress-percentage">{{ getProgressPercent(book) }}%</div>
              </div>
              <p class="progress-pages">{{ book.currentPage }} / {{ book.totalPages }} 页</p>
            </div>
          </div>
        </div>
      </div>

      <div class="sections">
        <div class="section-card">
          <h3 class="section-title">📚 正在阅读</h3>
          <div v-if="readingBooks.length > 0" class="book-list">
            <div v-for="book in readingBooks" :key="book.id" class="book-item">
              <img :src="book.cover" :alt="book.title" class="book-cover">
              <div class="book-info">
                <h4 class="book-title">{{ book.title }}</h4>
                <p class="book-author">{{ book.author }}</p>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgressPercent(book) + '%' }"></div>
                </div>
                <div class="progress-meta">
                  <span class="progress-text">{{ book.currentPage }} / {{ book.totalPages }} 页</span>
                  <span class="progress-percent">{{ getProgressPercent(book) }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-icon">📖</p>
            <p>暂无正在阅读的书籍</p>
            <router-link to="/books" class="empty-link">去书架添加书籍 →</router-link>
          </div>
        </div>

        <div class="section-card">
          <h3 class="section-title">💊 时间胶囊动态</h3>
          <div v-if="recentCapsules.length > 0" class="capsule-list">
            <div v-for="capsule in recentCapsules" :key="capsule.id" class="capsule-item" :class="{ 'can-unlock': canUnlockNow(capsule) && !capsule.isOpened }">
              <div class="capsule-icon">
                <span v-if="capsule.isOpened">📭</span>
                <span v-else-if="canUnlockNow(capsule)">🔓</span>
                <span v-else>📦</span>
              </div>
              <div class="capsule-info">
                <h4 class="capsule-title">{{ capsule.title }}</h4>
                <p class="capsule-meta">《{{ capsule.bookTitle }}》 · {{ capsule.createdAt }}</p>
                <p v-if="capsule.isOpened" class="capsule-content">{{ capsule.content }}</p>
                <div v-else-if="canUnlockNow(capsule)" class="capsule-unlock-now">
                  <span class="unlock-text">🎉 已到解锁时间！</span>
                </div>
                <p v-else class="capsule-locked">
                  🔒 开启时间: {{ capsule.openDate }}
                  <span class="days-left">(还有 {{ getDaysUntilUnlock(capsule.openDate) }} 天)</span>
                </p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-icon">💊</p>
            <p>暂无时间胶囊</p>
            <router-link to="/capsules" class="empty-link">创建第一个胶囊 →</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getBooks, getReadingStats, getCapsules, openCapsule } from '../api'

const stats = ref({
  totalBooks: 0,
  totalDuration: 0,
  totalPages: 0,
  totalCapsules: 0
})

const books = ref([])
const capsules = ref([])
const unlockingSoon = ref([])

const readingBooks = computed(() => {
  return books.value.filter(b => b.status === 'reading').slice(0, 3)
})

const recentCapsules = computed(() => {
  return capsules.value.slice(0, 3)
})

const getProgressPercent = (book) => {
  if (!book.totalPages) return 0
  return Math.round((book.currentPage / book.totalPages) * 100)
}

const getDaysUntilUnlock = (openDate) => {
  if (!openDate) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const unlock = new Date(openDate)
  unlock.setHours(0, 0, 0, 0)
  const diffTime = unlock - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const canUnlockNow = (capsule) => {
  if (!capsule.openDate) return false
  return getDaysUntilUnlock(capsule.openDate) <= 0
}

const getCountdownText = (openDate) => {
  const days = getDaysUntilUnlock(openDate)
  if (days < 0) return '已过期'
  if (days === 0) return '今天解锁！'
  if (days === 1) return '明天解锁'
  return `${days} 天后解锁`
}

const loadData = async () => {
  try {
    const [booksRes, statsRes, capsulesRes] = await Promise.all([
      getBooks(),
      getReadingStats(),
      getCapsules()
    ])

    books.value = booksRes.data
    stats.value.totalBooks = booksRes.data.length
    stats.value.totalDuration = statsRes.data.totalDuration
    stats.value.totalPages = statsRes.data.totalPages
    stats.value.totalCapsules = capsulesRes.data.length
    capsules.value = capsulesRes.data

    const lockedCapsules = capsulesRes.data.filter(c => !c.isOpened && c.openDate)
    unlockingSoon.value = lockedCapsules
      .filter(c => getDaysUntilUnlock(c.openDate) <= 7 && getDaysUntilUnlock(c.openDate) >= 0)
      .sort((a, b) => getDaysUntilUnlock(a.openDate) - getDaysUntilUnlock(b.openDate))
      .slice(0, 3)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 2rem 0;
  color: white;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.reminder-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(255, 107, 107, 0.5); }
}

.reminder-icon {
  font-size: 2.5rem;
  animation: shake 1s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.reminder-capsule-title {
  color: white;
  font-weight: 500;
}

.reminder-countdown {
  color: white;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.reminder-countdown.urgent {
  background: rgba(255, 0, 0, 0.4);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.progress-overview {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}

.progress-overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.progress-overview-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  align-items: center;
}

.progress-book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.progress-overview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.progress-book-title {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.circular-progress {
  position: relative;
  width: 80px;
  height: 80px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 6;
}

.progress-ring-circle {
  fill: none;
  stroke: url(#gradient);
  stroke: linear-gradient(90deg, #667eea, #764ba2);
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
  stroke: #667eea;
}

.progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: bold;
  color: #667eea;
}

.progress-pages {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.book-item, .capsule-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
}

.capsule-item.can-unlock {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.capsule-unlock-now {
  margin-top: 0.5rem;
}

.unlock-text {
  color: #059669;
  font-weight: bold;
  font-size: 0.9rem;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

.book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.book-info, .capsule-info {
  flex: 1;
}

.book-title, .capsule-title {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.book-author, .capsule-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: bold;
  color: #667eea;
}

.capsule-icon {
  font-size: 2rem;
}

.capsule-content {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.capsule-locked {
  font-size: 0.85rem;
  color: #667eea;
}

.days-left {
  color: #f59e0b;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.empty-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.empty-link:hover {
  text-decoration: underline;
}
</style>
