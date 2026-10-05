import fs from 'node:fs';
import path from 'node:path';
import { photoDimensions } from './photo-input';
import { AppError } from '../shared/contracts';
export function exportImage(root: string, notePath: string, source: string, normalize: (bytes: Buffer) => Buffer) {
    let decoded: string;
    try {
        decoded = decodeURIComponent(source);
    }
    catch {
        throw new AppError('EXPORT_IMAGE', 'Referência de imagem inválida.');
    }
    if (!decoded || /[\\:\0?#]/.test(decoded) || decoded.startsWith('/') || path.isAbsolute(decoded))
        throw new AppError('EXPORT_IMAGE', 'Somente imagens locais relativas.');
    const target = path.resolve(root, path.dirname(notePath), decoded), relative = path.relative(root, target);
    if (!relative || path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep) || relative.split(path.sep).some(p => p.startsWith('.') || ['node_modules', 'dist', 'release'].includes(p.toLowerCase())) || !/\.(png|jpe?g)$/i.test(target))
        throw new AppError('EXPORT_IMAGE', 'Imagem fora da pasta ou formato não suportado.');
    let cursor = root;
    for (const part of relative.split(path.sep)) {
        cursor = path.join(cursor, part);
        if (fs.lstatSync(cursor).isSymbolicLink() || fs.realpathSync.native(cursor).toLowerCase() !== path.resolve(cursor).toLowerCase())
            throw new AppError('EXPORT_IMAGE', 'Links de imagem não são seguidos.');
    }
    const fd = fs.openSync(target, 'r');
    try {
        const before = fs.fstatSync(fd);
        if (!before.isFile() || before.size > 2 * 1024 * 1024)
            throw new AppError('EXPORT_IMAGE', 'Imagem acima de 2 MiB.');
        const bytes = Buffer.alloc(before.size);
        let offset = 0;
        while (offset < bytes.length) {
            const n = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
            if (!n)
                throw new AppError('EXPORT_IMAGE', 'Imagem mudou durante leitura.');
            offset += n;
        }
        const after = fs.fstatSync(fd), current = fs.statSync(target);
        if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || after.ino !== current.ino || after.dev !== current.dev || fs.realpathSync.native(target).toLowerCase() !== target.toLowerCase())
            throw new AppError('EXPORT_IMAGE', 'Imagem mudou durante leitura.');
        photoDimensions(new Uint8Array(bytes));
        const png = normalize(bytes);
        if (!png.length || png.length > 2 * 1024 * 1024)
            throw new AppError('EXPORT_IMAGE', 'Imagem não pôde ser preparada.');
        return png;
    }
    finally {
        fs.closeSync(fd);
    }
}
