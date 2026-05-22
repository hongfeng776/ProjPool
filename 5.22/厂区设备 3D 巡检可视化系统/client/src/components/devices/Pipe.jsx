import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

function Pipe({ start, end, radius = 0.1, color = '#95a5a6' }) {
  const meshRef = useRef()

  const { position, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const dist = startVec.distanceTo(endVec)
    return {
      position: [midVec.x, midVec.y, midVec.z],
      length: dist
    }
  }, [start, end])

  useEffect(() => {
    if (meshRef.current) {
      const startVec = new THREE.Vector3(...start)
      const endVec = new THREE.Vector3(...end)
      const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize()
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      )
      meshRef.current.quaternion.copy(quaternion)
    }
  }, [start, end])

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default Pipe
