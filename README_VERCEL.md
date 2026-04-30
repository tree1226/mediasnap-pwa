# Vercel 部署指南

## 📦 已创建的文件

### API 路由
- `api/parse.js` - 视频解析API
- `api/download.js` - 下载扣费API
- `api/payment/create.js` - 创建支付订单
- `api/payment/[orderId].js` - 查询订单状态
- `api/payment/simulate/[orderId].js` - 模拟支付成功
- `api/payment/wechat/notify.js` - 微信支付回调
- `api/payment/alipay/notify.js` - 支付宝回调
- `api/user/balance.js` - 用户余额查询

### 配置文件
- `vercel.json` - Vercel 配置
- `.env.vercel` - 环境变量模板
- `payment.config.cjs` - 支付配置（已存在）

## 🚀 部署步骤

### 1. 准备 Vercel 账号
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login
```

### 2. 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```bash
# 微信支付
WECHAT_MCHID=你的商户号
WECHAT_APIV3_KEY=APIv3密钥
WECHAT_CERT_SERIAL_NO=证书序列号
WECHAT_APPID=应用ID
WECHAT_PRIVATE_KEY=商户私钥内容（完整PEM格式）

# 支付宝
ALIPAY_APPID=应用ID
ALIPAY_PRIVATE_KEY=应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
```

### 3. 部署到 Vercel
```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

### 4. 配置支付回调地址
部署后，Vercel 会提供域名，如：
`https://your-app.vercel.app`

在支付平台配置回调地址：
- 微信支付：`https://your-app.vercel.app/api/payment/wechat/notify`
- 支付宝：`https://your-app.vercel.app/api/payment/alipay/notify`

## 🔄 数据存储说明

### 当前状态
- 使用内存存储（`let mockOrders = {}`）
- Serverless Functions 重启后数据会丢失

### 生产环境建议
对于真实业务，建议使用以下方案：

#### 方案1：Vercel KV
```javascript
// api/utils/storage.js
import { createClient } from '@vercel/kv';

const kv = createClient();

// 存储订单
await kv.set(`order:${orderId}`, JSON.stringify(order));

// 读取订单
const order = await kv.get(`order:${orderId}`);
```

#### 方案2：外部数据库
- MongoDB Atlas（免费层）
- PostgreSQL（Supabase/PlanetScale）
- Redis（Upstash）

#### 方案3：Vercel Edge Config（适合配置数据）
```javascript
// api/utils/config.js
import { get } from '@vercel/edge-config';

const config = await get('orders');
```

## 🌐 API 端点

部署后的 API 地址：

| 功能 | 端点 | 方法 |
|------|--------|------|
| 视频解析 | `/api/parse` | POST |
| 下载扣费 | `/api/download` | POST |
| 创建订单 | `/api/payment/create` | POST |
| 查询订单 | `/api/payment/:orderId` | GET |
| 模拟支付 | `/api/payment/simulate/:orderId` | POST |
| 微信回调 | `/api/payment/wechat/notify` | POST |
| 支付宝回调 | `/api/payment/alipay/notify` | POST |
| 用户余额 | `/api/user/balance?userToken=xxx` | GET |

## ⚙️ 前端配置更新

### 修改 API 基础地址
在 `src/App.vue` 中，将所有 API 调用从 `localhost:3000` 改为 Vercel 域名：

```javascript
// 开发环境
const API_BASE = 'http://localhost:3000';

// 生产环境
const API_BASE = ''; // 相对路径，自动使用同域名

// 或者明确指定
const API_BASE = 'https://your-app.vercel.app';
```

### 建议的环境变量管理
```javascript
// src/config.js
const config = {
  apiBase: import.meta.env.VITE_API_BASE || '',
  // ... 其他配置
};

export default config;
```

## 📱 测试流程

### 1. 本地测试
```bash
# 启动前端
pnpm dev

# 启动 Vercel 本地开发环境
vercel dev
```

### 2. 部署后测试
```bash
# 访问部署的站点
curl https://your-app.vercel.app/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","platform":"douyin"}'
```

## 🔧 故障排除

### 常见问题

1. **CORS 错误**
   - 已在 `vercel.json` 中配置全局 CORS
   - 检查浏览器控制台是否有额外请求头需求

2. **数据丢失**
   - Serverless Functions 是无状态的
   - 使用 Vercel KV 或外部数据库持久化

3. **支付回调超时**
   - Vercel Serverless Functions 最大执行时间 10 秒
   - 支付回调处理逻辑需要高效

4. **环境变量未生效**
   - 在 Vercel 控制台检查环境变量设置
   - 重新部署项目使环境变量生效

5. **证书文件问题**
   - 将证书内容存储为环境变量
   - 或使用 Vercel CLI 上传文件

## 📊 监控和日志

### Vercel 日志
```bash
# 查看函数日志
vercel logs

# 实时日志
vercel logs --follow
```

### 自定义日志
在 API 函数中添加：
```javascript
console.log(`[${req.method}] ${req.url}`, {
  timestamp: new Date().toISOString(),
  // 其他业务数据
});
```

## 🔐 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码密钥
   - 使用 Vercel 环境变量存储敏感信息

2. **支付安全**
   - 验证回调签名（生产环境必须）
   - 使用 HTTPS
   - 防止重复支付

3. **API 安全**
   - 添加用户认证中间件
   - 限流保护
   - 输入验证和清理

## 🚀 性能优化

1. **缓存策略**
   - 对静态资源启用长期缓存
   - API 响应添加适当的缓存头

2. **CDN 优化**
   - Vercel 自动提供全球 CDN
   - 利用边缘缓存提升性能

3. **函数优化**
   - 减少冷启动时间
   - 使用轻量级依赖
   - 异步处理耗时操作

## 📞 支持和文档

- Vercel 文档：https://vercel.com/docs
- Serverless Functions：https://vercel.com/docs/functions
- 环境变量：https://vercel.com/docs/projects/environment-variables
