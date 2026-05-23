class GeometricBlocks {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.selectedObject = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.autoRotate = true;
        this.clock = new THREE.Clock();
        this.geometryTypes = ['cube', 'sphere', 'cylinder', 'torus', 'cone'];
        this.cameraDistance = 8.66;
        this.cameraTheta = Math.PI / 4;
        this.cameraPhi = Math.PI / 4;
        this.isAnimating = false;
        
        this.init();
        this.setupLights();
        this.setupGrid();
        this.addInitialObjects();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        this.updateCameraPosition();

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize(), { passive: true });
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(8, 12, 8);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.4);
        fillLight.position.set(-6, 4, -6);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffaa66, 0.3);
        rimLight.position.set(0, 6, -8);
        this.scene.add(rimLight);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    addInitialObjects() {
        this.addCube();
        this.addSphere();
        this.addCylinder();
    }

    addCube() {
        const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00ff88,
            metalness: 0.3,
            roughness: 0.2,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2,
            envMapIntensity: 1.0
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 4,
            0.8,
            (Math.random() - 0.5) * 4
        );
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData.type = '立方体';
        cube.userData.geometryType = 'cube';
        cube.userData.originalColor = 0x00ff88;
        cube.userData.rotationSpeed = {
            x: 0.4 + Math.random() * 0.3,
            y: 0.6 + Math.random() * 0.4,
            z: 0.2 + Math.random() * 0.2
        };
        this.scene.add(cube);
        this.objects.push(cube);
        return cube;
    }

    addSphere() {
        const geometry = new THREE.SphereGeometry(0.7, 48, 48);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00d4ff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.3,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 4,
            0.9,
            (Math.random() - 0.5) * 4
        );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData.type = '球体';
        sphere.userData.geometryType = 'sphere';
        sphere.userData.originalColor = 0x00d4ff;
        sphere.userData.rotationSpeed = {
            x: 0.3 + Math.random() * 0.3,
            y: 0.8 + Math.random() * 0.4,
            z: 0.15 + Math.random() * 0.15
        };
        this.scene.add(sphere);
        this.objects.push(sphere);
        return sphere;
    }

    addCylinder() {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 48);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xff6b6b,
            metalness: 0.8,
            roughness: 0.15,
            clearcoat: 0.9,
            clearcoatRoughness: 0.15
        });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(
            (Math.random() - 0.5) * 4,
            0.9,
            (Math.random() - 0.5) * 4
        );
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        cylinder.userData.type = '圆柱体';
        cylinder.userData.geometryType = 'cylinder';
        cylinder.userData.originalColor = 0xff6b6b;
        cylinder.userData.rotationSpeed = {
            x: 0.35 + Math.random() * 0.3,
            y: 0.5 + Math.random() * 0.4,
            z: 0.4 + Math.random() * 0.3
        };
        this.scene.add(cylinder);
        this.objects.push(cylinder);
        return cylinder;
    }

    addTorus() {
        const geometry = new THREE.TorusGeometry(0.6, 0.2, 24, 120);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffd93d,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });
        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(
            (Math.random() - 0.5) * 4,
            0.9,
            (Math.random() - 0.5) * 4
        );
        torus.castShadow = true;
        torus.receiveShadow = true;
        torus.userData.type = '圆环';
        torus.userData.geometryType = 'torus';
        torus.userData.originalColor = 0xffd93d;
        torus.userData.rotationSpeed = {
            x: 0.5 + Math.random() * 0.4,
            y: 0.7 + Math.random() * 0.4,
            z: 0.6 + Math.random() * 0.3
        };
        this.scene.add(torus);
        this.objects.push(torus);
        return torus;
    }

    addCone() {
        const geometry = new THREE.ConeGeometry(0.6, 1.4, 48);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xa855f7,
            metalness: 0.2,
            roughness: 0.3,
            clearcoat: 0.7,
            clearcoatRoughness: 0.25
        });
        const cone = new THREE.Mesh(geometry, material);
        cone.position.set(
            (Math.random() - 0.5) * 4,
            0.9,
            (Math.random() - 0.5) * 4
        );
        cone.castShadow = true;
        cone.receiveShadow = true;
        cone.userData.type = '圆锥体';
        cone.userData.geometryType = 'cone';
        cone.userData.originalColor = 0xa855f7;
        cone.userData.rotationSpeed = {
            x: 0.4 + Math.random() * 0.3,
            y: 0.6 + Math.random() * 0.4,
            z: 0.3 + Math.random() * 0.3
        };
        this.scene.add(cone);
        this.objects.push(cone);
        return cone;
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        const btn = document.getElementById('toggleRotate');
        if (this.autoRotate) {
            btn.classList.add('active');
            btn.textContent = '自动旋转';
        } else {
            btn.classList.remove('active');
            btn.textContent = '暂停旋转';
        }
    }

    switchGeometry(type) {
        if (!this.selectedObject) {
            this.showToast('请先选择一个几何体！');
            return;
        }

        let newGeometry;
        let newType;
        let materialParams;

        switch(type) {
            case 'cube':
                newGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
                newType = '立方体';
                materialParams = { metalness: 0.3, roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.2 };
                break;
            case 'sphere':
                newGeometry = new THREE.SphereGeometry(0.7, 48, 48);
                newType = '球体';
                materialParams = { metalness: 0.1, roughness: 0.1, transmission: 0.3, thickness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.1 };
                break;
            case 'cylinder':
                newGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 48);
                newType = '圆柱体';
                materialParams = { metalness: 0.8, roughness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.15 };
                break;
            case 'torus':
                newGeometry = new THREE.TorusGeometry(0.6, 0.2, 24, 120);
                newType = '圆环';
                materialParams = { metalness: 0.9, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.05 };
                break;
            case 'cone':
                newGeometry = new THREE.ConeGeometry(0.6, 1.4, 48);
                newType = '圆锥体';
                materialParams = { metalness: 0.2, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.25 };
                break;
            default:
                return;
        }

        const oldGeometry = this.selectedObject.geometry;
        this.selectedObject.geometry = newGeometry;
        
        Object.assign(this.selectedObject.material, materialParams);
        this.selectedObject.material.needsUpdate = true;
        
        this.selectedObject.userData.type = newType;
        this.selectedObject.userData.geometryType = type;

        if (oldGeometry) {
            oldGeometry.dispose();
        }

        this.updatePropertyPanel();
        this.showToast(`已切换为${newType}`);
    }

    showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
        }, 2000);
    }

    clearScene() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.objects = [];
        this.selectedObject = null;
        this.updatePropertyPanel();
    }

    setupEventListeners() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));

        document.getElementById('addCube').addEventListener('click', () => this.addCube());
        document.getElementById('addSphere').addEventListener('click', () => this.addSphere());
        document.getElementById('addCylinder').addEventListener('click', () => this.addCylinder());
        document.getElementById('addTorus').addEventListener('click', () => this.addTorus());
        document.getElementById('addCone').addEventListener('click', () => this.addCone());
        document.getElementById('toggleRotate').addEventListener('click', () => this.toggleAutoRotate());
        document.getElementById('clearScene').addEventListener('click', () => this.clearScene());

        document.querySelectorAll('.switch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type;
                this.switchGeometry(type);
            });
        });

        document.getElementById('rotateX').addEventListener('input', (e) => this.updateRotation('x', e.target.value));
        document.getElementById('rotateY').addEventListener('input', (e) => this.updateRotation('y', e.target.value));
        document.getElementById('rotateZ').addEventListener('input', (e) => this.updateRotation('z', e.target.value));
        document.getElementById('scale').addEventListener('input', (e) => this.updateScale(e.target.value));
        document.getElementById('colorPicker').addEventListener('input', (e) => this.updateColor(e.target.value));
    }

    onMouseDown(event) {
        event.preventDefault();
        this.isDragging = true;
        this.dragStartPosition = { x: event.clientX, y: event.clientY };
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
        this.hasMoved = false;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
            this.selectObject(intersects[0].object);
        } else {
            this.deselectObject();
        }
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };

        const totalDelta = Math.abs(event.clientX - this.dragStartPosition.x) + 
                          Math.abs(event.clientY - this.dragStartPosition.y);
        if (totalDelta > 3) {
            this.hasMoved = true;
        }

        if (!this.selectedObject) {
            this.cameraTheta -= deltaMove.x * 0.008;
            this.cameraPhi += deltaMove.y * 0.008;
            this.cameraPhi = Math.max(0.05, Math.min(Math.PI - 0.05, this.cameraPhi));

            this.updateCameraPosition();
        } else {
            const rotationSpeed = 0.008;
            this.selectedObject.rotation.y += deltaMove.x * rotationSpeed;
            this.selectedObject.rotation.x += deltaMove.y * rotationSpeed;
            this.updatePropertyPanel();
        }

        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseWheel(event) {
        event.preventDefault();
        const zoomSpeed = 0.08;

        if (this.selectedObject) {
            const delta = event.deltaY > 0 ? -zoomSpeed * 2 : zoomSpeed * 2;
            const newScale = Math.max(0.3, Math.min(3, this.selectedObject.scale.x + delta));
            this.selectedObject.scale.setScalar(newScale);
            this.updatePropertyPanel();
        } else {
            this.cameraDistance += event.deltaY * 0.01;
            this.cameraDistance = Math.max(3, Math.min(20, this.cameraDistance));
            this.updateCameraPosition();
        }
    }

    updateCameraPosition() {
        const x = this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
        const y = this.cameraDistance * Math.cos(this.cameraPhi);
        const z = this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    selectObject(object) {
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }

        this.selectedObject = object;
        this.selectedObject.material.emissive.setHex(0x333333);
        this.updatePropertyPanel();
    }

    deselectObject() {
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        this.selectedObject = null;
        this.updatePropertyPanel();
    }

    updateRotation(axis, value) {
        if (!this.selectedObject) return;
        const radians = THREE.MathUtils.degToRad(value);
        this.selectedObject.rotation[axis] = radians;
    }

    updateScale(value) {
        if (!this.selectedObject) return;
        this.selectedObject.scale.setScalar(value);
    }

    updateColor(hex) {
        if (!this.selectedObject) return;
        this.selectedObject.material.color.set(hex);
    }

    updateSwitchButtons(activeType) {
        document.querySelectorAll('.switch-btn').forEach(btn => {
            if (btn.dataset.type === activeType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updatePropertyPanel() {
        const selectedEl = document.getElementById('selected-object');
        const rotateX = document.getElementById('rotateX');
        const rotateY = document.getElementById('rotateY');
        const rotateZ = document.getElementById('rotateZ');
        const scale = document.getElementById('scale');
        const colorPicker = document.getElementById('colorPicker');

        if (this.selectedObject) {
            selectedEl.textContent = this.selectedObject.userData.type || '几何体';
            rotateX.value = THREE.MathUtils.radToDeg(this.selectedObject.rotation.x);
            rotateY.value = THREE.MathUtils.radToDeg(this.selectedObject.rotation.y);
            rotateZ.value = THREE.MathUtils.radToDeg(this.selectedObject.rotation.z);
            scale.value = this.selectedObject.scale.x;
            colorPicker.value = '#' + this.selectedObject.material.color.getHexString();
            
            if (this.selectedObject.userData.geometryType) {
                this.updateSwitchButtons(this.selectedObject.userData.geometryType);
            }
        } else {
            selectedEl.textContent = '无';
            rotateX.value = 0;
            rotateY.value = 0;
            rotateZ.value = 0;
            scale.value = 1;
            colorPicker.value = '#00ff88';
            this.updateSwitchButtons(null);
        }
    }

    onWindowResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            const container = document.getElementById('canvas-container');
            const width = container.clientWidth;
            const height = container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
        }, 100);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.autoRotate && this.objects.length > 0) {
            for (let i = 0, len = this.objects.length; i < len; i++) {
                const obj = this.objects[i];
                if (obj !== this.selectedObject && obj.userData.rotationSpeed) {
                    obj.rotation.x += obj.userData.rotationSpeed.x * delta;
                    obj.rotation.y += obj.userData.rotationSpeed.y * delta;
                    obj.rotation.z += obj.userData.rotationSpeed.z * delta;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GeometricBlocks();
});