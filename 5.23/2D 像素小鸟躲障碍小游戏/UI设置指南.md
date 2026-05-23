# UI 设置指南

## 完整 UI 结构

```
Canvas
├── ScoreText (显示当前分数)
├── HighScoreText (显示最高分)
├── StartPanel (开始面板)
│   ├── StartText (提示文字)
│   └── StartButton (开始按钮)
└── GameOverPanel (游戏结束面板)
    ├── GameOverText (标题)
    ├── FinalScoreText (最终得分)
    └── RestartButton (重启按钮)
```

## 详细设置步骤

### 1. 创建 Canvas

1. 在 Hierarchy 右键 → UI → Canvas
2. Canvas 设置：
   - Render Mode: Screen Space - Overlay
   - UI Scale Mode: Scale With Screen Size
   - Reference Resolution: 800 x 600

### 2. 创建分数显示

**ScoreText (当前分数):**
1. 在 Canvas 下右键 → UI → Text，命名为 "ScoreText"
2. Rect Transform:
   - Anchor: 顶部居中
   - Pos X: 0, Pos Y: -50
   - Width: 200, Height: 80
3. Text 组件:
   - Text: "0"
   - Font Size: 60
   - Alignment: 居中
   - Color: 白色

**HighScoreText (最高分):**
1. 在 Canvas 下右键 → UI → Text，命名为 "HighScoreText"
2. Rect Transform:
   - Anchor: 右上角
   - Pos X: -100, Pos Y: -20
   - Width: 200, Height: 30
3. Text 组件:
   - Text: "最高分: 0"
   - Font Size: 20
   - Alignment: 右对齐
   - Color: 黄色

### 3. 创建开始面板 (StartPanel)

**StartPanel:**
1. 在 Canvas 下右键 → UI → Panel，命名为 "StartPanel"
2. Rect Transform:
   - Anchor: 拉伸全屏
   - Left/Right/Top/Bottom: 0
3. Image 组件:
   - Color: 黑色，Alpha: 150

**StartText (面板内):**
1. 在 StartPanel 下右键 → UI → Text，命名为 "StartText"
2. Rect Transform:
   - Anchor: 居中
   - Pos Y: 50
   - Width: 400, Height: 100
3. Text 组件:
   - Text: "像素小鸟\n点击屏幕开始游戏"
   - Font Size: 40
   - Alignment: 居中
   - Color: 白色

**StartButton (面板内):**
1. 在 StartPanel 下右键 → UI → Button，命名为 "StartButton"
2. Rect Transform:
   - Anchor: 居中
   - Pos Y: -50
   - Width: 200, Height: 60
3. Button 组件:
   - Transition: Color Tint
   - 调整颜色为绿色
4. 子对象 Text:
   - Text: "开始游戏"
   - Font Size: 30
   - Color: 白色

### 4. 创建游戏结束面板 (GameOverPanel)

**GameOverPanel:**
1. 在 Canvas 下右键 → UI → Panel，命名为 "GameOverPanel"
2. Rect Transform:
   - Anchor: 居中
   - Pos X: 0, Pos Y: 0
   - Width: 400, Height: 300
3. Image 组件:
   - Color: 深灰色，Alpha: 255

**GameOverText (面板内):**
1. 在 GameOverPanel 下右键 → UI → Text，命名为 "GameOverText"
2. Rect Transform:
   - Anchor: 顶部居中
   - Pos Y: -30
   - Width: 300, Height: 50
3. Text 组件:
   - Text: "游戏结束"
   - Font Size: 40
   - Alignment: 居中
   - Color: 红色

**FinalScoreText (面板内):**
1. 在 GameOverPanel 下右键 → UI → Text，命名为 "FinalScoreText"
2. Rect Transform:
   - Anchor: 居中
   - Pos Y: 20
   - Width: 300, Height: 80
3. Text 组件:
   - Text: "得分: 0\n最高分: 0"
   - Font Size: 28
   - Alignment: 居中
   - Color: 白色

**RestartButton (面板内):**
1. 在 GameOverPanel 下右键 → UI → Button，命名为 "RestartButton"
2. Rect Transform:
   - Anchor: 底部居中
   - Pos Y: 50
   - Width: 180, Height: 50
3. Button 组件:
   - Transition: Color Tint
   - 调整颜色为绿色
4. 子对象 Text:
   - Text: "再来一次"
   - Font Size: 24
   - Color: 白色

### 5. 配置 GameManager

选中 GameManager 对象，在 Inspector 中赋值：

| 字段 | 拖入对象 |
|------|----------|
| Bird | 场景中的小鸟对象 |
| PipeSpawner | 场景中的 PipeSpawner 对象 |
| Score Text | Canvas/ScoreText |
| High Score Text | Canvas/HighScoreText |
| Final Score Text | Canvas/GameOverPanel/FinalScoreText |
| Game Over Panel | Canvas/GameOverPanel |
| Start Panel | Canvas/StartPanel |
| Restart Button | Canvas/GameOverPanel/RestartButton |
| Start Button | Canvas/StartPanel/StartButton |

### 6. 添加调试器 (可选)

1. 创建空对象，命名为 "GameDebugger"
2. 添加 `GameDebugger` 脚本组件
3. 运行游戏时会自动进行配置检查

## 快捷键 (GameDebugger)

| 按键 | 功能 |
|------|------|
| F12 | 切换调试面板 |
| R | 重启游戏 |
| P | 暂停/继续 |
| = | +10 分（测试用） |
| - | -1 分（测试用） |

## 调试面板信息

运行时调试面板显示：
- FPS 帧率
- 时间缩放
- 游戏状态（进行中/等待）
- 当前分数
- 小鸟速度和位置
- 管道数量
