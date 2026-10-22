import type { Desk, Material, Subject } from '../../shared/contracts';
import type { NoteCapture } from '../../shared/note-content';
import type { ActivityType } from '../../shared/study-activity';
import type { WorkspaceArea } from '../../shared/workspace';
import { Icon as Mark } from '../Icon';
import { PdfPane } from '../PdfPane';
import { VideoLibrary, type useVideos } from '../VideoWorkspace';

export type MaterialProps = {
  subjects: Subject[]; active: Subject | null; desk: Desk | null; materials: Material[]; material: Material | undefined; materialGeneration: number;
  select(subject: Subject): Promise<void>; checkpoint(patch: Partial<Omit<Desk, 'subjectId'>>): Promise<void>; chooseMaterial(replaceId?: string): Promise<boolean | undefined>;
  launchActivity(type: ActivityType | null, source?: { kind: 'note' | 'pdf' | 'video'; id: string }): void;
  jump(subjectId: string, noteId?: string): Promise<void>; capture(capture: NoteCapture): Promise<void>; navigate(area: WorkspaceArea): Promise<void>;
  videos: ReturnType<typeof useVideos>; videoAddRequest: string | null;
};

function MaterialHeader({ name, p }: { name: 'PDF' | 'Vídeo'; p: MaterialProps }) {
  return <div className="panel-header" data-hairline><h1>{name === 'PDF' ? 'PDFs' : 'Aulas'}</h1><div><select aria-label={`Matéria do ${name}`} value={p.active?.id ?? ''} onChange={e => { const subject = p.subjects.find(s => s.id === e.target.value); if (subject) void p.select(subject); }}><option value="" disabled>Escolha uma matéria</option>{p.subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>{name === 'PDF' && <><button onClick={() => p.chooseMaterial()}>Adicionar PDF</button>{p.material && <button onClick={() => p.launchActivity('quiz', { kind: 'pdf', id: p.material!.id })}>Praticar este material</button>}</>}</div></div>;
}

export function PdfModule(p: MaterialProps) {
  const { active, desk, material } = p;
  return <section className="panel material-module" data-area-ready="true"><MaterialHeader name="PDF" p={p}/>{active ? <>
    {p.materials.length > 0 && <select aria-label="Documento ativo" value={desk?.materialId ?? ''} onChange={e => p.checkpoint({ materialId: e.target.value || null, page: 1 })}><option value="">Escolher documento</option>{p.materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}{material && desk ? <PdfPane key={`${material.id}:${p.materialGeneration}`} material={material} noteId={desk.noteId} onNote={id => void p.jump(active.id, id)} page={desk.page} onPage={page => p.checkpoint({ page })} onLocate={() => p.chooseMaterial(material.id)} onCapture={c => void p.capture(c)}/> : <div className="panel-empty"><Mark kind="book"/><h3>Seu material, à mão.</h3><p>Abra um PDF para consultar junto das notas.</p><button onClick={() => p.chooseMaterial()}>+ Selecionar documento</button></div>}
  </> : <div className="panel-empty"><p>Crie uma matéria no Caderno para vincular material.</p><button onClick={() => void p.navigate('study')}>Abrir Caderno</button></div>}</section>;
}

export function VideoModule(p: MaterialProps) {
  return <section className="panel material-module" data-area-ready="true"><MaterialHeader name="Vídeo" p={p}/>{p.active ? <VideoLibrary controller={p.videos} addRequest={p.videoAddRequest} onCapture={c => void p.capture(c)} onPractice={id => p.launchActivity('quiz', { kind: 'video', id })}/> : <div className="panel-empty"><p>Escolha uma matéria para guardar suas aulas.</p><button onClick={() => void p.navigate('study')}>Abrir Caderno</button></div>}</section>;
}
