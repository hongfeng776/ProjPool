import { statusColors } from '../data/devices'
import './DeviceModal.css'

function DeviceModal({ device, onClose }) {
  if (!device) return null

  const status = statusColors[device.status]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{device.name}</h2>
            <span 
              className="status-badge"
              style={{ 
                background: status.primary,
                boxShadow: `0 0 10px ${status.glow}`
              }}
            >
              {status.text}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="device-info">
            <div className="info-row">
              <span className="label">设备编号</span>
              <span className="value">{device.id}</span>
            </div>
            <div className="info-row">
              <span className="label">设备类型</span>
              <span className="value">{device.type}</span>
            </div>
          </div>

          <div className="params-section">
            <h3>📊 运行参数</h3>
            <div className="params-grid">
              {Object.entries(device.params).map(([key, value]) => (
                <div key={key} className="param-item">
                  <span className="param-label">{key}</span>
                  <span className="param-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-button secondary">
            📋 查看历史记录
          </button>
          <button className="action-button primary">
            🔧 发起巡检
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeviceModal
