import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomConfig, buildRoom, estimateRoomDimensions } from './roomBuilder';
import { createFurniture, getFurnitureById } from './furnitureFactory';
import { FurnitureItem, PlacedFurniture, FURNITURE_LIBRARY } from './types';
import {
  MaterialPreset,
  MaterialCategory,
  ALL_MATERIALS,
  applyMaterialToMesh,
  detectMaterialCategory,
  getMaterialsByCategory,
} from './materialLibrary';

export type SelectedObjectType = 'furniture' | 'wall' | 'floor' | 'ceiling' | null;

export interface SelectedObjectInfo {
  type: SelectedObjectType;
  mesh?: THREE.Mesh;
  furniture?: PlacedFurniture;
  category?: string;
  name?: string;
}

export interface SceneManagerCallbacks {
  onFurnitureSelect?: (furniture: PlacedFurniture | null) => void;
  onFurnitureUpdate?: (furniture: PlacedFurniture) => void;
  onFurnitureAdd?: (furniture: PlacedFurniture) => void;
  onFurnitureRemove?: (id: string) => void;
  onObjectSelect?: (info: SelectedObjectInfo | null) => void;
}

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private container: HTMLElement;

  private roomGroup: THREE.Group | null = null;
  private furnitureGroup: THREE.Group;
  private placedFurniture: Map<string, PlacedFurniture> = new Map();

  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedFurniture: PlacedFurniture | null = null;
  private selectedObject: SelectedObjectInfo | null = null;
  private selectedMesh: THREE.Mesh | null = null;

  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3;
  private isDragging: boolean = false;
  private isPointerDown: boolean = false;
  private pointerDownPos: THREE.Vector2 = new THREE.Vector2();

  private callbacks: SceneManagerCallbacks;
  private animationId: number = 0;
  private isInitialized: boolean = false;

  private gridSize: number = 0.1;

  private originalMaterials: Map<string, THREE.Material | THREE.Material[]> = new Map();
  private isPreviewMode: boolean = false;

  constructor(container: HTMLElement, callbacks: SceneManagerCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.dragOffset = new THREE.Vector3();
    this.furnitureGroup = new THREE.Group();
    this.furnitureGroup.name = 'furniture-group';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe8e8e8);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(6, 5, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.target.set(0, 1, 0);

    this.setupLights();
    this.scene.add(this.furnitureGroup);

    this.bindEvents();
    this.animate();
    this.isInitialized = true;
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  private bindEvents(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointerleave', this.onPointerUp);
    window.addEventListener('resize', this.onResize);
  }

  private unbindEvents(): void {
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointerleave', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.isPointerDown = true;
    this.pointerDownPos.set(event.clientX, event.clientY);

    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const furnitureMeshes = this.furnitureGroup.children.flatMap((group) =>
      (group as THREE.Group).children.filter((c) => c instanceof THREE.Mesh)
    );
    const furnitureIntersects = this.raycaster.intersectObjects(furnitureMeshes, true);

    if (furnitureIntersects.length > 0) {
      let obj: THREE.Object3D | null = furnitureIntersects[0].object;
      while (obj && !obj.userData.furnitureId) {
        obj = obj.parent;
      }
      if (obj && obj.userData.furnitureId) {
        const id = obj.userData.furnitureId as string;
        const placed = this.placedFurniture.get(id);
        if (placed) {
          this.selectFurniture(placed);
          this.startDrag(event);
          return;
        }
      }
    }

    const allIntersects = this.raycaster.intersectObject(this.scene, true);
    const roomParts = allIntersects.filter(
      (i) =>
        (i.object as THREE.Mesh).isMesh &&
        (i.object.userData.isWall ||
          i.object.userData.isFloor ||
          i.object.userData.isCeiling)
    );

    if (roomParts.length > 0) {
      const hit = roomParts[0].object as THREE.Mesh;
      this.selectRoomPart(hit);
      return;
    }

    this.deselectAll();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.isPointerDown) return;

    const dx = Math.abs(event.clientX - this.pointerDownPos.x);
    const dy = Math.abs(event.clientY - this.pointerDownPos.y);

    if (dx > 3 || dy > 3) {
      if (this.isDragging && this.selectedFurniture && this.selectedFurniture.mesh) {
        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersection = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
          let newPos = intersection.sub(this.dragOffset);

          newPos.x = Math.round(newPos.x / this.gridSize) * this.gridSize;
          newPos.z = Math.round(newPos.z / this.gridSize) * this.gridSize;

          if (this.roomGroup) {
            const room = this.roomGroup.userData as RoomConfig;
            const halfW = (room.width / 2) - 0.3;
            const halfD = (room.depth / 2) - 0.3;
            newPos.x = THREE.MathUtils.clamp(newPos.x, -halfW, halfW);
            newPos.z = THREE.MathUtils.clamp(newPos.z, -halfD, halfD);
          }

          newPos.y = this.selectedFurniture.mesh.position.y;
          this.selectedFurniture.mesh.position.copy(newPos);
          this.selectedFurniture.position.copy(newPos);
        }
      }
    }
  };

  private onPointerUp = (_event: PointerEvent): void => {
    const wasDragging = this.isDragging;
    this.isDragging = false;
    this.isPointerDown = false;

    if (wasDragging && this.selectedFurniture) {
      this.controls.enabled = true;
      this.callbacks.onFurnitureUpdate?.(this.selectedFurniture);
    }
  };

  private onResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updateMouse(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private startDrag(_event: PointerEvent): void {
    if (!this.selectedFurniture || !this.selectedFurniture.mesh) return;

    this.controls.enabled = false;
    this.isDragging = true;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersection = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
      this.dragOffset.copy(intersection).sub(this.selectedFurniture.mesh.position);
    }
  }

  private selectFurniture(furniture: PlacedFurniture): void {
    if (this.selectedFurniture && this.selectedFurniture.mesh) {
      this.setMeshEmissive(this.selectedFurniture.mesh, 0x000000);
    }

    this.selectedFurniture = furniture;
    if (furniture.mesh) {
      this.setMeshEmissive(furniture.mesh, 0x4488ff);
    }
    this.callbacks.onFurnitureSelect?.(furniture);
  }

  private deselectFurniture(): void {
    if (this.selectedFurniture && this.selectedFurniture.mesh) {
      this.setMeshEmissive(this.selectedFurniture.mesh, 0x000000);
    }
    this.selectedFurniture = null;
    this.callbacks.onFurnitureSelect?.(null);
  }

  private selectRoomPart(mesh: THREE.Mesh): void {
    this.deselectFurniture();
    this.clearMeshSelection();

    this.selectedMesh = mesh;
    this.setSingleMeshEmissive(mesh, 0x4488ff);

    const info: SelectedObjectInfo = {
      type: mesh.userData.isWall ? 'wall' : mesh.userData.isFloor ? 'floor' : mesh.userData.isCeiling ? 'ceiling' : null,
      mesh,
      category: mesh.userData.materialCategory,
      name: mesh.userData.partsName,
    };

    this.selectedObject = info;
    this.callbacks.onObjectSelect?.(info);
  }

  private deselectAll(): void {
    this.deselectFurniture();
    this.clearMeshSelection();
    this.selectedObject = null;
    this.selectedMesh = null;
    this.callbacks.onObjectSelect?.(null);
  }

  private clearMeshSelection(): void {
    if (this.selectedMesh) {
      this.setSingleMeshEmissive(this.selectedMesh, 0x000000);
      this.selectedMesh = null;
    }
  }

  private setSingleMeshEmissive(mesh: THREE.Mesh, color: number): void {
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.setHex(color);
    }
  }

  private setMeshEmissive(group: THREE.Object3D, color: number): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.setHex(color);
      }
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  buildRoom(config: RoomConfig): void {
    if (this.roomGroup) {
      this.scene.remove(this.roomGroup);
    }

    this.roomGroup = buildRoom(config);
    this.roomGroup.userData = config;
    this.scene.add(this.roomGroup);

    const maxDim = Math.max(config.width, config.depth);
    this.camera.position.set(maxDim * 0.8, maxDim * 0.7, maxDim * 0.8);
    this.controls.target.set(0, config.height / 2, 0);
    this.controls.update();
  }

  buildRoomFromArea(area: number, roomType: string, style?: string): void {
    const dims = estimateRoomDimensions(area, roomType);
    this.buildRoom({
      width: dims.width,
      height: dims.height,
      depth: dims.depth,
      style,
    });
  }

  addFurniture(furnitureItem: FurnitureItem): PlacedFurniture | null {
    const mesh = createFurniture(furnitureItem);
    const id = `${furnitureItem.id}-${Date.now()}`;

    mesh.position.set(0, 0, 0);
    mesh.userData.furnitureId = id;
    mesh.name = id;

    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.furnitureGroup.add(mesh);

    const placed: PlacedFurniture = {
      id,
      furnitureId: furnitureItem.id,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      mesh,
    };

    this.placedFurniture.set(id, placed);
    this.selectFurniture(placed);
    this.callbacks.onFurnitureAdd?.(placed);

    return placed;
  }

  addFurnitureById(furnitureId: string): PlacedFurniture | null {
    const item = getFurnitureById(furnitureId);
    if (!item) return null;
    return this.addFurniture(item);
  }

  removeFurniture(id: string): boolean {
    const placed = this.placedFurniture.get(id);
    if (!placed) return false;

    if (placed.mesh) {
      this.furnitureGroup.remove(placed.mesh);
      placed.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.placedFurniture.delete(id);

    if (this.selectedFurniture?.id === id) {
      this.selectedFurniture = null;
      this.callbacks.onFurnitureSelect?.(null);
    }

    this.callbacks.onFurnitureRemove?.(id);
    return true;
  }

  rotateSelected(angleDeg: number): void {
    if (!this.selectedFurniture?.mesh) return;
    const angle = THREE.MathUtils.degToRad(angleDeg);
    this.selectedFurniture.mesh.rotation.y += angle;
    this.selectedFurniture.rotation.copy(this.selectedFurniture.mesh.rotation);
    this.callbacks.onFurnitureUpdate?.(this.selectedFurniture);
  }

  scaleSelected(factor: number): void {
    if (!this.selectedFurniture?.mesh) return;
    const newScale = this.selectedFurniture.mesh.scale.x * factor;
    const clampedScale = THREE.MathUtils.clamp(newScale, 0.3, 3);
    this.selectedFurniture.mesh.scale.setScalar(clampedScale);
    this.selectedFurniture.scale.copy(this.selectedFurniture.mesh.scale);
    this.callbacks.onFurnitureUpdate?.(this.selectedFurniture);
  }

  nudgeSelected(dx: number, dz: number): void {
    if (!this.selectedFurniture?.mesh) return;
    const mesh = this.selectedFurniture.mesh;
    mesh.position.x += dx;
    mesh.position.z += dz;

    if (this.roomGroup) {
      const room = this.roomGroup.userData as RoomConfig;
      const halfW = (room.width / 2) - 0.3;
      const halfD = (room.depth / 2) - 0.3;
      mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -halfW, halfW);
      mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -halfD, halfD);
    }

    this.selectedFurniture.position.copy(mesh.position);
    this.callbacks.onFurnitureUpdate?.(this.selectedFurniture);
  }

  getSelectedFurniture(): PlacedFurniture | null {
    return this.selectedFurniture;
  }

  getAllFurniture(): PlacedFurniture[] {
    return Array.from(this.placedFurniture.values());
  }

  getFurnitureLibrary(): FurnitureItem[] {
    return FURNITURE_LIBRARY;
  }

  setGridSize(size: number): void {
    this.gridSize = Math.max(0.01, size);
  }

  getRoomConfig(): RoomConfig | null {
    return this.roomGroup ? (this.roomGroup.userData as RoomConfig) : null;
  }

  getSelectedObject(): SelectedObjectInfo | null {
    return this.selectedObject;
  }

  getAvailableMaterials(category: MaterialCategory): MaterialPreset[] {
    return getMaterialsByCategory(category);
  }

  applyMaterialToSelected(preset: MaterialPreset, applyToAllWalls = false): boolean {
    if (this.selectedFurniture && this.selectedFurniture.mesh) {
      this.selectedFurniture.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          applyMaterialToMesh(child, preset);
        }
      });
      this.callbacks.onFurnitureUpdate?.(this.selectedFurniture);
      return true;
    }

    if (this.selectedMesh) {
      if (applyToAllWalls && this.selectedMesh.userData.isWall && this.roomGroup) {
        this.roomGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isWall) {
            applyMaterialToMesh(child, preset);
          }
        });
      } else {
        applyMaterialToMesh(this.selectedMesh, preset);
      }
      return true;
    }

    return false;
  }

  applyMaterialToAllWalls(preset: MaterialPreset): boolean {
    if (!this.roomGroup) return false;
    this.roomGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isWall) {
        applyMaterialToMesh(child, preset);
      }
    });
    return true;
  }

  applyMaterialToFloor(preset: MaterialPreset): boolean {
    if (!this.roomGroup) return false;
    const floor = this.roomGroup.children.find(
      (c) => (c as THREE.Mesh).name === 'floor'
    ) as THREE.Mesh | undefined;
    if (floor) {
      applyMaterialToMesh(floor, preset);
      return true;
    }
    return false;
  }

  previewMaterial(preset: MaterialPreset | null): void {
    if (this.isPreviewMode) {
      this.restoreOriginalMaterials();
    }

    if (!preset) return;

    if (this.selectedFurniture && this.selectedFurniture.mesh) {
      this.storeOriginalMaterials(this.selectedFurniture.mesh);
      this.selectedFurniture.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          applyMaterialToMesh(child, preset);
        }
      });
      this.isPreviewMode = true;
      return;
    }

    if (this.selectedMesh) {
      if (this.selectedMesh.userData.isWall) {
        this.storeOriginalMaterials(this.selectedMesh);
        applyMaterialToMesh(this.selectedMesh, preset);
      } else {
        this.storeOriginalMaterials(this.selectedMesh);
        applyMaterialToMesh(this.selectedMesh, preset);
      }
      this.isPreviewMode = true;
    }
  }

  applyPreviewMaterial(preset: MaterialPreset): void {
    this.applyMaterialToSelected(preset, false);
    this.originalMaterials.clear();
    this.isPreviewMode = false;
  }

  cancelPreview(): void {
    this.restoreOriginalMaterials();
  }

  private storeOriginalMaterials(root: THREE.Object3D): void {
    this.originalMaterials.clear();
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.originalMaterials.set(child.uuid, child.material);
      }
    });
  }

  private restoreOriginalMaterials(): void {
    if (!this.isPreviewMode) return;

    const restore = (root: THREE.Object3D) => {
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = this.originalMaterials.get(child.uuid);
          if (original) {
            child.material = original;
          }
        }
      });
    };

    if (this.selectedFurniture && this.selectedFurniture.mesh) {
      restore(this.selectedFurniture.mesh);
    } else if (this.selectedMesh) {
      restore(this.selectedMesh);
    }

    this.originalMaterials.clear();
    this.isPreviewMode = false;
  }

  getMaterialById(id: string): MaterialPreset | undefined {
    return ALL_MATERIALS.find((m) => m.id === id);
  }

  dispose(): void {
    if (!this.isInitialized) return;
    this.unbindEvents();
    cancelAnimationFrame(this.animationId);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.isInitialized = false;
  }
}
