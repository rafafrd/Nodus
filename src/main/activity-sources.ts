import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { AppError } from '../shared/contracts';
import type { Chunk, SnapshotSource, SourceChoice, SourceStatus } from '../shared/study-activity';
import { Store } from './store';
import { Vault } from './vault';
import { Desks } from './desk';
export type PdfTextExtractor=(bytes:Uint8Array)=>Promise<{page:number;text:string}[]>;
export const contentHash=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex');
export class ActivitySources {
  constructor(readonly store:Store,readonly vault:Vault,readonly desks:Desks,readonly extractPdf:PdfTextExtractor){}
  catalog(subjectId:string):SourceStatus[]{this.store.requireSubject(subjectId);return [
    ...this.vault.list(subjectId).map(n=>{let available=false;try{available=fs.statSync(this.vault.resolve(n.path)).isFile();}catch{}return {kind:'note' as const,id:n.id,title:n.title,available,detail:available?'Texto Markdown salvo; inclui títulos e código.':'Arquivo ausente. Localize a nota ou retire da seleção.',characters:null};}),
    ...this.desks.listMaterials(subjectId).map(m=>{let available=false;try{available=fs.statSync(this.desks.material(m.id).path).isFile();}catch{}return {kind:'pdf' as const,id:m.id,title:m.name,available,detail:available?'Texto será processado ao preparar. PDFs digitalizados sem texto precisam de OCR externo.':'PDF ausente. Localize o documento ou retire da seleção.',characters:null};}),
    ...this.store.db.prepare('SELECT id,title FROM videos WHERE subject_id=? ORDER BY rowid').all(subjectId).map(v=>{const row=this.store.db.prepare('SELECT count(*) n,sum(length(text)) size FROM video_moments WHERE video_id=? AND subject_id=?').get(String(v.id),subjectId)!;const available=Number(row.n)>0;return {kind:'video' as const,id:String(v.id),title:String(v.title),available,detail:available?'Anotações locais por tempo; não é a transcrição integral do vídeo.':'Sem anotações/transcrição. Adicione momentos ou retire da seleção.',characters:Number(row.size??0)};}),
  ];}
  async read(subjectId:string,choice:SourceChoice):Promise<SnapshotSource>{
    const base={sourceId:`${choice.kind}:${choice.id}`,id:choice.id,kind:choice.kind,revision:null as number|null};
    if(choice.kind==='note'){const ref=this.vault.ref(choice.id);if(ref.subjectId!==subjectId)throw new AppError('SOURCE_OWNER','A nota pertence a outra matéria.');const text=this.vault.readFile(ref.path);this.vault.verify(text,ref);const hash=contentHash(text);const chunks:Chunk[]=[];let start=1,buffer='',line=1;for(const part of text.match(/[^\n]*\n|[^\n]+$/g)??[]){if(buffer.length+part.length>8000&&buffer){chunks.push({id:`c${chunks.length+1}`,text:buffer,location:{kind:'lines',start,end:line-1}});start=line;buffer='';}buffer+=part;if(part.endsWith('\n'))line++;}if(buffer)chunks.push({id:`c${chunks.length+1}`,text:buffer,location:{kind:'lines',start,end:line}});return {...base,title:ref.title,hash,revision:ref.revision,chunks};}
    if(choice.kind==='pdf'){const m=this.desks.material(choice.id);if(m.subjectId!==subjectId)throw new AppError('SOURCE_OWNER','O PDF pertence a outra matéria.');const bytes=this.desks.read(choice.id);const hash=contentHash(bytes),pages=await this.extractPdf(bytes);if(!pages.some(p=>p.text.trim()))throw new AppError('SOURCE_NO_TEXT',`${m.name}: sem texto extraível. Processe com OCR externo ou retire da seleção.`);return {...base,title:m.name,hash,chunks:pages.map(p=>({id:`p${p.page}`,text:p.text,location:{kind:'page',page:p.page}}))};}
    const video=this.store.db.prepare('SELECT title,subject_id subjectId FROM videos WHERE id=?').get(choice.id);if(!video||video.subjectId!==subjectId)throw new AppError('SOURCE_OWNER','Vídeo ausente ou de outra matéria.');
    const moments=this.store.db.prepare('SELECT id,seconds,text FROM video_moments WHERE video_id=? AND subject_id=? ORDER BY seconds,rowid').all(choice.id,subjectId);if(!moments.length)throw new AppError('SOURCE_NO_TEXT',`${video.title}: sem anotações locais. Não exportamos o conteúdo de uma URL como se fosse transcrição.`);
    return {...base,title:String(video.title),hash:contentHash(JSON.stringify(moments)),chunks:moments.map(m=>({id:String(m.id),text:String(m.text),location:{kind:'seconds',seconds:Number(m.seconds)}}))};
  }
  async status(subjectId:string,source:SnapshotSource):Promise<'unchanged'|'changed'|'missing'>{try{if(source.kind==='pdf'){const m=this.desks.material(source.id);if(m.subjectId!==subjectId)return 'missing';return contentHash(this.desks.read(source.id))===source.hash?'unchanged':'changed';}const current=await this.read(subjectId,source);return current.hash===source.hash?'unchanged':'changed';}catch{return 'missing';}}
}
