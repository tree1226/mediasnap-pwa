/**
 * 支付配置文件
 * 请将以下配置替换为你的真实商户信息
 */

module.exports = {
  // 微信支付配置
  wechatPay: {
    // 微信商户号
    mchid: process.env.WECHAT_MCHID || 'YOUR_WECHAT_MCHID',
    // 微信商户API私钥（文件路径）
    privateKeyPath: process.env.WECHAT_PRIVATE_KEY_PATH || './certs/wechat_private_key.pem',
    // 微信商户证书序列号
    certSerialNo: process.env.WECHAT_CERT_SERIAL_NO || 'YOUR_CERT_SERIAL_NO',
    // 微信商户APIv3密钥
    apiV3Key: process.env.WECHAT_APIV3_KEY || 'YOUR_WECHAT_APIV3_KEY',
    // 微信支付回调地址
    notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://localhost:3000/api/payment/wechat/notify',
    // AppID
    appid: process.env.WECHAT_APPID || 'YOUR_WECHAT_APPID',
  },

  // 支付宝配置
  alipay: {
    // 支付宝应用ID
    appId: process.env.ALIPAY_APPID || 'YOUR_ALIPAY_APPID',
    // 支付宝应用私钥
    privateKey: process.env.ALIPAY_PRIVATE_KEY || 'YOUR_ALIPAY_PRIVATE_KEY',
    // 支付宝公钥
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || 'YOUR_ALIPAY_PUBLIC_KEY',
    // 支付宝网关地址
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    // 支付宝回调地址
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3000/api/payment/alipay/notify',
    // 字符编码
    charset: 'utf-8',
    // 签名算法
    signType: 'RSA2',
    // 格式
    format: 'json',
    // 版本
    version: '1.0',
  },

  // 产品配置
  products: [
    {
      id: 'pro_30_times',
      name: '30次下载',
      description: '适合临时使用，有效期30天',
      amount: 190, // 单位：分，1.9元
      times: 30,
      validDays: 30
    },
    {
      id: 'pro_unlimited_yearly',
      name: '无限次年费',
      description: '2026年自媒体搬运神器，不限次',
      amount: 990, // 单位：分，9.9元
      times: 99999,
      validDays: 365
    }
  ],

  // 本地存储Key配置
  storageKeys: {
    userBalance: 'ms_pro_balance',
    userToken: 'ms_pro_user_token',
    userId: 'ms_pro_user_id',
    orders: 'ms_pro_orders'
  }
};