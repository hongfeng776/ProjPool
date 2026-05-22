# 厂区设备 3D 巡检可视化系统

基于 React + Three.js + Node.js + PostgreSQL 的厂区设备 3D 可视化管理系统。

## 项目结构

```
厂区设备 3D 巡检可视化系统/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Scene.jsx
│   │   ├── App.jsx         # 主应用组件
│   │   ├── main.jsx        # 入口文件
│   │   └── index.css       # 全局样式
│   ├── package.json
│   └── vite.config.js
├── server/                 # 后端项目
│   ├── config/
│   │   └── database.js     # 数据库配置
│   ├── sql/
│   │   └── init.sql        # 数据库初始化脚本
│   ├── index.js            # 服务器入口
│   ├── package.json
│   └── .env                # 环境变量
└── README.md
```

## 技术栈

### 前端
- React 18
- Vite
- Three.js
- @react-three/fiber (React Three Fiber)
- @react-three/drei

### 后端
- Node.js
- Express
- PostgreSQL (pg)
- CORS
- dotenv

## 快速开始

### 1. 数据库配置

确保已安装 PostgreSQL，然后执行初始化脚本：

```bash
psql -U postgres -f server/sql/init.sql
```

### 2. 启动后端服务

```bash
cd server
npm install
npm run dev
```

后端服务运行在 `http://localhost:5000`

### 3. 启动前端服务

```bash
cd client
npm install
npm run dev
```

前端服务运行在 `http://localhost:3000`

## API 接口

- `GET /api/health` - 健康检查
- `GET /api/devices` - 获取设备列表

## 功能特性

- ✅ 基础页面布局（头部导航 + 侧边栏 + 3D 画布）
- ✅ Three.js WebGL 3D 渲染环境
- ✅ 空白三维画布（带网格辅助线）
- ✅ Node.js Express 后端服务
- ✅ PostgreSQL 数据库连接配置
- ✅ 设备数据模型与示例数据

## 后续开发

- 添加具体设备 3D 模型
- 实现设备交互与点击事件
- 开发巡检功能与数据展示
- 接入实时设备状态数据
- 完善响应式布局
