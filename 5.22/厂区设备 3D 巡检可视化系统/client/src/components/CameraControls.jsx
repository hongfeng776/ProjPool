import { useRef, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CameraControls({ viewMode, cameraTarget, controlsRef }) {
  const { camera } = useThree()
  const keysRef = useRef({})

  const viewPresets = {
    top: { position: [0, 25, 0.01], target: [0, 0, 0] },
    front: { position: [0, 8, 20], target: [0, 0, 0] },
    back: { position: [0, 8, -20], target: [0, 0, 0] },
    left: { position: [-20, 8, 0], target: [0, 0, 0] },
    right: { position: [20, 8, 0], target: [0, 0, 0] },
    overview: { position: [15, 12, 15], target: [0, 0, 0] }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (viewMode !== 'free') return

    const speed = 15 * delta
    const direction = new THREE.Vector3()

    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize()

    if (keysRef.current['w']) {
      camera.position.addScaledVector(direction, speed)
    }
    if (keysRef.current['s']) {
      camera.position.addScaledVector(direction, -speed)
    }
    if (keysRef.current['a']) {
      camera.position.addScaledVector(right, -speed)
    }
    if (keysRef.current['d']) {
      camera.position.addScaledVector(right, speed)
    }
    if (keysRef.current['q']) {
      camera.position.y += speed
    }
    if (keysRef.current['e']) {
      camera.position.y -= speed
    }
    camera.position.y = Math.max(1, Math.min(30, camera.position.y))
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={3}
      maxDistance={50}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping={viewMode === 'orbit'}
      dampingFactor={0.05}
      screenSpacePanning={viewMode === 'free'}
      panSpeed={1}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      target={cameraTarget}
    />
  )
}

export default CameraControls
