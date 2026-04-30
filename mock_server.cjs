/**
 * MediaSnap PWA Mock Server
 * 运行命令: node mock_server.js
 * 核心目的: 1. 模拟你购买 API 后所需的文案提取逻辑。
 * 2. 跑通”按次收费”的变现流程。
 * 3. 集成微信支付和支付宝支付功能。
 */

const express = require('express');
const cors = require('cors'); // PWA 多端需开启 CORS
const { Formatter, Rsa } = require('wechatpay-node-v3');
const { AlipaySdk } = require('alipay-sdk');

const app = express();
const port = 3000;
const config = require('./payment.config.cjs');

// 初始化微信支付
let wxpay = null;
try {
  wxpay = new Rsa({
    appid: config.wechatPay.appid,
    mchid: config.wechatPay.mchid,
    private_key: require('fs').readFileSync(config.wechatPay.privateKeyPath),
    serial_no: config.wechatPay.certSerialNo,
    apiv3_private_key: config.wechatPay.apiV3Key,
  });
  console.log('[微信支付] 初始化成功');
} catch (error) {
  console.warn('[微信支付] 初始化失败，请检查证书配置:', error.message);
  console.log('[提示] 微信支付将使用模拟模式，不影响其他支付方式');
}

// 初始化支付宝
let alipaySdk = null;
try {
  // 检查是否配置了真实的支付宝密钥
  if (config.alipay.appId === 'YOUR_ALIPAY_APPID' ||
      config.alipay.privateKey === 'YOUR_ALIPAY_PRIVATE_KEY' ||
      config.alipay.alipayPublicKey === 'YOUR_ALIPAY_PUBLIC_KEY') {
    throw new Error('支付宝配置未完成，请填写真实的商户信息');
  }

  alipaySdk = new AlipaySdk({
    appId: config.alipay.appId,
    privateKey: config.alipay.privateKey,
    alipayPublicKey: config.alipay.alipayPublicKey,
    gateway: config.alipay.gateway,
    charset: config.alipay.charset,
    signType: config.alipay.signType,
    format: config.alipay.format,
    version: config.alipay.version,
  });
  console.log('[支付宝] 初始化成功');
} catch (error) {
  console.warn('[支付宝] 初始化失败，请检查密钥配置:', error.message);
  console.log('[提示] 支付宝将使用模拟模式，不影响其他支付方式');
}

app.use(express.json());
app.use(cors());

// 模拟数据库用户余额 (真实项目要存 DB)
let mockUserBalances = {
  'test_user_id': 5 // 初始默认送 5 次
};

// 订单存储
let mockOrders = {};

// 用户Token管理
let mockUserTokens = {
  'test_token': 'test_user_id'
};

// --- 核心接口 1: 解析视频 ---
app.post('/api/parse', (req, res) => {
  const { url, platform } = req.body;
  console.log(`[Parse Request] ${platform} - ${url}`);

  if (!url) return res.json({ code: 400, msg: '链接不能为空' });

  // 1. 这里是替换逻辑的核心！
  // 当你后面购买了第三方 API (比如某宝的去水印 API)，在这里替换为你买的 API 地址。
  // 我们这里提供一个 MOCK 返回数据，你可以用它把前端跑通。

  // TODO: 替换为你购买的第三方 API 调用
  // const thirdPartyApiUrl = `https://api.your-purchased-api.com/parse?url=${url}&token=YOUR_TOKEN`;
  // const apiRes = await fetch(thirdPartyApiUrl);
  // const apiData = await apiRes.json();

  // MOCK 数据 (模拟第三方 API 返回)
  const mockApiData = {
    douyin: {
      video_url: 'https://v.douyin.com/your_mock_no_watermark_video_url.mp4', // 假视频地址
      cover_url: 'https://p3.douyinpic.com/tos-cn-i-0813/your_mock_cover.jpg',
      desc: '这是一段模拟从抖音提取出来的文案，#短视频 #搬运素材 #全栈开发'
    },
    bilibili: {
      video_url: 'https://upos-sz-mirrorhw.bilivideo.com/your_mock_no_watermark_video_url.mp4',
      cover_url: 'https://i0.hdslb.com/bfs/archive/your_mock_cover.jpg',
      desc: '这是一段 B站视频 的文案提取示例，#白嫖党 #学习资料'
    }
  };

  const platformData = mockApiData[platform];
  
  if (platformData) {
    // 成功解析，将结果返回给前端，但不进行扣费 (下载时才扣费)
    return res.json({
      code: 200,
      msg: '解析成功',
      data: platformData
    });
  } else {
    return res.json({ code: 500, msg: 'API 接口解析失败 (Mock)' });
  }
});


// --- 核心接口 2: 下载视频 (变现扣费) ---
app.post('/api/download', (req, res) => {
  const { video_url, user_token } = req.body; 
  console.log(`[Download Request] 尝试扣费下载: ${video_url}`);

  // 这里的 user_token 是真实 PWA 用于鉴权用户 ID 的，这里模拟用 test_user_id
  const userId = 'test_user_id';
  let currentBalance = mockUserBalances[userId];

  if (currentBalance <= 0) {
    return res.json({ code: 403, msg: '余额不足，请先充值', new_balance: 0 });
  }

  // 1. 执行扣费
  currentBalance--;
  mockUserBalances[userId] = currentBalance; // 更新模拟 DB

  console.log(`[Balance Update] 用户 ${userId} 扣费成功，新余额: ${currentBalance}`);

  // 2. 返回新的余额，前端更新 UI
  res.json({
    code: 200,
    msg: '扣费成功，正在下载',
    new_balance: currentBalance
  });
});

// --- 支付相关API ---

// 1. 创建订单
app.post('/api/payment/create', async (req, res) => {
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
  const orderId = `MS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // 保存订单
  mockOrders[orderId] = {
    id: orderId,
    userId: userId,
    productId: productId,
    productName: product.name,
    amount: product.amount,
    times: product.times,
    paymentType: paymentType, // 'wechat' or 'alipay'
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  console.log(`[订单创建] 订单号: ${orderId}, 用户: ${userId}, 产品: ${product.name}, 支付方式: ${paymentType}`);

  try {
    let paymentParams = {};

    if (paymentType === 'wechat') {
      if (!wxpay) {
        // 微信支付模拟模式
        console.log(`[模拟微信支付] 订单号: ${orderId}, 金额: ${product.amount}分`);
        paymentParams = {
          orderId: orderId,
          paymentType: 'wechat',
          h5_url: null, // 模拟模式无真实支付链接
          mockMode: true
        };
      } else {
        // 真实微信支付
        const wxpayResult = await wxpay.transactions_h5({
          mchid: config.wechatPay.mchid,
          out_trade_no: orderId,
          appid: config.wechatPay.appid,
          description: product.name,
          notify_url: config.wechatPay.notifyUrl,
          amount: {
            total: product.amount,
            currency: 'CNY',
          },
          scene_info: {
            payer_client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            h5_info: {
              type: 'Wap',
            },
          },
        });

        paymentParams = {
          orderId: orderId,
          paymentType: 'wechat',
          h5_url: wxpayResult.h5_url, // 微信H5支付链接
        };
      }
    } else if (paymentType === 'alipay') {
      if (!alipaySdk) {
        // 支付宝模拟模式
        console.log(`[模拟支付宝支付] 订单号: ${orderId}, 金额: ${product.amount}分`);
        paymentParams = {
          orderId: orderId,
          paymentType: 'alipay',
          payUrl: null, // 模拟模式无真实支付链接
          mockMode: true
        };
      } else {
        // 真实支付宝支付
        const result = alipaySdk.exec('alipay.trade.wap.pay', {
          notifyUrl: config.alipay.notifyUrl,
          returnUrl: 'http://localhost:5173/',
          bizContent: {
            outTradeNo: orderId,
            productCode: 'QUICK_WAP_WAY',
            totalAmount: (product.amount / 100).toFixed(2), // 转换为元
            subject: product.name,
            body: product.description,
          },
        });

        paymentParams = {
          orderId: orderId,
          paymentType: 'alipay',
          payUrl: result, // 支付宝支付链接
        };
      }
    }

    return res.json({
      code: 200,
      msg: '订单创建成功',
      data: paymentParams,
    });
  } catch (error) {
    console.error('[支付创建失败]', error);
    return res.json({ code: 500, msg: '支付创建失败: ' + error.message });
  }
});

// 2. 查询订单状态
app.get('/api/payment/order/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = mockOrders[orderId];

  if (!order) {
    return res.json({ code: 404, msg: '订单不存在' });
  }

  console.log(`[订单查询] 订单号: ${orderId}, 状态: ${order.status}`);

  return res.json({
    code: 200,
    data: {
      orderId: order.id,
      status: order.status,
      productName: order.productName,
      amount: order.amount,
      createdAt: order.createdAt,
    },
  });
});

// 3. 微信支付回调
app.post('/api/payment/wechat/notify', async (req, res) => {
  try {
    // 验证微信支付回调签名
    const { headers, body } = req;
    const signature = headers['wechatpay-signature'];
    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const serial = headers['wechatpay-serial'];

    // 验证签名 (实际项目中需要严格的签名验证)
    // const isValid = await wxpay.verifySign({ timestamp, nonce, body, signature, serial });

    const notifyData = JSON.parse(body);
    const { out_trade_no, trade_state } = notifyData;

    console.log(`[微信支付回调] 订单号: ${out_trade_no}, 状态: ${trade_state}`);

    if (trade_state === 'SUCCESS') {
      // 更新订单状态
      const order = mockOrders[out_trade_no];
      if (order && order.status === 'pending') {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();

        // 增加用户余额
        const userId = order.userId;
        if (!mockUserBalances[userId]) {
          mockUserBalances[userId] = 0;
        }
        mockUserBalances[userId] += order.times;

        console.log(`[余额更新] 用户 ${userId} 充值 ${order.times} 次，新余额: ${mockUserBalances[userId]}`);
      }
    }

    res.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('[微信支付回调处理失败]', error);
    res.status(500).json({ code: 'FAIL', message: '处理失败' });
  }
});

// 4. 支付宝回调
app.post('/api/payment/alipay/notify', async (req, res) => {
  try {
    const params = req.body;
    const signVerified = alipaySdk.checkNotifySign(params);

    if (signVerified) {
      const out_trade_no = params.out_trade_no;
      const trade_status = params.trade_status;

      console.log(`[支付宝回调] 订单号: ${out_trade_no}, 状态: ${trade_status}`);

      if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
        // 更新订单状态
        const order = mockOrders[out_trade_no];
        if (order && order.status === 'pending') {
          order.status = 'paid';
          order.paidAt = new Date().toISOString();

          // 增加用户余额
          const userId = order.userId;
          if (!mockUserBalances[userId]) {
            mockUserBalances[userId] = 0;
          }
          mockUserBalances[userId] += order.times;

          console.log(`[余额更新] 用户 ${userId} 充值 ${order.times} 次，新余额: ${mockUserBalances[userId]}`);
        }
      }

      res.send('success');
    } else {
      console.error('[支付宝签名验证失败]');
      res.send('fail');
    }
  } catch (error) {
    console.error('[支付宝回调处理失败]', error);
    res.send('fail');
  }
});

// 5. 用户余额查询API
app.get('/api/user/balance', (req, res) => {
  const { userToken } = req.query;

  if (!userToken) {
    return res.json({ code: 400, msg: '缺少用户Token' });
  }
  debugger

  const userId = mockUserTokens[userToken];
  if (!userId) {
    return res.json({ code: 401, msg: '用户认证失败' });
  }

  const balance = mockUserBalances[userId] || 0;

  return res.json({
    code: 200,
    data: {
      balance: balance,
      userId: userId,
    },
  });
});

// 6. 模拟支付成功（用于测试）
app.post('/api/payment/simulate/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = mockOrders[orderId];

  if (!order) {
    return res.json({ code: 404, msg: '订单不存在' });
  }

  if (order.status === 'paid') {
    return res.json({ code: 400, msg: '订单已支付' });
  }

  // 更新订单状态
  order.status = 'paid';
  order.paidAt = new Date().toISOString();

  // 增加用户余额
  const userId = order.userId;
  if (!mockUserBalances[userId]) {
    mockUserBalances[userId] = 0;
  }
  mockUserBalances[userId] += order.times;

  console.log(`[模拟支付成功] 订单号: ${orderId}, 用户: ${userId}, 充值: ${order.times} 次`);

  return res.json({
    code: 200,
    msg: '支付成功',
    data: {
      orderId: orderId,
      times: order.times,
      newBalance: mockUserBalances[userId],
    },
  });
});

app.listen(port, () => {
  console.log(`------------------------------------------------`);
  console.log(`MediaSnap Mock Server 正在运行在 port ${port}`);
  console.log(`PWA 前端请确保调用地址为 http://localhost:${port}`);
  console.log(`购买第三方 API 后，请在 mock_server.js 中替换 TODO 部分。`);
  console.log(`支付功能已集成：微信支付 + 支付宝`);
  console.log(`------------------------------------------------`);
});