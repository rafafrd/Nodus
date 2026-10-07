import { useRef, useState, type ReactNode, type PointerEvent, type KeyboardEvent } from 'react';
import { MAX_WORKSPACE_TABS, MODULE_DRAG_TYPE, tabName, moduleName, type WorkspaceArea, type WorkspaceTab, type WorkspaceTabs } from '../shared/workspace';
import { Icon } from './Icon';

type Props = {
  session: WorkspaceTabs; layout: WorkspaceTab; pending: boolean; cinema: boolean;
  sidebarCollapsed: boolean; sidebarPending: boolean; toggleSidebar(): void;
  dragged: WorkspaceArea | null; endDrag(): void; add(area: WorkspaceArea): void;
  selectTab(id: string): void; newTab(): void; closeTab(id: string): void;
  resize(axis: 'columnSplit' | 'rowSplit', value: number): void; saveSizes(): void;
  focus(area: string): void; children: ReactNode; tools: ReactNode;
};
export function WorkspaceFrame({ session, layout, pending, cinema, sidebarCollapsed, sidebarPending, toggleSidebar, dragged, endDrag, add, selectTab, newTab, closeTab, resize, saveSizes, focus, children, tools }: Props) {
  const body = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const drag = useRef<{ origin: number; value: number; axis: 'columnSplit' | 'rowSplit'; length: number } | null>(null);
  function start(event: PointerEvent<HTMLDivElement>, axis: 'columnSplit' | 'rowSplit') {
    if (event.button !== 0 || pending || cinema) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
    const horizontal = axis === 'columnSplit';
    drag.current = { origin: horizontal ? event.clientX : event.clientY, value: layout[axis], axis, length: horizontal ? body.current!.clientWidth : body.current!.clientHeight };
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current; if (!current) return;
    const position = current.axis === 'columnSplit' ? event.clientX : event.clientY;
    resize(current.axis, Math.min(80, Math.max(20, current.value + (position - current.origin) / current.length * 100)));
  }
  function end(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    saveSizes();
  }
  function key(event: KeyboardEvent<HTMLDivElement>, axis: 'columnSplit' | 'rowSplit') {
    const decrease = axis === 'columnSplit' ? 'ArrowLeft' : 'ArrowUp', increase = axis === 'columnSplit' ? 'ArrowRight' : 'ArrowDown';
    if (![decrease, increase, 'Home'].includes(event.key) || pending || cinema) return;
    event.preventDefault();
    resize(axis, event.key === 'Home' ? 50 : Math.min(80, Math.max(20, layout[axis] + (event.key === decrease ? -1 : 1) * (event.shiftKey ? 5 : 2))));
    saveSizes();
  }
  function focusTarget(target: EventTarget | null) {
    const area = (target as HTMLElement | null)?.closest<HTMLElement>('[data-area]')?.dataset.area;
    if (area) focus(area);
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || pending) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? session.tabs.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + session.tabs.length) % session.tabs.length;
    selectTab(session.tabs[next].id);
    document.getElementById(`workspace-tab-${session.tabs[next].id}`)?.focus();
  }
  const canDrop = !!dragged && (layout.panes.length < 4 || layout.panes.includes(dragged));
  const separator = (axis: 'columnSplit' | 'rowSplit') => <div
    className={`workspace-divider ${axis === 'columnSplit' ? 'divider-column' : 'divider-row'}`}
    style={axis === 'columnSplit' ? { left: `${layout.columnSplit}%` } : { top: `${layout.rowSplit}%`, left: layout.panes.length === 3 ? `${layout.columnSplit}%` : 0 }}
    role="separator" tabIndex={cinema || pending ? -1 : 0} aria-label={axis === 'columnSplit' ? 'Largura das colunas' : 'Altura das linhas'}
    aria-orientation={axis === 'columnSplit' ? 'vertical' : 'horizontal'} aria-valuemin={20} aria-valuemax={80} aria-valuenow={Math.round(layout[axis])}
    onPointerDown={event => start(event, axis)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={event => key(event, axis)}/>;
  return <div className="workspace-frame" data-resizing={resizing}>
    <header className="workspace-controls" inert={cinema}>
      <button className="workspace-sidebar-toggle" aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} aria-controls="nodus-sidebar" aria-expanded={!sidebarCollapsed} disabled={sidebarPending || pending} onClick={toggleSidebar}><Icon kind="sidebar"/></button>
      <div className="workspace-tabs" role="tablist" aria-label="Abas de trabalho">
        {session.tabs.map((tab, index) => <div key={tab.id} className={`workspace-tab ${tab.id === session.activeTabId ? 'selected' : ''}`}>
          <button role="tab" id={`workspace-tab-${tab.id}`} aria-controls="workspace-active-panel" aria-selected={tab.id === session.activeTabId}
            tabIndex={tab.id === session.activeTabId ? 0 : -1} disabled={pending} title={tabName(tab)} onClick={() => selectTab(tab.id)} onKeyDown={event => tabKey(event, index)}>
            <span className="tab-grid" aria-hidden="true">{tab.panes.length === 1 ? '□' : '⊞'}</span><span>{moduleName(tab.panes[0])}</span>{tab.panes.length > 1 && <small>+{tab.panes.length - 1}</small>}
          </button>
          <button className="workspace-tab-close" aria-label={`Fechar aba ${index + 1}`} disabled={pending || session.tabs.length === 1} title="Fechar aba · Ctrl+W" onClick={() => closeTab(tab.id)}>×</button>
        </div>)}
      </div>
      <button className="workspace-new-tab" aria-label="Nova aba" title="Nova aba · Ctrl+T" disabled={pending || session.tabs.length >= MAX_WORKSPACE_TABS} onClick={newTab}>+</button>
      <span className="workspace-tab-count" aria-live="polite">{layout.panes.length}/4 janelas</span>
    </header>
    <div className="workspace-body" ref={body} id="workspace-active-panel" role="tabpanel" aria-labelledby={`workspace-tab-${session.activeTabId}`} data-pane-count={layout.panes.length}
      onPointerDownCapture={event => focusTarget(event.target)} onFocusCapture={event => focusTarget(event.target)}
      onDragOver={event => { if (pending || cinema || !event.dataTransfer.types.includes(MODULE_DRAG_TYPE)) return; event.preventDefault(); event.dataTransfer.dropEffect = canDrop ? 'copy' : 'none'; }}
      onDrop={event => { if (!event.dataTransfer.types.includes(MODULE_DRAG_TYPE)) return; event.preventDefault(); const area = event.dataTransfer.getData(MODULE_DRAG_TYPE); if (!pending && !cinema && canDrop && area === dragged) add(dragged!); endDrag(); }}>
      {children}
      {layout.panes.length > 1 && separator('columnSplit')}{layout.panes.length > 2 && separator('rowSplit')}
      {dragged && !cinema && <div className={`workspace-drop-preview ${canDrop ? '' : 'full'}`} aria-live="polite">
        <div><span className="drop-grid" data-count={Math.min(4, layout.panes.length + (layout.panes.includes(dragged) ? 0 : 1))}>{Array.from({ length: Math.min(4, layout.panes.length + (layout.panes.includes(dragged) ? 0 : 1)) }, (_, index) => <i key={index}/>)}</span>
          <strong>{!canDrop ? 'Esta aba já tem quatro janelas' : layout.panes.includes(dragged) ? `Focar ${moduleName(dragged)}` : `Dividir com ${moduleName(dragged)}`}</strong><small>{canDrop ? 'Solte no espaço de trabalho' : 'Abra outra aba ou feche uma janela'}</small></div>
      </div>}
    </div>
    {tools}
  </div>;
}
