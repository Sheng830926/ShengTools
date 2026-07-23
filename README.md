# ShengTools - 全方位線上多功能工具箱 🛠️

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![ES6 Modules](https://img.shields.io/badge/ES6_Modules-Native-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)

ShengTools 是一個專為開發者、設計師及日常文字處理打造的**純前端、高效能線上多功能 Web 應用工具箱**。

所有運算（包含 JWE 加解密、Hash 雜湊計算、文本比對、JSON 驗證等）皆**100% 於瀏覽器本地（Client-side）執行**，無任何後端傳輸，兼具極致的執行速度與資料隱私安全。

---

## 🚀 線上實體網站 (Live Demo)

👉 **[https://sheng830926.github.io/ShengTools/](https://sheng830926.github.io/ShengTools/)**

---

## ✨ 核心工具與特色功能

### 💻 開發工具 (Developer Tools)
* 🔐 **JWE 加解密工具 (`jwe-helper`)**：
  * 相容 C# `JweHelper.cs` (JweService) 規範。
  * 採用 `A256KW` (AES Key Wrap) 與 `A256CBC-HS512` 複合認證加密演算法。
  * 輸入 `aPart` 與 `bPart` 金鑰，支援傳入標準 JSON 進行 JWE 加密，或輸入 JWE JSON 進行解密驗證。
* 🏢 **公司加解密工具 (`company-crypto`)**：
  * 相容 C# `AesEncryptBase64` / `AesDecryptBase64` AES-256-CBC 加解密邏輯。
  * 支援自訂 Key 與 IV，預載公司預設統編金鑰 (`12358067` / `76085321`)，SHA-256 Key 衍生與 16-byte 補零 IV 處理。
* #️⃣ **Hash 雜湊生成與驗證器 (`hash-generator`)**：
  * 支援 **MD5**、**SHA-1**、**SHA-256**、**SHA-384**、**SHA-512** 演算法。
  * 支援 HMAC 密鑰簽章計算 (HMAC-SHA256, HMAC-SHA512 等)。
  * 支援 Hex (小寫/大寫) 與 Base64 格式輸出，並提供單向雜湊值比對校驗 (Hash Compare)。
* 🌐 **HTTP 狀態碼對照表 (`http-status`)**：
  * 完整收錄 1xx 至 5xx 全套 HTTP 規範狀態碼。
  * 提供官方 RFC 說明、中文詳細解釋、**常見原因點列**、**修復建議**與快取/SEO 標籤。
  * 支援關鍵字/狀態碼搜尋與收藏功能。
* 📄 **MIME 類型查詢對照表 (`mime-type`)**：
  * 提供多媒體型態 (Content-Type) 檢索與常用副檔名標籤。
  * 包含 HTTP Header 範例、詳細說明與伺服器配置指引（Nginx `mime.types` / Express / HTML）。
* 🛠️ **JSON 格式化與驗證器 (`json-formatter`)**：
  * 即時語法高亮、格式化美化、壓縮與樹狀節點縮排。
* 🔍 **正規表達式測試器 (`regex-tester`)**：
  * 支援 Pattern 與 Flags (g, i, m) 設定，即時高亮匹配區段。
* 🔢 **進制與單位轉換器 (`converter-box`)**：
  * 多進制雙向同步（二/八/十/十六進制）。
  * 長度、重量、溫度與面積度量單位即時聯動換算。

### ✍️ 文字工具 (Text Tools)
* 🔀 **文本比對器 (`text-compare`)**：
  * 並排滾動對照，支援**同一行內字元級細微差異高亮**（紅刪/綠增）。
  * 提供刪除/新增行數統計、一鍵全文複製與**差異點快速跳轉按鈕 (⏮ / ⏭)**。
* 📝 **Markdown 編輯器 (`markdown-editor`)**：
  * 即時 Markdown 語法編譯與右側雙欄預覽，支援 HTML 原始碼一鍵複製。
* 🧮 **字數統計器 (`word-counter`)**：
  * 即時統計中英字元數（含/不含空白）、英文單字數、段落數與行數。
* 🔠 **文字大小寫轉換器 (`case-converter`)**：
  * 支援 `UPPERCASE`、`lowercase`、`Title Case`、`Sentence Case`、`camelCase` 與 `snake_case` 六種格式。
* 🔤 **Base64 編解碼器 (`base64-codec`)**：
  * 支援 UTF-8 編碼轉換，解決傳統 Base64 中文亂碼問題。
* 🔗 **URL 編解碼器 (`url-codec`)**：
  * 網址 Percent-Encoding 快速轉碼。

### 🎨 設計與實用工具 (Design & Utility Tools)
* 🎨 **色彩工具與調色盤 (`color-tools`)**：
  * HEX / RGB / HSL 色碼互轉、相鄰色與補色推薦調色盤。
  * 支援隨機顏色生成與原生的**螢幕 EyeDropper 滴管取色器**。
* 📱 **QR Code 生成器 (`qr-generator`)**：
  * 輸入網址或文字即時生成二維碼，支援多種尺寸設定與一鍵下載 PNG。
* 🎰 **幸運抽籤輪盤 (`lucky-wheel`)**：
  * 自訂抽籤選項，具備大氣的物理減速旋轉動畫與中獎視覺宣告。

---

## ⚡ 技術亮點 (Technical Architecture)

1. **Zero-Build 架構 (免建置工具)**：
   * 採用**瀏覽器原生 ES Modules** (`import` / `export`) 開發。
   * 不需要安裝 Node.js、Vite、Webpack 或 npm 依賴，開啟 HTML 即可直接運行。
2. **完全解耦模組化 (Modularized Design)**：
   * 每款工具皆為 `js/tools/*.js` 中的獨立模組，獨立維護、極易擴充。
3. **優雅響應式 UI (Modern Responsive Layout)**：
   * 支援全域深色/淺色主題模式 (Dark / Light Theme)。
   * 支援桌上型電腦**側邊欄收合模式 (74px)** 與行動端響應式選單。
   * 1600px 寬螢幕檢視空間，提升開發者工作效率。

---

## 📁 專案檔案結構 (Directory Structure)

```text
ShengTools/
├── index.html                   # 主要 HTML 進入點
├── styles.css                   # 全域 CSS 樣式與主題變數
├── .gitignore                   # Git 忽略檔案設定
└── js/
    ├── app.js                   # 核心控制引擎 (路由、主題與側邊欄)
    ├── toolsConfig.js           # 工具總冊註冊清單
    └── tools/
        ├── utils.js             # 共用演算法 (LCS Diff、Markdown、色彩轉換)
        ├── jweHelper.js         # JWE 加解密工具 (A256KW + A256CBC-HS512)
        ├── hashGenerator.js     # Hash 雜湊生成器 (MD5 / SHA / HMAC)
        ├── httpStatus.js        # HTTP 狀態碼對照表
        ├── mimeType.js          # MIME 類型查詢對照表
        ├── jsonFormatter.js     # JSON 格式化工具
        ├── base64Codec.js       # Base64 編解碼器
        ├── urlCodec.js          # URL 編解碼器
        ├── regexTester.js       # 正規表達式測試器
        ├── converterBox.js      # 進制與單位轉換器
        ├── textCompare.js       # 文本比對器 (含行內差異)
        ├── markdownEditor.js    # Markdown 編輯器
        ├── wordCounter.js       # 字數統計器
        ├── caseConverter.js     # 文字大小寫轉換器
        ├── colorTools.js        # 色彩工具與調色盤
        ├── qrGenerator.js       # QR Code 生成器
        └── luckyWheel.js        # 幸運抽籤輪盤
```

---

## 💻 本地開啟與開發 (Local Development)

由於專案採用原生 ES Modules 模組化技術，開啟時需透過任何靜態 HTTP 伺服器：

1. **複製專案**：
   ```bash
   git clone https://github.com/Sheng830926/ShengTools.git
   cd ShengTools
   ```
2. **開啟網頁**：
   * 使用 VS Code 插件 **Live Server** 點選 `Go Live`。
   * 或使用 Python 快速啟動本地伺服器：
     ```bash
     python -m http.server 8000
     ```
   * 於瀏覽器開啟 `http://localhost:8000` 即可進行測試與開發。

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 條款開源，歡迎自由使用、修改與分享！
