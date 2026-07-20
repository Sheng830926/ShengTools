/**
 * ShengTools - 工具總冊彙整配置表
 */
import { jsonFormatterTool } from './tools/jsonFormatter.js';
import { base64CodecTool } from './tools/base64Codec.js';
import { urlCodecTool } from './tools/urlCodec.js';
import { regexTesterTool } from './tools/regexTester.js';
import { jwtDecoderTool } from './tools/jwtDecoder.js';
import { converterBoxTool } from './tools/converterBox.js';
import { textCompareTool } from './tools/textCompare.js';
import { markdownEditorTool } from './tools/markdownEditor.js';
import { wordCounterTool } from './tools/wordCounter.js';
import { colorToolsTool } from './tools/colorTools.js';
import { qrGeneratorTool } from './tools/qrGenerator.js';
import { luckyWheelTool } from './tools/luckyWheel.js';

export const toolsConfig = [
    jsonFormatterTool,
    base64CodecTool,
    urlCodecTool,
    regexTesterTool,
    jwtDecoderTool,
    converterBoxTool,
    textCompareTool,
    markdownEditorTool,
    wordCounterTool,
    colorToolsTool,
    qrGeneratorTool,
    luckyWheelTool
];
