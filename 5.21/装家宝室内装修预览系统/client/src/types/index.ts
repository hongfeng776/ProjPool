export interface Project {
  id: number;
  name: string;
  description: string;
  roomType: string;
  area: number;
  style: string;
  budget: number;
  status: 'draft' | 'in_progress' | 'completed';
  thumbnail?: string;
  sceneData?: object;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  roomType: string;
  area: number;
  style: string;
  budget: number;
  thumbnail?: string;
  sceneData?: object;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  roomType?: string;
  area?: number;
  style?: string;
  budget?: number;
  status?: 'draft' | 'in_progress' | 'completed';
  thumbnail?: string;
  sceneData?: object;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const ROOM_TYPES = [
  { value: '客厅', label: '客厅' },
  { value: '卧室', label: '卧室' },
  { value: '厨房', label: '厨房' },
  { value: '卫生间', label: '卫生间' },
  { value: '书房', label: '书房' },
  { value: '餐厅', label: '餐厅' },
  { value: '阳台', label: '阳台' },
  { value: '整体', label: '整体' },
];

export const DESIGN_STYLES = [
  { value: '现代简约', label: '现代简约' },
  { value: '北欧', label: '北欧' },
  { value: '中式', label: '中式' },
  { value: '欧式', label: '欧式' },
  { value: '美式', label: '美式' },
  { value: '日式', label: '日式' },
  { value: '工业风', label: '工业风' },
  { value: '轻奢', label: '轻奢' },
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'default' },
  { value: 'in_progress', label: '进行中', color: 'processing' },
  { value: 'completed', label: '已完成', color: 'success' },
];
