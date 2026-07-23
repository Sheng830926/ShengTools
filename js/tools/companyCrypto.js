/**
 * ShengTools - 公司加解密工具
 * 相容於 C# AesEncryptBase64 / AesDecryptBase64 (AES-256-CBC, SHA256 Key Derivation, Custom 16-byte IV)
 */
import { escapeHtml } from './utils.js';

// --- Base64 / Bytes 轉換輔助函數 ---
function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBytes(base64Str) {
    const cleanStr = base64Str.trim().replace(/\s/g, "");
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * 導出 Key 與 IV (與 C# GetAesIV 及 SHA256 計算完全一致)
 */
async function deriveKeyAndIv(p_key, p_iv) {
    // 1. Key: SHA256(Encoding.ASCII.GetBytes(p_key)).Take(32)
    const keyAscii = new TextEncoder().encode(p_key);
    const sha256Buffer = await crypto.subtle.digest("SHA-256", keyAscii);
    const keyBytes = new Uint8Array(sha256Buffer).subarray(0, 32);

    // 2. IV: Encoding.ASCII.GetBytes(p_iv) 填入 16 位元組陣列 (其餘補 0x00)
    const ivAscii = new TextEncoder().encode(p_iv);
    const ivBytes = new Uint8Array(16);
    for (let i = 0; i < Math.min(ivAscii.length, 16); i++) {
        ivBytes[i] = ivAscii[i];
    }

    // 3. WebCrypto API 匯入金鑰
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-CBC" },
        false,
        ["encrypt", "decrypt"]
    );

    return { cryptoKey, ivBytes };
}

/**
 * C# AES 加密同款
 */
async function aesEncryptBase64(p_data, p_key = "12358067", p_iv = "76085321") {
    if (!p_data) return "";
    const { cryptoKey, ivBytes } = await deriveKeyAndIv(p_key, p_iv);
    const dataBytes = new TextEncoder().encode(p_data);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: ivBytes },
        cryptoKey,
        dataBytes
    );
    return bytesToBase64(new Uint8Array(encryptedBuffer));
}

/**
 * C# AES 解密同款
 */
async function aesDecryptBase64(p_EncryptData, p_key = "12358067", p_iv = "76085321") {
    if (!p_EncryptData) return "";
    const { cryptoKey, ivBytes } = await deriveKeyAndIv(p_key, p_iv);
    const encryptedBytes = base64ToBytes(p_EncryptData);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: ivBytes },
        cryptoKey,
        encryptedBytes
    );
    return new TextDecoder().decode(decryptedBuffer);
}

export const companyCryptoTool = {
    id: "company-crypto",
    name: "公司加解密工具",
    icon: "fa-solid fa-building-lock",
    category: "安全與加解密",
    description: "相容 C# AesEncryptBase64 / AesDecryptBase64 專案內部 AES-256-CBC 加解密，支援自訂 Key 與 IV。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">公司加解密工具</h2>
                    <p class="tool-description">AES 加解密邏輯 (SHA256 Key 衍生、16-byte 補零 IV 與 PKCS7 填補)。</p>
                </div>

                <!-- 金鑰與 IV 設定面板 -->
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 class="palette-section-title" style="margin:0;">
                            <i class="fa-solid fa-key"></i> Key & IV 金鑰參數設定
                        </h3>
                        <button class="tool-btn tool-btn-secondary" id="companyResetKeysBtn" style="padding: 5px 12px; font-size: 0.8rem;">
                            <i class="fa-solid fa-rotate-left"></i> 帶入預設值
                        </button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="editor-panel">
                            <label class="editor-label">Key</label>
                            <input type="text" id="companyKeyInput" class="tool-input-field" value="" autocomplete="off">
                        </div>
                        <div class="editor-panel">
                            <label class="editor-label">IV</label>
                            <input type="text" id="companyIvInput" class="tool-input-field" value="" autocomplete="off">
                        </div>
                    </div>
                </div>

                <!-- 輸入與輸出區 -->
                <div class="tool-grid-2col" style="margin-top: 10px;">
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>原始字串 (Input String)</span>
                            <span class="category-count-badge">INPUT</span>
                        </div>
                        <div class="editor-textarea-wrapper" style="height: 260px;">
                            <textarea id="companyInputText" style="height: 100%;" placeholder="請在此輸入要加密的明文，或要解密的 Base64 加密密文..."></textarea>
                        </div>
                    </div>

                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>結果 (Result Output)</span>
                            <span class="category-count-badge">OUTPUT</span>
                        </div>
                        <div class="editor-textarea-wrapper" style="height: 260px;">
                            <textarea id="companyOutputText" style="height: 100%;" placeholder="運算結果將顯示於此..." readonly></textarea>
                        </div>
                    </div>
                </div>

                <div class="error-msg-box" id="companyErrorBox" style="display: none;"></div>

                <!-- 動作按鈕區 -->
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-secondary" id="companyClearBtn">
                        <i class="fa-solid fa-trash-can"></i> 清除輸入
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="companySwapBtn">
                        <i class="fa-solid fa-arrow-right-arrow-left"></i> 結果對調至輸入
                    </button>
                    <button class="tool-btn tool-btn-primary" id="companyEncryptBtn">
                        <i class="fa-solid fa-lock"></i> 加密 (Encrypt)
                    </button>
                    <button class="tool-btn tool-btn-primary" id="companyDecryptBtn" style="background: var(--accent-gradient);">
                        <i class="fa-solid fa-unlock"></i> 解密 (Decrypt)
                    </button>
                    <button class="tool-btn tool-btn-primary" id="companyCopyBtn">
                        <i class="fa-solid fa-copy"></i> 複製結果
                    </button>
                </div>
            </div>
        `;

        const keyInput = container.querySelector("#companyKeyInput");
        const ivInput = container.querySelector("#companyIvInput");
        const inputText = container.querySelector("#companyInputText");
        const outputText = container.querySelector("#companyOutputText");
        const errorBox = container.querySelector("#companyErrorBox");

        const resetKeysBtn = container.querySelector("#companyResetKeysBtn");
        const clearBtn = container.querySelector("#companyClearBtn");
        const swapBtn = container.querySelector("#companySwapBtn");
        const encryptBtn = container.querySelector("#companyEncryptBtn");
        const decryptBtn = container.querySelector("#companyDecryptBtn");
        const copyBtn = container.querySelector("#companyCopyBtn");

        // 恢復公司預設 Key / IV
        resetKeysBtn.addEventListener("click", () => {
            keyInput.value = "12358067";
            ivInput.value = "76085321";
        });

        // 清除輸入
        clearBtn.addEventListener("click", () => {
            inputText.value = "";
            outputText.value = "";
            errorBox.style.display = "none";
            inputText.focus();
        });

        // 密文/結果對調
        swapBtn.addEventListener("click", () => {
            if (outputText.value) {
                inputText.value = outputText.value;
                outputText.value = "";
                errorBox.style.display = "none";
            }
        });

        // 複製結果
        copyBtn.addEventListener("click", () => {
            if (!outputText.value) return;
            navigator.clipboard.writeText(outputText.value).then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> 已複製！`;
                copyBtn.style.background = "var(--success)";
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = "";
                }, 1500);
            });
        });

        // 加密
        encryptBtn.addEventListener("click", async () => {
            errorBox.style.display = "none";
            outputText.value = "";

            try {
                const data = inputText.value;
                const key = keyInput.value.trim() || "12358067";
                const iv = ivInput.value.trim() || "76085321";

                if (!data) {
                    throw new Error("請先在左側欄位輸入要加密的字串！");
                }

                const result = await aesEncryptBase64(data, key, iv);
                outputText.value = result;

            } catch (err) {
                errorBox.textContent = `❌ 加密過程中發生錯誤：${err.message}`;
                errorBox.style.display = "block";
            }
        });

        // 解密
        decryptBtn.addEventListener("click", async () => {
            errorBox.style.display = "none";
            outputText.value = "";

            try {
                const encryptData = inputText.value.trim();
                const key = keyInput.value.trim() || "12358067";
                const iv = ivInput.value.trim() || "76085321";

                if (!encryptData) {
                    throw new Error("請先在左側欄位輸入要解密的 Base64 密文字串！");
                }

                const result = await aesDecryptBase64(encryptData, key, iv);
                outputText.value = result;

            } catch (err) {
                errorBox.textContent = `❌ 解密過程中發生錯誤：${err.message} (請確認 Base64 密文、Key 與 IV 是否正確)`;
                errorBox.style.display = "block";
            }
        });
    }
};
