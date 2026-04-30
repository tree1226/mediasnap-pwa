/**
 * 下载扣费API - Vercel Serverless Function
 */

// 简单的内存存储（生产环境应使用外部数据库）
let mockUserBalances = {
  'test_user_id': 5 // 初始默认送5次
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
    const { video_url, user_token } = req.body;

    // 这里的 user_token 是真实 PWA 用于鉴权用户 ID 的，这里模拟用 test_user_id
    const userId = 'test_user_id';
    let currentBalance = mockUserBalances[userId] || 0;

    if (currentBalance <= 0) {
      return res.json({ code: 403, msg: '余额不足，请先充值', new_balance: 0 });
    }

    // 执行扣费
    currentBalance--;
    mockUserBalances[userId] = currentBalance;

    console.log(`[Balance Update] 用户 ${userId} 扣费成功，新余额: ${currentBalance}`);

    return res.json({
      code: 200,
      msg: '扣费成功，正在下载',
      new_balance: currentBalance
    });

  } catch (error) {
    console.error('[Download Error]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误' });
  }
}