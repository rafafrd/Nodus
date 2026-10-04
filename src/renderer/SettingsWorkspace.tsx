import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AppInfo } from '../shared/contracts';
import type { AppManagement } from '../shared/preferences';
import { Avatar, usePreferences } from './preferences';
import { Icon } from './Icon';
import './settings.css';
import { PdfExportPanel } from './PdfExportPanel';
import { BackupPanel } from './BackupPanel';
type Section = 'profile' | 'appearance' | 'data';
export default function SettingsWorkspace({ activeArea, navigate }: { activeArea: boolean; navigate(area: 'study' | 'explorer'): void }) {
  const prefs = usePreferences(), [section, setSection] = useState<Section>('profile'), [name, setName] = useState(prefs.value.name);
  const [message, setMessage] = useState(''), [error, setError] = useState(''), [management, setManagement] = useState<AppManagement | null>(null), [info, setInfo] = useState<AppInfo | null>(null), [revision, setRevision] = useState(0), [opening, setOpening] = useState(false);
  const photo = useRef<HTMLInputElement>(null), folderBusy = useRef(false);
  useEffect(() => setName(prefs.value.name), [prefs.value.name]);
  useEffect(() => {
    if (!activeArea || section !== 'data') return;
    let stopped = false; setError('');
    void Promise.all([window.desktop.getAppManagement(), window.desktop.version()]).then(([data, runtime]) => { if (stopped) return; if (data.ok) setManagement(data.value); else setError(data.message); if (runtime.ok) setInfo(runtime.value); else setError(runtime.message); });
    return () => { stopped = true; };
  }, [activeArea, section, revision]);
  async function save(event: FormEvent) { event.preventDefault(); if (await prefs.update({ name })) setMessage('Perfil salvo neste PC.'); }
  async function openFolder(folder: 'data' | 'vault') {
    if (folderBusy.current) return; folderBusy.current = true; setOpening(true); setError('');
    try { const r = await window.desktop.openAppFolder({ folder }); if (!r.ok) setError(r.message); }
    finally { folderBusy.current = false; setOpening(false); }
  }
  return <div className="settings-workspace" data-area-ready="true">
    <aside className="settings-sidebar"><div className="settings-caption">SEU ESPAÇO</div><Avatar profile={prefs.value}/><strong>{prefs.value.name || 'Seu perfil'}</strong><small>Perfil local</small>
      <nav aria-label="Seções de configurações">{([['profile', 'person', 'Perfil'], ['appearance', 'layout', 'Aparência'], ['data', 'folder', 'Dados e app']] as const).map(([id, icon, title]) => <button key={id} aria-pressed={section === id} className={section === id ? 'selected' : ''} onClick={() => { setSection(id); setMessage(''); }}><Icon kind={icon}/>{title}<Icon kind="chevron"/></button>)}</nav>
      <p>Suas preferências acompanham este app, neste computador.</p>
    </aside>
    <main className="settings-main"><header><div><span className="eyebrow">CONFIGURAÇÕES</span><h1>Seu espaço, do seu jeito.</h1></div><button onClick={() => navigate('study')}>Voltar aos estudos <Icon kind="arrow"/></button></header>
      {(error || prefs.error) && <p className="settings-error" role="alert">{error || prefs.error}</p>}
      {section === 'profile' && <section className="settings-section"><div className="settings-section-heading"><span>01</span><div><h2>Seu perfil</h2><p>Um nome e uma imagem para tornar o espaço seu.</p></div></div>
        <div className="settings-photo-row"><Avatar profile={{ ...prefs.value, name }}/><div><strong>Foto do perfil</strong><p>PNG ou JPEG · até 5 MB e 4 milhões de pixels.</p><div className="settings-actions"><button disabled={prefs.busy} onClick={() => photo.current?.click()}><Icon kind="image"/>{prefs.value.photo ? 'Trocar foto' : 'Adicionar foto'}</button>{prefs.value.photo && <button disabled={prefs.busy} onClick={async () => { if (await prefs.removePhoto()) setMessage('Foto removida. Seu nome foi conservado.'); }}>Remover foto</button>}</div></div>
          <input ref={photo} className="settings-file" type="file" accept="image/png,image/jpeg" aria-label="Arquivo da foto do perfil" disabled={prefs.busy} onChange={async event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file && await prefs.photo(file)) setMessage('Foto atualizada neste PC.'); }}/>
        </div>
        <form onSubmit={save} className="settings-profile-form"><label>Seu nome<input aria-label="Nome do perfil" placeholder="Como você quer ser chamado?" value={name} maxLength={80} disabled={prefs.busy} onChange={event => { setName(event.target.value); setMessage(''); }}/></label><div><small>{name !== prefs.value.name ? 'Nome em edição' : 'Nome salvo neste PC'}</small><button className="primary" type="submit" disabled={prefs.busy || name === prefs.value.name}>Salvar perfil</button></div></form><p className="settings-footnote">O perfil fica no computador. A foto é preparada como imagem estática; nenhuma conta é necessária.</p>
      </section>}
      {section === 'appearance' && <section className="settings-section"><div className="settings-section-heading"><span>02</span><div><h2>Aparência</h2><p>Escolha o tom da sua mesa e o ritmo da interface.</p></div></div>
        <fieldset className="settings-themes"><legend>Tema do app</legend>{([['olive', 'Oliva', 'Verde profundo e detalhes dourados'], ['graphite', 'Grafite', 'Cinza escuro e detalhes prateados'], ['midnight', 'Azul noite', 'Azul profundo e detalhes claros']] as const).map(([theme, title, description]) => <button key={theme} type="button" data-preview={theme} aria-pressed={prefs.value.theme === theme} className={prefs.value.theme === theme ? 'selected' : ''} disabled={prefs.busy} onClick={async () => { if (await prefs.update({ theme })) setMessage(`Tema ${title} aplicado e salvo.`); }}><span className="theme-preview"><i/><i/><i/></span><strong>{title}<span>{prefs.value.theme === theme ? 'ATIVO' : ''}</span></strong><small>{description}</small></button>)}</fieldset>
        <label className="settings-motion"><span><strong>Animações da interface</strong><small>Transições, câmera e detalhes da cidade. A preferência de movimento reduzido do Windows continua respeitada.</small></span><input type="checkbox" role="switch" aria-label="Animações da interface" checked={prefs.value.animations} disabled={prefs.busy} onChange={async event => { const animations = event.target.checked; if (await prefs.update({ animations })) setMessage(animations ? 'Animações ativadas, respeitando o Windows.' : 'Animações da interface desligadas.'); }}/></label>
        <p className="settings-footnote">Desligar animações conserva os controles e a reprodução dos vídeos. Cronômetros de foco e timing dos desafios continuam funcionando.</p>
      </section>}
      {section === 'data' && <section className="settings-section"><div className="settings-section-heading"><span>03</span><div><h2>Dados e app</h2><p>Veja o que está guardado e onde encontrar seus arquivos.</p></div></div>
        {management ? <><div className="settings-counts">{([['Matérias', management.counts.subjects], ['Notas', management.counts.notes], ['PDFs', management.counts.materials], ['Vídeos', management.counts.videos], ['Projetos', management.counts.projects], ['Rascunhos', management.counts.drafts]] as const).map(([title, count]) => <div key={title}><strong>{count}</strong><span>{title}</span></div>)}</div>
          <div className="settings-location"><h3>Pasta de dados do app</h3><p>Perfil, preferências, referências, rascunhos e progresso local.</p><input readOnly aria-label="Pasta de dados do app" value={management.dataDirectory}/><button disabled={opening} onClick={() => openFolder('data')}><Icon kind="folder"/> Abrir pasta de dados</button></div>
          <div className="settings-location"><h3>Pasta de notas</h3><p>Seus arquivos Markdown originais.</p><input readOnly aria-label="Pasta de notas" value={management.vault ?? 'Nenhuma pasta selecionada'}/><button disabled={opening || !management.vault} onClick={() => openFolder('vault')}><Icon kind="folder"/> Abrir pasta de notas</button><button onClick={() => navigate('study')}>Gerenciar notas <Icon kind="arrow"/></button></div>
          <PdfExportPanel vault={management.vault}/>
          <BackupPanel/>
        </> : <p role="status">Carregando dados…</p>}
        <div className="settings-runtime"><div><strong>App Estudos {info ? `v${info.version}` : ''}</strong><p>Windows · funcionamento local{management ? ` · ${(management.databaseBytes / 1024 / 1024).toFixed(1)} MB de banco e arquivos auxiliares` : ''}</p><small>{info ? `Electron ${info.electron} · Node ${info.node}` : 'Consultando versão…'}</small></div><button onClick={() => setRevision(n => n + 1)}><Icon kind="refresh"/> Atualizar dados</button></div><button className="settings-projects" onClick={() => navigate('explorer')}>Gerenciar projetos no Explorer <Icon kind="arrow"/></button>
      </section>}
      {message && <p className="settings-message" role="status">{message}</p>}
    </main>
  </div>;
}
