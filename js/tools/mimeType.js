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
            // --- Text/Document types ---
            { ext: ".txt", mime: "text/plain", title: "純文字檔案", cat: "text", common: true, summary: "無格式純文字資料。", header: "Content-Type: text/plain; charset=utf-8", detail: "最基本的文字格式，沒有任何樣式。", extensions: [".txt"], config: "Nginx: text/plain txt;" },
            { ext: ".html", mime: "text/html", title: "HTML 超文本標記語言", cat: "text", common: true, summary: "萬維網網頁基本結構文件。", header: "Content-Type: text/html; charset=utf-8", detail: "瀏覽器預設渲染網頁的主要媒體類型。", extensions: [".html", ".htm"], config: "Nginx: text/html html htm;" },
            { ext: ".css", mime: "text/css", title: "CSS 層疊樣式表", cat: "text", common: true, summary: "控制網頁排版、顏色與佈局的樣式表檔案。", header: "Content-Type: text/css; charset=utf-8", detail: "HTML `<link rel=\"stylesheet\">` 標籤載入之樣式內容。", extensions: [".css"], config: "HTML: <link rel=\"stylesheet\" href=\"style.css\">" },
            { ext: ".js", mime: "text/javascript", title: "JavaScript 程式碼腳本", cat: "text", common: true, summary: "網頁與 Node.js 執行之 JavaScript 腳本。", header: "Content-Type: text/javascript; charset=utf-8", detail: "瀏覽器解析 JS 腳本或模組時必須具備正確的 text/javascript Header 以利快取與執行。", extensions: [".js", ".mjs"], config: "HTML: <script type=\"module\" src=\"app.js\"></script>" },
            { ext: ".csv", mime: "text/csv", title: "CSV 逗點分隔值", cat: "text", common: true, summary: "表格資料與 Excel 匯入匯出常用之純文字格式。", header: "Content-Type: text/csv; charset=utf-8", detail: "試算表與資料庫匯出預設文字格式。", extensions: [".csv"], config: "建議加入 BOM 或 UTF-8 標頭避免 Excel 中文亂碼" },
            { ext: ".xml", mime: "text/xml", title: "XML (Text)", cat: "text", common: false, summary: "人類可讀的結構化資料標記語言。", header: "Content-Type: text/xml; charset=utf-8", detail: "與 application/xml 類似，但更偏向純文字檢視。", extensions: [".xml"], config: "一般建議使用 application/xml" },
            { ext: ".md", mime: "text/markdown", title: "Markdown 標記語言", cat: "text", common: true, summary: "輕量級標記式語言。", header: "Content-Type: text/markdown; charset=utf-8", detail: "廣泛用於 README 說明與靜態網站產生器。", extensions: [".md", ".markdown"], config: "Nginx: text/markdown md;" },
            { ext: ".rtf", mime: "text/rtf", title: "RTF 富文本格式", cat: "text", common: false, summary: "支援跨平台文字樣式的格式。", header: "Content-Type: text/rtf", detail: "比純文字多樣式，但不若 Word 複雜。", extensions: [".rtf"], config: "Nginx: text/rtf rtf;" },
            { ext: ".ics", mime: "text/calendar", title: "iCalendar 日曆資料", cat: "text", common: false, summary: "行事曆與排程資料交換格式。", header: "Content-Type: text/calendar; charset=utf-8", detail: "包含事件、待辦事項等資訊。", extensions: [".ics", ".ifb"], config: "下載時搭配 Content-Disposition" },
            { ext: ".vcf", mime: "text/vcard", title: "vCard 電子名片", cat: "text", common: false, summary: "通訊錄與聯絡人資料交換標準。", header: "Content-Type: text/vcard", detail: "匯入匯出聯絡人時使用。", extensions: [".vcf"], config: "Nginx: text/vcard vcf;" },

            // --- Application types ---
            { ext: ".json", mime: "application/json", title: "JSON 資料交換格式", cat: "app", common: true, summary: "通用輕量級資料交換格式。", header: "Content-Type: application/json; charset=utf-8", detail: "Web API 標準格式。", extensions: [".json"], config: "Express: res.json()" },
            { ext: ".xml", mime: "application/xml", title: "XML 應用資料", cat: "app", common: true, summary: "結構化資料格式。", header: "Content-Type: application/xml; charset=utf-8", detail: "常用於 RSS/Sitemap。", extensions: [".xml"], config: "Nginx: application/xml xml;" },
            { ext: ".pdf", mime: "application/pdf", title: "PDF 可攜式文件", cat: "text", common: true, summary: "Adobe 跨平台文件格式。", header: "Content-Type: application/pdf", detail: "常用於報告、發票。", extensions: [".pdf"], config: "Header: Content-Disposition: inline" },
            { ext: ".zip", mime: "application/zip", title: "ZIP 壓縮檔", cat: "archive", common: true, summary: "廣泛使用的壓縮格式。", header: "Content-Type: application/zip", detail: "用於下載多檔案或備份。", extensions: [".zip"], config: "Header: Content-Disposition: attachment" },
            { ext: ".gz", mime: "application/gzip", title: "GZip 壓縮檔", cat: "archive", common: true, summary: "GNU Zip 壓縮格式。", header: "Content-Type: application/gzip", detail: "常用於伺服器日誌或 HTTP 傳輸壓縮。", extensions: [".gz"], config: "可搭配 Content-Encoding: gzip" },
            { ext: ".tar", mime: "application/x-tar", title: "TAR 封存檔", cat: "archive", common: false, summary: "UNIX 封存格式。", header: "Content-Type: application/x-tar", detail: "通常與 gzip 搭配為 .tar.gz。", extensions: [".tar"], config: "Nginx: application/x-tar tar;" },
            { ext: ".7z", mime: "application/x-7z-compressed", title: "7-Zip 壓縮檔", cat: "archive", common: false, summary: "高壓縮比的 7z 格式。", header: "Content-Type: application/x-7z-compressed", detail: "多用於大檔案壓縮。", extensions: [".7z"], config: "下載時指定 attachment" },
            { ext: ".rar", mime: "application/x-rar-compressed", title: "RAR 壓縮檔", cat: "archive", common: false, summary: "專有但常見的壓縮格式。", header: "Content-Type: application/x-rar-compressed", detail: "需專門解壓軟體。", extensions: [".rar"], config: "Nginx: application/x-rar-compressed rar;" },
            { ext: ".bz2", mime: "application/x-bzip2", title: "BZip2 壓縮檔", cat: "archive", common: false, summary: "開源壓縮格式。", header: "Content-Type: application/x-bzip2", detail: "壓縮率比 gzip 高但較慢。", extensions: [".bz2"], config: "Linux 系統常見" },
            { ext: ".js", mime: "application/javascript", title: "JavaScript (舊)", cat: "text", common: false, summary: "舊版 JS MIME 類型。", header: "Content-Type: application/javascript", detail: "目前官方已建議使用 text/javascript。", extensions: [".js"], config: "現代環境應改用 text/javascript" },
            { ext: ".ts", mime: "application/typescript", title: "TypeScript 腳本", cat: "text", common: false, summary: "強型別 JavaScript 超集。", header: "Content-Type: application/typescript", detail: "需編譯後執行，有時用於開發環境。", extensions: [".ts"], config: "瀏覽器不直接支援執行" },
            { ext: ".wasm", mime: "application/wasm", title: "WebAssembly", cat: "app", common: false, summary: "瀏覽器高效二進位模組。", header: "Content-Type: application/wasm", detail: "C/C++/Rust 等編譯至 Web。", extensions: [".wasm"], config: "需正確標頭以利串流編譯" },
            { ext: ".gql", mime: "application/graphql", title: "GraphQL", cat: "app", common: false, summary: "GraphQL 查詢與資料。", header: "Content-Type: application/graphql", detail: "特定 API 介面使用。", extensions: [".graphql", ".gql"], config: "通常 POST 主體為 application/json" },
            { ext: ".jsonld", mime: "application/ld+json", title: "JSON-LD", cat: "app", common: true, summary: "用於連結資料的 JSON。", header: "Content-Type: application/ld+json", detail: "廣泛用於 SEO 結構化資料。", extensions: [".jsonld"], config: "HTML: <script type=\"application/ld+json\">" },
            { ext: "schema", mime: "application/schema+json", title: "JSON Schema", cat: "app", common: false, summary: "描述 JSON 資料結構。", header: "Content-Type: application/schema+json", detail: "用於驗證 JSON 格式。", extensions: [".json"], config: "API 文件驗證用" },
            { ext: "URL", mime: "application/x-www-form-urlencoded", title: "Form URLEncoded", cat: "app", common: true, summary: "表單提交預設格式。", header: "Content-Type: application/x-www-form-urlencoded", detail: "key=value&... 格式。", extensions: [], config: "HTML <form> 預設 enctype" },
            { ext: ".bin", mime: "application/octet-stream", title: "二進位資料", cat: "app", common: true, summary: "未知的二進位檔案。", header: "Content-Type: application/octet-stream", detail: "預設會觸發瀏覽器下載。", extensions: [".bin", ".exe", ".dll"], config: "萬用下載類型" },
            { ext: ".sql", mime: "application/sql", title: "SQL 腳本", cat: "app", common: false, summary: "資料庫結構與查詢語言。", header: "Content-Type: application/sql", detail: "資料庫備份或轉移腳本。", extensions: [".sql"], config: "一般作為下載附件" },
            { ext: ".php", mime: "application/x-httpd-php", title: "PHP 腳本", cat: "app", common: false, summary: "伺服器端 PHP 腳本。", header: "Content-Type: application/x-httpd-php", detail: "通常不由外部直接下載，由伺服器執行。", extensions: [".php"], config: "Apache: AddType application/x-httpd-php .php" },
            { ext: ".jar", mime: "application/java-archive", title: "Java 封存檔", cat: "archive", common: false, summary: "Java 類別庫檔案。", header: "Content-Type: application/java-archive", detail: "Java 應用程式打包格式。", extensions: [".jar"], config: "Nginx: application/java-archive jar;" },
            { ext: ".swf", mime: "application/x-shockwave-flash", title: "Flash 動畫", cat: "app", common: false, summary: "已被淘汰的 Flash 格式。", header: "Content-Type: application/x-shockwave-flash", detail: "現代瀏覽器已不再支援。", extensions: [".swf"], config: "歷史遺留格式" },
            { ext: ".yaml", mime: "application/x-yaml", title: "YAML 資料", cat: "app", common: false, summary: "人類易讀的資料序列化格式。", header: "Content-Type: application/x-yaml", detail: "常見於設定檔 (如 Docker, CI/CD)。", extensions: [".yaml", ".yml"], config: "某些系統使用 text/yaml" },

            // --- Microsoft Office ---
            { ext: ".doc", mime: "application/msword", title: "Word 文件 (舊版)", cat: "text", common: true, summary: "舊版 Microsoft Word 檔案。", header: "Content-Type: application/msword", detail: "Office 97-2003 格式。", extensions: [".doc"], config: "下載時指定檔名" },
            { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", title: "Word 文件", cat: "text", common: true, summary: "現代 Microsoft Word 檔案。", header: "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document", detail: "基於 OOXML 的壓縮格式。", extensions: [".docx"], config: "常用文件下載格式" },
            { ext: ".xls", mime: "application/vnd.ms-excel", title: "Excel 試算表 (舊版)", cat: "text", common: true, summary: "舊版 Microsoft Excel 檔案。", header: "Content-Type: application/vnd.ms-excel", detail: "Office 97-2003 格式。", extensions: [".xls"], config: "下載時指定檔名" },
            { ext: ".xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", title: "Excel 試算表", cat: "text", common: true, summary: "現代 Microsoft Excel 檔案。", header: "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", detail: "現代商業資料常用格式。", extensions: [".xlsx"], config: "常用試算表下載格式" },
            { ext: ".ppt", mime: "application/vnd.ms-powerpoint", title: "PowerPoint (舊版)", cat: "text", common: false, summary: "舊版簡報檔案。", header: "Content-Type: application/vnd.ms-powerpoint", detail: "Office 97-2003 格式。", extensions: [".ppt"], config: "下載時指定檔名" },
            { ext: ".pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", title: "PowerPoint 簡報", cat: "text", common: true, summary: "現代簡報檔案。", header: "Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation", detail: "商業與教育常見格式。", extensions: [".pptx"], config: "常用簡報下載格式" },
            { ext: ".mdb", mime: "application/vnd.ms-access", title: "Access 資料庫", cat: "app", common: false, summary: "微軟桌面資料庫。", header: "Content-Type: application/vnd.ms-access", detail: "包含 .mdb 與 .accdb。", extensions: [".mdb", ".accdb"], config: "通常用於內網或桌面應用下載" },

            // --- OpenDocument ---
            { ext: ".odt", mime: "application/vnd.oasis.opendocument.text", title: "OpenDocument 文字", cat: "text", common: false, summary: "開放原始碼文件格式。", header: "Content-Type: application/vnd.oasis.opendocument.text", detail: "LibreOffice/OpenOffice 預設格式。", extensions: [".odt"], config: "開源界常用格式" },
            { ext: ".ods", mime: "application/vnd.oasis.opendocument.spreadsheet", title: "OpenDocument 試算表", cat: "text", common: false, summary: "開放原始碼試算表。", header: "Content-Type: application/vnd.oasis.opendocument.spreadsheet", detail: "LibreOffice Calc 格式。", extensions: [".ods"], config: "開源界常用格式" },
            { ext: ".odp", mime: "application/vnd.oasis.opendocument.presentation", title: "OpenDocument 簡報", cat: "text", common: false, summary: "開放原始碼簡報。", header: "Content-Type: application/vnd.oasis.opendocument.presentation", detail: "LibreOffice Impress 格式。", extensions: [".odp"], config: "開源界常用格式" },

            // --- Image types ---
            { ext: ".png", mime: "image/png", title: "PNG 無損壓縮圖片", cat: "image", common: true, summary: "支援透明背景的無損格式。", header: "Content-Type: image/png", detail: "適合 Logo、圖示。", extensions: [".png"], config: "HTML: <img src=\"image.png\">" },
            { ext: ".jpg", mime: "image/jpeg", title: "JPEG 有損壓縮圖片", cat: "image", common: true, summary: "廣泛用於攝影照片。", header: "Content-Type: image/jpeg", detail: "高色彩壓縮率，不支援透明度。", extensions: [".jpg", ".jpeg"], config: "Nginx: image/jpeg jpeg jpg;" },
            { ext: ".gif", mime: "image/gif", title: "GIF 動畫/圖片", cat: "image", common: true, summary: "支援簡單動畫的格式。", header: "Content-Type: image/gif", detail: "色彩數有限(256色)，適合小動畫。", extensions: [".gif"], config: "HTML: <img src=\"anim.gif\">" },
            { ext: ".webp", mime: "image/webp", title: "WebP 現代高效圖片", cat: "image", common: true, summary: "兼具極高壓縮率與透明度。", header: "Content-Type: image/webp", detail: "體積比 PNG/JPEG 小，現代網站首選。", extensions: [".webp"], config: "HTML5 <picture> 標籤支援" },
            { ext: ".svg", mime: "image/svg+xml", title: "SVG 向量圖形", cat: "image", common: true, summary: "無限放大不失真的向量格式。", header: "Content-Type: image/svg+xml; charset=utf-8", detail: "常用於 Icon 與 UI 元件。", extensions: [".svg"], config: "可直接內嵌於 HTML 中" },
            { ext: ".bmp", mime: "image/bmp", title: "BMP 點陣圖", cat: "image", common: false, summary: "未壓縮的點陣圖格式。", header: "Content-Type: image/bmp", detail: "檔案極大，現代網頁少用。", extensions: [".bmp"], config: "一般不建議用於 Web" },
            { ext: ".ico", mime: "image/x-icon", title: "ICO 網站圖示", cat: "image", common: true, summary: "網站 Favicon 格式。", header: "Content-Type: image/x-icon", detail: "存放多種解析度的圖示。", extensions: [".ico"], config: "HTML: <link rel=\"icon\" href=\"favicon.ico\">" },
            { ext: ".tiff", mime: "image/tiff", title: "TIFF 高解析圖片", cat: "image", common: false, summary: "排版與印刷常用的高品質圖。", header: "Content-Type: image/tiff", detail: "檔案大，網頁瀏覽器支援度低。", extensions: [".tiff", ".tif"], config: "用於專業圖像下載" },
            { ext: ".avif", mime: "image/avif", title: "AVIF 新世代圖片", cat: "image", common: false, summary: "基於 AV1 的極致壓縮圖片。", header: "Content-Type: image/avif", detail: "比 WebP 更小，但舊瀏覽器不支援。", extensions: [".avif"], config: "作為 <picture> 的 modern fallback" },
            { ext: ".heic", mime: "image/heic", title: "HEIC 蘋果高效率圖片", cat: "image", common: false, summary: "iOS 預設拍照格式。", header: "Content-Type: image/heic", detail: "基於 HEVC，網頁支援度差。", extensions: [".heic"], config: "通常需轉檔為 JPEG/WebP" },
            { ext: ".heif", mime: "image/heif", title: "HEIF 高效率圖片", cat: "image", common: false, summary: "類似 HEIC 的標準格式。", header: "Content-Type: image/heif", detail: "網頁支援度差。", extensions: [".heif"], config: "下載或備份用途" },
            { ext: ".apng", mime: "image/apng", title: "APNG 動畫 PNG", cat: "image", common: false, summary: "支援全彩透明動畫。", header: "Content-Type: image/apng", detail: "GIF 的現代替代品。", extensions: [".apng", ".png"], config: "部分軟體直接以 .png 儲存" },

            // --- Audio types ---
            { ext: ".mp3", mime: "audio/mpeg", title: "MP3 音訊檔", cat: "media", common: true, summary: "最常見的音訊壓縮格式。", header: "Content-Type: audio/mpeg", detail: "廣泛用於音樂播放。", extensions: [".mp3"], config: "HTML: <audio src=\"audio.mp3\">" },
            { ext: ".ogg", mime: "audio/ogg", title: "OGG 音訊", cat: "media", common: false, summary: "開源免授權費音訊格式。", header: "Content-Type: audio/ogg", detail: "常用於遊戲或網頁音效。", extensions: [".ogg"], config: "HTML: <audio src=\"audio.ogg\">" },
            { ext: ".wav", mime: "audio/wav", title: "WAV 無損音訊", cat: "media", common: true, summary: "未壓縮或低壓縮的高音質格式。", header: "Content-Type: audio/wav", detail: "檔案較大，適合短音效或編輯。", extensions: [".wav"], config: "Nginx: audio/x-wav wav;" },
            { ext: ".webm", mime: "audio/webm", title: "WebM 音訊", cat: "media", common: false, summary: "Google 專為 Web 設計格式。", header: "Content-Type: audio/webm", detail: "常搭配 Opus 編碼。", extensions: [".weba", ".webm"], config: "常用於瀏覽器麥克風錄音" },
            { ext: ".aac", mime: "audio/aac", title: "AAC 音訊", cat: "media", common: false, summary: "高音質有損壓縮。", header: "Content-Type: audio/aac", detail: "MP3 的後繼者，Apple 常用。", extensions: [".aac"], config: "串流媒體常見" },
            { ext: ".flac", mime: "audio/flac", title: "FLAC 無損壓縮音訊", cat: "media", common: false, summary: "保留完美音質的壓縮格式。", header: "Content-Type: audio/flac", detail: "發燒友與高品質音樂平台使用。", extensions: [".flac"], config: "現代瀏覽器已多數支援" },
            { ext: ".mid", mime: "audio/midi", title: "MIDI 音樂", cat: "media", common: false, summary: "數位樂器介面指令。", header: "Content-Type: audio/midi", detail: "不含實際錄音，只有音符資料。", extensions: [".mid", ".midi"], config: "網頁播放需特定 JS 庫支援" },
            { ext: ".m4a", mime: "audio/x-m4a", title: "M4A 音訊", cat: "media", common: false, summary: "Apple 常用音訊封裝格式。", header: "Content-Type: audio/x-m4a", detail: "通常包含 AAC 或 ALAC。", extensions: [".m4a"], config: "iTunes/Apple Music 常見格式" },

            // --- Video types ---
            { ext: ".mp4", mime: "video/mp4", title: "MP4 視訊檔", cat: "media", common: true, summary: "萬用網頁視訊格式。", header: "Content-Type: video/mp4", detail: "HTML5 首選串流格式，高相容性。", extensions: [".mp4"], config: "HTML: <video src=\"vid.mp4\">" },
            { ext: ".webm", mime: "video/webm", title: "WebM 視訊", cat: "media", common: true, summary: "為網頁最佳化之開源格式。", header: "Content-Type: video/webm", detail: "VP8/VP9 編碼，常支援透明影片。", extensions: [".webm"], config: "常做為 MP4 的替代方案" },
            { ext: ".ogg", mime: "video/ogg", title: "OGV 視訊", cat: "media", common: false, summary: "Ogg 封裝之視訊 (Theora)。", header: "Content-Type: video/ogg", detail: "較老舊的開源網頁影片標準。", extensions: [".ogv"], config: "歷史相容性使用" },
            { ext: ".avi", mime: "video/x-msvideo", title: "AVI 視訊", cat: "media", common: false, summary: "微軟開發之老牌視訊格式。", header: "Content-Type: video/x-msvideo", detail: "檔案大，網頁串流不佳。", extensions: [".avi"], config: "多作為下載用途" },
            { ext: ".mov", mime: "video/quicktime", title: "QuickTime 視訊", cat: "media", common: false, summary: "Apple 開發的視訊格式。", header: "Content-Type: video/quicktime", detail: "Mac 與 iOS 常見格式。", extensions: [".mov"], config: "網頁有時需轉為 MP4" },
            { ext: ".mkv", mime: "video/x-matroska", title: "MKV 視訊", cat: "media", common: false, summary: "高彈性開源多媒體封裝格式。", header: "Content-Type: video/x-matroska", detail: "支援多軌音訊/字幕，但網頁不直援。", extensions: [".mkv"], config: "作為下載分享用途" },
            { ext: ".flv", mime: "video/x-flv", title: "FLV 視訊", cat: "media", common: false, summary: "早期 Flash 影片格式。", header: "Content-Type: video/x-flv", detail: "已被淘汰。", extensions: [".flv"], config: "歷史遺留格式" },
            { ext: ".3gp", mime: "video/3gpp", title: "3GP 視訊", cat: "media", common: false, summary: "早期手機專用影片格式。", header: "Content-Type: video/3gpp", detail: "畫質極低，體積小。", extensions: [".3gp"], config: "舊型行動裝置相容" },
            { ext: ".wmv", mime: "video/x-ms-wmv", title: "WMV 視訊", cat: "media", common: false, summary: "Windows Media Video。", header: "Content-Type: video/x-ms-wmv", detail: "微軟舊版串流格式。", extensions: [".wmv"], config: "不適合跨平台 Web 使用" },

            // --- Font types ---
            { ext: ".woff", mime: "font/woff", title: "WOFF 網頁字型", cat: "app", common: false, summary: "Web Open Font Format。", header: "Content-Type: font/woff", detail: "第一代網頁壓縮字型，相容舊瀏覽器。", extensions: [".woff"], config: "Nginx: font/woff woff;" },
            { ext: ".woff2", mime: "font/woff2", title: "WOFF2 現代網頁字型", cat: "app", common: true, summary: "網頁開放字型格式 2.0。", header: "Content-Type: font/woff2", detail: "壓縮率極佳，現代 WebFont 首選。", extensions: [".woff2"], config: "CSS: @font-face { src: url(...) format('woff2'); }" },
            { ext: ".ttf", mime: "font/ttf", title: "TTF TrueType 字型", cat: "app", common: false, summary: "常見桌面字型格式。", header: "Content-Type: font/ttf", detail: "檔案較大，網頁上多轉為 woff2。", extensions: [".ttf"], config: "主要做為 Fallback" },
            { ext: ".otf", mime: "font/otf", title: "OTF OpenType 字型", cat: "app", common: false, summary: "支援進階排版的字型格式。", header: "Content-Type: font/otf", detail: "檔案較大。", extensions: [".otf"], config: "Nginx: font/otf otf;" },
            { ext: ".eot", mime: "font/eot", title: "EOT 字型", cat: "app", common: false, summary: "微軟專用嵌入式字型。", header: "Content-Type: font/eot", detail: "僅供極舊版 IE 使用，已淘汰。", extensions: [".eot"], config: "幾乎不再使用" },

            // --- Multipart ---
            { ext: "Form", mime: "multipart/form-data", title: "多部分表單資料", cat: "app", common: true, summary: "檔案上傳使用的格式。", header: "Content-Type: multipart/form-data; boundary=something", detail: "允許在一次請求中傳送文字與檔案。", extensions: [], config: "HTML: <form enctype=\"multipart/form-data\">" },
            { ext: "Range", mime: "multipart/byteranges", title: "多部分位元組範圍", cat: "app", common: false, summary: "HTTP 範圍請求回應。", header: "Content-Type: multipart/byteranges; boundary=something", detail: "用於斷點續傳或部分下載。", extensions: [], config: "伺服器處理 Range Header 時回傳" },

            // --- Other ---
            { ext: ".epub", mime: "application/epub+zip", title: "EPUB 電子書", cat: "app", common: false, summary: "國際標準電子書格式。", header: "Content-Type: application/epub+zip", detail: "實質上是 ZIP 壓縮的 HTML/CSS。", extensions: [".epub"], config: "電子書下載" },
            { ext: ".apk", mime: "application/vnd.android.package-archive", title: "Android APK", cat: "app", common: true, summary: "安卓應用程式安裝包。", header: "Content-Type: application/vnd.android.package-archive", detail: "手機下載後可直接安裝。", extensions: [".apk"], config: "需正確設定 MIME 以觸發安裝提示" },
            { ext: ".dmg", mime: "application/x-apple-diskimage", title: "macOS 磁碟映像", cat: "app", common: false, summary: "Mac 應用程式安裝映像檔。", header: "Content-Type: application/x-apple-diskimage", detail: "Mac 用戶軟體下載常見格式。", extensions: [".dmg"], config: "做為下載檔案" },
            { ext: ".kml", mime: "application/vnd.google-earth.kml+xml", title: "KML 地理資料", cat: "app", common: false, summary: "Google Earth 地標資料 (XML)。", header: "Content-Type: application/vnd.google-earth.kml+xml", detail: "記錄 GPS 與地圖軌跡。", extensions: [".kml"], config: "用於 GIS 系統整合" },
            { ext: ".kmz", mime: "application/vnd.google-earth.kmz", title: "KMZ 壓縮地理資料", cat: "app", common: false, summary: "壓縮後的 KML 地理資料。", header: "Content-Type: application/vnd.google-earth.kmz", detail: "包含 KML 及相關圖片。", extensions: [".kmz"], config: "用於 GIS 系統整合" },
            { ext: ".sqlite", mime: "application/x-sqlite3", title: "SQLite 資料庫", cat: "app", common: false, summary: "輕量級單檔關聯式資料庫。", header: "Content-Type: application/x-sqlite3", detail: "常見於行動應用與本地開發。", extensions: [".sqlite", ".db", ".sqlite3"], config: "作為資料匯出下載" },
            { ext: ".proto", mime: "application/protobuf", title: "Protocol Buffers", cat: "app", common: false, summary: "Google 高效資料序列化協定。", header: "Content-Type: application/protobuf", detail: "gRPC 常見資料交換格式。", extensions: [".proto"], config: "微服務架構間傳輸" },
            { ext: ".p12", mime: "application/x-pkcs12", title: "PKCS #12 憑證", cat: "app", common: false, summary: "包含私鑰的數位憑證檔。", header: "Content-Type: application/x-pkcs12", detail: "用於匯入匯出 SSL/身分憑證。", extensions: [".p12", ".pfx"], config: "高機密性檔案" },
            { ext: ".cer", mime: "application/x-x509-ca-cert", title: "X.509 數位憑證", cat: "app", common: false, summary: "公開金鑰憑證檔案。", header: "Content-Type: application/x-x509-ca-cert", detail: "SSL/TLS 伺服器與 CA 憑證。", extensions: [".cer", ".crt", ".der"], config: "安全憑證下載安裝" }
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
