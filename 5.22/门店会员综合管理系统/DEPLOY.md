# 部署指南

## 环境要求

- Node.js >= 16.x
- MongoDB >= 4.0
- Redis >= 6.0
- Nginx >= 1.18 (可选，用于反向代理)
- PM2 (可选，用于进程管理)

## 部署步骤

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install --production

# 安装前端依赖
cd ../client
npm install
```

### 2. 配置环境变量

#### 后端配置 (server/.env.production)

```env
PORT=3000
NODE_ENV=production

MONGODB_URI=mongodb://localhost:27017/member_management
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=member_management

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=your-production-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d
```

#### 前端配置 (client/.env.production)

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=门店会员管理系统
```

### 3. 构建前端

```bash
cd client
npm run build
```

构建产物将输出到 `client/dist` 目录。

### 4. 启动服务

#### 方式一：使用 PM2 (推荐)

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd server
pm2 start ecosystem.config.js --env production

# 查看日志
pm2 logs member-management-server

# 设置开机自启
pm2 startup
pm2 save
```

#### 方式二：直接启动

```bash
cd server
NODE_ENV=production node app.js
```

### 5. 配置 Nginx 反向代理

将 `nginx/nginx.conf` 复制到 Nginx 配置目录，修改相关路径：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

重启 Nginx：
```bash
nginx -s reload
```

## 数据导出

系统支持导出以下数据为 CSV 格式：

1. **会员数据导出**
   - 姓名、手机号、会员等级、当前积分、账户余额、注册时间、到期日期、状态

2. **积分记录导出**
   - 会员姓名、会员手机号、变动类型、变动积分、变动后余额、描述、操作人、时间

## 备份策略

### MongoDB 备份

```bash
# 备份数据库
mongodump --db member_management --out /backup/path

# 恢复数据库
mongorestore --db member_management /backup/path/member_management
```

### 定时备份 (使用 crontab)

```bash
# 每天凌晨 2 点备份
0 2 * * * /usr/bin/mongodump --db member_management --out /backup/$(date +\%Y\%m\%d)
```

## 监控

### 健康检查接口

```
GET /api/health
```

返回示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

### PM2 监控

```bash
# 查看运行状态
pm2 status

# 查看监控面板
pm2 monit

# 查看日志
pm2 logs
```

## 常见问题

### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000

# 或
netstat -tlnp | grep 3000
```

### 2. MongoDB 连接失败

- 检查 MongoDB 服务是否启动
- 检查配置文件中的连接地址
- 检查防火墙设置

### 3. 前端页面空白

- 检查 Nginx 配置中的静态文件路径
- 检查浏览器控制台是否有错误
- 确认前端构建是否成功

## 安全建议

1. 修改默认的 JWT_SECRET
2. 配置 MongoDB 认证
3. 配置 Redis 密码
4. 使用 HTTPS
5. 配置防火墙，只开放必要端口
6. 定期备份数据
