/**
 * ShengTools - HTTP 狀態碼對照表 (含詳細說明、常見原因、修復建議與標籤)
 */
export const httpStatusTool = {
    id: "http-status",
    name: "HTTP 狀態碼對照表",
    icon: "fa-solid fa-server",
    category: "開發與網路",
    description: "查詢完整的 HTTP 狀態碼（1xx 至 5xx），含官方規範、詳細說明、常見原因、修復建議與 SEO 影響標籤。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">HTTP 狀態碼對照表</h2>
                    <p class="tool-description">收錄全套 HTTP/1.1 與 HTTP/2 規範狀態碼，包含詳細原因分析、排錯建議與快取/SEO標籤。</p>
                </div>
                
                <div class="http-filter-panel">
                    <div class="http-filter-top">
                        <div class="search-box" style="margin: 0; flex: 1;">
                            <i class="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="statusCodeSearch" placeholder="搜尋狀態碼、英文、中文描述或常見原因 (例如 404, CORS, Timeout...)" autocomplete="off">
                        </div>
                    </div>

                    <!-- 系列與篩選標籤 -->
                    <div class="home-category-filters" id="httpSeriesTabs" style="border: none; padding: 0; margin: 0;">
                        <button class="filter-tab active" data-series="all">全部狀態碼</button>
                        <button class="filter-tab" data-series="common">⭐ 常用狀態碼</button>
                        <button class="filter-tab" data-series="favorites">📌 我的收藏</button>
                        <button class="filter-tab" data-series="1">1xx 資訊</button>
                        <button class="filter-tab" data-series="2">2xx 成功</button>
                        <button class="filter-tab" data-series="3">3xx 重定向</button>
                        <button class="filter-tab" data-series="4">4xx 客戶端錯誤</button>
                        <button class="filter-tab" data-series="5">5xx 伺服器錯誤</button>
                    </div>
                </div>

                <!-- 狀態碼列表網格區 -->
                <div class="http-codes-grid" id="statusCodesGrid">
                    <!-- 由 JavaScript 動態渲染狀態碼卡片 -->
                </div>
            </div>
        `;

        const searchInput = container.querySelector("#statusCodeSearch");
        const seriesTabs = container.querySelectorAll("#httpSeriesTabs .filter-tab");
        const codesGrid = container.querySelector("#statusCodesGrid");

        let activeSeries = "all";
        let favorites = JSON.parse(localStorage.getItem("shengtools-http-favs") || "[]");

        // 完整 HTTP 狀態碼資料庫
        const statusCodes = [
            // --- 1xx 資訊 ---
            {
                code: 100, title: "Continue", summary: "伺服器已收到請求的初始部分，用戶端應繼續發送其餘部分。",
                series: 1, common: false, seo: false, cacheable: false,
                official: "The server has received the request headers and the client should proceed to send the request body.",
                detail: "這是一個臨時回應，通知用戶端伺服器已收到標頭且未被拒絕，請繼續傳送主體（例如大檔案上傳）。",
                causes: ["發送帶有 Expect: 100-continue 標頭的大型 POST/PUT 請求"],
                fixes: ["用戶端確認收到 100 回應後繼續發送資料體", "如伺服器直接回應 417，可停用 Expect 標頭"]
            },
            {
                code: 101, title: "Switching Protocols", summary: "伺服器已同意用戶端的請求，正在切換傳輸協定。",
                series: 1, common: true, seo: false, cacheable: false,
                official: "The requester has asked the server to switch protocols and the server has agreed to do so.",
                detail: "常用於 HTTP 升級到 WebSocket 連線，使客戶端與伺服器能進行全雙工雙向即時通訊。",
                causes: ["客戶端發起 Upgrade: websocket 標頭的 HTTP 請求"],
                fixes: ["確認 Nginx/Apache 代理伺服器已設定 Proxy Upgrade 支援"]
            },
            {
                code: 102, title: "Processing", summary: " WebDAV 延伸代碼。伺服器已收到並正在處理請求，但尚未有回應。",
                series: 1, common: false, seo: false, cacheable: false,
                official: "An Information Response used to inform the client that the full request has been received and is being processed.",
                detail: "避免用戶端在等待長效伺服器運算時逾時中斷。",
                causes: ["非步式背景工作處理中"],
                fixes: ["通常無須處理，如逾時請檢查後端任務佇列"]
            },

            // --- 2xx 成功 ---
            {
                code: 200, title: "OK", summary: "請求成功。伺服器已成功傳回所要求的資源與回應資料。",
                series: 2, common: true, seo: true, cacheable: true,
                official: "Standard response for successful HTTP requests. The actual response will depend on the request method used.",
                detail: "這是最常見的成功狀態碼。GET 請求傳回資源主體、POST 傳回處理結果。",
                causes: ["HTTP 請求成功完成"],
                fixes: ["網頁與 API 運作正常，無須修復"]
            },
            {
                code: 201, title: "Created", summary: "請求成功且伺服器已成功建立新的資源。",
                series: 2, common: true, seo: false, cacheable: false,
                official: "The request has been fulfilled, resulting in the creation of a new resource.",
                detail: "常用於 RESTful API 的 POST 或 PUT 操作，回應通常在 Location 標頭中包含新資源的 URI。",
                causes: ["成功註冊帳號", "成功建立新的資料庫筆數"],
                fixes: ["確認回應標頭包含 Location 新資源網址"]
            },
            {
                code: 202, title: "Accepted", summary: "請求已被接受處理，但尚未執行完成。",
                series: 2, common: true, seo: false, cacheable: false,
                official: "The request has been accepted for processing, but the processing has not been completed.",
                detail: "用於異步處理（如排程任務、影片轉檔），表明請求合法但結果尚未產生。",
                causes: ["背景大量資料匯入", "非同步佇列任務"],
                fixes: ["提供查詢 Job ID API 供用戶端輪詢進度"]
            },
            {
                code: 204, title: "No Content", summary: "請求成功，但回應中沒有任何實體主體內容。",
                series: 2, common: true, seo: false, cacheable: false,
                official: "The server successfully processed the request, and is not returning any content.",
                detail: "常用於 DELETE 刪除操作成功，或是 CORS Preflight 預檢請求的 HTTP 204 回應。",
                causes: ["DELETE 刪除資源成功", "表單送出無須刷頁面", "CORS OPTIONS 回應"],
                fixes: ["確定程式碼沒有在 204 回應中強制傳送 JSON body"]
            },
            {
                code: 206, title: "Partial Content", summary: "伺服器已成功回應部分資源（分頁或分區段下載）。",
                series: 2, common: true, seo: false, cacheable: true,
                official: "The server is delivering only part of the resource due to a range header sent by the client.",
                detail: "常用於影片/音訊串流播放，或斷點續傳工具（如 Range: bytes=0-1024）。",
                causes: ["HTML5 Video/Audio 播放器要求串流區段", "多線程下載器"],
                fixes: ["確認伺服器支援 Content-Range 回應標頭"]
            },

            // --- 3xx 重定向 ---
            {
                code: 301, title: "Moved Permanently", summary: "資源已永久移動到新的網址 (URL)。權重與流量會轉移。",
                series: 3, common: true, seo: true, cacheable: true,
                official: "This and all future requests should be directed to the given URI.",
                detail: "SEO 關鍵狀態碼！搜尋引擎會將舊網址的排名與權重轉移到新網址，瀏覽器會強快取此導向。",
                causes: ["網站換網域", "HTTP 強制轉跳 HTTPS", "網頁 URL 改版結構變更"],
                fixes: ["確認回應包含正確的 Location 標頭", "如果只是暫時測試，應改用 302/307 避免被瀏覽器永久快取"]
            },
            {
                code: 302, title: "Found (Moved Temporarily)", summary: "資源目前暫時移至新的 URL，但未來仍應存取舊網址。",
                series: 3, common: true, seo: true, cacheable: false,
                official: "The target resource resides temporarily under a different URI.",
                detail: "常用於登入後暫時重定向到儀表板，或是活動宣傳頁暫時導向。",
                causes: ["未登入時暫時導向登入頁", "AB 測試暫時分流"],
                fixes: ["若欲傳遞 SEO 權重，請改用 301 重定向"]
            },
            {
                code: 304, title: "Not Modified", summary: "資源未修改。用戶端可直接使用本機快取內容以節省流量。",
                series: 3, common: true, seo: true, cacheable: true,
                official: "Indicates that the resource has not been modified since the version specified by the request headers.",
                detail: "當請求帶有 If-Modified-Since 或 If-None-Match (ETag) 標頭時，伺服器若無更新即傳回 304。",
                causes: ["靜態檔案 (CSS/JS/圖片)快取有效", "網頁未發生變更"],
                fixes: ["運作良好，可大幅減輕伺服器頻寬負擔"]
            },
            {
                code: 307, title: "Temporary Redirect", summary: "暫時重定向。並且嚴格保證 HTTP 方法（POST/GET）不被改變。",
                series: 3, common: true, seo: false, cacheable: false,
                official: "The request should be repeated with another URI, but future requests should still use the original URI.",
                detail: "與 302 類似，但明確規範用戶端不能將 POST 請求改成 GET 請求。",
                causes: ["表單提交後的安全暫時導向"],
                fixes: ["確認 Location 網址無誤"]
            },
            {
                code: 308, title: "Permanent Redirect", summary: "永久重定向。並且嚴格保證 HTTP 方法（POST/GET）不被改變。",
                series: 3, common: true, seo: true, cacheable: true,
                official: "The request and all future requests should be repeated using another URI.",
                detail: "與 301 類似，但明確規範用戶端不能將 POST 改成 GET。",
                causes: ["API 端點永久遷移且需維持 POST 方法"],
                fixes: ["確認舊客戶端是否支援 HTTP 308 規範"]
            },

            // --- 4xx 客戶端錯誤 ---
            {
                code: 400, title: "Bad Request", summary: "伺服器無法解析此請求。通常是語法錯誤、格式不符或缺少必要參數。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The server cannot or will not process the request due to an apparent client error.",
                detail: "用戶端傳送的 JSON 格式不合法、缺少必填欄位或型別不符合後端 API 規範。",
                causes: ["JSON 語法錯漏逗號或括號", "缺少必填 Query/Body 參數", "資料型別不符合要求"],
                fixes: ["檢查 Payload JSON 格式是否正確", "查看後端驗證 (Validation) 錯誤日誌", "使用工具測試 API 參數"]
            },
            {
                code: 401, title: "Unauthorized", summary: "請求需要身份驗證。用戶端未提供無效或過期的認證憑證。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.",
                detail: "使用者未登入，或是傳送的 JWT Token、API Key 已過期或不合法。",
                causes: ["Token / API Key 過期或未帶入 Authorization 標頭", "密碼輸入錯誤"],
                fixes: ["引導使用者重新登入取得新 Token", "確認 Authorization: Bearer <token> 標頭格式正確"]
            },
            {
                code: 403, title: "Forbidden", summary: "伺服器理解請求但拒絕執行。使用者身份權限不足或被禁止存取。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The request contained valid data and was understood by the server, but the server is refusing action.",
                detail: "與 401 不同，即使已經成功登入，如果帳號權限不足（例如普通會員存取管理者後台），將回傳 403。",
                causes: ["帳號權限 (Role/Permission) 不足", "IP 被伺服器防火牆封鎖", "CORS 跨網域存取被拒絕", "CSRF Token 驗證失敗"],
                fixes: ["確認該使用者是否具有足夠存取權限", "檢查伺服器 ACL 或 CORS 設定", "檢查伺服器目錄檔案存取權限 (Chmod)"]
            },
            {
                code: 404, title: "Not Found", summary: "伺服器找不到請求的資源。這是最常見、最知名的 HTTP 錯誤之一。",
                series: 4, common: true, seo: true, cacheable: false,
                official: "The requested resource could not be found but may be available in the future.",
                detail: "伺服器無法找到對應的 URL、檔案或資料庫筆數。對 SEO 影響極大。",
                causes: ["URL 拼寫錯誤", "資源或頁面已被刪除", "連結失效 (Dead Link)", "後端 API 路由設定錯誤"],
                fixes: ["檢查 URL 拼字與網址路徑是否正確", "若頁面遷移請設定 301 重定向", "建立友善的自訂 404 頁面", "定期檢查網站斷連"]
            },
            {
                code: 405, title: "Method Not Allowed", summary: "請求資源不支援此 HTTP 方法（如嘗試 POST 唯讀 API）。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "A request method is not supported for the requested resource.",
                detail: "目標網址存在，但該 URL 不接收客戶端使用的 Request Method (如 GET/POST/PUT/DELETE)。",
                causes: ["對只接受 GET 的網址發送 POST", "後端控制器未註冊該 HTTP Method"],
                fixes: ["檢查後端路由允許的方法", "確認回應標頭中的 Allow 欄位"]
            },
            {
                code: 408, title: "Request Timeout", summary: "請求逾時。伺服器等待用戶端發送請求時超出時間限制。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The server timed out waiting for the request.",
                detail: "連線速度過慢或客戶端在上傳大型檔案時中斷發送。",
                causes: ["網路連線不穩定", "上傳檔案過大且傳輸過慢"],
                fixes: ["重新發送請求", "檢查用戶端網路連線與頻寬"]
            },
            {
                code: 409, title: "Conflict", summary: "請求與伺服器當前的資源狀態發生衝突。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "Indicates that the request could not be processed because of conflict in the current state of the resource.",
                detail: "常用於資料庫重複鍵衝突，例如重複註冊已被使用的 Email 帳號。",
                causes: ["註冊重複的 Username/Email", "多人在同一時間修改同筆資料 (版本衝突)"],
                fixes: ["提示使用者更換名稱或重新載入最新資料版本"]
            },
            {
                code: 410, title: "Gone", summary: "資源已被永久刪除，且未來也不會再提供。",
                series: 4, common: true, seo: true, cacheable: true,
                official: "Indicates that the resource requested is no longer available and will not be available again.",
                detail: "比 404 更明確表明資源是故意被永久移除的，搜尋引擎會立刻清空此頁快取與排名。",
                causes: ["過期的限時活動頁面永久下架", "使用者已被永久註銷"],
                fixes: ["如果是永久下架請保持 410 通知搜尋引擎清空快取"]
            },
            {
                code: 413, title: "Payload Too Large", summary: "請求實體過大。發送的資料超出了伺服器設定的限制。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The request is larger than the server is willing or able to process.",
                detail: "上傳的圖片或檔案超出伺服器（如 Nginx `client_max_body_size`）上限。",
                causes: ["上傳巨大檔案 (例如 100MB 影片)"],
                fixes: ["增大 Nginx 或後端 Node.js/PHP 的檔案上傳大小限制", "前端先對圖片進行壓縮"]
            },
            {
                code: 415, title: "Unsupported Media Type", summary: "不支援的媒體類型。請求傳送的 Content-Type 不受支援。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The request entity has a media type which the server or resource does not support.",
                detail: "後端只接收 `application/json`，但前端傳送了 `text/plain` 或 `application/x-www-form-urlencoded`。",
                causes: ["前端請求標頭 Content-Type 設定錯誤"],
                fixes: ["檢查並確保 Header 設定為 `Content-Type: application/json`"]
            },
            {
                code: 418, title: "I'm a teapot", summary: "愚人節彩蛋狀態碼：我是一個茶壺，無法愚蠢地用來沖泡咖啡。",
                series: 4, common: false, seo: false, cacheable: false,
                official: "Any attempt to brew coffee with a teapot should result in the error code 418 I'm a teapot.",
                detail: "出自 1998 年超文字咖啡壺控制協定 (HTCPCP/1.0) 愚人節規範。",
                causes: ["嘗試用茶壺泡咖啡"],
                fixes: ["請改用咖啡機！☕"]
            },
            {
                code: 422, title: "Unprocessable Entity", summary: "語法正確但包含語意錯誤。伺服器無法處理所包含的指令。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The request was well-formed but was unable to be followed due to semantic errors.",
                detail: "常用於現代 API（如 Laravel/FastAPI）在表單欄位驗證失敗時回傳細節。",
                causes: ["Email 格式不對", "密碼長度不足", "欄位值超出範圍"],
                fixes: ["檢查 API 回應體中的 validation error 欄位說明"]
            },
            {
                code: 429, title: "Too Many Requests", summary: "請求頻率過高。發送過多請求，已觸發伺服器速率限制 (Rate Limit)。",
                series: 4, common: true, seo: false, cacheable: false,
                official: "The user has sent too many requests in a given amount of time (rate limiting).",
                detail: "後端防刷、防 DDOS 或 API 計費速率保護。回應通常包含 `Retry-After` 標頭。",
                causes: ["短時間內頻繁發送 API 請求", "爬蟲程式刷網頁過快"],
                fixes: ["降低請求頻率", "加入 Retry-After 延遲重試機制", "API 密鑰升級流量方案"]
            },

            // --- 5xx 伺服器錯誤 ---
            {
                code: 500, title: "Internal Server Error", summary: "伺服器內部發生未知錯誤。通常是後端程式碼報錯崩潰。",
                series: 5, common: true, seo: true, cacheable: false,
                official: "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
                detail: "極常見的後端崩潰錯誤。代表程式出現 Exception、NullPointer 或資料庫連線中斷。",
                causes: ["後端代碼未捕捉的程式例外 (Uncaught Exception)", "資料庫連線失敗", "檔案讀寫權限不足"],
                fixes: ["檢查伺服器應用程式 error.log 錯誤日誌", "嘗試除錯 (Debug) 後端程式碼", "確保資料庫正常運作"]
            },
            {
                code: 501, title: "Not Implemented", summary: "伺服器不支援完成請求所需的功能。",
                series: 5, common: false, seo: false, cacheable: false,
                official: "The server either does not recognize the request method, or it lacks the ability to fulfil the request.",
                detail: "常用於 API 尚在開發中、尚未實作該 HTTP 方法。",
                causes: ["呼叫了未完成的 API 端點"],
                fixes: ["完成該 API 方法的後端邏輯實作"]
            },
            {
                code: 502, title: "Bad Gateway", summary: "錯誤的網關。伺服器作為代理時，從上游伺服器收到無效回應。",
                series: 5, common: true, seo: true, cacheable: false,
                official: "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",
                detail: "常見於 Nginx / Apache 作為反向代理時，與後端 Node.js / PHP-FPM / Python 進程連線失敗或進程掛掉。",
                causes: ["後端 Node.js/Python 服務崩潰停擺", "PHP-FPM 進程崩潰", "反向代理設定的方向或 Port 號錯誤"],
                fixes: ["檢查後端應用服務 (PM2/Docker/Gunicorn) 是否存活", "檢查 Nginx proxy_pass 連線埠號是否正確"]
            },
            {
                code: 503, title: "Service Unavailable", summary: "服務目前無法使用。通常是由於伺服器超載或臨時停機維護。",
                series: 5, common: true, seo: true, cacheable: false,
                official: "The server cannot handle the request (because it is overloaded or down for maintenance).",
                detail: "伺服器目前超載或正在進行維護。搜尋引擎遇到 503 會稍後再來爬取，不會立刻下架頁面。",
                causes: ["網站流量突然爆滿 (超載)", "伺服器正在進行停機維護", "後端資料庫連線池滿載"],
                fixes: ["加入 Retry-After 標頭告知重新存取時間", "擴充伺服器硬體規格或啟用負載平衡 (Load Balancer)"]
            },
            {
                code: 504, title: "Gateway Timeout", summary: "網關連線逾時。伺服器作為代理時，在上游伺服器回應超時。",
                series: 5, common: true, seo: true, cacheable: false,
                official: "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
                detail: "Nginx 連線到後端 API 時，後端執行 SQL 查詢或運算耗時太久超出 Nginx `proxy_read_timeout`。",
                causes: ["後端 SQL 查詢過慢 (慢查詢)", "呼叫第三方外部 API 逾時", "後端陷入死迴圈"],
                fixes: ["優化後端 SQL 查詢語法與索引", "增加反向代理 (Nginx) 的 timeout 設定時間", "將耗時任務改為背景異步處理"]
            }
        ];

        // 渲染狀態碼卡片清單
        const renderCodes = () => {
            const query = searchInput.value.trim().toLowerCase();

            const filtered = statusCodes.filter(item => {
                // 1. 標籤頁過濾
                if (activeSeries === "common" && !item.common) return false;
                if (activeSeries === "favorites" && !favorites.includes(item.code)) return false;
                if (["1", "2", "3", "4", "5"].includes(activeSeries)) {
                    if (item.series.toString() !== activeSeries) return false;
                }

                // 2. 關鍵字搜尋
                if (query) {
                    const codeMatch = item.code.toString().includes(query);
                    const titleMatch = item.title.toLowerCase().includes(query);
                    const summaryMatch = item.summary.toLowerCase().includes(query);
                    const detailMatch = item.detail.toLowerCase().includes(query);
                    const causeMatch = item.causes.some(c => c.toLowerCase().includes(query));
                    return codeMatch || titleMatch || summaryMatch || detailMatch || causeMatch;
                }

                return true;
            });

            if (filtered.length === 0) {
                codesGrid.innerHTML = `
                    <div class="no-results" style="grid-column: 1 / -1;">
                        <i class="fa-solid fa-server"></i>
                        <div class="no-results-title">無匹配的 HTTP 狀態碼</div>
                        <p>找不到符合條件的狀態碼，請嘗試更換搜尋關鍵字或分類。</p>
                    </div>
                `;
                return;
            }

            codesGrid.innerHTML = filtered.map(item => {
                const isFav = favorites.includes(item.code);
                let seriesName = `${item.series}xx 類別`;
                let badgeClass = "tag-info";

                if (item.series === 2) { seriesName = "2xx 成功 Successful"; badgeClass = "tag-success"; }
                else if (item.series === 3) { seriesName = "3xx 重定向 Redirection"; badgeClass = "tag-warning"; }
                else if (item.series === 4) { seriesName = "4xx 客戶端錯誤 Client Error"; badgeClass = "tag-danger"; }
                else if (item.series === 5) { seriesName = "5xx 伺服器錯誤 Server Error"; badgeClass = "tag-server-error"; }

                return `
                    <div class="http-card" data-code="${item.code}">
                        <!-- 卡片頂部欄 -->
                        <div class="http-card-header">
                            <div class="http-code-title-row">
                                <span class="http-code-num">${item.code}</span>
                                <span class="http-code-title">${item.title}</span>
                            </div>
                            <p class="http-code-summary">${item.summary}</p>

                            <!-- 標籤組 -->
                            <div class="http-tags-row">
                                <span class="http-tag ${badgeClass}">${seriesName}</span>
                                ${item.common ? `<span class="http-tag tag-common">⭐ 常用</span>` : ""}
                                ${item.seo ? `<span class="http-tag tag-seo">SEO 相關</span>` : ""}
                                <span class="http-tag tag-cache">${item.cacheable ? "可快取" : "不可快取"}</span>
                            </div>

                            <!-- 操控控制按鈕 -->
                            <div class="http-action-row">
                                <button class="http-btn-toggle-details" data-action="toggle">
                                    <i class="fa-solid fa-chevron-down toggle-icon"></i> <span class="toggle-text">查看詳細</span>
                                </button>
                                <div style="display: flex; gap: 8px;">
                                    <button class="http-icon-btn ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? '取消收藏' : '加入收藏'}">
                                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
                                    </button>
                                    <button class="http-icon-btn" data-action="copy" title="複製狀態碼與標題">
                                        <i class="fa-solid fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 可收合詳細資訊面板 (Matching Image 2) -->
                        <div class="http-details-drawer" style="display: none;">
                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-book-bookmark"></i> 官方說明</div>
                                <div class="http-detail-box official-quote">${escapeHtml(item.official)}</div>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-file-lines"></i> 詳細說明</div>
                                <p class="http-detail-text">${item.detail}</p>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-magnifying-glass"></i> 常見原因</div>
                                <ul class="http-list causes-list">
                                    ${item.causes.map(c => `<li>${escapeHtml(c)}</li>`).join("")}
                                </ul>
                            </div>

                            <div class="http-detail-section">
                                <div class="http-detail-label"><i class="fa-solid fa-wrench"></i> 修復建議</div>
                                <ul class="http-list fixes-list">
                                    ${item.fixes.map(f => `<li>${escapeHtml(f)}</li>`).join("")}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            // 綁定卡片按鈕事件
            codesGrid.querySelectorAll(".http-card").forEach(card => {
                const code = parseInt(card.getAttribute("data-code"));
                const toggleBtn = card.querySelector('[data-action="toggle"]');
                const favBtn = card.querySelector('[data-action="fav"]');
                const copyBtn = card.querySelector('[data-action="copy"]');
                const drawer = card.querySelector(".http-details-drawer");

                // 查看詳細 toggle
                toggleBtn.addEventListener("click", () => {
                    const isHidden = drawer.style.display === "none";
                    drawer.style.display = isHidden ? "flex" : "none";
                    toggleBtn.querySelector(".toggle-text").textContent = isHidden ? "隱藏詳細" : "查看詳細";
                    toggleBtn.querySelector(".toggle-icon").style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
                    card.classList.toggle("expanded", isHidden);
                });

                // 收藏按鈕
                favBtn.addEventListener("click", () => {
                    if (favorites.includes(code)) {
                        favorites = favorites.filter(c => c !== code);
                    } else {
                        favorites.push(code);
                    }
                    localStorage.setItem("shengtools-http-favs", JSON.stringify(favorites));
                    renderCodes();
                });

                // 複製按鈕
                copyBtn.addEventListener("click", () => {
                    const targetItem = statusCodes.find(s => s.code === code);
                    if (!targetItem) return;
                    const copyText = `${targetItem.code} ${targetItem.title} - ${targetItem.summary}`;
                    navigator.clipboard.writeText(copyText).then(() => {
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = `<i class="fa-solid fa-check" style="color:var(--success)"></i>`;
                        setTimeout(() => copyBtn.innerHTML = originalHTML, 1500);
                    });
                });
            });
        };

        // 搜尋事件
        searchInput.addEventListener("input", renderCodes);

        // 標籤頁事件
        seriesTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                seriesTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                activeSeries = tab.getAttribute("data-series");
                renderCodes();
            });
        });

        // 初始渲染
        renderCodes();
    }
};

// 輔助 HTML Escape
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
