import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const DeviceContext = createContext()

const initialDevices = [
  { id: 'machine-01', name: '机床-01', type: 'machine', position: [-8, 0, -8], status: 'running', temperature: 45, speed: 1200, runtime: 1560, efficiency: 92, warningCount: 0 },
  { id: 'machine-02', name: '机床-02', type: 'machine', position: [-8, 0, 0], status: 'running', temperature: 48, speed: 1150, runtime: 1420, efficiency: 88, warningCount: 0 },
  { id: 'machine-03', name: '机床-03', type: 'machine', position: [-8, 0, 8], status: 'idle', temperature: 32, speed: 0, runtime: 890, efficiency: 0, warningCount: 0 },
  { id: 'machine-04', name: '机床-04', type: 'machine', position: [8, 0, -8], status: 'running', temperature: 52, speed: 1250, runtime: 1680, efficiency: 95, warningCount: 0 },
  { id: 'machine-05', name: '机床-05', type: 'machine', position: [8, 0, 0], status: 'running', temperature: 55, speed: 1100, runtime: 1350, efficiency: 78, warningCount: 0 },
  { id: 'machine-06', name: '机床-06', type: 'machine', position: [8, 0, 8], status: 'stopped', temperature: 28, speed: 0, runtime: 0, efficiency: 0, warningCount: 0 },
  { id: 'conveyor-01', name: '传送带-01', type: 'conveyor', position: [0, 0, -5], status: 'running', temperature: 35, speed: 2.5, load: 65, runtime: 2100, efficiency: 88, warningCount: 0 },
  { id: 'conveyor-02', name: '传送带-02', type: 'conveyor', position: [0, 0, 5], status: 'idle', temperature: 28, speed: 0, load: 0, runtime: 0, efficiency: 0, warningCount: 0 },
]

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState(initialDevices)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [warningHistory, setWarningHistory] = useState([])
  const [notifications, setNotifications] = useState([])
  const warningTriggeredRef = useRef({})

  const addNotification = useCallback((message, type = 'info', deviceId = null) => {
    const id = Date.now()
    setNotifications(prev => [{
      id,
      message,
      type,
      deviceId,
      timestamp: new Date()
    }, ...prev].slice(0, 10))
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const addWarningRecord = useCallback((deviceId, deviceName, message) => {
    const newRecord = {
      id: Date.now(),
      deviceId,
      deviceName,
      type: 'warning',
      message,
      timestamp: new Date()
    }
    setWarningHistory(prev => [newRecord, ...prev].slice(0, 50))
  }, [])

  const updateDeviceData = useCallback(() => {
    setDevices(prevDevices => 
      prevDevices.map(device => {
        if (device.status === 'stopped') {
          return {
            ...device,
            temperature: device.type === 'machine' 
              ? parseFloat(Math.max(25, device.temperature - 0.5).toFixed(1))
              : parseFloat(Math.max(25, device.temperature - 0.2).toFixed(1))
          }
        }

        let newTemp = device.temperature
        let newStatus = device.status
        let newWarningCount = device.warningCount || 0
        let newSpeed = device.speed
        let newEfficiency = device.efficiency
        let newLoad = device.load
        let newRuntime = device.runtime

        if (device.type === 'machine') {
          const tempChange = (Math.random() - 0.45) * 4
          newTemp = Math.max(30, Math.min(90, device.temperature + tempChange))
          
          const wasWarning = device.status === 'warning'
          
          if (newTemp >= 75 && !wasWarning) {
            newStatus = 'warning'
            newWarningCount++
            const msg = `温度过高: ${newTemp.toFixed(1)}°C`
            addWarningRecord(device.id, device.name, msg)
            addNotification(`⚠️ ${device.name}: ${msg}`, 'warning', device.id)
            warningTriggeredRef.current[device.id] = true
          } else if (newTemp < 65 && wasWarning) {
            newStatus = 'running'
            addNotification(`✅ ${device.name}: 温度已恢复正常`, 'success', device.id)
            warningTriggeredRef.current[device.id] = false
          } else if (!wasWarning && device.speed > 0) {
            newStatus = 'running'
          } else if (!wasWarning && device.speed === 0) {
            newStatus = 'idle'
          }

          if (newStatus === 'running') {
            newSpeed = parseFloat(Math.max(1000, Math.min(1400, 1200 + (Math.random() - 0.5) * 100)).toFixed(1))
            newEfficiency = parseFloat(Math.max(70, Math.min(98, device.efficiency + (Math.random() - 0.5) * 2)).toFixed(1))
            newRuntime = device.runtime + 1
          } else if (newStatus === 'warning') {
            newSpeed = parseFloat(Math.max(500, Math.min(800, device.speed + (Math.random() - 0.5) * 50)).toFixed(1))
            newEfficiency = parseFloat(Math.max(40, Math.min(70, device.efficiency + (Math.random() - 0.6) * 3)).toFixed(1))
            newRuntime = device.runtime + 1
          } else if (newStatus === 'idle') {
            newSpeed = 0
            newEfficiency = 0
          }
        } else {
          const tempChange = (Math.random() - 0.45) * 2
          newTemp = Math.max(25, Math.min(60, device.temperature + tempChange))

          if (device.status === 'running') {
            newLoad = parseFloat(Math.max(40, Math.min(95, device.load + (Math.random() - 0.5) * 10)).toFixed(1))
            newSpeed = parseFloat(Math.max(1.5, Math.min(3.5, 2.5 + (Math.random() - 0.5) * 0.5)).toFixed(1))
            newEfficiency = parseFloat(Math.max(60, Math.min(95, device.efficiency + (Math.random() - 0.5) * 2)).toFixed(1))
            newRuntime = device.runtime + 1

            if (newLoad >= 90 && device.status !== 'warning' && !warningTriggeredRef.current[device.id]) {
              newStatus = 'warning'
              newWarningCount++
              const msg = `负载过高: ${newLoad}%`
              addWarningRecord(device.id, device.name, msg)
              addNotification(`⚠️ ${device.name}: ${msg}`, 'warning', device.id)
              warningTriggeredRef.current[device.id] = true
            } else if (newLoad < 85 && device.status === 'warning') {
              newStatus = 'running'
              addNotification(`✅ ${device.name}: 负载已恢复正常`, 'success', device.id)
              warningTriggeredRef.current[device.id] = false
            }
          } else if (device.status === 'idle') {
            newLoad = parseFloat(Math.max(0, device.load - 5).toFixed(1))
            newSpeed = 0
            newEfficiency = 0
          } else if (device.status === 'warning') {
            newLoad = parseFloat(Math.max(70, Math.min(95, device.load + (Math.random() - 0.6) * 8)).toFixed(1))
            newSpeed = parseFloat(Math.max(1, Math.min(2, device.speed + (Math.random() - 0.5) * 0.3)).toFixed(1))
            newEfficiency = parseFloat(Math.max(40, Math.min(70, device.efficiency + (Math.random() - 0.6) * 3)).toFixed(1))
            newRuntime = device.runtime + 1

            if (newLoad < 85) {
              newStatus = 'running'
              addNotification(`✅ ${device.name}: 负载已恢复正常`, 'success', device.id)
              warningTriggeredRef.current[device.id] = false
            }
          }
        }

        return {
          ...device,
          temperature: parseFloat(newTemp.toFixed(1)),
          speed: newSpeed,
          runtime: newRuntime,
          efficiency: newEfficiency,
          load: newLoad,
          status: newStatus,
          warningCount: newWarningCount
        }
      })
    )
    setLastUpdate(new Date())
  }, [addNotification, addWarningRecord])

  useEffect(() => {
    const interval = setInterval(updateDeviceData, 1000)
    return () => clearInterval(interval)
  }, [updateDeviceData])

  const toggleDevice = useCallback((deviceId) => {
    setDevices(prevDevices =>
      prevDevices.map(device => {
        if (device.id === deviceId) {
          const isStopping = device.status !== 'stopped'
          const newStatus = isStopping ? 'stopped' : 'idle'
          
          addNotification(
            isStopping ? `⏹️ ${device.name} 已停止` : `▶️ ${device.name} 已启动`,
            isStopping ? 'info' : 'success',
            deviceId
          )

          if (!isStopping) {
            warningTriggeredRef.current[deviceId] = false
          }
          
          return {
            ...device,
            status: newStatus,
            speed: isStopping ? 0 : (device.type === 'machine' ? 1200 : 2.5),
            temperature: isStopping ? device.temperature : 40,
            efficiency: isStopping ? 0 : 85,
            load: device.type === 'conveyor' ? (isStopping ? device.load : 60) : device.load
          }
        }
        return device
      })
    )
  }, [addNotification])

  const resetDeviceWarning = useCallback((deviceId) => {
    setDevices(prevDevices =>
      prevDevices.map(device => {
        if (device.id === deviceId && device.status === 'warning') {
          warningTriggeredRef.current[deviceId] = false
          addNotification(`🔧 ${device.name}: 告警已重置`, 'info', deviceId)
          return {
            ...device,
            status: 'running',
            temperature: 55,
            speed: device.type === 'machine' ? 1200 : 2.5
          }
        }
        return device
      })
    )
  }, [addNotification])

  const getDeviceById = useCallback((deviceId) => {
    return devices.find(d => d.id === deviceId)
  }, [devices])

  const getDevicesByType = useCallback((type) => {
    return devices.filter(d => d.type === type)
  }, [devices])

  const getStatistics = useCallback(() => {
    const total = devices.length
    const running = devices.filter(d => d.status === 'running').length
    const stopped = devices.filter(d => d.status === 'stopped').length
    const warning = devices.filter(d => d.status === 'warning').length
    const idle = devices.filter(d => d.status === 'idle').length
    const machineDevices = devices.filter(d => d.type === 'machine')
    const avgTemp = machineDevices.reduce((sum, d) => sum + d.temperature, 0) / machineDevices.length
    const avgEfficiency = machineDevices.reduce((sum, d) => sum + d.efficiency, 0) / machineDevices.length
    const totalWarnings = devices.reduce((sum, d) => sum + (d.warningCount || 0), 0)

    return { 
      total, 
      running, 
      stopped, 
      warning, 
      idle, 
      avgTemp: avgTemp.toFixed(1), 
      avgEfficiency: avgEfficiency.toFixed(1),
      totalWarnings
    }
  }, [devices])

  return (
    <DeviceContext.Provider value={{
      devices,
      selectedDevice,
      lastUpdate,
      warningHistory,
      notifications,
      setSelectedDevice,
      toggleDevice,
      resetDeviceWarning,
      getDeviceById,
      getDevicesByType,
      getStatistics,
      addNotification
    }}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevice() {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}
