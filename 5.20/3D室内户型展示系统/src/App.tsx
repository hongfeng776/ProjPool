import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import HouseViewer from './components/HouseViewer'
import ControlPanel from './components/ControlPanel'
import * as THREE from 'three'

export interface FurnitureItem {
  id: string
  type: string
  name: string
  position: THREE.Vector3
  rotation: number
  color: number
}

export interface MaterialPreset {
  id: string
  name: string
  color: number
  roughness?: number
  metalness?: number
}

export interface HouseLayoutData {
  version: string
  timestamp: number
  furnitureList: Array<{
    id: string
    type: string
    name: string
    position: { x: number; y: number; z: number }
    rotation: number
    color: number
  }>
  wallMaterialColor: number
  floorMaterialColor: number
}

const STORAGE_KEY = '3d-house-layout'
const FILE_VERSION = '1.0'

function App() {
  const [viewMode, setViewMode] = useState<'3d' | 'panorama'>('3d')
  const [currentRoom, setCurrentRoom] = useState('living')
  const [editMode, setEditMode] = useState<'none' | 'furniture' | 'material'>('none')
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>([])
  const [wallMaterialColor, setWallMaterialColor] = useState<number>(0xf5f5f5)
  const [floorMaterialColor, setFloorMaterialColor] = useState<number>(0xd2b48c)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const rooms = [
    { id: 'living', name: '客厅' },
    { id: 'bedroom', name: '卧室' },
    { id: 'kitchen', name: '厨房' },
    { id: 'bathroom', name: '卫生间' },
  ]

  const furnitureTypes = [
    { id: 'sofa', name: '沙发', icon: '🛋️' },
    { id: 'chair', name: '椅子', icon: '🪑' },
    { id: 'table', name: '桌子', icon: '🪵' },
    { id: 'bed', name: '床', icon: '🛏️' },
    { id: 'cabinet', name: '柜子', icon: '🗄️' },
    { id: 'lamp', name: '台灯', icon: '💡' },
    { id: 'plant', name: '植物', icon: '🌿' },
  ]

  const wallMaterials: MaterialPreset[] = [
    { id: 'white', name: '纯白', color: 0xffffff, roughness: 0.8 },
    { id: 'cream', name: '米白', color: 0xf5f5dc, roughness: 0.7 },
    { id: 'lightblue', name: '浅蓝', color: 0xadd8e6, roughness: 0.6 },
    { id: 'pink', name: '粉色', color: 0xffc0cb, roughness: 0.7 },
    { id: 'gray', name: '灰色', color: 0x808080, roughness: 0.5 },
    { id: 'beige', name: '米色', color: 0xf5deb3, roughness: 0.8 },
  ]

  const floorMaterials: MaterialPreset[] = [
    { id: 'wood-light', name: '浅木', color: 0xd2b48c, roughness: 0.8 },
    { id: 'wood-dark', name: '深木', color: 0x8b4513, roughness: 0.7 },
    { id: 'marble', name: '大理石', color: 0xf0f0f0, roughness: 0.3, metalness: 0.1 },
    { id: 'tile', name: '瓷砖', color: 0xe8e8e8, roughness: 0.4 },
    { id: 'carpet', name: '地毯', color: 0x8b7355, roughness: 0.95 },
  ]

  const furnitureMaterials: MaterialPreset[] = [
    { id: 'brown', name: '棕色', color: 0x8b4513, roughness: 0.7 },
    { id: 'black', name: '黑色', color: 0x2f2f2f, roughness: 0.5 },
    { id: 'white', name: '白色', color: 0xffffff, roughness: 0.6 },
    { id: 'blue', name: '蓝色', color: 0x4169e1, roughness: 0.5 },
    { id: 'red', name: '红色', color: 0xdc143c, roughness: 0.6 },
    { id: 'green', name: '绿色', color: 0x228b22, roughness: 0.7 },
    { id: 'yellow', name: '黄色', color: 0xffd700, roughness: 0.5 },
    { id: 'orange', name: '橙色', color: 0xff8c00, roughness: 0.6 },
  ]

  useEffect(() => {
    if (!isLoaded) {
      loadFromLocalStorage()
      setIsLoaded(true)
    }
  }, [isLoaded])

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage()
    }
  }, [furnitureList, wallMaterialColor, floorMaterialColor, isLoaded])

  const saveToLocalStorage = useCallback(() => {
    try {
      const data: HouseLayoutData = {
        version: FILE_VERSION,
        timestamp: Date.now(),
        furnitureList: furnitureList.map(f => ({
          id: f.id,
          type: f.type,
          name: f.name,
          position: { x: f.position.x, y: f.position.y, z: f.position.z },
          rotation: f.rotation,
          color: f.color
        })),
        wallMaterialColor,
        floorMaterialColor
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('保存到本地存储失败:', e)
    }
  }, [furnitureList, wallMaterialColor, floorMaterialColor])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data: HouseLayoutData = JSON.parse(saved)
        if (data.version === FILE_VERSION) {
          setFurnitureList(data.furnitureList.map(f => ({
            ...f,
            position: new THREE.Vector3(f.position.x, f.position.y, f.position.z)
          })))
          setWallMaterialColor(data.wallMaterialColor)
          setFloorMaterialColor(data.floorMaterialColor)
        }
      }
    } catch (e) {
      console.warn('从本地存储加载失败:', e)
    }
  }, [])

  const addFurniture = useCallback((type: string, name: string) => {
    const newFurniture: FurnitureItem = {
      id: `furniture_${Date.now()}`,
      type,
      name,
      position: new THREE.Vector3(0, 0, 0),
      rotation: 0,
      color: 0x8b4513,
    }
    setFurnitureList(prev => [...prev, newFurniture])
    return newFurniture.id
  }, [])

  const updateFurniturePosition = useCallback((id: string, position: THREE.Vector3) => {
    setFurnitureList(prev => prev.map(f => 
      f.id === id ? { ...f, position: position.clone() } : f
    ))
  }, [])

  const updateFurnitureRotation = useCallback((id: string, rotation: number) => {
    setFurnitureList(prev => prev.map(f => 
      f.id === id ? { ...f, rotation } : f
    ))
  }, [])

  const updateFurnitureColor = useCallback((id: string, color: number) => {
    setFurnitureList(prev => prev.map(f => 
      f.id === id ? { ...f, color } : f
    ))
  }, [])

  const deleteFurniture = useCallback((id: string) => {
    setFurnitureList(prev => prev.filter(f => f.id !== id))
    if (selectedObject === id) {
      setSelectedObject(null)
    }
  }, [selectedObject])

  const changeWallMaterial = useCallback((color: number) => {
    setWallMaterialColor(color)
  }, [])

  const changeFloorMaterial = useCallback((color: number) => {
    setFloorMaterialColor(color)
  }, [])

  const exportScreenshot = useCallback(() => {
    const viewer = document.querySelector('.house-viewer canvas') as HTMLCanvasElement
    if (!viewer) {
      alert('未找到3D场景画布')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `3D户型_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}_${Date.now()}.png`
      link.href = viewer.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('导出截图失败:', e)
      alert('导出截图失败，请重试')
    }
  }, [])

  const exportLayout = useCallback(() => {
    const data: HouseLayoutData = {
      version: FILE_VERSION,
      timestamp: Date.now(),
      furnitureList: furnitureList.map(f => ({
        id: f.id,
        type: f.type,
        name: f.name,
        position: { x: f.position.x, y: f.position.y, z: f.position.z },
        rotation: f.rotation,
        color: f.color
      })),
      wallMaterialColor,
      floorMaterialColor
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `户型布局_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }, [furnitureList, wallMaterialColor, floorMaterialColor])

  const importLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data: HouseLayoutData = JSON.parse(e.target?.result as string)
        
        if (data.version !== FILE_VERSION) {
          alert('文件版本不兼容，请使用正确的版本')
          return
        }

        setFurnitureList(data.furnitureList.map(f => ({
          ...f,
          position: new THREE.Vector3(f.position.x, f.position.y, f.position.z)
        })))
        setWallMaterialColor(data.wallMaterialColor)
        setFloorMaterialColor(data.floorMaterialColor)
        setSelectedObject(null)
        
        alert('导入成功！')
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const resetLayout = useCallback(() => {
    if (confirm('确定要重置所有布局吗？此操作不可撤销。')) {
      setFurnitureList([])
      setWallMaterialColor(0xf5f5f5)
      setFloorMaterialColor(0xd2b48c)
      setSelectedObject(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return (
    <div className="app-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={importLayout}
      />
      
      <header className="app-header">
        <h1>🏠 3D室内户型展示系统</h1>
        <div className="header-controls">
          <div className="view-mode-switch">
            <button 
              className={viewMode === '3d' ? 'active' : ''}
              onClick={() => setViewMode('3d')}
            >
              3D户型
            </button>
            <button 
              className={viewMode === 'panorama' ? 'active' : ''}
              onClick={() => setViewMode('panorama')}
            >
              全景浏览
            </button>
          </div>
          {viewMode === '3d' && (
            <div className="edit-mode-switch">
              <button 
                className={editMode === 'furniture' ? 'active' : ''}
                onClick={() => setEditMode(editMode === 'furniture' ? 'none' : 'furniture')}
              >
                🪑 家具编辑
              </button>
              <button 
                className={editMode === 'material' ? 'active' : ''}
                onClick={() => setEditMode(editMode === 'material' ? 'none' : 'material')}
              >
                🎨 材质编辑
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="app-main">
        <HouseViewer 
          viewMode={viewMode} 
          currentRoom={currentRoom}
          editMode={editMode}
          selectedObject={selectedObject}
          onSelectObject={setSelectedObject}
          furnitureList={furnitureList}
          onUpdateFurniturePosition={updateFurniturePosition}
          wallMaterialColor={wallMaterialColor}
          floorMaterialColor={floorMaterialColor}
        />
        <ControlPanel 
          rooms={rooms}
          currentRoom={currentRoom}
          onRoomChange={setCurrentRoom}
          viewMode={viewMode}
          editMode={editMode}
          selectedObject={selectedObject}
          furnitureTypes={furnitureTypes}
          furnitureList={furnitureList}
          onAddFurniture={addFurniture}
          onDeleteFurniture={deleteFurniture}
          onUpdateFurnitureRotation={updateFurnitureRotation}
          wallMaterials={wallMaterials}
          floorMaterials={floorMaterials}
          furnitureMaterials={furnitureMaterials}
          onUpdateFurnitureColor={updateFurnitureColor}
          onChangeWallMaterial={changeWallMaterial}
          onChangeFloorMaterial={changeFloorMaterial}
          currentWallColor={wallMaterialColor}
          currentFloorColor={floorMaterialColor}
          onExportScreenshot={exportScreenshot}
          onExportLayout={exportLayout}
          onImportLayout={triggerImport}
          onResetLayout={resetLayout}
        />
      </main>
    </div>
  )
}

export default App
