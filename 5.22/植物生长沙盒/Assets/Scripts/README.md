# 脚本目录说明

## Core 核心模块
- **GameManager.cs** - 游戏管理器，单例模式，管理全局状态和资源
- **SceneLoader.cs** - 场景加载器，管理场景切换
- **Bootstrapper.cs** - 启动器，游戏启动时初始化管理器
- **CameraController.cs** - 相机控制器，处理移动和缩放

## Plant 植物模块
- **PlantBase.cs** - 植物基类，定义植物的基本属性和行为
- **PlantSpawner.cs** - 植物生成器，用于创建和放置植物

## UI 用户界面模块
- **MainMenuUI.cs** - 主菜单UI，处理开始、设置、退出
- **HUDManager.cs** - 抬头显示，显示资源和游戏状态
- **ResourceButton.cs** - 资源按钮，用于添加资源
