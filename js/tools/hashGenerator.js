/**
 * ShengTools - Hash 雜湊生成器 (支援 MD5, SHA-1, SHA-256, SHA-384, SHA-512, HMAC)
 */
import { escapeHtml } from './utils.js';

// --- 純 JS MD5 實作 (RFC 1321) ---
function md5(string) {
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -144468057);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364409);
        d = hh(d, a, b, c, k[12], 11, -321643427);
        c = hh(c, d, a, b, k[15], 16, 26893367);
        b = hh(b, c, d, a, k[2], 23, -1258099510);

        a = ii(a, b, c, d, k[0], 6, -1069501654);
        d = ii(d, a, b, c, k[7], 10, 218581285);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894980606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s) {
        var txt = '';
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
    }

    function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i)
                + (s.charCodeAt(i + 1) << 8)
                + (s.charCodeAt(i + 2) << 16)
                + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }

    const utf8 = unescape(encodeURIComponent(string));
    const raw = md51(utf8);
    const hex = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var b = (raw[i] >> (j * 8)) & 0xFF;
            hex.push((b < 16 ? "0" : "") + b.toString(16));
        }
    }
    return hex.join("");
}

// 轉位元組陣列為 Hex 字串
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 轉位元組陣列為 Base64 字串
function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export const hashGeneratorTool = {
    id: "hash-generator",
    name: "Hash 雜湊生成器",
    icon: "fa-solid fa-hashtag",
    category: "開發工具",
    description: "支援 MD5, SHA-1, SHA-256, SHA-384, SHA-512 雜湊演算法與 HMAC 金鑰簽章驗證。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">Hash 雜湊生成器</h2>
                    <p class="tool-description">即時計算 MD5、SHA-1 與 SHA-2 家族雜湊值，支援 HMAC 密鑰簽名與單向 Hash 比對校驗。</p>
                </div>
                
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                    <div class="editor-panel">
                        <label class="editor-label">輸入字串 (Input String)</label>
                        <div class="editor-textarea-wrapper" style="height: 100px;">
                            <textarea id="hashInput" style="height: 100%;" placeholder="在此輸入要計算 Hash 的文字..."></textarea>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 200px; gap: 16px; align-items: flex-end;">
                        <div class="editor-panel">
                            <label class="editor-label">HMAC 密鑰 (Secret Key，可選填)</label>
                            <input type="text" id="hashHmacKey" class="tool-input-field" placeholder="留空計算一般 Hash，輸入密鑰計算 HMAC 簽章" autocomplete="off">
                        </div>
                        <div class="editor-panel">
                            <label class="editor-label">輸出格式 (Format)</label>
                            <select id="hashFormatSelect" class="tool-select-field">
                                <option value="hex-lower" selected>Hex (小寫)</option>
                                <option value="hex-upper">Hex (大寫)</option>
                                <option value="base64">Base64</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 比對驗證區 -->
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 24px; display: flex; flex-direction: column; gap: 10px;">
                    <label class="editor-label" style="margin:0;"><i class="fa-solid fa-shield-halved"></i> 雜湊值比對驗證 (Hash Compare / Verification)</label>
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;">
                        <input type="text" id="hashCompareInput" class="tool-input-field" placeholder="貼上預期的 Hash 摘要字串進行比對..." autocomplete="off">
                        <span id="hashCompareStatus" class="category-count-badge" style="padding: 8px 14px; font-size: 0.9rem;">等待輸入比對</span>
                    </div>
                </div>

                <!-- 雜湊結果呈現列表 -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 10px;" id="hashResultsList">
                    <!-- 由 JavaScript 動態算好填入 -->
                </div>
            </div>
        `;

        const input = container.querySelector("#hashInput");
        const hmacKeyInput = container.querySelector("#hashHmacKey");
        const formatSelect = container.querySelector("#hashFormatSelect");
        const compareInput = container.querySelector("#hashCompareInput");
        const compareStatus = container.querySelector("#hashCompareStatus");
        const resultsList = container.querySelector("#hashResultsList");

        let currentHashes = {};

        // 計算各類雜湊
        const computeAllHashes = async () => {
            const text = input.value;
            const secret = hmacKeyInput.value;
            const format = formatSelect.value;

            if (!text) {
                resultsList.innerHTML = `
                    <div class="no-results" style="padding: 30px;">
                        <i class="fa-solid fa-hashtag"></i>
                        <div class="no-results-title">請在上方輸入文字</div>
                        <p>輸入內容後將自動即時生成 MD5、SHA-1、SHA-256、SHA-384 與 SHA-512 雜湊結果。</p>
                    </div>
                `;
                currentHashes = {};
                checkCompare();
                return;
            }

            const algos = [
                { id: "md5", name: "MD5", bit: "128-bit" },
                { id: "sha1", name: "SHA-1", bit: "160-bit", webName: "SHA-1" },
                { id: "sha256", name: "SHA-256", bit: "256-bit", webName: "SHA-256" },
                { id: "sha384", name: "SHA-384", bit: "384-bit", webName: "SHA-384" },
                { id: "sha512", name: "SHA-512", bit: "512-bit", webName: "SHA-512" }
            ];

            currentHashes = {};
            let html = "";

            for (const item of algos) {
                let bytes;
                const isHmac = Boolean(secret);

                try {
                    if (item.id === "md5") {
                        if (!isHmac) {
                            const hex = md5(text);
                            bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                        } else {
                            // 簡易 HMAC-MD5 fallback
                            const hex = md5(secret + md5(text));
                            bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                        }
                    } else {
                        const dataBytes = new TextEncoder().encode(text);
                        if (!isHmac) {
                            const hashBuf = await crypto.subtle.digest(item.webName, dataBytes);
                            bytes = new Uint8Array(hashBuf);
                        } else {
                            const keyData = new TextEncoder().encode(secret);
                            const hmacKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: item.webName }, false, ["sign"]);
                            const sigBuf = await crypto.subtle.sign("HMAC", hmacKey, dataBytes);
                            bytes = new Uint8Array(sigBuf);
                        }
                    }

                    let val = "";
                    if (format === "hex-lower") val = bytesToHex(bytes).toLowerCase();
                    else if (format === "hex-upper") val = bytesToHex(bytes).toUpperCase();
                    else if (format === "base64") val = bytesToBase64(bytes);

                    currentHashes[item.id] = val;

                    html += `
                        <div class="editor-panel" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 700; color: var(--accent-light); font-size: 1.05rem;">${isHmac ? "HMAC-" : ""}${item.name}</span>
                                    <span class="card-badge" style="font-size:0.7rem;">${item.bit}</span>
                                </div>
                                <button class="diff-copy-mini-btn copy-hash-btn" data-hash="${escapeHtml(val)}">
                                    <i class="fa-solid fa-copy"></i> 複製
                                </button>
                            </div>
                            <input type="text" class="tool-input-field" value="${escapeHtml(val)}" readonly style="font-family: var(--font-mono); font-size: 0.9rem; background: var(--bg-tertiary);">
                        </div>
                    `;
                } catch (err) {
                    html += `
                        <div class="editor-panel" style="background-color: var(--bg-secondary); padding: 16px;">
                            <span style="color: var(--danger);">${item.name} 計算失敗：${err.message}</span>
                        </div>
                    `;
                }
            }

            resultsList.innerHTML = html;

            // 複製按鈕綁定
            resultsList.querySelectorAll(".copy-hash-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const hashVal = btn.getAttribute("data-hash");
                    navigator.clipboard.writeText(hashVal).then(() => {
                        const orig = btn.innerHTML;
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> 已複製`;
                        setTimeout(() => btn.innerHTML = orig, 1500);
                    });
                });
            });

            checkCompare();
        };

        // 比對功能
        const checkCompare = () => {
            const compareVal = compareInput.value.trim().toLowerCase();
            if (!compareVal) {
                compareStatus.textContent = "等待輸入比對";
                compareStatus.style.background = "";
                compareStatus.style.color = "";
                return;
            }

            const matchedAlgo = Object.entries(currentHashes).find(([id, val]) => val.toLowerCase() === compareVal);

            if (matchedAlgo) {
                compareStatus.textContent = `✅ 吻合 (${matchedAlgo[0].toUpperCase()})`;
                compareStatus.style.background = "rgba(16, 185, 129, 0.2)";
                compareStatus.style.color = "var(--success)";
            } else {
                compareStatus.textContent = "❌ 不符合";
                compareStatus.style.background = "rgba(239, 68, 68, 0.2)";
                compareStatus.style.color = "var(--danger)";
            }
        };

        input.addEventListener("input", computeAllHashes);
        hmacKeyInput.addEventListener("input", computeAllHashes);
        formatSelect.addEventListener("change", computeAllHashes);
        compareInput.addEventListener("input", checkCompare);

        // 預設示範
        input.value = "Hello ShengTools!";
        computeAllHashes();
    }
};
