import type { ReactNode } from 'react';
import { moduleName, type WorkspaceArea, type WorkspaceTab } from '../../shared/workspace';
import { Icon as Mark } from '../Icon';

/** One stage layer: titled frame around an area. AreaStage animates these layers; they stay mounted once visited. */
export function AreaPane({ area, layout, pending, navigate, closePane, children }: {
  area: WorkspaceArea; layout: WorkspaceTab; pending: boolean; navigate(area: WorkspaceArea): void; closePane(area: WorkspaceArea): void; children: ReactNode;
}) {
  return <div className={`area-layer ${layout.focused === area ? 'pane-focused' : ''}`} data-area={area} role="region" aria-label={`Janela ${moduleName(area)}`}>
    <header className="workspace-pane-bar"><span>{moduleName(area)}</span><div>{layout.panes.length > 1 && <><button aria-label={`Ampliar ${moduleName(area)}`} title="Ocupar esta aba" disabled={pending} onClick={() => navigate(area)}><Mark kind="expand"/></button><button aria-label={`Fechar janela ${moduleName(area)}`} disabled={pending} onClick={() => closePane(area)}>×</button></>}</div></header><div className="workspace-pane-content">{children}</div>
  </div>;
}
