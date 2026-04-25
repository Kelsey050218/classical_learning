# 《经典常谈》伴学平台 - 部署指南

## 系统要求

### 服务器配置
- **操作系统**: Ubuntu 22.04 LTS
- **内存**: 至少 2GB RAM
- **磁盘**: 至少 20GB 可用空间

### 软件依赖
- **MySQL**: 8.0+
- **Nginx**: 1.18+
- **Node.js**: 18.x+
- **Python**: 3.10+
- **Git**: 2.x+

## 安装步骤

### 1. 系统更新与基础安装

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git nginx

# 安装 Python 3.10 和 pip
sudo apt install -y python3.10 python3.10-venv python3-pip

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
python3 --version  # Python 3.10.x
node --version     # v18.x.x
npm --version      # 9.x.x
```

### 2. MySQL 安装与配置

```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p
```

在 MySQL 中执行:
```sql
CREATE DATABASE classics_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'classics_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON classics_learning.* TO 'classics_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 项目部署

```bash
# 创建项目目录
sudo mkdir -p /var/www/classics-learning
sudo chown -R $USER:$USER /var/www/classics-learning

# 克隆代码
cd /var/www/classics-learning
git clone https://github.com/your-username/classics-learning.git .

# 复制环境变量文件
cd project/backend
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他参数
nano .env

cd ../frontend
cp .env.example .env
```

### 4. 后端环境配置

编辑 `backend/.env`:

```env
# Database
DATABASE_URL=mysql+pymysql://classics_user:YOUR_PASSWORD@localhost:3306/classics_learning?charset=utf8mb4

# Security
SECRET_KEY=$(openssl rand -hex 32)

# Frontend URL (for CORS)
FRONTEND_URL=http://your-domain.com

# Aliyun OSS
OSS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
OSS_ACCESS_KEY_SECRET=YOUR_ACCESS_KEY_SECRET
OSS_BUCKET_NAME=your-bucket-name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# Environment
ENVIRONMENT=production
```

```bash
# 创建虚拟环境并安装依赖
cd /var/www/classics-learning/project/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head

deactivate
```

### 5. 前端构建

```bash
cd /var/www/classics-learning/project/frontend
npm install
npm run build
```

### 6. Nginx 配置

```bash
# 复制 Nginx 配置
sudo cp /var/www/classics-learning/project/nginx.conf /etc/nginx/sites-available/classics-learning

# 启用站点
sudo ln -sf /etc/nginx/sites-available/classics-learning /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. Systemd 服务配置

```bash
# 复制服务文件
sudo cp /var/www/classics-learning/project/classics-backend.service /etc/systemd/system/

# 重新加载 systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable classics-backend

# 启动服务
sudo systemctl start classics-backend

# 查看状态
sudo systemctl status classics-backend
```

### 8. 目录权限设置

```bash
# 创建前端部署目录
sudo mkdir -p /var/www/classics-learning/frontend/dist

# 复制前端构建文件
sudo cp -r /var/www/classics-learning/project/frontend/dist/* /var/www/classics-learning/frontend/dist/

# 设置权限
sudo chown -R www-data:www-data /var/www/classics-learning/frontend/dist
sudo chmod -R 755 /var/www/classics-learning/frontend/dist
```

## SSL 证书配置 (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

申请证书后，Certbot 会自动修改 Nginx 配置添加 HTTPS 支持。

## 自动部署

使用提供的部署脚本:

```bash
cd /var/www/classics-learning/project
./deploy.sh
```

## 常用命令

### 服务管理

```bash
# 后端服务
sudo systemctl start classics-backend
sudo systemctl stop classics-backend
sudo systemctl restart classics-backend
sudo systemctl status classics-backend

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# MySQL
sudo systemctl start mysql
sudo systemctl stop mysql
sudo systemctl restart mysql
```

### 日志查看

```bash
# 后端日志
sudo journalctl -u classics-backend -f

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 故障排查

### 后端无法启动

1. 检查环境变量配置
2. 检查数据库连接
3. 查看 systemd 日志: `sudo journalctl -u classics-backend -n 100`

### 前端无法访问

1. 检查 Nginx 配置: `sudo nginx -t`
2. 检查前端文件是否存在: `ls -la /var/www/classics-learning/frontend/dist`
3. 查看 Nginx 错误日志

### 数据库连接失败

1. 确认 MySQL 服务运行: `sudo systemctl status mysql`
2. 检查数据库用户权限
3. 验证数据库 URL 格式

## 安全建议

1. **定期更新系统**: `sudo apt update && sudo apt upgrade`
2. **配置防火墙**:
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```
3. **定期备份数据库**
4. **使用强密码**
5. **配置 fail2ban 防止暴力破解**

## 更新部署

要更新代码并重新部署:

```bash
cd /var/www/classics-learning/project
./deploy.sh
```

此脚本会自动:
1. 拉取最新代码
2. 更新后端依赖
3. 运行数据库迁移
4. 重启后端服务
5. 构建前端
6. 更新 Nginx 静态文件
7. 重载 Nginx

## 联系支持

如有问题，请联系开发团队。
