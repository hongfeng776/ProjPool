import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DeviceProvider } from './context/DeviceContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DeviceProvider>
      <App />
    </DeviceProvider>
  </React.StrictMode>,
)
