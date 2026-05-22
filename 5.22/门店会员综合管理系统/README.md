# 门店会员综合管理系统

基于 Vue3 + Node.js + MongoDB + Redis 的全栈门店会员管理系统。

## 技术栈

### 前端
- Vue 3 + Vite
- Vue Router
- Element Plus
- Pinia (状态管理)

### 后端
- Node.js + Express
- MongoDB + Mongoose
- Redis + ioredis
- JWT 认证

### 代理
- Nginx

## 项目结构

```
门店会员综合管理系统/
├── client/          # 前端项目
├── server/          # 后端项目
├── nginx/           # Nginx 配置
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 2. 配置环境变量

复制 `server/.env.example` 为 `server/.env`，修改数据库连接信息。

### 3. 启动服务

```bash
# 启动前端开发服务器 (http://localhost:5173)
cd client
npm run dev

# 启动后端服务 (http://localhost:3000)
cd ../server
npm run dev
```

### 4. 配置 Nginx

将 `nginx/nginx.conf` 配置文件复制到 Nginx 配置目录，然后重启 Nginx。

### 5. 访问应用

通过 Nginx 代理访问: http://localhost
