import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from './store';

export function savePdfOutput(store: Store, downloads: string, title: string, bytes: Buffer) {
  fs.mkdirSync(downloads, { recursive: true });
  const operation = randomUUID();
  const name = title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/g, '').slice(0, 80) || 'Notas';
  const target = path.join(downloads, `Nodus-${name}-${operation.slice(0, 8)}.pdf`);
  const fd = fs.openSync(target, 'wx');
  try {
    try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    store.audit('pdf:export', operation, 'ok');
  } catch (error) {
    // Only this operation's exclusively created output is removed. Sources are never written.
    fs.unlinkSync(target);
    throw error;
  }
  return target;
}
