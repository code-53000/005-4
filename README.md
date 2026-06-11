# 🚂 火车旅行记录应用

专为火车迷设计的个人火车旅行记录工具，用于记录和管理每次乘坐火车的经历。

## ✨ 功能特性

- 🔐 **登录认证**：固定账号密码登录，JWT 认证机制
- 📋 **记录列表**：按日期倒序展示所有旅行记录
- 🔍 **搜索筛选**：支持按车次号和日期范围筛选记录
- 📝 **记录管理**：新增、编辑、删除旅行记录
- 🖼️ **图片上传**：支持上传多张旅行照片（JPG/PNG/WEBP）
- 📱 **响应式设计**：适配桌面端和移动端
- 🐳 **Docker 部署**：支持 docker-compose 一键启动

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Router
- **后端**：Express 4 + TypeScript + JWT + Multer
- **数据库**：SQLite (better-sqlite3)
- **容器化**：Docker + docker-compose

## 📁 项目结构

```
.
├── src/                    # 前端代码
│   ├── components/         # 公共组件
│   ├── pages/              # 页面组件
│   ├── stores/             # Zustand 状态管理
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 路由配置
│   └── main.tsx            # 入口文件
├── api/                    # 后端代码
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中间件
│   │   ├── db/             # 数据库操作
│   │   └── index.ts        # 服务入口
│   └── uploads/            # 图片上传目录
├── data/                   # SQLite 数据库目录
├── shared/                 # 前后端共享类型
├── Dockerfile              # Docker 镜像构建
├── docker-compose.yml      # docker-compose 配置
└── .env                    # 环境变量
```

## 🚀 快速开始

### 方式一：Docker 一键启动（推荐）

```bash
# 构建并启动
docker-compose up -d --build

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 方式二：本地开发

```bash
# 安装依赖
npm install

# 启动开发环境（前端 + 后端同时启动）
npm run dev

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

### 方式三：生产构建

```bash
# 构建前端
npm run build

# 启动生产服务
NODE_ENV=production node --import tsx api/src/index.ts
```

## 🔑 默认账号

- **用户名**：`trainfan`
- **密码**：`train123456`

> 💡 可通过修改 `.env` 文件或 docker-compose 环境变量自定义账号密码。

## 📝 记录字段说明

每条旅行记录包含以下字段：

| 字段 | 说明 | 类型 |
|------|------|------|
| 车次号 | 如 G1234、D6789 | 字符串 |
| 列车型号 | 复兴号/和谐号/绿皮车/其他 | 枚举 |
| 出发站 | 出发车站名称 | 字符串 |
| 到达站 | 到达车站名称 | 字符串 |
| 日期 | 乘车日期 | 日期 |
| 计划出发时间 | 发车时间 | 时间 |
| 实际到达时间 | 到站时间 | 时间 |
| 是否晚点 | 列车是否晚点 | 布尔值 |
| 晚点分钟数 | 晚点时长 | 数字 |
| 座位类型 | 一等座/二等座/硬卧/软卧/硬座/其他 | 枚举 |
| 票价 | 车票价格 | 数字 |
| 照片 | 旅行照片（多张） | 图片文件 |
| 心得文字 | 旅行感受和见闻 | 文本 |

## 🔌 API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录获取 token | 否 |
| GET | `/api/records` | 获取记录列表 | 是 |
| GET | `/api/records/:id` | 获取单条记录详情 | 是 |
| POST | `/api/records` | 新增记录 | 是 |
| PUT | `/api/records/:id` | 更新记录 | 是 |
| DELETE | `/api/records/:id` | 删除记录 | 是 |

### 列表筛选参数

- `trainNumber`：车次号模糊搜索
- `dateFrom`：开始日期（YYYY-MM-DD）
- `dateTo`：结束日期（YYYY-MM-DD）

## 📦 数据持久化

以下目录会通过 docker volume 持久化：

- `./data`：SQLite 数据库文件
- `./api/uploads`：上传的图片文件

## 🔧 环境变量

可在 `.env` 或 `docker-compose.yml` 中配置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3001 | 服务端口 |
| `JWT_SECRET` | trainfan-secret-key-2024 | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 7d | Token 有效期 |
| `USERNAME` | trainfan | 登录用户名 |
| `PASSWORD` | train123456 | 登录密码 |
| `DB_PATH` | ./data/train_records.db | 数据库路径 |
| `UPLOAD_DIR` | ./api/uploads | 图片上传目录 |

## 🎨 设计风格

- **主色调**：深绿色系，象征铁路和旅行
- **辅助色**：暖橙色，点缀按钮和重要信息
- **字体**：Noto Serif SC（标题）+ Noto Sans SC（正文）
- **风格**：复古旅行日志风格，卡片式布局

## 📄 License

MIT
