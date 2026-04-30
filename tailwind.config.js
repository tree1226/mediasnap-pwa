// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem', // 超大圆角，更有现代感
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'], // 使用 2026 年流行的 Inter 字体
      },
    },
  },
  plugins: [],
}