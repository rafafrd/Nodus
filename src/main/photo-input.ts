import { AppError } from '../shared/contracts';
import { PHOTO_LIMIT } from '../shared/preferences';
export function photoDimensions(input: Uint8Array) {
  const b = Buffer.from(input);
  if (!b.length || b.length > PHOTO_LIMIT) throw new AppError('INVALID_PHOTO', 'Escolha uma foto PNG ou JPEG de até 5 MB.');
  let width = 0, height = 0;
  if (b.length >= 33 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && b.readUInt32BE(8) === 13 && b.toString('ascii', 12, 16) === 'IHDR') {
    width = b.readUInt32BE(16); height = b.readUInt32BE(20);
  } else if (b.length > 4 && b[0] === 255 && b[1] === 216) {
    let offset = 2;
    while (offset < b.length) {
      if (b[offset++] !== 255) break;
      while (offset < b.length && b[offset] === 255) offset++;
      const marker = b[offset++];
      if (marker === 217 || marker === 218 || offset + 2 > b.length) break;
      if (marker === 1 || marker >= 208 && marker <= 215) continue;
      const length = b.readUInt16BE(offset);
      if (length < 2 || offset + length > b.length) break;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) && length >= 8) { height = b.readUInt16BE(offset + 3); width = b.readUInt16BE(offset + 5); break; }
      offset += length;
    }
  }
  if (!width || !height || width > 4096 || height > 4096 || width * height > 4_000_000) throw new AppError('INVALID_PHOTO', 'Use PNG ou JPEG válido, com até 4 milhões de pixels e 4096 px por lado.');
  return { width, height };
}
