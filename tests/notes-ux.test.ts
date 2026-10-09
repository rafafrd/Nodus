import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {Store} from '../src/main/store';
import {Vault} from '../src/main/vault';
import {Study} from '../src/main/study';
import {editableNote,noteParts,setNoteTitle,captureMarkdown} from '../src/shared/note-content';
import {createNoteInput,moveNoteInput} from '../src/shared/contracts';
import {videoAtInput} from '../src/shared/videos';

test('edição simples conserva BOM/CRLF/frontmatter desconhecido e título literal',()=>{
 const text='\uFEFF---\r\nstudy_id: fixture\r\ncustom: { preserve: true }\r\n---\r\n# Título\r\n\r\n$$a^2$$\r\n```ts\r\nx()\r\n```\r\n';
 const parts=editableNote(text);
 assert.equal(parts.prefix+parts.body,text);
 const renamed=setNoteTitle(text,'Preço $& e $1');assert.equal(noteParts(renamed).header,noteParts(text).header);assert.ok(renamed.includes('# Preço $& e $1\r\n'));assert.equal(editableNote(renamed).body,parts.body);
});
test('nota rápida, busca de fonte/rascunho, mudança de matéria e rollback reais',()=>{
 fs.mkdirSync('.local',{recursive:true});const dir=fs.mkdtempSync(path.resolve('.local/notes-ux-unit-'));const root=path.join(dir,'vault');fs.mkdirSync(root);let store=new Store(path.join(dir,'data'));
 try{
  let vault=new Vault(store),study=new Study(store);vault.selectRoot(root);const a=store.createSubject({name:'Matemática',color:'sage'}),b=store.createSubject({name:'Física',color:'blue'});
  assert.equal(createNoteInput.parse({subjectId:a.id}).title,'Sem título');
  let note=vault.create({subjectId:a.id});const content=note.text+'Este trecho usa quadrivetor.\n';const saved=vault.save({id:note.ref.id,hash:note.hash,text:content});assert.equal(saved.state,'saved');if(saved.state!=='saved')throw Error();note=saved.document;assert.equal(note.ref.title,'Este trecho usa quadrivetor.');
  const renamed=vault.save({id:note.ref.id,hash:note.hash,text:setNoteTitle(note.text,'Conceito')});assert.equal(renamed.state,'saved');if(renamed.state!=='saved')throw Error();note=renamed.document;
  assert.equal(study.search('quadrivetor')[0]?.id,note.ref.id);
  vault.draft({id:note.ref.id,hash:note.hash,text:note.text+'eletrólise em rascunho'});assert.ok(study.search('eletrolise')[0]?.detail.includes('Rascunho'));
  assert.throws(()=>vault.move({id:note.ref.id,subjectId:b.id,hash:note.hash}),/Salve/);vault.discard(note.ref.id);
  const other=vault.create({subjectId:a.id,title:'Outro conceito'}),link=study.link({subjectId:a.id,sourceId:note.ref.id,targetId:other.ref.id,label:'Relaciona'});
  const card=study.create({subjectId:a.id,noteId:note.ref.id,question:'Pergunta?',answer:'Resposta',excerpt:'quadrivetor'});
  const before=note.text;store.db.exec("CREATE TRIGGER fail_note_move BEFORE INSERT ON audit_events WHEN NEW.action='note.move' BEGIN SELECT RAISE(ABORT,'fixture audit failure'); END;");
  assert.throws(()=>vault.move({id:note.ref.id,subjectId:b.id,hash:note.hash}),/fixture/);assert.equal(vault.readFile(note.ref.path),before);assert.equal(vault.ref(note.ref.id).subjectId,a.id);store.db.exec('DROP TRIGGER fail_note_move');
  const moved=vault.move({id:note.ref.id,subjectId:b.id,hash:note.hash});assert.equal(moved.state,'saved');if(moved.state!=='saved')throw Error();note=moved.document;
  assert.equal(note.ref.id,card.noteId);assert.equal(study.cards(a.id)[0].id,card.id);assert.equal(study.links(a.id)[0].id,link[0].id);assert.equal(study.links(b.id)[0].id,link[0].id);
  assert.ok(note.text.includes(`study_subject: ${b.id}`));assert.equal(noteParts(note.text).body,noteParts(before).body);
  const original=note.text;fs.writeFileSync(vault.resolve(note.ref.path),original+'edição externa');assert.equal(vault.move({id:note.ref.id,subjectId:a.id,hash:note.hash}).state,'conflict');assert.equal(vault.readFile(note.ref.path),original+'edição externa');
  const id=note.ref.id;store.close();store=new Store(path.join(dir,'data'));vault=new Vault(store);study=new Study(store);assert.equal(vault.open(id).ref.subjectId,b.id);assert.ok(study.search('edição externa').some(h=>h.id===id));
  assert.throws(()=>moveNoteInput.parse({id,subjectId:b.id,hash:note.hash,path:'outside.md'}));assert.throws(()=>videoAtInput.parse({id,subjectId:b.id,seconds:-1}));
 }finally{store.close();}
});
test('importação externa real conserva originais e rejeita identidade duplicada/UTF-8 inválido',()=>{
 fs.mkdirSync('.local',{recursive:true});const dir=fs.mkdtempSync(path.resolve('.local/notes-ux-import-')),store=new Store(path.join(dir,'data'));
 try{const root=path.join(dir,'vault');fs.mkdirSync(root);const vault=new Vault(store);vault.selectRoot(root);const a=store.createSubject({name:'Fixture',color:'sage'}),file=path.join(dir,'externa.md');
  const original='\uFEFF---\r\ncustom_unknown: preserve-me\r\n---\r\n# Fora do vault\r\n\r\n|a|b|\r\n';fs.writeFileSync(file,original);const imported=vault.importExternal(a.id,file);assert.equal(fs.readFileSync(file,'utf8'),original);assert.ok(imported.text.includes('custom_unknown: preserve-me\r\n'));assert.ok(imported.ref.path.startsWith(a.id+'/'));
  const duplicate=path.join(dir,'duplicate.md');fs.writeFileSync(duplicate,imported.text);assert.throws(()=>vault.importExternal(a.id,duplicate),/Outra nota/);assert.equal(fs.readFileSync(duplicate,'utf8'),imported.text);
  const invalid=path.join(dir,'invalid.md');fs.writeFileSync(invalid,Buffer.from([0xff]));assert.throws(()=>vault.importExternal(a.id,invalid),/UTF-8/);assert.deepEqual(fs.readFileSync(invalid),Buffer.from([0xff]));assert.equal(vault.list(a.id).length,1);
  const failure=path.join(dir,'failure.md');fs.writeFileSync(failure,'# Falha controlada\n');store.db.exec("CREATE TRIGGER fail_import BEFORE INSERT ON audit_events WHEN NEW.action='note.import' BEGIN SELECT RAISE(ABORT,'fixture import failure'); END;");assert.throws(()=>vault.importExternal(a.id,failure),/fixture import failure/);assert.equal(vault.list(a.id).length,1);assert.equal(fs.readFileSync(failure,'utf8'),'# Falha controlada\n');store.db.exec('DROP TRIGGER fail_import');
  const capture=captureMarkdown({subjectId:a.id,text:'Primeira linha\nSegunda linha',source:{kind:'pdf',id:imported.ref.id,title:'Documento',page:3,fingerprint:'a'.repeat(64)}});assert.ok(capture.includes('> Segunda linha'));assert.ok(capture.includes('?page=3&version='));
 }finally{store.close();}
});
