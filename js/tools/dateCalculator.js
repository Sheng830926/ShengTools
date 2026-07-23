import { escapeHtml } from './utils.js';

export const dateCalculatorTool = {
    id: 'date-calculator',
    name: '日期計算器',
    icon: 'fa-solid fa-calendar-days',
    category: '實用工具',
    description: '計算兩個日期之間的差距（小時、天數、月數、年數），支援工作天計算，也可從指定日期加減天數推算目標日期。',
    render(container) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <div class="tool-name"><i class="fa-solid fa-calendar-days"></i> 日期計算器</div>
                    <div class="tool-description">計算兩個日期之間的差距（小時、天數、月數、年數），支援工作天計算，也可從指定日期加減天數推算目標日期。</div>
                </div>

                <div style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color);">
                    <button class="tab-btn active" data-tab="diff" style="background: none; border: none; color: var(--text-primary); padding: 0.75rem 1rem; cursor: pointer; border-bottom: 2px solid var(--accent); font-weight: bold;">日期差距計算</button>
                    <button class="tab-btn" data-tab="add" style="background: none; border: none; color: var(--text-secondary); padding: 0.75rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; font-weight: bold;">日期加減推算</button>
                </div>

                <!-- Section 1: 日期差距計算 -->
                <div id="tab-content-diff" class="tab-content active" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="editor-panel">
                        <div class="tool-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label class="editor-label">開始日期</label>
                                <input type="date" id="diff-start" class="tool-input-field" value="${todayStr}">
                            </div>
                            <div>
                                <label class="editor-label">結束日期</label>
                                <input type="date" id="diff-end" class="tool-input-field" value="${thirtyDaysLaterStr}">
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); cursor: pointer;">
                                <input type="checkbox" id="diff-business-days"> 計算工作天 (排除週末)
                            </label>
                        </div>
                        <div class="tool-actions-row" style="margin-top: 1.5rem;">
                            <button id="btn-calc-diff" class="tool-btn tool-btn-primary">計算差距</button>
                        </div>
                    </div>
                    
                    <div id="diff-results" style="display: none; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <!-- Results injected here -->
                    </div>
                </div>

                <!-- Section 2: 日期加減推算 -->
                <div id="tab-content-add" class="tab-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div class="editor-panel">
                        <div class="tool-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label class="editor-label">基準日期</label>
                                <input type="date" id="add-base" class="tool-input-field" value="${todayStr}">
                            </div>
                            <div>
                                <label class="editor-label">天數</label>
                                <input type="number" id="add-days" class="tool-input-field" value="30" min="0">
                            </div>
                        </div>
                        <div style="margin-top: 1rem; display: flex; gap: 1.5rem; align-items: center;">
                            <div style="display: flex; gap: 1rem;">
                                <label style="color: var(--text-primary); cursor: pointer;"><input type="radio" name="add-op" value="add" checked> 加</label>
                                <label style="color: var(--text-primary); cursor: pointer;"><input type="radio" name="add-op" value="sub"> 減</label>
                            </div>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); cursor: pointer;">
                                <input type="checkbox" id="add-business-days"> 僅計算工作天
                            </label>
                        </div>
                        <div class="tool-actions-row" style="margin-top: 1.5rem;">
                            <button id="btn-calc-add" class="tool-btn tool-btn-primary">推算日期</button>
                        </div>
                    </div>
                    
                    <div id="add-results" style="display: none;">
                        <!-- Results injected here -->
                    </div>
                </div>
            </div>
        `;

        // Tab Switching Logic
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                    b.style.borderBottomColor = 'transparent';
                });
                tabContents.forEach(c => c.style.display = 'none');

                btn.classList.add('active');
                btn.style.color = 'var(--text-primary)';
                btn.style.borderBottomColor = 'var(--accent)';
                container.querySelector(`#tab-content-${btn.dataset.tab}`).style.display = 'flex';
            });
        });

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

        // Section 1: Calculate Diff
        const btnCalcDiff = container.querySelector('#btn-calc-diff');
        const diffResults = container.querySelector('#diff-results');
        
        btnCalcDiff.addEventListener('click', () => {
            const startDateStr = container.querySelector('#diff-start').value;
            const endDateStr = container.querySelector('#diff-end').value;
            const calcBiz = container.querySelector('#diff-business-days').checked;

            if (!startDateStr || !endDateStr) return;

            let start = new Date(startDateStr);
            let end = new Date(endDateStr);
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);

            let isNegative = false;
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
                isNegative = true;
            }

            const diffTime = Math.abs(end - start);
            const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            let bizDays = 0;
            let weekendDays = 0;
            
            if (calcBiz) {
                let current = new Date(start);
                while (current < end) {
                    const dayOfWeek = current.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) weekendDays++;
                    else bizDays++;
                    current.setDate(current.getDate() + 1);
                }
            }

            const totalHours = totalDays * 24;
            const weeks = Math.floor(totalDays / 7);
            const remainingDaysWeek = totalDays % 7;
            const approxMonths = (totalDays / 30.44).toFixed(1);
            const years = Math.floor(totalDays / 365);
            const remainingDaysYear = totalDays % 365;

            const makeCard = (label, value, icon) => `
                <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); text-align: center;">
                    <div style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <i class="${icon}"></i> ${label}
                    </div>
                    <div style="font-size: 2rem; font-weight: bold; background: var(--accent-gradient, linear-gradient(90deg, #60a5fa, #a78bfa)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${value}
                    </div>
                </div>
            `;

            let html = '';
            const prefix = isNegative ? '-' : '';
            html += makeCard('總天數', prefix + totalDays, 'fa-solid fa-sun');
            if (calcBiz) {
                html += makeCard('工作天數', prefix + bizDays, 'fa-solid fa-briefcase');
                html += makeCard('週末天數', prefix + weekendDays, 'fa-solid fa-mug-hot');
            }
            html += makeCard('總小時數', prefix + totalHours.toLocaleString(), 'fa-solid fa-clock');
            html += makeCard('週數', prefix + `${weeks}週${remainingDaysWeek ? ` ${remainingDaysWeek}天` : ''}`, 'fa-solid fa-calendar-week');
            html += makeCard('總月數 (約)', prefix + approxMonths, 'fa-solid fa-moon');
            html += makeCard('年數', prefix + `${years}年${remainingDaysYear ? ` ${remainingDaysYear}天` : ''}`, 'fa-solid fa-calendar-check');

            diffResults.innerHTML = html;
            diffResults.style.display = 'grid';
        });

        // Section 2: Calculate Add/Sub
        const btnCalcAdd = container.querySelector('#btn-calc-add');
        const addResults = container.querySelector('#add-results');

        btnCalcAdd.addEventListener('click', () => {
            const baseStr = container.querySelector('#add-base').value;
            let days = parseInt(container.querySelector('#add-days').value, 10);
            const op = container.querySelector('input[name="add-op"]:checked').value;
            const bizOnly = container.querySelector('#add-business-days').checked;

            if (!baseStr || isNaN(days)) return;

            const target = new Date(baseStr);
            target.setHours(0,0,0,0);
            
            const direction = op === 'add' ? 1 : -1;

            if (bizOnly) {
                let remainingDays = days;
                while (remainingDays > 0) {
                    target.setDate(target.getDate() + direction);
                    const day = target.getDay();
                    if (day !== 0 && day !== 6) {
                        remainingDays--;
                    }
                }
            } else {
                target.setDate(target.getDate() + (days * direction));
            }

            const yyyy = target.getFullYear();
            const mm = String(target.getMonth() + 1).padStart(2, '0');
            const dd = String(target.getDate()).padStart(2, '0');
            const dayOfWeek = weekdays[target.getDay()];

            addResults.innerHTML = `
                <div style="background: var(--bg-secondary); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); text-align: center;">
                    <div style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 1.1rem;">推算結果</div>
                    <div style="font-size: 3rem; font-weight: bold; background: var(--accent-gradient, linear-gradient(90deg, #60a5fa, #a78bfa)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: var(--font-mono, monospace);">
                        ${yyyy}-${mm}-${dd}
                    </div>
                    <div style="font-size: 1.5rem; color: var(--text-primary); margin-top: 1rem;">
                        ${yyyy}年${target.getMonth() + 1}月${target.getDate()}日 (星期${dayOfWeek})
                    </div>
                </div>
            `;
            addResults.style.display = 'block';
        });

        // Trigger initial calcs
        btnCalcDiff.click();
        btnCalcAdd.click();
    }
};
