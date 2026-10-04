import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Study } from '../src/main/study';
import { Vault } from '../src/main/vault';
import { Game } from '../src/main/game';
import { Checklist } from '../src/main/checklist';
import { Focus } from '../src/main/focus';
import { cardCreateInput,cardReviewInput,linkCreateInput } from '../src/shared/study';
const fixture=()=>{const dir=fs.mkdtempSync(path.resolve('.local/study-unit-')),store=new Store(path.join(dir,'data')),root=path.join(dir,'vault');fs.mkdirSync(root);const vault=new Vault(store);vault.selectRoot(root);const a=store.createSubject({name:'Álgebra',color:'sage'}),b=store.createSubject({name:'Biologia',color:'blue'}),n=vault.create({subjectId:a.id,title:'Equações'}),m=vault.create({subjectId:a.id,title:'Vetores'}),other=vault.create({subjectId:b.id,title:'Células'});return{dir,store,root,vault,a,b,n,m,other};};
test('revisão é persistente/idempotente, usa relógio do main e conserva fonte/draft/economia em falha real do audit',()=>{
 const f=fixture();let now=1_800_000_000_000;const study=new Study(f.store,()=>now),source=fs.readFileSync(path.join(f.root,f.n.ref.path)),game=new Game(f.store).get();f.vault.draft({id:f.n.ref.id,hash:f.n.hash,text:f.n.text+'rascunho'});
 try{const card=study.create({subjectId:f.a.id,noteId:f.n.ref.id,question:'O que é uma equação?',answer:'Uma igualdade.',excerpt:'Trecho identificado'});assert.equal(card.dueAt,now);assert.throws(()=>study.create({subjectId:f.a.id,noteId:f.other.ref.id,question:'Q',answer:'A',excerpt:''}));
 const input={subjectId:f.a.id,id:card.id,version:0,operationId:randomUUID(),rating:'good' as const},reviewed=study.review(input);assert.equal(reviewed.reviews,1);assert.equal(reviewed.dueAt,now+86400000);assert.deepEqual(study.review(input),reviewed);assert.throws(()=>study.review({...input,rating:'easy'}));assert.throws(()=>study.review({...input,operationId:randomUUID()}));
 f.store.db.exec("CREATE TRIGGER reject_card_audit BEFORE INSERT ON audit_events WHEN NEW.action='card.review' BEGIN SELECT RAISE(ABORT,'fixture audit rejection'); END");assert.throws(()=>study.review({...input,version:1,operationId:randomUUID(),rating:'again'}));assert.deepEqual(study.cards()[0],reviewed);f.store.db.exec('DROP TRIGGER reject_card_audit');now+=86400000;assert.equal(study.today().due,1);assert.deepEqual(fs.readFileSync(path.join(f.root,f.n.ref.path)),source);assert.equal(f.vault.open(f.n.ref.id).draft!.text,f.n.text+'rascunho');assert.equal(new Game(f.store).get().coins,game.coins);
 }finally{f.store.close();}
});
test('busca/Hoje/relações consultam entidades reais; foco pausado não acrescenta tempo e relações não atravessam matéria',()=>{
 const f=fixture();let mono=0,wall=new Date(2026,9,4,12).getTime();const study=new Study(f.store,()=>wall),focus=new Focus(f.store,()=>mono,()=>wall),check=new Checklist(f.store);
 try{const task=check.create(f.a.id,'Resolver equações');const step=check.add({subjectId:f.a.id,taskId:task.id,text:'Uma questão'});const started=focus.start(f.a.id,1);mono+=12000;wall+=12000;focus.act({subjectId:f.a.id,id:started.session!.id,action:'pause'});wall+=60000;assert.equal(study.today().focusMs,12000);assert.equal(study.today().tasks.length,1);check.update({subjectId:f.a.id,id:step.id,done:true});assert.equal(study.today().tasks.length,0);assert.ok(study.search('algebra').some(h=>h.id===f.n.ref.id));assert.ok(study.search('equacoes').some(h=>h.kind==='note'));
 const links=study.link({subjectId:f.a.id,sourceId:f.n.ref.id,targetId:f.m.ref.id,label:'Usa'});assert.equal(links.length,1);assert.equal(study.link({subjectId:f.a.id,sourceId:f.n.ref.id,targetId:f.m.ref.id,label:'Relaciona'}).length,1);assert.throws(()=>study.link({subjectId:f.a.id,sourceId:f.n.ref.id,targetId:f.other.ref.id,label:'Fora'}));assert.equal(study.unlink({subjectId:f.a.id,id:links[0].id}).length,0);
 assert.equal(cardCreateInput.safeParse({subjectId:f.a.id,noteId:null,question:'Q',answer:'A',excerpt:'',coins:100}).success,false);assert.equal(cardReviewInput.safeParse({subjectId:f.a.id,id:randomUUID(),version:0,operationId:randomUUID(),rating:'good',dueAt:0}).success,false);assert.equal(linkCreateInput.safeParse({subjectId:f.a.id,sourceId:f.n.ref.id,targetId:f.n.ref.id,label:'self'}).success,false);
 }finally{f.store.close();}
});
test('migração real v4 para v5 é aditiva e restart conserva cartões/vínculos sem reset',()=>{
 const f=fixture(),original=fs.readFileSync(path.join(f.root,f.n.ref.path)),game=new Game(f.store).get();f.store.db.exec('DROP TABLE card_reviews; DROP TABLE flashcards; DROP TABLE pdf_marks; DROP TABLE video_moments; DROP TABLE note_links; PRAGMA user_version=4;');f.store.close();
 const migrated=new Store(path.join(f.dir,'data'));let id='';try{assert.equal(migrated.db.prepare('PRAGMA user_version').get()!.user_version,5);assert.equal(new Game(migrated).get().coins,game.coins);assert.deepEqual(fs.readFileSync(path.join(f.root,f.n.ref.path)),original);id=new Study(migrated).create({subjectId:f.a.id,noteId:f.n.ref.id,question:'Persistir?',answer:'Sim.',excerpt:''}).id;}finally{migrated.close();}
 const reopened=new Store(path.join(f.dir,'data'));try{assert.equal(new Study(reopened).cards()[0].id,id);assert.equal(reopened.bootstrap().subjects.length,2);}finally{reopened.close();}
});
