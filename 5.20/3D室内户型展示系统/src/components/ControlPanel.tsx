import { useState } from 'react'
import { FurnitureItem, MaterialPreset } from '../App'
import './ControlPanel.css'

interface Room {
  id: string
  name: string
}

interface ControlPanelProps {
  rooms: Room[]
  currentRoom: string
  onRoomChange: (roomId: string) => void
  viewMode: '3d' | 'panorama'
  editMode: 'none' | 'furniture' | 'material'
  selectedObject: string | null
  furnitureTypes: { id: string; name: string; icon: string }[]
  furnitureList: FurnitureItem[]
  onAddFurniture: (type: string, name: string) => void
  onDeleteFurniture: (id: string) => void
  onUpdateFurnitureRotation: (id: string, rotation: number) => void
  wallMaterials: MaterialPreset[]
  floorMaterials: MaterialPreset[]
  furnitureMaterials: MaterialPreset[]
  onUpdateFurnitureColor: (id: string, color: number) => void
  onChangeWallMaterial: (color: number) => void
  onChangeFloorMaterial: (color: number) => void
  currentWallColor: number
  currentFloorColor: number
  onExportScreenshot: () => void
  onExportLayout: () => void
  onImportLayout: () => void
  onResetLayout: () => void
}

function ControlPanel({ 
  rooms, 
  currentRoom, 
  onRoomChange, 
  viewMode,
  editMode,
  selectedObject,
  furnitureTypes,
  furnitureList,
  onAddFurniture,
  onDeleteFurniture,
  onUpdateFurnitureRotation,
  wallMaterials,
  floorMaterials,
  furnitureMaterials,
  onUpdateFurnitureColor,
  onChangeWallMaterial,
  onChangeFloorMaterial,
  currentWallColor,
  currentFloorColor,
  onExportScreenshot,
  onExportLayout,
  onImportLayout,
  onResetLayout
}: ControlPanelProps) {

  const selectedFurniture = furnitureList.find(f => f.id === selectedObject)

  const handleAddFurniture = (type: string, name: string) => {
    onAddFurniture(type, name)
  }

  const handleRotateFurniture = (direction: number) => {
    if (!selectedFurniture) return
    const newRotation = selectedFurniture.rotation + direction * Math.PI / 4
    onUpdateFurnitureRotation(selectedFurniture.id, newRotation)
  }

  const handleColorChange = (color: number) => {
    if (!selectedFurniture) return
    onUpdateFurnitureColor(selectedFurniture.id, color)
  }

  const hexToRgb = (hex: number) => {
    const r = (hex >> 16) & 255
    const g = (hex >> 8) & 255
    const b = hex & 255
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="control-panel">
      <div className="panel-section">
        <h3>房间选择</h3>
        <div className="room-list">
          {rooms.map(room => (
            <button
              key={room.id}
              className={`room-btn ${currentRoom === room.id ? 'active' : ''}`}
              onClick={() => onRoomChange(room.id)}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {editMode === 'furniture' && (
        <>
          <div className="panel-section">
            <h3>🏪 家具库</h3>
            <div className="furniture-grid">
              {furnitureTypes.map(item => (
                <button
                  key={item.id}
                  className="furniture-item"
                  onClick={() => handleAddFurniture(item.id, item.name)}
                >
                  <span className="furniture-icon">{item.icon}</span>
                  <span className="furniture-name">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3>📦 已放置家具 ({furnitureList.length})</h3>
            <div className="furniture-list">
              {furnitureList.length === 0 ? (
                <p className="empty-hint">点击上方家具添加到场景</p>
              ) : (
                furnitureList.map(item => (
                  <div
                    key={item.id}
                    className={`placed-furniture ${selectedObject === item.id ? 'selected' : ''}`}
                  >
                    <span>{furnitureTypes.find(t => t.id === item.type)?.icon || '🪑'} {item.name}</span>
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteFurniture(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedFurniture && (
            <div className="panel-section">
              <h3>⚙️ 家具属性</h3>
              <div className="property-group">
                <label>旋转角度</label>
                <div className="rotate-controls">
                  <button onClick={() => handleRotateFurniture(-1)}>↺ 左转</button>
                  <button onClick={() => handleRotateFurniture(1)}>↻ 右转</button>
                </div>
              </div>
              <div className="property-group">
                <label>颜色</label>
                <div className="color-palette">
                  {furnitureMaterials.map(mat => (
                    <button
                      key={mat.id}
                      className={`color-swatch ${selectedFurniture.color === mat.color ? 'active' : ''}`}
                      style={{ backgroundColor: hexToRgb(mat.color) }}
                      onClick={() => handleColorChange(mat.color)}
                      title={mat.name}
                    />
                  ))}
                </div>
              </div>
              <div className="property-group">
                <label>位置</label>
                <p className="coord-info">
                  X: {selectedFurniture.position.x.toFixed(1)}, Z: {selectedFurniture.position.z.toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {editMode === 'material' && (
        <>
          <div className="panel-section">
            <h3>🎨 墙壁材质</h3>
            <div className="material-grid">
              {wallMaterials.map(mat => (
                <button
                  key={mat.id}
                  className={`material-item ${currentWallColor === mat.color ? 'active' : ''}`}
                  onClick={() => onChangeWallMaterial(mat.color)}
                >
                  <div 
                    className="material-preview" 
                    style={{ backgroundColor: hexToRgb(mat.color) }}
                  />
                  <span>{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3>🪵 地板材质</h3>
            <div className="material-grid">
              {floorMaterials.map(mat => (
                <button
                  key={mat.id}
                  className={`material-item ${currentFloorColor === mat.color ? 'active' : ''}`}
                  onClick={() => onChangeFloorMaterial(mat.color)}
                >
                  <div 
                    className="material-preview" 
                    style={{ backgroundColor: hexToRgb(mat.color) }}
                  />
                  <span>{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3>💡 操作提示</h3>
            <div className="material-hint">
              <p>• 点击3D场景中的墙壁或地板选中</p>
              <p>• 点击上方材质应用到选中对象</p>
              <p>• 当前仅支持纯色材质变更</p>
            </div>
          </div>
        </>
      )}

      {editMode === 'none' && viewMode === '3d' && (
        <div className="panel-section">
          <h3>操作说明</h3>
          <div className="instructions">
            <p>🖱️ 左键拖动：旋转视角</p>
            <p>🖱️ 滚轮：缩放画面</p>
            <p>🖱️ 右键拖动：平移视角</p>
            <p>🪑 开启家具编辑：添加家具</p>
            <p>🎨 开启材质编辑：更换材质</p>
          </div>
        </div>
      )}

      {viewMode === 'panorama' && (
        <div className="panel-section">
          <h3>全景浏览</h3>
          <div className="instructions">
            <p>🖱️ 左键拖动：环顾四周</p>
            <p>📍 切换房间：选择不同场景</p>
          </div>
        </div>
      )}

      <div className="panel-section">
        <h3>当前信息</h3>
        <div className="info-box">
          <p><strong>模式：</strong>{viewMode === '3d' ? '3D户型' : '全景浏览'}</p>
          <p><strong>房间：</strong>{rooms.find(r => r.id === currentRoom)?.name}</p>
          <p><strong>编辑：</strong>{editMode === 'none' ? '未开启' : editMode === 'furniture' ? '家具编辑' : '材质编辑'}</p>
          <p><strong>家具数量：</strong>{furnitureList.length}</p>
          {selectedObject && <p><strong>选中：</strong>{selectedFurniture?.name || selectedObject}</p>}
        </div>
      </div>

      {viewMode === '3d' && (
        <div className="panel-section">
          <h3>💾 导入导出</h3>
          <div className="export-buttons">
            <button className="export-btn screenshot" onClick={onExportScreenshot}>
              📷 导出截图
            </button>
            <button className="export-btn json" onClick={onExportLayout}>
              📤 导出布局
            </button>
            <button className="export-btn import" onClick={onImportLayout}>
              📥 导入布局
            </button>
            <button className="export-btn reset" onClick={onResetLayout}>
              🔄 重置布局
            </button>
          </div>
          <p className="export-hint">
            提示：布局数据会自动保存到浏览器本地
          </p>
        </div>
      )}
    </div>
  )
}

export default ControlPanel
