import { useState, useMemo } from 'react'
import { Html } from '@react-three/drei'
import { useDevice } from '../context/DeviceContext'

const statusColors = {
  running: { primary: '#27ae60', glow: '#27ae60', label: '运行中', intensity: 0.5 },
  stopped: { primary: '#e74c3c', glow: '#e74c3c', label: '已停止', intensity: 0.2 },
  idle: { primary: '#f39c12', glow: '#f39c12', label: '待机', intensity: 0.3 },
  warning: { primary: '#ff4757', glow: '#ff4757', label: '告警', intensity: 1.0 }
}

function MachineTool({ deviceId }) {
  const { getDeviceById, toggleDevice, setSelectedDevice } = useDevice()
  const [hovered, setHovered] = useState(false)
  
  const device = useMemo(() => getDeviceById(deviceId), [getDeviceById, deviceId])
  
  if (!device) return null
  
  const statusConfig = statusColors[device.status] || statusColors.stopped

  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedDevice(deviceId)
  }

  const formatRuntime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const getTempColor = (temp) => {
    if (temp > 80) return '#ff4757'
    if (temp > 65) return '#ffa502'
    return '#27ae60'
  }

  return (
    <group position={device.position}>
      <mesh
        position={[0, 0.4, 0]}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[2.5, 0.8, 2]} />
        <meshStandardMaterial
          color={hovered ? '#3d5a80' : '#2c3e50'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.5]} />
        <meshStandardMaterial
          color="#34495e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0.5, 1.2, 0.9]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial
          color={device.status === 'warning' ? '#ff4757' : '#e74c3c'}
          metalness={0.6}
          roughness={0.4}
          emissive={device.status !== 'stopped' ? (device.status === 'warning' ? '#ff4757' : '#e74c3c') : '#000'}
          emissiveIntensity={device.status === 'warning' ? 0.8 : (device.status !== 'stopped' ? 0.3 : 0)}
        />
      </mesh>

      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial
          color="#95a5a6"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial
          color={statusConfig.primary}
          emissive={device.status !== 'stopped' ? statusConfig.glow : '#000'}
          emissiveIntensity={statusConfig.intensity}
        />
      </mesh>

      <mesh position={[-0.8, 0.15, 0.8]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial
          color={statusConfig.primary}
          emissive={statusConfig.glow}
          emissiveIntensity={statusConfig.intensity}
        />
      </mesh>

      {device.status === 'warning' && (
        <>
          <pointLight
            position={[0, 2.5, 0]}
            color="#ff4757"
            intensity={2}
            distance={5}
          />
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ff4757" transparent opacity={0.8} />
          </mesh>
        </>
      )}

      {device.status === 'warning' && (
        <Html position={[0, 3.2, 0]} center>
          <div style={{
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 20px rgba(255, 71, 87, 0.6)',
            animation: 'blink 1s infinite'
          }}>
            ⚠️ 温度过高: {device.temperature}°C
          </div>
        </Html>
      )}

      {hovered && (
        <Html position={[0, 3.5, 0]} center style={{ zIndex: 100 }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: `2px solid ${device.status === 'warning' ? '#ff4757' : '#00d4ff'}`,
            boxShadow: `0 0 30px ${device.status === 'warning' ? 'rgba(255, 71, 87, 0.4)' : 'rgba(0, 212, 255, 0.3)'}`,
            minWidth: '220px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '15px', 
              marginBottom: '12px', 
              color: device.status === 'warning' ? '#ff4757' : '#00d4ff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {device.status === 'warning' && '⚠️ '}
              {device.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: statusConfig.primary,
                boxShadow: `0 0 10px ${statusConfig.glow}`
              }}></span>
              <span style={{ fontWeight: 500 }}>{statusConfig.label}</span>
              {device.warningCount > 0 && (
                <span style={{ 
                  background: '#ff4757', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '10px' 
                }}>
                  {device.warningCount}次告警
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ color: '#888', fontSize: '10px' }}>温度</div>
                <div style={{ color: getTempColor(device.temperature), fontWeight: 'bold', fontSize: '14px' }}>
                  {device.temperature}°C
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ color: '#888', fontSize: '10px' }}>转速</div>
                <div style={{ color: '#3498db', fontWeight: 'bold', fontSize: '14px' }}>
                  {device.speed} RPM
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ color: '#888', fontSize: '10px' }}>运行时间</div>
                <div style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '14px' }}>
                  {formatRuntime(device.runtime)}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                <div style={{ color: '#888', fontSize: '10px' }}>效率</div>
                <div style={{ color: device.efficiency < 70 ? '#ff4757' : '#27ae60', fontWeight: 'bold', fontSize: '14px' }}>
                  {device.efficiency}%
                </div>
              </div>
            </div>
            <div style={{ 
              color: '#888', 
              fontSize: '10px', 
              marginTop: '10px', 
              fontStyle: 'italic',
              textAlign: 'center',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              点击查看详情
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

export default MachineTool
