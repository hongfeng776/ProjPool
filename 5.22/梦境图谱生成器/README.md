# 梦境图谱生成器

一个基于 Vue 3 和 Node.js 的梦境图谱可视化应用。

## 项目结构

```
梦境图谱生成器/
├── server/           # 后端服务 (Node.js + Express)
│   ├── routes/       # API 路由
│   ├── index.js      # 服务入口
│   └── package.json
└── client/           # 前端应用 (Vue 3 + Vite)
    ├── src/
    │   ├── App.vue   # 主组件
    │   ├── api/      # API 服务
    │   └── main.js   # 入口文件
    └── package.json
```

## 快速开始

### 1. 启动后端服务

```bash
cd server
npm install
npm start
```

后端服务将运行在 http://localhost:3000

### 2. 启动前端服务

```bash
cd client
npm install
npm run dev
```

前端服务将运行在 http://localhost:5173

## API 接口

- `GET /api/health` - 健康检查
- `GET /api/dreams` - 获取梦境列表
- `GET /api/dreams/:id` - 获取单个梦境
- `POST /api/dreams` - 创建新梦境
- `PUT /api/dreams/:id` - 更新梦境
- `DELETE /api/dreams/:id` - 删除梦境
- `POST /api/dreams/generate-graph` - 生成梦境图谱
