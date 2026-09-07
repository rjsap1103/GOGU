const fs = require('fs');
const zlib = require('zlib');

function paeth(a, b, c) {
    let p = a + b - c;
    let pa = Math.abs(p - a);
    let pb = Math.abs(p - b);
    let pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
}

function processPng(srcPath, destPath) {
    const buf = fs.readFileSync(srcPath);
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

    // Now analyze background color from 4 corners
    // [43, 65, 53] is bg:
    // Any pixel with color distance to bg:
    let outRaw = Buffer.alloc(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
        outRaw[y * (1 + w * 4)] = 0; // filter None
        for (let x = 0; x < w; x++) {
            let idx = (y * w + x) * 4;
            let r = pixels[idx];
            let g = pixels[idx + 1];
            let b = pixels[idx + 2];
            let a = pixels[idx + 3];

            // Background color is roughly R=43, G=65, B=53 (dark green)
            // Foreground gold is R~197, G~160, B~89
            // Calculate distance or luminance relative to background:
            let bgDist = Math.sqrt((r - 43)**2 + (g - 65)**2 + (b - 53)**2);
            let alpha = Math.min(255, Math.max(0, Math.round((bgDist - 15) * (255 / 60))));

            let outIdx = y * (1 + w * 4) + 1 + x * 4;
            outRaw[outIdx] = 255;
            outRaw[outIdx + 1] = 255;
            outRaw[outIdx + 2] = 255;
            outRaw[outIdx + 3] = alpha;
        }
    }

    // Re-encode PNG
    let idat = zlib.deflateSync(outRaw);

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

    function makeChunk(type, data) {
        let len = Buffer.alloc(4);
        len.writeUInt32BE(data.length, 0);
        let t = Buffer.from(type, 'ascii');
        let crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
        return Buffer.concat([len, t, data, crcBuf]);
    }

    let ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    let png = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        makeChunk('IHDR', ihdr),
        makeChunk('IDAT', idat),
        makeChunk('IEND', Buffer.alloc(0))
    ]);

    fs.writeFileSync(destPath, png);
    console.log('Saved', destPath, 'size:', png.length);
}

['icon_barley.png', 'icon_hop.png', 'icon_water.png', 'icon_yeast.png'].forEach(f => {
    processPng('assets/icons/' + f, 'assets/icons/' + f);
});
