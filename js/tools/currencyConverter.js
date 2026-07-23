import { escapeHtml } from './utils.js';

export const currencyConverterTool = {
    id: 'currency-converter',
    name: '貨幣轉換器',
    icon: 'fa-solid fa-money-bill-transfer',
    category: '實用與設計',
    description: '即時匯率貨幣轉換器，支援全球 30+ 種主要貨幣即時換算。',
    render(container) {
        const currencies = {
            "TWD": { flag: "🇹🇼", name: "新台幣" },
            "USD": { flag: "🇺🇸", name: "美元" },
            "EUR": { flag: "🇪🇺", name: "歐元" },
            "JPY": { flag: "🇯🇵", name: "日圓" },
            "GBP": { flag: "🇬🇧", name: "英鎊" },
            "CNY": { flag: "🇨🇳", name: "人民幣" },
            "KRW": { flag: "🇰🇷", name: "韓元" },
            "HKD": { flag: "🇭🇰", name: "港幣" },
            "SGD": { flag: "🇸🇬", name: "新加坡幣" },
            "AUD": { flag: "🇦🇺", name: "澳幣" },
            "CAD": { flag: "🇨🇦", name: "加拿大幣" },
            "CHF": { flag: "🇨🇭", name: "瑞士法郎" },
            "THB": { flag: "🇹🇭", name: "泰銖" },
            "MYR": { flag: "🇲🇾", name: "馬來西亞令吉" },
            "IDR": { flag: "🇮🇩", name: "印尼盾" },
            "PHP": { flag: "🇵🇭", name: "菲律賓比索" },
            "VND": { flag: "🇻🇳", name: "越南盾" },
            "INR": { flag: "🇮🇳", name: "印度盧比" },
            "NZD": { flag: "🇳🇿", name: "紐西蘭幣" },
            "SEK": { flag: "🇸🇪", name: "瑞典克朗" },
            "DKK": { flag: "🇩🇰", name: "丹麥克朗" },
            "NOK": { flag: "🇳🇴", name: "挪威克朗" },
            "MXN": { flag: "🇲🇽", name: "墨西哥比索" },
            "BRL": { flag: "🇧🇷", name: "巴西雷亞爾" },
            "ZAR": { flag: "🇿🇦", name: "南非蘭特" },
            "TRY": { flag: "🇹🇷", name: "土耳其里拉" },
            "RUB": { flag: "🇷🇺", name: "俄羅斯盧布" },
            "AED": { flag: "🇦🇪", name: "阿聯酋迪拉姆" },
            "SAR": { flag: "🇸🇦", name: "沙烏地里亞爾" },
            "PLN": { flag: "🇵🇱", name: "波蘭茲羅提" },
            "CZK": { flag: "🇨🇿", name: "捷克克朗" },
            "HUF": { flag: "🇭🇺", name: "匈牙利福林" },
            "ILS": { flag: "🇮🇱", name: "以色列新謝克爾" }
        };

        const popularCurrencies = ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF'];

        let exchangeRates = null;
        let lastUpdateTime = null;

        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name"><i class="${this.icon}"></i> ${this.name}</h2>
                    <p class="tool-description">${this.description}</p>
                    <p class="tool-description" style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                        <i class="fa-solid fa-circle-info"></i> 本工具匯率資料來自公開 API (ExchangeRate-API)，僅供參考。
                    </p>
                </div>

                <div class="currency-source-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 20px; font-size: 0.9em; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span id="rate-status-icon" style="color: var(--text-secondary);"><i class="fa-solid fa-clock"></i></span>
                        <span id="rate-update-time">載入中...</span>
                    </div>
                    <button id="refresh-rates-btn" class="tool-btn tool-btn-secondary" style="padding: 5px 10px; font-size: 0.85em;">
                        <i class="fa-solid fa-rotate"></i> 更新匯率
                    </button>
                </div>

                <div id="api-error-msg" class="error-msg-box" style="display: none; margin-bottom: 20px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> 無法取得最新匯率，請稍後再試。
                </div>

                <div class="converter-card" style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 25px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                    <div class="converter-main" style="display: flex; flex-direction: column; gap: 15px;">
                        
                        <!-- FROM Section -->
                        <div class="currency-section" style="background: var(--bg-color); padding: 15px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.9em;">
                                <span>持有貨幣 (From)</span>
                            </div>
                            <div style="display: flex; gap: 15px; align-items: center;">
                                <select id="currency-from" class="tool-input-field" style="flex: 1; font-size: 1.1em; font-weight: bold; cursor: pointer;">
                                    ${Object.entries(currencies).map(([code, info]) => `<option value="${code}">${info.flag} ${code} ${info.name}</option>`).join('')}
                                </select>
                                <input type="number" id="amount-from" class="tool-input-field" value="1000" min="0" step="any" style="flex: 2; font-size: 1.5em; text-align: right; font-weight: bold;">
                            </div>
                        </div>

                        <!-- Swap Button -->
                        <div style="display: flex; justify-content: center; margin: -10px 0; z-index: 2;">
                            <button id="swap-btn" class="tool-btn tool-btn-secondary" style="width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-color); border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <i class="fa-solid fa-arrow-right-arrow-left fa-rotate-90"></i>
                            </button>
                        </div>

                        <!-- TO Section -->
                        <div class="currency-section" style="background: var(--bg-color); padding: 15px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.9em;">
                                <span>轉換目標 (To)</span>
                            </div>
                            <div style="display: flex; gap: 15px; align-items: center;">
                                <select id="currency-to" class="tool-input-field" style="flex: 1; font-size: 1.1em; font-weight: bold; cursor: pointer;">
                                    ${Object.entries(currencies).map(([code, info]) => `<option value="${code}">${info.flag} ${code} ${info.name}</option>`).join('')}
                                </select>
                                <div id="amount-to" style="flex: 2; font-size: 1.8em; text-align: right; font-weight: bold; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; overflow: hidden; text-overflow: ellipsis;">
                                    0.00
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style="margin-top: 20px; text-align: center; color: var(--text-secondary); font-size: 1.1em; background: rgba(0,0,0,0.05); padding: 10px; border-radius: var(--radius-lg);">
                        <i class="fa-solid fa-chart-line"></i> <span id="exchange-rate-display">1 TWD = -- USD</span>
                    </div>
                </div>

                <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 1em; color: var(--text-secondary); margin-bottom: 10px;">常用轉換</h3>
                    <div class="quick-pairs-grid" style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button class="tool-btn tool-btn-secondary quick-pair-btn" data-from="USD" data-to="TWD">🇺🇸 USD ➔ 🇹🇼 TWD</button>
                        <button class="tool-btn tool-btn-secondary quick-pair-btn" data-from="JPY" data-to="TWD">🇯🇵 JPY ➔ 🇹🇼 TWD</button>
                        <button class="tool-btn tool-btn-secondary quick-pair-btn" data-from="EUR" data-to="TWD">🇪🇺 EUR ➔ 🇹🇼 TWD</button>
                        <button class="tool-btn tool-btn-secondary quick-pair-btn" data-from="EUR" data-to="USD">🇪🇺 EUR ➔ 🇺🇸 USD</button>
                        <button class="tool-btn tool-btn-secondary quick-pair-btn" data-from="GBP" data-to="USD">🇬🇧 GBP ➔ 🇺🇸 USD</button>
                    </div>
                </div>

                <div>
                    <h3 style="font-size: 1em; color: var(--text-secondary); margin-bottom: 10px;">熱門貨幣匯率表 (以 <span id="table-base-currency">TWD</span> 為基準)</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
                                    <th style="padding: 10px;">貨幣</th>
                                    <th style="padding: 10px; text-align: right;">匯率 (1 <span class="base-currency-code">TWD</span> =)</th>
                                </tr>
                            </thead>
                            <tbody id="popular-rates-table">
                                <!-- Table rows will be generated here -->
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;

        const fromSelect = container.querySelector('#currency-from');
        const toSelect = container.querySelector('#currency-to');
        const fromInput = container.querySelector('#amount-from');
        const toOutput = container.querySelector('#amount-to');
        const swapBtn = container.querySelector('#swap-btn');
        const rateDisplay = container.querySelector('#exchange-rate-display');
        const refreshBtn = container.querySelector('#refresh-rates-btn');
        const updateTimeDisplay = container.querySelector('#rate-update-time');
        const statusIcon = container.querySelector('#rate-status-icon');
        const errorMsgBox = container.querySelector('#api-error-msg');
        const popularRatesTable = container.querySelector('#popular-rates-table');
        const tableBaseCurrencyDisplay = container.querySelector('#table-base-currency');
        const baseCurrencyCodeDisplays = container.querySelectorAll('.base-currency-code');
        const quickPairBtns = container.querySelectorAll('.quick-pair-btn');

        // Set initial values
        fromSelect.value = 'TWD';
        toSelect.value = 'USD';

        const formatNumber = (num, minDecimals = 2, maxDecimals = 4) => {
            if (num === null || isNaN(num)) return '0.00';
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: minDecimals,
                maximumFractionDigits: maxDecimals
            }).format(num);
        };

        const updateConversion = () => {
            if (!exchangeRates) return;
            const fromCurrency = fromSelect.value;
            const toCurrency = toSelect.value;
            const amount = parseFloat(fromInput.value) || 0;

            // Rates are relative to USD in the API
            const rateFrom = exchangeRates[fromCurrency];
            const rateTo = exchangeRates[toCurrency];

            if (rateFrom && rateTo) {
                // Convert From -> USD -> To
                const amountInUSD = amount / rateFrom;
                const finalAmount = amountInUSD * rateTo;
                toOutput.textContent = formatNumber(finalAmount, 2, 4);

                // Update rate display
                const singleUnitRate = (1 / rateFrom) * rateTo;
                rateDisplay.textContent = `1 ${fromCurrency} = ${formatNumber(singleUnitRate, 4, 6)} ${toCurrency}`;
                
                updatePopularTable(fromCurrency);
            }
        };

        const updatePopularTable = (baseCurrency) => {
            if (!exchangeRates) return;
            
            tableBaseCurrencyDisplay.textContent = baseCurrency;
            baseCurrencyCodeDisplays.forEach(el => el.textContent = baseCurrency);

            const baseRate = exchangeRates[baseCurrency];
            if (!baseRate) return;

            let html = '';
            popularCurrencies.forEach(currency => {
                if (currency === baseCurrency) return; // Skip self
                const targetRate = exchangeRates[currency];
                if (targetRate) {
                    const relativeRate = targetRate / baseRate;
                    html += `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 10px; display: flex; align-items: center; gap: 8px;">
                                ${currencies[currency].flag} <strong>${currency}</strong> <span style="color: var(--text-secondary); font-size: 0.9em;">${currencies[currency].name}</span>
                            </td>
                            <td style="padding: 10px; text-align: right; font-family: var(--font-mono);">
                                ${formatNumber(relativeRate, 4, 6)}
                            </td>
                        </tr>
                    `;
                }
            });
            popularRatesTable.innerHTML = html;
        };

        const fetchRates = async (force = false) => {
            statusIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            updateTimeDisplay.textContent = '正在更新匯率...';
            errorMsgBox.style.display = 'none';

            try {
                const CACHE_KEY = 'currency_rates_cache';
                const cachedData = sessionStorage.getItem(CACHE_KEY);
                
                if (!force && cachedData) {
                    const parsed = JSON.parse(cachedData);
                    const now = new Date().getTime();
                    // 30 minutes cache
                    if (now - parsed.timestamp < 30 * 60 * 1000) {
                        exchangeRates = parsed.rates;
                        lastUpdateTime = new Date(parsed.timestamp);
                        showSuccessStatus();
                        updateConversion();
                        return;
                    }
                }

                // Fetch new rates
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!response.ok) throw new Error('API response was not ok');
                const data = await response.json();
                
                exchangeRates = data.rates;
                lastUpdateTime = new Date();
                
                // Cache it
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    rates: exchangeRates,
                    timestamp: lastUpdateTime.getTime()
                }));

                showSuccessStatus();
                updateConversion();

            } catch (error) {
                console.error('Failed to fetch exchange rates:', error);
                statusIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: var(--danger);"></i>';
                updateTimeDisplay.textContent = '匯率更新失敗';
                errorMsgBox.style.display = 'block';
                if (exchangeRates) {
                    updateConversion(); // Try with old data if available
                }
            }
        };

        const showSuccessStatus = () => {
            statusIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>';
            const timeStr = lastUpdateTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            updateTimeDisplay.textContent = `最後更新: ${timeStr} (ExchangeRate-API)`;
        };

        // Event Listeners
        fromInput.addEventListener('input', updateConversion);
        fromSelect.addEventListener('change', updateConversion);
        toSelect.addEventListener('change', updateConversion);

        swapBtn.addEventListener('click', () => {
            const temp = fromSelect.value;
            fromSelect.value = toSelect.value;
            toSelect.value = temp;
            
            // Add a small rotation animation class if wanted, for now just update
            updateConversion();
        });

        refreshBtn.addEventListener('click', () => fetchRates(true));

        quickPairBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const from = e.target.getAttribute('data-from');
                const to = e.target.getAttribute('data-to');
                if (from && to) {
                    fromSelect.value = from;
                    toSelect.value = to;
                    updateConversion();
                }
            });
        });

        // Initial fetch
        fetchRates();
    }
};
