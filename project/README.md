# 《经典常谈》伴学平台

> 基于朱自清《经典常谈》的中学经典文化数字化学习平台，融合阅读、批注、闯关、创作、展览于一体。

## 项目简介

本项目是一个面向中学生的经典文化学习平台，以朱自清先生《经典常谈》为核心文本，通过数字化手段帮助学生深入理解中国古代经典。平台采用"阅读—批注—闯关—创作—展览"的完整学习闭环设计，支持智能 AI 辅助、在线协作和作品展示。

## 技术栈

### 后端
- **FastAPI** — Python 高性能异步 Web 框架
- **SQLAlchemy** — ORM 数据库操作
- **MySQL** — 主数据库（支持 utf8mb4）
- **JWT** — 用户认证与授权
- **Alembic** — 数据库迁移管理
- **阿里云 OSS** — 音频/图片资源存储

### 前端
- **React 18** — UI 框架
- **TypeScript** — 类型安全
- **Vite** — 构建工具
- **Tailwind CSS** — 原子化 CSS
- **Ant Design 5** — 组件库
- **Zustand** — 状态管理
- **React Router v6** — 路由管理

### AI 能力
- **豆包大模型（Volcano Engine）** — AI 学习助手、短视频脚本生成
- **SSE 流式输出** — 实时 AI 对话体验

## 核心功能

### 阅读专项
- **名著阅读** — 权威全文阅读，支持字体/间距/夜间模式调节
- **智能注解** — 点击术语弹出双层注解（原文 + 释义）
- **三种批注法** — 知识锚点式、古今勾连式、质疑思辨式
- **书签 / 高亮 / 金句摘抄** — 个性化阅读标记，支持在正文内联渲染
- **阅读进度自动保存** — 每 30 秒自动保存，下次跳转至上次位置
- **章节解锁** — 完成本章 + 闯关通过后解锁下一章
- **在线笔记** — 关联原文跳转，支持分类/标签/搜索
- **读书卡** — 12 种模板，结构化记录阅读心得

### 学习中心（项目制学习）
- **项目一：典籍时间轴** — 横向书卷式时间轴，梳理典籍脉络
- **项目二：经典思想论坛** — 议题辩论、立场选择、留言投票、互评量表
- **项目三：AI 短视频脚本** — 选择章节生成专业分镜头脚本，可编辑保存

### 闯关与激励
- **基础知识闯关** — 每章读完解锁，选择/判断题自动判分
- **错题本** — 自动汇总错题，支持复习
- **阅读打卡** — 每日完成可打卡，连续打卡解锁勋章
- **勋章系统** — 阅读之星、创作之星、朗诵之星等多维度成就
- **成就展厅** — 展示学生优秀作品（脚本、朗诵、视频）

### 个人中心
- **学习数据看板** — 阅读时长、打卡天数、闯关通过率
- **我的作品** — 管理个人创作，支持发布到展厅
- **我的批注 / 金句 / 笔记** — 统一查看个人学习痕迹
- **量表评价** — 项目完成后填写评价量表，记录学习反思

### 智能助手
- **AI 学习助手（豆包）** — 流式对话，随时解答经典相关问题
- **AI 短视频脚本生成** — 输入章节 + 场景 + 风格，自动生成专业分镜

## 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### 1. 克隆项目

```bash
git clone git@github.com:Kelsey050218/classical_learning.git
cd classical_learning
```

### 2. 后端启动

```bash
cd project/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，配置数据库连接等参数

# 数据库迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

后端服务默认运行在 `http://localhost:8001`

### 3. 前端启动

```bash
cd project/frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端服务默认运行在 `http://localhost:5173`

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 项目结构

```
classical_learning/
├── project/
│   ├── backend/              # FastAPI 后端
│   │   ├── app/
│   │   │   ├── main.py       # 应用入口
│   │   │   ├── routers/      # API 路由
│   │   │   ├── models/       # 数据库模型
│   │   │   ├── schemas/      # Pydantic 模型
│   │   │   └── services/     # 业务逻辑
│   │   ├── migrations/       # Alembic 迁移
│   │   └── requirements.txt
│   ├── frontend/             # React 前端
│   │   ├── src/
│   │   │   ├── pages/        # 页面组件
│   │   │   ├── components/   # 通用组件
│   │   │   ├── api/          # API 封装
│   │   │   └── stores/       # 状态管理
│   │   └── package.json
│   ├── docs/                 # 文档
│   ├── nginx.conf            # Nginx 配置
│   └── docker-compose.yml    # Docker 编排
├── DEPLOY.md                 # 部署指南
└── README.md                 # 项目说明
```

## 部署

详细部署步骤请参考 [DEPLOY.md](./DEPLOY.md)，包含：
- Ubuntu 服务器环境配置
- MySQL / Nginx 安装
- SSL 证书配置（Let's Encrypt）
- Systemd 服务管理
- 自动化部署脚本

## 环境变量说明

### 后端 `.env`

```env
# 数据库
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/classics_learning?charset=utf8mb4

# 安全
SECRET_KEY=your-secret-key-here

# 前端地址（CORS）
FRONTEND_URL=http://localhost:5173

# 阿里云 OSS
OSS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
OSS_ACCESS_KEY_SECRET=YOUR_ACCESS_KEY_SECRET
OSS_BUCKET_NAME=your-bucket-name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 环境
ENVIRONMENT=production
```

### 前端 `.env`

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

## 主要模块路由

| 模块 | 前端路径 | 后端前缀 |
|------|----------|----------|
| 用户认证 | `/login`, `/register` | `/api/auth` |
| 名著阅读 | `/reading/:chapterId` | `/api/reading` |
| 学习中心 | `/learning` | `/api/learning` |
| 典籍时间轴 | `/timeline` | `/api/timeline` |
| 经典思想论坛 | `/forum/:topicId` | `/api/forum` |
| AI 短视频脚本 | `/ai-script` | `/api/ai-script` |
| 成就展厅 | `/exhibition` | `/api/works` |
| 个人中心 | `/profile` | `/api/users` |
| AI 学习助手 | 悬浮窗组件 | `/api/ai-chat` |

## 批注方法指津

平台内置三种结构化批注方法，引导学生深度阅读：

1. **知识锚点式批注法** — 圈画核心概念、关键史实、核心观点，旁注释义 + 尾注框架
2. **古今勾连式批注法** — 标记可对接现实的句子，建立经典原意与当下映射的双向勾连
3. **质疑思辨式批注法** — 锁定争议内容，分层记录原文观点、个人疑问、验证方向

## 开源协议

MIT License

## 联系我们

如有问题或建议，欢迎提交 Issue 或联系开发团队。
