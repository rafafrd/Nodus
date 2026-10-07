import { BrowserWindow, session,net } from 'electron';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { AppError } from '../shared/contracts';
export async function extractPdfText(bytes:Uint8Array):Promise<{page:number;text:string}[]>{
  if(bytes.byteLength>20*1024*1024)throw new AppError('PDF_EXTRACTION_LIMIT','Processamento de texto aceita PDFs de até20MiB. Selecione uma apostila menor.');
  const isolated=session.fromPartition(`pdf-extract-${randomUUID()}`);
  isolated.setPermissionRequestHandler((_w,_p,callback)=>callback(false));isolated.setPermissionCheckHandler(()=>false);
  isolated.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!details.url.startsWith('study://app/')}));
  isolated.protocol.handle('study',request=>{const url=new URL(request.url),relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),root=path.join(__dirname,'renderer'),target=path.resolve(root,relative);if(url.host!=='app'||!target.startsWith(root+path.sep)||!/^pdf-extraction(?:\.html|\.js|-worker\.mjs)$|^pdf-assets\/(?:cmaps|standard_fonts)\//.test(relative))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(target).href);});
  const worker=new BrowserWindow({show:false,webPreferences:{session:isolated,sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true}});
  worker.webContents.setWindowOpenHandler(()=>({action:'deny'}));worker.webContents.on('will-navigate',event=>event.preventDefault());
  let timeout:ReturnType<typeof setTimeout>|undefined;
  try{await worker.loadURL('study://app/pdf-extraction.html');const extraction=worker.webContents.executeJavaScript(`window.extractPdf(${JSON.stringify(Array.from(bytes))})`);return await Promise.race([extraction,new Promise<never>((_r,reject)=>{timeout=setTimeout(()=>reject(new AppError('PDF_EXTRACTION_TIMEOUT','O processamento demorou demais. Retire este PDF ou escolha uma apostila menor.')),60000);})]);}
  catch(error){if(error instanceof AppError)throw error;throw new AppError('PDF_TEXT_UNAVAILABLE','Não foi possível processar este PDF. Ele pode estar protegido, digitalizado ou danificado. Processe o texto externamente ou retire da seleção.');}
  finally{if(timeout)clearTimeout(timeout);if(!worker.isDestroyed())worker.destroy();isolated.webRequest.onBeforeRequest(null);isolated.protocol.unhandle('study');await isolated.clearStorageData().catch(()=>{});}
}
