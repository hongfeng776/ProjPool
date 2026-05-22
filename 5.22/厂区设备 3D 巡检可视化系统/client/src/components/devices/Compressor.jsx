function Compressor({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.4]} />
        <meshStandardMaterial color="#6c3483" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.7, 24]} />
        <meshStandardMaterial color="#884ea0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.9, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <torusGeometry args={[0.55, 0.1, 16, 32]} />
        <meshStandardMaterial color="#d5d8dc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.9, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <torusGeometry args={[0.55, 0.1, 16, 32]} />
        <meshStandardMaterial color="#d5d8dc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.6, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.18, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.4, 1.7]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.5} />
      </mesh>
      {[[1, 0.7], [-1, 0.7], [1, -0.7], [-1, -0.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.4, 0.35]} />
          <meshStandardMaterial color="#636e72" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.6, 1.2, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.5, 0.25]} />
        <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 1.5, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#e74c3c" emissive="#c0392b" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.8, 0.7, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export default Compressor
