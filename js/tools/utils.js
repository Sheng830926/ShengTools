/**
 * ShengTools - 共用輔助與核心運算函數庫 (ES Modules)
 */

// 1. 安全 Base64 轉換輔助函數 (支援 UTF-8 避免中文亂碼)
export function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

export function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// 2. 色彩空間轉換輔助函數
export function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const bigint = parseInt(hex, 16);
    return isNaN(bigint) ? null : {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

export function rgbToHex(r, g, b) {
    const clamp = (val) => Math.max(0, Math.min(255, val));
    return "#" + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1).toUpperCase();
}

export function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hslToRgb(h, s, l) {
    h /= 360, s /= 100, l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// 3. HTML 轉義防範 XSS
export const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

// 4. 並排文本比對 (LCS 最長共同子序列演算法)
export function diffLines(linesA, linesB) {
    const n = linesA.length;
    const m = linesB.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (linesA[i - 1] === linesB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    let i = n, j = m;
    const diff = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
            diff.push({ type: 'equal', lineA: linesA[i - 1], lineB: linesB[j - 1], lnA: i, lnB: j });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            diff.push({ type: 'insert', line: linesB[j - 1], lnB: j });
            j--;
        } else {
            diff.push({ type: 'delete', line: linesA[i - 1], lnA: i });
            i--;
        }
    }
    return diff.reverse();
}

// 5. 簡易 Regex-based Markdown 編譯引擎
export function compileMarkdown(md) {
    if (!md.trim()) return "<span style='color:var(--text-muted)'>等待輸入 Markdown 內容...</span>";
    
    let html = md;
    html = escapeHtml(html);
        
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^\-\s?(.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\*\s?(.*$)/gim, '<li>$1</li>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    html = html.split('\n').map(line => {
        const skip = line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<h3>') || 
                     line.startsWith('<blockquote>') || line.startsWith('<pre>') || line.startsWith('<li>') ||
                     line.endsWith('</pre>') || line.endsWith('</blockquote>');
        return skip ? line : line + '<br>';
    }).join('');
    
    html = html.replace(/(<br>){2,}/g, '<br>');
    return html;
}
