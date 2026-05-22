function FactoryBuilding({ position = [0, 0, 0], size = [20, 8, 15] }) {
  const [width, height, depth] = size

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[0, height + 1, 0]}>
        <boxGeometry args={[width + 1, 0.5, depth + 1]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.3} roughness={0.7} />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`window-front-${i}`} position={[-width / 2 + 3 + i * 5, height / 2, depth / 2 + 0.01]}>
          <boxGeometry args={[2, 2, 0.1]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`window-back-${i}`} position={[-width / 2 + 4 + i * 6, height / 2, -depth / 2 - 0.01]}>
          <boxGeometry args={[2, 2, 0.1]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 2, depth / 2 + 0.01]}>
        <boxGeometry args={[4, 4, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
        <meshStandardMaterial color="#7f8c8d" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default FactoryBuilding
