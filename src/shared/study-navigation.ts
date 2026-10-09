import type {TodayState} from './study';
export type StudyNextStep={kind:'create';title:string;detail:string;action:string}|{kind:'review';title:string;detail:string;action:string}|{kind:'subject';subjectId:string;title:string;detail:string;action:string;task:boolean};
export function studyNextStep(data:TodayState):StudyNextStep{
 if(!data.subjects.length)return {kind:'create',title:'Comece com uma ideia.',detail:'Crie sua primeira matéria. Suas notas e seu material ficam juntos.',action:'Criar primeira matéria'};
 if(data.due>0)return {kind:'review',title:`${data.due} ${data.due===1?'cartão para relembrar.':'cartões para relembrar.'}`,detail:'Uma revisão curta ajuda você a retomar o que já estudou.',action:'Revisar agora'};
 const tasks=data.tasks.filter(t=>data.subjects.some(s=>s.id===t.subjectId));
 const task=tasks.find(t=>t.subjectId===data.lastSubjectId)??tasks[0];
 if(task)return {kind:'subject',subjectId:task.subjectId,title:task.text,detail:`${task.subject} · ${task.total?`${task.done} de ${task.total} etapas concluídas`:'Sua próxima ação no checklist'}`,action:'Continuar esta tarefa',task:true};
 const last=data.subjects.find(s=>s.id===data.lastSubjectId)??data.subjects[0];
 return {kind:'subject',subjectId:last.id,title:`Volte a ${last.name}.`,detail:'Retome suas notas ou traga um novo material para estudar.',action:'Retomar mesa',task:false};
}
