import { useMemo } from 'react'
import { deviceData, statusColors } from '../data/devices'
import './Sidebar.css'

function Sidebar({ selectedDevice, onDeviceSelect }) {
  const stats = useMemo(() => {
    const normal = deviceData.filter(d => d.status === 'normal').length
    const warning = deviceData.filter(d => d.status === 'warning').length
    const error = deviceData.filter(d => d.status === 'error').length
    return { normal, warning, error, total: deviceData.length }
  }, [])

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🏭 厂区巡检系统</h1>
        <p className="subtitle">设备实时监控中心</p>
      </div>

      <div className="stats-container">
        <div className="stat-card normal">
          <div className="stat-value">{stats.normal}</div>
          <div className="stat-label">正常运行</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.warning}</div>
          <div className="stat-label">需要关注</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{stats.error}</div>
          <div className="stat-label">设备故障</div>
        </div>
      </div>

      <div className="device-list-section">
        <h2>📋 设备列表</h2>
        <div className="device-list">
          {deviceData.map((device) => {
            const colors = statusColors[device.status]
            return (
              <div
                key={device.id}
                className={`device-item ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                onClick={() => onDeviceSelect(device)}
              >
                <div 
                  className="status-indicator"
                  style={{ 
                    background: colors.primary,
                    boxShadow: `0 0 8px ${colors.glow}`
                  }}
                />
                <div className="device-info">
                  <div className="device-name">{device.name}</div>
                  <div className="device-type">{device.type}</div>
                </div>
                <span 
                  className="status-tag"
                  style={{ 
                    background: `${colors.primary}33`,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}66`
                  }}
                >
                  {colors.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="update-time">
          <span className="dot online" />
          实时同步中
        </div>
        <div className="version">v1.0.0</div>
      </div>
    </div>
  )
}

export default Sidebar
