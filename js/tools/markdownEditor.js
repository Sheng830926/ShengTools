/**
 * ShengTools - Markdown 編輯器
 */
import { compileMarkdown } from './utils.js';

export const markdownEditorTool = {
    id: "markdown-editor",
    name: "Markdown 編輯器",
    icon: "fa-solid fa-file-pen",
    category: "文字處理",
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
};
