<template>
  <div class="books">
    <div class="container">
      <div class="page-header">
        <h2 class="page-title">📚 我的书架</h2>
        <button class="btn btn-primary" @click="showAddModal = true">+ 添加书籍</button>
      </div>

      <div class="books-grid">
        <div v-for="book in books" :key="book.id" class="book-card">
          <img :src="book.cover" :alt="book.title" class="book-cover">
          <div class="book-content">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <div class="book-meta">
              <span class="book-status" :class="book.status">
                {{ getStatusText(book.status) }}
              </span>
              <span class="capsule-count" @click="toggleRecords(book.id)">
                💊 {{ bookCapsulesCount[book.id] || 0 }} 个胶囊
              </span>
            </div>
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress" :style="{ width: getProgressPercent(book) + '%' }"></div>
              </div>
              <span class="progress-text">{{ book.currentPage }} / {{ book.totalPages }} 页 ({{ getProgressPercent(book) }}%)</span>
            </div>
            <div class="book-actions">
              <button class="btn btn-primary btn-sm" @click="openRecordModal(book)">📝 记录阅读</button>
              <button class="btn btn-secondary btn-sm" @click="openCapsuleModal(book)">💊 时间胶囊</button>
              <button class="btn btn-danger btn-sm" @click="deleteBook(book.id)">删除</button>
            </div>
            <button class="view-records-btn" @click="toggleRecords(book.id)">
              {{ expandedBook === book.id ? '收起记录 ▲' : '查看记录 ▼' }}
            </button>
          </div>
          <div v-if="expandedBook === book.id" class="book-records">
            <h4 class="records-title">阅读记录</h4>
            <div v-if="bookRecords[book.id] && bookRecords[book.id].length > 0" class="records-list">
              <div v-for="record in bookRecords[book.id]" :key="record.id" class="record-item">
                <div class="record-date">{{ record.date }}</div>
                <div class="record-details">
                  <span class="record-pages">📄 {{ record.pages }} 页</span>
                  <span class="record-duration">⏱️ {{ record.duration }} 分钟</span>
                </div>
                <p v-if="record.note" class="record-note">{{ record.note }}</p>
              </div>
            </div>
            <p v-else class="no-records">暂无阅读记录</p>
          </div>
        </div>
      </div>

      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <h3 class="modal-title">添加新书</h3>
          <div class="form-group">
            <label>书名 *</label>
            <input v-model="newBook.title" type="text" class="form-input" placeholder="请输入书名">
          </div>
          <div class="form-group">
            <label>作者 *</label>
            <input v-model="newBook.author" type="text" class="form-input" placeholder="请输入作者">
          </div>
          <div class="form-group">
            <label>总页数</label>
            <input v-model.number="newBook.totalPages" type="number" class="form-input" placeholder="请输入总页数">
          </div>
          <div class="form-group">
            <label>封面图片URL</label>
            <input v-model="newBook.cover" type="text" class="form-input" placeholder="可选，留空自动生成">
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
            <button class="btn btn-primary" @click="addBook">添加</button>
          </div>
        </div>
      </div>

      <div v-if="showRecordModal" class="modal-overlay" @click.self="showRecordModal = false">
        <div class="modal">
          <h3 class="modal-title">记录阅读 - {{ currentBook?.title }}</h3>
          <div class="form-group">
            <label>阅读页数 *</label>
            <input v-model.number="readingRecord.pages" type="number" class="form-input" placeholder="本次阅读页数">
          </div>
          <div class="form-group">
            <label>阅读时长（分钟）</label>
            <input v-model.number="readingRecord.duration" type="number" class="form-input" placeholder="阅读时长">
          </div>
          <div class="form-group">
            <label>阅读笔记</label>
            <textarea v-model="readingRecord.note" class="form-input" rows="3" placeholder="记录你的阅读感想..."></textarea>
          </div>
          <div class="progress-preview">
            <span>当前进度: {{ currentBook?.currentPage }} / {{ currentBook?.totalPages }} 页</span>
            <span v-if="readingRecord.pages > 0"> → 新增后: {{ Math.min(currentBook?.currentPage + readingRecord.pages, currentBook?.totalPages) }} 页</span>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showRecordModal = false">取消</button>
            <button class="btn btn-primary" @click="saveReadingRecord">保存记录</button>
          </div>
        </div>
      </div>

      <div v-if="showCapsuleModal" class="modal-overlay" @click.self="showCapsuleModal = false">
        <div class="modal">
          <h3 class="modal-title">💊 创建时间胶囊 - {{ currentBook?.title }}</h3>
          <div class="form-group">
            <label>胶囊标题 *</label>
            <input v-model="newCapsule.title" type="text" class="form-input" placeholder="给胶囊起个名字">
          </div>
          <div class="form-group">
            <label>胶囊内容 *</label>
            <textarea v-model="newCapsule.content" class="form-input" rows="4" placeholder="写下你想对未来说的话..."></textarea>
          </div>
          <div class="form-group">
            <label>解锁时间 *</label>
            <input v-model="newCapsule.openDate" type="date" class="form-input">
            <p class="form-hint">选择一个未来的日期，到那时才能打开这个胶囊</p>
          </div>
          <div class="form-group">
            <label>当前心情</label>
            <div class="mood-selector">
              <button 
                v-for="mood in moods" 
                :key="mood.value" 
                class="mood-btn" 
                :class="{ active: newCapsule.mood === mood.value }"
                @click="newCapsule.mood = mood.value"
                type="button"
              >
                {{ mood.emoji }} {{ mood.label }}
              </button>
            </div>
          </div>
          <div class="capsule-preview">
            <p class="preview-text">📦 这个胶囊将在 {{ newCapsule.openDate }} 解锁</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showCapsuleModal = false">取消</button>
            <button class="btn btn-primary" @click="saveBookCapsule">封存胶囊</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getBooks, addBook as apiAddBook, deleteBook as apiDeleteBook, getBookCapsulesCount } from '../api'
import { addReadingRecord, getBookReadingRecords } from '../api'
import { addCapsule } from '../api'

const books = ref([])
const bookRecords = ref({})
const bookCapsulesCount = ref({})
const expandedBook = ref(null)
const showAddModal = ref(false)
const showRecordModal = ref(false)
const showCapsuleModal = ref(false)
const currentBook = ref(null)

const newBook = reactive({
  title: '',
  author: '',
  totalPages: 0,
  cover: ''
})

const readingRecord = reactive({
  pages: 0,
  duration: 0,
  note: ''
})

const newCapsule = reactive({
  title: '',
  content: '',
  openDate: '',
  mood: 'inspired'
})

const moods = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'inspired', emoji: '✨', label: '灵感' },
  { value: 'thoughtful', emoji: '🤔', label: '深思' },
  { value: 'peaceful', emoji: '😌', label: '平静' },
  { value: 'excited', emoji: '🎉', label: '激动' },
  { value: 'nostalgic', emoji: '💭', label: '怀旧' }
]

const getStatusText = (status) => {
  const statusMap = {
    pending: '待开始',
    reading: '阅读中',
    completed: '已完成'
  }
  return statusMap[status] || status
}

const getProgressPercent = (book) => {
  if (!book.totalPages) return 0
  return Math.round((book.currentPage / book.totalPages) * 100)
}

const loadBooks = async () => {
  try {
    const res = await getBooks()
    books.value = res.data
    books.value.forEach(book => {
      loadCapsulesCount(book.id)
    })
  } catch (error) {
    console.error('加载书籍失败:', error)
  }
}

const loadCapsulesCount = async (bookId) => {
  try {
    const res = await getBookCapsulesCount(bookId)
    bookCapsulesCount.value[bookId] = res.data.count
  } catch (error) {
    console.error('加载胶囊数量失败:', error)
  }
}

const addBook = async () => {
  if (!newBook.title || !newBook.author) {
    alert('请填写书名和作者')
    return
  }
  try {
    const bookData = {
      ...newBook,
      cover: newBook.cover || `https://picsum.photos/seed/${Date.now()}/200/300`
    }
    await apiAddBook(bookData)
    showAddModal.value = false
    Object.assign(newBook, { title: '', author: '', totalPages: 0, cover: '' })
    loadBooks()
  } catch (error) {
    console.error('添加书籍失败:', error)
  }
}

const openRecordModal = (book) => {
  currentBook.value = book
  readingRecord.pages = 0
  readingRecord.duration = 0
  readingRecord.note = ''
  showRecordModal.value = true
}

const openCapsuleModal = (book) => {
  currentBook.value = book
  newCapsule.title = `《${book.title}》- 给未来的自己`
  newCapsule.content = ''
  newCapsule.openDate = getDefaultOpenDate()
  newCapsule.mood = 'inspired'
  showCapsuleModal.value = true
}

const getDefaultOpenDate = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return formatLocalDate(date)
}

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const saveBookCapsule = async () => {
  if (!newCapsule.title || !newCapsule.content) {
    alert('请填写胶囊标题和内容')
    return
  }
  try {
    await addCapsule({
      title: newCapsule.title,
      content: newCapsule.content,
      bookId: currentBook.value.id,
      bookTitle: currentBook.value.title,
      openDate: newCapsule.openDate,
      mood: newCapsule.mood
    })
    showCapsuleModal.value = false
    loadCapsulesCount(currentBook.value.id)
    alert('时间胶囊创建成功！')
  } catch (error) {
    console.error('创建时间胶囊失败:', error)
  }
}

const saveReadingRecord = async () => {
  if (!readingRecord.pages || readingRecord.pages <= 0) {
    alert('请输入有效的阅读页数')
    return
  }
  try {
    await addReadingRecord({
      bookId: currentBook.value.id,
      bookTitle: currentBook.value.title,
      pages: readingRecord.pages,
      duration: readingRecord.duration,
      note: readingRecord.note
    })
    showRecordModal.value = false
    loadBooks()
    if (expandedBook.value === currentBook.value.id) {
      loadBookRecords(currentBook.value.id)
    }
  } catch (error) {
    console.error('保存阅读记录失败:', error)
  }
}

const toggleRecords = async (bookId) => {
  if (expandedBook.value === bookId) {
    expandedBook.value = null
  } else {
    expandedBook.value = bookId
    await loadBookRecords(bookId)
  }
}

const loadBookRecords = async (bookId) => {
  try {
    const res = await getBookReadingRecords(bookId)
    bookRecords.value[bookId] = res.data
  } catch (error) {
    console.error('加载阅读记录失败:', error)
  }
}

const deleteBook = async (id) => {
  if (!confirm('确定要删除这本书吗？')) return
  try {
    await apiDeleteBook(id)
    loadBooks()
  } catch (error) {
    console.error('删除书籍失败:', error)
  }
}

onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  color: white;
  font-size: 1.8rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.book-content {
  padding: 1.25rem;
}

.book-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.book-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.book-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.book-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.book-status.reading {
  background: #dbeafe;
  color: #2563eb;
}

.book-status.completed {
  background: #d1fae5;
  color: #059669;
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.view-records-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: #f3f4f6;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.view-records-btn:hover {
  background: #e5e7eb;
}

.book-records {
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}

.records-title {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.records-list {
  max-height: 250px;
  overflow-y: auto;
}

.record-item {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.record-date {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.record-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.record-pages, .record-duration {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

.record-note {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
  padding-top: 0.5rem;
  border-top: 1px dashed #e5e7eb;
}

.no-records {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  padding: 1rem;
}

.progress-preview {
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #555;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.capsule-count {
  font-size: 0.8rem;
  color: #764ba2;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: #f3e8ff;
  transition: background 0.3s;
}

.capsule-count:hover {
  background: #e9d5ff;
}

.form-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}

.mood-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.mood-btn {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.mood-btn:hover {
  border-color: #667eea;
}

.mood-btn.active {
  border-color: #667eea;
  background: #f0f4ff;
  color: #667eea;
}

.capsule-preview {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 2px dashed #667eea;
  text-align: center;
}

.preview-text {
  color: #667eea;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #d0d0d0;
}
</style>
