/**
 * ShengTools - 文本比對器
 */
import { escapeHtml, diffLines } from './utils.js';

export const textCompareTool = {
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

        const inputA = container.querySelector("#diffInputA");
        const inputB = container.querySelector("#diffInputB");
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
};
