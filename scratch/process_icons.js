const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Paeth predictor for PNG unfiltering
 */
function paeth(a, b, c) {
    let p = a + b - c;
    let pa = Math.abs(p - a);
    let pb = Math.abs(p - b);
    let pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
}

/**
 * Decode standard PNG buffer into RGBA raw buffer
 */
function decodePng(buf) {
    let offset = 8;
    let w = 0, h = 0;
    let idatChunks = [];
    while (offset < buf.length) {
        let len = buf.readUInt32BE(offset);
        let type = buf.toString('ascii', offset + 4, offset + 8);
        if (type === 'IHDR') {
            w = buf.readUInt32BE(offset + 8);
            h = buf.readUInt32BE(offset + 12);
        } else if (type === 'IDAT') {
            idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
        }
        offset += 12 + len;
    }

    let raw = zlib.inflateSync(Buffer.concat(idatChunks));
    let stride = 1 + w * 4;
    let pixels = Buffer.alloc(w * h * 4);
    let prevRow = Buffer.alloc(w * 4);
    let currRow = Buffer.alloc(w * 4);

    for (let y = 0; y < h; y++) {
        let filterType = raw[y * stride];
        let rowStart = y * stride + 1;
        for (let x = 0; x < w * 4; x++) {
            let b = raw[rowStart + x];
            let a = (x >= 4) ? currRow[x - 4] : 0;
            let c = prevRow[x];
            let d = (x >= 4) ? prevRow[x - 4] : 0;

            if (filterType === 0) currRow[x] = b;
            else if (filterType === 1) currRow[x] = (b + a) & 0xff;
            else if (filterType === 2) currRow[x] = (b + c) & 0xff;
            else if (filterType === 3) currRow[x] = (b + Math.floor((a + c) / 2)) & 0xff;
            else if (filterType === 4) currRow[x] = (b + paeth(a, c, d)) & 0xff;
        }

        currRow.copy(pixels, y * w * 4);
        currRow.copy(prevRow, 0);
    }
    return { w, h, pixels };
}

/**
 * CRC32 calculation for PNG chunks
 */
function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        table[i] = c >>> 0;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Construct PNG chunk
 */
function makeChunk(type, data) {
    let len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    let t = Buffer.from(type, 'ascii');
    let crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crcBuf]);
}

/**
 * Encode RGBA raw buffer into standard PNG file buffer
 */
function encodePng(w, h, rgbaBuffer) {
    let outRaw = Buffer.alloc(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
        outRaw[y * (1 + w * 4)] = 0; // Filter None
        rgbaBuffer.copy(outRaw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
    }
    let idat = zlib.deflateSync(outRaw);

    let ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // RGBA
    ihdr[10] = 0; // deflate
    ihdr[11] = 0; // filter method
    ihdr[12] = 0; // interlace

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        makeChunk('IHDR', ihdr),
        makeChunk('IDAT', idat),
        makeChunk('IEND', Buffer.alloc(0))
    ]);
}

/**
 * Extract central icon from image:
 * - Detects background color from corners
 * - Ignores outer square frame
 * - Isolates central glyph and calculates anti-aliased alpha transparency
 * - Centers glyph onto a canvas (default: 40x40 for 24px icon visual scaling in story.css)
 */
function extractCenterIcon(srcPath, targetW = 40, targetH = 40) {
    const buf = fs.readFileSync(srcPath);
    const { w, h, pixels } = decodePng(buf);

    // Sample background color from 4 corners
    let bgR = Math.round((pixels[0] + pixels[(w - 1) * 4] + pixels[(h - 1) * w * 4] + pixels[(h * w - 1) * 4]) / 4);
    let bgG = Math.round((pixels[1] + pixels[(w - 1) * 4 + 1] + pixels[(h - 1) * w * 4 + 1] + pixels[(h * w - 1) * 4 + 1]) / 4);
    let bgB = Math.round((pixels[2] + pixels[(w - 1) * 4 + 2] + pixels[(h - 1) * w * 4 + 2] + pixels[(h * w - 1) * 4 + 2]) / 4);

    // Expected foreground gold color: #C5A059 (197, 160, 89)
    let fgR = 197, fgG = 160, fgB = 89;
    let dR = fgR - bgR, dG = fgG - bgG, dB = fgB - bgB;
    let lenSq = dR * dR + dG * dG + dB * dB;

    // Scan inner region (skipping outer border at ~15-20px from edge) to find glyph bounding box
    let innerMargin = 25;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = innerMargin; y <= h - innerMargin; y++) {
        for (let x = innerMargin; x <= w - innerMargin; x++) {
            let idx = (y * w + x) * 4;
            let dist = Math.sqrt((pixels[idx] - bgR) ** 2 + (pixels[idx + 1] - bgG) ** 2 + (pixels[idx + 2] - bgB) ** 2);
            if (dist > 25) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (minX > maxX || minY > maxY) {
        throw new Error(`No glyph found in ${srcPath}`);
    }

    let glyphW = maxX - minX + 1;
    let glyphH = maxY - minY + 1;

    let outPixels = Buffer.alloc(targetW * targetH * 4);
    let offsetX = Math.floor((targetW - glyphW) / 2);
    let offsetY = Math.floor((targetH - glyphH) / 2);

    for (let gy = 0; gy < glyphH; gy++) {
        for (let gx = 0; gx < glyphW; gx++) {
            let srcX = minX + gx;
            let srcY = minY + gy;
            let srcIdx = (srcY * w + srcX) * 4;
            let r = pixels[srcIdx], g = pixels[srcIdx + 1], b = pixels[srcIdx + 2];

            // Linear projection to compute smooth anti-aliased transparency
            let t = ((r - bgR) * dR + (g - bgG) * dG + (b - bgB) * dB) / lenSq;
            let alpha = 0;
            if (t > 0.08) {
                alpha = Math.min(255, Math.max(0, Math.round(((t - 0.08) / 0.84) * 255)));
            }

            let dstX = offsetX + gx;
            let dstY = offsetY + gy;
            let dstIdx = (dstY * targetW + dstX) * 4;

            // Pure white with alpha (consistent with icon_barley.png and story.css tint filter)
            outPixels[dstIdx] = 255;
            outPixels[dstIdx + 1] = 255;
            outPixels[dstIdx + 2] = 255;
            outPixels[dstIdx + 3] = alpha;
        }
    }

    return encodePng(targetW, targetH, outPixels);
}

// Ensure target icons directory exists
const targetDir = path.resolve(__dirname, '../assets/icons');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Icon sources mapping
const iconConfigs = [
    {
        name: 'Flame (자비 / 홉 투입: BOILING)',
        src: fs.existsSync(path.resolve(__dirname, 'raw_flame.png'))
            ? path.resolve(__dirname, 'raw_flame.png')
            : 'C:/Users/mbc/.gemini/antigravity-ide/brain/d6fa4141-4d37-4204-9df6-fd288517cab5/.user_uploaded/media_1788838974359.png',
        destFiles: ['icon_boiling.png', 'icon_flame.png']
    },
    {
        name: 'Snowflake (저온 숙성: LAGERING)',
        src: fs.existsSync(path.resolve(__dirname, 'raw_snowflake.png'))
            ? path.resolve(__dirname, 'raw_snowflake.png')
            : 'C:/Users/mbc/.gemini/antigravity-ide/brain/d6fa4141-4d37-4204-9df6-fd288517cab5/.user_uploaded/media_1788838963758.png',
        destFiles: ['icon_lagering.png', 'icon_snowflake.png']
    },
    {
        name: 'Bottle (병입: PACKAGING)',
        src: fs.existsSync(path.resolve(__dirname, 'raw_bottle.png'))
            ? path.resolve(__dirname, 'raw_bottle.png')
            : 'C:/Users/mbc/.gemini/antigravity-ide/brain/d6fa4141-4d37-4204-9df6-fd288517cab5/.user_uploaded/media_1788838949159.png',
        destFiles: ['icon_packaging.png', 'icon_bottle.png']
    }
];

console.log('=== Processing Icons with scratch/process_icons.js ===');
iconConfigs.forEach(item => {
    try {
        const pngBuf = extractCenterIcon(item.src, 40, 40);
        item.destFiles.forEach(file => {
            const destPath = path.join(targetDir, file);
            fs.writeFileSync(destPath, pngBuf);
            console.log(`[OK] Saved ${file} (${pngBuf.length} bytes) for ${item.name}`);
        });
    } catch (err) {
        console.error(`[ERROR] Failed to process ${item.name}:`, err.message);
    }
});
console.log('=== Extraction complete! ===');
