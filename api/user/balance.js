/**
 * 用户余额查询API - Vercel Serverless Function
 */

let mockUserBalances = {
  'test_user_id': 5
};

let mockUserTokens = {
  'test_token': 'test_user_id'
};

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
    const { userToken } = req.query;

    if (!userToken) {
      return res.status(400).json({ code: 400, msg: '缺少用户Token' });
    }

    const userId = mockUserTokens[userToken];
    if (!userId) {
      return res.status(401).json({ code: 401, msg: '用户认证失败' });
    }

    const balance = mockUserBalances[userId] || 0;

    return res.json({
      code: 200,
      data: {
        balance: balance,
        userId: userId,
      },
    });

  } catch (error) {
    console.error('[查询余额失败]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误' });
  }
}