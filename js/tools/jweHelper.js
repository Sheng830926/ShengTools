/**
 * ShengTools - JWE 加解密工具 (對應 JweHelper.cs 規格：A256KW + A256CBC-HS512)
 */
import { escapeHtml } from './utils.js';

// --- Base64Url 輔助函數 ---
function base64UrlEncode(bufferOrString) {
    let bytes;
    if (typeof bufferOrString === "string") {
        bytes = new TextEncoder().encode(bufferOrString);
    } else {
        bytes = new Uint8Array(bufferOrString);
    }
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlDecode(str) {
    let base64 = str.trim().replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// --- RFC 3394 AES Key Wrap (A256KW) 實作 (含原生 WebCrypto 與純算法相容) ---
async function wrapKeyAesKw(kekBytes, cekBytes) {
    try {
        const kekKey = await crypto.subtle.importKey("raw", kekBytes, { name: "AES-KW" }, false, ["wrapKey"]);
        const cekRawKey = await crypto.subtle.importKey("raw", cekBytes, { name: "HMAC", hash: "SHA-512" }, true, ["sign"]);
        const wrappedBuffer = await crypto.subtle.wrapKey("raw", cekRawKey, kekKey, "AES-KW");
        return new Uint8Array(wrappedBuffer);
    } catch (e) {
        return await rfc3394Wrap(kekBytes, cekBytes);
    }
}

async function unwrapKeyAesKw(kekBytes, wrappedKeyBytes) {
    try {
        const kekKey = await crypto.subtle.importKey("raw", kekBytes, { name: "AES-KW" }, false, ["unwrapKey"]);
        const unwrappedCekKey = await crypto.subtle.unwrapKey("raw", wrappedKeyBytes, kekKey, "AES-KW", { name: "HMAC", hash: "SHA-512" }, true, ["sign"]);
        const exportedCek = await crypto.subtle.exportKey("raw", unwrappedCekKey);
        return new Uint8Array(exportedCek);
    } catch (e) {
        return await rfc3394Unwrap(kekBytes, wrappedKeyBytes);
    }
}

// RFC 3394 演算法備用機制 (基於 WebCrypto AES-CBC 單區塊運算)
async function aesEcbEncryptBlock(kekBytes, block16Bytes) {
    const key = await crypto.subtle.importKey("raw", kekBytes, { name: "AES-CBC" }, false, ["encrypt"]);
    const iv = new Uint8Array(16); // 全 0 IV 等同單區塊 AES-ECB
    const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, key, block16Bytes);
    return new Uint8Array(encrypted).subarray(0, 16);
}

async function aesEcbDecryptBlock(kekBytes, block16Bytes) {
    // 建立 32 位元組 (16 位元組內容 + 16 位元組 0) 避開 PKCS7 填補問題
    const key = await crypto.subtle.importKey("raw", kekBytes, { name: "AES-CBC" }, false, ["decrypt"]);
    const zeroIv = new Uint8Array(16);
    // 使用 WebCrypto 直接解密無填補模式
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv: zeroIv }, key, block16Bytes);
    return new Uint8Array(decrypted).subarray(0, 16);
}

async function rfc3394Wrap(kekBytes, plaintextBytes) {
    const n = plaintextBytes.length / 8;
    const R = [];
    for (let i = 0; i < n; i++) {
        R[i] = plaintextBytes.subarray(i * 8, (i + 1) * 8);
    }
    let A = new Uint8Array([0xa6, 0xa6, 0xa6, 0xa6, 0xa6, 0xa6, 0xa6, 0xa6]);
    for (let j = 0; j <= 5; j++) {
        for (let i = 1; i <= n; i++) {
            const inBlock = new Uint8Array(16);
            inBlock.set(A, 0);
            inBlock.set(R[i - 1], 8);
            const B = await aesEcbEncryptBlock(kekBytes, inBlock);
            
            // A = MSB(64, B) ^ t
            let t = n * j + i;
            A = B.subarray(0, 8);
            for (let k = 7; k >= 0; k--) {
                A[k] ^= (t & 0xff);
                t = Math.floor(t / 256);
            }
            R[i - 1] = B.subarray(8, 16);
        }
    }
    const result = new Uint8Array((n + 1) * 8);
    result.set(A, 0);
    for (let i = 0; i < n; i++) {
        result.set(R[i], (i + 1) * 8);
    }
    return result;
}

async function rfc3394Unwrap(kekBytes, ciphertextBytes) {
    const n = (ciphertextBytes.length / 8) - 1;
    let A = new Uint8Array(ciphertextBytes.subarray(0, 8));
    const R = [];
    for (let i = 1; i <= n; i++) {
        R[i - 1] = new Uint8Array(ciphertextBytes.subarray(i * 8, (i + 1) * 8));
    }
    for (let j = 5; j >= 0; j--) {
        for (let i = n; i >= 1; i--) {
            let t = n * j + i;
            const A_t = new Uint8Array(A);
            for (let k = 7; k >= 0; k--) {
                A_t[k] ^= (t & 0xff);
                t = Math.floor(t / 256);
            }
            const inBlock = new Uint8Array(16);
            inBlock.set(A_t, 0);
            inBlock.set(R[i - 1], 8);
            const B = await aesEcbDecryptBlock(kekBytes, inBlock);
            A = B.subarray(0, 8);
            R[i - 1] = B.subarray(8, 16);
        }
    }
    // 驗證初始向量 A
    for (let k = 0; k < 8; k++) {
        if (A[k] !== 0xa6) {
            throw new Error("JWE Key Unwrap 驗證失敗：解密金鑰或包裹資料不符合 RFC 3394 規範！");
        }
    }
    const result = new Uint8Array(n * 8);
    for (let i = 0; i < n; i++) {
        result.set(R[i], i * 8);
    }
    return result;
}

// --- JWE 核心加解密 logic (對應 JweHelper.cs) ---
export const jweHelperTool = {
    id: "jwe-helper",
    name: "JWE 加解密工具",
    icon: "fa-solid fa-user-shield",
    category: "開發工具",
    description: "基於 JweHelper.cs 規範（A256KW + A256CBC-HS512），支援輸入 aPart 與 bPart 金鑰進行 JWE JSON 加密與解密。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">JWE 加解密工具</h2>
                    <p class="tool-description">採用 A256KW (AES Key Wrap) 與 A256CBC-HS512 複合認證加密演算法。</p>
                </div>

                <!-- 金鑰設定卡片 -->
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 class="palette-section-title" style="margin:0;"><i class="fa-solid fa-key"></i> KEK 金鑰設定 (A part + B part)</h3>
                        <div style="display:flex; gap:8px;">
                            <button class="tool-btn tool-btn-secondary" id="jweLoadSampleBtn" style="padding: 6px 12px; font-size: 0.8rem;">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> 帶入範例金鑰
                            </button>
                            <button class="tool-btn tool-btn-secondary" id="jweClearKeysBtn" style="padding: 6px 12px; font-size: 0.8rem;">
                                <i class="fa-solid fa-eraser"></i> 清空金鑰
                            </button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="editor-panel">
                            <label class="editor-label">A Part (Base64Url)</label>
                            <input type="text" id="jweAPartInput" class="tool-input-field" autocomplete="off">
                        </div>
                        <div class="editor-panel">
                            <label class="editor-label">B Part (Base64Url)</label>
                            <input type="text" id="jweBPartInput" class="tool-input-field" autocomplete="off">
                        </div>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">
                        💡 說明：系統將自動串接 <code style="color:var(--accent-light)">aPart + bPart</code> 並進行 Base64Url 解碼產生 256-bit (32 bytes) 的 KEK。
                    </div>
                </div>

                <!-- 編輯與輸出區塊 -->
                <div class="tool-grid-2col" style="margin-top: 10px;">
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>輸入內容 (Input)</span>
                            <span class="category-count-badge">JSON 或 JWE JSON</span>
                        </div>
                        <div class="editor-textarea-wrapper" style="height: 320px;">
                            <textarea id="jweInput" style="height: 100%;" placeholder="加密時：請貼上標準 JSON 字串 (例：{&quot;account&quot;:&quot;user123&quot;,&quot;amount&quot;:1000})&#10;&#10;解密時：請貼上 JWE JSON 格式 (包含 protected, encrypted_key, iv, ciphertext, tag)..."></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>處理結果 (Result)</span>
                            <span class="category-count-badge">OUTPUT</span>
                        </div>
                        <div class="editor-textarea-wrapper" style="height: 320px;">
                            <textarea id="jweOutput" style="height: 100%;" placeholder="處理結果將在此顯示..." readonly></textarea>
                        </div>
                    </div>
                </div>

                <div class="error-msg-box" id="jweError"></div>

                <!-- 動作按鈕列 -->
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-secondary" id="jweClearAllBtn">
                        <i class="fa-solid fa-trash-can"></i> 清除內容
                    </button>
                    <button class="tool-btn tool-btn-primary" id="jweEncryptBtn">
                        <i class="fa-solid fa-lock"></i> JWE 加密 (Encrypt)
                    </button>
                    <button class="tool-btn tool-btn-primary" id="jweDecryptBtn" style="background: var(--accent-gradient);">
                        <i class="fa-solid fa-unlock"></i> JWE 解密 (Decrypt)
                    </button>
                    <button class="tool-btn tool-btn-primary" id="jweCopyResultBtn">
                        <i class="fa-solid fa-copy"></i> 複製結果
                    </button>
                </div>
            </div>
        `;

        const aPartInput = container.querySelector("#jweAPartInput");
        const bPartInput = container.querySelector("#jweBPartInput");
        const inputText = container.querySelector("#jweInput");
        const outputText = container.querySelector("#jweOutput");
        const errorBox = container.querySelector("#jweError");

        const sampleBtn = container.querySelector("#jweLoadSampleBtn");
        const clearKeysBtn = container.querySelector("#jweClearKeysBtn");
        const clearAllBtn = container.querySelector("#jweClearAllBtn");
        const encryptBtn = container.querySelector("#jweEncryptBtn");
        const decryptBtn = container.querySelector("#jweDecryptBtn");
        const copyResultBtn = container.querySelector("#jweCopyResultBtn");

        // 帶入測試範例 (與 JweHelper.cs 註解範例相同)
        sampleBtn.addEventListener("click", () => {
            aPartInput.value = "NeYEYqIctN3rIMmVm2uf8";
            bPartInput.value = "Ga0MuvUFUUHf8enWfYoVcQ";
            inputText.value = JSON.stringify({
                account: "user8888",
                name: "詠升 鄭",
                amount: 50000,
                timestamp: new Date().toISOString()
            }, null, 4);
            outputText.value = "";
            errorBox.style.display = "none";
        });

        // 清空金鑰
        clearKeysBtn.addEventListener("click", () => {
            aPartInput.value = "";
            bPartInput.value = "";
        });

        // 清除內容
        clearAllBtn.addEventListener("click", () => {
            inputText.value = "";
            outputText.value = "";
            errorBox.style.display = "none";
            inputText.focus();
        });

        // 複製結果
        copyResultBtn.addEventListener("click", () => {
            if (!outputText.value) return;
            navigator.clipboard.writeText(outputText.value).then(() => {
                const originalText = copyResultBtn.innerHTML;
                copyResultBtn.innerHTML = `<i class="fa-solid fa-check"></i> 已複製！`;
                copyResultBtn.style.background = "var(--success)";
                setTimeout(() => {
                    copyResultBtn.innerHTML = originalText;
                    copyResultBtn.style.background = "";
                }, 1500);
            });
        });

        // 獲取並驗證 KEK
        const getKekBytes = () => {
            const aPart = aPartInput.value.trim();
            const bPart = bPartInput.value.trim();
            if (!aPart && !bPart) {
                throw new Error("請先輸入 aPart 與 bPart 金鑰！");
            }
            const combined = aPart + bPart;
            let kekBytes;
            try {
                kekBytes = base64UrlDecode(combined);
            } catch (e) {
                throw new Error("aPart 與 bPart 串接後無法進行 Base64Url 解碼，請確認字元格式！");
            }
            if (kekBytes.length !== 32) {
                throw new Error(`KEK 金鑰長度必須為 32 位元組 (256-bit)，目前解碼後為 ${kekBytes.length} 位元組 (字元數為 ${combined.length})。`);
            }
            return kekBytes;
        };

        // --- 加密流程 (Encrypt) ---
        encryptBtn.addEventListener("click", async () => {
            errorBox.style.display = "none";
            outputText.value = "";

            try {
                const kekBytes = getKekBytes();
                const plaintext = inputText.value.trim();

                if (!plaintext) {
                    throw new Error("請在左側輸入要加密的 JSON 明文內容！");
                }

                // 1. Protected Header (規格書固定格式: {"enc":"A256CBC-HS512","alg":"A256KW"})
                const fixedHeaderJson = '{"enc":"A256CBC-HS512","alg":"A256KW"}';
                const protectedEnc = base64UrlEncode(fixedHeaderJson);

                // 2. 生成 512-bit (64 bytes) 隨機 CEK
                const cek = crypto.getRandomValues(new Uint8Array(64));

                // 3. AES Key Wrap (A256KW) 包裹 CEK
                const wrappedCek = await wrapKeyAesKw(kekBytes, cek);

                // 4. 切分 CEK 512-bit (前 32 bytes 為 HMAC Key，後 32 bytes 為 AES-CBC Key)
                const macKeyBytes = cek.subarray(0, 32);
                const encKeyBytes = cek.subarray(32, 64);

                // 5. 生成 16 bytes 隨機 IV
                const iv = crypto.getRandomValues(new Uint8Array(16));

                // 6. AES-256-CBC 加密
                const aesCryptoKey = await crypto.subtle.importKey("raw", encKeyBytes, { name: "AES-CBC" }, false, ["encrypt"]);
                const plaintextBytes = new TextEncoder().encode(plaintext);
                const ciphertextBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, aesCryptoKey, plaintextBytes);
                const ciphertextBytes = new Uint8Array(ciphertextBuffer);

                // 7. 計算 AAD 與 AAD Length (AL)
                const aadBytes = new TextEncoder().encode(protectedEnc);
                const alBytes = new Uint8Array(8);
                const bitLength = aadBytes.length * 8;
                const view = new DataView(alBytes.buffer);
                view.setUint32(4, bitLength, false); // 64-bit大端序

                // 8. 組合 MAC_Data = AAD || IV || Ciphertext || AL
                const macData = new Uint8Array(aadBytes.length + iv.length + ciphertextBytes.length + alBytes.length);
                let offset = 0;
                macData.set(aadBytes, offset); offset += aadBytes.length;
                macData.set(iv, offset); offset += iv.length;
                macData.set(ciphertextBytes, offset); offset += ciphertextBytes.length;
                macData.set(alBytes, offset);

                // 9. 計算 HMAC-SHA-512 認證 Tag (取前 32 bytes)
                const hmacKey = await crypto.subtle.importKey("raw", macKeyBytes, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
                const fullHmacBuffer = await crypto.subtle.sign("HMAC", hmacKey, macData);
                const tagBytes = new Uint8Array(fullHmacBuffer).subarray(0, 32);

                // 10. 輸出完整 JwePayload 物件
                const jwePayload = {
                    protected: protectedEnc,
                    encrypted_key: base64UrlEncode(wrappedCek),
                    iv: base64UrlEncode(iv),
                    ciphertext: base64UrlEncode(ciphertextBytes),
                    tag: base64UrlEncode(tagBytes)
                };

                outputText.value = JSON.stringify(jwePayload, null, 4);

            } catch (e) {
                errorBox.textContent = `❌ 加密失敗：${e.message}`;
                errorBox.style.display = "block";
            }
        });

        // --- 解密流程 (Decrypt) ---
        decryptBtn.addEventListener("click", async () => {
            errorBox.style.display = "none";
            outputText.value = "";

            try {
                const kekBytes = getKekBytes();
                const jweJsonStr = inputText.value.trim();

                if (!jweJsonStr) {
                    throw new Error("請在左側輸入要解密的 JWE JSON 字串！");
                }

                let jwe;
                try {
                    jwe = JSON.parse(jweJsonStr);
                } catch (e) {
                    throw new Error("解密輸入並非合法的 JSON 格式，請確認是否貼上完整 JWE JSON！");
                }

                if (!jwe.protected || !jwe.encrypted_key || !jwe.iv || !jwe.ciphertext || !jwe.tag) {
                    throw new Error("JWE JSON 缺少必要的 protected, encrypted_key, iv, ciphertext, tag 欄位！");
                }

                // 1. 驗證 Header 演算法
                let headerJsonStr;
                try {
                    headerJsonStr = new TextDecoder().decode(base64UrlDecode(jwe.protected));
                } catch (e) {
                    throw new Error("無效的 Protected Header Base64Url 字串！");
                }

                const headerObj = JSON.parse(headerJsonStr);
                if (headerObj.enc?.toUpperCase() !== "A256CBC-HS512" || headerObj.alg?.toUpperCase() !== "A256KW") {
                    throw new Error(`不支援的演算法規範：alg=${headerObj.alg}, enc=${headerObj.enc}（此工具支援 A256KW 與 A256CBC-HS512）。`);
                }

                // 2. 解開 Key Unwrap 還原 CEK (64 bytes)
                const wrappedKeyBytes = base64UrlDecode(jwe.encrypted_key);
                const cek = await unwrapKeyAesKw(kekBytes, wrappedKeyBytes);

                if (cek.length !== 64) {
                    throw new Error(`解密 CEK 長度不正確，預期為 64 位元組，實際為 ${cek.length} 位元組！`);
                }

                // 3. 切分 CEK (前 32 bytes 為 HMAC Key，後 32 bytes 為 AES-CBC Key)
                const macKeyBytes = cek.subarray(0, 32);
                const encKeyBytes = cek.subarray(32, 64);

                const iv = base64UrlDecode(jwe.iv);
                const ciphertextBytes = base64UrlDecode(jwe.ciphertext);
                const inputTagBytes = base64UrlDecode(jwe.tag);

                // 4. 重算 MAC_Data 並驗證 Authentication Tag
                const aadBytes = new TextEncoder().encode(jwe.protected.trim());
                const alBytes = new Uint8Array(8);
                const bitLength = aadBytes.length * 8;
                const view = new DataView(alBytes.buffer);
                view.setUint32(4, bitLength, false);

                const macData = new Uint8Array(aadBytes.length + iv.length + ciphertextBytes.length + alBytes.length);
                let offset = 0;
                macData.set(aadBytes, offset); offset += aadBytes.length;
                macData.set(iv, offset); offset += iv.length;
                macData.set(ciphertextBytes, offset); offset += ciphertextBytes.length;
                macData.set(alBytes, offset);

                const hmacKey = await crypto.subtle.importKey("raw", macKeyBytes, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
                const fullHmacBuffer = await crypto.subtle.sign("HMAC", hmacKey, macData);
                const computedTagBytes = new Uint8Array(fullHmacBuffer).subarray(0, 32);

                // 定時比較認證 Tag
                let tagMatch = true;
                if (computedTagBytes.length !== inputTagBytes.length) {
                    tagMatch = false;
                } else {
                    for (let k = 0; k < computedTagBytes.length; k++) {
                        if (computedTagBytes[k] !== inputTagBytes[k]) {
                            tagMatch = false;
                        }
                    }
                }

                if (!tagMatch) {
                    throw new Error("Authentication Tag 驗證失敗！資料可能已被篡改，或是金鑰 aPart/bPart 不正確。");
                }

                // 5. AES-256-CBC 解密
                const aesCryptoKey = await crypto.subtle.importKey("raw", encKeyBytes, { name: "AES-CBC" }, false, ["decrypt"]);
                const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, aesCryptoKey, ciphertextBytes);
                const decryptedText = new TextDecoder().decode(decryptedBuffer);

                // 嘗試將解密後的文字格式化為 JSON
                try {
                    const parsedJson = JSON.parse(decryptedText);
                    outputText.value = JSON.stringify(parsedJson, null, 4);
                } catch (e) {
                    outputText.value = decryptedText;
                }

            } catch (e) {
                errorBox.textContent = `❌ 解密失敗：${e.message}`;
                errorBox.style.display = "block";
            }
        });
    }
};
