import { useDevice } from '../context/DeviceContext'
import './NotificationToast.css'

const typeConfig = {
  warning: {
    bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
    icon: '⚠️',
    border: '#ff8888'
  },
  success: {
    bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    icon: '✅',
    border: '#4ade80'
  },
  info: {
    bg: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    icon: 'ℹ️',
    border: '#60a5fa'
  },
  error: {
    bg: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    icon: '❌',
    border: '#f87171'
  }
}

function NotificationToast() {
  const { notifications, setSelectedDevice } = useDevice()

  const handleClick = (notification) => {
    if (notification.deviceId) {
      setSelectedDevice(notification.deviceId)
    }
  }

  return (
    <div className="notification-container">
      {notifications.map((notification, index) => {
        const config = typeConfig[notification.type] || typeConfig.info
        return (
          <div
            key={notification.id}
            className={`notification-toast ${notification.type}`}
            style={{
              background: config.bg,
              borderLeft: `4px solid ${config.border}`,
              animationDelay: `${index * 0.05}s`
            }}
            onClick={() => handleClick(notification)}
          >
            <span className="notification-icon">{config.icon}</span>
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <span className="notification-time">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotificationToast
