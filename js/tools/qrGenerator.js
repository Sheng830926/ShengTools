/**
 * ShengTools - QR Code 生成器
 */
export const qrGeneratorTool = {
    id: "qr-generator",
    name: "QR Code 生成器",
    icon: "fa-solid fa-qrcode",
    category: "實用工具",
    description: "輸入任意文字或網址 URL 即時生成 QR Code 二維碼，支援自訂多種尺寸並可一鍵下載。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">QR Code 生成器</h2>
                    <p class="tool-description">輸入網址或文字，系統會即時為您生成二維碼。此二維碼是在瀏覽器本地調用 API 生成，安全、快捷。</p>
                </div>
                
                <div class="tool-grid-2col">
                    <div class="editor-panel">
                        <div class="editor-label">輸入 QR Code 內容 (網址或純文字)</div>
                        <div class="editor-textarea-wrapper" style="height:120px;">
                            <textarea id="qrInputText" style="height:100%" placeholder="在此輸入文字，例如：https://google.com"></textarea>
                        </div>
                        
                        <div class="editor-label" style="margin-top:16px;">圖片尺寸選擇 (像素)</div>
                        <select id="qrSizeSelect" class="tool-select-field">
                            <option value="150">150 x 150 px</option>
                            <option value="200" selected>200 x 200 px</option>
                            <option value="250">250 x 250 px</option>
                            <option value="300">300 x 300 px</option>
                            <option value="400">400 x 400 px</option>
                        </select>
                        
                        <div style="margin-top:24px;">
                            <button class="tool-btn tool-btn-primary" id="downloadQrBtn" style="width:100%; justify-content:center;">
                                <i class="fa-solid fa-download"></i> 下載 QR Code 圖片
                            </button>
                        </div>
                    </div>
                    
                    <div class="editor-panel">
                        <div class="editor-label">即時 QR Code 預覽</div>
                        <div class="qr-preview-card">
                            <div class="qr-image-wrapper" id="qrImageWrapper">
                                <img id="qrImage" src="" alt="QR Code 預覽區">
                            </div>
                            <span class="color-swatch-hex" style="color:var(--text-muted)">使用手機相機即可直接掃描讀取</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const input = container.querySelector("#qrInputText");
        const sizeSelect = container.querySelector("#qrSizeSelect");
        const qrImg = container.querySelector("#qrImage");
        const downloadBtn = container.querySelector("#downloadQrBtn");

        const updateQrCode = () => {
            const text = input.value.trim();
            const size = sizeSelect.value;
            
            if (!text) {
                const defaultUrl = "https://github.com";
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(defaultUrl)}`;
                return;
            }
            
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
        };

        input.addEventListener("input", updateQrCode);
        sizeSelect.addEventListener("change", updateQrCode);

        downloadBtn.addEventListener("click", () => {
            const text = input.value.trim();
            if (!text) {
                alert("請先在左側輸入要生成的內容再進行下載！");
                return;
            }

            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 下載中...`;

            fetch(qrImg.src)
                .then(res => res.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `shengtools_qrcode_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> 下載成功！`;
                    downloadBtn.style.background = "var(--success)";
                    
                    setTimeout(() => {
                        downloadBtn.innerHTML = originalText;
                        downloadBtn.style.background = "";
                    }, 1500);
                })
                .catch(err => {
                    console.error("下載 QR Code 錯誤:", err);
                    alert("下載失敗，請嘗試右鍵另存 QR Code 圖片。");
                    downloadBtn.innerHTML = originalText;
                });
        });

        input.value = "https://github.com";
        updateQrCode();
    }
};
