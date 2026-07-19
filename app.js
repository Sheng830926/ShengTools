/**
 * ==========================================================================
 * ShengTools - 主應用程式邏輯與多功能配置 (全功能變更版)
 * ==========================================================================
 * 
 * 💡 設計核心說明：資料驅動 (Data-driven) 與 SPA 路由
 * --------------------------------------------------------------------------
 * 本專案採用資料驅動的架構。所有的工具都被定義在 `toolsConfig` 陣列中。
 * 系統在啟動或網址雜湊 (Hash) 改變時，會自動進行以下程序：
 * 1. 根據 `toolsConfig` 的內容，動態生成左側側邊欄的選單與分類。
 * 2. 根據網址列的 Hash (例如 #/word-counter)，在 `toolsConfig` 中搜尋對應工具。
 * 3. 找到對應工具後，呼叫該工具定義好的 `render` 函數，將 HTML 渲染至主畫面上。
 * 4. 當網址 Hash 為空或 #/ 時，自動載入由 `toolsConfig` 動態分區生成的「首頁卡片牆」。
 *
 * ==========================================================================
 * 🛠️ 擴充指南：未來我要如何手動加入新工具？
 * ==========================================================================
 * 
 * 如果您想要擴充這個工具箱，只需按照以下 3 個步驟操作，完全不需要修改 index.html：
 *
 * 步驟一：在下方 `toolsConfig` 陣列中，新增一個物件。
 * --------------------------------------------------
 * 格式如下：
 * {
 *     id: "my-new-tool",              // [唯一識別碼] 用於網址列路由，例如：#/my-new-tool
 *     name: "工具中文名稱",             // [工具名稱] 顯示在選單與卡片上
 *     icon: "fa-solid fa-wrench",      // [圖示] 採用 FontAwesome 6 圖示類名
 *     category: "工具分類名稱",          // [分類] 側邊欄會以此名稱自動進行群組與首頁分區
 *     description: "這是一句簡短的工具功能說明，會顯示在首頁卡片上。",
 *     render: (container) => {         // [渲染函數] 當使用者切換至此工具時，會執行此函數
 *         
 *         // 1. 寫入該工具的 HTML 結構
 *         container.innerHTML = `
 *             <div class="tool-layout-container">
 *                 <div class="tool-info-header">
 *                     <h2 class="tool-name">工具中文名稱</h2>
 *                     <p class="tool-description">這是一句簡短的工具功能說明。</p>
 *                 </div>
 *                 <!-- 在此處加入您工具的 UI 內容 -->
 *             </div>
 *         `;
 *         
 *         // 2. 獲取內部 DOM 元素並綁定事件 (撰寫互動邏輯)
 *         // const btn = container.querySelector('#myBtn'); ...
 *     }
 * }
 *
 * 步驟二：如果需要，在 `styles.css` 中加入特殊的樣式。
 * 步驟三：儲存檔案並重新整理網頁，新工具將會自動生成於首頁分區、側邊欄及路由中！
 */

// --------------------------------------------------------------------------
// A. 全域輔助與轉換函數 (Helper Functions)
// --------------------------------------------------------------------------

// 1. 安全 Base64 轉換輔助函數 (支援 UTF-8 避免亂碼)
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// 2. 色彩空間轉換輔助函數
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const bigint = parseInt(hex, 16);
    return isNaN(bigint) ? null : {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r, g, b) {
    const clamp = (val) => Math.max(0, Math.min(255, val));
    return "#" + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToRgb(h, s, l) {
    h /= 360, s /= 100, l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// 3. HTML 轉義防範 XSS
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

// 4. 並排文本比對 (LCS 最長共同子序列演算法)
function diffLines(linesA, linesB) {
    const n = linesA.length;
    const m = linesB.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (linesA[i - 1] === linesB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    let i = n, j = m;
    const diff = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
            diff.push({ type: 'equal', lineA: linesA[i - 1], lineB: linesB[j - 1], lnA: i, lnB: j });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            diff.push({ type: 'insert', line: linesB[j - 1], lnB: j });
            j--;
        } else {
            diff.push({ type: 'delete', line: linesA[i - 1], lnA: i });
            i--;
        }
    }
    return diff.reverse();
}

// 5. 簡易 Regex-based Markdown 編譯引擎
function compileMarkdown(md) {
    if (!md.trim()) return "<span style='color:var(--text-muted)'>等待輸入 Markdown 內容...</span>";
    
    let html = md;
    html = escapeHtml(html);
        
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^\-\s?(.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\*\s?(.*$)/gim, '<li>$1</li>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    html = html.split('\n').map(line => {
        const skip = line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<h3>') || 
                     line.startsWith('<blockquote>') || line.startsWith('<pre>') || line.startsWith('<li>') ||
                     line.endsWith('</pre>') || line.endsWith('</blockquote>');
        return skip ? line : line + '<br>';
    }).join('');
    
    html = html.replace(/(<br>){2,}/g, '<br>');
    return html;
}


// --------------------------------------------------------------------------
// B. 工具清單配置 (Data-Driven Configuration) - 內建 13 款工具
// --------------------------------------------------------------------------
const toolsConfig = [
    // [1] JSON 格式化與驗證
    {
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
    },
    // [2] Base64 編解碼器
    {
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
    },
    // [3] URL 編解碼器
    {
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
    },
    // [4] 正則表達式測試器
    {
        id: "regex-tester",
        name: "正規表達式測試器",
        icon: "fa-solid fa-magnifying-glass-chart",
        category: "開發工具",
        description: "輸入 RegExp 正則與測試文字，即時預覽高亮匹配的區段與結果。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">正規表達式測試器</h2>
                        <p class="tool-description">在上方輸入 Pattern，右下方即時高亮顯示符合正規條件的字串。</p>
                    </div>
                    
                    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 240px; gap: 16px; align-items: flex-end;">
                            <div class="editor-panel">
                                <label class="editor-label">正則表達式 Pattern (不用寫 / )</label>
                                <input type="text" id="regexPattern" class="tool-input-field" placeholder="例如：[0-9]+ 或 \\w+@\\w+\\.\\w+">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">匹配 Flags</label>
                                <div class="regex-flags-container" style="padding: 10px 0;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="regexFlagG" checked> Global (g)
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="regexFlagI" checked> Ignore Case (i)
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="regexFlagM"> Multiline (m)
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="error-msg-box" id="regexError"></div>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <div class="editor-panel">
                            <div class="editor-label">測試文本 (Test String)</div>
                            <div class="editor-textarea-wrapper">
                                <textarea id="regexInput" placeholder="在此貼上要進行測試的文字內容..."></textarea>
                            </div>
                        </div>
                        <div class="editor-panel">
                            <div class="editor-label">匹配高亮結果 (Result)</div>
                            <div class="regex-highlight-result" id="regexHighlightResult">匹配結果將在此高亮顯示...</div>
                        </div>
                    </div>
                </div>
            `;

            const patternInput = container.querySelector("#regexPattern");
            const testText = container.querySelector("#regexInput");
            const resultPanel = container.querySelector("#regexHighlightResult");
            const flagG = container.querySelector("#regexFlagG");
            const flagI = container.querySelector("#regexFlagI");
            const flagM = container.querySelector("#regexFlagM");
            const errorBox = container.querySelector("#regexError");

            const performMatch = () => {
                const pattern = patternInput.value;
                const text = testText.value;
                errorBox.style.display = "none";

                if (!pattern) {
                    resultPanel.textContent = text || "等待測試文字輸入...";
                    return;
                }

                try {
                    let flags = "";
                    if (flagG.checked) flags += "g";
                    if (flagI.checked) flags += "i";
                    if (flagM.checked) flags += "m";

                    const regex = new RegExp(pattern, flags);
                    const safeText = escapeHtml(text);

                    if (!text) {
                        resultPanel.innerHTML = "<span style='color:var(--text-muted)'>請在左側輸入測試文字</span>";
                        return;
                    }

                    let matchedHtml = safeText.replace(regex, (match) => `<mark class="regex-match">${match}</mark>`);
                    resultPanel.innerHTML = matchedHtml;
                } catch (e) {
                    errorBox.textContent = `❌ 正規表達式語法錯誤：${e.message}`;
                    errorBox.style.display = "block";
                }
            };

            patternInput.addEventListener("input", performMatch);
            testText.addEventListener("input", performMatch);
            flagG.addEventListener("change", performMatch);
            flagI.addEventListener("change", performMatch);
            flagM.addEventListener("change", performMatch);
        }
    },
    // [5] JWT 解析器
    {
        id: "jwt-decoder",
        name: "JWT 解析器",
        icon: "fa-solid fa-unlock-keyhole",
        category: "開發工具",
        description: "解碼 JSON Web Token (JWT)，彩色高亮 Token 各區段，格式化 Header 與 Payload 並分析過期時間。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">JWT 解析器</h2>
                        <p class="tool-description">在左側貼入 JWT Token。系統會將三部分彩色區分，解碼出其 Header 與載荷 (Payload)。</p>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <div class="editor-panel">
                            <div class="editor-label">貼上 JWT Token</div>
                            <div class="editor-textarea-wrapper">
                                <textarea id="jwtInput" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."></textarea>
                            </div>
                            <div class="error-msg-box" id="jwtError"></div>
                        </div>
                        
                        <div class="editor-panel">
                            <div class="editor-label">彩色標記 Token</div>
                            <div class="jwt-token-display" id="jwtTokenColored">
                                <span style="color:var(--text-muted)">等待 Token 輸入...</span>
                            </div>
                            
                            <div class="editor-label" style="margin-top:12px;">過期時間分析</div>
                            <div class="tool-input-field" id="jwtTimeResult" style="background:var(--bg-secondary); color:var(--text-secondary); line-height:1.5; font-size:0.9rem;" readonly>
                                尚未分析過期時間
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-grid-2col" style="margin-top:10px;">
                        <div class="editor-panel">
                            <div class="editor-label">Header (標頭)</div>
                            <div class="editor-textarea-wrapper" style="height:220px;">
                                <textarea id="jwtHeaderResult" style="height:100%" placeholder="Header JSON 結果..." readonly></textarea>
                            </div>
                        </div>
                        <div class="editor-panel">
                            <div class="editor-label">Payload (載荷)</div>
                            <div class="editor-textarea-wrapper" style="height:220px;">
                                <textarea id="jwtPayloadResult" style="height:100%" placeholder="Payload JSON 結果..." readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const input = container.querySelector("#jwtInput");
            const coloredDisplay = container.querySelector("#jwtTokenColored");
            const timeResult = container.querySelector("#jwtTimeResult");
            const headerText = container.querySelector("#jwtHeaderResult");
            const payloadText = container.querySelector("#jwtPayloadResult");
            const errorBox = container.querySelector("#jwtError");

            const decodeBase64Url = (str) => {
                str = str.replace(/-/g, "+").replace(/_/g, "/");
                while (str.length % 4) {
                    str += "=";
                }
                return b64_to_utf8(str);
            };

            const parseJwt = () => {
                const token = input.value.trim();
                errorBox.style.display = "none";
                
                if (!token) {
                    coloredDisplay.innerHTML = `<span style="color:var(--text-muted)">等待 Token 輸入...</span>`;
                    timeResult.textContent = "尚未分析過期時間";
                    headerText.value = "";
                    payloadText.value = "";
                    return;
                }

                const parts = token.split(".");
                if (parts.length !== 3) {
                    errorBox.textContent = "❌ 無效的 JWT：JWT 必須包含以點(.)分隔的標頭、載荷與簽名三部分！";
                    errorBox.style.display = "block";
                    return;
                }

                coloredDisplay.innerHTML = `
                    <span class="jwt-part-header">${parts[0]}</span>.<span class="jwt-part-payload">${parts[1]}</span>.<span class="jwt-part-signature">${parts[2]}</span>
                `;

                try {
                    const headerDecoded = decodeBase64Url(parts[0]);
                    const payloadDecoded = decodeBase64Url(parts[1]);

                    const headerJson = JSON.parse(headerDecoded);
                    const payloadJson = JSON.parse(payloadDecoded);

                    headerText.value = JSON.stringify(headerJson, null, 4);
                    payloadText.value = JSON.stringify(payloadJson, null, 4);

                    if (payloadJson.exp) {
                        const expTimestamp = payloadJson.exp;
                        const expDate = new Date(expTimestamp * 1000);
                        const now = new Date();
                        const diffMs = expDate - now;

                        if (diffMs < 0) {
                            timeResult.innerHTML = `⚠️ <b>已過期</b><br>過期於：${expDate.toLocaleString()}`;
                            timeResult.style.borderColor = "var(--danger)";
                        } else {
                            const hours = Math.floor(diffMs / 3600000);
                            const mins = Math.floor((diffMs % 3600000) / 60000);
                            timeResult.innerHTML = `✅ <b>有效中</b> (剩餘約 ${hours} 小時 ${mins} 分鐘)<br>過期於：${expDate.toLocaleString()}`;
                            timeResult.style.borderColor = "var(--success)";
                        }
                    } else {
                        timeResult.innerHTML = "ℹ️ 此 Token 內不含 exp (過期時間) 聲明。";
                        timeResult.style.borderColor = "";
                    }

                } catch (e) {
                    errorBox.textContent = `❌ 解碼 JSON 失敗：${e.message}`;
                    errorBox.style.display = "block";
                }
            };

            input.addEventListener("input", parseJwt);
        }
    },
    // [6] 進制與單位轉換器 (取代時間戳轉換器)
    {
        id: "converter-box",
        name: "進制與單位轉換器",
        icon: "fa-solid fa-calculator",
        category: "計算工具",
        description: "整合多重進制聯動換算（二/八/十/十六進制）與長度、重量、溫度、面積常用單位雙向計算。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">進制與單位轉換器</h2>
                        <p class="tool-description">採用子標籤設計，快速切換進制或各類度量單位進行動態雙向聯動轉換。</p>
                    </div>
                    
                    <!-- 子標籤切換 -->
                    <div class="tool-sub-tabs">
                        <button class="sub-tab active" id="tabBaseBtn" data-tab="base">進制聯動轉換</button>
                        <button class="sub-tab" id="tabUnitBtn" data-tab="unit">度量單位轉換</button>
                    </div>
                    
                    <!-- 進制內容區 -->
                    <div class="converter-card" id="baseConverterPanel">
                        <h3 class="palette-section-title"><i class="fa-solid fa-circle-nodes"></i> 多進制雙向同步 (輸入即時換算)</h3>
                        <div class="base-converter-grid" style="margin-top: 10px;">
                            <div class="editor-panel">
                                <label class="editor-label">十進制 (Decimal)</label>
                                <input type="text" id="baseDec" class="tool-input-field" placeholder="請輸入十進制數值，例如：255" autocomplete="off">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">二進制 (Binary)</label>
                                <input type="text" id="baseBin" class="tool-input-field" placeholder="請輸入二進制，例如：11111111" autocomplete="off">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">八進制 (Octal)</label>
                                <input type="text" id="baseOct" class="tool-input-field" placeholder="請輸入八進制，例如：377" autocomplete="off">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">十六進制 (Hexadecimal)</label>
                                <input type="text" id="baseHex" class="tool-input-field" placeholder="請輸入十六進制，例如：FF" autocomplete="off">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 單位內容區 (預設隱藏) -->
                    <div class="converter-card" id="unitConverterPanel" style="display: none;">
                        <h3 class="palette-section-title"><i class="fa-solid fa-ruler-combined"></i> 物理單位轉換</h3>
                        <div style="display:flex; flex-direction:column; gap:20px; margin-top:10px;">
                            <div class="editor-panel" style="max-width: 300px;">
                                <label class="editor-label">選擇轉換類別</label>
                                <select id="unitCategorySelect" class="tool-select-field">
                                    <option value="length" selected>長度單位 (Length)</option>
                                    <option value="weight">重量單位 (Weight)</option>
                                    <option value="temp">溫度單位 (Temperature)</option>
                                    <option value="area">面積單位 (Area)</option>
                                </select>
                            </div>
                            
                            <div class="unit-converter-grid">
                                <!-- 左側輸入 -->
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <input type="number" id="unitInputLeft" class="tool-input-field" value="1">
                                    <select id="unitSelectLeft" class="tool-select-field"></select>
                                </div>
                                
                                <!-- 交換按鈕 -->
                                <div class="unit-swap-icon" id="unitSwapBtn">
                                    <i class="fa-solid fa-right-left"></i>
                                </div>
                                
                                <!-- 右側輸出 -->
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <input type="number" id="unitInputRight" class="tool-input-field" value="1000">
                                    <select id="unitSelectRight" class="tool-select-field"></select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 1. 子頁籤切換邏輯
            const tabBaseBtn = container.querySelector("#tabBaseBtn");
            const tabUnitBtn = container.querySelector("#tabUnitBtn");
            const basePanel = container.querySelector("#baseConverterPanel");
            const unitPanel = container.querySelector("#unitConverterPanel");

            tabBaseBtn.addEventListener("click", () => {
                tabBaseBtn.classList.add("active");
                tabUnitBtn.classList.remove("active");
                basePanel.style.display = "block";
                unitPanel.style.display = "none";
            });

            tabUnitBtn.addEventListener("click", () => {
                tabUnitBtn.classList.add("active");
                tabBaseBtn.classList.remove("active");
                unitPanel.style.display = "block";
                basePanel.style.display = "none";
            });

            // 2. 進制聯動轉換邏輯
            const decInput = container.querySelector("#baseDec");
            const binInput = container.querySelector("#baseBin");
            const octInput = container.querySelector("#baseOct");
            const hexInput = container.querySelector("#baseHex");

            const updateAllBases = (decimalValue, sourceInput) => {
                if (isNaN(decimalValue) || decimalValue === null) {
                    if (sourceInput !== decInput) decInput.value = "";
                    if (sourceInput !== binInput) binInput.value = "";
                    if (sourceInput !== octInput) octInput.value = "";
                    if (sourceInput !== hexInput) hexInput.value = "";
                    return;
                }
                if (sourceInput !== decInput) decInput.value = decimalValue.toString(10);
                if (sourceInput !== binInput) binInput.value = decimalValue.toString(2);
                if (sourceInput !== octInput) octInput.value = decimalValue.toString(8);
                if (sourceInput !== hexInput) hexInput.value = decimalValue.toString(16).toUpperCase();
            };

            decInput.addEventListener("input", () => {
                const cleaned = decInput.value.replace(/[^0-9\-]/g, "");
                decInput.value = cleaned;
                const val = parseInt(cleaned, 10);
                updateAllBases(isNaN(val) ? null : val, decInput);
            });

            binInput.addEventListener("input", () => {
                const cleaned = binInput.value.replace(/[^01]/g, "");
                binInput.value = cleaned;
                const val = parseInt(cleaned, 2);
                updateAllBases(isNaN(val) ? null : val, binInput);
            });

            octInput.addEventListener("input", () => {
                const cleaned = octInput.value.replace(/[^0-7]/g, "");
                octInput.value = cleaned;
                const val = parseInt(cleaned, 8);
                updateAllBases(isNaN(val) ? null : val, octInput);
            });

            hexInput.addEventListener("input", () => {
                const cleaned = hexInput.value.replace(/[^0-9A-Fa-f]/g, "");
                hexInput.value = cleaned.toUpperCase();
                const val = parseInt(cleaned, 16);
                updateAllBases(isNaN(val) ? null : val, hexInput);
            });

            // 3. 單位轉換配置與邏輯
            const unitConfig = {
                length: {
                    label: "長度",
                    units: {
                        m: { label: "公尺 (m)", val: 1 },
                        cm: { label: "公分 (cm)", val: 0.01 },
                        mm: { label: "公厘 (mm)", val: 0.001 },
                        km: { label: "公里 (km)", val: 1000 },
                        in: { label: "英吋 (in)", val: 0.0254 },
                        ft: { label: "英呎 (ft)", val: 0.3048 },
                        yd: { label: "碼 (yd)", val: 0.9144 }
                    }
                },
                weight: {
                    label: "重量",
                    units: {
                        kg: { label: "公斤 (kg)", val: 1 },
                        g: { label: "公克 (g)", val: 0.001 },
                        lb: { label: "磅 (lb)", val: 0.45359237 },
                        oz: { label: "盎司 (oz)", val: 0.028349523 },
                        tw: { label: "台斤", val: 0.6 }
                    }
                },
                temp: {
                    label: "溫度",
                    units: {
                        c: { label: "攝氏 (°C)" },
                        f: { label: "華氏 (°F)" },
                        k: { label: "克氏 (K)" }
                    }
                },
                area: {
                    label: "面積",
                    units: {
                        m2: { label: "平方公尺 (㎡)", val: 1 },
                        cm2: { label: "平方公分 (㎠)", val: 0.0001 },
                        km2: { label: "平方公里 (㎢)", val: 1000000 },
                        hectare: { label: "公頃", val: 10000 },
                        ping: { label: "坪", val: 3.305785 },
                        acre: { label: "英畝", val: 4046.8564 }
                    }
                }
            };

            const catSelect = container.querySelector("#unitCategorySelect");
            const leftInput = container.querySelector("#unitInputLeft");
            const rightInput = container.querySelector("#unitInputRight");
            const leftSelect = container.querySelector("#unitSelectLeft");
            const rightSelect = container.querySelector("#unitSelectRight");
            const swapBtn = container.querySelector("#unitSwapBtn");

            const populateUnits = () => {
                const cat = catSelect.value;
                const units = unitConfig[cat].units;
                
                let selectHtml = "";
                for (const [key, details] of Object.entries(units)) {
                    selectHtml += `<option value="${key}">${details.label}</option>`;
                }
                
                leftSelect.innerHTML = selectHtml;
                rightSelect.innerHTML = selectHtml;

                // 預設將左右設為不同單位
                const keys = Object.keys(units);
                if (keys.length > 1) {
                    leftSelect.selectedIndex = 0;
                    rightSelect.selectedIndex = 1;
                }
            };

            const performConvert = (direction) => {
                const cat = catSelect.value;
                const fromUnit = direction === "left-to-right" ? leftSelect.value : rightSelect.value;
                const toUnit = direction === "left-to-right" ? rightSelect.value : leftSelect.value;
                const inputField = direction === "left-to-right" ? leftInput : rightInput;
                const outputField = direction === "left-to-right" ? rightInput : leftInput;

                const val = parseFloat(inputField.value);
                if (isNaN(val)) {
                    outputField.value = "";
                    return;
                }

                // 溫度特殊公式轉換
                if (cat === "temp") {
                    let tempInCelsius = val;
                    if (fromUnit === "f") tempInCelsius = (val - 32) * 5 / 9;
                    if (fromUnit === "k") tempInCelsius = val - 273.15;

                    let finalTemp = tempInCelsius;
                    if (toUnit === "f") finalTemp = tempInCelsius * 9 / 5 + 32;
                    if (toUnit === "k") finalTemp = tempInCelsius + 273.15;

                    outputField.value = parseFloat(finalTemp.toFixed(4));
                } else {
                    // 比率係數轉換
                    const baseCoeff = unitConfig[cat].units[fromUnit].val;
                    const targetCoeff = unitConfig[cat].units[toUnit].val;
                    const converted = (val * baseCoeff) / targetCoeff;
                    outputField.value = parseFloat(converted.toFixed(6));
                }
            };

            // 監聽單位類別改變
            catSelect.addEventListener("change", () => {
                populateUnits();
                performConvert("left-to-right");
            });

            // 監聽數值輸入與選單改變
            leftInput.addEventListener("input", () => performConvert("left-to-right"));
            rightInput.addEventListener("input", () => performConvert("right-to-left"));
            leftSelect.addEventListener("change", () => performConvert("left-to-right"));
            rightSelect.addEventListener("change", () => performConvert("left-to-right"));

            // 交換單位與數值
            swapBtn.addEventListener("click", () => {
                const tempSelect = leftSelect.value;
                leftSelect.value = rightSelect.value;
                rightSelect.value = tempSelect;

                const tempInput = leftInput.value;
                leftInput.value = rightInput.value;
                rightInput.value = tempInput;

                performConvert("left-to-right");
            });

            // 初始載入單位選項
            populateUnits();
            performConvert("left-to-right");
        }
    },
    // [7] 文本比對器
    {
        id: "text-compare",
        name: "文本比對器",
        icon: "fa-solid fa-code-compare",
        category: "文字工具",
        description: "雙欄並排對比文字差異，高亮標示新增（綠）與刪除（紅）行數，並支援左右雙向同步滾動。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">文本比對器</h2>
                        <p class="tool-description">在下方左右兩欄分別輸入「修改前」與「修改後」的文字，系統會即時進行行數對比與同步滾動。</p>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <div class="editor-panel">
                            <div class="editor-label">原始文本 (修改前 / Left)</div>
                            <div class="editor-textarea-wrapper">
                                <textarea id="diffInputA" placeholder="在此貼上原始文章..."></textarea>
                            </div>
                        </div>
                        <div class="editor-panel">
                            <div class="editor-label">修改文本 (修改後 / Right)</div>
                            <div class="editor-textarea-wrapper">
                                <textarea id="diffInputB" placeholder="在此貼上修改後的文章..."></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-actions-row">
                        <button class="tool-btn tool-btn-secondary" id="clearDiffBtn">
                            <i class="fa-solid fa-trash-can"></i>清除
                        </button>
                        <button class="tool-btn tool-btn-primary" id="compareBtn">
                            <i class="fa-solid fa-play"></i>開始比對差異
                        </button>
                    </div>
                    
                    <div id="diffResultContainer" style="display:none; flex-direction:column; gap:12px; margin-top:12px;">
                        <h3 class="palette-section-title">
                            <i class="fa-solid fa-magnifying-glass"></i> 比對差異結果 (並排滾動對照)
                        </h3>
                        <div class="diff-result-wrapper">
                            <div class="diff-col-panel">
                                <div class="diff-col-header">Original</div>
                                <div class="diff-scroll-box" id="diffScrollLeft">
                                    <div class="diff-lines-container" id="diffOutputLeft"></div>
                                </div>
                            </div>
                            <div class="diff-col-panel">
                                <div class="diff-col-header">Modified</div>
                                <div class="diff-scroll-box" id="diffScrollRight">
                                    <div class="diff-lines-container" id="diffOutputRight"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const inputA = inputA || container.querySelector("#diffInputA");
            const inputB = inputB || container.querySelector("#diffInputB");
            const compareBtn = container.querySelector("#compareBtn");
            const clearBtn = container.querySelector("#clearDiffBtn");
            const resultContainer = container.querySelector("#diffResultContainer");
            const outputLeft = container.querySelector("#diffOutputLeft");
            const outputRight = container.querySelector("#diffOutputRight");
            
            const scrollLeft = container.querySelector("#diffScrollLeft");
            const scrollRight = container.querySelector("#diffScrollRight");

            let isSyncingLeft = false;
            let isSyncingRight = false;

            scrollLeft.addEventListener("scroll", () => {
                if (!isSyncingLeft) {
                    isSyncingRight = true;
                    scrollRight.scrollTop = scrollLeft.scrollTop;
                    scrollRight.scrollLeft = scrollLeft.scrollLeft;
                }
                isSyncingLeft = false;
            });

            scrollRight.addEventListener("scroll", () => {
                if (!isSyncingRight) {
                    isSyncingLeft = true;
                    scrollLeft.scrollTop = scrollRight.scrollTop;
                    scrollLeft.scrollLeft = scrollRight.scrollLeft;
                }
                isSyncingRight = false;
            });

            compareBtn.addEventListener("click", () => {
                const textA = inputA.value;
                const textB = inputB.value;

                if (!textA && !textB) {
                    alert("請在上方輸入要比對的內容！");
                    return;
                }

                const linesA = textA.split("\n");
                const linesB = textB.split("\n");

                const edits = diffLines(linesA, linesB);
                let leftHtml = "";
                let rightHtml = "";

                edits.forEach(edit => {
                    if (edit.type === "equal") {
                        leftHtml += `<div class="diff-line"><span class="diff-ln">${edit.lnA}</span><span class="diff-content">${escapeHtml(edit.lineA)}</span></div>`;
                        rightHtml += `<div class="diff-line"><span class="diff-ln">${edit.lnB}</span><span class="diff-content">${escapeHtml(edit.lineB)}</span></div>`;
                    } else if (edit.type === "delete") {
                        leftHtml += `<div class="diff-line diff-line-delete"><span class="diff-ln">${edit.lnA}</span><span class="diff-content">${escapeHtml(edit.line)}</span></div>`;
                        rightHtml += `<div class="diff-line diff-line-empty"><span class="diff-ln"> </span><span class="diff-content"></span></div>`;
                    } else if (edit.type === "insert") {
                        leftHtml += `<div class="diff-line diff-line-empty"><span class="diff-ln"> </span><span class="diff-content"></span></div>`;
                        rightHtml += `<div class="diff-line diff-line-insert"><span class="diff-ln">${edit.lnB}</span><span class="diff-content">${escapeHtml(edit.line)}</span></div>`;
                    }
                });

                outputLeft.innerHTML = leftHtml;
                outputRight.innerHTML = rightHtml;
                resultContainer.style.display = "flex";
                resultContainer.scrollIntoView({ behavior: "smooth" });
            });

            clearBtn.addEventListener("click", () => {
                inputA.value = "";
                inputB.value = "";
                outputLeft.innerHTML = "";
                outputRight.innerHTML = "";
                resultContainer.style.display = "none";
                inputA.focus();
            });
        }
    },
    // [8] Markdown 編輯器
    {
        id: "markdown-editor",
        name: "Markdown 編輯器",
        icon: "fa-solid fa-file-pen",
        category: "文字工具",
        description: "線上 Markdown 即時編輯排版與預覽，支援標題、代碼塊、粗體與引用語法。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">Markdown 編輯器</h2>
                        <p class="tool-description">在左欄輸入 Markdown 語法，右欄將會即時進行排版編譯與預覽。</p>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <div class="editor-panel">
                            <div class="editor-label">編輯 Markdown 原始碼</div>
                            <div class="editor-textarea-wrapper" style="height:400px;">
                                <textarea id="mdInput" style="height:100%" placeholder="在此輸入 Markdown 內容..."></textarea>
                            </div>
                        </div>
                        <div class="editor-panel">
                            <div class="editor-label">即時預覽效果 (Preview)</div>
                            <div class="markdown-preview-box" id="mdPreview" style="height:426px;">
                                <span style="color:var(--text-muted)">等待輸入 Markdown...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-actions-row">
                        <button class="tool-btn tool-btn-secondary" id="clearMdBtn">
                            <i class="fa-solid fa-trash-can"></i>清除
                        </button>
                        <button class="tool-btn tool-btn-secondary" id="loadTemplateMdBtn">
                            <i class="fa-solid fa-file-circle-plus"></i>載入範本
                        </button>
                        <button class="tool-btn tool-btn-primary" id="copyHtmlBtn">
                            <i class="fa-solid fa-copy"></i>複製 HTML 原始碼
                        </button>
                    </div>
                </div>
            `;

            const input = container.querySelector("#mdInput");
            const preview = container.querySelector("#mdPreview");
            const clearBtn = container.querySelector("#clearMdBtn");
            const templateBtn = container.querySelector("#loadTemplateMdBtn");
            const copyBtn = container.querySelector("#copyHtmlBtn");

            const updatePreview = () => {
                preview.innerHTML = compileMarkdown(input.value);
            };

            input.addEventListener("input", updatePreview);

            clearBtn.addEventListener("click", () => {
                input.value = "";
                updatePreview();
                input.focus();
            });

            templateBtn.addEventListener("click", () => {
                input.value = `# 歡迎使用 ShengTools Markdown 編輯器
這是一個原生 JS 實作的輕量級 **Markdown** 編譯預覽工具。

## 支援的語法特性：
- **粗體文字** 與 *斜體文字*
- \`行內程式碼\` 或是程式碼區塊

> 這是一個 Blockquote 引用區塊，非常適合標記重點提示。

- 支援項目列表 A
- 支援項目列表 B
- 超連結支援：[點擊前往 Google](https://google.com)

歡迎在左側自由編輯！`;
                updatePreview();
            });

            copyBtn.addEventListener("click", () => {
                const htmlCode = preview.innerHTML;
                if (htmlCode.includes("等待輸入 Markdown")) return;
                navigator.clipboard.writeText(htmlCode).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>已複製！`;
                    setTimeout(() => copyBtn.innerHTML = originalText, 1500);
                });
            });

            templateBtn.click();
        }
    },
    // [9] 字數統計器
    {
        id: "word-counter",
        name: "字數統計器",
        icon: "fa-solid fa-calculator",
        category: "文字工具",
        description: "即時統計文章字數、字元數（含/不含空白）、英文單字數、段落數與行數，支援一鍵清除與複製。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">字數統計器</h2>
                        <p class="tool-description">輸入或貼上您的文字，右側面板將會即時更新詳細的統計結果。</p>
                    </div>
                    
                    <div class="word-counter-grid">
                        <div class="counter-input-section">
                            <div class="textarea-wrapper">
                                <textarea id="counterInput" placeholder="請在此處輸入或貼上您的文章..."></textarea>
                            </div>
                            <div class="counter-controls">
                                <button class="tool-btn tool-btn-secondary" id="clearTextBtn">
                                    <i class="fa-solid fa-trash-can"></i>一鍵清除
                                </button>
                                <button class="tool-btn tool-btn-primary" id="copyTextBtn">
                                    <i class="fa-solid fa-copy"></i>複製文字
                                </button>
                            </div>
                        </div>
                        
                        <div class="counter-stats-sidebar">
                            <div class="stats-card">
                                <h3 class="stats-card-title">
                                    <i class="fa-solid fa-chart-simple"></i>即時統計數據
                                </h3>
                                <div class="stats-list">
                                    <div class="stat-item">
                                        <span class="stat-label">中英字元數 (含空白)</span>
                                        <span class="stat-value" id="charWithSpaceVal">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">中英字元數 (不含空白)</span>
                                        <span class="stat-value" id="charNoSpaceVal">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">英文單字數 (Word Count)</span>
                                        <span class="stat-value" id="wordsVal">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">段落數 (Paragraphs)</span>
                                        <span class="stat-value" id="paragraphsVal">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">行數 (Lines)</span>
                                        <span class="stat-value" id="linesVal">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const textarea = container.querySelector("#counterInput");
            const charWithSpaceVal = container.querySelector("#charWithSpaceVal");
            const charNoSpaceVal = container.querySelector("#charNoSpaceVal");
            const wordsVal = container.querySelector("#wordsVal");
            const paragraphsVal = container.querySelector("#paragraphsVal");
            const linesVal = container.querySelector("#linesVal");
            const clearTextBtn = container.querySelector("#clearTextBtn");
            const copyTextBtn = container.querySelector("#copyTextBtn");
            
            const calculateStats = () => {
                const text = textarea.value;
                const charWithSpace = text.length;
                const charNoSpace = text.replace(/\s/g, "").length;
                const wordsArray = text.trim().match(/[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+/g);
                const words = wordsArray ? wordsArray.length : 0;
                const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
                const lines = text.length > 0 ? text.split("\n").length : 0;
                
                charWithSpaceVal.textContent = charWithSpace;
                charNoSpaceVal.textContent = charNoSpace;
                wordsVal.textContent = words;
                paragraphsVal.textContent = paragraphs;
                linesVal.textContent = lines;
            };
            
            textarea.addEventListener("input", calculateStats);
            clearTextBtn.addEventListener("click", () => {
                textarea.value = "";
                calculateStats();
                textarea.focus();
            });
            
            copyTextBtn.addEventListener("click", () => {
                if (!textarea.value) return;
                navigator.clipboard.writeText(textarea.value)
                    .then(() => {
                        const originalText = copyTextBtn.innerHTML;
                        copyTextBtn.innerHTML = `<i class="fa-solid fa-check"></i>已複製！`;
                        copyTextBtn.style.background = "var(--success)";
                        setTimeout(() => {
                            copyTextBtn.innerHTML = originalText;
                            copyTextBtn.style.background = "";
                        }, 1500);
                    });
            });
        }
    },
    // [10] 色彩工具與調色盤 (密碼生成器被移除，此工具索引遞補)
    {
        id: "color-tools",
        name: "色彩工具與調色盤",
        icon: "fa-solid fa-palette",
        category: "設計工具",
        description: "色彩選擇器、HEX/RGB/HSL 色碼互轉，並自動計算相鄰色與補色調色盤。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">色彩工具與調色盤</h2>
                        <p class="tool-description">色彩選擇器、HEX/RGB/HSL 色碼互轉，支援隨機生成色碼與原生螢幕滴管取色。</p>
                    </div>
                    
                    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-top:10px;">
                        <div class="color-picker-section">
                            <div class="native-color-picker-wrapper">
                                <input type="color" id="colorPicker" value="#6366f1">
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%;">
                                <div class="editor-panel">
                                    <label class="editor-label">HEX</label>
                                    <input type="text" id="colorHex" class="tool-input-field" value="#6366F1">
                                </div>
                                <div class="editor-panel">
                                    <label class="editor-label">RGB</label>
                                    <input type="text" id="colorRgb" class="tool-input-field" value="rgb(99, 102, 241)">
                                </div>
                                <div class="editor-panel">
                                    <label class="editor-label">HSL</label>
                                    <input type="text" id="colorHsl" class="tool-input-field" value="hsl(239, 84%, 67%)">
                                </div>
                            </div>
                        </div>
                        
                        <div class="tool-actions-row" style="margin-top: 20px; justify-content: flex-start;">
                            <button class="tool-btn tool-btn-secondary" id="randomColorBtn">
                                <i class="fa-solid fa-dice"></i> 隨機生成顏色
                            </button>
                            <button class="tool-btn tool-btn-primary" id="eyeDropperBtn" style="display: none;">
                                <i class="fa-solid fa-eye-dropper"></i> 螢幕取色器
                            </button>
                        </div>
                    </div>
                    
                    <div class="color-palette-card">
                        <h3 class="palette-section-title">
                            <i class="fa-solid fa-swatchbook"></i> 推薦配色調色盤
                        </h3>
                        <div class="color-swatch-grid" id="colorPaletteGrid"></div>
                    </div>
                </div>
            `;

            const picker = container.querySelector("#colorPicker");
            const hexInput = container.querySelector("#colorHex");
            const rgbInput = container.querySelector("#colorRgb");
            const hslInput = container.querySelector("#colorHsl");
            const paletteGrid = container.querySelector("#colorPaletteGrid");
            const randomBtn = container.querySelector("#randomColorBtn");
            const eyedropperBtn = container.querySelector("#eyeDropperBtn");

            const updateColors = (hexVal) => {
                picker.value = hexVal;
                hexInput.value = hexVal;
                const rgb = hexToRgb(hexVal);
                if (rgb) {
                    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                    generatePalette(hsl.h, hsl.s, hsl.l);
                }
            };

            const generatePalette = (h, s, l) => {
                const colors = [
                    { h: h, s: s, l: l },
                    { h: (h + 30) % 360, s: s, l: l },
                    { h: (h + 180) % 360, s: s, l: l },
                    { h: (h + 210) % 360, s: s, l: l },
                    { h: h, s: Math.max(10, s - 15), l: Math.min(90, l + 15) }
                ];

                paletteGrid.innerHTML = colors.map(hslObj => {
                    const rgbObj = hslToRgb(hslObj.h, hslObj.s, hslObj.l);
                    const hexStr = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
                    return `
                        <div class="color-swatch" data-hex="${hexStr}">
                            <div class="color-swatch-block" style="background-color: ${hexStr}"></div>
                            <span class="color-swatch-hex">${hexStr}</span>
                        </div>
                    `;
                }).join("");

                paletteGrid.querySelectorAll(".color-swatch").forEach(swatch => {
                    swatch.addEventListener("click", () => {
                        const hexToCopy = swatch.getAttribute("data-hex");
                        navigator.clipboard.writeText(hexToCopy).then(() => {
                            const label = swatch.querySelector(".color-swatch-hex");
                            const original = label.textContent;
                            label.textContent = "已複製！";
                            label.style.color = "var(--success)";
                            setTimeout(() => {
                                label.textContent = original;
                                label.style.color = "";
                            }, 1000);
                        });
                    });
                });
            };

            picker.addEventListener("input", (e) => updateColors(e.target.value.toUpperCase()));
            hexInput.addEventListener("input", (e) => {
                const hex = e.target.value.trim();
                if (/^#[0-9A-F]{6}$/i.test(hex)) updateColors(hex.toUpperCase());
            });
            rgbInput.addEventListener("input", (e) => {
                const rgbMatch = e.target.value.match(/\d+/g);
                if (rgbMatch && rgbMatch.length >= 3) {
                    const hex = rgbToHex(parseInt(rgbMatch[0]), parseInt(rgbMatch[1]), parseInt(rgbMatch[2]));
                    updateColors(hex);
                }
            });

            // 1. 隨機顏色生成
            randomBtn.addEventListener("click", () => {
                const randomHex = rgbToHex(
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256)
                );
                updateColors(randomHex);
            });

            // 2. 螢幕取色器 (Eye Dropper API)
            if ("EyeDropper" in window) {
                eyedropperBtn.style.display = "flex";
                eyedropperBtn.addEventListener("click", () => {
                    const eyeDropper = new EyeDropper();
                    eyeDropper.open()
                        .then(result => {
                            updateColors(result.sRGBHex.toUpperCase());
                        })
                        .catch(err => {
                            console.log("EyeDropper 取得顏色取消或失敗:", err);
                        });
                });
            }

            updateColors("#6366F1");
        }
    },
    // [12] QR Code 生成器
    {
        id: "qr-generator",
        name: "QR Code 生成器",
        icon: "fa-solid fa-qrcode",
        category: "實用工具",
        description: "輸入任意文字或網址 URL 即時生成 QR Code 二維碼，支援自訂多種尺寸並可一鍵下載。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">QR Code 生成器</h2>
                        <p class="tool-description">輸入網址或文字，系統會即時為您生成二維碼。此二維碼是在瀏覽器本地調用 API 生成，安全、快捷。</p>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <div class="editor-panel">
                            <div class="editor-label">輸入 QR Code 內容 (網址或純文字)</div>
                            <div class="editor-textarea-wrapper" style="height:120px;">
                                <textarea id="qrInputText" style="height:100%" placeholder="在此輸入文字，例如：https://google.com"></textarea>
                            </div>
                            
                            <div class="editor-label" style="margin-top:16px;">圖片尺寸選擇 (像素)</div>
                            <select id="qrSizeSelect" class="tool-select-field">
                                <option value="150">150 x 150 px</option>
                                <option value="200" selected>200 x 200 px</option>
                                <option value="250">250 x 250 px</option>
                                <option value="300">300 x 300 px</option>
                                <option value="400">400 x 400 px</option>
                            </select>
                            
                            <div style="margin-top:24px;">
                                <button class="tool-btn tool-btn-primary" id="downloadQrBtn" style="width:100%; justify-content:center;">
                                    <i class="fa-solid fa-download"></i> 下載 QR Code 圖片
                                </button>
                            </div>
                        </div>
                        
                        <div class="editor-panel">
                            <div class="editor-label">即時 QR Code 預覽</div>
                            <div class="qr-preview-card">
                                <div class="qr-image-wrapper" id="qrImageWrapper">
                                    <img id="qrImage" src="" alt="QR Code 預覽區">
                                </div>
                                <span class="color-swatch-hex" style="color:var(--text-muted)">使用手機相機即可直接掃描讀取</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const input = container.querySelector("#qrInputText");
            const sizeSelect = container.querySelector("#qrSizeSelect");
            const qrImg = container.querySelector("#qrImage");
            const downloadBtn = container.querySelector("#downloadQrBtn");

            const updateQrCode = () => {
                const text = input.value.trim();
                const size = sizeSelect.value;
                
                if (!text) {
                    const defaultUrl = "https://github.com";
                    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(defaultUrl)}`;
                    return;
                }
                
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
            };

            input.addEventListener("input", updateQrCode);
            sizeSelect.addEventListener("change", updateQrCode);

            downloadBtn.addEventListener("click", () => {
                const text = input.value.trim();
                if (!text) {
                    alert("請先在左側輸入要生成的內容再進行下載！");
                    return;
                }

                const originalText = downloadBtn.innerHTML;
                downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 下載中...`;

                fetch(qrImg.src)
                    .then(res => res.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `shengtools_qrcode_${Date.now()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> 下載成功！`;
                        downloadBtn.style.background = "var(--success)";
                        
                        setTimeout(() => {
                            downloadBtn.innerHTML = originalText;
                            downloadBtn.style.background = "";
                        }, 1500);
                    })
                    .catch(err => {
                        console.error("下載 QR Code 錯誤:", err);
                        alert("下載失敗，請嘗試右鍵另存 QR Code 圖片。");
                        downloadBtn.innerHTML = originalText;
                    });
            });

            input.value = "https://github.com";
            updateQrCode();
        }
    },
    // [13] 幸運抽籤輪盤 (推薦實用工具)
    {
        id: "lucky-wheel",
        name: "幸運抽籤輪盤",
        icon: "fa-solid fa-arrows-spin",
        category: "實用工具",
        description: "自訂抽籤選項，點擊旋轉輪盤進行隨機抽籤，支援大氣的物理減速動態效果與中獎高亮提示。",
        render: (container) => {
            container.innerHTML = `
                <div class="tool-layout-container">
                    <div class="tool-info-header">
                        <h2 class="tool-name">幸運抽籤輪盤</h2>
                        <p class="tool-description">在左側輸入自訂選項（一行一個），點擊下方按鈕即可旋轉輪盤進行公平抽籤。</p>
                    </div>
                    
                    <div class="tool-grid-2col">
                        <!-- 左側：設定與按鈕 -->
                        <div class="editor-panel">
                            <div class="editor-label">自訂抽籤選項 (每行一個項目)</div>
                            <div class="editor-textarea-wrapper" style="height: 180px;">
                                <textarea id="wheelItems" style="height: 100%;">
今天吃拉麵 🍜
今天吃便當 🍱
今天吃壽司 🍣
今天吃火鍋 🍲
今天吃麥當勞 🍔
今天吃披薩 🍕
                                </textarea>
                            </div>
                            
                            <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
                                <button class="tool-btn tool-btn-secondary" id="updateWheelBtn" style="justify-content: center; width: 100%;">
                                    <i class="fa-solid fa-arrows-rotate"></i> 更新輪盤選項
                                </button>
                                <button class="tool-btn tool-btn-primary" id="spinWheelBtn" style="justify-content: center; width: 100%; padding: 14px; font-size: 1.05rem;">
                                    <i class="fa-solid fa-play"></i> 開始旋轉輪盤
                                </button>
                            </div>
                        </div>
                        
                        <!-- 右側：輪盤與中獎宣告 -->
                        <div class="wheel-section">
                            <div class="wheel-wrapper">
                                <canvas id="wheelCanvas" width="300" height="300"></canvas>
                                <!-- CSS 頂部紅色指針 -->
                                <div class="wheel-pointer"></div>
                            </div>
                            <div class="winner-announce" id="winnerAnnounce" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            `;

            const textarea = container.querySelector("#wheelItems");
            const updateBtn = container.querySelector("#updateWheelBtn");
            const spinBtn = container.querySelector("#spinWheelBtn");
            const canvas = container.querySelector("#wheelCanvas");
            const winnerAnnounce = container.querySelector("#winnerAnnounce");
            const ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;
            const cx = width / 2;
            const cy = height / 2;
            const radius = width / 2 - 10;

            let items = [];
            let currentAngle = 0;
            let speed = 0;
            let friction = 0.983; // 減速摩擦力，值越大轉越久
            let isSpinning = false;
            let animId = null;

            // 解析並讀取設定
            const loadItems = () => {
                items = textarea.value.split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
            };

            // 繪製輪盤
            const drawWheel = () => {
                ctx.clearRect(0, 0, width, height);
                
                if (items.length === 0) {
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.textAlign = "center";
                    ctx.fillStyle = "var(--text-muted)";
                    ctx.font = "14px Outfit, Microsoft JhengHei";
                    ctx.fillText("請在左側輸入選項", 0, 0);
                    ctx.restore();
                    return;
                }

                const arcSize = (2 * Math.PI) / items.length;

                // 旋轉畫布整體
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(currentAngle);

                for (let i = 0; i < items.length; i++) {
                    const startAngle = i * arcSize;
                    const endAngle = startAngle + arcSize;

                    // 1. 繪製扇形
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, radius, startAngle, endAngle);
                    ctx.closePath();
                    // 根據索引 HSL 均勻分配顏色，飽和度 75%，亮度 60% (在深淺模式下都好看)
                    ctx.fillStyle = `hsl(${i * 360 / items.length}, 75%, 60%)`;
                    ctx.fill();
                    
                    // 繪製微細白線條隔開
                    ctx.strokeStyle = "rgba(255,255,255,0.15)";
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // 2. 繪製文字 (translate & rotate)
                    ctx.save();
                    ctx.rotate(startAngle + arcSize / 2);
                    ctx.textAlign = "right";
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px Outfit, Microsoft JhengHei";
                    
                    // 截短過長選項字元避免壓疊
                    let text = items[i];
                    if (text.length > 10) text = text.substring(0, 8) + "...";
                    
                    ctx.fillText(text, radius - 15, 4);
                    ctx.restore();
                }

                ctx.restore();

                // 3. 繪製中心小圓針 (不跟著旋轉)
                ctx.beginPath();
                ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
                ctx.fillStyle = appState.theme === "dark" ? "#1f2937" : "#ffffff";
                ctx.fill();
                ctx.strokeStyle = "var(--accent)";
                ctx.lineWidth = 3;
                ctx.stroke();
            };

            // 實體旋轉物理減速循環
            const rotateCycle = () => {
                if (!document.getElementById("wheelCanvas")) {
                    cancelAnimationFrame(animId);
                    return; // 路由安全機制，若輪盤已卸載則終止循環
                }

                currentAngle += speed;
                speed *= friction;

                drawWheel();

                if (speed < 0.001) {
                    // 停止旋轉
                    isSpinning = false;
                    cancelAnimationFrame(animId);

                    // 啟動按鈕
                    spinBtn.disabled = false;
                    textarea.disabled = false;
                    updateBtn.disabled = false;

                    // 計算指針指向的項目 (指針在正上方：1.5 * Math.PI)
                    const arcSize = (2 * Math.PI) / items.length;
                    let targetAngle = (1.5 * Math.PI - currentAngle) % (2 * Math.PI);
                    if (targetAngle < 0) targetAngle += 2 * Math.PI;

                    const index = Math.floor(targetAngle / arcSize) % items.length;
                    const winner = items[index];

                    // 顯示中獎視覺通知
                    winnerAnnounce.textContent = `🎉 恭喜中籤：${winner}`;
                    winnerAnnounce.style.display = "block";
                } else {
                    animId = requestAnimationFrame(rotateCycle);
                }
            };

            // 更新按鈕
            updateBtn.addEventListener("click", () => {
                if (isSpinning) return;
                loadItems();
                winnerAnnounce.style.display = "none";
                drawWheel();
            });

            // 旋轉按鈕
            spinBtn.addEventListener("click", () => {
                if (isSpinning) return;
                loadItems();

                if (items.length === 0) {
                    alert("請先輸入抽籤選項！");
                    return;
                }

                isSpinning = true;
                winnerAnnounce.style.display = "none";
                
                // 停用相關輸入與按鈕
                spinBtn.disabled = true;
                textarea.disabled = true;
                updateBtn.disabled = true;

                // 隨機設定初始速度 (介於 0.25 到 0.45 弧度/影格 之間)
                speed = Math.random() * 0.2 + 0.25;
                rotateCycle();
            });

            // 初始載入
            loadItems();
            drawWheel();
        }
    }
];

// --------------------------------------------------------------------------
// C. 應用程式全域狀態管理 (State)
// --------------------------------------------------------------------------
const appState = {
    searchQuery: "",
    activeToolId: "home",      // 預設路由為 "home"
    selectedCategory: "all",  // 首頁 Tab 選擇，預設為 "all"
    theme: "dark"              // 預設主題
};

// --------------------------------------------------------------------------
// D. 初始化與事件監聽
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();          // 初始化深淺色主題
    initSidebarMobile();  // 初始化手機響應式側邊欄
    initSearch();         // 初始化工具搜尋功能
    initRouter();         // 啟動路由監聽
});

/**
 * 主題切換
 */
function initTheme() {
    const savedTheme = localStorage.getItem("shengtools-theme") || "dark";
    setTheme(savedTheme);

    const sidebarToggle = document.getElementById("sidebarThemeToggleBtn");
    const headerToggle = document.getElementById("headerThemeToggleBtn");

    const handleToggle = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    if (sidebarToggle) sidebarToggle.addEventListener("click", handleToggle);
    if (headerToggle) headerToggle.addEventListener("click", handleToggle);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("shengtools-theme", theme);
    appState.theme = theme;
}

/**
 * 行動端側邊欄手勢
 */
function initSidebarMobile() {
    const appLayout = document.querySelector(".app-layout");
    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const mobileCloseBtn = document.getElementById("mobileCloseBtn");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const openSidebar = () => appLayout.classList.add("sidebar-open");
    const closeSidebar = () => appLayout.classList.remove("sidebar-open");

    if (menuToggleBtn) menuToggleBtn.addEventListener("click", openSidebar);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

    const sidebarMenu = document.getElementById("sidebarMenu");
    if (sidebarMenu) {
        sidebarMenu.addEventListener("click", (e) => {
            if (e.target.closest(".menu-item")) {
                closeSidebar();
            }
        });
    }

    const logoLink = document.getElementById("logoLink");
    if (logoLink) {
        logoLink.addEventListener("click", closeSidebar);
    }
}

/**
 * 搜尋過濾
 */
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        appState.searchQuery = query;

        if (query) {
            clearSearchBtn.style.display = "flex";
        } else {
            clearSearchBtn.style.display = "none";
        }

        updateView();
    });

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            appState.searchQuery = "";
            clearSearchBtn.style.display = "none";
            searchInput.focus();
            updateView();
        });
    }
}

/**
 * 路由器
 */
function initRouter() {
    const routeHandler = () => {
        const hash = window.location.hash || "#/";
        let toolId = "home";
        if (hash.startsWith("#/")) {
            toolId = hash.substring(2) || "home";
        }

        appState.activeToolId = toolId;
        updateView();
    };

    window.addEventListener("hashchange", routeHandler);
    window.addEventListener("DOMContentLoaded", routeHandler);
    routeHandler();
}

// --------------------------------------------------------------------------
// E. 全域畫面控制渲染
// --------------------------------------------------------------------------
function updateView() {
    const query = appState.searchQuery;
    const activeId = appState.activeToolId;

    const filteredTools = toolsConfig.filter(tool => {
        const nameMatch = tool.name.toLowerCase().includes(query);
        const descMatch = tool.description.toLowerCase().includes(query);
        const catMatch = tool.category.toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
    });

    renderSidebar(filteredTools, activeId);
    renderContent(filteredTools, activeId);
}

/**
 * 側邊選單渲染
 */
function renderSidebar(filteredTools, activeId) {
    const sidebarMenu = document.getElementById("sidebarMenu");
    if (!sidebarMenu) return;

    let sidebarHtml = `
        <div class="menu-category">
            <a href="#/" class="menu-item ${activeId === "home" ? "active" : ""}">
                <i class="fa-solid fa-house"></i>
                <span>首頁</span>
            </a>
        </div>
    `;

    const grouped = {};
    filteredTools.forEach(tool => {
        if (!grouped[tool.category]) {
            grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
    });

    for (const [categoryName, tools] of Object.entries(grouped)) {
        sidebarHtml += `
            <div class="menu-category">
                <div class="category-title">${categoryName}</div>
                ${tools.map(tool => `
                    <a href="#/${tool.id}" class="menu-item ${activeId === tool.id ? "active" : ""}" data-id="${tool.id}">
                        <i class="${tool.icon}"></i>
                        <span>${tool.name}</span>
                    </a>
                `).join("")}
            </div>
        `;
    }

    sidebarMenu.innerHTML = sidebarHtml;
}

/**
 * 主要顯示區渲染
 */
function renderContent(filteredTools, activeId) {
    const viewport = document.getElementById("toolViewport");
    const headerTitle = document.getElementById("headerTitle");
    if (!viewport) return;

    if (activeId === "home") {
        headerTitle.textContent = "首頁";
        document.title = "ShengTools | 多功能工具箱";
        renderHomeView(viewport, filteredTools);
        return;
    }

    const matchedTool = toolsConfig.find(tool => tool.id === activeId);
    if (matchedTool) {
        headerTitle.textContent = matchedTool.name;
        document.title = `${matchedTool.name} | ShengTools`;
        viewport.innerHTML = "";
        matchedTool.render(viewport);
    } else {
        headerTitle.textContent = "首頁";
        document.title = "ShengTools | 多功能工具箱";
        window.location.hash = "#/";
    }
}

/**
 * 首頁卡片牆與 Tabs 過濾
 */
function renderHomeView(container, filteredTools) {
    const allCategories = [...new Set(toolsConfig.map(t => t.category))];

    const tabsHtml = `
        <div class="home-category-filters">
            <button class="filter-tab ${appState.selectedCategory === "all" ? "active" : ""}" data-category="all">全部工具</button>
            ${allCategories.map(cat => `
                <button class="filter-tab ${appState.selectedCategory === cat ? "active" : ""}" data-category="${cat}">${cat}</button>
            `).join("")}
        </div>
    `;

    let finalTools = filteredTools;
    if (appState.selectedCategory !== "all") {
        finalTools = filteredTools.filter(tool => tool.category === appState.selectedCategory);
    }

    const grouped = {};
    finalTools.forEach(tool => {
        if (!grouped[tool.category]) {
            grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
    });

    let blocksHtml = "";

    if (finalTools.length === 0) {
        blocksHtml = `
            <div class="no-results">
                <i class="fa-solid fa-magnifying-glass-minus"></i>
                <div class="no-results-title">無匹配的工具</div>
                <p>找不到符合您搜尋或分類篩選的工具項目。</p>
                <button class="reset-search-btn" id="homeResetSearchBtn">重設篩選</button>
            </div>
        `;
    } else {
        for (const [categoryName, tools] of Object.entries(grouped)) {
            let catIcon = "fa-solid fa-toolbox";
            if (categoryName === "開發工具") catIcon = "fa-solid fa-laptop-code";
            else if (categoryName === "文字工具") catIcon = "fa-solid fa-pen-nib";
            else if (categoryName === "安全工具") catIcon = "fa-solid fa-shield-halved";
            else if (categoryName === "計算工具") catIcon = "fa-solid fa-calculator";
            else if (categoryName === "設計工具") catIcon = "fa-solid fa-palette";
            else if (categoryName === "實用工具") catIcon = "fa-solid fa-cubes";

            blocksHtml += `
                <div class="category-block" data-category="${categoryName}">
                    <div class="category-block-header">
                        <h3 class="category-block-title">
                            <i class="${catIcon}"></i> ${categoryName}
                        </h3>
                        <span class="category-count-badge">共 ${tools.length} 個項目</span>
                    </div>
                    <div class="tools-grid">
                        ${tools.map(tool => `
                            <div class="tool-card" data-id="${tool.id}">
                                <div class="card-header-area">
                                    <div class="card-icon">
                                        <i class="${tool.icon}"></i>
                                    </div>
                                    <span class="card-badge">${tool.category}</span>
                                </div>
                                <div class="card-body">
                                    <h4 class="card-title">${tool.name}</h4>
                                    <p class="card-desc">${tool.description}</p>
                                </div>
                                <div class="card-footer">
                                    立即開啟 <i class="fa-solid fa-arrow-right-long"></i>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = `
        <div class="home-wrapper">
            <section class="hero-section">
                <div class="hero-content">
                    <h2 class="hero-title">全方位線上多功能工具箱</h2>
                </div>
            </section>
            
            ${tabsHtml}
            
            <div class="home-blocks-container" style="display:flex; flex-direction:column; gap:36px;">
                ${blocksHtml}
            </div>
        </div>
    `;

    container.querySelectorAll(".tool-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            window.location.hash = `#/${id}`;
        });
    });

    container.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            appState.selectedCategory = tab.getAttribute("data-category");
            updateView();
        });
    });

    const resetBtn = container.querySelector("#homeResetSearchBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            appState.selectedCategory = "all";
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = "";
                appState.searchQuery = "";
            }
            updateView();
        });
    }
}
