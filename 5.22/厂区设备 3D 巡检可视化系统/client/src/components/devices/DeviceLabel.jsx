import { Html } from '@react-three/drei'
import { statusColors } from '../../data/devices'

function DeviceLabel({ position, name, status = 'normal', isSelected = false }) {
  const colors = statusColors[status] || statusColors.normal

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0} />
      </mesh>
      <Html
        center
        distanceFactor={10}
        zIndexRange={[100, 0]}
        style={{
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            background: isSelected 
              ? `linear-gradient(135deg, ${colors.primary}dd, ${colors.secondary}dd)`
              : 'rgba(20, 20, 35, 0.9)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: isSelected 
              ? `2px solid ${colors.primary}` 
              : `1px solid ${colors.primary}66`,
            boxShadow: isSelected 
              ? `0 0 20px ${colors.glow}66`
              : `0 2px 8px rgba(0, 0, 0, 0.3)`,
            whiteSpace: 'nowrap',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: colors.primary,
                boxShadow: `0 0 8px ${colors.glow}`,
                animation: 'pulse 2s infinite'
              }}
            />
            <span
              style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: isSelected ? '600' : '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {name}
            </span>
            <span
              style={{
                color: colors.primary,
                fontSize: '11px',
                fontWeight: '600',
                marginLeft: '4px'
              }}
            >
              {colors.text}
            </span>
          </div>
        </div>
      </Html>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </group>
  )
}

export default DeviceLabel
