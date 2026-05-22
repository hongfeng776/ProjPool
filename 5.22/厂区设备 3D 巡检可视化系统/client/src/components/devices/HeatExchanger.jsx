function HeatExchanger({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.85, 4.2, 48]} />
        <meshStandardMaterial color="#d35400" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-2.35, 1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 0.85, 0.35, 48]} />
        <meshStandardMaterial color="#a04000" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[2.35, 1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 0.85, 0.35, 48]} />
        <meshStandardMaterial color="#a04000" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-2.35, 1.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-2.35, 2.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-2.35, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-2.35, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[2.35, 1.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2.35, 2.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[2.35, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2.35, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
      </mesh>
      {[[-1.6, 0.65], [1.6, 0.65], [-1.6, -0.65], [1.6, -0.65]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.5, 0.35]} />
          <meshStandardMaterial color="#636e72" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-1.6 + i * 0.8, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.9, 0.06, 12, 48]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.3, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.4, 0.15]} />
        <meshStandardMaterial color="#27ae60" emissive="#1e8449" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

export default HeatExchanger
