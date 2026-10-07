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
  {id:'study',name:'Caderno'},{id:'pdf',name:'PDF'},{id:'video',name:'Vídeo'},
  {id:'home',name:'Hoje'},{id:'review',name:'Revisão'},{id:'graph',name:'Grafo'},
  {id:'explorer',name:'Explorer'},{id:'city',name:'Cidade'},{id:'settings',name:'Ajustes'},
];
