import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getBooks = () => api.get('/books')
export const addBook = (data) => api.post('/books', data)
export const updateBook = (id, data) => api.put(`/books/${id}`, data)
export const deleteBook = (id) => api.delete(`/books/${id}`)
export const getBookCapsules = (bookId) => api.get(`/books/${bookId}/capsules`)
export const getBookCapsulesCount = (bookId) => api.get(`/books/${bookId}/capsules/count`)

export const getReadingRecords = () => api.get('/reading-records')
export const getBookReadingRecords = (bookId) => api.get(`/reading-records/book/${bookId}`)
export const getReadingStats = () => api.get('/reading-records/stats/summary')
export const addReadingRecord = (data) => api.post('/reading-records', data)

export const getCapsules = () => api.get('/capsules')
export const addCapsule = (data) => api.post('/capsules', data)
export const openCapsule = (id) => api.put(`/capsules/${id}/open`)
export const deleteCapsule = (id) => api.delete(`/capsules/${id}`)

export const checkHealth = () => api.get('/health')

export default api
