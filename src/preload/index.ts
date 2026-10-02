import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/contracts';
const api: DesktopApi = {
  version: () => ipcRenderer.invoke('app:version'),
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  createSubject: input => ipcRenderer.invoke('subject:create', input),
  renameSubject: input => ipcRenderer.invoke('subject:rename', input),
};
contextBridge.exposeInMainWorld('desktop', Object.freeze(api));
