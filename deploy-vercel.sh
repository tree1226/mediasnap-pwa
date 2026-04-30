#!/bin/bash

# MediaSnap PWA - Vercel 部署脚本
# 使用方法: ./deploy-vercel.sh

echo "🚀 开始部署 MediaSnap PWA 到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否登录
echo "📋 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

# 检查环境变量
echo "⚙️  检查环境变量配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "💡 请创建 .env 文件并配置环境变量"
else
    echo "✅ .env 文件存在"
fi

# 构建项目
echo "🔨 构建项目..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
read -p "是否部署到生产环境？(y/N): " production

if [ "$production" = "y" ] || [ "$production" = "Y" ]; then
    echo "🌍 部署到生产环境..."
    vercel --prod
else
    echo "🧪 部署到预览环境..."
    vercel
fi

echo "🎉 部署完成！"
echo "📱 请访问 Vercel 提供的 URL 测试应用"
echo "🔧 记得在支付平台配置回调地址"