/**
 * ShengTools - 幸運抽籤輪盤
 */
export const luckyWheelTool = {
    id: "lucky-wheel",
    name: "幸運抽籤輪盤",
    icon: "fa-solid fa-arrows-spin",
    category: "實用與設計",
    description: "自訂抽籤選項，點擊旋轉輪盤進行隨機抽籤，支援大氣的物理減速動態效果與中獎高亮提示。",
    render: (container) => {
        container.innerHTML = `
            <div class="tool-layout-container">
                <div class="tool-info-header">
                    <h2 class="tool-name">幸運抽籤輪盤</h2>
                    <p class="tool-description">在左側輸入自訂選項（一行一個），點擊下方按鈕即可旋轉輪盤進行公平抽籤。</p>
                </div>
                
                <div class="tool-grid-2col" style="grid-template-columns: 1fr 2fr; align-items: start;">
                    <!-- 左側：設定與按鈕 -->
                    <div class="editor-panel">
                        <div class="editor-label">自訂抽籤選項 (每行一個項目)</div>
                        <div class="editor-textarea-wrapper" style="height: 260px;">
                            <textarea id="wheelItems" style="height: 100%;">
今天吃拉麵 🍜
今天吃便當 🍱
今天吃壽司 🍣
今天吃火鍋 🍲
今天吃麥當勞 🍔
今天吃披薩 🍕
                            </textarea>
                        </div>
                        
                        <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
                            <button class="tool-btn tool-btn-secondary" id="updateWheelBtn" style="justify-content: center; width: 100%;">
                                <i class="fa-solid fa-arrows-rotate"></i> 更新輪盤選項
                            </button>
                            <button class="tool-btn tool-btn-primary" id="spinWheelBtn" style="justify-content: center; width: 100%; padding: 14px; font-size: 1.05rem;">
                                <i class="fa-solid fa-play"></i> 開始旋轉輪盤
                            </button>
                        </div>
                    </div>
                    
                    <!-- 右側：輪盤與中獎宣告 -->
                    <div class="wheel-section">
                        <div class="wheel-wrapper" style="width: 460px; height: 460px;">
                            <canvas id="wheelCanvas" width="460" height="460"></canvas>
                            <!-- CSS 頂部紅色指針 -->
                            <div class="wheel-pointer"></div>
                        </div>
                        <div class="winner-announce" id="winnerAnnounce" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        const textarea = container.querySelector("#wheelItems");
        const updateBtn = container.querySelector("#updateWheelBtn");
        const spinBtn = container.querySelector("#spinWheelBtn");
        const canvas = container.querySelector("#wheelCanvas");
        const winnerAnnounce = container.querySelector("#winnerAnnounce");
        const ctx = canvas.getContext("2d");

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const radius = width / 2 - 14;

        let items = [];
        let currentAngle = 0;
        let speed = 0;
        let friction = 0.985; // 減速摩擦力，值越大轉越久（輪盤更大，轉久一點更好看）
        let isSpinning = false;
        let animId = null;

        // 解析並讀取設定
        const loadItems = () => {
            items = textarea.value.split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);
        };

        // 柔和配色組（避免太刺眼）
        const colorPalette = [
            '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316',
            '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
            '#3b82f6', '#8b5cf6', '#d946ef', '#e11d48', '#ea580c',
            '#ca8a04', '#65a30d', '#16a34a', '#0d9488', '#0891b2'
        ];

        // 繪製輪盤
        const drawWheel = () => {
            ctx.clearRect(0, 0, width, height);
            
            if (items.length === 0) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.textAlign = "center";
                ctx.fillStyle = "#9ca3af";
                ctx.font = "16px Outfit, Microsoft JhengHei";
                ctx.fillText("請在左側輸入選項", 0, 0);
                ctx.restore();
                return;
            }

            const arcSize = (2 * Math.PI) / items.length;

            // 繪製外框光暈圓環
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius + 6, 0, 2 * Math.PI);
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            ctx.strokeStyle = isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.15)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();

            // 旋轉畫布整體
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(currentAngle);

            for (let i = 0; i < items.length; i++) {
                const startAngle = i * arcSize;
                const endAngle = startAngle + arcSize;

                // 1. 繪製扇形
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colorPalette[i % colorPalette.length];
                ctx.fill();
                
                // 繪製白線條隔開
                ctx.strokeStyle = "rgba(255,255,255,0.25)";
                ctx.lineWidth = 2;
                ctx.stroke();

                // 2. 繪製文字 (translate & rotate)
                ctx.save();
                ctx.rotate(startAngle + arcSize / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = "#ffffff";
                
                // 根據輪盤大小與項目數量動態調整字型
                const fontSize = items.length <= 6 ? 16 : items.length <= 10 ? 14 : 12;
                ctx.font = `bold ${fontSize}px Outfit, Microsoft JhengHei`;
                
                // 文字陰影提升可讀性
                ctx.shadowColor = "rgba(0,0,0,0.4)";
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                // 截短過長選項字元避免壓疊
                let text = items[i];
                const maxLen = items.length <= 6 ? 14 : items.length <= 10 ? 10 : 8;
                if (text.length > maxLen) text = text.substring(0, maxLen - 2) + "...";
                
                ctx.fillText(text, radius - 20, 5);
                ctx.restore();
            }

            ctx.restore();

            // 3. 繪製中心漸層裝飾圓盤
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
            gradient.addColorStop(0, isDark ? "#374151" : "#ffffff");
            gradient.addColorStop(1, isDark ? "#1f2937" : "#f1f5f9");
            
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
            ctx.lineWidth = 3;
            ctx.stroke();

            // 中心小圓點
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#6366f1";
            ctx.fill();
        };

        // 實體旋轉物理減速循環
        const rotateCycle = () => {
            if (!document.getElementById("wheelCanvas")) {
                cancelAnimationFrame(animId);
                return; // 路由安全機制，若輪盤已卸載則終止循環
            }

            currentAngle += speed;
            speed *= friction;

            drawWheel();

            if (speed < 0.001) {
                // 停止旋轉
                isSpinning = false;
                cancelAnimationFrame(animId);

                // 啟動按鈕
                spinBtn.disabled = false;
                textarea.disabled = false;
                updateBtn.disabled = false;

                // 計算指針指向的項目 (指針在正上方：1.5 * Math.PI)
                const arcSize = (2 * Math.PI) / items.length;
                let targetAngle = (1.5 * Math.PI - currentAngle) % (2 * Math.PI);
                if (targetAngle < 0) targetAngle += 2 * Math.PI;

                const index = Math.floor(targetAngle / arcSize) % items.length;
                const winner = items[index];

                // 顯示中獎視覺通知
                winnerAnnounce.textContent = `🎉 恭喜中籤：${winner}`;
                winnerAnnounce.style.display = "block";
            } else {
                animId = requestAnimationFrame(rotateCycle);
            }
        };

        // 更新按鈕
        updateBtn.addEventListener("click", () => {
            if (isSpinning) return;
            loadItems();
            winnerAnnounce.style.display = "none";
            drawWheel();
        });

        // 旋轉按鈕
        spinBtn.addEventListener("click", () => {
            if (isSpinning) return;
            loadItems();

            if (items.length === 0) {
                alert("請先輸入抽籤選項！");
                return;
            }

            isSpinning = true;
            winnerAnnounce.style.display = "none";
            
            // 停用相關輸入與按鈕
            spinBtn.disabled = true;
            textarea.disabled = true;
            updateBtn.disabled = true;

            // 隨機設定初始速度 (介於 0.25 到 0.45 之間)
            speed = Math.random() * 0.2 + 0.25;
            rotateCycle();
        });

        // 初始載入
        loadItems();
        drawWheel();
    }
};
