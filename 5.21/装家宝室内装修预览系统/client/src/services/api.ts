import axios from 'axios';
import { Project, ProjectCreate, ProjectUpdate, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

export const projectApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<unknown, ApiResponse<Project[]>>('/projects', { params }),

  getById: (id: number) =>
    api.get<unknown, ApiResponse<Project>>(`/projects/${id}`),

  create: (data: ProjectCreate) =>
    api.post<unknown, ApiResponse<Project>>('/projects', data),

  update: (id: number, data: ProjectUpdate) =>
    api.put<unknown, ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: number) =>
    api.delete<unknown, ApiResponse<void>>(`/projects/${id}`),

  healthCheck: () =>
    api.get<unknown, ApiResponse<void>>('/health'),
};

export const uploadApi = {
  uploadFloorPlan: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/upload/floorplan', formData, {
      timeout: 30000,
    }).then((response) => response.data);
  },
};

export default api;
