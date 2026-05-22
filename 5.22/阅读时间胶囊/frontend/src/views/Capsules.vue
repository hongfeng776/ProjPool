<template>
  <div class="capsules">
    <div class="container">
      <div class="page-header">
        <h2 class="page-title">💊 时间胶囊</h2>
        <button class="btn btn-primary" @click="showAddModal = true">+ 创建胶囊</button>
      </div>

      <div class="capsule-stats">
        <div class="stat-item">
          <span class="stat-num">{{ capsules.length }}</span>
          <span class="stat-label">全部胶囊</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ unlockedCount }}</span>
          <span class="stat-label">已开启</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ pendingCount }}</span>
          <span class="stat-label">待开启</span>
        </div>
        <div class="stat-item highlight">
          <span class="stat-num">{{ canUnlockCount }}</span>
          <span class="stat-label">可开启</span>
        </div>
      </div>

      <div class="capsules-grid">
        <div 
          v-for="capsule in capsules" 
          :key="capsule.id" 
          class="capsule-card" 
          :class="{ 
            opened: capsule.isOpened, 
            'can-unlock': !capsule.isOpened && canUnlockNow(capsule),
            'soon-unlock': !capsule.isOpened && !canUnlockNow(capsule) && getDaysUntilUnlock(capsule.openDate) <= 7
          }"
        >
          <div class="capsule-header">
            <div class="capsule-status">
              <span v-if="capsule.isOpened" class="status-badge opened">📭 已开启</span>
              <span v-else-if="canUnlockNow(capsule)" class="status-badge can-unlock">🔓 可开启</span>
              <span v-else class="status-badge locked">📦 封存中</span>
            </div>
            <span class="capsule-mood">{{ getMoodEmoji(capsule.mood) }}</span>
          </div>
          
          <h3 class="capsule-title">{{ capsule.title }}</h3>
          <p class="capsule-book">📖 《{{ capsule.bookTitle || '无关联书籍' }}》</p>
          <p class="capsule-date">创建于 {{ capsule.createdAt }}</p>
          
          <div v-if="capsule.isOpened" class="capsule-content">
            <p>{{ capsule.content }}</p>
          </div>
          <div v-else-if="canUnlockNow(capsule)" class="capsule-can-unlock">
            <div class="unlock-announcement">
              <span class="unlock-icon">🎉</span>
              <p class="unlock-text">已到解锁时间！</p>
            </div>
            <button class="btn btn-success btn-block" @click="openCapsule(capsule.id)">
              开启胶囊
            </button>
          </div>
          <div v-else class="capsule-locked">
            <div class="countdown">
              <div class="countdown-number">{{ getDaysUntilUnlock(capsule.openDate) }}</div>
              <div class="countdown-label">天后解锁</div>
            </div>
            <p class="unlock-date">🔒 开启时间: {{ capsule.openDate }}</p>
            <button class="btn btn-secondary btn-sm" @click="openCapsule(capsule.id)">
              提前开启
            </button>
          </div>

          <div class="capsule-actions">
            <button class="btn btn-danger btn-sm" @click="deleteCapsule(capsule.id)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="capsules.length === 0" class="empty-state">
        <p class="empty-icon">💊</p>
        <h3>还没有时间胶囊</h3>
        <p>创建你的第一个时间胶囊，给未来的自己留封信吧！</p>
        <button class="btn btn-primary" @click="showAddModal = true">创建第一个胶囊</button>
      </div>

      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <h3 class="modal-title">💊 创建时间胶囊</h3>
          <div class="form-group">
            <label>胶囊标题 *</label>
            <input v-model="newCapsule.title" type="text" class="form-input" placeholder="给胶囊起个名字">
          </div>
          <div class="form-group">
            <label>关联书籍</label>
            <select v-model="newCapsule.bookId" class="form-input">
              <option value="">选择书籍（可选）</option>
              <option v-for="book in books" :key="book.id" :value="book.id">{{ book.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>胶囊内容 *</label>
            <textarea v-model="newCapsule.content" class="form-input" rows="4" placeholder="写下你想对未来说的话..."></textarea>
          </div>
          <div class="form-group">
            <label>解锁日期 *</label>
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
            <p>📅 这个胶囊将在 <strong>{{ newCapsule.openDate || '未来' }}</strong> 解锁</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
            <button class="btn btn-primary" @click="createCapsule">封存胶囊</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { getCapsules, addCapsule, openCapsule as apiOpenCapsule, deleteCapsule as apiDeleteCapsule, getBooks } from '../api'

const capsules = ref([])
const books = ref([])
const showAddModal = ref(false)

const newCapsule = reactive({
  title: '',
  bookId: '',
  content: '',
  openDate: getDefaultOpenDate(),
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

const getMoodEmoji = (mood) => {
  const moodMap = {
    happy: '😊',
    inspired: '✨',
    thoughtful: '🤔',
    peaceful: '😌',
    excited: '🎉',
    nostalgic: '💭'
  }
  return moodMap[mood] || '📝'
}

function getDefaultOpenDate() {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  if (!capsule.openDate) return true
  return getDaysUntilUnlock(capsule.openDate) <= 0
}

const unlockedCount = computed(() => capsules.value.filter(c => c.isOpened).length)
const pendingCount = computed(() => capsules.value.filter(c => !c.isOpened).length)
const canUnlockCount = computed(() => capsules.value.filter(c => !c.isOpened && canUnlockNow(c)).length)

const loadData = async () => {
  try {
    const [capsulesRes, booksRes] = await Promise.all([
      getCapsules(),
      getBooks()
    ])
    capsules.value = capsulesRes.data.sort((a, b) => {
      if (a.isOpened !== b.isOpened) return a.isOpened ? 1 : -1
      if (!a.isOpened && !b.isOpened) {
        return getDaysUntilUnlock(a.openDate) - getDaysUntilUnlock(b.openDate)
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    books.value = booksRes.data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const createCapsule = async () => {
  if (!newCapsule.title || !newCapsule.content) {
    alert('请填写标题和内容')
    return
  }
  if (!newCapsule.openDate) {
    alert('请选择解锁日期')
    return
  }
  try {
    const selectedBook = books.value.find(b => b.id === newCapsule.bookId)
    const capsuleData = {
      title: newCapsule.title,
      content: newCapsule.content,
      bookId: newCapsule.bookId || null,
      bookTitle: selectedBook?.title || '',
      openDate: newCapsule.openDate,
      mood: newCapsule.mood
    }
    await addCapsule(capsuleData)
    showAddModal.value = false
    newCapsule.title = ''
    newCapsule.bookId = ''
    newCapsule.content = ''
    newCapsule.openDate = getDefaultOpenDate()
    newCapsule.mood = 'inspired'
    loadData()
    alert('时间胶囊创建成功！')
  } catch (error) {
    console.error('创建胶囊失败:', error)
  }
}

const openCapsule = async (id) => {
  if (!confirm('确定要开启这个时间胶囊吗？一旦开启就无法恢复封存状态了。')) return
  try {
    await apiOpenCapsule(id)
    loadData()
  } catch (error) {
    console.error('开启胶囊失败:', error)
  }
}

const deleteCapsule = async (id) => {
  if (!confirm('确定要删除这个时间胶囊吗？')) return
  try {
    await apiDeleteCapsule(id)
    loadData()
  } catch (error) {
    console.error('删除胶囊失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-block {
  width: 100%;
}

.capsule-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-item.highlight {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.stat-num {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-item.highlight .stat-num {
  color: #059669;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.capsules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.capsule-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border-left: 4px solid #667eea;
}

.capsule-card:hover {
  transform: translateY(-5px);
}

.capsule-card.opened {
  border-left-color: #10b981;
  opacity: 0.9;
}

.capsule-card.can-unlock {
  border-left-color: #f59e0b;
  animation: glow 2s infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); }
}

.capsule-card.soon-unlock {
  border-left-color: #8b5cf6;
}

.capsule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.capsule-status {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.opened {
  background: #d1fae5;
  color: #059669;
}

.status-badge.can-unlock {
  background: #fef3c7;
  color: #d97706;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.status-badge.locked {
  background: #e0e7ff;
  color: #4f46e5;
}

.capsule-mood {
  font-size: 1.5rem;
}

.capsule-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.capsule-book {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.capsule-date {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.capsule-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #555;
  border-left: 3px solid #10b981;
}

.capsule-can-unlock {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.unlock-announcement {
  margin-bottom: 0.75rem;
}

.unlock-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.25rem;
}

.unlock-text {
  color: #d97706;
  font-weight: bold;
}

.capsule-locked {
  text-align: center;
  margin-bottom: 1rem;
}

.countdown {
  margin-bottom: 0.75rem;
}

.countdown-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
}

.countdown-label {
  color: #666;
  font-size: 0.9rem;
}

.unlock-date {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.capsule-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
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
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
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
  margin-bottom: 1rem;
  color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
