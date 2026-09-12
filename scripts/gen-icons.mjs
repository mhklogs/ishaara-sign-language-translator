import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, "../extension/icons");
mkdirSync(ICON_DIR, { recursive: true });

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type, "ascii");
  const body = Buffer.concat([name, data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, sum]);
}

function writePng(size, outPath) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const t = x / size;
      const v = y / size;
      const cx = (x - size / 2) / (size / 2);
      const cy = (y - size / 2) / (size / 2);
      const inside = cx * cx + cy * cy <= 1;
      const o = row + 1 + x * 4;
      const g = 52 + (1 - t) * 72; // emerald-ish diagonal gradient
      if (!inside) {
        raw[o] = 9;
        raw[o + 1] = 9;
        raw[o + 2] = 11;
        raw[o + 3] = 255;
      } else {
        const a = (v * 0.9 + 0.1).toFixed(0);
        raw[o] = Math.round(16 + g * 0.35);
        raw[o + 1] = Math.round(g);
        raw[o + 2] = Math.round(130 - t * 20);
        raw[o + 3] = parseInt(a, 10) > 1 ? 255 : 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(outPath, png);
  console.log(`wrote ${outPath}`);
}

for (const size of [16, 48, 128]) {
  writePng(size, join(ICON_DIR, `icon-${size}.png`));
}