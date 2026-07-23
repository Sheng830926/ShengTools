# ShengTools - 全方位線上多功能工具箱 🛠️

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![ES6 Modules](https://img.shields.io/badge/ES6_Modules-Native-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

ShengTools 是一個專為開發者、設計師及日常文字處理打造的**純前端、高效能線上多功能 Web 應用工具箱**。

所有運算（包含 JWE / AES 加解密、Hash 雜湊計算、文本比對、JSON 驗證等）皆**100% 於瀏覽器本地（Client-side）執行**，無任何後端傳輸，兼具極致的執行速度與資料隱私安全。

> 💡 **唯一例外**：貨幣轉換器會透過公開免費 API 取得即時匯率資料。

---

## 🚀 線上實體網站 (Live Demo)

👉 **[https://sheng830926.github.io/ShengTools/](https://sheng830926.github.io/ShengTools/)**

---

## ✨ 核心工具與特色功能

### 💻 開發工具 (Developer Tools) — 9 款
| 工具名稱 | ID | 說明 |
|----------|-----|------|
| 🔐 JWE 加解密工具 | `jwe-helper` | 相容 C# JweHelper.cs，A256KW + A256CBC-HS512 複合認證加密 |
| 🏢 公司加解密工具 | `company-crypto` | 相容 C# AesEncryptBase64 / AesDecryptBase64，SHA-256 Key 衍生 |
| #️⃣ Hash 雜湊生成器 | `hash-generator` | MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 + HMAC + 比對校驗 |
| 🌐 HTTP 狀態碼對照表 | `http-status` | 1xx～5xx 全套收錄，含常見原因、修復建議、RFC 說明 |
| 📄 MIME 類型對照表 | `mime-type` | 80+ 種 MIME 類型，涵蓋文本/圖片/影音/字型/壓縮檔/Office |
| 🛠️ JSON 格式化驗證器 | `json-formatter` | 語法高亮、格式化美化、壓縮與樹狀縮排 |
| 🔍 正規表達式測試器 | `regex-tester` | Pattern / Flags 設定，即時高亮匹配區段 |
| 🔢 進制與單位轉換器 | `converter-box` | 二/八/十/十六進制 + 長度/重量/溫度/面積度量 |
| 💱 貨幣轉換器 | `currency-converter` | 30+ 種貨幣即時匯率換算，快速切換與匯率一覽表 |

### ✍️ 文字工具 (Text Tools) — 7 款
| 工具名稱 | ID | 說明 |
|----------|-----|------|
| 🔀 文本比對器 | `text-compare` | 並排對照 + 行內字元級差異高亮 + 差異點快速跳轉 |
| 📝 Markdown 編輯器 | `markdown-editor` | 即時編譯預覽 + HTML 原始碼一鍵複製 |
| 🧮 字數統計器 | `word-counter` | 中英字元/單字/段落/行數即時統計 |
| 🔠 大小寫轉換器 | `case-converter` | UPPER / lower / Title / Sentence / camelCase / snake_case |
| 🔤 Base64 編解碼器 | `base64-codec` | UTF-8 編碼轉換，解決中文亂碼 |
| 🔗 URL 編解碼器 | `url-codec` | Percent-Encoding 快速轉碼 |
| 🔄 文字重複移除工具 | `text-dedup` | 按行/按單字/按字元去重 + 忽略大小寫 + 排序 |

### 🎨 設計與實用工具 (Design & Utility Tools) — 4 款
| 工具名稱 | ID | 說明 |
|----------|-----|------|
| 🎨 色彩工具與調色盤 | `color-tools` | HEX / RGB / HSL 互轉 + 螢幕 EyeDropper 取色 |
| 📱 QR Code 生成器 | `qr-generator` | 即時二維碼生成 + 多尺寸 + 一鍵下載 PNG |
| 🎰 幸運抽籤輪盤 | `lucky-wheel` | 自訂選項 + 物理減速旋轉動畫 + 中獎宣告 |
| 📅 日期計算器 | `date-calculator` | 日期差距 (天/時/週/月/年) + 工作天 + 加減推算 |

> 📊 **共計 20 款工具**

---

## ⚡ 技術亮點 (Technical Architecture)

| 特性 | 說明 |
|------|------|
| **Zero-Build** | 瀏覽器原生 ES Modules，無需 Node.js / Vite / Webpack |
| **模組化架構** | 每款工具為 `js/tools/*.js` 獨立模組，易維護易擴充 |
| **深淺主題** | 全域 Dark / Light Theme 切換，`localStorage` 記憶偏好 |
| **響應式** | 桌面側邊欄收合 (74px)、行動端漢堡選單、1600px 寬版 |
| **安全加密** | WebCrypto API 原生加解密，所有數據不離開瀏覽器 |

---

## 📁 專案檔案結構 (Directory Structure)

```text
ShengTools/
├── index.html                   # 主要 HTML 進入點
├── styles.css                   # 全域 CSS 樣式與主題變數
├── README.md                    # 專案說明文件 (本檔案)
├── LICENSE                      # MIT 授權條款
├── .gitignore                   # Git 忽略設定
├── .nojekyll                    # GitHub Pages 略過 Jekyll 建置
└── js/
    ├── app.js                   # 核心控制引擎 (路由、主題、側邊欄)
    ├── toolsConfig.js           # 工具總冊註冊清單
    └── tools/
        ├── utils.js             # 共用函式 (LCS Diff、Markdown、色彩轉換)
        │
        │  ── 開發工具 ──
        ├── jweHelper.js         # JWE 加解密 (A256KW + A256CBC-HS512)
        ├── companyCrypto.js     # 公司 AES-256-CBC 加解密
        ├── hashGenerator.js     # Hash 雜湊生成器 (MD5 / SHA / HMAC)
        ├── httpStatus.js        # HTTP 狀態碼對照表
        ├── mimeType.js          # MIME 類型查詢對照表 (80+ 種)
        ├── jsonFormatter.js     # JSON 格式化工具
        ├── regexTester.js       # 正規表達式測試器
        ├── converterBox.js      # 進制與單位轉換器
        ├── currencyConverter.js # 貨幣轉換器
        │
        │  ── 文字工具 ──
        ├── textCompare.js       # 文本比對器 (含行內字元差異)
        ├── markdownEditor.js    # Markdown 編輯器
        ├── wordCounter.js       # 字數統計器
        ├── caseConverter.js     # 文字大小寫轉換器
        ├── base64Codec.js       # Base64 編解碼器
        ├── urlCodec.js          # URL 編解碼器
        ├── textDedup.js         # 文字重複移除工具
        │
        │  ── 設計與實用工具 ──
        ├── colorTools.js        # 色彩工具與調色盤
        ├── qrGenerator.js       # QR Code 生成器
        ├── luckyWheel.js        # 幸運抽籤輪盤
        └── dateCalculator.js    # 日期計算器
```

---

## 💻 本地開啟與開發 (Local Development)

由於專案採用原生 ES Modules，**不可直接雙擊開啟 `index.html`**（瀏覽器 CORS 限制），需透過 HTTP 伺服器：

### 方法 1：VS Code Live Server（推薦）
```bash
# 1. 安裝 VS Code 擴充套件「Live Server」(Ritwick Dey)
# 2. 在 index.html 右鍵 → Open with Live Server
# 3. 瀏覽器自動開啟 http://127.0.0.1:5500
```

### 方法 2：Python
```bash
git clone https://github.com/Sheng830926/ShengTools.git
cd ShengTools
python -m http.server 8000
# 開啟 http://localhost:8000
```

### 方法 3：Node.js
```bash
npx serve
```

---

## 🤝 新增工具指引 (Contributing a New Tool)

1. 在 `js/tools/` 目錄新增 `yourTool.js`，匯出符合以下介面的物件：
   ```javascript
   export const yourTool = {
       id: "your-tool",          // URL 路由 ID (唯一)
       name: "工具名稱",          // 側邊欄顯示名稱
       icon: "fa-solid fa-xxx",  // Font Awesome 圖示
       category: "開發工具",      // 分類：開發工具 / 文字工具 / 實用工具 / 設計工具
       description: "工具描述",
       render: (container) => {  // 渲染函式，將 UI 寫入 container
           container.innerHTML = `...`;
       }
   };
   ```
2. 在 `js/toolsConfig.js` 中 `import` 並加入 `toolsConfig` 陣列。
3. 完成！工具自動出現在側邊欄與首頁卡片中。

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 條款開源，歡迎自由使用、修改與分享！
