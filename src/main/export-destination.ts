import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../shared/contracts';
export function exportDestination(selected: string) { const canonical = fs.realpathSync.native(selected); if (fs.lstatSync(selected).isSymbolicLink() || canonical.toLowerCase() !== path.resolve(selected).toLowerCase() || !fs.statSync(canonical).isDirectory() || canonical === path.parse(canonical).root || canonical.split(path.sep).some(p => p.toLowerCase() === '.git'))
    throw new AppError('EXPORT_FOLDER', 'Escolha uma pasta regular, sem links ou metadados de Git.'); return canonical; }
