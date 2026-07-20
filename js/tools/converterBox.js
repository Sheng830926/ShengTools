/**
 * ShengTools - 進制與單位轉換器
 */
export const converterBoxTool = {
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
};
