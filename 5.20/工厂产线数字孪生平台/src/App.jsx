import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import FactoryScene from './components/FactoryScene'
import DeviceDetailModal from './components/DeviceDetailModal'
import { useDevice } from './context/DeviceContext'
import './App.css'

const statusLabels = {
  running: { text: '运行中', color: '#27ae60' },
  stopped: { text: '已停止', color: '#e74c3c' },
  idle: { text: '待机', color: '#f39c12' },
  warning: { text: '告警', color: '#ff4757' }
}

function App() {
  const { devices, selectedDevice, setSelectedDevice, lastUpdate, getStatistics, warningHistory } = useDevice()
  const stats = useMemo(() => getStatistics(), [getStatistics])

  const machineDevices = devices.filter(d => d.type === 'machine')
  const conveyorDevices = devices.filter(d => d.type === 'conveyor')

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-left">
          <h1>🏭 工厂产线数字孪生平台</h1>
          <span className="update-time">
            数据更新: {formatTime(lastUpdate)}
          </span>
          {stats.warning > 0 && (
            <span className="warning-badge">
              ⚠️ {stats.warning} 台设备告警
            </span>
          )}
        </div>
        <div className="status-bar">
          <span className={`status-indicator ${stats.warning > 0 ? 'warning' : 'online'}`}></span>
          <span>{stats.warning > 0 ? '存在告警' : '系统正常'}</span>
        </div>
      </div>

      <div className="main-content">
        <div className="stats-panel">
          <h3>📊 生产概览</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.3)' }}>🔧</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">设备总数</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(39, 174, 96, 0.3)' }}>✅</div>
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#27ae60' }}>{stats.running}</span>
                <span className="stat-label">运行中</span>
              </div>
            </div>
            <div className="stat-card warning-card">
              <div className="stat-icon" style={{ background: 'rgba(255, 71, 87, 0.3)' }}>⚠️</div>
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#ff4757' }}>{stats.warning}</span>
                <span className="stat-label">告警</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(155, 89, 182, 0.3)' }}>🌡️</div>
              <div className="stat-info">
                <span className="stat-value" style={{ color: parseFloat(stats.avgTemp) > 60 ? '#ff4757' : '#fff' }}>{stats.avgTemp}°C</span>
                <span className="stat-label">平均温度</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(243, 156, 18, 0.3)' }}>📈</div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgEfficiency}%</span>
                <span className="stat-label">综合效率</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.3)' }}>⏹️</div>
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#e74c3c' }}>{stats.stopped}</span>
                <span className="stat-label">已停止</span>
              </div>
            </div>
          </div>

          <div className="warning-history-section">
            <h4>🚨 告警历史记录</h4>
            {warningHistory.length === 0 ? (
              <div className="no-warnings">
                <span>暂无告警记录</span>
              </div>
            ) : (
              <div className="warning-list">
                {warningHistory.slice(0, 10).map(record => (
                  <div key={record.id} className="warning-item">
                    <span className="warning-icon">⚠️</span>
                    <div className="warning-content">
                      <span className="warning-device">{record.deviceName}</span>
                      <span className="warning-message">{record.message}</span>
                      <span className="warning-time">{formatTime(record.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="canvas-container">
          <Canvas
            camera={{ position: [20, 15, 20], fov: 50 }}
            shadows
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <FactoryScene />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
          </Canvas>
        </div>

        <div className="control-panel">
          <h3>🎛️ 设备监控</h3>
          
          <div className="control-group">
            <label>数控机床</label>
            <div className="device-list">
              {machineDevices.map(device => (
                <div 
                  key={device.id} 
                  className={`device-item ${device.status} ${selectedDevice === device.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <span 
                    className="device-dot" 
                    style={{ 
                      background: statusLabels[device.status].color,
                      boxShadow: device.status === 'warning' ? `0 0 10px ${statusLabels[device.status].color}` : 'none',
                      animation: device.status === 'warning' ? 'blink 1s infinite' : 'none'
                    }}
                  ></span>
                  <div className="device-info">
                    <span className="device-name">{device.name}</span>
                    <span className="device-param" style={{ color: device.temperature > 70 ? '#ff4757' : '#888' }}>
                      {device.temperature}°C | {device.efficiency}%
                    </span>
                    {device.warningCount > 0 && (
                      <span className="warning-count">{device.warningCount}次告警</span>
                    )}
                  </div>
                  <button 
                    className={`device-toggle ${device.status === 'stopped' ? 'start' : 'stop'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {device.status === 'stopped' ? '▶' : '⏸'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>传送设备</label>
            <div className="device-list">
              {conveyorDevices.map(device => (
                <div 
                  key={device.id} 
                  className={`device-item ${device.status} ${selectedDevice === device.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <span 
                    className="device-dot" 
                    style={{ 
                      background: statusLabels[device.status].color,
                      boxShadow: device.status === 'warning' ? `0 0 10px ${statusLabels[device.status].color}` : 'none'
                    }}
                  ></span>
                  <div className="device-info">
                    <span className="device-name">{device.name}</span>
                    <span className="device-param">{device.speed} m/s | {device.load}%</span>
                  </div>
                  <button 
                    className={`device-toggle ${device.status === 'stopped' ? 'start' : 'stop'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {device.status === 'stopped' ? '▶' : '⏸'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="legend-section">
            <label>状态图例</label>
            <div className="legend-list">
              {Object.entries(statusLabels).map(([key, val]) => (
                <div key={key} className="legend-item">
                  <span 
                    className="legend-dot" 
                    style={{ 
                      background: val.color,
                      boxShadow: key === 'warning' ? `0 0 8px ${val.color}` : 'none',
                      animation: key === 'warning' ? 'blink 1s infinite' : 'none'
                    }}
                  ></span>
                  <span>{val.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedDevice && (
        <DeviceDetailModal 
          deviceId={selectedDevice} 
          onClose={() => setSelectedDevice(null)} 
        />
      )}
    </div>
  )
}

export default App
