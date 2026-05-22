import './ControlPanel.css'

function ControlPanel({ viewMode, setViewMode, onViewChange, onReset }) {
  return (
    <div className="control-panel">
      <div className="panel-header">
        <h3>🎮 视角控制</h3>
      </div>

      <div className="panel-section">
        <h4>漫游模式</h4>
        <div className="mode-buttons">
          <button 
            className={viewMode === 'orbit' ? 'active' : ''}
            onClick={() => {
              setViewMode('orbit')
              onViewChange('overview')
            }}
          >
            🎯 轨道模式
          </button>
          <button 
            className={viewMode === 'free' ? 'active' : ''}
            onClick={() => {
              setViewMode('free')
              onViewChange('overview')
            }}
          >
            ✈️ 自由漫游
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h4>快速视角</h4>
        <div className="view-buttons">
          <button onClick={() => onViewChange('top')}>⬆️ 俯视</button>
          <button onClick={() => onViewChange('front')}>⬇️ 正视</button>
          <button onClick={() => onViewChange('back')}>⬆️ 后视</button>
          <button onClick={() => onViewChange('left')}>⬅️ 左视</button>
          <button onClick={() => onViewChange('right')}>➡️ 右视</button>
          <button onClick={() => onViewChange('overview')}>🔍 总览</button>
        </div>
      </div>

      {viewMode === 'free' && (
        <div className="panel-section keyboard-hints">
          <h4>⌨️ 键盘控制</h4>
          <div className="key-grid">
            <div></div>
            <div className="key">W</div>
            <div></div>
            <div className="key">A</div>
            <div className="key">S</div>
            <div className="key">D</div>
          </div>
          <p>W/A/S/D - 前后左右移动</p>
          <p>Q/E - 上升/下降</p>
          <p>鼠标左键拖拽 - 旋转视角</p>
          <p>鼠标滚轮 - 缩放画面</p>
        </div>
      )}

      {viewMode === 'orbit' && (
        <div className="panel-section">
          <h4>🖱️ 鼠标操作</h4>
          <p>左键拖拽 - 旋转视角</p>
          <p>右键拖拽 - 平移画面</p>
          <p>滚轮 - 缩放画面</p>
        </div>
      )}

      <button className="reset-button" onClick={onReset}>
        🔄 重置视角
      </button>
    </div>
  )
}

export default ControlPanel
