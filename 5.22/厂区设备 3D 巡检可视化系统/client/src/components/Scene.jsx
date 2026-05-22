import { useMemo } from 'react'
import Ground from './factory/Ground'
import Motor from './devices/Motor'
import Pump from './devices/Pump'
import Compressor from './devices/Compressor'
import StorageTank from './devices/StorageTank'
import HeatExchanger from './devices/HeatExchanger'
import CoolingTower from './devices/CoolingTower'
import Boiler from './devices/Boiler'
import Valve from './devices/Valve'
import Pipe from './devices/Pipe'
import DeviceLabel from './devices/DeviceLabel'
import { deviceData, statusColors } from '../data/devices'

function Scene({ onDeviceClick, selectedDevice }) {
  const deviceStatusColors = useMemo(() => {
    const colors = {}
    deviceData.forEach(device => {
      colors[device.id] = statusColors[device.status]
    })
    return colors
  }, [])

  const handleDeviceClick = (deviceId) => {
    const device = deviceData.find(d => d.id === deviceId)
    if (device && onDeviceClick) {
      onDeviceClick(device)
    }
  }

  return (
    <group>
      <Ground />

      <group position={[-8, 0, -5]} onClick={() => handleDeviceClick('M-01')}>
        <Motor position={[0, 0, 0]} scale={0.9} />
      </group>
      <group position={[-8, 0, -5]} onClick={() => handleDeviceClick('P-01')}>
        <Pump position={[2.5, 0, 0]} scale={1} />
      </group>
      <group position={[-8, 0, -2.5]} onClick={() => handleDeviceClick('M-02')}>
        <Motor position={[0, 0, 0]} scale={0.9} />
      </group>
      <group position={[-8, 0, -2.5]} onClick={() => handleDeviceClick('P-02')}>
        <Pump position={[2.5, 0, 0]} scale={1} />
      </group>

      <group position={[-8, 0, 2]} onClick={() => handleDeviceClick('C-01')}>
        <Compressor position={[0, 0, 0]} scale={0.85} />
      </group>
      <group position={[-8, 0, 5]} onClick={() => handleDeviceClick('C-02')}>
        <Compressor position={[0, 0, 0]} scale={0.85} />
      </group>

      <group position={[-1, 0, -5]} onClick={() => handleDeviceClick('E-01')}>
        <HeatExchanger position={[0, 0, 0]} scale={0.85} />
      </group>
      <group position={[-1, 0, -1]} onClick={() => handleDeviceClick('E-02')}>
        <HeatExchanger position={[0, 0, 0]} scale={0.85} rotation={[0, Math.PI / 2, 0]} />
      </group>

      <group position={[6, 0, -6]} onClick={() => handleDeviceClick('T-01')}>
        <StorageTank position={[0, 0, 0]} scale={0.75} color={deviceStatusColors['T-01']?.primary || '#1e8449'} />
      </group>
      <group position={[9, 0, -6]} onClick={() => handleDeviceClick('T-02')}>
        <StorageTank position={[0, 0, 0]} scale={0.75} color={deviceStatusColors['T-02']?.primary || '#1a5276'} />
      </group>
      <group position={[6, 0, -3]} onClick={() => handleDeviceClick('T-03')}>
        <StorageTank position={[0, 0, 0]} scale={0.75} color={deviceStatusColors['T-03']?.primary || '#935116'} />
      </group>
      <group position={[9, 0, -3]} onClick={() => handleDeviceClick('T-04')}>
        <StorageTank position={[0, 0, 0]} scale={0.75} color={deviceStatusColors['T-04']?.primary || '#922b21'} />
      </group>

      <group position={[7, 0, 3]} onClick={() => handleDeviceClick('CT-01')}>
        <CoolingTower position={[0, 0, 0]} scale={0.65} />
      </group>
      <group position={[10.5, 0, 3]} onClick={() => handleDeviceClick('CT-02')}>
        <CoolingTower position={[0, 0, 0]} scale={0.65} />
      </group>

      <group position={[-2, 0, 3]} onClick={() => handleDeviceClick('B-01')}>
        <Boiler position={[0, 0, 0]} scale={0.7} />
      </group>

      <group position={[-8, 0, -5]}>
        <Valve position={[2, 1, 0]} scale={1.3} />
        <Valve position={[2, 1, 2.5]} scale={1.3} />
      </group>

      <Pipe start={[-5.5, 1, -5]} end={[-3.5, 1, -5]} radius={0.12} />
      <Pipe start={[-5.5, 1, -2.5]} end={[-3.5, 1, -2.5]} radius={0.12} />
      <Pipe start={[-5.5, 1, 0]} end={[-3.5, 1, 0]} radius={0.12} />
      <Pipe start={[-5.5, 0.8, -5]} end={[-5.5, 0.8, 0]} radius={0.1} />

      <Pipe start={[-1, 1.5, -3]} end={[1, 1.5, -3]} radius={0.15} />
      <Pipe start={[-1, 1.5, 1]} end={[1, 1.5, 1]} radius={0.15} />
      <Pipe start={[1, 1.5, -3]} end={[1, 1.5, 1]} radius={0.1} />

      <Pipe start={[6, 1.8, -6]} end={[7.5, 1.8, -6]} radius={0.12} />
      <Pipe start={[6, 1.8, -3]} end={[7.5, 1.8, -3]} radius={0.12} />
      <Pipe start={[7.5, 1.8, -6]} end={[7.5, 1.8, -3]} radius={0.1} />

      <Pipe start={[1, 1.2, 3]} end={[7, 1.2, 3]} radius={0.18} />
      <Pipe start={[7, 1.2, 3]} end={[7, 2.5, 3]} radius={0.18} />

      <Pipe start={[-2, 2.2, 3]} end={[-2, 3.5, 3]} radius={0.22} />
      <Pipe start={[-2, 3.5, 3]} end={[8.5, 3.5, 3]} radius={0.22} />
      <Pipe start={[8.5, 3.5, 3]} end={[8.5, 2.5, 3]} radius={0.22} />

      <group position={[9, 1.2, -4.5]}>
        <Valve position={[0, 0, 0]} scale={1.6} rotation={[0, Math.PI / 2, 0]} />
        <Valve position={[0, 0, 1.5]} scale={1.6} rotation={[0, Math.PI / 2, 0]} />
      </group>

      <group position={[-4, 0.6, 5]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.8, 1.8]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.12, 1.5]} />
          <meshStandardMaterial color="#27ae60" emissive="#1e8449" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-2, 0.5, 0.8]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#e74c3c" emissive="#c0392b" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[2, 0.5, 0.8]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#f39c12" emissive="#d68910" emissiveIntensity={0.3} />
        </mesh>
      </group>

      <group position={[-8, 0, -6]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['M-01']?.primary || '#f39c12'} 
            emissive={deviceStatusColors['M-01']?.glow || '#e67e22'} 
            emissiveIntensity={0.6} 
          />
        </mesh>
      </group>

      <group position={[8, 0, -6]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['T-01']?.primary || '#27ae60'} 
            emissive={deviceStatusColors['T-01']?.glow || '#1e8449'} 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </group>

      <group position={[0, 0, 5]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['CT-01']?.primary || '#27ae60'} 
            emissive={deviceStatusColors['CT-01']?.glow || '#1e8449'} 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </group>

      <group position={[-4, 0, 5]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['C-01']?.primary || '#27ae60'} 
            emissive={deviceStatusColors['C-01']?.glow || '#1e8449'} 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </group>

      <group position={[-5, 0, -2]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['C-02']?.primary || '#27ae60'} 
            emissive={deviceStatusColors['C-02']?.glow || '#1e8449'} 
            emissiveIntensity={0.7} 
          />
        </mesh>
      </group>

      <group position={[0, 0, -2]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['E-02']?.primary || '#f39c12'} 
            emissive={deviceStatusColors['E-02']?.glow || '#e67e22'} 
            emissiveIntensity={0.5} 
          />
        </mesh>
      </group>

      <group position={[6, 0, -2]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial 
            color={deviceStatusColors['T-03']?.primary || '#27ae60'} 
            emissive={deviceStatusColors['T-03']?.glow || '#1e8449'} 
            emissiveIntensity={0.7} 
          />
        </mesh>
      </group>

      {[-7, -3, -1, 1, 3, 5].map((x, i) => (
        <group key={i} position={[x, 0, -7]}>
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 2, 12]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.3, 0.25]} />
            <meshStandardMaterial color="#fdfefe" metalness={0.2} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <Pipe start={[-7, 2, -7]} end={[5, 2, -7]} radius={0.05} color="#ffd700" />

      {[-6, -4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={i} position={[x, 2, -6.8]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      ))}

      {deviceData.map((device) => (
        <DeviceLabel
          key={device.id}
          position={[device.position[0], 3.5, device.position[2]]}
          name={device.name}
          status={device.status}
          isSelected={selectedDevice?.id === device.id}
        />
      ))}
    </group>
  )
}

export default Scene
