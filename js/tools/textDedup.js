/**
 * ShengTools - 文字重複移除工具
 */
import { escapeHtml } from './utils.js';

const SAMPLE_TEXT = `蘋果
香蕉
蘋果
橘子
香蕉
葡萄
蘋果
西瓜
橘子
葡萄
香蕉
芒果
西瓜
蘋果
芒果
草莓
香蕉
草莓`;

export const textDedupTool = {
    id: "text-dedup",
    name: "文字重複移除工具",
    icon: "fa-solid fa-filter-circle-xmark",
    category: "文字工具",
    description: "快速移除文字中的重複行、重複單字或重複字元，支援多種去重模式與排序選項。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">文字重複移除工具</h2>
                    <p class="tool-description">貼上包含重複內容的文字，選擇去重模式與選項後點擊「執行去重」，即可快速移除重複項目。</p>
                </div>

                <!-- Mode Selector -->
                <div class="dedup-mode-bar">
                    <span class="dedup-mode-label"><i class="fa-solid fa-sliders"></i> 去重模式</span>
                    <div class="dedup-mode-btns">
                        <button class="dedup-mode-btn active" data-mode="line">
                            <i class="fa-solid fa-list"></i> 按行去重
                        </button>
                        <button class="dedup-mode-btn" data-mode="word">
                            <i class="fa-solid fa-font"></i> 按單字去重
                        </button>
                        <button class="dedup-mode-btn" data-mode="char">
                            <i class="fa-solid fa-spell-check"></i> 按字元去重
                        </button>
                    </div>
                </div>

                <!-- Options Row -->
                <div class="dedup-options-row">
                    <label class="dedup-checkbox-label">
                        <input type="checkbox" id="dedupIgnoreCase" />
                        <span class="dedup-checkbox-custom"></span>
                        忽略大小寫
                    </label>
                    <label class="dedup-checkbox-label">
                        <input type="checkbox" id="dedupTrimWhitespace" checked />
                        <span class="dedup-checkbox-custom"></span>
                        忽略前後空白
                    </label>
                    <label class="dedup-checkbox-label">
                        <input type="checkbox" id="dedupRemoveEmpty" checked />
                        <span class="dedup-checkbox-custom"></span>
                        移除空白行
                    </label>
                    <label class="dedup-checkbox-label">
                        <input type="checkbox" id="dedupSortResult" />
                        <span class="dedup-checkbox-custom"></span>
                        結果排序
                    </label>
                </div>

                <!-- Two-column Layout -->
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>原始文字</span>
                            <span class="dedup-line-count" id="dedupInputCount">0 行</span>
                        </div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="dedupInput" placeholder="在此輸入或貼上包含重複內容的文字..."></textarea>
                        </div>
                    </div>
                    <div class="editor-panel">
                        <div class="editor-label">
                            <span>處理結果</span>
                            <span class="dedup-line-count" id="dedupOutputCount">0 行</span>
                        </div>
                        <div class="editor-textarea-wrapper">
                            <textarea id="dedupOutput" placeholder="去重後的結果將在此顯示..." readonly></textarea>
                        </div>
                    </div>
                </div>

                <!-- Statistics Bar -->
                <div class="dedup-stats-bar" id="dedupStatsBar">
                    <div class="dedup-stat-item">
                        <i class="fa-solid fa-file-lines"></i>
                        <span class="dedup-stat-label">原始數量</span>
                        <span class="dedup-stat-value" id="statOriginal">0</span>
                    </div>
                    <div class="dedup-stat-item dedup-stat-danger">
                        <i class="fa-solid fa-clone"></i>
                        <span class="dedup-stat-label">重複項目</span>
                        <span class="dedup-stat-value" id="statDuplicates">0</span>
                    </div>
                    <div class="dedup-stat-item dedup-stat-success">
                        <i class="fa-solid fa-filter"></i>
                        <span class="dedup-stat-label">移除後數量</span>
                        <span class="dedup-stat-value" id="statAfter">0</span>
                    </div>
                    <div class="dedup-stat-item">
                        <i class="fa-solid fa-compress"></i>
                        <span class="dedup-stat-label">壓縮率</span>
                        <span class="dedup-stat-value" id="statCompression">0%</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="tool-actions-row">
                    <button class="tool-btn tool-btn-primary" id="dedupRunBtn">
                        <i class="fa-solid fa-play"></i>執行去重
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="dedupClearBtn">
                        <i class="fa-solid fa-trash-can"></i>清除
                    </button>
                    <button class="tool-btn tool-btn-primary" id="dedupCopyBtn">
                        <i class="fa-solid fa-copy"></i>複製結果
                    </button>
                    <button class="tool-btn tool-btn-secondary" id="dedupSampleBtn">
                        <i class="fa-solid fa-flask"></i>帶入範例
                    </button>
                </div>
            </div>

            <style>
                /* Dedup Mode Bar */
                .dedup-mode-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 20px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .dedup-mode-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .dedup-mode-btns {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }
                .dedup-mode-btn {
                    padding: 8px 18px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-full);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: var(--font-primary);
                }
                .dedup-mode-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent-light);
                    background: rgba(99, 102, 241, 0.08);
                }
                .dedup-mode-btn.active {
                    background: var(--accent-gradient);
                    color: #fff;
                    border-color: transparent;
                    box-shadow: 0 2px 10px var(--accent-glow);
                }

                /* Options Row */
                .dedup-options-row {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 12px 20px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .dedup-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.83rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    user-select: none;
                    transition: color var(--transition-fast);
                    position: relative;
                }
                .dedup-checkbox-label:hover {
                    color: var(--text-primary);
                }
                .dedup-checkbox-label input[type="checkbox"] {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .dedup-checkbox-custom {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--border-hover);
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                    flex-shrink: 0;
                    position: relative;
                }
                .dedup-checkbox-custom::after {
                    content: '';
                    width: 10px;
                    height: 10px;
                    background: var(--accent-gradient);
                    border-radius: 3px;
                    transform: scale(0);
                    transition: transform var(--transition-fast);
                }
                .dedup-checkbox-label input[type="checkbox"]:checked + .dedup-checkbox-custom {
                    border-color: var(--accent);
                }
                .dedup-checkbox-label input[type="checkbox"]:checked + .dedup-checkbox-custom::after {
                    transform: scale(1);
                }

                /* Line Count Badge */
                .dedup-line-count {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                    background: var(--bg-primary);
                    padding: 2px 10px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--border-color);
                }

                /* Statistics Bar */
                .dedup-stats-bar {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-top: 4px;
                    margin-bottom: 16px;
                }
                .dedup-stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 14px 10px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                }
                .dedup-stat-item:hover {
                    border-color: var(--border-hover);
                    transform: translateY(-1px);
                }
                .dedup-stat-item i {
                    font-size: 1rem;
                    color: var(--accent-light);
                }
                .dedup-stat-item.dedup-stat-danger i {
                    color: var(--danger);
                }
                .dedup-stat-item.dedup-stat-success i {
                    color: var(--success);
                }
                .dedup-stat-label {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dedup-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    font-family: var(--font-mono);
                }
                .dedup-stat-danger .dedup-stat-value {
                    color: var(--danger);
                }
                .dedup-stat-success .dedup-stat-value {
                    color: var(--success);
                }

                /* Editor label flex layout */
                .dedup-mode-bar + .dedup-options-row + .tool-grid-2col .editor-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .dedup-stats-bar {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .dedup-options-row {
                        gap: 12px;
                    }
                }
            </style>
        `;

        // DOM References
        const inputEl = container.querySelector("#dedupInput");
        const outputEl = container.querySelector("#dedupOutput");
        const inputCount = container.querySelector("#dedupInputCount");
        const outputCount = container.querySelector("#dedupOutputCount");

        const modeBtns = container.querySelectorAll(".dedup-mode-btn");
        const ignoreCase = container.querySelector("#dedupIgnoreCase");
        const trimWhitespace = container.querySelector("#dedupTrimWhitespace");
        const removeEmpty = container.querySelector("#dedupRemoveEmpty");
        const sortResult = container.querySelector("#dedupSortResult");

        const runBtn = container.querySelector("#dedupRunBtn");
        const clearBtn = container.querySelector("#dedupClearBtn");
        const copyBtn = container.querySelector("#dedupCopyBtn");
        const sampleBtn = container.querySelector("#dedupSampleBtn");

        const statOriginal = container.querySelector("#statOriginal");
        const statDuplicates = container.querySelector("#statDuplicates");
        const statAfter = container.querySelector("#statAfter");
        const statCompression = container.querySelector("#statCompression");

        let currentMode = "line";

        // Make editor-label flex for our textareas
        container.querySelectorAll(".editor-label").forEach(el => {
            el.style.display = "flex";
            el.style.justifyContent = "space-between";
            el.style.alignItems = "center";
        });

        // Mode switching
        modeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                modeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentMode = btn.dataset.mode;
            });
        });

        // Update input line count on input
        const updateInputCount = () => {
            const text = inputEl.value;
            if (!text) {
                inputCount.textContent = "0 行";
                return;
            }
            if (currentMode === "line") {
                inputCount.textContent = `${text.split("\n").length} 行`;
            } else if (currentMode === "word") {
                const words = text.trim().split(/\s+/).filter(w => w.length > 0);
                inputCount.textContent = `${words.length} 字`;
            } else {
                inputCount.textContent = `${text.length} 字元`;
            }
        };

        inputEl.addEventListener("input", updateInputCount);

        // Core dedup logic
        const processDedup = () => {
            const text = inputEl.value;
            if (!text.trim()) {
                outputEl.value = "";
                resetStats();
                return;
            }

            const opts = {
                ignoreCase: ignoreCase.checked,
                trim: trimWhitespace.checked,
                removeEmpty: removeEmpty.checked,
                sort: sortResult.checked
            };

            let result;
            if (currentMode === "line") {
                result = dedupLines(text, opts);
            } else if (currentMode === "word") {
                result = dedupWords(text, opts);
            } else {
                result = dedupChars(text, opts);
            }

            outputEl.value = result.output;
            updateStats(result.originalCount, result.uniqueCount);
            updateOutputCount(result.uniqueCount);
        };

        const dedupLines = (text, opts) => {
            let lines = text.split("\n");
            const originalCount = lines.length;

            if (opts.removeEmpty) {
                lines = lines.filter(l => l.trim().length > 0);
            }

            const seen = new Set();
            const unique = [];

            for (const line of lines) {
                let key = line;
                if (opts.trim) key = key.trim();
                if (opts.ignoreCase) key = key.toLowerCase();

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(opts.trim ? line.trim() : line);
                }
            }

            let result = opts.sort ? [...unique].sort((a, b) => a.localeCompare(b, "zh-Hant")) : unique;

            return {
                output: result.join("\n"),
                originalCount,
                uniqueCount: result.length
            };
        };

        const dedupWords = (text, opts) => {
            let words = text.split(/\s+/).filter(w => w.length > 0);
            const originalCount = words.length;

            const seen = new Set();
            const unique = [];

            for (const word of words) {
                let key = word;
                if (opts.trim) key = key.trim();
                if (opts.ignoreCase) key = key.toLowerCase();

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(opts.trim ? word.trim() : word);
                }
            }

            let result = opts.sort ? [...unique].sort((a, b) => a.localeCompare(b, "zh-Hant")) : unique;

            return {
                output: result.join(" "),
                originalCount,
                uniqueCount: result.length
            };
        };

        const dedupChars = (text, opts) => {
            const chars = [...text];
            const originalCount = chars.length;

            const seen = new Set();
            const unique = [];

            for (const ch of chars) {
                if (opts.removeEmpty && (ch === "\n" || ch === "\r")) continue;

                let key = ch;
                if (opts.trim && (ch === " " || ch === "\t")) {
                    // Skip duplicate whitespace chars but keep first
                    key = " ";
                }
                if (opts.ignoreCase) key = key.toLowerCase();

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(ch);
                }
            }

            let result = opts.sort ? [...unique].sort((a, b) => a.localeCompare(b, "zh-Hant")) : unique;

            return {
                output: result.join(""),
                originalCount,
                uniqueCount: result.length
            };
        };

        const updateStats = (originalCount, uniqueCount) => {
            const duplicates = originalCount - uniqueCount;
            const compression = originalCount > 0
                ? ((duplicates / originalCount) * 100).toFixed(1)
                : "0.0";

            statOriginal.textContent = originalCount;
            statDuplicates.textContent = duplicates;
            statAfter.textContent = uniqueCount;
            statCompression.textContent = `${compression}%`;
        };

        const updateOutputCount = (count) => {
            if (currentMode === "line") {
                outputCount.textContent = `${count} 行`;
            } else if (currentMode === "word") {
                outputCount.textContent = `${count} 字`;
            } else {
                outputCount.textContent = `${count} 字元`;
            }
        };

        const resetStats = () => {
            statOriginal.textContent = "0";
            statDuplicates.textContent = "0";
            statAfter.textContent = "0";
            statCompression.textContent = "0%";
            outputCount.textContent = "0 行";
        };

        // Event Listeners
        runBtn.addEventListener("click", () => {
            updateInputCount();
            processDedup();
        });

        clearBtn.addEventListener("click", () => {
            inputEl.value = "";
            outputEl.value = "";
            resetStats();
            inputCount.textContent = "0 行";
            inputEl.focus();
        });

        copyBtn.addEventListener("click", () => {
            if (!outputEl.value) return;
            navigator.clipboard.writeText(outputEl.value).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>已複製！`;
                copyBtn.style.background = "var(--success)";
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = "";
                }, 1500);
            });
        });

        sampleBtn.addEventListener("click", () => {
            inputEl.value = SAMPLE_TEXT;
            updateInputCount();
            inputEl.focus();
        });
    }
};
