/**
 * ShengTools - HTTP 狀態碼對照表
 */
export const httpStatusTool = {
    id: "http-status",
    name: "HTTP 狀態碼對照表",
    icon: "fa-solid fa-server",
    category: "開發工具",
    description: "查詢常見的 HTTP 狀態碼（1xx 至 5xx）及其正式定義與詳細解釋。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">HTTP 狀態碼對照表</h2>
                    <p class="tool-description">快速搜尋 HTTP 狀態代碼，支援依類別（1xx - 5xx）篩選與關鍵字搜尋。</p>
                </div>
                
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                    <!-- 搜尋列與過濾標籤 -->
                    <div style="display: grid; grid-template-columns: 1fr 200px; gap: 16px; align-items: center;">
                        <input type="text" id="statusCodeSearch" class="tool-input-field" placeholder="輸入狀態碼或關鍵字進行搜尋，例如：404 或 Not Found" autocomplete="off">
                        <select id="statusSeriesSelect" class="tool-select-field">
                            <option value="all" selected>全部狀態碼</option>
                            <option value="1">1xx 資訊性 (Informational)</option>
                            <option value="2">2xx 成功 (Successful)</option>
                            <option value="3">3xx 重新導向 (Redirection)</option>
                            <option value="4">4xx 用戶端錯誤 (Client Error)</option>
                            <option value="5">5xx 伺服器錯誤 (Server Error)</option>
                        </select>
                    </div>
                </div>

                <!-- 狀態碼網格區 -->
                <div class="tools-grid" id="statusCodesGrid" style="margin-top: 10px;">
                    <!-- 由 JavaScript 動態生成狀態碼卡片 -->
                </div>
            </div>
        `;

        const searchInput = container.querySelector("#statusCodeSearch");
        const seriesSelect = container.querySelector("#statusSeriesSelect");
        const codesGrid = container.querySelector("#statusCodesGrid");

        // 狀態碼定義資料庫
        const statusCodes = [
            { code: 100, title: "Continue", desc: "伺服器已收到請求的第一部分，用戶端應繼續發送其餘部分。" },
            { code: 101, title: "Switching Protocols", desc: "伺服器同意用戶端請求，正在切換協定（例如切換到 WebSocket）。" },
            { code: 200, title: "OK", desc: "請求成功！伺服器已成功傳回所要求的資源。" },
            { code: 201, title: "Created", desc: "請求成功且伺服器已建立新資源。通常用於 POST 建立資源。" },
            { code: 202, title: "Accepted", desc: "請求已被接受處理，但尚未完成。常用于非同步工作排程。" },
            { code: 204, title: "No Content", desc: "請求成功，但回應中沒有主體內容。常用于刪除 (DELETE) 成功。" },
            { code: 301, title: "Moved Permanently", desc: "資源已被永久移至新的 URL。後續請求應導向至新地址。" },
            { code: 302, title: "Found (Moved Temporarily)", desc: "資源目前暫時移至別的 URL，但後續請求仍應使用原地址。" },
            { code: 304, title: "Not Modified", desc: "資源自上次請求以來未修改，用戶端應直接使用本機快取以節省流量。" },
            { code: 400, title: "Bad Request", desc: "伺服器無法解析此請求。通常是語法錯誤、格式錯誤或參數無效。" },
            { code: 401, title: "Unauthorized", desc: "請求需要身分驗證。用戶端必須提供憑證（如認證標頭）以取得資源。" },
            { code: 403, title: "Forbidden", desc: "伺服器理解請求但拒絕授權。即使已登入，您也無權訪問此資源。" },
            { code: 404, title: "Not Found", desc: "伺服器找不到請求的資源。請確認網址是否正確，或資源已被刪除。" },
            { code: 405, title: "Method Not Allowed", desc: "該資源不支援此請求方法（例如：唯讀 API 嘗試使用 POST 請求）。" },
            { code: 408, title: "Request Timeout", desc: "請求逾時。伺服器等待請求時超出超時限制。" },
            { code: 409, title: "Conflict", desc: "請求與伺服器的目前資源狀態發生衝突。例如註冊了重複的帳號。" },
            { code: 429, title: "Too Many Requests", desc: "用戶端發送請求的頻率過高。已觸發伺服器速率限制 (Rate Limit)。" },
            { code: 500, title: "Internal Server Error", desc: "伺服器內部發生未知錯誤。通常是後端程式代碼報錯或崩潰。" },
            { code: 502, title: "Bad Gateway", desc: "網關或代理伺服器在嘗試執行請求時，從上游伺服器收到無效回應。" },
            { code: 503, title: "Service Unavailable", desc: "伺服器目前無法使用。通常是由於超載、臨時維護或故障。" },
            { code: 504, title: "Gateway Timeout", desc: "網關或代理伺服器未在規定時間內從上游伺服器收到回應。" }
        ];

        // 渲染狀態碼卡片
        const renderCodes = () => {
            const query = searchInput.value.trim().toLowerCase();
            const series = seriesSelect.value;

            const filtered = statusCodes.filter(item => {
                // 1. 系列過濾
                if (series !== "all") {
                    const firstDigit = Math.floor(item.code / 100).toString();
                    if (firstDigit !== series) return false;
                }

                // 2. 關鍵字搜尋
                if (query) {
                    const codeMatch = item.code.toString().includes(query);
                    const titleMatch = item.title.toLowerCase().includes(query);
                    const descMatch = item.desc.toLowerCase().includes(query);
                    return codeMatch || titleMatch || descMatch;
                }

                return true;
            });

            if (filtered.length === 0) {
                codesGrid.innerHTML = `
                    <div class="no-results" style="grid-column: 1 / -1;">
                        <i class="fa-solid fa-server"></i>
                        <div class="no-results-title">無匹配的狀態碼</div>
                        <p>請嘗試使用其它關鍵字進行搜尋。</p>
                    </div>
                `;
                return;
            }

            codesGrid.innerHTML = filtered.map(item => {
                const firstDigit = Math.floor(item.code / 100);
                
                // 決定卡片邊框/徽章色調
                let badgeColor = "var(--text-muted)";
                let cardBorder = "var(--border-color)";
                if (firstDigit === 2) {
                    badgeColor = "var(--success)";
                    cardBorder = "rgba(16, 185, 129, 0.2)";
                } else if (firstDigit === 3) {
                    badgeColor = "var(--warning)";
                    cardBorder = "rgba(245, 158, 11, 0.2)";
                } else if (firstDigit === 4) {
                    badgeColor = "var(--danger)";
                    cardBorder = "rgba(239, 68, 68, 0.2)";
                } else if (firstDigit === 5) {
                    badgeColor = "#b91c1c"; // 暗紅
                    cardBorder = "rgba(185, 28, 28, 0.25)";
                }

                return `
                    <div class="tool-card" style="cursor: default; border-color: ${cardBorder}; gap: 10px;">
                        <div class="card-header-area" style="align-items: center;">
                            <span class="card-title" style="font-size: 1.4rem; font-family: var(--font-mono); color: ${badgeColor}; font-weight: 700;">
                                ${item.code}
                            </span>
                            <span class="card-badge" style="background-color: var(--bg-tertiary); color: var(--text-secondary); font-size: 0.72rem; border-color: ${cardBorder};">
                                ${item.title}
                            </span>
                        </div>
                        <div class="card-body" style="gap: 4px;">
                            <p class="card-desc" style="-webkit-line-clamp: 4; font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;">
                                ${item.desc}
                            </p>
                        </div>
                    </div>
                `;
            }).join("");
        };

        // 監聽事件
        searchInput.addEventListener("input", renderCodes);
        seriesSelect.addEventListener("change", renderCodes);

        // 初始渲染
        renderCodes();
    }
};
