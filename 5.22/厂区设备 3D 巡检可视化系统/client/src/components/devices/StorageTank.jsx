function StorageTank({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '#27ae60' }) {
  return (
    <group position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 2.8, 48]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.85, 0.15, 48]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.15, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.85, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 1.6, 0.5, 48]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
        <meshStandardMaterial color="#636e72" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.1, 3.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.7, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.45, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.7, 1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.25, 0.12, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.6, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 24]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.85, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.25, 0.12, 24]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.65, 0.06, 12, 48]} />
        <meshStandardMaterial color="#b2bec3" metalness={0.7} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.8 + i * 0.8, 0]} castShadow receiveShadow>
          <torusGeometry args={[1.65, 0.04, 12, 48]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-1, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.35, 0.15]} />
        <meshStandardMaterial color="#27ae60" emissive="#1e8449" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export default StorageTank
