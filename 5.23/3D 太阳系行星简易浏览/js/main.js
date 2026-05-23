import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.controls = null;
        this.sun = null;
        this.planets = {};
        this.orbits = {};
        this.labels = {};
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
    }

    init() {
        const container = document.getElementById('container');
        if (!container) {
            this.showError('无法找到渲染容器');
            return;
        }

        if (!this.checkWebGLSupport()) {
            this.showError('您的浏览器不支持 WebGL');
            return;
        }

        try {
            this.createScene();
            this.createCamera();
            this.createRenderer(container);
            this.createLabelRenderer(container);
            this.createControls();
            this.createLights();
            this.createBackground();
            this.createSun();
            this.createVenus();
            this.createEarth();
            this.createMars();
            
            window.addEventListener('resize', () => this.onWindowResize());
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());
            
            this.isInitialized = true;
            console.log('Solar System initialized successfully');
            this.animate();
        } catch (error) {
            console.error('Error initializing Solar System:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.matrixAutoUpdate = false;
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(0, 100, 200);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = false;
        container.appendChild(this.renderer.domElement);
    }

    createLabelRenderer(container) {
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.style.zIndex = '10';
        container.appendChild(this.labelRenderer.domElement);
    }

    createLabel(name, color, offsetY = 0) {
        const div = document.createElement('div');
        div.className = 'planet-label';
        div.textContent = name;
        div.style.cssText = `
            color: ${color};
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5);
            white-space: nowrap;
            padding: 2px 6px;
            background: rgba(0,0,0,0.4);
            border-radius: 4px;
            pointer-events: none;
            user-select: none;
        `;
        const label = new CSS2DObject(div);
        label.position.y = offsetY;
        return label;
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 30;
        this.controls.maxDistance = 800;
        this.controls.target.set(0, 0, 0);
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false;
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 2.5, 600);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    createBackground() {
        const starCount = this.isMobile() ? 8000 : 15000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.6,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });

        const starVertices = [];
        for (let i = 0; i < starCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 1500 + Math.random() * 500;
            starVertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.matrixAutoUpdate = false;
        this.scene.add(stars);
    }

    createOrbitRing(radius) {
        const segments = this.isMobile() ? 48 : 64;
        const orbitGeometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, segments);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x555555,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2,
            depthWrite: false
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        orbit.matrixAutoUpdate = false;
        orbit.updateMatrix();
        this.scene.add(orbit);
    }

    createSun() {
        const segments = this.isMobile() ? 32 : 48;
        const sunGeometry = new THREE.SphereGeometry(15, segments, segments);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        const sunLabel = this.createLabel('太阳', '#ffdd00', 18);
        this.sun.add(sunLabel);
        this.labels.sun = sunLabel;

        console.log('Sun created');
    }

    createVenus() {
        const orbitRadius = 30;
        this.createOrbitRing(orbitRadius);

        const venusOrbit = new THREE.Group();
        this.scene.add(venusOrbit);
        this.orbits.venus = venusOrbit;

        const segments = this.isMobile() ? 24 : 32;
        const venusGeometry = new THREE.SphereGeometry(2.8, segments, segments);
        const venusMaterial = new THREE.MeshLambertMaterial({
            color: 0xe6c87a,
        });
        const venus = new THREE.Mesh(venusGeometry, venusMaterial);
        venus.position.x = orbitRadius;
        venusOrbit.add(venus);
        this.planets.venus = venus;

        const venusLabel = this.createLabel('金星', '#e6c87a', 5);
        venus.add(venusLabel);
        this.labels.venus = venusLabel;

        console.log('Venus created');
    }

    createEarth() {
        const orbitRadius = 50;
        this.createOrbitRing(orbitRadius);

        const earthOrbit = new THREE.Group();
        this.scene.add(earthOrbit);
        this.orbits.earth = earthOrbit;

        const segments = this.isMobile() ? 24 : 32;
        const earthGeometry = new THREE.SphereGeometry(3.5, segments, segments);
        const earthMaterial = new THREE.MeshLambertMaterial({
            color: 0x2266ff,
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.position.x = orbitRadius;
        earthOrbit.add(earth);
        this.planets.earth = earth;

        const earthLabel = this.createLabel('地球', '#2266ff', 6);
        earth.add(earthLabel);
        this.labels.earth = earthLabel;

        console.log('Earth created');
    }

    createMars() {
        const orbitRadius = 75;
        this.createOrbitRing(orbitRadius);

        const marsOrbit = new THREE.Group();
        this.scene.add(marsOrbit);
        this.orbits.mars = marsOrbit;

        const segments = this.isMobile() ? 24 : 32;
        const marsGeometry = new THREE.SphereGeometry(2.5, segments, segments);
        const marsMaterial = new THREE.MeshLambertMaterial({
            color: 0xcd5c5c,
        });
        const mars = new THREE.Mesh(marsGeometry, marsMaterial);
        mars.position.x = orbitRadius;
        marsOrbit.add(mars);
        this.planets.mars = mars;

        const marsLabel = this.createLabel('火星', '#cd5c5c', 4.5);
        mars.add(marsLabel);
        this.labels.mars = marsLabel;

        console.log('Mars created');
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.labelRenderer) {
            this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    onVisibilityChange() {
        if (document.hidden) {
            this.lastTime = performance.now();
        }
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const timeScale = Math.min(delta * 60, 2);

        if (this.sun) {
            this.sun.rotation.y += 0.001 * timeScale;
        }

        if (this.planets.venus && this.orbits.venus) {
            this.planets.venus.rotation.y += 0.015 * timeScale;
            this.orbits.venus.rotation.y += 0.012 * timeScale;
        }

        if (this.planets.earth && this.orbits.earth) {
            this.planets.earth.rotation.y += 0.02 * timeScale;
            this.orbits.earth.rotation.y += 0.008 * timeScale;
        }

        if (this.planets.mars && this.orbits.mars) {
            this.planets.mars.rotation.y += 0.018 * timeScale;
            this.orbits.mars.rotation.y += 0.006 * timeScale;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        if (this.labelRenderer) {
            this.labelRenderer.render(this.scene, this.camera);
        }

        this.updateFPS();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const solarSystem = new SolarSystem();
        solarSystem.init();
    });
} else {
    const solarSystem = new SolarSystem();
    solarSystem.init();
}
