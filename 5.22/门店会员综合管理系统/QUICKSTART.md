# 门店会员综合管理系统 - 快速启动指南

## 前置环境要求

### 必需软件
- **Node.js**: v16.0+ (推荐 v18.x)
- **MongoDB**: v4.0+
- **Redis**: v5.0+
- **Nginx**: v1.18+ (可选，用于生产环境)

### 验证环境
```bash
node -v
npm -v
mongod --version
redis-server --version
```

---

## 快速启动（开发环境）

### 方式一：使用启动脚本（Windows）

1. 双击运行 `install.bat` 安装依赖
2. 双击运行 `start.bat` 启动服务

### 方式二：手动启动

#### 1. 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

#### 2. 启动数据库
```bash
# 启动 MongoDB
mongod

# 启动 Redis
redis-server
```

#### 3. 启动服务
```bash
# 启动后端服务 (终端1)
cd server
npm run dev

# 启动前端服务 (终端2)
cd client
npm run dev
```

---

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端开发服务 | http://localhost:5173 | Vite 开发服务器 |
| 后端 API 服务 | http://localhost:3000 | Express 服务器 |
| 健康检查 | http://localhost:3000/api/health | 查看服务状态 |
| Nginx 代理 | http://localhost | 需要配置 Nginx |

---

## Nginx 配置（可选）

1. 将 `nginx/nginx.conf` 复制到 Nginx 配置目录
2. 将 `nginx/mime.types` 复制到 Nginx 配置目录
3. 重启 Nginx 服务

---

## 项目结构

```
门店会员综合管理系统/
├── client/                    # 前端项目 (Vue3)
│   ├── src/
│   │   ├── layout/           # 布局组件
│   │   ├── views/            # 页面组件
│   │   │   ├── dashboard/    # 首页
│   │   │   ├── member/       # 会员管理
│   │   │   ├── product/      # 商品管理
│   │   │   ├── order/        # 订单管理
│   │   │   ├── statistics/   # 数据统计
│   │   │   ├── system/       # 系统设置
│   │   │   └── login/        # 登录页
│   │   ├── router/           # 路由配置
│   │   ├── stores/           # Pinia 状态管理
│   │   ├── utils/            # 工具函数
│   │   └── styles/           # 全局样式
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # 后端项目 (Node.js)
│   ├── config/               # 配置文件
│   │   ├── mongodb.js        # MongoDB 连接
│   │   └── redis.js          # Redis 连接
│   ├── routes/               # 路由
│   │   ├── index.js          # 路由入口
│   │   ├── auth.js           # 认证路由
│   │   ├── member.js         # 会员路由
│   │   ├── product.js        # 商品路由
│   │   ├── order.js          # 订单路由
│   │   └── system.js         # 系统路由
│   ├── middlewares/          # 中间件
│   ├── models/               # 数据模型
│   ├── app.js                # 入口文件
│   ├── .env                  # 环境变量
│   └── package.json
├── nginx/                     # Nginx 配置
│   ├── nginx.conf
│   └── mime.types
├── install.bat               # 依赖安装脚本
├── start.bat                 # 服务启动脚本
└── README.md
```

---

## 环境变量配置

### 后端配置 (server/.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| MONGODB_URI | MongoDB 连接串 | - |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | Token 有效期 | 7d |

---

## 常见问题

### 1. MongoDB 连接失败
- 检查 MongoDB 服务是否启动
- 检查 `.env` 中的连接地址是否正确

### 2. Redis 连接失败
- 检查 Redis 服务是否启动
- 检查端口和密码配置

### 3. 端口被占用
- 修改 `vite.config.js` 或 `server/.env` 中的端口配置

---

## 开发说明

- 本项目仅包含基础框架，未包含具体业务逻辑
- 所有业务模块页面均为占位页面，待后续开发
- API 接口已定义基础路由，具体实现待补充
