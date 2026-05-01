# 《经典常谈》伴学平台 - 启动指南

> 本文档说明如何在服务器上启动前后端服务。

## 环境概况

当前服务器已安装的基础服务：
- **MySQL**: Docker 容器运行中 (端口 3306, 数据库 `classics_learning`)
- **Nginx**: 系统服务运行中 (端口 80)
- **Python**: 3.8.10 (后端 venv 已配置)
- **Node.js**: v20.x (通过 nvm 管理)

## 快速启动

### 1. 启动后端

```bash
cd /root/classical_learning/project/backend
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > backend.log 2>&1 &
```

验证后端是否启动成功：
```bash
curl http://localhost:8000/health
# 应返回: {"status":"ok","message":"经典常谈伴学平台运行正常"}

curl http://localhost:8000/docs
# 应显示 FastAPI 自动生成的 API 文档页面
```

查看后端日志：
```bash
tail -f /root/classical_learning/project/backend/backend.log
```

### 2. 构建并部署前端

```bash
cd /root/classical_learning/project/frontend
npm install
npm run build
```

构建完成后，将产物复制到 Nginx 目录：
```bash
sudo mkdir -p /var/www/classics-learning/frontend/dist
sudo cp -r dist/* /var/www/classics-learning/frontend/dist/
sudo chown -R www-data:www-data /var/www/classics-learning/frontend/dist
```

重载 Nginx：
```bash
sudo nginx -t && sudo systemctl reload nginx
```

验证前端：
```bash
curl -I http://localhost/
# 应返回 HTTP/1.1 200 OK
```

## 完整启动流程（从零开始）

如果服务器刚重置或首次部署，按以下顺序操作：

### 前置条件检查

```bash
# 检查 MySQL 是否运行
docker ps | grep mysql

# 检查 Nginx 是否运行
systemctl status nginx

# 检查 Python venv
cd /root/classical_learning/project/backend
source venv/bin/activate
pip list | grep fastapi

# 检查 Node.js
node --version
```

### 配置环境变量

后端 `.env` (已配置，无需修改)：
```bash
# 文件位置: /root/classical_learning/project/backend/.env
DATABASE_URL=mysql+pymysql://root:REDACTED@localhost:3306/classics_learning?charset=utf8mb4
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=production
```

前端 `.env` (已配置，无需修改)：
```bash
# 文件位置: /root/classical_learning/project/frontend/.env
VITE_API_BASE_URL=/api
```

### 启动后端

```bash
cd /root/classical_learning/project/backend
source venv/bin/activate

# 前台启动（调试用）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# 或后台启动（生产用）
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > backend.log 2>&1 &
```

### 构建前端

```bash
cd /root/classical_learning/project/frontend
npm install
npm run build

# 部署到 Nginx
sudo mkdir -p /var/www/classics-learning/frontend/dist
sudo cp -r dist/* /var/www/classics-learning/frontend/dist/
sudo chown -R www-data:www-data /var/www/classics-learning/frontend/dist
sudo nginx -t && sudo systemctl reload nginx
```

## 日常运维

### 重启后端

```bash
# 停止旧进程
pkill -f "uvicorn app.main:app"

# 启动新进程
cd /root/classical_learning/project/backend
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > backend.log 2>&1 &
```

### 更新前端

```bash
cd /root/classical_learning/project/frontend
npm run build
sudo rm -rf /var/www/classics-learning/frontend/dist/*
sudo cp -r dist/* /var/www/classics-learning/frontend/dist/
sudo nginx -t && sudo systemctl reload nginx
```

### 更新后端依赖

```bash
cd /root/classical_learning/project/backend
source venv/bin/activate
pip install -r requirements.txt
# 然后重启后端
```

### 查看服务状态

```bash
# 检查后端进程
ps aux | grep uvicorn

# 检查后端健康
curl http://localhost:8000/health

# 检查前端
curl -I http://localhost/

# 检查 Nginx
systemctl status nginx

# 查看后端日志
tail -100 /root/classical_learning/project/backend/backend.log
```

## Nginx 配置说明

配置文件: `/etc/nginx/sites-available/classics-learning` (或 `/etc/nginx/conf.d/`)

关键配置：
- `/` → 前端静态文件 (`/var/www/classics-learning/frontend/dist`)
- `/api` → 反向代理到 `http://localhost:8000` (后端)

修改 Nginx 配置后记得测试并重载：
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 故障排查

### 后端启动失败

1. 检查端口是否被占用: `lsof -i :8000`
2. 检查数据库连接: `mysql -h 127.0.0.1 -P 3306 -u root -pREDACTED -e "SELECT 1"`
3. 查看日志: `tail -50 backend.log`
4. 检查 venv 依赖: `source venv/bin/activate && pip list`

### 前端 404 或白屏

1. 检查构建产物是否存在: `ls -la /var/www/classics-learning/frontend/dist/`
2. 检查 Nginx 配置中的 root 路径是否正确
3. 查看 Nginx 错误日志: `tail -50 /var/log/nginx/error.log`
4. 检查浏览器控制台网络请求

### API 请求 502 Bad Gateway

1. 后端未启动: 按上方步骤启动后端
2. 后端端口不匹配: 确认 Nginx proxy_pass 指向 `localhost:8000`
3. 后端崩溃: 查看后端日志 `backend.log`

### 数据库连接失败

1. 检查 MySQL 容器: `docker ps | grep mysql`
2. 检查 `.env` 中的数据库密码是否正确
3. 测试连接: `mysql -h 127.0.0.1 -P 3306 -u root -pREDACTED`

## 注意事项

- 后端使用 `0.0.0.0` 而非 `127.0.0.1` 绑定，以便 Nginx 反向代理访问
- 前端构建后必须手动复制到 Nginx 目录，Vite 不会自动部署
- `.env` 文件包含数据库密码等敏感信息，不要提交到 Git
- OSS 功能当前未配置（已注释），文件上传使用本地存储
- 后端 venv 路径: `/root/classical_learning/project/backend/venv`
