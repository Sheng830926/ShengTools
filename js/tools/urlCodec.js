/**
 * ShengTools - URL 編解碼器
 */
export const urlCodecTool = {
    id: "url-codec",
    name: "URL 編解碼器",
    icon: "fa-solid fa-link",
    category: "開發工具",
    description: "將網址查詢參數 (Query String) 進行 URL Percent-Encoding 編碼與解碼。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">URL 編解碼器</h2>
                    <p class="tool-description">將特殊字元、中文網址參數進行安全轉換，方便於瀏覽器或 API 請求傳送。</p>
                </div>
                
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">輸入網址或參數</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="urlInput" placeholder="在此輸入文字..."></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">輸出結果</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="urlOutput" placeholder="結果將在此顯示..." readonly></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="error-msg-box" id="urlError"></div>
                
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-secondary" id="clearUrlBtn">
                        <i class="fa-solid fa-trash-can"></i>清除
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="swapUrlBtn">
                        <i class="fa-solid fa-right-left"></i>交換
                    </button>
                    <button class="tool-btn tool-btn-primary" id="encodeUrlBtn">URL 編碼</button>
                    <button class="tool-btn tool-btn-primary" id="decodeUrlBtn">URL 解碼</button>
                    <button class="tool-btn tool-btn-primary" id="copyUrlBtn">
                        <i class="fa-solid fa-copy"></i>複製結果
                    </button>
                </div>
            </div>
        `;

        const input = container.querySelector("#urlInput");
        const output = container.querySelector("#urlOutput");
        const errorBox = container.querySelector("#urlError");
        const encodeBtn = container.querySelector("#encodeUrlBtn");
        const decodeBtn = container.querySelector("#decodeUrlBtn");
        const swapBtn = container.querySelector("#swapUrlBtn");
        const clearBtn = container.querySelector("#clearUrlBtn");
        const copyBtn = container.querySelector("#copyUrlBtn");

        encodeBtn.addEventListener("click", () => {
            errorBox.style.display = "none";
            try {
                output.value = encodeURIComponent(input.value);
            } catch (e) {
                errorBox.textContent = `❌ 編碼出錯：${e.message}`;
                errorBox.style.display = "block";
            }
        });

        decodeBtn.addEventListener("click", () => {
            errorBox.style.display = "none";
            try {
                output.value = decodeURIComponent(input.value);
            } catch (e) {
                errorBox.textContent = `❌ 解碼出錯：請確認輸入內容符合 URL 格式。`;
                errorBox.style.display = "block";
                output.value = "";
            }
        });

        swapBtn.addEventListener("click", () => {
            const temp = input.value;
            input.value = output.value;
            output.value = temp;
            errorBox.style.display = "none";
        });

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
