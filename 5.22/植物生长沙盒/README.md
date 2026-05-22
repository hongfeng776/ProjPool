# 植物生长沙盒

一个基于 Unity 2022 的植物生长模拟沙盒游戏。

## 项目结构

```
Assets/
├── Scenes/              # 场景文件
│   ├── MenuScene.unity  # 主菜单场景
│   └── MainScene.unity  # 游戏主场景
├── Scripts/
│   ├── Core/            # 核心系统
│   │   ├── GameManager.cs
│   │   ├── SceneLoader.cs
│   │   ├── Bootstrapper.cs
│   │   └── CameraController.cs
│   ├── Plant/           # 植物系统
│   │   ├── PlantBase.cs
│   │   └── PlantSpawner.cs
│   └── UI/              # UI 系统
│       ├── MainMenuUI.cs
│       ├── HUDManager.cs
│       └── ResourceButton.cs
├── UI/                  # UI 资源
├── Prefabs/             # 预制体
├── Materials/           # 材质
├── Textures/            # 纹理
└── Audio/               # 音频资源
```

## 核心功能

### 游戏管理器 (GameManager)
- 单例模式全局访问
- 资源管理：水、阳光、养分
- 游戏状态控制：暂停/继续
- 游戏时间追踪

### 植物系统 (PlantBase)
- 6个生长阶段：种子 → 发芽 → 幼苗 → 成熟 → 开花 → 死亡
- 生长进度系统
- 生命值系统
- 资源消耗机制

### UI 系统
- 主菜单：开始游戏、设置、退出
- HUD：资源显示、进度条、游戏时间
- 暂停面板
- 资源添加按钮

### 相机控制
- WASD 或方向键移动
- 鼠标滚轮缩放
- 可配置移动边界

## 快速开始

1. 使用 Unity 2022.3.20f1 打开项目
2. 打开 `MenuScene` 场景
3. 点击播放按钮开始游戏

## 开发说明

### 添加新植物类型
1. 继承 `PlantBase` 类
2. 重写 `Grow()`、`CanGrow()` 等方法
3. 创建对应预制体

### 添加新 UI 元素
1. 在 `UI` 目录创建对应脚本
2. 继承相应的 UI 基类
3. 在场景中配置引用

## 技术栈

- Unity 2022.3.20f1
- TextMeshPro
- UGUI
