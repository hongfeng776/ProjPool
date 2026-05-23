<template>
  <div class="movie-list">
    <div class="header card">
      <h1>🎬 已看电影</h1>
      <div class="filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索电影..."
          class="search-input"
        />
        <select v-model="selectedGenre" class="filter-select">
          <option value="">全部类型</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.name">
            {{ genre.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="filteredMovies.length" class="movie-grid grid grid-4">
      <div
        v-for="movie in filteredMovies"
        :key="movie.id"
        class="movie-card card"
        @click="goToDetail(movie.id)"
      >
        <div class="movie-poster">
          <span v-if="!movie.poster" class="no-poster">🎞️</span>
          <img v-else :src="movie.poster" :alt="movie.title" />
          <div class="movie-status" :class="movie.status">
            {{ movie.status === 'watched' ? '已看' : '想看' }}
          </div>
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
          <button
            class="btn-delete"
            @click.stop="deleteMovie(movie)"
            title="删除电影"
          >
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <div class="empty-icon">📭</div>
      <h3>暂无电影记录</h3>
      <p>快去添加你看过的电影吧！</p>
      <router-link to="/add" class="btn btn-primary">
        + 添加第一部电影
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
const genres = ref([])
const searchQuery = ref('')
const selectedGenre = ref('')

const filteredMovies = computed(() => {
  return movies.value
    .filter(m => m.status === 'watched')
    .filter(m => {
      const matchSearch = m.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchGenre = !selectedGenre.value || m.genre.includes(selectedGenre.value)
      return matchSearch && matchGenre
    })
})

const fetchMovies = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/movies')
    movies.value = response.data
  } catch (error) {
    console.error('获取电影列表失败:', error)
  }
}

const fetchGenres = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/genres')
    genres.value = response.data
  } catch (error) {
    console.error('获取类型列表失败:', error)
  }
}

const goToDetail = (id) => {
  router.push(`/movies/${id}`)
}

const deleteMovie = async (movie) => {
  if (!confirm(`确定要删除电影「${movie.title}」吗？`)) {
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
  fetchGenres()
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

.filters {
  display: flex;
  gap: 15px;
}

.search-input {
  width: 250px;
}

.filter-select {
  width: 150px;
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
}

.movie-status.watched {
  background: #27ae60;
  color: white;
}

.movie-status.wishlist {
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
}

.genre-tag {
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #666;
}

.btn-delete {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #ff3838;
  transform: translateY(-1px);
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

  .filters {
    width: 100%;
  }

  .search-input,
  .filter-select {
    flex: 1;
  }
}
</style>
