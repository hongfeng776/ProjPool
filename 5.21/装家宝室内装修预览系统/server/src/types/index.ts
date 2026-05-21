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
  createdAt: Date;
  updatedAt: Date;
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

export type RoomType = '客厅' | '卧室' | '厨房' | '卫生间' | '书房' | '餐厅' | '阳台' | '整体';

export type DesignStyle = '现代简约' | '北欧' | '中式' | '欧式' | '美式' | '日式' | '工业风' | '轻奢';
