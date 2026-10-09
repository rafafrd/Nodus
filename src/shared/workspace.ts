import { z } from 'zod';
export const workspaceArea = z.enum(['study','pdf','video','home','review','graph','explorer','city','settings']);
export type WorkspaceArea = z.infer<typeof workspaceArea>;
export const workspaceLayout = z.strictObject({
  panes:z.array(workspaceArea).min(1).max(3),
  sizes:z.array(z.number().finite().min(20).max(100)).min(1).max(3),
}).refine(v=>new Set(v.panes).size===v.panes.length&&v.sizes.length===v.panes.length&&Math.abs(v.sizes.reduce((a,b)=>a+b,0)-100)<.05,'Confira os módulos e suas larguras');
export type WorkspaceLayout = z.infer<typeof workspaceLayout>;
export const defaultWorkspace:WorkspaceLayout={panes:['study'],sizes:[100]};
export const WORKSPACE_AREAS:{id:WorkspaceArea;name:string}[]=[
  {id:'study',name:'Caderno'},{id:'pdf',name:'PDFs'},{id:'video',name:'Aulas'},
  {id:'home',name:'Início'},{id:'review',name:'Revisão'},{id:'graph',name:'Conexões'},
  {id:'explorer',name:'Projetos'},{id:'city',name:'Cidade'},{id:'settings',name:'Ajustes'},
];

export const MODULE_DRAG_TYPE = 'application/x-nodus-module';
export const MAX_WORKSPACE_TABS = 32;
const split = z.number().finite().min(20).max(80);
export const workspaceTab = z.strictObject({
  id: z.uuid(), panes: z.array(workspaceArea).min(1).max(4),
  focused: workspaceArea, columnSplit: split, rowSplit: split,
}).refine(tab => new Set(tab.panes).size === tab.panes.length && tab.panes.includes(tab.focused), 'Confira as janelas e o foco da aba');
export type WorkspaceTab = z.infer<typeof workspaceTab>;
export const workspaceTabs = z.strictObject({
  activeTabId: z.uuid(), tabs: z.array(workspaceTab).min(1).max(MAX_WORKSPACE_TABS),
}).refine(value => new Set(value.tabs.map(tab => tab.id)).size === value.tabs.length && value.tabs.some(tab => tab.id === value.activeTabId), 'Confira as abas e a aba ativa');
export type WorkspaceTabs = z.infer<typeof workspaceTabs>;

export function workspaceFromLegacy(layout: WorkspaceLayout): WorkspaceTabs {
  const id = '00000000-0000-4000-8000-000000000001';
  const clamp = (n: number) => Math.min(80, Math.max(20, n));
  return { activeTabId: id, tabs: [{ id, panes: [...layout.panes], focused: layout.panes[0], columnSplit: layout.panes.length > 1 ? clamp(layout.sizes[0]) : 50, rowSplit: layout.panes.length === 3 ? clamp(layout.sizes[1] / (layout.sizes[1] + layout.sizes[2]) * 100) : 50 }] };
}
export const defaultWorkspaceTabs = workspaceFromLegacy(defaultWorkspace);
export function activeWorkspace(value: WorkspaceTabs) { return value.tabs.find(tab => tab.id === value.activeTabId)!; }
export function moduleName(area: string) { return WORKSPACE_AREAS.find(item => item.id === area)?.name ?? area; }
export function tabName(tab: WorkspaceTab) { return tab.panes.map(moduleName).join(' · '); }
export function updateWorkspace(value: WorkspaceTabs, tab: WorkspaceTab): WorkspaceTabs {
  return { ...value, tabs: value.tabs.map(item => item.id === tab.id ? tab : item) };
}
export type PaneRect = { left: number; top: number; width: number; height: number };
/** Pane order: full; left/right; left spanning + right top/bottom; row-major 2×2. */
export function workspaceRects(tab: Pick<WorkspaceTab, 'panes' | 'columnSplit' | 'rowSplit'>): PaneRect[] {
  const x = tab.columnSplit, y = tab.rowSplit;
  if (tab.panes.length === 1) return [{ left: 0, top: 0, width: 100, height: 100 }];
  if (tab.panes.length === 2) return [{ left: 0, top: 0, width: x, height: 100 }, { left: x, top: 0, width: 100 - x, height: 100 }];
  if (tab.panes.length === 3) return [{ left: 0, top: 0, width: x, height: 100 }, { left: x, top: 0, width: 100 - x, height: y }, { left: x, top: y, width: 100 - x, height: 100 - y }];
  return [{ left: 0, top: 0, width: x, height: y }, { left: x, top: 0, width: 100 - x, height: y }, { left: 0, top: y, width: x, height: 100 - y }, { left: x, top: y, width: 100 - x, height: 100 - y }];
}
