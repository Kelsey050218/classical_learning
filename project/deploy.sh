#!/bin/bash
set -e

echo "🚀 开始部署《经典常谈》伴学平台..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
DEPLOY_DIR="/var/www/classics-learning/frontend/dist"

# Backend deployment
echo "⚙️ 部署后端..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install -r requirements.txt

# 重启后端
echo "🔄 重启后端服务..."
pkill -f "uvicorn app.main:app" || true
sleep 2
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > backend.log 2>&1 &
sleep 3

# 验证后端
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端启动成功"
else
    echo "❌ 后端启动失败，查看日志:"
    tail -20 backend.log
    exit 1
fi
deactivate

# Frontend deployment
echo "🎨 构建前端..."
cd "$FRONTEND_DIR"
npm install
npm run build

# Copy to nginx directory
echo "📂 部署静态文件..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "$DEPLOY_DIR"/*
sudo cp -r dist/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

# Reload nginx
echo "🔄 重载Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "✅ 部署完成！"
echo "🌐 前端: http://localhost/"
echo "🔧 后端: http://localhost:8000/docs"
echo "📊 健康检查: http://localhost:8000/health"
