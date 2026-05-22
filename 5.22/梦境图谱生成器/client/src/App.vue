<template>
  <div class="app-container">
    <header class="header">
      <h1>🌙 梦境图谱生成器</h1>
      <p class="subtitle">探索你的潜意识，绘制梦境的无限可能</p>
    </header>

    <main class="main-content">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card class="dream-editor" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>📝 梦境编辑</span>
                <el-button type="primary" size="small" @click="showCreateDialog = true">
                  + 新建梦境
                </el-button>
              </div>
            </template>

            <el-form label-position="top">
              <el-form-item label="梦境标题">
                <el-input v-model="dreamForm.title" placeholder="输入梦境标题..." />
              </el-form-item>

              <el-form-item label="梦境描述">
                <el-input
                  v-model="dreamForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="描述你的梦境..."
                />
              </el-form-item>

              <el-form-item label="关键词标签">
                <div class="keyword-input">
                  <el-input
                    v-model="newTag"
                    placeholder="输入标签，按回车添加"
                    style="flex: 1"
                    @keyup.enter="addKeyword('tag')"
                  />
                  <el-button type="primary" @click="addKeyword('tag')">添加</el-button>
                </div>
                <div class="keyword-list">
                  <el-tag
                    v-for="tag in dreamForm.tags"
                    :key="tag"
                    closable
                    @close="removeKeyword(tag, 'tag')"
                    class="keyword-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </el-form-item>

              <el-form-item label="情绪标签">
                <div class="keyword-input">
                  <el-input
                    v-model="newEmotion"
                    placeholder="输入情绪，按回车添加"
                    style="flex: 1"
                    @keyup.enter="addKeyword('emotion')"
                  />
                  <el-button type="success" @click="addKeyword('emotion')">添加</el-button>
                </div>
                <div class="keyword-list">
                  <el-tag
                    v-for="emotion in dreamForm.emotions"
                    :key="emotion"
                    type="success"
                    closable
                    @close="removeKeyword(emotion, 'emotion')"
                    class="keyword-tag"
                  >
                    {{ emotion }}
                  </el-tag>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="generateDreamGraph"
                  :loading="generating"
                  class="action-btn"
                  size="small"
                >
                  🎨 生成图谱
                </el-button>
                <el-button 
                  type="success" 
                  @click="saveDream"
                  :loading="saving"
                  class="action-btn"
                  size="small"
                >
                  💾 保存梦境
                </el-button>
                <el-button 
                  @click="resetForm"
                  class="action-btn"
                  size="small"
                >
                  🔄 重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="14">
          <div class="graph-container">
            <div class="graph-header">
              <el-tabs v-model="activeGraphTab" @tab-change="handleTabChange">
                <el-tab-pane label="🔮 梦境图谱" name="dream" />
                <el-tab-pane label="🕸️ 关键词关联" name="keyword" />
              </el-tabs>
              <div class="graph-actions">
                <el-button 
                  v-if="activeGraphTab === 'keyword'"
                  type="primary" 
                  size="small" 
                  @click="fetchKeywordGraph"
                  :loading="loadingKeywordGraph"
                >
                  刷新关联
                </el-button>
                <el-dropdown @command="handleExport" trigger="click">
                  <el-button size="small" :disabled="currentGraphData.nodes.length === 0">
                    📥 导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="svg">导出 SVG</el-dropdown-item>
                      <el-dropdown-item command="png">导出 PNG</el-dropdown-item>
                      <el-dropdown-item command="json">导出 JSON</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            
            <svg ref="svgRef" class="graph-svg" viewBox="0 0 800 500">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g v-for="edge in currentGraphData.edges" :key="`${edge.source}-${edge.target}`">
                <line
                  :x1="getNodeById(edge.source)?.x || 0"
                  :y1="getNodeById(edge.source)?.y || 0"
                  :x2="getNodeById(edge.target)?.x || 0"
                  :y2="getNodeById(edge.target)?.y || 0"
                  :stroke="edge.weight ? `rgba(255,255,255,${0.2 + edge.weight * 0.15})` : 'rgba(255,255,255,0.3)'"
                  :stroke-width="edge.weight ? 1 + edge.weight : 2"
                />
              </g>
              <g v-for="node in currentGraphData.nodes" :key="node.id">
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  :r="node.count ? 25 + node.count * 8 : 40"
                  :fill="node.color"
                  filter="url(#glow)"
                  class="node-circle"
                />
                <text
                  :x="node.x"
                  :y="node.y + 5"
                  text-anchor="middle"
                  fill="#fff"
                  :font-size="node.count ? 11 + node.count : 14"
                  font-weight="bold"
                >
                  {{ node.label }}
                </text>
                <text
                  v-if="node.count"
                  :x="node.x"
                  :y="node.y + 25 + node.count * 8"
                  text-anchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  font-size="10"
                >
                  ({{ node.count }}次)
                </text>
              </g>
            </svg>

            <div v-if="activeGraphTab === 'keyword' && currentGraphData.nodes.length === 0" class="empty-hint">
              暂无关键词数据，请先添加梦境关键词
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="dream-list">
        <h3>📚 梦境列表</h3>
        <el-row :gutter="20">
          <el-col :span="8" v-for="dream in dreams" :key="dream.id">
            <el-card 
              class="dream-card" 
              shadow="hover"
              :class="{ 'is-active': selectedDreamId === dream.id }"
            >
              <template #header>
                <div class="card-header">
                  <span>{{ dream.title }}</span>
                  <span class="date">{{ dream.date }}</span>
                </div>
              </template>
              <p class="description">{{ dream.description || '暂无描述' }}</p>
              
              <div class="dream-tags" v-if="dream.tags.length > 0">
                <span class="tags-label">标签：</span>
                <el-tag 
                  v-for="tag in dream.tags" 
                  :key="tag" 
                  size="small"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="dream-tags" v-if="dream.emotions.length > 0">
                <span class="tags-label">情绪：</span>
                <el-tag 
                  v-for="emotion in dream.emotions" 
                  :key="emotion" 
                  size="small"
                  type="success"
                  class="tag"
                >
                  {{ emotion }}
                </el-tag>
              </div>
              
              <div class="card-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="selectDream(dream)"
                >
                  查看
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteDreamItem(dream.id)"
                >
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </main>

    <el-dialog v-model="showCreateDialog" title="新建梦境" width="400px">
      <el-form label-position="top">
        <el-form-item label="梦境标题">
          <el-input v-model="newDreamTitle" placeholder="输入梦境标题..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewDream">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { 
  getDreams, 
  generateGraph, 
  createDream, 
  updateDream,
  deleteDream,
  addKeyword as apiAddKeyword,
  removeKeyword as apiRemoveKeyword,
  getKeywordGraph
} from './api'

const svgRef = ref(null)
const generating = ref(false)
const saving = ref(false)
const loadingKeywordGraph = ref(false)
const dreams = ref([])
const selectedDreamId = ref(null)
const showCreateDialog = ref(false)
const newDreamTitle = ref('')
const newTag = ref('')
const newEmotion = ref('')
const activeGraphTab = ref('dream')

const graphData = reactive({
  nodes: [],
  edges: []
})

const keywordGraphData = reactive({
  nodes: [],
  edges: []
})

const currentGraphData = computed(() => {
  return activeGraphTab.value === 'dream' ? graphData : keywordGraphData
})

const dreamForm = reactive({
  id: null,
  title: '',
  description: '',
  tags: [],
  emotions: []
})

const getNodeById = (id) => {
  return currentGraphData.value.nodes.find(n => n.id === id)
}

const handleTabChange = (tab) => {
  if (tab === 'keyword' && keywordGraphData.nodes.length === 0) {
    fetchKeywordGraph()
  }
}

const fetchKeywordGraph = async () => {
  loadingKeywordGraph.value = true
  try {
    const res = await getKeywordGraph(1)
    keywordGraphData.nodes = res.data.nodes
    keywordGraphData.edges = res.data.edges
  } catch (err) {
    console.error('获取关键词关联图谱失败', err)
    ElMessage.error('获取关键词关联图谱失败')
  } finally {
    loadingKeywordGraph.value = false
  }
}

const fetchDreams = async () => {
  try {
    const res = await getDreams()
    dreams.value = res.data
    if (dreams.value.length > 0) {
      selectDream(dreams.value[0])
    }
  } catch (err) {
    console.error('获取梦境列表失败', err)
    ElMessage.error('获取梦境列表失败')
  }
}

const selectDream = (dream) => {
  selectedDreamId.value = dream.id
  dreamForm.id = dream.id
  dreamForm.title = dream.title
  dreamForm.description = dream.description || ''
  dreamForm.tags = [...(dream.tags || [])]
  dreamForm.emotions = [...(dream.emotions || [])]
  
  graphData.nodes = dream.nodes || []
  graphData.edges = dream.edges || []
}

const createNewDream = async () => {
  if (!newDreamTitle.value.trim()) {
    ElMessage.warning('请输入梦境标题')
    return
  }
  
  try {
    const res = await createDream({
      title: newDreamTitle.value,
      description: '',
      tags: [],
      emotions: [],
      nodes: [],
      edges: []
    })
    dreams.value.unshift(res.data)
    selectDream(res.data)
    showCreateDialog.value = false
    newDreamTitle.value = ''
    ElMessage.success('梦境创建成功')
  } catch (err) {
    console.error('创建梦境失败', err)
    ElMessage.error('创建梦境失败')
  }
}

const saveDream = async () => {
  if (!dreamForm.title.trim()) {
    ElMessage.warning('请输入梦境标题')
    return
  }
  
  if (!dreamForm.id) {
    ElMessage.warning('请先选择或创建一个梦境')
    return
  }
  
  saving.value = true
  try {
    const res = await updateDream(dreamForm.id, {
      title: dreamForm.title,
      description: dreamForm.description,
      tags: dreamForm.tags,
      emotions: dreamForm.emotions,
      nodes: graphData.nodes,
      edges: graphData.edges
    })
    
    const index = dreams.value.findIndex(d => d.id === dreamForm.id)
    if (index !== -1) {
      dreams.value[index] = res.data
    }
    
    if (activeGraphTab.value === 'keyword') {
      await fetchKeywordGraph()
    }
    
    ElMessage.success('梦境保存成功')
  } catch (err) {
    console.error('保存梦境失败', err)
    ElMessage.error('保存梦境失败')
  } finally {
    saving.value = false
  }
}

const deleteDreamItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个梦境吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDream(id)
    dreams.value = dreams.value.filter(d => d.id !== id)
    
    if (selectedDreamId.value === id) {
      if (dreams.value.length > 0) {
        selectDream(dreams.value[0])
      } else {
        resetForm()
      }
    }
    
    if (activeGraphTab.value === 'keyword') {
      await fetchKeywordGraph()
    }
    
    ElMessage.success('梦境已删除')
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除梦境失败', err)
      ElMessage.error('删除梦境失败')
    }
  }
}

const addKeyword = async (type) => {
  const input = type === 'tag' ? newTag : newEmotion
  const list = type === 'tag' ? dreamForm.tags : dreamForm.emotions
  
  if (!input.value.trim()) {
    return
  }
  
  if (list.includes(input.value.trim())) {
    ElMessage.warning('该关键词已存在')
    return
  }
  
  if (dreamForm.id) {
    try {
      await apiAddKeyword(dreamForm.id, input.value.trim(), type)
    } catch (err) {
      console.error('添加关键词失败', err)
    }
  }
  
  list.push(input.value.trim())
  input.value = ''
}

const removeKeyword = async (keyword, type) => {
  const list = type === 'tag' ? dreamForm.tags : dreamForm.emotions
  const index = list.indexOf(keyword)
  
  if (index !== -1) {
    list.splice(index, 1)
    
    if (dreamForm.id) {
      try {
        await apiRemoveKeyword(dreamForm.id, keyword, type)
      } catch (err) {
        console.error('删除关键词失败', err)
      }
    }
  }
}

const generateDreamGraph = async () => {
  if (!dreamForm.description.trim()) {
    ElMessage.warning('请先描述你的梦境')
    return
  }
  
  generating.value = true
  try {
    const res = await generateGraph(dreamForm.description)
    graphData.nodes = res.data.nodes
    graphData.edges = res.data.edges
    ElMessage.success('图谱生成成功！')
  } catch (err) {
    ElMessage.error('生成失败，请重试')
    console.error(err)
  } finally {
    generating.value = false
  }
}

const resetForm = () => {
  dreamForm.id = null
  dreamForm.title = ''
  dreamForm.description = ''
  dreamForm.tags = []
  dreamForm.emotions = []
  graphData.nodes = []
  graphData.edges = []
  selectedDreamId.value = null
}

const handleExport = async (type) => {
  if (type === 'svg') {
    exportSVG()
  } else if (type === 'png') {
    exportPNG()
  } else if (type === 'json') {
    exportJSON()
  }
}

const exportSVG = () => {
  if (!svgRef.value) return
  
  const svgElement = svgRef.value
  const serializer = new XMLSerializer()
  let svgString = serializer.serializeToString(svgElement)
  
  svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString
  
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${activeGraphTab.value === 'dream' ? '梦境图谱' : '关键词关联图谱'}_${new Date().toISOString().split('T')[0]}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('SVG 导出成功')
}

const exportPNG = () => {
  if (!svgRef.value) return
  
  const svgElement = svgRef.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const serializer = new XMLSerializer()
  
  let svgString = serializer.serializeToString(svgElement)
  svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString
  
  const img = new Image()
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  img.onload = () => {
    canvas.width = 1600
    canvas.height = 1000
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    const pngUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = pngUrl
    link.download = `${activeGraphTab.value === 'dream' ? '梦境图谱' : '关键词关联图谱'}_${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('PNG 导出成功')
  }
  
  img.onerror = () => {
    URL.revokeObjectURL(url)
    ElMessage.error('PNG 导出失败')
  }
  
  img.src = url
}

const exportJSON = () => {
  const data = {
    type: activeGraphTab.value === 'dream' ? '梦境图谱' : '关键词关联图谱',
    exportTime: new Date().toISOString(),
    nodes: currentGraphData.value.nodes,
    edges: currentGraphData.value.edges
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${activeGraphTab.value === 'dream' ? '梦境图谱' : '关键词关联图谱'}_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('JSON 导出成功')
}

onMounted(() => {
  fetchDreams()
})
</script>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  padding: 20px 0;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 6px;
  background: linear-gradient(90deg, #4FC3F7, #E1BEE7, #A5D6A7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dream-editor {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
}

.dream-editor :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
}

.dream-editor :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.dream-editor :deep(.el-form-item) {
  margin-bottom: 14px;
}

.dream-editor :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.dream-editor :deep(.el-input__inner) {
  color: #fff;
}

.dream-editor :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.keyword-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 28px;
}

.keyword-tag {
  margin: 0;
}

.action-btn {
  margin-right: 8px;
  margin-bottom: 6px;
}

.graph-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.graph-header :deep(.el-tabs) {
  flex: 1;
}

.graph-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.graph-header :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.graph-header :deep(.el-tabs__item.is-active) {
  color: #fff;
}

.graph-header :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #4FC3F7, #E1BEE7);
}

.graph-svg {
  width: 100%;
  height: 420px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.9) 100%);
  border-radius: 12px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.node-circle {
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-circle:hover {
  filter: url(#glow) brightness(1.3);
  transform: scale(1.1);
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.dream-list h3 {
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.dream-card {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dream-card:hover {
  transform: translateY(-2px);
}

.dream-card.is-active {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.dream-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 14px;
}

.dream-card .card-header .date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.dream-card .description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dream-tags {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.dream-tags .tags-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.dream-tags .tag {
  margin: 0;
  background: rgba(102, 126, 234, 0.3);
  border: none;
  color: #fff;
}

.card-actions {
  margin-top: 10px;
  display: flex;
  gap: 6px;
}
</style>
