import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FurnitureItem } from '../App'
import './HouseViewer.css'

interface HouseViewerProps {
  viewMode: '3d' | 'panorama'
  currentRoom: string
  editMode: 'none' | 'furniture' | 'material'
  selectedObject: string | null
  onSelectObject: (id: string | null) => void
  furnitureList: FurnitureItem[]
  onUpdateFurniturePosition: (id: string, position: THREE.Vector3) => void
  wallMaterialColor: number
  floorMaterialColor: number
}

function HouseViewer({ 
  viewMode, 
  currentRoom,
  editMode,
  selectedObject,
  onSelectObject,
  furnitureList,
  onUpdateFurniturePosition,
  wallMaterialColor,
  floorMaterialColor
}: HouseViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const panoramaMeshRef = useRef<THREE.Mesh | null>(null)
  const houseGroupRef = useRef<THREE.Group | null>(null)
  const furnitureGroupRef = useRef<THREE.Group | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const floorRef = useRef<THREE.Mesh | null>(null)
  const wallsRef = useRef<THREE.Mesh[]>([])
  const selectionHelperRef = useRef<THREE.Mesh | null>(null)
  const isDraggingRef = useRef(false)
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const furnitureMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())

  const floorMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const wallMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const ceilingMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)

  const createFurnitureGeometry = useCallback((type: string): THREE.BufferGeometry => {
    switch (type) {
      case 'sofa':
        return new THREE.BoxGeometry(1.8, 0.6, 0.8)
      case 'chair':
        return new THREE.BoxGeometry(0.5, 0.8, 0.5)
      case 'table':
        return new THREE.BoxGeometry(1.2, 0.1, 0.8)
      case 'bed':
        return new THREE.BoxGeometry(1.8, 0.4, 2.2)
      case 'cabinet':
        return new THREE.BoxGeometry(0.8, 1.2, 0.5)
      case 'lamp':
        return new THREE.CylinderGeometry(0.1, 0.15, 0.5, 16)
      case 'plant':
        return new THREE.ConeGeometry(0.3, 0.8, 8)
      default:
        return new THREE.BoxGeometry(0.5, 0.5, 0.5)
    }
  }, [])

  const getFurnitureHeight = useCallback((type: string): number => {
    switch (type) {
      case 'sofa': return 0.3
      case 'chair': return 0.4
      case 'table': return 0.05
      case 'bed': return 0.2
      case 'cabinet': return 0.6
      case 'lamp': return 0.25
      case 'plant': return 0.4
      default: return 0.25
    }
  }, [])

  const updateSelectionHelper = useCallback((position?: THREE.Vector3, show: boolean = false) => {
    if (!sceneRef.current) return

    if (selectionHelperRef.current) {
      sceneRef.current.remove(selectionHelperRef.current)
      selectionHelperRef.current.geometry.dispose()
      ;(selectionHelperRef.current.material as THREE.Material).dispose()
      selectionHelperRef.current = null
    }

    if (show && position) {
      const geometry = new THREE.RingGeometry(0.6, 0.75, 32)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xe94560, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      })
      const ring = new THREE.Mesh(geometry, material)
      ring.rotation.x = -Math.PI / 2
      ring.position.copy(position)
      ring.position.y = 0.01
      sceneRef.current.add(ring)
      selectionHelperRef.current = ring
    }
  }, [])

  const createProceduralHouse = useCallback(() => {
    if (!sceneRef.current) return

    wallsRef.current = []
    furnitureMeshesRef.current.clear()

    const houseGroup = new THREE.Group()
    houseGroup.name = 'house'

    const floorGeometry = new THREE.PlaneGeometry(12, 10)
    floorMaterialRef.current = new THREE.MeshStandardMaterial({ 
      color: floorMaterialColor,
      roughness: 0.8,
      side: THREE.DoubleSide
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterialRef.current)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    floor.name = 'floor'
    houseGroup.add(floor)
    floorRef.current = floor

    wallMaterialRef.current = new THREE.MeshStandardMaterial({ 
      color: wallMaterialColor,
      side: THREE.DoubleSide,
      roughness: 0.8
    })

    const wallConfigs = [
      { pos: [0, 1.5, -5], size: [12, 3, 0.2], name: 'wall_back' },
      { pos: [-4, 1.5, 5], size: [4, 3, 0.2], name: 'wall_front_left' },
      { pos: [4, 1.5, 5], size: [4, 3, 0.2], name: 'wall_front_right' },
      { pos: [-6, 1.5, 0], size: [0.2, 3, 10], name: 'wall_left' },
      { pos: [6, 1.5, -2], size: [0.2, 3, 6], name: 'wall_right_back' },
      { pos: [6, 1.5, 3.5], size: [0.2, 3, 3], name: 'wall_right_front' },
      { pos: [2, 1.5, 3], size: [0.2, 3, 4], name: 'wall_partition' },
    ]

    wallConfigs.forEach(config => {
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: wallMaterialColor,
        side: THREE.DoubleSide,
        roughness: 0.8
      })
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2]),
        wallMaterial
      )
      wall.position.set(config.pos[0], config.pos[1], config.pos[2])
      wall.castShadow = true
      wall.receiveShadow = true
      wall.name = config.name
      houseGroup.add(wall)
      wallsRef.current.push(wall)
    })

    ceilingMaterialRef.current = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      side: THREE.DoubleSide 
    })
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 10),
      ceilingMaterialRef.current
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = 3
    ceiling.name = 'ceiling'
    houseGroup.add(ceiling)

    sceneRef.current.add(houseGroup)
    houseGroupRef.current = houseGroup

    const furnitureGroup = new THREE.Group()
    furnitureGroup.name = 'furniture'
    sceneRef.current.add(furnitureGroup)
    furnitureGroupRef.current = furnitureGroup
  }, [floorMaterialColor, wallMaterialColor])

  const createPanorama = useCallback(() => {
    if (!sceneRef.current) return

    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1)

    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(0.3, '#B0E0E6')
    gradient.addColorStop(0.5, '#F0E68C')
    gradient.addColorStop(0.7, '#DEB887')
    gradient.addColorStop(1, '#8B7355')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4)
    
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height * 0.35
      const radius = Math.random() * 30 + 10
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fill()
    }

    ctx.fillStyle = '#228B22'
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshBasicMaterial({ map: texture })

    const mesh = new THREE.Mesh(geometry, material)
    sceneRef.current.add(mesh)
    panoramaMeshRef.current = mesh
  }, [])

  const updatePanoramaTexture = useCallback(() => {
    if (!panoramaMeshRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    const roomColors: Record<string, string[]> = {
      living: ['#87CEEB', '#B0E0E6', '#F0E68C', '#DEB887', '#8B7355'],
      bedroom: ['#DDA0DD', '#E6E6FA', '#FFF0F5', '#FFE4E1', '#DB7093'],
      kitchen: ['#FFFACD', '#FFF8DC', '#F5DEB3', '#DEB887', '#D2B48C'],
      bathroom: ['#E0FFFF', '#AFEEEE', '#B0E0E6', '#87CEEB', '#4682B4'],
    }

    const colors = roomColors[currentRoom] || roomColors.living
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(0.3, colors[1])
    gradient.addColorStop(0.5, colors[2])
    gradient.addColorStop(0.7, colors[3])
    gradient.addColorStop(1, colors[4])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    const roomNames: Record<string, string> = {
      living: '客厅全景',
      bedroom: '卧室全景',
      kitchen: '厨房全景',
      bathroom: '卫生间全景',
    }
    ctx.fillText(roomNames[currentRoom] || '全景浏览', canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    ;(panoramaMeshRef.current.material as THREE.MeshBasicMaterial).map?.dispose()
    ;(panoramaMeshRef.current.material as THREE.MeshBasicMaterial).map = texture
    ;(panoramaMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
  }, [currentRoom])

  const updateMouse = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }, [])

  const handleMouseClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !sceneRef.current || !cameraRef.current) return
    if (viewMode !== '3d' || (editMode !== 'furniture' && editMode !== 'material')) return

    updateMouse(event)
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

    const allMeshes: THREE.Mesh[] = []
    
    if (editMode === 'furniture' && furnitureGroupRef.current) {
      furnitureGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          allMeshes.push(child)
        }
      })
    }

    if (editMode === 'material') {
      if (floorRef.current) allMeshes.push(floorRef.current)
      wallsRef.current.forEach(wall => allMeshes.push(wall))
    }

    const intersects = raycasterRef.current.intersectObjects(allMeshes)

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object as THREE.Mesh
      onSelectObject(clickedObject.name)
      updateSelectionHelper(intersects[0].point, true)
    } else {
      onSelectObject(null)
      updateSelectionHelper(undefined, false)
    }
  }, [viewMode, editMode, onSelectObject, updateMouse, updateSelectionHelper])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !sceneRef.current || !cameraRef.current) return
    if (viewMode !== '3d' || !selectedObject || editMode !== 'furniture') return
    if (!isDraggingRef.current) return

    updateMouse(event)
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    
    const intersectPoint = new THREE.Vector3()
    raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint)
    
    if (intersectPoint && furnitureGroupRef.current) {
      intersectPoint.x = Math.max(-5.5, Math.min(5.5, intersectPoint.x))
      intersectPoint.z = Math.max(-4.5, Math.min(4.5, intersectPoint.z))
      
      const furniture = furnitureMeshesRef.current.get(selectedObject)
      
      if (furniture) {
        const height = getFurnitureHeight(furniture.userData.type || 'sofa')
        furniture.position.set(intersectPoint.x, height, intersectPoint.z)
        updateSelectionHelper(intersectPoint, true)
      }
    }
  }, [viewMode, selectedObject, editMode, getFurnitureHeight, updateMouse, updateSelectionHelper])

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (editMode !== 'furniture' || !selectedObject || viewMode !== '3d') return
    if (!containerRef.current || !sceneRef.current || !cameraRef.current) return

    updateMouse(event)
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

    const targetMesh = furnitureMeshesRef.current.get(selectedObject)
    if (!targetMesh) return

    const intersects = raycasterRef.current.intersectObject(targetMesh)
    
    if (intersects.length > 0) {
      isDraggingRef.current = true
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
    }
  }, [editMode, selectedObject, viewMode, updateMouse])

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current && selectedObject) {
      const furniture = furnitureMeshesRef.current.get(selectedObject)
      if (furniture) {
        onUpdateFurniturePosition(selectedObject, furniture.position.clone())
      }
    }
    isDraggingRef.current = false
    if (controlsRef.current) {
      controlsRef.current.enabled = true
    }
  }, [selectedObject, onUpdateFurniturePosition])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(10, 10, 10)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 1
    controls.maxDistance = 50
    controls.maxPolarAngle = Math.PI / 2
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    renderer.domElement.addEventListener('click', handleMouseClick)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('mouseleave', handleMouseUp)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleMouseClick)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      renderer.dispose()
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [handleMouseClick, handleMouseMove, handleMouseDown, handleMouseUp])

  useEffect(() => {
    if (!sceneRef.current) return

    if (viewMode === '3d') {
      if (panoramaMeshRef.current) {
        sceneRef.current.remove(panoramaMeshRef.current)
        panoramaMeshRef.current.geometry.dispose()
        ;(panoramaMeshRef.current.material as THREE.Material).dispose()
        panoramaMeshRef.current = null
      }

      if (!houseGroupRef.current) {
        createProceduralHouse()
      }

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(10, 10, 10)
        controlsRef.current.enabled = true
        controlsRef.current.reset()
      }
    } else {
      if (houseGroupRef.current) {
        sceneRef.current.remove(houseGroupRef.current)
        houseGroupRef.current = null
      }
      if (furnitureGroupRef.current) {
        sceneRef.current.remove(furnitureGroupRef.current)
        furnitureGroupRef.current = null
      }
      if (selectionHelperRef.current) {
        sceneRef.current.remove(selectionHelperRef.current)
        selectionHelperRef.current = null
      }

      if (!panoramaMeshRef.current) {
        createPanorama()
      }

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 1.6, 0)
        controlsRef.current.enabled = true
        controlsRef.current.enableZoom = false
        controlsRef.current.reset()
      }
    }
  }, [viewMode, createProceduralHouse, createPanorama])

  useEffect(() => {
    if (viewMode === 'panorama' && panoramaMeshRef.current) {
      updatePanoramaTexture()
    }
  }, [currentRoom, viewMode, updatePanoramaTexture])

  useEffect(() => {
    if (!furnitureGroupRef.current || !sceneRef.current || viewMode !== '3d') return

    furnitureList.forEach(item => {
      const existingMesh = furnitureMeshesRef.current.get(item.id)
      
      if (!existingMesh) {
        const geometry = createFurnitureGeometry(item.type)
        const material = new THREE.MeshStandardMaterial({ color: item.color })
        const mesh = new THREE.Mesh(geometry, material)
        const height = getFurnitureHeight(item.type)
        
        let posX = item.position.x
        let posZ = item.position.z
        
        if (posX === 0 && posZ === 0) {
          posX = 2 + furnitureMeshesRef.current.size * 0.5
          posZ = 1 + furnitureMeshesRef.current.size * 0.5
        }
        
        mesh.position.set(posX, height, posZ)
        mesh.rotation.y = item.rotation
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.name = item.id
        mesh.userData.type = item.type
        
        furnitureGroupRef.current!.add(mesh)
        furnitureMeshesRef.current.set(item.id, mesh)
      } else {
        existingMesh.rotation.y = item.rotation
        ;(existingMesh.material as THREE.MeshStandardMaterial).color.setHex(item.color)
        
        if (item.position.x !== 0 || item.position.z !== 0) {
          const height = getFurnitureHeight(item.type)
          existingMesh.position.set(item.position.x, height, item.position.z)
        }
      }
    })

    furnitureMeshesRef.current.forEach((mesh, id) => {
      if (!furnitureList.find(f => f.id === id)) {
        furnitureGroupRef.current!.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
        furnitureMeshesRef.current.delete(id)
      }
    })
  }, [furnitureList, createFurnitureGeometry, getFurnitureHeight, viewMode])

  useEffect(() => {
    if (!selectedObject && editMode !== 'none') {
      updateSelectionHelper(undefined, false)
    }
    
    if (selectedObject && editMode === 'furniture') {
      const mesh = furnitureMeshesRef.current.get(selectedObject)
      if (mesh) {
        updateSelectionHelper(mesh.position, true)
      }
    }
  }, [selectedObject, editMode, updateSelectionHelper])

  useEffect(() => {
    if (viewMode !== '3d') return
    
    wallsRef.current.forEach(wall => {
      const material = wall.material as THREE.MeshStandardMaterial
      if (material.color) {
        material.color.setHex(wallMaterialColor)
        material.needsUpdate = true
      }
    })
  }, [wallMaterialColor, viewMode])

  useEffect(() => {
    if (viewMode !== '3d') return
    
    if (floorRef.current) {
      const material = floorRef.current.material as THREE.MeshStandardMaterial
      if (material.color) {
        material.color.setHex(floorMaterialColor)
        material.needsUpdate = true
      }
    }
  }, [floorMaterialColor, viewMode])

  return <div ref={containerRef} className="house-viewer" />
}

export default HouseViewer
