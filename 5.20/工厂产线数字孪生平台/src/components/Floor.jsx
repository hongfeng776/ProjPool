function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        color="#1a1a2e"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

export default Floor
