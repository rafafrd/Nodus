import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studyNextStep} from '../src/shared/study-navigation';
import type {TodayState} from '../src/shared/study';
test('próximo passo usa contexto existente, revisões e tarefas válidas sem inventar progresso',()=>{
 const empty:TodayState={at:0,focusMs:0,due:0,cards:0,lastSubjectId:null,tasks:[],subjects:[]};assert.equal(studyNextStep(empty).kind,'create');
 const data:TodayState={...empty,subjects:[{id:'a',name:'Álgebra',color:'sage'},{id:'b',name:'Biologia',color:'blue'}],lastSubjectId:'a'};
 assert.equal(studyNextStep(data).kind,'subject');assert.equal(studyNextStep({...data,due:3}).kind,'review');
 const tasks=[{id:'1',subjectId:'b',subject:'Biologia',text:'Ler capítulo',done:0,total:1},{id:'2',subjectId:'a',subject:'Álgebra',text:'Resolver exercício',done:1,total:3}];
 const next=studyNextStep({...data,tasks});assert.deepEqual(next,{kind:'subject',subjectId:'a',title:'Resolver exercício',detail:'Álgebra · 1 de 3 etapas concluídas',action:'Continuar esta tarefa',task:true});
 assert.equal(studyNextStep({...data,tasks,due:1}).kind,'review');
 const stale=studyNextStep({...data,lastSubjectId:'missing',tasks:[{...tasks[0],subjectId:'missing'}]});assert.ok(stale.kind==='subject'&&stale.subjectId==='a'&&!stale.task);assert.deepEqual(data,{...empty,subjects:data.subjects,lastSubjectId:'a'});
});
