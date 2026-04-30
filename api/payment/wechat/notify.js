/**
 * 微信支付回调API - Vercel Serverless Function
 */

let mockOrders = {};
let mockUserBalances = {
  'test_user_id': 5
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
    const { headers, body } = req;
    const signature = headers['wechatpay-signature'];
    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const serial = headers['wechatpay-serial'];

    console.log(`[微信支付回调] 收到回调`);

    // 解析回调数据
    let notifyData;
    try {
      notifyData = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      console.error('[微信支付回调解析失败]', e);
      return res.status(400).json({ code: 'FAIL', message: '解析失败' });
    }

    const { out_trade_no, trade_state } = notifyData;

    if (!out_trade_no) {
      console.error('[微信支付回调] 缺少订单号');
      return res.status(400).json({ code: 'FAIL', message: '缺少订单号' });
    }

    console.log(`[微信支付回调] 订单号: ${out_trade_no}, 状态: ${trade_state}`);

    if (trade_state === 'SUCCESS') {
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

    // 返回成功响应
    return res.json({ code: 'SUCCESS', message: '成功' });

  } catch (error) {
    console.error('[微信支付回调处理失败]', error);
    return res.status(500).json({ code: 'FAIL', message: '处理失败' });
  }
}