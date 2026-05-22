# 企业月度营收数据分析平台

基于 Python 3.10 + Flask + Pandas + ECharts + MySQL 的企业营收数据分析平台。

## 技术栈

- **后端**: Python 3.10, Flask 2.3.3, SQLAlchemy 2.0.23
- **数据分析**: Pandas 2.1.4, NumPy 1.26.2
- **前端**: ECharts 5.4.3, HTML5, CSS3
- **数据库**: MySQL 5.7+
- **跨域**: Flask-Cors 4.0.0

## 项目结构

```
企业月度营收数据分析平台/
├── app/                           # 应用主目录
│   ├── __init__.py               # Flask 应用工厂
│   ├── routes.py                 # 页面路由
│   ├── api/                      # API 接口
│   │   ├── __init__.py
│   │   ├── dashboard.py          # 仪表盘接口
│   │   └── revenue.py            # 营收数据接口
│   ├── models/                   # 数据模型
│   │   ├── __init__.py
│   │   └── revenue.py            # 营收数据模型
│   └── utils/                    # 工具函数
│       ├── __init__.py
│       └── response.py           # 统一响应格式
├── config/                        # 配置目录
│   └── config.py                 # 应用配置
├── static/                        # 静态资源
│   ├── css/
│   │   └── style.css             # 样式文件
│   └── js/
│       └── dashboard.js          # 仪表盘脚本
├── templates/                     # 模板目录
│   └── index.html                # 首页模板
├── sql/                           # SQL 脚本
│   └── init.sql                  # 数据库初始化脚本
├── run.py                         # 应用入口
├── requirements.txt               # 依赖包
├── .env.example                   # 环境变量示例
└── .gitignore                     # Git 忽略文件
```

## 快速开始

### 1. 环境要求

- Python 3.10+
- MySQL 5.7+

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=revenue_analysis
```

### 4. 创建数据库

```bash
# 方法一：使用 SQL 脚本
mysql -u root -p < sql/init.sql

# 方法二：使用 Flask CLI
flask init-db
```

### 5. 启动服务

```bash
python run.py
```

服务启动后访问：http://localhost:5000

## API 接口

### 仪表盘接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/summary` | 获取汇总数据 |
| GET | `/api/dashboard/trend` | 获取月度营收趋势 |
| GET | `/api/dashboard/department` | 获取部门营收分布 |
| GET | `/api/dashboard/region` | 获取地区营收分布 |

### 营收数据接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/revenue` | 获取营收数据列表（分页） |
| GET | `/api/revenue/<id>` | 获取营收数据详情 |
| POST | `/api/revenue` | 创建营收数据 |
| PUT | `/api/revenue/<id>` | 更新营收数据 |
| DELETE | `/api/revenue/<id>` | 删除营收数据 |

## 数据库表结构

### revenue_data 营收数据表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键ID |
| company_name | VARCHAR(100) | 公司名称 |
| department | VARCHAR(50) | 部门 |
| business_type | VARCHAR(50) | 业务类型 |
| revenue_amount | DECIMAL(15,2) | 营收金额 |
| revenue_date | DATE | 营收日期 |
| year | INT | 年份 |
| month | INT | 月份 |
| region | VARCHAR(50) | 地区 |
| customer_type | VARCHAR(50) | 客户类型 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 开发说明

- 统计分析逻辑待编写，当前接口返回空数据框架
- 前端页面已集成 ECharts 图表组件，包括折线图、柱状图、饼图
- 支持按年份、月份筛选数据
- 响应式设计，适配桌面端和移动端
