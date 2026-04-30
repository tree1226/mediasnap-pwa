/**
 * 模拟支付成功API - Vercel Serverless Function
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
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ code: 400, msg: '订单ID不能为空' });
    }

    const order = mockOrders[orderId];

    if (!order) {
      return res.status(404).json({ code: 404, msg: '订单不存在' });
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

  } catch (error) {
    console.error('[模拟支付失败]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误' });
  }
}