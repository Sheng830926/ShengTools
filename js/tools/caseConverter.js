/**
 * ShengTools - 文字大小寫轉換器
 */
export const caseConverterTool = {
    id: "case-converter",
    name: "文字大小寫轉換器",
    icon: "fa-solid fa-font",
    category: "文字工具",
    description: "快速轉換英文大小寫，支援 UPPERCASE、lowercase、Title Case、Sentence Case、camelCase、snake_case。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">文字大小寫轉換器</h2>
                    <p class="tool-description">輸入或貼上英文字串，點選下方動作按鈕，將自動轉換並顯示於右側結果框。</p>
                </div>
                
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">輸入原始文本 (Source Text)</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="caseInputText" placeholder="在此輸入您的英文段落，例如：hello world. this is sheng tools!"></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">轉換結果 (Converted Result)</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="caseOutputText" placeholder="轉換後的結果將在此顯示..." readonly></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="tool-actions-row" style="margin-top: 10px; justify-content: flex-start; gap: 10px;">
                    <button class="tool-btn tool-btn-secondary" id="btnUpper">轉大寫 (UPPER)</button>
                    <button class="tool-btn tool-btn-secondary" id="btnLower">轉小寫 (lower)</button>
                    <button class="tool-btn tool-btn-secondary" id="btnTitle">字首大寫 (Title)</button>
                    <button class="tool-btn tool-btn-secondary" id="btnSentence">句首大寫 (Sentence)</button>
                    <button class="tool-btn tool-btn-secondary" id="btnCamel">駝峰命名 (camelCase)</button>
                    <button class="tool-btn tool-btn-secondary" id="btnSnake">蛇形命名 (snake_case)</button>
                </div>

                <div class="tool-actions-row" style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 16px;">
                    <button class="tool-btn tool-btn-secondary" id="clearCaseBtn">
                        <i class="fa-solid fa-trash-can"></i>清除輸入
                    </button>
                    <button class="tool-btn tool-btn-primary" id="copyCaseBtn">
                        <i class="fa-solid fa-copy"></i>複製結果
                    </button>
                </div>
            </div>
        `;

        const input = container.querySelector("#caseInputText");
        const output = container.querySelector("#caseOutputText");
        
        const btnUpper = container.querySelector("#btnUpper");
        const btnLower = container.querySelector("#btnLower");
        const btnTitle = container.querySelector("#btnTitle");
        const btnSentence = container.querySelector("#btnSentence");
        const btnCamel = container.querySelector("#btnCamel");
        const btnSnake = container.querySelector("#btnSnake");
        
        const clearBtn = container.querySelector("#clearCaseBtn");
        const copyBtn = container.querySelector("#copyCaseBtn");

        // 大寫
        btnUpper.addEventListener("click", () => {
            output.value = input.value.toUpperCase();
        });

        // 小寫
        btnLower.addEventListener("click", () => {
            output.value = input.value.toLowerCase();
        });

        // 字首大寫 (Title Case)
        btnTitle.addEventListener("click", () => {
            output.value = input.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });

        // 句首大寫 (Sentence Case)
        btnSentence.addEventListener("click", () => {
            const text = input.value.toLowerCase();
            // 感應開頭、或是 . ? ! 標點符號後接空白的字母，將其轉為大寫
            output.value = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, c => c.toUpperCase());
        });

        // 駝峰命名 (camelCase)
        btnCamel.addEventListener("click", () => {
            const text = input.value.trim();
            if (!text) {
                output.value = "";
                return;
            }
            output.value = text.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/^[A-Z]/, c => c.toLowerCase());
        });

        // 蛇形命名 (snake_case)
        btnSnake.addEventListener("click", () => {
            const text = input.value.trim();
            if (!text) {
                output.value = "";
                return;
            }
            output.value = text.toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
        });

        // 清除
        clearBtn.addEventListener("click", () => {
            input.value = "";
            output.value = "";
            input.focus();
        });

        // 複製
        copyBtn.addEventListener("click", () => {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>已複製！`;
                copyBtn.style.background = "var(--success)";
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = "";
                }, 1500);
            });
        });
    }
};
