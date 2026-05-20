import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => request.post('/auth/login', data),
  getProfile: () => request.get('/auth/profile'),
  changePassword: (data) => request.put('/auth/change-password', data)
}

export const usersAPI = {
  getList: (params) => request.get('/users', { params }),
  getDetail: (id) => request.get(`/users/${id}`),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`)
}

export const reportsAPI = {
  generate: (data) => request.post('/reports/generate', data),
  getList: (params) => request.get('/reports', { params }),
  getDetail: (id) => request.get(`/reports/${id}`),
  export: (id) => request.get(`/reports/${id}/export`, { responseType: 'blob' }),
  delete: (id) => request.delete(`/reports/${id}`)
}

export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }
    })
  },
  getHistory: () => request.get('/upload/history')
}

export const salesAPI = {
  getList: (params) => request.get('/sales', { params }),
  getStores: () => request.get('/sales/stores'),
  getCategories: () => request.get('/sales/categories'),
  getPaymentMethods: () => request.get('/sales/payment-methods'),
  getCustomerTypes: () => request.get('/sales/customer-types')
}

export const dashboardAPI = {
  getSummary: () => request.get('/dashboard/summary'),
  getSalesByStore: () => request.get('/dashboard/sales-by-store'),
  getSalesByCategory: () => request.get('/dashboard/sales-by-category'),
  getSalesByDate: (days) => request.get('/dashboard/sales-by-date', { params: { days } }),
  getTopProducts: (limit) => request.get('/dashboard/top-products', { params: { limit } }),
  getDailyReport: (params) => request.get('/dashboard/sales-report/daily', { params }),
  getWeeklyReport: (params) => request.get('/dashboard/sales-report/weekly', { params }),
  getMonthlyReport: (params) => request.get('/dashboard/sales-report/monthly', { params }),
  getProductRanking: (params) => request.get('/dashboard/product-ranking', { params }),
  exportSalesReport: (reportType, filters) => request.post('/dashboard/export/sales-report', { reportType, filters }, { responseType: 'blob' }),
  exportSalesData: (params) => request.get('/dashboard/export/sales-data', { params, responseType: 'blob' })
}

export default request
