# 办公室摸鱼大战 - 打包指南

## 项目信息
- **Unity 版本**: 2022.3.0f1
- **目标平台**: Windows (x64)

## 前置要求

1. 安装 Unity 2022.3.0f1 或更高版本
2. 安装 Windows Build Support 模块 (在 Unity Hub 中添加)

## 打开项目

1. 启动 Unity Hub
2. 点击 "Open" 按钮
3. 选择项目文件夹: `办公室摸鱼大战`
4. 等待 Unity 编译项目 (首次打开可能需要几分钟)

## 打包方法

### 方法 1: 使用菜单 (推荐)

1. 在 Unity 编辑器顶部菜单栏找到 `Build` 菜单
2. 选择以下选项之一:
   - `Build/Build Windows (x64)` - 打包 64 位 Windows 版本
   - `Build/Build Windows (x86)` - 打包 32 位 Windows 版本
   - `Build/Build and Run Windows` - 打包并立即运行
3. 等待打包完成
4. 可执行文件位于 `Builds/Windows/办公室摸鱼大战.exe`

### 方法 2: 使用 Build Settings

1. 打开 `File > Build Settings`
2. 确认场景列表包含:
   - Assets/Scenes/MainMenu.unity
   - Assets/Scenes/GameScene.unity
3. 选择 Platform: `Windows`
4. 选择 Architecture: `x86_64`
5. 点击 `Build`
6. 选择输出位置和文件名

## 输出位置

- 默认输出: `项目文件夹/Builds/Windows/`
- 可执行文件: `办公室摸鱼大战.exe`
- 数据文件夹: `办公室摸鱼大战_Data/`

## 运行游戏

1. 双击 `办公室摸鱼大战.exe`
2. 在主菜单点击 "开始游戏"
3. 选择关卡
4. 开始摸鱼!

## 游戏操作

- **鼠标左键**: 点击物品进行交互
- **1-4 键**: 使用对应道具
- **ESC 键**: 暂停游戏

## 游戏目标

- 在限定时间内尽可能获得高摸鱼值
- 点击电脑假装工作，点击其他物品摸鱼
- 避免被老板发现，否则会扣血
- 道具可以帮助你：老板变慢、隐身、分数加成等
- 完成关卡解锁更高难度

## 常见问题

### Q: 打包时提示找不到场景
A: 确保 `Assets/Scenes/` 文件夹下有 `MainMenu.unity` 和 `GameScene.unity`

### Q: 打包后运行黑屏
A: 确保已正确设置场景，并且 GameManager 等核心对象已配置

### Q: 数据库报错
A: 首次运行会自动创建数据库文件，位于可执行文件同级目录

## 项目结构

```
办公室摸鱼大战/
├── Assets/
│   ├── Scenes/          # 场景文件
│   ├── Scripts/         # 代码文件
│   │   ├── Core/        # 核心系统
│   │   ├── Gameplay/    # 游戏逻辑
│   │   ├── UI/          # 界面系统
│   │   ├── Items/       # 道具系统
│   │   ├── Levels/      # 关卡系统
│   │   ├── MiniGames/   # 小游戏系统
│   │   ├── Database/    # 数据库系统
│   │   └── Editor/      # 编辑器工具
│   └── Plugins/         # 插件 (SQLite)
├── Builds/              # 打包输出目录
└── ProjectSettings/     # 项目设置
```

## 系统要求

### 最低配置
- Windows 7 SP1+
- 2 GB 内存
- 1 GB 可用存储空间

### 推荐配置
- Windows 10/11
- 4 GB 内存
- 2 GB 可用存储空间
