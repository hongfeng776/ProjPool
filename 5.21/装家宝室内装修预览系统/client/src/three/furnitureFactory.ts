import * as THREE from 'three';
import { FurnitureItem, FURNITURE_LIBRARY } from './types';

const createSofa = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.7 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const seatGeo = new THREE.BoxGeometry(w, h * 0.45, d);
  const seat = new THREE.Mesh(seatGeo, material);
  seat.position.y = h * 0.225;
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(w, h * 0.55, d * 0.15);
  const back = new THREE.Mesh(backGeo, material);
  back.position.set(0, h * 0.725, -d * 0.425);
  back.castShadow = true;
  group.add(back);

  const armGeo = new THREE.BoxGeometry(d * 0.12, h * 0.65, d);
  const leftArm = new THREE.Mesh(armGeo, material);
  leftArm.position.set(-w * 0.5 + d * 0.06, h * 0.55, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = w * 0.5 - d * 0.06;
  group.add(rightArm);

  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, h * 0.2, 8);
  const legPositions = [
    [-w * 0.45, h * 0.1, d * 0.4],
    [w * 0.45, h * 0.1, d * 0.4],
    [-w * 0.45, h * 0.1, -d * 0.4],
    [w * 0.45, h * 0.1, -d * 0.4],
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, darkMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  const cushionGeo = new THREE.BoxGeometry(w * 0.85, h * 0.12, d * 0.8);
  const cushion = new THREE.Mesh(cushionGeo, material);
  cushion.position.y = h * 0.5;
  cushion.castShadow = true;
  group.add(cushion);

  return group;
};

const createTable = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.6 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const topGeo = new THREE.BoxGeometry(w, h * 0.08, d);
  const top = new THREE.Mesh(topGeo, material);
  top.position.y = h * 0.96;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const legGeo = new THREE.BoxGeometry(w * 0.07, h * 0.88, d * 0.07);
  const legPositions = [
    [-w * 0.42, h * 0.44, -d * 0.42],
    [w * 0.42, h * 0.44, -d * 0.42],
    [-w * 0.42, h * 0.44, d * 0.42],
    [w * 0.42, h * 0.44, d * 0.42],
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, material);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
};

const createChair = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.6 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2f1f, roughness: 0.8 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const seatGeo = new THREE.BoxGeometry(w * 0.8, h * 0.1, d * 0.8);
  const seat = new THREE.Mesh(seatGeo, material);
  seat.position.y = h * 0.45;
  seat.castShadow = true;
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(w * 0.8, h * 0.5, d * 0.06);
  const back = new THREE.Mesh(backGeo, material);
  back.position.set(0, h * 0.75, -d * 0.37);
  back.castShadow = true;
  group.add(back);

  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, h * 0.45, 8);
  const legPositions = [
    [-w * 0.3, h * 0.225, -d * 0.3],
    [w * 0.3, h * 0.225, -d * 0.3],
    [-w * 0.3, h * 0.225, d * 0.3],
    [w * 0.3, h * 0.225, d * 0.3],
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, darkMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
};

const createBed = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const woodMaterial = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.6 });
  const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
  const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const frameGeo = new THREE.BoxGeometry(w * 1.04, h * 0.3, d * 1.04);
  const frame = new THREE.Mesh(frameGeo, woodMaterial);
  frame.position.y = h * 0.15;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  const mattressGeo = new THREE.BoxGeometry(w, h * 0.3, d);
  const mattress = new THREE.Mesh(mattressGeo, mattressMaterial);
  mattress.position.y = h * 0.45;
  mattress.castShadow = true;
  group.add(mattress);

  const headboardGeo = new THREE.BoxGeometry(w * 1.04, h * 1.6, d * 0.08);
  const headboard = new THREE.Mesh(headboardGeo, woodMaterial);
  headboard.position.set(0, h * 0.9, -d * 0.54);
  headboard.castShadow = true;
  group.add(headboard);

  const pillowGeo = new THREE.BoxGeometry(w * 0.35, h * 0.12, d * 0.18);
  const pillow1 = new THREE.Mesh(pillowGeo, pillowMaterial);
  pillow1.position.set(-w * 0.22, h * 0.66, -d * 0.35);
  pillow1.castShadow = true;
  group.add(pillow1);

  const pillow2 = pillow1.clone();
  pillow2.position.x = w * 0.22;
  group.add(pillow2);

  return group;
};

const createStorage = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.5 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1f14, roughness: 0.6 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const bodyGeo = new THREE.BoxGeometry(w, h, d);
  const body = new THREE.Mesh(bodyGeo, material);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const doorGeo = new THREE.BoxGeometry(w * 0.48, h * 0.96, d * 0.03);
  const leftDoor = new THREE.Mesh(doorGeo, darkMaterial);
  leftDoor.position.set(-w * 0.25, h / 2, d * 0.5 + d * 0.015);
  group.add(leftDoor);

  const rightDoor = leftDoor.clone();
  rightDoor.position.x = w * 0.25;
  group.add(rightDoor);

  const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8);
  handleGeo.rotateX(Math.PI / 2);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });

  const leftHandle = new THREE.Mesh(handleGeo, handleMaterial);
  leftHandle.position.set(-w * 0.02, h * 0.5, d * 0.5 + d * 0.05);
  group.add(leftHandle);

  const rightHandle = leftHandle.clone();
  rightHandle.position.x = w * 0.02;
  group.add(rightHandle);

  return group;
};

const createPlant = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();

  const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.6 });
  const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });

  const w = item.width;
  const h = item.height;

  const potGeo = new THREE.CylinderGeometry(w * 0.5, w * 0.4, h * 0.25, 16);
  const pot = new THREE.Mesh(potGeo, potMaterial);
  pot.position.y = h * 0.125;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  const soilGeo = new THREE.CylinderGeometry(w * 0.48, w * 0.48, h * 0.02, 16);
  const soil = new THREE.Mesh(soilGeo, soilMaterial);
  soil.position.y = h * 0.25;
  group.add(soil);

  for (let i = 0; i < 8; i++) {
    const leafGeo = new THREE.SphereGeometry(w * 0.15 + Math.random() * w * 0.1, 8, 6);
    const leaf = new THREE.Mesh(leafGeo, leafMaterial);
    const angle = (i / 8) * Math.PI * 2;
    leaf.position.set(
      Math.cos(angle) * w * 0.2,
      h * 0.5 + Math.random() * h * 0.3,
      Math.sin(angle) * w * 0.2
    );
    leaf.scale.set(1 + Math.random() * 0.5, 1.5 + Math.random(), 1 + Math.random() * 0.5);
    leaf.castShadow = true;
    group.add(leaf);
  }

  const trunkGeo = new THREE.CylinderGeometry(w * 0.05, w * 0.06, h * 0.3, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
  trunk.position.y = h * 0.4;
  trunk.castShadow = true;
  group.add(trunk);

  return group;
};

const createLamp = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x2f2f2f, metalness: 0.7, roughness: 0.3 });
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: item.color,
    emissive: 0xffaa00,
    emissiveIntensity: 0.3,
    roughness: 0.5,
  });

  const w = item.width;
  const h = item.height;

  const baseGeo = new THREE.CylinderGeometry(w * 0.6, w * 0.7, h * 0.04, 16);
  const base = new THREE.Mesh(baseGeo, metalMaterial);
  base.position.y = h * 0.02;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const poleGeo = new THREE.CylinderGeometry(w * 0.06, w * 0.06, h * 0.85, 12);
  const pole = new THREE.Mesh(poleGeo, metalMaterial);
  pole.position.y = h * 0.465;
  pole.castShadow = true;
  group.add(pole);

  const shadeGeo = new THREE.ConeGeometry(w * 0.5, h * 0.25, 16, 1, true);
  const shade = new THREE.Mesh(shadeGeo, shadeMaterial);
  shade.position.y = h * 0.92;
  shade.castShadow = true;
  group.add(shade);

  return group;
};

const createRug = (item: FurnitureItem): THREE.Group => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.9 });

  const w = item.width;
  const h = item.height;
  const d = item.depth;

  const rugGeo = new THREE.BoxGeometry(w, h, d);
  const rug = new THREE.Mesh(rugGeo, material);
  rug.position.y = h / 2;
  rug.receiveShadow = true;
  group.add(rug);

  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 });
  const borderGeo = new THREE.BoxGeometry(w * 1.02, h * 1.1, d * 1.02);
  const border = new THREE.Mesh(borderGeo, borderMaterial);
  border.position.y = -h * 0.05;
  group.add(border);

  return group;
};

export const createFurniture = (item: FurnitureItem): THREE.Group => {
  let mesh: THREE.Group;

  switch (item.type) {
    case 'sofa':
      mesh = createSofa(item);
      break;
    case 'table':
      mesh = createTable(item);
      break;
    case 'chair':
      mesh = createChair(item);
      break;
    case 'bed':
      mesh = createBed(item);
      break;
    case 'storage':
      mesh = createStorage(item);
      break;
    case 'decor':
      if (item.id === 'plant') mesh = createPlant(item);
      else if (item.id === 'lamp') mesh = createLamp(item);
      else if (item.id === 'rug') mesh = createRug(item);
      else mesh = createStorage(item);
      break;
    default:
      mesh = createStorage(item);
  }

  mesh.userData = { furnitureId: item.id, furnitureType: item.type };
  mesh.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData = { furnitureId: item.id, furnitureType: item.type };
    }
  });

  return mesh;
};

export const getFurnitureById = (id: string): FurnitureItem | undefined => {
  return FURNITURE_LIBRARY.find((f) => f.id === id);
};
