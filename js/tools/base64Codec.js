/**
 * ShengTools - Base64 編解碼器
 */
import { utf8_to_b64, b64_to_utf8 } from './utils.js';

export const base64CodecTool = {
    id: "base64-codec",
    name: "Base64 編解碼器",
    icon: "fa-solid fa-key",
    category: "開發工具",
    description: "對文字字串進行 Base64 的編碼與解碼，完整支援萬國碼 (UTF-8) 不會產生亂碼。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">Base64 編解碼器</h2>
                    <p class="tool-description">輸入您想編碼的純文字，或是要解碼的 Base64 代碼，支援中文字元雙向轉換。</p>
                </div>
                
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">輸入字元</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="b64Input" placeholder="在此輸入您的文字..."></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">輸出結果</div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="b64Output" placeholder="轉換結果顯示在此..." readonly></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="error-msg-box" id="b64Error"></div>
                
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-secondary" id="clearB64Btn">
                        <i class="fa-solid fa-trash-can"></i>清除
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="swapB64Btn">
                        <i class="fa-solid fa-right-left"></i>交換
                    </button>
                    <button class="tool-btn tool-btn-primary" id="encodeB64Btn">
                        <i class="fa-solid fa-lock"></i>Base64 編碼
                    </button>
                    <button class="tool-btn tool-btn-primary" id="decodeB64Btn">
                        <i class="fa-solid fa-unlock"></i>Base64 解碼
                    </button>
                    <button class="tool-btn tool-btn-primary" id="copyB64Btn">
                        <i class="fa-solid fa-copy"></i>複製結果
                    </button>
                </div>
            </div>
        `;

        const input = container.querySelector("#b64Input");
        const output = container.querySelector("#b64Output");
        const errorBox = container.querySelector("#b64Error");
        const encodeBtn = container.querySelector("#encodeB64Btn");
        const decodeBtn = container.querySelector("#decodeB64Btn");
        const swapBtn = container.querySelector("#swapB64Btn");
        const clearBtn = container.querySelector("#clearB64Btn");
        const copyBtn = container.querySelector("#copyB64Btn");

        encodeBtn.addEventListener("click", () => {
            errorBox.style.display = "none";
            try {
                output.value = utf8_to_b64(input.value);
            } catch (e) {
                errorBox.textContent = `❌ 編碼出錯：${e.message}`;
                errorBox.style.display = "block";
            }
        });

        decodeBtn.addEventListener("click", () => {
            errorBox.style.display = "none";
            try {
                output.value = b64_to_utf8(input.value.trim());
            } catch (e) {
                errorBox.textContent = `❌ 解碼失敗，請確認輸入是否為合法的 Base64 字串！`;
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
