import * as THREE from 'three'

function Motor({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1]} />
        <meshStandardMaterial color="#1a252f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 24]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.5, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 1, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.5, 1.1, 0.55]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 1.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>
      {[[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.4, 0.25]} />
          <meshStandardMaterial color="#636e72" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.5, 0.8, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.35, 0.15]} />
        <meshStandardMaterial color="#27ae60" emissive="#1e8449" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.8, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 24]} />
        <meshStandardMaterial color="#b2bec3" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export default Motor
