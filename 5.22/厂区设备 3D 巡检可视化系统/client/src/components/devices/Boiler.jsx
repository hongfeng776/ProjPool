function Boiler({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 2.5, 2]} />
        <meshStandardMaterial color="#c0392b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#636e72" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.2, 1.2, 0]}>
        <boxGeometry args={[0.6, 1.5, 1.5]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[-1.2, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3.4, 0.4, 2.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[1, 2.5, 0.8]}>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1, 2.5, 0.8]}>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export default Boiler
