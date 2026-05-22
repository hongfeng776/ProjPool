# 脚本目录说明

## Core - 核心系统

### Singleton.cs
通用单例基类，提供线程安全的单例实现。

```csharp
public class MyClass : Singleton<MyClass>
{
    // 直接使用 Instance 访问单例
}
```

### GameManager.cs
全局游戏管理器，控制游戏暂停、帧率、退出等。

### Bootstrap.cs
启动场景初始化脚本，自动创建所有必要的管理器。

### PixelCamera.cs
像素风格专用相机，支持像素对齐和整数倍缩放。

## Networking - 网络系统

### NetworkManager.cs
Photon 网络管理器，负责连接、房间创建/加入等。

**注意**: 当前为模拟实现，导入 Photon PUN 2 后需要：
1. 继承 `MonoBehaviourPunCallbacks`
2. 实现真实的 Photon 连接逻辑
3. 配置 Photon AppId

### NetworkCallbacks.cs
网络事件回调中心，提供各种网络事件的 Action 订阅。

### PlayerData.cs
玩家数据模型，包含玩家ID、名称、ActorNumber等。

## Data - 数据系统

### IDataService.cs
数据服务接口，定义存档和设置的标准操作。

### SQLiteDataService.cs
SQLite 数据服务实现。

**注意**: 当前使用 PlayerPrefs 作为临时方案，真实 SQLite 实现需要：
1. 导入 Mono.Data.Sqlite.dll
2. 导入 sqlite3.dll (根据平台)
3. 修改此类中的方法实现真实数据库操作

### SaveManager.cs
存档管理器，提供统一的存档/读档接口。

### SaveData.cs
存档数据模型。

### SettingsData.cs
设置数据模型。

## Managers - 管理器

### SceneLoader.cs
异步场景加载器，支持：
- 最小加载时间
- 加载进度追踪
- 场景存在性检查

### UIManager.cs
UI 面板管理器，支持：
- 面板注册
- 面板栈管理
- Popup 显示/关闭

## UI - 界面脚本

### MainMenu.cs
主菜单控制器，包含：
- 开始新游戏
- 继续游戏
- 设置
- 多人游戏
- 退出游戏

### SettingsMenu.cs
设置菜单控制器，包含：
- 音量设置
- 画面设置
- 语言设置
