function Wall({ position, args }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color="#2d3436"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

export default Wall
