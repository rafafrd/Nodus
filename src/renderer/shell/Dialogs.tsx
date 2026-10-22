import type { FormEvent } from 'react';
import type { NoteRef } from '../../shared/contracts';
import { MotionDialog } from '../MotionDialog';

export function SubjectDialog({ mode, name, color, setName, setColor, submit, close }: {
  mode: 'subject' | 'rename'; name: string; color: string; setName(value: string): void; setColor(value: string): void; submit(event: FormEvent): void; close(): void;
}) {
  return <MotionDialog title={mode === 'rename' ? 'Renomear matéria' : 'Nova matéria'} close={close}>{requestClose => <form onSubmit={submit}><label>Nome da matéria<input autoFocus required maxLength={120} aria-label="Nome da matéria" value={name} onChange={e => setName(e.target.value)}/></label>{mode === 'subject' && <label>Cor<select value={color} onChange={e => setColor(e.target.value)}><option value="sage">Sálvia</option><option value="blue">Azul</option><option value="rose">Rosa</option><option value="amber">Âmbar</option></select></label>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button type="submit" className="primary">{mode === 'rename' ? 'Salvar nome' : 'Criar matéria'}</button></div></form>}</MotionDialog>;
}

export function LinkDialog({ notes, current, target, setTarget, submit, close }: {
  notes: NoteRef[]; current: string | undefined; target: string; setTarget(value: string): void; submit(event: FormEvent): void; close(): void;
}) {
  return <MotionDialog title="Relacionar com outra nota" close={close}>{requestClose => <form onSubmit={submit}><label>Nota relacionada<select required aria-label="Nota relacionada" value={target} onChange={e => setTarget(e.target.value)}><option value="">Escolha uma nota</option>{notes.filter(n => n.id !== current).map(n => <option key={n.id} value={n.id}>{n.title}</option>)}</select></label>{notes.length < 2 && <p>Crie outra nota nesta matéria para fazer uma conexão.</p>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button className="primary" disabled={!target}>Conectar notas</button></div></form>}</MotionDialog>;
}
