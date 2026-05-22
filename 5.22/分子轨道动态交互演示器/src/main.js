import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class HydrogenOrbitalVisualizer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.fxaaPass = null;
    this.controls = null;
    this.orbitalMesh = null;
    this.pointCloud = null;
    this.positiveMesh = null;
    this.negativeMesh = null;
    this.currentOrbital = '1s';
    this.opacity = 0.7;
    this.autoRotate = true;
    this.isolevel = 0.5;
    this.showCloud = true;
    
    this.a0 = 1.0;
    
    this.orbitalInfo = {
      '1s': { name: '氢原子 1s 轨道', formula: 'ψ₁ₛ(r) = (1/√πa₀³) · e<sup>-r/a₀</sup>', desc: '球对称的基态轨道，电子概率密度随距离指数衰减' },
      '2px': { name: '氢原子 2pₓ 轨道', formula: 'ψ₂ₚₓ ∝ x · e<sup>-r/2a₀</sup>', desc: '哑铃形轨道，沿 x 轴方向伸展，具有一个节面' },
      '2py': { name: '氢原子 2pᵧ 轨道', formula: 'ψ₂ₚᵧ ∝ y · e<sup>-r/2a₀</sup>', desc: '哑铃形轨道，沿 y 轴方向伸展，具有一个节面' },
      '2pz': { name: '氢原子 2pz 轨道', formula: 'ψ₂ₚz ∝ z · e<sup>-r/2a₀</sup>', desc: '哑铃形轨道，沿 z 轴方向伸展，具有一个节面' },
      '3dxy': { name: '氢原子 3d<sub>xy</sub> 轨道', formula: 'ψ₃d<sub>xy</sub> ∝ xy · e<sup>-r/3a₀</sup>', desc: '四叶形轨道，叶片位于 xy 平面对角线方向' },
      '3dxz': { name: '氢原子 3d<sub>xz</sub> 轨道', formula: 'ψ₃d<sub>xz</sub> ∝ xz · e<sup>-r/3a₀</sup>', desc: '四叶形轨道，叶片位于 xz 平面对角线方向' },
      '3dyz': { name: '氢原子 3d<sub>yz</sub> 轨道', formula: 'ψ₃d<sub>yz</sub> ∝ yz · e<sup>-r/3a₀</sup>', desc: '四叶形轨道，叶片位于 yz 平面对角线方向' },
      '3dx2y2': { name: '氢原子 3d<sub>x²-y²</sub> 轨道', formula: 'ψ₃d<sub>x²-y²</sub> ∝ (x²-y²) · e<sup>-r/3a₀</sup>', desc: '四叶形轨道，叶片沿 x 和 y 轴方向伸展' },
      '3dz2': { name: '氢原子 3d<sub>z²</sub> 轨道', formula: 'ψ₃d<sub>z²</sub> ∝ (3z²-r²) · e<sup>-r/3a₀</sup>', desc: '沿 z 轴的哑铃形加环形结构' }
    };
    
    this.init();
    this.createOrbital();
    this.createProbabilityCloud();
    this.setupControls();
    this.updateOrbitalInfo();
    this.animate();
  }

  init() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(6, 4, 6);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3));
    this.renderer.setClearColor(0x050510);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(8, 10, 6);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 30);
    pointLight1.position.set(6, 6, 6);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c3aed, 1, 30);
    pointLight2.position.set(-6, -4, -6);
    this.scene.add(pointLight2);

    this.addNucleus();
    this.addElectronShellGuides();

    this.initPostProcessing(width, height);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initPostProcessing(width, height) {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    this.fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.set(
      1 / (width * pixelRatio),
      1 / (height * pixelRatio)
    );
    this.composer.addPass(this.fxaaPass);
  }

  addNucleus() {
    const nucleusGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    this.scene.add(nucleus);

    const glowGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6666, 
      transparent: true, 
      opacity: 0.3 
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(glow);
  }

  addElectronShellGuides() {
    for (let n = 1; n <= 3; n++) {
      const radius = n * n * this.a0 * 1.5;
      const shellGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
      const shellMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x334455, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      const shell1 = new THREE.Mesh(shellGeometry, shellMaterial);
      shell1.rotation.x = Math.PI / 2;
      this.scene.add(shell1);
      
      const shell2 = new THREE.Mesh(shellGeometry, shellMaterial);
      shell2.rotation.y = Math.PI / 2;
      this.scene.add(shell2);
    }
  }

  wavefunction(x, y, z, orbital) {
    const r = Math.sqrt(x * x + y * y + z * z);
    const a0 = this.a0;
    const scale = 5;
    
    switch (orbital) {
      case '1s':
        return Math.exp(-r / a0);
      
      case '2px':
        return x * Math.exp(-r / (2 * a0)) * scale;
      
      case '2py':
        return y * Math.exp(-r / (2 * a0)) * scale;
      
      case '2pz':
        return z * Math.exp(-r / (2 * a0)) * scale;
      
      case '3dxy':
        return x * y * Math.exp(-r / (3 * a0)) * scale * scale;
      
      case '3dxz':
        return x * z * Math.exp(-r / (3 * a0)) * scale * scale;
      
      case '3dyz':
        return y * z * Math.exp(-r / (3 * a0)) * scale * scale;
      
      case '3dx2y2':
        return (x * x - y * y) * Math.exp(-r / (3 * a0)) * scale * scale;
      
      case '3dz2':
        return (3 * z * z - r * r) * Math.exp(-r / (3 * a0)) * scale * scale / 2;
      
      default:
        return 0;
    }
  }

  probabilityDensity(x, y, z) {
    const psi = this.wavefunction(x, y, z, this.currentOrbital);
    return psi * psi;
  }

  createOrbital() {
    if (this.orbitalMesh) {
      this.scene.remove(this.orbitalMesh);
      this.orbitalMesh = null;
    }
    if (this.positiveMesh) {
      this.scene.remove(this.positiveMesh);
      this.positiveMesh = null;
    }
    if (this.negativeMesh) {
      this.scene.remove(this.negativeMesh);
      this.negativeMesh = null;
    }

    const resolution = 100;
    const size = 10;

    if (this.currentOrbital === '1s') {
      this.createSingleMeshOrbital(resolution, size, 0x00aaff);
    } else {
      this.createDualMeshOrbital(resolution, size);
    }
  }

  createSingleMeshOrbital(resolution, size, color) {
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: this.opacity,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transmission: 0.1,
      ior: 1.3,
      thickness: 0.5,
      envMapIntensity: 1.0
    });
    
    const effect = new MarchingCubes(
      resolution,
      material,
      true,
      true,
      500000
    );
    
    effect.isolation = this.isolevel;
    effect.scale.set(size / 2, size / 2, size / 2);

    const halfRes = resolution / 2;
    const scale = size / resolution;

    for (let k = 0; k < resolution; k++) {
      for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution; i++) {
          const x = (i - halfRes) * scale;
          const y = (j - halfRes) * scale;
          const z = (k - halfRes) * scale;
          
          const density = this.probabilityDensity(x, y, z);
          effect.setCell(i, j, k, density * 5);
        }
      }
    }

    effect.update();
    
    if (effect.geometry) {
      effect.geometry.computeVertexNormals();
    }
    
    this.orbitalMesh = effect;
    this.scene.add(this.orbitalMesh);
  }

  createDualMeshOrbital(resolution, size) {
    const positiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: this.opacity,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transmission: 0.1,
      ior: 1.3,
      thickness: 0.5,
      envMapIntensity: 1.0
    });

    const negativeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: this.opacity,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transmission: 0.1,
      ior: 1.3,
      thickness: 0.5,
      envMapIntensity: 1.0
    });
    
    const positiveEffect = new MarchingCubes(resolution, positiveMaterial, true, true, 300000);
    const negativeEffect = new MarchingCubes(resolution, negativeMaterial, true, true, 300000);
    
    positiveEffect.isolation = this.isolevel;
    negativeEffect.isolation = this.isolevel;
    positiveEffect.scale.set(size / 2, size / 2, size / 2);
    negativeEffect.scale.set(size / 2, size / 2, size / 2);

    const halfRes = resolution / 2;
    const scale = size / resolution;

    for (let k = 0; k < resolution; k++) {
      for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution; i++) {
          const x = (i - halfRes) * scale;
          const y = (j - halfRes) * scale;
          const z = (k - halfRes) * scale;
          
          const psi = this.wavefunction(x, y, z, this.currentOrbital);
          const psiSquared = psi * psi;
          
          if (psi >= 0) {
            positiveEffect.setCell(i, j, k, psiSquared * 5);
            negativeEffect.setCell(i, j, k, 0);
          } else {
            negativeEffect.setCell(i, j, k, psiSquared * 5);
            positiveEffect.setCell(i, j, k, 0);
          }
        }
      }
    }

    positiveEffect.update();
    negativeEffect.update();
    
    if (positiveEffect.geometry) positiveEffect.geometry.computeVertexNormals();
    if (negativeEffect.geometry) negativeEffect.geometry.computeVertexNormals();
    
    this.positiveMesh = positiveEffect;
    this.negativeMesh = negativeEffect;
    this.scene.add(this.positiveMesh);
    this.scene.add(this.negativeMesh);
  }

  createProbabilityCloud() {
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      this.pointCloud.material.dispose();
      this.pointCloud = null;
    }

    const numPoints = 15000;
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);

    for (let i = 0; i < numPoints; i++) {
      const [x, y, z] = this.sampleOrbital();
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const psi = this.wavefunction(x, y, z, this.currentOrbital);
      const density = psi * psi;
      const normalizedDensity = Math.min(density * 2, 1);
      
      const color = new THREE.Color();
      if (this.currentOrbital === '1s') {
        color.setHSL(0.55, 0.8, 0.4 + normalizedDensity * 0.4);
      } else if (psi >= 0) {
        color.setHSL(0.55, 0.8, 0.3 + normalizedDensity * 0.4);
      } else {
        color.setHSL(0.95, 0.8, 0.3 + normalizedDensity * 0.4);
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.pointCloud = new THREE.Points(geometry, material);
    this.pointCloud.visible = this.showCloud;
    this.scene.add(this.pointCloud);
  }

  sampleOrbital() {
    const maxRadius = this.currentOrbital.startsWith('3d') ? 8 : 6;
    
    while (true) {
      const x = (Math.random() - 0.5) * 2 * maxRadius;
      const y = (Math.random() - 0.5) * 2 * maxRadius;
      const z = (Math.random() - 0.5) * 2 * maxRadius;
      const r = Math.sqrt(x * x + y * y + z * z);
      
      if (r > maxRadius) continue;
      
      const psi = this.wavefunction(x, y, z, this.currentOrbital);
      const density = psi * psi;
      
      let maxDensity;
      if (this.currentOrbital === '1s') {
        maxDensity = 1;
      } else if (this.currentOrbital.startsWith('2p')) {
        maxDensity = 10;
      } else {
        maxDensity = 50;
      }
      
      if (Math.random() * maxDensity < density) {
        return [x, y, z];
      }
    }
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.0;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.enablePan = true;

    const orbitalSelect = document.getElementById('orbital-type');
    if (orbitalSelect) {
      orbitalSelect.value = this.currentOrbital;
      orbitalSelect.addEventListener('change', (e) => {
        this.currentOrbital = e.target.value;
        this.updateOrbitalInfo();
        this.createOrbital();
        this.createProbabilityCloud();
      });
    }

    const opacitySlider = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacity-value');
    opacitySlider.addEventListener('input', (e) => {
      this.opacity = parseFloat(e.target.value);
      opacityValue.textContent = this.opacity.toFixed(1);
      if (this.orbitalMesh) {
        this.orbitalMesh.material.opacity = this.opacity;
      }
      if (this.positiveMesh) {
        this.positiveMesh.material.opacity = this.opacity;
      }
      if (this.negativeMesh) {
        this.negativeMesh.material.opacity = this.opacity;
      }
    });

    document.getElementById('auto-rotate').addEventListener('change', (e) => {
      this.autoRotate = e.target.checked;
      this.controls.autoRotate = this.autoRotate;
    });

    const isolevelSlider = document.getElementById('isolevel');
    const isolevelValue = document.getElementById('isolevel-value');
    if (isolevelSlider) {
      isolevelSlider.addEventListener('input', (e) => {
        this.isolevel = parseFloat(e.target.value);
        isolevelValue.textContent = this.isolevel.toFixed(3);
        if (this.orbitalMesh) {
          this.orbitalMesh.isolation = this.isolevel;
          this.orbitalMesh.update();
          if (this.orbitalMesh.geometry) {
            this.orbitalMesh.geometry.computeVertexNormals();
          }
        }
        if (this.positiveMesh) {
          this.positiveMesh.isolation = this.isolevel;
          this.positiveMesh.update();
          if (this.positiveMesh.geometry) {
            this.positiveMesh.geometry.computeVertexNormals();
          }
        }
        if (this.negativeMesh) {
          this.negativeMesh.isolation = this.isolevel;
          this.negativeMesh.update();
          if (this.negativeMesh.geometry) {
            this.negativeMesh.geometry.computeVertexNormals();
          }
        }
      });
    }

    const showCloudCheckbox = document.getElementById('show-cloud');
    if (showCloudCheckbox) {
      showCloudCheckbox.addEventListener('change', (e) => {
        this.showCloud = e.target.checked;
        if (this.pointCloud) {
          this.pointCloud.visible = e.target.checked;
        }
      });
    }
  }

  updateOrbitalInfo() {
    const info = this.orbitalInfo[this.currentOrbital];
    if (info) {
      const nameEl = document.getElementById('orbital-name');
      const formulaEl = document.getElementById('orbital-formula');
      const descEl = document.getElementById('orbital-desc');
      const legendEl = document.getElementById('color-legend');

      if (nameEl) nameEl.innerHTML = info.name;
      if (formulaEl) formulaEl.innerHTML = info.formula;
      if (descEl) descEl.innerHTML = info.desc;
      if (legendEl) {
        legendEl.style.display = this.currentOrbital === '1s' ? 'none' : 'flex';
      }
    }
  }

  onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    const pixelRatio = Math.min(window.devicePixelRatio * 1.5, 3);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
      if (this.fxaaPass) {
        this.fxaaPass.material.uniforms['resolution'].value.set(
          1 / (width * pixelRatio),
          1 / (height * pixelRatio)
        );
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HydrogenOrbitalVisualizer();
});
