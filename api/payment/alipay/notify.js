/**
 * 支付宝回调API - Vercel Serverless Function
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
    const params = req.body || {};
    console.log(`[支付宝回调] 收到回调`);

    const out_trade_no = params.out_trade_no;
    const trade_status = params.trade_status;

    if (!out_trade_no) {
      console.error('[支付宝回调] 缺少订单号');
      return res.send('fail');
    }

    console.log(`[支付宝回调] 订单号: ${out_trade_no}, 状态: ${trade_status}`);

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
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
    return res.send('success');

  } catch (error) {
    console.error('[支付宝回调处理失败]', error);
    return res.send('fail');
  }
}