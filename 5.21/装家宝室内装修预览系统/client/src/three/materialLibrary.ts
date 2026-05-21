import * as THREE from 'three';

export type MaterialCategory = 'wall' | 'floor' | 'furniture-wood' | 'furniture-fabric' | 'furniture-metal' | 'furniture-leather' | 'furniture-marble';

export interface MaterialPreset {
  id: string;
  name: string;
  category: MaterialCategory;
  color: number;
  roughness?: number;
  metalness?: number;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  previewColor?: string;
}

export const WALL_MATERIALS: MaterialPreset[] = [
  { id: 'wall-white', name: '纯白墙', category: 'wall', color: 0xffffff, roughness: 0.85, previewColor: '#ffffff' },
  { id: 'wall-cream', name: '米白墙', category: 'wall', color: 0xf8f9fa, roughness: 0.85, previewColor: '#f8f9fa' },
  { id: 'wall-beige', name: '米色墙', category: 'wall', color: 0xf5efe6, roughness: 0.82, previewColor: '#f5efe6' },
  { id: 'wall-light-gray', name: '浅灰墙', category: 'wall', color: 0xe8e8e8, roughness: 0.8, previewColor: '#e8e8e8' },
  { id: 'wall-gray', name: '灰色墙', category: 'wall', color: 0xb8b8b8, roughness: 0.78, previewColor: '#b8b8b8' },
  { id: 'wall-latte', name: '奶茶色', category: 'wall', color: 0xe6d5b9, roughness: 0.85, previewColor: '#e6d5b9' },
  { id: 'wall-nordic-gray', name: '北欧灰', category: 'wall', color: 0xdcd7d0, roughness: 0.88, previewColor: '#dcd7d0' },
  { id: 'wall-pink', name: '脏粉色', category: 'wall', color: 0xe8c4c4, roughness: 0.85, previewColor: '#e8c4c4' },
  { id: 'wall-mint', name: '薄荷绿', category: 'wall', color: 0xc4e1d7, roughness: 0.85, previewColor: '#c4e1d7' },
  { id: 'wall-sky', name: '天空蓝', category: 'wall', color: 0xc6e2f5, roughness: 0.85, previewColor: '#c6e2f5' },
  { id: 'wall-warm-white', name: '暖白', category: 'wall', color: 0xfaf8f5, roughness: 0.85, previewColor: '#faf8f5' },
  { id: 'wall-dark-gray', name: '深灰工业风', category: 'wall', color: 0x696969, roughness: 0.75, previewColor: '#696969' },
];

export const FLOOR_MATERIALS: MaterialPreset[] = [
  { id: 'floor-wood-light', name: '浅原木色', category: 'floor', color: 0xe8dcc8, roughness: 0.7, previewColor: '#e8dcc8' },
  { id: 'floor-wood-oak', name: '橡木色', category: 'floor', color: 0xd4a574, roughness: 0.65, previewColor: '#d4a574' },
  { id: 'floor-wood-walnut', name: '胡桃木', category: 'floor', color: 0x8b4513, roughness: 0.6, previewColor: '#8b4513' },
  { id: 'floor-wood-ash', name: '白蜡木', category: 'floor', color: 0xc4a882, roughness: 0.72, previewColor: '#c4a882' },
  { id: 'floor-wood-teak', name: '柚木色', category: 'floor', color: 0xa0522d, roughness: 0.68, previewColor: '#a0522d' },
  { id: 'floor-wood-maple', name: '枫木色', category: 'floor', color: 0xdcc8b0, roughness: 0.75, previewColor: '#dcc8b0' },
  { id: 'floor-marble-white', name: '白色大理石', category: 'floor', color: 0xf8f8ff, roughness: 0.3, previewColor: '#f8f8ff' },
  { id: 'floor-marble-gray', name: '灰色大理石', category: 'floor', color: 0xd3d3d3, roughness: 0.28, previewColor: '#d3d3d3' },
  { id: 'floor-tile-beige', name: '米色瓷砖', category: 'floor', color: 0xe0d5c0, roughness: 0.4, previewColor: '#e0d5c0' },
  { id: 'floor-tile-gray', name: '灰色瓷砖', category: 'floor', color: 0xb8b8b8, roughness: 0.42, previewColor: '#b8b8b8' },
  { id: 'floor-concrete', name: '水泥地面', category: 'floor', color: 0x808080, roughness: 0.85, previewColor: '#808080' },
  { id: 'floor-dark-wood', name: '深色地板', category: 'floor', color: 0x5c4033, roughness: 0.55, previewColor: '#5c4033' },
];

export const WOOD_MATERIALS: MaterialPreset[] = [
  { id: 'wood-light', name: '浅色木', category: 'furniture-wood', color: 0xf5deb3, roughness: 0.6, previewColor: '#f5deb3' },
  { id: 'wood-oak', name: '橡木', category: 'furniture-wood', color: 0xd4a574, roughness: 0.58, previewColor: '#d4a574' },
  { id: 'wood-walnut', name: '黑胡桃', category: 'furniture-wood', color: 0x5c4033, roughness: 0.55, previewColor: '#5c4033' },
  { id: 'wood-cherry', name: '樱桃木', category: 'furniture-wood', color: 0x8b4513, roughness: 0.62, previewColor: '#8b4513' },
  { id: 'wood-maple', name: '枫木', category: 'furniture-wood', color: 0xe8d4a8, roughness: 0.65, previewColor: '#e8d4a8' },
  { id: 'wood-teak', name: '柚木', category: 'furniture-wood', color: 0xa0522d, roughness: 0.6, previewColor: '#a0522d' },
  { id: 'wood-white', name: '白漆木', category: 'furniture-wood', color: 0xf8f8f8, roughness: 0.7, previewColor: '#f8f8f8' },
  { id: 'wood-dark-brown', name: '深棕木', category: 'furniture-wood', color: 0x3d2817, roughness: 0.55, previewColor: '#3d2817' },
];

export const FABRIC_MATERIALS: MaterialPreset[] = [
  { id: 'fabric-gray', name: '高级灰', category: 'furniture-fabric', color: 0x808080, roughness: 0.85, previewColor: '#808080' },
  { id: 'fabric-blue', name: '雾霾蓝', category: 'furniture-fabric', color: 0x668c99, roughness: 0.88, previewColor: '#668c99' },
  { id: 'fabric-green', name: '墨绿', category: 'furniture-fabric', color: 0x3d5c5c, roughness: 0.85, previewColor: '#3d5c5c' },
  { id: 'fabric-beige', name: '米色', category: 'furniture-fabric', color: 0xd4c4b0, roughness: 0.9, previewColor: '#d4c4b0' },
  { id: 'fabric-pink', name: '脏粉色', category: 'furniture-fabric', color: 0xc9958a, roughness: 0.85, previewColor: '#c9958a' },
  { id: 'fabric-white', name: '奶白色', category: 'furniture-fabric', color: 0xf8f8f8, roughness: 0.92, previewColor: '#f8f8f8' },
  { id: 'fabric-black', name: '炭黑', category: 'furniture-fabric', color: 0x2f2f2f, roughness: 0.82, previewColor: '#2f2f2f' },
  { id: 'fabric-yellow', name: '姜黄色', category: 'furniture-fabric', color: 0xb8860b, roughness: 0.85, previewColor: '#b8860b' },
  { id: 'fabric-navy', name: '藏青', category: 'furniture-fabric', color: 0x2c3e50, roughness: 0.83, previewColor: '#2c3e50' },
  { id: 'fabric-orange', name: '橙棕色', category: 'furniture-fabric', color: 0xc17f59, roughness: 0.85, previewColor: '#c17f59' },
];

export const LEATHER_MATERIALS: MaterialPreset[] = [
  { id: 'leather-black', name: '黑色真皮', category: 'furniture-leather', color: 0x1a1a1a, roughness: 0.4, previewColor: '#1a1a1a' },
  { id: 'leather-brown', name: '深棕真皮', category: 'furniture-leather', color: 0x3d2817, roughness: 0.38, previewColor: '#3d2817' },
  { id: 'leather-tan', name: '驼色', category: 'furniture-leather', color: 0xc4956c, roughness: 0.42, previewColor: '#c4956c' },
  { id: 'leather-white', name: '奶白', category: 'furniture-leather', color: 0xf5f5dc, roughness: 0.45, previewColor: '#f5f5dc' },
  { id: 'leather-gray', name: '灰色', category: 'furniture-leather', color: 0x696969, roughness: 0.4, previewColor: '#696969' },
  { id: 'leather-burgundy', name: '酒红色', category: 'furniture-leather', color: 0x722f37, roughness: 0.42, previewColor: '#722f37' },
];

export const METAL_MATERIALS: MaterialPreset[] = [
  { id: 'metal-black', name: '黑色金属', category: 'furniture-metal', color: 0x2f2f2f, roughness: 0.3, metalness: 0.7, previewColor: '#2f2f2f' },
  { id: 'metal-gold', name: '金色', category: 'furniture-metal', color: 0xd4af37, roughness: 0.25, metalness: 0.85, previewColor: '#d4af37' },
  { id: 'metal-silver', name: '银色', category: 'furniture-metal', color: 0xc0c0c0, roughness: 0.2, metalness: 0.9, previewColor: '#c0c0c0' },
  { id: 'metal-brass', name: '黄铜', category: 'furniture-metal', color: 0xb5a642, roughness: 0.3, metalness: 0.8, previewColor: '#b5a642' },
  { id: 'metal-chrome', name: '镀铬', category: 'furniture-metal', color: 0xe8e8e8, roughness: 0.15, metalness: 0.95, previewColor: '#e8e8e8' },
  { id: 'metal-copper', name: '红铜', category: 'furniture-metal', color: 0xb87333, roughness: 0.35, metalness: 0.75, previewColor: '#b87333' },
];

export const MARBLE_MATERIALS: MaterialPreset[] = [
  { id: 'marble-white', name: '爵士白', category: 'furniture-marble', color: 0xfafafa, roughness: 0.2, previewColor: '#fafafa' },
  { id: 'marble-gray', name: '卡拉拉灰', category: 'furniture-marble', color: 0xd3d3d3, roughness: 0.22, previewColor: '#d3d3d3' },
  { id: 'marble-black', name: '黑白根', category: 'furniture-marble', color: 0x2f2f2f, roughness: 0.18, previewColor: '#2f2f2f' },
  { id: 'marble-green', name: '大花绿', category: 'furniture-marble', color: 0x4a7c59, roughness: 0.25, previewColor: '#4a7c59' },
  { id: 'marble-beige', name: '米黄石', category: 'furniture-marble', color: 0xf5deb3, roughness: 0.24, previewColor: '#f5deb3' },
];

export const ALL_MATERIALS: MaterialPreset[] = [
  ...WALL_MATERIALS,
  ...FLOOR_MATERIALS,
  ...WOOD_MATERIALS,
  ...FABRIC_MATERIALS,
  ...LEATHER_MATERIALS,
  ...METAL_MATERIALS,
  ...MARBLE_MATERIALS,
];

export const createMaterial = (preset: MaterialPreset): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: preset.color,
    roughness: preset.roughness ?? 0.5,
    metalness: preset.metalness ?? 0,
    emissive: preset.emissive ?? 0x000000,
    emissiveIntensity: preset.emissiveIntensity ?? 0,
    transparent: preset.transparent ?? false,
    opacity: preset.opacity ?? 1,
    side: THREE.DoubleSide,
  });
};

export const applyMaterialToMesh = (mesh: THREE.Mesh, preset: MaterialPreset): void => {
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.color.setHex(preset.color);
    mesh.material.roughness = preset.roughness ?? mesh.material.roughness;
    mesh.material.metalness = preset.metalness ?? mesh.material.metalness;
    if (preset.emissive !== undefined) {
      mesh.material.emissive.setHex(preset.emissive);
    }
    if (preset.emissiveIntensity !== undefined) {
      mesh.material.emissiveIntensity = preset.emissiveIntensity;
    }
    if (preset.transparent !== undefined) {
      mesh.material.transparent = preset.transparent;
    }
    if (preset.opacity !== undefined) {
      mesh.material.opacity = preset.opacity;
    }
    mesh.material.needsUpdate = true;
  }
};

export const getMaterialById = (id: string): MaterialPreset | undefined => {
  return ALL_MATERIALS.find((m) => m.id === id);
};

export const getMaterialsByCategory = (category: MaterialCategory): MaterialPreset[] => {
  return ALL_MATERIALS.filter((m) => m.category === category);
};

export const detectMaterialCategory = (
  userData: any
): MaterialCategory => {
  if (userData?.materialCategory) {
    return userData.materialCategory as MaterialCategory;
  }
  if (userData?.isWall || userData?.isCeiling) {
    return 'wall';
  }
  if (userData?.isFloor) {
    return 'floor';
  }
  return 'furniture-wood';
};

export const getFriendlyCategoryName = (category: MaterialCategory): string => {
  const names: Record<MaterialCategory, string> = {
    'wall': '墙面材质',
    'floor': '地面材质',
    'furniture-wood': '木质家具',
    'furniture-fabric': '布艺材质',
    'furniture-metal': '金属材质',
    'furniture-leather': '皮革材质',
    'furniture-marble': '大理石材质',
  };
  return names[category] || category;
};
