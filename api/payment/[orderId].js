/**
 * 查询订单状态API - Vercel Serverless Function
 */

let mockOrders = {};

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

  } catch (error) {
    console.error('[查询订单失败]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误' });
  }
}