<template>
  <div class="add-movie">
    <div class="form-card card">
      <h1>🎬 添加新电影</h1>

      <form @submit.prevent="submitForm" class="movie-form" novalidate>
        <div class="form-section">
          <h3>基本信息</h3>
          <div class="form-row grid grid-2">
            <div class="form-group" :class="{ error: errors.title }">
              <label>电影名称 *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="请输入电影名称"
                @blur="validateField('title')"
                :class="{ 'input-error': errors.title"
              />
              <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
            </div>
            <div class="form-group" :class="{ error: errors.year }">
              <label>上映年份 *</label>
              <input
                v-model.number="form.year"
                type="number"
                placeholder="请输入年份"
                min="1900"
                max="2100"
                @blur="validateField('year')"
                :class="{ 'input-error': errors.year"
              />
              <span v-if="errors.year" class="error-message">{{ errors.year }}</span>
            </div>
          </div>

          <div class="form-row grid grid-2">
            <div class="form-group" :class="{ error: errors.director }">
              <label>导演 *</label>
              <input
                v-model="form.director"
                type="text"
                placeholder="请输入导演姓名"
                @blur="validateField('director')"
                :class="{ 'input-error': errors.director"
              />
              <span v-if="errors.director" class="error-message">{{ errors.director }}</span>
            </div>
            <div class="form-group">
              <label>豆瓣评分</label>
              <input
                v-model.number="form.rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="0-10"
              />
            </div>
          </div>

          <div class="form-group">
            <label>海报链接</label>
            <input
              v-model="form.poster"
              type="url"
              placeholder="请输入图片URL"
            />
          </div>

          <div class="form-group" :class="{ error: errors.genre }">
            <label>电影类型 *</label>
            <div class="genre-checkboxes">
              <label
                v-for="genre in genres"
                :key="genre.id"
                class="genre-checkbox"
                :class="{ checked: form.genre.includes(genre.name) }"
              >
                <input
                  type="checkbox"
                  :value="genre.name"
                  v-model="form.genre"
                  @change="validateField('genre')"
                />
                <span>{{ genre.name }}</span>
              </label>
            </div>
            <span v-if="errors.genre" class="error-message">{{ errors.genre }}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>观影状态</h3>
          <div class="status-options">
            <label class="status-option">
              <input
                type="radio"
                v-model="form.status"
                value="wishlist"
              />
              <span class="status-label wishlist">📋 想看</span>
            </label>
            <label class="status-option">
              <input
                type="radio"
                v-model="form.status"
                value="watched"
              />
              <span class="status-label watched">✅ 已看</span>
            </label>
          </div>
        </div>

        <div v-if="form.status === 'watched'" class="form-section">
          <h3>观影记录</h3>
          <div class="form-row grid grid-2">
            <div class="form-group">
              <label>观看日期</label>
              <input
                v-model="form.watchDate"
                type="date"
              />
            </div>
            <div class="form-group">
              <label>我的评分</label>
              <input
                v-model.number="form.myRating"
                type="number"
                step="0.5"
                min="0"
                max="10"
                placeholder="0-10"
              />
            </div>
          </div>

          <div class="form-group">
            <label>观后感</label>
            <textarea
              v-model="form.comment"
              rows="4"
              placeholder="写下你的观影感受..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存电影' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { movieApi, genreApi } from '../api'

const router = useRouter()

const genres = ref([])
const submitting = ref(false)

const form = ref({
  title: '',
  year: new Date().getFullYear(),
  director: '',
  poster: '',
  rating: 0,
  genre: [],
  status: 'watched',
  watchDate: '',
  myRating: 0,
  comment: ''
})

const errors = reactive({
  title: '',
  year: '',
  director: '',
  genre: ''
})

const validateField = (field) => {
  switch (field) {
    case 'title':
      errors.title = form.value.title.trim() ? '' : '请输入电影名称'
      break
    case 'year':
      errors.year = form.value.year && form.value.year >= 1900 && form.value.year <= 2100 ? '' : '请输入有效的年份（1900-2100）'
      break
    case 'director':
      errors.director = form.value.director.trim() ? '' : '请输入导演姓名'
      break
    case 'genre':
      errors.genre = form.value.genre.length > 0 ? '' : '请至少选择一个电影类型'
      break
  }
  return !errors[field]
}

const validateForm = () => {
  let isValid = true
  const fields = ['title', 'year', 'director', 'genre']
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

const fetchGenres = async () => {
  try {
    const response = await genreApi.getAll()
    genres.value = response.data
  } catch (error) {
    console.error('获取类型列表失败:', error)
  }
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  try {
    const movieData = {
      ...form.value,
      createdAt: new Date().toISOString()
    }
    await movieApi.create(movieData)
    alert('添加成功！')
    router.push('/movies')
  } catch (error) {
    console.error('添加电影失败:', error)
    let errorMsg = '添加失败，请重试'
    if (error.response) {
      errorMsg = error.response.data.error || errorMsg
    } else if (error.message) {
      errorMsg = error.message
    }
    alert(errorMsg)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchGenres()
})
</script>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

.form-card h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  color: #667eea;
  margin-bottom: 20px;
  font-size: 18px;
}

.form-row {
  margin-bottom: 16px;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-error {
  border-color: #ff4757 !important;
}

.error-message {
  display: block;
  color: #ff4757;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 4px;
}

.genre-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.genre-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 18px;
  background: #f8f9fa;
  border-radius: 25px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.genre-checkbox:hover {
  background: #e9ecef;
}

.genre-checkbox.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.genre-checkbox.checked span {
  color: white;
}

.genre-checkbox input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  accent-color: white;
}

.genre-checkbox span {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.status-options {
  display: flex;
  gap: 20px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.status-option input[type="radio"] {
  width: auto;
  cursor: pointer;
  accent-color: #667eea;
}

.status-label {
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 15px;
}

.status-label.wishlist {
  background: #fff3cd;
  color: #856404;
}

.status-label.watched {
  background: #d4edda;
  color: #155724;
}

textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
</style>
