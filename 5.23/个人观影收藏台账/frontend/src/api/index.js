import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('响应错误:', error)
    if (!error.response) {
      error.message = '无法连接到服务器，请确保后端服务已启动'
    }
    return Promise.reject(error)
  }
)

export const movieApi = {
  getAll: (params = {}) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`)
}

export const genreApi = {
  getAll: () => api.get('/genres'),
  create: (data) => api.post('/genres', data),
  delete: (id) => api.delete(`/genres/${id}`)
}

export const statsApi = {
  get: () => api.get('/stats')
}

export default api
