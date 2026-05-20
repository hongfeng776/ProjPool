# 3D室内户型展示系统

基于 React + Three.js 构建的交互式3D室内户型展示系统，支持3D户型查看和全景浏览两种模式。

## 功能特性

### 1. 3D户型模式
- 程序化生成完整的3D户型结构
- 包含客厅、卧室、厨房等空间布局
- 带有沙发、床、茶几、橱柜等家具模型
- 支持鼠标交互：旋转、缩放、平移
- 实时光影效果

### 2. 全景浏览模式
- 360度全景视角浏览
- 支持不同房间场景切换
- 沉浸式第一人称视角
- 鼠标拖拽环顾四周

### 3. 用户界面
- 房间快速切换按钮
- 实时操作说明
- 当前状态信息展示
- 支持导入自定义GLTF/GLB模型

## 技术栈

- **前端框架**: React 18 + TypeScript
- **3D引擎**: Three.js
- **构建工具**: Vite
- **控制器**: OrbitControls

## 项目结构

```
3D室内户型展示系统/
├── src/
│   ├── components/
│   │   ├── HouseViewer.tsx    # 3D查看器核心组件
│   │   ├── HouseViewer.css    # 查看器样式
│   │   ├── ControlPanel.tsx   # 控制面板组件
│   │   └── ControlPanel.css   # 控制面板样式
│   ├── App.tsx                 # 主应用组件
│   ├── App.css                 # 主应用样式
│   ├── main.tsx                # 应用入口
│   ├── index.css               # 全局样式
│   └── vite-env.d.ts          # Vite类型声明
├── index.html                  # HTML入口
├── package.json                # 依赖配置
├── tsconfig.json              # TypeScript配置
└── vite.config.ts             # Vite配置
```

## 安装与运行

### 前置要求
- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

应用将在 `http://localhost:5173` 自动打开。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用说明

### 3D户型模式操作
- **左键拖动**: 旋转3D视角
- **滚轮**: 缩放视图大小
- **右键拖动**: 平移视角位置

### 全景浏览模式操作
- **左键拖动**: 环顾四周
- **点击房间按钮**: 切换不同房间场景

## 核心功能实现

### HouseViewer 组件
- 初始化 Three.js 场景、相机、渲染器
- 程序化生成3D户型墙体、地板、天花板
- 添加家具模型（沙发、床、茶几、橱柜等）
- 实现全景球体映射技术
- 支持两种查看模式无缝切换

### 户型生成
- 动态生成墙体几何体
- 使用 MeshStandardMaterial 实现真实材质
- 支持阴影投射和接收
- 环境光+方向光组合照明

### 全景浏览
- 使用反向球体（SphereGeometry）实现全景
- Canvas 动态生成全景纹理
- 不同房间对应不同色彩主题
- 第一人称视角（1.6米高度）

## 扩展功能

### 自定义模型导入
系统已预留 GLTFLoader 接口，支持导入外部 GLTF/GLB 格式的3D模型。

### 房间扩展
可在 `App.tsx` 中的 `rooms` 数组添加更多房间，并在 `HouseViewer.tsx` 中配置对应的色彩主题。

## 注意事项

1. 确保浏览器支持 WebGL 2.0
2. 建议使用现代浏览器（Chrome、Firefox、Edge）
3. 复杂3D模型可能影响性能，请适当优化

## 许可证

MIT
