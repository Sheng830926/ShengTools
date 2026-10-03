/**
 * ShengTools - 工具總冊彙整配置表
 * 工具順序：嚴格依指定順序排列
 */

// 1. ✍️ 文字與格式 (6 款)
import { textCompareTool } from './tools/textCompare.js';
import { jsonFormatterTool } from './tools/jsonFormatter.js';
import { wordCounterTool } from './tools/wordCounter.js';
import { caseConverterTool } from './tools/caseConverter.js';
import { textDedupTool } from './tools/textDedup.js';
import { markdownEditorTool } from './tools/markdownEditor.js';

// 2. 🔐 安全與開發 (6 款)
import { jweHelperTool } from './tools/jweHelper.js';
import { companyCryptoTool } from './tools/companyCrypto.js';
import { hashGeneratorTool } from './tools/hashGenerator.js';
import { base64CodecTool } from './tools/base64Codec.js';
import { urlCodecTool } from './tools/urlCodec.js';
import { regexTesterTool } from './tools/regexTester.js';

// 3. 🛠️ 實用與生活 (6 款)
import { currencyConverterTool } from './tools/currencyConverter.js';
import { dateCalculatorTool } from './tools/dateCalculator.js';
import { converterBoxTool } from './tools/converterBox.js';
import { colorToolsTool } from './tools/colorTools.js';
import { luckyWheelTool } from './tools/luckyWheel.js';
import { qrGeneratorTool } from './tools/qrGenerator.js';

// 4. 🌐 網路與查詢 (2 款)
import { httpStatusTool } from './tools/httpStatus.js';
import { mimeTypeTool } from './tools/mimeType.js';

export const toolsConfig = [
    // 1. 文本比對器
    textCompareTool,
    // 2. JSON 格式化與驗證器
    jsonFormatterTool,
    // 3. 字數統計器
    wordCounterTool,
    // 4. 文字大小寫轉換器
    caseConverterTool,
    // 5. 文字重複移除工具
    textDedupTool,
    // 6. Markdown 編輯器
    markdownEditorTool,

    // 7. JWE 加解密工具
    jweHelperTool,
    // 8. 公司加解密工具
    companyCryptoTool,
    // 9. Hash 雜湊生成器
    hashGeneratorTool,
    // 10. Base64 編解碼器
    base64CodecTool,
    // 11. URL 編解碼器
    urlCodecTool,
    // 12. 正規表達式測試器
    regexTesterTool,

    // 13. 貨幣轉換器
    currencyConverterTool,
    // 14. 日期計算器
    dateCalculatorTool,
    // 15. 進制與單位轉換器
    converterBoxTool,
    // 16. 色彩工具與調色盤
    colorToolsTool,
    // 17. 幸運抽籤輪盤
    luckyWheelTool,
    // 18. QR Code 生成器
    qrGeneratorTool,

    // 19. HTTP 狀態碼對照表
    httpStatusTool,
    // 20. MIME 類型對照表
    mimeTypeTool
];
