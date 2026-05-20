function Shelf({ position }) {
  return (
    <group position={position}>
      <mesh position={[-0.8, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 2.5, 1.5]} />
        <meshStandardMaterial
          color="#95a5a6"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.8, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 2.5, 1.5]} />
        <meshStandardMaterial
          color="#95a5a6"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {[0.5, 1.2, 1.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 1.4]} />
          <meshStandardMaterial
            color="#7f8c8d"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}

      {[0.5, 1.2, 1.9].map((y, i) => (
        <group key={i} position={[0, y + 0.15, 0]}>
          {[-0.4, 0, 0.4].map((x, j) => (
            <mesh key={j} position={[x, 0, 0]} castShadow>
              <boxGeometry args={[0.35, 0.25, 1]} />
              <meshStandardMaterial
                color={['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#16a085'][i * 3 + j]}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export default Shelf
