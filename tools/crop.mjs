// Crop a tall screenshot into a region for review: node tools/crop.mjs in.png out.png top height [width]
import { createRequire } from 'node:module';
const require = createRequire('D:/SpaceLegacy/_workbench/nodetools/package.json');
const sharp = require('sharp');
const [, , inp, out, top, height, width] = process.argv;
const meta = await sharp(inp).metadata();
const w = Number(width || meta.width);
await sharp(inp).extract({ left: 0, top: Number(top), width: Math.min(w, meta.width), height: Math.min(Number(height), meta.height - Number(top)) }).toFile(out);
console.log('ok', meta.width, meta.height);
