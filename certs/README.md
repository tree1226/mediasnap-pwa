# 微信支付证书说明

## 重要提醒

微信支付私钥和证书文件不能生成，必须从微信支付商户平台获取！

## 获取步骤

### 1. 申请微信支付
- 访问微信支付商户平台：https://pay.weixin.qq.com/
- 注册并完成商户资质认证

### 2. 下载商户证书
1. 登录微信支付商户平台
2. 进入「账户中心」→「API安全」
3. 下载商户证书（包含以下文件）：
   - `apiclient_key.pem` - 商户API私钥
   - `apiclient_cert.pem` - 商户API证书
   - `apiclient_cert.p12` - 商户API证书（PKCS12格式）

### 3. 配置项目
将下载的证书文件放置在 `certs/` 目录下，并修改 `payment.config.cjs`：

```javascript
wechatPay: {
  // 将微信商户平台下载的证书重命名为：
  privateKeyPath: './certs/apiclient_key.pem',
  // 证书序列号可在商户平台查看
  certSerialNo: '你的证书序列号',
  // 其他配置...
}
```

## 沙箱测试

如果只是测试支付流程，可以先申请微信支付沙箱账号：
1. 申请沙箱环境：https://developers.weixin.qq.com/community/pay/doc/000825f5ec03f85eeb9f3b5f50801d
2. 沙箱环境提供测试用的商户号和证书
3. 完成测试后再切换到生产环境

## 测试环境配置

目前项目使用模拟配置，你可以：
1. 先测试支付宝支付
2. 申请微信支付沙箱环境
3. 或暂时注释掉微信支付功能
