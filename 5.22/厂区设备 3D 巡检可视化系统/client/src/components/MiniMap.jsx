import { useState, useEffect } from 'react'
import { deviceData, statusColors } from '../data/devices'
import './MiniMap.css'

function MiniMap() {
  const [cameraPos, setCameraPos] = useState({ x: 15, z: 15 })
  const [cameraAngle, setCameraAngle] = useState(-45)

  useEffect(() => {
    const interval = setInterval(() => {
      setCameraPos(prev => ({
        x: prev.x + (Math.random() - 0.5) * 0.1,
        z: prev.z + (Math.random() - 0.5) * 0.1
      }))
      setCameraAngle(prev => prev + 0.5)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const mapSize = 200
  const worldSize = 25
  const offset = worldSize / 2

  const worldToMap = (x, z) => ({
    x: ((x + offset) / worldSize) * mapSize,
    y: ((offset - z) / worldSize) * mapSize
  })

  const camPos = worldToMap(cameraPos.x, cameraPos.z)

  return (
    <div className="minimap">
      <div className="minimap-header">
        <h3>🗺️ 厂区地图</h3>
      </div>
      <div className="minimap-content">
        <svg 
          width={mapSize} 
          height={mapSize} 
          className="minimap-svg"
          viewBox={`0 0 ${mapSize} ${mapSize}`}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path 
                d="M 20 0 L 0 0 0 20" 
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          
          <rect width={mapSize} height={mapSize} fill="url(#grid)" />
          
          <rect 
            x={worldToMap(-10, -8).x} 
            y={worldToMap(-10, -8).y} 
            width={worldToMap(10, 8).x - worldToMap(-10, -8).x}
            height={worldToMap(10, 8).y - worldToMap(-10, -8).y}
            fill="none"
            stroke="rgba(74, 144, 217, 0.5)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          
          <rect 
            x={worldToMap(-7, -7).x} 
            y={worldToMap(-7, -7).y} 
            width={worldToMap(2, -7).x - worldToMap(-7, -7).x}
            height={worldToMap(-7, 0).y - worldToMap(-7, -7).y}
            fill="rgba(44, 62, 80, 0.6)"
            stroke="rgba(74, 144, 217, 0.3)"
            strokeWidth="1"
          />
          
          <rect 
            x={worldToMap(5, -7).x} 
            y={worldToMap(5, -7).y} 
            width={worldToMap(11, -7).x - worldToMap(5, -7).x}
            height={worldToMap(5, 0).y - worldToMap(5, -7).y}
            fill="rgba(44, 62, 80, 0.6)"
            stroke="rgba(74, 144, 217, 0.3)"
            strokeWidth="1"
          />
          
          {deviceData.map((device) => {
            const pos = worldToMap(device.position[0], device.position[2])
            const colors = statusColors[device.status]
            return (
              <g key={device.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill={colors.primary}
                  opacity="0.3"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={colors.primary}
                  stroke={colors.secondary}
                  strokeWidth="1"
                />
              </g>
            )
          })}
          
          <g transform={`translate(${camPos.x}, ${camPos.y}) rotate(${cameraAngle})`}>
            <polygon
              points="0,-10 -6,8 0,4 6,8"
              fill="#ff6b6b"
              stroke="#ff8888"
              strokeWidth="1"
            />
            <circle
              cx="0"
              cy="0"
              r="3"
              fill="#ffffff"
            />
          </g>
        </svg>
        
        <div className="minimap-legend">
          <div className="legend-item">
            <div className="legend-dot normal" />
            <span>正常</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot warning" />
            <span>警告</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot error" />
            <span>故障</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiniMap
