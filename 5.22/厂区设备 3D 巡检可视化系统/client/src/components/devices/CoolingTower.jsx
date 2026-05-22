function CoolingTower({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 1.6, 3.2, 48]} />
        <meshStandardMaterial color="#2980b9" metalness={0.4} roughness={0.6} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 2.1, 0.45, 48]} />
        <meshStandardMaterial color="#1f618d" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.1, 0.5, 48]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.7, 48]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.3, 48]} />
        <meshStandardMaterial color="#636e72" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, 4.5, 0]} rotation={[0, 0, (i * Math.PI) / 3]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 1.4, 0.12]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[2.1, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 2.2, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2.1, 2.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.32, 0.15, 24]} />
        <meshStandardMaterial color="#636e72" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[2.1, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.32, 0.15, 24]} />
        <meshStandardMaterial color="#636e72" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1.6, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.6, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-2.3, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.28, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.8 + i * 0.9, 0]} castShadow receiveShadow>
          <torusGeometry args={[2.15, 0.06, 12, 48]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[1.5, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.4, 0.15]} />
        <meshStandardMaterial color="#27ae60" emissive="#1e8449" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

export default CoolingTower
