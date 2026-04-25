#!/bin/bash
set -e

echo "🚀 开始部署《经典常谈》伴学平台..."

# Update code
echo "📥 更新代码..."
cd /var/www/classics-learning
git pull origin main

# Backend deployment
echo "⚙️ 部署后端..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
deactivate

# Restart backend service
echo "🔄 重启后端服务..."
sudo systemctl restart classics-backend

# Frontend deployment
echo "🎨 构建前端..."
cd ../frontend
npm install
npm run build

# Copy to nginx directory
echo "📂 复制静态文件..."
sudo rm -rf /var/www/classics-learning/frontend/dist
sudo mkdir -p /var/www/classics-learning/frontend/dist
sudo cp -r dist/* /var/www/classics-learning/frontend/dist/
sudo chown -R www-data:www-data /var/www/classics-learning/frontend/dist

# Reload nginx
echo "🔄 重载Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "✅ 部署完成！"
echo "🌐 访问地址: http://your-domain.com"
