/**
 * ShengTools - JWT 解析器
 */
import { b64_to_utf8 } from './utils.js';

export const jwtDecoderTool = {
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
};
