import { useEffect } from 'react'
import './LoadingScreen.css'

function LoadingScreen({ onLoad }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoad?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onLoad])

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-icon">
          <div className="gear gear-1">⚙️</div>
          <div className="gear gear-2">⚙️</div>
        </div>
        <h1 className="loading-title">🏭 厂区设备巡检系统</h1>
        <p className="loading-subtitle">正在初始化3D场景...</p>
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
        <div className="loading-tips">
          <span>💡 提示：点击设备可查看详细参数</span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
