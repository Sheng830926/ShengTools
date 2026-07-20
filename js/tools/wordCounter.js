/**
 * ShengTools - 字數統計器
 */
export const wordCounterTool = {
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
};
