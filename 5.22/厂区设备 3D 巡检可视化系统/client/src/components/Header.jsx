import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>厂区设备 3D 巡检可视化系统</h1>
      </div>
      <div className="header-nav">
        <span className="nav-item">设备管理</span>
        <span className="nav-item">巡检记录</span>
        <span className="nav-item">数据分析</span>
      </div>
    </header>
  )
}

export default Header
