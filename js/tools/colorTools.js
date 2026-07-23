/**
 * ShengTools - 色彩工具與調色盤
 */
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './utils.js';

export const colorToolsTool = {
    id: "color-tools",
    name: "色彩工具與調色盤",
    icon: "fa-solid fa-palette",
    category: "實用與設計",
    description: "色彩選擇器、HEX/RGB/HSL 色碼互轉，並自動計算相鄰色與補色調色盤。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">色彩工具與調色盤</h2>
                    <p class="tool-description">色彩選擇器、HEX/RGB/HSL 色碼互轉，支援隨機生成色碼與原生螢幕滴管取色。</p>
                </div>
                
                <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-top:10px;">
                    <div class="color-picker-section">
                        <div class="native-color-picker-wrapper">
                            <input type="color" id="colorPicker" value="#6366f1">
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%;">
                            <div class="editor-panel">
                                <label class="editor-label">HEX</label>
                                <input type="text" id="colorHex" class="tool-input-field" value="#6366F1">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">RGB</label>
                                <input type="text" id="colorRgb" class="tool-input-field" value="rgb(99, 102, 241)">
                            </div>
                            <div class="editor-panel">
                                <label class="editor-label">HSL</label>
                                <input type="text" id="colorHsl" class="tool-input-field" value="hsl(239, 84%, 67%)">
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-actions-row" style="margin-top: 20px; justify-content: flex-start;">
                        <button class="tool-btn tool-btn-secondary" id="randomColorBtn">
                            <i class="fa-solid fa-dice"></i> 隨機生成顏色
                        </button>
                        <button class="tool-btn tool-btn-primary" id="eyeDropperBtn" style="display: none;">
                            <i class="fa-solid fa-eye-dropper"></i> 螢幕取色器
                        </button>
                    </div>
                </div>
                
                <div class="color-palette-card">
                    <h3 class="palette-section-title">
                        <i class="fa-solid fa-swatchbook"></i> 推薦配色調色盤
                    </h3>
                    <div class="color-swatch-grid" id="colorPaletteGrid"></div>
                </div>
            </div>
        `;

        const picker = container.querySelector("#colorPicker");
        const hexInput = container.querySelector("#colorHex");
        const rgbInput = container.querySelector("#colorRgb");
        const hslInput = container.querySelector("#colorHsl");
        const paletteGrid = container.querySelector("#colorPaletteGrid");
        const randomBtn = container.querySelector("#randomColorBtn");
        const eyedropperBtn = container.querySelector("#eyeDropperBtn");

        const updateColors = (hexVal) => {
            picker.value = hexVal;
            hexInput.value = hexVal;
            const rgb = hexToRgb(hexVal);
            if (rgb) {
                rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                generatePalette(hsl.h, hsl.s, hsl.l);
            }
        };

        const generatePalette = (h, s, l) => {
            const colors = [
                { h: h, s: s, l: l },
                { h: (h + 30) % 360, s: s, l: l },
                { h: (h + 180) % 360, s: s, l: l },
                { h: (h + 210) % 360, s: s, l: l },
                { h: h, s: Math.max(10, s - 15), l: Math.min(90, l + 15) }
            ];

            paletteGrid.innerHTML = colors.map(hslObj => {
                const rgbObj = hslToRgb(hslObj.h, hslObj.s, hslObj.l);
                const hexStr = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
                return `
                    <div class="color-swatch" data-hex="${hexStr}">
                        <div class="color-swatch-block" style="background-color: ${hexStr}"></div>
                        <span class="color-swatch-hex">${hexStr}</span>
                    </div>
                `;
            }).join("");

            paletteGrid.querySelectorAll(".color-swatch").forEach(swatch => {
                swatch.addEventListener("click", () => {
                    const hexToCopy = swatch.getAttribute("data-hex");
                    navigator.clipboard.writeText(hexToCopy).then(() => {
                        const label = swatch.querySelector(".color-swatch-hex");
                        const original = label.textContent;
                        label.textContent = "已複製！";
                        label.style.color = "var(--success)";
                        setTimeout(() => {
                            label.textContent = original;
                            label.style.color = "";
                        }, 1000);
                    });
                });
            });
        };

        picker.addEventListener("input", (e) => updateColors(e.target.value.toUpperCase()));
        hexInput.addEventListener("input", (e) => {
            const hex = e.target.value.trim();
            if (/^#[0-9A-F]{6}$/i.test(hex)) updateColors(hex.toUpperCase());
        });
        rgbInput.addEventListener("input", (e) => {
            const rgbMatch = e.target.value.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const hex = rgbToHex(parseInt(rgbMatch[0]), parseInt(rgbMatch[1]), parseInt(rgbMatch[2]));
                updateColors(hex);
            }
        });

        // 1. 隨機顏色生成
        randomBtn.addEventListener("click", () => {
            const randomHex = rgbToHex(
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256)
            );
            updateColors(randomHex);
        });

        // 2. 螢幕取色器 (Eye Dropper API)
        if ("EyeDropper" in window) {
            eyedropperBtn.style.display = "flex";
            eyedropperBtn.addEventListener("click", () => {
                const eyeDropper = new EyeDropper();
                eyeDropper.open()
                    .then(result => {
                        updateColors(result.sRGBHex.toUpperCase());
                    })
                    .catch(err => {
                        console.log("EyeDropper 取得顏色取消或失敗:", err);
                    });
            });
        }

        updateColors("#6366F1");
    }
};
