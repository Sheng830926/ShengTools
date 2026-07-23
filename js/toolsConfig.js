/**
 * ShengTools - 工具總冊彙整配置表
 * 分類順序：文字處理 > 安全與加解密 > 實用與設計 > 開發與網路
 */

// 1. ✍️ 文字處理 (Text Processing)
import { textCompareTool } from './tools/textCompare.js';
import { markdownEditorTool } from './tools/markdownEditor.js';
import { wordCounterTool } from './tools/wordCounter.js';
import { caseConverterTool } from './tools/caseConverter.js';
import { textDedupTool } from './tools/textDedup.js';

// 2. 🔐 安全與加解密 (Security & Crypto)
import { jweHelperTool } from './tools/jweHelper.js';
import { companyCryptoTool } from './tools/companyCrypto.js';
import { hashGeneratorTool } from './tools/hashGenerator.js';
import { base64CodecTool } from './tools/base64Codec.js';
import { urlCodecTool } from './tools/urlCodec.js';

// 3. 🎨 實用與設計 (Utility & Design)
import { colorToolsTool } from './tools/colorTools.js';
import { qrGeneratorTool } from './tools/qrGenerator.js';
import { luckyWheelTool } from './tools/luckyWheel.js';
import { dateCalculatorTool } from './tools/dateCalculator.js';
import { currencyConverterTool } from './tools/currencyConverter.js';

// 4. 💻 開發與網路 (Dev & Network)
import { httpStatusTool } from './tools/httpStatus.js';
import { mimeTypeTool } from './tools/mimeType.js';
import { jsonFormatterTool } from './tools/jsonFormatter.js';
import { regexTesterTool } from './tools/regexTester.js';
import { converterBoxTool } from './tools/converterBox.js';

export const toolsConfig = [
    // ✍️ 文字處理
    textCompareTool,
    markdownEditorTool,
    wordCounterTool,
    caseConverterTool,
    textDedupTool,

    // 🔐 安全與加解密
    jweHelperTool,
    companyCryptoTool,
    hashGeneratorTool,
    base64CodecTool,
    urlCodecTool,

    // 🎨 實用與設計
    colorToolsTool,
    qrGeneratorTool,
    luckyWheelTool,
    dateCalculatorTool,
    currencyConverterTool,

    // 💻 開發與網路
    httpStatusTool,
    mimeTypeTool,
    jsonFormatterTool,
    regexTesterTool,
    converterBoxTool
];
