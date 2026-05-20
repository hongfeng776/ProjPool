# 门店销售数据分析系统

一个完整的门店销售数据分析平台，支持数据导入、多维度分析、报表生成和用户管理。

## 功能特性

### 📊 数据仪表盘
- 实时销售数据概览
- 可视化图表展示
- 关键指标统计卡片

### 📈 销售报表
- 日报/周报/月报查看
- 多维度筛选（门店、品类、支付方式等）
- 销售趋势图和数据表格
- Excel导出功能

### 🏆 商品销量排行
- 商品销量排名统计
- 品类/门店/支付方式筛选
- 销售占比可视化
- 导出功能

### 📑 分析报告
- 自动生成销售分析报告
- 核心指标汇总
- 门店销售排行
- 品类销售分布
- 热销商品TOP10
- 智能分析建议

### 👥 用户管理
- 管理员/普通用户角色权限控制
- 用户创建、编辑、删除
- JWT认证登录

### 📂 数据导入
- Excel/CSV文件批量导入
- 导入历史记录
- 数据自动解析

## 技术栈

### 后端
- Node.js + Express
- SQLite3 数据库
- Multer 文件上传
- xlsx Excel处理
- jsonwebtoken 认证
- bcryptjs 密码加密

### 前端
- Vue 3 + Vite
- Pinia 状态管理
- Vue Router 路由
- Element Plus UI框架
- ECharts 图表库
- Axios HTTP客户端

## 快速开始

### 后端启动

```bash
cd backend
npm install
npm start
```

后端服务运行在 `http://localhost:3000`

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   │   └── database.js     # 数据库初始化
│   ├── routes/             # 路由文件
│   │   ├── auth.js         # 认证接口
│   │   ├── dashboard.js    # 仪表盘/报表/导出接口
│   │   ├── sales.js        # 销售数据接口
│   │   ├── upload.js       # 文件上传接口
│   │   └── users.js        # 用户管理接口
│   ├── server.js           # 服务入口
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── stores/         # Pinia状态管理
│   │   ├── router/         # 路由配置
│   │   ├── api/            # API接口
│   │   ├── views/          # 页面组件
│   │   ├── layout/         # 布局组件
│   │   └── main.js         # 入口文件
│   └── package.json
└── README.md
```

## API接口说明

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/change-password` - 修改密码

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 报告接口
- `POST /api/reports/generate` - 生成分析报告
- `GET /api/reports` - 获取报告列表
- `GET /api/reports/:id` - 获取报告详情
- `GET /api/reports/:id/export` - 导出报告
- `DELETE /api/reports/:id` - 删除报告

### 数据导出
- `POST /api/dashboard/export/sales-report` - 导出销售报表
- `GET /api/dashboard/export/sales-data` - 导出销售数据

## 使用说明

1. **登录系统** - 使用默认管理员账号或自定义账号登录
2. **导入数据** - 进入"数据导入"页面，上传Excel/CSV格式的销售数据
3. **查看仪表盘** - 查看整体销售概况和关键指标
4. **查看报表** - 进入"销售报表"查看日/周/月销售数据
5. **商品排行** - 查看商品销量排名和占比
6. **生成报告** - 进入"分析报告"生成完整分析报告并导出
7. **用户管理** - 管理员可在"用户管理"中管理系统用户

## 数据格式

导入文件需包含以下列：
- 销售日期
- 门店名称
- 商品名称
- 品类
- 数量
- 单价
- 总金额
- 客户类型（可选）
- 支付方式（可选）

## 许可证

MIT
