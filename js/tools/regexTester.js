/**
 * ShengTools - 正規表達式測試器
 */
import { escapeHtml } from './utils.js';

export const regexTesterTool = {
    id: "regex-tester",
    name: "正規表達式測試器",
    icon: "fa-solid fa-magnifying-glass-chart",
    category: "開發與網路",
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
};
