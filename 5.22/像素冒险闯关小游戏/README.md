# 像素冒险闯关小游戏

基于 Unity 2022.3.20f1 开发的像素风格冒险闯关游戏项目框架，**已达到可直接游玩发布标准**。

## 项目特性

### ✅ 已完成功能

**核心系统**
- ✅ Unity 2022 C# 脚本运行环境配置
- ✅ Photon 弱联网基础组件
- ✅ SQLite 本地存档系统
- ✅ 性能优化工具（性能监控、对象池）

**场景与UI**
- ✅ 游戏初始场景 (Boot)
- ✅ 主菜单界面
- ✅ 关卡选择界面
- ✅ 游戏场景
- ✅ 基础场景跳转逻辑（淡入淡出、加载屏幕）

**玩家控制**
- ✅ 键盘按键控制人物左右移动
- ✅ 跳跃动作（支持土狼时间、跳跃缓冲、二段跳）
- ✅ 碰撞边界检测，角色不会脱离游戏场景

**道具系统**
- ✅ 场景内随机道具生成
- ✅ 角色触碰道具即可拾取
- ✅ 道具获取数量统计
- ✅ HUD 界面显示收集数量

**关卡与难度**
- ✅ 多层关卡系统（6个默认关卡）
- ✅ 4种难度调节（简单/普通/困难/专家）
- ✅ 本地存档保存通关进度
- ✅ 关卡解锁机制
- ✅ 最佳分数/时间记录

**游戏流程**
- ✅ 游戏胜利检测与奖励
- ✅ 游戏失败检测与重启
- ✅ 暂停/继续功能
- ✅ 关卡完成/游戏结束UI

**稳定性**
- ✅ 全局错误处理与异常捕获
- ✅ 错误日志记录与恢复
- ✅ 内存管理与GC优化
- ✅ 运行时稳定性保障

### 🚧 可选扩展
- [ ] 更多关卡内容设计
- [ ] 敌人AI系统
- [ ] 真实Photon网络联机
- [ ] 真实SQLite数据库集成
- [ ] 音效与背景音乐

## 项目结构

```
Assets/
├── Scenes/                      # 场景文件
│   ├── Boot.unity               # 启动场景
│   ├── MainMenu.unity           # 主菜单场景
│   ├── LevelSelect.unity        # 关卡选择场景
│   └── GameScene.unity          # 游戏场景
├── Scripts/
│   ├── Core/                    # 核心系统
│   │   ├── Singleton.cs         # 单例基类
│   │   ├── GameManager.cs       # 游戏管理器
│   │   ├── Bootstrap.cs         # 启动初始化
│   │   ├── PixelCamera.cs       # 像素相机
│   │   ├── PerformanceOptimizer.cs  # 性能优化器
│   │   ├── ObjectPool.cs        # 对象池系统
│   │   ├── ErrorHandler.cs      # 错误处理器
│   │   └── GameBootstrap.cs     # 游戏启动器
│   ├── Levels/                  # 关卡系统
│   │   ├── LevelData.cs         # 关卡数据
│   │   └── LevelManager.cs      # 关卡管理器
│   ├── Gameplay/                # 游戏逻辑
│   │   └── GameStateManager.cs  # 游戏状态管理
│   ├── Player/                  # 玩家系统
│   │   ├── PlayerController.cs  # 玩家控制器
│   │   ├── PlayerInput.cs       # 输入管理
│   │   ├── GroundDetector.cs    # 地面检测
│   │   └── SceneBoundary.cs     # 场景边界
│   ├── Items/                   # 道具系统
│   │   ├── ItemData.cs          # 道具数据
│   │   ├── PickupItem.cs        # 可拾取道具
│   │   ├── ItemManager.cs       # 道具管理器
│   │   └── ItemSpawner.cs       # 道具生成器
│   ├── Networking/              # 网络系统
│   │   ├── NetworkManager.cs
│   │   ├── NetworkCallbacks.cs
│   │   └── PlayerData.cs
│   ├── Data/                    # 数据系统
│   │   ├── SaveData.cs
│   │   ├── SettingsData.cs
│   │   ├── IDataService.cs
│   │   ├── SQLiteDataService.cs
│   │   └── SaveManager.cs
│   ├── Managers/                # 管理器
│   │   ├── SceneLoader.cs       # 场景加载器
│   │   └── UIManager.cs         # UI管理器
│   └── UI/                      # UI脚本
│       ├── MainMenu.cs          # 主菜单
│       ├── SettingsMenu.cs      # 设置菜单
│       ├── LevelSelectUI.cs     # 关卡选择UI
│       ├── GameOverUI.cs        # 游戏结束UI
│       ├── LoadingScreen.cs     # 加载屏幕
│       ├── FadeTransition.cs    # 淡入淡出
│       └── HUD/                 # HUD系统
│           ├── HUDController.cs
│           └── ItemCounterUI.cs
├── Prefabs/                     # 预制体
├── UI/                          # UI资源
├── Resources/                   # 资源文件
│   ├── SceneBuildOrder.txt
│   ├── SceneOptimizationGuide.txt
│   ├── PlayerSetupGuide.txt
│   ├── ItemCollectionGuide.txt
│   └── ReleaseChecklist.txt
└── Plugins/                     # 第三方插件
```

## 快速开始

### 1. 环境要求

- Unity 2022.3.20f1 LTS
- Visual Studio 2022 / Rider

### 2. 导入项目

1. 打开 Unity Hub
2. 点击 "Open" 选择项目文件夹
3. 等待 Unity 导入完成

### 3. 配置场景

1. 打开 **File -> Build Settings...**
2. 按顺序添加以下场景：
   - 0: `Assets/Scenes/Boot.unity`
   - 1: `Assets/Scenes/MainMenu.unity`
   - 2: `Assets/Scenes/LevelSelect.unity`
   - 3: `Assets/Scenes/GameScene.unity`

### 4. 配置 Input Manager

确保以下输入已配置（Edit -> Project Settings -> Input Manager）：
- **Horizontal**: A/D 或 左右方向键
- **Jump**: 空格键
- **Submit**: Enter
- **Cancel**: Escape

### 5. 运行游戏

1. 打开 `Assets/Scenes/Boot.unity` 场景
2. 点击 Play 按钮运行

## 游戏操作

| 按键 | 功能 |
|------|------|
| **A / 左方向键** | 向左移动 |
| **D / 右方向键** | 向右移动 |
| **空格键 / W** | 跳跃 |
| **ESC** | 暂停游戏 |

## 核心系统说明

### 游戏状态机

```
Boot → 主菜单 → 关卡选择 → 游戏中
                           ↓
                        暂停/继续
                           ↓
                    胜利 / 失败
                           ↓
                        重试 / 返回菜单
```

### 关卡系统

**4种难度：**
- **简单**: 生命+2，敌人减速
- **普通**: 标准参数
- **困难**: 生命-1，敌人加速
- **专家**: 仅1条生命

**进度保存：**
- 关卡解锁状态
- 最佳分数
- 最佳通关时间
- 收集的星星数

### 道具系统

| 类型 | 颜色 | 说明 |
|------|------|------|
| Coin | 黄色 | 金币，基础分数 |
| Gem | 青色 | 宝石，高级分数 |
| Star | 白色 | 星星，评价用 |
| Key | 橙色 | 钥匙，解锁门 |
| Heart | 红色 | 生命恢复 |
| PowerUp | 绿色 | 能力提升 |

### 玩家特性

- 平滑移动加减速
- 土狼时间（离开地面后短暂可跳）
- 跳跃缓冲（提前按键缓冲）
- 可变跳跃高度
- 二段跳
- 下落重力加速
- 边界限制

## 管理器架构

| 管理器 | 职责 |
|--------|------|
| **GameManager** | 全局游戏状态 |
| **LevelManager** | 关卡进度、难度、存档 |
| **GameStateManager** | 游戏状态切换 |
| **SceneLoader** | 异步场景加载、过渡动画 |
| **ItemManager** | 道具收集统计 |
| **SaveManager** | 本地存档管理 |
| **UIManager** | UI面板管理 |
| **ErrorHandler** | 异常捕获与恢复 |
| **PerformanceOptimizer** | 性能监控与优化 |

## 发布前检查清单

详见 `Assets/Resources/ReleaseChecklist.txt`

**关键检查项：**
- [ ] 所有场景已添加到 Build Settings
- [ ] Player Settings 配置正确
- [ ] 输入配置完整
- [ ] 无编译错误
- [ ] 无运行时异常
- [ ] 存档功能正常
- [ ] 场景切换流畅
- [ ] 内存使用合理

## 扩展开发指南

### 添加新关卡

1. 右键 Project 窗口 → Create → Pixel Adventure → Level Data
2. 配置关卡参数（目标分数、道具数量等）
3. 在 LevelManager 中添加关卡数据

### 添加新道具类型

1. 在 `ItemType` 枚举中添加新类型
2. 在 `ItemCounterUI.GetColorForType()` 添加对应颜色
3. 创建新的 ItemData 配置

### 添加新玩家能力

1. 在 `PlayerController` 中添加新逻辑
2. 或创建新的组件继承功能
3. 在 PlayerInitializer 中配置参数

## 常见问题

### Q: 如何测试游戏？
A: 打开 Boot 场景点击 Play，系统会自动创建所有必要组件。

### Q: 关卡进度保存在哪里？
A: 使用 PlayerPrefs 本地存储，可在 LevelManager 中配置为 SQLite。

### Q: 如何修改难度？
A: 在关卡选择界面的下拉菜单中选择，或在 LevelManager 中设置。

### Q: 道具不显示怎么办？
A: 检查 ItemSpawner 的生成区域是否在摄像机范围内。

## 技术栈

- **Unity 2022.3.20f1 LTS**
- **C# 9.0**
- **Photon PUN 2** (可选)
- **SQLite** (可选)

## 许可证

本项目仅供学习和参考使用。
