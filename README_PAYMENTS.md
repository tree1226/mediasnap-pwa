# 支付功能配置指南

## 当前状态
- ✅ 微信支付：模拟模式（需要配置证书）
- ✅ 支付宝：模拟模式（需要配置密钥）
- ✅ 数据存储：localStorage
- ✅ 支付流程：完整测试通过

## 测试支付

### 启动服务
```bash
# 1. 启动后端服务器
node mock_server.cjs

# 2. 启动前端开发服务器
pnpm dev
```

### 测试流程
1. 访问 http://localhost:5173/
2. 点击"充值次数"按钮
3. 选择支付方式（微信/支付宝）
4. 选择套餐（30次/无限次年费）
5. 系统自动完成模拟支付
6. 余额立即更新，localStorage持久化

## 配置真实支付

### 微信支付配置
1. **申请商户号**
   - 访问 https://pay.weixin.qq.com/
   - 完成商户资质认证

2. **下载证书**
   - 登录商户平台 → 账户中心 → API安全
   - 下载商户证书到 `certs/` 目录

3. **配置 .env 文件**
   ```env
   WECHAT_MCHID=你的商户号
   WECHAT_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
   WECHAT_CERT_SERIAL_NO=证书序列号
   WECHAT_APIV3_KEY=APIv3密钥
   WECHAT_APPID=应用ID
   WECHAT_NOTIFY_URL=https://你的域名/api/payment/wechat/notify
   ```

### 支付宝配置
1. **申请应用**
   - 访问 https://open.alipay.com/
   - 创建应用并签约手机网站支付

2. **获取密钥**
   - 生成RSA密钥对
   - 配置到支付宝开放平台

3. **配置 .env 文件**
   ```env
   ALIPAY_APPID=应用ID
   ALIPAY_PRIVATE_KEY=应用私钥
   ALIPAY_PUBLIC_KEY=支付宝公钥
   ALIPAY_NOTIFY_URL=https://你的域名/api/payment/alipay/notify
   ```

## 注意事项

### 回调地址要求
- 生产环境必须使用HTTPS
- 域名需要在支付平台配置白名单
- 回调地址必须能被公网访问

### 证书安全
- 微信证书文件切勿上传到代码仓库
- 商户私钥要妥善保管
- 建议使用环境变量存储敏感信息

### 测试建议
- 先在沙箱环境测试支付流程
- 验证回调处理逻辑
- 测试异常情况（网络超时、重复支付等）

## API接口文档

### 创建订单
```
POST /api/payment/create
Content-Type: application/json

{
  "productId": "pro_30_times",
  "paymentType": "wechat", // 或 "alipay"
  "userToken": "test_token"
}

响应：
{
  "code": 200,
  "data": {
    "orderId": "MS123456",
    "paymentType": "wechat",
    "h5_url": "https://wxpay...", // 微信支付链接
    "mockMode": false // 是否模拟模式
  }
}
```

### 查询订单
```
GET /api/payment/order/:orderId

响应：
{
  "code": 200,
  "data": {
    "orderId": "MS123456",
    "status": "paid", // pending/paid
    "productName": "30次下载",
    "amount": 190,
    "createdAt": "2026-04-22T..."
  }
}
```

### 模拟支付成功（仅测试）
```
POST /api/payment/simulate/:orderId

响应：
{
  "code": 200,
  "data": {
    "orderId": "MS123456",
    "times": 30,
    "newBalance": 35
  }
}
```

### 用户余额查询
```
GET /api/user/balance?userToken=test_token

响应：
{
  "code": 200,
  "data": {
    "balance": 35,
    "userId": "test_user_id"
  }
}
```
