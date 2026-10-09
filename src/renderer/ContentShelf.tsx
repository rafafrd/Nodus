import {useRef} from 'react';
import {MotionDialog} from './MotionDialog';
import {Icon} from './Icon';
export type ContentChoice='write'|'markdown'|'pdf'|'video';
export function ContentShelf({subject,vault,choose,close}:{subject:string|null;vault:boolean;choose(choice:ContentChoice):void;close():void}){
 const selection=useRef<ContentChoice|null>(null);
 const items=[['write','note','Escrever uma nota','Comece a escrever. O título pode vir depois.'],['pdf','book','Trazer um PDF','Leia e leve trechos para suas notas.'],['video','play','Guardar uma aula','Salve um link do YouTube com a matéria.'],['markdown','folder','Importar notas','Traga arquivos Markdown sem alterar os originais.']] as const;
 return <MotionDialog title="Adicionar conteúdo" close={()=>{close();if(selection.current)choose(selection.current);}}>{requestClose=><div className="content-shelf"><p className="content-destination"><Icon kind="book"/><span>{subject?<>Guardar em <strong>{subject}</strong></>:'Comece pela sua primeira nota e matéria.'}</span></p><div className="content-choices">{items.map(([id,icon,title,detail])=><button key={id} disabled={id!=='write'&&!subject} onClick={()=>{selection.current=id;requestClose();}}><span className="content-choice-icon"><Icon kind={icon}/></span><span><strong>{title}</strong><small>{detail}</small></span><Icon kind="arrow"/></button>)}</div><p className="content-shelf-hint">{!subject?'Os materiais ficam disponíveis depois de criar uma matéria.':!vault?'A pasta de notas será preparada ao escrever ou importar.':'Seu conteúdo fica no computador. Você pode organizar depois.'}</p></div>}</MotionDialog>;
}
