import { useMemo } from 'react'
import { useDevice } from '../context/DeviceContext'

const statusConfig = {
  running: { text: '运行中', color: '#27ae60', bg: 'rgba(39, 174, 96, 0.2)' },
  stopped: { text: '已停止', color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.2)' },
  idle: { text: '待机', color: '#f39c12', bg: 'rgba(243, 156, 18, 0.2)' },
  warning: { text: '告警', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.2)' }
}

function DeviceDetailModal({ deviceId, onClose }) {
  const { getDeviceById, toggleDevice, lastUpdate } = useDevice()
  
  const device = useMemo(() => getDeviceById(deviceId), [getDeviceById, deviceId])
  
  if (!device) return null

  const formatRuntime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTempColor = (temp) => {
    if (temp > 70) return '#e74c3c'
    if (temp > 55) return '#f39c12'
    return '#27ae60'
  }

  const getEfficiencyColor = (eff) => {
    if (eff < 60) return '#e74c3c'
    if (eff < 80) return '#f39c12'
    return '#27ae60'
  }

  const status = statusConfig[device.status] || statusConfig.stopped

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{device.name}</h2>
            <span className="device-status-badge" style={{ color: status.color, background: status.bg }}>
              {status.text}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <h3>基本信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">设备ID</span>
                <span className="info-value">{device.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">设备类型</span>
                <span className="info-value">{device.type === 'machine' ? '数控机床' : '传送带'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">位置坐标</span>
                <span className="info-value">({device.position.join(', ')})</span>
              </div>
              <div className="info-item">
                <span className="info-label">最后更新</span>
                <span className="info-value">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {device.type === 'machine' && (
            <>
              <div className="metrics-section">
                <h3>实时参数</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: getTempColor(device.temperature) }}>🌡️</div>
                    <div className="metric-info">
                      <span className="metric-label">温度</span>
                      <span className="metric-value" style={{ color: getTempColor(device.temperature) }}>
                        {device.temperature}°C
                      </span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-bar-fill" 
                        style={{ 
                          width: `${(device.temperature / 100) * 100}%`,
                          background: getTempColor(device.temperature)
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#3498db' }}>⚙️</div>
                    <div className="metric-info">
                      <span className="metric-label">转速</span>
                      <span className="metric-value">{device.speed} RPM</span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-bar-fill" 
                        style={{ 
                          width: `${(device.speed / 1500) * 100}%`,
                          background: '#3498db'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#9b59b6' }}>⏱️</div>
                    <div className="metric-info">
                      <span className="metric-label">运行时间</span>
                      <span className="metric-value">{formatRuntime(device.runtime)}</span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: getEfficiencyColor(device.efficiency) }}>📈</div>
                    <div className="metric-info">
                      <span className="metric-label">效率</span>
                      <span className="metric-value" style={{ color: getEfficiencyColor(device.efficiency) }}>
                        {device.efficiency}%
                      </span>
                    </div>
                    <div className="metric-bar">
                      <div 
                        className="metric-bar-fill" 
                        style={{ 
                          width: `${device.efficiency}%`,
                          background: getEfficiencyColor(device.efficiency)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {device.type === 'conveyor' && (
            <div className="metrics-section">
              <h3>实时参数</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon" style={{ background: '#3498db' }}>🚀</div>
                  <div className="metric-info">
                    <span className="metric-label">传送速度</span>
                    <span className="metric-value">{device.speed} m/s</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ background: device.load > 80 ? '#e74c3c' : '#27ae60' }}>📦</div>
                  <div className="metric-info">
                    <span className="metric-label">负载率</span>
                    <span className="metric-value" style={{ color: device.load > 80 ? '#e74c3c' : '#27ae60' }}>
                      {device.load}%
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-bar-fill" 
                      style={{ 
                        width: `${device.load}%`,
                        background: device.load > 80 ? '#e74c3c' : '#27ae60'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="control-section">
            <h3>设备控制</h3>
            <div className="control-buttons">
              <button 
                className={`control-btn ${device.status === 'running' ? 'active' : ''}`}
                onClick={() => toggleDevice(deviceId)}
              >
                {device.status === 'stopped' ? '▶️ 启动设备' : '⏹️ 停止设备'}
              </button>
              <button className="control-btn secondary">
                📋 查看历史记录
              </button>
              <button className="control-btn secondary">
                🔧 维护设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceDetailModal
