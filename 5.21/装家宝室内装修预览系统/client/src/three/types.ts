import * as THREE from 'three';

export type MaterialCategory = 'wall' | 'floor' | 'furniture';

export interface SelectableObject {
  type: 'floor' | 'wall' | 'ceiling' | 'furniture';
  name: string;
  mesh: THREE.Mesh | THREE.Object3D;
  category: MaterialCategory;
  furnitureId?: string;
  wallSide?: string;
}

export interface FurnitureItem {
  id: string;
  type: string;
  name: string;
  category: string;
  color: number;
  width: number;
  height: number;
  depth: number;
  icon: string;
}

export interface PlacedFurniture {
  id: string;
  furnitureId: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  mesh?: THREE.Object3D;
}

export interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface SceneState {
  room: RoomDimensions;
  furniture: PlacedFurniture[];
}

export const FURNITURE_LIBRARY: FurnitureItem[] = [
  {
    id: 'sofa-3seat',
    type: 'sofa',
    name: '三人沙发',
    category: '客厅',
    color: 0x8b7355,
    width: 2.4,
    height: 0.8,
    depth: 0.9,
    icon: '🛋️',
  },
  {
    id: 'sofa-2seat',
    type: 'sofa',
    name: '双人沙发',
    category: '客厅',
    color: 0x6b8e23,
    width: 1.8,
    height: 0.8,
    depth: 0.9,
    icon: '🛋️',
  },
  {
    id: 'coffee-table',
    type: 'table',
    name: '茶几',
    category: '客厅',
    color: 0xd2691e,
    width: 1.4,
    height: 0.45,
    depth: 0.8,
    icon: '🪑',
  },
  {
    id: 'dining-table',
    type: 'table',
    name: '餐桌',
    category: '餐厅',
    color: 0x8b4513,
    width: 1.6,
    height: 0.75,
    depth: 0.9,
    icon: '🪑',
  },
  {
    id: 'desk',
    type: 'table',
    name: '书桌',
    category: '书房',
    color: 0xa0522d,
    width: 1.4,
    height: 0.75,
    depth: 0.7,
    icon: '🪑',
  },
  {
    id: 'dining-chair',
    type: 'chair',
    name: '餐椅',
    category: '餐厅',
    color: 0xcd853f,
    width: 0.5,
    height: 0.9,
    depth: 0.5,
    icon: '🪑',
  },
  {
    id: 'office-chair',
    type: 'chair',
    name: '办公椅',
    category: '书房',
    color: 0x2f4f4f,
    width: 0.6,
    height: 1.1,
    depth: 0.6,
    icon: '🪑',
  },
  {
    id: 'bed-queen',
    type: 'bed',
    name: '双人床',
    category: '卧室',
    color: 0x8b7765,
    width: 2.0,
    height: 0.5,
    depth: 2.2,
    icon: '🛏️',
  },
  {
    id: 'bed-single',
    type: 'bed',
    name: '单人床',
    category: '卧室',
    color: 0x9c8b75,
    width: 1.2,
    height: 0.5,
    depth: 2.0,
    icon: '🛏️',
  },
  {
    id: 'wardrobe',
    type: 'storage',
    name: '衣柜',
    category: '卧室',
    color: 0x654321,
    width: 2.0,
    height: 2.4,
    depth: 0.6,
    icon: '🚪',
  },
  {
    id: 'bookshelf',
    type: 'storage',
    name: '书架',
    category: '书房',
    color: 0x5c4033,
    width: 1.2,
    height: 2.2,
    depth: 0.35,
    icon: '📚',
  },
  {
    id: 'tv-cabinet',
    type: 'storage',
    name: '电视柜',
    category: '客厅',
    color: 0x3d3d3d,
    width: 2.2,
    height: 0.5,
    depth: 0.45,
    icon: '📺',
  },
  {
    id: 'plant',
    type: 'decor',
    name: '绿植',
    category: '装饰',
    color: 0x228b22,
    width: 0.4,
    height: 1.2,
    depth: 0.4,
    icon: '🌿',
  },
  {
    id: 'lamp',
    type: 'decor',
    name: '落地灯',
    category: '装饰',
    color: 0xffd700,
    width: 0.3,
    height: 1.6,
    depth: 0.3,
    icon: '💡',
  },
  {
    id: 'rug',
    type: 'decor',
    name: '地毯',
    category: '装饰',
    color: 0xb22222,
    width: 2.0,
    height: 0.02,
    depth: 1.5,
    icon: '🟥',
  },
];

export const FURNITURE_CATEGORIES = ['全部', '客厅', '卧室', '餐厅', '书房', '装饰'];
