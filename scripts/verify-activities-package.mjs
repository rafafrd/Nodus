import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { extractFile } from '@electron/asar';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const asar='release/win-unpacked/resources/app.asar';
const entries=walk('dist').map(file=>{const bytes=fs.readFileSync(file);if(!bytes.equals(extractFile(asar,file)))throw Error('Arquivo divergente no ASAR: '+file);return {file,sha256:hash(bytes)};});
const result={platform:process.platform,files:entries.length,exeSha256:hash(fs.readFileSync('release/win-unpacked/App Estudos.exe')),asarSha256:hash(fs.readFileSync(asar)),entries};
fs.mkdirSync('.local/evidence',{recursive:true});
fs.writeFileSync('.local/evidence/external-activities-package.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,entries:undefined},null,2));
