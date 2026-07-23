/**
 * ShengTools - 核心控制引擎 (SPA 路由與全域管理)
 */
import { toolsConfig } from './toolsConfig.js';

// --------------------------------------------------------------------------
// 1. 全域應用程式狀態 (State)
// --------------------------------------------------------------------------
const appState = {
    searchQuery: "",
    activeToolId: "home",      // 預設路由為 "home"
    selectedCategory: "all",  // 首頁 Tab 選擇，預設為 "all"
    theme: "dark"              // 預設主題
};

// --------------------------------------------------------------------------
// 2. 初始化與事件監聽
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();          // 初始化深淺色主題
    initSidebarMobile();  // 初始化手機響應式側邊欄
    initSearch();         // 初始化工具搜尋功能
    initRouter();         // 啟動路由監聽
});

/**
 * 主題切換
 */
function initTheme() {
    const savedTheme = localStorage.getItem("shengtools-theme") || "dark";
    setTheme(savedTheme);

    const sidebarToggle = document.getElementById("sidebarThemeToggleBtn");
    const headerToggle = document.getElementById("headerThemeToggleBtn");

    const handleToggle = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    if (sidebarToggle) sidebarToggle.addEventListener("click", handleToggle);
    if (headerToggle) headerToggle.addEventListener("click", handleToggle);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("shengtools-theme", theme);
    appState.theme = theme;
}

/**
 * 側邊欄控制 (支援桌上型收合與行動端選單)
 */
function initSidebarMobile() {
    const appLayout = document.querySelector(".app-layout");
    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const mobileCloseBtn = document.getElementById("mobileCloseBtn");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    // 載入桌上型電腦預設收合狀態
    const isCollapsed = localStorage.getItem("shengtools-sidebar-collapsed") === "true";
    if (isCollapsed) {
        appLayout.classList.add("sidebar-collapsed");
    }

    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            // 行動版切換抽屜
            appLayout.classList.toggle("sidebar-open");
        } else {
            // 桌上型電腦切換收合/展開
            const nowCollapsed = appLayout.classList.toggle("sidebar-collapsed");
            localStorage.setItem("shengtools-sidebar-collapsed", nowCollapsed ? "true" : "false");
        }
    };

    const closeMobileSidebar = () => appLayout.classList.remove("sidebar-open");

    if (menuToggleBtn) menuToggleBtn.addEventListener("click", toggleSidebar);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeMobileSidebar);

    const sidebarMenu = document.getElementById("sidebarMenu");
    if (sidebarMenu) {
        sidebarMenu.addEventListener("click", (e) => {
            if (e.target.closest(".menu-item")) {
                closeMobileSidebar();
            }
        });
    }

    const logoLink = document.getElementById("logoLink");
    if (logoLink) {
        logoLink.addEventListener("click", closeMobileSidebar);
    }
}

/**
 * 搜尋過濾
 */
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        appState.searchQuery = query;

        if (query) {
            clearSearchBtn.style.display = "flex";
        } else {
            clearSearchBtn.style.display = "none";
        }

        updateView();
    });

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            appState.searchQuery = "";
            clearSearchBtn.style.display = "none";
            searchInput.focus();
            updateView();
        });
    }
}

/**
 * 路由器
 */
function initRouter() {
    const routeHandler = () => {
        const hash = window.location.hash || "#/";
        let toolId = "home";
        if (hash.startsWith("#/")) {
            toolId = hash.substring(2) || "home";
        }

        appState.activeToolId = toolId;
        updateView();
    };

    window.addEventListener("hashchange", routeHandler);
    window.addEventListener("DOMContentLoaded", routeHandler);
    routeHandler();
}

// --------------------------------------------------------------------------
// 3. 全域畫面控制渲染
// --------------------------------------------------------------------------
function updateView() {
    const query = appState.searchQuery;
    const activeId = appState.activeToolId;

    const filteredTools = toolsConfig.filter(tool => {
        const nameMatch = tool.name.toLowerCase().includes(query);
        const descMatch = tool.description.toLowerCase().includes(query);
        const catMatch = tool.category.toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
    });

    renderSidebar(filteredTools, activeId);
    renderContent(filteredTools, activeId);
}

/**
 * 側邊選單渲染
 */
function renderSidebar(filteredTools, activeId) {
    const sidebarMenu = document.getElementById("sidebarMenu");
    if (!sidebarMenu) return;

    let sidebarHtml = `
        <div class="menu-category">
            <a href="#/" class="menu-item ${activeId === "home" ? "active" : ""}">
                <i class="fa-solid fa-house"></i>
                <span>首頁</span>
            </a>
        </div>
    `;

    const grouped = {};
    filteredTools.forEach(tool => {
        if (!grouped[tool.category]) {
            grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
    });

    for (const [categoryName, tools] of Object.entries(grouped)) {
        sidebarHtml += `
            <div class="menu-category">
                <div class="category-title">${categoryName}</div>
                ${tools.map(tool => `
                    <a href="#/${tool.id}" class="menu-item ${activeId === tool.id ? "active" : ""}" data-id="${tool.id}">
                        <i class="${tool.icon}"></i>
                        <span>${tool.name}</span>
                    </a>
                `).join("")}
            </div>
        `;
    }

    sidebarMenu.innerHTML = sidebarHtml;
}

/**
 * 主要顯示區渲染
 */
function renderContent(filteredTools, activeId) {
    const viewport = document.getElementById("toolViewport");
    const headerTitle = document.getElementById("headerTitle");
    if (!viewport) return;

    if (activeId === "home") {
        headerTitle.textContent = "首頁";
        document.title = "ShengTools | 多功能工具箱";
        renderHomeView(viewport, filteredTools);
        return;
    }

    const matchedTool = toolsConfig.find(tool => tool.id === activeId);
    if (matchedTool) {
        headerTitle.textContent = matchedTool.name;
        document.title = `${matchedTool.name} | ShengTools`;
        viewport.innerHTML = "";
        matchedTool.render(viewport);
    } else {
        headerTitle.textContent = "首頁";
        document.title = "ShengTools | 多功能工具箱";
        window.location.hash = "#/";
    }
}

/**
 * 首頁卡片牆與 Tabs 過濾
 */
function renderHomeView(container, filteredTools) {
    const allCategories = [...new Set(toolsConfig.map(t => t.category))];

    const tabsHtml = `
        <div class="home-category-filters">
            <button class="filter-tab ${appState.selectedCategory === "all" ? "active" : ""}" data-category="all">全部工具</button>
            ${allCategories.map(cat => `
                <button class="filter-tab ${appState.selectedCategory === cat ? "active" : ""}" data-category="${cat}">${cat}</button>
            `).join("")}
        </div>
    `;

    let finalTools = filteredTools;
    if (appState.selectedCategory !== "all") {
        finalTools = filteredTools.filter(tool => tool.category === appState.selectedCategory);
    }

    const grouped = {};
    finalTools.forEach(tool => {
        if (!grouped[tool.category]) {
            grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
    });

    let blocksHtml = "";

    if (finalTools.length === 0) {
        blocksHtml = `
            <div class="no-results">
                <i class="fa-solid fa-magnifying-glass-minus"></i>
                <div class="no-results-title">無匹配的工具</div>
                <p>找不到符合您搜尋或分類篩選的工具項目。</p>
                <button class="reset-search-btn" id="homeResetSearchBtn">重設篩選</button>
            </div>
        `;
    } else {
        for (const [categoryName, tools] of Object.entries(grouped)) {
            let catIcon = "fa-solid fa-toolbox";
            if (categoryName === "文字處理") catIcon = "fa-solid fa-pen-nib";
            else if (categoryName === "安全與加解密") catIcon = "fa-solid fa-shield-halved";
            else if (categoryName === "實用與設計") catIcon = "fa-solid fa-cubes";
            else if (categoryName === "開發與網路") catIcon = "fa-solid fa-laptop-code";

            blocksHtml += `
                <div class="category-block" data-category="${categoryName}">
                    <div class="category-block-header">
                        <h3 class="category-block-title">
                            <i class="${catIcon}"></i> ${categoryName}
                        </h3>
                        <span class="category-count-badge">共 ${tools.length} 個項目</span>
                    </div>
                    <div class="tools-grid">
                        ${tools.map(tool => `
                            <div class="tool-card" data-id="${tool.id}">
                                <div class="card-header-area">
                                    <div class="card-icon">
                                        <i class="${tool.icon}"></i>
                                    </div>
                                    <span class="card-badge">${tool.category}</span>
                                </div>
                                <div class="card-body">
                                    <h4 class="card-title">${tool.name}</h4>
                                    <p class="card-desc">${tool.description}</p>
                                </div>
                                <div class="card-footer">
                                    立即開啟 <i class="fa-solid fa-arrow-right-long"></i>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = `
        <div class="home-wrapper">
            <section class="hero-section">
                <div class="hero-content">
                    <h2 class="hero-title">全方位線上多功能工具箱</h2>
                    <p class="hero-desc">純前端線上工具集。無廣告、無後端傳輸，100% 本地安全執行。</p>
                </div>
            </section>
            
            ${tabsHtml}
            
            <div class="home-blocks-container" style="display:flex; flex-direction:column; gap:36px;">
                ${blocksHtml}
            </div>
        </div>
    `;

    container.querySelectorAll(".tool-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            window.location.hash = `#/${id}`;
        });
    });

    container.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            appState.selectedCategory = tab.getAttribute("data-category");
            updateView();
        });
    });

    const resetBtn = container.querySelector("#homeResetSearchBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            appState.selectedCategory = "all";
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = "";
                appState.searchQuery = "";
            }
            updateView();
        });
    }
}
