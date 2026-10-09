export type NoteTemplate = 'blank' | 'lesson' | 'concept' | 'exercise';
export const noteTemplates: {id: NoteTemplate; name: string; text: string}[] = [
  {id:'blank',name:'Livre',text:''},
  {id:'lesson',name:'Aula',text:'## Ideias da aula\n\n\n## Minha explicação\n\n\n## Dúvidas\n\n'},
  {id:'concept',name:'Conceito',text:'## Minha explicação\n\n\n## Exemplo\n\n\n## Dúvida\n\n'},
  {id:'exercise',name:'Exercício',text:'## Enunciado\n\n\n## Minha resolução\n\n\n## O que aprendi\n\n'},
];
// Keep the original header byte-for-byte, including unknown YAML and CRLF/BOM.
export function noteParts(text:string) {
  const header=text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0]??'';
  return {header,body:text.slice(header.length),eol:text.includes('\r\n')?'\r\n':'\n'};
}
export function noteTitle(text:string,fallback='Sem título') {
  return noteParts(text).body.match(/^# ([^\r\n]+)$/m)?.[1]?.trim().slice(0,160)||fallback;
}
export function editableNote(text:string){const {header,body}=noteParts(text),heading=body.match(/^# [^\r\n]*(?:\r?\n(?:\r?\n)?|$)/)?.[0]??'';return {prefix:header+heading,body:body.slice(heading.length)};}
export function setNoteTitle(text:string,title:string) {
  const {header,body,eol}=noteParts(text),safe=title.replace(/[\r\n]/g,' ').trim()||'Sem título';
  return header+(/^# [^\r\n]+/m.test(body)?body.replace(/^# [^\r\n]+/m,()=>`# ${safe}`):`# ${safe}${eol}${eol}${body}`);
}
export function suggestNoteTitle(text:string) {
  const {body}=noteParts(text);
  return body.split(/\r?\n/).filter(line=>!/^# Sem título\s*$/.test(line)).map(line=>line.replace(/^\s*[#>*-]+\s*/,'').trim()).find(Boolean)?.slice(0,160)||'Sem título';
}
export type NoteCapture={subjectId:string;text:string;source:{kind:'pdf'|'video';id:string;title:string;page?:number;seconds?:number;fingerprint?:string}};
export function captureMarkdown(capture:NoteCapture) {
  const s=capture.source,location=s.kind==='pdf'?`página ${s.page}`:`${Math.floor((s.seconds??0)/60)}:${String((s.seconds??0)%60).padStart(2,'0')}`;
  const reference=`nodus-source:${s.kind}/${s.id}${s.kind==='pdf'?`?page=${s.page}&version=${s.fingerprint??''}`:`?seconds=${s.seconds??0}`}`;
  const label=s.title.replace(/[\[\]\r\n]/g,' ');
  return `\n\n> ${capture.text.trim().split(/\r?\n/).join('\n> ')}\n\nFonte: [${label} · ${location}](${reference})\n\nMinha observação: \n`;
}
