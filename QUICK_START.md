# 🚀 Vercel 部署快速开始

## 📋 部署清单

### ✅ 已完成的配置
- [x] Vercel API 路由结构 (`api/` 目录)
- [x] Serverless Functions（支付、解析、用户管理）
- [x] Vercel 配置文件 (`vercel.json`)
- [x] 环境变量模板 (`.env.vercel`)
- [x] API 配置管理 (`src/api-config.js`)
- [x] 前端 API 调用更新

### 🎯 立即部署

#### 方法1: 使用部署脚本
```bash
# 1. 安装依赖
pnpm install

# 2. 运行部署脚本
./deploy-vercel.sh
```

#### 方法2: 使用 Vercel CLI
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产环境部署
vercel --prod
```

#### 方法3: Vercel Dashboard
1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库或上传项目
3. Vercel 自动检测 Vite 项目
4. 点击 "Deploy"

## ⚙️ 环境变量配置

### 在 Vercel 项目设置中添加

#### 微信支付（可选）
```
WECHAT_MCHID=你的商户号
WECHAT_APIV3_KEY=APIv3密钥
WECHAT_CERT_SERIAL_NO=证书序列号
WECHAT_APPID=应用ID
WECHAT_PRIVATE_KEY=完整的私钥PEM内容
```

#### 支付宝（可选）
```
ALIPAY_APPID=应用ID
ALIPAY_PRIVATE_KEY=应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
```

### 添加环境变量步骤
1. 进入 Vercel 项目设置
2. 找到 "Environment Variables"
3. 点击 "Add New"
4. 添加上面的环境变量
5. 重新部署项目

## 🧪 测试部署

### 1. 基础功能测试
```bash
# 访问部署的站点
curl https://your-app.vercel.app/

# 测试视频解析API
curl https://your-app.vercel.app/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","platform":"douyin"}'
```

### 2. 支付流程测试
```bash
# 使用测试脚本
node test-api.js

# 或者手动测试：
# 1. 创建订单
curl -X POST https://your-app.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"pro_30_times","paymentType":"wechat","userToken":"test_token"}'

# 2. 模拟支付成功（获取订单ID后）
curl -X POST https://your-app.vercel.app/api/payment/simulate/ORDER_ID

# 3. 查询余额
curl "https://your-app.vercel.app/api/user/balance?userToken=test_token"
```

## 📱 前端配置

### 自动 API 地址
前端会自动检测环境：
- 开发环境：使用相对路径
- Vercel 环境：自动使用 Vercel 域名

### 手动配置（可选）
如需手动指定 API 地址：
```javascript
// .env.local 或 .env.production
VITE_API_BASE=https://your-app.vercel.app
```

## 🔧 支付回调配置

部署后，在支付平台配置回调地址：

### 微信支付
回调地址：`https://your-app.vercel.app/api/payment/wechat/notify`

### 支付宝
回调地址：`https://your-app.vercel.app/api/payment/alipay/notify`

## 📊 监控和调试

### 查看 Vercel 日志
```bash
# 实时日志
vercel logs --follow

# 历史日志
vercel logs
```

### 本地开发环境
```bash
# 启动 Vercel 本地开发环境
vercel dev

# 这样可以本地模拟 Vercel 环境
```

## ⚠️ 重要提醒

### 数据存储
- 当前使用内存存储，Serverless 重启后数据会丢失
- 生产环境建议使用 Vercel KV 或外部数据库

### 支付功能
- 当前为模拟模式，需要配置真实商户信息
- 沙箱测试后再启用真实支付

### 环境变量
- 不要在代码中硬编码密钥
- 敏感信息都存储在环境变量中

## 🎯 部署完成检查清单

部署后请确认：

- [ ] 网站可以正常访问
- [ ] 视频解析功能正常
- [ ] 支付流程可正常创建订单
- [ ] 模拟支付功能正常
- [ ] 用户余额查询正常
- [ ] 支付回调地址已配置（如使用真实支付）
- [ ] CORS 配置正常（浏览器控制台无跨域错误）
- [ ] 移动端显示正常
- [ ] PWA 功能正常（可添加到桌面）

## 📞 获取帮助

如遇到问题：
1. 查看 Vercel 日志
2. 检查 API 端点是否正常
3. 验证环境变量配置
4. 参考 `README_VERCEL.md` 详细文档

## 🚀 部署成功！

恭喜！你的 MediaSnap PWA 已部署到 Vercel。

现在可以：
- 访问 https://your-app.vercel.app
- 在手机上测试 PWA 功能
- 配置真实支付开始商业化
- 添加到主屏幕使用离线功能

祝运营顺利！💎