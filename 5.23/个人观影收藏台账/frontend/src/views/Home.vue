<template>
  <div class="home">
    <div class="welcome-card card">
      <h1>欢迎回来！👋</h1>
      <p>记录你的观影历程，分享你的观影感受</p>
    </div>

    <div class="stats-grid grid grid-3">
      <div class="stat-card card">
        <div class="stat-icon">🎬</div>
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">总收藏</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">✅</div>
        <div class="stat-number">{{ stats.watched }}</div>
        <div class="stat-label">已观看</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">📋</div>
        <div class="stat-number">{{ stats.wishlist }}</div>
        <div class="stat-label">想看</div>
      </div>
    </div>

    <div class="section card">
      <div class="section-header">
        <h2>最近添加</h2>
        <router-link to="/movies" class="view-all">查看全部 →</router-link>
      </div>
      <div v-if="recentMovies.length" class="movie-grid grid grid-4">
        <div v-for="movie in recentMovies" :key="movie.id" class="movie-card">
          <div class="movie-poster">
            <span v-if="!movie.poster" class="no-poster">🎞️</span>
            <img v-else :src="movie.poster" :alt="movie.title" />
          </div>
          <div class="movie-info">
            <h3 class="movie-title">{{ movie.title }}</h3>
            <p class="movie-year">{{ movie.year }}</p>
            <div class="movie-rating">
              <span>⭐</span> {{ movie.rating }}
            </div>
          </div>
        </div>
      </div>
      <p v-else class="empty-text">暂无电影记录，快去添加吧！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
  total: 0,
  watched: 0,
  wishlist: 0
})

const recentMovies = ref([])

const fetchStats = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/stats')
    stats.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentMovies = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/movies')
    recentMovies.value = response.data.slice(0, 4)
  } catch (error) {
    console.error('获取最近电影失败:', error)
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentMovies()
})
</script>

<style scoped>
.welcome-card {
  text-align: center;
  padding: 40px;
}

.welcome-card h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #333;
}

.welcome-card p {
  color: #666;
  font-size: 16px;
}

.stats-grid {
  margin: 30px 0;
}

.stat-card {
  text-align: center;
  padding: 30px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: #666;
  margin-top: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 22px;
  color: #333;
}

.view-all {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.movie-grid {
  margin-top: 20px;
}

.movie-card {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster {
  font-size: 50px;
}

.movie-info {
  padding: 15px;
}

.movie-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-year {
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

.movie-rating {
  font-size: 14px;
  color: #f39c12;
  font-weight: 500;
}

.empty-text {
  text-align: center;
  color: #888;
  padding: 40px;
}
</style>
