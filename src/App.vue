<template>
  <div
    class="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-4 md:p-10 font-sans antialiased"
  >
    <header
      class="w-full max-w-7xl flex justify-between items-center py-6 border-b border-gray-200 mb-10"
    >
      <div class="flex items-center gap-2">
        <span
          class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
          >M</span
        >
        <h1 class="text-3xl font-extrabold tracking-tighter text-gray-950">
          MediaSnap <span class="text-sm text-blue-500 font-medium">Pro</span>
        </h1>
      </div>

      <div
        class="flex items-center gap-2 md:gap-4 bg-white px-3 py-3 md:p-3 rounded-full shadow-sm border border-gray-100"
      >
        <span class="text-xs md:text-sm text-gray-500 whitespace-nowrap">剩余下载:</span>
        <span class="text-lg md:text-3xl font-bold text-blue-600 tabular-nums max-w-[120px] md:max-w-none truncate">{{ userBalance }}</span>
        <button
          @click="showRecharge = true"
          class="bg-gray-950 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-800 transition active:scale-95 whitespace-nowrap"
        >
          充值
        </button>
      </div>
    </header>

    <main class="w-full max-w-4xl flex-grow flex flex-col items-center gap-10">
      <div
        class="w-full bg-white p-8 md:p-12 rounded-4xl shadow-lg border border-gray-100 flex flex-col gap-6"
      >
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">粘贴链接，一键解析</h2>
        <p class="text-gray-500 -mt-2">支持 Bilibili、抖音，自动去除水印，提取视频文案。</p>

        <div class="w-full relative">
          <input
            v-model="rawUrl"
            placeholder="粘贴 抖音/B站 分享链接..."
            class="w-full text-lg p-6 pr-36 rounded-2xl border border-gray-200 shadow-inner bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition outline-none placeholder:text-gray-400"
          />
          <button
            @click="handleParse"
            :loading="loading"
            class="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-9 rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            :disabled="loading || !rawUrl"
          >
            {{ loading ? "解析中..." : "免费解析" }}
          </button>
        </div>
        <div class="text-xs text-gray-400 flex gap-4">
          <span># 无水印视频</span>
          <span># 高清封面</span>
          <span># 文本提取</span>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" class="w-full flex flex-col items-center gap-4 mt-10">
          <div
            class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
          ></div>
          <p class="text-blue-600 font-medium">正在调取云端解析接口...</p>
        </div>

        <div v-else-if="result" class="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div
            class="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-4"
          >
            <h3 class="font-bold text-lg text-gray-900">视频预览</h3>
            <video
              :src="result.video_url"
              controls
              class="w-full h-52 object-cover rounded-xl shadow-inner border border-gray-100 bg-gray-950"
            ></video>
            <div class="mt-auto space-y-2">
              <button
                @click="confirmDownload"
                class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 group"
                :disabled="userBalance <= 0"
              >
                <span class="group-hover:translate-y-0.5 transition-transform">📥</span>
                <span class="text-sm md:text-base">{{
                  userBalance > 0
                    ? `下载 (扣${downloadCost}次)`
                    : "余额不足"
                }}</span>
              </button>
              <button
                @click="watchAdForDownload"
                v-if="userBalance <= 0"
                class="w-full bg-amber-50 text-amber-700 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition"
              >
                📺 看个短广告，免费下载此视频
              </button>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-4"
          >
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-lg text-gray-900">视频文案提取</h3>
              <button
                @click="copyDesc"
                class="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200"
              >
                复制
              </button>
            </div>
            <textarea
              v-model="result.desc"
              class="w-full h-52 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 resize-none outline-none tabular-nums"
              readonly
              placeholder="暂无提取文案..."
            ></textarea>
            <p class="text-xs text-gray-400 mt-auto"># 字符数: {{ result.desc?.length || 0 }}</p>
          </div>

          <div
            class="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-4"
          >
            <h3 class="font-bold text-lg text-gray-900">高清封面 & 链接</h3>
            <img
              :src="result.cover_url"
              class="w-full h-32 object-cover rounded-xl shadow-inner border border-gray-100"
            />
            <a
              :href="result.cover_url"
              download
              target="_blank"
              class="w-full text-center bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
            >
              下载封面
            </a>

            <div class="mt-4 space-y-2">
              <label class="text-xs text-gray-400">无水印临时链接 (不扣费)</label>
              <input
                :value="result.video_url"
                readonly
                class="w-full p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-100 outline-none select-all"
              />
            </div>
          </div>
        </div>
      </transition>
    </main>

    <transition name="fade">
      <div
        v-if="showRecharge"
        class="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="showRecharge = false"
      >
        <div
          class="bg-white p-6 md:p-10 rounded-4xl shadow-2xl w-full max-w-lg text-center flex flex-col gap-6 md:gap-8 relative overflow-hidden"
        >
          <button
            @click="showRecharge = false"
            class="absolute top-4 right-4 md:top-6 md:right-6 text-gray-300 hover:text-gray-500 text-xl md:text-2xl"
          >
            ×
          </button>

          <div class="flex flex-col items-center gap-2">
            <span class="text-4xl md:text-6xl">💎</span>
            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">充值次数</h2>
            <p class="text-gray-500 text-xs md:text-sm">支付成功后立即生效，支持多端同步。</p>
          </div>

          <!-- 支付方式选择 -->
          <div class="flex gap-2 md:gap-4 bg-gray-100 p-2 rounded-xl">
            <button
              @click="paymentType = 'wechat'"
              :class="paymentType === 'wechat' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-white'"
              class="flex-1 py-2 md:py-3 px-2 md:px-6 rounded-lg font-semibold transition flex items-center justify-center gap-1 md:gap-2"
            >
              <span class="text-lg md:text-xl">💚</span>
              <span class="text-xs md:text-base">微信</span>
            </button>
            <button
              @click="paymentType = 'alipay'"
              :class="paymentType === 'alipay' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white'"
              class="flex-1 py-2 md:py-3 px-2 md:px-6 rounded-lg font-semibold transition flex items-center justify-center gap-1 md:gap-2"
            >
              <span class="text-lg md:text-xl">💙</span>
              <span class="text-xs md:text-base">支付宝</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button
              @click="handlePayment('pro_30_times')"
              class="border-2 border-blue-200 p-4 md:p-8 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50 transition flex flex-col gap-2 relative group"
            >
              <span class="text-3xl md:text-4xl font-black text-blue-600 tabular-nums"
                >1.9<span class="text-base md:text-lg">元</span></span
              >
              <span class="font-bold text-gray-900 text-sm md:text-base">30 次下载</span>
              <span class="text-xs md:text-sm text-gray-500">适合临时使用，有效期 30 天。</span>
              <span class="absolute right-2 md:right-4 bottom-2 md:bottom-4 text-blue-300 group-hover:text-blue-500 text-lg md:text-xl"
                >→</span
              >
            </button>

            <button
              @click="handlePayment('pro_unlimited_yearly')"
              class="border-2 border-amber-200 p-4 md:p-8 rounded-2xl text-left hover:border-amber-400 hover:bg-amber-50 transition flex flex-col gap-2 relative group overflow-hidden"
            >
              <span
                class="absolute top-1 md:top-2 right-1 md:right-2 bg-amber-500 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-bold"
                >超值</span
              >
              <span class="text-3xl md:text-4xl font-black text-amber-600 tabular-nums"
                >9.9<span class="text-base md:text-lg">元</span></span
              >
              <span class="font-bold text-gray-900 text-sm md:text-base">无限次 (年费)</span>
              <span class="text-xs md:text-sm text-gray-500">2026 年自媒体搬运神器，不限次。</span>
              <span class="absolute right-2 md:right-4 bottom-2 md:bottom-4 text-amber-300 group-hover:text-amber-500 text-lg md:text-xl"
                >→</span
              >
            </button>
          </div>

          <p class="text-xs text-gray-400 mt-4">支持微信支付和支付宝，支付成功后立即生效。</p>
        </div>
      </div>
    </transition>

    <footer
      class="mt-20 w-full max-w-7xl text-center py-6 border-t border-gray-100 text-xs text-gray-400 space-y-1"
    >
      <p>MediaSnap Pro | 2026 年自媒体必备 PWA 工具</p>
      <p>在 PC Chrome/移动端桌面“添加到桌面”体验更佳。</p>
      <p>后端解析接口请在购买后于 mock_server 中替换 TODO 部分。</p>
    </footer>

    <div
      v-if="toast.show"
      class="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 bg-gray-950 text-white px-4 md:px-6 py-3 md:py-3 rounded-xl shadow-lg z-50 text-xs md:text-sm font-medium max-w-[90vw] text-center"
    >
      {{ toast.msg }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import apiConfig from "./api-config.js";

// --- 1. 状态管理 ---
const rawUrl = ref("");
const result = ref(null);
const loading = ref(false);
const showRecharge = ref(false);
const downloadCost = ref(1); // 每次下载扣除次数
const paymentType = ref("wechat"); // 支付方式: wechat 或 alipay
const userToken = ref(apiConfig.getUserToken()); // 用户Token
const currentOrderId = ref(null); // 当前支付的订单号

// 模拟 Toast 提示
const toast = reactive({ show: false, msg: "" });
const showToast = (msg) => {
  toast.msg = msg;
  toast.show = true;
  setTimeout(() => (toast.show = false), 2000);
};

// 变现逻辑: 用户余额 (这里演示用 LocalStorage 模拟，后期替换为后端 DB)
const userBalance = ref(parseInt(localStorage.getItem("ms_pro_balance")) || 0); // 初始默认0次

const updateBalance = (newBalance) => {
  userBalance.value = newBalance;
  localStorage.setItem("ms_pro_balance", newBalance);
};

// --- 2. 核心功能与变现逻辑 ---

// A. 解析主逻辑 (调用你的 mock 后端)
const handleParse = async () => {
  if (!rawUrl.value) return;

  // 1. 字符处理: 提取 URL
  const urlReg =
    /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
  const match = rawUrl.value.match(urlReg);
  const url = match ? match[0] : null;
  const platform = url?.includes("bilivideo")
    ? "bilibili"
    : url?.includes("douyin")
      ? "douyin"
      : "other";

  if (!url) return showToast("链接格式错误");

  loading.value = true;
  result.value = null;

  try {
    // 调用解析 API
    const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.parse), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, platform }),
    });

    const data = await response.json();
    if (data.code === 200) {
      // 2. 字符处理: 后端已提取文案、封面、无水印地址
      result.value = data.data;
    } else {
      showToast(data.msg); // 如：解析失败
    }
  } catch (e) {
    showToast("网络错误，请确保 mock_server 已启动 (port 3000)");
  } finally {
    loading.value = false;
  }
};

// B. 变现核心: 扣费下载
const confirmDownload = () => {
  if (userBalance.value <= 0) {
    showToast("下载次数不足，请充值或看广告");
    showRecharge.value = true;
    return;
  }

  // 1. 弹窗确认 (提升用户体验，防止误点)
  if (confirm(`下载此视频将扣除 ${downloadCost.value} 次下载次数。\n确定下载？`)) {
    // 2. 模拟后端扣费成功
    updateBalance(userBalance.value - downloadCost.value);
    showToast(`扣费成功，正在调取高速下载通道...`);

    // 3. 触发下载
    const a = document.createElement("a");
    a.href = result.value.video_url;
    a.download = `MediaSnap_${Date.now()}.mp4`; // 命名包含 Brand
    a.target = "_blank";
    a.click();
  }
};

// C. 变现插口: 看广告解锁下载 (模拟激励视频)
const watchAdForDownload = () => {
  showToast("📺 正在调取激励广告 (模拟)... 请耐心看完...");

  // 模拟广告播放 10 秒
  setTimeout(() => {
    // 广告播放完毕，奖励 1 次下载机会
    updateBalance(userBalance.value + 1);
    showToast("🎉 广告播放完毕，奖励 1 次下载机会！");
  }, 10000);
};

// D. 字符处理: 复制文案
const copyDesc = () => {
  if (!result.value?.desc) return;
  navigator.clipboard.writeText(result.value.desc);
  showToast("文案已复制");
};

// E. 充值逻辑 (真实支付)
const handlePayment = async (productId) => {
  const paymentNames = {
    wechat: '微信支付',
    alipay: '支付宝'
  };

  showToast(`正在创建${paymentNames[paymentType.value]}订单...`);

  try {
    // 调用创建订单API
    const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.createPayment), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productId,
        paymentType: paymentType.value,
        userToken: userToken.value
      })
    });

    const result = await response.json();

    if (result.code === 200) {
      const { orderId, paymentType: payType, h5_url, payUrl, mockMode } = result.data;
      currentOrderId.value = orderId;

      // 根据支付方式跳转
      if (payType === 'wechat') {
        if (mockMode) {
          // 微信支付模拟模式
          showToast('微信支付模拟模式：直接充值成功');
          // 模拟支付成功回调
          setTimeout(() => {
            simulatePaymentSuccess(orderId);
          }, 1000);
        } else {
          // 微信H5支付
          showToast('正在跳转至微信支付...');
          window.location.href = h5_url;
          // 开始轮询订单状态
          pollOrderStatus(orderId);
        }
      } else if (payType === 'alipay') {
        if (mockMode) {
          // 支付宝模拟模式
          showToast('支付宝模拟模式：直接充值成功');
          // 模拟支付成功回调
          setTimeout(() => {
            simulatePaymentSuccess(orderId);
          }, 1000);
        } else {
          // 支付宝手机网站支付
          showToast('正在跳转至支付宝...');
          window.location.href = payUrl;
          // 开始轮询订单状态
          pollOrderStatus(orderId);
        }
      }
    } else {
      showToast('订单创建失败: ' + result.msg);
    }
  } catch (error) {
    console.error('支付请求失败:', error);
    showToast('网络错误，请稍后重试');
  }
};

// 模拟支付成功（用于测试模式）
const simulatePaymentSuccess = async (orderId) => {
  try {
    // 调用模拟支付成功API
    const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.simulatePayment(orderId)), {
      method: 'POST'
    });
    const result = await response.json();

    if (result.code === 200) {
      await updateBalanceFromServer();
      showRecharge.value = false;
      showToast(`支付成功！💎 已增加 ${result.data.times} 次下载次数`);
    }
  } catch (error) {
    console.error('模拟支付失败:', error);
    showToast('模拟支付失败，请稍后重试');
  }
};

// 轮询订单状态
const pollOrderStatus = async (orderId) => {
  const maxAttempts = 30; // 最多查询30次
  let attempts = 0;
  const pollInterval = 3000; // 每3秒查询一次

  const checkStatus = async () => {
    if (attempts >= maxAttempts) {
      showToast('支付超时，请稍后在订单中查看');
      return;
    }

    try {
      const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.orderStatus(orderId)));
      const result = await response.json();

      if (result.code === 200) {
        const { status } = result.data;

        if (status === 'paid') {
          // 支付成功，更新余额
          await updateBalanceFromServer();
          showRecharge.value = false;
          showToast(`支付成功！💎`);

          // 将当前订单号保存到localStorage，便于后续查询
          localStorage.setItem('ms_pro_last_order_id', orderId);
        } else if (status === 'pending') {
          // 继续等待支付
          attempts++;
          setTimeout(checkStatus, pollInterval);
        }
      }
    } catch (error) {
      console.error('查询订单状态失败:', error);
      attempts++;
      setTimeout(checkStatus, pollInterval);
    }
  };

  // 开始轮询
  setTimeout(checkStatus, pollInterval);
};

// 从服务器更新余额
const updateBalanceFromServer = async () => {
  try {
    const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.userBalance(userToken.value)));
    const result = await response.json();

    if (result.code === 200) {
      const { balance } = result.data;
      updateBalance(balance);
    }
  } catch (error) {
    console.error('更新余额失败:', error);
  }
};

onMounted(() => {
  // PWA 初始化逻辑 (略，由 Vite 插件自动处理)

  // 页面加载时同步余额
  updateBalanceFromServer();

  // 检查是否有未完成的订单
  const lastOrderId = localStorage.getItem('ms_pro_last_order_id');
  if (lastOrderId) {
    pollOrderStatus(lastOrderId);
  }
});
</script>

<style>
/* 极简动效 CSS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 字体优化 */
body {
  -webkit-font-smoothing: antialiased;
}
</style>
