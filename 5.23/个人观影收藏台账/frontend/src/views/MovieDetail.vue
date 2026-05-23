<template>
  <div class="movie-detail" v-if="movie">
    <button class="back-btn" @click="goBack">← 返回</button>

    <div class="detail-card card">
      <div class="detail-content">
        <div class="poster-section">
          <div class="movie-poster">
            <span v-if="!movie.poster" class="no-poster">🎞️</span>
            <img v-else :src="movie.poster" :alt="movie.title" />
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="editMovie">✏️ 编辑</button>
            <button class="btn btn-danger" @click="deleteMovie">🗑️ 删除</button>
          </div>
        </div>

        <div class="info-section">
          <h1 class="movie-title">{{ movie.title }}</h1>
          <div class="movie-badges">
            <span class="badge status" :class="movie.status">
              {{ movie.status === 'watched' ? '已观看' : '想看' }}
            </span>
            <span v-for="g in movie.genre" :key="g" class="badge genre">
              {{ g }}
            </span>
          </div>

          <div class="movie-stats">
            <div class="stat-item">
              <span class="stat-label">年份</span>
              <span class="stat-value">{{ movie.year }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">导演</span>
              <span class="stat-value">{{ movie.director }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">豆瓣评分</span>
              <span class="stat-value rating">⭐ {{ movie.rating }}</span>
            </div>
            <div v-if="movie.status === 'watched'" class="stat-item">
              <span class="stat-label">我的评分</span>
              <span class="stat-value my-rating">🌟 {{ movie.myRating || '-' }}</span>
            </div>
            <div v-if="movie.watchDate" class="stat-item">
              <span class="stat-label">观看日期</span>
              <span class="stat-value">{{ movie.watchDate }}</span>
            </div>
          </div>

          <div v-if="movie.comment" class="comment-section">
            <h3>💭 我的观后感</h3>
            <p class="comment-text">{{ movie.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading card">
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const movie = ref(null)

const fetchMovie = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/movies/${route.params.id}`)
    movie.value = response.data
  } catch (error) {
    console.error('获取电影详情失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const editMovie = () => {
  alert('编辑功能待实现')
}

const deleteMovie = async () => {
  if (confirm('确定要删除这部电影吗？')) {
    try {
      await axios.delete(`http://localhost:3000/api/movies/${route.params.id}`)
      router.push('/movies')
    } catch (error) {
      console.error('删除电影失败:', error)
    }
  }
}

onMounted(() => {
  fetchMovie()
})
</script>

<style scoped>
.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 10px 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-card {
  padding: 30px;
}

.detail-content {
  display: flex;
  gap: 40px;
}

.poster-section {
  flex-shrink: 0;
}

.movie-poster {
  width: 280px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
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
  font-size: 80px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-buttons .btn {
  flex: 1;
}

.info-section {
  flex: 1;
}

.movie-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
}

.movie-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.badge.status.watched {
  background: #27ae60;
  color: white;
}

.badge.status.wishlist {
  background: #f39c12;
  color: white;
}

.badge.genre {
  background: #f0f0f0;
  color: #666;
}

.movie-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  color: #888;
  font-size: 13px;
}

.stat-value {
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.stat-value.rating {
  color: #f39c12;
}

.stat-value.my-rating {
  color: #e74c3c;
}

.comment-section h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 18px;
}

.comment-text {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  color: #555;
  line-height: 1.8;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #888;
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
  }

  .poster-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .movie-stats {
    grid-template-columns: 1fr;
  }
}
</style>
