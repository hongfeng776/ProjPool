import { useState, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import CameraControls from './components/CameraControls'
import ControlPanel from './components/ControlPanel'
import MiniMap from './components/MiniMap'
import Sidebar from './components/Sidebar'
import DeviceModal from './components/DeviceModal'
import LoadingScreen from './components/LoadingScreen'
import { deviceData } from './data/devices'
import './App.css'

function App() {
  const [controlMode, setControlMode] = useState('orbit')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleDeviceClick = useCallback((device) => {
    setSelectedDevice(device)
  }, [])

  const handleDeviceSelect = useCallback((device) => {
    setSelectedDevice(device)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedDevice(null)
  }, [])

  const handleLoaded = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="app-container">
      <Sidebar 
        selectedDevice={selectedDevice} 
        onDeviceSelect={handleDeviceSelect} 
      />
      
      <div className="main-content">
        <Suspense fallback={<LoadingScreen onLoad={handleLoaded} />}>
          <Canvas
            shadows
            camera={{ position: [15, 12, 15], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
            onCreated={() => handleLoaded()}
          >
            <color attach="background" args={['#0a0a1a']} />
            <fog attach="fog" args={['#0a0a1a', 25, 50]} />
            
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
              shadow-camera-near={0.5}
              shadow-camera-far={50}
            />
            <hemisphereLight
              color="#87ceeb"
              groundColor="#2c3e50"
              intensity={0.5}
            />
            <pointLight
              position={[0, 10, 0]}
              intensity={0.3}
              color="#ffd700"
            />

            <Scene 
              onDeviceClick={handleDeviceClick}
              selectedDevice={selectedDevice}
            />
            <CameraControls mode={controlMode} />
          </Canvas>
        </Suspense>

        <ControlPanel 
          controlMode={controlMode} 
          onModeChange={setControlMode} 
        />
        <MiniMap />
      </div>

      <DeviceModal 
        device={selectedDevice} 
        onClose={handleCloseModal} 
      />
    </div>
  )
}

export default App
