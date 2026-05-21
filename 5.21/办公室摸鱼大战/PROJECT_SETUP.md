# 办公室摸鱼大战 - 项目配置说明

## 项目概述
- **游戏名称**: 办公室摸鱼大战
- **Unity 版本**: 2022.3.0f1 LTS
- **编程语言**: C#
- **网络框架**: Photon PUN 2 (v2.44.1)
- **本地数据库**: SQLite
- **UI 框架**: UGUI + TextMeshPro

---

## 开发环境配置

### 1. 必备软件
- Unity Hub
- Unity 2022.3.0f1 LTS 或更高版本
- Visual Studio / Rider (C# IDE)
- Git (版本控制)

### 2. Unity 安装时需要勾选的模块
- Universal Windows Platform Build Support (可选)
- Android Build Support (可选)
- iOS Build Support (可选)
- WebGL Build Support (可选)

---

## 项目依赖配置

### 1. Packages (已配置在 manifest.json)

```json
{
  "dependencies": {
    "com.exitgames.photon.pun2": "2.44.1",      // Photon 网络框架
    "com.unity.nuget.sqlite-core": "3.38.0",     // SQLite 核心库
    "com.unity.textmeshpro": "3.0.6",            // 文本组件
    "com.unity.ugui": "1.0.0",                   // UI 系统
    // ... 其他内置包
  },
  "scopedRegistries": [
    {
      "name": "Package Registry",
      "url": "https://package.openupm.com",
      "scopes": [
        "com.exitgames",
        "com.cysharp"
      ]
    }
  ]
}
```

### 2. 首次打开项目
1. 用 Unity Hub 添加项目并打开
2. 等待包管理器下载并导入所有依赖
3. 导入 TextMeshPro Essential Resources (弹出窗口时点击 Import)

---

## SQLite 配置

详见 `Assets/Plugins/SQLite_SETUP.txt`

**快捷步骤**:
1. 从 Unity 安装目录复制 `Mono.Data.Sqlite.dll` 到 `Assets/Plugins/`
2. 从 sqlite.org 下载对应平台的原生库到 `Assets/Plugins/`
3. 设置 Player Settings > API Compatibility Level 为 .NET Framework

---

## Photon PUN 2 配置

详见 `Assets/Photon/PHOTON_SETUP.txt`

**快捷步骤**:
1. 访问 https://www.photonengine.com/ 注册账号
2. 创建 PUN 应用并复制 App ID
3. Unity 菜单: Window > Photon Unity Networking > PhotonServerSettings
4. 粘贴 App ID 完成配置

---

## 主菜单场景搭建

详见 `Assets/Scenes/MAINMENU_SETUP.txt`

**核心按钮**:
- [开始游戏] - 触发游戏开始流程
- [排行榜] - 显示本地排行榜
- [设置] - 游戏设置（音量、画质、全屏等）
- [退出游戏] - 退出应用

---

## 代码架构说明

### 模块划分 (Assembly Definitions)

```
Assets/Scripts/
├── Core/                    # 核心模块
│   ├── Singleton.cs         # 单例基类
│   ├── GameManager.cs       # 游戏状态管理
│   ├── GameInitializer.cs   # 游戏初始化
│   ├── SceneLoader.cs       # 场景加载
│   ├── AudioManager.cs      # 音频管理
│   └── EventSystem.cs       # 事件系统
│
├── Database/                # 数据库模块
│   ├── DatabaseManager.cs   # SQLite 连接管理
│   ├── PlayerRepository.cs  # 玩家数据操作
│   ├── LeaderboardRepository.cs  # 排行榜操作
│   └── SettingsRepository.cs     # 设置数据操作
│
├── Network/                 # 网络模块
│   ├── SingletonPun.cs      # Photon 单例基类
│   ├── NetworkManager.cs    # 网络连接管理
│   └── PlayerData.cs        # 玩家网络数据同步
│
├── UI/                      # 界面模块
│   ├── UIManager.cs         # UI 管理器
│   ├── MainMenuController.cs     # 主菜单控制
│   ├── LeaderboardController.cs  # 排行榜控制
│   ├── LeaderboardEntryUI.cs     # 排行榜条目UI
│   └── SettingsController.cs     # 设置控制
│
└── Gameplay/                # 游戏逻辑模块
    └── GameSettings.cs      # 游戏常量配置
```

### 核心类说明

**DatabaseManager.cs** (`DatabaseManager.cs:8`)
- 单例模式，管理 SQLite 数据库连接
- 自动创建数据库文件和数据表
- 支持多平台路径处理

**NetworkManager.cs** (`NetworkManager.cs:8`)
- 继承自 SingletonPun，管理 Photon 连接
- 提供房间创建、加入、离开等方法
- 事件回调机制：OnConnected, OnJoinRoom 等

**UIManager.cs** (`UIManager.cs:4`)
- 单例模式，管理所有 UI 面板
- 面板切换逻辑：MainMenu、Leaderboard、Settings、Loading

---

## 数据库表结构

### Players 表
```sql
CREATE TABLE Players (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    HighScore INTEGER DEFAULT 0,
    TotalGames INTEGER DEFAULT 0,
    TotalScore INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Leaderboard 表
```sql
CREATE TABLE Leaderboard (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PlayerId INTEGER NOT NULL,
    PlayerName TEXT NOT NULL,
    Score INTEGER NOT NULL,
    GameMode TEXT DEFAULT 'Default',
    PlayedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerId) REFERENCES Players(Id)
);
```

### Settings 表
```sql
CREATE TABLE Settings (
    Key TEXT PRIMARY KEY,
    Value TEXT,
    Description TEXT
);
```

---

## 下一步开发建议

### 1. 完成 UI 搭建
- 按照 MAINMENU_SETUP.txt 搭建主菜单场景
- 创建排行榜条目预制体
- 关联脚本组件的字段引用

### 2. 实现游戏逻辑
- 在 Gameplay 文件夹中添加具体游戏玩法
- 实现玩家得分计算逻辑
- 对接 NetworkManager 进行多人游戏

### 3. 添加资源
- 背景图片、按钮样式、图标等美术资源
- 背景音乐、音效等音频资源

### 4. 测试
- 测试 SQLite 数据库读写
- 测试 Photon 网络连接
- 测试 UI 交互流程

---

## 常见问题

### Q: SQLite 报错找不到 Mono.Data.Sqlite
A: 确保已将 Mono.Data.Sqlite.dll 放入 Assets/Plugins/ 目录，并且 API Compatibility Level 设置为 .NET Framework。

### Q: Photon 连接失败
A: 检查 App ID 是否正确配置，网络是否正常，PhotonServerSettings 是否在 Resources 目录下。

### Q: 点击按钮没有反应
A: 检查 Button 的 OnClick 事件是否正确绑定，MainMenuController 脚本的字段是否正确关联。

---

## 项目版本
- v0.1.0 - 基础框架搭建完成
