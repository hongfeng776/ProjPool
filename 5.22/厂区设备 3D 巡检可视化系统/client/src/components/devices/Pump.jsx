function Pump({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.9, 32]} />
        <meshStandardMaterial color="#1a5276" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.55, 0.45, 32]} />
        <meshStandardMaterial color="#2471a3" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.85, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.7, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.95, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.1, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.7, 0.85, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.7, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.95, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.1, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.5, 1.65, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.5, 0.35]} />
        <meshStandardMaterial color="#636e72" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.5, 1.95, 0.35]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
        <meshStandardMaterial color="#b2bec3" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.4, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 0.9, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.25, 0.1]} />
        <meshStandardMaterial color="#e74c3c" emissive="#c0392b" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export default Pump
