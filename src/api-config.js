/**
 * API 配置
 * 根据环境自动选择正确的 API 地址
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default {
  base: API_BASE,

  // 获取完整的 API URL
  getUrl(path) {
    // 如果 base 为空，使用相对路径
    // 如果 base 有值，使用完整路径
    return API_BASE ? `${API_BASE}${path}` : path;
  },

  // 检查是否在生产环境
  isProduction() {
    return !API_BASE || API_BASE.includes('vercel.app');
  },

  // 获取用户 Token
  getUserToken() {
    return localStorage.getItem('ms_pro_user_token') || 'test_token';
  },

  // API 端点配置
  endpoints: {
    parse: '/api/parse',
    download: '/api/download',
    createPayment: '/api/payment/create',
    orderStatus: (orderId) => `/api/payment/${orderId}`,
    simulatePayment: (orderId) => `/api/payment/simulate/${orderId}`,
    userBalance: (token) => `/api/user/balance?userToken=${token}`,
    wechatNotify: '/api/payment/wechat/notify',
    alipayNotify: '/api/payment/alipay/notify',
  }
};