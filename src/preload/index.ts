import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/contracts';
const api: DesktopApi = {
  version: () => ipcRenderer.invoke('app:version'),
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  createSubject: input => ipcRenderer.invoke('subject:create', input),
  renameSubject: input => ipcRenderer.invoke('subject:rename', input),
  chooseVault: () => ipcRenderer.invoke('vault:choose'),
  listNotes: input => ipcRenderer.invoke('note:list', input),
  createNote: input => ipcRenderer.invoke('note:create', input),
  importNote: input => ipcRenderer.invoke('note:import', input),
  openNote: input => ipcRenderer.invoke('note:open', input),
  saveNote: input => ipcRenderer.invoke('note:save', input),
  recoverDraft: input => ipcRenderer.invoke('note:draft', input),
  discardDraft: input => ipcRenderer.invoke('note:discard', input),
  finishClose: () => ipcRenderer.invoke('app:finish-close'),
  openDesk: input => ipcRenderer.invoke('desk:open', input),
  saveDesk: input => ipcRenderer.invoke('desk:save', input),
  listMaterials: input => ipcRenderer.invoke('material:list', input),
  chooseMaterial: input => ipcRenderer.invoke('material:choose', input),
  readMaterial: input => ipcRenderer.invoke('material:read', input),
  getFocus: input => ipcRenderer.invoke('focus:get', input),
  startFocus: input => ipcRenderer.invoke('focus:start', input),
  actFocus: input => ipcRenderer.invoke('focus:action', input),
  onStorageError: callback => { const listener = (_event: Electron.IpcRendererEvent, message: string) => callback(message); ipcRenderer.on('app:storage-error', listener); return () => ipcRenderer.removeListener('app:storage-error', listener); },
  onBeforeClose: callback => { const listener = () => callback(); ipcRenderer.on('app:before-close', listener); return () => ipcRenderer.removeListener('app:before-close', listener); },
};
contextBridge.exposeInMainWorld('desktop', Object.freeze(api));
