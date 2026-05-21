import * as THREE from 'three';
import { RoomDimensions } from './types';

export interface RoomConfig {
  width: number;
  height: number;
  depth: number;
  style?: string;
  wallColor?: number;
  floorColor?: number;
  ceilingColor?: number;
}

const STYLE_COLORS: Record<string, { wall: number; floor: number; ceiling: number }> = {
  '现代简约': { wall: 0xf8f9fa, floor: 0xe8dcc8, ceiling: 0xffffff },
  '北欧': { wall: 0xf5f2eb, floor: 0xd4a574, ceiling: 0xffffff },
  '中式': { wall: 0xf5efe6, floor: 0x8b4513, ceiling: 0xf8f8ff },
  '欧式': { wall: 0xf0ead6, floor: 0xc9a86c, ceiling: 0xfffaf0 },
  '美式': { wall: 0xfaf8f5, floor: 0xa0522d, ceiling: 0xffffff },
  '日式': { wall: 0xede8df, floor: 0xc4a882, ceiling: 0xfafaf5 },
  '工业风': { wall: 0x808080, floor: 0x3d3d3d, ceiling: 0x696969 },
  '轻奢': { wall: 0xfaf8f5, floor: 0xd4af37, ceiling: 0xfff8dc },
};

const DEFAULT_COLORS = { wall: 0xf8f9fa, floor: 0xd4c4b0, ceiling: 0xffffff };

export const getStyleColors = (style?: string) => {
  return style && STYLE_COLORS[style] ? STYLE_COLORS[style] : DEFAULT_COLORS;
};

export const buildRoom = (config: RoomConfig): THREE.Group => {
  const group = new THREE.Group();
  const colors = getStyleColors(config.style);

  const { width, height, depth } = config;

  const floorGeo = new THREE.PlaneGeometry(width, depth);
  const floorMat = new THREE.MeshStandardMaterial({
    color: colors.floor,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  floor.userData.isFloor = true;
  floor.userData.materialCategory = 'floor';
  floor.userData.partsName = '地板';
  group.add(floor);

  const ceilingGeo = new THREE.PlaneGeometry(width, depth);
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: colors.ceiling,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.name = 'ceiling';
  ceiling.userData.isCeiling = true;
  ceiling.userData.materialCategory = 'wall';
  ceiling.userData.partsName = '天花板';
  group.add(ceiling);

  const backWallMat = new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const leftWallMat = new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const rightWallMat = new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const frontWallMat = new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });

  const wallThickness = 0.15;

  const backWallGeo = new THREE.BoxGeometry(width + wallThickness * 2, height, wallThickness);
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, height / 2, -depth / 2 - wallThickness / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  backWall.name = 'wall-back';
  backWall.userData.isWall = true;
  backWall.userData.wallSide = 'back';
  backWall.userData.materialCategory = 'wall';
  backWall.userData.partsName = '后墙';
  group.add(backWall);

  const frontWallGeo = new THREE.BoxGeometry(width + wallThickness * 2, height, wallThickness);
  const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
  frontWall.position.set(0, height / 2, depth / 2 + wallThickness / 2);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  frontWall.name = 'wall-front';
  frontWall.userData.isWall = true;
  frontWall.userData.wallSide = 'front';
  frontWall.userData.materialCategory = 'wall';
  frontWall.userData.partsName = '前墙';
  group.add(frontWall);

  const leftWallGeo = new THREE.BoxGeometry(wallThickness, height, depth);
  const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
  leftWall.position.set(-width / 2 - wallThickness / 2, height / 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  leftWall.name = 'wall-left';
  leftWall.userData.isWall = true;
  leftWall.userData.wallSide = 'left';
  leftWall.userData.materialCategory = 'wall';
  leftWall.userData.partsName = '左墙';
  group.add(leftWall);

  const rightWallGeo = new THREE.BoxGeometry(wallThickness, height, depth);
  const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
  rightWall.position.set(width / 2 + wallThickness / 2, height / 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  rightWall.name = 'wall-right';
  rightWall.userData.isWall = true;
  rightWall.userData.wallSide = 'right';
  rightWall.userData.materialCategory = 'wall';
  rightWall.userData.partsName = '右墙';
  group.add(rightWall);

  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.6,
  });

  const baseboardHeight = 0.1;
  const baseboardDepth = 0.02;

  const backBaseboardGeo = new THREE.BoxGeometry(width, baseboardHeight, baseboardDepth);
  const backBaseboard = new THREE.Mesh(backBaseboardGeo, baseboardMat);
  backBaseboard.position.set(0, baseboardHeight / 2, -depth / 2 + baseboardDepth / 2);
  group.add(backBaseboard);

  const leftBaseboardGeo = new THREE.BoxGeometry(baseboardDepth, baseboardHeight, depth);
  const leftBaseboard = new THREE.Mesh(leftBaseboardGeo, baseboardMat);
  leftBaseboard.position.set(-width / 2 + baseboardDepth / 2, baseboardHeight / 2, 0);
  group.add(leftBaseboard);

  const rightBaseboard = leftBaseboard.clone();
  rightBaseboard.position.x = width / 2 - baseboardDepth / 2;
  group.add(rightBaseboard);

  const gridHelper = new THREE.GridHelper(Math.max(width, depth), 20, 0xcccccc, 0xe0e0e0);
  gridHelper.position.y = 0.001;
  gridHelper.name = 'grid';
  gridHelper.userData.isGrid = true;
  group.add(gridHelper);

  return group;
};

export const estimateRoomDimensions = (area: number, roomType: string): RoomDimensions => {
  const ceilingHeight = 2.8;

  const roomConfig: Record<string, { ratio: number; minWidth: number; minDepth: number; maxWidth: number; maxDepth: number }> = {
    '客厅': { ratio: 1.5, minWidth: 3.6, minDepth: 2.8, maxWidth: 8.0, maxDepth: 6.0 },
    '卧室': { ratio: 1.2, minWidth: 3.0, minDepth: 2.8, maxWidth: 5.0, maxDepth: 4.2 },
    '厨房': { ratio: 1.3, minWidth: 2.2, minDepth: 1.8, maxWidth: 4.0, maxDepth: 3.0 },
    '卫生间': { ratio: 0.85, minWidth: 1.8, minDepth: 1.5, maxWidth: 2.8, maxDepth: 2.2 },
    '书房': { ratio: 1.15, minWidth: 2.6, minDepth: 2.4, maxWidth: 4.0, maxDepth: 3.5 },
    '餐厅': { ratio: 1.15, minWidth: 2.8, minDepth: 2.6, maxWidth: 4.5, maxDepth: 4.0 },
    '阳台': { ratio: 2.5, minWidth: 1.5, minDepth: 0.8, maxWidth: 4.0, maxDepth: 1.8 },
    '整体': { ratio: 1.4, minWidth: 5.0, minDepth: 4.0, maxWidth: 12.0, maxDepth: 10.0 },
  };

  const config = roomConfig[roomType] || roomConfig['客厅'];

  const minArea = config.minWidth * config.minDepth;
  const maxArea = config.maxWidth * config.maxDepth;
  const targetArea = Math.max(minArea * 0.8, Math.min(maxArea * 1.2, area));

  let depth = Math.sqrt(targetArea / config.ratio);
  let width = depth * config.ratio;

  const maxRatio = Math.max(config.ratio * 1.3, 2.0);
  const minRatio = Math.min(config.ratio * 0.7, 1 / 2.0);

  if (width > config.maxWidth) {
    width = config.maxWidth;
    depth = targetArea / width;
  } else if (width < config.minWidth) {
    width = config.minWidth;
    depth = targetArea / width;
  }

  if (depth > config.maxDepth) {
    depth = config.maxDepth;
    width = targetArea / depth;
    if (width > config.maxWidth) width = config.maxWidth;
    else if (width < config.minWidth) width = config.minWidth;
  } else if (depth < config.minDepth) {
    depth = config.minDepth;
    width = targetArea / depth;
    if (width > config.maxWidth) width = config.maxWidth;
    else if (width < config.minWidth) width = config.minWidth;
  }

  let currentRatio = width / depth;
  if (currentRatio > maxRatio) {
    width = depth * maxRatio;
    if (width > config.maxWidth) {
      width = config.maxWidth;
      depth = width / maxRatio;
    }
  } else if (currentRatio < minRatio) {
    depth = width / minRatio;
    if (depth > config.maxDepth) {
      depth = config.maxDepth;
      width = depth * minRatio;
    }
  }

  width = Math.max(config.minWidth, Math.min(config.maxWidth, width));
  depth = Math.max(config.minDepth, Math.min(config.maxDepth, depth));

  const actualArea = width * depth;
  const areaDiff = Math.abs(actualArea - targetArea) / targetArea;
  if (areaDiff > 0.25 && area > minArea * 0.5 && area < maxArea * 1.5) {
    const scale = Math.sqrt(area / actualArea);
    let newWidth = width * scale;
    let newDepth = depth * scale;

    newWidth = Math.max(config.minWidth, Math.min(config.maxWidth, newWidth));
    newDepth = Math.max(config.minDepth, Math.min(config.maxDepth, newDepth));

    const newRatio = newWidth / newDepth;
    if (newRatio >= minRatio && newRatio <= maxRatio) {
      width = newWidth;
      depth = newDepth;
    }
  }

  return {
    width: Math.round(width * 100) / 100,
    height: ceilingHeight,
    depth: Math.round(depth * 100) / 100,
  };
};
