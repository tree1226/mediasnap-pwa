/**
 * 创建支付订单API - Vercel Serverless Function
 */

const config = require('../../payment.config.cjs');

// 订单存储
let mockOrders = {};
let orderCounter = 0;

// 用户Token管理
let mockUserTokens = {
  'test_token': 'test_user_id'
};

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: 'Method not allowed' });
  }

  try {
    const { productId, paymentType, userToken } = req.body;

    if (!productId || !paymentType || !userToken) {
      return res.json({ code: 400, msg: '参数不完整' });
    }

    // 验证用户Token
    const userId = mockUserTokens[userToken];
    if (!userId) {
      return res.json({ code: 401, msg: '用户认证失败' });
    }

    // 获取产品信息
    const product = config.products.find(p => p.id === productId);
    if (!product) {
      return res.json({ code: 400, msg: '产品不存在' });
    }

    // 创建订单号
    orderCounter++;
    const orderId = `MS${Date.now()}${String(orderCounter).padStart(6, '0').toUpperCase()}`;

    // 保存订单
    mockOrders[orderId] = {
      id: orderId,
      userId: userId,
      productId: productId,
      productName: product.name,
      amount: product.amount,
      times: product.times,
      paymentType: paymentType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log(`[订单创建] 订单号: ${orderId}, 用户: ${userId}, 产品: ${product.name}, 支付方式: ${paymentType}`);

    // 检查是否配置了真实支付
    const hasWechatPay = config.wechatPay.mchid !== 'YOUR_WECHAT_MCHID';
    const hasAlipay = config.alipay.appId !== 'YOUR_ALIPAY_APPID';

    let paymentParams = {};

    if (paymentType === 'wechat' && !hasWechatPay) {
      // 微信支付模拟模式
      paymentParams = {
        orderId: orderId,
        paymentType: 'wechat',
        h5_url: null,
        mockMode: true
      };
    } else if (paymentType === 'alipay' && !hasAlipay) {
      // 支付宝模拟模式
      paymentParams = {
        orderId: orderId,
        paymentType: 'alipay',
        payUrl: null,
        mockMode: true
      };
    } else if (paymentType === 'wechat') {
      // 真实微信支付（需要配置证书）
      paymentParams = {
        orderId: orderId,
        paymentType: 'wechat',
        h5_url: null,
        mockMode: false,
        error: '微信支付需要配置证书和商户信息'
      };
    } else if (paymentType === 'alipay') {
      // 真实支付宝支付（需要配置密钥）
      paymentParams = {
        orderId: orderId,
        paymentType: 'alipay',
        payUrl: null,
        mockMode: false,
        error: '支付宝需要配置应用密钥'
      };
    }

    return res.json({
      code: 200,
      msg: '订单创建成功',
      data: paymentParams,
    });

  } catch (error) {
    console.error('[创建订单失败]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误: ' + error.message });
  }
}