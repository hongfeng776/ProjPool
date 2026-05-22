function Ground({ size = 50 }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8]}>
        <planeGeometry args={[4, 8]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.01, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.01, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.1} roughness={0.9} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`line-h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-8 + i * 4, 0.02, 0]}>
          <planeGeometry args={[0.1, 12]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`line-v-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -5 + i * 3.5]}>
          <planeGeometry args={[18, 0.1]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
      ))}
    </group>
  )
}

export default Ground
