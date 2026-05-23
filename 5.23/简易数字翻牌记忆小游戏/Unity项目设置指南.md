# Unity 翻牌记忆游戏 - 项目设置指南

## 项目结构

```
Assets/
├── Scripts/
│   ├── Card.cs                 # 卡片脚本
│   ├── GameManager.cs          # 游戏管理器
│   ├── PlayerPrefsManager.cs   # 本地存储管理器
│   └── UIManager.cs            # UI管理器
├── Prefabs/
│   └── Card.prefab             # 卡片预制体
├── Sprites/
│   ├── CardFront_1.png
│   ├── CardFront_2.png
│   └── CardBack.png
└── Scenes/
    └── GameScene.unity         # 主游戏场景
```

## 一、创建卡片预制体 (Card Prefab)

### 1. 创建卡片对象
1. 在 Hierarchy 窗口右键 → UI → Canvas
2. 在 Canvas 下右键 → UI → Image，命名为 "Card"
3. 设置 Card 的大小：Width = 100, Height = 150

### 2. 添加卡片组件
1. 在 Card 对象下创建两个子 Image：
   - FrontImage (正面图片)
   - BackImage (背面图片)
2. 在 Card 对象下创建子 Text 对象，命名为 "CardNumberText"

### 3. 设置层级
- FrontImage：初始状态 Set Active = false
- BackImage：初始状态 Set Active = true
- CardNumberText：初始状态 Set Active = false

### 4. 添加脚本
1. 选中 Card 对象
2. 添加 `Card.cs` 脚本
3. 在 Inspector 中拖拽引用：
   - Front Image → FrontImage 对象
   - Back Image → BackImage 对象
   - Card Number Text → CardNumberText 对象

### 5. 制作预制体
1. 将 Card 对象拖拽到 Project 窗口的 Prefabs 文件夹
2. 删除 Hierarchy 中的 Card 对象

## 二、设置游戏场景

### 1. 创建游戏管理器
1. 在 Hierarchy 右键 → Create Empty，命名为 "GameManager"
2. 添加 `GameManager.cs` 脚本
3. 添加 `PlayerPrefsManager.cs` 脚本

### 2. 创建游戏面板
1. 在 Canvas 下创建 Empty，命名为 "GamePanel"
2. 添加 Grid Layout Group 组件：
   - Cell Size: X = 110, Y = 160
   - Spacing: X = 10, Y = 10
   - Constraint: Fixed Column Count
   - Constraint Count: 4
3. 添加 Content Size Fitter 组件：
   - Horizontal Fit: Preferred Size
   - Vertical Fit: Preferred Size

### 3. 创建 UI 元素
在 Canvas 下创建以下 UI 元素：

#### 信息显示区域
- ScoreText (Text) - 显示分数
- MovesText (Text) - 显示步数  
- TimeText (Text) - 显示时间

#### 按钮区域
- RestartButton (Button) - 重新开始
- EasyButton (Button) - 简单模式 (2x4)
- MediumButton (Button) - 中等模式 (4x4)
- HardButton (Button) - 困难模式 (4x6)

#### 游戏结束面板
- GameCompletePanel (Panel)
  - FinalScoreText (Text)
  - FinalMovesText (Text)
  - FinalTimeText (Text)
  - HighScoreText (Text)
  - BestTimeText (Text)
  - PlayAgainButton (Button)

#### 统计面板
- StatsPanel (Panel)
  - StatsGamesPlayed (Text)
  - StatsHighScore (Text)
  - StatsBestTime (Text)
  - StatsLeastMoves (Text)
  - StatsTotalScore (Text)

### 4. 配置 UIManager
1. 在 Canvas 下创建 Empty，命名为 "UIManager"
2. 添加 `UIManager.cs` 脚本
3. 在 Inspector 中拖拽所有 UI 元素的引用

### 5. 配置 GameManager
选中 GameManager 对象，在 Inspector 中设置：
- Card Prefab → 拖拽 Prefabs/Card 预制体
- Card Grid Parent → 拖拽 GamePanel 对象
- Card Front Sprites → 添加卡片正面图片（至少需要 8 张）

## 三、脚本功能说明

### Card.cs
- 处理卡片翻转动画
- 管理卡片匹配状态
- 响应点击事件

### GameManager.cs
- 单例模式管理游戏全局状态
- 生成卡片网格
- 处理卡片匹配逻辑
- 计算分数
- 控制游戏流程

### PlayerPrefsManager.cs
- 本地存储最高分、最佳时间、最少步数
- 持久化游戏统计数据
- 格式化时间显示

### UIManager.cs
- 管理所有 UI 元素
- 响应游戏状态变化更新显示
- 处理按钮点击事件
- 显示游戏结束和统计面板

## 四、运行游戏

1. 确保所有脚本引用都已正确设置
2. 按 Play 按钮运行游戏
3. 点击卡片翻转，寻找匹配的数字对
4. 尝试用最少的步数和时间完成游戏获得高分

## 五、注意事项

1. 卡片正面图片数量应该至少等于最大配对数（困难模式需要 12 张）
2. 确保 Canvas 的 Render Mode 设置为 Screen Space - Overlay
3. Grid Layout Group 的设置根据卡片大小调整
4. PlayerPrefs 数据存储在本地，清除游戏数据会丢失记录
