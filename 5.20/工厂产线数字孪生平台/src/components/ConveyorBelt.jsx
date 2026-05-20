import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDevice } from '../context/DeviceContext'

const statusColors = {
  running: { primary: '#27ae60', glow: '#27ae60' },
  stopped: { primary: '#e74c3c', glow: '#e74c3c' },
  idle: { primary: '#f39c12', glow: '#f39c12' },
  warning: { primary: '#ff6b6b', glow: '#ff6b6b' }
}

function ConveyorBelt({ deviceId, length = 8 }) {
  const { getDeviceById, toggleDevice, setSelectedDevice } = useDevice()
  const beltRef = useRef()
  const rollerRefs = useRef([])
  
  const device = useMemo(() => getDeviceById(deviceId), [getDeviceById, deviceId])
  
  if (!device) return null
  
  const statusConfig = statusColors[device.status] || statusColors.stopped

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const speedMultiplier = device.status === 'running' ? 1 : 0.1
    
    if (beltRef.current) {
      beltRef.current.material.mapOffset.x = time * 0.5 * speedMultiplier
    }
    rollerRefs.current.forEach((roller, i) => {
      if (roller) {
        roller.rotation.x = time * 2 * speedMultiplier
      }
    })
  })

  const rollerCount = Math.floor(length) + 1
  const spacing = length / (rollerCount - 1)

  const handleClick = (e) => {
    e.stopPropagation()
    toggleDevice(deviceId)
    setSelectedDevice(deviceId)
  }

  return (
    <group position={device.position} onClick={handleClick}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.1, 1.5]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={beltRef} position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[length - 0.2, 0.02, 1.2]} />
        <meshStandardMaterial
          color="#2c3e50"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {Array.from({ length: rollerCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (rollerRefs.current[i] = el)}
          position={[-length / 2 + i * spacing, 0.25, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.15, 1.4, 16]} />
          <meshStandardMaterial
            color="#7f8c8d"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.15, -0.8]} castShadow>
        <boxGeometry args={[length, 0.3, 0.1]} />
        <meshStandardMaterial
          color="#34495e"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.15, 0.8]} castShadow>
        <boxGeometry args={[length, 0.3, 0.1]} />
        <meshStandardMaterial
          color="#34495e"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {device.status === 'running' && [-length / 2 + 1, 0, length / 2 - 1].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.8]} />
          <meshStandardMaterial
            color="#f39c12"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      <mesh position={[-length / 2 + 0.5, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial
          color={statusConfig.primary}
          emissive={statusConfig.glow}
          emissiveIntensity={device.status !== 'stopped' ? 0.8 : 0.2}
        />
      </mesh>
    </group>
  )
}

export default ConveyorBelt
