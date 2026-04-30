/**
 * Vercel API 测试脚本
 * 用于验证部署后的 API 端点是否正常工作
 */

const API_BASE = process.env.API_BASE || '';

const endpoints = {
  parse: '/api/parse',
  download: '/api/download',
  createPayment: '/api/payment/create',
  orderStatus: (orderId) => `/api/payment/${orderId}`,
  simulatePayment: (orderId) => `/api/payment/simulate/${orderId}`,
  userBalance: (token) => `/api/user/balance?userToken=${token}`,
};

const makeRequest = async (endpoint, options = {}) => {
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;
  console.log(`🔄 Testing: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const result = await response.json();
    console.log(`✅ Success: ${JSON.stringify(result, null, 2)}`);
    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { error: error.message };
  }
};

const runTests = async () => {
  console.log('🚀 Starting Vercel API Tests...\n');

  // 测试1: 视频解析
  console.log('1️⃣ 测试视频解析API');
  await makeRequest(endpoints.parse, {
    method: 'POST',
    body: JSON.stringify({
      url: 'https://example.com/video',
      platform: 'douyin'
    })
  });
  console.log('');

  // 测试2: 创建订单
  console.log('2️⃣ 测试创建支付订单API');
  const orderResult = await makeRequest(endpoints.createPayment, {
    method: 'POST',
    body: JSON.stringify({
      productId: 'pro_30_times',
      paymentType: 'wechat',
      userToken: 'test_token'
    })
  });
  console.log('');

  // 测试3: 查询订单状态
  if (orderResult.data && orderResult.data.orderId) {
    console.log('3️⃣ 测试查询订单状态API');
    await makeRequest(endpoints.orderStatus(orderResult.data.orderId));
    console.log('');

    // 测试4: 模拟支付成功
    console.log('4️⃣ 测试模拟支付成功API');
    await makeRequest(endpoints.simulatePayment(orderResult.data.orderId), {
      method: 'POST'
    });
    console.log('');
  }

  // 测试5: 查询用户余额
  console.log('5️⃣ 测试用户余额查询API');
  await makeRequest(endpoints.userBalance('test_token'));
  console.log('');

  // 测试6: 下载扣费
  console.log('6️⃣ 测试下载扣费API');
  await makeRequest(endpoints.download, {
    method: 'POST',
    body: JSON.stringify({
      video_url: 'https://example.com/video.mp4',
      user_token: 'test_token'
    })
  });
  console.log('');

  console.log('🎉 All tests completed!');
};

// 运行测试
runTests().catch(console.error);