<template>
  <div class="wishlist">
    <div class="header card">
      <h1>📋 想看清单</h1>
      <div class="filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索电影..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="wishlistMovies.length" class="movie-grid grid grid-4">
      <div
        v-for="movie in wishlistMovies"
        :key="movie.id"
        class="movie-card card"
        @click="goToDetail(movie.id)"
      >
        <div class="movie-poster">
          <span v-if="!movie.poster" class="no-poster">🎞️</span>
          <img v-else :src="movie.poster" :alt="movie.title" />
          <div class="movie-status wishlist">想看</div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <p class="movie-director">{{ movie.director }}</p>
          <div class="movie-meta">
            <span class="movie-year">{{ movie.year }}</span>
            <span class="movie-rating">⭐ {{ movie.rating }}</span>
          </div>
          <div class="movie-genres">
            <span
              v-for="(g, index) in movie.genre.slice(0, 2)"
              :key="index"
              class="genre-tag"
            >
              {{ g }}
            </span>
          </div>
          <div class="action-buttons">
            <button
              class="btn-mark-watched"
              @click.stop="markAsWatched(movie)"
            >
              ✅ 已看
            </button>
            <button
              class="btn-delete"
              @click.stop="deleteMovie(movie)"
              title="删除电影"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <div class="empty-icon">📝</div>
      <h3>想看清单是空的</h3>
      <p>发现好电影就加到清单里吧！</p>
      <router-link to="/add" class="btn btn-primary">
        + 添加想看的电影
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const movies = ref([])
const searchQuery = ref('')

const wishlistMovies = computed(() => {
  return movies.value
    .filter(m => m.status === 'wishlist')
    .filter(m => m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const fetchMovies = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/movies')
    movies.value = response.data
  } catch (error) {
    console.error('获取电影列表失败:', error)
  }
}

const goToDetail = (id) => {
  router.push(`/movies/${id}`)
}

const markAsWatched = async (movie) => {
  try {
    await axios.put(`http://localhost:3000/api/movies/${movie.id}`, {
      ...movie,
      status: 'watched',
      watchDate: new Date().toISOString().split('T')[0]
    })
    await fetchMovies()
    alert('已标记为已观看！')
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

const deleteMovie = async (movie) => {
  if (!confirm(`确定要从想看清单中删除「${movie.title}」吗？`)) {
    return
  }

  try {
    await axios.delete(`http://localhost:3000/api/movies/${movie.id}`)
    alert('删除成功！')
    await fetchMovies()
  } catch (error) {
    console.error('删除电影失败:', error)
    let errorMsg = '删除失败，请重试'
    if (error.response) {
      errorMsg = error.response.data.error || errorMsg
    } else if (error.request) {
      errorMsg = '无法连接到服务器，请确保后端服务已启动'
    }
    alert(errorMsg)
  }
}

onMounted(() => {
  fetchMovies()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
}

.search-input {
  width: 250px;
}

.movie-grid {
  margin-top: 20px;
}

.movie-card {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster {
  font-size: 60px;
}

.movie-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #f39c12;
  color: white;
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

.movie-director {
  color: #888;
  font-size: 13px;
  margin-bottom: 10px;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.movie-year {
  color: #666;
  font-size: 13px;
}

.movie-rating {
  color: #f39c12;
  font-weight: 500;
  font-size: 14px;
}

.movie-genres {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.genre-tag {
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-mark-watched {
  flex: 1;
  padding: 8px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-mark-watched:hover {
  background: #219a52;
}

.btn-delete {
  width: 40px;
  padding: 8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #ff3838;
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #888;
  margin-bottom: 25px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }
}
</style>
