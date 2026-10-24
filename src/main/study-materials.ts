import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AppError } from '../shared/contracts';
import { prepareMaterialInput,materialRequestRef,materialResponseInput,materialPrompt,materialCorrection,validateStudyMaterial,materialImportBytes,type MaterialRequest,type MaterialRequestSummary,type MaterialImport } from '../shared/study-material';
import { Store } from './store';
import { Vault,hashText } from './vault';

const planSchema=z.array(z.strictObject({id:z.uuid(),subjectId:z.uuid(),title:z.string().min(1).max(160),text:z.string().max(materialImportBytes)})).min(1).max(8);
type Plan=z.infer<typeof planSchema>;
function canonical(value:unknown):string {if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical((value as Record<string,unknown>)[k])).join(',')+'}';}
const plain=(text:string)=>text.replace(/[\\`*_{}[\]()#+.!<>|]/g,'\\$&');

export class StudyMaterials {
  constructor(readonly store:Store,readonly vault:Vault,readonly now=()=>Date.now()){}
  prepare(raw:z.input<typeof prepareMaterialInput>):MaterialRequest {
    const input=prepareMaterialInput.parse(raw),subject=this.store.requireSubject(input.subjectId);
    const request:MaterialRequest={id:randomUUID(),subjectId:subject.id,subjectName:subject.name,focus:input.focus,size:input.size,createdAt:this.now(),prompt:'',response:'',imported:false,noteIds:[],importedNotes:[]};request.prompt=materialPrompt(request);
    this.store.transaction(()=>{this.store.db.prepare('INSERT INTO material_requests(id,subject_id,subject_name,focus,size,prompt,created_at) VALUES(?,?,?,?,?,?,?)').run(request.id,subject.id,subject.name,request.focus,request.size,request.prompt,request.createdAt);this.store.audit('material.prepare',request.id,'ok');});return request;
  }
  request(raw:z.infer<typeof materialRequestRef>):MaterialRequest {
    const input=materialRequestRef.parse(raw);this.store.requireSubject(input.subjectId);
    const row=this.store.db.prepare('SELECT id,subject_id subjectId,subject_name subjectName,focus,size,prompt,created_at createdAt,response FROM material_requests WHERE id=? AND subject_id=?').get(input.requestId,input.subjectId);
    if(!row)throw new AppError('REQUEST_NOT_FOUND','Pedido de material não encontrado nesta matéria.');
    const receipt=this.store.db.prepare('SELECT status,plan FROM material_imports WHERE request_id=?').get(input.requestId);
    const importedNotes=receipt?.status==='imported'?this.plan(String(receipt.plan),input.subjectId).map(n=>({id:n.id,title:String(this.store.db.prepare('SELECT title FROM notes WHERE id=?').get(n.id)?.title??n.title)})):[];
    return {...row,imported:receipt?.status==='imported',noteIds:importedNotes.map(n=>n.id),importedNotes} as MaterialRequest;
  }
  list(subjectId:string):MaterialRequestSummary[] {
    this.store.requireSubject(subjectId);return this.store.db.prepare('SELECT id FROM material_requests WHERE subject_id=? ORDER BY rowid DESC').all(subjectId).map(row=>{const {prompt:_prompt,response:_response,importedNotes:_notes,...summary}=this.request({subjectId,requestId:String(row.id)});return summary;});
  }
  saveResponse(raw:z.infer<typeof materialResponseInput>):null {
    const input=materialResponseInput.parse(raw),request=this.request({subjectId:input.subjectId,requestId:input.requestId});
    if(request.imported&&input.text!==request.response)throw new AppError('REQUEST_IMPORTED','A resposta importada foi preservada. Prepare outro pedido para gerar material novo.');
    if(Buffer.byteLength(input.text,'utf8')>materialImportBytes)throw new AppError('RESPONSE_LIMIT','A resposta deve ter até 2 MiB. O texto atual continua disponível para copiar.');
    this.store.db.prepare('UPDATE material_requests SET response=? WHERE id=? AND subject_id=?').run(input.text,input.requestId,input.subjectId);return null;
  }
  validate(raw:z.infer<typeof materialResponseInput>) {
    const input=materialResponseInput.parse(raw),request=this.request({subjectId:input.subjectId,requestId:input.requestId}),report=validateStudyMaterial(input.text,request);
    // Oversized input remains in the renderer; do not store a partial response.
    if(Buffer.byteLength(input.text,'utf8')<=materialImportBytes)this.saveResponse(input);
    return report;
  }
  correction(raw:z.infer<typeof materialResponseInput>):{text:string;short:boolean} {
    const input=materialResponseInput.parse(raw),request=this.request({subjectId:input.subjectId,requestId:input.requestId}),report=validateStudyMaterial(input.text,request);
    if(report.valid)throw new AppError('ALREADY_VALID','O material já está válido. Confira a prévia antes de importar.');
    return {text:materialCorrection(request,input.text,report),short:input.text.length>60_000};
  }
  private plan(text:string,subjectId:string):Plan {const plan=planSchema.parse(JSON.parse(text));if(plan.some(n=>n.subjectId!==subjectId)||new Set(plan.map(n=>n.id)).size!==plan.length)throw new AppError('MATERIAL_RECEIPT','Recibo de importação inconsistente. Preserve seu backup.');return plan;}
  private cleanup(plan:Plan):void {
    // Delete only unchanged files from this uncommitted batch. External edits survive.
    for(const note of plan){if(this.store.db.prepare('SELECT id FROM notes WHERE id=?').get(note.id))throw new AppError('MATERIAL_RECOVERY','A importação interrompida possui notas registradas. Preserve o recibo e os arquivos.');
      const relative=`${note.subjectId}/${note.id}.md`,target=this.vault.resolve(relative,true);
      if(!fs.existsSync(target))continue;
      if(this.vault.readFile(relative)!==note.text)throw new AppError('MATERIAL_RECOVERY',`Uma nota de importação interrompida foi alterada externamente (${relative}). Ela foi preservada; guarde-a fora desse caminho para repetir o pedido.`);
    }
    for(const note of plan){const target=this.vault.resolve(`${note.subjectId}/${note.id}.md`,true);if(fs.existsSync(target))fs.unlinkSync(target);}
  }
  import(raw:z.infer<typeof materialResponseInput>):MaterialImport {
    const input=materialResponseInput.parse(raw),request=this.request({subjectId:input.subjectId,requestId:input.requestId}),report=validateStudyMaterial(input.text,request);
    if(!report.valid||!report.preview)throw new AppError('MATERIAL_INVALID','Corrija a resposta e confira a prévia antes de importar.');
    const payload=report.preview,hash=hashText(canonical(payload)),receipt=this.store.db.prepare('SELECT * FROM material_imports WHERE request_id=?').get(request.id);
    if(receipt?.status==='imported'){
      if(receipt.payload_hash!==hash)throw new AppError('REQUEST_IMPORTED','Este pedido já foi importado. Prepare um novo pedido para criar outro material. Suas notas atuais foram preservadas.');
      return {notes:this.plan(String(receipt.plan),request.subjectId).map(n=>this.vault.ref(n.id)),existing:true};
    }
    this.vault.root();
    if(receipt){this.cleanup(this.plan(String(receipt.plan),request.subjectId));this.store.transaction(()=>{this.store.db.prepare('DELETE FROM material_imports WHERE request_id=?').run(request.id);this.store.audit('material.recover',request.id,'ok');});}
    const plan:Plan=payload.notes.map(note=>{const id=randomUUID();const sources=note.sourceIds.map(s=>payload.sources.find(source=>source.id===s)!.name);
      const text=`---\nstudy_id: ${id}\nstudy_subject: ${request.subjectId}\nstudy_ai_request: ${request.id}\nstudy_ai_format: nodus.study-material/1\n---\n# ${note.title}\n\n${note.markdown.trim()}\n\n## Fontes do material\n\n${sources.map(s=>'- '+plain(s)).join('\n')}\n\n> Material preparado com IA externa. Confira as informações nos anexos originais.${note.supplement?'\n> **Complemento da IA:** '+plain(note.supplement).replace(/\r?\n/g,'\n> '):''}\n`;
      return {id,subjectId:request.subjectId,title:note.title,text};});
    // Durable reservation precedes filesystem writes. A retry after a crash can clean
    // unchanged orphans; modified files are never removed or overwritten.
    this.store.transaction(()=>{this.store.db.prepare('INSERT INTO material_imports VALUES(?,?,?,?,?)').run(request.id,'pending',hash,JSON.stringify(plan),this.now());});
    const written:Plan=[];
    try {
      this.store.transaction(()=>{
        for(const note of plan){const relative=`${note.subjectId}/${note.id}.md`,target=this.vault.resolve(relative,true);fs.mkdirSync(path.dirname(target),{recursive:true});this.vault.resolve(relative,true);
          const fd=fs.openSync(target,'wx');written.push(note);try{fs.writeFileSync(fd,note.text,'utf8');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
          this.store.db.prepare('INSERT INTO notes(id,subject_id,path,title,hash,revision) VALUES(?,?,?,?,?,1)').run(note.id,note.subjectId,relative,note.title,hashText(note.text));
        }
        this.store.db.prepare('UPDATE material_requests SET response=? WHERE id=?').run(input.text,request.id);
        this.store.db.prepare("UPDATE material_imports SET status='imported' WHERE request_id=?").run(request.id);
        this.store.audit('material.import',request.id,'ok');
      });
    }catch(error){
      try{this.cleanup(written);this.store.db.prepare('DELETE FROM material_imports WHERE request_id=?').run(request.id);}catch{throw new AppError('MATERIAL_RECOVERY','A importação foi interrompida. Os arquivos e o recibo foram preservados; tente importar novamente para recuperar com segurança.');}throw error;
    }
    return {notes:plan.map(n=>this.vault.ref(n.id)),existing:false};
  }
}
