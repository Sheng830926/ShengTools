/**
 * ShengTools - 文本比對器 (含單行內字元差異比對與快速跳轉)
 */
import { escapeHtml, diffLines, diffChars } from './utils.js';

export const textCompareTool = {
    id: "text-compare",
    name: "文本比對器",
    icon: "fa-solid fa-code-compare",
    category: "文字工具",
    description: "雙欄並排對比文字差異，同一行內高亮標示細微差異字元，支援左右雙向同步滾動與差異點快速跳轉。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">文本比對器</h2>
                    <p class="tool-description">在下方左右兩欄分別輸入「修改前」與「修改後」的文字，系統會即時進行行數對比、行內字元高亮與同步滾動。</p>
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
                
                <div id="diffResultContainer" style="display:none; flex-direction:column; gap:16px; margin-top:16px;">
                    <div class="diff-result-toolbar">
                        <div class="diff-nav-controls">
                            <button class="tool-btn tool-btn-secondary" id="prevDiffBtn" disabled>
                                <i class="fa-solid fa-chevron-up"></i> 上一個差異
                            </button>
                            <span class="diff-counter-badge" id="diffCounterText">差異 0 / 0</span>
                            <button class="tool-btn tool-btn-secondary" id="nextDiffBtn" disabled>
                                <i class="fa-solid fa-chevron-down"></i> 下一個差異
                            </button>
                        </div>
                    </div>

                    <div class="diff-result-wrapper">
                        <!-- 左側欄位 -->
                        <div class="diff-col-panel">
                            <div class="diff-col-header">
                                <div class="diff-col-header-left">
                                    <span class="diff-stat-del" id="delStatBadge">🔴 0 刪除</span>
                                    <span id="leftLineCountBadge">0 行</span>
                                </div>
                                <button class="diff-copy-mini-btn" id="copyLeftBtn" title="複製原始全文">
                                    <i class="fa-solid fa-copy"></i> 全部複製
                                </button>
                            </div>
                            <div class="diff-scroll-box" id="diffScrollLeft">
                                <div class="diff-lines-container" id="diffOutputLeft"></div>
                            </div>
                        </div>

                        <!-- 右側欄位 -->
                        <div class="diff-col-panel">
                            <div class="diff-col-header">
                                <div class="diff-col-header-left">
                                    <span class="diff-stat-add" id="addStatBadge">🟢 0 新增</span>
                                    <span id="rightLineCountBadge">0 行</span>
                                </div>
                                <button class="diff-copy-mini-btn" id="copyRightBtn" title="複製修改後全文">
                                    <i class="fa-solid fa-copy"></i> 全部複製
                                </button>
                            </div>
                            <div class="diff-scroll-box" id="diffScrollRight">
                                <div class="diff-lines-container" id="diffOutputRight"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const inputA = container.querySelector("#diffInputA");
        const inputB = container.querySelector("#diffInputB");
        const compareBtn = container.querySelector("#compareBtn");
        const clearBtn = container.querySelector("#clearDiffBtn");
        
        const resultContainer = container.querySelector("#diffResultContainer");
        const outputLeft = container.querySelector("#diffOutputLeft");
        const outputRight = container.querySelector("#diffOutputRight");
        const scrollLeft = container.querySelector("#diffScrollLeft");
        const scrollRight = container.querySelector("#diffScrollRight");

        const delStatBadge = container.querySelector("#delStatBadge");
        const addStatBadge = container.querySelector("#addStatBadge");
        const leftLineCountBadge = container.querySelector("#leftLineCountBadge");
        const rightLineCountBadge = container.querySelector("#rightLineCountBadge");
        const copyLeftBtn = container.querySelector("#copyLeftBtn");
        const copyRightBtn = container.querySelector("#copyRightBtn");

        const prevDiffBtn = container.querySelector("#prevDiffBtn");
        const nextDiffBtn = container.querySelector("#nextDiffBtn");
        const diffCounterText = container.querySelector("#diffCounterText");

        let isSyncingLeft = false;
        let isSyncingRight = false;
        let diffLineElements = [];
        let currentDiffIndex = -1;

        // 同步滾動
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

        // 複製全文按鈕
        copyLeftBtn.addEventListener("click", () => {
            if (!inputA.value) return;
            navigator.clipboard.writeText(inputA.value).then(() => {
                copyLeftBtn.innerHTML = `<i class="fa-solid fa-check"></i> 已複製`;
                setTimeout(() => copyLeftBtn.innerHTML = `<i class="fa-solid fa-copy"></i> 全部複製`, 1500);
            });
        });

        copyRightBtn.addEventListener("click", () => {
            if (!inputB.value) return;
            navigator.clipboard.writeText(inputB.value).then(() => {
                copyRightBtn.innerHTML = `<i class="fa-solid fa-check"></i> 已複製`;
                setTimeout(() => copyRightBtn.innerHTML = `<i class="fa-solid fa-copy"></i> 全部複製`, 1500);
            });
        });

        // 跳轉到指定差異處
        const jumpToDiff = (index) => {
            if (diffLineElements.length === 0 || index < 0 || index >= diffLineElements.length) return;
            
            // 移除前一個亮顯
            if (currentDiffIndex >= 0 && diffLineElements[currentDiffIndex]) {
                diffLineElements[currentDiffIndex].leftEl?.classList.remove("diff-active-focus");
                diffLineElements[currentDiffIndex].rightEl?.classList.remove("diff-active-focus");
            }

            currentDiffIndex = index;
            const item = diffLineElements[currentDiffIndex];
            
            if (item.leftEl) item.leftEl.classList.add("diff-active-focus");
            if (item.rightEl) item.rightEl.classList.add("diff-active-focus");

            const targetEl = item.leftEl || item.rightEl;
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            diffCounterText.textContent = `差異 ${currentDiffIndex + 1} / ${diffLineElements.length}`;
            prevDiffBtn.disabled = currentDiffIndex === 0;
            nextDiffBtn.disabled = currentDiffIndex === diffLineElements.length - 1;
        };

        prevDiffBtn.addEventListener("click", () => {
            if (currentDiffIndex > 0) jumpToDiff(currentDiffIndex - 1);
        });

        nextDiffBtn.addEventListener("click", () => {
            if (currentDiffIndex < diffLineElements.length - 1) jumpToDiff(currentDiffIndex + 1);
        });

        // 開始比對
        compareBtn.addEventListener("click", () => {
            const textA = inputA.value;
            const textB = inputB.value;

            if (!textA && !textB) {
                alert("請在上方輸入要比對的內容！");
                return;
            }

            const linesA = textA.split("\n");
            const linesB = textB.split("\n");

            // 原始行數 LCS 比對
            const edits = diffLines(linesA, linesB);

            // 將配對的 delete + insert 合併對齊，以便呈現「同一行標示差異」
            const alignedEdits = [];
            let i = 0;
            while (i < edits.length) {
                const current = edits[i];
                const next = edits[i + 1];

                if (current.type === "delete" && next && next.type === "insert") {
                    alignedEdits.push({
                        type: "replace",
                        lineA: current.line,
                        lineB: next.line,
                        lnA: current.lnA,
                        lnB: next.lnB
                    });
                    i += 2;
                } else {
                    alignedEdits.push(current);
                    i++;
                }
            }

            let leftHtml = "";
            let rightHtml = "";
            let deleteCount = 0;
            let insertCount = 0;

            alignedEdits.forEach((edit, idx) => {
                if (edit.type === "equal") {
                    leftHtml += `<div class="diff-line" data-line-index="${idx}"><span class="diff-ln">${edit.lnA}</span><span class="diff-content">${escapeHtml(edit.lineA)}</span></div>`;
                    rightHtml += `<div class="diff-line" data-line-index="${idx}"><span class="diff-ln">${edit.lnB}</span><span class="diff-content">${escapeHtml(edit.lineB)}</span></div>`;
                } else if (edit.type === "replace") {
                    deleteCount++;
                    insertCount++;
                    // 單行內字元級高亮比對
                    const charDiff = diffChars(edit.lineA, edit.lineB);
                    leftHtml += `<div class="diff-line diff-line-delete diff-is-diff" data-line-index="${idx}"><span class="diff-ln">${edit.lnA}</span><span class="diff-content">${charDiff.htmlA}</span></div>`;
                    rightHtml += `<div class="diff-line diff-line-insert diff-is-diff" data-line-index="${idx}"><span class="diff-ln">${edit.lnB}</span><span class="diff-content">${charDiff.htmlB}</span></div>`;
                } else if (edit.type === "delete") {
                    deleteCount++;
                    leftHtml += `<div class="diff-line diff-line-delete diff-is-diff" data-line-index="${idx}"><span class="diff-ln">${edit.lnA}</span><span class="diff-content"><mark class="diff-char-delete">${escapeHtml(edit.line)}</mark></span></div>`;
                    rightHtml += `<div class="diff-line diff-line-empty" data-line-index="${idx}"><span class="diff-ln"> </span><span class="diff-content"></span></div>`;
                } else if (edit.type === "insert") {
                    insertCount++;
                    leftHtml += `<div class="diff-line diff-line-empty" data-line-index="${idx}"><span class="diff-ln"> </span><span class="diff-content"></span></div>`;
                    rightHtml += `<div class="diff-line diff-line-insert diff-is-diff" data-line-index="${idx}"><span class="diff-ln">${edit.lnB}</span><span class="diff-content"><mark class="diff-char-insert">${escapeHtml(edit.line)}</mark></span></div>`;
                }
            });

            outputLeft.innerHTML = leftHtml;
            outputRight.innerHTML = rightHtml;

            // 更新數據徽章
            delStatBadge.textContent = `🔴 ${deleteCount} 刪除`;
            addStatBadge.textContent = `🟢 ${insertCount} 新增`;
            leftLineCountBadge.textContent = `${linesA.length} 行`;
            rightLineCountBadge.textContent = `${linesB.length} 行`;

            // 收集所有差異 DOM
            diffLineElements = [];
            const leftDiffs = outputLeft.querySelectorAll(".diff-is-diff");
            leftDiffs.forEach(leftEl => {
                const idx = leftEl.getAttribute("data-line-index");
                const rightEl = outputRight.querySelector(`.diff-line[data-line-index="${idx}"]`);
                diffLineElements.push({ leftEl, rightEl });
            });

            resultContainer.style.display = "flex";
            resultContainer.scrollIntoView({ behavior: "smooth" });

            if (diffLineElements.length > 0) {
                jumpToDiff(0);
            } else {
                diffCounterText.textContent = `無差異`;
                prevDiffBtn.disabled = true;
                nextDiffBtn.disabled = true;
            }
        });

        clearBtn.addEventListener("click", () => {
            inputA.value = "";
            inputB.value = "";
            outputLeft.innerHTML = "";
            outputRight.innerHTML = "";
            resultContainer.style.display = "none";
            diffLineElements = [];
            currentDiffIndex = -1;
            inputA.focus();
        });
    }
};
