/**
 * ShengTools - MIME 類型查詢對照表 (含副檔名、標頭範例與伺服器配置)
 */
import { escapeHtml } from './utils.js';

export const mimeTypeTool = {
    id: "mime-type",
    name: "MIME 類型查詢對照表",
    icon: "fa-solid fa-file-code",
    category: "開發工具",
    description: "查詢常見的 MIME Type (Multipurpose Internet Mail Extensions) 與檔案副檔名、Content-Type 標頭範例與伺服器設定。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">MIME 類型查詢對照表</h2>
                    <p class="tool-description">搜尋常用網路媒體型態 (Content-Type)，包含常見副檔名、HTTP Header 範例與伺服器配置建議。</p>
                </div>

                <div class="http-filter-panel">
                    <div class="http-filter-top">
                        <div class="search-box" style="margin: 0; flex: 1;">
                            <i class="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="mimeSearchInput" placeholder="搜尋副檔名 (如 .json, .png)、MIME 類型 (如 application/pdf) 或關鍵字..." autocomplete="off">
                        </div>
                    </div>

                    <!-- 分類標籤 -->
                    <div class="home-category-filters" id="mimeCategoryTabs" style="border: none; padding: 0; margin: 0;">
                        <button class="filter-tab active" data-cat="all">全部類型</button>
                        <button class="filter-tab" data-cat="common">⭐ 常用</button>
                        <button class="filter-tab" data-cat="favorites">📌 我的收藏</button>
                        <button class="filter-tab" data-cat="text">📄 文本/文件</button>
                        <button class="filter-tab" data-cat="image">🖼️ 圖片</button>
                        <button class="filter-tab" data-cat="media">🎬 影音</button>
                        <button class="filter-tab" data-cat="app">⚙️ 應用/資料</button>
                        <button class="filter-tab" data-cat="archive">📦 壓縮檔</button>
                    </div>
                </div>

                <!-- 網格區 -->
                <div class="http-codes-grid" id="mimeGrid">
                    <!-- 由 JavaScript 動態生成卡片 -->
                </div>
            </div>
        `;

        const searchInput = container.querySelector("#mimeSearchInput");
        const categoryTabs = container.querySelectorAll("#mimeCategoryTabs .filter-tab");
        const mimeGrid = container.querySelector("#mimeGrid");

        let activeCat = "all";
        let favorites = JSON.parse(localStorage.getItem("shengtools-mime-favs") || "[]");

        // 完整 MIME 資料庫
        const mimeDatabase = [
            // --- 應用與資料 ---
            {
                ext: ".json", mime: "application/json", title: "JSON 資料交換格式",
                cat: "app", common: true,
                summary: "通用輕量級資料交換格式，廣泛用於 RESTful API 與現代網頁應用。",
                header: "Content-Type: application/json; charset=utf-8",
                detail: "JSON (JavaScript Object Notation) 為文字格式，完全獨立於語言，是 Web API 標準格式。",
                extensions: [".json"],
                config: "Nginx: application/json json; | Express: res.type('json') 或 res.json()"
            },
            {
                ext: ".js / .mjs", mime: "text/javascript", title: "JavaScript 程式碼腳本",
                cat: "text", common: true,
                summary: "網頁與 Node.js 執行之 JavaScript 腳本與 ES Modules 模組檔案。",
                header: "Content-Type: text/javascript; charset=utf-8",
                detail: "瀏覽器解析 JS 腳本或模組時必須具備正確的 text/javascript Header 以利快取與執行。",
                extensions: [".js", ".mjs", ".cjs"],
                config: "HTML: <script type=\"module\" src=\"app.js\"></script>"
            },
            {
                ext: ".html", mime: "text/html", title: "HTML 超文本標記語言",
                cat: "text", common: true,
                summary: "萬維網網頁基本結構文件。",
                header: "Content-Type: text/html; charset=utf-8",
                detail: "瀏覽器預設渲染網頁的主要媒體類型。",
                extensions: [".html", ".htm"],
                config: "Nginx: text/html html htm;"
            },
            {
                ext: ".css", mime: "text/css", title: "CSS 層疊樣式表",
                cat: "text", common: true,
                summary: "控制網頁排版、顏色與佈局的樣式表檔案。",
                header: "Content-Type: text/css; charset=utf-8",
                detail: "HTML `<link rel=\"stylesheet\">` 標籤載入之樣式內容。",
                extensions: [".css"],
                config: "HTML: <link rel=\"stylesheet\" href=\"style.css\">"
            },
            {
                ext: ".pdf", mime: "application/pdf", title: "PDF 可攜式文件格式",
                cat: "text", common: true,
                summary: "Adobe 開發的跨平台可攜式文件格式，保留完整排版。",
                header: "Content-Type: application/pdf",
                detail: "常用於發票、報告與下載文件，瀏覽器內建檢視器可直接開啓。",
                extensions: [".pdf"],
                config: "Header 設定 `Content-Disposition: inline` 可於線上直接預覽"
            },
            {
                ext: ".png", mime: "image/png", title: "PNG 無損壓縮圖片",
                cat: "image", common: true,
                summary: "支援透明背景 (Alpha Channel) 的無損點陣圖格式。",
                header: "Content-Type: image/png",
                detail: "適合 Logo、圖示與需要透明度背景的網頁圖片。",
                extensions: [".png"],
                config: "HTML: <img src=\"image.png\" alt=\"PNG\">"
            },
            {
                ext: ".jpg / .jpeg", mime: "image/jpeg", title: "JPEG 有損壓縮圖片",
                cat: "image", common: true,
                summary: "廣泛用於攝影照片與複雜色彩的網頁圖片。",
                header: "Content-Type: image/jpeg",
                detail: "高色彩壓縮率，適合相片但不支援透明度。",
                extensions: [".jpg", ".jpeg", ".jpe"],
                config: "Nginx: image/jpeg jpeg jpg;"
            },
            {
                ext: ".webp", mime: "image/webp", title: "WebP 現代高效圖片格式",
                cat: "image", common: true,
                summary: "Google 開發的現代網頁圖片格式，兼具極高壓縮率與透明度。",
                header: "Content-Type: image/webp",
                detail: "體積比 PNG/JPEG 小 25-35%，為現代網站首選圖片格式。",
                extensions: [".webp"],
                config: "HTML: <picture><source srcset=\"img.webp\" type=\"image/webp\"></picture>"
            },
            {
                ext: ".svg", mime: "image/svg+xml", title: "SVG 向量圖形",
                cat: "image", common: true,
                summary: "可無限放大不失真的 XML 向量圖形格式。",
                header: "Content-Type: image/svg+xml; charset=utf-8",
                detail: "常用於 Icon 圖示、UI 元件與向量插圖。",
                extensions: [".svg"],
                config: "HTML 可直接內嵌 `<svg>...</svg>`"
            },
            {
                ext: ".mp4", mime: "video/mp4", title: "MP4 視訊檔 (H.264 / AAC)",
                cat: "media", common: true,
                summary: "萬用網頁視訊格式，相容性最高。",
                header: "Content-Type: video/mp4",
                detail: "HTML5 `<video>` 標籤首選串流與播放影片格式。",
                extensions: [".mp4", ".m4v"],
                config: "HTML: <video src=\"video.mp4\" controls></video>"
            },
            {
                ext: ".mp3", mime: "audio/mpeg", title: "MP3 音訊檔",
                cat: "media", common: true,
                summary: "最常見的音訊壓縮格式。",
                header: "Content-Type: audio/mpeg",
                detail: "廣泛用於音樂播放與 Podcast 音訊串流。",
                extensions: [".mp3"],
                config: "HTML: <audio src=\"audio.mp3\" controls></audio>"
            },
            {
                ext: ".zip", mime: "application/zip", title: "ZIP 壓縮封包",
                cat: "archive", common: true,
                summary: "廣泛使用的資料壓縮與歸檔格式。",
                header: "Content-Type: application/zip",
                detail: "常用於檔案下載，配合 `Content-Disposition: attachment` 強制觸發瀏覽器下載。",
                extensions: [".zip"],
                config: "Header: Content-Disposition: attachment; filename=\"download.zip\""
            },
            {
                ext: ".csv", mime: "text/csv", title: "CSV 逗點分隔值文本",
                cat: "text", common: true,
                summary: "表格資料與 Excel 匯入匯出常用之純文字格式。",
                header: "Content-Type: text/csv; charset=utf-8",
                detail: "試算表與資料庫匯出預設文字格式。",
                extensions: [".csv"],
                config: "建議加入 BOM 或 UTF-8 標頭避免 Excel 中文亂碼"
            },
            {
                ext: ".xml", mime: "application/xml", title: "XML 可擴充標記語言",
                cat: "app", common: false,
                summary: "結構化資料標記語言，常用於 Sitemap 與舊版 Web API。",
                header: "Content-Type: application/xml; charset=utf-8",
                detail: "常用於 `sitemap.xml` 或 RSS Feed 訂閱。",
                extensions: [".xml"],
                config: "Nginx: application/xml xml;"
            },
            {
                ext: ".woff2", mime: "font/woff2", title: "WOFF2 現代網頁字型",
                cat: "app", common: true,
                summary: "網頁開放字型格式 2.0，壓縮率極佳。",
                header: "Content-Type: font/woff2",
                detail: "Google Fonts 與現代 WebFont 首選格式。",
                extensions: [".woff2"],
                config: "CSS: @font-face { font-family: 'MyFont'; src: url('font.woff2') format('woff2'); }"
            },
            {
                ext: ".wasm", mime: "application/wasm", title: "WebAssembly 二進位模組",
                cat: "app", common: false,
                summary: "瀏覽器高效能二進位程式碼執行格式 (C++/Rust/Go 編譯)。",
                header: "Content-Type: application/wasm",
                detail: "必須設定正確認證標頭以利瀏覽器進行 Streaming 串流編譯。",
                extensions: [".wasm"],
                config: "Nginx: application/wasm wasm;"
            }
        ];

        // 渲染 MIME 卡片清單
        const renderMimes = () => {
            const query = searchInput.value.trim().toLowerCase();

            const filtered = mimeDatabase.filter(item => {
                // 1. 分類標籤頁
                if (activeCat === "common" && !item.common) return false;
                if (activeCat === "favorites" && !favorites.includes(item.mime)) return false;
                if (["text", "image", "media", "app", "archive"].includes(activeCat)) {
                    if (item.cat !== activeCat) return false;
                }

                // 2. 關鍵字搜尋
                if (query) {
                    const extMatch = item.ext.toLowerCase().includes(query);
                    const mimeMatch = item.mime.toLowerCase().includes(query);
                    const titleMatch = item.title.toLowerCase().includes(query);
                    const summaryMatch = item.summary.toLowerCase().includes(query);
                    return extMatch || mimeMatch || titleMatch || summaryMatch;
                }

                return true;
            });

            if (filtered.length === 0) {
                mimeGrid.innerHTML = `
                    <div class="no-results" style="grid-column: 1 / -1;">
                        <i class="fa-solid fa-file-code"></i>
                        <div class="no-results-title">無匹配的 MIME 類型</div>
                        <p>找不到符合條件的 MIME 類型，請嘗試更換搜尋關鍵字。</p>
                    </div>
                `;
                return;
            }

            mimeGrid.innerHTML = filtered.map(item => {
                const isFav = favorites.includes(item.mime);
                
                let catBadgeText = "應用資料";
                let catBadgeClass = "tag-info";
                if (item.cat === "text") { catBadgeText = "文本文件"; catBadgeClass = "tag-success"; }
                else if (item.cat === "image") { catBadgeText = "圖片"; catBadgeClass = "tag-warning"; }
                else if (item.cat === "media") { catBadgeText = "影音"; catBadgeClass = "tag-seo"; }
                else if (item.cat === "archive") { catBadgeText = "壓縮檔"; catBadgeClass = "tag-danger"; }

                return `
                    <div class="http-card" data-mime="${item.mime}">
                        <div class="http-card-header">
                            <div class="http-code-title-row">
                                <span class="http-code-num" style="font-size: 1.6rem; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                    ${item.ext}
                                </span>
                                <span class="http-code-title" style="font-size: 1.1rem; font-family: var(--font-mono); color: var(--accent-light);">
                                    ${item.mime}
                                </span>
                            </div>
                            <p class="http-code-summary"><b>${item.title}</b> — ${item.summary}</p>

                            <!-- 標籤組 -->
                            <div class="http-tags-row">
                                <span class="http-tag ${catBadgeClass}">${catBadgeText}</span>
                                ${item.common ? `<span class="http-tag tag-common">⭐ 常用</span>` : ""}
                                <span class="http-tag tag-cache">Header: ${item.mime}</span>
                            </div>

                            <!-- 動作欄位 -->
                            <div class="http-action-row">
                                <button class="http-btn-toggle-details" data-action="toggle">
                                    <i class="fa-solid fa-chevron-down toggle-icon"></i> <span class="toggle-text">查看詳細</span>
                                </button>
                                <div style="display: flex; gap: 8px;">
                                    <button class="http-icon-btn ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? '取消收藏' : '加入收藏'}">
                                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
                                    </button>
                                    <button class="http-icon-btn" data-action="copy" title="複製 Content-Type Header">
                                        <i class="fa-solid fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 可收合詳細面板 -->
                        <div class="http-details-drawer" style="display: none;">
                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-heading"></i> HTTP Header 範例</div>
                                <div class="official-quote">${escapeHtml(item.header)}</div>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-circle-info"></i> 詳細說明</div>
                                <p class="http-detail-text">${item.detail}</p>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-file"></i> 包含副檔名</div>
                                <p class="http-detail-text" style="font-family: var(--font-mono); color: var(--accent-light);">
                                    ${item.extensions.join(", ")}
                                </p>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-sliders"></i> 伺服器 / 前端使用建議</div>
                                <div class="official-quote" style="border-left-color: var(--success);">${escapeHtml(item.config)}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            // 綁定卡片按鈕
            mimeGrid.querySelectorAll(".http-card").forEach(card => {
                const mime = card.getAttribute("data-mime");
                const toggleBtn = card.querySelector('[data-action="toggle"]');
                const favBtn = card.querySelector('[data-action="fav"]');
                const copyBtn = card.querySelector('[data-action="copy"]');
                const drawer = card.querySelector(".http-details-drawer");

                toggleBtn.addEventListener("click", () => {
                    const isHidden = drawer.style.display === "none";
                    drawer.style.display = isHidden ? "flex" : "none";
                    toggleBtn.querySelector(".toggle-text").textContent = isHidden ? "隱藏詳細" : "查看詳細";
                    toggleBtn.querySelector(".toggle-icon").style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
                    card.classList.toggle("expanded", isHidden);
                });

                favBtn.addEventListener("click", () => {
                    if (favorites.includes(mime)) {
                        favorites = favorites.filter(m => m !== mime);
                    } else {
                        favorites.push(mime);
                    }
                    localStorage.setItem("shengtools-mime-favs", JSON.stringify(favorites));
                    renderMimes();
                });

                copyBtn.addEventListener("click", () => {
                    const targetItem = mimeDatabase.find(m => m.mime === mime);
                    if (!targetItem) return;
                    navigator.clipboard.writeText(targetItem.header).then(() => {
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = `<i class="fa-solid fa-check" style="color:var(--success)"></i>`;
                        setTimeout(() => copyBtn.innerHTML = originalHTML, 1500);
                    });
                });
            });
        };

        // 搜尋事件
        searchInput.addEventListener("input", renderMimes);

        // 分類標籤事件
        categoryTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                categoryTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                activeCat = tab.getAttribute("data-cat");
                renderMimes();
            });
        });

        // 初始渲染
        renderMimes();
    }
};
