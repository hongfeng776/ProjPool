import Floor from './Floor'
import Wall from './Wall'
import MachineTool from './MachineTool'
import ConveyorBelt from './ConveyorBelt'
import Shelf from './Shelf'

function FactoryScene() {
  return (
    <group>
      <Floor />
      
      <Wall position={[0, 3, -15]} args={[30, 6, 0.5]} />
      <Wall position={[0, 3, 15]} args={[30, 6, 0.5]} />
      <Wall position={[-15, 3, 0]} args={[0.5, 6, 30]} />
      <Wall position={[15, 3, 0]} args={[0.5, 6, 30]} />
      
      <MachineTool deviceId="machine-01" />
      <MachineTool deviceId="machine-02" />
      <MachineTool deviceId="machine-03" />
      <MachineTool deviceId="machine-04" />
      <MachineTool deviceId="machine-05" />
      <MachineTool deviceId="machine-06" />
      
      <ConveyorBelt deviceId="conveyor-01" length={8} />
      <ConveyorBelt deviceId="conveyor-02" length={8} />
      
      <Shelf position={[-12, 0, 0]} />
      <Shelf position={[12, 0, 0]} />
      
      <gridHelper args={[30, 30, '#0f3460', '#0a1a2e']} position={[0, 0.01, 0]} />
    </group>
  )
}

export default FactoryScene
