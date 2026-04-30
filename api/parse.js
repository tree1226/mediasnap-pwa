/**
 * 视频解析API - Vercel Serverless Function
 */

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
    const { url, platform } = req.body;

    if (!url) {
      return res.json({ code: 400, msg: '链接不能为空' });
    }

    console.log(`[Parse Request] ${platform} - ${url}`);

    // MOCK 数据（后期替换为真实API）
    const mockApiData = {
      douyin: {
        video_url: 'https://v.douyin.com/your_mock_no_watermark_video_url.mp4',
        cover_url: 'https://p3.douyinpic.com/tos-cn-i-0813/your_mock_cover.jpg',
        desc: '这是一段模拟从抖音提取出来的文案，#短视频 #搬运素材 #全栈开发'
      },
      bilibili: {
        video_url: 'https://upos-sz-mirrorhw.bilivideo.com/your_mock_no_watermark_video_url.mp4',
        cover_url: 'https://i0.hdslb.com/bfs/archive/your_mock_cover.jpg',
        desc: '这是一段 B站视频 的文案提取示例，#白嫖党 #学习资料'
      },
      other: {
        video_url: 'https://example.com/your_mock_video_url.mp4',
        cover_url: 'https://example.com/your_mock_cover.jpg',
        desc: '这是通用平台的文案提取示例 #文案提取 #视频处理'
      }
    };

    const platformData = mockApiData[platform] || mockApiData['other'];

    return res.json({
      code: 200,
      msg: '解析成功',
      data: platformData
    });

  } catch (error) {
    console.error('[Parse Error]', error);
    return res.status(500).json({ code: 500, msg: '服务器错误' });
  }
}