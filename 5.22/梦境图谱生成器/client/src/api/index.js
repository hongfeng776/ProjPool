import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getHealth = () => api.get('/health')

export const getDreams = () => api.get('/dreams')

export const getDream = (id) => api.get(`/dreams/${id}`)

export const createDream = (data) => api.post('/dreams', data)

export const updateDream = (id, data) => api.put(`/dreams/${id}`, data)

export const deleteDream = (id) => api.delete(`/dreams/${id}`)

export const addKeyword = (dreamId, keyword, type = 'tag') => 
  api.post(`/dreams/${dreamId}/keywords`, { keyword, type })

export const removeKeyword = (dreamId, keyword, type = 'tag') => 
  api.delete(`/dreams/${dreamId}/keywords/${encodeURIComponent(keyword)}?type=${type}`)

export const generateGraph = (description) => api.post('/dreams/generate-graph', { description })

export const getKeywordGraph = (minConnections = 1) => 
  api.get(`/dreams/keyword-graph?minConnections=${minConnections}`)

export default api
