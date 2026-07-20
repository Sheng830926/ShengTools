/**
 * ShengTools - JSON 格式化與驗證
 */
export const jsonFormatterTool = {
    id: "json-formatter",
    name: "JSON 格式化與驗證",
    icon: "fa-solid fa-code",
    category: "開發工具",
    description: "美化排版 JSON 數據，支援一鍵壓縮、結構驗證與語法錯誤即時提示。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">JSON 格式化與驗證</h2>
                    <p class="tool-description">在左側貼上要處理的 JSON 內容，點擊「格式化」或「壓縮」進行排版。</p>
                </div>
                
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>原始 JSON 輸入</span>
                            <span class="category-count-badge">INPUT</span>
                        </div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="jsonInput" placeholder="請貼上您的 JSON 字串..."></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>輸出結果</span>
                            <span class="category-count-badge">OUTPUT</span>
                        </div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="jsonOutput" placeholder="處理結果將在此顯示..." readonly></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="error-msg-box" id="jsonError"></div>
                
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-secondary" id="clearJsonBtn">
                        <i class="fa-solid fa-trash-can"></i>一鍵清除
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="minifyJsonBtn">
                        <i class="fa-solid fa-compress"></i>壓縮 JSON
                    </button>
                    <button class="tool-btn tool-btn-primary" id="formatJsonBtn">
                        <i class="fa-solid fa-code"></i>格式化 JSON
                    </button>
                    <button class="tool-btn tool-btn-primary" id="copyJsonBtn">
                        <i class="fa-solid fa-copy"></i>複製結果
                    </button>
                </div>
            </div>
        `;

        const input = container.querySelector("#jsonInput");
        const output = container.querySelector("#jsonOutput");
        const errorBox = container.querySelector("#jsonError");
        const formatBtn = container.querySelector("#formatJsonBtn");
        const minifyBtn = container.querySelector("#minifyJsonBtn");
        const clearBtn = container.querySelector("#clearJsonBtn");
        const copyBtn = container.querySelector("#copyJsonBtn");

        const processJson = (format) => {
            const val = input.value.trim();
            if (!val) {
                output.value = "";
                errorBox.style.display = "none";
                return;
            }
            try {
                const parsed = JSON.parse(val);
                errorBox.style.display = "none";
                if (format) {
                    output.value = JSON.stringify(parsed, null, 4);
                } else {
                    output.value = JSON.stringify(parsed);
                }
            } catch (e) {
                errorBox.textContent = `❌ 解析失敗：${e.message}`;
                errorBox.style.display = "block";
                output.value = "";
            }
        };

        formatBtn.addEventListener("click", () => processJson(true));
        minifyBtn.addEventListener("click", () => processJson(false));
        clearBtn.addEventListener("click", () => {
            input.value = "";
            output.value = "";
            errorBox.style.display = "none";
            input.focus();
        });

        copyBtn.addEventListener("click", () => {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>已複製！`;
                setTimeout(() => copyBtn.innerHTML = originalText, 1500);
            });
        });
    }
};
