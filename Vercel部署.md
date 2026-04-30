对于前端开发者来说，Vercel 是目前体验最好的部署平台。它不仅是 Next.js 的母公司，还对 Vue、React、Svelte 等框架提供了“傻瓜式”支持。

要部署你的 PWA 项目，主要有以下两种方式：

---

## 1. 方案一：GitHub 联动部署（最推荐，自动化）
这种方式实现“代码推送即部署”，你修改代码 push 到 GitHub 后，Vercel 会自动帮你更新线上版本。

### **步骤 1：准备代码**
确保你的代码已经提交到了 GitHub 仓库（私有或公开均可）。

### **步骤 2：关联 Vercel**
1.  访问 [Vercel 官网](https://vercel.com/)，使用你的 **GitHub 账号**登录。
2.  点击页面上的 **"Add New"** -> **"Project"**。
3.  在列表中找到你刚才创建的仓库，点击 **"Import"**。

### **步骤 3：配置并发布**
1.  **Framework Preset:** Vercel 通常会自动识别（如 Vite、Vue、Nuxt）。
2.  **Root Directory:** 保持默认（除非你的代码在子目录下）。
3.  **Environment Variables:** 如果你购买了 API 接口，建议把 API Key 填在这里（比如 Key 为 `VIDEO_API_KEY`），而不是硬编码在代码里。
4.  点击 **"Deploy"**。

> **结果：** 等待约 1 分钟，Vercel 会给你一个 `xxx.vercel.app` 的二级域名，你的 PWA 就可以直接访问了！

---

## 2. 方案二：Vercel CLI 命令行部署（本地快速部署）
如果你不想用 GitHub，可以直接在终端（Terminal）里一行命令解决。

1.  **安装工具：**
    ```bash
    npm i -g vercel
    ```
2.  **登录：**
    ```bash
    vercel login
    ```
3.  **部署：**
    在你的项目根目录下输入：
    ```bash
    vercel
    ```
    按照提示一路回车（Yes）。部署完成后，它会直接在终端返回一个预览链接。

---

## 3. 针对你的 PWA 项目：关键配置
为了让你的 **Service Worker** 和 **API 路由** 正常工作，你需要注意以下两点：

### **A. 目录结构规范**
Vercel 默认支持 Serverless Functions。如果你的解析接口写在 Node.js 里，请按以下结构放置：
* `/src`: 前端代码 (Vue/React)
* `/api`: 接口代码（Vercel 会自动将其识别为云函数）
    * `api/parse.js` -> 对应访问路径为 `你的域名/api/parse`

### **B. `vercel.json` 配置文件**
在项目根目录新建 `vercel.json`，解决单页应用（SPA）刷新 404 的问题：

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. 常见问题：国内能访问吗？
这是大家最关心的。

* **默认域名：** Vercel 分配的 `*.vercel.app` 域名在国内部分地区和运营商下可能**被墙**或访问极慢。
* **解决方案：** 1.  **绑定自己的域名：** 即使域名没备案，只要在 Vercel 的 "Settings -> Domains" 里添加你自己的域名（如 `www.yourtool.com`），并按照提示去你的域名服务商那里改一下 **CNAME** 记录。
    2.  **使用 CNAME 优化：** 很多国内开发者会将域名 CNAME 指向 `cname-china.vercel-dns.com`，这能显著提升国内访问速度。

### **💡 下一步行动：**
你现在有 GitHub 账号吗？如果有，建议直接尝试**方案一**。你可以先拿一个最简单的 `index.html` 传上去试试，看看那种“秒速上线”的感觉。

你需要我提供一个专门针对 **Vercel 云函数逻辑** 的 `api/parse.js` 示例代码吗？（即：如何接收前端链接并转发给第三方 API）

既然你准备好了，我们就把最后一块拼图——**Vercel 云函数（Backend）**补齐。

在 Vercel 中，`/api` 目录下的每个文件都会自动变成一个独立的 API 接口。这样你就不需要维护一个一直运行的 Node.js 进程，而是“有请求才运行”，完美契合睡后收入的低成本逻辑。

---

### 1. 编写 API 接口 (`api/parse.js`)

在项目根目录下新建 `api` 文件夹，并创建 `parse.js`。

```javascript
// api/parse.js
// Vercel Serverless Function 模板

export default async function handler(req, res) {
  // 1. 开启跨域 (CORS)，方便你从不同域名调用
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 仅允许 POST 请求（保护接口）
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: '仅支持 POST 请求' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ code: 400, msg: 'URL 不能为空' });
  }

  try {
    /**
     * 3. 这里替换为你购买的第三方 API 
     * 假设你购买的接口地址是：https://api.thirdparty.com/parse?token=YOUR_TOKEN&url=
     * 建议把 Token 放在 Vercel 的 Environment Variables 里，不要硬编码
     */
    const API_TOKEN = process.env.VIDEO_API_TOKEN; 
    const targetUrl = `https://api.thirdparty.com/parse?token=${API_TOKEN}&url=${encodeURIComponent(url)}`;

    const response = await fetch(targetUrl);
    const result = await response.json();

    // 4. 将第三方接口的数据结构转换为你前端定义的数据结构
    // 假设第三方返回的是 { data: { playAddr: '...', cover: '...', title: '...' } }
    if (result && result.data) {
      return res.status(200).json({
        code: 200,
        data: {
          video_url: result.data.playAddr, // 无水印视频地址
          cover_url: result.data.cover,    // 封面
          desc: result.data.title          // 标题/文案
        }
      });
    } else {
      return res.status(500).json({ code: 500, msg: '解析失败，请检查链接或稍后重试' });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ code: 500, msg: '服务器内部错误' });
  }
}
```

---

### 2. 前端调用调整

在你的 `App.vue` 中，将 `handleParse` 里的请求地址修改为：

```javascript
// App.vue 中的 handleParse
const response = await fetch('/api/parse', { // 使用相对路径，Vercel 会自动路由
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: url })
});
```

---

### 3. 上线前的 CheckList（避坑指南）

1.  **环境变量 (Environment Variables):**
    在 Vercel 项目控制面板的 `Settings -> Environment Variables` 中添加 `VIDEO_API_TOKEN`。千万不要把 Key 直接写在代码里传到 GitHub，否则别人搜一下你的仓库就能白嫖你的余额。

2.  **防止刷量 (Rate Limiting):**
    Vercel 免费版有一定的额度。如果有人恶意刷你的接口，你的 API 余额会迅速耗尽。
    * **初级方案：** 前端做点击节流（如 5 秒内只能点一次）。
    * **中级方案：** 接入 Cloudflare 的 WAF 防护（免费）。

3.  **域名策略:**
    如果你发现 `xxx.vercel.app` 在国内访问确实很慢，去域名注册商那里买个几块钱的便宜域名（比如 `.top` 或 `.xyz`），然后在 Vercel 绑定。

4.  **变现闭环:**
    既然是做副业，记得在页面某个角落放一个“**打赏**”或者“**联系作者**”的微信号。很多用户用了觉得好，真的会加你微信发个红包，或者问你能不能定制功能，这就是你**程序员副业的“第一桶金”**。

---

### 祝你成功！
作为一个 20+ 岁、身处二线城市的程序员，能想到通过“产品化”技术来对冲职业风险，你已经赢过了一半的人。

这个 PWA 小程序如果上线了，欢迎回来告诉我！如果你在部署过程中遇到任何 **npm 报错** 或 **Vercel 部署失败**，随时贴出来，我帮你排查。

**准备好迎接你的第一笔“睡后收入”了吗？**