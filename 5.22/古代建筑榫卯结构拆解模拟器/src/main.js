import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class MortiseTenonSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentJoint = null;
        this.jointGroup = null;
        this.isExploded = false;
        this.isAutoRotating = false;
        this.animationId = null;
        this.currentJointType = 'dovetail';
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isAnimating = false;
        this.tenonTargetPos = null;
        this.mortiseTargetPos = null;
        
        this.init();
        this.createLights();
        this.createJoint('dovetail');
        this.setupControls();
        this.setupEventListeners();
        this.updateStepIndicator();
        this.animate();
    }

    init() {
        const container = document.getElementById('scene-container');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(8, 6, 8);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);

        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
        this.scene.add(gridHelper);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x88aaff, 0.3);
        fillLight.position.set(-10, 5, -10);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffd700, 0.2);
        rimLight.position.set(0, 10, -10);
        this.scene.add(rimLight);
    }

    createWoodMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
    }

    createJoint(type) {
        if (this.jointGroup) {
            this.scene.remove(this.jointGroup);
            this.jointGroup.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        this.jointGroup = new THREE.Group();
        this.currentJointType = type;
        this.isExploded = false;

        if (type === 'basic') {
            this.createBasicMortiseTenon();
        } else if (type === 'dovetail') {
            this.createDovetailJoint();
        }

        this.scene.add(this.jointGroup);
    }

    createBasicMortiseTenon() {
        const woodMaterial = this.createWoodMaterial();

        const tenonGroup = new THREE.Group();
        const tenonMain = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1.5, 1.5),
            woodMaterial
        );
        tenonMain.position.set(-0.5, 0, 0);
        tenonMain.castShadow = true;
        tenonMain.receiveShadow = true;

        const tenonProtrusion = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1, 1),
            woodMaterial
        );
        tenonProtrusion.position.set(1.25, 0, 0);
        tenonProtrusion.castShadow = true;
        tenonProtrusion.receiveShadow = true;

        tenonGroup.add(tenonMain);
        tenonGroup.add(tenonProtrusion);
        tenonGroup.position.set(0, 0, 0);
        this.tenon = tenonGroup;

        const mortiseGroup = new THREE.Group();
        const mortiseMain = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1.5, 1.5),
            woodMaterial
        );
        mortiseMain.position.set(0.5, 0, 0);
        mortiseMain.castShadow = true;
        mortiseMain.receiveShadow = true;

        const mortiseHoleShape = new THREE.Shape();
        mortiseHoleShape.moveTo(-0.75, -0.5);
        mortiseHoleShape.lineTo(0.75, -0.5);
        mortiseHoleShape.lineTo(0.75, 0.5);
        mortiseHoleShape.lineTo(-0.75, 0.5);
        mortiseHoleShape.lineTo(-0.75, -0.5);

        const holePath = new THREE.Path();
        holePath.moveTo(-0.5, -0.4);
        holePath.lineTo(0.5, -0.4);
        holePath.lineTo(0.5, 0.4);
        holePath.lineTo(-0.5, 0.4);
        holePath.lineTo(-0.5, -0.4);
        mortiseHoleShape.holes.push(holePath);

        const extrudeSettings = {
            depth: 1.5,
            bevelEnabled: false
        };

        const mortiseWithHole = new THREE.Mesh(
            new THREE.ExtrudeGeometry(mortiseHoleShape, extrudeSettings),
            woodMaterial
        );
        mortiseWithHole.rotation.y = Math.PI / 2;
        mortiseWithHole.position.set(1.25, 0, 0);
        mortiseWithHole.castShadow = true;
        mortiseWithHole.receiveShadow = true;

        mortiseGroup.add(mortiseMain);
        mortiseGroup.add(mortiseWithHole);
        mortiseGroup.position.set(2.5, 0, 0);
        this.mortise = mortiseGroup;

        this.jointGroup.add(tenonGroup);
        this.jointGroup.add(mortiseGroup);

        this.originalMortisePos = this.mortise.position.clone();
        this.originalTenonPos = this.tenon.position.clone();
    }

    createDovetailJoint() {
        const woodMaterial = this.createWoodMaterial();

        const maleGroup = new THREE.Group();
        const femaleGroup = new THREE.Group();

        const boardWidth = 3;
        const boardThickness = 1;
        const boardDepth = 2;
        const tailCount = 3;
        const tailHeight = 0.7;
        const tailAngle = Math.PI / 6;
        const tailSlant = tailHeight * Math.tan(tailAngle);
        const tailSpace = (boardWidth - 0.3) / tailCount;

        const extrudeSettings = {
            depth: boardDepth,
            bevelEnabled: false
        };

        const maleShape = new THREE.Shape();
        maleShape.moveTo(-boardWidth / 2, 0);
        maleShape.lineTo(-boardWidth / 2, boardThickness);
        
        for (let i = 0; i < tailCount; i++) {
            const startX = -boardWidth / 2 + 0.15 + i * tailSpace;
            maleShape.lineTo(startX, boardThickness);
            maleShape.lineTo(startX + tailSlant, boardThickness + tailHeight);
            maleShape.lineTo(startX + tailSpace - tailSlant, boardThickness + tailHeight);
            maleShape.lineTo(startX + tailSpace, boardThickness);
        }
        
        maleShape.lineTo(boardWidth / 2, boardThickness);
        maleShape.lineTo(boardWidth / 2, 0);
        maleShape.lineTo(-boardWidth / 2, 0);

        const maleMesh = new THREE.Mesh(
            new THREE.ExtrudeGeometry(maleShape, extrudeSettings),
            woodMaterial
        );
        maleMesh.rotation.x = -Math.PI / 2;
        maleMesh.position.z = -boardDepth / 2;
        maleMesh.position.y = -boardThickness - tailHeight / 2;
        maleMesh.castShadow = true;
        maleMesh.receiveShadow = true;
        maleGroup.add(maleMesh);

        const femaleShape = new THREE.Shape();
        femaleShape.moveTo(-boardWidth / 2, 0);
        femaleShape.lineTo(-boardWidth / 2, boardThickness);
        femaleShape.lineTo(boardWidth / 2, boardThickness);
        femaleShape.lineTo(boardWidth / 2, 0);
        femaleShape.lineTo(-boardWidth / 2, 0);

        for (let i = 0; i < tailCount; i++) {
            const startX = -boardWidth / 2 + 0.15 + i * tailSpace;
            
            const socket = new THREE.Path();
            socket.moveTo(startX + tailSlant, 0);
            socket.lineTo(startX, tailHeight);
            socket.lineTo(startX + tailSpace, tailHeight);
            socket.lineTo(startX + tailSpace - tailSlant, 0);
            socket.lineTo(startX + tailSlant, 0);
            femaleShape.holes.push(socket);
        }

        const femaleMesh = new THREE.Mesh(
            new THREE.ExtrudeGeometry(femaleShape, extrudeSettings),
            woodMaterial
        );
        femaleMesh.rotation.x = -Math.PI / 2;
        femaleMesh.position.z = -boardDepth / 2;
        femaleMesh.position.y = tailHeight / 2;
        femaleMesh.castShadow = true;
        femaleMesh.receiveShadow = true;
        femaleGroup.add(femaleMesh);

        maleGroup.position.set(0, 0, 0);
        femaleGroup.position.set(0, 0, 0);

        this.tenon = maleGroup;
        this.mortise = femaleGroup;

        this.jointGroup.add(maleGroup);
        this.jointGroup.add(femaleGroup);

        this.originalMortisePos = this.mortise.position.clone();
        this.originalTenonPos = this.tenon.position.clone();
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
    }

    setupEventListeners() {
        const explodeBtn = document.getElementById('explodeBtn');
        const resetBtn = document.getElementById('resetBtn');
        const rotateBtn = document.getElementById('rotateBtn');
        const jointSelect = document.getElementById('jointSelect');
        const stepPrevBtn = document.getElementById('stepPrevBtn');
        const stepNextBtn = document.getElementById('stepNextBtn');

        explodeBtn.addEventListener('click', () => this.toggleExplode());
        resetBtn.addEventListener('click', () => this.resetView());
        rotateBtn.addEventListener('click', () => this.toggleAutoRotate());
        jointSelect.addEventListener('change', (e) => {
            this.createJoint(e.target.value);
            this.currentStep = 0;
            this.isExploded = false;
            this.updateStepIndicator();
            document.getElementById('explodeBtn').textContent = '整体拆解';
        });
        stepPrevBtn.addEventListener('click', () => this.prevStep());
        stepNextBtn.addEventListener('click', () => this.nextStep());
    }

    updateStepIndicator() {
        const stepText = document.getElementById('stepText');
        const stepProgress = document.getElementById('stepProgress');
        const infoContent = document.getElementById('infoContent');
        
        const stepDescriptions = [
            '组装状态 - 燕尾榫完全咬合',
            '步骤 1 - 轻微分离，观察榫头形状',
            '步骤 2 - 继续分离，观察榫槽结构',
            '步骤 3 - 完全分离状态',
            '步骤 4 - 旋转视角展示细节'
        ];

        const infoDescriptions = {
            dovetail: [
                '【组装状态】燕尾榫是古代木工的经典结构，因形状酷似燕子尾巴而得名。梯形的榫头与榫槽紧密配合，形成强大的自锁能力，无需钉子即可牢固连接。',
                '【观察榫头】公榫的梯形榫头是燕尾榫的核心特征。这种外宽内窄的设计使得两个部件一旦结合，便难以沿垂直方向拉开，具有极强的抗拉强度。',
                '【观察榫槽】母榫的榫槽与公榫的榫头形状完全对应。梯形槽口精确匹配，确保连接紧密。这种结构广泛应用于抽屉、木箱等家具制作。',
                '【完全分离】完全分离后可清晰观察：公榫（下方）的三个梯形榫头向上突出，母榫（上方）的三个梯形榫槽向下开口。古代工匠通过手工凿削就能达到毫米级精度。',
                '【结构特点】燕尾榫的优势：① 机械自锁，越拉越紧；② 接触面积大，承重能力强；③ 美观典雅，是中式家具的标志性工艺。这充分体现了中国古代工匠的智慧。'
            ],
            basic: [
                '【组装状态】基本榫卯是最基础的木结构连接方式，由方形榫头插入方形榫槽组成。这种结构简单实用，是古建筑中最常见的连接方法。',
                '【观察榫头】公榫的方形榫头突出于木材端部，尺寸精确。榫头的长宽比通常为2:1，确保足够的连接强度同时避免木材断裂。',
                '【观察榫槽】母榫的榫槽（卯眼）是在木材上凿出的方孔，与榫头尺寸精密配合。传统工艺要求"严丝合缝"，间隙不超过一张纸的厚度。',
                '【完全分离】完全分离展示：公榫（左）的方形榫头与母榫（右）的方形榫槽。这种"榫卯相合"体现了中国传统"阴阳相生"的哲学思想。',
                '【应用场景】基本榫卯广泛应用于古建筑梁架、家具框架等。其特点是制作相对简单，连接可靠，是学习榫卯工艺的入门基础。'
            ]
        };
        
        const descriptions = infoDescriptions[this.currentJointType] || infoDescriptions.dovetail;
        
        if (stepText && stepProgress) {
            stepText.textContent = `步骤: ${this.currentStep} / ${this.totalSteps} - ${stepDescriptions[this.currentStep] || ''}`;
            stepProgress.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
        }
        
        if (infoContent) {
            infoContent.textContent = descriptions[this.currentStep] || descriptions[0];
        }
    }

    getStepTargetPositions(step) {
        if (this.currentJointType === 'dovetail') {
            const positions = [
                { tenon: new THREE.Vector3(0, 0, 0), mortise: new THREE.Vector3(0, 0, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(0, -0.6, 0), mortise: new THREE.Vector3(0, 0.6, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(0, -1.2, 0), mortise: new THREE.Vector3(0, 1.2, 0), camera: { x: 7, y: 5, z: 7 } },
                { tenon: new THREE.Vector3(0, -2.0, 0), mortise: new THREE.Vector3(0, 2.0, 0), camera: { x: 8, y: 5, z: 8 } },
                { tenon: new THREE.Vector3(0, -2.0, 0), mortise: new THREE.Vector3(0, 2.0, 0), camera: { x: 0, y: 8, z: 10 } }
            ];
            return positions[Math.min(step, positions.length - 1)];
        } else {
            const positions = [
                { tenon: new THREE.Vector3(0, 0, 0), mortise: new THREE.Vector3(2.5, 0, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(-1.0, 0, 0), mortise: new THREE.Vector3(3.5, 0, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(-2.0, 0, 0), mortise: new THREE.Vector3(4.5, 0, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(-3.5, 0, 0), mortise: new THREE.Vector3(6.0, 0, 0), camera: { x: 8, y: 6, z: 8 } },
                { tenon: new THREE.Vector3(-3.5, 0, 0), mortise: new THREE.Vector3(6.0, 0, 0), camera: { x: 0, y: 8, z: 10 } }
            ];
            return positions[Math.min(step, positions.length - 1)];
        }
    }

    nextStep() {
        if (this.isAnimating || this.currentStep >= this.totalSteps) return;
        
        this.currentStep++;
        this.executeStep();
    }

    prevStep() {
        if (this.isAnimating || this.currentStep <= 0) return;
        
        this.currentStep--;
        this.executeStep();
    }

    executeStep() {
        this.isAnimating = true;
        const targets = this.getStepTargetPositions(this.currentStep);
        const animationDuration = 700;
        
        this.animateToPosition(this.tenon, targets.tenon, animationDuration);
        this.animateToPosition(this.mortise, targets.mortise, animationDuration);
        this.animateCameraTo(targets.camera, animationDuration);
        
        this.updateStepIndicator();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, animationDuration + 50);
    }

    animateCameraTo(target, duration = 700) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const targetPos = new THREE.Vector3(target.x, target.y, target.z);
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            this.camera.position.lerpVectors(startPos, targetPos, easeProgress);
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    toggleExplode() {
        this.isExploded = !this.isExploded;
        
        if (this.isExploded) {
            if (this.currentJointType === 'dovetail') {
                this.animateToPosition(this.tenon, new THREE.Vector3(0, -2.0, 0));
                this.animateToPosition(this.mortise, new THREE.Vector3(0, 2.0, 0));
            } else {
                this.animateToPosition(this.tenon, new THREE.Vector3(-3.5, 0, 0));
                this.animateToPosition(this.mortise, new THREE.Vector3(3.5, 0, 0));
            }
            document.getElementById('explodeBtn').textContent = '组装';
        } else {
            this.animateToPosition(this.tenon, this.originalTenonPos);
            this.animateToPosition(this.mortise, this.originalMortisePos);
            document.getElementById('explodeBtn').textContent = '整体拆解';
        }
    }

    animateToPosition(object, targetPos, duration = 600) {
        const startPos = object.position.clone();
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            object.position.lerpVectors(startPos, targetPos, easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    resetView() {
        this.camera.position.set(8, 6, 8);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        this.currentStep = 0;
        this.isExploded = false;
        this.animateToPosition(this.tenon, this.originalTenonPos);
        this.animateToPosition(this.mortise, this.originalMortisePos);
        this.updateStepIndicator();
        document.getElementById('explodeBtn').textContent = '整体拆解';
    }

    toggleAutoRotate() {
        this.isAutoRotating = !this.isAutoRotating;
        this.controls.autoRotate = this.isAutoRotating;
        this.controls.autoRotateSpeed = 1.0;
        
        document.getElementById('rotateBtn').textContent = 
            this.isAutoRotating ? '停止旋转' : '自动旋转';
    }

    onWindowResize() {
        const container = document.getElementById('scene-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.controls.dispose();
        this.renderer.dispose();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MortiseTenonSimulator();
});
